const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

const generateToken = user =>
  jwt.sign(user, ACCESS_TOKEN, { expiresIn: "15m" });

// <><><><><><><><><> CREATE NEW USER <><><><><><><><><>

const createUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

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

// <><><><><><><><><> VALIDATE USER (on login) <><><><><><><><><>

const validateUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  const user = await User.findOne({ username });
  if (!user) return res.status(400).send("User does not exist.");

  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = generateToken({ username });
      const refreshToken = jwt.sign({ username }, REFRESH_TOKEN, {
        expiresIn: "1d",
      });
      user.refreshToken = refreshToken;
      user.save();
      res.cookie("jwt", refreshToken, {
        httpOnly: true, // inaccessible with json
        // sameSite: "none",
        // secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(201).json({ accessToken });
    } else {
      req.status(401).json({ message: "Invalid user" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> DEAUTH REFRESH TOKEN (on logout) <><><><><><><><><>

const deAuth = async (req, res) => {
  const { cookies } = req;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("jwt", { httpOnly: true }); // requires same OPTIONS it was set wtih, except 'maxAge' and expires
    return res.sendStatus(204);
  }
  user.refreshToken = "";
  await user.save();
  res.clearCookie("jwt", { httpOnly: true }); //secure: truly - only serves on https
  res.sendStatus(204);
};

// <><><><><><><><><> AUTHENTICATE TOKEN (MIDDLE) <><><><><><><><><>
// middleware for protected routes

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);

  jwt.verify(token, ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// <><><><><><><><><> VERIFY TOKEN (MIDDLE) <><><><><><><><><>

const refreshAuth = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  console.log(cookies.jwt);

  // const refreshToken = req.body.token;
  const refreshToken = cookies.jwt;
  const user = User.findOne({ refreshToken });
  // TODO: if database doesn't include the refreshtoken, return 403
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, REFRESH_TOKEN, (err, decoded) => {
    if (err || user.username !== decoded.username) return res.sendStatus(403);
    const accessToken = generateToken({ username: decoded.username });
    res.json({ accessToken });
  });
};

// ----------------------------------------------------------------
// <><><><><><><><><><><><><><> EXPORT <><><><><><><><><><><><><><>
// ----------------------------------------------------------------

module.exports = {
  createUser,
  validateUser,
  authenticate,
  refreshAuth,
  deAuth,
};
