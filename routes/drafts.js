const { Router } = require("express");
const router = Router({ mergeParams: true });
const {
  getUserDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft,
} = require("../controllers/drafts");

router.route("/").get(getUserDrafts).post(createDraft);
router
  .route("/:draft_id")
  .post(publishDraft)
  .put(updateDraft)
  .delete(deleteDraft);

module.exports = router;
