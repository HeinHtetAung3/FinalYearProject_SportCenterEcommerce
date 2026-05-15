/**
 * Publishes curated assets under /public/images/products/{running|football|...}/
 * (hard link when supported, else copy) and refreshes product-image-manifest.json
 * while preserving every apiId/mockId pair from the current manifest.
 *
 * Run from repo root: node scripts/sync-product-category-images.mjs
 */

import fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, '.frontend', 'public');
const CAT_ROOT = path.join(PUBLIC, 'images', 'products');

function absFromPublic(rel) {
    return path.join(PUBLIC, ...rel.split('/'));
}

function ensureDir(d) {
    fs.mkdirSync(d, {
        recursive: true
    });
}

function linkOrCopy(src, dest) {
    ensureDir(path.dirname(dest));
    try {
        fs.unlinkSync(dest);
    } catch {
        /* noop */
    }
    try {
        fs.linkSync(src, dest);
    } catch {
        fs.copyFileSync(src, dest);
    }
}

const seq = Object.create(null);
const published = new Map();

/**
 * @param {string} slug Target folder under /images/products/
 * @param {string} srcRel Source path under /public
 * @param {string} [memoScope] Defaults to slug; use hero key so rails do not collapse to one file
 */
function publish(slug, srcRel, memoScope = slug) {
    const memoKey = `${memoScope}::${srcRel}`;
    if (published.has(memoKey)) return published.get(memoKey);

    if (!seq[slug]) seq[slug] = 0;
    seq[slug] += 1;
    const n = seq[slug];
    const ext = path.extname(srcRel) || '.bin';
    const base = `${slug}-${String(n).padStart(3, '0')}${ext}`;
    const destAbs = path.join(CAT_ROOT, slug, base);
    const srcAbs = absFromPublic(srcRel);
    if (!fs.existsSync(srcAbs)) {
        console.warn('Missing:', srcRel);
        return null;
    }
    linkOrCopy(srcAbs, destAbs);
    const url = `/images/products/${slug}/${base}`;
    published.set(memoKey, url);
    return url;
}

function takeUnique(arr) {
    const out = [];
    const seen = new Set();
    for (const p of arr) {
        if (!p || seen.has(p)) continue;
        seen.add(p);
        out.push(p);
    }
    return out;
}

function slugForApiId(apiId) {
    if (apiId >= 101 && apiId <= 120) return 'running';
    if (apiId >= 201 && apiId <= 220) return 'football';
    if (apiId >= 301 && apiId <= 320) return 'fitness';
    if (apiId >= 401 && apiId <= 420) return 'outdoor';
    if (apiId >= 501 && apiId <= 520) return 'basketball';
    if (apiId >= 601 && apiId <= 620) return 'training';
    if (apiId >= 701 && apiId <= 720) return 'accessories';
    if (apiId >= 801 && apiId <= 850) return 'lifestyle';
    return 'fitness';
}

const RUNNING = takeUnique([
    'images/products/Category/Running/Nike/shoe1.png',
    'images/products/Category/Running/Nike/shoe1_color1_related1.png',
    'images/products/Category/Running/Nike/shoe1_color1_related2.png',
    'images/products/Category/Running/Nike/shoe1_color1_related4.png',
    'images/products/Category/Running/Nike/shoe1_color2_related1.png',
    'images/products/Category/Running/Nike/shoe1_color2_related2.png',
    'images/products/Category/Running/Nike/shoe1_color2_related3.png',
    'images/products/Category/Running/Nike/shoe2_color1_related1.png',
    'images/products/Category/Running/Nike/shoe2_color1_related2.png',
    'images/products/Category/Running/Nike/shoe2_color1_related3.png',
    'images/products/Category/Running/Nike/shoe2_color2_related1.png',
    'images/products/Category/Running/Nike/shoe2_color2_related3.png',
    'images/products/Category/Running/Nike/shoe3_color1_related1.png',
    'images/products/Category/Running/Nike/shoe3_color1_related2.png',
    'images/products/Category/Running/Nike/shoe3_color1_related3.png',
    'images/products/Category/Running/Nike/shoe3_color1_related4.png',
    'images/products/Category/Running/Nike/shoe3_color2_related1.png',
    'images/products/Category/Running/Nike/shoe3_color2_related2.png',
    'images/products/Category/Running/Nike/shoe3_color3_related4.png',
    'images/products/Category/Running/addides/shoe2_color1.png',
    'images/products/Category/Running/addides/shoe3_color1.png',
    'images/products/Category/Running/addides/shoe4_color1_related_img1.png',
    'images/products/Category/Running/addides/shoe4_color1_related_img2.png',
    'images/products/Category/Running/addides/shoe5_color1_related_img1.png',
    'images/products/Category/Running/addides/shoe6_color1_related_img1.png',
    'images/products/Category/Running/addides/Shoes1.png',
    'images/products/Category/Running/addides/shoe1_another_color1.png',
    'images/products/Category/Running/addides/shoe1_another_color2_related_img1.png',
    'images/products/Category/Running/addides/shoe2_color1_related_img1.png',
    'images/products/Category/Running/addides/shoe2_color2_related_img2.png',
    'images/products/Category/Running/puma/shoe1_color1_related1.png',
    'images/products/Category/Running/puma/shoe1_color1_related3.png',
    'images/products/Category/Running/puma/shoe1_color1_related4.png'
]);

const FOOTBALL = takeUnique([
    "images/products/Category/Football/Puma/FUTURE-8-ULTIMATE-Men's-Firm-Ground-Soccer-Cleats.avif",
    'images/products/Category/Football/Puma/Prestige-Soccer-Ball.avif',
    "images/products/Category/Football/Puma/Attacanto-Play-Goalkeeper-Gloves.avif",
    "images/products/Category/Football/Puma/Attacanto-Play-Goalkeeper-Gloves (1).avif",
    'images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards.avif',
    'images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards (1).avif',
    'images/products/Category/Football/Addides/shoe1_color1_related1.png',
    'images/products/Category/Football/Addides/shoe1_color1_related2.png',
    'images/products/Category/Football/Addides/shoe1_color1_related3.png',
    'images/products/Category/Football/Addides/shoe1_color2_related1.png',
    'images/products/Category/Football/Addides/shoe1_color2_related2.png',
    'images/products/Category/Football/Nike/shoe1_color1_related1.png',
    'images/products/Category/Football/Nike/shoe1_color1_related2.png',
    'images/products/Category/Football/Nike/shoe2_color1_related1.png',
    'images/products/Category/Football/Nike/shoe2_color1_related3.png',
    'images/products/Category/Football/Addides/jersy1_color1_related1.png',
    'images/products/Category/Football/Addides/jersy2_color1_related1.png',
    'images/products/Category/Football/Addides/jersy2_color2_related1.png',
    "images/products/Category/Football/Puma/King-Men's-Soccer-Jersey.avif",
    "images/products/Category/Football/Puma/King-Men's-Soccer-Shorts.avif",
    'images/products/Category/Football/Addides/short1_color1_related1.png',
    "images/products/Category/Football/Puma/individualFINAL-Men's-Quarter-Zip-Soccer-Top.avif",
    "images/products/Category/Football/Puma/individualFINAL-Men's-Soccer-Pants.avif",
    'images/products/Category/Football/Puma/Scuderia-Ferrari-Replica-Leclerc-Trucker-Hat.avif',
    'images/products/Category/Football/Puma/PUMA-1976-Soccer-Pitch-30L-Grip-Bag.avif',
    'images/products/Category/Football/Puma/Archive-1976-Grip-Bag.avif',
    'images/products/Category/Fitness/Addides/Training Bib Set(10pcs).png'
]);

const FITNESS = takeUnique([
    'images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-05.jpg',
    'images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-02.jpg',
    'images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-03.jpg',
    'images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-01.jpg',
    'images/products/Category/Fitness/Addides/bench-personal-gallery-2.jpg',
    'images/products/Category/Fitness/Addides/bench-personal-gallery-3.jpg',
    'images/products/Category/Fitness/Addides/bench-personal-gallery-4.jpg',
    'images/products/Category/Fitness/Addides/bench_personal_alluminium.jpg',
    'images/products/Category/Fitness/Addides/unica_gallery_003.jpg',
    'images/products/Category/Fitness/Addides/unica_gallery_004.jpg',
    'images/products/Category/Fitness/Addides/unica_black_black_1_1.jpg',
    'images/products/Category/Fitness/Addides/Unica5980.jpg',
    'images/products/Category/Fitness/Addides/jump-rope-gallery-01.jpg',
    'images/products/Category/Fitness/Addides/jump-rope-feature-fluid-motion.webp',
    'images/products/Category/Fitness/Addides/jump_rope-mainfeature02_design_knurling.webp',
    'images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP.avif',
    'images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP (2).avif',
    'images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP (4).avif',
    'images/products/Category/Fitness/Nike/seamless1_color1_related1.png',
    'images/products/Category/Fitness/Nike/seamless1_color2_related2.png',
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-Heavyweight-Hoodie.avif",
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-DryElite-Tee.avif",
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-DryElite-5_-Shorts.avif",
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-DryElite-5_-Shorts (2).avif",
    "images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men's-Training-Tee.avif",
    "images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men's-Training-Tee (2).avif",
    'images/products/Category/Fitness/Addides/bra1_color1_related1.png',
    'images/products/Category/Fitness/Puma/Tshirt1_color1_related2.png',
    'images/products/Category/Fitness/Addides/technogym_myrun1.jpg',
    'images/products/Category/Fitness/Addides/technogym_myrun2.jpg',
    'images/products/Category/Fitness/Addides/myrun-gallery-pdp-3.jpg',
    'images/products/Category/Fitness/Addides/technogym_myrun_gallery4.jpg'
]);

const OUTDOOR = takeUnique([
    'images/products/Category/Basketball/Addides/Women_Dance_Backpack_Black_KS5216_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Defender_5_Large_Duffel_Bag_Red_JJ7727_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_01_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_01_standard.avif',
    'images/products/Category/Basketball/Addides/Equipment_Quarter-Zip_Green_JW9876_21_model.avif',
    'images/products/Category/Basketball/Addides/TEAMGEIST_HALF_ZIP_SWEATSHIRT_Black_KE2765_21_model.avif',
    'images/products/Category/Basketball/Addides/Teamgeist_Rhinestone_Track_Top_Grey_KD0497_21_model.avif',
    'images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_25_model.avif',
    'images/products/Category/Running/Nike/shoe3_color1_related2.png',
    'images/products/Category/Running/addides/shoe4_color1_related_img2.png',
    'images/products/Category/Running/addides/shoe3_color1_related_img4.png',
    'images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_05_hover_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_41_detail.avif',
    'images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_41_detail.avif',
    'images/products/Category/Basketball/Addides/Women_Dance_Backpack_Black_KS5216_41_detail.avif',
    'images/products/Category/Basketball/Addides/Equipment_Quarter-Zip_Green_JW9876_41_detail.avif',
    'images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_25_outfit.avif',
    "images/products/Category/Football/Puma/individualFINAL-Men's-Quarter-Zip-Soccer-Top.avif",
    'images/products/Category/Basketball/Addides/TEAMGEIST_HALF_ZIP_SWEATSHIRT_Black_KE2765_25_model.avif',
    'images/products/Category/Basketball/Addides/Teamgeist_Rhinestone_Track_Top_Grey_KD0497_25_model.avif',
    'images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_23_hover_model.avif',
    'images/products/Category/Basketball/Addides/Defender_5_Large_Duffel_Bag_Red_JJ7727_05_hover_standard.avif',
    'images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_05_hover_standard.avif'
]);

const BASKETBALL = takeUnique([
    'images/products/Category/Basketball/Nike/JA1.png',
    'images/products/Category/Basketball/Nike/JA2.png',
    'images/products/Category/Basketball/Nike/JA3.png',
    'images/products/Category/Basketball/Nike/Book2wnab30th-manshoe2.png',
    'images/products/Category/Basketball/Nike/shoe2-color1-2.png',
    'images/products/Category/Basketball/Nike/shoe2-color2-4.png',
    'images/products/Category/Basketball/Nike/color2-1.png',
    'images/products/Category/Basketball/Nike/color2-2.png',
    'images/products/Category/Basketball/Nike/color2-3.png',
    'images/products/Category/Basketball/Puma/PUMA-Basketball.avif',
    'images/products/Category/Basketball/Puma/Stewie-1-Basketball.avif',
    'images/products/Category/Basketball/Puma/PUMA-Basketball (1).avif',
    'images/products/Category/Basketball/Puma/PUMA-Basketball (2).avif',
    'images/products/Category/Basketball/Addides/Basketball_color1_related1.png',
    'images/products/Category/Basketball/Addides/Basketball_color1_related2.png',
    'images/products/Category/Basketball/Addides/Basketball_color1_related3.png',
    'images/products/Category/Basketball/Addides/Basketball_color1_related4.png',
    'images/products/Category/Basketball/Addides/short_color1_related1.png',
    'images/products/Category/Basketball/Addides/short_color1_related2.png',
    'images/products/Category/Basketball/Addides/Mens_Rose_Modern_3.0_White_KL6634_41_detail.avif',
    'images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_21_model.avif',
    'images/products/Category/Basketball/Addides/CLOUDFOAM_FLEX_SLOUNGE_SHOES_White_KI1460_04_standard.avif',
    'images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Sweatshirt_Blue.png',
    'images/products/Category/Basketball/Addides/Sweatshirt_Blue1.png',
    'images/products/Category/Basketball/Nike/book2MustbetheDenim-shoe2-color2-2.png'
]);

const TRAINING = takeUnique([
    'images/products/Category/Fitness/Addides/Training Bib Set(10pcs).png',
    'images/products/Category/Fitness/Addides/jump-rope-gallery-01.jpg',
    'images/products/Category/Fitness/Addides/jump-rope-feature-fluid-motion.webp',
    'images/products/Category/Fitness/Addides/jump_rope-mainfeature02_design_knurling.webp',
    'images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-01.jpg',
    "images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men's-Training-Tee.avif",
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-DryElite-Tee.avif",
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-DryElite-5_-Shorts.avif",
    'images/products/Category/Basketball/Addides/USA_94_Graphic_Sweatshirt_Blue_KD1156_HM5.png',
    'images/products/Category/Basketball/Addides/Teamgeist_Rhinestone_Track_Top_Grey_KD0497_23_hover_model.avif',
    'images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP (3).avif',
    'images/products/Category/Fitness/Addides/unica_gallery_004.jpg',
    'images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-02.jpg',
    'images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_02_standard.avif',
    'images/products/Category/Fitness/Addides/technogym_myrun2.jpg',
    'images/products/Category/Fitness/Puma/Tshirt1_color1_related3.png',
    'images/products/Category/Fitness/Nike/seamless1_color1_related4.png',
    'images/products/Category/Fitness/Addides/bra1_color1_related4.png',
    'images/products/Category/Basketball/Addides/TEAMGEIST_HALF_ZIP_SWEATSHIRT_Black_KE2765_01_laydown.avif',
    'images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-03.jpg'
]);

const ACCESSORIES = takeUnique([
    'images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_25_outfit.avif',
    'images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_41_detail.avif',
    'images/products/Category/Football/Puma/Scuderia-Ferrari-Replica-Leclerc-Trucker-Hat.avif',
    'images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_41_detail.avif',
    'images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_02_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_02_standard.avif',
    'images/products/Category/Football/Puma/Prestige-Soccer-Ball.avif',
    'images/products/Category/Basketball/Puma/PUMA-Basketball.avif',
    'images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards (2).avif',
    'images/products/Category/Football/Puma/Attacanto-Play-Goalkeeper-Gloves (2).avif',
    'images/products/Category/Basketball/Addides/Women_Dance_Backpack_Black_KS5216_05_hover_standard.avif',
    'images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_05_hover_standard.avif',
    'images/products/Category/Football/Puma/PUMA-1976-Soccer-Pitch-30L-Grip-Bag (3).avif',
    'images/products/Category/Basketball/Addides/Defender_5_Large_Duffel_Bag_Red_JJ7727_02_standard.avif',
    'images/products/Category/Fitness/Addides/bra1_color1_related2.png',
    'images/products/Category/Fitness/Nike/seamless1_color1_related2.png',
    'images/products/Category/Fitness/Puma/Tshirt1_color1_related4.png',
    'images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_04_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_05_hover_standard.avif',
    'images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_02_standard_hover.avif'
]);

const LIFESTYLE = takeUnique([
    ...RUNNING.slice(0, 10),
    'images/products/Category/Basketball/Addides/CLOUDFOAM_FLEX_SLOUNGE_SHOES_White_KI1460_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/CLOUDFOAM_FLEX_SLOUNGE_SHOES_White_KI1460_05_standard.avif',
    'images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_21_model.avif',
    'images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_25_model.avif',
    'images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_23_hover_model.avif',
    'images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_21_model.avif',
    'images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_01_laydown.avif',
    'images/products/Category/Basketball/Addides/Adicolor_Satin_Wide_Leg_Track_Pants_Black_IU2520_21_model.avif',
    'images/products/Category/Basketball/Addides/Adicolor_Satin_Wide_Leg_Track_Pants_Black_IU2520_25_model.avif',
    "images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men's-Training-Tee (3).avif",
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-DryElite-Tee.avif",
    'images/products/Category/Football/Addides/jersy1_color1_related1.png',
    'images/products/Category/Football/Addides/jersy2_color2_related1.png',
    'images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_01_standard.avif',
    'images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Women_Dance_Backpack_Black_KS5216_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Defender_5_Large_Duffel_Bag_Red_JJ7727_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_01_standard.avif',
    "images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men's-Heavyweight-Hoodie.avif",
    'images/products/Category/Basketball/Addides/Teamgeist_Rhinestone_Track_Top_Grey_KD0497_01_laydown.avif',
    'images/products/Category/Basketball/Addides/TEAMGEIST_HALF_ZIP_SWEATSHIRT_Black_KE2765_25_model.avif',
    'images/products/Category/Basketball/Addides/Mens_Rose_Modern_3.0_White_KL6634_01_00_standard.avif',
    'images/products/Category/Basketball/Addides/short_color1_related3.png',
    'images/products/Category/Basketball/Addides/Basketball_color1_related2.png',
    'images/products/Category/Running/addides/shoe1_another_color3_related_img2.png',
    'images/products/Category/Running/Nike/shoe1_color2_related4.png',
    'images/products/Category/Basketball/Addides/CLOUDFOAM_FLEX_SLOUNGE_SHOES_White_KI1460_02_standard_hover.avif',
    'images/products/Category/Basketball/Addides/CLOUDFOAM_FLEX_SLOUNGE_SHOES_White_KI1460_04_standard.avif',
    'images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP (5).avif',
    'images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP (6).avif',
    'images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP (7).avif',
    'images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_01_laydown.avif',
    'images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_41_detail.avif',
    'images/products/Category/Basketball/Addides/Adicolor_Satin_Wide_Leg_Track_Pants_Black_IU2520_23_hover_model.avif',
    'images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_25_outfit.avif',
    'images/products/Category/Football/Puma/Scuderia-Ferrari-Replica-Leclerc-Trucker-Hat.avif',
    'images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_25_outfit.avif',
    'images/products/Category/Basketball/Addides/Women_Dance_Backpack_Black_KS5216_02_standard.avif',
    'images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_02_standard.avif',
    'images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_05_hover_standard.avif',
    'images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_05_hover_standard.avif',
    'images/products/Category/Football/Puma/PUMA-1976-Soccer-Pitch-30L-Grip-Bag (2).avif',
    'images/products/Category/Basketball/Addides/Defender_5_Large_Duffel_Bag_Red_JJ7727_05_hover_standard.avif',
    'images/products/Category/Basketball/Addides/Equipment_Quarter-Zip_Green_JW9876_01_laydown.avif',
    'images/products/Category/Basketball/Addides/TEAMGEIST_HALF_ZIP_SWEATSHIRT_Black_KE2765_23_hover_model.avif',
    'images/products/Category/Basketball/Addides/Teamgeist_Rhinestone_Track_Top_Grey_KD0497_23_hover_model.avif',
    'images/products/Category/Fitness/Puma/Tshirt1_color2_related1.png',
    'images/products/Category/Fitness/Puma/Tshirt1_color2_related3.png',
    'images/products/Category/Running/puma/shoe1_color1_related2.png',
    'images/products/Category/Running/addides/shoe2_color1_related_img3.png',
    'images/products/Category/Running/Nike/shoe2_color1_related4.png',
    'images/products/Category/Running/addides/shoe4_color2_related_img4.png',
    'images/products/Category/Basketball/Nike/JA1.png',
    'images/products/Category/Basketball/Nike/JA2.png',
    'images/products/Category/Basketball/Nike/JA3.png'
]);

const POOLS = {
    running: RUNNING,
    football: FOOTBALL,
    fitness: FITNESS,
    outdoor: OUTDOOR,
    basketball: BASKETBALL,
    training: TRAINING,
    accessories: ACCESSORIES,
    lifestyle: LIFESTYLE
};

function galleryUrls(slug, apiId) {
    const pool = POOLS[slug] || FITNESS;
    const offset = Number(apiId) % pool.length;
    const step = Math.max(1, Math.floor(pool.length / 5));
    const idxs = [0, 1, 2, 3].map((k) => (offset + k * step) % pool.length);
    const srcs = takeUnique(idxs.map((i) => pool[i]));
    let add = 0;
    while (srcs.length < 4 && add < pool.length) {
        srcs.push(pool[(offset + add) % pool.length]);
        add += 1;
    }
    const uniqSrc = takeUnique(srcs).slice(0, 4);
    return uniqSrc.map((src) => publish(slug, src, `p-${apiId}`)).filter(Boolean);
}

function rebuildHeroes(heroKeys) {
    const ballsPool = takeUnique([
        'images/products/Category/Football/Puma/Prestige-Soccer-Ball.avif',
        'images/products/Category/Basketball/Puma/PUMA-Basketball.avif',
        'images/products/Category/Basketball/Puma/Stewie-1-Basketball.avif',
        'images/products/Category/Basketball/Addides/Basketball_color1_related1.png',
        'images/products/Category/Basketball/Addides/Basketball_color1_related2.png',
        'images/products/Category/Basketball/Puma/PUMA-Basketball (1).avif'
    ]);
    const bagsPool = takeUnique(
        ACCESSORIES.filter((p) => /Backpack|Duffel|Grip|Bag|Sling/i.test(p))
    );
    const hatsPool = takeUnique(
        ACCESSORIES.filter((p) => /Hat|Boonie|Cap|Trucker/i.test(p))
    );
    const protectPool = takeUnique([
        'images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards.avif',
        'images/products/Category/Football/Puma/Attacanto-Play-Goalkeeper-Gloves.avif',
        'images/products/Category/Fitness/Addides/Training Bib Set(10pcs).png',
        'images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards (1).avif',
        'images/products/Category/Football/Puma/Attacanto-Play-Goalkeeper-Gloves (2).avif',
        'images/products/Category/Fitness/Addides/jump-rope-feature-fluid-motion.webp'
    ]);

    const out = {};
    for (const key of heroKeys) {
        let slug = key;
        let pool = POOLS[key];

        if (key === 'gym') {
            slug = 'fitness';
            pool = FITNESS;
        } else if (key === 'shoes') {
            slug = 'running';
            pool = RUNNING;
        } else if (key === 'balls') {
            slug = 'basketball';
            pool = ballsPool;
        } else if (key === 'accessories-bags') {
            slug = 'accessories';
            pool = bagsPool.length ? bagsPool : ACCESSORIES;
        } else if (key === 'accessories-headwear') {
            slug = 'accessories';
            pool = hatsPool.length ? hatsPool : ACCESSORIES;
        } else if (key === 'accessories-protective') {
            slug = 'accessories';
            pool = protectPool;
        } else if (key.startsWith('lifestyle-')) {
            slug = 'lifestyle';
            if (key === 'lifestyle-sneakers') pool = RUNNING;
            else if (key === 'lifestyle-hoodies') pool = takeUnique(LIFESTYLE.filter((p) => /Hoodie|Sweat|TEAMGEIST|Heavyweight/i.test(p)));
            else if (key === 'lifestyle-tees') pool = takeUnique(LIFESTYLE.filter((p) => /Tee|jersy|M\+NP|Training-Tee/i.test(p)));
            else if (key === 'lifestyle-joggers') pool = takeUnique(LIFESTYLE.filter((p) => /Pants|Track|FIREBIRD|Shorts/i.test(p)));
            else if (key === 'lifestyle-caps') pool = takeUnique(LIFESTYLE.filter((p) => /Hat|Boonie|Cap|Trucker/i.test(p)));
            else if (key === 'lifestyle-bags') pool = bagsPool.length ? bagsPool : takeUnique(LIFESTYLE.filter((p) => /Backpack|Duffel|Bag/i.test(p)));
            else pool = LIFESTYLE;
            if (!pool || pool.length === 0) pool = LIFESTYLE;
        } else if (!pool) {
            slug = 'fitness';
            pool = FITNESS;
        }

        const list = [];
        for (let i = 0; i < 6; i++) {
            const url = publish(slug, pool[i % pool.length], key);
            if (url) list.push(url);
        }
        out[key] = list;
    }
    return out;
}

const manifestPath = path.join(ROOT, '.frontend', 'src', 'data', 'product-image-manifest.json');
const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const heroKeys = Object.keys(raw.categoryHeroes || {});
raw.categoryHeroes = rebuildHeroes(heroKeys);

raw.products = (raw.products || [])
    .map((row) => {
        const apiId = Number(row.apiId);
        const slug = slugForApiId(apiId);
        return {
            ...row,
            images: galleryUrls(slug, apiId)
        };
    })
    .sort((a, b) => a.apiId - b.apiId);

const outText = `${JSON.stringify(raw, null, 2)}\n`;
fs.writeFileSync(manifestPath, outText, 'utf8');
fs.writeFileSync(path.join(ROOT, '.backend', 'src', 'main', 'resources', 'product-image-manifest.json'), outText, 'utf8');

console.log('Updated manifest; product rows:', raw.products.length);
console.log('Published sequential assets under images/products/{slug}/');