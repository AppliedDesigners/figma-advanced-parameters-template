// @ts-nocheck
import * as chai from "chai";
import { utilExample, usageBreakdown, formatTrailingZeros } from "@/utils";
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

  describe("usageBreakdown", () => {
    it("example test", () => {
      const result = usageBreakdown({
        usage: [
          {
            apiKeyId: "apiKey1",
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
            apiKeyId: "apiKey1",
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
            apiKeyId: "apiKey2",
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
            apiKeyId: "apiKey2",
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
        apiKeys: {
          apiKey1: {
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
          apiKey2: {
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
          apiKeys: ["apiKey1", "apiKey2"],
          models: ["text-davinci-003", "text-curie-001"],
          providers: ["openai"]
        }
      };

      // @ts-ignore
      assert.deepEqual(result, target);
    });
  });
});
