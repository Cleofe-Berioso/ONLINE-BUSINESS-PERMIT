# HoardNest Codebase Cleanup Skill

## Purpose

Comprehensive cleanup skill for maintaining code quality, removing migration artifacts, archiving deprecated files, and optimizing the HoardNest codebase.

## Cleanup Categories

### 1. Migration Artifacts

Files created during the Firebase → PostgreSQL migration that are no longer needed.

**Backup Files (\*.backup)**

```
Location: src/**/*.backup
Purpose: Pre-migration backups of modified files
Action: Archive to archives/migration-temp-files/
Count: ~12 files
```

**Migration Temp Files (\*.new.ts)**

```
Location: src/**/*.new.ts
Purpose: Temporary files during migration process
Action: Archive to archives/migration-temp-files/
Count: ~90 files
```

**Firebase Backup Files**

```
Location: Various, already in archives/firebase-backups/
Purpose: Firebase-specific service implementations
Status: Already archived (19 files)
```

### 2. Debug Statements

Console.log statements that should be removed or converted to proper logging.

**Files with Debug Console.logs:**

- `src/components/rider/EarningsTracker.tsx` - 12+ DEBUG statements
- `src/pages/QARiderPage.tsx` - 15+ fetch debugging logs
- `src/components/EditItemModal.tsx` - 10+ operation logs
- `src/pages/SignupPage.tsx` - Registration flow logs
- `src/pages/LoginPage.tsx` - Login process logs
- `src/pages/admin/FinancialManagementPage.tsx` - 15+ metric logs
- `src/components/rider/QuickActions.tsx` - Status/feedback logs
- `src/dashboard/MyOrders.tsx` - Order operation logs

**Action:**

- Review each console.log for necessity
- Convert important logs to proper logging service
- Remove development-only debug statements

### 3. TODO/FIXME Comments

Outstanding tasks marked in code that need resolution.

**Known TODOs:**

- `src/pages/UpdateDeliveryPage.tsx:92` - "Backend needs a proper updateOrder endpoint"
- `src/pages/DashboardPage.tsx:184` - "Replace with actual API call when notifications endpoint is ready"

**Action:**

- Grep for TODO:|FIXME:|HACK:|XXX:
- Create issues for each outstanding item
- Track in project backlog

### 4. Root Cleanup Scripts

PowerShell scripts used for cleanup that may be consolidated.

**Scripts:**

```
cleanup-archive.ps1      - Archive backup files
cleanup-delete.ps1       - Delete archived files
cleanup-execute-phase4.ps1
cleanup-organize-docs.ps1
cleanup-phase5-analysis.ps1
cleanup-phase5-progress.ps1
cleanup-phase5.3-simple-components.ps1
cleanup-review-duplicates.ps1
cleanup-verify-phase4.ps1
cleanup-verify.ps1
```

**Action:**

- Review for consolidation
- Archive completed phase scripts to archives/
- Keep only active/reusable scripts

### 5. Build Artifacts

Generated files that should not be in version control.

**Locations:**

```
build/          - Production build output
node_modules/   - Dependencies (in .gitignore)
*.log           - Log files
```

### 6. Documentation Cleanup

Outdated or redundant documentation files.

**Potential Candidates:**

- Phase-specific docs (PHASE1_COMPLETE.md, etc.) - Archive after migration
- CLEANUP_RESULTS.md - May be outdated
- Multiple migration status files

---

## Cleanup Commands

### Quick Scan - List All Artifacts

```powershell
# Find all backup files
Get-ChildItem -Path src -Recurse -Filter "*.backup" | Select-Object FullName

# Find all migration temp files
Get-ChildItem -Path src -Recurse -Filter "*.new.ts" | Select-Object FullName

# Find console.log statements
Select-String -Path "src/**/*.tsx","src/**/*.ts" -Pattern "console\.log" -Recurse | Measure-Object

# Find TODO comments
Select-String -Path "src/**/*.tsx","src/**/*.ts" -Pattern "TODO:|FIXME:|HACK:|XXX:" -Recurse
```

### Archive Backup Files

```powershell
# Create archive directory if needed
New-Item -ItemType Directory -Force -Path "archives/migration-temp-files/backup-files"

# Move backup files
Get-ChildItem -Path src -Recurse -Filter "*.backup" | ForEach-Object {
    $dest = "archives/migration-temp-files/backup-files/$($_.Name)"
    Move-Item $_.FullName $dest -Force
    Write-Host "Archived: $($_.Name)"
}
```

### Archive Migration Temp Files

```powershell
# Create archive directory if needed
New-Item -ItemType Directory -Force -Path "archives/migration-temp-files/new-ts-files"

# Move .new.ts files (CAUTION: verify they're not in use)
Get-ChildItem -Path src -Recurse -Filter "*.new.ts" | ForEach-Object {
    # Only archive if corresponding .ts file exists
    $baseFile = $_.FullName -replace '\.new\.ts$', '.ts'
    if (Test-Path $baseFile) {
        $dest = "archives/migration-temp-files/new-ts-files/$($_.Name)"
        Move-Item $_.FullName $dest -Force
        Write-Host "Archived: $($_.Name)"
    } else {
        Write-Host "SKIP (no base file): $($_.Name)"
    }
}
```

### Remove Console.log Statements (Interactive)

```powershell
# List files with console.log for review
$files = Select-String -Path "src/**/*.tsx","src/**/*.ts" -Pattern "console\.log" -Recurse |
    Group-Object Path |
    Select-Object Name, Count |
    Sort-Object Count -Descending

$files | Format-Table -AutoSize
```

### Cleanup Root Scripts

```powershell
# Archive completed phase scripts
$phaseScripts = @(
    "cleanup-execute-phase4.ps1",
    "cleanup-verify-phase4.ps1",
    "cleanup-phase5-analysis.ps1",
    "cleanup-phase5-progress.ps1",
    "cleanup-phase5.3-simple-components.ps1"
)

New-Item -ItemType Directory -Force -Path "archives/cleanup-scripts"

foreach ($script in $phaseScripts) {
    if (Test-Path $script) {
        Move-Item $script "archives/cleanup-scripts/$script" -Force
        Write-Host "Archived: $script"
    }
}
```

---

## Cleanup Verification

### Pre-Cleanup Checklist

- [ ] All tests pass before cleanup
- [ ] Application builds successfully
- [ ] No uncommitted changes in git
- [ ] Backup branch created

### Post-Cleanup Verification

```powershell
# 1. Verify TypeScript compiles
npx tsc --noEmit

# 2. Verify build works
npm run build

# 3. Run tests
npm test

# 4. Check for import errors
npm run lint

# 5. Verify archive structure
Get-ChildItem archives -Recurse | Measure-Object
```

---

## Safe Cleanup Workflow

### Phase 1: Scan & Report

1. Run quick scan commands
2. Document counts of each artifact type
3. Review for any files that shouldn't be cleaned

### Phase 2: Create Backup Branch

```powershell
git checkout -b cleanup/$(Get-Date -Format "yyyy-MM-dd")
git add .
git commit -m "Pre-cleanup snapshot"
```

### Phase 3: Archive (Don't Delete)

1. Move files to archives/ (not delete)
2. Commit archives separately
3. Verify application still works

### Phase 4: Verify & Commit

1. Run all verification commands
2. If passing, commit cleanup changes
3. If failing, restore from backup branch

### Phase 5: Optional Deletion

Only after verification:

```powershell
# Delete archived files (ONLY AFTER VERIFICATION)
# Remove-Item -Path "archives/migration-temp-files" -Recurse -Force
```

---

## Integration with Existing Scripts

### cleanup-archive.ps1

Use for: Archiving firebase-backup files and .new files
Location: Project root

### cleanup-verify.ps1

Use for: Verification after cleanup
Location: Project root

### cleanup-delete.ps1

Use for: Final deletion after verification
Location: Project root

---

## Priority Cleanup Tasks

### High Priority (Do First)

1. ✅ Archive .backup files (12 files) - Safe, low risk
2. ⚠️ Review .new.ts files (90 files) - Verify not in use first
3. 📝 Document TODO items - Create tracking issues

### Medium Priority

4. 🧹 Clean console.log DEBUG statements
5. 📦 Archive phase-specific scripts
6. 📚 Organize documentation

### Low Priority (Future)

7. 🗑️ Delete verified archives (after 30 days)
8. 📊 Add proper logging service
9. 🔧 Consolidate cleanup scripts

---

## Usage Examples

### Example 1: Quick Cleanup Report

```
User: "Show me what needs cleanup"
Action: Run quick scan commands, present summary
```

### Example 2: Archive Migration Files

```
User: "Archive all the .backup files from the migration"
Action:
1. List all .backup files
2. Confirm with user
3. Move to archives/migration-temp-files/backup-files/
4. Verify TypeScript still compiles
```

### Example 3: Clean Debug Logs

```
User: "Remove console.log statements from EarningsTracker"
Action:
1. Read EarningsTracker.tsx
2. Identify debug console.logs
3. Remove or convert to proper logging
4. Verify component still works
```

### Example 4: Full Cleanup Cycle

```
User: "Run a full codebase cleanup"
Action:
1. Create backup branch
2. Run all scans
3. Present findings
4. Archive artifacts with user confirmation
5. Verify and commit
```

---

## Notes

- Always archive before deleting
- Never auto-delete without user confirmation
- Run verification after each cleanup phase
- Keep archives for at least 30 days
- Document what was cleaned and why
