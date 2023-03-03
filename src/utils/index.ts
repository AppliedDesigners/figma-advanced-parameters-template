// @ts-nocheck
export const utilExample = () => true;

export interface TokenUsageSummary {
  apiKeyId: string;
  model: string;
  provider: string;
  countTotal: number;
  countDailyAvg: number;
  countMonthlyAvg: number;
  tokenTotal: number;
  tokenDailyAvg: number;
  tokenMonthlyAvg: number;
}

const RATE_TABLE = {
  id: "3b41a695-3c09-49db-8d03-e37673c260f0",
  openai: {
    "text-davinci-003": {
      transform_quantity: {
        divide_by: 1000,
        round: "up"
      },
      // $0.02
      unit_amount_decimal: "2"
    },
    "text-curie-001": {
      transform_quantity: {
        divide_by: 1000,
        round: "up"
      },
      // $0.002
      unit_amount_decimal: "0.2"
    },
    "text-babbage-001": {
      transform_quantity: {
        divide_by: 1000,
        round: "up"
      },
      // $0.0005
      unit_amount_decimal: "0.05"
    },
    "text-ada-001": {
      transform_quantity: {
        divide_by: 1000,
        round: "up"
      },
      // $0.0004
      unit_amount_decimal: "0.04"
    },
    "fineTuned": {
      ada: {
        transform_quantity: {
          divide_by: 1000,
          round: "up"
        },
        // $0.0016
        unit_amount_decimal: "0.016"
      }
    }
  },
  published: "2023-03-03T22:42:43.604Z"
};

export const breakdown = ({ usage }: { usage: TokenUsageSummary[] }) => {
  const result = usage.reduce(
    (memo, summary: TokenUsageSummary) => {
      const { countTotal, tokenTotal, apiKeyId: id, model, provider } = summary;
      if (!memo[id]) {
        memo[id] = {
          all: {
            countTotal: 0,
            tokenTotal: 0,
            amountTotal: 0
          }
        };
      }
      if (!memo[id][model]) {
        memo[id][model] = {
          countTotal: 0,
          tokenTotal: 0,
          amountTotal: 0
        };
      }
      memo.all.countTotal += countTotal;
      memo[id].all.countTotal += countTotal;
      memo[id][model].countTotal += countTotal;

      memo.all.tokenTotal += tokenTotal;
      memo[id].all.tokenTotal += tokenTotal;
      memo[id][model].tokenTotal += tokenTotal;

      return memo;
    },
    {
      all: {
        countTotal: 0,
        tokenTotal: 0,
        amountTotal: 0
      }
    }
  );

  for (let index = 0; index < usage.length; index++) {
    const summary = usage[index];
    const { apiKeyId: id, model, provider } = summary;
    const modelRate = RATE_TABLE[provider][model];
    if (modelRate) {
      const modelTokens = result[id][model].tokenTotal;
      const unitCount = modelTokens / modelRate.transform_quantity.divide_by;
      const unitRate = parseFloat(modelRate.unit_amount_decimal);

      const amount = unitCount * unitRate;
      console.log(
        `------- ${model} (${unitCount} * ${unitRate}) amount:`,
        amount
      );
      console.log("\n");

      result.all.amountTotal += amount;
      result[id].all.amountTotal += amount;
      result[id][model].amountTotal += amount;
    } else {
      console.warn(`No rate for provider:${provider} model:${model}`);
    }
  }

  return result;
};

// export const breakdown = ({ usage }: { usage: TokenUsageSummary[] }) => {
//   const result = usage.reduce(
//     (memo, summary) => {
//       if (!memo[summary.apiKeyId]) {
//         memo[summary.apiKeyId] = {
//           all: {
//             count: 0
//           }
//         };
//       }

//       return memo;
//     },
//     {
//       all: {
//         count: 0
//       }
//     } as {
//       [key: string]:
//         | {
//             count: number;
//           }
//         | {
//             [key: string]:
//               | number
//               | {
//                   [key: string]: {
//                     count: number;
//                   };
//                 };
//             count: number;
//           };
//       all: {
//         [key: string]:
//           | number
//           | {
//               [key: string]: {
//                 count: number;
//               };
//             };
//         count: number;
//       };
//     }
//   );
//   return result;
// };
