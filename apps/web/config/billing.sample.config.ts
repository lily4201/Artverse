/**
 * This is a sample billing configuration file. You should copy this file to `billing.config.ts` and then replace
 * the configuration with your own billing provider and products.
 */
import { BillingProviderSchema, createBillingSchema } from '@kit/billing';

// The billing provider to use. This should be set in the environment variables
// and should match the provider in the database. We also add it here so we can validate
// your configuration against the selected provider at build time.
const provider = BillingProviderSchema.parse(
  process.env.NEXT_PUBLIC_BILLING_PROVIDER,
);

export default createBillingSchema({
  // also update config.billing_provider in the DB to match the selected
  provider,
  // products configuration
  products: [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for exploring AI art education',
      currency: 'USD',
      badge: 'Start Creating',
      plans: [
        {
          name: 'Free Monthly',
          id: 'free-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe',
              name: 'Free',
              cost: 0,
              type: 'flat' as const,
            },
          ],
        },
        {
          name: 'Free Yearly',
          id: 'free-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'free-yearly',
              name: 'Base',
              cost: 99.99,
              type: 'flat' as const,
            },
          ],
        },
      ],
      features: [
        'Basic AI art generation (20/month)',
        'Bilingual interface (EN/CN)',
        'Basic lesson templates',
        'Community art resources',
        'Standard support'
      ],
    },
    {
      id: 'pro',
      name: 'Teacher',
      badge: 'Most Popular',
      highlighted: true,
      description: 'For dedicated art educators',
      currency: 'USD',
      plans: [
        {
          name: 'Teacher Monthly',
          id: 'teacher-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_1PGOAVI1i3VnbZTqc69xaypm',
              name: 'Base',
              cost: 19.99,
              type: 'flat',
            },
          ],
        },
        {
          name: 'Teacher Yearly',
          id: 'teacher-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'price_teacher_yearly',
              name: 'Base',
              cost: 199.99,
              type: 'flat',
            },
          ],
        },
      ],
      features: [
        'Unlimited AI art generation',
        'Priority language processing',
        'Advanced art editing tools',
        'Premium lesson templates',
        'Full resource library access',
        'Priority support',
        'Export in multiple formats'
      ],
    },
    {
      id: 'school',
      name: 'Institution',
      description: 'For art schools and departments',
      currency: 'USD',
      plans: [
        {
          name: 'Institution Monthly',
          id: 'institution-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_institution-monthly',
              name: 'Base',
              cost: 29.99,
              type: 'flat',
            },
          ],
        },
        {
          name: 'Institution Yearly',
          id: 'institution-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'price_institution_yearly',
              name: 'Base',
              cost: 299.9,
              type: 'flat',
            },
          ],
        },
      ],
      features: [
        'Everything in Teacher plan',
        'Multiple teacher accounts',
        'Department-wide sharing',
        'Teaching analytics',
        'Custom branding options',
        'Dedicated support team',
        'Staff training sessions',
        'API integration'
      ],
    },
  ],
});
