const Comment = require("../models/comment");
const Puzzle = require("../models/puzzle");

const getAllPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find({});
    return res.status(200).json({ puzzles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getPuzzle = async (req, res) => {
  const { id } = req.params;
  try {
    const puzzle = await Puzzle.findById(id).populate("comments");
    return puzzle
      ? res.status(200).json({ puzzle })
      : res.status(404).send("Puzzle not found");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createPuzzle = async (req, res) => {
  try {
    const puzzle = await new Puzzle({ ...req.body, likes: 0, comments: [] });
    await puzzle.save();
    return res.status(201).json({ puzzle });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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

const createComment = async (req, res) => {
  const { owner: owner_id } = req.body;
  try {
    const comment = await new Comment(req.body);
    await comment.save();
    const owner = await Puzzle.findById(owner_id);
    owner.comments.push(comment._id);
    await owner.save();
    return res.status(201).json({ comment });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({}); // TODO
    return comments.length
      ? res.status(200).json({ comments })
      : res.status(404).send("Search has no results");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getCommentById = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findById(id); // TODO
    return comment
      ? res.status(200).json({ comment })
      : res.status(404).send("Search has no results");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getCommentsByPuzzleId = async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await Comment.find({ owner: id }); // TODO
    return comments
      ? res.status(200).json({ comments })
      : res.status(404).send("Search has no results");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateComment = (req, res) => {
  const { id } = req.params;
  try {
    Comment.findByIdAndUpdate(id, req.body, { new: true }, (err, comment) => {
      if (err) return res.status(500).send(err);
      if (!comment) return res.status(500).send("Comment not found");

      return res.status(200).json(comment);
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Comment.findByIdAndDelete(id);
    if (deleted) return res.status(200).send(`Comment successfully deleted`);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPuzzles,
  getPuzzle,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
  createComment,
  getAllComments,
  getCommentById,
  getCommentsByPuzzleId,
  updateComment,
  deleteComment,
};
