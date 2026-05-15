/**
 * One-off maintainer script: realigns categoryHeroes and selected product
 * galleries (outdoor, accessories, lifestyle) with on-disk assets under
 * /public/images/products/. Run from repo root:
 *   node .frontend/scripts/patch-product-image-manifest.mjs
 */
import fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
const FE_ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(FE_ROOT, 'src', 'data', 'product-image-manifest.json');
const BE_MANIFEST = path.resolve(FE_ROOT, '..', '.backend', 'src', 'main', 'resources', 'product-image-manifest.json');

const categoryHeroes = {
    running: [
        '/images/products/Category/Running/Nike/shoe1.png',
        '/images/products/Category/Running/Nike/shoe1_color1_related1.png',
        '/images/products/Category/Running/Nike/shoe1_color1_related2.png',
        '/images/products/Category/Running/Nike/shoe1_color1_related4.png',
        '/images/products/Category/Running/Nike/shoe1_color2_related1.png',
        '/images/products/Category/Running/Nike/shoe2_color1_related1.png'
    ],
    football: [
        '/images/products/Category/Football/Puma/FUTURE-8-ULTIMATE-Men\'s-Firm-Ground-Soccer-Cleats.avif',
        '/images/products/Category/Football/Addides/jersy1_color1_related1.png',
        '/images/products/Category/Football/Addides/jersy1_color1_related2.png',
        '/images/products/Category/Football/Puma/Prestige-Soccer-Ball.avif',
        '/images/products/Category/Football/Addides/shoe1_color1_related2.png',
        '/images/products/Category/Football/Addides/short1_color1_related1.png'
    ],
    fitness: [
        '/images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-05.jpg',
        '/images/products/Category/Fitness/Addides/bench-personal-gallery-2.jpg',
        '/images/products/Category/Fitness/Addides/bra1_color1_related1.png',
        '/images/products/Category/Fitness/Addides/unica_gallery_003.jpg',
        '/images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men\'s-DryElite-5_-Shorts.avif',
        '/images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP.avif'
    ],
    outdoor: [
        '/images/products/Category/Basketball/Addides/Equipment_Quarter-Zip_Green_JW9876_21_model.avif',
        '/images/products/Category/Football/Puma/individualFINAL-Men\'s-Quarter-Zip-Soccer-Top.avif',
        '/images/products/Category/Basketball/Addides/Teamgeist_Rhinestone_Track_Top_Grey_KD0497_25_model.avif',
        '/images/products/Category/Running/Nike/shoe1_color2_related2.png',
        '/images/products/Category/Basketball/Addides/TEAMGEIST_HALF_ZIP_SWEATSHIRT_Black_KE2765_21_model.avif',
        '/images/products/Category/Running/addides/shoe3_color1_related_img4.png'
    ],
    basketball: [
        '/images/products/Category/Basketball/Puma/PUMA-Basketball.avif',
        '/images/products/Category/Basketball/Addides/Basketball_color1_related1.png',
        '/images/products/Category/Basketball/Nike/shoe2-color2-4.png',
        '/images/products/Category/Basketball/Addides/short_color1_related1.png',
        '/images/products/Category/Basketball/Addides/Mens_Rose_Modern_3.0_White_KL6634_41_detail.avif',
        '/images/products/Category/Basketball/Nike/JA1.png'
    ],
    training: [
        '/images/products/Category/Fitness/Addides/Training%20Bib%20Set(10pcs).png',
        '/images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men\'s-Training-Tee.avif',
        '/images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men\'s-DryElite-Tee.avif',
        '/images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men\'s-DryElite-5_-Shorts.avif',
        '/images/products/Category/Fitness/Addides/jump-rope-gallery-01.jpg',
        '/images/products/Category/Fitness/Addides/urethane-dumbbells-A0001-UDB-02.jpg'
    ],
    accessories: [
        '/images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_01_00_standard.avif',
        '/images/products/Category/Football/Puma/Prestige-Soccer-Ball.avif',
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_01_00_standard.avif',
        '/images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards%20(2).avif',
        '/images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_01_standard.avif',
        '/images/products/Category/Football/Puma/PUMA-1976-Soccer-Pitch-30L-Grip-Bag%20(3).avif'
    ],
    'accessories-bags': [
        '/images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Women_Dance_Backpack_Black_KS5216_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_01_standard.avif',
        '/images/products/Category/Football/Puma/PUMA-1976-Soccer-Pitch-30L-Grip-Bag%20(3).avif',
        '/images/products/Category/Basketball/Addides/Defender_5_Large_Duffel_Bag_Red_JJ7727_01_00_standard.avif'
    ],
    'accessories-headwear': [
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_25_outfit.avif',
        '/images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_01_standard.avif',
        '/images/products/Category/Football/Puma/Scuderia-Ferrari-Replica-Leclerc-Trucker-Hat.avif',
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_02_standard_hover.avif',
        '/images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_25_outfit.avif'
    ],
    'accessories-protective': [
        '/images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards%20(2).avif',
        '/images/products/Category/Football/Puma/Attacanto-Play-Goalkeeper-Gloves%20(1).avif',
        '/images/products/Category/Fitness/Addides/Training%20Bib%20Set(10pcs).png',
        '/images/products/Category/Football/Puma/ULTRA-Light-Soccer-Sleeve-Shinguards%20(1).avif',
        '/images/products/Category/Football/Puma/Attacanto-Play-Goalkeeper-Gloves.avif',
        '/images/products/Category/Fitness/Addides/jump-rope-feature-fluid-motion.webp'
    ],
    lifestyle: [
        '/images/products/Category/Running/Nike/shoe1_color1_related2.png',
        '/images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_21_model.avif',
        '/images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men\'s-Training-Tee.avif',
        '/images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_25_model.avif',
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_01_00_standard.avif'
    ],
    'lifestyle-sneakers': [
        '/images/products/Category/Running/Nike/shoe1.png',
        '/images/products/Category/Running/Nike/shoe1_color1_related1.png',
        '/images/products/Category/Running/Nike/shoe2_color1_related2.png',
        '/images/products/Category/Basketball/Addides/CLOUDFOAM_FLEX_SLOUNGE_SHOES_White_KI1460_04_standard.avif',
        '/images/products/Category/Running/addides/shoe1_another_color1.png',
        '/images/products/Category/Running/puma/shoe1_color1_related1.png'
    ],
    'lifestyle-hoodies': [
        '/images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_21_model.avif',
        '/images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_25_model.avif',
        '/images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men\'s-Heavyweight-Hoodie.avif',
        '/images/products/Category/Basketball/Addides/adidas_Adicolor_Oversize_Full-Zip_Hoodie_Blue_KD4097_23_hover_model.avif',
        '/images/products/Category/Basketball/Addides/TEAMGEIST_HALF_ZIP_SWEATSHIRT_Black_KE2765_21_model.avif',
        '/images/products/Category/Basketball/Addides/Sweatshirt_Blue.png'
    ],
    'lifestyle-tees': [
        '/images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men\'s-Training-Tee.avif',
        '/images/products/Category/Fitness/Puma/Train-All-Day-Essentials-Men\'s-Training-Tee%20(2).avif',
        '/images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men\'s-DryElite-Tee.avif',
        '/images/products/Category/Fitness/Nike/M+NP+DFADV+NPT+SS+TOP.avif',
        '/images/products/Category/Football/Addides/jersy1_color1_related1.png',
        '/images/products/Category/Football/Addides/jersy2_color1_related1.png'
    ],
    'lifestyle-joggers': [
        '/images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_25_model.avif',
        '/images/products/Category/Basketball/Addides/Adicolor_Satin_Wide_Leg_Track_Pants_Black_IU2520_21_model.avif',
        '/images/products/Category/Football/Addides/short1_color1_related1.png',
        '/images/products/Category/Fitness/Puma/PUMA-x-HYROX-Men\'s-DryElite-5_-Shorts.avif',
        '/images/products/Category/Basketball/Addides/FIREBIRD_LOOSE_TRACK_PANTS_Beige_KD3660_01_laydown.avif',
        '/images/products/Category/Basketball/Addides/Adicolor_Satin_Wide_Leg_Track_Pants_Black_IU2520_25_model.avif'
    ],
    'lifestyle-caps': [
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_25_outfit.avif',
        '/images/products/Category/Football/Puma/Scuderia-Ferrari-Replica-Leclerc-Trucker-Hat.avif',
        '/images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_01_standard.avif',
        '/images/products/Category/Basketball/Addides/Superlite_3_Hat_Beige_JL4326_41_detail.avif',
        '/images/products/Category/Basketball/Addides/Utility_3.0_Boonie_Hat_Black_JJ7415_41_detail.avif'
    ],
    'lifestyle-bags': [
        '/images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Women_Dance_Backpack_Black_KS5216_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Mexico_Airliner_Duffel_Black_JL4077_01_00_standard.avif',
        '/images/products/Category/Basketball/Addides/Utility_4_Sling_Bag_Black_JJ7418_01_standard.avif',
        '/images/products/Category/Football/Puma/PUMA-1976-Soccer-Pitch-30L-Grip-Bag%20(3).avif',
        '/images/products/Category/Basketball/Addides/Adicolor_Classic_Backpack_Red_JX0215_04_standard.avif'
    ],
    gym: [
        '/images/products/Category/Fitness/Addides/bench-personal-gallery-2.jpg',
        '/images/products/Category/Fitness/Addides/bench-personal-gallery-3.jpg',
        '/images/products/Category/Fitness/Addides/bench-personal-gallery-4.jpg'
    ],
    shoes: [
        '/images/products/Category/Running/Nike/shoe1_color1_related1.png',
        '/images/products/Category/Running/Nike/shoe1_color1_related2.png',
        '/images/products/Category/Running/Nike/shoe1_color1_related4.png'
    ],
    balls: [
        '/images/products/Category/Football/Puma/Prestige-Soccer-Ball.avif',
        '/images/products/Category/Basketball/Puma/PUMA-Basketball.avif',
        '/images/products/Category/Basketball/Puma/PUMA-Basketball%20(1).avif',
        '/images/products/Category/Basketball/Puma/Stewie-1-Basketball.avif',
        '/images/products/Category/Basketball/Addides/Basketball_color1_related2.png',
        '/images/products/Category/Basketball/Puma/PUMA-Basketball%20(2).avif'
    ]
};

function quad(pool, offset) {
    const n = pool.length;
    return [0, 1, 2, 3].map((j) => pool[(offset + j) % n]);
}

const outdoorPool = categoryHeroes.outdoor;
const accessoriesPool = categoryHeroes.accessories;

const lifestylePools = [
    categoryHeroes['lifestyle-sneakers'],
    categoryHeroes['lifestyle-hoodies'],
    categoryHeroes['lifestyle-tees'],
    categoryHeroes['lifestyle-joggers'],
    categoryHeroes['lifestyle-caps'],
    categoryHeroes['lifestyle-bags']
];

function patchProducts(products) {
    for (const row of products) {
        const id = row.apiId;
        if (id >= 401 && id <= 420) {
            const offset = id - 401;
            row.images = quad(outdoorPool, offset);
        } else if (id >= 701 && id <= 720) {
            const offset = id - 701;
            row.images = quad(accessoriesPool, offset);
        } else if (id >= 801 && id <= 850) {
            const i = id - 801;
            const sub = i % 6;
            const pool = lifestylePools[sub];
            const offset = Math.floor(i / 6);
            row.images = quad(pool, offset);
        }
    }
}

const raw = fs.readFileSync(MANIFEST, 'utf8');
const data = JSON.parse(raw);
data.categoryHeroes = categoryHeroes;
patchProducts(data.products);

const out = `${JSON.stringify(data, null, 2)}\n`;
fs.writeFileSync(MANIFEST, out);
fs.writeFileSync(BE_MANIFEST, out);
console.log('Updated', MANIFEST, 'and', BE_MANIFEST);