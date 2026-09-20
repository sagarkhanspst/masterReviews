import React, { useState } from 'react';
import { Product, CreatorProfile } from '../types';
import { getEmbedVideoUrl, isDirectVideo } from '../utils/videoUtils';
import { 
  X, 
  Star, 
  ExternalLink, 
  Video, 
  Check, 
  XCircle, 
  Share2, 
  ShieldAlert, 
  Send,
  Sparkles,
  MousePointerClick,
  Pencil,
  Trash2
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  profile: CreatorProfile;
  onClose: () => void;
  onTrackClick: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  lang: 'ur' | 'en';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  profile,
  onClose,
  onTrackClick,
  onEditProduct,
  onDeleteProduct,
  lang,
}) => {
  if (!product) return null;

  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);
  const [copied, setCopied] = useState(false);

  const embedUrl = getEmbedVideoUrl(product.videoUrl);

  const handleAffiliateClick = () => {
    onTrackClick(product.id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(product.affiliateUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (onEditProduct && product) {
      onClose();
      onEditProduct(product);
    }
  };

  const handleDelete = () => {
    if (onDeleteProduct && product) {
      onDeleteProduct(product.id);
      onClose();
    }
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800">
              {product.platform}
            </span>
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEditProduct && (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit this product"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {onDeleteProduct && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Delete this product"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Main Media Showcase (Images & Video) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Media Player / Gallery (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Media Display Switcher (Photos vs Video) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveMedia('image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    activeMedia === 'image'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Photo Gallery
                </button>

                {embedUrl && (
                  <button
                    onClick={() => setActiveMedia('video')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeMedia === 'video'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Watch Video Demo</span>
                  </button>
                )}
              </div>

              {/* Main Media Box */}
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                {activeMedia === 'video' && product.videoUrl ? (
                  isDirectVideo(product.videoUrl) ? (
                    <video
                      src={product.videoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={product.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : null
                ) : (
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>

              {/* Gallery Thumbnails */}
              {product.galleryImages && product.galleryImages.length > 1 && activeMedia === 'image' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImage === img ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Pricing, Rating & Direct Buy Box (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating ?? 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {product.rating ?? 4.8} / 5.0
                  </span>
                  <span className="text-xs text-slate-500">
                    ({(product.reviewsCount ?? 1).toLocaleString()} reviews)
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug font-['Outfit']">
                  {product.title}
                </h2>

                {/* Price Display */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                      {product.currency}{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through">
                        {product.currency}{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md">
                        Save {discount}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Verified lowest price with authentic seller guarantee
                  </p>
                </div>

                {/* Direct Affiliate CTA */}
                <div className="space-y-2 pt-1">
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={handleAffiliateClick}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>
                      Buy / Check Deal on {product.platform}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5 text-orange-600" />
                      {product.clicksCount} clicks generated
                    </span>
                    <span className="text-emerald-700 font-medium">
                      ✓ Instant Redirection
                    </span>
                  </div>
                </div>

                {/* Creator Chat Consultation */}
                {profile.whatsappNumber && (
                  <a
                    href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello! I have a question about ${product.title} from Master Reviews.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask Master Reviews on WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Verified Guarantee Badge */}
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Transparent recommendation. Safe and secure direct partner checkout.
                </span>
              </div>

            </div>

          </div>

          {/* Full Description & Highlights */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Full In-Depth Review & Specifications
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </p>
          </div>

          {/* Features List */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                Key Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Pros */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>What We Liked (Pros)</span>
              </h4>
              <ul className="space-y-1.5">
                {product.pros.map((pro, idx) => (
                  <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Things to Keep in Mind (Cons)</span>
              </h4>
              <ul className="space-y-1.5">
                {product.cons.map((con, idx) => (
                  <li key={idx} className="text-xs text-rose-950 flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer with sticky action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Platform: <strong className="text-slate-800">{product.platform}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleAffiliateClick}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Open Deal Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
