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

interface BreakdownItem {
  count: number;
  tokens: number;
  amount: number;
  formattedAmount: string;
}

interface Breakdown {
  [key: string]:
    | {
        [key: string]: BreakdownItem;
        all: BreakdownItem;
      }
    | BreakdownItem;
  all: BreakdownItem;
}

interface TransformQuantity {
  divide_by: number;
  round: "up" | "down";
}

interface OpenAI {
  [model: string]:
    | {
        transform_quantity: TransformQuantity;
        unit_amount_decimal: string;
      }
    | {
        [model: string]: {
          transform_quantity: TransformQuantity;
          unit_amount_decimal: string;
        };
      };
}

interface Pricing {
  [key: string]: string | OpenAI;
  id: string;
  openai: OpenAI;
  published: string;
}

const PRICING: Pricing = {
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

const applyPricing = ({
  usage,
  pricing,
  data
}: {
  usage: TokenUsageSummary[];
  pricing: Pricing;
  data: Breakdown;
}) => {
  usage.forEach(({ apiKeyId: id, model, provider }) => {
    const rate = pricing?.[provider]?.[model];
    const modelTokens = data?.[id]?.[model]?.tokens;

    if (!rate || !modelTokens) {
      console.warn(`No rate for provider:${provider} model:${model}`);
      return;
    }

    const {
      transform_quantity: { divide_by },
      unit_amount_decimal: unitRate
    } = rate;
    const unitCount = modelTokens / divide_by;
    const amount = parseFloat(unitRate) * unitCount;

    console.log(`\n${model} (${unitCount} * ${unitRate}) amount:`, amount);

    data.all.amount += amount;
    data[id].all.amount += amount;
    data[id][model].amount += amount;
  });
};

const prepareBreakdown = (usage: TokenUsageSummary[]) => {
  const result = usage.reduce(
    (memo, { apiKeyId: id, model, countTotal, tokenTotal }) => {
      memo[id] ??= { all: { count: 0, tokens: 0, amount: 0 } };
      memo[id][model] ??= { count: 0, tokens: 0, amount: 0 };

      memo.all.count += countTotal;
      memo.all.tokens += tokenTotal;
      memo.all.amount += 0;

      memo[id].all.count += countTotal;
      memo[id].all.tokens += tokenTotal;
      memo[id].all.amount += 0;

      memo[id][model].count += countTotal;
      memo[id][model].tokens += tokenTotal;
      memo[id][model].amount += 0;

      return memo;
    },
    {
      all: {
        count: 0,
        tokens: 0,
        amount: 0,
        formattedAmount: "$0.00"
      }
    } as any
  );

  return result as {
    [key: string]:
      | {
          [key: string]: BreakdownItem;
          all: BreakdownItem;
        }
      | BreakdownItem;
    all: BreakdownItem;
  };
};

export const usageBreakdown = ({
  usage,
  pricing = PRICING
}: {
  usage: TokenUsageSummary[];
  pricing?: any;
}) => {
  const data = prepareBreakdown(usage);
  applyPricing({ usage, pricing, data });
  formatAmounts(data);

  return data;
};
