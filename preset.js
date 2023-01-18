// /my-addon/src/preset.js

function managerEntries(entry = []) {
  return [...entry, require.resolve("./dist/register")]; //👈 Addon implementation
}

module.exports = { managerEntries };
