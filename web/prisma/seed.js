const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data
  await prisma.permitIssuance.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.claimReference.deleteMany();
  await prisma.slotReservation.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.claimSchedule.deleteMany();
  await prisma.reviewAction.deleteMany();
  await prisma.applicationHistory.deleteMany();
  await prisma.document.deleteMany();
  await prisma.application.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.otpToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("Password123!", 12);

  // ── Users ──────────────────────────────────────────────────────────
  console.log("👤 Creating users...");

  const admin = await prisma.user.create({
    data: {
      email: "admin@lgu.gov.ph",
      password,
      firstName: "System",
      lastName: "Administrator",
      phone: "09171234567",
      role: "ADMINISTRATOR",
      status: "ACTIVE",
      emailVerified: new Date(),
      twoFactorEnabled: false,
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      email: "reviewer@lgu.gov.ph",
      password,
      firstName: "Maria",
      lastName: "Santos",
      phone: "09181234567",
      role: "REVIEWER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@lgu.gov.ph",
      password,
      firstName: "Jose",
      lastName: "Reyes",
      phone: "09191234567",
      role: "STAFF",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const applicant1 = await prisma.user.create({
    data: {
      email: "juan@example.com",
      password,
      firstName: "Juan",
      lastName: "Dela Cruz",
      middleName: "Bautista",
      phone: "09201234567",
      role: "APPLICANT",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const applicant2 = await prisma.user.create({
    data: {
      email: "pedro@example.com",
      password,
      firstName: "Pedro",
      lastName: "Garcia",
      phone: "09211234567",
      role: "APPLICANT",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const applicant3 = await prisma.user.create({
    data: {
      email: "ana@example.com",
      password,
      firstName: "Ana",
      lastName: "Reyes",
      phone: "09221234567",
      role: "APPLICANT",
      status: "PENDING_VERIFICATION",
    },
  });

  console.log(`  ✓ Created ${6} users`);

  // ── Applications ───────────────────────────────────────────────────
  console.log("📋 Creating applications...");

  const app1 = await prisma.application.create({
    data: {
      applicationNumber: "BP-2026-000001",
      type: "NEW",
      status: "APPROVED",
      applicantId: applicant1.id,
      businessName: "Juan's Sari-Sari Store",
      businessType: "Retail - General Merchandise",
      businessAddress: "123 Rizal Street, Barangay 1",
      businessBarangay: "Barangay 1",
      businessCity: "Quezon City",
      businessProvince: "Metro Manila",
      businessZipCode: "1100",
      businessPhone: "09201234567",
      businessEmail: "juanstore@example.com",
      dtiSecRegistration: "DTI-2026-001234",
      tinNumber: "123-456-789-000",
      numberOfEmployees: 3,
      capitalInvestment: 250000,
      grossSales: 500000,
      submittedAt: new Date("2026-01-15"),
      reviewedAt: new Date("2026-01-20"),
      approvedAt: new Date("2026-01-20"),
    },
  });

  const app2 = await prisma.application.create({
    data: {
      applicationNumber: "BP-2026-000002",
      type: "NEW",
      status: "UNDER_REVIEW",
      applicantId: applicant1.id,
      businessName: "JDC Computer Shop",
      businessType: "Service - Internet Cafe",
      businessAddress: "456 Mabini Street, Barangay 5",
      businessBarangay: "Barangay 5",
      businessCity: "Quezon City",
      businessProvince: "Metro Manila",
      businessZipCode: "1101",
      dtiSecRegistration: "DTI-2026-005678",
      tinNumber: "123-456-789-000",
      numberOfEmployees: 5,
      capitalInvestment: 500000,
      submittedAt: new Date("2026-02-01"),
    },
  });

  const app3 = await prisma.application.create({
    data: {
      applicationNumber: "BP-2026-000003",
      type: "NEW",
      status: "SUBMITTED",
      applicantId: applicant2.id,
      businessName: "Pedro's Auto Repair",
      businessType: "Service - Automotive",
      businessAddress: "789 Bonifacio Avenue, Barangay 10",
      businessBarangay: "Barangay 10",
      businessCity: "Quezon City",
      businessProvince: "Metro Manila",
      businessZipCode: "1105",
      dtiSecRegistration: "DTI-2026-009012",
      tinNumber: "987-654-321-000",
      numberOfEmployees: 8,
      capitalInvestment: 1000000,
      submittedAt: new Date("2026-02-15"),
    },
  });

  const app4 = await prisma.application.create({
    data: {
      applicationNumber: "BP-2026-000004",
      type: "NEW",
      status: "DRAFT",
      applicantId: applicant2.id,
      businessName: "Garcia Hardware & Construction",
      businessType: "Retail - Hardware",
      businessAddress: "321 Luna Street",
      businessCity: "Quezon City",
      businessProvince: "Metro Manila",
      numberOfEmployees: 12,
      capitalInvestment: 2000000,
    },
  });

  const app5 = await prisma.application.create({
    data: {
      applicationNumber: "BP-2026-000005",
      type: "NEW",
      status: "REJECTED",
      applicantId: applicant2.id,
      businessName: "Garcia Food Cart",
      businessType: "Food - Street Food",
      businessAddress: "Market Area, Barangay 3",
      businessBarangay: "Barangay 3",
      businessCity: "Quezon City",
      businessProvince: "Metro Manila",
      numberOfEmployees: 2,
      capitalInvestment: 50000,
      submittedAt: new Date("2026-01-10"),
      reviewedAt: new Date("2026-01-18"),
      rejectedAt: new Date("2026-01-18"),
      rejectionReason: "Incomplete documentary requirements. Missing Barangay Clearance and Fire Safety Certificate.",
    },
  });

  console.log(`  ✓ Created ${5} applications`);

  // ── Application History ────────────────────────────────────────────
  console.log("📜 Creating application history...");

  const historyEntries = [
    { applicationId: app1.id, newStatus: "DRAFT", comment: "Application created", changedBy: applicant1.id },
    { applicationId: app1.id, previousStatus: "DRAFT", newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant1.id },
    { applicationId: app1.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Under review by staff", changedBy: staff.id },
    { applicationId: app1.id, previousStatus: "UNDER_REVIEW", newStatus: "APPROVED", comment: "Application approved. All requirements met.", changedBy: reviewer.id },
    { applicationId: app2.id, newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant1.id },
    { applicationId: app2.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Under review", changedBy: staff.id },
    { applicationId: app3.id, newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant2.id },
    { applicationId: app5.id, newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant2.id },
    { applicationId: app5.id, previousStatus: "SUBMITTED", newStatus: "REJECTED", comment: "Incomplete requirements", changedBy: reviewer.id },
  ];

  for (const entry of historyEntries) {
    await prisma.applicationHistory.create({ data: entry });
  }
  console.log(`  ✓ Created ${historyEntries.length} history entries`);

  // ── Documents ──────────────────────────────────────────────────────
  console.log("📄 Creating documents...");

  const docs = [
    { applicationId: app1.id, uploadedBy: applicant1.id, fileName: "dti_cert.pdf", originalName: "DTI Certificate.pdf", mimeType: "application/pdf", fileSize: 524288, filePath: "uploads/app1/dti_cert.pdf", documentType: "DTI_CERTIFICATE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-01-19") },
    { applicationId: app1.id, uploadedBy: applicant1.id, fileName: "brgy_clearance.pdf", originalName: "Barangay Clearance.pdf", mimeType: "application/pdf", fileSize: 312000, filePath: "uploads/app1/brgy_clearance.pdf", documentType: "BARANGAY_CLEARANCE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-01-19") },
    { applicationId: app1.id, uploadedBy: applicant1.id, fileName: "fire_cert.pdf", originalName: "Fire Safety Certificate.pdf", mimeType: "application/pdf", fileSize: 410000, filePath: "uploads/app1/fire_cert.pdf", documentType: "FIRE_SAFETY_CERTIFICATE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-01-19") },
    { applicationId: app2.id, uploadedBy: applicant1.id, fileName: "dti_cert2.pdf", originalName: "DTI Certificate.pdf", mimeType: "application/pdf", fileSize: 530000, filePath: "uploads/app2/dti_cert2.pdf", documentType: "DTI_CERTIFICATE", status: "PENDING_VERIFICATION" },
    { applicationId: app2.id, uploadedBy: applicant1.id, fileName: "brgy_clearance2.pdf", originalName: "Barangay Clearance.pdf", mimeType: "application/pdf", fileSize: 298000, filePath: "uploads/app2/brgy_clearance2.pdf", documentType: "BARANGAY_CLEARANCE", status: "UPLOADED" },
    { applicationId: app3.id, uploadedBy: applicant2.id, fileName: "dti_cert3.pdf", originalName: "DTI Registration.pdf", mimeType: "application/pdf", fileSize: 450000, filePath: "uploads/app3/dti_cert3.pdf", documentType: "DTI_CERTIFICATE", status: "UPLOADED" },
  ];

  for (const doc of docs) {
    await prisma.document.create({ data: doc });
  }
  console.log(`  ✓ Created ${docs.length} documents`);

  // ── Review Actions ─────────────────────────────────────────────────
  console.log("✅ Creating review actions...");

  await prisma.reviewAction.create({
    data: {
      applicationId: app1.id,
      reviewerId: reviewer.id,
      action: "APPROVE",
      comment: "All requirements complete. Business is in proper zone. Approved.",
    },
  });

  await prisma.reviewAction.create({
    data: {
      applicationId: app5.id,
      reviewerId: reviewer.id,
      action: "REJECT",
      comment: "Missing Barangay Clearance and Fire Safety Certificate. Please re-submit.",
    },
  });

  console.log("  ✓ Created 2 review actions");

  // ── Permit (for approved app) ──────────────────────────────────────
  console.log("🏛️ Creating permits...");

  const permit1 = await prisma.permit.create({
    data: {
      permitNumber: "PERMIT-2026-000001",
      applicationId: app1.id,
      businessName: "Juan's Sari-Sari Store",
      businessAddress: "123 Rizal Street, Barangay 1, Quezon City",
      ownerName: "Juan Bautista Dela Cruz",
      issueDate: new Date("2026-01-20"),
      expiryDate: new Date("2027-01-20"),
      status: "ACTIVE",
    },
  });

  await prisma.permitIssuance.create({
    data: {
      permitId: permit1.id,
      issuedById: staff.id,
      status: "ISSUED",
      issuedAt: new Date("2026-01-20"),
    },
  });

  console.log("  ✓ Created 1 permit with issuance");

  // ── Claim Reference ────────────────────────────────────────────────
  console.log("🔖 Creating claim references...");

  await prisma.claimReference.create({
    data: {
      referenceNumber: "CLM-20260120-ABC123",
      applicationId: app1.id,
      generatedBy: applicant1.id,
      applicantName: "Juan Bautista Dela Cruz",
      businessName: "Juan's Sari-Sari Store",
      applicationStatus: "APPROVED",
      status: "CLAIMED",
      claimScheduleDate: new Date("2026-01-25"),
      claimScheduleTime: "09:00 - 10:00",
      verifiedAt: new Date("2026-01-25"),
      claimedAt: new Date("2026-01-25"),
    },
  });

  console.log("  ✓ Created 1 claim reference");

  // ── Claim Schedules ────────────────────────────────────────────────
  console.log("📅 Creating claim schedules...");

  const today = new Date();
  const schedules = [];

  for (let i = 1; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const schedule = await prisma.claimSchedule.create({
      data: {
        date,
        timeSlots: {
          create: [
            { startTime: "08:00", endTime: "09:00", maxCapacity: 10 },
            { startTime: "09:00", endTime: "10:00", maxCapacity: 10 },
            { startTime: "10:00", endTime: "11:00", maxCapacity: 10 },
            { startTime: "13:00", endTime: "14:00", maxCapacity: 10 },
            { startTime: "14:00", endTime: "15:00", maxCapacity: 10 },
            { startTime: "15:00", endTime: "16:00", maxCapacity: 10 },
          ],
        },
      },
    });
    schedules.push(schedule);
  }

  console.log(`  ✓ Created ${schedules.length} schedules with time slots`);

  // ── System Settings ────────────────────────────────────────────────
  console.log("⚙️ Creating system settings...");

  const settings = [
    { key: "lgu_name", value: "City of Quezon", type: "string" },
    { key: "lgu_address", value: "Quezon City Hall, Elliptical Road, Diliman, Quezon City", type: "string" },
    { key: "lgu_phone", value: "(02) 8988-4242", type: "string" },
    { key: "lgu_email", value: "bplo@quezoncity.gov.ph", type: "string" },
    { key: "permit_validity_days", value: "365", type: "number" },
    { key: "max_file_size_mb", value: "10", type: "number" },
    { key: "otp_expiry_minutes", value: "15", type: "number" },
    { key: "session_timeout_minutes", value: "30", type: "number" },
    { key: "require_2fa_staff", value: "true", type: "boolean" },
    { key: "maintenance_mode", value: "false", type: "boolean" },
    { key: "allowed_file_types", value: '["application/pdf","image/jpeg","image/png","image/webp"]', type: "json" },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.create({ data: setting });
  }
  console.log(`  ✓ Created ${settings.length} system settings`);

  // ── Activity Logs ──────────────────────────────────────────────────
  console.log("📊 Creating activity logs...");

  const logs = [
    { userId: admin.id, action: "LOGIN", entity: "User", entityId: admin.id },
    { userId: applicant1.id, action: "REGISTER", entity: "User", entityId: applicant1.id },
    { userId: applicant1.id, action: "LOGIN", entity: "User", entityId: applicant1.id },
    { userId: applicant1.id, action: "CREATE_APPLICATION", entity: "Application", entityId: app1.id },
    { userId: applicant1.id, action: "UPLOAD_DOCUMENTS", entity: "Application", entityId: app1.id },
    { userId: applicant1.id, action: "SUBMIT_APPLICATION", entity: "Application", entityId: app1.id },
    { userId: reviewer.id, action: "REVIEW_APPROVE", entity: "Application", entityId: app1.id },
    { userId: staff.id, action: "DOCUMENT_VERIFIED", entity: "Document", entityId: app1.id },
    { userId: applicant2.id, action: "REGISTER", entity: "User", entityId: applicant2.id },
    { userId: applicant2.id, action: "CREATE_APPLICATION", entity: "Application", entityId: app3.id },
  ];

  for (const log of logs) {
    await prisma.activityLog.create({ data: log });
  }
  console.log(`  ✓ Created ${logs.length} activity logs`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📌 Test Credentials:");
  console.log("  Admin:      admin@lgu.gov.ph       / Password123!");
  console.log("  Reviewer:   reviewer@lgu.gov.ph    / Password123!");
  console.log("  Staff:      staff@lgu.gov.ph       / Password123!");
  console.log("  Applicant:  juan@example.com       / Password123!");
  console.log("  Applicant:  pedro@example.com      / Password123!");
  console.log("  Pending:    ana@example.com         / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
