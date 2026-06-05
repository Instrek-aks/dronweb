import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for local development
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Chat API Route
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  // Check if API key is configured
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('Error: GEMINI_API_KEY is not set in server/.env');
    return res.status(500).json({
      error: 'API key not configured. Please add your GEMINI_API_KEY to the server/.env file and restart the server.'
    });
  }

  try {
    // Format messages for Gemini API
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Send request to Google Gemini API (Free tier available)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }]
        },
        contents: geminiMessages,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error (Status ${response.status}):`, errorText);
      return res.status(response.status).json({
        error: `Error from Gemini API: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    // Format response to match what the frontend expects (Anthropic format)
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.';
    
    return res.json({
      content: [{ text: replyText }]
    });
  } catch (error) {
    console.error('Proxy Server Error:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while contacting the AI Assistant.',
      details: error.message
    });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`drones.help proxy server running on http://localhost:${PORT}`);
});
