# New Dealer Registration And Approval Portal

**Live Demo:** https://new-dealer-registration-approval.vercel.app/

**A simple web app to register new dealers, review them, and approve or reject them.**

> ⏳ **Please note:** The backend is hosted on Render's **free plan**. If nobody uses the app for **15 minutes**, the server goes to sleep. The next person who opens the app has to wait about **40 to 50 seconds** for the first load while the server wakes up. After that, the app is fast again.

---

## User Roles & Permissions

> ### Admin
> Full access to the whole system.
>
> - Register dealers
> - View **all** dealers
> - Approve or reject registrations
> - Invite and manage users
> - Manage dropdown lists (masters)
> - View dashboard and reports

> ### Approver
> Reviews and decides on registrations.
>
> - View **all** dealers
> - Approve or reject registrations

> ### Creator
> Submits new dealer registrations.
>
> - Register dealers
> - View **only their own** dealers

## Approval Workflow

1. A **Creator** (or Admin) registers a new dealer.
2. The registration is saved with status **Pending**.
3. An **Approver** (or Admin) reviews it.
4. The dealer is marked **Approved** or **Rejected**.
---

## 🎯 Case study: how this app meets each requirement

**Use case:** *A Creator registers a new dealer, an Approver validates and approves it, and an Admin manages users, masters and dashboards.*

| # | Requirement | How the app meets it |
|---|---|---|
| 1 | Dealer registration | The Creator fills in the **Register a dealer** form. The new registration starts as **Pending** and gets a code such as `DLR-0001`. |
| 2 | Review and decision | The Approver opens a pending registration and selects **Approve** or **Reject**. A rejection needs a reason of at least 10 characters. |
| 3 | User management | The Admin uses the **Users** page to invite people by email, resend invitations, and deactivate or reactivate accounts. |
| 4 | Master lists | The Admin uses the **Masters** page to add or disable States and Dealer types. |
| 5 | Dashboard and reports | The **Dashboard** and **Reports** pages show registration counts, overdue items, recent decisions and a Team table. |

### 🔒 Backend security

Every API route is checked on the server, not only hidden on the screen:

- `authenticate` checks who the user is and whether their account is still active.
- `authorize(role)` checks whether the user's role is allowed to perform the action.
- The Creator's "view only their own" rule is enforced in the database query.

### 🏗️ Architecture

Request flow: **Routes → Middleware → Controllers → Models**

Routes direct requests, middleware checks the login and the role, controllers apply the business rules, and models validate and store the data.

**One request, step by step:** the screen calls the API → the route checks the login and the role → the controller applies the rules → the model saves clean data → the answer goes back.

### 📁 Project structure

```text
backend/
  server.js       - Starts the server and connects to the database
  app.js          - Builds the Express app: security, CORS, routes, errors
  routes/         - API URLs and which roles may call them
  middleware/     - Authentication, role authorization, error handling
  controllers/    - Business rules: approve, reject, invite, reset, etc.
  models/         - Database shapes and validation: User, Dealer, Master
  config/         - Constants such as roles and statuses
  seed.js         - Creates the first Admin and the master lists

frontend/
  src/
    pages/        - Screens: Login, Dashboard, Dealers, etc.
    components/   - Shared UI: layout, badges, authentication frame
    context/      - Sign-in state shared across the app
    api.js        - Central place for backend API calls
```

---

## ✨ Features

Each feature below is explained in plain words.

### 🔑 Sign in

- Choose your role (Creator, Approver or Admin), then type your email and password.
- The role you choose must match your account.
- If anything is wrong, the app shows one message: *"Invalid email, password or role"*. It never says which part was wrong, so nobody can guess.
- A **Show / Hide** button lets you check what you typed.

### 📨 Getting an account (invite)

- Nobody signs up on their own.
- The Admin invites a person by email. The person opens the link, then chooses their own password.
- The Admin never sees the password.
- The link works **once** and expires after **24 hours**.

### 🔁 Forgot password

- On the sign-in page, enter your email. A reset link is sent.
- The link works **once** and expires after **1 hour**.
- The reply is the same whether or not the email exists, so strangers cannot check who has an account.
- The new password must be different from the old one, with at least 8 characters, a letter and a number.
- After a change, every older login stops working.

### 📊 Dashboard

The first page after sign-in. It says "Good morning / afternoon / evening" and shows:

- How many registrations are **Pending**, **Approved** and **Rejected**, with percentages. Click a box to see that list.
- **Needs review:** the oldest pending dealers first, with an **Overdue** label after 3 days.
- **Recent decisions:** who decided what, their role, and when.

Approvers and Creators see the same layout, but only with their own work.

### 📋 Registrations list

- One table with every dealer (Creators see only their own).
- Columns: **Dealer code** (a blue link that opens the dealer), dealer name and type, location, GSTIN, date and time, who created it (with their role), and status.
- **Search** by name, code, GSTIN or state.
- **Filter** by Pending, Approved or Rejected.
- Pending dealers show **Review** for Approvers and Admins. Everything else shows **View**.

### 📝 Register a dealer

- A form for Creators and Admins: dealer name, GSTIN, dealer type, contact person, mobile number, email, state and city.
- The app checks for a correct GSTIN, a 10-digit mobile number and a valid email.
- A GSTIN that is already registered is refused.
- Dealer type and state come from the masters that the Admin keeps.
- Every new dealer gets a code like `DLR-0001` and starts as **Pending**.
- The code is always the highest existing code plus one. The status, the creator and the code are set by the server and never taken from the form.

### 🕘 Dealer details and history

Opens one dealer with all details and a **History**: who registered it, who approved or rejected it (with roles), when, and the rejection reason if there is one.

### ✅ Approve or reject

- On the dealer page, Approvers and Admins see **Approve** and **Reject**.
- Rejecting needs a reason of at least **10 characters**. The Creator can read it in the history.
- Only a **Pending** dealer can be decided.
- The first decision wins. If two people click at the same moment, the second one is told it was already decided.

### 🧑‍💼 Users (Admin)

- Invite a person with a name, email and role.
- The list shows each person as **Invited**, **Active** or **Deactivated**.
- You can **resend** an invite, or **deactivate** and **reactivate** a person.
- A deactivated person is locked out immediately, even if they are signed in.
- Users are never deleted, so the history always stays correct.
- An Admin cannot deactivate their own account.

### 🗂️ Masters (Admin)

The masters are the dropdown lists used in the dealer form: **States** and **Dealer types**. The Admin can add values and disable them. A disabled value disappears from the form, but dealers that already use it keep it.

### 📈 Reports (Admin)

- Dealers counted by **state** and by **dealer type** (Pending, Approved, Rejected, Total, with a totals row).
- A **Team** table: for each person, how many dealers they registered, approved and rejected.

### 🧭 Menus, screens and email

- Each person sees only the menu items for their role. A hidden address typed in the browser sends them back to the dashboard, and the server would refuse the request anyway.
- A loading screen shows while the app checks that you are signed in.
- The pages work on phones and on computers.
- Invite and reset emails are sent by the **backend** with Nodemailer and **Brevo** (an email service). The frontend never sends email. If no email server is set up, the email is printed in the backend terminal, so you can still open the link while testing.

---

## 🧰 Tech stack

| Part | Technology |
|---|---|
| 🗄️ Database | MongoDB |
| ⚙️ Backend | Node.js, Express, MVC structure |
| 🔐 Login | JWT (login token), bcryptjs (hides passwords before saving them) |
| ✉️ Email | Nodemailer + Brevo (sent from the backend) |
| 🖥️ Frontend | React, Tailwind CSS |
| 🧪 Tests | Jest, Supertest |

---

## 🚀 Run it on your computer

You need **Node.js 18 or newer** and **MongoDB** (running locally, or an Atlas connection string).

**1️⃣ Backend**
```bash
cd backend
npm install
```
Create `backend/.env` from `backend/.env.example` and fill it in (see the table below). Then:
```bash
npm run seed     # creates the first Admin and the State and Dealer type lists
npm run dev      # starts the server on http://localhost:5000
```

**2️⃣ Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev      # opens the app on http://localhost:5173
```

**3️⃣ First sign in**
Choose the **Admin** role and use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. Then open **Users** and invite an Approver and a Creator.

---

## ⚙️ Settings (`backend/.env`)

| Name | What it is |
|---|---|
| `PORT` | The port for the server, for example `5000` |
| `MONGO_URI` | The database address, for example `mongodb://127.0.0.1:27017/dealer_portal` |
| `JWT_SECRET` | A long random text that protects logins. **Keep it private** |
| `JWT_EXPIRES_IN` | How long a login lasts, for example `1d` |
| `APP_URL` | The frontend address, with no slash at the end. Used for the links in emails |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email server settings. Leave empty to print emails in the terminal |
| `MAIL_FROM` | The sender shown in emails |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The first Admin created by `npm run seed` |
| `AUTH_RATE_LIMIT` | *(optional)* How many sign-in attempts are allowed per 15 minutes. Default is `20` |

> 💡 `npm run seed -- --reset` **empties** the database first, so never use it on real data. Running the seed twice is safe, because it never creates a second Admin.
> To test your email settings, run `node mailtest.js you@example.com` inside `backend`.

---

## 🧪 Tests

```bash
cd backend
npm test
```
The tests check the rules the app depends on: a request without a login is refused, a Creator cannot approve or open admin pages, a Creator cannot see another Creator's dealers, a dealer cannot be decided twice, a short rejection reason is refused, a duplicate GSTIN is refused, invite and reset links work only once and expire, a wrong role at sign-in gives the generic message, and a deactivated user is locked out. The tests use their own database (`dealer_portal_test`), which is emptied before and after, so your real data is safe. MongoDB must be running locally.

---

## ☁️ Deploying

| Part | Where | Settings |
|---|---|---|
| 🗄️ Database | **MongoDB Atlas** | Allow `0.0.0.0/0` under Network Access, because the free Render plan has no fixed address |
| ⚙️ Backend | **Render** (Web Service) | Root directory `backend` · build `npm install` · start `npm start` · add the settings above as environment variables, with `APP_URL` set to the Vercel address |
| 🖥️ Frontend | **Vercel** | Root directory `frontend` · one variable, `VITE_API_URL`, set to the Render address (no `/api`, no slash at the end) |

- ✉️ **Email on Render's free plan:** it blocks the usual email ports (25, 465, 587). Use an email service that offers port **2525**, for example Brevo, and set `SMTP_PORT=2525`.
- 👤 **First Admin in the cloud:** run `npm run seed` on your computer with `MONGO_URI` pointing at Atlas.

---

## 🧠 Why it is built this way

- **The server decides.** The login token holds only the user's id. On every request the server loads the person and checks their role and whether they are still active, so a role change or a deactivation applies at once.
- **Invite links, not shared passwords.** The Admin never sees anyone's password.
- **Rules live in controllers.** Routes only check who is calling. Controllers hold the business rules, and the models check the data and keep GSTIN and email unique.

---

## 🔮 Future scope

- 📎 Document upload (GST certificate, PAN card)
- 🏦 Bank details
- ✏️ Edit and resubmit a rejected dealer
- 🧾 Audit log page

---

Built by
**Prafull Jadhav**
