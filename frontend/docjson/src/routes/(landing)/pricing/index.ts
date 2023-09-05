import { goto } from '$app/navigation'

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

export type OptionFeature = {
  name: string
  icon: string
  info?: string
  available?: boolean
}

export type Plan = {
  name: (typeof PLANS)[number]
  info: string
  highlight?: boolean

  price: string
  priceInfo?: string

  featuresHeading: string
  features: OptionFeature[]

  note?: string

  action: {
    name: string
    handler: () => void
  }
}

export const plans: Plan[] = [
  {
    name: 'Free',
    info: 'Trial version of tojson to let you see how it works',
    price: 'Free',
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
        info: "Edit the data schema if you didn't like the one generated",
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
        info: 'Only local storage available',
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
    highlight: true,
    info: 'Ideal for small businesses',
    price: '$20',
    priceInfo: 'per month / project',
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
    price: '$50',
    priceInfo: 'per month',
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
    price: 'Custom',
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
