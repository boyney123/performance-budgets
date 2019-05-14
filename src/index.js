const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const log = console.log;

const getBudgets = () => {
  // if running as Github action...
  if (process.env.GITHUB_WORKSPACE) {
    return fs.readJSONSync(process.env.GITHUB_WORKSPACE, "./github/lighthouse-budgets.json");
  } else {
    return fs.readJSONSync(path.join(__dirname, "./config/budgets.json"));
  }
};

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
    opts.port = chrome.port;
    opts.output = "json";

    const budgets = getBudgets();

    const test = {
      extends: "lighthouse:full",
      settings: {
        budgets
      }
    };

    return lighthouse(url, opts, test).then(results => {
      return chrome.kill().then(() => results.lhr);
    });
  });
}

const opts = {
  chromeFlags: ["--disable-gpu", "--headless", "--no-zygote", "--no-sandbox", "--headless"]
};

const main = async () => {
  try {
    const url = process.argv[2];

    if (!url) {
      console.log(chalk.red("Please provide a url"));
      return;
    }

    console.log(`Requesting lighthouse data for ${chalk.green(url)}`);

    const data = await launchChromeAndRunLighthouse(url, opts);
    const budgets = data["audits"]["performance-budget"];
    const { details: { items = [] } = {} } = budgets;

    const successfulAudits = items.filter(({ sizeOverBudget, countOverBudget }) => {
      return !sizeOverBudget && !countOverBudget;
    });

    const failedAudits = items.filter(({ sizeOverBudget, countOverBudget }) => {
      return sizeOverBudget || countOverBudget;
    });

    const isValid = successfulAudits.length === items.length;

    if (!isValid) {
      const failedRequestCountAudits = failedAudits.filter(audit => audit.countOverBudget !== undefined);
      const failedSizeAudits = failedAudits.filter(audit => audit.sizeOverBudget !== undefined);

      if (failedRequestCountAudits.length) {
        console.log(chalk.red("----- Failed resource count budget audits ------"));
        failedRequestCountAudits.forEach(({ label, requestCount, size, sizeOverBudget, countOverBudget } = {}) => {
          const expectedCount = requestCount - countOverBudget.split(" requests")[0];
          log(`${chalk.green(label)}: Expected ${chalk.green(expectedCount)} total number of requests but got ${chalk.red(countOverBudget)}`);
        });
      }

      if (failedSizeAudits.length) {
        console.log(chalk.red("----- Failed resource size budget audits ------"));
        failedSizeAudits.forEach(({ label, requestCount, size, sizeOverBudget, countOverBudget } = {}) => {
          const expectedSize = Math.round((size - sizeOverBudget) / 1024);
          const actual = Math.round(size / 1024);
          const overBy = Math.round(sizeOverBudget / 1024);
          log(`${chalk.green(label)}: Expected ${chalk.green(expectedSize + "kb")} download size but got ${chalk.red(actual + "kb")}`);
        });
      }

      process.exit(1);
    }

    console.log("All budgets passed. ✔");
    process.exit(0);
  } catch (error) {
    console.log("Failed to get lighthouse data");
    console.log(error);
    process.exit(1);
  }
};

main();

// 'total': i18n.UIStrings.totalResourceType,
//       'document': i18n.UIStrings.documentResourceType,
//       'script': i18n.UIStrings.scriptResourceType,
//       'stylesheet': i18n.UIStrings.stylesheetResourceType,
//       'image': i18n.UIStrings.imageResourceType,
//       'media': i18n.UIStrings.mediaResourceType,
//       'font': i18n.UIStrings.fontResourceType,
//       'other': i18n.UIStrings.otherResourceType,
//       'third-party': i18n.UIStrings.thirdPartyResourceType,
