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
  getAllUsers,
  getUserByUsername,
  login,
  authenticate,
  refreshAuth,
  deAuth,
  verifyRoles,
  saveDraft,
} = require("../controllers");
const {
  user_roles: { Admin, Editor, User },
} = require("../config/user_roles");
// const { Admin, Editor, User } = user_roles;

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
router.post("/login", login);
router.post("/users", createUser);
router.get("/refresh", refreshAuth);
router.get("/logout", deAuth);
router.get("/users/:username", getUserByUsername);
router.post("/users/:username/save-draft", saveDraft);

// ------------ AUTH ------------
router.use(authenticate); // <=== GATEKEEPER
router.use(verifyRoles(Admin));
router.get("/users", getAllUsers);

module.exports = router;
