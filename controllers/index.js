const comments = require("./comments");
const puzzles = require("./puzzles");
const users = require("./users");

module.exports = {
  ...comments,
  ...puzzles,
  ...users,
};
