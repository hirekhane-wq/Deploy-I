import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Uses VITE_API_URL from .env in production, or localhost for local dev
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


/* ─── Types ─── */
export type TransactionType = "SEND" | "RECEIVE" | "BONUS" | "DEPOSIT";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  recipient?: string;
  sender?: string;
  date: string;
  method?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  balance: number;
  currency: string;
  kycStatus: "unverified" | "pending" | "verified";
  createdAt: string;
}

export type Page = "dashboard" | "transfer" | "history" | "analytics" | "kyc";

const INITIAL_FX_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 98.18,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.4,
  CAD: 1.36,
  AUD: 1.53,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  SGD: 1.35,
  CNY: 7.23,
  HKD: 7.82,
  NZD: 1.68,
  CHF: 0.90,
  RUB: 92.50,
  TRY: 32.20,
  PHP: 57.50,
  MYR: 4.70,
  THB: 36.80,
  IDR: 16100.0,
  VND: 25400.0,
  KRW: 1370.0,
  BRL: 5.15,
  MXN: 16.70,
  ZAR: 18.80,
  ARS: 880.0,
};

/* ─── Context shape ─── */
interface WalletCtx {
  user: User | null;
  page: Page;
  transactions: Transaction[];
  notifications: string[];
  rates: Record<string, number>;
  isMarketOpen: boolean;
  virtualAccount: any;
  setPage: (p: Page) => void;
  login: (name: string, email: string, age: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  deposit: (amount: number) => Promise<void>;
  depositGlobal: (amount: number, method: string) => Promise<boolean>;
  transfer: (recipient: string, amount: number, international: boolean, targetCurrency?: string, method?: string, message?: string) => Promise<boolean>;
  verifyKYC: () => Promise<void>;
  dismissNotification: (i: number) => void;
  notify: (msg: string) => void;
}

const Ctx = createContext<WalletCtx | undefined>(undefined);

/* ─── Provider ─── */
// Removed API_URL in favor of unified API_BASE at the top of the file

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [page, setPage] = useState<Page>("dashboard");
  const [rates, setRates] = useState<Record<string, number>>(INITIAL_FX_RATES);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [virtualAccount, setVirtualAccount] = useState<any>(null);

  // Fetch Logic
  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const resp = await fetch(`${API_BASE}/wallet/dashboard`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        setTransactions(data.transactions);
        setUser(u => u ? { ...u, balance: data.balance, kycStatus: data.kycStatus || u.kycStatus } : null);
        setVirtualAccount(data.virtualAccount);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token, fetchDashboard]);

  // LIVE FX API Integration (Frankfurter)
  const fetchLiveRates = useCallback(async () => {
    try {
      const resp = await fetch("https://api.frankfurter.app/latest?from=USD");
      const data = await resp.json();
      if (data && data.rates) {
        setRates(prev => ({
          ...prev,
          ...data.rates,
          USD: 1.0 // Ensure USD stays parity
        }));
        console.log("🌍 Real-world FX Rates Synced from Global Market");
      }
    } catch (err) {
      console.warn("⚠️ FX API Offline. Using cached/simulated rates.", err);
    }
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates]);

  // Dynamic FX Market Simulation (Jitter)
  useEffect(() => {
    const marketInterval = setInterval(() => {
      setRates(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(curr => {
          if (curr === "USD") return;
          const jitter = 1 + (Math.random() * 0.001 - 0.0005);
          next[curr] = parseFloat((next[curr] * jitter).toFixed(4));
        });
        return next;
      });
      if (Math.random() > 0.98) setIsMarketOpen(p => !p);
    }, 15000);

    return () => clearInterval(marketInterval);
  }, []);

  // Persist User locally
  useEffect(() => {
    if (user) localStorage.setItem("credora_user", JSON.stringify(user));
    else localStorage.removeItem("credora_user");
  }, [user]);

  const notify = useCallback((msg: string) => {
    setNotifications(p => [...p, msg]);
    setTimeout(() => setNotifications(p => p.slice(1)), 6000);
  }, []);

  const dismissNotification = useCallback((i: number) => {
    setNotifications(p => p.filter((_, idx) => idx !== i));
  }, []);

  /* ── Actions ── */
  const login = async (name: string, email: string, age: string, phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, age, phone, password })
      });
      const data = await res.json();
      if (res.ok) { // Changed from data.token to res.ok for consistency with other API calls
        localStorage.setItem("credora_token", data.token); // Use credora_token for consistency
        setToken(data.token);
        // Assuming the login response directly contains user data or a separate call is needed
        // If user data is in data.user, then: setUser(data.user);
        // If a separate call is needed, then:
        const userRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { "Authorization": `Bearer ${data.token}` }
        });
        const userData = await userRes.json();
        setUser(userData);
        setNotifications(prev => ["✓ EXECUTIVE IDENTITY VERIFIED", ...prev]);
        return true;
      } else {
        notify(`❌ Login Error: ${data.message}`); // Use existing notify function
        return false;
      }
    } catch (err) {
      console.error(err);
      notify("❌ Server connection lost. Please ensure the backend is running."); // Use existing notify function
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTransactions([]);
    setPage("dashboard");
    localStorage.removeItem("credora_user");
    localStorage.removeItem("credora_token");
  };

  const deposit = async (amount: number) => {
    if (!token || !user) return;
    try {
      notify("📲 Initializing Razorpay Secure Checkout...");

      // 0. Get Public Key from Backend
      const keyResp = await fetch(`${API_BASE}/wallet/razorpay/key`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const { key } = await keyResp.json();

      // 1. Create Order
      const orderResp = await fetch(`${API_BASE}/wallet/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const orderData = await orderResp.json();

      if (!orderResp.ok) {
        notify(`❌ Razorpay Order Error: ${orderData.message}`);
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: key, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Credora Wallet",
        description: "Add Funds to your Credora account",
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyResp = await fetch(`${API_BASE}/wallet/razorpay/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount // in USD equivalent for balance update
            })
          });

          const verifyData = await verifyResp.json();
          if (verifyResp.ok) {
            setUser(u => u ? { ...u, balance: verifyData.balance } : null);
            fetchDashboard();
            notify("✅ Razorpay Deposit Successful!");
          } else {
            notify(`❌ Verification Failed: ${verifyData.message}`);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#0070ba",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      notify("❌ Could not connect to Razorpay. Check your internet.");
    }
  };
  const depositGlobal = async (amount: number, method: string): Promise<boolean> => {
    if (!token || !user) return false;
    try {
      notify(`🔐 Processing Global ${method} Bridge...`);
      const resp = await fetch(`${API_BASE}/wallet/deposit-global`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount, method })
      });
      const data = await resp.json();
      if (resp.ok) {
        setUser(u => u ? { ...u, balance: data.balance } : null);
        fetchDashboard();
        notify(`✅ Success! $${amount} USD loaded via ${method}.`);
        return true;
      } else {
        notify(`❌ Global Bridge Error: ${data.message}`);
        return false;
      }
    } catch (err) {
      notify("❌ Server connection lost. Check your network.");
      return false;
    }
  };

  const transfer = async (recipient: string, amount: number, international: boolean, targetCurrency = "USD", method = "phone", message = ""): Promise<boolean> => {
    if (!user || !token) return false;
    if (amount <= 0) { notify("Please enter a valid amount."); return false; }
    if (user.balance < amount) { notify("❌ Insufficient funds."); return false; }

    const rate = international && targetCurrency !== "USD" ? (rates[targetCurrency] || 1) : 1;
    const convertedAmount = amount * rate;

    notify(`⏳ Processing transfer via Credora Secure Vault...`);

    try {
      const resp = await fetch(`${API_BASE}/wallet/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ recipient, amount, international, targetCurrency, method, message, convertedAmount })
      });
      const data = await resp.json();
      if (resp.ok) {
        setUser(u => u ? { ...u, balance: data.balance } : null);
        fetchDashboard();
        notify(`✅ Successfully sent to [${recipient}].`);
        return true;
      } else {
        notify(`❌ Transfer Failed: ${data.message}`);
        return false;
      }
    } catch (err) {
      notify("❌ Server connection error during transfer.");
      return false;
    }
  };

  const verifyKYC = async () => {
    if (!token) return;
    try {
      const resp = await fetch(`${API_BASE}/wallet/verify-kyc`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await resp.json();
      if (resp.ok) {
        setUser(u => u ? { ...u, kycStatus: data.kycStatus } : null);
        notify("📄 Documents uploaded! Our compliance team will review them within 24h.");
        setPage("dashboard");
      } else {
        notify(`❌ KYC Error: ${data.message}`);
      }
    } catch (err) {
      notify("❌ Server connection error during KYC.");
    }
  };

  return (
    <Ctx.Provider value={{
      user, page, transactions, notifications, rates, isMarketOpen, virtualAccount,
      setPage, login, logout, deposit, depositGlobal, transfer, verifyKYC, dismissNotification, notify
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useWallet = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWallet used outside WalletProvider");
  return c;
};
