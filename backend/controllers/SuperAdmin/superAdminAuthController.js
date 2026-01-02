const jwt = require('jsonwebtoken');

const superAdmins = [
  { email: 'superadminn1@gmail.com', password: 'password@123' },
  { email: 'superadmin2@gmail.com', password: 'superadmin@123' },
];

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'your_secret_key';
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const matched = superAdmins.find((s) => s.email === email && s.password === password);
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: email, email, role: 'superadmin' });
    return res.json({ token, email });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.profile = async (req, res) => {
  // req.superadmin is set by middleware
  return res.json({ email: req.superadmin.email, role: 'superadmin' });
};
