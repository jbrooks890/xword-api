const { Router } = require("express");
const router = Router();
const {
  getAllPuzzles,
  getPuzzle,
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require("../controllers");

// ------------ ROOT ------------
router.get("/", (req, res) => res.send("This is the root."));
// ------------ PUZZLES ------------
router.get("/puzzles", getAllPuzzles);
router.get("/puzzles/:id", getPuzzle);
// ------------ COMMENTS ------------
router.post("/comments", createComment);
router.get("/comments", getAllComments);
router.get("/comments/:id", getCommentById);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

module.exports = router;
