import React, { useState } from 'react';
import { Product, CreatorProfile } from '../types';
import { 
  X, 
  Flame, 
  Sparkles, 
  Copy, 
  Check, 
  TrendingUp, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Tag, 
  Award, 
  Play, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight, 
  Eye, 
  AlertCircle,
  Clock,
  Layers,
  Zap,
  Target,
  ChevronRight,
  Download
} from 'lucide-react';

interface YouTubeViralModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  profile: CreatorProfile;
  onUpdateProfile?: (profile: CreatorProfile) => void;
  onApplyThumbnailToProduct?: (productId: string, imageUrl: string) => void;
  onOpenAiStudio?: (tab: 'music' | 'image' | 'video', product?: Product) => void;
}

type TabType = 'titles' | 'shorts' | 'thumbnails' | 'audit' | 'seo' | 'embed';

export const YouTubeViralModal: React.FC<YouTubeViralModalProps> = ({
  isOpen,
  onClose,
  products,
  profile,
  onUpdateProfile,
  onApplyThumbnailToProduct,
  onOpenAiStudio,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>('titles');

  // Input States
  const [channelName, setChannelName] = useState(profile.name || 'Master Reviews');
  const [channelHandle, setChannelHandle] = useState(profile.handle || '@masterreviews');
  const [youtubeLink, setYoutubeLink] = useState(profile.youtubeUrl || 'https://youtube.com');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customTopic, setCustomTopic] = useState('');
  const [niche, setNiche] = useState('Tech, Gadgets & Affiliate Deals');
  const [styleTone, setStyleTone] = useState('High-Energy Curiosity Gap');
  const [subscriberGoal, setSubscriberGoal] = useState('10,000 to 100,000 Subscribers');

  // Generation States
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results State
  const [titleResults, setTitleResults] = useState<any>(null);
  const [shortsResults, setShortsResults] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [seoResults, setSeoResults] = useState<any>(null);

  // Thumbnail Generator State
  const [thumbPrompt, setThumbPrompt] = useState('');
  const [thumbOverlayText, setThumbOverlayText] = useState('DON\'T BUY THIS! 🚨');
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [generatedThumbBase64, setGeneratedThumbBase64] = useState<string | null>(null);
  const [thumbError, setThumbError] = useState<string | null>(null);

  // Current active topic
  const currentProduct = products.find((p) => p.id === selectedProductId);
  const activeTopic = customTopic.trim() || currentProduct?.title || 'Ultra Wireless Noise-Cancelling Headphones Pro';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // API Call Handler
  const handleGenerate = async (targetAction: TabType) => {
    if (targetAction === 'thumbnails' || targetAction === 'embed') return;

    setIsLoading(true);
    setErrorMessage(null);

    const actionMap: Record<string, string> = {
      titles: 'viral-titles',
      shorts: 'viral-shorts-script',
      audit: 'channel-audit',
      seo: 'seo-tags',
    };

    try {
      const res = await fetch('/api/ai/youtube-viral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionMap[targetAction],
          channelName,
          niche,
          topic: activeTopic,
          style: styleTone,
          currentSubscribers: 'Growing Channel',
          goal: subscriberGoal,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate YouTube viral content');
      }

      if (targetAction === 'titles') {
        setTitleResults(json.data);
        if (json.data?.titles?.[0]?.thumbnailIdea) {
          setThumbPrompt(
            `YouTube thumbnail 16:9 photographic composition, ${json.data.titles[0].thumbnailIdea}, high contrast, intense rim lighting, 4k studio lighting, clear product focus`
          );
        }
      } else if (targetAction === 'shorts') {
        setShortsResults(json.data);
      } else if (targetAction === 'audit') {
        setAuditResults(json.data);
      } else if (targetAction === 'seo') {
        setSeoResults(json.data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Thumbnail Image Generation Handler
  const handleGenerateThumbnail = async () => {
    const promptToUse = thumbPrompt || `Photorealistic YouTube thumbnail, 16:9, shocked reviewer face on the right holding ${activeTopic}, vibrant neon rim lighting, bold contrast, professional studio background, hyper-detailed`;
    setIsGeneratingThumb(true);
    setThumbError(null);

    try {
      const res = await fetch('/api/ai/create-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio: '16:9',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create thumbnail with AI');
      }

      if (json.imageBase64) {
        const fullUri = json.imageBase64.startsWith('data:') 
          ? json.imageBase64 
          : `data:${json.mimeType || 'image/png'};base64,${json.imageBase64}`;
        setGeneratedThumbBase64(fullUri);
      } else {
        throw new Error('No image was returned from the model.');
      }
    } catch (err: any) {
      setThumbError(err.message || 'Could not generate thumbnail.');
    } finally {
      setIsGeneratingThumb(false);
    }
  };

  const handleSaveChannelProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        name: channelName,
        handle: channelHandle,
        youtubeUrl: youtubeLink,
      });
      alert('YouTube Channel details synced successfully with your storefront!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 text-slate-100 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-700/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-['Outfit']">
                  YouTube Viral Growth Lab
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  AI Viral Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data-driven formulas to get 10k–100k views, skyrocket CTR, and trigger the YouTube Algorithm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Controls & Topic Selector Strip */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-5 sm:px-6 py-3 flex flex-wrap items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Channel:
            </span>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Your Channel Name"
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs w-36 sm:w-44 focus:border-red-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Focus Video / Product:
            </span>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomTopic('');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs flex-1 max-w-xs focus:border-red-500 outline-hidden"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price})
                </option>
              ))}
              <option value="custom">✏️ Enter Custom Topic...</option>
            </select>
          </div>

          {(selectedProductId === 'custom' || customTopic) && (
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Type custom video topic (e.g. Budget Smartwatch vs Apple Watch)"
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs flex-1 min-w-[180px] focus:border-red-500 outline-hidden"
            />
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400 text-[10px] font-semibold">Style:</span>
            <select
              value={styleTone}
              onChange={(e) => setStyleTone(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:border-red-500 outline-hidden"
            >
              <option value="High-Energy Curiosity Gap">🔥 Curiosity & High Energy</option>
              <option value="Extreme Price Comparison ($20 vs $500)">⚖️ Extreme Comparison</option>
              <option value="Brutal Honesty / Warning">⚠️ Brutal Honesty Warning</option>
              <option value="MrBeast Fast-Paced Story">⚡ Fast-Paced Retention</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'titles'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>Viral Titles & Hooks</span>
          </button>

          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shorts'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span>60s Shorts Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('thumbnails')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'thumbnails'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>AI Thumbnail Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>30-Day Growth Sprint</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seo'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Tag className="w-4 h-4 text-cyan-400" />
            <span>SEO & Tag Machine</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'embed'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Play className="w-4 h-4 text-indigo-400" />
            <span>Channel Spotlight & Embed</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-slate-200">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: VIRAL TITLES & HOOKS */}
          {/* ============================================================ */}
          {activeTab === 'titles' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 p-4 sm:p-5 rounded-2xl border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>High-CTR Viral Titles & 3-Second Hooks</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
                      Algorithm Proven
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    YouTube's algorithm prioritizes Click-Through-Rate (CTR) and first 30-second retention. These formulas trigger FOMO, price curiosity, and instant hook retention.
                  </p>
                </div>

                <button
                  onClick={() => handleGenerate('titles')}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Viral Formulas...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4" />
                      <span>Generate Viral Titles & Hooks</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title Cards Grid */}
              {titleResults?.titles ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Showing 5 high-converting formulas for: <strong className="text-slate-200">"{activeTopic}"</strong></span>
                    {titleResults.strategyTip && (
                      <span className="text-amber-400 italic">💡 {titleResults.strategyTip}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {titleResults.titles.map((item: any, idx: number) => (
                      <div 
                        key={idx}
                        className="bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-700/80 hover:border-red-500/40 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs font-bold">
                              #{idx + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700 text-slate-300">
                              {item.formulaType}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Predicted CTR: {item.ctrScore}%</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(item.title, `title-${idx}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedKey === `title-${idx}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Title</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title text */}
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          {item.title}
                        </div>

                        {/* Curiosity explanation */}
                        <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <strong className="text-slate-300">Psychology Trigger:</strong> {item.curiosityTrigger}
                        </div>

                        {/* 3-sec verbal hook */}
                        <div className="bg-red-950/30 p-3 rounded-xl border border-red-500/20 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-red-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5" />
                              First 3 Seconds Spoken Hook (Never let them click away)
                            </span>
                            <button
                              onClick={() => copyToClipboard(item.hookScript, `hook-${idx}`)}
                              className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Hook</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-200 italic">
                            {item.hookScript}
                          </p>
                        </div>

                        {/* Thumbnail synergy */}
                        <div className="text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-700/50">
                          <span className="truncate max-w-xl">
                            <strong>Thumbnail Concept:</strong> {item.thumbnailIdea}
                          </span>
                          <button
                            onClick={() => {
                              setThumbPrompt(`YouTube thumbnail 16:9 photographic composition, ${item.thumbnailIdea}, high contrast, intense rim lighting, 4k studio lighting`);
                              setActiveTab('thumbnails');
                            }}
                            className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Design Thumbnail →</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Ready to generate viral titles for "{activeTopic}"?
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click the button above to generate 5 high-converting YouTube titles with predicted CTR scores and word-for-word 3-second hook scripts.
                  </p>
                  <button
                    onClick={() => handleGenerate('titles')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Generate Titles Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: 60S VIRAL SHORTS SCRIPT BLUEPRINT */}
          {/* ============================================================ */}
          {activeTab === 'shorts' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-purple-950/40 p-4 sm:p-5 rounded-2xl border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>60-Second Viral YouTube Shorts & Reels Blueprint</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                      100%+ Loop Retention
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Engineered with rapid cuts, sound effect cues, text overlays, and a seamless loop bridge so viewers watch the Short more than once.
                  </p>
                </div>

                <button
                  onClick={() => handleGenerate('shorts')}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scripting Viral Short...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Generate Shorts Script</span>
                    </>
                  )}
                </button>
              </div>

              {shortsResults ? (
                <div className="space-y-5">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {shortsResults.title}
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        Target Duration: <span className="text-slate-200">{shortsResults.targetLength}</span> • Target Retention: <span className="text-emerald-400 font-bold">{shortsResults.estimatedRetention}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const fullScript = `TITLE: ${shortsResults.title}\n\n[HOOK: ${shortsResults.hook?.timestamp}]\nVisual: ${shortsResults.hook?.visualCue}\nAudio: ${shortsResults.hook?.spokenVoiceover}\nText: ${shortsResults.hook?.textOnScreen}\n\n` +
                          shortsResults.scenes?.map((s: any) => `[${s.section} - ${s.timestamp}]\nVisual: ${s.visualCue}\nAudio: ${s.spokenVoiceover}\nText: ${s.textOnScreen}\nSFX: ${s.soundEffectCue}\n`).join('\n') +
                          `\n[LOOP CLOSER - ${shortsResults.loopCloser?.timestamp}]\nAudio: ${shortsResults.loopCloser?.spokenVoiceover}\nLoop Bridge: ${shortsResults.loopCloser?.loopBridgeText}`;
                        copyToClipboard(fullScript, 'full-shorts-script');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'full-shorts-script' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Full Script!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Complete Script</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 1. 0-3s Hook Section */}
                  {shortsResults.hook && (
                    <div className="bg-red-950/30 p-4 rounded-2xl border border-red-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                          ⚡ 0:00 - 0:03 THE HOOK (Scroll-Stopper)
                        </span>
                        <span className="text-xs text-red-300 font-mono">
                          {shortsResults.hook.soundEffectCue}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                            🎬 Camera & Visual Action:
                          </span>
                          <p className="text-slate-200 font-medium">
                            {shortsResults.hook.visualCue}
                          </p>
                        </div>
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                            🗣️ Spoken Voiceover Script:
                          </span>
                          <p className="text-white font-bold text-sm italic">
                            {shortsResults.hook.spokenVoiceover}
                          </p>
                        </div>
                      </div>
                      <div className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        📺 Bold Subtitle Caption on Screen: "{shortsResults.hook.textOnScreen}"
                      </div>
                    </div>
                  )}

                  {/* 2. Middle Scenes */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Step-by-Step Pacing Scenes (0:03 - 0:50)
                    </h4>
                    {shortsResults.scenes?.map((scene: any, idx: number) => (
                      <div 
                        key={idx}
                        className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-slate-700 text-slate-300 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{scene.section}</span>
                            <span className="text-slate-400 font-mono">({scene.timestamp})</span>
                          </span>
                          <span className="text-[11px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded-md">
                            SFX: {scene.soundEffectCue}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Visual:</span>
                            <p className="text-slate-300">{scene.visualCue}</p>
                          </div>
                          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Voiceover:</span>
                            <p className="text-white font-medium italic">{scene.spokenVoiceover}</p>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400">
                          Text on Screen: <span className="font-semibold text-amber-300">"{scene.textOnScreen}"</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3. Loop Closer */}
                  {shortsResults.loopCloser && (
                    <div className="bg-purple-950/30 p-4 rounded-2xl border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-bold">
                          🔁 0:50 - 0:55 INFINITE LOOP CLOSER
                        </span>
                        <span className="text-xs text-purple-300 font-mono">
                          {shortsResults.loopCloser.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-white italic font-medium">
                        {shortsResults.loopCloser.spokenVoiceover}
                      </p>
                      <div className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                        🔄 Loop Bridge Secret: {shortsResults.loopCloser.loopBridgeText}
                      </div>
                    </div>
                  )}

                  {/* Viral Checklist */}
                  {shortsResults.viralChecklist && (
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Director's Viral Execution Checklist</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 pl-5 list-disc">
                        {shortsResults.viralChecklist.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Need a high-retention Short for "{activeTopic}"?
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Generate an exact second-by-second script with sound cues, camera directions, spoken script, and the loop closer that makes Shorts go viral.
                  </p>
                  <button
                    onClick={() => handleGenerate('shorts')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Generate Shorts Script Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: VIRAL AI THUMBNAIL STUDIO */}
          {/* ============================================================ */}
          {activeTab === 'thumbnails' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/40 p-4 sm:p-5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Viral AI Thumbnail Studio (16:9)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                      Gemini 16:9 Image
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Thumbnails account for 90% of a video's success. High contrast, expressive faces, vivid rim lighting, and clean 3-word overlays guarantee 10%+ CTR.
                  </p>
                </div>

                <button
                  onClick={handleGenerateThumbnail}
                  disabled={isGeneratingThumb}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isGeneratingThumb ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Thumbnail...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Generate 16:9 Thumbnail</span>
                    </>
                  )}
                </button>
              </div>

              {thumbError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{thumbError}</span>
                </div>
              )}

              {/* Thumbnail Customizer Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left: Controls & Prompts */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Thumbnail Visual Prompt</span>
                      <span className="text-[10px] text-amber-400">Optimized for high CTR</span>
                    </label>
                    <textarea
                      rows={3}
                      value={thumbPrompt}
                      onChange={(e) => setThumbPrompt(e.target.value)}
                      placeholder={`Photorealistic YouTube thumbnail, 16:9, shocked reviewer face on the right holding ${activeTopic}, vibrant neon rim lighting, bold contrast, professional studio background, hyper-detailed`}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Thumbnail Bold Text Overlay (Max 3-4 words for mobile readability)
                    </label>
                    <input
                      type="text"
                      value={thumbOverlayText}
                      onChange={(e) => setThumbOverlayText(e.target.value)}
                      placeholder="DON'T BUY THIS! 🚨"
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  {/* Preset High-CTR Styles */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Click to load proven YouTube Thumbnail Styles:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setThumbPrompt(`Photorealistic YouTube thumbnail, 16:9, split screen comparison, left side budget gadget with red cross, right side premium gadget with glowing gold halo, dramatic studio lighting, 4k`);
                          setThumbOverlayText('$20 vs $500! 🤯');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs transition-colors"
                      >
                        <div className="font-bold text-white">$20 vs $500 Battle</div>
                        <div className="text-[10px] text-slate-400">Side-by-side comparison</div>
                      </button>

                      <button
                        onClick={() => {
                          setThumbPrompt(`Photorealistic YouTube thumbnail, 16:9, close-up shocked face pointing at ${activeTopic} with smoke and electrical sparks, warning hazard signs, high dynamic range`);
                          setThumbOverlayText('HUGE MISTAKE? ❌');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs transition-colors"
                      >
                        <div className="font-bold text-white">Shock & Warning</div>
                        <div className="text-[10px] text-slate-400">High curiosity & danger</div>
                      </button>

                      <button
                        onClick={() => {
                          setThumbPrompt(`Photorealistic YouTube thumbnail, 16:9, reviewer holding ${activeTopic} in front of camera with 5 glowing gold stars and a certified green stamp, clean tech background`);
                          setThumbOverlayText('ACTUALLY 10/10! ⭐');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs transition-colors"
                      >
                        <div className="font-bold text-white">Ultimate 10/10 Winner</div>
                        <div className="text-[10px] text-slate-400">High authority & praise</div>
                      </button>

                      <button
                        onClick={() => {
                          setThumbPrompt(`Photorealistic YouTube thumbnail, 16:9, reviewer inspecting gadget with magnifying glass, hidden red arrow pointing at secret feature, dark cinematic tech background`);
                          setThumbOverlayText('SECRET FEATURE! 🔍');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs transition-colors"
                      >
                        <div className="font-bold text-white">Secret Knowledge Hack</div>
                        <div className="text-[10px] text-slate-400">Curiosity arrow & circle</div>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      💡 Thumbnail Psychology Rules:
                    </span>
                    <p className="text-[11px] text-slate-400">
                      1. Never repeat the video title in the thumbnail text.<br/>
                      2. Zoom in so it's readable on small mobile screens.<br/>
                      3. Use high-contrast colors (yellow, neon green, red) against dark backgrounds.
                    </p>
                  </div>
                </div>

                {/* Right: Live YouTube Feed Mockup Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-red-500" />
                      <span>Live YouTube Feed Simulator (Desktop & Mobile)</span>
                    </span>
                    {generatedThumbBase64 && (
                      <span className="text-emerald-400 text-[11px]">✓ Generated</span>
                    )}
                  </div>

                  {/* YouTube Card Simulation */}
                  <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 shadow-xl space-y-2.5">
                    {/* 16:9 Image container */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group">
                      {generatedThumbBase64 ? (
                        <img 
                          src={generatedThumbBase64} 
                          alt="Generated YouTube Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <ImageIcon className="w-10 h-10 text-slate-700 mx-auto" />
                          <div className="text-xs text-slate-500 font-medium">
                            Thumbnail preview will display here (16:9 format)
                          </div>
                          <button
                            onClick={handleGenerateThumbnail}
                            disabled={isGeneratingThumb}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
                          >
                            Generate Thumbnail Now
                          </button>
                        </div>
                      )}

                      {/* Bold Text Overlay Simulation */}
                      {thumbOverlayText && (
                        <div className="absolute top-3 left-3 bg-red-600/90 text-white font-extrabold text-sm sm:text-base px-2.5 py-1 rounded-lg shadow-2xl tracking-wider uppercase border border-white/20 transform -rotate-2 select-none">
                          {thumbOverlayText}
                        </div>
                      )}

                      {/* Video Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white font-semibold text-[11px] px-1.5 py-0.5 rounded-md">
                        10:24
                      </div>
                    </div>

                    {/* YouTube Video Metadata Simulation */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <img 
                        src={profile.avatarUrl} 
                        alt={channelName} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="font-bold text-white text-xs truncate">
                          {titleResults?.titles?.[0]?.title || `Don't Buy ${activeTopic} Until You Watch This! (Honest Truth)`}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>{channelName}</span>
                          <span>•</span>
                          <span>128K views</span>
                          <span>•</span>
                          <span>2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions for generated thumbnail */}
                  {generatedThumbBase64 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={generatedThumbBase64}
                        download={`youtube-thumbnail-${Date.now()}.png`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download 16:9 Thumbnail</span>
                      </a>

                      {selectedProductId && onApplyThumbnailToProduct && (
                        <button
                          onClick={() => {
                            onApplyThumbnailToProduct(selectedProductId, generatedThumbBase64);
                            alert('Applied thumbnail to product gallery!');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Attach to Store Product</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: 30-DAY CHANNEL VIRAL AUDIT & GROWTH SPRINT */}
          {/* ============================================================ */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 p-4 sm:p-5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>30-Day Channel Viral Audit & Growth Sprint</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-bold">
                      Roadmap to 10k–100k Subs
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Tailored algorithm strategy for <strong className="text-white">{channelName}</strong> in the <strong className="text-white">{niche}</strong> niche.
                  </p>
                </div>

                <button
                  onClick={() => handleGenerate('audit')}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Auditing Channel Strategy...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Run Channel Viral Audit</span>
                    </>
                  )}
                </button>
              </div>

              {auditResults ? (
                <div className="space-y-6">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Channel Viral Health Score
                      </span>
                      <div className="text-2xl font-extrabold text-emerald-400 flex items-center gap-2 font-['Outfit']">
                        <span>{auditResults.viralHealthScore}/100</span>
                        <Award className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">High upside in affiliate commerce</p>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Target CTR Benchmark
                      </span>
                      <div className="text-xl font-bold text-white font-['Outfit']">
                        {auditResults.algorithmFormula?.targetCTR || '8.5% - 12%'}
                      </div>
                      <p className="text-[11px] text-slate-400">Algorithm pushes videos over 8%</p>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Target Retention (AVD)
                      </span>
                      <div className="text-xl font-bold text-white font-['Outfit']">
                        {auditResults.algorithmFormula?.targetAVD || '>65% on Shorts'}
                      </div>
                      <p className="text-[11px] text-slate-400">Keep cuts under 2.5 seconds</p>
                    </div>
                  </div>

                  {/* Strengths and Killers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Key Algorithmic Strengths</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                        {auditResults.keyStrengths?.map((str: string, idx: number) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20 space-y-2">
                      <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Top 3 Viral Killers (Avoid These)</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                        {auditResults.topViralKillers?.map((kil: string, idx: number) => (
                          <li key={idx}>{kil}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 30-Day Sprint Plan */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>30-Day Step-by-Step Viral Sprint Plan</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {auditResults.sprintPlan30Days?.map((week: any, idx: number) => (
                        <div 
                          key={idx}
                          className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{week.week}</span>
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {week.focus}
                            </span>
                          </div>
                          <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                            {week.tasks?.map((task: string, tIdx: number) => (
                              <li key={tIdx}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5 Viral Video Concepts */}
                  {auditResults.fiveViralVideoIdeas && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        <span>5 High-Search Video Topics Guaranteed To Rank</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-2.5">
                        {auditResults.fiveViralVideoIdeas.map((idea: any, idx: number) => (
                          <div 
                            key={idx}
                            className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-white text-sm">
                                {idx + 1}. {idea.title}
                              </div>
                              <div className="text-slate-400">
                                {idea.concept}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                Expected CTR: {idea.expectedCTR}
                              </span>
                              <button
                                onClick={() => {
                                  setCustomTopic(idea.title);
                                  setSelectedProductId('custom');
                                  setActiveTab('titles');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                              >
                                Build Hooks →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Audit Channel & Build 30-Day Viral Plan
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Get an in-depth breakdown of your channel's algorithmic strengths, retention targets, and a week-by-week roadmap to scale subscribers.
                  </p>
                  <button
                    onClick={() => handleGenerate('audit')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Run Viral Audit Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: YOUTUBE SEO & TAG MACHINE */}
          {/* ============================================================ */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 p-4 sm:p-5 rounded-2xl border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>YouTube SEO & Tag Machine</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500 text-slate-950 font-bold">
                      Algorithm Ranked
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Rank on Google and YouTube search with chapter timestamps, keyword clusters, affiliate disclosure, and ready-to-paste comma-separated tags.
                  </p>
                </div>

                <button
                  onClick={() => handleGenerate('seo')}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Optimizing Video SEO...</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4" />
                      <span>Generate SEO & Tags</span>
                    </>
                  )}
                </button>
              </div>

              {seoResults ? (
                <div className="space-y-5">
                  {/* Optimized Title */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>OPTIMIZED SEARCH TITLE (Rank #1 on YouTube & Google)</span>
                      <button
                        onClick={() => copyToClipboard(seoResults.optimizedTitle, 'seo-title')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'seo-title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Title</span>
                      </button>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white">
                      {seoResults.optimizedTitle}
                    </div>
                  </div>

                  {/* Chapters & Timestamps */}
                  {seoResults.videoChapters && (
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>VIDEO CHAPTER TIMESTAMPS (Triggers Google Video Key Moments)</span>
                        <button
                          onClick={() => copyToClipboard(seoResults.videoChapters.join('\n'), 'seo-chapters')}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'seo-chapters' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy Chapters</span>
                        </button>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                        {seoResults.videoChapters.map((ch: string, idx: number) => (
                          <div key={idx}>{ch}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Description */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>COMPLETE YOUTUBE DESCRIPTION (Includes Affiliate Links & SEO)</span>
                      <button
                        onClick={() => copyToClipboard(seoResults.optimizedDescription, 'seo-desc')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'seo-desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Description</span>
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      readOnly
                      value={seoResults.optimizedDescription}
                      className="w-full bg-slate-950 p-3 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 outline-hidden"
                    />
                  </div>

                  {/* Tags Box */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>COMMA-SEPARATED TAGS (Paste directly into YouTube Studio Tags box)</span>
                      <button
                        onClick={() => copyToClipboard(seoResults.tags?.join(', ') || '', 'seo-tags')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'seo-tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy All Tags</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {seoResults.tags?.map((tag: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Generate Search-Engine Domination Package
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Create instant chapter timestamps, FTC-compliant affiliate description, and ranking tags for "{activeTopic}".
                  </p>
                  <button
                    onClick={() => handleGenerate('seo')}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Generate SEO Package
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: CHANNEL SPOTLIGHT & EMBED */}
          {/* ============================================================ */}
          {activeTab === 'embed' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 p-4 sm:p-5 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Featured YouTube Channel Spotlight & Embed</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-bold">
                      Direct Subscriber Funnel
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Embed your YouTube channel and latest video directly on this storefront so every store visitor converts into an active YouTube viewer and subscriber.
                  </p>
                </div>

                <button
                  onClick={handleSaveChannelProfile}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Channel to Storefront</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Channel Config */}
                <div className="space-y-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500" />
                    <span>Your YouTube Credentials</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Channel Display Name
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="e.g. Sagar Khan Reviews"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-red-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      YouTube Handle
                    </label>
                    <input
                      type="text"
                      value={channelHandle}
                      onChange={(e) => setChannelHandle(e.target.value)}
                      placeholder="@sagarkhanreviews"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-red-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      YouTube Channel / Video URL
                    </label>
                    <input
                      type="url"
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      placeholder="https://youtube.com/@channel or https://youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-red-500 outline-hidden"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveChannelProfile}
                      className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Sync YouTube Channel Profile</span>
                    </button>
                  </div>
                </div>

                {/* Channel Embed Preview Card */}
                <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Storefront YouTube Banner Preview
                    </span>
                    <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      LIVE ON SITE
                    </span>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={profile.avatarUrl} 
                          alt={channelName} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                        />
                        <div>
                          <div className="font-extrabold text-white text-base">
                            {channelName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {channelHandle} • Verified YouTube Creator
                          </div>
                        </div>
                      </div>

                      <a
                        href={youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Subscribe</span>
                      </a>
                    </div>

                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center relative">
                      <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                        title="YouTube Featured Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 text-center italic">
                      Every customer visiting your product store can directly watch your YouTube video reviews and subscribe with 1 tap.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>YouTube Growth Lab v2.5 • Optimized for 2026 YouTube Recommendation Algorithm</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Growth Lab
          </button>
        </div>
      </div>
    </div>
  );
};
