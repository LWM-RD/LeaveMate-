# 🌴 LeaveMate - Personal & Team Leave Tracker

A modern, fast, and intuitive Leave & Balance Management web application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Firebase (Firestore & Authentication)**.

Track, calculate, and organize your annual, casual, sick, and special leaves across multiple years with real-time cloud persistence, instant calculations, print-ready reports, and spreadsheet exports.

---

## ✨ Features

- 📅 **Multi-Year Support**: Easily switch between years (2024, 2025, 2026, 2027+) with dedicated quotas and history per year.
- ⚖️ **Flexible Leave Quotas**:
  - Annual Leave (e.g. 14 days)
  - Casual Leave (e.g. 7 days)
  - Sick Leave (e.g. 7 days)
  - Special Leave (e.g. 5 days)
  - Edit quotas dynamically at any time.
- 🌓 **Full-Day & Half-Day (0.5) Tracking**: Record single days, multi-day spans, or half-day leaves with automatic accurate day count calculation.
- ☁️ **Real-Time Cloud Synchronization**: Built with Firebase Firestore real-time listeners (`onSnapshot`) ensuring all your devices and windows stay instantly updated.
- 🔄 **Manual Sync Button**: One-click cloud refresh button with instant visual feedback and connection status.
- 🔐 **Authentication**: Sign in securely with Google or continue in local/guest mode.
- 📋 **Leave History & Filtering**:
  - Filter by leave category (All, Casual, Sick, Annual, Special).
  - Search by reason or date.
  - Sort by newest or oldest.
  - In-app confirmation modal for safe record deletion.
- 🖨️ **Print Official Reports**: Clean, printable leave statements ready for HR submission or PDF export.
- 📊 **Excel / CSV Export**: Download complete leave logs as spreadsheet files in one click.
- 🗓️ **Interactive Calendar View**: Visual monthly view displaying scheduled leaves with category badges.
- 🎨 **Modern UI / UX**: Clean design using Tailwind CSS v4, smooth animations, Lucide icons, and responsive layouts for mobile and desktop.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 (Hooks, Context, Functional Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Cloud Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Authentication (Google OAuth)
- **Build Tool**: Vite 6+

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed:
- [Node.js](https://nodejs.org/) (Version 18.0 or newer)
- `npm` or `yarn` or `pnpm`
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/leavemate.git
cd leavemate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Configuration

Copy `firebase-applet-config.example.json` to `firebase-applet-config.json`:

```bash
cp firebase-applet-config.example.json firebase-applet-config.json
```

Open `firebase-applet-config.json` and insert your Firebase project credentials from the [Firebase Console](https://console.firebase.google.com/):

```json
{
  "projectId": "your-firebase-project-id",
  "appId": "your-firebase-web-app-id",
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-firebase-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-firebase-project-id.firebasestorage.app",
  "messagingSenderId": "your-messaging-sender-id",
  "oAuthClientId": "your-oauth-client-id.apps.googleusercontent.com"
}
```

> **Note:** If you are using Firebase Authentication with Google Sign-in, make sure to add your authorized domain in **Firebase Console > Authentication > Settings > Authorized domains** (e.g. `localhost`, your custom domain, or your Vercel/Netlify URL).

### 4. Run Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
```

The production-ready assets will be created in the `dist/` directory.

---

## 🌐 Deployment

You can deploy LeaveMate in just a few minutes using any of the following platforms:

### Deploy to Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **"New Project"**.
3. Import your GitHub repository.
4. Framework preset: **Vite**.
5. Click **Deploy**.

### Deploy to Netlify
1. Sign in to [Netlify](https://www.netlify.com/).
2. Select **"Import an existing project from GitHub"**.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy Site**.

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select 'dist' as public directory and configure as single-page app (SPA)
npm run build
firebase deploy --only hosting
```

---

## 📁 Project Structure

```text
├── index.html                   # HTML entry point with metadata
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration
├── firebase-applet-config.json  # Firebase configuration credentials
├── public/                      # Static assets
└── src/
    ├── App.tsx                  # Main application orchestrator
    ├── main.tsx                 # React entry point
    ├── index.css                # Global styles and Tailwind imports
    ├── components/              # Modular UI components
    │   ├── Header.tsx           # Top navigation, year switcher & sync
    │   ├── SummaryCards.tsx     # Leave balance metric cards
    │   ├── LeaveFormModal.tsx   # Modal for submitting leaves
    │   ├── LeaveHistoryTable.tsx# Searchable, filterable history table
    │   ├── LeaveCalendar.tsx    # Monthly visual calendar
    │   ├── QuotaSettingsModal.tsx # Annual leave quota customizer
    │   ├── ExportModal.tsx      # Print report & spreadsheet export
    │   └── DeleteConfirmModal.tsx # In-app deletion confirmation
    ├── lib/
    │   └── firebase.ts          # Firestore & Auth services with sync
    ├── types/
    │   └── leave.ts             # TypeScript interfaces and types
    └── utils/
        └── leaveCalculations.ts # Quota and balance computation helpers
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
