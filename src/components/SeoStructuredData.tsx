import React, { useEffect } from 'react';
import { Product } from '../types';

interface SeoStructuredDataProps {
  products: Product[];
  selectedProduct?: Product | null;
}

// Helper to set or create <meta> elements safely
function updateMetaTag(attrType: 'name' | 'property', attrValue: string, content: string) {
  let tag = document.querySelector(`meta[${attrType}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrType, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export const SeoStructuredData: React.FC<SeoStructuredDataProps> = ({
  products,
  selectedProduct,
}) => {
  // 1. Dynamic document title, meta descriptions, and OpenGraph/Twitter social cards
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (selectedProduct) {
      const pageTitle = `${selectedProduct.title} Review & Deals (2026) – Master Reviews`;
      document.title = pageTitle;

      const desc = selectedProduct.metaDescription || 
        `${selectedProduct.title} honest in-depth review. Features: ${selectedProduct.features?.slice(0, 2).join(', ')}. Compare ratings, pros & cons, and verified discount deals on ${selectedProduct.platform}.`;
      
      const keywords = selectedProduct.seoKeywords?.length 
        ? selectedProduct.seoKeywords.join(', ')
        : `${selectedProduct.title}, review, specs, pros and cons, discount deal, ${selectedProduct.platform}, ${selectedProduct.category}`;

      const productCanonical = `${origin}${pathname}#${selectedProduct.id}`;
      const img = selectedProduct.imageUrl;

      // Meta tags
      updateMetaTag('name', 'description', desc);
      updateMetaTag('name', 'keywords', keywords);

      // OpenGraph
      updateMetaTag('property', 'og:type', 'product');
      updateMetaTag('property', 'og:title', pageTitle);
      updateMetaTag('property', 'og:description', desc);
      updateMetaTag('property', 'og:image', img);
      updateMetaTag('property', 'og:url', productCanonical);
      updateMetaTag('property', 'og:site_name', 'Master Reviews');
      updateMetaTag('property', 'product:price:amount', selectedProduct.price.toFixed(2));
      updateMetaTag('property', 'product:price:currency', selectedProduct.currency === '$' ? 'USD' : selectedProduct.currency);
      updateMetaTag('property', 'product:availability', 'in stock');
      updateMetaTag('property', 'product:brand', selectedProduct.platform);

      // Twitter Cards
      updateMetaTag('name', 'twitter:card', 'summary_large_image');
      updateMetaTag('name', 'twitter:title', pageTitle);
      updateMetaTag('name', 'twitter:description', desc);
      updateMetaTag('name', 'twitter:image', img);

      // Canonical
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = productCanonical;

    } else {
      const defaultTitle = 'Master Reviews – Best Verified Tech Deals, Gadget Reviews & Buying Guides (2026)';
      document.title = defaultTitle;

      const defaultDesc = 'Discover top-rated trending products with honest reviews, hands-on video demos, price comparisons, and verified discount deals across Amazon, Daraz, and AliExpress.';
      const defaultKeywords = 'Master Reviews, product reviews, best tech deals, trending gadgets, amazon affiliate, daraz discount, aliexpress deals, video reviews, unboxing, buyer guide, gadget discounts';
      const defaultUrl = `${origin}${pathname}`;
      const defaultImg = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80';

      updateMetaTag('name', 'description', defaultDesc);
      updateMetaTag('name', 'keywords', defaultKeywords);

      updateMetaTag('property', 'og:type', 'website');
      updateMetaTag('property', 'og:title', defaultTitle);
      updateMetaTag('property', 'og:description', defaultDesc);
      updateMetaTag('property', 'og:image', defaultImg);
      updateMetaTag('property', 'og:url', defaultUrl);
      updateMetaTag('property', 'og:site_name', 'Master Reviews');

      updateMetaTag('name', 'twitter:card', 'summary_large_image');
      updateMetaTag('name', 'twitter:title', defaultTitle);
      updateMetaTag('name', 'twitter:description', defaultDesc);
      updateMetaTag('name', 'twitter:image', defaultImg);

      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = defaultUrl;
    }
  }, [selectedProduct]);

  // 2. Dynamic Schema.org JSON-LD generation for all catalog products
  useEffect(() => {
    let scriptTag = document.getElementById('seo-dynamic-products-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-dynamic-products-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

    const items = products.map((prod, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: prod.title,
        description: prod.metaDescription || prod.shortDescription || prod.fullDescription,
        image: prod.galleryImages && prod.galleryImages.length > 0 ? prod.galleryImages : [prod.imageUrl],
        sku: prod.id,
        mpn: prod.id,
        category: prod.category,
        brand: {
          '@type': 'Brand',
          name: prod.platform || 'Master Reviews',
        },
        offers: {
          '@type': 'Offer',
          price: prod.price.toFixed(2),
          priceCurrency: prod.currency === '$' ? 'USD' : prod.currency,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: 'https://schema.org/InStock',
          url: prod.affiliateUrl,
          seller: {
            '@type': 'Organization',
            name: prod.platform,
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (prod.rating || 4.8).toFixed(1),
          reviewCount: (prod.reviewsCount || 10).toString(),
          bestRating: '5',
          worstRating: '1',
        },
        review: {
          '@type': 'Review',
          author: {
            '@type': 'Organization',
            name: 'Master Reviews Editorial Team',
          },
          datePublished: '2026-01-15',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: (prod.rating || 4.8).toFixed(1),
            bestRating: '5',
          },
          reviewBody: prod.fullDescription || prod.shortDescription,
        },
      },
    }));

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${origin}${pathname}#website`,
          url: `${origin}${pathname}`,
          name: 'Master Reviews',
          description: 'Discover top-rated trending products with honest reviews, hands-on video demos, price comparisons, and verified discount deals.',
          inLanguage: 'en',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${origin}${pathname}?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'ItemList',
          '@id': `${origin}${pathname}#catalog`,
          name: 'Master Reviews Top Rated Products Catalog',
          description: 'Curated and tested high-performance products with verified discount deals.',
          numberOfItems: products.length,
          itemListElement: items,
        },
      ],
    };

    scriptTag.textContent = JSON.stringify(schemaData);
  }, [products]);

  // 3. Focused Schema for selected product (modal view with rich reviews, pros & cons, video object)
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

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const productUrl = `${origin}${pathname}#${selectedProduct.id}`;

    const singleData: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${productUrl}-product`,
      name: selectedProduct.title,
      description: selectedProduct.metaDescription || selectedProduct.fullDescription || selectedProduct.shortDescription,
      image: selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0 
        ? selectedProduct.galleryImages 
        : [selectedProduct.imageUrl],
      sku: selectedProduct.id,
      mpn: selectedProduct.id,
      category: selectedProduct.category,
      brand: {
        '@type': 'Brand',
        name: selectedProduct.platform || 'Master Reviews',
      },
      offers: {
        '@type': 'Offer',
        price: selectedProduct.price.toFixed(2),
        priceCurrency: selectedProduct.currency === '$' ? 'USD' : selectedProduct.currency,
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        url: selectedProduct.affiliateUrl,
        seller: {
          '@type': 'Organization',
          name: selectedProduct.platform,
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (selectedProduct.rating || 4.8).toFixed(1),
        reviewCount: (selectedProduct.reviewsCount || 1).toString(),
        bestRating: '5',
        worstRating: '1',
      },
      review: {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Master Reviews Editorial Reviewer',
        },
        datePublished: '2026-01-15',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: (selectedProduct.rating || 4.8).toFixed(1),
          bestRating: '5',
        },
        reviewBody: selectedProduct.fullDescription || selectedProduct.shortDescription,
        positiveNotes: selectedProduct.pros && selectedProduct.pros.length > 0 ? {
          '@type': 'ItemList',
          itemListElement: selectedProduct.pros.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p,
          })),
        } : undefined,
        negativeNotes: selectedProduct.cons && selectedProduct.cons.length > 0 ? {
          '@type': 'ItemList',
          itemListElement: selectedProduct.cons.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c,
          })),
        } : undefined,
      },
      additionalProperty: selectedProduct.features?.map(feature => ({
        '@type': 'PropertyValue',
        name: 'Feature',
        value: feature,
      })),
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${origin}${pathname}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: selectedProduct.category.toUpperCase(),
            item: `${origin}${pathname}#${selectedProduct.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: selectedProduct.title,
            item: productUrl,
          },
        ],
      },
    };

    if (selectedProduct.videoUrl) {
      singleData.video = {
        '@type': 'VideoObject',
        name: `${selectedProduct.title} Hands-On Review & Video Demo`,
        description: `Watch hands-on video demonstration and feature test of ${selectedProduct.title}`,
        thumbnailUrl: selectedProduct.imageUrl,
        uploadDate: '2026-01-15T08:00:00+00:00',
        contentUrl: selectedProduct.videoUrl,
        embedUrl: selectedProduct.videoUrl,
      };
    }

    singleScript.textContent = JSON.stringify(singleData);
  }, [selectedProduct]);

  return null;
};
