import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import SecurityModal from "../components/SecurityModal";

type Method = "email" | "phone" | "bank" | "qr";

const currencies = [
    { code: "USD", symbol: "$", name: "USA", flag: "🇺🇸", dialCode: "+1" },
    { code: "INR", symbol: "₹", name: "India", flag: "🇮🇳", dialCode: "+91" },
    { code: "EUR", symbol: "€", name: "Europe", flag: "🇪🇺", dialCode: "+49" },
    { code: "GBP", symbol: "£", name: "UK", flag: "🇬🇧", dialCode: "+44" },
    { code: "AED", symbol: "د.إ", name: "UAE", flag: "🇦🇪", dialCode: "+971" },
    { code: "SGD", symbol: "S$", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
    { code: "CAD", symbol: "C$", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
    { code: "AUD", symbol: "A$", name: "Australia", flag: "🇦🇺", dialCode: "+61" }
];

export default function Transfer() {
    const { user, transfer, isMarketOpen } = useWallet();
    const [method, setMethod] = useState<Method>("qr");
    const [recipient, setRecipient] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [bankName, setBankName] = useState("Chase Bank");
    const [iban, setIban] = useState("");
    const [swift, setSwift] = useState("");
    const [amount, setAmount] = useState("");
    const [international, setInternational] = useState(false);
    const [currency, setCurrency] = useState("USD");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);

    const banks = [
        "J.P. Morgan Chase (USA)", "ICICI Bank (India)", "HSBC (Global)", "PayPal / Venmo", "Revolut (Europe)", "State Bank of India", "DBS Bank (Singapore)", "Barclays (UK)"
    ];

    const qrData = JSON.stringify({ name: user?.name, email: user?.email, type: 'credora-vault' });

    // --- 📷 LIVE SCANNER HUB ---
    useEffect(() => {
        if (method === "qr") {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            const onScanSuccess = (decodedText: string) => {
                scanner.clear();
                handleScan(decodedText);
                window.alert("📸 SIGNATURE CAPTURED: Successfully decoded the payment QR.");
            };

            scanner.render(onScanSuccess, () => { /* quiet */ });

            return () => {
                scanner.clear().catch(e => console.warn("Scanner Cleanup", e));
            };
        }
    }, [method]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const html5QrCode = new (window as any).Html5Qrcode("reader-hidden");
        html5QrCode.scanFile(file, true)
            .then((decodedText: string) => {
                handleScan(decodedText);
                window.alert("📁 GALLERY SCAN SUCCESS: Signature verified from image asset.");
            })
            .catch(() => {
                alert("❌ Scan Error: No clear payment signature found in this asset.");
            });
    };

    const triggerTransfer = async () => {
        setIsSecurityOpen(false);
        const val = parseFloat(amount);
        setLoading(true);
        
        if (method === "bank") {
            setProcessingStep("🔒 Initiating Secure External Bridge...");
            await new Promise(r => setTimeout(r, 1200));
            setProcessingStep(`🌍 Routing to ${bankName} via SWIFT/IBAN...`);
            await new Promise(r => setTimeout(r, 1200));
        } else if (method === "qr") {
            setProcessingStep("📷 Synchronizing QR Signature...");
            await new Promise(r => setTimeout(r, 1500));
        } else {
            setProcessingStep(`🔄 Processing ${method} routing...`);
        }

        // --- 🚀 DYNAMIC IDENTITY RESOLVER ---
        // Combines dialCode with number for surgical precision
        const finalRecipient = method === "bank" ? iban : (method === 'phone' ? (countryCode + recipient) : recipient);

        const ok = await transfer(finalRecipient, val, international, currency, method, `${message} [To: ${bankName}]`);
        
        setLoading(false);
        setProcessingStep("");
        if (ok) { 
            setRecipient(""); 
            setAmount(""); 
            setMessage("");
            setIban("");
            setSwift("");
            window.alert("💎 Transfer Complete! Funds successfully routed to recipient via the Credora Gateway.");
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) { alert("Enter a valid amount."); return; }
        setIsSecurityOpen(true);
    };

    const handleScan = (data: string) => {
        setRecipient(data);
        if (data.includes("@") || data.startsWith("credora:")) {
            setMethod("email");
            setRecipient(data.replace("credora:", ""));
        } else if (data.startsWith("ACC_") || data.includes("IBAN") || data.startsWith("external:")) {
            setMethod("bank");
            setBankName("Recognized External Hub");
            setIban(data.replace("external:", ""));
            setSwift("CREDUS33");
            setInternational(true);
        } else if (/^\d+$/.test(data)) {
            setMethod("phone");
            setRecipient(data);
        }
    };

    return (
        <div className="animate-fade-up">
            <SecurityModal 
                isOpen={isSecurityOpen} 
                onSuccess={triggerTransfer} 
                onCancel={() => setIsSecurityOpen(false)}
                mode={Math.random() > 0.5 ? 'faceid' : 'pin'}
            />

            <div className="topbar">
                <div className="topbar-title">
                    <h1>Executive Gateway</h1>
                    <p>Dispatch capital via QR Vision, Mobile IDs, or Global SWIFT Bridge</p>
                </div>
            </div>

            <div className="section-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                {/* Send Panel */}
                <div className="glass section-card" style={{ background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3>💸 Dispatch Capital</h3>
                    </div>
                    
                    <div className="method-tabs" style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                        <button className={`tab-btn ${method === 'qr' ? 'active' : ''}`} onClick={() => { setMethod('qr'); setRecipient(''); }}>📷 Vision</button>
                        <button className={`tab-btn ${method === 'phone' ? 'active' : ''}`} onClick={() => { setMethod('phone'); setRecipient(''); }}>📱 Mobile</button>
                        <button className={`tab-btn ${method === 'email' ? 'active' : ''}`} onClick={() => { setMethod('email'); setRecipient(''); }}>📧 Email</button>
                        <button className={`tab-btn ${method === 'bank' ? 'active' : ''}`} onClick={() => { setMethod('bank'); setRecipient(''); }}>🏛️ Bank</button>
                    </div>

                    <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {method === "qr" && (
                            <div className="scan-zone" style={{ padding: '0px', overflow: 'hidden', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                                <div id="reader" style={{ width: '100%', background: '#000' }}></div>
                                <div id="reader-hidden" style={{ display: 'none' }}></div>
                                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                                    <h3>Active High-Resolution Vision</h3>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Scan any QR signature, or upload a digital payment asset.</p>
                                    
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 20 }}>
                                        <label className="btn btn-ghost" style={{ fontSize: '0.7rem', border: '1px solid var(--indigo-glow)', cursor: 'pointer' }}>
                                            📁 Upload QR
                                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                                        </label>
                                        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.7rem' }} onClick={() => handleScan("7778889990")}>📱 Mode Test</button>
                                        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.7rem' }} onClick={() => handleScan("client.samyak@gmail.com")}>📧 Mode Test</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {recipient && (
                            <div style={{ padding: '12px', background: 'var(--emerald-glow)', color: 'var(--emerald)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,138,0,0.1)', marginBottom: '8px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>✓ RECIPIENT IDENTITY LOCKED</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{recipient}</div>
                            </div>
                        )}

                        <div className="input-group">
                            <label>
                                {method === 'qr' && "Scanner Target ID"}
                                {method === 'phone' && "Target Mobile Number"}
                                {method === 'email' && "Beneficiary Email ID"}
                                {method === 'bank' && "Target Account Number / IBAN"}
                            </label>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: method === 'phone' ? '120px 1fr' : '1fr', gap: '8px' }}>
                                {method === 'phone' && (
                                    <select 
                                        value={countryCode} 
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'white', fontWeight: 600 }}
                                    >
                                        {currencies.map(c => (
                                            <option key={c.code} value={c.dialCode}>{c.flag} {c.dialCode}</option>
                                        ))}
                                    </select>
                                )}
                                <input 
                                    type={method === 'phone' ? 'tel' : 'text'} 
                                    value={method === 'bank' ? iban : recipient} 
                                    onChange={(e) => method === "bank" ? setIban(e.target.value) : setRecipient(e.target.value)}
                                    placeholder={
                                        method === 'bank' ? "US99 4820 ..." : 
                                        (method === 'phone' ? "XXXXX XXXXX" : 
                                        (method === 'email' ? "name@example.com" : "Select a method..."))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {method === "bank" && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="input-group">
                                    <label>SWIFT / BIC Code</label>
                                    <input type="text" value={swift} onChange={(e) => setSwift(e.target.value)} placeholder="CREDUS33" required />
                                </div>
                                <div className="input-group">
                                    <label>Destination Institution</label>
                                    <select value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'white' }}>
                                        {banks.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label>Amount to Dispatch</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '8px' }}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                                        {currencies.find(c => c.code === currency)?.symbol}
                                    </span>
                                    <input 
                                        type="number" 
                                        value={amount} 
                                        onChange={(e) => setAmount(e.target.value)}
                                        style={{ paddingLeft: '32px' }}
                                        placeholder="0.00"
                                        required 
                                    />
                                </div>
                                <select 
                                    value={currency} 
                                    onChange={(e) => {
                                        setCurrency(e.target.value);
                                        const cCode = currencies.find(c => c.code === e.target.value)?.dialCode;
                                        if (cCode) setCountryCode(cCode);
                                    }}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'white', fontWeight: 600 }}
                                >
                                    {currencies.map(c => (
                                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                            <input type="checkbox" checked={international} onChange={(e) => setInternational(e.target.checked)} id="int-toggle" />
                            <label htmlFor="int-toggle" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>🌍 Enable Global SWIFT Routing (Cross-Border)</label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading || !isMarketOpen}
                            style={{ padding: '18px', fontSize: '1.05rem', marginTop: '10px' }}
                        >
                            {loading ? processingStep : `Authorize & Dispatch Capital 🚀`}
                        </button>
                    </form>
                </div>

                {/* Receive Panel */}
                <div className="glass section-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                    <h3 style={{ color: 'white', marginBottom: '24px' }}>📥 Receive Capital</h3>
                    <div className="qr-container" style={{ 
                        background: 'white', padding: '24px', borderRadius: '16px', display: 'inline-block',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        <QRCodeSVG value={qrData} size={200} level="H" includeMargin={true} />
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Platinum Vault ID</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{user?.email}</div>
                    </div>
                    <p style={{ marginTop: '24px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        Display this foundational signature to any global institution to receive instant liquidity.
                    </p>
                    <button className="btn btn-ghost" style={{ marginTop: '20px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', width: '100%' }} onClick={() => {
                        navigator.clipboard.writeText(user?.email || '');
                        window.alert('📋 Platinum ID Copied to Clipboard');
                    }}>
                        Copy Vault Address
                    </button>
                </div>
            </div>
        </div>
    );
}
