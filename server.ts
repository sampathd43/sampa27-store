import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'LankaMart Unified Retail Engine V1',
    modules: ['Product DB', 'Categories', 'Stock System', 'Online Order Engine', 'Payment Gateway']
  });
});

// Payment Gateway Simulator: 3D Secure OTP verification API
app.post('/api/payment/verify-otp', (req, res) => {
  const { orderId, otp, amount, cardLast4 } = req.body;

  if (!otp || otp.length < 4) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code provided.' });
  }

  const transactionId = `TXN-IPG-${Math.floor(100000 + Math.random() * 900000)}`;

  return res.json({
    success: true,
    transactionId,
    orderId,
    amount,
    cardLast4: cardLast4 || '4242',
    gateway: 'PayHere / 3D-Secure Sri Lanka IPG',
    status: 'PAID',
    verifiedAt: new Date().toISOString(),
    message: 'Card authentication successful! Transaction approved by issuing bank.'
  });
});

// LankaQR Verification API
app.post('/api/payment/lankaqr-verify', (req, res) => {
  const { orderId, amount, bankApp } = req.body;
  const qrRef = `LQR-${Math.floor(10000000 + Math.random() * 90000000)}`;

  return res.json({
    success: true,
    qrReference: qrRef,
    orderId,
    amount,
    bankApp: bankApp || 'Commercial Bank Q+ / FriMi',
    paymentStatus: 'PAID',
    settlement: 'CEFT / LankaPay Real-Time Interbank',
    verifiedAt: new Date().toISOString(),
    message: 'LankaQR instant payment verified successfully!'
  });
});

// Bank Slip Verification API
app.post('/api/payment/bank-slip', (req, res) => {
  const { orderId, bankName, referenceNumber, slipImage } = req.body;

  if (!referenceNumber) {
    return res.status(400).json({ success: false, message: 'Bank deposit reference number is required.' });
  }

  return res.json({
    success: true,
    orderId,
    bankName,
    referenceNumber,
    hasSlip: !!slipImage,
    verifiedAt: new Date().toISOString(),
    message: 'Bank transfer slip recorded. Cashier verified.'
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LankaMart Unified Retail Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
