import React from 'react';

export const TrustStrip: React.FC = () => {
  const logos = [
    { name: 'Aura Studio', category: 'Creative' },
    { name: 'Linear', category: 'Engineering' },
    { name: 'Notion', category: 'Productivity' },
    { name: 'Vercel', category: 'Platform' },
    { name: 'Stripe', category: 'Fintech' },
    { name: 'Figma', category: 'Design' },
  ];

  return (
    <section className="py-10 border-y border-slate-200/70 bg-white/40 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">
          Trusted by modern founders, designers & teams at
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
          {logos.map((item) => (
            <div key={item.name} className="flex items-center gap-2 select-none group">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 group-hover:bg-indigo-600 transition-colors" />
              <span className="text-base sm:text-lg font-bold font-display tracking-tight text-slate-600 group-hover:text-slate-900 transition-colors">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
