const test_comments = [
  {
    user: {
      name: "Julian",
      ip_addr: "000.0.000.0",
      type: "guest",
    },
    content: "I created this puzzle out of my obsession with space. :-0",
    ownerType: "puzzle",
    owner: "Space",
  },
  {
    user: {
      name: "Julian",
      ip_addr: "000.0.000.0",
      type: "guest",
    },
    content:
      "I created this puzzle because my girls and I enjoy playing Minecraft together.",
    ownerType: "puzzle",
    owner: "Minecraft",
  },
  {
    user: {
      name: "Julian",
      ip_addr: "000.0.000.0",
      type: "guest",
    },
    content:
      "I created this puzzle because I thought my mom would enjoy it. She likes Harry Potter.",
    ownerType: "puzzle",
    owner: "Harry Potter",
  },
  {
    user: {
      name: "Julian's Mom",
      ip_addr: "111.1.111.1",
      type: "guest",
    },
    content: "This puzzle was so much fun!",
    ownerType: "comment",
    owner: "Harry Potter", // how to seed dummy comments?
  },
];

module.exports = test_comments;
