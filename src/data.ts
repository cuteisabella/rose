import { Post, MediaItem } from './types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Paris Haute Couture Fashion Week: My Exclusive Front-Row Lookbook',
    category: 'Fashion',
    slug: 'paris-haute-couture-front-row-lookbook',
    excerpt: 'Stepping into Paris Fashion Week with custom bespoke tweed and silk ensembles. Here is my breakdown of this season’s ultimate silhouettes and statement accessories.',
    content: `Paris in autumn holds a magnetic allure that words seldom capture. Between the cobbled avenues of Saint-Germain and the majestic gilded halls of the Grand Palais, this year's Haute Couture week was an awakening in structured minimalism paired with unabashed opulence.\n\nMy front-row philosophy has always leaned toward intentional contrast: tailored wool coats paired with delicate hand-stitched lace corsetry, finished with handcrafted Florentine leather boots.\n\nWhen curating your wardrobe for high-visibility events, focus on one anchor statement piece—whether it is a vintage Chanel tweed jacket or architectural Cartier earrings—and keep the remainder of your canvas quietly composed.`,
    coverImage: '/assets/aistudio/Woman_walking_on_Parisian_avenue_a0744d85_8995b189.jpg',
    readTime: '4 min read',
    publishedAt: 'Today, 08:30 AM',
    isPrivate: false,
    views: 14820,
    likes: 2190,
    commentsCount: 142,
    tags: ['Fashion', 'Paris', 'Haute Couture', 'Style Guide']
  },
  {
    id: 'post-2',
    title: 'Midnight in St. Germain: Secret Gastronomic Gems & Vintage Champagne Pairings',
    category: 'Food',
    slug: 'midnight-st-germain-secret-dining',
    excerpt: 'An intimate culinary itinerary through private rooftop salons and speakeasies with breathtaking views of the illuminated Eiffel Tower.',
    content: `Gastronomy is more than nourishment; it is an intimate art form of ambiance, conversation, and palate discovery.\n\nLast night on the terrace overlooking the illuminated spire of the Eiffel Tower, we tasted pan-seared sea scallops garnished with French black truffles and paired with a crisp 2012 Dom Pérignon Vintage.\n\nIn this exclusive guide, I am sharing my personal private list of hidden Parisian dining salons where discretion and culinary transcendence meet.`,
    coverImage: '/assets/aistudio/Woman_dining_in_European_restaurant_4f78660a_e2f2c0ce.jpg',
    readTime: '5 min read',
    publishedAt: 'Yesterday, 07:15 PM',
    isPrivate: false,
    views: 18540,
    likes: 3120,
    commentsCount: 204,
    tags: ['Food', 'Fine Dining', 'Parisian Nights', 'Luxury Lifestyle']
  },
  {
    id: 'post-3',
    title: 'The Art of Seduction & Unapologetic Feminine Confidence',
    category: 'Lifestyle',
    slug: 'art-of-seduction-feminine-confidence',
    excerpt: 'True magnetism is an internal architecture. How cultivating emotional sovereignty and sensual body confidence transforms every room you enter.',
    content: `Confidence is never loud. It does not plead for attention; it commands presence simply by inhabiting its own skin with grace and unyielding poise.\n\nOver the years of living in the public eye, I learned that magnetic sensuality begins in solitude: how you speak to your reflection, the textures you drape over your body when no one is watching, and the boundary lines you hold with quiet firmness.\n\nHere are the three foundational daily rituals I practice to stay grounded, vibrant, and unapologetically radiant.`,
    coverImage: '/assets/aistudio/Woman_holding_champagne_wearing___124dc2f9_a7829ef8.jpg',
    readTime: '6 min read',
    publishedAt: 'Nov 11, 2026',
    isPrivate: false,
    views: 29800,
    likes: 5410,
    commentsCount: 388,
    tags: ['Lifestyle', 'Mindset', 'Sensuality', 'Empowerment']
  },
  {
    id: 'post-4',
    title: '[VIP EXCLUSIVE] Late Night Penthouse Diaries: Uncensored Behind the Scenes',
    category: 'VIP Private',
    slug: 'vip-late-night-penthouse-diaries',
    excerpt: 'Unlocked only for Premium Subscribers. Unfiltered high-resolution boudoir gallery, intimate video confessions, and unedited clips from my latest private shoot.',
    content: `Welcome to my private sanctum. Here behind closed velvet doors, there are no filters, no public algorithms, and no censorship.\n\nIn this exclusive VIP entry, I share the full 4K bedroom gallery and intimate video monologue recorded at 2:00 AM after the charity gala. We talk about desire, secret fantasies, and what happens when the cameras stop rolling.\n\nThank you for supporting my unfiltered art and creative freedom. Enjoy the private media vault below.`,
    coverImage: '/assets/aistudio/Woman_posing_in_velvet_lounge_b580c8e1_90ecfd54.jpg',
    readTime: '8 min read',
    publishedAt: 'Nov 10, 2026',
    isPrivate: true,
    views: 12450,
    likes: 4120,
    commentsCount: 512,
    tags: ['VIP Private', 'Uncensored', 'Late Night', 'Boudoir']
  },
  {
    id: 'post-5',
    title: 'Morning Glow & High-Impact Skincare: Secrets to Flawless Camera Skin',
    category: 'Beauty Tips',
    slug: 'morning-glow-high-impact-skincare',
    excerpt: 'From ice-globe facial lymphatic drainage to peptide micro-infusion: the exact regimen I use before 14-hour studio shoots.',
    content: `When high-definition 4K lenses zoom in, you cannot rely purely on heavy concealers. The skin itself must possess an unmistakable dew and firmness.\n\nMy morning protocol starts with cryo-stimulation to instantly debuff under-eye lymphatic fluid, followed by cold-pressed rosehip oil and medical-grade barrier peptides.\n\nNever neglect your décolletage and neck—these reveal grace just as prominently as the facial profile.`,
    coverImage: '/assets/aistudio/Woman_applying_perfume_at_vanity_351a28d7_bc1d222f.jpg',
    readTime: '4 min read',
    publishedAt: 'Nov 09, 2026',
    isPrivate: false,
    views: 11200,
    likes: 1980,
    commentsCount: 94,
    tags: ['Beauty Tips', 'Skincare', 'Glow', 'Wellness']
  },
  {
    id: 'post-6',
    title: '[VIP EXCLUSIVE] Silk & Velvet: Private Boudoir Cinema Experience',
    category: 'VIP Private',
    slug: 'vip-silk-velvet-boudoir-cinema',
    excerpt: 'Sensual cinematic 4K video reel and high-res photo strip captured in Milan. Strictly reserved for verified VIP members.',
    content: `An exquisite tribute to timeless cinema noir and erotic elegance. Filmed on Kodak 35mm film stock in a private villa in Lake Como.\n\nThis video and companion 24-photo collection is strictly for Black Diamond and VIP Members. Please respect privacy terms and do not record or screenshot.`,
    coverImage: '/assets/aistudio/Woman_posing_in_penthouse_bedroom_c3ba8a28_7c06ff4c.jpg',
    readTime: 'VIP Video (14 min)',
    publishedAt: 'Nov 08, 2026',
    isPrivate: true,
    views: 9840,
    likes: 3820,
    commentsCount: 420,
    tags: ['VIP Private', 'Boudoir Cinema', '4K Reel', 'Sensual']
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'media-1',
    title: 'Penthouse Skyline Serenade in Emerald Sequin',
    type: 'image',
    mediaUrl: '/assets/aistudio/Woman_holding_champagne_in_apart__056e7738_c6ff447a.jpg',
    thumbnailUrl: '/assets/aistudio/Woman_holding_champagne_in_apart__056e7738_c6ff447a.jpg',
    isPrivate: false,
    category: 'Lifestyle',
    likes: 4200,
    description: 'Golden hour at the Manhattan skyline penthouse in bespoke emerald gown.'
  },
  {
    id: 'media-2',
    title: 'Parisian Autumn & Boulevard Atelier Moments',
    type: 'image',
    mediaUrl: '/assets/aistudio/Woman_standing_in_Parisian_court__151c9756_9b9c6330.jpg',
    thumbnailUrl: '/assets/aistudio/Woman_standing_in_Parisian_court__151c9756_9b9c6330.jpg',
    isPrivate: false,
    category: 'Fashion',
    likes: 3100,
    description: 'Espresso and haute couture conversations in a sunlit Parisian courtyard.'
  },
  {
    id: 'media-3',
    title: 'Eiffel Tower Night Terrace & Truffle Gastronomy',
    type: 'image',
    mediaUrl: '/assets/aistudio/Woman_dining_on_Paris_rooftop_e598019a_cae972e1.jpg',
    thumbnailUrl: '/assets/aistudio/Woman_dining_on_Paris_rooftop_e598019a_cae972e1.jpg',
    isPrivate: false,
    category: 'Food',
    likes: 3890,
    description: 'Candlelit dining and vintage Dom Pérignon overlooking the Parisian cityscape.'
  },
  {
    id: 'media-4',
    title: '[VIP] Velvet Lounge Sensual Midnight Sessions (Full 4K Reel)',
    type: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/assets/aistudio/Woman_in_velvet_lounge_e6be40ef_0dd1e4ae.jpg',
    duration: '06:45',
    isPrivate: true,
    category: 'VIP Private',
    likes: 7200,
    description: 'Exclusive private sensual lounge recording with intimate Q&A and boudoir visuals.'
  },
  {
    id: 'media-5',
    title: '[VIP] Golden Silk Suite Uncut Gallery',
    type: 'image',
    mediaUrl: '/assets/aistudio/Woman_in_velvet_lounge_b8f446b5_0ff02489.jpg',
    thumbnailUrl: '/assets/aistudio/Woman_in_velvet_lounge_b8f446b5_0ff02489.jpg',
    isPrivate: true,
    category: 'VIP Private',
    likes: 5400,
    description: 'Uncensored 35mm film captures from the suite lounge.'
  },
  {
    id: 'media-6',
    title: 'Morning Sun Glow & Bare Face Routine',
    type: 'image',
    mediaUrl: '/assets/aistudio/Woman_smiling_in_portrait_b51317f6_ff9f7e36.jpg',
    thumbnailUrl: '/assets/aistudio/Woman_smiling_in_portrait_b51317f6_ff9f7e36.jpg',
    isPrivate: false,
    category: 'Beauty Tips',
    likes: 2950,
    description: 'Natural sun-drenched portrait with glass skin morning routine.'
  }
];

export const AUTO_POST_TEMPLATES = [
  {
    category: 'Fashion',
    titles: [
      'Monochrome Elegance: How to Style Cashmere and Leather This Season',
      'The Capsule Wardrobe of an International Globetrotter',
      'High-End Handbag Investment Guide: Classics That Appreciate in Value',
      'Dressing for Private Soirees: Subtle Glamour vs Loud Statements',
      'Behind the Red Carpet: What Stylists Never Tell You About Fitting'
    ],
    excerpts: [
      'Curating pieces that stand the test of time through craftsmanship, cut, and effortless drape.',
      'A masterclass in effortless luxury styling with minimal packing and maximum sophistication.',
      'Discover which archival luxury pieces hold value and why quality leather always commands reverence.',
      'Tips for entering upscale evening gatherings with effortless grace and magnetic poise.',
      'An intimate recount of couture fittings, alteration secrets, and bespoke silhouettes.'
    ],
    coverImages: [
      '/assets/aistudio/Woman_standing_in_Parisian_court__783b8e53_d2cf3b29.jpg',
      '/assets/aistudio/Woman_standing_in_hotel_interior_982096a3_7da5f801.jpg'
    ]
  },
  {
    category: 'Lifestyle',
    titles: [
      'Rituals of High-Value Living: Designing Your Sacred Evening Sanctuary',
      'Solo Travel in Monte Carlo: Ocean Views and Golden Solitude',
      'How to Cultivate an Aura of Irresistible Feminine Mystery',
      'Digital Detox in the Swiss Alps: Finding Peace Away From Social Feeds',
      'Hosting the Ultimate Intimate Dinner Party: Lighting, Scents, and Ambiance'
    ],
    excerpts: [
      'Transforming your living space into a haven of aromatic serenity, weighted silks, and ambient warmth.',
      'Reflections on autonomy, luxury coastal hideaways, and the pure joy of discovering yourself abroad.',
      'Sensory presence, subtle body language, and mastering the silent power of listening.',
      'Disconnecting to reconnect with your creative spirit high above the snow-capped mountain peaks.',
      'The blueprint for unforgettable evenings where conversation flows as effortlessly as vintage wine.'
    ],
    coverImages: [
      '/assets/aistudio/Woman_standing_by_penthouse_window_a38abb75_6bc71053.jpg',
      '/assets/aistudio/Woman_standing_by_penthouse_window_75351328_fdc12cd2.jpg'
    ]
  },
  {
    category: 'Food',
    titles: [
      'Michelin-Starred Secrets: The Truffle Risotto That Ruined All Others for Me',
      'Caviar & Vintage Champagne: A Modern Connoisseur’s Tasting Notes',
      'Hidden Patisseries of Montmartre: Where Chefs Go on Their Days Off',
      'Late-Night Oysters and Chablis in Venice: A Sensory Love Affair',
      'The Art of Gourmet Plating: Elevating Home Dinners into Five-Star Art'
    ],
    excerpts: [
      'Slow-cooked Carnaroli rice, 36-month aged Parmigiano Reggiano, and freshly shaved white truffles.',
      'Understanding pairing temperatures, mother-of-pearl spoons, and the nuances of effervescence.',
      'A sweet journey through clandestine bakeries making the crispiest mille-feuille and pistache eclairs.',
      'Dining beside quiet Venetian canals under starry skies with freshly harvested seafood delicacies.',
      'Simple culinary styling tricks that make everyday dining feel like an opulent restaurant banquet.'
    ],
    coverImages: [
      '/assets/aistudio/Woman_dining_in_restaurant_bff0097d_96d4306c.jpg',
      '/assets/aistudio/Woman_dining_in_restaurant_ec855e40_c299652e.jpg'
    ]
  },
  {
    category: 'VIP Private',
    titles: [
      '[VIP EXCLUSIVE] Midnight Confessions: What I Never Share on Instagram',
      '[VIP EXCLUSIVE] The Private Boudoir Shoot: Uncut 4K Visual Poetry',
      '[VIP EXCLUSIVE] Bedroom Whispers: Late-Night Audio Note & Intimate Q&A',
      '[VIP EXCLUSIVE] Velvet Suite Private Access: Behind the Velvet Rope',
      '[VIP EXCLUSIVE] Golden Hour Uncensored: Raw 35mm Film Archive'
    ],
    excerpts: [
      'Reserved strictly for VIP Members. Candid reflections on intimacy, vulnerability, and unfiltered desires.',
      'An exquisite, high-aesthetic adult fine art photo strip captured in our private Parisian penthouse.',
      'Put on your headphones for an intimate personal voice diary and answers to your private member inquiries.',
      'Exclusive behind-the-scenes moments from Isabella’s private lounge sessions and VIP events.',
      'Uncompressed, authentic film captures with zero post-processing or censorship.'
    ],
    coverImages: [
      '/assets/aistudio/Woman_posing_in_bedroom_studio_a1861a40_2539f43d.jpg',
      '/assets/aistudio/Woman_sitting_on_bedroom_chair_7a919e47_70740fce.jpg'
    ]
  },
  {
    category: 'Beauty Tips',
    titles: [
      'The 10-Minute Sculpted Jawline Routine Models Swear By',
      'Red Carpet Fragrance Layering: How to Leave an Unforgettable Scent Trail',
      'Cryotherapy at Home: Reversing Dull Skin in Under 5 Minutes',
      'Lip Hydration Protocols for Long-Wearing Velvet Mattes',
      'The Silk Pillowcase & Hair Health Miracle: Facts vs Marketing'
    ],
    excerpts: [
      'Gua Sha techniques and lymphatic drainage movements that immediately define facial contours.',
      'Pairing smoky amber bases with floral highs to create a signature bespoke olfactory imprint.',
      'Simple ice-bowl immersion tricks to boost circulation, tighten pores, and banish morning puffiness.',
      'Exfoliating and sealing lips for a supple, pillow-soft texture under bold red lipstick.',
      'How switching to high-grade mulberry silk prevents friction breakage and preserves nighttime serums.'
    ],
    coverImages: [
      '/assets/aistudio/Woman_applying_perfume_at_vanity_a2a86bc2_bbfbce2a.jpg',
      '/assets/aistudio/Portrait_photography_of_woman_sm__3742a9ef_1e872db5.jpg'
    ]
  }
];
