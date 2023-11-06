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

const renameField = async (collection, prevFieldName, newFieldName) => {
  const Collection = model(collection);
  if (!Collection)
    throw new Error(`'${collection}' collection does not exist.`);
  // const collections = await Collection.find({})
  await Collection.updateMany(
    {},
    { $rename: { [prevFieldName]: newFieldName } }
  );
};

const addField = async (collection, fieldType, fieldName, fieldValue) => {
  const Collection = model(collection);
  if (!Collection)
    throw new Error(`'${collection}' collection does not exist.`);

  let value;
  const fieldTypes = [
    "string",
    "number",
    "boolean",
    "float",
    "array",
    "object",
  ];

  switch (fieldType) {
    case "string":
      value = String(fieldValue);
      break;
    case "number":
      value = parseInt(fieldValue);
      break;
    case "float":
      value = parseFloat(fieldValue);
      break;
    case "boolean":
      value = eval(fieldValue);
      break;
    case "array":
      value = Array.from(JSON.parse(fieldValue));
      break;
    case "object":
      value = JSON.parse(fieldValue);
      break;
    default:
      throw new Error(
        `'${fieldType}' is an invalid field type. Choose one of the following:\n${fieldTypes
          .map(option => `- ${option}`)
          .join("\n")}`
      );
  }

  await Collection.updateMany(
    { [fieldName]: { $exists: false } },
    { [fieldName]: value }
  );
};

const run = async () => {
  const [operation, collection, ...args] = process.argv.slice(2);
  // if (!collection) throw new Error("NO DIRECTORY PROVIDED");
  console.log({ operation, collection });

  switch (operation) {
    case "fix-roles":
      await fixUserRoles();
      break;
    case "rename-field":
      await renameField(collection, args[0], args[1]);
      break;
    case "add-field":
      await addField(collection, args[0], args[1], args[3]);
      break;
    default:
      throw new Error(
        `\n${"-".repeat(
          20
        )}\n'${operation}' is not a valid operation.\nValid operations:\n- "fix-roles"\n- "rename-field"\n- "add-field"\n${"-".repeat(
          20
        )}`
      );
  }
  db.close();
};

run();
