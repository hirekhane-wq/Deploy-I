const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// --- 🛡️ CREDORA EXECUTIVE IDENTITY HUB: RE-BORN ---

// GLOBAL FOUNDER HANDSHAKE: THE "INFINITE LIQUIDITY" PROTOCOL
const checkFounderStatus = async (user) => {
    if (!user) return;
    const founderEmails = ["sykhirekhan@gmail.com", "samyak@google.com"];
    const isFounder = founderEmails.some(f => user.email.toLowerCase() === f.toLowerCase()) || user.name.toLowerCase().includes("samyak hirekhan");

    if (isFounder) {
        let changed = false;
        if (user.role !== 'Platinum Founder') { user.role = 'Platinum Founder'; changed = true; }
        if (user.status !== 'Executive') { user.status = 'Executive'; changed = true; }
        if (user.balance < 1000000) { user.balance = 1000000.00; changed = true; }
        if (changed) await user.save();
    }
};

// --- AUTH DATA ROUTE (/me) ---
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Executive Profile Not Found' });

        await checkFounderStatus(user); // Force refill on every access
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Identity Error');
    }
});

// --- GOOGLE & MANUAL IDENTITY LOGIN (/login) ---
router.post('/login', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        // FOUNDER HIJACK PROTECTION: Auto-create if it's the Founder
        const founderEmails = ["sykhirekhan@gmail.com", "samyak@google.com"];
        const isFounder = founderEmails.some(f => email.toLowerCase() === f.toLowerCase());

        if (isFounder && !user) {
            user = new User({
                name: name || "Samyak Hirekhan",
                email: email,
                password: await bcrypt.hash(password || "admin123", 10),
                role: 'Platinum Founder',
                status: 'Executive',
                balance: 1000000.00,
                kycStatus: "verified"
            });
            await user.save();
        }

        if (!user) return res.status(400).json({ message: 'Invalid Executive Credentials' });

        // PASSWORD VERIFICATION
        const isMatch = await bcrypt.compare(password || "admin123", user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Security Signature' });

        await checkFounderStatus(user); // Force refill

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- NEW EXECUTIVE REGISTRATION (/register) ---
router.post('/register', async (req, res) => {
    const { name, email, age, phone, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Executive Identity Already Registered' });

        user = new User({ name, email, age, phone, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await checkFounderStatus(user);
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Server Registration Error');
    }
});

module.exports = router;
