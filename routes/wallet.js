const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// --- 🛡️ CREDORA EXECUTIVE WALLET CORE: RE-BORN ---
// DESIGNED FOR 100% BRANDED P2P AND GLOBAL BANK DISPATCH

// SECURITY FIREWALL: VERIFY SESSION SIGNATURE
const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No Identity Signature Found' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.user.id;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid Session Signature' });
    }
};

// ===== RAZORPAY INSTANCE =====
let razorpay;
try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} catch (e) {
    console.warn('⚠️ Razorpay not configured. Deposit via Razorpay will be unavailable.');
}

// GET EXECUTIVE DASHBOARD (BALANCE & ACTIVITY)
router.get('/dashboard', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
        
        const virtualAccount = {
            accountNumber: "2284" + req.userId.slice(-8),
            routingNumber: "021000001",
            vpa: `${user.name.split(' ')[0].toLowerCase()}@credora`,
            swift: "CREDORAUS33"
        };
        res.json({ balance: user.balance, transactions, kycStatus: user.kycStatus, virtualAccount });
    } catch (err) {
        res.status(500).json({ message: 'Vault Access Error' });
    }
});

// MULTICURRENCY SETTINGS
const EXCHANGE_RATES = {
    USD: 1,
    INR: 98.18,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67
};

// ===== RAZORPAY: GET PUBLIC KEY =====
router.get('/razorpay/key', auth, (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID) {
        return res.status(500).json({ message: 'Razorpay Key not configured on server' });
    }
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// ===== RAZORPAY: CREATE ORDER =====
router.post('/razorpay/order', auth, async (req, res) => {
    try {
        if (!razorpay) return res.status(500).json({ message: 'Razorpay not configured' });
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        // Convert USD to INR paise for Razorpay (Razorpay works in INR paise)
        const amountInPaise = Math.round(amount * EXCHANGE_RATES.INR * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: 'rcpt_' + Date.now(),
            notes: { userId: req.userId, usdAmount: amount, platform: 'credora' }
        });
        res.json(order);
    } catch (err) {
        console.error('Razorpay order error:', err);
        res.status(500).json({ message: 'Could not create Razorpay order' });
    }
});

// ===== RAZORPAY: VERIFY PAYMENT =====
router.post('/razorpay/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
        }

        // Credit user's wallet (amount is in USD)
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.balance += amount;
        await user.save();

        // Log transaction
        const tx = new Transaction({
            userId: req.userId,
            type: 'DEPOSIT',
            amount,
            method: 'Razorpay',
            message: `Deposited $${amount} via Razorpay`,
            date: new Date()
        });
        await tx.save();

        res.json({ balance: user.balance, message: 'Deposit verified and credited' });
    } catch (err) {
        console.error('Razorpay verify error:', err);
        res.status(500).json({ message: 'Payment verification server error' });
    }
});

// ===== GLOBAL DEPOSIT (Non-Razorpay methods) =====
router.post('/deposit-global', auth, async (req, res) => {
    try {
        const { amount, method } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.balance += amount;
        await user.save();

        const tx = new Transaction({
            userId: req.userId,
            type: 'DEPOSIT',
            amount,
            method: method || 'Global Bridge',
            message: `Deposited $${amount} via ${method || 'Global Bridge'}`,
            date: new Date()
        });
        await tx.save();

        res.json({ balance: user.balance, message: `$${amount} deposited via ${method}` });
    } catch (err) {
        res.status(500).json({ message: 'Global deposit error', error: err.message });
    }
});

// P2P AND GLOBAL BANK DISPATCH ENGINE
router.post('/transfer', auth, async (req, res) => {
    const { recipient, amount, targetCurrency, method, message, convertedAmount, international } = req.body;
    try {
        const sender = await User.findById(req.userId);
        if (!sender) return res.status(404).json({ message: 'Sender not found' });
        if (sender.balance < amount) return res.status(400).json({ message: 'Insufficient Foundational Liquidity' });

        // RESOLVE RECIPIENT IDENTITY
        const recipientUser = await User.findOne({ 
            $or: [{ email: recipient }, { name: recipient }, { phone: recipient }] 
        });

        if (!recipientUser && method !== 'bank') {
            return res.status(404).json({ message: "Recipient Unknown: Not a member of the Credora network." });
        }

        // EXECUTE DISPATCH (DEDUCT SENDER)
        sender.balance -= amount;
        await sender.save();

        // LOG SENDER TRANSACTION
        const tx = new Transaction({
            userId: req.userId,
            type: 'SEND',
            amount,
            recipient,
            message,
            method,
            international,
            targetCurrency,
            convertedAmount,
            date: new Date()
        });
        await tx.save();

        // CREDIT RECIPIENT (IF INTERNAL MEMBER)
        if (recipientUser) {
            const receivedVal = international ? convertedAmount : amount;
            recipientUser.balance += receivedVal;
            await recipientUser.save();

            const receiveTx = new Transaction({
                userId: recipientUser._id,
                type: 'RECEIVE',
                amount: receivedVal,
                sender: sender.name,
                message,
                method: 'Credora Instant Hub',
                date: new Date()
            });
            await receiveTx.save();
        }

        res.json({ message: 'Executive Dispatch Complete', balance: sender.balance, credoraRecipientFound: !!recipientUser });
    } catch (err) {
        res.status(500).json({ message: 'Dispatch Execution Error', error: err.message });
    }
});

// ===== KYC VERIFICATION =====
router.post('/verify-kyc', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.kycStatus = 'pending';
        await user.save();

        res.json({ kycStatus: user.kycStatus, message: 'KYC documents submitted for review' });
    } catch (err) {
        res.status(500).json({ message: 'KYC verification error' });
    }
});

module.exports = router;
