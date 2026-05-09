import { useEffect } from "react";
import { useWallet } from "./context/WalletContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Transfer from "./pages/Transfer";
import History from "./pages/History";
import KYC from "./pages/KYC";
import Sidebar from "./components/Sidebar.tsx";
import Notifications from "./components/Notifications.tsx";

function App() {
  const { user, page, notify } = useWallet();

  // Handle Stripe Redirection Results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      notify("💳 Deposit Successful! Your balance will update shortly.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("payment") === "cancel") {
      notify("⚠️ Deposit Cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [notify]);

  if (!user) return <Login />;

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "analytics": return <Analytics />;
      case "transfer": return <Transfer />;
      case "history": return <History />;
      case "kyc": return <KYC />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <div className="animate-fade-up" key={page}>
          {renderPage()}
        </div>
      </main>
      <Notifications />
    </div>
  );
}

export default App;
