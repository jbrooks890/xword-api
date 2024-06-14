const User = require("../models/user");
const Puzzle = require("../models/puzzle");
const bcrypt = require("bcrypt");

// <><><><><><><><><>[ CREATE NEW USER ]<><><><><><><><><>

const createUser = async ({ body }, res) => {
  const { username, password, email } = body;

  if (!username || !password || !email)
    return res
      .status(400)
      .json({ message: "Username, password and email required." });

  const duplicate = await User.findOne({ username }).exec();
  if (duplicate) return res.sendStatus(409); // Conflict

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...body,
      password: hash,
    });
    return res
      .status(201)
      .json({ success: `New user ${user.username} created!` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// <><><><><><><><><> CREATE NEW ADMIN <><><><><><><><><>

const createAdmin = async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res
      .status(400)
      .json({ message: "Username, password and email required." });

  const duplicate = await User.findOne({ username }).exec();
  if (duplicate) return res.sendStatus(409); // Conflict

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...req.body,
      password: hash,
      roles: { User: 8737, Editor: 3348, Admin: 2366 },
    });
    return res
      .status(201)
      .json({ success: `New admin ${user.username} created!` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> GET ALL USERS <><><><><><><><><>

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><>[ GET USER BY USERNAME ]<><><><><><><><><>

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><>[ UPDATE USER ]<><><><><><><><><>

const updateUser = async ({ body, params }, res) => {
  const { username } = params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User does not exist.");

    Object.assign(user, body);
    await user.save();

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// <><><><><><><><><>[ GET USER RECORD ]<><><><><><><><><>
const getUserRecord = async ({ body, params }, res) => {
  const { username } = params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User does not exist.");

    // const { puzzleId } = body;
    const record = user.record.toJSON({ flattenMaps: true });
    // console.log(Object.fromEntries(...record));

    return res.status(Object.keys(record).length ? 200 : 204).json({ record });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// <><><><><><><><><>[ UPDATE USER RECORD ]<><><><><><><><><>

const updateUserRecord = async ({ body, params }, res) => {
  const { username } = params;
  // console.log({ body });
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User does not exist.");

    const { puzzle: puzzleId, ...game } = body;
    // console.log({ game });
    const puzzle = await Puzzle.findById(puzzleId);
    if (!puzzle) return res.status(404).send("Puzzle does not exist");

    if (!user.record || !(user.record instanceof Map)) user.record = new Map();
    // const input = new Map(Object.entries(game.input));
    // console.log({ input });

    user.record.set(puzzleId, game);
    // console.log({ record: user.record });
    await user.save();

    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// ----------------------------------------------------------------
// <><><><><><><><><><><><><><> EXPORT <><><><><><><><><><><><><><>
// ----------------------------------------------------------------

module.exports = {
  createUser,
  createAdmin,
  getAllUsers,
  getUserByUsername,
  updateUser,
  getUserRecord,
  updateUserRecord,
};
