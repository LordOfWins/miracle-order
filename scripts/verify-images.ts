// scripts/verify-images.ts
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import sharp from "sharp";
import { products } from "../prisma/seed-data";

const ROOT = resolve(__dirname, "..");

function loadImageMap(): Map<string, string> {
  const mapPath = join(__dirname, "product-image-map.json");
  if (existsSync(mapPath)) {
    const map: Record<string, string> = JSON.parse(readFileSync(mapPath, "utf-8"));
    return new Map(Object.entries(map));
  }
  return new Map();
}

async function main(): Promise<void> {
  console.log("🔍 제품 이미지 검증 시작\n");

  const imageMap = loadImageMap();
  const missing: string[] = [];
  const wrongSize: string[] = [];
  const noMapping: string[] = [];
  let okCount = 0;

  for (const prod of products) {
    const imageUrl = (prod as any).imageUrl ?? imageMap.get(prod.name) ?? null;

    if (!imageUrl) {
      noMapping.push(prod.name);
      continue;
    }

    const filePath = join(ROOT, "public", imageUrl);

    if (!existsSync(filePath)) {
      missing.push(prod.name);
      continue;
    }

    try {
      const meta = await sharp(filePath).metadata();
      if (meta.width === 800 && meta.height === 800) {
        okCount++;
      } else {
        wrongSize.push(`${prod.name} (${meta.width}x${meta.height})`);
      }
    } catch {
      wrongSize.push(`${prod.name} (읽기 실패)`);
    }
  }

  console.log("=".repeat(70));
  console.log(`총 제품: ${products.length}`);
  console.log(`매핑 있음: ${products.length - noMapping.length}`);
  console.log(`매핑 없음: ${noMapping.length}`);
  console.log(`파일 존재+정상: ${okCount}`);
  console.log(`파일 누락: ${missing.length}`);
  console.log(`크기 불일치: ${wrongSize.length}`);
  console.log("=".repeat(70));

  if (noMapping.length > 0) {
    console.log("\n⚠️ imageUrl 매핑 없음:");
    noMapping.forEach((n) => console.log(`  - ${n}`));
  }
  if (missing.length > 0) {
    console.log("\n❌ 파일 누락:");
    missing.forEach((n) => console.log(`  - ${n}`));
  }
  if (wrongSize.length > 0) {
    console.log("\n⚠️ 크기 불일치:");
    wrongSize.forEach((n) => console.log(`  - ${n}`));
  }

  if (missing.length > 0 || wrongSize.length > 0) {
    console.log("\n🔴 검증 실패");
    process.exit(1);
  } else if (noMapping.length > 0) {
    console.log("\n🟡 매핑 미완료 제품 있음");
  } else {
    console.log("\n🟢 전체 통과!");
  }
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
