import { useWallet } from "../context/WalletContext";

export default function Notifications() {
    const { notifications, dismissNotification } = useWallet();

    if (notifications.length === 0) return null;

    return (
        <div className="notification-stack">
            {notifications.map((msg, i) => (
                <div key={i} className="glass notification">
                    <span style={{ fontSize: "0.9rem", flex: 1 }}>{msg}</span>
                    <button className="notif-close" onClick={() => dismissNotification(i)}>✕</button>
                </div>
            ))}
        </div>
    );
}
