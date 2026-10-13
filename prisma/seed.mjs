import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Upsert users
  const helga = await db.user.upsert({
    where: { id: "user-helga" },
    update: {},
    create: {
      id: "user-helga",
      name: "Helga Windle",
      email: "helga.windle@example.com",
      githubLogin: "helga-windle",
    },
  });

  const troy = await db.user.upsert({
    where: { id: "user-troy" },
    update: {},
    create: {
      id: "user-troy",
      name: "Troy Mccoy",
      email: "troy.mccoy@example.com",
      githubLogin: "troy-mccoy",
    },
  });

  // Upsert initial ideas
  await db.idea.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      code: "AWE-222",
      title: "ACME Customer Sales Product",
      subtitle: "Unified customer dashboard",
      goal: "Provide a unified dashboard to increase customer retention by 15%.",
      roadmap: "Design -> Prototyping -> Development",
      team: "Orange",
      description: "ACME customer sales product aims to unify the sales pipeline with automated retention notifications.",
      category: "Business",
      status: "Proposed",
      icon: "💼",
      creator: "Helga Windle",
      collaborators: "Adela Cervantsz, Bess Marso",
      repoUrl: "https://github.com/acme/sales",
      inProgressUrl: "https://acme.dev",
      votes: 18,
      tags: "Increase Innovation",
      isArchived: false,
      createdById: helga.id,
    },
  });

  await db.idea.upsert({
    where: { id: "2" },
    update: {},
    create: {
      id: "2",
      code: "AWE-223",
      title: "Green roof on HQ",
      subtitle: "Eco-friendly roof installation",
      goal: "Reduce energy costs and provide a recreational space for employees.",
      roadmap: "Design -> Prototyping -> Development",
      team: "Orange",
      description: "Proposing the installation of a green roof on the main headquarters building. This will improve building insulation, reduce urban heat island effect, and provide a recreational space for employees.",
      category: "Health",
      status: "In Review",
      icon: "🌿",
      creator: "Troy Mccoy (Team Member)",
      collaborators: "Jane Doe, John Smith",
      repoUrl: "https://github.com/acme/green-roof",
      inProgressUrl: "https://acme.dev/green-roof",
      votes: 10,
      tags: "Increase Innovation",
      isArchived: false,
      createdById: troy.id,
    },
  });

  await db.idea.upsert({
    where: { id: "3" },
    update: {},
    create: {
      id: "3",
      code: "AWE-104",
      title: "Legacy Database Migration",
      subtitle: "Migrating old DB tables",
      goal: "Modernize historical database records.",
      roadmap: "Planning -> Migration -> Testing",
      team: "Blue",
      description: "Archived project for migrating legacy data.",
      category: "Technology",
      status: "Done",
      icon: "💾",
      creator: "Bess Marso",
      collaborators: "Helga Windle",
      votes: 5,
      tags: "Infrastructure",
      isArchived: true,
      archivedAt: new Date("2022-01-12"),
      createdById: helga.id,
    },
  });

  await db.idea.upsert({
    where: { id: "4" },
    update: {},
    create: {
      id: "4",
      code: "AWE-098",
      title: "Virtual Reality Onboarding",
      subtitle: "VR headset employee tour",
      goal: "Improve remote onboarding engagement.",
      roadmap: "Experiment -> Pilot",
      team: "Design",
      description: "VR employee trial discontinued.",
      category: "Lifestyle",
      status: "Shelved",
      icon: "🥽",
      creator: "Troy Mccoy",
      collaborators: "Jane Doe",
      votes: 3,
      tags: "Innovation",
      isArchived: true,
      archivedAt: new Date("2021-03-05"),
      createdById: troy.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
