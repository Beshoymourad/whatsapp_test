// Import Express.js
const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN || 'vibecode';

// Welcome page
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  // If verification parameters exist, handle verification
  if (mode && challenge && token) {
    console.log('Webhook verification attempt:', {
      mode,
      challenge,
      token,
      verifyToken
    });

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ WEBHOOK VERIFIED SUCCESSFULLY');
      res.status(200).send(challenge);
    } else {
      console.log('❌ WEBHOOK VERIFICATION FAILED');
      res.status(403).end();
    }
  } else {
    // Show welcome page if no verification parameters
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Webhook Tester</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .container { background: #f5f5f5; padding: 20px; border-radius: 8px; }
          code { background: #eee; padding: 2px 4px; border-radius: 4px; }
          .success { color: green; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>WhatsApp Webhook Tester</h1>
          <p><strong>Status:</strong> <span class="success">✅ Running</span></p>
          <p><strong>Port:</strong> ${port}</p>
          <p><strong>Verify Token:</strong> ${verifyToken}</p>
          
          <h2>Endpoints:</h2>
          <ul>
            <li><code>GET /</code> - This page / Webhook verification</li>
            <li><code>POST /</code> - Webhook events from WhatsApp</li>
            <li><code>GET /health</code> - Health check</li>
          </ul>
          
          <h2>To Test Webhook Verification:</h2>
          <p>Send a GET request with these query parameters:</p>
          <code>
            ?hub.mode=subscribe&hub.challenge=123456789&hub.verify_token=${verifyToken}
          </code>
          
          <h2>Test with curl:</h2>
          <pre>
curl "http://localhost:${port}/?hub.mode=subscribe&hub.challenge=123456789&hub.verify_token=${verifyToken}"
          </pre>
          
          <h2>Test with Meta Developer Portal:</h2>
          <ol>
            <li>Go to Meta App Dashboard → WhatsApp → Configuration → Webhooks</li>
            <li>Callback URL: <code>https://YOUR_RENDER_URL.onrender.com</code></li>
            <li>Verify Token: <code>${verifyToken}</code></li>
            <li>Click "Verify and save"</li>
          </ol>
          
          <h2>View Logs:</h2>
          <p>Webhook events will appear in the terminal where you ran <code>npm start</code></p>
        </div>
      </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'whatsapp-webhook-tester',
    timestamp: new Date().toISOString(),
    verify_token_set: verifyToken !== 'vibecode',
    verify_token: verifyToken,
    port: port
  });
});

// Route for POST requests (webhook events)
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  
  // Log to console
  console.log(`\n\n📨 [${timestamp}] Webhook received`);
  console.log('=' .repeat(50));
  
  // Log headers (but hide sensitive ones)
  const safeHeaders = { ...req.headers };
  if (safeHeaders.authorization) {
    safeHeaders.authorization = '[HIDDEN]';
  }
  
  console.log('Headers:', JSON.stringify(safeHeaders, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('=' .repeat(50));
  
  // Send immediate response
  res.status(200).json({
    success: true,
    message: 'Webhook received',
    timestamp: new Date().toISOString(),
    received_at: timestamp
  });
});

// Start the server
app.listen(port, () => {
  console.log(`\n🚀 WhatsApp Webhook Tester`);
  console.log(`📍 Local: http://localhost:${port}`);
  console.log(`🔐 Verify Token: ${verifyToken}`);
  console.log(`📊 Health: http://localhost:${port}/health`);
  console.log(`\n📝 Waiting for webhooks...\n`);
  console.log(`💡 TIP: Visit http://localhost:${port} in your browser for instructions\n`);
});