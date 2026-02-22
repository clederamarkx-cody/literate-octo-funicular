# 14th Gawad Kaligtasan at Kalusugan (GKK) Awards Portal

Welcome to the official repository for the **14th Gawad Kaligtasan at Kalusugan (GKK) Awards Landing Page & Portal**. This application serves as the digital gateway for nominees, evaluators, and the public to participate in the prestigious GKK Awards, recognizing outstanding achievements in Occupational Safety and Health (OSH) in the Philippines.

![GKK Landing Page Preview](https://oshc.dole.gov.ph/wp-content/uploads/2023/07/OSHC-Logo.png) <!-- Replace with actual screenshot of your app -->

---

## Features

*   **Public Landing Page**: Showcase of award categories, timeline, submission guidelines, and past champions.
*   **Role-Based Portals**:
    *   **Nominee Portal**: Secure registration, multi-stage document submission, and real-time progress tracking.
    *   **Evaluator Portal**: Dedicated interfaces tailored to different evaluation tiers (REU, Admin, SCD, Regional Board).
*   **Multi-Stage Verification System**:
    *   **Stage 1 (Technical & Document Review)**: Regional Expansion Units (REU) verification.
    *   **Stage 2 (Shortlist & Inspection)**: Unlocked by Admins/SCDs for further evaluation.
    *   **Stage 3 (Final Board Presentation)**: Final vetting stage.
*   **Cloud Integration**: Real-time database sync and secure cloud storage for documents using Google Firebase.
*   **Interactive UI**: Smooth animations, responsive design, and intuitive navigation built on modern web standards.

## Tech Stack

*   **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Backend / BaaS**: [Firebase](https://firebase.google.com/) (Firestore DB & Cloud Storage)
*   **Routing**: React state-based view management

---

## User Roles & Permissions

The application restricts features based on the `role` property in the user's session:

1.  **`applicant`**: Can fill out their profile and upload documents sequentially across unlocked stages.
2.  **`reu` (Regional Expansion Unit)**: Can view submitted profiles and pass/fail them for Stage 1 (Exception: restricted from passing NCR region applicants).
3.  **`evaluator` / Regional Board**: Can evaluate verified documents, trigger Phase 2 evaluations, and input final scoring.
4.  **`scd` (Safety Control Division)**: Specialized oversight role; can trigger stage unlocks and mandate fail/pass verdicts.
5.  **`admin`**: Superuser functionality with full visibility and control over pipeline stages and applicant statuses.

---

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   npm or yarn
*   A Firebase Project (with Firestore and Storage enabled)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/oshc-gkk-awards-main.git
    cd oshc-gkk-awards-main
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

    Open your browser and navigate to `http://localhost:5173`.

---

## Project Structure

```text
oshc-gkk-awards-main/
├── firebase.js          # Firebase initialization and config
├── src/
│   ├── components/      # React components
│   │   ├── landing/     # Public-facing informative sections
│   │   ├── layout/      # Shared wrappers (Navbar, Footer, Modal)
│   │   ├── portal/      # Login, Evaluator Dashboard, Applicant Dashboard
│   ├── services/        # Firebase data access layer (dbService.ts)
│   ├── types.ts         # Global TypeScript interfaces
│   ├── App.tsx          # Core routing and state provider
│   └── main.tsx         # React DOM entry
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind theme (navy, gold palettes)
└── vite.config.ts       # Vite configuration
```

---

## Contributing

Contributions are welcome! If you find any bugs or have feature requests, please open an issue or submit a Pull Request. 

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*This system was developed specifically for the Occupational Safety and Health Center (OSHC) under the Department of Labor and Employment (DOLE) of the Philippines.*
