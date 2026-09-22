import React, { useState, useEffect, useRef } from 'react';
import { Product, CategoryId, Platform } from '../types';
import { compressAndProcessImage, processVideoUpload, resolveMediaUrl } from '../utils/mediaStorage';
import { 
  X, 
  Plus, 
  Pencil, 
  Image as ImageIcon, 
  Video, 
  Link2, 
  Sparkles, 
  Upload, 
  Film, 
  Trash2, 
  Check, 
  Play, 
  Layers,
  Search
} from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  productToEdit?: Product | null;
  onOpenAiStudio?: (tab?: 'music' | 'image' | 'video') => void;
  lang: 'ur' | 'en';
}

const SAMPLE_IMAGE_PRESETS = [
  { name: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { name: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Camera', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Coffee Maker', url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { name: 'Desk Light', url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  productToEdit,
  onOpenAiStudio,
  lang: _lang,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(productToEdit);

  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [category, setCategory] = useState<CategoryId>('tech');
  const [platform, setPlatform] = useState<Platform>('Amazon');
  const [price, setPrice] = useState('29.99');
  const [originalPrice, setOriginalPrice] = useState('49.99');
  const [currency, setCurrency] = useState('$');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [features, setFeatures] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [badge, setBadge] = useState<'Best Seller' | 'Editor\'s Choice' | 'Hot Deal' | 'Top Rated' | 'Trending'>('Hot Deal');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Media tabs & upload states
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [videoTab, setVideoTab] = useState<'upload' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title || '');
      setTitleUrdu(productToEdit.titleUrdu || '');
      setCategory(productToEdit.category || 'tech');
      setPlatform(productToEdit.platform || 'Amazon');
      setPrice(productToEdit.price != null ? productToEdit.price.toString() : '29.99');
      setOriginalPrice(productToEdit.originalPrice != null ? productToEdit.originalPrice.toString() : '');
      setCurrency(productToEdit.currency || '$');
      setImageUrl(productToEdit.imageUrl || '');
      setImageTab(productToEdit.imageUrl?.startsWith('data:') || productToEdit.imageUrl?.startsWith('blob:') ? 'upload' : 'url');
      setVideoUrl(productToEdit.videoUrl || '');
      setVideoTab(productToEdit.videoUrl?.startsWith('data:') || productToEdit.videoUrl?.startsWith('blob:') || productToEdit.videoUrl?.startsWith('indexeddb:') ? 'upload' : 'url');
      if (productToEdit.videoUrl) {
        resolveMediaUrl(productToEdit.videoUrl).then((res) => {
          if (res) setVideoPreviewUrl(res);
        });
      } else {
        setVideoPreviewUrl('');
      }
      setAffiliateUrl(productToEdit.affiliateUrl || '');
      setShortDesc(productToEdit.shortDescription || '');
      setFullDesc(productToEdit.fullDescription || '');
      setFeatures(productToEdit.features ? productToEdit.features.join('\n') : '');
      setPros(productToEdit.pros ? productToEdit.pros.join('\n') : '');
      setCons(productToEdit.cons ? productToEdit.cons.join('\n') : '');
      setBadge((productToEdit.badge as any) || 'Hot Deal');
      setMetaDescription(productToEdit.metaDescription || '');
      setSeoKeywords(productToEdit.seoKeywords ? productToEdit.seoKeywords.join(', ') : '');
      setImageFileName(null);
      setVideoFileName(null);
    } else {
      setTitle('');
      setTitleUrdu('');
      setCategory('tech');
      setPlatform('Amazon');
      setPrice('29.99');
      setOriginalPrice('49.99');
      setCurrency('$');
      setImageUrl('');
      setImageTab('upload');
      setVideoUrl('');
      setVideoPreviewUrl('');
      setVideoTab('upload');
      setAffiliateUrl('');
      setShortDesc('');
      setFullDesc('');
      setFeatures('');
      setPros('');
      setCons('');
      setBadge('Hot Deal');
      setMetaDescription('');
      setSeoKeywords('');
      setImageFileName(null);
      setVideoFileName(null);
    }
  }, [productToEdit, isOpen]);

  // Image Upload Handlers
  const handleImageFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (e.g. JPG, PNG, WEBP).');
      return;
    }
    try {
      setIsProcessingImage(true);
      const sizeStr = (file.size / 1024).toFixed(0);
      setImageFileName(`${file.name} (${sizeStr} KB)`);
      const compressedDataUrl = await compressAndProcessImage(file);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Failed to process this image. Please try another file.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsImageDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  // Video Upload Handlers
  const handleVideoFileChange = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please choose a video file (e.g. MP4, WebM, MOV).');
      return;
    }
    if (file.size > 80 * 1024 * 1024) {
      alert('Video file is larger than 80MB. Please select a video under 80MB for fast loading.');
      return;
    }
    try {
      setIsProcessingVideo(true);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setVideoFileName(`${file.name} (${sizeMb} MB)`);
      const { storageUrl, previewUrl } = await processVideoUpload(file);
      setVideoUrl(storageUrl);
      setVideoPreviewUrl(previewUrl);
    } catch (err) {
      console.error('Video upload error:', err);
      alert('Failed to process this video file.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !affiliateUrl.trim()) {
      alert('Please provide at least a Product Title and your Affiliate Referral Link!');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
    const finalImage = imageUrl.trim() || (productToEdit ? productToEdit.imageUrl : defaultImg);

    if (isEditing && productToEdit && onUpdateProduct) {
      const updated: Product = {
        ...productToEdit,
        title: title.trim(),
        titleUrdu: titleUrdu.trim() || undefined,
        category,
        platform,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        currency,
        imageUrl: finalImage,
        galleryImages: productToEdit.galleryImages?.length
          ? [finalImage, ...productToEdit.galleryImages.filter(img => img !== finalImage && img !== productToEdit.imageUrl)]
          : [finalImage],
        videoUrl: videoUrl.trim() || undefined,
        shortDescription: shortDesc.trim() || 'Verified quality product with direct discount link.',
        fullDescription: fullDesc.trim() || shortDesc.trim() || 'Thoroughly tested and verified.',
        features: features.trim()
          ? features.split('\n').map(s => s.trim()).filter(Boolean)
          : (productToEdit.features || []),
        pros: pros.trim()
          ? pros.split('\n').map(s => s.trim()).filter(Boolean)
          : (productToEdit.pros || []),
        cons: cons.trim()
          ? cons.split('\n').map(s => s.trim()).filter(Boolean)
          : (productToEdit.cons || []),
        affiliateUrl: affiliateUrl.trim(),
        badge,
        metaDescription: metaDescription.trim() || undefined,
        seoKeywords: seoKeywords.trim() 
          ? seoKeywords.split(',').map(s => s.trim()).filter(Boolean) 
          : undefined,
      };
      onUpdateProduct(updated);
    } else {
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
        imageUrl: finalImage,
        galleryImages: [finalImage],
        videoUrl: videoUrl.trim() || undefined,
        shortDescription: shortDesc.trim() || 'High-quality recommended product with direct verified discount link.',
        fullDescription: fullDesc.trim() || shortDesc.trim() || 'Verified quality product rigorously tested for performance and long-term durability.',
        features: features.trim()
          ? features.split('\n').map(s => s.trim()).filter(Boolean)
          : ['High build quality and reliability', 'Verified seller guarantee', 'Fast shipping available'],
        pros: pros.trim()
          ? pros.split('\n').map(s => s.trim()).filter(Boolean)
          : ['Best value in this price range', 'Highly rated by verified buyers'],
        cons: cons.trim()
          ? cons.split('\n').map(s => s.trim()).filter(Boolean)
          : ['Limited promotional stock discount'],
        affiliateUrl: affiliateUrl.trim(),
        badge,
        clicksCount: 0,
        featured: true,
        metaDescription: metaDescription.trim() || undefined,
        seoKeywords: seoKeywords.trim() 
          ? seoKeywords.split(',').map(s => s.trim()).filter(Boolean) 
          : undefined,
      };
      onAddProduct(newProd);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isEditing ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-600'
            }`}>
              {isEditing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                {isEditing ? 'Edit Product Details' : 'Add New Affiliate Product'}
              </h3>
              <p className="text-xs text-slate-500">
                Directly upload photos and videos from your device or paste web links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          
          {/* Product Title */}
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden font-medium"
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
                className="w-full px-3.5 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden text-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform / Marketplace
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
                <option value="Rs. ">Rs. (PKR)</option>
                <option value="₹">₹ (INR)</option>
                <option value="AED ">AED</option>
                <option value="£">£ (GBP)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deal Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
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
                <option value="tech">Tech & Electronics</option>
                <option value="gadgets">Smart Gadgets</option>
                <option value="home">Home & Kitchen</option>
                <option value="fitness">Health & Fitness</option>
                <option value="fashion">Fashion & Wear</option>
                <option value="beauty">Beauty & Care</option>
              </select>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PRODUCT IMAGE SECTION: DIRECT UPLOAD OR WEB URL */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-slate-900">Product Main Image</span>
              </div>

              {/* Source Switcher: Upload vs URL + AI */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      imageTab === 'upload'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3 h-3 text-orange-600" />
                    <span>Direct Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      imageTab === 'url'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-3 h-3 text-slate-500" />
                    <span>Paste URL</span>
                  </button>
                </div>

                {onOpenAiStudio && (
                  <button
                    type="button"
                    onClick={() => onOpenAiStudio('image')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Generate or edit product photos with Gemini 3.1 Flash Image"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>AI Studio Photo</span>
                  </button>
                )}
              </div>
            </div>

            {imageTab === 'upload' ? (
              <div className="space-y-2">
                {/* Drag & Drop Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsImageDragging(true);
                  }}
                  onDragLeave={() => setIsImageDragging(false)}
                  onDrop={handleImageDrop}
                  onClick={() => imageInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isImageDragging
                      ? 'border-orange-500 bg-orange-50/80'
                      : 'border-slate-300 hover:border-orange-400 bg-white'
                  }`}
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {imageUrl ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt="Uploaded product preview"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {imageFileName || 'Image loaded and optimized'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                            <Check className="w-3 h-3" /> Ready to display
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setImageFileName(null);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {isProcessingImage ? 'Optimizing image...' : 'Click to select or drag & drop image'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports JPG, PNG, WEBP from your phone or PC
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageFileName(null);
                  }}
                  placeholder="https://images.unsplash.com/... or direct image URL"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-hidden font-medium"
                />
              </div>
            )}

            {/* Quick Preset Samples */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
              <span className="text-slate-400 font-medium">Sample images:</span>
              {SAMPLE_IMAGE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setImageUrl(p.url);
                    setImageFileName(`Preset: ${p.name}`);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PRODUCT VIDEO SECTION: DIRECT UPLOAD OR YOUTUBE URL */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-slate-900">Product Video Review / Demo</span>
              </div>

              {/* Source Switcher: Upload Video vs YouTube URL + Veo */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setVideoTab('upload')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      videoTab === 'upload'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Film className="w-3 h-3 text-red-600" />
                    <span>Direct Video Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab('url')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      videoTab === 'url'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-3 h-3 text-slate-500" />
                    <span>YouTube / URL</span>
                  </button>
                </div>

                {onOpenAiStudio && (
                  <button
                    type="button"
                    onClick={() => onOpenAiStudio('video')}
                    className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Generate video demo from image using Veo 3.1"
                  >
                    <Sparkles className="w-3 h-3 text-orange-600" />
                    <span>Veo Video Generator</span>
                  </button>
                )}
              </div>
            </div>

            {videoTab === 'upload' ? (
              <div className="space-y-2">
                {/* Drag & Drop Dropzone for Video */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsVideoDragging(true);
                  }}
                  onDragLeave={() => setIsVideoDragging(false)}
                  onDrop={handleVideoDrop}
                  onClick={() => videoInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isVideoDragging
                      ? 'border-red-500 bg-red-50/80'
                      : 'border-slate-300 hover:border-red-400 bg-white'
                  }`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/ogg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleVideoFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {videoPreviewUrl || videoUrl ? (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative aspect-16/9 max-h-48 rounded-xl overflow-hidden bg-black mx-auto">
                        <video
                          src={videoPreviewUrl || videoUrl}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {videoFileName || 'Direct Video Loaded'}
                          </p>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Ready to play on product page
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoUrl('');
                              setVideoPreviewUrl('');
                              setVideoFileName(null);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <Film className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {isProcessingVideo ? 'Processing video file...' : 'Click to select or drag & drop video file'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Upload direct .MP4, .WebM or .MOV files from your device
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoFileName(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-hidden font-medium"
                />
                <p className="text-[11px] text-slate-400">
                  Supports YouTube watch links, Shorts, or direct video streams
                </p>
              </div>
            )}
          </div>

          {/* Highlight Badge selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Card Badge Flag</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Hot Deal', 'Best Seller', 'Editor\'s Choice', 'Top Rated', 'Trending'] as const).map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBadge(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
              Short Summary Description (Shown on card)
            </label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="e.g. Active noise cancellation with 40-hour battery life and studio acoustic sound."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden font-medium"
            />
          </div>

          {/* Full In-Depth Review Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full In-Depth Product Review
            </label>
            <textarea
              rows={3}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Detailed testing results, build quality, and honest recommendation..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Key Features (One feature per line)
            </label>
            <textarea
              rows={3}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Hybrid Active Noise Cancellation&#10;40-hour non-stop battery life&#10;Memory foam ear cushions"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">
                Pros (One per line)
              </label>
              <textarea
                rows={2}
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="Unbeatable value&#10;Fast USB-C charging"
                className="w-full px-3.5 py-2 bg-emerald-50/40 border border-emerald-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">
                Cons (One per line)
              </label>
              <textarea
                rows={2}
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="Soft carrying pouch&#10;Requires wired mode for gaming"
                className="w-full px-3.5 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-sm focus:bg-white focus:border-rose-500 outline-hidden"
              />
            </div>
          </div>

          {/* SEO & Search Engine Optimization (Optional) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-orange-600" /> SEO & Google Search Snippet (Optional)
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Auto-optimized if left blank
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Custom SEO Meta Description (Recommended 140–160 chars)
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Honest review & hands-on test of this product. Compare verified discount deals and buyer ratings."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-orange-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Target SEO Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="e.g. bluetooth headphones review, best wireless earphones, amazon discount"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-orange-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-colors cursor-pointer flex items-center gap-2 ${
                isEditing
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isEditing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isEditing ? 'Save Changes' : 'Publish Product to Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
