const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function check() {
  const adapter = new PrismaPg({
    connectionString: "postgresql://postgres:cleo2004@localhost:5432/business_permit?schema=public",
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const users    = await prisma.$queryRawUnsafe("SELECT COUNT(*)::int as c FROM users");
    const apps     = await prisma.$queryRawUnsafe("SELECT COUNT(*)::int as c FROM applications");
    const permits  = await prisma.$queryRawUnsafe("SELECT COUNT(*)::int as c FROM permits");
    const docs     = await prisma.$queryRawUnsafe("SELECT COUNT(*)::int as c FROM documents");
    const claims   = await prisma.$queryRawUnsafe("SELECT COUNT(*)::int as c FROM claim_references");
    const settings = await prisma.$queryRawUnsafe("SELECT COUNT(*)::int as c FROM system_settings");
    const logs     = await prisma.$queryRawUnsafe("SELECT COUNT(*)::int as c FROM activity_logs");

    console.log("DATABASE STATUS CHECK");
    console.log("=".repeat(40));
    console.log("users            :", users[0].c,    users[0].c    > 0 ? "OK" : "EMPTY");
    console.log("applications     :", apps[0].c,     apps[0].c     > 0 ? "OK" : "EMPTY");
    console.log("permits          :", permits[0].c,  permits[0].c  > 0 ? "OK" : "EMPTY");
    console.log("documents        :", docs[0].c,     docs[0].c     > 0 ? "OK" : "EMPTY");
    console.log("claim_references :", claims[0].c,   claims[0].c   > 0 ? "OK" : "EMPTY");
    console.log("system_settings  :", settings[0].c, settings[0].c > 0 ? "OK" : "EMPTY");
    console.log("activity_logs    :", logs[0].c,     logs[0].c     > 0 ? "OK" : "EMPTY");
    console.log("=".repeat(40));

    const allGood = [users,apps,permits,docs,claims,settings,logs].every(r => r[0].c > 0);
    if (allGood) {
      console.log("RESULT: Database is NOT empty - all tables have data");
    } else {
      console.log("RESULT: Some tables are EMPTY - run: npm run db:seed");
    }

    const userList = await prisma.$queryRawUnsafe("SELECT email, role, status FROM users ORDER BY role");
    console.log("\nUSERS:");
    userList.forEach(u => console.log(" ", u.role.padEnd(15), u.email.padEnd(32), u.status));

    await prisma.$disconnect();
  } catch (e) {
    console.log("ERROR:", e.message);
    await prisma.$disconnect();
  }
}
check().then(() => process.exit(0));
