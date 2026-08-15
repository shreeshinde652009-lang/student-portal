# Firebase Setup & Configuration Guide

This document provides step-by-step instructions for creating and configuring the Firebase project for the **State Common Entrance Test Cell - Linux CS Admission Portal**.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** (or **Create a project**).
3. Enter your Project Name (e.g., `mahacet-linux-cs`).
4. Choose whether to enable Google Analytics (optional) and click **Create Project**.

---

## 2. Enable Firebase Authentication

1. In the Firebase Console sidebar, select **Build > Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**, choose **Email/Password**.
4. Enable **Email/Password** and click **Save**.

---

## 3. Enable Cloud Firestore

1. In the Firebase Console sidebar, select **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose your database location (e.g., `asia-south1` for India).
4. Start in **Production mode**.
5. Set up Firestore Security Rules (see Section 6 below).

---

## 4. Enable Firebase Storage

1. In the Firebase Console sidebar, select **Build > Storage**.
2. Click **Get Started**.
3. Accept default security rules and select your storage bucket location.
4. Click **Done**.

---

## 5. Configure Environment Variables

Create a file named `.env.local` in the root directory of this Next.js project with the following Firebase credentials from your Firebase Console (**Project Settings > General > Your apps > Web app**):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 6. Required Security Rules

### Firestore Rules (`firestore.rules`)
In Firebase Console -> **Firestore Database** -> **Rules**, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /applications/{userId} {
      // Students can read/write only their own document
      allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);
    }
  }
}
```

### Storage Rules (`storage.rules`)
In Firebase Console -> **Storage** -> **Rules**, paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /student_photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 7. How to Create the First Admin Account

1. Go to Firebase Console -> **Authentication** -> **Users**.
2. Click **Add user**.
3. Enter the Admin Email (e.g., `admin@mahacet.org`) and a strong password.
4. Click **Add user**.
5. Navigate to `/admin/login` on the portal and log in using these credentials.
