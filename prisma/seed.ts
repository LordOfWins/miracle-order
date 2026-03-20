// prisma/seed.ts
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import "dotenv/config";
import { categories, products } from "./seed-data";

function createAdapter() {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      return new PrismaMariaDb({
        host: parsed.hostname,
        port: parseInt(parsed.port || "3306", 10),
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace("/", ""),
        connectionLimit: 5,
      });
    } catch {
      // fall through
    }
  }

  return new PrismaMariaDb({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "miracle",
    password: process.env.DB_PASSWORD || "miracle1234",
    database: process.env.DB_NAME || "miracle_order",
    connectionLimit: 5,
  });
}

const prisma = new PrismaClient({ adapter: createAdapter() });

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const admin = await prisma.admin.upsert({
    where: { loginId: "miracle" },
    update: {},
    create: {
      loginId: "miracle",
      password: hashPassword("miracle1234!"),
      name: "미라클복지용구",
      phone: "01000000000",
    },
  });

  await prisma.adminSetting.upsert({
    where: { adminId: admin.id },
    update: {},
    create: {
      adminId: admin.id,
      receivePhone: "01000000000",
    },
  });

  // await prisma.product.deleteMany({ where: { adminId: admin.id } });
  // await prisma.category.deleteMany({ where: { adminId: admin.id } });

  const categoryMap = new Map<string, number>();

  for (const cat of categories) {
    const created = await prisma.category.create({
      data: {
        adminId: admin.id,
        name: cat.name,
        sortOrder: cat.sortOrder,
      },
    });
    categoryMap.set(cat.name, created.id);
  }

  let insertCount = 0;
  const productsByCategory = new Map<string, number>();

  for (const prod of products) {
    const categoryId = categoryMap.get(prod.category);
    if (!categoryId) {
      console.warn(`카테고리 없음: ${prod.category} -> 제품 "${prod.name}" 건너뜀`);
      continue;
    }

    const currentOrder = productsByCategory.get(prod.category) ?? 0;
    productsByCategory.set(prod.category, currentOrder + 1);

    await prisma.product.create({
      data: {
        categoryId,
        adminId: admin.id,
        name: prod.name,
        price: prod.price,
        imageUrl: (prod as any).imageUrl ?? null,
        description: prod.description ?? null,
        note: prod.note ?? null,
        sortOrder: currentOrder,
      },
    });
    insertCount++;
  }

  console.log(
    `Seed 완료: 관리자 1명 + 카테고리 ${categories.length}개 + 제품 ${insertCount}개`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
