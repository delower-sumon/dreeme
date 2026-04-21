'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: 'Dreamer',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for exploring your dreams',
      features: [
        'Unlimited dream entries',
        'AI dream interpretations',
        'Basic dream tracking',
        '30 day cloud storage',
        'Community access',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Lucid',
      monthlyPrice: 3,
      yearlyPrice: 30,
      description: 'For committed dream explorers',
      features: [
        'Everything in Dreamer',
        'Advanced analytics & insights',
        'Unlimited cloud storage',
        'Share dreams privately',
        'Export dream journal',
        'Priority support',
        'Recurring dream detection',
      ],
      cta: 'Subscribe Now',
      highlighted: true,
    },
    {
      name: 'Oracle',
      monthlyPrice: 9,
      yearlyPrice: 86,
      description: 'Premium dream mastery',
      features: [
        'Everything in Lucid',
        'Advanced AI interpretations',
        'Dream psychology articles',
        'Personal dream coach',
        'API access',
        '24/7 premium support',
        'Custom interpretations',
        'Lifetime archive',
      ],
      cta: 'Upgrade to Oracle',
      highlighted: false,
    },
  ]

  const currentPrice = (plan: typeof plans[0]) => isYearly ? plan.yearlyPrice : plan.monthlyPrice
  const currentPeriod = isYearly ? '/year' : '/month'

  return (
    <div className="min-h-full pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-3">Simple, Transparent Pricing</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your dream exploration journey
          </p>
          
          {/* Toggle Switch */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-300 to-pink-300 dark:from-rose-900/30 dark:to-pink-900/30 p-1.5 rounded-full shadow-lg">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  !isYearly
                    ? 'bg-white text-rose-600 shadow-md'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  isYearly
                    ? 'bg-white text-rose-600 shadow-md'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl transition-all flex flex-col ${plan.highlighted
                  ? 'ring-2 ring-violet-500/50 dark:ring-violet-500/40 bg-gradient-to-b from-violet-600 via-violet-700 to-slate-950 dark:from-violet-950/40 dark:to-slate-950/40 border border-violet-300 dark:border-violet-500/30 scale-100 md:scale-105 shadow-xl'
                  : 'border border-slate-300 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:shadow-lg dark:hover:bg-slate-900/50'
                  }`}
              >
                <div className="p-5 flex flex-col flex-grow">
                  {plan.highlighted && (
                    <div className="absolute -top-3 right-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-semibold shadow-lg">
                        Most Loved
                      </span>
                    </div>
                  )}

                  <h3 className={`text-base font-semibold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{plan.name}</h3>
                  <p className={`text-xs mb-2 ${plan.highlighted ? 'text-violet-100' : 'text-slate-600 dark:text-slate-400'}`}>{plan.description}</p>

                  <div className="mb-3">
                    <span className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-slate-50'}`}>${currentPrice(plan)}</span>
                    {currentPrice(plan) > 0 && <span className={`text-xs ml-1 ${plan.highlighted ? 'text-violet-200' : 'text-slate-600 dark:text-slate-400'}`}>{currentPeriod}</span>}
                  </div>

                  <div className="space-y-1.5 mb-3 flex-grow">
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-2">
                        <Check size={12} className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        <span className={`text-xs font-medium ${plan.highlighted ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-auto">
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-xs transition-all ${plan.highlighted
                        ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:border-violet-400/60'
                        }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! The Dreamer plan is completely free with unlimited features for basic dream journaling.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data is safe. You can download your dream journal anytime, even after cancellation.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee on all paid plans. No questions asked.',
              },
              {
                q: 'Can I get a custom plan?',
                a: 'Absolutely! For organizations and teams, we offer custom pricing. Contact us to learn more.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="group p-4 rounded-lg border border-slate-300 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:shadow-md dark:hover:bg-slate-900/50 transition-all cursor-pointer">
                <summary className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-500 dark:text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-slate-700 dark:text-slate-400 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl border border-violet-300 dark:border-violet-500/30 bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-950/40 dark:to-slate-950/40 text-center shadow-xl">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Ready to start your journey?</h3>
          <p className="text-slate-700 dark:text-slate-400 mb-6">Join thousands of dreamers exploring the wisdom of their subconscious.</p>
          <button className="px-6 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30 transition-all">
            Start Free Today
          </button>
        </div>
      </div>
    </div>
  )
}
