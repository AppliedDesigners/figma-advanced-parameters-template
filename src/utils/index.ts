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

const applyRates = ({ usage, rates, data }) => {
  usage.forEach(({ apiKeyId: id, model, provider }) => {
    const modelRate = rates?.[provider]?.[model];
    const modelTokens = data?.[id]?.[model]?.tokens;

    if (!modelRate || !modelTokens) {
      console.warn(`No rate for provider:${provider} model:${model}`);
      return;
    }

    const {
      transform_quantity: { divide_by },
      unit_amount_decimal: unitRate
    } = modelRate;
    const unitCount = modelTokens / divide_by;
    const amount = parseFloat(unitRate) * unitCount;

    console.log(`\n${model} (${unitCount} * ${unitRate}) amount:`, amount);

    data.all.amount += amount;
    data[id].all.amount += amount;
    data[id][model].amount += amount;
  });
};

const prepareBreakdown = (usage) =>
  usage.reduce(
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

export const usageBreakdown = ({
  usage,
  rates = RATE_TABLE
}: {
  usage: TokenUsageSummary[];
  rates?: any;
}) => {
  const data = prepareBreakdown(usage);
  applyRates({ usage, rates, data });
  formatAmounts(data);

  return data;
};
