const User = require("../models/user");
const Puzzle = require("../models/puzzle");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

// <><><><><><><><><> GENERATE TOKEN <><><><><><><><><>

const generateToken = user => {
  const userRoles = { User: 8737, Editor: 3348, Admin: 2366 };

  const { username, firstName, lastName, roles, record, drafts } = user;
  return jwt.sign(
    {
      credentials: {
        username,
        firstName,
        lastName,
        roles: roles ? Object.values(roles) : [userRoles.User],
        record,
        drafts,
      },
    },
    ACCESS_TOKEN,
    {
      expiresIn: "15m", // TODO: expires ==> 15m
    }
  );
};

// <><><><><><><><><> CREATE NEW USER <><><><><><><><><>

const createUser = async (req, res) => {
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

// <><><><><><><><><> GET USER BY USERNAME <><><><><><><><><>

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> LOGIN <><><><><><><><><>

const login = async (req, res) => {
  // res.set("Access-Control-Allow-Origin", "*"); //TODO: REMOVE!!!
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User does not exist." });

  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = generateToken(user);
      const refreshToken = jwt.sign({ username }, REFRESH_TOKEN, {
        expiresIn: "15d",
      });
      user.refreshToken = refreshToken;
      await user.save();
      res.cookie("jwt", refreshToken, {
        httpOnly: true, // inaccessible with json
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(201).json({ accessToken });
    } else {
      return res.status(401).json({ message: "Invalid user" });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> DEAUTH REFRESH TOKEN (on logout) <><><><><><><><><>

const deAuth = async (req, res) => {
  const { cookies } = req;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    // NOTE: requires same OPTIONS it was set wtih, except 'maxAge' and expires
    // TODO: delete access token on front end
    res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(204); // NO CONTENT
  }
  // TODO: delete access token on front end
  user.refreshToken = "";
  await user.save();
  res.clearCookie("jwt", { httpOnly: true }); //secure: truly - only serves on https
  res.sendStatus(204);
};

// <><><><><><><><><> AUTHENTICATE TOKEN (MIDDLE) <><><><><><><><><>
// middleware for protected routes

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization; // Bearer <TOKEN>
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); // UNAUTHORIZED

  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401); // UNAUTHORIZED

  jwt.verify(token, ACCESS_TOKEN, (err, decoded) => {
    if (err) return res.sendStatus(403); // FORBIDDEN
    req.username = decoded.credentials.username;
    req.roles = decoded.credentials.roles;
    next();
  });
};

// <><><><><><><><><> REFRESH AUTHORIZATION <><><><><><><><><>

const refreshAuth = async (req, res) => {
  // res.set("Access-Control-Allow-Origin", "*"); //TODO: REMOVE!!!
  const { cookies } = req;
  // console.log({ cookies });
  if (!cookies?.jwt) return res.sendStatus(401);
  // console.log(cookies.jwt);

  const refreshToken = cookies.jwt;

  const user = await User.findOne({ refreshToken });
  // console.log({ user });

  if (!user) return res.sendStatus(403); // FORBIDDEN
  // console.log("\n$$$ USER:", user, "\n");

  jwt.verify(refreshToken, REFRESH_TOKEN, (err, decoded) => {
    if (err || user.username !== decoded.username) return res.sendStatus(403);
    const accessToken = generateToken(user);
    res.json({ accessToken });
  });
};

// <><><><><><><><><> VERIFY ROLES (MIDDLE) <><><><><><><><><>

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.sendStatus(401); // UNAUTHORIZED
    const rolesArr = [...allowedRoles];

    const result = req.roles
      .map(role => rolesArr.includes(role))
      .find(val => val === true);

    if (!result) return res.sendStatus(401); // UNAUTHORIZED
    next();
  };
};

// <><><><><><><><><> SAVE DRAFT <><><><><><><><><>

// const saveDraft = async (req, res) => {
//   const {
//     params: { username },
//     body: { draft },
//   } = req;
//   try {
//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ error: "Bad user" });
//     if (user.drafts.length >= 3)
//       return res
//         .status(401)
//         .json({ error: "Max number of puzzle drafts has been reached!" });
//     const existing = user.drafts?.findIndex(prev => prev._id === draft._id);
//     if (existing >= 0) {
//       user.drafts[existing] = draft;
//     } else {
//       user.drafts.push(draft);
//     }
//     await user.save();
//     console.log({ draft: user.drafts[existing] });
//     return res.status(201).json({ drafts: user.drafts });
//   } catch (err) {
//     return res.status(501).json({ error: err.message });
//   }
// };
const saveDraft = async (req, res) => {
  const {
    params: { username },
    body: draft,
  } = req;

  console.log({ draft });
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
    console.log({ puzzle });
    const existing = user.drafts?.findIndex(draft => draft._id === puzzle._id);
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

// <><><><><><><><><> CREATE DRAFT <><><><><><><><><>
const createDraft = async (req, res) => {
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
    // const puzzle = await Puzzle.create({
    //   ...draft.puzzle,
    //   author: user._id,
    //   isDraft: true,
    // });
    // if (!puzzle) return res.status(401).send("Puzzle has errors!");
    // console.log({ puzzle: draft.puzzle });
    const { author, comments, likes, ...puzzle } = draft.puzzle;
    const prev = user.drafts;
    console.log({ puzzle });
    user.drafts[firstEmpty] = { ...draft, puzzle };
    await user.save();
    // const [newDraft] = prev.length
    //   ? user.drafts.filter(draft => !prev.includes(draft))
    //   : user.drafts;
    const newDraft = user.drafts.find(draft => !prev.includes(draft));
    console.log({ newDraft });
    return res.status(201).json({ draft: user.drafts[firstEmpty] });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

// <><><><><><><><><> PUBLISH DRAFT <><><><><><><><><>

const publishDraft = () => {
  const {
    params: { username },
    body: draft,
  } = req;
};

// ----------------------------------------------------------------
// <><><><><><><><><><><><><><> EXPORT <><><><><><><><><><><><><><>
// ----------------------------------------------------------------

module.exports = {
  createUser,
  createAdmin,
  getAllUsers,
  getUserByUsername,
  login,
  authenticate,
  refreshAuth,
  deAuth,
  verifyRoles,
  saveDraft,
  createDraft,
};
