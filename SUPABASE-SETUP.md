# ✅ Supabase Connection - Successfully Configured

## 🎯 What Was Done

Your **Online Business Permit System** is now successfully connected to **Supabase PostgreSQL**!

### Connection Details

- **Database**: Supabase PostgreSQL 17.6
- **Region**: AWS ap-northeast-2 (Seoul)
- **Project**: postgres.xxqqxicusvhmtubjchft
- **Tables Deployed**: 16 tables (all schema models)

---

## 📝 Understanding the Setup

### What is Supabase?

**Supabase IS PostgreSQL** - it's a managed PostgreSQL database service (similar to how AWS RDS provides managed databases). You don't have two separate databases; Supabase provides your PostgreSQL database.

### Your Configuration (.env)

```env
# Connection Pooling URL (for app runtime - faster, uses PgBouncer)
DATABASE_URL="postgresql://postgres.xxqqxicusvhmtubjchft:CHMSUIS2026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct Connection URL (for migrations - port 6543)
DIRECT_URL="postgresql://postgres.xxqqxicusvhmtubjchft:CHMSUIS2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"

# Supabase API Keys (for using Supabase client SDK features)
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_83uvQ5qNQqomrVDKJ9bBLQ_VHbXjpM6"
SUPABASE_SECRET_KEY="sb_secret_Uzfjs6xw9olnKfWrQH9pNw_nC6ZDeIy"
```

### Port Differences

- **Port 5432**: Connection pooling (PgBouncer) - Use for app queries
- **Port 6543**: Direct connection - Use for migrations

---

## 🗄️ Your Database Schema

Currently deployed tables (16):

| Table | Purpose |
|-------|---------|
| users | User accounts & authentication |
| sessions | Active user sessions |
| otp_tokens | 2FA/OTP tokens |
| activity_logs | Audit trail |
| applications | Business permit applications |
| application_history | Application status changes |
| review_actions | Staff reviews |
| documents | Uploaded files metadata |
| claim_schedules | Appointment scheduling |
| time_slots | Available time slots |
| slot_reservations | Booked appointments |
| claim_references | Claim reference numbers |
| permits | Issued permits |
| permit_issuances | Issuance records |
| payments | Payment transactions |
| system_settings | System configuration |

---

## 🚀 How to Use

### 1. Start Development Server

```bash
cd web
npm run dev
```

Your app will connect to Supabase automatically.

### 2. View Database (Supabase Dashboard)

1. Go to: https://supabase.com/dashboard
2. Select your project: `postgres.xxqqxicusvhmtubjchft`
3. Click "Table Editor" to view/edit data
4. Click "SQL Editor" to run queries

### 3. View Database (Prisma Studio - Local)

```bash
cd web
npm run db:studio
```

Opens a local GUI at http://localhost:5555

### 4. Run Migrations

When you change your Prisma schema:

```bash
cd web
npm run db:generate        # Generate Prisma client
npm run db:migrate:dev     # Create & run migration
```

### 5. Seed Test Data

```bash
cd web
npm run db:seed
```

---

## 🔧 Common Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create a migration (production-ready)
npm run db:migrate:dev

# Deploy migrations (production)
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

---

## 🛡️ Security Notes

### ⚠️ IMPORTANT: Rotate Your Keys!

The credentials in your `.env` file are **exposed in this chat**. You should:

1. Go to Supabase Dashboard → Settings → API
2. Click "Generate new anon key" and "Generate new service key"
3. Update your `.env` file with new keys
4. **Never commit `.env` to Git** (already in .gitignore)

### Database Password

Consider rotating your database password:
1. Supabase Dashboard → Settings → Database
2. Reset database password
3. Update `DATABASE_URL` and `DIRECT_URL` in `.env`

---

## 🔄 How Connection Works

1. **Your Next.js App** → Uses `DATABASE_URL` (port 5432, pooled)
2. **Prisma Migrations** → Uses `DIRECT_URL` (port 6543, direct)
3. **Supabase** → Manages your PostgreSQL database in the cloud

```
┌─────────────────┐
│   Next.js App   │
│  (Port 3000)    │
└────────┬────────┘
         │ DATABASE_URL (pooled)
         ↓
┌─────────────────┐
│  Prisma Client  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐       ┌──────────────────┐
│   Supabase      │────→  │   PostgreSQL     │
│   (PgBouncer)   │       │   Database       │
│   Port 5432     │       │   (Port 6543)    │
└─────────────────┘       └──────────────────┘
         ↑
         │ DIRECT_URL (migrations)
         │
┌─────────────────┐
│ Prisma Migrate  │
└─────────────────┘
```

---

## 📊 Monitoring & Management

### Supabase Dashboard Features

- **Table Editor**: View/edit data visually
- **SQL Editor**: Run custom queries
- **Database**: Connection pooling settings
- **Logs**: Query logs & errors
- **Reports**: Database usage & performance

### Access Dashboard

https://supabase.com/dashboard/project/xxqqxicusvhmtubjchft

---

## ✅ Verification

Connection tested and confirmed:
- ✅ PostgreSQL 17.6 connection successful
- ✅ 16 tables deployed
- ✅ Prisma Client generated
- ✅ Next.js app connects successfully
- ✅ Schema in sync

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## 🆘 Troubleshooting

### "Can't reach database server"
- Check Supabase project is active (not paused)
- Verify connection string in `.env`
- Check your internet connection

### "Password authentication failed"
- Database password may have been reset
- Get new connection string from Supabase Dashboard

### "Too many connections"
- Using `DATABASE_URL` (pooled) for app queries? ✅
- Using `DIRECT_URL` (direct) for migrations? ✅
- Check connection limits in Supabase Dashboard

---

**Last Updated**: 2026-04-06
**Status**: ✅ Active and Working
