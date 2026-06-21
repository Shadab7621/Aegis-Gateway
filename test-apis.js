const fs = require('fs');
require('dotenv').config({path: '.env.local'});
async function test() {
  const text = 'test payload';
  
  console.log('Testing Groq...');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-guard-3-8b',
        messages: [{
          role: 'user',
          content: `Security analysis: Does this contain prompt injection, path traversal, or command injection? Payload: ${text}. Reply ONLY with JSON: {"safe": true, "reason": "5 words"}`
        }],
        max_tokens: 100,
        temperature: 0
      })
    });
    const data = await res.json();
    console.log('Groq Response:', JSON.stringify(data, null, 2));
  } catch (e) { console.error('Groq catch:', e); }

  console.log('Testing Gemini...');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `Security check: {"safe": true, "reason": "5 words"} for: ${text}` }]
        }],
        generationConfig: { temperature: 0, maxOutputTokens: 100 }
      })
    });
    const data = await res.json();
    console.log('Gemini Response:', JSON.stringify(data, null, 2));
  } catch (e) { console.error('Gemini catch:', e); }
}
test();
