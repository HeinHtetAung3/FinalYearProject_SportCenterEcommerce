/**
 * Product dataset for the SportsHub e-commerce demo.
 *
 * 7 categories x 20 products = 140 products total.
 *
 * Data source: the per-category arrays you supplied. Eight Unsplash photo
 * IDs from the original snippet returned HTTP 404 from the Unsplash CDN
 * (verified with curl); each has been swapped for a category-correct ID
 * that actually resolves to a real photo. Every URL in this file has
 * been confirmed live.
 *
 * Each product carries the 5 fields you specified
 *   { id, name, price, category, imageUrl }
 * plus 3 extras (`rating`, `stock`, `description`) the existing
 * ProductCard / ProductDetail components already render. Drop them if
 * unwanted — they're optional and the UI degrades gracefully without them.
 *
 * Per-category arrays are exported separately for convenience, and a
 * combined `products` array is exported for the rest of the UI which
 * expects a single source of truth.
 *
 * To switch every URL to a different host later (Firebase Storage, a
 * different CDN, your own server), import `buildProductImageUrl` from
 * `../utils/productImages.js` for a switchable resolver.
 */

const UNSPLASH = 'https://images.unsplash.com/photo-';
const PARAMS = '?auto=format&fit=crop&w=600&q=80';

/** Build a stable Unsplash CDN URL from a verified photo id. */
function img(id) {
    return `${UNSPLASH}${id}${PARAMS}`;
}

export const CATEGORIES = [
    'Running',
    'Football',
    'Fitness',
    'Outdoor',
    'Basketball',
    'Training',
    'Accessories',
    'Lifestyle'
];

/**
 * Gender targets used by the mega-menu (Men / Women / Kids / Unisex).
 * Performance gear stays implicitly Unisex (no `gender` field) so the
 * gender facet only filters items that explicitly opt in.
 */
export const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];

/* ---------------------------------------------------------------------- */
/* Running                                                                */
/* ---------------------------------------------------------------------- */

export const runningProducts = [{
        id: 1,
        name: 'Sprint Runner Pro',
        price: 129.99,
        category: 'Running',
        imageUrl: img('1542291026-7eec264c27ff'),
        rating: 4.7,
        stock: 24,
        description: 'Featherweight runner with carbon-plate propulsion and breathable mesh upper.'
    },
    {
        id: 2,
        name: 'Ultra Boost Run',
        price: 149.99,
        category: 'Running',
        imageUrl: img('1571902943202-507ec2618e8f'),
        rating: 4.8,
        stock: 18,
        description: 'Springy foam midsole returns energy on every stride.'
    },
    {
        id: 3,
        name: 'Speed Track Elite',
        price: 119.99,
        category: 'Running',
        imageUrl: img('1595950653106-6c9ebd614d3a'),
        rating: 4.5,
        stock: 30,
        description: 'Track-spec spikes engineered for short to mid-distance dominance.'
    },
    {
        id: 4,
        name: 'Marathon Max',
        price: 139.99,
        category: 'Running',
        imageUrl: img('1508609349937-5ec4ae374ebf'),
        rating: 4.6,
        stock: 15,
        description: 'Plush long-distance cushioning that holds up to mile 26.'
    },
    {
        id: 5,
        name: 'Air Run X',
        price: 159.99,
        category: 'Running',
        imageUrl: img('1543351611-58f69d7c1781'),
        rating: 4.9,
        stock: 9,
        description: 'Premium air-cushioned runner for daily training and recovery miles.'
    },
    {
        id: 6,
        name: 'Flyknit Racer',
        price: 129.99,
        category: 'Running',
        imageUrl: img('1552346154-21d32810aba3'),
        rating: 4.4,
        stock: 22,
        description: 'Sock-fit flyknit upper grips your foot mile after mile.'
    },
    {
        id: 7,
        name: 'Velocity Pro',
        price: 119.99,
        category: 'Running',
        imageUrl: img('1542291026-7eec264c27ff'),
        rating: 4.5,
        stock: 35,
        description: 'Speed-day shoe with snappy rocker geometry and grippy outsole.'
    },
    {
        id: 8,
        name: 'Endurance Boost',
        price: 134.99,
        category: 'Running',
        imageUrl: img('1571902943202-507ec2618e8f'),
        rating: 4.6,
        stock: 28,
        description: 'High-stack midsole built for the long haul without losing rebound.'
    },
    {
        id: 9,
        name: 'LightStep Runner',
        price: 99.99,
        category: 'Running',
        imageUrl: img('1595950653106-6c9ebd614d3a'),
        rating: 4.3,
        stock: 60,
        description: 'Entry-level neutral trainer with all-day comfort.'
    },
    {
        id: 10,
        name: 'Track Sprint Elite',
        price: 109.99,
        category: 'Running',
        imageUrl: img('1508609349937-5ec4ae374ebf'),
        rating: 4.4,
        stock: 40,
        description: 'Track-day sprinter with low-profile carbon plate.'
    },
    {
        id: 11,
        name: 'Cloud Run Pro',
        price: 144.99,
        category: 'Running',
        imageUrl: img('1543351611-58f69d7c1781'),
        rating: 4.7,
        stock: 17,
        description: 'Soft, stable ride with a podded outsole that absorbs landing forces.'
    },
    {
        id: 12,
        name: 'Dynamic Runner',
        price: 124.99,
        category: 'Running',
        imageUrl: img('1552346154-21d32810aba3'),
        rating: 4.5,
        stock: 32,
        description: 'Versatile do-it-all daily trainer with reflective accents.'
    },
    {
        id: 13,
        name: 'Runner Flex X',
        price: 139.99,
        category: 'Running',
        imageUrl: img('1542291026-7eec264c27ff'),
        rating: 4.6,
        stock: 21,
        description: 'Flex-grooved outsole for a natural toe-off and midfoot lockdown.'
    },
    {
        id: 14,
        name: 'Speed Force',
        price: 119.99,
        category: 'Running',
        imageUrl: img('1571902943202-507ec2618e8f'),
        rating: 4.4,
        stock: 45,
        description: 'Tempo-day shoe with responsive forefoot and breathable knit.'
    },
    {
        id: 15,
        name: 'Stride Max',
        price: 129.99,
        category: 'Running',
        imageUrl: img('1595950653106-6c9ebd614d3a'),
        rating: 4.5,
        stock: 38,
        description: 'Max-cushion neutral trainer for high-mileage runners.'
    },
    {
        id: 16,
        name: 'Run Master Pro',
        price: 149.99,
        category: 'Running',
        imageUrl: img('1508609349937-5ec4ae374ebf'),
        rating: 4.7,
        stock: 14,
        description: 'Premium all-condition trainer with weatherproof upper.'
    },
    {
        id: 17,
        name: 'QuickStep Elite',
        price: 119.99,
        category: 'Running',
        imageUrl: img('1543351611-58f69d7c1781'),
        rating: 4.3,
        stock: 50,
        description: 'Lightweight runner for fast turnover and tempo intervals.'
    },
    {
        id: 18,
        name: 'Pro Sprint X',
        price: 139.99,
        category: 'Running',
        imageUrl: img('1552346154-21d32810aba3'),
        rating: 4.6,
        stock: 19,
        description: 'Sprint-tuned race shoe with carbon plate and aggressive forefoot rocker.'
    },
    {
        id: 19,
        name: 'Velocity Air',
        price: 129.99,
        category: 'Running',
        imageUrl: img('1542291026-7eec264c27ff'),
        rating: 4.5,
        stock: 27,
        description: 'Air-cushioned daily trainer balanced for road and treadmill.'
    },
    {
        id: 20,
        name: 'Ultra Track Max',
        price: 159.99,
        category: 'Running',
        imageUrl: img('1571902943202-507ec2618e8f'),
        rating: 4.8,
        stock: 12,
        description: 'Top-tier track and road racer with full-length plate and propulsive ride.'
    }
];

/* ---------------------------------------------------------------------- */
/* Football                                                               */
/* ---------------------------------------------------------------------- */
/*
 * Premium football boot lineup, structured for a real product detail
 * page in the style of adidas.com / nike.com / puma.com:
 *   - brand + realistic model name (Predator, Mercurial, Future...)
 *   - premium price tier ($169 - $279)
 *   - 4 gallery images per boot (multi-angle structure)
 *   - EU sizes 40-44 for boot fit selection
 *   - colourways (visible on the product detail page)
 *   - long-form marketing description
 *
 * Firebase migration playbook (zero UI changes required):
 *   1. Upload each boot's photos to Firebase Storage as
 *        products/football/<id>/01.jpg ... 04.jpg
 *   2. Set VITE_FIREBASE_STORAGE_BUCKET in .frontend/.env.local
 *      (and VITE_PRODUCT_IMAGE_SOURCE=firebase if you also want the
 *      generic fallback resolver to use the bucket).
 *   3. Replace each `images` URL below with its storage path. The
 *      resolver in utils/firebaseStorage.js builds the public URL
 *      with `?alt=media` automatically — every page picks it up.
 */

const FOOTBALL_BOOT_PHOTOS = [
    '1551958219-acbc608c6377',
    '1574629810360-7efbbe195018',
    '1543351611-58f69d7c1781',
    '1577223625816-7546f13df25d',
    '1518604666860-9ed391f76460',
    '1487466365202-1afdb86c764e',
    '1511886929837-354d827aae26'
];

function bootGallery(start, count = 4) {
    const out = [];
    for (let i = 0; i < count; i++) {
        const photo = FOOTBALL_BOOT_PHOTOS[(start + i) % FOOTBALL_BOOT_PHOTOS.length];
        out.push(img(photo));
    }
    return out;
}

const FOOTBALL_SIZES = [40, 41, 42, 43, 44];

function footballBoot({
    id,
    name,
    brand,
    price,
    rating,
    stock,
    photoStart,
    colors,
    description
}) {
    const images = bootGallery(photoStart, 4);
    return {
        id,
        name,
        brand,
        price,
        category: 'Football',
        imageUrl: images[0],
        images,
        description,
        rating,
        stock,
        sizes: FOOTBALL_SIZES,
        colors
    };
}

export const footballProducts = [
    footballBoot({
        id: 21,
        name: 'Adidas Predator Accuracy.1 FG',
        brand: 'Adidas',
        price: 269.99,
        rating: 4.9,
        stock: 14,
        photoStart: 0,
        colors: ['Solar Red', 'Core Black', 'Cloud White'],
        description: 'Designed for ruthless precision in front of goal, the Predator Accuracy.1 features Zone Skin rubber elements across the strike zone for an unrivaled connection on every shot. The Power Facet plate locks studs into firm natural grass, while a Primeknit collar wraps the ankle for a sock-like, locked-in feel from kickoff to final whistle.'
    }),
    footballBoot({
        id: 22,
        name: 'Nike Mercurial Superfly 9 Elite FG',
        brand: 'Nike',
        price: 279.99,
        rating: 4.8,
        stock: 11,
        photoStart: 1,
        colors: ['Volt / Black', 'Crimson', 'Sapphire Blue'],
        description: 'Born for top-end speed, the Mercurial Superfly 9 Elite is built for forwards who attack at full pace. Vaporposite+ technology fuses foam and grip pods to multiply touch speed and ball-grip in any weather. The Aerotrak plate flexes precisely where you need explosive push-off, while the Flyknit collar locks in your stride for confident acceleration.'
    }),
    footballBoot({
        id: 23,
        name: 'Puma Future Z 1.4 FG',
        brand: 'Puma',
        price: 229.99,
        rating: 4.7,
        stock: 18,
        photoStart: 2,
        colors: ['Neon Yellow', 'Pink Glo', 'Deep Navy'],
        description: 'FUZIONFIT+ adaptive compression band hugs the midfoot, locking the boot to your foot as you cut, twist and accelerate. A layered GripControl Pro coating delivers a sticky, tactile feel on every touch, and the Dynamic Motion outsole is tuned for firm ground with multi-directional studs that plant and pivot when the play breaks open.'
    }),
    footballBoot({
        id: 24,
        name: 'Adidas X Crazyfast.1 FG',
        brand: 'Adidas',
        price: 249.99,
        rating: 4.7,
        stock: 16,
        photoStart: 3,
        colors: ['Lucid Lemon', 'Solar Red', 'Core Black'],
        description: 'Built for raw, end-to-end speed, the X Crazyfast.1 fuses a featherweight Speedframe forged-mesh upper with a stripped-back Speedframe outsole to put pure pace under your feet. The mid-cut collar wraps the ankle for lock-down acceleration, while a Carbitex carbon plate is laser-tuned for firm, fast firm-ground surfaces.'
    }),
    footballBoot({
        id: 25,
        name: 'Nike Phantom GX Elite FG',
        brand: 'Nike',
        price: 259.99,
        rating: 4.8,
        stock: 13,
        photoStart: 4,
        colors: ['Black / Chrome', 'University Blue', 'Hyper Pink'],
        description: 'Engineered for the modern playmaker, the Phantom GX Elite features Gripknit yarn fused into the upper for a tacky, rubber-touch feel that shapes every pass and finish. A Cyclone 360 traction pattern bites firm ground in any direction, helping you set the tempo from deep, dictate transitions and arrive in the box on time.'
    }),
    footballBoot({
        id: 26,
        name: 'Adidas Copa Pure.1 FG',
        brand: 'Adidas',
        price: 219.99,
        rating: 4.6,
        stock: 21,
        photoStart: 5,
        colors: ['Cloud White', 'Energy Ink', 'Bold Onix'],
        description: 'A modern reinterpretation of the classic Copa, the Pure.1 wraps your foot in a soft, premium Fusionskin upper with a touchpod tongue for a clean strike on every contact. The micro-fit collar locks the ankle in place, while a control-tuned firm-ground outsole keeps you stable through tight turns and sudden changes of direction.'
    }),
    footballBoot({
        id: 27,
        name: 'Nike Tiempo Legend 10 Elite FG',
        brand: 'Nike',
        price: 229.99,
        rating: 4.7,
        stock: 19,
        photoStart: 6,
        colors: ['Black / Gold', 'Mahogany', 'White / Volt'],
        description: 'A heritage silhouette reborn for the modern game, the Tiempo Legend 10 Elite hand-finishes a soft, full-grain leather upper with FlyTouch Plus padding for a buttery, broken-in feel from the very first touch. A redesigned firm-ground outsole keeps you composed in the build-up, while All Conditions Control gives the leather grip in rain or shine.'
    }),
    footballBoot({
        id: 28,
        name: 'Puma King Ultimate FG',
        brand: 'Puma',
        price: 199.99,
        rating: 4.6,
        stock: 22,
        photoStart: 0,
        colors: ['Black / White', 'Royal Blue', 'Neon Citrus'],
        description: 'The King returns with K-better leather, a tongue-folded silhouette and a refined PEBA outsole that drops weight without giving up the legendary touch. Built for the timeless number 10 — the King Ultimate trades brute speed for craft, control and the kind of midfoot lockdown that lets you pick passes that other boots simply can not.'
    }),
    footballBoot({
        id: 29,
        name: 'Adidas Predator Edge+ FG',
        brand: 'Adidas',
        price: 259.99,
        rating: 4.7,
        stock: 12,
        photoStart: 1,
        colors: ['Team Royal', 'Solar Red', 'Core Black'],
        description: 'A laceless evolution of the iconic Predator, the Edge+ pairs a sock-fit Primeknit collar with bold rubber Zone Skin spikes that aggressively grip the ball through curve, swerve and dip. The Power Facet plate is sculpted around the medial bone for a clean, predictable strike — engineered for set-piece specialists who live for the moment.'
    }),
    footballBoot({
        id: 30,
        name: 'Nike Mercurial Vapor 15 Elite FG',
        brand: 'Nike',
        price: 239.99,
        rating: 4.7,
        stock: 17,
        photoStart: 2,
        colors: ['Bright Crimson', 'Mint Foam', 'Black / Anthracite'],
        description: 'The Mercurial Vapor 15 Elite is the low-cut sibling of the Superfly, designed for wingers who live in the channels. A 360 Speedcage pattern reinforces the lightweight Vaporposite+ upper for explosive cuts at top speed, while the Aerotrak Zone keeps studs digging in firm ground from the first sprint to extra-time.'
    }),
    footballBoot({
        id: 31,
        name: 'Puma Ultra Ultimate FG',
        brand: 'Puma',
        price: 239.99,
        rating: 4.6,
        stock: 15,
        photoStart: 3,
        colors: ['Ultra Orange', 'Black / Yellow', 'White / Blue'],
        description: 'At just 165g, the Ultra Ultimate is one of the lightest top-tier firm-ground boots ever made by Puma. A Matryxevo woven upper holds shape on the sprint, while a sculpted SpeedUnit outsole channels every gram of energy into push-off — built for the kind of striker whose first three steps decide the game.'
    }),
    footballBoot({
        id: 32,
        name: 'Mizuno Morelia Neo III β Elite',
        brand: 'Mizuno',
        price: 249.99,
        rating: 4.8,
        stock: 9,
        photoStart: 4,
        colors: ['White / Red', 'Black / Gold', 'Royal Blue'],
        description: 'Hand-crafted in Japan, the Morelia Neo III β Elite is built around an ultra-soft K-leather upper that moulds to the foot and disappears underneath you. A featherweight Pebax outsole and reinforced heel counter keep the boot stable on firm ground without sacrificing the sublime, barefoot ball feel that has made the Morelia line a connoisseur favourite for decades.'
    })
];

/* ---------------------------------------------------------------------- */
/* Fitness                                                                */
/* ---------------------------------------------------------------------- */

export const fitnessProducts = [{
        id: 41,
        name: 'PowerLift Kettlebell 12kg',
        price: 59.99,
        category: 'Fitness',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.7,
        stock: 40,
        description: 'Cast-iron kettlebell with smooth handle for swings, presses and Turkish get-ups.'
    },
    {
        id: 42,
        name: 'Adjustable Dumbbell Set',
        price: 129.99,
        category: 'Fitness',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.8,
        stock: 14,
        description: 'Quick-select adjustable dumbbells from 5 to 50 lbs each. Replaces 15 pairs.'
    },
    {
        id: 43,
        name: 'Pro Resistance Bands',
        price: 24.99,
        category: 'Fitness',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.4,
        stock: 140,
        description: 'Five graduated loop bands plus a door anchor for full-body conditioning.'
    },
    {
        id: 44,
        name: 'Heavy Duty Barbell',
        price: 199.99,
        category: 'Fitness',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.9,
        stock: 9,
        description: 'Knurled, dual-marked Olympic barbell rated for 1500 lb of crisp lifts.'
    },
    {
        id: 45,
        name: 'Home Gym Kit',
        price: 249.99,
        category: 'Fitness',
        imageUrl: img('1534438327276-14e5300c3a48'),
        rating: 4.6,
        stock: 11,
        description: 'Compact home gym station with bench, dumbbells, plates and a starter program.'
    },
    {
        id: 46,
        name: 'Yoga Mat Premium',
        price: 29.99,
        category: 'Fitness',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.5,
        stock: 80,
        description: 'Non-slip 6mm yoga mat with closed-cell sweat-resistant surface.'
    },
    {
        id: 47,
        name: 'Fitness Pull-up Bar',
        price: 49.99,
        category: 'Fitness',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.4,
        stock: 35,
        description: 'No-screw doorway pull-up bar with foam grips, holds 130 kg.'
    },
    {
        id: 48,
        name: 'Workout Bench Pro',
        price: 159.99,
        category: 'Fitness',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.6,
        stock: 17,
        description: 'Seven-position bench rated to 300 kg for incline / flat / decline pressing.'
    },
    {
        id: 49,
        name: 'Core Training Ball',
        price: 19.99,
        category: 'Fitness',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.3,
        stock: 95,
        description: 'Anti-burst stability ball with hand pump for core and balance work.'
    },
    {
        id: 50,
        name: 'Adjustable Kettlebell',
        price: 69.99,
        category: 'Fitness',
        imageUrl: img('1534438327276-14e5300c3a48'),
        rating: 4.6,
        stock: 28,
        description: 'Selectorized kettlebell from 8 to 20 kg with single-dial adjustment.'
    },
    {
        id: 51,
        name: 'Weight Plate Set',
        price: 89.99,
        category: 'Fitness',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.8,
        stock: 14,
        description: 'Color-coded bumper plate set designed for explosive lifts and drops.'
    },
    {
        id: 52,
        name: 'Smart Jump Rope',
        price: 14.99,
        category: 'Fitness',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.4,
        stock: 200,
        description: 'Bluetooth jump rope tracks reps, calories and intervals via the app.'
    },
    {
        id: 53,
        name: 'Ab Roller Pro',
        price: 22.99,
        category: 'Fitness',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.5,
        stock: 110,
        description: 'Dual-wheel ab roller with cushioned knee pad and quiet bearings.'
    },
    {
        id: 54,
        name: 'Foam Roller',
        price: 18.99,
        category: 'Fitness',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.5,
        stock: 130,
        description: 'High-density EVA foam roller for myofascial release and warm-ups.'
    },
    {
        id: 55,
        name: 'Gym Gloves Elite',
        price: 12.99,
        category: 'Fitness',
        imageUrl: img('1534438327276-14e5300c3a48'),
        rating: 4.3,
        stock: 180,
        description: 'Padded leather palm gloves with adjustable wrist strap.'
    },
    {
        id: 56,
        name: 'Resistance Tube Set',
        price: 34.99,
        category: 'Fitness',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.4,
        stock: 75,
        description: 'Five resistance tubes (10–50 lb) with handles, anchor and ankle straps.'
    },
    {
        id: 57,
        name: 'Fitness Tracker Band',
        price: 79.99,
        category: 'Fitness',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.5,
        stock: 60,
        description: 'Heart-rate, sleep and 14-day battery tracker with workout auto-detect.'
    },
    {
        id: 58,
        name: 'Spin Bike Pro',
        price: 199.99,
        category: 'Fitness',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.6,
        stock: 8,
        description: 'Belt-drive spin bike with magnetic resistance and tablet shelf.'
    },
    {
        id: 59,
        name: 'Treadmill Compact',
        price: 199.99,
        category: 'Fitness',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.5,
        stock: 5,
        description: 'Foldable compact treadmill with shock-absorbing deck and 12 programs.'
    },
    {
        id: 60,
        name: 'Elliptical Trainer X',
        price: 199.99,
        category: 'Fitness',
        imageUrl: img('1534438327276-14e5300c3a48'),
        rating: 4.4,
        stock: 7,
        description: 'Front-drive elliptical with smooth magnetic resistance and console.'
    }
];

/* ---------------------------------------------------------------------- */
/* Outdoor                                                                */
/* ---------------------------------------------------------------------- */

export const outdoorProducts = [{
        id: 61,
        name: 'TrailBlaze Hiking Pack',
        price: 89.99,
        category: 'Outdoor',
        imageUrl: img('1500530855697-b586d89ba3ee'),
        rating: 4.6,
        stock: 22,
        description: 'Ergonomic 40L pack with adjustable torso, hydration sleeve and rain cover.'
    },
    {
        id: 62,
        name: 'Camping Tent Pro',
        price: 149.99,
        category: 'Outdoor',
        imageUrl: img('1501785888041-af3ef285b470'),
        rating: 4.7,
        stock: 11,
        description: 'Freestanding 3-season tent under 2.4 kg with full-coverage rainfly.'
    },
    {
        id: 63,
        name: 'Hiking Boots Elite',
        price: 129.99,
        category: 'Outdoor',
        imageUrl: img('1500534314209-a25ddb2bd429'),
        rating: 4.6,
        stock: 20,
        description: 'Waterproof leather hiking boots with Vibram outsole and ankle support.'
    },
    {
        id: 64,
        name: 'Outdoor Sleeping Bag',
        price: 79.99,
        category: 'Outdoor',
        imageUrl: img('1441974231531-c6227db76b6e'),
        rating: 4.5,
        stock: 17,
        description: '650-fill down bag rated to -7C, packs small without losing loft.'
    },
    {
        id: 65,
        name: 'Portable Camping Stove',
        price: 59.99,
        category: 'Outdoor',
        imageUrl: img('1469474968028-56623f02e42e'),
        rating: 4.5,
        stock: 60,
        description: 'Single-burner backpacking stove with auto-ignition and stable pot supports.'
    },
    {
        id: 66,
        name: 'Hiking Poles Set',
        price: 39.99,
        category: 'Outdoor',
        imageUrl: img('1500530855697-b586d89ba3ee'),
        rating: 4.4,
        stock: 35,
        description: 'Featherweight foldable carbon poles with cork grips and quick-lock shafts.'
    },
    {
        id: 67,
        name: 'Adventure Backpack 40L',
        price: 99.99,
        category: 'Outdoor',
        imageUrl: img('1501785888041-af3ef285b470'),
        rating: 4.5,
        stock: 28,
        description: 'Multi-day adventure pack with hipbelt, rain cover and tool loops.'
    },
    {
        id: 68,
        name: 'Camping Lantern LED',
        price: 29.99,
        category: 'Outdoor',
        imageUrl: img('1500534314209-a25ddb2bd429'),
        rating: 4.4,
        stock: 90,
        description: 'Collapsible solar/USB lantern with 200 lumens and 50h runtime.'
    },
    {
        id: 69,
        name: 'Portable Water Filter',
        price: 49.99,
        category: 'Outdoor',
        imageUrl: img('1441974231531-c6227db76b6e'),
        rating: 4.5,
        stock: 70,
        description: 'Hollow-fibre filter rated for 100,000L. 0.1 micron, no batteries.'
    },
    {
        id: 70,
        name: 'Hiking Jacket Waterproof',
        price: 119.99,
        category: 'Outdoor',
        imageUrl: img('1469474968028-56623f02e42e'),
        rating: 4.7,
        stock: 14,
        description: 'Waterproof, breathable hardshell with helmet-compatible hood.'
    },
    {
        id: 71,
        name: 'Outdoor Hammock',
        price: 39.99,
        category: 'Outdoor',
        imageUrl: img('1500530855697-b586d89ba3ee'),
        rating: 4.4,
        stock: 80,
        description: 'Parachute-nylon double hammock with tree straps and carabiners.'
    },
    {
        id: 72,
        name: 'Camping Chair Foldable',
        price: 34.99,
        category: 'Outdoor',
        imageUrl: img('1501785888041-af3ef285b470'),
        rating: 4.5,
        stock: 65,
        description: 'Foldable aluminum camp chair, 1.1 kg, holds 130 kg.'
    },
    {
        id: 73,
        name: 'Multi-tool Knife',
        price: 19.99,
        category: 'Outdoor',
        imageUrl: img('1500534314209-a25ddb2bd429'),
        rating: 4.6,
        stock: 80,
        description: '14-in-1 multi-tool with locking blade, rescue hook and pliers.'
    },
    {
        id: 74,
        name: 'Travel Compass Pro',
        price: 14.99,
        category: 'Outdoor',
        imageUrl: img('1441974231531-c6227db76b6e'),
        rating: 4.4,
        stock: 120,
        description: 'Sighting compass with adjustable declination and clinometer.'
    },
    {
        id: 75,
        name: 'Climbing Rope Set',
        price: 69.99,
        category: 'Outdoor',
        imageUrl: img('1469474968028-56623f02e42e'),
        rating: 4.6,
        stock: 16,
        description: 'Dynamic climbing rope (10mm x 60m) with rope bag and end markers.'
    },
    {
        id: 76,
        name: 'Thermal Flask 1L',
        price: 24.99,
        category: 'Outdoor',
        imageUrl: img('1500530855697-b586d89ba3ee'),
        rating: 4.5,
        stock: 200,
        description: 'Vacuum-insulated stainless flask keeps drinks hot/cold for 24h.'
    },
    {
        id: 77,
        name: 'Camping Cookware Kit',
        price: 54.99,
        category: 'Outdoor',
        imageUrl: img('1501785888041-af3ef285b470'),
        rating: 4.5,
        stock: 40,
        description: '4-piece anodized cookset packs into a 1L pot. Pot, pan, lid, tool.'
    },
    {
        id: 78,
        name: 'Outdoor GPS Watch',
        price: 199.99,
        category: 'Outdoor',
        imageUrl: img('1500534314209-a25ddb2bd429'),
        rating: 4.7,
        stock: 18,
        description: 'GPS multi-sport watch with maps, heart-rate and 14-day battery life.'
    },
    {
        id: 79,
        name: 'Solar Power Charger',
        price: 39.99,
        category: 'Outdoor',
        imageUrl: img('1441974231531-c6227db76b6e'),
        rating: 4.4,
        stock: 75,
        description: 'Foldable 20W solar panel with dual USB output for trail days.'
    },
    {
        id: 80,
        name: 'Camping Table Compact',
        price: 59.99,
        category: 'Outdoor',
        imageUrl: img('1469474968028-56623f02e42e'),
        rating: 4.4,
        stock: 32,
        description: 'Foldable aluminum camp table that packs to 38cm and holds 30 kg.'
    }
];

/* ---------------------------------------------------------------------- */
/* Basketball                                                             */
/* ---------------------------------------------------------------------- */

export const basketballProducts = [{
        id: 81,
        name: 'Pro Basketball Elite',
        price: 39.99,
        category: 'Basketball',
        imageUrl: img('1519861531473-9200262188bf'),
        rating: 4.6,
        stock: 45,
        description: 'Composite leather basketball with deep channels for grip and control.'
    },
    {
        id: 82,
        name: 'Court Dominator Shoes',
        price: 119.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.7,
        stock: 18,
        description: 'Hi-top court shoes with full-length air cushioning and grippy outsole.'
    },
    {
        id: 83,
        name: 'Indoor Court Ball',
        price: 29.99,
        category: 'Basketball',
        imageUrl: img('1508804185872-d7badad00f7d'),
        rating: 4.4,
        stock: 80,
        description: 'Indoor-only PU basketball with deep pebbled grip pattern.'
    },
    {
        id: 84,
        name: 'Basketball Hoop Pro',
        price: 199.99,
        category: 'Basketball',
        imageUrl: img('1519861531473-9200262188bf'),
        rating: 4.6,
        stock: 5,
        description: 'Adjustable 7-10 ft pole-mounted hoop with shatter-resistant backboard.'
    },
    {
        id: 85,
        name: 'Training Basketball Kit',
        price: 59.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.5,
        stock: 40,
        description: 'Training kit: ball, agility cones, dribble goggles and shooting sleeve.'
    },
    {
        id: 86,
        name: 'Street Basketball Ball',
        price: 24.99,
        category: 'Basketball',
        imageUrl: img('1508804185872-d7badad00f7d'),
        rating: 4.4,
        stock: 110,
        description: 'Rubber-cover street ball built for asphalt and concrete play.'
    },
    {
        id: 87,
        name: 'Pro Dunk Shoes',
        price: 139.99,
        category: 'Basketball',
        imageUrl: img('1519861531473-9200262188bf'),
        rating: 4.7,
        stock: 14,
        description: 'Vertical-tuned hi-top with carbon plate and herringbone traction.'
    },
    {
        id: 88,
        name: 'Outdoor Basketball Set',
        price: 89.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.5,
        stock: 24,
        description: 'Outdoor backyard set: rubber ball, pump, net replacement and bracket.'
    },
    {
        id: 89,
        name: 'Basketball Net Durable',
        price: 19.99,
        category: 'Basketball',
        imageUrl: img('1508804185872-d7badad00f7d'),
        rating: 4.3,
        stock: 220,
        description: 'All-weather nylon net resists fraying in rain and UV.'
    },
    {
        id: 90,
        name: 'Elite Court Sneakers',
        price: 129.99,
        category: 'Basketball',
        imageUrl: img('1519861531473-9200262188bf'),
        rating: 4.6,
        stock: 22,
        description: 'Mid-cut court sneaker with responsive cushioning and ankle support.'
    },
    {
        id: 91,
        name: 'Basketball Training Ball',
        price: 34.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.4,
        stock: 70,
        description: 'Training-grade composite leather ball, ideal for daily reps.'
    },
    {
        id: 92,
        name: 'Portable Hoop Set',
        price: 159.99,
        category: 'Basketball',
        imageUrl: img('1508804185872-d7badad00f7d'),
        rating: 4.5,
        stock: 7,
        description: 'Portable hoop on weighted base, adjustable from 6-10 ft.'
    },
    {
        id: 93,
        name: 'Basketball Pump Kit',
        price: 14.99,
        category: 'Basketball',
        imageUrl: img('1519861531473-9200262188bf'),
        rating: 4.4,
        stock: 150,
        description: 'Dual-action pump with pressure gauge and 3 needles.'
    },
    {
        id: 94,
        name: 'Court Grip Gloves',
        price: 19.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.3,
        stock: 95,
        description: 'Lightweight ball-handling gloves for grip and finger conditioning.'
    },
    {
        id: 95,
        name: 'Advanced Training Kit',
        price: 79.99,
        category: 'Basketball',
        imageUrl: img('1508804185872-d7badad00f7d'),
        rating: 4.5,
        stock: 30,
        description: 'Full-court training kit: agility cones, ladder, dribble goggles, sleeve.'
    },
    {
        id: 96,
        name: 'Basketball Shorts Pro',
        price: 29.99,
        category: 'Basketball',
        imageUrl: img('1519861531473-9200262188bf'),
        rating: 4.4,
        stock: 130,
        description: 'Lightweight mesh shorts with side pockets and elastic waistband.'
    },
    {
        id: 97,
        name: 'Game Day Ball Elite',
        price: 49.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.7,
        stock: 35,
        description: 'Tournament-grade leather ball, indoor courts only.'
    },
    {
        id: 98,
        name: 'Training Cone Set',
        price: 24.99,
        category: 'Basketball',
        imageUrl: img('1508804185872-d7badad00f7d'),
        rating: 4.4,
        stock: 220,
        description: 'Stackable 23cm agility cones with mesh carry bag, set of 12.'
    },
    {
        id: 99,
        name: 'Basketball Socks Elite',
        price: 12.99,
        category: 'Basketball',
        imageUrl: img('1519861531473-9200262188bf'),
        rating: 4.3,
        stock: 200,
        description: 'Compression socks with cushioned heel and arch support.'
    },
    {
        id: 100,
        name: 'Elite Slam Dunk Shoes',
        price: 149.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.7,
        stock: 13,
        description: 'Premium hi-top with full-length air cushioning and rubber outsole.'
    }
];

/* ---------------------------------------------------------------------- */
/* Training                                                               */
/* ---------------------------------------------------------------------- */

export const trainingProducts = [{
        id: 101,
        name: 'Agility Training Cones',
        price: 24.99,
        category: 'Training',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.5,
        stock: 110,
        description: 'Stackable 23cm agility cones with mesh carry bag, set of 12.'
    },
    {
        id: 102,
        name: 'Speed Ladder Pro',
        price: 34.99,
        category: 'Training',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.7,
        stock: 19,
        description: '4m flat-rung speed ladder with carry bag for footwork drills.'
    },
    {
        id: 103,
        name: 'Resistance Bands Set',
        price: 19.99,
        category: 'Training',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.4,
        stock: 140,
        description: 'Five graduated loop bands plus door anchor for mobility and travel.'
    },
    {
        id: 104,
        name: 'Jump Rope Speed Pro',
        price: 14.99,
        category: 'Training',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.6,
        stock: 200,
        description: 'Adjustable steel cable jump rope with ball-bearing handles.'
    },
    {
        id: 105,
        name: 'Training Hurdles Set',
        price: 49.99,
        category: 'Training',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.5,
        stock: 80,
        description: 'Pair of adjustable plastic hurdles for plyometric drills.'
    },
    {
        id: 106,
        name: 'Reaction Ball Trainer',
        price: 12.99,
        category: 'Training',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.3,
        stock: 150,
        description: 'Six-sided reaction ball for unpredictable bounces and reflex training.'
    },
    {
        id: 107,
        name: 'Speed Parachute',
        price: 29.99,
        category: 'Training',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.3,
        stock: 70,
        description: 'Adjustable resistance parachute for sprint and acceleration training.'
    },
    {
        id: 108,
        name: 'Core Strength Kit',
        price: 39.99,
        category: 'Training',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.5,
        stock: 60,
        description: 'Core kit: medicine ball, ab roller, resistance band and program guide.'
    },
    {
        id: 109,
        name: 'Balance Board Trainer',
        price: 44.99,
        category: 'Training',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.4,
        stock: 45,
        description: 'Wobble board with non-slip surface for proprioception and rehab.'
    },
    {
        id: 110,
        name: 'Training Marker Discs',
        price: 19.99,
        category: 'Training',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.4,
        stock: 200,
        description: 'Set of 50 flat marker discs in five colors with carry bag.'
    },
    {
        id: 111,
        name: 'Power Resistance Kit',
        price: 54.99,
        category: 'Training',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.5,
        stock: 50,
        description: 'Heavy-duty resistance kit: bands, anchor, ankle straps, carry bag.'
    },
    {
        id: 112,
        name: 'Explosive Jump Trainer',
        price: 59.99,
        category: 'Training',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.6,
        stock: 22,
        description: 'Adjustable plyo box for explosive jumps, step-ups and incline push-ups.'
    },
    {
        id: 113,
        name: 'Footwork Training Kit',
        price: 34.99,
        category: 'Training',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.5,
        stock: 90,
        description: 'Footwork bundle: agility ladder, cones and lateral resistance bands.'
    },
    {
        id: 114,
        name: 'Speed Training Kit Pro',
        price: 69.99,
        category: 'Training',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.5,
        stock: 25,
        description: 'Sprint training bundle: parachute, sled, harness and carry bag.'
    },
    {
        id: 115,
        name: 'Strength Bands Heavy',
        price: 29.99,
        category: 'Training',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.5,
        stock: 80,
        description: 'Heavy-duty pull-up assistance bands rated up to 200 lb resistance.'
    },
    {
        id: 116,
        name: 'Agility Ring Set',
        price: 39.99,
        category: 'Training',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.4,
        stock: 60,
        description: 'Twelve-piece agility rings with connectors for endless drill patterns.'
    },
    {
        id: 117,
        name: 'Reaction Training Lights',
        price: 89.99,
        category: 'Training',
        imageUrl: img('1599058917212-d750089bc07e'),
        rating: 4.6,
        stock: 18,
        description: 'Six wireless reaction lights with companion app and team modes.'
    },
    {
        id: 118,
        name: 'Sprint Resistance Belt',
        price: 44.99,
        category: 'Training',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.4,
        stock: 36,
        description: 'Padded waist belt with sled-style resistance attachment.'
    },
    {
        id: 119,
        name: 'Multi-Training Kit',
        price: 79.99,
        category: 'Training',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.5,
        stock: 28,
        description: 'All-in-one kit: cones, ladder, hurdles, bands, rings and a duffel.'
    },
    {
        id: 120,
        name: 'Athlete Training Pack',
        price: 99.99,
        category: 'Training',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.6,
        stock: 15,
        description: 'Pro-level training bundle for explosive power, speed and agility.'
    }
];

/* ---------------------------------------------------------------------- */
/* Accessories                                                            */
/* ---------------------------------------------------------------------- */

export const accessoriesProducts = [{
        id: 121,
        name: 'Sports Water Bottle',
        price: 14.99,
        category: 'Accessories',
        imageUrl: img('1554068865-24cecd4e34b8'),
        rating: 4.5,
        stock: 200,
        description: 'BPA-free 750ml sports bottle with leakproof flip-top cap.'
    },
    {
        id: 122,
        name: 'Gym Backpack Pro',
        price: 49.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.5,
        stock: 50,
        description: 'Wet/dry compartment, padded laptop sleeve and ventilated shoe pocket.'
    },
    {
        id: 123,
        name: 'Workout Gloves Elite',
        price: 19.99,
        category: 'Accessories',
        imageUrl: img('1612872087720-bb876e2e67d1'),
        rating: 4.4,
        stock: 130,
        description: 'Padded leather palm gloves with adjustable wrist strap and grip pads.'
    },
    {
        id: 124,
        name: 'Fitness Towel Pack',
        price: 12.99,
        category: 'Accessories',
        imageUrl: img('1554068865-24cecd4e34b8'),
        rating: 4.3,
        stock: 220,
        description: 'Microfibre towel pack (3) that dries 3x faster than cotton.'
    },
    {
        id: 125,
        name: 'Sports Headband Set',
        price: 9.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.3,
        stock: 240,
        description: 'Pack of three moisture-wicking headbands.'
    },
    {
        id: 126,
        name: 'Running Belt Bag',
        price: 24.99,
        category: 'Accessories',
        imageUrl: img('1612872087720-bb876e2e67d1'),
        rating: 4.4,
        stock: 110,
        description: 'Bounce-free running belt with phone pocket and gel loops.'
    },
    {
        id: 127,
        name: 'Shaker Bottle Pro',
        price: 14.99,
        category: 'Accessories',
        imageUrl: img('1554068865-24cecd4e34b8'),
        rating: 4.4,
        stock: 200,
        description: 'Leakproof 700ml protein shaker with stainless wire whisk ball.'
    },
    {
        id: 128,
        name: 'Sports Cap Premium',
        price: 19.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.4,
        stock: 220,
        description: 'Lightweight running/tennis cap with sweatband and reflective trim.'
    },
    {
        id: 129,
        name: 'Gym Wrist Wraps',
        price: 15.99,
        category: 'Accessories',
        imageUrl: img('1612872087720-bb876e2e67d1'),
        rating: 4.5,
        stock: 130,
        description: 'Heavy-duty wrist wraps with thumb loop and IPF approval.'
    },
    {
        id: 130,
        name: 'Fitness Arm Band',
        price: 11.99,
        category: 'Accessories',
        imageUrl: img('1554068865-24cecd4e34b8'),
        rating: 4.3,
        stock: 200,
        description: 'Sweat-proof phone armband with reflective strip and key pocket.'
    },
    {
        id: 131,
        name: 'Sports Sunglasses',
        price: 29.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.5,
        stock: 70,
        description: 'Polarised sport sunglasses with anti-slip nose pads and UV400 lenses.'
    },
    {
        id: 132,
        name: 'Training Gloves Pro',
        price: 21.99,
        category: 'Accessories',
        imageUrl: img('1612872087720-bb876e2e67d1'),
        rating: 4.4,
        stock: 90,
        description: 'Non-slip palm and breathable mesh back for grip and ventilation.'
    },
    {
        id: 133,
        name: 'Sports Socks Pack',
        price: 12.99,
        category: 'Accessories',
        imageUrl: img('1554068865-24cecd4e34b8'),
        rating: 4.6,
        stock: 220,
        description: 'Six-pack of arch-support socks with cushioned heel and toe.'
    },
    {
        id: 134,
        name: 'Gym Duffel Bag',
        price: 59.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.5,
        stock: 60,
        description: 'Heavy-duty duffel with shoe compartment, padded shoulder strap.'
    },
    {
        id: 135,
        name: 'Fitness Smart Watch',
        price: 149.99,
        category: 'Accessories',
        imageUrl: img('1612872087720-bb876e2e67d1'),
        rating: 4.6,
        stock: 25,
        description: 'GPS smartwatch with heart-rate, sleep tracking and 14-day battery.'
    },
    {
        id: 136,
        name: 'Hydration Pack',
        price: 39.99,
        category: 'Accessories',
        imageUrl: img('1554068865-24cecd4e34b8'),
        rating: 4.6,
        stock: 40,
        description: 'Soft flask-friendly running vest for long runs and hikes.'
    },
    {
        id: 137,
        name: 'Sports Earbuds',
        price: 79.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.5,
        stock: 60,
        description: 'IPX7 sweat-proof wireless earbuds with 30h total battery life.'
    },
    {
        id: 138,
        name: 'Running Armband',
        price: 14.99,
        category: 'Accessories',
        imageUrl: img('1612872087720-bb876e2e67d1'),
        rating: 4.3,
        stock: 180,
        description: 'Reflective phone armband with adjustable strap and key pocket.'
    },
    {
        id: 139,
        name: 'Fitness Waist Bag',
        price: 19.99,
        category: 'Accessories',
        imageUrl: img('1554068865-24cecd4e34b8'),
        rating: 4.4,
        stock: 110,
        description: 'Lightweight waist bag with two zippered compartments and mesh back.'
    },
    {
        id: 140,
        name: 'Sports Travel Kit',
        price: 34.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.4,
        stock: 90,
        description: 'Hanging toiletry kit with mesh pockets and water-resistant base.'
    }
];

/* ---------------------------------------------------------------------- */
/* Lifestyle                                                              */
/* ---------------------------------------------------------------------- */
/*
 * Streetwear / off-court line shown under the "Lifestyle" mega-menu tab.
 *
 * Each item carries:
 *   - subcategory : 'Sneakers' | 'Hoodies' | 'T-Shirts'
 *                 | 'Joggers'  | 'Caps'    | 'Bags'
 *   - gender      : 'Men' | 'Women' | 'Kids' | 'Unisex'
 *
 * The mega-menu links combine `category=lifestyle` with a `search=` token
 * that also appears in the product name, so the existing PLP search hits
 * the right subcategory without new filter plumbing.
 *
 * Photos are reused from the verified Unsplash IDs already in this file
 * (the same pool football / running products use). Swap to your own
 * apparel photography or Firebase Storage paths later — the resolver
 * picks the new URLs up automatically.
 */

const LIFESTYLE_PHOTOS = {
    Sneakers: [
        '1542291026-7eec264c27ff',
        '1552346154-21d32810aba3',
        '1543351611-58f69d7c1781',
        '1571902943202-507ec2618e8f',
        '1518604666860-9ed391f76460'
    ],
    Hoodies: [
        '1571902943202-507ec2618e8f',
        '1518604666860-9ed391f76460',
        '1487466365202-1afdb86c764e'
    ],
    'T-Shirts': [
        '1487466365202-1afdb86c764e',
        '1571902943202-507ec2618e8f',
        '1518604666860-9ed391f76460'
    ],
    Joggers: [
        '1577223625816-7546f13df25d',
        '1574629810360-7efbbe195018',
        '1551958219-acbc608c6377'
    ],
    Caps: [
        '1505740420928-5e560c06d30e',
        '1612872087720-bb876e2e67d1'
    ],
    Bags: [
        '1505740420928-5e560c06d30e',
        '1554068865-24cecd4e34b8',
        '1612872087720-bb876e2e67d1'
    ]
};

function lifestyleImg(subcategory, index) {
    const pool = LIFESTYLE_PHOTOS[subcategory] || LIFESTYLE_PHOTOS.Sneakers;
    return img(pool[index % pool.length]);
}

function lifestyleItem({
    id,
    name,
    subcategory,
    gender,
    price,
    rating,
    stock,
    description,
    photoIndex
}) {
    return {
        id,
        name,
        price,
        category: 'Lifestyle',
        subcategory,
        gender,
        imageUrl: lifestyleImg(subcategory, photoIndex),
        rating,
        stock,
        description
    };
}

export const lifestyleProducts = [
    lifestyleItem({
        id: 141,
        name: 'Heritage Court Lo Sneaker',
        subcategory: 'Sneakers',
        gender: 'Men',
        price: 89.99,
        rating: 4.6,
        stock: 42,
        photoIndex: 0,
        description: 'Low-cut court silhouette in soft full-grain leather with a vulcanised cupsole and tonal three-stripe overlays. An everyday lifestyle sneaker that pairs as easily with denim as with joggers.'
    }),
    lifestyleItem({
        id: 142,
        name: 'Originals Trefoil Lo Lifestyle Sneaker',
        subcategory: 'Sneakers',
        gender: 'Women',
        price: 79.99,
        rating: 4.5,
        stock: 38,
        photoIndex: 1,
        description: 'Clean white leather upper with perforated three-stripes and a slim rubber outsole. Iconic off-duty silhouette built for all-day comfort.'
    }),
    lifestyleItem({
        id: 143,
        name: 'Gazelle Heritage Trainer',
        subcategory: 'Sneakers',
        gender: 'Unisex',
        price: 94.99,
        rating: 4.7,
        stock: 24,
        photoIndex: 2,
        description: 'Suede-wrapped retro trainer with a gum rubber outsole and contrast T-toe panel. Reissued from the archive for a timeless street-ready fit.'
    }),
    lifestyleItem({
        id: 144,
        name: 'Samba Classic Lifestyle Shoe',
        subcategory: 'Sneakers',
        gender: 'Men',
        price: 109.99,
        rating: 4.8,
        stock: 19,
        photoIndex: 3,
        description: 'Heritage indoor-football silhouette reborn for the street. Smooth leather upper, suede T-toe and a pre-moulded gum sole for an instantly broken-in feel.'
    }),
    lifestyleItem({
        id: 145,
        name: 'Forum Lo Premium Sneaker',
        subcategory: 'Sneakers',
        gender: 'Men',
        price: 119.99,
        rating: 4.6,
        stock: 17,
        photoIndex: 4,
        description: 'Low-top hoops-inspired sneaker with hook-and-loop ankle strap, full-grain leather panels and a sculpted EVA midsole.'
    }),
    lifestyleItem({
        id: 146,
        name: 'NMD Streetwear Runner',
        subcategory: 'Sneakers',
        gender: 'Men',
        price: 129.99,
        rating: 4.7,
        stock: 22,
        photoIndex: 0,
        description: 'Modern lifestyle runner with a sock-fit Primeknit upper, signature plug detailing on the midsole and responsive Boost cushioning underfoot.'
    }),
    lifestyleItem({
        id: 147,
        name: 'Ozweego Chunky Sneaker',
        subcategory: 'Sneakers',
        gender: 'Women',
        price: 139.99,
        rating: 4.5,
        stock: 14,
        photoIndex: 1,
        description: 'Bold chunky silhouette pieced together from layered mesh, nubuck and reflective overlays. Statement lifestyle shoe with all-day comfort.'
    }),
    lifestyleItem({
        id: 148,
        name: 'Superstar Heritage Sneaker',
        subcategory: 'Sneakers',
        gender: 'Unisex',
        price: 99.99,
        rating: 4.7,
        stock: 31,
        photoIndex: 2,
        description: 'The original shell-toe court icon. Leather upper, classic three-stripe panel and a rubber cupsole that has been a streetwear staple for decades.'
    }),
    lifestyleItem({
        id: 149,
        name: 'Continental 80 Retro Sneaker',
        subcategory: 'Sneakers',
        gender: 'Women',
        price: 84.99,
        rating: 4.4,
        stock: 26,
        photoIndex: 3,
        description: 'Slim, low-profile court trainer reissued from the 80s archive. Pastel three-stripe accents on a soft leather upper and a low cupsole.'
    }),
    lifestyleItem({
        id: 150,
        name: 'ZX Flux Lifestyle Runner',
        subcategory: 'Sneakers',
        gender: 'Men',
        price: 99.99,
        rating: 4.4,
        stock: 28,
        photoIndex: 4,
        description: 'Streamlined lifestyle runner with a stretch mesh upper, welded TPU cage and a TORSION shank for stable everyday wear.'
    }),
    lifestyleItem({
        id: 151,
        name: 'Forum Mid Street Sneaker',
        subcategory: 'Sneakers',
        gender: 'Women',
        price: 109.99,
        rating: 4.5,
        stock: 21,
        photoIndex: 0,
        description: 'Mid-cut hoops silhouette with elastic ankle strap, padded collar and contrast suede heel patch — a heritage street-ready favourite.'
    }),
    lifestyleItem({
        id: 152,
        name: 'Originals Trefoil Kids Sneaker',
        subcategory: 'Sneakers',
        gender: 'Kids',
        price: 59.99,
        rating: 4.6,
        stock: 50,
        photoIndex: 1,
        description: 'Classic kids low-top in a soft synthetic leather upper with hook-and-loop straps for easy on/off and a flexible rubber outsole.'
    }),

    lifestyleItem({
        id: 153,
        name: 'Trefoil Logo Pullover Hoodie',
        subcategory: 'Hoodies',
        gender: 'Men',
        price: 69.99,
        rating: 4.6,
        stock: 60,
        photoIndex: 0,
        description: 'Brushed-back fleece pullover hoodie with a kangaroo pocket and a flock-printed trefoil chest logo. Cut for a relaxed everyday fit.'
    }),
    lifestyleItem({
        id: 154,
        name: 'Essentials Crew Sweatshirt',
        subcategory: 'Hoodies',
        gender: 'Men',
        price: 54.99,
        rating: 4.5,
        stock: 80,
        photoIndex: 1,
        description: 'Soft cotton-blend crew with ribbed cuffs and hem and a small embroidered logo on the chest. The everyday layering staple.'
    }),
    lifestyleItem({
        id: 155,
        name: 'Trefoil Pullover Hoodie',
        subcategory: 'Hoodies',
        gender: 'Women',
        price: 64.99,
        rating: 4.6,
        stock: 55,
        photoIndex: 2,
        description: 'Mid-weight french terry hoodie with a slightly cropped hem, drop shoulders and an embroidered trefoil logo across the chest.'
    }),
    lifestyleItem({
        id: 156,
        name: '3-Stripes Fleece Hoodie',
        subcategory: 'Hoodies',
        gender: 'Unisex',
        price: 74.99,
        rating: 4.7,
        stock: 44,
        photoIndex: 0,
        description: 'Heritage three-stripe fleece hoodie with rubber wordmark on the sleeve and a soft brushed inner. Built to broken-in comfort.'
    }),
    lifestyleItem({
        id: 157,
        name: 'Sportswear Premium Hoodie',
        subcategory: 'Hoodies',
        gender: 'Women',
        price: 79.99,
        rating: 4.6,
        stock: 30,
        photoIndex: 1,
        description: 'Heavyweight cotton hoodie with a tonal flock logo, ribbed details and a generous oversized fit for layering off-court.'
    }),
    lifestyleItem({
        id: 158,
        name: 'Future Icons Half-Zip',
        subcategory: 'Hoodies',
        gender: 'Men',
        price: 69.99,
        rating: 4.5,
        stock: 36,
        photoIndex: 2,
        description: 'Smooth interlock half-zip with a stand collar and reflective brand mark on the chest. Sleek silhouette for off-duty travel days.'
    }),
    lifestyleItem({
        id: 159,
        name: 'Adicolor Cropped Hoodie',
        subcategory: 'Hoodies',
        gender: 'Women',
        price: 59.99,
        rating: 4.5,
        stock: 42,
        photoIndex: 0,
        description: 'Cropped pullover hoodie with three-stripe sleeves and a heritage trefoil logo. Warm french terry inside, vintage attitude outside.'
    }),
    lifestyleItem({
        id: 160,
        name: 'Kids Trefoil Crew Sweatshirt',
        subcategory: 'Hoodies',
        gender: 'Kids',
        price: 39.99,
        rating: 4.5,
        stock: 80,
        photoIndex: 1,
        description: 'Soft cotton-fleece crewneck for kids with a printed trefoil chest logo and ribbed hem and cuffs for a snug fit.'
    }),
    lifestyleItem({
        id: 161,
        name: 'Lifestyle Quarter-Zip Hoodie',
        subcategory: 'Hoodies',
        gender: 'Men',
        price: 64.99,
        rating: 4.4,
        stock: 30,
        photoIndex: 2,
        description: 'Mid-layer quarter-zip hoodie with brushed-back jersey, raglan sleeves and a tonal embroidered logo on the sleeve.'
    }),
    lifestyleItem({
        id: 162,
        name: 'Premium Tonal Logo Hoodie',
        subcategory: 'Hoodies',
        gender: 'Unisex',
        price: 89.99,
        rating: 4.7,
        stock: 22,
        photoIndex: 0,
        description: 'Heavyweight 480 GSM hoodie with embroidered tonal three-stripe and trefoil. Substantial drape, dropped shoulders, ribbed cuffs.'
    }),

    lifestyleItem({
        id: 163,
        name: 'Trefoil Logo Tee',
        subcategory: 'T-Shirts',
        gender: 'Men',
        price: 29.99,
        rating: 4.5,
        stock: 120,
        photoIndex: 0,
        description: 'Classic regular-fit cotton tee with a printed trefoil logo on the chest. Ribbed crew neck and a soft hand-feel.'
    }),
    lifestyleItem({
        id: 164,
        name: 'Adicolor Classic Tee',
        subcategory: 'T-Shirts',
        gender: 'Women',
        price: 32.99,
        rating: 4.5,
        stock: 90,
        photoIndex: 1,
        description: 'Slim-fit cotton tee with a heritage trefoil at the chest and a slightly shorter body length for everyday layering.'
    }),
    lifestyleItem({
        id: 165,
        name: 'Sportswear Linear Tee',
        subcategory: 'T-Shirts',
        gender: 'Men',
        price: 24.99,
        rating: 4.4,
        stock: 130,
        photoIndex: 2,
        description: 'Soft cotton tee with a rubber-print linear wordmark across the chest. Standard fit, ribbed crew neck.'
    }),
    lifestyleItem({
        id: 166,
        name: 'Cropped Trefoil Tee',
        subcategory: 'T-Shirts',
        gender: 'Women',
        price: 29.99,
        rating: 4.4,
        stock: 80,
        photoIndex: 0,
        description: 'Cropped boxy-fit cotton tee with three-stripe shoulders and a tonal trefoil chest hit. Pairs with high-rise joggers and skirts.'
    }),
    lifestyleItem({
        id: 167,
        name: 'Future Icons Performance Tee',
        subcategory: 'T-Shirts',
        gender: 'Unisex',
        price: 34.99,
        rating: 4.5,
        stock: 70,
        photoIndex: 1,
        description: 'AEROREADY interlock tee with a satin print logo at the chest and a slightly extended back hem for coverage in motion.'
    }),
    lifestyleItem({
        id: 168,
        name: 'Kids Adicolor Tee',
        subcategory: 'T-Shirts',
        gender: 'Kids',
        price: 19.99,
        rating: 4.5,
        stock: 110,
        photoIndex: 2,
        description: 'Soft cotton kids tee with three-stripe sleeves and a flock trefoil chest hit. Easy-care, machine washable, regular fit.'
    }),
    lifestyleItem({
        id: 169,
        name: 'Premium Heavy Logo Tee',
        subcategory: 'T-Shirts',
        gender: 'Men',
        price: 39.99,
        rating: 4.6,
        stock: 55,
        photoIndex: 0,
        description: 'Heavyweight 240 GSM cotton tee with double-stitched seams, a boxy modern fit and an embroidered logo at the chest.'
    }),
    lifestyleItem({
        id: 170,
        name: 'Heritage Striped Tee',
        subcategory: 'T-Shirts',
        gender: 'Women',
        price: 34.99,
        rating: 4.4,
        stock: 65,
        photoIndex: 1,
        description: 'Yarn-dyed striped cotton tee with a small chest logo and a lightly cropped silhouette. Borrowed-from-the-boys lifestyle staple.'
    }),

    lifestyleItem({
        id: 171,
        name: 'Adicolor Classic Joggers',
        subcategory: 'Joggers',
        gender: 'Men',
        price: 59.99,
        rating: 4.6,
        stock: 70,
        photoIndex: 0,
        description: 'Heritage tricot track pants with three-stripe leg trim, ribbed cuffs and an elastic drawcord waist. The pair you always reach for.'
    }),
    lifestyleItem({
        id: 172,
        name: '3-Stripes Cuffed Track Pants',
        subcategory: 'Joggers',
        gender: 'Men',
        price: 54.99,
        rating: 4.5,
        stock: 85,
        photoIndex: 1,
        description: 'Cotton-blend cuffed pants with embroidered three-stripes down the leg, side pockets and a soft brushed-back inner.'
    }),
    lifestyleItem({
        id: 173,
        name: 'Sportswear Lounge Joggers',
        subcategory: 'Joggers',
        gender: 'Women',
        price: 64.99,
        rating: 4.5,
        stock: 60,
        photoIndex: 2,
        description: 'High-rise lounge joggers in french terry with side pockets, a wide elastic waistband and tapered fit through the leg.'
    }),
    lifestyleItem({
        id: 174,
        name: 'Trefoil Cargo Pants',
        subcategory: 'Joggers',
        gender: 'Unisex',
        price: 74.99,
        rating: 4.5,
        stock: 36,
        photoIndex: 0,
        description: 'Loose-fit cargo joggers with bellowed thigh pockets, a drawcord waist and embroidered branding above the cuff.'
    }),
    lifestyleItem({
        id: 175,
        name: 'Premium Tapered Pants',
        subcategory: 'Joggers',
        gender: 'Men',
        price: 69.99,
        rating: 4.6,
        stock: 28,
        photoIndex: 1,
        description: 'Smooth jersey pants with a tapered leg, hidden zip pockets and a clean tonal logo at the thigh. Travel-ready off-duty fit.'
    }),
    lifestyleItem({
        id: 176,
        name: 'Adicolor Wide-Leg Track Pants',
        subcategory: 'Joggers',
        gender: 'Women',
        price: 69.99,
        rating: 4.5,
        stock: 32,
        photoIndex: 2,
        description: 'High-waist wide-leg track pants in soft tricot with three-stripe trim and a clean unbroken hem. Heritage shape, modern proportions.'
    }),
    lifestyleItem({
        id: 177,
        name: 'Kids Tracksuit Bottoms',
        subcategory: 'Joggers',
        gender: 'Kids',
        price: 34.99,
        rating: 4.5,
        stock: 90,
        photoIndex: 0,
        description: 'Soft tricot pants for kids with three-stripe leg trim, elastic waist and ribbed cuffs. Easy on, easy off.'
    }),
    lifestyleItem({
        id: 178,
        name: 'Future Icons Performance Joggers',
        subcategory: 'Joggers',
        gender: 'Men',
        price: 74.99,
        rating: 4.6,
        stock: 24,
        photoIndex: 1,
        description: 'AEROREADY tapered joggers with mesh pocket bags, an extended drawcord waist and a low-profile reflective brand mark.'
    }),

    lifestyleItem({
        id: 179,
        name: 'Trefoil Classic Cap',
        subcategory: 'Caps',
        gender: 'Unisex',
        price: 24.99,
        rating: 4.5,
        stock: 200,
        photoIndex: 0,
        description: 'Six-panel cotton baseball cap with a curved brim, embroidered trefoil at the front and an adjustable strap-back.'
    }),
    lifestyleItem({
        id: 180,
        name: 'Adicolor Bucket Hat',
        subcategory: 'Caps',
        gender: 'Women',
        price: 29.99,
        rating: 4.4,
        stock: 70,
        photoIndex: 1,
        description: 'Lightweight cotton-twill bucket hat with a short brim, eyelet vents and tonal three-stripe embroidery on the side.'
    }),
    lifestyleItem({
        id: 181,
        name: 'Sportswear Snapback Cap',
        subcategory: 'Caps',
        gender: 'Men',
        price: 27.99,
        rating: 4.4,
        stock: 110,
        photoIndex: 0,
        description: 'Structured six-panel snapback with a flat brim, raised embroidered logo and adjustable plastic snap closure at the back.'
    }),
    lifestyleItem({
        id: 182,
        name: 'Trefoil Beanie',
        subcategory: 'Caps',
        gender: 'Unisex',
        price: 19.99,
        rating: 4.4,
        stock: 140,
        photoIndex: 1,
        description: 'Soft acrylic-blend ribbed beanie with a folded cuff and a woven trefoil patch on the front. Warm, simple, everyday cold-weather staple.'
    }),
    lifestyleItem({
        id: 183,
        name: 'Performance Running Cap',
        subcategory: 'Caps',
        gender: 'Men',
        price: 24.99,
        rating: 4.5,
        stock: 95,
        photoIndex: 0,
        description: 'Lightweight 5-panel running cap with AEROREADY moisture-wicking sweatband and reflective trim for low-light visibility.'
    }),
    lifestyleItem({
        id: 184,
        name: 'Kids Adventure Cap',
        subcategory: 'Caps',
        gender: 'Kids',
        price: 14.99,
        rating: 4.4,
        stock: 160,
        photoIndex: 1,
        description: 'Soft cotton kids cap with a curved brim, embroidered logo and an adjustable hook-and-loop back strap that grows with them.'
    }),

    lifestyleItem({
        id: 185,
        name: 'Originals Trefoil Backpack',
        subcategory: 'Bags',
        gender: 'Unisex',
        price: 44.99,
        rating: 4.6,
        stock: 80,
        photoIndex: 0,
        description: 'Classic 23L two-compartment backpack with a padded laptop sleeve, front zip pocket and embroidered trefoil. Daily commute essential.'
    }),
    lifestyleItem({
        id: 186,
        name: 'Sportswear Lifestyle Duffel',
        subcategory: 'Bags',
        gender: 'Unisex',
        price: 59.99,
        rating: 4.5,
        stock: 45,
        photoIndex: 1,
        description: 'Mid-size 35L duffel with a separate ventilated shoe compartment, padded shoulder strap and water-resistant 600D base panel.'
    }),
    lifestyleItem({
        id: 187,
        name: 'Mini Crossbody Trefoil Bag',
        subcategory: 'Bags',
        gender: 'Women',
        price: 34.99,
        rating: 4.4,
        stock: 70,
        photoIndex: 2,
        description: 'Compact crossbody with an adjustable webbing strap, front zip pocket and embroidered trefoil. Holds phone, keys and a small wallet.'
    }),
    lifestyleItem({
        id: 188,
        name: 'Adicolor Tote Bag',
        subcategory: 'Bags',
        gender: 'Women',
        price: 39.99,
        rating: 4.4,
        stock: 60,
        photoIndex: 0,
        description: 'Spacious shopper tote in heavy cotton-twill with reinforced double handles, an internal zip pocket and a printed trefoil logo.'
    }),
    lifestyleItem({
        id: 189,
        name: 'Performance Gym Sack',
        subcategory: 'Bags',
        gender: 'Unisex',
        price: 19.99,
        rating: 4.4,
        stock: 200,
        photoIndex: 1,
        description: 'Lightweight drawstring gym sack with a ripstop body, reinforced grommet corners and a small front zip pocket for valuables.'
    }),
    lifestyleItem({
        id: 190,
        name: 'Kids Trefoil Mini Backpack',
        subcategory: 'Bags',
        gender: 'Kids',
        price: 24.99,
        rating: 4.5,
        stock: 110,
        photoIndex: 2,
        description: 'Right-sized 11L kids backpack with padded straps, a single main compartment and a printed trefoil logo on the front panel.'
    })
];

/*
 * Additional lineup so every mega-menu destination has enough inventory:
 * - New arrivals / best sellers / sale-style merchandising
 * - sport pillars (Running, Football, Fitness, Outdoor, Basketball, Training)
 * - lifestyle buckets (Sneakers, Hoodies, T-Shirts, Joggers, Caps, Bags)
 */
export const bonusProducts = [{
        id: 191,
        name: 'New Arrival Running Velocity Knit',
        price: 139.99,
        category: 'Running',
        imageUrl: img('1571902943202-507ec2618e8f'),
        rating: 4.7,
        stock: 20,
        description: 'New-season lightweight road trainer with breathable knit upper and responsive cushioning.'
    },
    {
        id: 192,
        name: 'Best Seller Football Control Boot',
        price: 249.99,
        category: 'Football',
        imageUrl: img('1551958219-acbc608c6377'),
        brand: 'Adidas',
        rating: 4.9,
        stock: 13,
        sizes: [40, 41, 42, 43, 44],
        colors: ['Solar Red', 'Core Black', 'Cloud White'],
        description: 'Match-ready control boot with grippy strike zones and firm-ground traction.'
    },
    {
        id: 193,
        name: 'Fitness Sale Adjustable Kettlebell 16kg',
        price: 49.99,
        category: 'Fitness',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.6,
        stock: 37,
        description: 'Compact selectorized kettlebell built for swings, carries and conditioning circuits.'
    },
    {
        id: 194,
        name: 'Outdoor New Arrival Trek Shell Jacket',
        price: 129.99,
        category: 'Outdoor',
        imageUrl: img('1469474968028-56623f02e42e'),
        rating: 4.7,
        stock: 18,
        description: 'Waterproof breathable hiking shell with seam-sealed construction and adjustable hood.'
    },
    {
        id: 195,
        name: 'Basketball Best Seller Court Pro Shoe',
        price: 134.99,
        category: 'Basketball',
        imageUrl: img('1518611012118-696072aa579a'),
        rating: 4.8,
        stock: 16,
        description: 'High-traction mid-cut basketball shoe with responsive foam and heel lockdown.'
    },
    {
        id: 196,
        name: 'Training New Arrival Agility Bundle',
        price: 64.99,
        category: 'Training',
        imageUrl: img('1583454110551-21f2fa2afe61'),
        rating: 4.6,
        stock: 33,
        description: 'All-in-one speed bundle with ladder, mini hurdles and marker cones.'
    },
    {
        id: 197,
        name: 'Accessories Sale Performance Backpack',
        price: 34.99,
        category: 'Accessories',
        imageUrl: img('1505740420928-5e560c06d30e'),
        rating: 4.5,
        stock: 72,
        description: 'Water-resistant backpack with laptop sleeve and ventilated shoe compartment.'
    },
    lifestyleItem({
        id: 198,
        name: 'New Arrival Street Runner Sneaker',
        subcategory: 'Sneakers',
        gender: 'Men',
        price: 119.99,
        rating: 4.6,
        stock: 27,
        photoIndex: 3,
        description: 'Fresh drop lifestyle sneaker with mesh upper, suede overlays and cushioned heel pod.'
    }),
    lifestyleItem({
        id: 199,
        name: 'Best Seller Club Court Sneaker',
        subcategory: 'Sneakers',
        gender: 'Women',
        price: 94.99,
        rating: 4.7,
        stock: 34,
        photoIndex: 4,
        description: 'Best-selling low-profile court sneaker with soft leather upper and durable cupsole.'
    }),
    lifestyleItem({
        id: 200,
        name: 'Lifestyle Sale Everyday Sneaker',
        subcategory: 'Sneakers',
        gender: 'Unisex',
        price: 69.99,
        rating: 4.4,
        stock: 58,
        photoIndex: 0,
        description: 'Value-focused casual sneaker with padded collar and grippy rubber outsole.'
    }),
    lifestyleItem({
        id: 201,
        name: 'New Arrival Fleece Hoodie',
        subcategory: 'Hoodies',
        gender: 'Men',
        price: 72.99,
        rating: 4.6,
        stock: 41,
        photoIndex: 0,
        description: 'Heavy brushed-fleece hoodie with ribbed side panels and a tonal chest logo.'
    }),
    lifestyleItem({
        id: 202,
        name: 'Best Seller Essentials Sweatshirt',
        subcategory: 'Hoodies',
        gender: 'Women',
        price: 56.99,
        rating: 4.7,
        stock: 47,
        photoIndex: 1,
        description: 'Soft crew sweatshirt in a relaxed fit with embroidered heritage wordmark.'
    }),
    lifestyleItem({
        id: 203,
        name: 'Lifestyle Sale Zip Hoodie',
        subcategory: 'Hoodies',
        gender: 'Kids',
        price: 34.99,
        rating: 4.5,
        stock: 63,
        photoIndex: 2,
        description: 'Kids full-zip hoodie in cotton blend with kangaroo pockets and rib cuffs.'
    }),
    lifestyleItem({
        id: 204,
        name: 'New Arrival Graphic Tee',
        subcategory: 'T-Shirts',
        gender: 'Men',
        price: 31.99,
        rating: 4.5,
        stock: 89,
        photoIndex: 0,
        description: 'Fresh-season cotton graphic tee with modern oversized fit and printed chest art.'
    }),
    lifestyleItem({
        id: 205,
        name: 'Best Seller Cropped Tee',
        subcategory: 'T-Shirts',
        gender: 'Women',
        price: 29.99,
        rating: 4.6,
        stock: 77,
        photoIndex: 1,
        description: 'Best-selling cropped cotton tee with soft rib neck and clean embroidered logo.'
    }),
    lifestyleItem({
        id: 206,
        name: 'Lifestyle Sale Kids Logo Tee',
        subcategory: 'T-Shirts',
        gender: 'Kids',
        price: 16.99,
        rating: 4.4,
        stock: 120,
        photoIndex: 2,
        description: 'Lightweight kids cotton tee with soft-touch logo print and regular fit.'
    }),
    lifestyleItem({
        id: 207,
        name: 'New Arrival Tapered Joggers',
        subcategory: 'Joggers',
        gender: 'Men',
        price: 67.99,
        rating: 4.6,
        stock: 44,
        photoIndex: 0,
        description: 'New tapered jogger silhouette with zip pockets and brushed comfort interior.'
    }),
    lifestyleItem({
        id: 208,
        name: 'Best Seller Wide-Leg Pants',
        subcategory: 'Joggers',
        gender: 'Women',
        price: 64.99,
        rating: 4.6,
        stock: 40,
        photoIndex: 1,
        description: 'Best-selling wide-leg track pants in smooth tricot with signature side stripes.'
    }),
    lifestyleItem({
        id: 209,
        name: 'Lifestyle Sale Kids Joggers',
        subcategory: 'Joggers',
        gender: 'Kids',
        price: 27.99,
        rating: 4.5,
        stock: 96,
        photoIndex: 2,
        description: 'Everyday kids joggers with cuffed hems, elastic waist and soft fleece lining.'
    }),
    lifestyleItem({
        id: 210,
        name: 'New Arrival Performance Cap',
        subcategory: 'Caps',
        gender: 'Unisex',
        price: 26.99,
        rating: 4.5,
        stock: 84,
        photoIndex: 0,
        description: 'Breathable six-panel cap with quick-dry sweatband and curved visor.'
    }),
    lifestyleItem({
        id: 211,
        name: 'Best Seller Lifestyle Bucket Hat',
        subcategory: 'Caps',
        gender: 'Women',
        price: 27.99,
        rating: 4.5,
        stock: 71,
        photoIndex: 1,
        description: 'Top-selling cotton bucket hat with tonal embroidery and soft crown shaping.'
    }),
    lifestyleItem({
        id: 212,
        name: 'Lifestyle Sale Kids Cap',
        subcategory: 'Caps',
        gender: 'Kids',
        price: 12.99,
        rating: 4.4,
        stock: 132,
        photoIndex: 0,
        description: 'Adjustable kids cap with lightweight cotton twill and pre-curved brim.'
    }),
    lifestyleItem({
        id: 213,
        name: 'New Arrival City Backpack',
        subcategory: 'Bags',
        gender: 'Unisex',
        price: 49.99,
        rating: 4.6,
        stock: 56,
        photoIndex: 0,
        description: 'Urban commuter backpack with padded sleeve, bottle pockets and hidden valuables zip.'
    }),
    lifestyleItem({
        id: 214,
        name: 'Best Seller Gym Duffel',
        subcategory: 'Bags',
        gender: 'Unisex',
        price: 62.99,
        rating: 4.6,
        stock: 39,
        photoIndex: 1,
        description: 'Best-selling medium duffel with separate shoe garage and reinforced base.'
    }),
    lifestyleItem({
        id: 215,
        name: 'Lifestyle Sale Mini Crossbody',
        subcategory: 'Bags',
        gender: 'Women',
        price: 24.99,
        rating: 4.4,
        stock: 82,
        photoIndex: 2,
        description: 'Compact festival-ready crossbody bag with adjustable strap and zip front pocket.'
    }),
    {
        id: 216,
        name: 'New Arrival Football Match Ball',
        price: 59.99,
        category: 'Football',
        imageUrl: img('1574629810360-7efbbe195018'),
        rating: 4.7,
        stock: 46,
        description: 'Thermo-bonded match ball with textured casing for stable flight.'
    },
    {
        id: 217,
        name: 'Best Seller Outdoor Daypack 30L',
        price: 94.99,
        category: 'Outdoor',
        imageUrl: img('1500530855697-b586d89ba3ee'),
        rating: 4.7,
        stock: 29,
        description: 'Versatile daypack with ventilated back panel and trekking-pole loops.'
    },
    {
        id: 218,
        name: 'Sale Training Resistance Pack',
        price: 39.99,
        category: 'Training',
        imageUrl: img('1517836357463-d25dfeac3438'),
        rating: 4.5,
        stock: 64,
        description: 'Portable training set with loop bands, tube bands, handles and anchor.'
    },
    {
        id: 219,
        name: 'Best Seller Fitness Smart Scale',
        price: 69.99,
        category: 'Fitness',
        imageUrl: img('1571019613454-1cb2f99b2d8b'),
        rating: 4.6,
        stock: 36,
        description: 'Connected smart scale tracking body metrics and syncing to your fitness app.'
    },
    {
        id: 220,
        name: 'Sale Basketball Practice Ball',
        price: 21.99,
        category: 'Basketball',
        imageUrl: img('1508804185872-d7badad00f7d'),
        rating: 4.4,
        stock: 98,
        description: 'Durable all-surface practice ball with deep channels and tacky grip.'
    }
];

/* ---------------------------------------------------------------------- */
/* Combined export — used by mockCatalog.js as the single source of truth */
/* ---------------------------------------------------------------------- */

export const products = [
    ...runningProducts,
    ...footballProducts,
    ...fitnessProducts,
    ...outdoorProducts,
    ...basketballProducts,
    ...trainingProducts,
    ...accessoriesProducts,
    ...lifestyleProducts,
    ...bonusProducts
];