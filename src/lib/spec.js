const lighthouseBudgets = require("./");
const chromeLauncher = require("chrome-launcher");
const lighthouse = require("lighthouse");
const config = require("../config/lighthouse.json");

jest.mock("chrome-launcher", () => {
  return {
    launch: jest.fn(() => Promise.resolve({ kill: () => Promise.resolve() }))
  };
});

jest.mock("lighthouse", () => {
  return jest.fn(() => Promise.resolve());
});

const buildBudgetData = (item = { label: "Third-Party", requestCount: 1 }) => ({
  lhr: {
    audits: {
      "performance-budget": {
        details: {
          items: [
            {
              label: "Script",
              requestCount: 2
            },
            item
          ]
        }
      }
    }
  }
});

let processExit, processArgv;

describe("performance-budgets", () => {
  beforeAll(() => {
    processArgv = process.argv;
  });
  beforeEach(() => {
    processExit = jest.spyOn(process, "exit").mockImplementation(() => {});
    console.log("here", processArgv);
    process.argv = processArgv;
  });

  it("lighthouse is launched with the given url, default chrome flags and default configuration file", async () => {
    lighthouse.mockImplementation(() => Promise.resolve(buildBudgetData()));
    process.argv = ["", "", "https://example.com"];
    ({ isCustom, ...defaultConfig } = config);

    await lighthouseBudgets();

    expect(lighthouse.mock.calls[0][0]).toEqual("https://example.com");
    expect(lighthouse.mock.calls[0][1]).toEqual({ chromeFlags: ["--disable-gpu", "--headless", "--no-zygote", "--no-sandbox", "--headless"], port: undefined, output: "json" });
    expect(lighthouse.mock.calls[0][2]).toEqual(defaultConfig);
  });

  it("the script fails when request budgets are broken", async () => {
    lighthouse.mockImplementation(() => Promise.resolve(buildBudgetData({ label: "Third-Party", requestCount: 3, countOverBudget: "2 requests" })));
    process.argv = ["", "", "https://example.com"];
    ({ isCustom, ...defaultConfig } = config);
    return expect(lighthouseBudgets()).rejects.toEqual("Budgets broken");
  });

  it("the script fails when size budgets are broken", async () => {
    lighthouse.mockImplementation(() => Promise.resolve(buildBudgetData({ label: "Third-Party", requestCount: 1, sizeOverBudget: 220 })));
    process.argv = ["", "", "https://example.com"];
    ({ isCustom, ...defaultConfig } = config);

    return expect(lighthouseBudgets()).rejects.toEqual("Budgets broken");
  });

  it("the script is successful when request or size budgets are not broken", async () => {
    lighthouse.mockImplementation(() => Promise.resolve(buildBudgetData()));
    process.argv = ["", "", "https://example.com"];
    ({ isCustom, ...defaultConfig } = config);

    await lighthouseBudgets();

    expect(lighthouse.mock.calls[0][0]).toEqual("https://example.com");
    expect(lighthouse.mock.calls[0][1]).toEqual({ chromeFlags: ["--disable-gpu", "--headless", "--no-zygote", "--no-sandbox", "--headless"], port: undefined, output: "json" });
    expect(lighthouse.mock.calls[0][2]).toEqual(defaultConfig);
  });

  it("when not url is given the process with exit", () => {
    process.argv = [];
    return expect(lighthouseBudgets()).rejects.toEqual("Please provide a valid url");
  });

  it("the whole process will exit if chrome launcher fails", () => {
    chromeLauncher.launch.mockImplementation(() => Promise.reject());
    return expect(lighthouseBudgets()).rejects.toEqual("Failed to get lighthouse data");
  });

  it("the whole process will exit if lighthouse fails", () => {
    lighthouse.mockImplementation(() => Promise.reject());
    return expect(lighthouseBudgets()).rejects.toEqual("Failed to get lighthouse data");
  });
});
