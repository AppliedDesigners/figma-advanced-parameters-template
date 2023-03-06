// @ts-nocheck
import * as chai from "chai";
import { utilExample, usageBreakdown } from "@/utils";
const { assert } = chai;

describe("src/utils", () => {
  describe("utilExample", () => {
    it("example test", () => {
      const result = utilExample();
      assert.isTrue(result);
    });
  });

  describe.only("usageBreakdown", () => {
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
          count: 10,
          tokens: 500000,
          amount: 550,
          formattedAmount: "$5.50"
        },
        models: {
          "text-curie-001": {
            count: 5,
            tokens: 250000,
            amount: 50,
            formattedAmount: "$0.50"
          },
          "text-davinci-003": {
            count: 5,
            tokens: 250000,
            amount: 500,
            formattedAmount: "$5.00"
          }
        },
        options: {
          ids: ["apiKey1", "apiKey2"],
          models: ["text-davinci-003", "text-curie-001"],
          providers: ["openai"]
        },
        apiKey1: {
          "summary": {
            count: 6,
            tokens: 300000,
            amount: 240,
            formattedAmount: "$2.40"
          },
          "text-davinci-003": {
            count: 2,
            tokens: 100000,
            amount: 200,
            formattedAmount: "$2.00"
          },
          "text-curie-001": {
            count: 4,
            tokens: 200000,
            amount: 40,
            formattedAmount: "$0.40"
          }
        },
        apiKey2: {
          "summary": {
            count: 4,
            tokens: 200000,
            amount: 310,
            formattedAmount: "$3.10"
          },
          "text-davinci-003": {
            count: 3,
            tokens: 150000,
            amount: 300,
            formattedAmount: "$3.00"
          },
          "text-curie-001": {
            count: 1,
            tokens: 50000,
            amount: 10,
            formattedAmount: "$0.10"
          }
        }
      };

      // @ts-ignore
      assert.deepEqual(result, target);
    });
  });
});
