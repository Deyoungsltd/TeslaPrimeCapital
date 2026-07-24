/**
 * TeslaPrimeCapital — Leadership Section (`LeadershipSection.tsx`)
 *
 * Ships complete but identity-free: the portrait frame, name, title, and
 * signature line are all CMS slots, so the office personalizes the section
 * from the Brand Library without a code change — and no fabricated person is
 * ever invented to fill the frame. The governance copy beneath the identity
 * is brand-controlled and describes the platform's real custody mechanics.
 */
import React from 'react';
import { ManagedImage } from '@/components/atoms/ManagedImage';
import { ManagedText } from '@/components/atoms/ManagedText';

const CUSTODY_POINTS = [
  {
    title: 'Signature-bound releases',
    body: 'No withdrawal leaves the platform without a named finance attestation and a TOTP challenge — regardless of amount.',
  },
  {
    title: 'Doctrine over discretion',
    body: 'Rates, terms, and settlement cadence are fixed at allocation. This office sets policy; the engine enforces it without exception.',
  },
];

export const LeadershipSection: React.FC = () => {
  return (
    <section className="border-t border-[#1E2433] bg-[#080A0F]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-28 sm:px-12 sm:py-36 lg:grid-cols-[5fr_7fr] lg:gap-20">
        {/* Portrait frame */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#1E2433] bg-black shadow-tesla">
            <ManagedImage
              slotKey="leadership.portrait"
              alt="TeslaPrimeCapital executive leadership portrait"
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/80 via-transparent to-transparent" />
          </div>
          {/* Caption rail */}
          <div className="absolute -bottom-6 left-1/2 w-[86%] -translate-x-1/2 rounded-xl border border-[#1E2433] bg-[#0C0F16]/95 px-6 py-5 text-center shadow-tesla backdrop-blur-md">
            <ManagedText slotKey="leadership.name" as="h3" className="font-display text-xl font-medium tracking-tight text-white" />
            <ManagedText slotKey="leadership.title" as="div" className="mt-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] text-gray-500" />
          </div>
        </div>

        {/* Identity + doctrine */}
        <div className="pt-8 lg:pt-0">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              The Chair
            </span>
          </div>
          <h2 className="mt-7 font-display text-4xl font-medium leading-[1.06] tracking-tight text-white sm:text-5xl">
            Accountability has a seat, and it is occupied.
          </h2>
          <ManagedText
            slotKey="leadership.signature"
            as="p"
            className="mt-7 max-w-lg font-display text-xl font-medium italic leading-relaxed tracking-tight text-gray-200"
          />

          <div className="mt-12 space-y-7">
            {CUSTODY_POINTS.map((point) => (
              <div key={point.title} className="border-l border-[#1E2433] pl-6">
                <h3 className="text-[14px] font-semibold tracking-tight text-white">{point.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-400">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
