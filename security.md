# 🔐 Industry‑Level Website Security Specification (AI‑Ready)

## Objective
Build the website using **industry‑grade security best practices**. Security is **non‑negotiable**. Under no circumstances should sensitive data be exposed on the client side. The system must remain secure even if users inspect, modify frontend code, or manually call APIs.

---

## Core Architecture (Mandatory)
**Frontend → Backend → Database**

- Frontend must never access the database directly.
- Frontend must never contain hardcoded users, credentials, roles, hierarchy, or business logic related to authorization.
- All security enforcement happens on the **server and database layer**, not in the UI.

---

## Forbidden Practices (Absolute NO)
- Storing user details or credentials in `script.js` or any client‑side file
- Returning full user lists or hierarchy to the frontend
- Performing role checks or permission logic on the client
- Plain‑text passwords or reversible password encryption
- Exposing internal IDs or admin data via APIs

---

## Authentication Requirements
1. Login uses `user_id + password`.
2. Backend validates credentials using **bcrypt (or equivalent)**.
3. On success, backend issues a **short‑lived access token** (JWT or secure session).
4. Frontend receives **only the token**, never raw user records.

### Token Rules
- Token payload must be **minimal** (e.g., `user_id`, `role`).
- Never include passwords, hierarchy, or permissions list.
- Prefer **HttpOnly, Secure cookies** over localStorage where possible.

---

## Authorization (RBAC — Server‑Side Only)
Roles:
- **HR** → full access
- **Manager** → access limited to own team
- **Employee** → access limited to self and assigned tasks

Rules:
- Authorization checks must happen on **every API request**.
- Even if API calls are tampered with, unauthorized data must never be returned.

---

## API Security Rules
- Every endpoint returns **only the minimum data required** to render the UI.
- Filter data strictly by authenticated user and role.
- Validate and sanitize all inputs.
- Implement rate limiting to protect against brute‑force attacks.

**Golden Rule:**
> A user should never receive data they cannot directly see on their screen.

---

## Database Security
- Passwords: **bcrypt hashing only** (salted, non‑reversible).
- Sensitive fields (hierarchy, internal metadata): **encrypted at rest**.
- No database credentials exposed outside the backend.

---

## Data Transmission Security
- Enforce **HTTPS only**.
- Encrypt or mask sensitive fields in API responses when feasible.
- Never log secrets, tokens, or passwords.

---

## Frontend Responsibilities (Strictly Limited)
- Render UI using data provided by backend.
- Store no sensitive information.
- Perform no authorization decisions.
- Assume frontend code is fully visible and modifiable by attackers.

---

## Threats This Must Prevent
- Inspect Element data leaks
- API abuse via Postman or scripts
- IDOR (Insecure Direct Object Reference)
- Role escalation
- Credential scraping
- Client‑side tampering

---

## End Goal (Security Guarantee)
Even if someone:
- Inspects the website
- Modifies JavaScript
- Calls APIs directly

They must **not** be able to:
- View other users’ data
- Extract credentials or hierarchy
- Bypass role‑based restrictions

Security must be enforced at the **server and database level**, independent of frontend behavior.

---

## Final Instruction to AI
If any part of the implementation violates the above rules, **reject and redesign it**. This security specification defines the minimum acceptable standard for deployment.

