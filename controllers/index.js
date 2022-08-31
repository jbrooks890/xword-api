const Puzzle = require("../models/puzzle");

const getAllPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find({});
    return res.status(200).json({ puzzles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPuzzles,
};
