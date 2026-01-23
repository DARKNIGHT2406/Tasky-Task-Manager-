# Product Requirements Document (PRD)

## 1. Product Overview
**Product Name (Working):** Employee Task Management System (ETMS)

**Purpose:**
Build a role-based employee management and task tracking system where managers break large work into smaller tasks, assign them to employees, track real-time progress, and evaluate performance over time.

**Core Problem Being Solved:**
Managers lack a simple, centralized way to:
- Distribute work clearly
- Monitor task progress
- Measure employee performance objectively

This system prioritizes **clarity, accountability, and performance tracking**.

---

## 2. Target Users

### 2.1 Manager (Primary User)
- Assign tasks
- Monitor progress
- Manage team
- Analyze performance

### 2.2 Employee (Secondary User)
- View assigned tasks
- Submit completed work
- Track deadlines

---

## 3. User Roles & Permissions

| Feature | Manager | Employee |
|------|--------|---------|
| Login | ✅ | ✅ |
| View Dashboard | ✅ | ❌ |
| Assign Tasks | ✅ | ❌ |
| View Assigned Tasks | ✅ | ✅ |
| Submit Tasks | ❌ | ✅ |
| Approve / Close Tasks | ✅ | ❌ |
| Create/Delete Employees | ✅ | ❌ |
| View Analytics | ✅ | ❌ |

---

## 4. Authentication & Login

### 4.1 Login Page
**Description:**
All users must log in using credentials provided by the manager.

**Fields:**
- Employee ID (unique, system-generated)
- Password

**Rules:**
- Role determined after login (Manager or Employee)
- Invalid credentials show error message
- JWT/session-based authentication

---

## 5. Dashboard (Manager Only)

### 5.1 Dashboard Metrics
The dashboard should show **high-level KPIs**:

1. Total number of employees
2. Total number of tasks assigned
3. Total number of active tasks
4. Task status breakdown:
   - Pending
   - In Progress
   - Submitted
   - Completed

**UI Note:**
- Cards + charts (bar/pie)
- Real-time or near-real-time updates

---

## 6. Project / Task Page (Employee & Manager)

### 6.1 Task Format (Core Requirement)
Each task **must** include:
1. Task title
2. Detailed task description (what exactly needs to be done)
3. Image uploads (optional)
4. Start date (assignment date)
5. End date (deadline)
6. Remaining time indicator
7. Task status
8. Submission action

### 6.2 Deadline Logic (Critical)
Example Logic:
- Task Start Date: 15
- Task End Date: 23
- Current Date: 21
- **System displays:** "2 days remaining"

Rules:
- Countdown must update daily
- If deadline passed → mark task as **Overdue**

### 6.3 Submission Flow (Employee)
1. Employee clicks "Mark as Submitted"
2. Task status → Submitted
3. Manager receives notification
4. Task becomes read-only for employee

### 6.4 Task Review Flow (Manager)
- Manager reviews submission
- Options:
  - Approve & Close Task
  - Reject & Send Back (optional enhancement)

---

## 7. Task Management Page (Manager Only)

### 7.1 Assign Task
**Fields:**
- Task title
- Task description
- Image uploads (optional)
- Assign to (select employee)
- Start date
- End date

### 7.2 Task Overview
Manager can view:
- All assigned tasks
- Filter by employee
- Filter by status
- Sort by deadline

---

## 8. Team Management Page (Manager Only)

### 8.1 Employee List
Shows:
- Employee name
- Employee ID
- Role
- Task count
- Status (active/inactive)

### 8.2 Create Employee
- System generates Employee ID
- Manager sets password
- Default role: Employee

### 8.3 Delete Employee
- Removes employee access
- Tasks reassignment logic (future scope)

**Security Note:**
Passwords must be hashed and never shown in plain text after creation.

---

## 9. Analytics & Performance Page (Manager Only)

### 9.1 Weekly Performance Metrics
- Tasks assigned vs completed
- Average completion time
- Overdue tasks

### 9.2 Monthly Performance Metrics
- Completion rate per employee
- Productivity trends
- Top & bottom performers

**Visualization:**
- Bar charts
- Line graphs

---

## 10. Non-Functional Requirements

### 10.1 Performance
- Page load time < 2 seconds
- Support minimum 500 employees per manager

### 10.2 Security
- Role-based access control (RBAC)
- Encrypted passwords
- Secure APIs

### 10.3 Scalability
- Modular backend
- RESTful API structure

---

## 11. Tech Stack (Suggested – Optional for AI Builder)

- Frontend: React / Next.js
- Backend: Node.js + Express
- Database: MongoDB / PostgreSQL
- Auth: JWT
- File Uploads: Cloud storage

---

## 12. MVP Scope (Strict)

MVP **must include**:
- Login system
- Manager dashboard
- Task assignment
- Task submission & approval
- Team creation/deletion
- Basic analytics

**Nice-to-have (Not MVP):**
- Email notifications
- Task rejection comments
- Employee self-password reset

---

## 13. Success Criteria

The product is successful if:
- Managers can assign and close tasks without confusion
- Employees clearly understand what to do and by when
- Performance data is visible and actionable

---

**End of PRD**

