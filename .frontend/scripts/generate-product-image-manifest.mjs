/**
 * Scans public/images/products and builds product-image-manifest.json
 * with apiId/mockId pairs aligned to InMemoryCatalogRepository + products.js.
 * Run from repo root: node .frontend/scripts/generate-product-image-manifest.mjs
 */
import fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
const PUBLIC_PRODUCTS = path.resolve(__dirname, '../public/images/products');
const OUT_FRONTEND = path.resolve(__dirname, '../src/data/product-image-manifest.json');
const OUT_BACKEND = path.resolve(
    __dirname,
    '../../.backend/src/main/resources/product-image-manifest.json'
);

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

function toWebPath(absFile) {
    const norm = absFile.replace(/\\/g, '/');
    const idx = norm.indexOf('/public/');
    if (idx === -1) return null;
    const rel = norm.slice(idx + '/public'.length);
    return encodeURI(rel);
}

function collectByKeyword() {
    const pools = {
        running: [],
        football: [],
        fitness: [],
        basketball: []
    };

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        for (const ent of fs.readdirSync(dir, {
                withFileTypes: true
            })) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                walk(full);
                continue;
            }
            const ext = path.extname(ent.name).toLowerCase();
            if (!IMAGE_EXT.has(ext)) continue;
            const web = toWebPath(full);
            if (!web) continue;
            const low = full.toLowerCase();
            if (low.includes(`${path.sep}running${path.sep}`) || low.includes('/running/'))
                pools.running.push(web);
            if (low.includes(`${path.sep}football${path.sep}`) || low.includes('/football/'))
                pools.football.push(web);
            if (low.includes(`${path.sep}fitness${path.sep}`) || low.includes('/fitness/'))
                pools.fitness.push(web);
            if (low.includes(`${path.sep}basketball${path.sep}`) || low.includes('/basketball/'))
                pools.basketball.push(web);
        }
    }

    walk(PUBLIC_PRODUCTS);
    for (const k of Object.keys(pools)) {
        pools[k] = [...new Set(pools[k])].sort();
    }
    const mix = [...new Set([...pools.fitness, ...pools.running, ...pools.basketball])].sort();
    return {
        running: pools.running,
        football: pools.football,
        fitness: pools.fitness,
        basketball: pools.basketball,
        outdoor: mix.length ? mix : pools.running,
        training: pools.fitness.length ? pools.fitness : mix,
        accessories: pools.fitness.length ? pools.fitness : mix,
        lifestyle: [...new Set([...pools.running, ...pools.basketball, ...pools.fitness])].sort()
    };
}

function galleryForPool(pool, index, count = 4) {
    if (!pool.length) {
        return ['/images/placeholder-product.svg'];
    }
    const out = [];
    for (let k = 0; k < count; k++) {
        out.push(pool[(index + k) % pool.length]);
    }
    return out;
}

function buildEntries(pools) {
    const entries = [];
    const addBlock = (categoryId, mockStart, poolKey, count = 20) => {
        const pool = pools[poolKey];
        for (let i = 0; i < count; i++) {
            const apiId = categoryId * 100 + i + 1;
            const mockId = mockStart + i;
            const images = galleryForPool(pool, i, 4);
            entries.push({
                apiId,
                mockId,
                images
            });
        }
    };

    addBlock(1, 1, 'running', 20);
    addBlock(2, 21, 'football', 20);
    addBlock(3, 41, 'fitness', 20);
    addBlock(4, 61, 'outdoor', 20);
    addBlock(5, 81, 'basketball', 20);
    addBlock(6, 101, 'training', 20);
    addBlock(7, 121, 'accessories', 20);

    const lifePool = pools.lifestyle;
    for (let i = 0; i < 50; i++) {
        const apiId = 801 + i;
        const mockId = 141 + i;
        entries.push({
            apiId,
            mockId,
            images: galleryForPool(lifePool, i, 4)
        });
    }

    // Mock-only lifestyle SKUs 191–215 (no matching apiId in backend seed)
    for (let i = 50; i < 75; i++) {
        const mockId = 141 + i;
        entries.push({
            mockId,
            images: galleryForPool(lifePool, i, 4)
        });
    }

    // bonusProducts 216–220 — map to mixed pool by category name in manifest via extra entries
    const bonus = [{
            mockId: 216,
            pool: 'football'
        },
        {
            mockId: 217,
            pool: 'outdoor'
        },
        {
            mockId: 218,
            pool: 'training'
        },
        {
            mockId: 219,
            pool: 'fitness'
        },
        {
            mockId: 220,
            pool: 'basketball'
        }
    ];
    for (const b of bonus) {
        const pool = pools[b.pool];
        entries.push({
            mockId: b.mockId,
            images: galleryForPool(pool, b.mockId, 4)
        });
    }

    return entries;
}

function buildCategoryHeroes(pools) {
    const pick = (pool, n) => {
        const p = pools[pool];
        if (!p ? .length) return '/images/placeholder-product.svg';
        return p[Math.min(n, p.length - 1)];
    };
    return {
        running: [pick('running', 0), pick('running', 1), pick('running', 2), pick('running', 3), pick('running', 4), pick('running', 5)],
        football: [pick('football', 0), pick('football', 1), pick('football', 2), pick('football', 3), pick('football', 4), pick('football', 5)],
        fitness: [pick('fitness', 0), pick('fitness', 1), pick('fitness', 2), pick('fitness', 3), pick('fitness', 4), pick('fitness', 5)],
        outdoor: [pick('outdoor', 0), pick('outdoor', 1), pick('outdoor', 2), pick('outdoor', 3), pick('outdoor', 4), pick('outdoor', 5)],
        basketball: [pick('basketball', 0), pick('basketball', 1), pick('basketball', 2), pick('basketball', 3), pick('basketball', 4), pick('basketball', 5)],
        training: [pick('training', 0), pick('training', 1), pick('training', 2), pick('training', 3), pick('training', 4), pick('training', 5)],
        accessories: [pick('accessories', 0), pick('accessories', 1), pick('accessories', 2), pick('accessories', 3), pick('accessories', 4), pick('accessories', 5)],
        lifestyle: [pick('lifestyle', 0), pick('lifestyle', 1), pick('lifestyle', 2), pick('lifestyle', 3), pick('lifestyle', 4), pick('lifestyle', 5)],
        gym: [pick('fitness', 2), pick('fitness', 3), pick('fitness', 4)],
        shoes: [pick('running', 1), pick('running', 2), pick('running', 3)],
        balls: [pick('football', 1), pick('football', 2), pick('basketball', 1)]
    };
}

const pools = collectByKeyword();
const manifest = {
    version: 1,
    categoryHeroes: buildCategoryHeroes(pools),
    products: buildEntries(pools)
};

fs.mkdirSync(path.dirname(OUT_FRONTEND), {
    recursive: true
});
fs.writeFileSync(OUT_FRONTEND, JSON.stringify(manifest, null, 2), 'utf8');
fs.mkdirSync(path.dirname(OUT_BACKEND), {
    recursive: true
});
fs.writeFileSync(OUT_BACKEND, JSON.stringify(manifest, null, 2), 'utf8');

console.log('Wrote', OUT_FRONTEND);
console.log('Wrote', OUT_BACKEND);
console.log('Pool sizes:', Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.length])));