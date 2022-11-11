const { Router } = require("express");
const router = Router();
const {
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
  createUser,
  validateUser,
} = require("../controllers");
const User = require("../models/user"); //TODO

// ------------ ROOT ------------
router.get("/", (req, res) => res.send("This is the root."));
// ------------ PUZZLES ------------
router.post("/puzzles", createPuzzle);
router.get("/puzzles", getAllPuzzles);
router.get("/puzzles/:id", getPuzzle);
router.put("/puzzles/:id", updatePuzzle);
router.delete("/puzzles/:id", deletePuzzle);
// ------------ COMMENTS ------------
router.get("/puzzle/comments/:id", getCommentsByPuzzleId);
router.post("/comments", createComment);
router.get("/comments", getAllComments);
router.get("/comments/:id", getCommentById);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);
// ------------ USER ------------
router.post("/users", createUser);
router.post("/login", validateUser);
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/users/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.find({ username });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
