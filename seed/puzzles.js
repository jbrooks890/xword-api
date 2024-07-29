const db = require("../db");
const Puzzle = require("../models/puzzle");
const Comment = require("../models/comment");
const User = require("../models/user");
const { puzzles, comments } = require("../sources");

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const main = async () => {
  await Puzzle.deleteMany({});
  await Comment.deleteMany({});

  const topLvlComments = comments.filter(
    (comment) => comment.ownerType === "puzzle"
  );

  const nestedComments = comments.filter(
    (comment) => comment.ownerType !== "puzzle"
  );

  const master = await User.findOne({ username: "jbrooks" });

  const puzzleDB = await Puzzle.insertMany(
    puzzles.map((puzzle) => {
      return { ...puzzle, author: master._id, featured: true };
    })
  );

  const commentsDB = await Comment.insertMany(
    topLvlComments.map((comment) => {
      let { owner } = comment;
      owner = puzzleDB.find((entry) => entry.name === owner)._id;
      return { ...comment, owner };
    })
  );

  for (let puzzle of puzzleDB) {
    const commentIDs = commentsDB
      .filter((comment) => comment.owner.equals(puzzle._id))
      .map((comment) => comment._id);
    puzzle.comments.push(...commentIDs);
    await puzzle.save();
  }

  console.log("Created puzzles!!!!!");
  console.log("SEEDING NEW VERSION OF PUZZLES");
};

const fixHintToClue = async () => {
  try {
    const res = await Puzzle.updateMany(
      {},
      {
        $set: {
          answers: {
            $map: {
              input: "$answers",
              as: "answer",
              in: {
                $mergeObjects: ["$$answer", { TEST: 0 }],
              },
            },
          },
        },
      }
    );
    console.log({ res });
  } catch (err) {
    console.log(err);
  }
};

const restoreHints = async () => {
  try {
    const $puzzles = await Puzzle.find({});
    for (const $puzzle of $puzzles) {
      const { answers } = puzzles.find(({ name }) => name === $puzzle.name);
      console.log({ answers });
      if (answers?.length) {
        Object.assign($puzzle, {
          answers: answers.map(({ hint, ...answer }) => ({
            ...answer,
            clue: hint,
          })),
          // likes: [],
          // author: "6541438326af8baae27e909a", // PC
          // author: "63754e85c860e37a592256e6", // MAC
        });
        await $puzzle.save({ timestamps: false });
      }
    }

    console.log({ $puzzles });
  } catch (err) {
    console.log({ err });
  }
};

const run = async () => {
  await restoreHints();
  // await fixHintToClue();
  db.close();
};

run();
