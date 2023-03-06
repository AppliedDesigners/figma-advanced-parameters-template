// @ts-nocheck
import cloneDeep from "lodash/cloneDeep";

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

// TODO this type is messed up
interface BreakdownItem {
  summary?: BreakdownItem;
  count: number;
  tokens: number;
  amount: number;
  formattedAmount: string;
}

interface BreakdownOptions {
  ids: string[];
  models: string[];
  providers: string[];
}

export interface UsageBreakdown {
  [key: string]:
    | {
        [key: string]: BreakdownItem;
        summary: BreakdownItem;
      }
    | BreakdownItem
    | BreakdownOptions;
  summary: BreakdownItem;
  options: BreakdownOptions;
}

interface TransformQuantity {
  divide_by: number;
  round: "up" | "down";
}

interface Rates {
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
  [key: string]: string | Rates;
  id: string;
  openai: Rates;
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

const COUNT_BUCKET = { count: 0, tokens: 0, amount: 0 };

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
  // TODO: having an issue with the typings here
  data: any;
}) => {
  usage.forEach(({ apiKeyId: id, model, provider }) => {
    const rate = pricing?.[provider]?.[model];
    const modelTokens = data?.apiKeys?.[id]?.models?.[model]?.tokens;

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

    data.summary.amount += amount;
    data.apiKeys[id].summary.amount += amount;
    data.apiKeys[id].models[model].amount += amount;
    data.models[model].amount += amount;
  });
};

const prepareBreakdown = (usage: TokenUsageSummary[]) => {
  const result = usage.reduce(
    (memo, { apiKeyId: id, model, countTotal, tokenTotal, provider }) => {
      /**
       * Collect unique options
       */
      if (!memo.options.apiKeys.includes(id)) {
        memo.options.apiKeys.push(id);
      }
      if (!memo.options.models.includes(model)) {
        memo.options.models.push(model);
      }
      if (!memo.options.providers.includes(provider)) {
        memo.options.providers.push(provider);
      }

      /**
       * Initialize usage count buckets
       */
      memo.apiKeys[id] ??= { summary: cloneDeep(COUNT_BUCKET) };
      memo.models[model] ??= cloneDeep(COUNT_BUCKET);
      memo.apiKeys[id].models ??= {};
      memo.apiKeys[id].models[model] ??= cloneDeep(COUNT_BUCKET);

      /**
       * Increments
       * 1. All ApiKey summary
       * 2. Per ApiKey summary
       * 3. Per ApiKey model counts
       * 4. Per model counts
       */
      // 1.
      memo.summary.count += countTotal;
      memo.summary.tokens += tokenTotal;
      memo.summary.amount += 0;
      // 2.
      memo.apiKeys[id].summary.count += countTotal;
      memo.apiKeys[id].summary.tokens += tokenTotal;
      memo.apiKeys[id].summary.amount += 0;
      // 3.
      memo.apiKeys[id].models[model].count += countTotal;
      memo.apiKeys[id].models[model].tokens += tokenTotal;
      memo.apiKeys[id].models[model].amount += 0;
      // 4.
      memo.models[model].count += countTotal;
      memo.models[model].tokens += tokenTotal;
      memo.models[model].amount += 0;

      return memo;
    },
    {
      summary: {
        count: 0,
        tokens: 0,
        amount: 0,
        formattedAmount: "$0.00"
      },
      models: {},
      apiKeys: {},
      options: {
        apiKeys: [],
        models: [],
        providers: []
      }
    } as any
  );

  return result as UsageBreakdown;
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
