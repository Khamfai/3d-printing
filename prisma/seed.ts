import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await Bun.password.hash("admin123456", {
    algorithm: "bcrypt",
    cost: 12,
  });
  const admin = await prisma.user.upsert({
    where: { email: "admin@printing3d.com" },
    update: { password: adminPassword },
    create: {
      email: "admin@printing3d.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create test customer
  const customerPassword = await Bun.password.hash("customer123456", {
    algorithm: "bcrypt",
    cost: 12,
  });
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { password: customerPassword },
    create: {
      email: "customer@example.com",
      name: "Test Customer",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  // Create materials
  const pla = await prisma.material.upsert({
    where: { name: "PLA" },
    update: {},
    create: {
      name: "PLA",
      description:
        "Polylactic Acid - Most popular 3D printing material. Biodegradable, easy to print.",
      density: 1.24,
      costPerGram: 0.025,
      colors: [
        { name: "White", hex: "#FFFFFF" },
        { name: "Black", hex: "#1A1A1A" },
        { name: "Red", hex: "#E53E3E" },
        { name: "Blue", hex: "#3182CE" },
        { name: "Green", hex: "#38A169" },
        { name: "Yellow", hex: "#ECC94B" },
        { name: "Orange", hex: "#ED8936" },
        { name: "Gray", hex: "#A0AEC0" },
      ],
      properties: { heatResistance: "Low", strength: "Medium", flexibility: "Low" },
    },
  });

  const abs = await prisma.material.upsert({
    where: { name: "ABS" },
    update: {},
    create: {
      name: "ABS",
      description:
        "Acrylonitrile Butadiene Styrene - Durable, heat-resistant. Used in automotive parts.",
      density: 1.04,
      costPerGram: 0.03,
      colors: [
        { name: "White", hex: "#F7FAFC" },
        { name: "Black", hex: "#1A202C" },
        { name: "Red", hex: "#C53030" },
        { name: "Natural", hex: "#FFFDD0" },
      ],
      properties: { heatResistance: "High", strength: "High", flexibility: "Medium" },
    },
  });

  const petg = await prisma.material.upsert({
    where: { name: "PETG" },
    update: {},
    create: {
      name: "PETG",
      description: "Polyethylene Terephthalate Glycol - Strong, chemical resistant, food-safe.",
      density: 1.27,
      costPerGram: 0.035,
      colors: [
        { name: "Clear", hex: "#EDF2F7" },
        { name: "Black", hex: "#2D3748" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Blue", hex: "#2B6CB0" },
      ],
      properties: { heatResistance: "Medium", strength: "High", flexibility: "Medium" },
    },
  });

  const tpu = await prisma.material.upsert({
    where: { name: "TPU" },
    update: {},
    create: {
      name: "TPU",
      description:
        "Thermoplastic Polyurethane - Flexible, rubber-like. Great for phone cases, seals.",
      density: 1.21,
      costPerGram: 0.045,
      colors: [
        { name: "Black", hex: "#1A202C" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Red", hex: "#E53E3E" },
      ],
      properties: { heatResistance: "Low", strength: "Medium", flexibility: "High" },
    },
  });

  const nylon = await prisma.material.upsert({
    where: { name: "Nylon" },
    update: {},
    create: {
      name: "Nylon",
      description: "Polyamide - Extremely strong and durable. Ideal for functional parts.",
      density: 1.14,
      costPerGram: 0.06,
      colors: [
        { name: "Natural", hex: "#FFFDD0" },
        { name: "Black", hex: "#1A202C" },
      ],
      properties: { heatResistance: "High", strength: "Very High", flexibility: "Medium" },
    },
  });

  // Create default pricing rule
  await prisma.pricingRule.upsert({
    where: { name: "Default" },
    update: {},
    create: {
      name: "Default",
      machineCostPerHour: 5.0,
      markupPercent: 30,
      minimumPrice: 5.0,
      isActive: true,
    },
  });

  // Create sample 3D models
  const sampleModels = [
    {
      slug: "benchy-boat",
      name: "Benchy Boat",
      description:
        "Classic 3D printing benchmark model. Tests overhangs, bridging, and fine details.",
      format: "STL" as const,
      fileKey: "samples/benchy-boat.stl",
      dimensionX: 60,
      dimensionY: 48,
      dimensionZ: 31,
      volumeCm3: 15.5,
      category: "Benchmark",
      isSample: true,
      isFeatured: true,
    },
    {
      slug: "gear-set",
      name: "Mechanical Gear Set",
      description:
        "Interlocking gear system with precise teeth. Demonstrates mechanical printing capability.",
      format: "STL" as const,
      fileKey: "samples/gear-set.stl",
      dimensionX: 80,
      dimensionY: 80,
      dimensionZ: 15,
      volumeCm3: 22.3,
      category: "Mechanical",
      isSample: true,
      isFeatured: true,
    },
    {
      slug: "phone-stand",
      name: "Adjustable Phone Stand",
      description: "Ergonomic phone stand with adjustable angle. Functional and practical design.",
      format: "STL" as const,
      fileKey: "samples/phone-stand.stl",
      dimensionX: 100,
      dimensionY: 80,
      dimensionZ: 120,
      volumeCm3: 45.0,
      category: "Functional",
      isSample: true,
      isFeatured: true,
    },
    {
      slug: "dragon-figurine",
      name: "Dragon Figurine",
      description:
        "Detailed dragon sculpture with intricate scales and wings. Great display piece.",
      format: "STL" as const,
      fileKey: "samples/dragon-figurine.stl",
      dimensionX: 120,
      dimensionY: 80,
      dimensionZ: 150,
      volumeCm3: 85.0,
      category: "Art",
      isSample: true,
      isFeatured: true,
    },
    {
      slug: "vase-spiral",
      name: "Spiral Vase",
      description: "Elegant spiral vase printed in vase mode. Watertight with beautiful geometry.",
      format: "STL" as const,
      fileKey: "samples/vase-spiral.stl",
      dimensionX: 80,
      dimensionY: 80,
      dimensionZ: 200,
      volumeCm3: 35.0,
      category: "Home Decor",
      isSample: true,
      isFeatured: true,
    },
    {
      slug: "chess-set",
      name: "Chess Set",
      description: "Complete Staunton-style chess set. Classic design with excellent printability.",
      format: "OBJ" as const,
      fileKey: "samples/chess-set.obj",
      dimensionX: 45,
      dimensionY: 45,
      dimensionZ: 95,
      volumeCm3: 28.0,
      category: "Games",
      isSample: true,
      isFeatured: true,
    },
    {
      slug: "raspberry-pi-case",
      name: "Raspberry Pi 4 Case",
      description: "Snap-fit case for Raspberry Pi 4 with ventilation slots and port access.",
      format: "STL" as const,
      fileKey: "samples/raspberry-pi-case.stl",
      dimensionX: 90,
      dimensionY: 65,
      dimensionZ: 30,
      volumeCm3: 18.0,
      category: "Electronics",
      isSample: true,
      isFeatured: false,
    },
    {
      slug: "low-poly-fox",
      name: "Low Poly Fox",
      description: "Charming low-poly fox sculpture. Easy to print, no supports needed.",
      format: "GLB" as const,
      fileKey: "samples/low-poly-fox.glb",
      dimensionX: 60,
      dimensionY: 40,
      dimensionZ: 70,
      volumeCm3: 20.0,
      category: "Art",
      isSample: true,
      isFeatured: false,
    },
  ];

  for (const model of sampleModels) {
    await prisma.model3D.upsert({
      where: { slug: model.slug },
      update: {},
      create: model,
    });
  }

  console.log("✅ Seed completed!");
  console.log(`   Admin: admin@printing3d.com / admin123456`);
  console.log(`   Customer: customer@example.com / customer123456`);
  console.log(`   Materials: ${5} created`);
  console.log(`   Sample models: ${sampleModels.length} created`);
  console.log(`   Pricing rule: Default created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
