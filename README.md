#  14th Gawad Kaligtasan at Kalusugan (GKK) 


Welcome to the official repository for the **14th Gawad Kaligtasan at Kalusugan (GKK) Awards Landing Page & Portal**. This application serves as the digital gateway for nominees, evaluators, and the public to participate in the prestigious GKK Awards, recognizing outstanding achievements in Occupational Safety and Health (OSH).

##  Features

*   **Public Landing Page**: Showcase of award categories, timeline, submission guidelines, and testimonials.
*   **Nomination Portal**: Secure registration and document submission for qualified establishments.
*   **Evaluator Portal**: Dedicated interface for judges to review submissions and manage rounds.
*   **Interactive UI**: Smooth animations, responsive design, and intuitive navigation.
*   **Performance Optimized**: Code-splitted routes and memoized components for fast load times.

## ️ Tech Stack

*   **Frontend Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)

##  Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
*   npm (comes with Node.js)

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    *   Create a `.env.local` file in the root directory if it doesn't exist.
    *   Add any necessary environment variables (e.g., `GEMINI_API_KEY` if using AI features).

### Running the App

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

##  Project Structure

```
presentation-of-the-14th-gkk-awards-landing-page/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── landing/     # Landing page sections (Hero, About, etc.)
│   │   ├── layout/      # Layout components (Navbar, Footer)
│   │   ├── portal/      # Portal views (Nomination, Evaluator, Applicant)
│   │   └── ...
│   ├── services/        # API services and utilities
│   ├── App.tsx          # Main application component with routing logic
│   ├── main.tsx         # Entry point
│   └── types.ts         # TypeScript definitions
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
└── vite.config.ts       # Vite configuration
```

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Developed for the Occupational Safety and Health Center (OSHC) - DOLE**
