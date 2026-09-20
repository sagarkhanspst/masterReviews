import React, { useEffect } from 'react';
import { Product } from '../types';

interface SeoStructuredDataProps {
  products: Product[];
  selectedProduct?: Product | null;
}

export const SeoStructuredData: React.FC<SeoStructuredDataProps> = ({
  products,
  selectedProduct,
}) => {
  // 1. Dynamic document title & canonical updates
  useEffect(() => {
    const baseTitle = 'Master Reviews';
    if (selectedProduct) {
      document.title = `${selectedProduct.title} Review & Deals – ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    // Dynamic canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href.split('#')[0];
  }, [selectedProduct]);

  // 2. Dynamic Schema.org JSON-LD generation for products & search engines
  useEffect(() => {
    let scriptTag = document.getElementById('seo-dynamic-products-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-dynamic-products-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const items = products.map((prod, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: prod.title,
        description: prod.shortDescription || prod.fullDescription,
        image: prod.imageUrl,
        brand: {
          '@type': 'Brand',
          name: prod.platform || 'Master Reviews',
        },
        offers: {
          '@type': 'Offer',
          price: prod.price.toString(),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: prod.affiliateUrl,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (prod.rating || 4.8).toString(),
          reviewCount: (prod.reviewsCount || 10).toString(),
          bestRating: '5',
          worstRating: '1',
        },
        review: {
          '@type': 'Review',
          author: {
            '@type': 'Organization',
            name: 'Master Reviews',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: (prod.rating || 4.8).toString(),
          },
          reviewBody: prod.fullDescription || prod.shortDescription,
        },
      },
    }));

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Master Reviews Top Rated Products Catalog',
      numberOfItems: products.length,
      itemListElement: items,
    };

    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      // clean up if unmounted
    };
  }, [products]);

  // 3. Focused Schema for selected product (modal view)
  useEffect(() => {
    if (!selectedProduct) {
      const existing = document.getElementById('seo-single-product-jsonld');
      if (existing) existing.remove();
      return;
    }

    let singleScript = document.getElementById('seo-single-product-jsonld') as HTMLScriptElement | null;
    if (!singleScript) {
      singleScript = document.createElement('script');
      singleScript.id = 'seo-single-product-jsonld';
      singleScript.type = 'application/ld+json';
      document.head.appendChild(singleScript);
    }

    const singleData: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: selectedProduct.title,
      description: selectedProduct.fullDescription || selectedProduct.shortDescription,
      image: selectedProduct.imageUrl,
      category: selectedProduct.category,
      offers: {
        '@type': 'Offer',
        price: selectedProduct.price.toString(),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: selectedProduct.affiliateUrl,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (selectedProduct.rating || 4.8).toString(),
        reviewCount: (selectedProduct.reviewsCount || 1).toString(),
      },
    };

    if (selectedProduct.videoUrl) {
      singleData.video = {
        '@type': 'VideoObject',
        name: `${selectedProduct.title} Hands-On Review Video`,
        description: `Watch hands-on video demonstration and feature test of ${selectedProduct.title}`,
        thumbnailUrl: selectedProduct.imageUrl,
        embedUrl: selectedProduct.videoUrl,
        uploadDate: '2026-01-01',
      };
    }

    singleScript.textContent = JSON.stringify(singleData);
  }, [selectedProduct]);

  return null;
};
