// scripts/patch-seed-imageurl.ts
import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(__dirname, "..");
const SEED_DATA_PATH = join(ROOT, "prisma", "seed-data.ts");
const IMAGE_MAP_PATH = join(__dirname, "product-image-map.json");

function main(): void {
  const imageMap: Record<string, string> = JSON.parse(
    readFileSync(IMAGE_MAP_PATH, "utf-8")
  );

  let content = readFileSync(SEED_DATA_PATH, "utf-8");
  let patchCount = 0;

  for (const [productName, imageUrl] of Object.entries(imageMap)) {
    const escapedName = productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const alreadyHasImage = new RegExp(
      `name:\\s*"${escapedName}"[\\s\\S]*?imageUrl:\\s*"`,
      "m"
    );

    if (alreadyHasImage.test(content)) {
      const updateRegex = new RegExp(
        `(name:\\s*"${escapedName}"[\\s\\S]*?imageUrl:\\s*)"[^"]*"`,
        "m"
      );
      content = content.replace(updateRegex, `$1"${imageUrl}"`);
      patchCount++;
    } else {
      const insertRegex = new RegExp(
        `(name:\\s*"${escapedName}",)`,
        "m"
      );
      if (insertRegex.test(content)) {
        content = content.replace(
          insertRegex,
          `$1\n    imageUrl: "${imageUrl}",`
        );
        patchCount++;
      }
    }
  }

  writeFileSync(SEED_DATA_PATH, content, "utf-8");
  console.log(`✅ seed-data.ts 패치: ${patchCount}개 제품 imageUrl 추가/업데이트`);
}

main();
