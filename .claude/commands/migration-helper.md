# Migration Helper Skill (`/migration-helper`)

**Purpose**: Prisma schema migrations, data transforms, and field evolution.

## Migration Types

### 1. Add New Model
**Steps**:

```prisma
// prisma/schema.prisma
model BusinessReport {
  id        String   @id @default(cuid())
  title     String
  type      String   // QUARTERLY, ANNUAL
  year      Int
  data      Json
  createdAt DateTime @default(now())
}
```

```bash
# Create migration
npx prisma migrate dev --name add_business_report

# Deploy to prod
npx prisma migrate deploy
```

### 2. Add Optional Field (Safe)
**Safe because**: Nullable, won't break existing code

```prisma
model Application {
  id            String  @id @default(cuid())
  businessName  String
  businessType  String? // NEW: Optional
}
```

```bash
npx prisma migrate dev --name add_business_type
```

### 3. Add Required Field (3-step)
**Problem**: Existing rows have NULL for new required field

**Solution**:

```bash
# Step 1: Add nullable
model Application {
  renewalCount  Int? // Add nullable
}
npx prisma migrate dev --name add_renewal_count_nullable

# Step 2: Backfill data
# (manual SQL or application code)
UPDATE application SET renewalCount = 0 WHERE renewalCount IS NULL;

# Step 3: Make required
model Application {
  renewalCount  Int // Remove ?
}
npx prisma migrate dev --name make_renewal_count_required
```

### 4. Add Index
**For performance** on frequently filtered columns

```prisma
model Application {
  id         String @id @default(cuid())
  applicantId String
  status     String
  createdAt  DateTime @default(now())

  @@index([applicantId, status]) // Composite index
}
```

```bash
npx prisma migrate dev --name add_application_indexes
```

### 5. Add Relation
**Create foreign key link** between models

```prisma
// Before
model Document {
  id   String @id @default(cuid())
  name String
}

// After
model Document {
  id            String  @id @default(cuid())
  name          String
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id])
}

model Application {
  // ...
  documents     Document[]
}
```

```bash
npx prisma migrate dev --name add_document_application_relation
```

### 6. Rename Field
**Requires custom SQL**

```sql
ALTER TABLE "Application" RENAME COLUMN "applicantId" TO "userId";
```

Then update schema and generate new migration

### 7. Change Field Type
**Requires data transform**

```bash
# Step 1: New field with desired type
ALTER TABLE application ADD COLUMN statusNew VARCHAR(50);

# Step 2: Copy and transform data
UPDATE application SET statusNew = status;

# Step 3: Drop old column
ALTER TABLE application DROP COLUMN status;

# Step 4: Rename new column
ALTER TABLE application RENAME COLUMN statusNew TO status;
```

## Migration Workflow

```bash
# Local development
npm run db:migrate:dev -- --name [description]

# Preview SQL
npx prisma migrate diff --from-empty --to-schema-datamodel

# Production deployment
npx prisma migrate deploy

# Validate schema
npx prisma validate

# View schema status
npx prisma migrate status
```

## Best Practices

1. **Name migrations clearly**: `add_business_type`, not `migration_2026`
2. **One change per migration**: Easier to debug
3. **Test locally first**: `npm run db:migrate:dev`
4. **Backup production**: Before deploying migration
5. **Plan required fields**: Use nullable, then backfill, then make required
6. **Add indexes gradually**: Don't block production during index creation
7. **No breaking changes**: Always maintain backwards compatibility

## Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back [migration_name]
```

## Schema Validation

```bash
npx prisma validate
npm run typecheck
```

## Common Errors

**"Column does not exist"**: Migration not applied yet
**"Cannot add NOT NULL column"**: Data already exists, use nullable first
**"Foreign key constraint"**: Referenced model doesn't exist yet

