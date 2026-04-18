# God Class Decomposer Skill (`/god-class-decomposer`)

**Purpose**: Break apart large components/modules into focused units.

## Identifying God Classes

**Signs**:
- >500 lines of code
- Handles multiple concerns
- Multiple useState hooks (>5)
- Deep nesting (>3 levels)
- Many imports (>20)

**Find**:
```bash
find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head
```

## Decomposition Strategies

### 1. Extract Hook
```typescript
// Before: Component with complex logic
function ApplicationForm() {
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  // ... validation logic
  // ... submission logic
  // ... 150 lines
}

// After: Custom hook
function useApplicationForm() {
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  // logic
  return { status, errors, handleSubmit };
}

function ApplicationForm() {
  const { status, errors, handleSubmit } = useApplicationForm();
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 2. Extract Component
```typescript
// Before: Large component with sub-sections
function Dashboard() {
  return (
    <div>
      <ApplicationStats />
      <ApplicationList /> {/* 200 lines */}
      <PendingDocuments /> {/* 100 lines */}
    </div>
  );
}

// After: Separate components
function Dashboard() {
  return (
    <div>
      <ApplicationStats />
      <ApplicationListSection />
      <PendingDocumentsSection />
    </div>
  );
}
```

### 3. Extract Utility Module
```typescript
// Before: Logic in component
function ReviewPage() {
  const checkEligibility = (app) => {
    // 50 lines of business logic
  };
}

// After: Library module
// src/lib/eligibility.ts
export function checkEligibility(app) { }

// Component
function ReviewPage() {
  const eligible = checkEligibility(app);
}
```

## Refactoring Example

### Before (600+ lines)
```typescript
export function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  // ... 30 more lines of state
  
  const handleCreate = async () => { /* 30 lines */ };
  const handleUpdate = async () => { /* 40 lines */ };
  const handleDelete = async () => { /* 20 lines */ };
  const handleSearch = () => { /* 30 lines */ };
  
  return (
    <div>
      <SearchBar /> {/* inline */}
      <UserTable /> {/* inline */}
      <UserForm /> {/* inline */}
      <DeleteModal /> {/* inline */}
    </div>
  );
}
```

### After (modular, <150 lines per file)
```typescript
// src/hooks/useUserManagement.ts
export function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const createUser = async (data) => { };
  const updateUser = async (data) => { };
  const deleteUser = async (id) => { };
  
  return { users, selectedUser, createUser, updateUser, deleteUser };
}

// src/components/admin/user-list.tsx
export function UserList({ users, onSelect }) {
  return <table>{/* 50 lines */}</table>;
}

// src/components/admin/user-form.tsx
export function UserForm({ user, onSave }) {
  return <form>{/* 80 lines */}</form>;
}

// src/components/admin/admin-panel.tsx
export function AdminPanel() {
  const { users, selectedUser, createUser, updateUser, deleteUser } = 
    useUserManagement();
  
  return (
    <div>
      <SearchBar />
      <UserList users={users} onSelect={setSelectedUser} />
      <UserForm user={selectedUser} onSave={updateUser} />
    </div>
  );
}
```

## Decomposition Checklist

- [ ] Identify multiple concerns
- [ ] Extract hooks for state logic
- [ ] Extract components for rendering
- [ ] Move business logic to lib/
- [ ] Test each extracted piece
- [ ] Verify types and props

## Commit Structure

```
refactor: decompose God Class pattern

- Extract useApplicationForm hook (state + validation)
- Extract ApplicationFormUI component (rendering)
- Extract application-helpers lib (business logic)
- Remove 250+ lines from ApplicationForm component

Closes #123
```

