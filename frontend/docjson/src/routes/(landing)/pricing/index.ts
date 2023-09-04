import { goto } from '$app/navigation'

// display all features on each pricing option because usage limits will be different

// TODO decide if every feature should have a limit
// we need to display features' limits if they are available
// some features like "Customer Support" don't have limits so we need not to display limits for them
// TODO decide if features should have infos for each plan
// TODO decide if every feature should have info
// TODO decide if every feature should have an icon
// TODO decide if price explanations should be defined individually

// Plans: Free, Basic, Pro, Enterprise

const PLANS = ['Free', 'Basic', 'Pro', 'Enterprise'] as const

export type Feature = {
  name: string
  info?: string
  icon?: string
  unit: string
  plans: Record<(typeof PLANS)[number], { available: boolean; limit?: number | string }>
}

export type OptionFeature = {
  name: string
  info?: string
  icon?: string
  available: boolean
  limit?: number | string
  unit: string
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
  features: OptionFeature[]
}

export type Plans = [Plan, Plan, Plan, Plan]

const features: Feature[] = [
  {
    name: 'API Creation',
    info: 'Create APIs from your documents',
    icon: 'mdi:api',
    unit: '',
    plans: {
      Free: { available: true, limit: 10 },
      Basic: { available: true, limit: 100 },
      Pro: { available: true, limit: 500 },
      Enterprise: { available: true },
    },
  },
  {
    name: 'Document OCR',
    info: 'Scan your documents',
    icon: 'mdi:file-document',
    unit: '',
    plans: {
      Free: { available: true, limit: 50 },
      Basic: { available: true, limit: 500 },
      Pro: { available: true, limit: 1000 },
      Enterprise: { available: true },
    },
  },
  {
    name: 'Document Conversion',
    icon: 'mdi:file-pdf',
    unit: '',
    plans: {
      Free: { available: true, limit: 50 },
      Basic: { available: true, limit: 500 },
      Pro: { available: true, limit: 1000 },
      Enterprise: { available: true },
    },
  },
  {
    name: 'Document Upload',
    icon: 'mdi:upload',
    unit: '',
    plans: {
      Free: { available: true, limit: 50 },
      Basic: { available: true, limit: 500 },
      Pro: { available: true, limit: 1000 },
      Enterprise: { available: true },
    },
  },
  {
    name: 'Document Size',
    icon: 'mdi:file',
    unit: 'MB',
    info: 'Maximum size of a single document',
    plans: {
      Free: { available: true, limit: 1 },
      Basic: { available: true, limit: 5 },
      Pro: { available: true, limit: 10 },
      Enterprise: { available: true },
    },
  },
  {
    name: 'Document Download',
    icon: 'mdi:download',
    unit: '',
    plans: {
      Free: { available: false },
      Basic: { available: true, limit: 500 },
      Pro: { available: true, limit: 1000 },
      Enterprise: { available: true },
    },
  },
  {
    name: 'Document Storage',
    info: 'Store your documents in the cloud',
    icon: 'mdi:database',
    unit: '',
    plans: {
      Free: { available: false },
      Basic: { available: true, limit: 500 },
      Pro: { available: true, limit: 1000 },
      Enterprise: { available: true },
    },
  },
]

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
    features: features.map(
      (feature): OptionFeature => ({
        ...feature,
        ...feature.plans.Free,
      }),
    ),
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
    features: features.map(
      (feature): OptionFeature => ({
        ...feature,
        ...feature.plans.Basic,
      }),
    ),
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
    features: features.map(
      (feature): OptionFeature => ({
        ...feature,
        ...feature.plans.Pro,
      }),
    ),
  },
  {
    name: 'Enterprise',
    highlight: false,
    info: 'Contact us for a custom plan',
    price: '-',
    action: {
      name: 'Contact us',
      handler: () => {
        goto('/contact')
      },
    },
    features: features.map(
      (feature): OptionFeature => ({
        ...feature,
        ...feature.plans.Enterprise,
      }),
    ),
  },
]
