import React, { useState } from 'react';
import { Product, CategoryId, Platform } from '../types';
import { X, Plus, Image as ImageIcon, Video, Link2, Sparkles, HelpCircle } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  lang: 'ur' | 'en';
}

const SAMPLE_IMAGE_PRESETS = [
  { name: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { name: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Camera', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Coffee Maker', url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { name: 'Skincare', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  lang,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [category, setCategory] = useState<CategoryId>('tech');
  const [platform, setPlatform] = useState<Platform>('Amazon');
  const [price, setPrice] = useState('29.99');
  const [originalPrice, setOriginalPrice] = useState('49.99');
  const [currency, setCurrency] = useState('$');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [features, setFeatures] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [badge, setBadge] = useState<'Best Seller' | 'Editor\'s Choice' | 'Hot Deal' | 'Top Rated' | 'Trending'>('Hot Deal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !affiliateUrl.trim()) {
      alert('Please provide at least a Product Title and your Affiliate Link!');
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      titleUrdu: titleUrdu.trim() || undefined,
      category,
      platform,
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      currency,
      rating: 4.8,
      reviewsCount: 1,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      galleryImages: [imageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      videoUrl: videoUrl.trim() || undefined,
      shortDescription: shortDesc.trim() || 'High quality recommended product with direct discount link.',
      fullDescription: fullDesc.trim() || shortDesc.trim() || 'Verified quality product tested for durability and performance.',
      features: features.trim()
        ? features.split('\n').map(s => s.trim()).filter(Boolean)
        : ['High build quality and reliability', 'Verified seller guarantee', 'Fast shipping available'],
      pros: pros.trim()
        ? pros.split('\n').map(s => s.trim()).filter(Boolean)
        : ['Best value in this price range', 'Highly rated by users'],
      cons: cons.trim()
        ? cons.split('\n').map(s => s.trim()).filter(Boolean)
        : ['Limited promotional stock discount'],
      affiliateUrl: affiliateUrl.trim(),
      badge,
      clicksCount: 0,
      featured: true,
    };

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                Add New Affiliate Item
              </h3>
              <p className="text-xs text-slate-500">
                Add image, video demo, description, and your direct referral link
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ultra Noise Cancelling Wireless Headphones Pro"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          {/* Affiliate URL & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-orange-600" />
                <span>Your Affiliate Referral Link *</span>
              </label>
              <input
                type="url"
                required
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://amazon.com/dp/.../?tag=youraffiliate-20"
                className="w-full px-3.5 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden text-slate-900"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform Marketplace
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden font-medium"
              >
                <option value="Amazon">Amazon</option>
                <option value="Daraz">Daraz</option>
                <option value="AliExpress">AliExpress</option>
                <option value="ClickBank">ClickBank</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="Custom">Other / Direct Brand</option>
              </select>
            </div>
          </div>

          {/* Pricing & Category */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                <option value="$">$ (USD)</option>
                <option value="Rs ">Rs (PKR)</option>
                <option value="AED ">AED</option>
                <option value="£">£ (GBP)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deal Price
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Original Price
              </label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              >
                <option value="tech">Tech</option>
                <option value="gadgets">Gadgets</option>
                <option value="home">Home & Kitchen</option>
                <option value="fitness">Fitness</option>
                <option value="fashion">Fashion</option>
                <option value="beauty">Beauty</option>
              </select>
            </div>
          </div>

          {/* Product Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Product Image URL</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Unsplash, Imgur or direct web link</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or paste direct image URL"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
              <span className="text-slate-400 font-medium">Quick Pick:</span>
              {SAMPLE_IMAGE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setImageUrl(p.url)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Video URL (YouTube Review / Demo / Short) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span>YouTube Review / Demo URL</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Watch link or Shorts link</span>
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          {/* Badge selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Highlight Badge</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Hot Deal', 'Best Seller', 'Editor\'s Choice', 'Top Rated', 'Trending'] as const).map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBadge(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    badge === b
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description (Card summary)
            </label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Short catchy review highlight for card view..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          {/* Full In-Depth Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Detailed Review & Specifications
            </label>
            <textarea
              rows={3}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Detailed explanation, why people should buy this, battery life, sound quality, durability..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Pros (one per line)
              </label>
              <textarea
                rows={2}
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="Great battery timing&#10;Affordable price"
                className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-800 mb-1">
                Cons (one per line)
              </label>
              <textarea
                rows={2}
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="Delivery takes 3-5 days&#10;No adapter included"
                className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs outline-hidden"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              Publish Product
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
