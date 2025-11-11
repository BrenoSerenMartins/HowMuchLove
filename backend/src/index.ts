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
import { PLAN_PRICES } from './planConfig';

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

// --- SEO Middleware for Social Crawlers ---
const crawlerUserAgents = [
  'facebookexternalhit',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'Pinterest'
];

app.use(async (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = crawlerUserAgents.some(crawler => userAgent.includes(crawler));
  const isStoryUrl = req.path.startsWith('/story/');

  if (isCrawler && isStoryUrl) {
    try {
      const storyId = req.path.split('/')[2];
      if (!storyId) return next();

      const userEmail = Buffer.from(storyId, 'base64').toString('ascii');
      const storyResult = await pool.query('SELECT * FROM love_stories WHERE user_email = $1', [userEmail]);

      if (storyResult.rows.length > 0) {
        const story = storyResult.rows[0];
        const imagesResult = await pool.query('SELECT * FROM story_images WHERE story_id = $1 ORDER BY display_order ASC LIMIT 1', [story.id]);
        const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [story.user_email]);
        
        const userName = userResult.rows.length > 0 ? userResult.rows[0].name : 'Alguém especial';
        const title = `Um presente de ${userName} | HowMuchLove`;
        const description = story.story_text ? story.story_text.substring(0, 150) + '...' : 'Uma linda história de amor registrada para sempre.';
        const BASE_URL = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const imageUrl = imagesResult.rows.length > 0 ? `${BASE_URL}${imagesResult.rows[0].image_url}` : `${BASE_URL}/placeholder.jpg`;
        const pageUrl = `${BASE_URL}${req.originalUrl}`;

        const html = `
          <!DOCTYPE html>
          <html lang="pt-BR">
            <head>
              <meta charset="utf-8" />
              <title>${title}</title>
              <meta name="description" content="${description}" />
              <meta property="og:title" content="${title}" />
              <meta property="og:description" content="${description}" />
              <meta property="og:image" content="${imageUrl}" />
              <meta property="og:url" content="${pageUrl}" />
              <meta property="og:type" content="website" />
              <meta name="twitter:card" content="summary_large_image">
              <meta name="twitter:title" content="${title}">
              <meta name="twitter:description" content="${description}">
              <meta name="twitter:image" content="${imageUrl}">
            </head>
            <body>
              <h1>${title}</h1>
              <p>${description}</p>
              <img src="${imageUrl}" alt="${title}" />
            </body>
          </html>
        `;
        return res.send(html);
      }
    } catch (error) {
      console.error('Error generating SEO meta tags:', error);
    }
  }
  
  next();
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- API Routes ---

// Public Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the HowMuchLove API! ❤️' });
});

app.post('/api/register', async (req: Request, res: Response) => {
    const { name, email, pass } = req.body;
    if (!name || !email || !pass) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);

        const result = await pool.query(
        'INSERT INTO users (name, email, password, plan) VALUES ($1, $2, $3, $4) RETURNING id, name, email, plan',
        [name, email, hashedPassword, 'Gratis']
        );
        const newUser: User = result.rows[0];
        res.status(201).json(newUser);
    } catch (error: any) {
        if (error.code === '23505') {
        return res.status(409).json({ message: 'Este email já está em uso.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { email, pass } = req.body;
  if (!email || !pass) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
  try {
    const result = await pool.query('SELECT id, name, email, password, plan FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }
    const user = result.rows[0];
    
    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, plan: user.plan }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '30d' }
    );

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const userToReturn: User = { name: user.name, email: user.email, plan: user.plan };
    res.status(200).json(userToReturn);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erro ao fazer login.' });
  }
});

app.post('/api/logout', (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logout bem-sucedido.' });
});

// Protected route to get current user
app.get('/api/me', protect, async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, name, email, plan FROM users WHERE id = $1', [req.user?.id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados do usuário.' });
    }
});

// Protected Routes (require authentication)
app.post('/api/user/plan', protect, async (req: Request, res: Response) => {
  const { newPlan } = req.body;
  const userEmail = req.user?.email;

  if (!newPlan) {
    return res.status(400).json({ message: 'O novo plano é obrigatório.' });
  }

  const validPlans = ['Sonho', 'Eterno', 'Infinito'];
  if (!validPlans.includes(newPlan)) {
    return res.status(400).json({ message: 'Plano inválido.' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET plan = $1 WHERE email = $2 RETURNING id, name, email, plan',
      [newPlan, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Erro ao atualizar o plano do usuário.' });
  }
});

app.get('/api/story', protect, async (req: Request, res: Response) => {
    const userEmail = req.user?.email;
    try {
        const storyResult = await pool.query('SELECT * FROM love_stories WHERE user_email = $1', [userEmail]);
        
        if (storyResult.rows.length > 0) {
            const story = storyResult.rows[0];
            const imagesResult = await pool.query('SELECT * FROM story_images WHERE story_id = $1 ORDER BY display_order ASC', [story.id]);
            const responseData: LoveStoryData = {
                startDate: story.start_date,
                message: story.story_text,
                images: imagesResult.rows,
                layoutPosition: story.layout_position,
                youtubeUrl: story.youtube_url,
                entryButtonText: story.entry_button_text,
            };
            res.status(200).json(responseData);
        } else {
            res.status(200).json(null);
        }
    } catch (error) {
        console.error('Fetch story error:', error);
        res.status(500).json({ message: 'Erro ao buscar a história.' });
    }
});

app.delete('/api/story/image/:imageId', protect, async (req: Request, res: Response) => {
    const { imageId } = req.params;
    const userEmail = req.user?.email;

    try {
        const imageCheckResult = await pool.query(`
            SELECT si.image_url FROM story_images si
            JOIN love_stories ls ON si.story_id = ls.id
            WHERE si.id = $1 AND ls.user_email = $2
        `, [imageId, userEmail]);

        if (imageCheckResult.rows.length === 0) {
            return res.status(403).json({ message: 'Não autorizado a deletar esta imagem.' });
        }
        const imageUrl = imageCheckResult.rows[0].image_url;

        const filePath = path.join(__dirname, '../public', imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await pool.query('DELETE FROM story_images WHERE id = $1', [imageId]);

        res.status(200).json({ message: 'Imagem deletada com sucesso.' });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ message: 'Erro ao deletar a imagem.' });
    }
});

app.post('/api/story', protect, async (req: Request, res: Response) => {
    const userEmail = req.user?.email;
    let { startDate, message, images, layoutPosition, youtubeUrl, storyPassword, entryButtonText }: LoveStoryData = req.body;

    const client = await pool.connect();
    try {
        const userResult = await client.query('SELECT plan FROM users WHERE email = $1', [userEmail]);
        if (userResult.rows.length === 0) {
            throw new Error('Usuário não encontrado.');
        }
        const userPlan = userResult.rows[0].plan;

        let storyResult = await client.query('SELECT * FROM love_stories WHERE user_email = $1', [userEmail]);
        if (storyResult.rows.length === 0) {
            const newStoryResult = await client.query('INSERT INTO love_stories (user_email) VALUES ($1) RETURNING *', [userEmail]);
            storyResult.rows = newStoryResult.rows;
        }
        const storyId = storyResult.rows[0].id;

        const PLAN_LIMITS: { [key: string]: number } = { 'Sonho': 1, 'Eterno': 10, 'Infinito': 20 };
        const limit = PLAN_LIMITS[userPlan] || 1;

        const imagesToKeep = images.slice(0, limit);
        const imagesToKeepIds = new Set(imagesToKeep.map(img => img.id));

        const existingImagesResult = await client.query('SELECT id, image_url FROM story_images WHERE story_id = $1', [storyId]);
        const imagesToDelete = existingImagesResult.rows.filter(img => !imagesToKeepIds.has(img.id));

        await client.query('BEGIN');

        let updateQuery = 'UPDATE love_stories SET start_date = $1, story_text = $2, layout_position = $3, youtube_url = $4, entry_button_text = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6';
        let queryParams: any[] = [startDate, message, layoutPosition, youtubeUrl, entryButtonText, storyId];

        if (storyPassword !== undefined) {
            if (storyPassword === '') {
                updateQuery = 'UPDATE love_stories SET start_date = $1, story_text = $2, layout_position = $3, youtube_url = $4, entry_button_text = $5, story_password = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $6';
            } else {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(storyPassword, saltRounds);
                updateQuery = 'UPDATE love_stories SET start_date = $1, story_text = $2, layout_position = $3, youtube_url = $4, entry_button_text = $5, story_password = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $6';
                queryParams.push(hashedPassword);
            }
        }
        
        await client.query(updateQuery, queryParams);

        for (let i = 0; i < imagesToKeep.length; i++) {
            const image = imagesToKeep[i];
            await client.query(
                'UPDATE story_images SET display_order = $1 WHERE id = $2 AND story_id = $3',
                [i, image.id, storyId]
            );
        }

        for (const image of imagesToDelete) {
            const filePath = path.join(__dirname, '../public', image.image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            await client.query('DELETE FROM story_images WHERE id = $1', [image.id]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'História salva e sincronizada com o seu plano!' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update story error:', error);
        res.status(500).json({ message: 'Erro ao salvar a história.' });
    } finally {
        client.release();
    }
});

app.post('/api/story/upload', protect, upload.single('storyImage'), async (req: Request, res: Response) => {
    const userEmail = req.user?.email;

    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;

    try {
        const userResult = await pool.query('SELECT plan FROM users WHERE email = $1', [userEmail]);
        if (userResult.rows.length === 0) {
            throw new Error('Usuário não encontrado.');
        }
        const userPlan = userResult.rows[0].plan;

        let storyResult = await pool.query('SELECT * FROM love_stories WHERE user_email = $1', [userEmail]);
        let storyId;

        if (storyResult.rows.length === 0) {
            const newStoryResult = await pool.query('INSERT INTO love_stories (user_email) VALUES ($1) RETURNING *', [userEmail]);
            storyId = newStoryResult.rows[0].id;
        } else {
            storyId = storyResult.rows[0].id;
        }

        const imageCountResult = await pool.query('SELECT COUNT(*) FROM story_images WHERE story_id = $1', [storyId]);
        const currentImageCount = parseInt(imageCountResult.rows[0].count, 10);
        
        const PLAN_LIMITS: { [key: string]: number } = { 'Sonho': 1, 'Eterno': 10, 'Infinito': 20 };
        const limit = PLAN_LIMITS[userPlan] || 1;

        if (currentImageCount >= limit) {
            const filePath = path.join(__dirname, '../public', imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(403).json({ message: `Você atingiu o limite de ${limit} imagem(ns) para o seu plano (${userPlan}).` });
        }

        const orderResult = await pool.query('SELECT MAX(display_order) as max_order FROM story_images WHERE story_id = $1', [storyId]);
        const nextOrder = (orderResult.rows[0].max_order === null) ? 0 : orderResult.rows[0].max_order + 1;

        const newImageResult = await pool.query(
            'INSERT INTO story_images (story_id, image_url, display_order) VALUES ($1, $2, $3) RETURNING *',
            [storyId, imageUrl, nextOrder]
        );

        res.status(200).json(newImageResult.rows[0]);

    } catch (error) {
        console.error('Image upload error:', error);
        const filePath = path.join(__dirname, '../public', imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ message: 'Erro ao salvar a imagem no banco de dados.' });
    }
});

// --- Mercado Pago Payment Routes ---
app.post('/api/payments/create-preference', protect, async (req: Request, res: Response) => {
  const { planName } = req.body;
  const userEmail = req.user?.email;

  if (!planName || !PLAN_PRICES[planName]) {
    return res.status(400).json({ message: 'Plano inválido ou preço não definido.' });
  }

  const price = PLAN_PRICES[planName];
  const BASE_URL = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  try {
    const preference = new Preference(mpClient);
    const response = await preference.create({
      body: {
        items: [
          {
            title: `Plano ${planName} - HowMuchLove`,
            unit_price: price,
            quantity: 1,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: `${BASE_URL}/payment-success`,
          failure: `${BASE_URL}/payment-failure`,
          pending: `${BASE_URL}/payment-pending`,
        },
        auto_return: 'approved',
        notification_url: `${BASE_URL}/api/payments/webhook`,
        external_reference: `${userEmail}-${planName}-${Date.now()}`,
      },
    });
    res.status(200).json({ init_point: response.init_point, preferenceId: response.id });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    res.status(500).json({ message: 'Erro ao criar preferência de pagamento.' });
  }
});

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

// Public routes for stories (must be last for catch-all)
app.get('/api/public-story/:storyId', async (req: Request, res: Response) => {
    const { storyId } = req.params;
    try {
        const userEmail = Buffer.from(storyId, 'base64').toString('ascii');
        const result = await pool.query(`
            SELECT ls.*, u.plan 
            FROM love_stories ls 
            JOIN users u ON ls.user_email = u.email 
            WHERE ls.user_email = $1
        `, [userEmail]);

        if (result.rows.length > 0) {
            const story = result.rows[0];
            if (story.story_password) {
                return res.status(200).json({ requiresPassword: true, plan: story.plan });
            } else {
                const imagesResult = await pool.query('SELECT * FROM story_images WHERE story_id = $1 ORDER BY display_order ASC', [story.id]);

                const responseData: LoveStoryData = {
                    startDate: story.start_date,
                    message: story.story_text,
                    images: imagesResult.rows,
                    layoutPosition: story.layout_position,
                    youtubeUrl: story.youtube_url,
                    entryButtonText: story.entry_button_text,
                    plan: story.plan,
                };
                return res.status(200).json(responseData);
            }
        } else {
            res.status(404).json({ message: 'História não encontrada.' });
        }
    } catch (error) {
        console.error('Fetch public story error:', error);
        res.status(500).json({ message: 'O link para esta história parece estar quebrado.' });
    }
});

app.post('/api/public-story/:storyId/verify', async (req: Request, res: Response) => {
    const { storyId } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'A senha é obrigatória.' });
    }

    try {
        const userEmail = Buffer.from(storyId, 'base64').toString('ascii');
        const result = await pool.query('SELECT id, story_password FROM love_stories WHERE user_email = $1', [userEmail]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'História não encontrada.' });
        }

        const story = result.rows[0];
        if (!story.story_password) {
            return res.status(400).json({ message: 'Esta história não requer senha.' });
        }

        const passwordMatch = await bcrypt.compare(password, story.story_password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        const fullStoryResult = await pool.query('SELECT * FROM love_stories WHERE id = $1', [story.id]);
        const fullStory = fullStoryResult.rows[0];
        const imagesResult = await pool.query('SELECT * FROM story_images WHERE story_id = $1 ORDER BY display_order ASC', [fullStory.id]);

        const responseData: LoveStoryData = {
            startDate: fullStory.start_date,
            message: fullStory.story_text,
            images: imagesResult.rows,
            layoutPosition: fullStory.layout_position,
            youtubeUrl: fullStory.youtube_url,
            entryButtonText: fullStory.entry_button_text,
        };
        res.status(200).json(responseData);

    } catch (error) {
        console.error('Verify public story password error:', error);
        res.status(500).json({ message: 'Erro ao verificar a senha da história.' });
    }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
