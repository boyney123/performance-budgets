const lighthouseBudgets = require("./lib/");

const main = async () => {
  try {
    await lighthouseBudgets();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
