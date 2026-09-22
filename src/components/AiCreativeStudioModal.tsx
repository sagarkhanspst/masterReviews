import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music,
  Image as ImageIcon,
  Video,
  Sparkles,
  Play,
  Pause,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wand2,
  Volume2,
  Film,
  Layers,
  ArrowRight,
  Sliders,
  ChevronRight,
  Disc,
} from 'lucide-react';
import { Product } from '../types';

export type AiStudioTab = 'music' | 'image' | 'video';

interface AiCreativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AiStudioTab;
  products: Product[];
  onApplyImageToProduct?: (productId: string, imageUrl: string) => void;
  onApplyVideoToProduct?: (productId: string, videoUrl: string) => void;
  onApplyMusicToProduct?: (productId: string, musicUrl: string, title?: string) => void;
  targetProduct?: Product | null;
}

export const AiCreativeStudioModal: React.FC<AiCreativeStudioModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'video',
  products,
  onApplyImageToProduct,
  onApplyVideoToProduct,
  onApplyMusicToProduct,
  targetProduct,
}) => {
  const [activeTab, setActiveTab] = useState<AiStudioTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Selected target product for applying generated media
  const [selectedProductId, setSelectedProductId] = useState<string>(
    targetProduct?.id || (products.length > 0 ? products[0].id : '')
  );

  useEffect(() => {
    if (targetProduct) {
      setSelectedProductId(targetProduct.id);
    }
  }, [targetProduct]);

  // ========================================================
  // 1. MUSIC GENERATION STATE (Lyria)
  // ========================================================
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicImageBase64, setMusicImageBase64] = useState<string | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [musicResult, setMusicResult] = useState<{
    audioUrl: string;
    lyrics?: string;
    durationMode: string;
    prompt: string;
  } | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ========================================================
  // 2. IMAGE GENERATION / EDITING STATE (gemini-3.1-flash-image-preview)
  // ========================================================
  const [imageMode, setImageMode] = useState<'create' | 'edit'>('create');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [editImageBase64, setEditImageBase64] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<{
    imageUrl: string;
    caption?: string;
    aspectRatio: string;
    isEdit: boolean;
  } | null>(null);

  // ========================================================
  // 3. VIDEO ANIMATION STATE (veo-3.1-fast-generate-preview)
  // ========================================================
  const [videoImageBase64, setVideoImageBase64] = useState<string | null>(
    targetProduct?.imageUrl || null
  );
  const [videoPrompt, setVideoPrompt] = useState(
    'Smooth cinematic 360 product rotation with gentle studio lighting and soft reflections'
  );
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStage, setVideoStage] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
  const [pollingOpName, setPollingOpName] = useState<string | null>(null);
  const videoPollTimeoutRef = useRef<any>(null);

  // Clean up audio & timeouts when unmounting or modal closes
  useEffect(() => {
    return () => {
      if (videoPollTimeoutRef.current) {
        clearTimeout(videoPollTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  // ========================================================
  // MUSIC HANDLERS
  // ========================================================
  const handleMusicImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMusicImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) {
      setMusicError('Please enter a music style or mood description.');
      return;
    }
    setMusicLoading(true);
    setMusicError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }

    try {
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt.trim(),
          model: musicModel,
          imageBase64: musicImageBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate music track.');
      }

      // Convert base64 audio to Blob URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      setMusicResult({
        audioUrl,
        lyrics: data.lyrics,
        durationMode: data.durationMode,
        prompt: musicPrompt.trim(),
      });
    } catch (err: any) {
      console.error(err);
      setMusicError(err.message || 'An error occurred during music generation.');
    } finally {
      setMusicLoading(false);
    }
  };

  const togglePlayMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(err => console.error('Audio play error:', err));
    }
  };

  // ========================================================
  // IMAGE HANDLERS
  // ========================================================
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setImageError('Please enter a descriptive prompt for the image.');
      return;
    }
    setImageLoading(true);
    setImageError(null);

    try {
      const res = await fetch('/api/ai/create-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          aspectRatio: imageAspectRatio,
          editImageBase64: imageMode === 'edit' ? editImageBase64 : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create image.');
      }

      const imageUrl = `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`;
      setImageResult({
        imageUrl,
        caption: data.caption,
        aspectRatio: data.aspectRatio,
        isEdit: data.isEdit,
      });
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || 'An error occurred during image generation.');
    } finally {
      setImageLoading(false);
    }
  };

  // ========================================================
  // VIDEO HANDLERS (Veo: veo-3.1-fast-generate-preview)
  // ========================================================
  const handleVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setVideoImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const pollVideoOperation = async (opName: string, startTime: number) => {
    try {
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      setVideoStage(`Synthesizing motion frames with Veo AI... (${elapsedSec}s elapsed)`);

      const statusRes = await fetch('/api/ai/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      const statusData = await statusRes.json();
      if (!statusRes.ok || statusData.error) {
        throw new Error(statusData.error?.message || statusData.error || 'Video rendering failed');
      }

      if (statusData.done) {
        setVideoStage('Finalizing and streaming video stream...');
        // Download video
        const dlRes = await fetch('/api/ai/video-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!dlRes.ok) {
          throw new Error('Failed to retrieve rendered video.');
        }

        const blob = await dlRes.blob();
        const videoBlobUrl = URL.createObjectURL(blob);
        setVideoResultUrl(videoBlobUrl);
        setVideoLoading(false);
        setVideoStage('');
      } else {
        // Poll again in 5 seconds
        videoPollTimeoutRef.current = setTimeout(() => {
          pollVideoOperation(opName, startTime);
        }, 5000);
      }
    } catch (err: any) {
      console.error('Error polling video:', err);
      setVideoError(err.message || 'Failed while awaiting video generation.');
      setVideoLoading(false);
      setVideoStage('');
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoImageBase64) {
      setVideoError('Please upload a product photo to animate into video.');
      return;
    }
    setVideoLoading(true);
    setVideoError(null);
    setVideoResultUrl(null);
    setVideoStage('Submitting photo to Veo (veo-3.1-fast-generate-preview)...');

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: videoImageBase64,
          prompt: videoPrompt.trim(),
          aspectRatio: videoAspectRatio,
          resolution: videoResolution,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit video generation job.');
      }

      setPollingOpName(data.operationName);
      setVideoStage('Veo neural engine is processing lighting, physics, and camera path...');
      // Start polling
      pollVideoOperation(data.operationName, Date.now());
    } catch (err: any) {
      console.error(err);
      setVideoError(err.message || 'Failed to start video generation.');
      setVideoLoading(false);
      setVideoStage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight font-['Outfit']">
                  AI Creative Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-400/30">
                  Multimodal Suite
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Generate custom music tracks, studio photos, and cinematic video demos for your reviews
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 overflow-x-auto">
          {/* Tab 1: Video */}
          <button
            id="tab-btn-video"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white text-orange-600 border-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Film className="w-4 h-4 text-orange-500" />
            <span>Animate to Video (Veo)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-700 font-mono">
              veo-3.1
            </span>
          </button>

          {/* Tab 2: Music */}
          <button
            id="tab-btn-music"
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'music'
                ? 'bg-white text-rose-600 border-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Music className="w-4 h-4 text-rose-500" />
            <span>Generate Music (Lyria)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 font-mono">
              lyria-3
            </span>
          </button>

          {/* Tab 3: Image */}
          <button
            id="tab-btn-image"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'image'
                ? 'bg-white text-amber-600 border-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-500" />
            <span>Create & Edit Images</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-700 font-mono">
              gemini-3.1
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ========================================================
              TAB 1: VIDEO GENERATION (VEO)
              ======================================================== */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/70 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500 text-white shrink-0 mt-0.5">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Photo-to-Video Animation with Google Veo
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Upload any product photo to turn it into an engaging review clip. Uses{' '}
                    <code className="text-orange-700 font-mono font-semibold">veo-3.1-fast-generate-preview</code>{' '}
                    with customizable camera motion and <code className="font-mono">16:9</code> landscape or <code className="font-mono">9:16</code> portrait aspect ratios for TikTok/Shorts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Inputs */}
                <div className="space-y-4">
                  {/* Photo Upload / Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      1. Product Photo to Animate *
                    </label>
                    
                    {/* Select from existing products shortcut */}
                    {products.length > 0 && (
                      <div className="mb-2">
                        <label className="text-[11px] text-slate-500 block mb-1">
                          Or select an existing product photo:
                        </label>
                        <select
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-orange-500"
                          onChange={(e) => {
                            const found = products.find(p => p.id === e.target.value);
                            if (found) {
                              setVideoImageBase64(found.imageUrl);
                              setSelectedProductId(found.id);
                            }
                          }}
                          value={selectedProductId}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Upload box */}
                    <div className="relative border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-xl p-4 text-center bg-slate-50 hover:bg-orange-50/30 transition-colors">
                      {videoImageBase64 ? (
                        <div className="relative inline-block max-w-full">
                          <img
                            src={videoImageBase64}
                            alt="Selected for video"
                            className="max-h-44 rounded-lg object-contain mx-auto shadow-xs border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setVideoImageBase64(null)}
                            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-700">
                            Click to upload or drag & drop product photo
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            PNG, JPG, WebP up to 10MB
                          </p>
                        </div>
                      )}
                      <input
                        id="video-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleVideoImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Aspect Ratio & Resolution */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Aspect Ratio
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoAspectRatio('16:9')}
                          className={`py-2 px-2.5 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            videoAspectRatio === '16:9'
                              ? 'bg-orange-50 border-orange-500 text-orange-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-6 h-3.5 border-2 border-current rounded-xs"></span>
                          <span>16:9 Landscape</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVideoAspectRatio('9:16')}
                          className={`py-2 px-2.5 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            videoAspectRatio === '9:16'
                              ? 'bg-orange-50 border-orange-500 text-orange-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-3.5 h-6 border-2 border-current rounded-xs"></span>
                          <span>9:16 Portrait</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Resolution
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoResolution('720p')}
                          className={`py-2 px-2 rounded-lg text-xs font-semibold border text-center cursor-pointer transition-all ${
                            videoResolution === '720p'
                              ? 'bg-orange-50 border-orange-500 text-orange-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          720p (Fast)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoResolution('1080p')}
                          className={`py-2 px-2 rounded-lg text-xs font-semibold border text-center cursor-pointer transition-all ${
                            videoResolution === '1080p'
                              ? 'bg-orange-50 border-orange-500 text-orange-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          1080p (FHD)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Motion Prompt */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      2. Camera & Animation Prompt
                    </label>
                    <textarea
                      id="video-prompt-input"
                      rows={3}
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="e.g. Smooth 360 rotation around the product with cinematic studio spotlights..."
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-orange-500 resize-none shadow-2xs"
                    />

                    {/* Prompt Presets */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        'Cinematic 360 rotation with lens flare',
                        'Smooth slow push-in focusing on build quality',
                        'Product placed on luxury pedestal with drifting smoke',
                        'Energetic unboxing reveal motion',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setVideoPrompt(preset)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 transition-colors text-slate-600 cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {videoError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{videoError}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    id="generate-video-btn"
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={videoLoading || !videoImageBase64}
                    className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {videoLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering Video with Veo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Veo Video ({videoAspectRatio})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column: Output / Preview */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Generated Video Result
                  </label>

                  <div className={`w-full rounded-2xl border border-slate-200 bg-slate-900 flex flex-col items-center justify-center p-4 min-h-[320px] overflow-hidden ${
                    videoAspectRatio === '9:16' ? 'aspect-[9/16] max-w-[280px] mx-auto' : 'aspect-video'
                  }`}>
                    {videoLoading ? (
                      <div className="text-center p-6 text-white space-y-3">
                        <div className="w-12 h-12 rounded-full border-3 border-orange-500 border-t-transparent animate-spin mx-auto"></div>
                        <h4 className="font-bold text-sm text-orange-300">
                          Veo Neural Video Generation in Progress
                        </h4>
                        <p className="text-xs text-slate-300 max-w-xs mx-auto animate-pulse">
                          {videoStage || 'Synthesizing motion frames...'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Video rendering takes 30-90 seconds. You may review other tabs while waiting.
                        </p>
                      </div>
                    ) : videoResultUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <video
                          src={videoResultUrl}
                          controls
                          autoPlay
                          loop
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 p-6 space-y-2">
                        <Film className="w-10 h-10 mx-auto text-slate-600" />
                        <p className="text-xs font-medium">No video generated yet</p>
                        <p className="text-[11px] text-slate-500 max-w-xs">
                          Upload a photo and click Generate. The generated video will play here with download and attachment options.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions when video is ready */}
                  {videoResultUrl && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Veo Video Ready ({videoAspectRatio})
                        </span>
                        <a
                          href={videoResultUrl}
                          download="product-review-demo.mp4"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download MP4
                        </a>
                      </div>

                      {onApplyVideoToProduct && products.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                          <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg flex-1 text-slate-700"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                Set to: {p.title.slice(0, 32)}...
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              onApplyVideoToProduct(selectedProductId, videoResultUrl);
                              alert('Video attached to selected product successfully!');
                            }}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          >
                            Apply to Product
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: MUSIC GENERATION (LYRIA)
              ======================================================== */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200/70 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500 text-white shrink-0 mt-0.5">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Background Music Generation with Google Lyria
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Create custom background music and soundtracks for your product reviews. Use{' '}
                    <code className="text-rose-700 font-mono font-semibold">lyria-3-clip-preview</code> for 30-second clips or{' '}
                    <code className="text-rose-700 font-mono font-semibold">lyria-3-pro-preview</code> for full-length tracks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Controls */}
                <div className="space-y-4">
                  {/* Model Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Model & Track Length *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMusicModel('lyria-3-clip-preview')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          musicModel === 'lyria-3-clip-preview'
                            ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">Lyria Clip</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded-md font-semibold">
                            ≤ 30s
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Fast clip generation, ideal for short unboxing clips & TikToks.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMusicModel('lyria-3-pro-preview')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          musicModel === 'lyria-3-pro-preview'
                            ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">Lyria Pro</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-purple-200 text-purple-800 rounded-md font-semibold">
                            Full Track
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Extended arrangements with dynamic verse/chorus structure.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Music Style & Mood Prompt *
                    </label>
                    <textarea
                      id="music-prompt-input"
                      rows={3}
                      value={musicPrompt}
                      onChange={(e) => setMusicPrompt(e.target.value)}
                      placeholder="e.g. Upbeat lo-fi electronic rhythm with light acoustic guitar and uplifting melody for tech review..."
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-rose-500 resize-none shadow-2xs"
                    />

                    {/* Preset buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        'Chill lo-fi study beat with piano for gadget demo',
                        'Energetic electronic synthwave for gaming gear review',
                        'Warm acoustic guitar & light percussion unboxing',
                        'Cinematic ambient orchestral track for luxury products',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMusicPrompt(preset)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition-colors text-slate-600 cursor-pointer"
                        >
                          + {preset.slice(0, 36)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Image Guidance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Optional: Product Photo for Inspiration
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      {musicImageBase64 ? (
                        <div className="relative shrink-0">
                          <img
                            src={musicImageBase64}
                            alt="Music inspiration"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setMusicImageBase64(null)}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <Disc className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 text-xs">
                        <p className="font-medium text-slate-700">Guide track by product image</p>
                        <p className="text-[11px] text-slate-500">Lyria will match the vibe of the photo</p>
                      </div>
                      <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shrink-0">
                        Choose
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMusicImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {musicError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{musicError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    id="generate-music-btn"
                    type="button"
                    onClick={handleGenerateMusic}
                    disabled={musicLoading || !musicPrompt.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {musicLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Track with Lyria...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Track ({musicModel === 'lyria-3-pro-preview' ? 'Full Track' : '30s Clip'})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column: Audio Player & Management */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Generated Music Track
                  </label>

                  <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
                    {musicLoading ? (
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full border-3 border-rose-500 border-t-transparent animate-spin mx-auto"></div>
                        <h4 className="font-bold text-sm text-rose-300">
                          Composing audio with Google Lyria AI...
                        </h4>
                        <p className="text-xs text-slate-300 animate-pulse max-w-xs">
                          Generating harmonic layers, instruments, and mixing audio stream
                        </p>
                      </div>
                    ) : musicResult ? (
                      <div className="w-full space-y-5 text-center">
                        {/* Audio Vinyl Animation */}
                        <div className="relative mx-auto w-24 h-24">
                          <div className={`w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-950 flex items-center justify-center shadow-lg ${
                            isPlayingMusic ? 'animate-spin' : ''
                          }`} style={{ animationDuration: '4s' }}>
                            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                              <Music className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Badge */}
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                            {musicResult.durationMode === 'full-track' ? 'Full Length Track' : '30-Second Clip'}
                          </span>
                          <h4 className="font-bold text-sm text-white mt-1.5 line-clamp-2 px-4">
                            "{musicResult.prompt}"
                          </h4>
                        </div>

                        {/* Custom Player Controls */}
                        <audio
                          ref={audioRef}
                          src={musicResult.audioUrl}
                          onEnded={() => setIsPlayingMusic(false)}
                          className="hidden"
                        />

                        <div className="flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={togglePlayMusic}
                            className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                          >
                            {isPlayingMusic ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5 ml-0.5" />
                            )}
                          </button>
                        </div>

                        {musicResult.lyrics && (
                          <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-left text-xs text-slate-300 max-h-24 overflow-y-auto">
                            <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase">
                              Lyrics / Musical Notes:
                            </span>
                            {musicResult.lyrics}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 p-6 space-y-2">
                        <Disc className="w-10 h-10 mx-auto text-slate-600" />
                        <p className="text-xs font-medium">No music generated yet</p>
                        <p className="text-[11px] text-slate-500 max-w-xs">
                          Describe the mood or choose a preset on the left, then click Generate to produce your review soundtrack.
                        </p>
                      </div>
                    )}
                  </div>

                  {musicResult && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Track Ready ({musicResult.durationMode})
                        </span>
                        <a
                          href={musicResult.audioUrl}
                          download="review-background-music.wav"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download WAV
                        </a>
                      </div>

                      {onApplyMusicToProduct && products.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                          <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg flex-1 text-slate-700"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                Attach to: {p.title.slice(0, 30)}...
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              onApplyMusicToProduct(selectedProductId, musicResult.audioUrl, musicResult.prompt);
                              alert('Background audio successfully attached to product!');
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          >
                            Attach Audio
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: CREATE & EDIT IMAGES (gemini-3.1-flash-image-preview)
              ======================================================== */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200/70 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Image Creation & Editing with Gemini
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Create new high-fidelity product images or upload existing product photos and use natural text prompts to edit, adjust lighting, replace backgrounds, or add accessories using{' '}
                    <code className="text-amber-800 font-mono font-semibold">gemini-3.1-flash-image-preview</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Form */}
                <div className="space-y-4">
                  {/* Mode: Create vs Edit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImageMode('create')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          imageMode === 'create'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Create New Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImageMode('edit')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          imageMode === 'edit'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Edit Existing Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* If Edit Mode: Upload Image to Edit */}
                  {imageMode === 'edit' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Source Image to Edit *
                      </label>
                      <div className="relative border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-xl p-3 text-center bg-slate-50">
                        {editImageBase64 ? (
                          <div className="relative inline-block">
                            <img
                              src={editImageBase64}
                              alt="Source to edit"
                              className="max-h-36 rounded-lg object-contain mx-auto border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => setEditImageBase64(null)}
                              className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs font-medium text-slate-700">
                              Upload photo to modify
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Aspect Ratio Selector (for creation) */}
                  {imageMode === 'create' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Aspect Ratio
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setImageAspectRatio(ratio)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                              imageAspectRatio === ratio
                                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      {imageMode === 'create' ? 'Image Generation Prompt *' : 'Edit Instructions *'}
                    </label>
                    <textarea
                      id="image-prompt-input"
                      rows={3}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder={
                        imageMode === 'create'
                          ? 'e.g. Ultra high resolution product shot of wireless noise cancelling headphones on dark wet concrete with dramatic warm sunset backlighting...'
                          : 'e.g. Place this product on a clean modern wooden desk with indoor plant in background and soft warm lighting...'
                      }
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-amber-500 resize-none shadow-2xs"
                    />

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(imageMode === 'create'
                        ? [
                            'Modern luxury product mockup on marble with soft bokeh',
                            'Clean white background e-commerce catalog shot',
                            'Ergonomic in-hand lifestyle demonstration',
                            'Dramatic dark mode studio shot with neon rim light',
                          ]
                        : [
                            'Place on a warm wooden tabletop with soft morning sun',
                            'Remove cluttered background and replace with minimal studio',
                            'Add subtle water droplets and refreshing reflections',
                            'Enhance lighting with warm golden hour cinematic glow',
                          ]
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setImagePrompt(preset)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 transition-colors text-slate-600 cursor-pointer"
                        >
                          + {preset.slice(0, 36)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {imageError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{imageError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    id="generate-image-btn"
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={imageLoading || !imagePrompt.trim() || (imageMode === 'edit' && !editImageBase64)}
                    className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {imageLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering Image with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{imageMode === 'create' ? 'Create Image' : 'Apply AI Edit'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column: Preview */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Image Result
                  </label>

                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-4 min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
                    {imageLoading ? (
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full border-3 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
                        <h4 className="font-bold text-sm text-slate-800">
                          Gemini 3.1 Flash Image Engine working...
                        </h4>
                        <p className="text-xs text-slate-500 animate-pulse max-w-xs">
                          Synthesizing textures, photorealistic lighting, and detail
                        </p>
                      </div>
                    ) : imageResult ? (
                      <div className="w-full flex flex-col items-center space-y-3">
                        <img
                          src={imageResult.imageUrl}
                          alt="AI Generated Product"
                          className="max-h-[360px] w-auto object-contain rounded-xl shadow-md border border-slate-200 bg-white"
                        />
                        {imageResult.caption && (
                          <p className="text-xs text-slate-600 text-center italic max-w-md">
                            "{imageResult.caption}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 p-6 space-y-2">
                        <ImageIcon className="w-10 h-10 mx-auto text-slate-400" />
                        <p className="text-xs font-medium text-slate-600">No image created yet</p>
                        <p className="text-[11px] text-slate-500 max-w-xs">
                          Configure your prompt on the left to render photos. You can immediately set them as product review imagery.
                        </p>
                      </div>
                    )}
                  </div>

                  {imageResult && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Image Ready ({imageResult.aspectRatio})
                        </span>
                        <a
                          href={imageResult.imageUrl}
                          download="product-photo.png"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>

                      {onApplyImageToProduct && products.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                          <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg flex-1 text-slate-700"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                Set as photo for: {p.title.slice(0, 30)}...
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              onApplyImageToProduct(selectedProductId, imageResult.imageUrl);
                              alert('Image successfully applied to product!');
                            }}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          >
                            Apply Photo
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Powered by Gemini & Veo Multimodal APIs</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
