import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [email, password, name = "Administrateur"] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage : npx tsx prisma/create-admin.ts email@exemple.com MotDePasse "Nom affiché"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("❌ Le mot de passe doit faire au moins 8 caractères.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email: email.toLowerCase(), passwordHash, name, role: "ADMIN" },
  });

  console.log(`✅ Compte administrateur prêt : ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());