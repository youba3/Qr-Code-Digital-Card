import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: 'Samantha Reed',
      role: 'Head of Growth',
      company: 'Northwind Ventures',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      content:
        'I went to a 3-day tech conference in San Francisco with just my QR Code Digital Card lock screen QR. Over 80 people scanned it, and every single one saved my direct contact in seconds without typo errors.',
      rating: 5,
    },
    {
      name: 'David K. Liu',
      role: 'Founder & Principal Architect',
      company: 'Spatial Design Lab',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content:
        'The vertical format looks so much more modern than traditional horizontal cards on mobile screens. Being able to update my portfolio link without printing new cards is a game changer.',
      rating: 5,
    },
    {
      name: 'Priya Patel',
      role: 'Creative Director',
      company: 'Aura Studio',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content:
        'The ability to select which social media icons appear on the physical card versus the web profile gives us complete control over our corporate brand guidelines. Outstanding craftsmanship.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 sm:py-28" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {t('testimonials.eyebrow')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900 mt-3">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 text-base text-slate-600">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars Row */}
                <div className="flex items-center gap-1 text-amber-400 mb-5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold font-display text-slate-900 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {item.role}, <span className="font-semibold text-slate-700">{item.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
