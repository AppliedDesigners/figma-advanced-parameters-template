// @ts-nocheck
import cloneDeep from "lodash/cloneDeep";
import round from "lodash/round";

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
  apiKeys: string[];
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

type Rate = {
  transform_quantity: TransformQuantity;
  unit_amount_decimal: string;
};

interface RateMap {
  [model: string]:
    | Rate
    | {
        [model: string]: Rate;
      };
}

interface Pricing {
  [key: string]: string | RateMap;
  id: string;
  openai: RateMap;
  published: string;
}

/**
 * GPT rates are listed on the pricing page here:
 * https://openai.com/pricing#faq-completions-pricing
 *
 * A list of all models can be fetched via the API
 * https://api.openai.com/v1/models
 *
 * Documented GPT models are listed here
 * - https://platform.openai.com/docs/models/gpt-3-5
 * - https://platform.openai.com/docs/models/gpt-3
 *
 * Model name / purposes
 * - https://community.openai.com/t/what-do-all-these-models-do/19007/2
 */
const UNIT_BASE = {
  // per 1k tokens
  TOKEN: 1000,
  // per minute
  MINUTE: 60
};

const PRECISION = 4;

const RATES: {
  [key: string]: Rate;
} = {
  DAVINCI: {
    transform_quantity: {
      divide_by: UNIT_BASE.TOKEN,
      round: "up"
    },
    // $0.02
    unit_amount_decimal: "2"
  },
  CURIE: {
    transform_quantity: {
      divide_by: UNIT_BASE.TOKEN,
      round: "up"
    },
    // $0.002
    unit_amount_decimal: "0.2"
  },
  BABBAGE: {
    transform_quantity: {
      divide_by: UNIT_BASE.TOKEN,
      round: "up"
    },
    // $0.0005
    unit_amount_decimal: "0.05"
  },
  ADA: {
    transform_quantity: {
      divide_by: UNIT_BASE.TOKEN,
      round: "up"
    },
    // $0.0004
    unit_amount_decimal: "0.04"
  },
  TRIAL: {
    transform_quantity: {
      divide_by: UNIT_BASE.TOKEN,
      round: "up"
    },
    // $0.000
    unit_amount_decimal: "0"
  }
};

const PRICING: Pricing = {
  id: "3b41a695-3c09-49db-8d03-e37673c260f0",
  openai: {
    /**
     * GPT
     */
    "gpt-3.5-turbo": {
      transform_quantity: {
        divide_by: UNIT_BASE.TOKEN,
        round: "up"
      },
      // $0.002
      unit_amount_decimal: "0.2"
    },
    // Davinci
    "davinci": RATES.DAVINCI,
    "text-davinci-003": RATES.DAVINCI,
    "text-davinci-002": RATES.DAVINCI,
    "text-davinci-001": RATES.DAVINCI,
    // Curie
    "curie": RATES.CURIE,
    "text-curie-001": RATES.CURIE,
    // Babbage
    "babbage": RATES.BABBAGE,
    "text-babbage-001": RATES.BABBAGE,
    // Ada
    "ada": RATES.ADA,
    "text-ada-001": RATES.ADA,
    /**
     * Whisper
     * - audio to text
     */
    "whisper-1": {
      transform_quantity: {
        divide_by: UNIT_BASE.MINUTE,
        round: "up"
      },
      // $0.006
      unit_amount_decimal: "0.6"
    },
    /**
     * Codex - Free in trial
     * - generates code
     */
    "code-davinci-002": RATES.TRIAL,
    "code-cushman-001": RATES.TRIAL,
    /**
     * Fine tuned
     */
    "fineTuned": {
      ada: {
        transform_quantity: {
          divide_by: UNIT_BASE.TOKEN,
          round: "up"
        },
        // $0.0016
        unit_amount_decimal: "0.016"
      }
    }
  },
  published: "2023-03-03T22:42:43.604Z"
};

const COUNT_BUCKET = { calls: 0, tokens: 0, amount: 0 };

export function formatTrailingZeros(currencyString) {
  const regex = /0+$/;
  let result = currencyString.replace(regex, "");

  if (!result.includes(".")) {
    result += ".";
  }
  const decimalDigits = result.split(".")[1];
  if (decimalDigits.length === 1) {
    return result + "0";
  } else if (decimalDigits.length === 0) {
    return result + "00";
  }

  return result;
}

const formatAmounts = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val && typeof val === "object") {
      formatAmounts(val);

      if ("amount" in val) {
        if (val.amount) {
          obj[key].formattedAmount = formatTrailingZeros(
            new Intl.NumberFormat("en", {
              style: "currency",
              currency: "usd",
              minimumFractionDigits: 4
            }).format(val.amount / 100)
          );
        }
      }
    }
  });
  return obj;
};

const rateAmount = ({ rate, count }: { rate: Rate; count: number }) => {
  const {
    transform_quantity: { divide_by },
    unit_amount_decimal: unitRate
  } = rate;
  const unitCount = count / divide_by;

  return round(parseFloat(unitRate) * unitCount, PRECISION);
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

    const amount = rateAmount({ rate, count: modelTokens });
    console.log(`\n${model} amount in cents:`, amount);

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
      memo.summary.calls += countTotal;
      memo.summary.tokens += tokenTotal;
      memo.summary.amount += 0;
      // 2.
      memo.apiKeys[id].summary.calls += countTotal;
      memo.apiKeys[id].summary.tokens += tokenTotal;
      memo.apiKeys[id].summary.amount += 0;
      // 3.
      memo.apiKeys[id].models[model].calls += countTotal;
      memo.apiKeys[id].models[model].tokens += tokenTotal;
      memo.apiKeys[id].models[model].amount += 0;
      // 4.
      memo.models[model].calls += countTotal;
      memo.models[model].tokens += tokenTotal;
      memo.models[model].amount += 0;

      return memo;
    },
    {
      summary: {
        calls: 0,
        tokens: 0,
        amount: 0,
        formattedAmount: "$0.00"
      },
      apiKeys: {},
      models: {},
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
