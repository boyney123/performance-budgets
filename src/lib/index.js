const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const log = console.log;

const getLightHouseConfig = () => {
  return fs.readJSONSync(path.join(__dirname, "../config/lighthouse.json"));
};

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
    opts.port = chrome.port;
    opts.output = "json";

    const { isCustom, ...lightHouseConfig } = getLightHouseConfig();

    if (!isCustom) {
      log(`
-------
Using example configuration for lighthouse. 
You can configure your own lighthouse rules & budgets, read the documentation for more information.
https://github.com/boyney123/lighthouse-budgets
-------
      `);
    }

    return lighthouse(url, opts, lightHouseConfig).then(results => {
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
      log(chalk.red("Please provide a url"));
      return Promise.reject("Please provide a valid url");
    }

    log(`Requesting lighthouse data for ${chalk.green(url)}`);

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
        log(chalk.red("----- Failed resource count budget audits ------"));
        failedRequestCountAudits.forEach(({ label, requestCount, size, sizeOverBudget, countOverBudget } = {}) => {
          const expectedCount = requestCount - countOverBudget.split(" requests")[0];
          log(`${chalk.green(label)}: Expected ${chalk.green(expectedCount)} total number of requests but got ${chalk.red(countOverBudget)}`);
        });
      }

      if (failedSizeAudits.length) {
        log(chalk.red("----- Failed resource size budget audits ------"));
        failedSizeAudits.forEach(({ label, requestCount, size, sizeOverBudget, countOverBudget } = {}) => {
          const expectedSize = Math.round((size - sizeOverBudget) / 1024);
          const actual = Math.round(size / 1024);
          const overBy = Math.round(sizeOverBudget / 1024);
          log(`${chalk.green(label)}: Expected ${chalk.green(expectedSize + "kb")} download size but got ${chalk.red(actual + "kb")}`);
        });
      }
      return Promise.reject("Budgets broken");
    }

    return Promise.resolve();
  } catch (error) {
    log(error);
    return Promise.reject("Failed to get lighthouse data");
  }
};

module.exports = main;
