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

const restoreHints = async (email = "jbrooks890@gmail.com") => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error(`Could not find user with email: "${email}"`);
    const $puzzles = await Puzzle.find({});
    for (const $puzzle of $puzzles) {
      const { answers } = puzzles.find(({ name }) => name === $puzzle.name);
      console.log({ answers });
      if (answers?.length) {
        Object.assign($puzzle, {
          answers: answers.map(({ hint, ...answer }) => ({
            ...answer,
            clue: hint,
            author: user._id,
          })),
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
  const [operation, ...args] = process.argv.slice(2),
    [arg1] = args;
  const operations = "options/restoreHints/fixHintToClue".split("/");
  const validOperationsMsg =
    "\nValid operations:\n" +
    operations.map((operation) => `- "${operation}"`).join("\n");

  switch (operation) {
    case "options":
      console.log(validOperationsMsg);
      break;
    case "restoreHints":
      await restoreHints(arg1);
      break;
    case "fixHintToClue":
      await fixHintToClue();
      break;
    default:
      console.warn(
        `'${operation}' does not exist. Enter a valid operation.` +
          validOperationsMsg +
          "\n"
      );
  }
  db.close();
};

run();
