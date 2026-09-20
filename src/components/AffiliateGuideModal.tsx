import React, { useState } from 'react';
import { AFFILIATE_GUIDE_STEPS } from '../data/initialData';
import { 
  X, 
  HelpCircle, 
  DollarSign, 
  CheckCircle2, 
  Share2, 
  Video, 
  Sparkles, 
  TrendingUp, 
  Building2,
  ExternalLink
} from 'lucide-react';

interface AffiliateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ur' | 'en';
}

export const AffiliateGuideModal: React.FC<AffiliateGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'steps' | 'platforms' | 'tips'>('steps');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 via-orange-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl font-['Outfit']">
                Affiliate Marketing Success Roadmap
              </h3>
              <p className="text-xs text-slate-600">
                From finding top products to generating consistent commissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'steps'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. 5 Core Steps
          </button>

          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'platforms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Affiliate Networks
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tips'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3. Traffic & Video Secrets
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1 text-slate-700">
          
          {/* TAB 1: 5 Core Steps */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-orange-50/80 border border-orange-200/80 rounded-2xl text-xs leading-relaxed text-orange-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Key Strategy:</strong>{' '}
                  You do NOT need to buy inventory or manage order fulfillment. You simply publish honest reviews, video showcases, and affiliate links; the marketplace handles processing, packaging, customer support, and shipping!
                </div>
              </div>

              <div className="space-y-3">
                {AFFILIATE_GUIDE_STEPS.map((s) => (
                  <div 
                    key={s.step} 
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                        {s.step}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {s.englishTitle || s.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {s.desc}
                    </p>
                    <div className="pl-8 pt-1 text-[11px] text-amber-800 font-medium">
                      💡 {s.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Affiliate Platforms */}
          {activeTab === 'platforms' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Top verified affiliate networks you can join for free today to start monetizing:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Amazon */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Amazon Associates</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">1% - 10% Commission</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The world's largest e-commerce platform. Best for electronics, everyday gadgets, smart home devices, and books.
                  </p>
                  <a 
                    href="https://affiliate-program.amazon.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline pt-1"
                  >
                    <span>Join Amazon Associates</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Daraz */}
                <div className="p-4 rounded-2xl border border-orange-200 bg-orange-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Daraz Affiliate Program</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-200 text-orange-900 rounded">Up to 11% Commission</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The leading marketplace across South Asia with local currency payouts, bank transfers, and mobile wallet options.
                  </p>
                  <a 
                    href="https://www.daraz.pk/affiliate-program/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-800 hover:underline pt-1"
                  >
                    <span>Join Daraz Affiliate</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* AliExpress */}
                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">AliExpress Portals</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-200 text-rose-900 rounded">3% - 9% Commission</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Great for viral trending gadgets, dropshipping accessories, and direct-from-factory budget electronics.
                  </p>
                  <a 
                    href="https://portals.aliexpress.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:underline pt-1"
                  >
                    <span>Join AliExpress Portals</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* TikTok Shop / ClickBank */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">TikTok Shop & ClickBank</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200 text-purple-900 rounded">10% - 50% Commission</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ideal for short-form video creators tagging in-feed products, software trials, digital guides, and health supplements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Traffic & Video Secrets */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                How to Drive Qualified Buyer Traffic
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500" />
                    <span>1. Create Problem-Solving Short Videos</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Instead of telling people to "Buy this now", demonstrate solving a real problem. For example: "If your wrist hurts after hours on your laptop, here is how a vertical ergonomic mouse fixes it." Viewers naturally ask for your link!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>2. The "Link in Bio" Strategy</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Place your Master Reviews storefront URL in your TikTok, Instagram, and YouTube profile bio. Conclude your videos with: "Check the top deal link in my bio!"
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>3. Highlight Honest Pros & Cons</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Always point out 1-2 realistic downsides or tradeoffs alongside the benefits. When buyers see balanced honesty, trust spikes and conversion rates increase significantly.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Use Master Reviews as your central affiliate storefront & deal showcase
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
