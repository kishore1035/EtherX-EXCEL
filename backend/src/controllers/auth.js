import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../utils/database.js';

export async function sendOtp(req, res) {
  const { emailOrPhone } = req.body;

  if (!emailOrPhone) {
    return res.status(400).json({ error: 'Email or phone required' });
  }

  // TODO: Implement actual OTP sending via Twilio or SendGrid
  // For now, generate a mock OTP
  const otp = Math.random().toString().slice(2, 8);
  
  console.log(`✉️ Mock OTP for ${emailOrPhone}: ${otp}`);
  
  // Store OTP in cache/database with expiry (10 minutes)
  // For demo, we'll just return success
  
  res.json({ success: true, message: `OTP sent to ${emailOrPhone}`, mock_otp: otp });
}

export async function verifyOtp(req, res) {
  const { emailOrPhone, otp } = req.body;

  if (!emailOrPhone || !otp) {
    return res.status(400).json({ error: 'Email/phone and OTP required' });
  }

  // TODO: Verify actual OTP from database/cache
  // For demo, accept any OTP with correct length
  if (otp.length !== 6) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  try {
    const db = getDatabase();
    
    // Find or create user
    const isEmail = emailOrPhone.includes('@');
    const column = isEmail ? 'email' : 'phone';
    
    let user = null;
    await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE ${column} = ?`,
        [emailOrPhone],
        (err, row) => {
          if (err) reject(err);
          else {
            user = row;
            resolve();
          }
        }
      );
    });

    if (!user) {
      // Create new user
      const userId = uuidv4();
      const userData = {
        id: userId,
        name: isEmail ? emailOrPhone.split('@')[0] : 'User',
        [isEmail ? 'email' : 'phone']: emailOrPhone,
      };

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (id, name, ${isEmail ? 'email' : 'phone'}) VALUES (?, ?, ?)`,
          [userId, userData.name, emailOrPhone],
          (err) => {
            if (err) reject(err);
            else {
              user = userData;
              resolve();
            }
          }
        );
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email || '', phone: user.phone || '' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
}

export async function signup(req, res) {
  const { name, email, phone } = req.body;

  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name and email/phone required' });
  }

  try {
    const db = getDatabase();
    const userId = uuidv4();

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, name, email, phone) VALUES (?, ?, ?, ?)',
        [userId, name, email || null, phone || null],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({
      success: true,
      userId,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email or phone already exists' });
    }
    res.status(500).json({ error: 'Signup failed' });
  }
}

export async function getMe(req, res) {
  try {
    const db = getDatabase();
    
    let user = null;
    await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, phone FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else {
            user = row;
            resolve();
          }
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function logout(req, res) {
  // Token is stateless, so just return success
  res.json({ success: true, message: 'Logged out' });
}

export async function deactivateAccount(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET status = ?, deactivated_at = ? WHERE id = ?',
        ['deactivated', new Date().toISOString(), userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
}

export async function deleteAccount(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    // Delete user's spreadsheets first (spreadsheets.owner_id references users.id)
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM spreadsheets WHERE owner_id = ?',
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Delete user account
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM users WHERE id = ?',
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}
