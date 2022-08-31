const { Router } = require("express");
const router = Router();
const {
  getAllPuzzles,
  //   createItem,
  //   getAllItems,
  //   getItemById,
  //   updateItem,
  //   deleteItem,
} = require("../controllers");

router.get("/", (req, res) => res.send("This is the root."));
// router.post("/puzzles", createItem);
router.get("/puzzles", getAllPuzzles);
// router.get("/puzzles/:id", getItemById);
// router.put("/puzzles/:id", updateItem);
// router.delete("/puzzles/:id", deleteItem);

module.exports = router;
