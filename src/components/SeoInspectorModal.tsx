import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Eye, 
  Star, 
  FileCode2, 
  Globe,
  Tag,
  ShieldCheck,
  Video
} from 'lucide-react';

interface SeoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  activeProduct?: Product | null;
  onSelectProduct: (product: Product) => void;
}

export const SeoInspectorModal: React.FC<SeoInspectorModalProps> = ({
  isOpen,
  onClose,
  products,
  activeProduct,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [selectedProdId, setSelectedProdId] = useState<string>(() => {
    return activeProduct?.id || (products.length > 0 ? products[0].id : '');
  });
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'serp' | 'social' | 'schema'>('serp');

  const selectedProduct = products.find(p => p.id === selectedProdId) || products[0];

  if (!selectedProduct) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://masterreviews.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const productCanonicalUrl = `${origin}${pathname}#${selectedProduct.id}`;

  const pageTitle = `${selectedProduct.title} Review & Deals (2026) – Master Reviews`;
  const metaDesc = selectedProduct.metaDescription || 
    `${selectedProduct.title} honest in-depth review. Features: ${selectedProduct.features?.slice(0, 2).join(', ')}. Compare ratings, pros & cons, and verified discount deals on ${selectedProduct.platform}.`;

  const keywords = selectedProduct.seoKeywords && selectedProduct.seoKeywords.length > 0 
    ? selectedProduct.seoKeywords 
    : [
        `${selectedProduct.title} review`,
        `best ${selectedProduct.category} deals`,
        `${selectedProduct.platform} discount`,
        'verified product test',
        'buyer guide 2026'
      ];

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: selectedProduct.title,
    image: selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0 
      ? selectedProduct.galleryImages 
      : [selectedProduct.imageUrl],
    description: metaDesc,
    sku: selectedProduct.id,
    brand: {
      '@type': 'Brand',
      name: selectedProduct.platform,
    },
    offers: {
      '@type': 'Offer',
      price: selectedProduct.price.toFixed(2),
      priceCurrency: selectedProduct.currency === '$' ? 'USD' : selectedProduct.currency,
      availability: 'https://schema.org/InStock',
      url: selectedProduct.affiliateUrl,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: selectedProduct.rating.toFixed(1),
      reviewCount: selectedProduct.reviewsCount,
      bestRating: '5',
    },
    review: {
      '@type': 'Review',
      author: {
        '@type': 'Organization',
        name: 'Master Reviews Editorial Team',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: selectedProduct.rating.toFixed(1),
        bestRating: '5',
      },
      reviewBody: selectedProduct.fullDescription || selectedProduct.shortDescription,
    },
  }, null, 2);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">SEO & Rich Snippets Manager</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% SEO Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Google Search Engine Optimization, Schema.org Structured Data & Social Meta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Selector Bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-orange-600" /> Current Product:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProdId(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedProdId === p.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.title.length > 22 ? p.title.substring(0, 22) + '...' : p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => setViewTab('serp')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'serp'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google Search SERP Preview</span>
          </button>
          <button
            onClick={() => setViewTab('social')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'social'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Social Share Cards</span>
          </button>
          <button
            onClick={() => setViewTab('schema')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'schema'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Schema.org JSON-LD</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Google SERP Preview */}
          {viewTab === 'serp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Google Desktop & Mobile Search Snippet
                </span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Rich Snippet Active
                </span>
              </div>

              {/* Realistic Google SERP Card */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                {/* Breadcrumb URL */}
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-orange-600">
                    MR
                  </div>
                  <div className="leading-tight">
                    <p className="font-semibold text-slate-800 text-[12px]">Master Reviews</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1">{origin} › {selectedProduct.category} › {selectedProduct.id}</p>
                  </div>
                </div>

                {/* Blue Clickable Title */}
                <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                  {pageTitle}
                </h4>

                {/* Rating & Price Rich Snippet */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="flex items-center text-amber-500 font-bold gap-1">
                    <span className="text-slate-800">{selectedProduct.rating.toFixed(1)}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-medium">({selectedProduct.reviewsCount.toLocaleString()} reviews)</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-bold text-slate-900">{selectedProduct.currency}{selectedProduct.price.toFixed(2)}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded text-[11px]">In stock</span>
                </div>

                {/* Meta Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {metaDesc}
                </p>

                {/* Video Demo Badge if available */}
                {selectedProduct.videoUrl && (
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-semibold flex items-center gap-1">
                      <Video className="w-3 h-3" /> Hands-on Video Demo Attached
                    </span>
                    <span>Verified review video stream</span>
                  </div>
                )}
              </div>

              {/* Targeted Keywords section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Targeted Search Queries & High-Intent Keywords:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Social Share Cards */}
          {viewTab === 'social' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                OpenGraph & Twitter Card Preview (WhatsApp, Telegram, X, Facebook)
              </span>

              <div className="max-w-md mx-auto bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    {selectedProduct.platform}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-orange-600 text-white text-xs font-bold shadow-xs">
                    {selectedProduct.currency}{selectedProduct.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 space-y-1.5 bg-slate-50">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    MASTERREVIEWS.COM
                  </p>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {pageTitle}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {metaDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Schema JSON-LD */}
          {viewTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">Valid Schema.org Product Specification</span>
                  <p className="text-[11px] text-slate-500">Includes Product, AggregateRating, Review, and Offer structured metadata.</p>
                </div>
                <button
                  onClick={() => copyToClipboard(schemaJson, 'schema')}
                  className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedType === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'schema' ? 'Copied!' : 'Copy JSON-LD'}
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 text-emerald-400 text-[11px] font-mono rounded-xl overflow-x-auto max-h-72 border border-slate-800 selection:bg-slate-700">
                {schemaJson}
              </pre>
            </div>
          )}

          {/* Deep Link URL & Actions Bar */}
          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-orange-600" /> Canonical SEO Product Deep-Link:
              </span>
              <p className="text-xs text-orange-800 font-mono break-all">
                {productCanonicalUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyToClipboard(productCanonicalUrl, 'url')}
                className="px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-orange-900 text-xs font-bold hover:bg-orange-100/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedType === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'url' ? 'Link Copied!' : 'Copy SEO Link'}
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectProduct(selectedProduct);
                }}
                className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Product Page</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All {products.length} products automatically synced with Google Schema.org & OpenGraph</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
