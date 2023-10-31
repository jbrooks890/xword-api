const db = require("../db");
const User = require("../models/user");
const { model } = require("mongoose");

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const fixUserRoles = async () => {
  const User = model("user");
  const users = await User.find({});
  const userRoles = { User: 8737, Editor: 3348, Admin: 2366 };

  // console.log({ users });
  const updates = users.map(user => {
    const { roles } = user;
    const isArray = Array.isArray(roles);
    let update =
      isArray && roles.every(role => Object.values(userRoles).includes(role))
        ? roles
        : [userRoles.User];
    if (typeof roles === "object" && !isArray) {
      if (
        Object.values(roles).every(role =>
          Object.values(userRoles).includes(role)
        )
      )
        update = Object.values(roles);
    }
    return {
      ...user,
      roles: update,
    };
  });

  console.log({ updates });

  // await User.deleteMany({});
  // await User.insertMany(updates);

  // console.log({ updates });
};

const run = async () => {
  const [operation, collection, ...args] = process.argv.slice(2);
  // if (!collection) throw new Error("NO DIRECTORY PROVIDED");

  console.log({ operation, collection });

  switch (operation) {
    case "fix-roles":
      // console.log("running fix roles");
      await fixUserRoles();

      // await addBook(collection);
      break;
    // case "add":
    //   // FOR ENTRIES THAT *LIKELY* EXIST
    //   await addDefinition(collection);
    //   break;
    // case "read":
    //   console.log("We're gonna' get a definition!");
    //   break;
    // case "update":
    //   console.log("We're gonna' update a definition!");
    //   break;
    // case "delete":
    //   console.log("Time to delete some shit!");
    //   break;
    default:
      throw new Error(
        `'${operation}' does not exist. Enter a valid operation.\nValid operations: "fix-roles"\n${"-".repeat(
          20
        )}`
      );
  }
  // console.log(args.length ? { args } : "no args");
  // await main();
  db.close();
};

run();

run();
