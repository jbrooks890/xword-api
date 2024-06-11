const { Router } = require("express")
const router = Router()

const {
  createComment,
  getAllComments,
  getCommentById,
  // getCommentsByPuzzleId,
  updateComment,
  deleteComment,
} = require("../controllers/comments")

router.route("/").get(getAllComments).post(createComment)
router.route("/:id").get(getCommentById).put(updateComment).delete(deleteComment)

module.exports =router