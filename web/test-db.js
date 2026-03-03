const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  console.log("=== DATABASE CONNECTION TEST ===\n");

  try {
    const adapter = new PrismaPg({
      connectionString:
        "postgresql://postgres:cleo2004@localhost:5432/business_permit?schema=public",
    });
    const prisma = new PrismaClient({ adapter });

    // Test 1: Basic connection
    const result = await prisma.$queryRawUnsafe("SELECT 1 as connected");
    console.log("✅ Step 1: Database connection OK");

    // Test 2: Count users
    const users = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*)::int as count FROM users"
    );
    console.log("✅ Step 2: Users table OK — " + users[0].count + " users found");

    // Test 3: Count applications
    const apps = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*)::int as count FROM applications"
    );
    console.log("✅ Step 3: Applications table OK — " + apps[0].count + " applications found");

    // Test 4: Count permits
    const permits = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*)::int as count FROM permits"
    );
    console.log("✅ Step 4: Permits table OK — " + permits[0].count + " permits found");

    // Test 5: List all users
    const userList = await prisma.$queryRawUnsafe(
      "SELECT email, role, status FROM users ORDER BY role, email"
    );
    console.log("\n📋 All Users in Database:");
    console.log("   " + "ROLE".padEnd(16) + "EMAIL".padEnd(30) + "STATUS");
    console.log("   " + "-".repeat(60));
    userList.forEach((u) => {
      console.log(
        "   " + u.role.padEnd(16) + u.email.padEnd(30) + u.status
      );
    });

    // Test 6: Count all tables
    const tables = await prisma.$queryRawUnsafe(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log("\n📊 All Tables (" + tables.length + "):");
    tables.forEach((t) => console.log("   ✅ " + t.tablename));

    await prisma.$disconnect();
    console.log("\n🎉 RESULT: Database is fully connected and working!");
    console.log("   You can view this data in pgAdmin 4 under:");
    console.log("   Servers > PostgreSQL 18 > Databases > business_permit > Schemas > public > Tables");
  } catch (error) {
    console.log("❌ CONNECTION FAILED\n");
    console.log("Error:", error.message);
    console.log("\n🔧 What to do:");

    if (error.message.includes("password authentication")) {
      console.log("   → Your password is wrong. Update it in web/.env");
    } else if (error.message.includes("does not exist")) {
      console.log("   → Database 'business_permit' doesn't exist.");
      console.log("   → Create it in pgAdmin 4 or run:");
      console.log('     psql -U postgres -c "CREATE DATABASE business_permit;"');
    } else if (error.message.includes("ECONNREFUSED") || error.message.includes("connect")) {
      console.log("   → PostgreSQL is not running.");
      console.log("   → Open Services (Win+R → services.msc)");
      console.log("   → Find 'postgresql-x64-18' → Click Start");
    } else if (error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("   → Tables don't exist yet. Run:");
      console.log("     npx prisma db push");
      console.log("     npm run db:seed");
    } else {
      console.log("   → Unexpected error. Check your .env file and PostgreSQL service.");
    }

    process.exit(1);
  }
}

testConnection().then(() => process.exit(0)).catch(() => process.exit(1));
