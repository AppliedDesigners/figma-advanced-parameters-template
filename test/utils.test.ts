import * as chai from "chai";
import { utilExample, breakdown } from "@/utils";
const { assert } = chai;

describe("src/utils", () => {
  describe("utilExample", () => {
    it("example test", () => {
      const result = utilExample();
      assert.isTrue(result);
    });
  });

  describe.only("breakdown", () => {
    it("example test", () => {
      const result = breakdown({
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

      // console.log(`---- result`, JSON.stringify(result, null, 2));

      const target = {
        all: {
          countTotal: 6 + 4,
          tokenTotal: 300000 + 200000,
          amountTotal: 240 + 310
        },
        apiKey1: {
          "all": {
            countTotal: 6,
            tokenTotal: 300000,
            amountTotal: 240
          },
          "text-davinci-003": {
            countTotal: 2,
            tokenTotal: 100000,
            amountTotal: 200
          },
          "text-curie-001": {
            countTotal: 4,
            tokenTotal: 200000,
            amountTotal: 40
          }
        },
        apiKey2: {
          "all": {
            countTotal: 4,
            tokenTotal: 200000,
            amountTotal: 310
          },
          "text-davinci-003": {
            countTotal: 3,
            tokenTotal: 150000,
            amountTotal: 300
          },
          "text-curie-001": {
            countTotal: 1,
            tokenTotal: 50000,
            amountTotal: 10
          }
        }
      };
      assert.deepEqual(result, target);
    });
  });
});
