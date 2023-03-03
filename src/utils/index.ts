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

const formatAmounts = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val && typeof val === "object") {
      formatAmounts(val);

      if ("amount" in val) {
        if (val.amount) {
          obj[key].formattedAmount = new Intl.NumberFormat("en", {
            style: "currency",
            currency: "usd"
          }).format(val.amount / 100);
        }
      }
    }
  });
  return obj;
};

export const breakdown = ({ usage }: { usage: TokenUsageSummary[] }) => {
  const result = usage.reduce(
    (memo, summary: TokenUsageSummary) => {
      const { countTotal, tokenTotal, apiKeyId: id, model } = summary;
      if (!memo[id]) {
        memo[id] = {
          all: {
            count: 0,
            tokens: 0,
            amount: 0
          }
        };
      }
      if (!memo[id][model]) {
        memo[id][model] = {
          count: 0,
          tokens: 0,
          amount: 0
        };
      }
      memo.all.count += countTotal;
      memo[id].all.count += countTotal;
      memo[id][model].count += countTotal;

      memo.all.tokens += tokenTotal;
      memo[id].all.tokens += tokenTotal;
      memo[id][model].tokens += tokenTotal;

      return memo;
    },
    {
      all: {
        count: 0,
        tokens: 0,
        amount: 0,
        formattedAmount: "$0.00"
      }
    }
  );

  for (let index = 0; index < usage.length; index++) {
    const summary = usage[index];
    const { apiKeyId: id, model, provider } = summary;
    const modelRate = RATE_TABLE[provider][model];
    if (modelRate) {
      const modelTokens = result[id][model].tokens;
      const unitCount = modelTokens / modelRate.transform_quantity.divide_by;
      const unitRate = parseFloat(modelRate.unit_amount_decimal);

      const amount = unitCount * unitRate;
      console.log(`\n${model} (${unitCount} * ${unitRate}) amount:`, amount);

      result.all.amount += amount;
      result[id].all.amount += amount;
      result[id][model].amount += amount;
    } else {
      console.warn(`No rate for provider:${provider} model:${model}`);
    }
  }

  formatAmounts(result);

  return result;
};
