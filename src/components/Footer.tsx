import React from 'react';
import { CreatorProfile } from '../types';
import { ShieldCheck, Video, Send, Instagram, Facebook, Sparkles, RotateCcw } from 'lucide-react';

interface FooterProps {
  profile: CreatorProfile;
  onResetData: () => void;
  lang: 'ur' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ profile, onResetData, lang }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Creator Bio */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-['Outfit']">
                {profile.name}
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {profile.tagline}. {profile.bio}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              {profile.youtubeUrl && (
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <Video className="w-4 h-4" />
                </a>
              )}
              {profile.whatsappNumber && (
                <a
                  href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {profile.facebookUrl && (
                <a
                  href={profile.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Compliance & Trust */}
          <div className="md:col-span-6 space-y-3 bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Affiliate Transparency Disclosure</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile.disclosureText}
            </p>
            <p className="text-[11px] text-slate-400">
              Amazon, Daraz, and AliExpress are registered trademarks of their respective owners. We do not sell items directly; all checkouts occur on the official partner marketplace.
            </p>
          </div>
        </div>

        {/* Bottom copyright and reset */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </div>

          <button
            onClick={onResetData}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset store to original demo items"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Products</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
