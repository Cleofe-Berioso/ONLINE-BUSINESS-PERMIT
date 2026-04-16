const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load DATABASE_URL from .env manually (Prisma 7 seed runs outside Next.js)
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
      /* RENEWAL ELIGIBLE APPLICANT - Has ACTIVE permit, can access renewal portal */
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
      /* NEW APPLICANT - No permits, no approved applications */
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

<<<<<<< Updated upstream
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
=======
  // app3 is commented out — applicant2 (Pedro) is kept as a NEW APPLICANT with NO applications
  // const app3 = await prisma.application.create({
  //   data: {
  //     applicationNumber: "BP-2026-000003",
  //     type: "NEW",
  //     status: "SUBMITTED",
  //     applicantId: applicant2.id,
  //     businessName: "Pedro's Auto Repair",
  //     businessType: "Service - Automotive",
  //     businessAddress: "789 Bonifacio Avenue, Barangay 10",
  //     businessBarangay: "Barangay 10",
  //     businessCity: "Quezon City",
  //     businessProvince: "Metro Manila",
  //     businessZipCode: "1105",
  //     businessPhone: "09211111111",
  //     businessEmail: "pedro.repair@example.com",
  //     dtiSecRegistration: "DTI-2026-009012",
  //     tinNumber: "987-654-321-000",
  //     numberOfEmployees: 8,
  //     capitalInvestment: 1000000,
  //     grossSales: 1200000,
  //     submittedAt: new Date("2026-02-15"),
  //   },
  // });

  // app4 is commented out — applicant2 (Pedro) has no applications
  // const app4 = await prisma.application.create({
  //   data: {
  //     applicationNumber: "BP-2026-000004",
  //     type: "NEW",
  //     status: "DRAFT",
  //     applicantId: applicant2.id,
  //     businessName: "Garcia Hardware & Construction",
  //     businessType: "Retail - Hardware",
  //     businessAddress: "321 Luna Street, Barangay 12",
  //     businessBarangay: "Barangay 12",
  //     businessCity: "Quezon City",
  //     businessProvince: "Metro Manila",
  //     businessZipCode: "1106",
  //     businessPhone: "09211111112",
  //     businessEmail: "garcia.hardware@example.com",
  //     numberOfEmployees: 12,
  //     capitalInvestment: 2000000,
  //     grossSales: 3000000,
  //   },
  // });
>>>>>>> Stashed changes

  // app5 is commented out — applicant2 (Pedro) has no applications
  // const app5 = await prisma.application.create({
  //   data: {
  //     applicationNumber: "BP-2026-000005",
  //     type: "NEW",
  //     status: "REJECTED",
  //     applicantId: applicant2.id,
  //     businessName: "Garcia Food Cart",
  //     businessType: "Food - Street Food",
  //     businessAddress: "Market Area, Barangay 3",
  //     businessBarangay: "Barangay 3",
  //     businessCity: "Quezon City",
  //     businessProvince: "Metro Manila",
  //     numberOfEmployees: 2,
  //     capitalInvestment: 50000,
  //     submittedAt: new Date("2026-01-10"),
  //     reviewedAt: new Date("2026-01-18"),
  //     rejectedAt: new Date("2026-01-18"),
  //     rejectionReason: "Incomplete documentary requirements. Missing Barangay Clearance and Fire Safety Certificate.",
  //   },
  // });

<<<<<<< Updated upstream
  console.log(`  ✓ Created ${5} applications`);
=======
  const app6 = await prisma.application.create({
    data: {
      applicationNumber: "BP-2026-000006",
      type: "RENEWAL",
      status: "APPROVED",
      applicantId: applicant4.id,
      businessName: "Maria's Beauty Salon",
      businessType: "Service - Beauty & Wellness",
      businessAddress: "555 Ortigas Avenue, Barangay 7",
      businessBarangay: "Barangay 7",
      businessCity: "Quezon City",
      businessProvince: "Metro Manila",
      businessZipCode: "1103",
      businessPhone: "09231234567",
      businessEmail: "maria.salon@example.com",
      dtiSecRegistration: "DTI-2025-003456",
      tinNumber: "456-789-012-000",
      numberOfEmployees: 4,
      capitalInvestment: 300000,
      grossSales: 800000,
      submittedAt: new Date("2026-02-05"),
      reviewedAt: new Date("2026-02-10"),
      approvedAt: new Date("2026-02-10"),
    },
  });

  // ── New Test Applications for Payment Routes ────────────────────────────
  console.log("💳 Creating test applications for payment workflow...");

  const appEndorsed1 = await prisma.application.create({
    data: {
      applicationNumber: "BP-2026-000007",
      type: "NEW",
      status: "ENDORSED",
      applicantId: applicant1.id,
      businessName: "Quick Print Solutions",
      businessType: "Service - Printing",
      businessAddress: "789 Quezon Boulevard, Barangay 2",
      businessBarangay: "Barangay 2",
      businessCity: "Quezon City",
      businessProvince: "Metro Manila",
      businessZipCode: "1102",
      businessPhone: "09201111119",
      businessEmail: "quick.print@example.com",
      dtiSecRegistration: "DTI-2026-011111",
      tinNumber: "111-222-333-000",
      numberOfEmployees: 6,
      capitalInvestment: 600000,
      grossSales: 900000,
      submittedAt: new Date("2026-02-20"),
      reviewedAt: new Date("2026-02-25"),
    },
  });

  // appEndorsed2 is commented out — applicant2 (Pedro) has no applications
  // const appEndorsed2 = await prisma.application.create({
  //   data: {
  //     applicationNumber: "BP-2026-000008",
  //     type: "NEW",
  //     status: "ENDORSED",
  //     applicantId: applicant2.id,
  //     businessName: "Fresh Groceries Mart",
  //     businessType: "Retail - Grocery",
  //     businessAddress: "321 Commonwealth Avenue, Barangay 8",
  //     businessBarangay: "Barangay 8",
  //     businessCity: "Quezon City",
  //     businessProvince: "Metro Manila",
  //     businessZipCode: "1104",
  //     businessPhone: "09211111119",
  //     businessEmail: "fresh.groceries@example.com",
  //     dtiSecRegistration: "DTI-2026-022222",
  //     tinNumber: "444-555-666-000",
  //     numberOfEmployees: 15,
  //     capitalInvestment: 1500000,
  //     grossSales: 2000000,
  //     submittedAt: new Date("2026-02-18"),
  //     reviewedAt: new Date("2026-02-24"),
  //   },
  // });

  console.log("  ✓ Created 1 ENDORSED application (ready for payment)");


  console.log(`  ✓ Created ${4} applications`);
>>>>>>> Stashed changes

  // ── Application History ────────────────────────────────────────────
  console.log("📜 Creating application history...");

  const historyEntries = [
    { applicationId: app1.id, newStatus: "DRAFT", comment: "Application created", changedBy: applicant1.id },
    { applicationId: app1.id, previousStatus: "DRAFT", newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant1.id },
    { applicationId: app1.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Under review by staff", changedBy: staff.id },
    { applicationId: app1.id, previousStatus: "UNDER_REVIEW", newStatus: "APPROVED", comment: "Application approved. All requirements met.", changedBy: reviewer.id },
    { applicationId: app2.id, newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant1.id },
    { applicationId: app2.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Under review", changedBy: staff.id },
<<<<<<< Updated upstream
    { applicationId: app3.id, newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant2.id },
    { applicationId: app5.id, newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant2.id },
    { applicationId: app5.id, previousStatus: "SUBMITTED", newStatus: "REJECTED", comment: "Incomplete requirements", changedBy: reviewer.id },
=======
    // Removed app3, app5 history entries (applicant2 Pedro has no applications)
    { applicationId: app6.id, newStatus: "SUBMITTED", comment: "Renewal submitted", changedBy: applicant4.id },
    { applicationId: app6.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Renewal under review", changedBy: staff.id },
    { applicationId: app6.id, previousStatus: "UNDER_REVIEW", newStatus: "APPROVED", comment: "Renewal approved. All documents verified.", changedBy: reviewer.id },
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    { applicationId: app3.id, uploadedBy: applicant2.id, fileName: "dti_cert3.pdf", originalName: "DTI Registration.pdf", mimeType: "application/pdf", fileSize: 450000, filePath: "uploads/app3/dti_cert3.pdf", documentType: "DTI_CERTIFICATE", status: "UPLOADED" },
=======
    // Removed app3 document (applicant2 Pedro has no applications)
    { applicationId: app6.id, uploadedBy: applicant4.id, fileName: "dti_renewal.pdf", originalName: "DTI Renewal Certificate.pdf", mimeType: "application/pdf", fileSize: 520000, filePath: "uploads/app6/dti_renewal.pdf", documentType: "DTI_CERTIFICATE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-02-09") },
    { applicationId: app6.id, uploadedBy: applicant4.id, fileName: "brgy_renewal.pdf", originalName: "Barangay Clearance Renewal.pdf", mimeType: "application/pdf", fileSize: 310000, filePath: "uploads/app6/brgy_renewal.pdf", documentType: "BARANGAY_CLEARANCE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-02-09") },
    { applicationId: app6.id, uploadedBy: applicant4.id, fileName: "fire_renewal.pdf", originalName: "Fire Safety Certificate Renewal.pdf", mimeType: "application/pdf", fileSize: 405000, filePath: "uploads/app6/fire_renewal.pdf", documentType: "FIRE_SAFETY_CERTIFICATE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-02-09") },
>>>>>>> Stashed changes
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

  // Removed app5 review action (applicant2 has no applications)

<<<<<<< Updated upstream
=======
  await prisma.reviewAction.create({
    data: {
      applicationId: app6.id,
      reviewerId: reviewer.id,
      action: "APPROVE",
      comment: "Renewal documents verified and complete. Business maintains compliance.",
    },
  });

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  console.log("  ✓ Created 1 permit with issuance");
=======
  const permit2 = await prisma.permit.create({
    data: {
      permitNumber: "PERMIT-2026-000002",
      applicationId: app6.id,
      businessName: "Maria's Beauty Salon",
      businessAddress: "555 Ortigas Avenue, Barangay 7, Quezon City",
      ownerName: "Maria Gonzales",
      issueDate: new Date("2026-02-11"),
      expiryDate: new Date("2027-02-11"),
      status: "ACTIVE",
    },
  });

  await prisma.permitIssuance.create({
    data: {
      permitId: permit2.id,
      issuedById: staff.id,
      status: "ISSUED",
      issuedAt: new Date("2026-02-11"),
    },
  });

  // ── Test Permits for Claim Processing (from webhook approval workflow) ──
  console.log("🧪 Creating test permits for claim processing...");

  // Simulate permits that would be auto-generated from webhook
  const permit3 = await prisma.permit.create({
    data: {
      permitNumber: "PERMIT-2026-000003",
      applicationId: appEndorsed1.id,
      businessName: appEndorsed1.businessName,
      businessAddress: appEndorsed1.businessAddress,
      ownerName: `${applicant1.firstName} ${applicant1.lastName}`,
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    },
  });

  await prisma.permitIssuance.create({
    data: {
      permitId: permit3.id,
      issuedById: applicant1.id,
      status: "PREPARED",
    },
  });

  // permit4 is commented out — appEndorsed2 is no longer created
  // const permit4 = await prisma.permit.create({
  //   data: {
  //     permitNumber: "PERMIT-2026-000004",
  //     applicationId: appEndorsed2.id,
  //     businessName: appEndorsed2.businessName,
  //     businessAddress: appEndorsed2.businessAddress,
  //     ownerName: `${applicant2.firstName} ${applicant2.lastName}`,
  //     issueDate: new Date(),
  //     expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  //     status: "ACTIVE",
  //   },
  // });

  // await prisma.permitIssuance.create({
  //   data: {
  //     permitId: permit4.id,
  //     issuedById: applicant2.id,
  //     status: "PREPARED",
  //   },
  // });

  console.log("  ✓ Created 3 permits with issuance records (2 existing + 1 test)");
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  console.log("  ✓ Created 1 claim reference");
=======
  await prisma.claimReference.create({
    data: {
      referenceNumber: "CLM-20260215-DEF456",
      applicationId: app6.id,
      generatedBy: applicant4.id,
      applicantName: "Maria Gonzales",
      businessName: "Maria's Beauty Salon",
      applicationStatus: "APPROVED",
      status: "GENERATED",
      claimScheduleDate: new Date("2026-02-28"),
      claimScheduleTime: "10:00 - 11:00",
    },
  });

  // ── Test Claim References for Claim Processing Route ────────────────
  console.log("🧪 Creating test claim references for route testing...");

  await prisma.claimReference.create({
    data: {
      referenceNumber: "CLM-TEST-PENDING-001",
      applicationId: appEndorsed1.id,
      generatedBy: applicant1.id,
      applicantName: `${applicant1.firstName} ${applicant1.lastName}`,
      businessName: appEndorsed1.businessName,
      applicationStatus: "APPROVED",
      status: "GENERATED",
    },
  });

  // Removed claim reference for appEndorsed2 — applicant2 has no applications

  console.log("  ✓ Created 3 claim references (2 existing + 1 test)");
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  console.log(`  ✓ Created ${schedules.length} schedules with time slots`);
=======
  // Create some blocked dates (holidays/maintenance)
  const blockedDates = [
    new Date(today.getFullYear(), today.getMonth() + 1, 13), // Valentine's Day alternative
    new Date(today.getFullYear(), today.getMonth() + 2, 12), // System maintenance
  ];

  for (const blockedDate of blockedDates) {
    await prisma.claimSchedule.create({
      data: {
        date: blockedDate,
        isBlocked: true,
        blockReason: blockedDate.getTime() % 2 === 0 ? "System Maintenance" : "Holiday",
      },
    });
  }

  console.log(`  ✓ Created ${schedules.length} open schedules + ${blockedDates.length} blocked dates`);

  // ── Slot Reservations ──────────────────────────────────────────────
  console.log("🎫 Creating slot reservations...");

  // Get first schedule with time slots
  const firstSchedule = schedules[0];
  const reservations = [];
  if (firstSchedule && firstSchedule.timeSlots.length > 0) {
    // Reserve some slots
    const slot1 = firstSchedule.timeSlots[1]; // 09:00-10:00
    const slot2 = firstSchedule.timeSlots[2]; // 10:00-11:00
    const slot3 = firstSchedule.timeSlots[3]; // 13:00-14:00

    const r1 = await prisma.slotReservation.create({
      data: {
        timeSlotId: slot1.id,
        applicationId: app1.id,
        userId: applicant1.id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });
    reservations.push(r1);

    const r2 = await prisma.slotReservation.create({
      data: {
        timeSlotId: slot2.id,
        applicationId: app6.id,
        userId: applicant4.id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });
    reservations.push(r2);

    // ── Test Reservations for Claim Processing ───────────────────
    // Get second schedule for additional test reservations
    if (schedules.length > 1 && schedules[1].timeSlots.length > 0) {
      const testSlot1 = schedules[1].timeSlots[0]; // 08:00-09:00
      const testSlot2 = schedules[1].timeSlots[1]; // 09:00-10:00

      const r3 = await prisma.slotReservation.create({
        data: {
          timeSlotId: testSlot1.id,
          applicationId: appEndorsed1.id,
          userId: applicant1.id,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });
      reservations.push(r3);

      // r4 is commented out — appEndorsed2 is no longer created
      // const r4 = await prisma.slotReservation.create({
      //   data: {
      //     timeSlotId: testSlot2.id,
      //     applicationId: appEndorsed2.id,
      //     userId: applicant2.id,
      //     status: "CONFIRMED",
      //     confirmedAt: new Date(),
      //   },
      // });
      // reservations.push(r4);
    }
  }

  console.log(`  ✓ Created ${reservations.length} slot reservations`);
>>>>>>> Stashed changes

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
    // Mayor's Permit Fee Schedule from data-for-system.md
    {
      key: "mayors_permit_fees",
      value: JSON.stringify({
        1: { category: "Manufacturers / Importers / Producers", fees: { "Micro": 200, "Cottage A": 400, "Cottage B": 650, "Small A": 1800, "Small B": 3000, "Medium": 4000, "Large": 6000 } },
        2: { category: "Banks", fees: { "Rural/Thrift/Savings": 4000, "Commercial/Development": 6000, "Universal": 8000 } },
        3: { category: "Other Financial Institutions", fees: { "Micro": 1000, "Cottage": 3000, "Small": 4000, "Medium": 5000, "Large": 6000 } },
        4: { category: "Contractors and Service Providers", fees: { "Micro": 250, "Cottage A": 500, "Cottage B": 1000, "Small A": 1500, "Small B": 3000, "Medium": 4000, "Large": 6000 } },
        5: { category: "Wholesalers / Retailers / Dealers / Distributors", fees: { "Micro": 200, "Cottage A": 500, "Cottage B": 1200, "Small A": 2500, "Small B": 3500, "Medium": 5000, "Large": 6000 } },
        6: { category: "Transportation Operations", fees: { "Small-Scale": 4000, "Medium-Scale": 6000, "Large-Scale": 10000 } },
        7: { category: "Communications", fees: { "Micro": 500, "Cottage": 1500, "Small": 3000, "Medium": 5000, "Large": 8000 } },
        8: { category: "Lessors of Real Estate - Land", fees: { "Micro": 500, "Cottage": 1000, "Small": 1500, "Medium": 2500, "Large": 4000 } },
        "8b": { category: "Lessors of Real Estate - Commercial Buildings", fees: { "Micro": 500, "Cottage": 1000, "Small": 2000, "Medium": 3000, "Large": 5000 } },
        9: { category: "Hotels, Motels, Pension Houses, Apartelles", fees: { "Cottage": 800, "Small": 1500, "Medium": 2500, "Large": 4000 } },
        10: { category: "Lodging / Boarding Houses", fees: { "Micro": 300, "Cottage": 500, "Small": 800, "Medium": 1200, "Large": 2000 } },
        11: { category: "Amusement Places", fees: { "Micro": 300, "Cottage": 500, "Small": 1000, "Medium": 2000, "Large": 3000 } },
        12: { category: "Restaurants, Cafés, Catering Services", fees: { "Micro": 300, "Cottage": 500, "Small": 1000, "Medium": 2000, "Large": 3000 } },
        13: { category: "Liquor and Tobacco Businesses", surcharge: 1.25, note: "Add 25% to base fee" },
        14: { category: "Power Companies / Hydropower Plants", flatFee: 10000 },
        15: { category: "Power Generation and Distribution", flatFee: 10000 },
        16: { category: "Other Industrial Companies", fees: { "Small": 3000, "Medium": 5000, "Large": 10000 } },
        17: { category: "Private Ports / Wharves", flatFee: 50000 },
      }),
      type: "json",
    },
    // Asset and worker brackets for fee calculation
    {
      key: "fee_calculation_brackets",
      value: JSON.stringify({
        assetBrackets: [
          { name: "Micro", min: 0, max: 99999 },
          { name: "Cottage A", min: 100000, max: 250000 },
          { name: "Cottage B", min: 250001, max: 500000 },
          { name: "Small A", min: 500001, max: 2000000 },
          { name: "Small B", min: 2000001, max: 5000000 },
          { name: "Medium", min: 5000001, max: 20000000 },
          { name: "Large", min: 20000001, max: null },
        ],
        workerBrackets: [
          { name: "None", min: 0, max: 0 },
          { name: "Micro", min: 1, max: 5 },
          { name: "Cottage A", min: 6, max: 10 },
          { name: "Cottage B", min: 11, max: 50 },
          { name: "Small A", min: 51, max: 99 },
          { name: "Small B", min: 100, max: 150 },
          { name: "Large", min: 200, max: null },
        ],
      }),
      type: "json",
    },
    // Processing and filing fees for applications
    {
      key: "application_fees",
      value: JSON.stringify({
        processingFee: 1500,
        filingFee: 1000,
      }),
      type: "json",
    },
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
<<<<<<< Updated upstream
    { userId: applicant2.id, action: "CREATE_APPLICATION", entity: "Application", entityId: app3.id },
=======
    // Removed applicant2 (Pedro) action logs — he's a NEW APPLICANT with no applications
    { userId: applicant4.id, action: "REGISTER", entity: "User", entityId: applicant4.id },
    { userId: applicant4.id, action: "CREATE_APPLICATION", entity: "Application", entityId: app6.id },
    { userId: applicant4.id, action: "UPLOAD_DOCUMENTS", entity: "Application", entityId: app6.id, details: { count: 3 } },
    { userId: applicant4.id, action: "SUBMIT_APPLICATION", entity: "Application", entityId: app6.id },
    { userId: staff.id, action: "DOCUMENT_VERIFIED", entity: "Document", entityId: app6.id, details: { documentsVerified: 3 } },
    { userId: reviewer.id, action: "REVIEW_APPROVE", entity: "Application", entityId: app6.id },
    { userId: applicant4.id, action: "CLAIM_REFERENCE_GENERATED", entity: "ClaimReference", entityId: app6.id },
    { userId: applicant4.id, action: "SLOT_RESERVED", entity: "SlotReservation", entityId: app6.id },
    { userId: staff.id, action: "PERMIT_ISSUED", entity: "Permit", entityId: app6.id },
    { userId: admin.id, action: "ADMIN_UPDATE_USER", entity: "User", entityId: applicant4.id, details: { changes: ["role"] } },
>>>>>>> Stashed changes
  ];

  for (const log of logs) {
    await prisma.activityLog.create({ data: log });
  }
  console.log(`  ✓ Created ${logs.length} activity logs`);

<<<<<<< Updated upstream
  console.log("\n✅ Database seeded successfully!");
  console.log("\n📌 Test Credentials:");
  console.log("  Admin:      admin@lgu.gov.ph       / Password123!");
  console.log("  Reviewer:   reviewer@lgu.gov.ph    / Password123!");
  console.log("  Staff:      staff@lgu.gov.ph       / Password123!");
  console.log("  Applicant:  juan@example.com       / Password123!");
  console.log("  Applicant:  pedro@example.com      / Password123!");
  console.log("  Pending:    ana@example.com         / Password123!");
=======
  // ── OTP Tokens ─────────────────────────────────────────────────────
  console.log("🔐 Creating OTP tokens...");

  const otpEntries = [
    {
      userId: applicant3.id,
      token: "123456",
      type: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
    {
      userId: applicant1.id,
      token: "654321",
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  ];

  for (const entry of otpEntries) {
    await prisma.otpToken.create({ data: entry });
  }
  console.log(`  ✓ Created ${otpEntries.length} OTP tokens`);

  // ── Payments ───────────────────────────────────────────────────────
  console.log("💳 Creating payment records...");

  // Existing paid payments
  await prisma.payment.create({
    data: {
      applicationId: app1.id,
      payerId: applicant1.id,
      amount: 5000,
      method: "GCASH",
      status: "PAID",
      referenceNumber: "REF-GCH-20260120-001",
      transactionId: "TXN-GCH-001",
      paidAt: new Date("2026-01-20"),
    },
  });

  await prisma.payment.create({
    data: {
      applicationId: app6.id,
      payerId: applicant4.id,
      amount: 3500,
      method: "MAYA",
      status: "PAID",
      referenceNumber: "REF-MAY-20260211-001",
      transactionId: "TXN-MAY-001",
      paidAt: new Date("2026-02-11"),
    },
  });

  // PENDING payment (ready to process)
  const pendingPayment = await prisma.payment.create({
    data: {
      applicationId: app2.id,
      payerId: applicant1.id,
      amount: 5000,
      method: "BANK_TRANSFER",
      status: "PENDING",
      referenceNumber: "REF-BNK-20260215-001",
    },
  });

  // ── Payment Test Data for /api/payments route ───────────────────────
  console.log("🧪 Creating payment test data for route testing...");

  // Pending payment for endorsed app 1
  const testPayment1 = await prisma.payment.create({
    data: {
      applicationId: appEndorsed1.id,
      payerId: applicant1.id,
      amount: 6500,
      method: "GCASH",
      status: "PENDING",
      referenceNumber: "REF-TEST-GCH-001",
      metadata: {
        businessName: appEndorsed1.businessName,
        applicationType: "NEW",
        businessType: appEndorsed1.businessType,
        permitFee: 4000,
        processingFee: 1500,
        filingFee: 1000,
      },
    },
  });

  // testPayment2 is commented out — appEndorsed2 is no longer created (applicant2 has no applications)
  // const testPayment2 = await prisma.payment.create({
  //   data: {
  //     applicationId: appEndorsed2.id,
  //     payerId: applicant2.id,
  //     amount: 6500,
  //     method: "MAYA",
  //     status: "PENDING",
  //     referenceNumber: "REF-TEST-MAYA-001",
  //     transactionId: "TXN-TEST-WEBHOOK-001", // Will be used in webhook test
  //     metadata: {
  //       businessName: appEndorsed2.businessName,
  //       applicationType: "NEW",
  //       businessType: appEndorsed2.businessType,
  //       permitFee: 4000,
  //       processingFee: 1500,
  //       filingFee: 1000,
  //     },
  //   },
  // });

  // Failed payment test is commented out — app3 is no longer created (applicant2 has no applications)
  // await prisma.payment.create({
  //   data: {
  //     applicationId: app3.id,
  //     payerId: applicant2.id,
  //     amount: 6500,
  //     method: "BANK_TRANSFER",
  //     status: "FAILED",
  //     referenceNumber: "REF-TEST-FAILED-001",
  //     failedAt: new Date(),
  //     metadata: {
  //       businessName: app3.businessName,
  //       applicationType: "NEW",
  //       businessType: app3.businessType,
  //       failureReason: "Insufficient funds",
  //     },
  //   },
  // });

  console.log("  ✓ Created 5 payment records (3 paid, 2 pending for testing)");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📌 Test Credentials Summary:");
  console.log("  🔹 NEW Applicant (no permits, cannot access renewal):");
  console.log("     pedro@example.com / Password123!");
  console.log("");
  console.log("  🔹 RENEWAL ELIGIBLE Applicant (has ACTIVE permit, CAN access renewal):");
  console.log("     juan@example.com / Password123!");
  console.log("");
  console.log("  🔹 Other Test Accounts:");
  console.log("     Admin:      admin@lgu.gov.ph       / Password123!");
  console.log("     Reviewer:   reviewer@lgu.gov.ph    / Password123!");
  console.log("     Staff:      staff@lgu.gov.ph       / Password123!");
  console.log("     Applicant:  maria@example.com      / Password123!");
  console.log("     Pending:    ana@example.com         / Password123!");
  console.log("");
  console.log("\n📊 Test Data Summary:");
  console.log("  • 7 test users (4 roles)");
  console.log("  • 4 applications (app1-APPROVED, app2-UNDER_REVIEW, app6-RENEWAL/APPROVED, appEndorsed1-ENDORSED)");
  console.log("  • 8 documents (verified & pending)");
  console.log("  • 3 permits (ACTIVE) - for Juan(app1), Maria(app6), and appEndorsed1");
  console.log("  • 3 claim references (various statuses)");
  console.log("  • 10+ claim schedules with time slots");
  console.log("  • 3+ slot reservations (ready for claim processing)");
  console.log("  • 5 payment records (3 paid, 2 pending for testing)");
  console.log("  • 19 activity logs");
  console.log("");
  console.log("\n🧪 Testing Renewal Access Control:");
  console.log("  ✅ pedro@example.com → Should NOT see 'Renew Permit' in sidebar");
  console.log("     Cannot access /dashboard/renew → redirects with 'No Permits Found'");
  console.log("");
  console.log("  ✅ juan@example.com → Should see 'Renew Permit' in sidebar");
  console.log("     CAN access /dashboard/renew and all renewal sub-pages");
>>>>>>> Stashed changes
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
