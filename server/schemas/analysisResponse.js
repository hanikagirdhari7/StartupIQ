// The single source of truth for the shape of an analysis.
//
// Providers build their prompt contract from this (server/ai/prompt.js) and
// validate their output against it (server/ai/schemaGuard.js), so the prompt,
// the guard and the API response can never drift apart.
//
// Values in the *_SCHEMA objects are null placeholders describing the shape
// only — they are never returned as analysis results.

export const MARKET_DEMAND_SCHEMA = {
  level: null,        // string — low | moderate | high
  explanation: null,  // string — why demand is at this level, qualitative
  opportunity: null,  // string — the specific gap this idea can fill
}

export const TARGET_CUSTOMER_ANALYSIS_SCHEMA = {
  primaryCustomer: null,  // string — the most likely first buyer, described concretely
  needs: null,            // string — what that customer actually needs
  buyingFactors: null,    // string — what will decide the purchase
}

export const COMPETITION_SCHEMA = {
  level: null,                 // string — low | moderate | high
  existingAlternatives: null,  // string — kinds of alternatives, no invented company data
  differentiation: null,       // string — how this idea can realistically stand out
}

export const PRICING_RECOMMENDATION_SCHEMA = {
  suggestedRange: null,  // string — a labelled estimate, never a claimed market fact
  reason: null,          // string — why this range fits the model, customer and budget
}

// Financial fit. The numbers are AI estimates derived from the submitted idea and
// budget, so every figure is nullable: the model must be able to say it cannot
// estimate responsibly instead of inventing a precise price.
export const FINANCIAL_FIT_MODEL_TYPES = ['physicalProduct', 'service', 'digitalSubscription', 'other']
export const FINANCIAL_FIT_BASES = ['perSale', 'perMonth']
export const FINANCIAL_FIT_STATUSES = ['goodToTest', 'needsCaution', 'financiallyChallenging']

export const FINANCIAL_FIT_SCHEMA = {
  modelType: null,          // string — one of FINANCIAL_FIT_MODEL_TYPES
  basis: null,              // string — 'perSale' (unit economics) or 'perMonth' (running costs)
  priceLabel: null,         // string — short plain-English label, e.g. 'Estimated selling price'
  priceEstimate: null,      // number | null — estimate in the submitted currency, null when unknown
  costLabel: null,          // string — e.g. 'Estimated cost per sale' / 'Estimated monthly operating cost'
  costEstimate: null,       // number | null
  fixedCosts: null,         // number | null — spend needed before the first sale; null when unknown
  status: null,             // string — one of FINANCIAL_FIT_STATUSES
  verdict: null,            // string — the ONE short recommendation shown under "StartupIQ says"
  biggestConcern: null,     // string — the single biggest financial worry for this idea
  howEstimated: null,       // string — plain-English account of how these numbers were reached
  missingInformation: null, // string | null — what the founder must add for a reliable estimate
}

export const FINANCIAL_FIT_KEYS = Object.keys(FINANCIAL_FIT_SCHEMA)

// Sourcing intelligence. The model picks only the routes that fit this idea
// rather than describing every platform, so the dashboard can show a ranked
// decision instead of a fixed three-column comparison.
//
// Each entry states when that route is genuinely the right answer. The prompt
// renders this menu so selection is driven by the founder's product, budget,
// volume and stage — not by which platforms the model hears named most often.
export const SOURCING_ROUTE_MENU = {
  localSuppliers:
    'Wholesalers, traders and makers inside Pakistan. Usually the cheapest way to start: no customs, no container wait, you can inspect goods and pay locally.',
  directManufacturers:
    'The factory itself, at home or abroad. Fits when volumes are real, the spec is fixed, and cutting out the middleman changes the margin.',
  distributors:
    'Importers who already hold stock in Pakistan or the region. Fits when the founder wants branded or certified goods at trade prices without clearing customs themselves.',
  regionalImporters:
    'Suppliers in neighbouring countries (China, Thailand, Vietnam, India, Malaysia). Fits when local supply is thin or priced up, but the order is still too small for a container.',
  dropshipping:
    'The supplier ships each order to the end customer. Fits when the founder must prove demand before holding any stock, and can accept thin margins and slow delivery.',
  alibaba:
    'Overseas manufacturers for bulk orders and private labelling. Fits when the founder has budget for a real minimum order and wants custom packaging or branding.',
  aliexpress:
    'Small overseas orders and single samples. Fits for testing designs and quality one piece at a time before committing to bulk.',
  '1688':
    'Domestic Chinese wholesale at the lowest list prices. Fits a larger, private-label business that can handle a Chinese-language platform, local-payment hurdles and a forwarding agent.',
  turkey:
    'Turkish makers for clothing, fabric, towels and homeware. Fits when the product is textile or leather and mid-range quality matters more than the lowest price.',
  uae:
    'Dubai and Sharjah re-export hubs. Fits when the founder can travel or buy through a trading agent and wants fast, short-distance shipping of general goods.',
}

export const SOURCING_ROUTE_IDS = Object.keys(SOURCING_ROUTE_MENU)

export const SOURCING_ROUTE_SCHEMA = {
  route: null,          // string — one of SOURCING_ROUTE_IDS
  fitScore: null,       // number 0-100 — how well this route fits THIS idea, never a fixed value
  why: null,            // string — plain-English reason aimed at this founder's situation
  advantage: null,      // string — the single main upside
  limitation: null,     // string — the single main downside
  switchWhen: null,     // string — when another route would become the better choice
  moq: null,            // string — Low | Medium | High
  shipping: null,       // string — Easy | Moderate | Difficult
  customization: null,  // string — Good | Limited
  bestFor: null,        // string — two or three words, e.g. 'Testing demand'
  detail: null,         // string (optional) — fuller guidance behind the 'See details' view
  searchTerms: null,    // string (optional) — product/category phrase for a platform search, never a supplier name
}

export const SOURCING_ROUTE_KEYS = Object.keys(SOURCING_ROUTE_SCHEMA)

export const SOURCING_RECOMMENDATION_SCHEMA = {
  needsPhysicalProducts: null, // boolean — false for services, software, digital or content ideas
  summary: null,               // string — one plain-English line on the sourcing situation
  recommendedRoute: null,      // string — routes[].route id of the best option, empty when not needed
  nextStep: null,              // string — ONE concrete action, worded for a beginner
  routes: null,                // SOURCING_ROUTE_SCHEMA[] — only the relevant routes, best fit first
  digitalResources: null,      // string[] — what a non-physical idea needs instead (software, services)
}

export const LAUNCH_ROADMAP_STEP_SCHEMA = {
  period: null,   // string — e.g. 'Week 1-2'
  actions: null,  // string[] — concrete steps for that period
}

// Object fields whose nested keys must all be non-empty strings, used by the
// schema guard. sourcingRecommendation is validated separately because it holds a
// ranked array, and financialFit because its figures may legitimately be null.
export const ANALYSIS_NESTED_REQUIREMENTS = {
  marketDemand: Object.keys(MARKET_DEMAND_SCHEMA),
  targetCustomerAnalysis: Object.keys(TARGET_CUSTOMER_ANALYSIS_SCHEMA),
  competition: Object.keys(COMPETITION_SCHEMA),
  pricingRecommendation: Object.keys(PRICING_RECOMMENDATION_SCHEMA),
}

export const LAUNCH_ROADMAP_STEP_KEYS = Object.keys(LAUNCH_ROADMAP_STEP_SCHEMA)

export const ANALYSIS_RESPONSE_SCHEMA = {
  viabilityScore: null, // number 0-100 — derived from the submitted idea, never random
  marketDemand: MARKET_DEMAND_SCHEMA,
  targetCustomerAnalysis: TARGET_CUSTOMER_ANALYSIS_SCHEMA,
  competition: COMPETITION_SCHEMA,
  pricingRecommendation: PRICING_RECOMMENDATION_SCHEMA,
  financialFit: FINANCIAL_FIT_SCHEMA,
  marketingRecommendations: null, // string[] — practical, low-cost channels and tactics
  sourcingRecommendation: SOURCING_RECOMMENDATION_SCHEMA,
  risks: null, // string[] — specific risks for this founder
  launchRoadmap: null, // LAUNCH_ROADMAP_STEP_SCHEMA[] — ordered plan
  nextActions: null, // string[] — immediate next steps, ordered by impact
}

export const ANALYSIS_TOP_LEVEL_KEYS = Object.keys(ANALYSIS_RESPONSE_SCHEMA)
