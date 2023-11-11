const comments = require("./comments");
const puzzles = require("./puzzles");
const users = require("./users");
const drafts = require("./drafts");

module.exports = {
  ...comments,
  ...puzzles,
  ...users,
  ...drafts,
};
