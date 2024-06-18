const User = require("../models/user");
const Puzzle = require("../models/puzzle");

const saveDraft = async (req, res) => {
  const {
    params: { username },
    body: draft,
  } = req;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Bad user" });
    if (user.drafts.length >= 3)
      return res
        .status(401)
        .json({ error: "Max number of puzzle drafts has been reached!" });

    const puzzleDraft = await Puzzle.findById(draft.puzzle._id);
    let puzzle;
    if (puzzleDraft) {
      puzzleDraft = draft.puzzle;
      await puzzleDraft.save();
      puzzle = puzzleDraft;
    } else {
      puzzle = await Puzzle.create({
        ...draft.puzzle,
        author: user._id,
        isDraft: true,
      });
    }
    if (!puzzle) return res.status(400).send("Puzzle draft has errors");
    const existing = user.drafts?.findIndex(
      (draft) => draft._id === puzzle._id
    );
    if (existing >= 0) {
      user.drafts[existing] = {
        ...draft,
        puzzle: puzzle._id,
      };
    } else {
      user.drafts.push({
        ...draft,
        puzzle: puzzle._id,
      });
    }
    await user.save();
    return res.status(201).json({ drafts: user.drafts });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

// <><><><><><><><><> GET DRAFT <><><><><><><><><>
const getUserDrafts = async ({ params: { username } }, res) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("User does not exist.");
    const { drafts } = user;
    return res.status(200).json(drafts);
  } catch (err) {
    console.warn(err);
    return res.sendStatus(500);
  }
};

// <><><><><><><><><> CREATE DRAFT <><><><><><><><><>
const createDraft = async (req, res) => {
  const {
    params: { username },
    body,
  } = req;
  // console.log({ body });
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Bad user" });
    if (user.drafts.length >= 3)
      return res
        .status(401)
        .send("Max number of puzzle drafts has been reached!");
    const { author, comments, likes, editorMode, ...puzzle } = body.puzzle;
    const prev = user.drafts.map(({ _id }) => _id);
    user.drafts.push({
      ...body,
      puzzle,
    });
    await user.save();
    const [newDraft] = prev.length
      ? user.drafts.filter(({ _id }) => !prev.includes(_id))
      : user.drafts;
    // const newDraft = user.drafts.find(({ _id }) => !prev.includes(_id));
    return res.status(201).json({ draft: newDraft, drafts: user.drafts });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

// <><><><><><><><><> DELETE DRAFT <><><><><><><><><>
const deleteDraft = async (req, res) => {
  const { username, draft_id } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Bad user" });

    const target = user.drafts.find((draft) => draft.id === draft_id);
    // const test = user.drafts.map(({ id }) => id);
    // console.log("CHEESE", { test });
    if (!target)
      return res
        .status(401)
        .json({ error: `Draft with id [ ${draft_id} ] not found` });

    user.drafts = user.drafts.filter((draft) => draft !== target);
    await user.save();
    return res.status(200).json({ drafts: user.drafts });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

// <><><><><><><><><> UPDATE DRAFT <><><><><><><><><>
const updateDraft = async (req, res) => {
  const {
    params: { username, draft_id },
    body: draft,
  } = req;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Bad user" });
    const targetIndex = user.drafts.findIndex(({ id }) => id === draft_id);
    console.log({ draft });
    if (targetIndex < 0)
      return res.status(404).json({ error: "Draft doesn't exist" });
    Object.assign(user.drafts[targetIndex], draft);
    await user.save();
    return res.status(200).json({ drafts: user.drafts });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

// <><><><><><><><><> PUBLISH DRAFT <><><><><><><><><>

const publishDraft = async () => {
  const {
    params: { username, draft_id },
    body: puzzle,
  } = req;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Bad user" });
    const targetIndex = user.drafts.findIndex((draft) => draft.id === draft_id);
    if (targetIndex < 0)
      return res.status(404).json({ error: "Draft doesn't exist" });
    const newPuzzle = await Puzzle.create({ ...puzzle, author: user._id });
    user.drafts[targetIndex] = null;
    await user.save();
    return res.status(201).json({ puzzle: newPuzzle, drafts: user.drafts });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

// ----------------------------------------------------------------
// <><><><><><><><><><><><><><> EXPORT <><><><><><><><><><><><><><>
// ----------------------------------------------------------------

module.exports = {
  saveDraft,
  getUserDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft,
};
