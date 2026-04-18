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
  await prisma.clearance.deleteMany();
  await prisma.clearanceOffice.deleteMany();
  await prisma.reviewAction.deleteMany();
  await prisma.applicationHistory.deleteMany();
  await prisma.document.deleteMany();
  await prisma.application.deleteMany();
  await prisma.payment.deleteMany();
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

  const applicant4 = await prisma.user.create({
    data: {
      email: "maria@example.com",
      password,
      firstName: "Maria",
      lastName: "Gonzales",
      phone: "09231234567",
      role: "APPLICANT",
      status: "ACTIVE",
      emailVerified: new Date(),
      /* RENEWAL ELIGIBLE APPLICANT - Has ACTIVE permit, can access renewal portal */
    },
  });

  console.log(`  ✓ Created ${7} users`);

  // ── ClearanceOffice ────────────────────────────────────────────────────
  console.log("🏢 Creating clearance offices...");

  const offices = await Promise.all([
    prisma.clearanceOffice.create({
      data: {
        code: "SANITARY",
        name: "Department of Health - Sanitary Division",
        description: "Health and sanitation clearance for food and beverage businesses",
        applicationTypes: ["NEW", "RENEWAL"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "ZONING",
        name: "City Planning & Development Office - Zoning Division",
        description: "Zoning compliance and land use verification (NEW applications only per DFD P3.2)",
        applicationTypes: ["NEW"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "ENVIRONMENT",
        name: "Department of Environment & Natural Resources - Environmental Compliance",
        description: "Environmental impact assessment and compliance (NEW applications only per DFD P3.2)",
        applicationTypes: ["NEW"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "ENGINEERING",
        name: "City Engineering Office - Building Compliance",
        description: "Building structural and safety compliance",
        applicationTypes: ["NEW", "RENEWAL"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "BFP_FIRE",
        name: "Bureau of Fire Protection - Fire Safety",
        description: "Fire safety certificate and compliance",
        applicationTypes: ["NEW", "RENEWAL"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "RPT_CLEARANCE",
        name: "City Treasurer's Office - Real Property Tax",
        description: "Real property tax clearance (CLOSURE clearance required per DFD: Process 3.2)",
        applicationTypes: ["NEW", "RENEWAL", "CLOSURE"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "MARKET",
        name: "Market Regulatory Office - Market Compliance",
        description: "Market stall and operations compliance for market vendors",
        applicationTypes: ["NEW", "RENEWAL"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "AGRICULTURE",
        name: "City Agriculture Office - Agricultural Compliance",
        description: "Farm, garden, and agricultural operations compliance",
        applicationTypes: ["NEW", "RENEWAL"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "MTO",
        name: "Municipal Treasurer's Office",
        description: "Payment verification and outstanding fee assessment (DFD P6.2.3 & P3.2)",
        applicationTypes: ["NEW", "RENEWAL", "CLOSURE"],
        isActive: true,
      },
    }),
    prisma.clearanceOffice.create({
      data: {
        code: "ASSESSOR",
        name: "Municipal Assessor's Office",
        description: "Property and asset valuation clearance (DFD P3.2)",
        applicationTypes: ["NEW", "RENEWAL"],
        isActive: true,
      },
    }),
  ]);

  console.log(`  ✓ Created ${offices.length} clearance offices`);

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

  console.log("  ✓ Created 1 ENDORSED application (ready for payment)");
  console.log(`  ✓ Created ${4} applications`);

  // ── Application History ────────────────────────────────────────────
  console.log("📜 Creating application history...");

  const historyEntries = [
    { applicationId: app1.id, newStatus: "DRAFT", comment: "Application created", changedBy: applicant1.id },
    { applicationId: app1.id, previousStatus: "DRAFT", newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant1.id },
    { applicationId: app1.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Under review by staff", changedBy: staff.id },
    { applicationId: app1.id, previousStatus: "UNDER_REVIEW", newStatus: "APPROVED", comment: "Application approved. All requirements met.", changedBy: reviewer.id },
    { applicationId: app2.id, newStatus: "SUBMITTED", comment: "Application submitted", changedBy: applicant1.id },
    { applicationId: app2.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Under review", changedBy: staff.id },
    { applicationId: app6.id, newStatus: "SUBMITTED", comment: "Renewal submitted", changedBy: applicant4.id },
    { applicationId: app6.id, previousStatus: "SUBMITTED", newStatus: "UNDER_REVIEW", comment: "Renewal under review", changedBy: staff.id },
    { applicationId: app6.id, previousStatus: "UNDER_REVIEW", newStatus: "APPROVED", comment: "Renewal approved. All documents verified.", changedBy: reviewer.id },
  ];

  for (const entry of historyEntries) {
    await prisma.applicationHistory.create({ data: entry });
  }
  console.log(`  ✓ Created ${historyEntries.length} history entries`);

  // ── Documents ──────────────────────────────────────────────────────
  console.log("📄 Creating documents...");

  const docs = [
    { applicationId: app1.id, uploadedBy: applicant1.id, fileName: "dti_cert.pdf", originalName: "DTI Certificate.pdf", mimeType: "application/pdf", fileSize: 524288, filePath: "uploads/app1/dti_cert.pdf", documentType: "PROOF_OF_REGISTRATION", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-01-19") },
    { applicationId: app1.id, uploadedBy: applicant1.id, fileName: "brgy_clearance.pdf", originalName: "Barangay Clearance.pdf", mimeType: "application/pdf", fileSize: 312000, filePath: "uploads/app1/brgy_clearance.pdf", documentType: "BARANGAY_CLEARANCE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-01-19") },
    { applicationId: app1.id, uploadedBy: applicant1.id, fileName: "fire_cert.pdf", originalName: "Fire Safety Certificate.pdf", mimeType: "application/pdf", fileSize: 410000, filePath: "uploads/app1/fire_cert.pdf", documentType: "FSIC", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-01-19") },
    { applicationId: app2.id, uploadedBy: applicant1.id, fileName: "dti_cert2.pdf", originalName: "DTI Certificate.pdf", mimeType: "application/pdf", fileSize: 530000, filePath: "uploads/app2/dti_cert2.pdf", documentType: "PROOF_OF_REGISTRATION", status: "PENDING_VERIFICATION" },
    { applicationId: app2.id, uploadedBy: applicant1.id, fileName: "brgy_clearance2.pdf", originalName: "Barangay Clearance.pdf", mimeType: "application/pdf", fileSize: 298000, filePath: "uploads/app2/brgy_clearance2.pdf", documentType: "BARANGAY_CLEARANCE", status: "UPLOADED" },
    { applicationId: app6.id, uploadedBy: applicant4.id, fileName: "dti_renewal.pdf", originalName: "DTI Renewal Certificate.pdf", mimeType: "application/pdf", fileSize: 520000, filePath: "uploads/app6/dti_renewal.pdf", documentType: "PROOF_OF_REGISTRATION", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-02-09") },
    { applicationId: app6.id, uploadedBy: applicant4.id, fileName: "brgy_renewal.pdf", originalName: "Barangay Clearance Renewal.pdf", mimeType: "application/pdf", fileSize: 310000, filePath: "uploads/app6/brgy_renewal.pdf", documentType: "BARANGAY_CLEARANCE", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-02-09") },
    { applicationId: app6.id, uploadedBy: applicant4.id, fileName: "fire_renewal.pdf", originalName: "Fire Safety Certificate Renewal.pdf", mimeType: "application/pdf", fileSize: 405000, filePath: "uploads/app6/fire_renewal.pdf", documentType: "FSIC", status: "VERIFIED", verifiedBy: staff.id, verifiedAt: new Date("2026-02-09") },
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
      applicationId: app6.id,
      reviewerId: reviewer.id,
      action: "APPROVE",
      comment: "Renewal documents verified and complete. Business maintains compliance.",
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

  console.log("  ✓ Created 3 permits with issuance records (2 existing + 1 test)");

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

  console.log("  ✓ Created 3 claim references (2 existing + 1 test)");

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

  const reservations = [];
  if (schedules.length > 0) {
    // Fetch the schedule with timeSlots populated
    const scheduleWithSlots = await prisma.claimSchedule.findUnique({
      where: { id: schedules[0].id },
      include: { timeSlots: true },
    });

    if (scheduleWithSlots && scheduleWithSlots.timeSlots.length > 1) {
      const slot1 = scheduleWithSlots.timeSlots[1]; // 09:00-10:00
      const slot2 = scheduleWithSlots.timeSlots[2]; // 10:00-11:00

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

    if (schedules.length > 1) {
      // Fetch second schedule with timeSlots
      const schedule2WithSlots = await prisma.claimSchedule.findUnique({
        where: { id: schedules[1].id },
        include: { timeSlots: true },
      });

      if (schedule2WithSlots && schedule2WithSlots.timeSlots.length > 0) {
        const testSlot1 = schedule2WithSlots.timeSlots[0]; // 08:00-09:00

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
      }
    }
    }
  }

  console.log(`  ✓ Created ${reservations.length} slot reservations`);

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
  ];

  for (const log of logs) {
    await prisma.activityLog.create({ data: log });
  }
  console.log(`  ✓ Created ${logs.length} activity logs`);

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
  await prisma.payment.create({
    data: {
      applicationId: app2.id,
      payerId: applicant1.id,
      amount: 5000,
      method: "BANK_TRANSFER",
      status: "PENDING",
      referenceNumber: "REF-BNK-20260215-001",
    },
  });

  // Test payment for endorsed app 1
  await prisma.payment.create({
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

  console.log("  ✓ Created 5 payment records (3 paid, 2 pending for testing)");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📌 Test Credentials Summary:");
  console.log("  🔹 NEW Applicant (no permits, cannot access renewal):");
  console.log("     pedro@example.com / Password123!");
  console.log("");
  console.log("  🔹 RENEWAL ELIGIBLE Applicants (have ACTIVE permits, CAN access renewal):");
  console.log("     juan@example.com / Password123!");
  console.log("     maria@example.com / Password123!");
  console.log("");
  console.log("  🔹 Other Test Accounts:");
  console.log("     Admin:      admin@lgu.gov.ph       / Password123!");
  console.log("     Reviewer:   reviewer@lgu.gov.ph    / Password123!");
  console.log("     Staff:      staff@lgu.gov.ph       / Password123!");
  console.log("     Pending:    ana@example.com         / Password123!");
  console.log("");
  console.log("\n📊 Test Data Summary:");
  console.log("  • 7 test users (4 roles)");
  console.log("  • 8 clearance offices (routing per DFD)");
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
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

