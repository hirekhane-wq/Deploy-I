import { useWallet } from "../context/WalletContext";

export default function Analytics() {
    const { user, transactions, rates, isMarketOpen } = useWallet();

    const topGainers = Object.entries(rates)
        .filter(([c]) => c !== "USD")
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // 1. Calculate Expenses by Day (Last 7 Days)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailySpending = new Array(7).fill(0);
    const today = new Date();

    transactions.forEach(tx => {
        if (tx.type === "SEND") {
            const txDate = new Date(tx.date);
            const diffDays = Math.floor((today.getTime() - txDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays < 7) {
                const dayIdx = txDate.getDay();
                dailySpending[dayIdx] += tx.amount;
            }
        }
    });

    const maxSpend = Math.max(...dailySpending, 100);

    // 2. Savings Rate Calculation
    const totalIncome = transactions
        .filter(t => t.type === "RECEIVE" || t.type === "BONUS" || t.type === "DEPOSIT")
        .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
        .filter(t => t.type === "SEND")
        .reduce((s, t) => s + t.amount, 0);

    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // 3. Dynamic Saving Tips
    const getTip = () => {
        if (totalExpense > totalIncome * 0.8) return "⚠️ High Spending: You're spending over 80% of your income. Try to limit non-essential transfers.";
        if (savingsRate > 30) return "🌟 Super Saver: You're saving over 30% of your income! Consider moving some to a high-yield vault.";
        if (totalExpense === 0) return "💡 Set a Goal: Start your first transfer to see detailed spending suggestions here.";
        return "✅ Steady Growth: Your savings are growing. keep it up!";
    };

    return (
        <div className="animate-fade-up">
            <div className="topbar">
                <div className="topbar-title">
                    <h1>Finance Insights</h1>
                    <p>Advanced tracking & saving tools for your Credora account</p>
                </div>
            </div>

            <div className="section-grid">
                {/* 1. Spending Graph Card */}
                <div className="glass section-card" style={{ gridColumn: "span 2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <h3>📉 Weekly Spending Trend</h3>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>Last 7 Days (USD)</span>
                    </div>

                    <div className="chart-container" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 200, gap: 10 }}>
                        {dailySpending.map((amount, i) => {
                            const height = (amount / maxSpend) * 100;
                            return (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${height}%`,
                                            width: "100%",
                                            background: amount > 0 ? "var(--indigo)" : "#f0f2f5",
                                            borderRadius: "4px 4px 0 0",
                                            transition: "height 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                            position: "relative"
                                        }}
                                    >
                                        {amount > 0 && <span className="bar-tooltip">${amount.toFixed(0)}</span>}
                                    </div>
                                    <span style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{days[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Saving Goal Progress */}
                <div className="glass section-card">
                    <h3>🎯 Savings Rate</h3>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
                        <div style={{
                            width: 120, height: 120, borderRadius: "50%",
                            background: `conic-gradient(var(--emerald) ${savingsRate}%, #f0f2f5 0)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            position: "relative"
                        }}>
                            <div style={{
                                width: 100, height: 100, borderRadius: "50%",
                                background: "#ffffff", display: "flex",
                                flexDirection: "column", alignItems: "center", justifyContent: "center"
                            }}>
                                <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{savingsRate.toFixed(0)}%</span>
                                <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)" }}>OF INCOME</span>
                            </div>
                        </div>
                        <p style={{ marginTop: 20, textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            {getTip()}
                        </p>
                    </div>
                </div>

                {/* 3. Detailed Account Metrics */}
                <div className="glass section-card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                        <h3>📋 Account Protocol</h3>
                        <span style={{ color: "var(--emerald)", fontSize: "0.75rem", fontWeight: 700 }}>VERIFIED</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="metric-row">
                            <span>VIP Standing</span>
                            <span style={{ color: "var(--indigo-light)" }}>{(user?.name.toLowerCase().includes("hirekhan") || user?.email.toLowerCase().includes("hirekhan")) ? "Elite Platinum" : "Standard"}</span>
                        </div>
                        <div className="metric-row">
                            <span>Daily Limit</span>
                            <span>$10,000.00</span>
                        </div>
                        <div className="metric-row">
                            <span>Transaction Count</span>
                            <span>{transactions.length}</span>
                        </div>
                        <div className="metric-row">
                            <span>Income/Expense Ratio</span>
                            <span>{(totalIncome / (totalExpense || 1)).toFixed(1)}x</span>
                        </div>
                        <div className="metric-row" style={{ marginTop: 8, padding: 12, background: "#f8f9fa", borderRadius: 8, border: '1px solid #e1e4e8' }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Member Since</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Global Market Pulse */}
                <div className="glass section-card" style={{ borderLeft: `4px solid ${isMarketOpen ? 'var(--emerald)' : 'var(--rose)'}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h3>🌐 Global Market Pulse</h3>
                        <span className="pulse-indicator" style={{
                            background: isMarketOpen ? 'var(--emerald)' : 'var(--rose)',
                            boxShadow: `0 0 10px ${isMarketOpen ? 'var(--emerald-glow)' : 'var(--rose-glow)'}`
                        }}></span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                        Current status: <strong style={{ color: isMarketOpen ? 'var(--emerald)' : 'var(--rose)' }}>
                            {isMarketOpen ? "VOLATILE / OPEN" : "MARKET CLOSED"}
                        </strong>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", lineHeight: 1.4 }}>
                        Currency prices are fluctuating by ±0.01% every 15s. We recommend transferring during "Stable" periods to ensure the best conversion rate.
                    </p>
                </div>

                <div className="glass section-card">
                    <h3>💎 Top Value Currencies</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {topGainers.map(([code, val]) => (
                            <div key={code} className="metric-row">
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: "1.1rem" }}>{code === "INR" ? "🇮🇳" : code === "EUR" ? "🇪🇺" : "🌐"}</span>
                                    {code}
                                </span>
                                <span style={{ color: "var(--emerald)" }}>{val.toFixed(2)} <small style={{ fontSize: "0.6rem" }}>↑</small></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Advisor / Saver Suggestions */}
            <div className="glass section-card" style={{ marginTop: 24, borderLeft: "4px solid var(--amber)" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ fontSize: "2rem" }}>💡</div>
                    <div>
                        <h4 style={{ color: "var(--amber)", marginBottom: 4 }}>Credora Saver Suggestion</h4>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                            We noticed you've had **{transactions.filter(t => t.type === "SEND").length}** outgoing payments this week.
                            To save **$150+ monthly**, try setting a $5.00 daily limit for non-essential transfers.
                            Users who follow regular saving patterns increase their balance by **22% faster** on Credora.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}




