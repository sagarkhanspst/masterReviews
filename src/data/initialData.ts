import { Product, CreatorProfile, Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Products', nameUrdu: 'All Products', iconName: 'Sparkles' },
  { id: 'tech', name: 'Tech & Electronics', nameUrdu: 'Tech & Electronics', iconName: 'Laptop' },
  { id: 'gadgets', name: 'Smart Gadgets', nameUrdu: 'Smart Gadgets', iconName: 'Smartphone' },
  { id: 'home', name: 'Home & Kitchen', nameUrdu: 'Home & Kitchen', iconName: 'Home' },
  { id: 'fitness', name: 'Health & Fitness', nameUrdu: 'Health & Fitness', iconName: 'Activity' },
  { id: 'fashion', name: 'Fashion & Wear', nameUrdu: 'Fashion & Wear', iconName: 'Shirt' },
  { id: 'beauty', name: 'Beauty & Care', nameUrdu: 'Beauty & Care', iconName: 'Heart' },
];

export const INITIAL_CREATOR_PROFILE: CreatorProfile = {
  name: 'Master Reviews',
  handle: '@masterreviews',
  tagline: 'Honest Gadget & Product Reviews with Direct Best-Price Deals',
  bio: 'We rigorously test and review the top trending gadgets, electronics, and daily essentials. Shop through our verified affiliate links below to secure authentic items with maximum discounted pricing!',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  youtubeUrl: 'https://youtube.com',
  tiktokUrl: 'https://tiktok.com',
  instagramUrl: 'https://instagram.com',
  whatsappNumber: '+12345678900',
  facebookUrl: 'https://facebook.com',
  telegramUrl: 'https://t.me',
  disclosureText: 'Affiliate Disclosure: When you purchase through our links, we may earn an affiliate commission at no additional cost to you. We only recommend authentic, verified, and high-performance products.'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Ultra Noise-Cancelling Wireless Headphones Pro',
    titleUrdu: 'Ultra Noise-Cancelling Wireless Headphones Pro',
    category: 'tech',
    price: 49.99,
    originalPrice: 89.99,
    currency: '$',
    rating: 4.8,
    reviewsCount: 1240,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Hybrid Active Noise Cancellation (ANC) with 40-hour ultra battery backup and crystal-clear studio acoustic audio.',
    fullDescription: 'These wireless over-ear headphones are engineered for travel, workouts, gaming, and remote work. Featuring Bluetooth 5.3 instant pairing, deep dynamic bass response, and breathable memory foam earcups that offer all-day fatigue-free listening comfort.',
    features: [
      'Hybrid Active Noise Cancellation (-35dB)',
      '40-hour non-stop battery life with USB-C quick charge',
      'Ultra-soft memory foam ear cushions',
      'Built-in dual microphones with AI noise reduction',
      'Foldable compact design with premium travel pouch'
    ],
    pros: [
      'Exceptional battery life (10-minute charge gives 4 hours playback)',
      'Powerful noise cancellation blocks ambient room and plane noise',
      'Unbeatable audio quality at this budget-friendly price point'
    ],
    cons: [
      'For zero-latency competitive gaming, wired mode is recommended',
      'Carrying case is soft fabric rather than a hard shell'
    ],
    affiliateUrl: 'https://www.amazon.com/dp/B08PZHYWJS?tag=youraffiliate-20',
    platform: 'Amazon',
    badge: 'Best Seller',
    clicksCount: 342,
    featured: true
  },
  {
    id: 'prod-2',
    title: '4K Ultra HD Action & Vlog Camera with Dual Screens',
    titleUrdu: '4K Ultra HD Action & Vlog Camera with Dual Screens',
    category: 'gadgets',
    price: 69.50,
    originalPrice: 119.00,
    currency: '$',
    rating: 4.7,
    reviewsCount: 890,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/L_LUpnjgPso',
    shortDescription: 'Designed for vloggers and content creators: waterproof 4K 60FPS action camera featuring front & rear color touchscreens.',
    fullDescription: 'If you record outdoor sports, motorcycle rides, or travel vlogs, this camera delivers GoPro-level stabilization at a fraction of the cost. The 6-axis Electronic Image Stabilization (EIS) eliminates shake and vibrations seamlessly.',
    features: [
      'Real 4K 60FPS Video & 20MP High-Resolution Still Photos',
      'Dual Color Screens (Front 1.4" preview + Rear 2.0" Touchscreen)',
      'Waterproof up to 30 meters with included rugged casing',
      'Instant Wi-Fi smartphone transfer and remote app control',
      'Includes 2 rechargeable batteries & multi-mount accessory kit'
    ],
    pros: [
      'Front screen makes framing selfie shots and TikToks effortless',
      'Comes with a comprehensive mounting accessory bundle in the box',
      'Smooth EIS 2.0 stabilization even on bumpy bike rides'
    ],
    cons: [
      'Microphone sensitivity is best when used with an external mic in windy environments'
    ],
    affiliateUrl: 'https://www.aliexpress.com/item/100500123456.html?aff_fcid=sample',
    platform: 'AliExpress',
    badge: 'Hot Deal',
    clicksCount: 289,
    featured: true
  },
  {
    id: 'prod-3',
    title: 'Smart Fitness & Health Tracker Smartwatch with AMOLED',
    titleUrdu: 'Smart Fitness & Health Tracker Smartwatch with AMOLED',
    category: 'fitness',
    price: 34.99,
    originalPrice: 59.99,
    currency: '$',
    rating: 4.9,
    reviewsCount: 2150,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Continuous heart rate, SpO2 blood oxygen, sleep stage tracking, and 100+ sports modes with IP68 water resistance.',
    fullDescription: 'Track your daily fitness routines and stay connected with call notifications, SMS alerts, and app previews right on your wrist. Features a brilliant Always-On AMOLED screen visible even under direct sunlight.',
    features: [
      '1.43" Vivid AMOLED Always-On Display with 466x466 resolution',
      '24/7 Heart Rate, SpO2 Oxygen & Deep Sleep Quality Monitor',
      'Bluetooth Calling & Real-Time Push Notification Sync',
      'IP68 Waterproof rating certified for rain and swimming',
      'Up to 12 days battery life on a single fast charge'
    ],
    pros: [
      'Bright AMOLED screen remains easily legible in harsh sunlight',
      'Exceptional 10-12 day real-world battery endurance',
      'Premium sleek aluminum alloy bezel build'
    ],
    cons: [
      'Does not support third-party app store installations'
    ],
    affiliateUrl: 'https://www.daraz.pk/products/smartwatch-sample.html',
    platform: 'Daraz',
    badge: 'Editor\'s Choice',
    clicksCount: 512,
    featured: true
  },
  {
    id: 'prod-4',
    title: 'Precision Ergonomic Wireless Vertical Mouse',
    titleUrdu: 'Precision Ergonomic Wireless Vertical Mouse',
    category: 'tech',
    price: 24.99,
    originalPrice: 42.00,
    currency: '$',
    rating: 4.6,
    reviewsCount: 670,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Engineered with a 57-degree natural handshake angle to relieve wrist strain and prevent carpal tunnel discomfort.',
    fullDescription: 'If you spend long hours at a desk, traditional flat mice twist your forearm. This vertical design encourages a neutral handshake posture that reduces muscular tension by up to 60%. Equipped with whisper-quiet click switches and dual connectivity.',
    features: [
      '57-degree scientific ergonomic natural handshake angle',
      'Whisper-quiet silent switches for quiet office environments',
      'Adjustable DPI precision sensors (800 / 1200 / 1600)',
      'Rechargeable 500mAh battery with modern USB-C charging',
      'Dual connection mode: Bluetooth 5.0 + 2.4GHz wireless dongle'
    ],
    pros: [
      'Instantly relieves wrist tension and forearm stiffness',
      'Click buttons are virtually noiseless and responsive',
      'Fast USB-C rechargeable without needing AA batteries'
    ],
    cons: [
      'Takes 1-2 days to build muscle memory if you have only used flat mice'
    ],
    affiliateUrl: 'https://www.amazon.com/dp/B07BNGZ2L2?tag=youraffiliate-20',
    platform: 'Amazon',
    badge: 'Top Rated',
    clicksCount: 174,
    featured: false
  },
  {
    id: 'prod-5',
    title: 'Compact Espresso Coffee Machine & Milk Frother',
    titleUrdu: 'Compact Espresso Coffee Machine & Milk Frother',
    category: 'home',
    price: 79.99,
    originalPrice: 135.00,
    currency: '$',
    rating: 4.8,
    reviewsCount: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Brew authentic café-quality espresso and creamy lattes at home with a 20-bar Italian high pressure pump.',
    fullDescription: 'Bring the barista experience into your home kitchen. Built with brushed stainless steel and a fast thermo-block heating system that heats up in just 45 seconds. The high-pressure steam wand produces silky microfoam for smooth lattes and cappuccinos.',
    features: [
      '20 Bar Italian Pump for rich crema and optimal flavor extraction',
      'Stainless steel steam milk frothing wand with adjustable power',
      'Thermo-block rapid heating system (ready in 45 seconds)',
      'Removable 1.2L transparent water tank for effortless refills',
      'Integrated top warming plate keeps cups preheated'
    ],
    pros: [
      'Heats up ultra-fast for quick morning coffee preparation',
      'Produces rich, golden crema consistently',
      'Very easy to disassemble and rinse clean'
    ],
    cons: [
      'Requires a separate coffee grinder if using whole coffee beans'
    ],
    affiliateUrl: 'https://www.amazon.com/dp/B08XYZ123?tag=youraffiliate-20',
    platform: 'Amazon',
    badge: 'Trending',
    clicksCount: 420,
    featured: true
  },
  {
    id: 'prod-6',
    title: 'RGB LED Gaming & Studio Desk Light Bar with Remote',
    titleUrdu: 'RGB LED Gaming & Studio Desk Light Bar with Remote',
    category: 'gadgets',
    price: 29.99,
    originalPrice: 49.99,
    currency: '$',
    rating: 4.7,
    reviewsCount: 540,
    imageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Screen-glare-free monitor mounted light bar designed to eliminate eye fatigue during late-night work and gaming.',
    fullDescription: 'Featuring an asymmetric optical design that illuminates only your desk surface without reflecting off your screen. The rear side features dynamic RGB ambiance lighting for immersive setups, controlled effortlessly via a wireless desktop rotary dial.',
    features: [
      'Asymmetric optical design prevents screen reflection & eye strain',
      'Rear-facing vibrant RGB mood backlighting with multiple lighting modes',
      'Wireless 2.4GHz rotary desktop controller dial',
      'Stepless brightness and color temperature adjustment (2700K - 6500K)',
      'Universal counterweight clamp fits both flat and curved monitors'
    ],
    pros: [
      'Completely glare-free illumination on the monitor panel',
      'Saves valuable desk workspace by clipping securely above screen',
      'Wireless rotary controller feels premium and responsive'
    ],
    cons: [
      'Requires a standard 5V/2A USB port on your PC, monitor, or wall adapter'
    ],
    affiliateUrl: 'https://www.aliexpress.com/item/100500987654.html',
    platform: 'AliExpress',
    badge: 'Hot Deal',
    clicksCount: 198,
    featured: false
  }
];

export const AFFILIATE_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Sign Up for Affiliate Programs',
    englishTitle: 'Sign Up for Affiliate Programs',
    desc: 'Register for free accounts on major affiliate networks like Amazon Associates, Daraz Affiliate Program, AliExpress Portals, or ClickBank. Once registered, you will generate your custom referral tracking links for any product.',
    tip: 'Tip: Registration is 100% free and gives you instant access to link generators.'
  },
  {
    step: 2,
    title: 'Add Products & Links to This Website',
    englishTitle: 'Add Products & Links to This Website',
    desc: 'Use the "+ Add Product" button on this storefront. Paste the product title, image URL, YouTube video demo or review link, honest pros & cons, and your affiliate referral link.',
    tip: 'Tip: Honest reviews with clear pros and cons convert up to 3x higher than plain links.'
  },
  {
    step: 3,
    title: 'Create Short Review / Unboxing Videos',
    englishTitle: 'Create Short Review / Unboxing Videos',
    desc: 'Produce 30 to 60-second unboxing, demonstration, or problem-solving clips on TikTok, Instagram Reels, and YouTube Shorts. Demonstrate how the product works in real life.',
    tip: 'Tip: Always end your videos with a clear call-to-action: "Check the link in my bio for the best discount!"'
  },
  {
    step: 4,
    title: 'Put This Website Link in Your Bio',
    englishTitle: 'Put This Website Link in Your Bio',
    desc: 'Add this storefront URL to your TikTok bio, Instagram bio, YouTube video descriptions, and WhatsApp status. Viewers will visit, watch reviews, and tap through to buy.',
    tip: 'Tip: Having a clean storefront lets visitors browse multiple recommended items simultaneously.'
  },
  {
    step: 5,
    title: 'Earn Commissions on Every Sale',
    englishTitle: 'Earn Commissions on Every Sale',
    desc: 'Whenever a visitor clicks your link and completes a purchase, the partner marketplace pays a commission (ranging from 3% to 20%) directly into your bank account or Payoneer.',
    tip: 'Tip: Many affiliate cookies remain active for 24 hours to 30 days, earning you commission on everything they buy!'
  }
];
