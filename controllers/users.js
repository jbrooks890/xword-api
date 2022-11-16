const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

const generateToken = user => {
  const { username, roles: $roles } = user;
  const roles = Object.values($roles);
  return jwt.sign({ credentials: { username, roles } }, ACCESS_TOKEN, {
    expiresIn: "15m", // TODO: expires ==> 15m
  });
};

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
    const user = await User.find({ username });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> VALIDATE USER (on login) <><><><><><><><><>

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  const user = await User.findOne({ username });
  if (!user) return res.status(400).send("User does not exist.");

  try {
    if (await bcrypt.compare(password, user.password)) {
      console.log("password successful");
      // const roles = Object.values(user.roles);
      const accessToken = generateToken(user);
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
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  // console.log(cookies.jwt);

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
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

// ----------------------------------------------------------------
// <><><><><><><><><><><><><><> EXPORT <><><><><><><><><><><><><><>
// ----------------------------------------------------------------

module.exports = {
  createUser,
  getAllUsers,
  getUserByUsername,
  login,
  authenticate,
  refreshAuth,
  deAuth,
  verifyRoles,
};
