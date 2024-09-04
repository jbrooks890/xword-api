const Puzzle = require("../models/puzzle");
const User = require("../models/user");

const getAllPuzzles = async ({ query, ...req }, res) => {
  try {
    const puzzles = await Puzzle.find(query);
    return res.status(200).json({ puzzles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getCatalog = async ({ query = "featured=true&limit=25" }, res) => {
  try {
    const puzzles = await Puzzle.find(query).select([
      "_id",
      "author",
      "comments",
      "description",
      "likes",
      "name",
      "reviews",
      "answerKey",
      "size",
      "tags",
    ]);

    return res.status(200).json(puzzles);
  } catch (err) {
    console.log({ err });
    const response = res.status(500);
    const errMsg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : undefined;
    errMsg ? response.send(errMsg) : response.json(err);
    return response;
  }
};

const getPuzzle = async (req, res) => {
  const { id } = req.params;
  try {
    const puzzle = await Puzzle.findById(id);
    return puzzle
      ? res.status(200).json({ puzzle })
      : res.status(404).send("Puzzle not found");
  } catch (err) {
    const response = res.status(500);
    const errMsg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : undefined;
    if (errMsg) {
      response.send(errMsg);
    } else {
      response.json(err);
    }

    return response;
  }
};

const createPuzzle = async (req, res) => {
  console.log(req.body);
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Bad user" });
    const puzzle = await Puzzle.create({ ...req.body, author: user._id });
    return res.status(201).json({ puzzle });
  } catch (err) {
    return res.status(500).json({ message: "TEST", error: err.message });
  }
};

const updatePuzzle = (req, res) => {
  const { id } = req.params;
  try {
    Puzzle.findByIdAndUpdate(id, req.body, { new: true }, (err, puzzle) => {
      if (err) return res.status(500).send(err);
      if (!puzzle) return res.status(500).send("Puzzle not found");
      return res.status(200).json(puzzle);
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deletePuzzle = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Puzzle.findByIdAndDelete(id);
    if (deleted) return res.status(200).send(`Puzzle successfully deleted`);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCatalog,
  getAllPuzzles,
  getPuzzle,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
};
