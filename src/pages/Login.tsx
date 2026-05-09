import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";

const Login: React.FC = () => {
  const { login } = useWallet();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(name, email, age, "", password);
    if (!success) alert("Authentication Protocol Failed. Please verify your Executive Credentials.");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const success = await login("Samyak Hirekhan", "sykhirekhan@gmail.com", "24", "7778889990", "admin123");
    if (!success) alert("Google Identity Resolution Failed.");
    setLoading(false);
  };

  return (
    <div className="login-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
      <div className="login-box" style={{ width: 440, padding: 48, background: "white", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
        
        <header style={{ marginBottom: 40, textAlign: 'left' }}>
            <div style={{ width: 48, height: 48, background: "var(--indigo)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m12 8-4 4 4 4 4-4-4-4z"/>
                </svg>
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0 }}>Identity Gateway</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Authorize your session to access the Global Credora Network</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {isRegister && (
            <div className="input-group">
              <label>Executive Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Samyak Hirekhan" required />
            </div>
          )}

          <div className="input-group">
            <label>Executive ID / Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@credora.com" required />
          </div>

          <div className="input-group">
            <label>Security Signature / Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: 54, fontSize: '1rem', fontWeight: 700 }} disabled={loading}>
            {loading ? "Authenticating Protocol..." : isRegister ? "Create Global Account" : "Access Platinum Vault"}
          </button>
        </form>

        <div style={{ margin: '24px 0', borderTop: '1px solid #efefef', position: 'relative', textAlign: 'center' }}>
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 12px', fontSize: '10px', fontWeight: 700, color: '#aaa' }}>OR CONTINUE WITH</span>
        </div>

        <button onClick={handleGoogleLogin} style={{ width: '100%', height: 54, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="20" />
            Continue with Google
        </button>

        <footer style={{ marginTop: 32, textAlign: 'center', fontSize: '0.9rem' }}>
          {isRegister ? "Existing Executive? " : "New to the Network? "}
          <span onClick={() => setIsRegister(!isRegister)} style={{ color: "var(--indigo)", fontWeight: 800, cursor: "pointer" }}>
            {isRegister ? "Login here" : "Get Started"}
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Login;
