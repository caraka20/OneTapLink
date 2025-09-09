import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("raka20", 10);

  await prisma.user.upsert({
    where: { username: "raka20" },
    update: {},
    create: {
      username: "raka20",
      password,
    },
  });

  console.log("✅ Seed user berhasil: raka20 / raka20");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
