module.exports = {
  "spec": ["test/**/*.test.ts"],
  // https://mochajs.org/#-require-module-r-module
  "require": ["ts-node/register", "tsconfig-paths/register"],
  // https://mochajs.org/#-recursive
  "recursive": true,
  // Note:
  // - https://mochajs.org/#-watch-w
  // - This will be specified from the command line with "mocha --watch"
  // - Commented out here for documentation purposes
  // "watch": true,
  // https://mochajs.org/#-watch-files-filedirectoryglob
  "watch-files": ["src/**/*.ts", "test/**/*.ts"]
};
