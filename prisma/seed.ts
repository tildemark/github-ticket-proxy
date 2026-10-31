import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Initialize Global System Settings
  await prisma.systemSetting.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      allowPublicRegistration: false, // Default: invite-only!
    },
  });

  // 1. Create Companies
  const acmeCorp = await prisma.company.upsert({
    where: { domain: "acme.com" },
    update: { name: "Acme Corporation" },
    create: {
      name: "Acme Corporation",
      domain: "acme.com",
    },
  });

  const starkIndustries = await prisma.company.upsert({
    where: { domain: "starkindustries.com" },
    update: { name: "Stark Industries" },
    create: {
      name: "Stark Industries",
      domain: "starkindustries.com",
    },
  });

  // 2. Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@issuebridge.com" },
    update: {
      password: passwordHash,
      role: "ADMIN",
    },
    create: {
      name: "Admin Supreme",
      email: "admin@issuebridge.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  // 3. Support Agent
  const agent = await prisma.user.upsert({
    where: { email: "agent@issuebridge.com" },
    update: {
      password: passwordHash,
      role: "AGENT",
    },
    create: {
      name: "Alex Support Agent",
      email: "agent@issuebridge.com",
      password: passwordHash,
      role: "AGENT",
    },
  });

  // 4. Acme Client User
  const acmeClient = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {
      password: passwordHash,
      role: "CLIENT",
      companyId: acmeCorp.id,
    },
    create: {
      name: "Acme Client Corp",
      email: "client@example.com",
      password: passwordHash,
      role: "CLIENT",
      companyId: acmeCorp.id,
    },
  });

  // 5. Stark Client User
  const starkClient = await prisma.user.upsert({
    where: { email: "tony@starkindustries.com" },
    update: {
      password: passwordHash,
      role: "CLIENT",
      companyId: starkIndustries.id,
    },
    create: {
      name: "Tony Stark",
      email: "tony@starkindustries.com",
      password: passwordHash,
      role: "CLIENT",
      companyId: starkIndustries.id,
    },
  });

  // Update existing sample tickets to be linked to Acme Corp
  await prisma.ticket.updateMany({
    where: { authorId: acmeClient.id },
    data: { companyId: acmeCorp.id },
  });

  // Sample Invite token for demonstration
  await prisma.invitation.upsert({
    where: { token: "demo-acme-invite" },
    update: {},
    create: {
      token: "demo-acme-invite",
      email: "partner@acme.com",
      companyId: acmeCorp.id,
      role: "CLIENT",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seeding complete with multi-tenancy & invitations!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
