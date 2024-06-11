const { Router } = require("express");
const router = Router();
const { createDraft, updateDraft, deleteDraft, publishDraft } = require("../controllers/drafts")

router.post("/", createDraft);
router.route("/:draft_id").post(publishDraft).put(updateDraft).delete(deleteDraft)

module.exports=router