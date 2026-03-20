// scripts/crop-products.ts
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import sharp from "sharp";

// ── 타입 ──
interface ProductEntry {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PageConfig {
  file: string;
  comment?: string;
  products: ProductEntry[];
}

interface CropConfig {
  _README?: string;
  _USAGE?: string;
  pctMode?: boolean;
  pages: PageConfig[];
}

// ── 경로 ──
const ROOT = resolve(__dirname, "..");
const CATALOG_DIR = join(ROOT, "public", "catalog");
const OUTPUT_DIR = join(ROOT, "public", "uploads", "products");
const CONFIG_PATH = join(__dirname, "crop-config.json");

// ── 슬러그 변환 ──
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()（）]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ── 메인 ──
let globalOrder = 0;
const productFileMap = new Map<string, string>();

async function cropAndSave(
  buf: Buffer,
  region: { left: number; top: number; width: number; height: number },
  name: string
): Promise<boolean> {
  try {
    const left = Math.max(0, Math.round(region.left));
    const top = Math.max(0, Math.round(region.top));
    const width = Math.max(1, Math.round(region.width));
    const height = Math.max(1, Math.round(region.height));

    const slug = slugify(name);
    const filename = `${String(globalOrder).padStart(3, "0")}_${slug}.webp`;
    const outPath = join(OUTPUT_DIR, filename);

    await sharp(buf)
      .extract({ left, top, width, height })
      .resize(800, 800, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 85 })
      .toFile(outPath);

    productFileMap.set(name, filename);
    globalOrder++;
    console.log(`  ✅ ${name} -> ${filename}`);
    return true;
  } catch (err) {
    console.warn(`  ⚠️ 크롭 실패: ${name} - ${(err as Error).message}`);
    return false;
  }
}

async function processPage(page: PageConfig, pctMode: boolean): Promise<void> {
  const filePath = join(CATALOG_DIR, page.file);

  if (!existsSync(filePath)) {
    console.warn(`⚠️ 파일 없음: ${page.file} — 건너뜀`);
    return;
  }
  if (page.products.length === 0) {
    console.log(`⏭️ ${page.file} — products 비어있음`);
    return;
  }

  console.log(`\n📄 ${page.file} (${page.comment || ""})`);

  const buf = readFileSync(filePath);
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) {
    console.warn(`⚠️ 메타데이터 실패: ${page.file}`);
    return;
  }

  const imgW = meta.width;
  const imgH = meta.height;

  for (const prod of page.products) {
    let left: number, top: number, width: number, height: number;

    if (pctMode) {
      // 퍼센트 -> 픽셀 변환
      left = (prod.x / 100) * imgW;
      top = (prod.y / 100) * imgH;
      width = (prod.w / 100) * imgW;
      height = (prod.h / 100) * imgH;
    } else {
      left = prod.x;
      top = prod.y;
      width = prod.w;
      height = prod.h;
    }

    // 범위 클램핑
    if (left + width > imgW) width = imgW - left;
    if (top + height > imgH) height = imgH - top;
    if (width <= 0 || height <= 0) {
      console.warn(`  ⚠️ 잘못된 영역: ${prod.name}`);
      continue;
    }

    await cropAndSave(buf, { left, top, width, height }, prod.name);
  }
}

async function main(): Promise<void> {
  console.log("🔧 카탈로그 제품 이미지 크롭 시작\n");

  mkdirSync(OUTPUT_DIR, { recursive: true });

  if (!existsSync(CONFIG_PATH)) {
    console.error(`❌ ${CONFIG_PATH} 없음`);
    process.exit(1);
  }
  if (!existsSync(CATALOG_DIR)) {
    console.error(`❌ ${CATALOG_DIR} 없음`);
    process.exit(1);
  }

  const config: CropConfig = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  const pctMode = config.pctMode === true;

  const files = readdirSync(CATALOG_DIR).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`📁 카탈로그: ${files.length}개 이미지`);
  console.log(`📐 모드: ${pctMode ? "퍼센트(%) 좌표" : "픽셀(px) 좌표"}\n`);

  let total = 0;
  for (const page of config.pages) {
    total += page.products.length;
    await processPage(page, pctMode);
  }

  const success = productFileMap.size;

  console.log("\n" + "=".repeat(60));
  console.log(`총 대상: ${total} / 성공: ${success} / 실패: ${total - success}`);

  // 매핑 JSON 저장
  const mapObj: Record<string, string> = {};
  for (const [name, file] of productFileMap) {
    mapObj[name] = `/uploads/products/${file}`;
  }
  const mapPath = join(__dirname, "product-image-map.json");
  writeFileSync(mapPath, JSON.stringify(mapObj, null, 2), "utf-8");
  console.log(`\n💾 매핑 저장: ${mapPath}`);
  console.log("✅ 완료!");
}

main().catch((err) => {
  console.error("❌ 치명적 오류:", err);
  process.exit(1);
});
