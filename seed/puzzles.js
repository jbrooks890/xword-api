const db = require("../db");
const Puzzle = require("../models/puzzle");
const Comment = require("../models/comment");
const { puzzles, comments } = require("../sources");

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const main = async () => {
  await Puzzle.deleteMany({});
  await Comment.deleteMany({});

  const topLvlComments = comments.filter(
    comment => comment.ownerType === "puzzle"
  );

  const nestedComments = comments.filter(
    comment => comment.ownerType !== "puzzle"
  );

  const puzzleDB = await Puzzle.insertMany(
    puzzles.map(puzzle => {
      return { ...puzzle, likes: 0, comments: [], author: "63754e85c860e37a592256e6" };
    })
  );

  const commentsDB = await Comment.insertMany(
    topLvlComments.map(comment => {
      let { owner } = comment;
      owner = puzzleDB.find(entry => entry.name === owner)._id;
      return { ...comment, owner };
    })
  );

  for (let puzzle of puzzleDB) {
    const commentIDs = commentsDB
      .filter(comment => comment.owner.equals(puzzle._id))
      .map(comment => comment._id);
    puzzle.comments.push(...commentIDs);
    await puzzle.save();
  }

  console.log("Created puzzles!!!!!");
  console.log("SEEDING NEW VERSION OF PUZZLES")
};

const run = async () => {
  await main();
  db.close();
};

run();
