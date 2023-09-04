import { goto } from '$app/navigation'

// display all features on each pricing option because usage limits will be different

// TODO decide if every feature should have a limit
// we need to display features' limits if they are available
// some features like "Customer Support" don't have limits so we need not to display limits for them
// TODO decide if features should have infos for each plan
// TODO decide if every feature should have an icon
// TODO decide if price explanations should be defined individually

// Plans: Free, Basic, Pro, Enterprise

const PLANS = ['Free', 'Basic', 'Pro', 'Enterprise'] as const
const Icons = {
  api: 'mdi:api',
  ocr: 'mdi:file-document',
  conversion: 'mdi:file-pdf',
  upload: 'mdi:upload',
  size: 'mdi:file',
  download: 'mdi:download',
  storage: 'mdi:database',
  schema: 'mdi:code-json',
  special: 'mdi:star',
}

export type Feature = {
  name: string
  info?: string
  icon?: string
  unit: string
  plans: Record<(typeof PLANS)[number], { available: boolean; limit?: number | string }>
}

export type OptionFeature = {
  name: string
  icon: string
  info?: string
  available?: boolean
  // limit?: number | string
  // unit: string
}

export type Plan = {
  name: (typeof PLANS)[number]
  info: string
  price: number | string
  highlight?: boolean
  action: {
    name: string
    handler: () => void
  }
  note?: string
  featuresHeading: string
  features: OptionFeature[]
}

export type Plans = [Plan, Plan, Plan, Plan]

export const pricingOptions: Plans = [
  {
    name: 'Free',
    info: 'Trial version of tojson to get you started',
    price: 0,
    action: {
      name: 'Get started',
      handler: () => {
        goto('/signup')
      },
    },
    featuresHeading: 'Get started with these features:',
    features: [
      {
        name: 'Create up to 10 APIs at the same time',
        icon: Icons.api,
      },
      {
        name: 'Edit your data schema',
        icon: Icons.schema,
      },
      {
        name: 'Scan up to 50 documents per month',
        icon: Icons.ocr,
      },
      {
        name: '1MB max-size of a single document',
        icon: Icons.size,
      },
      {
        name: 'No cloud document storage available',
        icon: Icons.storage,
        available: false,
      },
      {
        name: 'No document download available',
        icon: Icons.download,
        available: false,
      },
    ],
  },
  {
    name: 'Basic',
    highlight: false,
    info: 'Ideal for small businesses',
    price: 20,
    action: {
      name: 'Start now',
      handler: () => {
        goto('/signup')
      },
    },
    featuresHeading: 'Everything in Free, plus:',
    features: [
      {
        name: 'Create up to 100 APIs at the same time',
        icon: Icons.api,
      },
      {
        name: 'Edit your data schema',
        icon: Icons.schema,
      },
      {
        name: 'Scan up to 5000 documents per month',
        icon: Icons.ocr,
      },
      {
        name: '5MB max-size of a single document',
        icon: Icons.size,
      },
      {
        name: '100,000 document storage',
        icon: Icons.storage,
      },
      {
        name: 'Download up to 10,000 documents per month',
        icon: Icons.download,
      },
    ],
  },
  {
    name: 'Pro',
    info: 'For businesses with more documents',
    price: 50,
    highlight: true,
    action: {
      name: 'Subscribe',
      handler: () => {
        goto('/signup')
      },
    },
    featuresHeading: 'Everything in Basic, plus:',
    features: [
      {
        name: 'Create up to 500 APIs at the same time',
        icon: Icons.api,
      },
      {
        name: 'Edit your data schema',
        icon: Icons.schema,
      },
      {
        name: 'Scan up to 20,000 documents per month',
        icon: Icons.ocr,
      },
      {
        name: '10MB max-size of a single document',
        icon: Icons.size,
      },
      {
        name: '1,000,000 document storage',
        icon: Icons.storage,
      },
      {
        name: 'Download up to 100,000 documents per month',
        icon: Icons.download,
      },
    ],
  },
  {
    name: 'Enterprise',
    highlight: false,
    info: 'Predefined limits are not enough? Contact us!',
    price: '-',
    action: {
      name: 'Contact us',
      handler: () => {
        goto('/contact')
      },
    },
    featuresHeading: 'Everything in Pro, plus:',
    features: [
      {
        name: 'Custom limits based on your needs',
        icon: Icons.special,
      },
      {
        name: 'First class support',
        icon: Icons.special,
      },
    ],
  },
]
