const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // --- 🛡️ CREDORA SECURITY SHIELD: IDENTITY VERIFICATION ---
  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No Security Signature Found. Authorization Denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Security Signature Invalid or Expired.' });
  }
};
