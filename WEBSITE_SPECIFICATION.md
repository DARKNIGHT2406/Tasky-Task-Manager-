# TeamPulse - Website Specification Document

**Version:** 1.1  
**Last Updated:** 2026-01-29  

---

## 1. WEBSITE OVERVIEW

### Purpose
TeamPulse is a comprehensive internal tool designed to streamline workforce management. It combines mandatory attendance tracking, hierarchical team management, task assignment, and an open real-time communication system into a single unified platform.

### Problem Solved
Eliminates the disjointed nature of using separate tools for attendance, task tracking, and team messaging. It ensures accountability via mandatory check-ins and structured task flows while fostering collaboration through open communication.

### Target Users
Organizations requiring strict attendance monitoring and structured hierarchy for work management, but an open culture for communication.
- **Primary:** Office Employees, Managers, HR Personnel.

### Core Value
**"Control where needed, Freedom where it counts."**
- **Control:** Strict hierarchy for Tasks and Team Management. Mandatory Attendance.
- **Freedom:** Flat, permission-less Chat system for barrier-free communication.

---

## 2. USER TYPES

### 1. HR / ADMIN
- **Authority:** Top-level.
- **Scope:** System-wide.
- **Responsibilities:** Managing the entire workforce directory, overseeing all managers and employees, analyzing company-wide stats.
- **Access:** Full access to all components.

### 2. MANAGER
- **Authority:** Mid-level (Team specific).
- **Scope:** Direct Reports.
- **Responsibilities:** Creating tasks for employees, managing their own team's roster (add/remove), monitoring team attendance.
- **Access:** Restricted to their own team/direct reports for Management features.

### 3. EMPLOYEE
- **Authority:** None (Individual Contributor).
- **Scope:** Self and Peers (Read-Only).
- **Responsibilities:** Marking daily attendance, completing assigned tasks, communicating via chat.
- **Access:** Read-only access to Team directory (own team only). Write access only for designated Tasks and Chat.

---

## 3. FEATURE LIST (HIGH LEVEL)

1.  **Mandatory Attendance Check**: Users cannot access the dashboard or any feature until they verify their presence via Camera and Location daily.
2.  **Role-Based Dashboard**: Personalized landing page showing relevant metrics (Overview for HR/Managers, Task Summary for Employees).
3.  **Task Management**: A Kanban-style or List-based system to view, update, and manage assigned work items.
4.  **Hierarchical Team Directory**: A strictly controlled view of the organization based on "Reports To" logic.
5.  **Universal Chat System**: A standalone messaging platform allowing unrestricted private and group communication.

---

## 4. PAGE-BY-PAGE BREAKDOWN

### A. Login Page (`/login`)
- **Purpose**: Authenticate users.
- **Access**: Public (Unauthenticated users).
- **Components**: User ID Input, Password Input, Login Button.
- **Action**:
    - **Submit**: Validates credentials. On success, redirects to **Mark Attendance** (if not marked for today).

### B. Mark Attendance Page (`/mark-attendance`)
- **Purpose**: Enforce daily check-in.
- **Access**: Authenticated users who have NOT marked attendance for the current date.
- **Components**:
    - **Webcam View**: Live camera feed.
    - **Location Status**: Shows detected GPS address.
    - **Capture Button**: Takes a photo.
    - **Submit Button**: Uploads photo and location.
- **Rules**:
    - **Gating**: Navigation to any other protected route is **blocked** by middleware until this step is completed.
- **Action**:
    - **Submit**: API verifies data. On success, redirects user to **Dashboard**.

### C. Dashboard (`/dashboard`)
- **Purpose**: Central hub for daily overview.
- **Access**: All Authenticated Users (Gated by Attendance).
- **Components**:
    - **HR/Manager**: Stats widgets (Total Employees, Active Tasks, Pending Approvals), AI Insights.
    - **Employee**: My Pending Tasks summary, Attendance status.

### D. My Tasks (`/my-tasks`)
- **Purpose**: Manage daily work units.
- **Access**: All Authenticated Users (Gated by Attendance).
- **Components**: Task Cards, Status Columns.
- **Action**:
    - **Update Status**: Move task from Pending -> In Progress -> Submitted -> Completed.

### E. Team Page (`/team`)
- **Purpose**: View and Manage Organization Structure.
- **Access**: Authenticated Users (Gated by Attendance).
- **Visibility Rules (Strict Hierarchy)**:
    - **HR**: Sees **everyone**.
    - **Manager**: Sees **only direct reports** (Users where `reports_to` == Manager's ID).
    - **Employee**: Sees **only teammates** (Users where `reports_to` == Their Manager's ID).

### F. Chat Page (`/chat`)
- **Purpose**: Real-time communication.
- **Access**: All Authenticated Users (Gated by Attendance).
- **Core Rule**: **NO HIERARCHY**.
    - Any user can message any other user.
    - Any user can create a group and add any other user.

---

## 5. CHAT SYSTEM (DETAILED)

**Core Philosophy**: "No Hierarchy". Chat is a flat network.

### Features
1.  **One-to-One Chat**:
    - **Connectivity**: Any user can initiate a chat with ANY other user.
2.  **Group Chat**:
    - **Creation**: Any user can create a group using "Create Group".
    - **Roles**: Creator = Admin. Can add/remove members.

### Data
- **Message**: Content (Text), Sender ID, Conversation ID, Timestamp.
- **Conversation**: List of Participant IDs, Group Name (if group).

---

## 6. DATA STRUCTURE (DETAILED SCHEMAS)

### 1. User
- `name`: String (Indexed)
- `user_id`: String (Unique, Required)
- `password`: String (Hashed)
- `role`: **ENUM** `['HR', 'MANAGER', 'EMPLOYEE']`
- `reports_to`: **ObjectId** (Reference to User). Self-reference. `null` for HR/Top-level.

### 2. Attendance
- `user`: **ObjectId** (Reference to User)
- `date`: **Date** (Normalized to midnight UTC)
- `status`: **ENUM** `['PRESENT', 'ABSENT', 'HALF_DAY']`
- `checkInTime`: Date
- `photo`: String (Base64)
- `location`: Object `{ lat, lng, address }`
- **INDEX**: Compound Unique Index on `{ user: 1, date: 1 }` (Prevents duplicate check-ins).

### 3. Task
- `title`: String
- `description`: String
- `assignee`: ObjectId (Reference to User)
- `status`: **ENUM** `['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED']`
- `dueDate`: Date

### 4. Conversation (New)
- `participants`: Array of ObjectIds (Ref: User)
- `isGroup`: Boolean
- `groupName`: String
- `admin`: ObjectId (Ref: User)

### 5. Message
- `conversationId`: ObjectId (Ref: Conversation)
- `sender`: ObjectId (Ref: User)
- `content`: String
- `createdAt`: Date

---

## 7. SECURITY & RULES (GATEKEEPER)

### **Gatekeeper Middleware** (`requireAttendance`)
A strict middleware that runs on all protected API routes (except `/api/attendance` and `/api/auth`).
- **Logic**:
    1.  Check if User is Authenticated.
    2.  Check MongoDB `Attendance` collection for a record matching `{ user: current_user_id, date: today }`.
    3.  **If Found**: Allow request to proceed.
    4.  **If Missing**: Block request immediately.
        - **Status**: `403 Forbidden`
        - **Code**: `ATTENDANCE_REQUIRED`
        - **Action**: Frontend redirects user to `/mark-attendance`.

### Data Integrity
1.  **Role Protection**: `User.role` can only be set to valid ENUM values.
2.  **Duplicate Prevention**: The database strictly prevents multiple attendance records for the same day via Unique Index.
3.  **Manager Scope**: Managers can only add users where `reports_to` is explicitly set to themselves.

---

## 8. FUTURE EXTENSIBILITY

1.  **Rich Media**: Support for images/files in Chat.
2.  **Notifications**: Real-time alerts for Tasks/Chat.
3.  **Advanced Analytics**: Attendance trends.
