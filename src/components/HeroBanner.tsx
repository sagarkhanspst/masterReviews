import React from 'react';
import { CreatorProfile } from '../types';
import { 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Video, 
  Tag, 
  Send,
  Sparkles,
  Share2,
  SlidersHorizontal,
  Flame,
  Play
} from 'lucide-react';

interface HeroBannerProps {
  profile: CreatorProfile;
  totalProducts: number;
  totalClicks: number;
  onOpenProfileModal: () => void;
  onOpenGuideModal: () => void;
  onOpenAiStudioModal?: (tab?: 'music' | 'image' | 'video') => void;
  onOpenYouTubeViralModal?: () => void;
  lang: 'ur' | 'en';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  profile,
  totalProducts,
  totalClicks,
  onOpenProfileModal,
  onOpenGuideModal,
  onOpenAiStudioModal,
  onOpenYouTubeViralModal,
  lang,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section className="relative bg-gradient-to-b from-orange-50/50 via-slate-50 to-white pt-8 pb-10 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left: Creator Profile & Pitch */}
          <div className="flex items-start gap-4 sm:gap-5 max-w-3xl">
            <div className="relative shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-orange-400/30"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs" title="Verified Reviewer">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight font-['Outfit']">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                  <ShieldCheck className="w-3 h-3 text-orange-600" />
                  Verified Affiliate Hub
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.handle}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {profile.tagline}
              </p>

              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>

              {/* Creator Social & Contact Links */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {profile.youtubeUrl && (
                  <a
                    href={profile.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-medium transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>YouTube Channel</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}

                {profile.tiktokUrl && (
                  <a
                    href={profile.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}

                {profile.whatsappNumber && (
                  <a
                    href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! I would like product advice from Master Reviews.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  onClick={onOpenProfileModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Edit Links</span>
                </button>

                <button
                  onClick={handleCopyStoreLink}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-slate-500" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Store Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Conversion Stats & Quick Guide Callout */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 font-['Outfit']">
                  {totalProducts} Items
                </div>
                <div className="text-xs text-slate-500">
                  Reviewed with Video Demos
                </div>
              </div>
              <div className="border-l border-slate-200 pl-4 ml-auto">
                <div className="text-xl font-bold text-emerald-600 font-['Outfit']">
                  {totalClicks}
                </div>
                <div className="text-xs text-slate-500">
                  Total Clicks
                </div>
              </div>
            </div>

            {/* In-banner YouTube Viral Growth Lab Callout */}
            {onOpenYouTubeViralModal && (
              <div 
                id="hero-youtube-viral-btn"
                onClick={onOpenYouTubeViralModal}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all p-3.5 rounded-2xl text-white text-xs cursor-pointer flex items-center justify-between gap-3 shadow-md shadow-red-600/20 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs backdrop-blur-xs">
                    <Flame className="w-4 h-4 text-amber-300 animate-pulse group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-white">
                        YouTube Viral Growth Lab
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-extrabold">
                        HOT
                      </span>
                    </div>
                    <span className="text-[11px] text-red-100 block">
                      Viral Hooks, 60s Shorts Scripts & Thumbnails
                    </span>
                  </div>
                </div>
                <span className="font-bold text-xs bg-white text-red-600 px-3 py-1 rounded-xl shadow-xs group-hover:translate-x-0.5 transition-transform shrink-0">
                  Go Viral →
                </span>
              </div>
            )}

            {/* In-banner AI Studio Callout */}
            {onOpenAiStudioModal && (
              <div 
                id="hero-ai-studio-btn"
                onClick={() => onOpenAiStudioModal()}
                className="bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 hover:from-orange-500/15 hover:via-rose-500/15 hover:to-amber-500/15 transition-all p-3 rounded-xl border border-orange-300 text-xs cursor-pointer flex items-center justify-between gap-3 text-orange-950 shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900">
                      AI Creative Studio
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Veo Videos, Lyria Music, Gemini Photos
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Create Media →
                </span>
              </div>
            )}

            {/* In-banner Quick Tip */}
            <div 
              onClick={onOpenGuideModal}
              className="bg-amber-50/80 hover:bg-amber-100/70 transition-colors p-3 rounded-xl border border-amber-200/80 text-xs cursor-pointer flex items-center justify-between gap-3 text-amber-900"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  5 Golden Steps to Grow Your Affiliate Business
                </span>
              </div>
              <span className="font-semibold underline shrink-0">
                Read Guide →
              </span>
            </div>
          </div>

        </div>

        {/* Affiliate Disclosure bar */}
        <div className="mt-6 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between gap-4">
          <p className="line-clamp-1 italic">
            🛡️ {profile.disclosureText}
          </p>
          <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            FTC Compliant
          </span>
        </div>
      </div>
    </section>
  );
};
