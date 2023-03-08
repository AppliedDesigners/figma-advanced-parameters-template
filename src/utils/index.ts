// @ts-nocheck
import cloneDeep from "lodash/cloneDeep";
import round from "lodash/round";

export interface TokenUsageSummary {
  apiTokenId: string;
  model: string;
  provider: string;
  unitType: string;
  resolution: string;
  callTotal: number;
  tokenTotal: number;
  imageTotal: number;
}

// TODO this type is messed up
interface BreakdownItem {
  summary?: BreakdownItem;
  count: number;
  tokens: number;
  images: number;
  amount: number;
  formattedAmount: string;
}

interface BreakdownOptions {
  apiTokens: string[];
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
const UNIT_DIVISOR = {
  // per 1k tokens
  TOKEN: 1000,
  // per image
  IMAGE: 1,
  // per minute
  MINUTE: 60
};

const PRECISION = 4;

const scaffoldRate = ({
  divisor,
  decimal
}: {
  divisor: string;
  decimal: string;
}) => ({
  transform_quantity: {
    divide_by: divisor,
    round: "up"
  },
  // $0.018
  unit_amount_decimal: decimal
});

const RATES: {
  [key: string]: Rate;
} = {
  // $0.02
  DAVINCI: scaffoldRate({
    divisor: UNIT_DIVISOR.TOKEN,
    decimal: "2"
  }),
  // $0.002
  CURIE: scaffoldRate({
    divisor: UNIT_DIVISOR.TOKEN,
    decimal: "0.2"
  }),
  // $0.0005
  BABBAGE: scaffoldRate({
    divisor: UNIT_DIVISOR.TOKEN,
    decimal: "0.05"
  }),
  // $0.0004
  ADA: scaffoldRate({
    divisor: UNIT_DIVISOR.TOKEN,
    decimal: "0.04"
  }),
  // $0
  TRIAL: scaffoldRate({
    divisor: UNIT_DIVISOR.TOKEN,
    decimal: "0"
  })
};

const PRICING: Pricing = {
  id: "3b41a695-3c09-49db-8d03-e37673c260f0",
  openai: {
    /**
     * GPT
     */
    "gpt-3.5-turbo": scaffoldRate({
      divisor: UNIT_DIVISOR.TOKEN,
      decimal: "0.2"
    }),
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
    "dalle": {
      resolution: {
        "1024x1024": scaffoldRate({
          divisor: UNIT_DIVISOR.IMAGE,
          decimal: "2"
        }),
        "512x512": scaffoldRate({
          divisor: UNIT_DIVISOR.IMAGE,
          decimal: "1.8"
        }),
        "256x256": scaffoldRate({
          divisor: UNIT_DIVISOR.IMAGE,
          decimal: "1.6"
        })
      }
    },
    // Whisper - audio to text
    "whisper-1": scaffoldRate({
      divisor: UNIT_DIVISOR.MINUTE,
      decimal: "0.6"
    }),
    // Codex - generate code
    "code-davinci-002": RATES.TRIAL,
    "code-cushman-001": RATES.TRIAL,
    // Fine tuned
    "fineTuned": {
      // $0.0016
      ada: scaffoldRate({
        divisor: UNIT_DIVISOR.MINUTE,
        decimal: "0.016"
      })
    }
  },
  published: "2023-03-03T22:42:43.604Z"
};

const getModelRate = ({ pricing, provider, model, resolution }) => {
  let rate = pricing?.[provider]?.[model];
  const rateMessage = `No rate for provider:${provider} model:${model} resolution:${resolution}`;
  if (!rate) {
    console.warn(rateMessage);
    return;
  }

  /**
   * Dalle rates are discriminated by resolution
   */
  if (model === "dalle") {
    rate = rate.resolution?.[resolution];

    if (!rate) {
      console.warn(rateMessage);
      return;
    }
  }

  return rate;
};

const getModelUnitCount = ({ data, id, model, unitType }) => {
  const tokenData = data?.[id]?.models?.[model];
  let unitCount;
  switch (unitType) {
    case "image":
      unitCount = tokenData.images;
      break;
    case "token":
      unitCount = tokenData.tokens;
      break;
    case "minute":
      unitCount = tokenData.minutes;
      break;
    default:
      break;
  }

  return unitCount || 0;
};

const COUNT_BUCKET = { calls: 0, tokens: 0, images: 0, amount: 0 };

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
  const keys = Object.keys(obj);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

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
  }

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
  for (let index = 0; index < usage.length; index++) {
    const {
      apiTokenId: id,
      model,
      provider,
      resolution,
      unitType
    } = usage[index];
    const rate = getModelRate({
      pricing,
      provider,
      model,
      resolution
    });
    const unitCount = getModelUnitCount({
      data: data?.apiTokens,
      id,
      model,
      unitType
    });

    if (!unitCount) {
      console.warn(
        `No count for usage provider:${provider} model:${model} resolution:${resolution}`
      );
      continue;
    }

    const amount = rateAmount({ rate, count: unitCount });
    console.log(`\n${model} amount in cents:`, amount);

    data.summary.amount += amount;
    data.apiTokens[id].summary.amount += amount;
    data.apiTokens[id].models[model].amount += amount;
    data.models[model].amount += amount;
  }
};

const prepareBreakdown = (usage: TokenUsageSummary[]) => {
  const result = usage.reduce(
    (
      memo,
      { apiTokenId: id, model, callTotal, imageTotal, tokenTotal, provider }
    ) => {
      /**
       * Collect unique options
       */
      if (!memo.options.apiTokens.includes(id)) {
        memo.options.apiTokens.push(id);
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
      memo.apiTokens[id] ??= { summary: cloneDeep(COUNT_BUCKET) };
      memo.models[model] ??= cloneDeep(COUNT_BUCKET);
      memo.apiTokens[id].models ??= {};
      memo.apiTokens[id].models[model] ??= cloneDeep(COUNT_BUCKET);

      /**
       * Increments
       * 1. All ApiKey summary
       * 2. Per ApiKey summary
       * 3. Per ApiKey model counts
       * 4. Per model counts
       */
      // 1.
      memo.summary.calls += callTotal;
      memo.summary.tokens += tokenTotal;
      memo.summary.images += imageTotal;
      memo.summary.amount += 0;
      // 2.
      memo.apiTokens[id].summary.calls += callTotal;
      memo.apiTokens[id].summary.tokens += tokenTotal;
      memo.apiTokens[id].summary.images += imageTotal;
      memo.apiTokens[id].summary.amount += 0;
      // 3.
      memo.apiTokens[id].models[model].calls += callTotal;
      memo.apiTokens[id].models[model].tokens += tokenTotal;
      memo.apiTokens[id].models[model].images += imageTotal;
      memo.apiTokens[id].models[model].amount += 0;
      // 4.
      memo.models[model].calls += callTotal;
      memo.models[model].tokens += tokenTotal;
      memo.models[model].images += imageTotal;
      memo.models[model].amount += 0;

      return memo;
    },
    {
      summary: {
        ...COUNT_BUCKET,
        formattedAmount: "$0.00"
      },
      apiTokens: {},
      models: {},
      options: {
        apiTokens: [],
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
