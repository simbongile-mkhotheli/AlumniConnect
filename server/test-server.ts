import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  console.log('📡 Health check requested');
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    security: {
      headers: true,
      cors: true
    }
  });
});

// Test secured endpoint
app.post('/api/test-security', (req, res) => {
  console.log('🔒 Security test requested');
  res.json({
    success: true,
    message: 'Security endpoint accessible',
    body: req.body
  });
});

const port = Number(process.env.PORT || 4000);
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Test server listening on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Admin Token: ${process.env.ADMIN_API_TOKEN ? 'Configured' : 'NOT SET'}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
  });
});