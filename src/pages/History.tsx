import { useState } from "react";
import { useWallet } from "../context/WalletContext";

type FilterType = "all" | "received" | "transferred";

export default function History() {
    const { transactions } = useWallet();
    const [filter, setFilter] = useState<FilterType>("all");

    const filteredTransactions = transactions.filter(tx => {
        if (filter === "all") return true;
        if (filter === "transferred") return tx.type === "SEND";
        if (filter === "received") return tx.type === "RECEIVE" || tx.type === "BONUS" || tx.type === "DEPOSIT";
        return true;
    });

    const fmt = (iso: string) =>
        new Date(iso).toLocaleString(undefined, {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    return (
        <div>
            <div className="topbar">
                <div className="topbar-title">
                    <h1>Payment History</h1>
                    <p>{filteredTransactions.length} {filter !== 'all' ? filter : ''} transactions</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="tab-group" style={{ marginBottom: 20 }}>
                <button 
                    className={`tab-btn ${filter === "all" ? "active" : ""}`} 
                    onClick={() => setFilter("all")}
                >
                    📜 All
                </button>
                <button 
                    className={`tab-btn ${filter === "received" ? "active" : ""}`} 
                    onClick={() => setFilter("received")}
                >
                    📥 Received
                </button>
                <button 
                    className={`tab-btn ${filter === "transferred" ? "active" : ""}`} 
                    onClick={() => setFilter("transferred")}
                >
                    📤 Transferred
                </button>
            </div>

            <div className="glass section-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredTransactions.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "48px 0" }}>
                        {filter === "all" 
                            ? "No transactions yet. Start using Credora to see your history here."
                            : `No ${filter} transactions found.`}
                    </p>
                ) : (
                    filteredTransactions.map(tx => (
                        <div className="history-item" key={tx.id}>
                            <div className="history-icon" style={{
                                background: tx.type === "SEND" ? "var(--rose-glow)" :
                                    tx.type === "BONUS" ? "var(--indigo-glow)" : "var(--emerald-glow)",
                                color: tx.type === "SEND" ? "var(--rose)" : tx.type === "BONUS" ? "var(--indigo)" : "var(--emerald)"
                            }}>
                                <span style={{ fontSize: "1.1rem" }}>
                                    {tx.type === "SEND" ? "↗" : tx.type === "BONUS" ? "⭐" : "↙"}
                                </span>
                            </div>

                            <div>
                                <div style={{ fontWeight: 500, fontSize: "0.92rem" }}>
                                    {tx.type === "SEND" ? `Sent to ${tx.recipient}` :
                                        tx.type === "BONUS" ? (tx.method === "Welcome Gift" ? "Welcome Gift" : "Special Bonus Credit") :
                                            tx.type === "DEPOSIT" ? "Wallet Deposit" : `Received from ${tx.sender}`}
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                                    {fmt(tx.date)}
                                    {tx.method && tx.method !== "Welcome Gift" && <> · via {tx.method}</>}
                                    {tx.convertedCurrency && (
                                        <> · Converted: {tx.convertedAmount?.toFixed(2)} {tx.convertedCurrency}</>
                                    )}
                                </div>
                                {tx.message && (
                                    <div style={{ 
                                        fontSize: "0.8rem", 
                                        color: "var(--text-secondary)", 
                                        marginTop: 6,
                                        padding: "6px 10px",
                                        background: "#f0f2f5",
                                        borderRadius: "var(--radius-sm)",
                                        display: "inline-block",
                                        border: '1px solid #e1e4e8'
                                    }}>
                                        💬 {tx.message}
                                    </div>
                                )}
                            </div>

                            <div style={{
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                color: tx.type === "SEND" ? "var(--text-primary)" :
                                    tx.type === "BONUS" ? "var(--indigo)" : "var(--emerald)"
                            }}>
                                {tx.type === "SEND" ? "-" : "+"}${tx.amount.toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
