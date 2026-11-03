import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.game.count();
  if (count > 0) return;

  await prisma.game.createMany({
    data: [
      { title: "Starfall Tactics", genre: "Strategy" },
      { title: "Pixel Dungeon Run", genre: "Roguelike" },
      { title: "Cloud Drift", genre: "Puzzle" },
    ],
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
