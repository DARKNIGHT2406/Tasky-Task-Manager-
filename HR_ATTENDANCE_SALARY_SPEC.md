# HR Attendance & Salary System Specification

**Version:** 1.0  
**Authority:** HR Department ONLY  
**Integration:** TeamPulse Employee Management System  

---

## 1. SYSTEM OVERVIEW
This module provides strict, automated tracking of employee working hours and calculates salaries based on attendance perfromance. It is designed with a **Zero-Trust** approach regarding salary data visibility—only HR has access.

---

## 2. ACCESS CONTROL MATRIX

| Feature | HR | MANAGER | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| **View Own Attendance** | ✅ | ✅ | ✅ |
| **View Others' Attendance** | ✅ (All) | ❌ | ❌ |
| **View Salary Data** | ✅ | ❌ | ❌ |
| **Edit Salary Config** | ✅ | ❌ | ❌ |
| **Receive Late Alerts** | ✅ | ❌ | ❌ |

> [!IMPORTANT]
> **Security Rule:** Salary API endpoints must explicitly check `req.user.role === 'HR'`. Any other role must receive a `403 Forbidden`.

---

## 3. ATTENDANCE MODULE

### A. Logic & Flow
1.  **Auto-Marking (In-Time):**
    - **Trigger**: Valid User Login (Session Start).
    - **Action**: System checks if an attendance record exists for `Today`.
        - **If Missing**: Create new record. Set `in_time` = Current Server Time. Set `status` = 'PRESENT'.
        - **If Exists**: Do nothing (First login is preserved).
2.  **Auto-Update (Out-Time):**
    - **Trigger**: User Logout (Session End).
    - **Action**: Update today's record. Set `out_time` = Current Server Time.

### B. Office Time Rules
- **Official Start Time**: `09:00:00 AM` (Local configuration).
- **Late Condition**: `in_time > 09:00 AM`.
- **Late Duration**: `in_time - 09:00 AM` (in minutes).

### C. Data Structure (Attendance Log)
| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | ObjectId | Reference to User |
| `date` | Date | Normalized to Midnight (YYYY-MM-DD) |
| `in_time` | Timestamp | First login of the day |
| `out_time` | Timestamp | Last logout of the day (Updated on logout) |
| `is_late` | Boolean | True if `in_time` > 09:00 |
| `late_minutes`| Integer | Minutes elapsed after 09:00 |

---

## 4. REAL-TIME NOTIFICATION SYSTEM

### Logic
- **Observer**: Middleware/Hook monitoring the Login process.
- **Condition**: If `is_late === true`.
- **Action**:
    1.  Generate Notification Payload.
    2.  Push to HR Notification Queue immediately.

### Notification Content
- **Recipient**: All HR Admins.
- **Title**: "Late Login Alert"
- **Body**: `[Role] [Name] checked in late by [Minutes] mins at [Time].`
- **Privacy Check**: Must NOT contain salary info.

---

## 5. SALARY MANAGEMENT SYSTEM (HR ONLY)

### A. Salary Data Structure (User Extension)
*These fields are strictly private and visible only to HR.*

| Field | Type | Description |
| :--- | :--- | :--- |
| `base_salary` | Number | Monthly fixed salary |
| `per_day_salary` | Number | `base_salary / 30` (or Configurable days) |
| `per_minute_salary`| Number | `per_day_salary / (Working Hours * 60)` |
| `penalty_rule` | Enum | `FIXED_DEDUCTION` or `PER_MINUTE` |

### B. Calculation Logic
The system allows real-time calculation of "Earned Salary" for the current month.

**Formula:**
```javascript
Total_Payable = 0;

For Each Day in Month:
   If status == PRESENT:
      Daily_Pay = per_day_salary;
      
      If is_late:
          Deduction = (late_minutes * per_minute_salary * penalty_multiplier);
          // or
          Deduction = fixed_late_fee;
          
          Daily_Pay -= Deduction;
          
      Total_Payable += Daily_Pay;
```

---

## 6. HR DASHBOARD SPECIFICATION

### Views
1.  **Attendance Monitor**:
    - **Table Columns**: Date, Name, Role, In Time, Out Time, Late Status (red/green pill), Late Duration.
    - **Filters**: Date Range, Role (Manager/Employee), Search User.

2.  **Salary & Payroll**:
    - **Summary Widgets**: Total Monthly Liability, Total Deductions (Late), Average Late Time.
    - **Payroll Table**: Name, Role, Base Salary, Days Present, Total Late Mins, **Net Payable Salary**.

### Behavior
- **Data Fetching**: All salary-related queries must run through a secured `HR-Only` API route.
- **Export**: Option to download Salary Sheet as CSV (HR Only).

---

## 7. SECURITY & CONSTRAINTS

1.  **Middleware Gatekeeper**:
    - Route `/api/hr/*` requires `session.user.role === 'HR'`.
2.  **Field Exclusion**:
    - API responses for `GET /api/users` (for non-HR) must strictly `.select('-base_salary -per_day_salary')` to exclude salary fields from the JSON response.
3.  **Immutability**:
    - `in_time` cannot be modified by the user once set. Only HR can override (Correction request).
