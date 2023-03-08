// @ts-nocheck
import * as chai from "chai";
import { utilExample, usageBreakdown, formatTrailingZeros } from "@/utils";
import {
  utilExample,
  usageBreakdown,
  altUsageBreakdown,
  formatTrailingZeros
} from "@/utils";
const { assert } = chai;

describe("src/utils", () => {
  describe.skip("utilExample", () => {
    it("example test", () => {
      const result = utilExample();
      assert.isTrue(result);
    });
  });

  describe("formatTrailingZeros", () => {
    it("$5.00", () => {
      const result = formatTrailingZeros("$5.00");
      assert.equal("$5.00", result);
    });
    it("$5", () => {
      const result = formatTrailingZeros("$5");
      assert.equal("$5.00", result);
    });
    it("$5.001", () => {
      const result = formatTrailingZeros("$5.001");
      assert.equal("$5.001", result);
    });
    it("$5.0010", () => {
      const result = formatTrailingZeros("$5.0010");
      assert.equal("$5.001", result);
    });
    it("$5.0100", () => {
      const result = formatTrailingZeros("$5.0100");
      assert.equal("$5.01", result);
    });
  });

  describe.only("altUsageBreakdown", () => {
    it("example test", () => {
      const result = altUsageBreakdown({
        usage: [
          {
            apiTokenId: "apiToken1",
            unitType: "token",
            provider: "openai",
            model: "text-davinci-003",
            resolution: null,
            callTotal: 2,
            tokenTotal: 100000,
            imageTotal: 0
          },
          {
            apiTokenId: "apiToken1",
            unitType: "token",
            provider: "openai",
            model: "text-curie-001",
            resolution: null,
            callTotal: 4,
            tokenTotal: 200000,
            imageTotal: 0
          },
          {
            apiTokenId: "apiToken2",
            unitType: "token",
            provider: "openai",
            model: "text-davinci-003",
            resolution: null,
            callTotal: 3,
            tokenTotal: 150000,
            imageTotal: 0
          },
          {
            apiTokenId: "apiToken2",
            unitType: "token",
            provider: "openai",
            model: "text-curie-001",
            resolution: null,
            callTotal: 1,
            tokenTotal: 50000,
            imageTotal: 0
          },
          {
            apiTokenId: "apiToken1",
            unitType: "image",
            provider: "openai",
            model: "dalle",
            resolution: "1024x1024",
            callTotal: 2,
            tokenTotal: 0,
            imageTotal: 3
          },
          {
            apiTokenId: "apiToken2",
            unitType: "image",
            provider: "openai",
            model: "dalle",
            resolution: "256x256",
            callTotal: 1,
            tokenTotal: 0,
            imageTotal: 1
          }
        ]
      });

      const target = {
        summary: {
          calls: 13,
          tokens: 500000,
          images: 4,
          amount: 557.6,
          formattedAmount: "$5.576"
        },
        apiTokens: {
          apiToken1: {
            summary: {
              calls: 8,
              tokens: 300000,
              images: 3,
              amount: 246,
              formattedAmount: "$2.46"
            },
            models: {
              "text-davinci-003": {
                calls: 2,
                tokens: 100000,
                images: 0,
                amount: 200,
                formattedAmount: "$2.00"
              },
              "text-curie-001": {
                calls: 4,
                tokens: 200000,
                images: 0,
                amount: 40,
                formattedAmount: "$0.40"
              },
              "dalle": {
                calls: 2,
                tokens: 0,
                images: 3,
                amount: 6,
                formattedAmount: "$0.06"
              }
            }
          },
          apiToken2: {
            summary: {
              calls: 5,
              tokens: 200000,
              images: 1,
              amount: 311.6,
              formattedAmount: "$3.116"
            },
            models: {
              "text-davinci-003": {
                calls: 3,
                tokens: 150000,
                images: 0,
                amount: 300,
                formattedAmount: "$3.00"
              },
              "text-curie-001": {
                calls: 1,
                tokens: 50000,
                images: 0,
                amount: 10,
                formattedAmount: "$0.10"
              },
              "dalle": {
                calls: 1,
                tokens: 0,
                images: 1,
                amount: 1.6,
                formattedAmount: "$0.016"
              }
            }
          }
        },
        models: {
          "text-davinci-003": {
            calls: 5,
            tokens: 250000,
            images: 0,
            amount: 500,
            formattedAmount: "$5.00"
          },
          "text-curie-001": {
            calls: 5,
            tokens: 250000,
            images: 0,
            amount: 50,
            formattedAmount: "$0.50"
          },
          "dalle": {
            calls: 3,
            tokens: 0,
            images: 4,
            amount: 7.6,
            formattedAmount: "$0.076"
          }
        },
        options: {
          apiTokens: ["apiToken1", "apiToken2"],
          models: ["text-davinci-003", "text-curie-001", "dalle"],
          providers: ["openai"]
        }
      };

      // @ts-ignore
      assert.deepEqual(result, target);
    });
  });

  describe("usageBreakdown", () => {
    it("example test", () => {
      const result = usageBreakdown({
        usage: [
          {
            apiTokenId: "apiToken1",
            model: "text-davinci-003",
            provider: "openai",
            countTotal: 2,
            countDailyAvg: 0,
            countMonthlyAvg: 0,
            tokenTotal: 100000,
            tokenDailyAvg: 0,
            tokenMonthlyAvg: 0
          },
          {
            apiTokenId: "apiToken1",
            model: "text-curie-001",
            provider: "openai",
            countTotal: 4,
            countDailyAvg: 0,
            countMonthlyAvg: 0,
            tokenTotal: 200000,
            tokenDailyAvg: 0,
            tokenMonthlyAvg: 0
          },
          {
            apiTokenId: "apiToken2",
            model: "text-davinci-003",
            provider: "openai",
            countTotal: 3,
            countDailyAvg: 0,
            countMonthlyAvg: 0,
            tokenTotal: 150000,
            tokenDailyAvg: 0,
            tokenMonthlyAvg: 0
          },
          {
            apiTokenId: "apiToken2",
            model: "text-curie-001",
            provider: "openai",
            countTotal: 1,
            countDailyAvg: 0,
            countMonthlyAvg: 0,
            tokenTotal: 50000,
            tokenDailyAvg: 0,
            tokenMonthlyAvg: 0
          }
        ]
      });

      const target = {
        summary: {
          calls: 10,
          tokens: 500000,
          amount: 550,
          formattedAmount: "$5.50"
        },
        apiTokens: {
          apiToken1: {
            summary: {
              calls: 6,
              tokens: 300000,
              amount: 240,
              formattedAmount: "$2.40"
            },
            models: {
              "text-davinci-003": {
                calls: 2,
                tokens: 100000,
                amount: 200,
                formattedAmount: "$2.00"
              },
              "text-curie-001": {
                calls: 4,
                tokens: 200000,
                amount: 40,
                formattedAmount: "$0.40"
              }
            }
          },
          apiToken2: {
            summary: {
              calls: 4,
              tokens: 200000,
              amount: 310,
              formattedAmount: "$3.10"
            },
            models: {
              "text-davinci-003": {
                calls: 3,
                tokens: 150000,
                amount: 300,
                formattedAmount: "$3.00"
              },
              "text-curie-001": {
                calls: 1,
                tokens: 50000,
                amount: 10,
                formattedAmount: "$0.10"
              }
            }
          }
        },
        models: {
          "text-davinci-003": {
            calls: 5,
            tokens: 250000,
            amount: 500,
            formattedAmount: "$5.00"
          },
          "text-curie-001": {
            calls: 5,
            tokens: 250000,
            amount: 50,
            formattedAmount: "$0.50"
          }
        },
        options: {
          apiTokens: ["apiToken1", "apiToken2"],
          models: ["text-davinci-003", "text-curie-001"],
          providers: ["openai"]
        }
      };

      // @ts-ignore
      assert.deepEqual(result, target);
    });
  });
});
