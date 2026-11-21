import { SiteSettings } from './types';

export type GalleryCategory =
  | 'Featured Hot'
  | 'Personal Bedroom'
  | 'Outdoor & Beach'
  | 'Boudoir & Silk'
  | 'Evening & Champagne'
  | 'Paris & Fashion'
  | 'Dining & Wine'
  | 'Skincare & Morning'
  | 'Penthouse & Studio';

export interface GalleryPhotoItem {
  id: string;
  filename: string;
  src: string;
  title: string;
  category: Exclude<GalleryCategory, 'Featured Hot'>;
  featured: boolean;
  isCustom?: boolean;
}

export const ALL_AISTUDIO_FILENAMES = [
  'Fashion_portrait_of_woman_in_59402bec_6b8b4e84.jpg',
  'Photorealistic_close-up_portrait__8357bd9b_2bd7b609.jpg',
  'Portrait_photography_of_woman_sm__3742a9ef_1e872db5.jpg',
  'Woman_adjusting_swimsuit_on_beach_4f62f311_f0df167f.jpg',
  'Woman_adjusting_swimsuit_on_beach_fd4d0534_c0fbb0ff.jpg',
  'Woman_adjusting_tight_swimsuit_o__46db7dc6_2c582c7c.jpg',
  'Woman_applying_perfume_at_vanity_1ed8375e_f5e6a312.jpg',
  'Woman_applying_perfume_at_vanity_351a28d7_bc1d222f.jpg',
  'Woman_applying_perfume_at_vanity_433dec4d_121aee73.jpg',
  'Woman_applying_perfume_at_vanity_a2a86bc2_bbfbce2a.jpg',
  'Woman_attending_Paris_Fashion_Week_12ce501d_e6fc73e9.jpg',
  'Woman_attending_Paris_Fashion_Week_9aa7e528_7689710f.jpg',
  'Woman_attending_fashion_week_3dbf3a75_68c964f6.jpg',
  'Woman_cooking_in_modern_kitchen_e16008cb_75476844.jpg',
  'Woman_creating_photorealistic_po__bd5e37b9_058b7cc4.jpg',
  'Woman_dining_in_European_restaurant_4f78660a_e2f2c0ce.jpg',
  'Woman_dining_in_European_restaurant_bdf8952d_b67d8b8e.jpg',
  'Woman_dining_in_European_restaurant_ce1a95f5_bf4a0611.jpg',
  'Woman_dining_in_restaurant_8fe7e549_f456961b.jpg',
  'Woman_dining_in_restaurant_9ed5f562_4d4199d9.jpg',
  'Woman_dining_in_restaurant_bff0097d_96d4306c.jpg',
  'Woman_dining_in_restaurant_ec855e40_c299652e.jpg',
  'Woman_dining_on_Paris_rooftop_ca52de81_2c162ebd.jpg',
  'Woman_dining_on_Paris_rooftop_e598019a_cae972e1.jpg',
  'Woman_doing_skincare_routine_d84a36ec_62be4561.jpg',
  'Woman_having_rooftop_dinner_in_d2bd83fd_3174c55d.jpg',
  'Woman_holding_champagne_in_apart__056e7738_c6ff447a.jpg',
  'Woman_holding_champagne_in_apart__30f556f6_15a585b2.jpg',
  'Woman_holding_champagne_in_apart__e76ad1b2_29aa52d1.jpg',
  'Woman_holding_champagne_wearing___124dc2f9_a7829ef8.jpg',
  'Woman_holding_coffee_at_cafe_3924849e_16c2aed6.jpg',
  'Woman_holding_coffee_at_cafe_6b379968_6b55ba14.jpg',
  'Woman_holding_coffee_at_cafe_ab4ecb2e_d1d2af1c.jpg',
  'Woman_holding_coffee_at_cafe_efe44568_8ae9ad13.jpg',
  'Woman_holding_red_roses_c79d6e83_24c18df9.jpg',
  'Woman_holding_wine_glass_5af53fc7_40bba1b3.jpg',
  'Woman_holding_wine_glass_75a57d15_296dc341.jpg',
  'Woman_holding_wine_glass_bc793ac2_55ef21ab.jpg',
  'Woman_holding_wine_glass_d27b8e2a_232a42d8.jpg',
  'Woman_holding_wine_in_lounge_eae1c4fd_8a0425bc.jpg',
  'Woman_in_black_outfit_standing_4aab8739_1798e7e8.jpg',
  'Woman_in_gold_dress_portrait_236c7a13_e913d2d6.jpg',
  'Woman_in_green_evening_gown_598996a7_711f1576.jpg',
  'Woman_in_lace_lingerie_bedroom_a762e52f_96498529.jpg',
  'Woman_in_pink_chainmail_outfit_dbd3c4f6_7685a300.jpg',
  'Woman_in_swimsuit_holding_drink_5cd2e861_9e009530.jpg',
  'Woman_in_swimsuit_on_beach_6524e89c_9f57f465.jpg',
  'Woman_in_velvet_lounge_b8f446b5_0ff02489.jpg',
  'Woman_in_velvet_lounge_e6be40ef_0dd1e4ae.jpg',
  'Woman_in_white_dress_standing_5f11ba0b_6a2cabd6.jpg',
  'Woman_looking_at_camera_2de5f7c7_be54b39b.jpg',
  'Woman_modeling_black_blazer_11918f5b_ab2dc049.jpg',
  'Woman_performing_morning_skincar__f826c9bf_460b0271.jpg',
  'Woman_performing_skincare_ritual_47ac1064_e9a91aab.jpg',
  'Woman_portrait_in_penthouse_bedroom_74f5d722_b8df4d8a.jpg',
  'Woman_posing_in_activewear_416bd3ba_5e266874.jpg',
  'Woman_posing_in_bedroom_08dee853_aafb9f3b.jpg',
  'Woman_posing_in_bedroom_c410874e_46b03f68.jpg',
  'Woman_posing_in_bedroom_studio_a1861a40_2539f43d.jpg',
  'Woman_posing_in_fashion_atelier_4f14e9ad_53539e44.jpg',
  'Woman_posing_in_lace_lingerie_1bd9ad6c_a8b479b8.jpg',
  'Woman_posing_in_lingerie_245cf504_9c43bdaf.jpg',
  'Woman_posing_in_lingerie_penthouse_62bf7a05_59b86297.jpg',
  'Woman_posing_in_luxury_penthouse_6c778813_2557a0ae.jpg',
  'Woman_posing_in_luxury_suite_14e2d430_f62b966d.jpg',
  'Woman_posing_in_penthouse_bedroom_bdc62c5a_ad5bbe85.jpg',
  'Woman_posing_in_penthouse_bedroom_c3ba8a28_7c06ff4c.jpg',
  'Woman_posing_in_penthouse_suite_f4691bd7_3eb7310d.jpg',
  'Woman_posing_in_shiny_dress_d0b2c05b_4701aead.jpg',
  'Woman_posing_in_velvet_lounge_33a3845b_1c5aa926.jpg',
  'Woman_posing_in_velvet_lounge_8f6f75d5_4e275e73.jpg',
  'Woman_posing_in_velvet_lounge_b580c8e1_90ecfd54.jpg',
  'Woman_posing_near_window_5224a6bb_b10b9efc.jpg',
  'Woman_reclining_on_beige_sofa_b5316004_28d128d5.jpg',
  'Woman_reclining_on_beige_sofa_eed7ccc3_db70a32f.jpg',
  'Woman_reclining_on_sofa_25543829_27d437ce.jpg',
  'Woman_reclining_on_sofa_aac2f3ff_b04e1710.jpg',
  'Woman_reclining_on_sofa_f2940d05_cca5efb3.jpg',
  'Woman_seated_at_office_desk_0947dcd8_cf109aa9.jpg',
  'Woman_seated_at_office_desk_71747a95_bb8ca47b.jpg',
  'Woman_seated_at_office_desk_c1c83f81_f4f27890.jpg',
  'Woman_sitting_at_caf__table_04a58f5b_a79229f5.jpg',
  'Woman_sitting_at_caf__table_97ef49f5_994d0e75.jpg',
  'Woman_sitting_at_cafe_table_5d8b1fc5_494ba5d1.jpg',
  'Woman_sitting_at_cafe_table_657d7c19_91a184b8.jpg',
  'Woman_sitting_at_desk_with_04773e94_e1407beb.jpg',
  'Woman_sitting_at_office_desk_ffb003a2_d1e66ad1.jpg',
  'Woman_sitting_at_outdoor_table_3235167a_636c5b58.jpg',
  'Woman_sitting_at_outdoor_table_df35a4f8_bf023af0.jpg',
  'Woman_sitting_at_outdoor_table_f60ffee2_7660e7b5.jpg',
  'Woman_sitting_by_apartment_window_33ec3cf4_ab5968e5.jpg',
  'Woman_sitting_by_window_smiling_a13a59e6_47854391.jpg',
  'Woman_sitting_by_window_smiling_f106b7df_148bf438.jpg',
  'Woman_sitting_in_silk_robe_08ab6ab2_5fbeda71.jpg',
  'Woman_sitting_in_silk_robe_ddc9ae11_de56b199.jpg',
  'Woman_sitting_in_velvet_lounge_cc0e22c1_8c318334.jpg',
  'Woman_sitting_on_beach_towel_0a483616_9d35141c.jpg',
  'Woman_sitting_on_beach_towel_3077f28f_77eba5d7.jpg',
  'Woman_sitting_on_beach_towel_43dd4381_290348bb.jpg',
  'Woman_sitting_on_beach_towel_593553da_6dad540e.jpg',
  'Woman_sitting_on_beach_towel_773c2db6_7a85acdf.jpg',
  'Woman_sitting_on_bed_04a66fe2_53a20777.jpg',
  'Woman_sitting_on_bedroom_chair_7a919e47_70740fce.jpg',
  'Woman_sitting_on_chair_0ba0d1cd_9cf37d8d.jpg',
  'Woman_sitting_on_chair_2f17f6f2_fd7d9898.jpg',
  'Woman_sitting_on_chair_4f1e62f3_aeee51ba.jpg',
  'Woman_sitting_on_chair_7b5bd4a5_155f3386.jpg',
  'Woman_sitting_on_chair_ece633ce_0f5bea0c.jpg',
  'Woman_sitting_on_chair_indoors_560c7350_f3830e59.jpg',
  'Woman_smiling_for_portrait_9c396b1f_20bd838a.jpg',
  'Woman_smiling_in_bed_8c2067be_42fa7a16.jpg',
  'Woman_smiling_in_modern_kitchen_6e6cfb6d_de90c9a7.jpg',
  'Woman_smiling_in_modern_kitchen_d20bac67_fd240733.jpg',
  'Woman_smiling_in_outdoor_setting_42d32d30_c344f674.jpg',
  'Woman_smiling_in_portrait_97b897b1_9fb5306a.jpg',
  'Woman_smiling_in_portrait_b51317f6_ff9f7e36.jpg',
  'Woman_smiling_in_professional_po__d7d93759_2ecf2bc4.jpg',
  'Woman_standing_before_art_wall_6800543b_a8388c5c.jpg',
  'Woman_standing_before_art_wall_9056dca6_3616d9c6.jpg',
  'Woman_standing_before_artwork_wall_48db726d_42a97a41.jpg',
  'Woman_standing_beside_window_94869325_abd787c7.jpg',
  'Woman_standing_beside_window_e8e2e3ff_2d9081a4.jpg',
  'Woman_standing_by_penthouse_window_218db0fe_4d6a2739.jpg',
  'Woman_standing_by_penthouse_window_75351328_fdc12cd2.jpg',
  'Woman_standing_by_penthouse_window_9e1b5186_678c3c9d.jpg',
  'Woman_standing_by_penthouse_window_a38abb75_6bc71053.jpg',
  'Woman_standing_by_window_08c3d3d5_f7a658f0.jpg',
  'Woman_standing_by_window_3f191eec_1291b1e8.jpg',
  'Woman_standing_by_window_7510a08e_a6391d98.jpg',
  'Woman_standing_by_window_bba36504_fdb6c7d9.jpg',
  'Woman_standing_by_window_c3ad053b_517ab92b.jpg',
  'Woman_standing_by_window_ecb78e84_91c7a177.jpg',
  'Woman_standing_by_window_ef96ce2f_b2fc18c5.jpg',
  'Woman_standing_in_Parisian_court__151c9756_9b9c6330.jpg',
  'Woman_standing_in_Parisian_court__24e5aa5d_96a7745c.jpg',
  'Woman_standing_in_Parisian_court__70e37f68_80bf577d.jpg',
  'Woman_standing_in_Parisian_court__783b8e53_d2cf3b29.jpg',
  'Woman_standing_in_bedroom_studio_8a3a7fb5_b675287d.jpg',
  'Woman_standing_in_hotel_interior_0425f33b_58db4e25.jpg',
  'Woman_standing_in_hotel_interior_188fac27_c16cdeb6.jpg',
  'Woman_standing_in_hotel_interior_1b7d1cb5_2b4247dc.jpg',
  'Woman_standing_in_hotel_interior_2b93cbb8_5f7d6484.jpg',
  'Woman_standing_in_hotel_interior_49ece124_20e7b353.jpg',
  'Woman_standing_in_hotel_interior_739d67e8_8336556f.jpg',
  'Woman_standing_in_hotel_interior_83357427_339fd740.jpg',
  'Woman_standing_in_hotel_interior_982096a3_7da5f801.jpg',
  'Woman_standing_in_hotel_interior_a7442a24_696fe290.jpg',
  'Woman_standing_in_hotel_interior_b768d120_5767c31e.jpg',
  'Woman_standing_in_hotel_interior_c6191059_b7f4aa61.jpg',
  'Woman_standing_in_hotel_interior_c71ddb9a_c76f31a2.jpg',
  'Woman_standing_in_hotel_interior_e891f077_c22f23a4.jpg',
  'Woman_standing_in_modern_kitchen_51971e01_bd95ee1f.jpg',
  'Woman_talking_in_office_35fb8eba_8fa85709.jpg',
  'Woman_talking_in_office_b6837ef1_ab18d416.jpg',
  'Woman_using_facial_roller_8c04e7a0_fca32c73.jpg',
  'Woman_walking_along_beach_73822599_056ef68f.jpg',
  'Woman_walking_on_Parisian_avenue_5202c195_79a8edff.jpg',
  'Woman_walking_on_Parisian_avenue_a0744d85_8995b189.jpg',
  'Woman_walking_on_beach_003034b3_39059716.jpg',
  'Woman_walking_on_beach_48f5e795_1cd810a8.jpg',
  'Woman_walking_through_Parisian_a__2ba8cdfc_bf5f4ce8.jpg',
  'Woman_wearing_black_evening_outfit_c1caf41e_499f7840.jpg',
  'Woman_wearing_emerald_evening_gown_693cc2ef_28a34b51.jpg',
  'Woman_wearing_emerald_green_gown_db78d62e_d0ad6cd9.jpg',
  'Woman_wearing_evening_attire_por__2746e99b_673e9dad.jpg',
  'Woman_wearing_lace-up_pants_795c1005_b8577533.jpg',
  'Woman_wearing_silver_dress_indoors_0e499fb6_100bc731.jpg',
  'Woman_wearing_white_dress_0bd3084b_8a4b3079.jpg',
  'Woman_working_at_desk_55b76fc9_27e99103.jpg'
] as const;

export const VALID_AISTUDIO_FILENAMES = new Set<string>(ALL_AISTUDIO_FILENAMES);

/** Returns true only for validated current /assets/aistudio/* files or valid user-provided image data/HTTPS URLs */
export function isApprovedAssetUrl(rawUrl?: string): boolean {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return false;

  // Purge any old generated asset paths or removed external demo domains
  if (
    trimmed.includes('isabella_') ||
    trimmed.includes('/src/assets/') ||
    trimmed.includes('images.unsplash.com') ||
    trimmed.includes('images.pexels.com')
  ) {
    return false;
  }

  if (trimmed.startsWith('/assets/aistudio/')) {
    const filename = trimmed.slice('/assets/aistudio/'.length).split('?')[0].split('#')[0];
    return VALID_AISTUDIO_FILENAMES.has(filename);
  }

  if (trimmed.startsWith('data:image/') || /^https?:\/\//i.test(trimmed)) {
    return true;
  }

  return false;
}

/** Daily blog shots photographed inside Isabella's personal bedroom */
export const PERSONAL_BEDROOM_FILENAMES = new Set<string>([
  'Fashion_portrait_of_woman_in_59402bec_6b8b4e84.jpg',
  'Woman_holding_red_roses_c79d6e83_24c18df9.jpg',
  'Woman_in_gold_dress_portrait_236c7a13_e913d2d6.jpg',
  'Woman_in_pink_chainmail_outfit_dbd3c4f6_7685a300.jpg',
  'Woman_posing_in_activewear_416bd3ba_5e266874.jpg',
  'Woman_posing_in_bedroom_08dee853_aafb9f3b.jpg',
  'Woman_posing_in_bedroom_c410874e_46b03f68.jpg',
  'Woman_posing_in_shiny_dress_d0b2c05b_4701aead.jpg',
  'Woman_sitting_on_bed_04a66fe2_53a20777.jpg',
  'Woman_smiling_in_bed_8c2067be_42fa7a16.jpg',
  'Woman_taking_selfie_in_bed_f744e268_6d2a0a2b.jpg',
  'Woman_wearing_lace-up_pants_795c1005_b8577533.jpg',
  'Woman_wearing_silver_dress_indoors_0e499fb6_100bc731.jpg',
  'Woman_wearing_white_dress_0bd3084b_8a4b3079.jpg'
]);

/** Hottest boudoir, silk robe, evening gown, bedroom, beach, and candlelit penthouse images prioritized as Featured */
const DEFAULT_FEATURED_HOT_FILENAMES = new Set<string>([
  'Woman_holding_champagne_in_apart__e76ad1b2_29aa52d1.jpg',
  'Woman_posing_in_lingerie_penthouse_62bf7a05_59b86297.jpg',
  'Woman_posing_in_lingerie_245cf504_9c43bdaf.jpg',
  'Woman_in_lace_lingerie_bedroom_a762e52f_96498529.jpg',
  'Woman_posing_in_luxury_penthouse_6c778813_2557a0ae.jpg',
  'Woman_posing_in_lace_lingerie_1bd9ad6c_a8b479b8.jpg',
  'Woman_reclining_on_sofa_25543829_27d437ce.jpg',
  'Woman_reclining_on_beige_sofa_b5316004_28d128d5.jpg',
  'Woman_reclining_on_sofa_f2940d05_cca5efb3.jpg',
  'Woman_reclining_on_beige_sofa_eed7ccc3_db70a32f.jpg',
  'Woman_reclining_on_sofa_aac2f3ff_b04e1710.jpg',
  'Woman_sitting_in_silk_robe_08ab6ab2_5fbeda71.jpg',
  'Woman_sitting_in_silk_robe_ddc9ae11_de56b199.jpg',
  'Woman_posing_in_velvet_lounge_8f6f75d5_4e275e73.jpg',
  'Woman_posing_in_velvet_lounge_33a3845b_1c5aa926.jpg',
  'Woman_holding_wine_in_lounge_eae1c4fd_8a0425bc.jpg',
  'Woman_wearing_emerald_green_gown_db78d62e_d0ad6cd9.jpg',
  'Woman_wearing_black_evening_outfit_c1caf41e_499f7840.jpg',
  'Woman_walking_on_beach_48f5e795_1cd810a8.jpg',
  'Woman_dining_on_Paris_rooftop_ca52de81_2c162ebd.jpg',
  'Woman_posing_in_luxury_suite_14e2d430_f62b966d.jpg',
  'Woman_posing_in_penthouse_suite_f4691bd7_3eb7310d.jpg',
  'Woman_posing_in_bedroom_studio_a1861a40_2539f43d.jpg',
  'Woman_portrait_in_penthouse_bedroom_74f5d722_b8df4d8a.jpg',
  'Woman_posing_in_shiny_dress_d0b2c05b_4701aead.jpg',
  'Woman_wearing_silver_dress_indoors_0e499fb6_100bc731.jpg',
  'Woman_in_pink_chainmail_outfit_dbd3c4f6_7685a300.jpg',
  'Woman_in_gold_dress_portrait_236c7a13_e913d2d6.jpg',
  'Woman_wearing_white_dress_0bd3084b_8a4b3079.jpg',
  'Woman_in_swimsuit_holding_drink_5cd2e861_9e009530.jpg',
  'Woman_adjusting_tight_swimsuit_o__46db7dc6_2c582c7c.jpg'
]);

function categorizeFilename(filename: string): Exclude<GalleryCategory, 'Featured Hot'> {
  if (PERSONAL_BEDROOM_FILENAMES.has(filename)) {
    return 'Personal Bedroom';
  }
  const f = filename.toLowerCase();
  if (f.includes('beach') || f.includes('swimsuit')) {
    return 'Outdoor & Beach';
  }
  if (
    f.includes('lingerie') ||
    f.includes('silk_robe') ||
    f.includes('reclining_on_') ||
    f.includes('bedroom') ||
    f.includes('perfume_at_vanity') ||
    f.includes('luxury_penthouse') ||
    f.includes('luxury_suite') ||
    f.includes('penthouse_suite')
  ) {
    return 'Boudoir & Silk';
  }
  if (
    f.includes('champagne') ||
    f.includes('velvet_lounge') ||
    f.includes('wine_in_lounge') ||
    f.includes('emerald') ||
    f.includes('evening') ||
    f.includes('rooftop')
  ) {
    return 'Evening & Champagne';
  }
  if (
    f.includes('paris') ||
    f.includes('fashion') ||
    f.includes('blazer') ||
    f.includes('atelier') ||
    f.includes('white_dress') ||
    f.includes('black_outfit')
  ) {
    return 'Paris & Fashion';
  }
  if (
    f.includes('dining') ||
    f.includes('restaurant') ||
    f.includes('cafe') ||
    f.includes('caf_') ||
    f.includes('outdoor_table') ||
    f.includes('wine_glass') ||
    f.includes('kitchen')
  ) {
    return 'Dining & Wine';
  }
  if (
    f.includes('skincare') ||
    f.includes('skincar') ||
    f.includes('facial_roller') ||
    f.includes('close-up') ||
    f.includes('smiling_in_portrait') ||
    f.includes('smiling_for_portrait') ||
    f.includes('smiling_in_outdoor') ||
    f.includes('portrait_photography')
  ) {
    return 'Skincare & Morning';
  }
  return 'Penthouse & Studio';
}

function formatEditorialTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, '');
  const parts = withoutExt.split('_');
  const trimmedParts = parts.slice(0, Math.max(1, parts.length - 2));
  const rawLabel = trimmedParts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/^Woman\s+/i, 'Isabella ')
    .replace(/^Photorealistic\s+/i, 'Isabella ')
    .replace(/^Portrait photography of woman\s*/i, 'Isabella Portrait ')
    .replace(/^Fashion portrait of woman in$/i, 'Isabella Bedroom Fashion Portrait')
    .replace(/\bapart\b/gi, 'Penthouse Apartment')
    .replace(/\bskincar\b/gi, 'Skincare Ritual')
    .replace(/\bpo\b/gi, 'Portrait')
    .replace(/\bcaf\b/gi, 'Café')
    .replace(/\btight swimsuit o$/i, 'Pink Swimsuit On Beach')
    .trim();

  return rawLabel
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'Featured Hot',
  'Personal Bedroom',
  'Outdoor & Beach',
  'Boudoir & Silk',
  'Evening & Champagne',
  'Paris & Fashion',
  'Dining & Wine',
  'Skincare & Morning',
  'Penthouse & Studio'
];

export const GALLERY_ASSIGNABLE_CATEGORIES: Array<Exclude<GalleryCategory, 'Featured Hot'>> =
  GALLERY_CATEGORIES.filter((c): c is Exclude<GalleryCategory, 'Featured Hot'> => c !== 'Featured Hot');

export const GALLERY_PHOTOS: GalleryPhotoItem[] = ALL_AISTUDIO_FILENAMES.map((filename, index) => ({
  id: `gal-${String(index + 1).padStart(3, '0')}`,
  filename,
  src: `/assets/aistudio/${filename}`,
  title: formatEditorialTitle(filename),
  category: categorizeFilename(filename),
  featured: DEFAULT_FEATURED_HOT_FILENAMES.has(filename),
  isCustom: false
}));

const VALID_ASSIGNABLE_CATEGORY_SET = new Set<string>(GALLERY_ASSIGNABLE_CATEGORIES);

export function normalizeGalleryCategory(rawCategory?: string): Exclude<GalleryCategory, 'Featured Hot'> {
  if (rawCategory && VALID_ASSIGNABLE_CATEGORY_SET.has(rawCategory)) {
    return rawCategory as Exclude<GalleryCategory, 'Featured Hot'>;
  }
  return 'Personal Bedroom';
}

export function getHiddenGalleryFilenames(
  settings?: Pick<SiteSettings, 'galleryOverrides'>
): string[] {
  const overrides = settings?.galleryOverrides || {};
  return Object.entries(overrides)
    .filter(([fn, ov]) => VALID_AISTUDIO_FILENAMES.has(fn) && Boolean(ov?.hidden))
    .map(([fn]) => fn);
}

export function getResolvedGalleryPhotos(
  settings?: Pick<SiteSettings, 'galleryOverrides' | 'customGalleryImages' | 'deletedGalleryFilenames'>
): GalleryPhotoItem[] {
  const overrides = settings?.galleryOverrides || {};
  const deletedSet = new Set<string>(settings?.deletedGalleryFilenames || []);
  const customList: GalleryPhotoItem[] = Array.isArray(settings?.customGalleryImages)
    ? settings!.customGalleryImages
        .filter((item) => item && item.id && isApprovedAssetUrl(item.src))
        .map((item) => ({
          id: item.id,
          filename: item.id,
          src: item.src,
          title: (item.title || 'Isabella Studio Portrait').trim(),
          category: normalizeGalleryCategory(item.category),
          featured: Boolean(item.featured),
          isCustom: true
        }))
    : [];

  const builtInPhotos: GalleryPhotoItem[] = GALLERY_PHOTOS.filter(
    (photo) => !deletedSet.has(photo.filename) && !overrides[photo.filename]?.hidden
  ).map((photo) => {
    const ov = overrides[photo.filename];
    return {
      ...photo,
      featured: typeof ov?.featured === 'boolean' ? ov.featured : photo.featured,
      isCustom: false
    };
  });

  return [...customList, ...builtInPhotos];
}
