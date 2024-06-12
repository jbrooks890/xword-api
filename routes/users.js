const { Router } = require("express");
const router = Router();
const draftRoutes = require("./drafts");
const {
  getAllUsers,
  getUserByUsername,
  updateUser,
  getUserRecord,
  updateUserRecord,
} = require("../controllers/users");

router.get("/", getAllUsers);
router.route("/:username").get(getUserByUsername).put(updateUser);
router.route("/:username/record").get(getUserRecord).put(updateUserRecord);
router.use("/:username/drafts", draftRoutes);

module.exports = router;
