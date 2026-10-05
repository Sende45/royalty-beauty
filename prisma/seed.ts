import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ⚠️ Données d'exemple : à remplacer par les vraies prestations et prix du salon
const serviceData = [
  {
    category: "Tresses & Nattes",
    services: [
      { name: "Box braids", description: "Tresses classiques avec mèches, longueur au choix.", price: 15000, priceFrom: true, durationMin: 240, depositAmount: 5000 },
      { name: "Knotless braids", description: "Tresses sans nœud, plus légères et naturelles.", price: 20000, priceFrom: true, durationMin: 300, depositAmount: 5000 },
      { name: "Cornrows", description: "Nattes collées, motifs simples ou élaborés.", price: 8000, priceFrom: true, durationMin: 120, depositAmount: 2000 },
      { name: "Vanilles", description: "Twists deux brins, sur cheveux naturels ou avec mèches.", price: 12000, priceFrom: true, durationMin: 180, depositAmount: 3000 },
    ],
  },
  {
    category: "Coupe & Brushing",
    services: [
      { name: "Coupe femme", description: "Coupe personnalisée et coiffage.", price: 5000, priceFrom: false, durationMin: 45, depositAmount: 0 },
      { name: "Brushing", description: "Lissage et mise en forme au sèche-cheveux.", price: 5000, priceFrom: false, durationMin: 60, depositAmount: 0 },
      { name: "Coupe enfant", description: "Pour les moins de 12 ans.", price: 3000, priceFrom: false, durationMin: 30, depositAmount: 0 },
    ],
  },
  {
    category: "Soins capillaires",
    services: [
      { name: "Bain d'huile", description: "Soin nourrissant en profondeur.", price: 7000, priceFrom: false, durationMin: 60, depositAmount: 0 },
      { name: "Défrisage", description: "Défrisage avec protection du cuir chevelu.", price: 10000, priceFrom: true, durationMin: 90, depositAmount: 2000 },
      { name: "Soin hydratant vapeur", description: "Hydratation intense pour cheveux secs et cassants.", price: 10000, priceFrom: false, durationMin: 75, depositAmount: 2000 },
    ],
  },
  {
    category: "Perruques & Tissages",
    services: [
      { name: "Pose de perruque lace", description: "Pose, collage et coiffage de votre perruque.", price: 15000, priceFrom: true, durationMin: 90, depositAmount: 5000 },
      { name: "Tissage", description: "Pose de tissage fermé ou avec closure.", price: 15000, priceFrom: true, durationMin: 180, depositAmount: 5000 },
      { name: "Customisation de perruque", description: "Décoloration des nœuds, coupe et coiffage.", price: 10000, priceFrom: true, durationMin: 120, depositAmount: 3000 },
    ],
  },
];

const productData = [
  {
    category: "Soins",
    products: [
      { name: "Huile nourrissante", description: "Mélange d'huiles naturelles pour cheveux secs et pointes fragiles.", price: 8500, stock: 20, isFeatured: true },
      { name: "Shampoing doux", description: "Nettoie sans dessécher, idéal pour un usage fréquent.", price: 6000, stock: 15 },
      { name: "Masque hydratant", description: "Soin profond à poser 20 minutes une fois par semaine.", price: 9000, compareAtPrice: 11000, stock: 10, isFeatured: true },
    ],
  },
  {
    category: "Perruques",
    products: [
      { name: "Perruque lace frontale", description: "Cheveux naturels, lace transparente, 20 pouces.", price: 65000, stock: 5, isFeatured: true },
      { name: "Perruque bob", description: "Coupe carrée élégante, prête à porter.", price: 45000, stock: 0 },
    ],
  },
  {
    category: "Accessoires",
    products: [
      { name: "Bonnet en satin", description: "Protège vos cheveux et coiffures pendant la nuit.", price: 3500, stock: 30 },
      { name: "Brosse démêlante", description: "Démêle sans arracher, cheveux secs ou mouillés.", price: 4000, stock: 25 },
    ],
  },
];

async function main() {
  // Prestations
  for (const [i, cat] of serviceData.entries()) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: slugify(cat.category) },
      update: { name: cat.category, position: i },
      create: { name: cat.category, slug: slugify(cat.category), position: i },
    });

    for (const s of cat.services) {
      await prisma.service.upsert({
        where: { slug: slugify(s.name) },
        update: { ...s, categoryId: category.id },
        create: { ...s, slug: slugify(s.name), categoryId: category.id },
      });
    }
  }

  // Boutique
  for (const [i, cat] of productData.entries()) {
    const category = await prisma.productCategory.upsert({
      where: { slug: slugify(cat.category) },
      update: { name: cat.category, position: i },
      create: { name: cat.category, slug: slugify(cat.category), position: i },
    });

    for (const p of cat.products) {
      await prisma.product.upsert({
        where: { slug: slugify(p.name) },
        update: { ...p, categoryId: category.id },
        create: { ...p, slug: slugify(p.name), categoryId: category.id },
      });
    }
  }

  // Avis
  if ((await prisma.review.count()) === 0) {
    await prisma.review.createMany({
      data: [
        { authorName: "Aïcha K.", rating: 5, comment: "Accueil royal et tresses impeccables. Je ne vais plus ailleurs !", isApproved: true },
        { authorName: "Marie-Laure D.", rating: 5, comment: "Salon propre, équipe adorable et résultat au-delà de mes attentes.", isApproved: true },
        { authorName: "Fatou S.", rating: 5, comment: "La réservation en ligne est super pratique, aucune attente.", isApproved: true },
      ],
    });
  }

  // Paramètres du salon
  await prisma.salonSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log("✅ Base remplie avec les données d'exemple");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());