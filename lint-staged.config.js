module.exports = {
    // Lint then format TypeScript and JavaScript files
    "(packages)/**/*.(ts|tsx|js)": (filenames) => [`yarn lint`, `yarn format`],
};
