import React from 'react';
import { Search, Plus, HelpCircle, User, Sparkles, Flame, Video } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenGuideModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSeoModal?: () => void;
  onOpenAiStudioModal?: (tab?: 'music' | 'image' | 'video') => void;
  onOpenYouTubeViralModal?: () => void;
  lang?: 'ur' | 'en';
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenGuideModal,
  onOpenProfileModal,
  onOpenSeoModal,
  onOpenAiStudioModal,
  onOpenYouTubeViralModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-1.5 font-['Outfit']">
                Master<span className="text-orange-600">Reviews</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Verified Product Reviews & Direct Affiliate Deals
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-products-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, features, gadgets..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-sm transition-all outline-hidden text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Viral YouTube Growth Lab button */}
            {onOpenYouTubeViralModal && (
              <button
                id="open-youtube-viral-btn"
                onClick={onOpenYouTubeViralModal}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-red-500/25 group"
                title="Viral YouTube Title & Hook Crafter, 60s Shorts Scripts, AI Thumbnails & Channel Audit"
              >
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Viral YouTube</span>
                <span className="md:hidden">Viral</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-white text-[9px] font-extrabold uppercase">
                  Growth
                </span>
              </button>
            )}

            {/* AI Creative Studio button */}
            {onOpenAiStudioModal && (
              <button
                id="open-ai-studio-btn"
                onClick={() => onOpenAiStudioModal()}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 hover:from-orange-500/20 hover:via-rose-500/20 hover:to-amber-500/20 border border-orange-300 text-orange-900 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Veo Video Generation, Lyria Music & Gemini Image Editing"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="hidden md:inline">AI Studio</span>
                <span className="md:hidden">AI</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-orange-600 text-white text-[9px] font-bold">
                  Veo
                </span>
              </button>
            )}

            {/* Affiliate Marketing Roadmap Guide button */}
            <button
              id="open-guide-btn"
              onClick={onOpenGuideModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* SEO Center button */}
            {onOpenSeoModal && (
              <button
                id="open-seo-btn"
                onClick={onOpenSeoModal}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Google SEO & Product Rich Snippets"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">SEO</span>
              </button>
            )}

            {/* Creator Profile Edit button */}
            <button
              id="edit-profile-btn"
              onClick={onOpenProfileModal}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Edit Creator Profile & Social Links"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Add Product button */}
            <button
              id="add-product-btn"
              onClick={onOpenAddModal}
              className="px-3 sm:px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Add Product</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="mobile-search-products-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden text-slate-800"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
