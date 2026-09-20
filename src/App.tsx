import React, { useState, useEffect, useMemo } from 'react';
import { Product, CreatorProfile, CategoryId } from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CREATOR_PROFILE, 
  INITIAL_CATEGORIES 
} from './data/initialData';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AddProductModal } from './components/AddProductModal';
import { CreatorProfileModal } from './components/CreatorProfileModal';
import { AffiliateGuideModal } from './components/AffiliateGuideModal';
import { Footer } from './components/Footer';
import { Plus, PackageSearch, Sparkles } from 'lucide-react';

export default function App() {
  // State initialization with localStorage fallback & auto-migration from previous name
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('affiliate_hub_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If old products with Urdu descriptions exist, upgrade to clean English
          if (parsed[0].shortDescription?.includes('ke sath') || parsed[0].titleUrdu) {
            return INITIAL_PRODUCTS;
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  const [profile, setProfile] = useState<CreatorProfile>(() => {
    try {
      const saved = localStorage.getItem('affiliate_hub_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Automatically migrate if old name was stored
          if (parsed.name === 'Sagar Khan Reviews' || !parsed.name || (typeof parsed.bio === 'string' && parsed.bio.includes('Main rozmarrah'))) {
            return INITIAL_CREATOR_PROFILE;
          }
          return { ...INITIAL_CREATOR_PROFILE, ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CREATOR_PROFILE;
  });

  const [lang, setLang] = useState<'ur' | 'en'>('en');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem('affiliate_hub_products', JSON.stringify(products));
    } catch {
      // storage quota or disabled
    }
  }, [products]);

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem('affiliate_hub_profile', JSON.stringify(profile));
    } catch {
      // storage quota or disabled
    }
  }, [profile]);

  // Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleSaveProfile = (updatedProfile: CreatorProfile) => {
    setProfile(updatedProfile);
  };

  const handleTrackClick = (productId: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, clicksCount: item.clicksCount + 1 } : item
      )
    );
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) =>
        prev ? { ...prev, clicksCount: prev.clicksCount + 1 } : null
      );
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all products and creator profile to default English demo items?')) {
      setProducts(INITIAL_PRODUCTS);
      setProfile(INITIAL_CREATOR_PROFILE);
      localStorage.removeItem('affiliate_hub_products');
      localStorage.removeItem('affiliate_hub_profile');
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        (p.titleUrdu && p.titleUrdu.toLowerCase().includes(query)) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.platform.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      }
      if (sortBy === 'clicks') return b.clicksCount - a.clicksCount;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      // Default: featured
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  const totalClicks = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.clicksCount || 0), 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Hero Storefront Banner */}
      <HeroBanner
        profile={profile}
        totalProducts={products.length}
        totalClicks={totalClicks}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        lang={lang}
      />

      {/* Category Navigation & Sort */}
      <CategoryFilter
        categories={INITIAL_CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryCounts={categoryCounts}
        sortBy={sortBy}
        onSortChange={setSortBy}
        lang={lang}
      />

      {/* Main Product Showcase Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>
                {activeCategory === 'all'
                  ? 'All Recommended Deals & Reviews'
                  : INITIAL_CATEGORIES.find(c => c.id === activeCategory)?.name}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredProducts.length} curated products with video demos & direct affiliate deals
            </p>
          </div>

          {/* Quick Add Product Trigger */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-dashed border-orange-400 bg-orange-50/50 hover:bg-orange-100/70 text-orange-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Product</span>
          </button>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={setSelectedProduct}
                onTrackClick={handleTrackClick}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <PackageSearch className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No products found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or add a brand new item.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item Now</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        profile={profile}
        onClose={() => setSelectedProduct(null)}
        onTrackClick={handleTrackClick}
        lang={lang}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
        lang={lang}
      />

      <CreatorProfileModal
        isOpen={isProfileModalOpen}
        profile={profile}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
        lang={lang}
      />

      <AffiliateGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <Footer
        profile={profile}
        onResetData={handleResetData}
        lang={lang}
      />

    </div>
  );
}
