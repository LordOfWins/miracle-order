import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PORT = 4444;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_DIR = path.join(ROOT, "public/catalog");
const OUTPUT_DIR = path.join(ROOT, "public/uploads/products");
const MAP_FILE = path.join(ROOT, "product-image-map.json");
const HTML_FILE = path.join(__dirname, "public/index.html");


// 카탈로그 파일 -> 카테고리 매핑 (파일명에서 카테고리 추출)
const CATALOG_CATEGORY_MAP: Record<string, string[]> = {
  "전동침대1.webp": ["전동침대"],
  "전동침대2.webp": ["전동침대"],
  "수동휠체어.webp": ["수동휠체어"],
  "수동휠체어1.webp": ["수동휠체어"],
  "욕창방지매트리스.webp": ["욕창예방매트리스"],
  "이동욕조.webp": ["이동욕조"],
  "목욕의자.webp": ["목욕의자"],
  "이동변기.webp": ["이동변기"],
  "성인용보행기1.webp": ["성인용보행기"],
  "성인용보행기2.webp": ["성인용보행기"],
  "욕창예방방석.webp": ["욕창예방방석"],
  "자세변환용구.webp": ["자세변환용구"],
  "미끄럼방지용품(양말)1.webp": ["미끄럼방지양말"],
  "미끄럼방지용품(양말)2.webp": ["미끄럼방지양말"],
  "미끄럼방지용품(매트)1.webp": ["미끄럼방지용품"],
  "미끄럼방지용품(매트)2.webp": ["미끄럼방지용품"],
  "안전손잡이1.webp": ["안전손잡이"],
  "안전손잡이2.webp": ["안전손잡이"],
  "경사로.webp": ["경사로"],
  "요실금팬티.webp": ["요실금팬티"],
  "지팡이.webp": ["지팡이"],
  "간이변기.webp": ["간이변기"],
};

// 카탈로그 정렬 순서 (seed-data 카테고리 순서와 일치)
const CATALOG_ORDER = [
  "전동침대1.webp",
  "전동침대2.webp",
  "수동휠체어.webp",
  "수동휠체어1.webp",
  "욕창방지매트리스.webp",
  "이동욕조.webp",
  "목욕의자.webp",
  "이동변기.webp",
  "성인용보행기1.webp",
  "성인용보행기2.webp",
  "욕창예방방석.webp",
  "자세변환용구.webp",
  "미끄럼방지용품(양말)1.webp",
  "미끄럼방지용품(양말)2.webp",
  "미끄럼방지용품(매트)1.webp",
  "미끄럼방지용품(매트)2.webp",
  "안전손잡이1.webp",
  "안전손잡이2.webp",
  "경사로.webp",
  "요실금팬티.webp",
  "지팡이.webp",
  "간이변기.webp",
];

async function loadProducts() {
  const seedPath = path.join(ROOT, "prisma/seed-data.ts");
  const content = fs.readFileSync(seedPath, "utf-8");

  const products: { name: string; category: string; hasImage: boolean }[] = [];
  const regex =
    /\{\s*category:\s*"([^"]+)",\s*name:\s*"([^"]+)"(?:,\s*imageUrl:\s*"([^"]*)")?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    products.push({
      category: match[1],
      name: match[2],
      hasImage: !!match[3],
    });
  }
  return products;
}

function loadMap(): Record<string, string> {
  if (fs.existsSync(MAP_FILE)) {
    return JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));
  }
  return {};
}

function saveMap(map: Record<string, string>) {
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf-8");
}

function safeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9가-힣]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getCatalogFiles(): string[] {
  if (!fs.existsSync(CATALOG_DIR)) return [];
  const existing = fs
    .readdirSync(CATALOG_DIR)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

  // CATALOG_ORDER 순서대로 정렬 / 없는 파일은 뒤에 붙임
  const ordered: string[] = [];
  for (const f of CATALOG_ORDER) {
    if (existing.includes(f)) ordered.push(f);
  }
  for (const f of existing) {
    if (!ordered.includes(f)) ordered.push(f);
  }
  return ordered;
}

function getMime(ext: string): string {
  const map: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return map[ext] || "application/octet-stream";
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: 제품 목록
  if (url.pathname === "/api/products" && req.method === "GET") {
    const products = await loadProducts();
    const map = loadMap();
    const data = products.map((p) => ({
      ...p,
      mapped: !!map[p.name],
      mappedUrl: map[p.name] || null,
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
    return;
  }

  // API: 카탈로그 파일 목록 (카테고리 매핑 포함)
  if (url.pathname === "/api/catalog" && req.method === "GET") {
    const files = getCatalogFiles();
    const data = files.map((f) => ({
      filename: f,
      categories: CATALOG_CATEGORY_MAP[f] || [],
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
    return;
  }

  // API: 크롭 저장
  if (url.pathname === "/api/crop" && req.method === "POST") {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const {
          productName,
          catalogFile,
          x,
          y,
          width,
          height,
        }: {
          productName: string;
          catalogFile: string;
          x: number;
          y: number;
          width: number;
          height: number;
        } = body;

        if (!productName || !catalogFile || !width || !height) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required fields" }));
          return;
        }

        const catalogPath = path.join(CATALOG_DIR, catalogFile);
        if (!fs.existsSync(catalogPath)) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Catalog file not found" }));
          return;
        }

        const metadata = await sharp(catalogPath).metadata();
        const imgW = metadata.width || 0;
        const imgH = metadata.height || 0;

        const cropX = Math.max(0, Math.round(x));
        const cropY = Math.max(0, Math.round(y));
        const cropW = Math.min(Math.round(width), imgW - cropX);
        const cropH = Math.min(Math.round(height), imgH - cropY);

        if (cropW <= 0 || cropH <= 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid crop dimensions" }));
          return;
        }

        const safeName = safeFilename(productName);
        const filename = `${safeName}.webp`;
        const outputPath = path.join(OUTPUT_DIR, filename);
        const publicUrl = `/uploads/products/${filename}`;

        await sharp(catalogPath)
          .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
          .resize(800, 800, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .webp({ quality: 85 })
          .toFile(outputPath);

        const map = loadMap();
        map[productName] = publicUrl;
        saveMap(map);

        console.log(`[CROP] ${productName} -> ${filename}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            filename,
            publicUrl,
            crop: { x: cropX, y: cropY, w: cropW, h: cropH },
          })
        );
      } catch (err: any) {
        console.error("[CROP ERROR]", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: 매핑 삭제
  if (url.pathname === "/api/unmap" && req.method === "POST") {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const { productName } = JSON.parse(Buffer.concat(chunks).toString());
      const map = loadMap();
      if (map[productName]) {
        const filePath = path.join(ROOT, "public", map[productName]);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        delete map[productName];
        saveMap(map);
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // 카탈로그 이미지 서빙 (URL 디코딩 처리)
  if (url.pathname.startsWith("/catalog/")) {
    const decoded = decodeURIComponent(url.pathname.replace("/catalog/", ""));
    const filePath = path.join(CATALOG_DIR, decoded);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": getMime(ext) });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end("Catalog file not found");
    return;
  }

  // 결과 이미지 서빙
  if (url.pathname.startsWith("/uploads/")) {
    const decoded = decodeURIComponent(url.pathname);
    const filePath = path.join(ROOT, "public", decoded);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { "Content-Type": "image/webp" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // HTML UI
  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(HTML_FILE).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`\n🔧 Crop UI: http://localhost:${PORT}\n`);
  console.log(`   Catalog : ${CATALOG_DIR} (${getCatalogFiles().length} files)`);
  console.log(`   Output  : ${OUTPUT_DIR}`);
  console.log(`   Map     : ${MAP_FILE}\n`);
});
