const { Router } = require("express");
const router = Router();
const draftRoutes = require("./drafts");
const {
  getAllUsers,
  getUserByUsername,
  updateUser,
} = require("../controllers/users");

router.get("/", getAllUsers);
router.route("/:username").get(getUserByUsername).put(updateUser);
router.use("/:username/drafts", draftRoutes);

module.exports = router;
