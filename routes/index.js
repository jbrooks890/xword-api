const { Router } = require("express");
const router = Router();
const {
  getAllPuzzles,
  getPuzzle,
  createPuzzle,
  createComment,
  getAllComments,
  getCommentById,
  getCommentsByPuzzleId,
  updateComment,
  deleteComment,
} = require("../controllers");

// ------------ ROOT ------------
router.get("/", (req, res) => res.send("This is the root."));
// ------------ PUZZLES ------------
router.get("/puzzles", getAllPuzzles);
router.get("/puzzles/:id", getPuzzle);
// ------------ COMMENTS ------------
router.get("/puzzle/comments/:id", getCommentsByPuzzleId);
router.post("/comments", createComment);
router.get("/comments", getAllComments);
router.get("/comments/:id", getCommentById);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

module.exports = router;
