import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import { OAuth2Client } from "google-auth-library";
import midtransClient from "midtrans-client";
import db from "./server/db";
import fs from "fs";

declare module 'express-session' {
  interface SessionData {
    user: any;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || "syskop-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
    }
  }));

  // --- Google OAuth ---
  const appUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'http://localhost:3000';
  const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${appUrl}/auth/google/callback`
  );

  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = req.query.redirectUri as string || `${appUrl}/auth/google/callback`;
    
    const tempClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const url = tempClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      state: redirectUri // Pass redirectUri in state to use it in callback
    });
    res.json({ url });
  });

  app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
    const { code, state } = req.query;
    const redirectUri = (state as string) || `${appUrl}/auth/google/callback`;
    
    const tempClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    try {
      const { tokens } = await tempClient.getToken(code as string);
      tempClient.setCredentials(tokens);
      
      const ticket = await tempClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      // Upsert user in DB
      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(payload?.email) as any;
      if (!user) {
        const id = `google-${payload?.sub}`;
        db.prepare('INSERT INTO users (id, email, name, role, google_id) VALUES (?, ?, ?, ?, ?)')
          .run(id, payload?.email, payload?.name, 'member', payload?.sub);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      }
      
      (req.session as any).user = user;

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // --- Midtrans Payment Gateway ---
  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy-key',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy-key'
  });

  app.post("/api/payment/create", async (req, res) => {
    const { amount, orderId, customerDetails } = req.body;
    
    const parameter = {
      transaction_details: {
        order_id: orderId || `ORDER-${Date.now()}`,
        gross_amount: amount
      },
      credit_card: {
        secure: true
      },
      customer_details: customerDetails
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Auth API ---
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
      }
      
      const id = `user-${Date.now()}`;
      db.prepare('INSERT INTO users (id, email, name, role, password) VALUES (?, ?, ?, ?, ?)')
        .run(id, email, name, 'member', password);
        
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      (req.session as any).user = user;
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      (req.session as any).user = user;
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    res.json({ user: (req.session as any).user || null });
  });

  app.get("/api/system/status", (req, res) => {
    try {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
      res.json({
        status: 'healthy',
        database: 'SQLite',
        users: userCount.count,
        uptime: process.uptime(),
        version: '1.2.0'
      });
    } catch (error) {
      res.status(500).json({ status: 'unhealthy', error: 'Database connection failed' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // --- Data API ---
  app.get("/api/members", (req, res) => {
    const members = db.prepare('SELECT * FROM members').all() as any[];
    const mapped = members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      type: m.type,
      status: m.status,
      joinDate: m.join_date
    }));
    res.json(mapped);
  });

  app.post("/api/members", (req, res) => {
    const { id, name, email, type, status, joinDate } = req.body;
    db.prepare('INSERT INTO members (id, name, email, type, status, join_date) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, email, type, status, joinDate);
    res.json({ success: true });
  });

  app.delete("/api/members/:id", (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    res.json({ success: true });
  });

  app.get("/api/loans", (req, res) => {
    const loans = db.prepare('SELECT * FROM loans').all() as any[];
    const mapped = loans.map(l => ({
      id: l.id,
      memberId: l.member_id,
      memberName: l.member_name,
      amount: l.amount,
      purpose: l.purpose,
      status: l.status,
      date: l.date
    }));
    res.json(mapped);
  });

  app.patch("/api/loans/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE loans SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  });

  app.post("/api/loans", (req, res) => {
    const { id, memberId, memberName, amount, purpose, status, date } = req.body;
    db.prepare('INSERT INTO loans (id, member_id, member_name, amount, purpose, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, memberId, memberName, amount, purpose, status, date);
    res.json({ success: true });
  });

  app.get("/api/savings", (req, res) => {
    const savings = db.prepare('SELECT * FROM savings').all() as any[];
    const mapped = savings.map(s => ({
      id: s.id,
      memberId: s.member_id,
      memberName: s.member_name,
      amount: s.amount,
      type: s.type,
      date: s.date
    }));
    res.json(mapped);
  });

  // Vite middleware for development or static serving for production
  const isProduction = process.env.NODE_ENV === "production" || !process.env.VITE_DEV_SERVER;
  const distPath = path.join(__dirname, "dist");
  
  if (isProduction && fs.existsSync(distPath)) {
    console.log("Serving from PRODUCTION (dist)");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("Serving from DEVELOPMENT (Vite)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
