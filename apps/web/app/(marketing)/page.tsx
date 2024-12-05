import Image from 'next/image';
import Link from 'next/link';

import { ArrowRightIcon, LayoutDashboard } from 'lucide-react';

import { PricingTable } from '@kit/billing-gateway/marketing';
import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  GradientSecondaryText,
  Hero,
  Pill,
  SecondaryHero,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'mt-4 flex flex-col space-y-24 py-14'}>
      <Hero
        pill={
          <Pill label={'New'}>
            <span>AI-Powered Bilingual Art Education Platform</span>
          </Pill>
        }
        title={
          <>
            <span>Transform Your Art Teaching</span>
            <span>with AI-Powered Innovation</span>
          </>
        }
        subtitle={
          <span>
            Break language barriers in art education with Artverse. Create stunning
            visual content from any language input, powered by our innovative
            AI technology trained on real art teacher data.
          </span>
        }
        cta={<MainCallToActionButton />}
        image={
          <Image
            priority
            className={
              'rounded-2xl border border-gray-200 dark:border-primary/10'
            }
            width={3558}
            height={2222}
            src={`/images/websiteartverse.png`}
            alt={`App Image`}
          />
        }
      />

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-col space-y-16 xl:space-y-32 2xl:space-y-36'}
        >
          <FeatureShowcase
            heading={
              <>
                <b className="font-semibold dark:text-white">
                  Transform Art Education with AI
                </b>
                .{' '}
                <GradientSecondaryText>
                  Create stunning visual content in any language with our 
                  AI-powered art education platform.
                </GradientSecondaryText>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <LayoutDashboard className="h-5" />
                <span>Complete Teaching Solution</span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={
                  'relative col-span-2 overflow-hidden bg-violet-500 text-white lg:h-96'
                }
                label={'Smart Language Processing'}
                description={`Input your ideas in any language and let our AI create perfect teaching materials.`}
              >
                <Image
                  className="absolute right-0 top-0 hidden h-full w-full rounded-tl-2xl border border-border lg:top-36 lg:flex lg:h-auto lg:w-10/12"
                  src={'/images/dashboard-header.webp'}
                  width={'2061'}
                  height={'800'}
                  alt={'Dashboard Header'}
                />
              </FeatureCard>

              <FeatureCard
                className={
                  'relative col-span-2 w-full overflow-hidden lg:col-span-1'
                }
                label={'Professional Art Generation'}
                description={`Generate high-quality art visuals tailored specifically for education.`}
              >
                <Image
                  className="absolute left-16 top-32 hidden h-auto w-8/12 rounded-l-2xl lg:flex"
                  src={'/images/sign-in.webp'}
                  width={'1760'}
                  height={'1680'}
                  alt={'Sign In'}
                />
              </FeatureCard>

              <FeatureCard
                className={
                  'relative col-span-2 overflow-hidden lg:col-span-1 lg:h-96'
                }
                label={'Classroom Tools'}
                description={`Everything you need to create and deliver engaging art lessons.`}
              >
                <Image
                  className="absolute right-0 top-0 hidden h-full w-full rounded-tl-2xl border lg:top-28 lg:flex lg:h-auto lg:w-8/12"
                  src={'/images/multi-tenancy.webp'}
                  width={'2061'}
                  height={'800'}
                  alt={'Multi Tenancy'}
                />
              </FeatureCard>

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:h-96'}
                label={'Teaching Resources'}
                description={`Access our growing library of multilingual art education materials.`}
              >
                <Image
                  className="absolute right-0 top-0 hidden h-full w-full rounded-tl-2xl border border-border lg:top-36 lg:flex lg:h-auto lg:w-11/12"
                  src={'/images/billing.webp'}
                  width={'2061'}
                  height={'800'}
                  alt={'Billing'}
                />
              </FeatureCard>
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>

      <div className={'container mx-auto'}>
        <div
          className={
            'flex flex-col items-center justify-center space-y-16 py-16'
          }
        >
          <SecondaryHero
            pill={<Pill>Get started for free. No credit card required.</Pill>}
            heading="Fair pricing for all types of businesses"
            subheading="Get started on our free plan and upgrade when you are ready."
          />

          <div className={'w-full'}>
            <PricingTable
              config={billingConfig}
              paths={{
                signUp: pathsConfig.auth.signUp,
                return: pathsConfig.app.home,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-4'}>
      <CtaButton>
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>
              <Trans i18nKey={'common:getStarted'} />
            </span>

            <ArrowRightIcon
              className={
                'h-4 animate-in fade-in slide-in-from-left-8' +
                ' delay-1000 duration-1000 zoom-in fill-mode-both'
              }
            />
          </span>
        </Link>
      </CtaButton>

      <CtaButton variant={'link'}>
        <Link href={'/contact'}>
          <Trans i18nKey={'common:contactUs'} />
        </Link>
      </CtaButton>
    </div>
  );
}