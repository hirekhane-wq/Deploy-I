import { useWallet } from "../context/WalletContext";
import type { Page } from "../context/WalletContext";

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analytics", label: "Insights", icon: "📈" },
    { id: "transfer", label: "Transfer", icon: "💸" },
    { id: "history", label: "History", icon: "📋" },
];

export default function Sidebar() {
    const { user, page, setPage, logout } = useWallet();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo" style={{ color: 'var(--indigo)' }}>
                    <span style={{ fontSize: '1.6rem' }}>💎</span> Credora
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${page === item.id ? "active" : ""}`}
                        onClick={() => setPage(item.id)}
                    >
                        <span className="icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="footer-user">
                    {user?.kycStatus === "unverified" && (
                        <div className="verified-badge-mini" style={{ background: 'var(--rose-glow)', color: 'var(--rose)', borderColor: 'var(--rose)' }}>
                            ⚠️ UNVERIFIED
                        </div>
                    )}
                    {user?.kycStatus === "pending" && (
                        <div className="verified-badge-mini" style={{ background: 'var(--amber-glow)', color: '#b45309' }}>
                            🕒 PENDING
                        </div>
                    )}
                    {user?.kycStatus === "verified" && (
                        <div className="verified-badge-mini">
                            ✅ VERIFIED ACCOUNT
                        </div>
                    )}
                    
                    <div className="user-info">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-status">Elite Platinum Founder</div>
                    </div>

                    <button className="btn-signout" onClick={logout}>
                        🚪 Secure Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
