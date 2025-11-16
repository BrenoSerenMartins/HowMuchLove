import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { pool, connectDB } from './db';
import { LoveStoryData, User } from '../../types';
import { protect } from './middleware/auth';
import { PLAN_PRICES } from '../../utils/planConfig';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to Database on startup
connectDB();

// --- Mercado Pago Configuration ---
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string });

// --- Middlewares ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());







// --- API Routes ---

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the HowMuchLove API! ❤️' });
});

// --- Mercado Pago Payment Routes ---


app.post('/api/payments/webhook', async (req: Request, res: Response) => {
  const { topic, id } = req.query;

  if (topic === 'payment') {
    try {
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id: Number(id) });

      if (paymentData.status === 'approved') {
        const externalReference = paymentData.external_reference;
        if (externalReference) {
          const [userEmail, planName] = externalReference.split('-');
          if (userEmail && planName) {
            await pool.query('UPDATE users SET plan = $1 WHERE email = $2', [planName, userEmail]);
            console.log(`User ${userEmail} upgraded to plan ${planName} successfully.`);
          }
        }
      }
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Error processing Mercado Pago webhook:', error);
      res.status(500).json({ message: 'Erro ao processar webhook.' });
    }
  } else {
    res.status(200).json({ status: 'ok' });
  }
});



// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});