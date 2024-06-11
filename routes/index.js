const { Router } = require("express");
const router = Router();
const {
  getCommentsByPuzzleId,
} = require("../controllers");
const userRoutes = require("./users")
const authRoutes = require("./auth")
const puzzleRoutes = require("./puzzles")
const commentRoutes = require("./comments")

// ------------ ROOT ------------
router.get("/", (req, res) => res.send("This is the root."));
// ------------ COMMENTS ------------
router.use("/",authRoutes)
router.use("/users", userRoutes)
router.use("/puzzles", puzzleRoutes)
router.use("/comments",commentRoutes)

router.get("/puzzle/comments/:id", getCommentsByPuzzleId);

module.exports = router;
