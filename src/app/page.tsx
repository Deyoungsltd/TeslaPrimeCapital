import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';
import { HeroSwiper } from '@/components/organisms/HeroSwiper';
import { Button } from '@/components/atoms/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white pb-24">
      
      {/* 1. Exact Top Navbar (`IMG_7582.jpeg` Top Match) */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#1E2433] bg-[#080A0F]/95 px-6 sm:px-12 backdrop-blur-md">
        <a href="/" className="flex items-center gap-3">
          <span className="text-2xl font-extrabold tracking-[0.35em] text-white uppercase font-sans">
            T E S L A
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-300 font-sans">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="#portfolios" className="hover:text-white transition">About</a>
          <a href="#portfolios" className="hover:text-white transition">Our Solutions ▾</a>
          <a href="#portfolios" className="hover:text-white transition">FAQ</a>
          <a href="#portfolios" className="hover:text-white transition">Contact</a>
          <a href="/dashboard" className="hover:text-white transition">Tracking</a>
        </nav>

        <div className="flex items-center gap-4 font-sans">
          <a href="/dashboard">
            <Button variant="glass-white" size="sm" className="shadow-sm">
              Track Order
            </Button>
          </a>
          <a href="/login">
            <Button variant="tesla-red" size="sm" className="shadow-red-glow">
              Login
            </Button>
          </a>
        </div>
      </header>

      {/* 2. Interactive Touch-Swipeable Vehicle Carousel (`IMG_7587 Model 3 & IMG_7588 Cybertruck Swiper Match!`) */}
      <HeroSwiper />

      {/* 3. Investment Plans Grid (`IMG_7582.jpeg` Exact Match with RED buttons instead of blue!) */}
      <section id="portfolios" className="mx-auto max-w-7xl px-6 py-24 text-left font-sans">
        <div className="mb-14 text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Investment Plans
          </h2>
          <p className="text-sm font-normal text-gray-300 sm:text-base">
            Choose the plan that fits your Investment goals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {INVESTMENT_PLANS_CONFIG.map((plan) => {
            const minStr = parseFloat(plan.minDepositUsd).toLocaleString();
            const profitLabel = plan.profitText || `${plan.termDays} Days Term`;
            const featList = plan.features && plan.features.length > 0 ? plan.features : ['Portfolio Access', 'Investment Dashboard', 'Email Support'];

            return (
              <div
                key={plan.planId}
                className="flex flex-col justify-between rounded-3xl border border-[#1E2433] bg-[#111520] shadow-tesla transition-all duration-300 hover:border-red-500/60 group overflow-hidden"
              >
                {/* Car Banner Header (`IMG_7582.jpeg` car header match with bulletproof fallback!) */}
                <div className="relative h-48 w-full overflow-hidden bg-black">
                  <img
                    src={plan.imageUrl || '/branding/car-bronze.jpg'}
                    alt={plan.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/20 to-transparent" />
                  
                  <span className="absolute top-3 right-3 rounded-lg border border-white/20 bg-black/80 px-3 py-1 font-mono text-xs font-bold text-red-400 backdrop-blur-md shadow">
                    {profitLabel}
                  </span>
                </div>

                {/* Card Body (`Bronze / Silver / Gold / Diamond` match) */}
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between bg-[#111520]">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white font-sans group-hover:text-[#EF4444] transition-colors">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1E2433]/80">
                    <div className="text-2xl font-extrabold text-white tracking-tight font-sans">
                      ${minStr}
                    </div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mt-0.5">
                      minimum investment
                    </span>
                  </div>

                  {/* Checkmarks (`IMG_7582.jpeg` match!) */}
                  <div className="space-y-3 pt-2 font-sans text-xs text-gray-200">
                    {featList.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/40">
                          ✔
                        </span>
                        <span className="font-semibold">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Red `[ Get Started ]` Button (`IMG_7582` match with blue changed to RED!) */}
                  <div className="pt-4">
                    <a href={`/register?planId=${plan.planId}`} className="block w-full">
                      <Button variant="tesla-red" size="lg" className="w-full py-4 text-xs tracking-[0.2em] shadow-red-glow group-hover:scale-[1.02]">
                        Get Started →
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Current Offers & Inventory Section (`IMG_7589.png` match) */}
      <section className="mx-auto max-w-7xl px-6 py-20 font-sans space-y-12">
        <div className="rounded-3xl border border-[#1E2433] bg-[#111520] p-8 sm:p-12 shadow-tesla flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Current Offers</h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Explore limited-time offers on Tesla vehicles and structured high-yield allocations.
            </p>
            <div className="pt-2">
              <a href="/register?offer=limited">
                <Button variant="glass-white" size="lg" className="shadow-lg">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-56 rounded-2xl overflow-hidden border border-[#1E2433] bg-black">
            <img src="/branding/car-silver.jpg" alt="Current Offers" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="rounded-3xl border border-[#1E2433] bg-[#111520] p-8 sm:p-12 shadow-tesla flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Inventory</h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Find nearby vehicles available for immediate delivery and instant portfolio settlement.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="/register?inventory=new">
                <Button variant="glass-white" size="lg" className="shadow-lg">
                  New
                </Button>
              </a>
              <a href="/register?inventory=preowned">
                <Button variant="secondary" size="lg" className="shadow-sm border-white/20">
                  Pre-Owned
                </Button>
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-56 rounded-2xl overflow-hidden border border-[#1E2433] bg-black">
            <img src="/branding/car-gold.jpg" alt="Inventory" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* 5. Exact Footer (`IMG_7590.png` match) */}
      <footer className="mx-auto max-w-5xl px-6 pt-16 text-center text-xs font-semibold text-gray-400 font-sans space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          <span>Tesla &copy; 2026</span>
          <a href="/login" className="hover:text-white transition">Privacy &amp; Legal</a>
          <a href="/login" className="hover:text-white transition">Vehicle Recalls</a>
          <a href="/login" className="hover:text-white transition">News</a>
          <a href="/dashboard/investments" className="hover:text-white transition">Learn</a>
        </div>
        <p className="text-[11px] text-gray-500 font-normal leading-relaxed">
          Price reflects monthly subscription and capital allocation terms. All double-entry accounting ledgers maintain exact fixed-point `NUMERIC(20,8)` database accuracy.
        </p>
      </footer>

      {/* 6. Fixed Schedule a Drive Bar (`IMG_7587 / 7590` Bottom Bar Match) */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center max-w-md mx-auto gap-3">
        <a href="/dashboard/support" className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[#111520] text-white shadow-2xl hover:bg-[#1C2234] transition">
          💬
        </a>
        <a href="/register?schedule=testdrive" className="flex-1">
          <Button variant="glass-white" size="lg" className="w-full py-4 text-sm shadow-2xl backdrop-blur-xl flex items-center justify-center gap-2">
            <span>🚗</span>
            <span>Schedule a Drive Today</span>
          </Button>
        </a>
      </div>

    </div>
  );
}
