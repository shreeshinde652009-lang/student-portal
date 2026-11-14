# State Common Entrance Test Cell - Linux CS Entrance & Admission Portal

A complete, production-ready Student Registration and Admission Portal built with **Next.js 14 (TypeScript)**, **Tailwind CSS**, and **Firebase** (Authentication, Firestore, Storage).

---

## 🌟 Key Features

### 🎓 Student Portal
- **New Registration Page (`/register`)**:
  - Personal Information (Full Name, Father's Name, Mother's Name, DOB, Gender, Category).
  - Contact & Account Security (Email, Mobile validation, Password confirmation with min 8 characters).
  - Address & Domicile Details.
  - Qualification Records (SSC Board/Year/Percentage, HSC Board/Year/Percentage).
  - Passport Photo Upload to Firebase Storage.
  - Auto-generated unique Application Number in `LCS<YEAR><6 Random Digits>` format (e.g. `LCS2026849201`).
- **Student Login (`/student/login`)**:
  - Secure Firebase Authentication.
- **Student Dashboard (`/student/dashboard`)**:
  - View Application Number, real-time application status (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`).
  - View submitted personal details, uploaded photograph, and academic marks.

---

### 🛡️ Admin Portal
- **Admin Login (`/admin/login`)**:
  - Dedicated admin login panel.
- **Admin Dashboard (`/admin/dashboard`)**:
  - Overview metrics: Total Applications, Pending, Under Review, Approved, Rejected.
  - Search functionality (by Application Number, Candidate Name, Email, Mobile).
  - Filter applications by status (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`).
  - Paginated student applications table.
  - **View Application Modal**: Detailed view of student documents and status switcher.
  - **Edit Student Modal**: Edit student records in real time.
  - **Delete Student Modal**: Permanent record deletion with confirmation modal dialog.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Firebase Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

For complete Firebase setup instructions, Firestore rules, and Admin creation guide, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## 📄 Documentation
- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for full guide on setting up Firebase Authentication, Firestore, Storage, and creating admin credentials.
