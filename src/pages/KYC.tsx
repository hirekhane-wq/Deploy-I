import { useState } from "react";
import { useWallet } from "../context/WalletContext";

export default function KYC() {
    const { verifyKYC } = useWallet();
    const [fileUploaded, setFileUploaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!fileUploaded) {
            alert("Please upload your ID document first.");
            return;
        }
        setLoading(true);
        await verifyKYC();
        setLoading(false);
    };

    return (
        <div className="animate-fade-up">
            <div className="topbar">
                <div className="topbar-title">
                    <h1>Identity Verification (KYC)</h1>
                    <p>Secure your account by verifying your identity</p>
                </div>
            </div>

            <div className="section-grid">
                <div className="glass section-card" style={{ gridColumn: "span 2", textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 20 }}>🆔</div>
                    <h2>Know Your Customer (KYC)</h2>
                    <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 30px" }}>
                        To prevent fraud and maintain production-level security, we require all users to upload a valid government ID. 
                        Once verified, you will have higher transaction limits and full access to external transfers.
                    </p>

                    <div 
                        className="upload-box" 
                        style={{ 
                            border: "2px dashed rgba(255,255,255,0.1)", 
                            borderRadius: 12, 
                            padding: 40, 
                            cursor: "pointer",
                            background: fileUploaded ? "rgba(16, 185, 129, 0.05)" : "transparent",
                            borderColor: fileUploaded ? "var(--emerald)" : "rgba(255,255,255,0.1)",
                            transition: "all 0.3s ease"
                        }}
                        onClick={() => setFileUploaded(true)}
                    >
                        {fileUploaded ? (
                            <div>
                                <div style={{ color: "var(--emerald)", fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>✅ ID_Card_Samyak.png</div>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>Document captured successfully. Ready to submit.</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>📤</div>
                                <strong>Click to upload Government ID</strong>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginTop: 8 }}>Supports PNG, JPG (Max 5MB)</p>
                            </div>
                        )}
                    </div>

                    <button 
                        className="btn btn-primary" 
                        style={{ marginTop: 30, padding: "14px 40px", fontSize: "1rem" }}
                        onClick={handleVerify}
                        disabled={loading || !fileUploaded}
                    >
                        {loading ? "🔄 Submitting to Vault..." : "Submit for Verification"}
                    </button>
                    
                    <p style={{ marginTop: 20, fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                         🛡️ Your data is encrypted with 256-bit AES protection.
                    </p>
                </div>
            </div>
        </div>
    );
}
