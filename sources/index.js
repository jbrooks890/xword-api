const comments = require("./test-comments");
const puzzles = require("fs")
  .readdirSync("./sources/puzzles")
  .map(file => require("./puzzles/" + file));

module.exports = { puzzles, comments };
