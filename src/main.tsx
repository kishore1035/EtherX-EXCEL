
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import "./styles/icons-3d.css";

// Import export system tests (available in console)
// Temporarily disabled - uncomment after fixing TypeScript errors
// import './tests/exportSystemTest';

  createRoot(document.getElementById("root")!).render(<App />);