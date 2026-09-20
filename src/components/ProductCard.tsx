import React from 'react';
import { Product } from '../types';
import { 
  Star, 
  ExternalLink, 
  Video, 
  Eye, 
  Share2, 
  Check, 
  MousePointerClick,
  Sparkles,
  Pencil,
  Trash2
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onTrackClick: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  lang: 'ur' | 'en';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onTrackClick,
  onEditProduct,
  onDeleteProduct,
  lang,
}) => {
  const [copied, setCopied] = React.useState(false);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackClick(product.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.affiliateUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditProduct?.(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteProduct?.(product.id);
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'Amazon': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Daraz': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'AliExpress': return 'bg-red-100 text-red-900 border-red-300';
      case 'TikTok Shop': return 'bg-purple-100 text-purple-900 border-purple-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer"
      onClick={() => onOpenDetails(product)}
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-slate-900/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-xs">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Top Right: Platform, Share, Edit and Delete controls */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border shadow-xs ${getPlatformBadgeColor(product.platform)}`}>
            {product.platform}
          </span>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 backdrop-blur-xs transition-colors shadow-xs"
            title="Share Affiliate Link"
            aria-label="Share affiliate link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          {onEditProduct && (
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-amber-600 backdrop-blur-xs transition-colors shadow-xs"
              title="Edit Product"
              aria-label="Edit product"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteProduct && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 backdrop-blur-xs transition-colors shadow-xs"
              title="Delete Product"
              aria-label="Delete product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Video Available Indicator */}
        {product.videoUrl && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors">
            <Video className="w-3.5 h-3.5 text-red-400" />
            <span>Watch Video</span>
          </div>
        )}

        {/* Total Clicks indicator */}
        {product.clicksCount > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 text-slate-700 text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-orange-600" />
            <span>{product.clicksCount} clicks</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-2">
          {/* Rating and Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="ml-1 text-xs font-bold text-slate-900">
                {product.rating ?? 4.8}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              ({(product.reviewsCount ?? 1).toLocaleString()} reviews)
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
            {product.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price and CTA */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit']">
                {product.currency}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {product.currency}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Best Deal
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenDetails(product)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review & Specs</span>
            </button>

            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleAffiliateClick}
              className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Check Price</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
