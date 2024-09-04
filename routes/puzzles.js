const { Router } = require("express");
const router = Router();
const {
  getCatalog,
  getAllPuzzles,
  getPuzzle,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
} = require("../controllers/puzzles");

router.get("/catalog", getCatalog);
router.route("/").post(createPuzzle).get(getAllPuzzles);

router.route("/:id").get(getPuzzle).put(updatePuzzle).delete(deletePuzzle);

module.exports = router;
