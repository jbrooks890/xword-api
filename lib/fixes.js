const db = require("../db");
const User = require("../models/user");

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const fixUserRoles = async () => {
  const users = User;
};

const run = async () => {
  await fixUserRoles();
  db.close();
};

run();
