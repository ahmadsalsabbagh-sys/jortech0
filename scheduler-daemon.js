const express = require('express');
const sqlite = require('better-sqlite3');
const path = require('path');

// Initialize Database
const dbPath = path.join(__dirname, 'data', 'scheduler.sqlite');
const db = sqlite(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS scheduled_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    chatId TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduledAt TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();
app.use(express.json());

// Basic CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Api-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Create Schedule
app.post('/api/schedule', (req, res) => {
  const { sessionId, chatId, message, scheduledAt } = req.body;
  if (!sessionId || !chatId || !message || !scheduledAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stmt = db.prepare('INSERT INTO scheduled_messages (sessionId, chatId, message, scheduledAt) VALUES (?, ?, ?, ?)');
  const result = stmt.run(sessionId, chatId, message, scheduledAt);

  res.json({ success: true, id: result.lastInsertRowid });
});

// List Schedules
app.get('/api/schedule', (req, res) => {
  const stmt = db.prepare('SELECT * FROM scheduled_messages ORDER BY scheduledAt ASC');
  const messages = stmt.all();
  res.json(messages);
});

// Cron Job (Checks every 30 seconds)
const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.API_KEY || ''; // Usually need to pass the same API key the user has configured

setInterval(async () => {
  const now = new Date().toISOString();
  
  // Find pending messages where time has come
  const stmt = db.prepare('SELECT * FROM scheduled_messages WHERE status = "pending" AND scheduledAt <= ?');
  const pending = stmt.all(now);

  for (const job of pending) {
    try {
      console.log(`[Scheduler] Sending job ${job.id} to ${job.chatId}`);
      
      const response = await fetch(`${WAHA_URL}/sessions/${job.sessionId}/messages/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY,
        },
        body: JSON.stringify({
          chatId: job.chatId,
          text: job.message
        })
      });

      if (response.ok) {
        db.prepare('UPDATE scheduled_messages SET status = "sent" WHERE id = ?').run(job.id);
        console.log(`[Scheduler] Job ${job.id} sent successfully.`);
      } else {
        const errText = await response.text();
        console.error(`[Scheduler] Job ${job.id} failed: ${errText}`);
        // Optionally mark as failed or retry later
        db.prepare('UPDATE scheduled_messages SET status = "failed" WHERE id = ?').run(job.id);
      }
    } catch (error) {
      console.error(`[Scheduler] Error on job ${job.id}:`, error.message);
    }
  }
}, 30000);

const PORT = process.env.SCHEDULER_PORT || 2887;
app.listen(PORT, () => {
  console.log(`[Scheduler Daemon] Running on port ${PORT}`);
});