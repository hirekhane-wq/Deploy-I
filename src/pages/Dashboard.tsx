import { useWallet } from "../context/WalletContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { user, transactions, depositGlobal, virtualAccount, setPage } = useWallet();

    const totalIn = transactions.reduce((s, t) =>
        (t.type === "RECEIVE" || t.type === "BONUS" || t.type === "DEPOSIT") ? s + t.amount : s, 0
    );
    const totalOut = transactions.reduce((s, t) =>
        t.type === "SEND" ? s + t.amount : s, 0
    );

    // Dynamic Chart Data (Simulated based on balance)
    const chartData = [
        { name: 'Mon', wealth: user?.balance ? user.balance * 0.98 : 0 },
        { name: 'Tue', wealth: user?.balance ? user.balance * 0.99 : 0 },
        { name: 'Wed', wealth: user?.balance ? user.balance * 0.97 : 0 },
        { name: 'Thu', wealth: user?.balance ? user.balance * 1.01 : 0 },
        { name: 'Fri', wealth: user?.balance ? user.balance * 1.00 : 0 },
        { name: 'Sat', wealth: user?.balance ? user.balance * 1.02 : 0 },
        { name: 'Sun', wealth: user?.balance || 0 },
    ];

    // Expense categories
    const categories = ["Global Trade", "Luxury Real Estate", "Technology Investments", "Founder Dividends", "Operational Ledger"];
    const expenseMap = transactions
        .filter(t => t.type === "SEND")
        .reduce((map: Record<string, number>, t) => {
            const hash = (t.recipient || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
            const cat = categories[hash % categories.length];
            map[cat] = (map[cat] || 0) + t.amount;
            return map;
        }, {});

    const recent = transactions.slice(0, 5);

    return (
        <div className="animate-fade-up">
            {/* Top Bar */}
            <div className="topbar">
                <div className="topbar-title">
                    <h1>Executive Overview</h1>
                    <p>Foundational account control for {user?.name}</p>
                </div>
                <div className="avatar-badge">
                    <div className="avatar-circle" style={{ background: 'var(--indigo)' }}>{user?.name.charAt(0)}</div>
                    <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{user?.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>Elite Platinum Founder</div>
                    </div>
                </div>
            </div>

            <div className="section-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                <div>
                    {/* Main Balance Card */}
                    <div className="glass" style={{ padding: '32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)', border: '1px solid var(--indigo-glow)' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Credora Platinum Vault</div>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-2px' }}>${user?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                            <div style={{ color: 'var(--emerald)', fontSize: '0.85rem', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--emerald)', borderRadius: '50%', display: 'inline-block' }}></span> 
                                Verified Market Liquidity
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '0.95rem' }} onClick={() => setPage('transfer')}>
                                🚀 Dispatch Capital
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost" style={{ fontSize: '0.72rem', padding: '8px' }} onClick={() => depositGlobal(50000, 'Global Bank Wire')}>
                                    🏦 Wire In
                                </button>
                                <button className="btn btn-ghost" style={{ fontSize: '0.72rem', padding: '8px' }} onClick={() => depositGlobal(10000, 'Intl Card')}>
                                    💳 Card
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Wealth Graph (NEW) */}
                    <div className="glass" style={{ padding: '24px', height: '320px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Executive Asset Curve</h3>
                            <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 700 }}>+4.2% Growth (7D)</div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--indigo)" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="var(--indigo)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                                <Tooltip />
                                <Area 
                                  type="monotone" 
                                  dataKey="wealth" 
                                  stroke="var(--indigo)" 
                                  strokeWidth={3}
                                  fillOpacity={1} 
                                  fill="url(#colorWealth)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Multi-Currency Portfolio (NEW) */}
                    <div className="glass" style={{ padding: '24px', background: '#1a1f2e', color: 'white' }}>
                        <h3 style={{ margin: 0, marginBottom: '20px', color: 'white' }}>Global Portfolio</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#63b3ed', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.85rem' }}>USD (Reserve)</span>
                                </div>
                                <span style={{ fontWeight: 700 }}>92%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#f6ad55', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.85rem' }}>INR (Trade)</span>
                                </div>
                                <span style={{ fontWeight: 700 }}>5%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#68d391', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.85rem' }}>EUR (Venture)</span>
                                </div>
                                <span style={{ fontWeight: 700 }}>3%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '10px', display: 'flex', overflow: 'hidden' }}>
                                <div style={{ width: '92%', height: '100%', background: '#63b3ed' }}></div>
                                <div style={{ width: '5%', height: '100%', background: '#f6ad55' }}></div>
                                <div style={{ width: '3%', height: '100%', background: '#68d391' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Virtual Banking Card (Updated) */}
                    <div className="glass" style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8' }}>VIRTUAL BANKING ID</div>
                            <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', borderRadius: '4px' }}>SWIFT ACTIVE</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px' }}>VPA / UPI</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{virtualAccount?.vpa || 'PENDING'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px' }}>ACCOUNT</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{virtualAccount?.accountNumber || 'PENDING'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px' }}>ROUTING</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{virtualAccount?.routingNumber || 'PENDING'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                <div className="glass" style={{ padding: '20px', borderLeft: '4px solid var(--emerald)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>MONETARY INFLOW</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '4px' }}>+${totalIn.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="glass" style={{ padding: '20px', borderLeft: '4px solid var(--rose)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>SYSTEM OUTFLOW</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose)', marginTop: '4px' }}>-${totalOut.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            {/* Two Column Section */}
            <div className="section-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
                {/* Recent Transactions */}
                <div className="glass section-card" style={{ background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Recent Activity</h3>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => setPage('history')}>All Reports</button>
                    </div>
                    {recent.length === 0 ? (
                        <p style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "32px 0" }}>
                            Waiting for the first trade...
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {recent.map(tx => (
                                <div className="history-item" key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)', padding: '16px 0' }}>
                                    <div className="history-icon" style={{
                                        background: tx.type === "SEND" ? "var(--rose-glow)" :
                                            tx.type === "BONUS" ? "var(--indigo-glow)" : "var(--emerald-glow)",
                                        color: tx.type === "SEND" ? "var(--rose)" : tx.type === "BONUS" ? "var(--indigo)" : "var(--emerald)"
                                    }}>
                                        {tx.type === "SEND" ? "↗" : tx.type === "BONUS" ? "⭐" : "↙"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                            {tx.type === "SEND" ? tx.recipient :
                                                tx.type === "BONUS" ? "Credora Platinum Credit" : "Deposit Success"}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: '2px' }}>
                                            {new Date(tx.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} • {tx.type === 'SEND' ? 'Portfolio Exit' : 'Vault Inflow'}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        color: tx.type === "SEND" ? "var(--text-primary)" : "var(--emerald)"
                                    }}>
                                        {tx.type === "SEND" ? "-" : "+"}${tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expense Tracker */}
                <div className="glass section-card" style={{ background: 'white' }}>
                    <h3 style={{ marginBottom: '20px' }}>Asset Allocation</h3>
                    {Object.keys(expenseMap).length === 0 ? (
                        <p style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "32px 0" }}>
                            No sector activity yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {Object.entries(expenseMap).map(([cat, val]) => {
                                const pct = totalOut > 0 ? (val / totalOut) * 100 : 0;
                                return (
                                    <div key={cat}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
                                            <span>{cat}</span>
                                            <span>${val.toLocaleString()}</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#f0f2f5', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--indigo)' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
