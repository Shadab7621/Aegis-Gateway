const fs = require('fs');
require('dotenv').config({path: '.env.local'});
fetch('https://api.groq.com/openai/v1/models', {
  headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
})
.then(r => r.json())
.then(d => {
  if (d.data) {
    const ids = d.data.map(m => m.id);
    const lg = ids.filter(id => id.includes('llama-guard'));
    console.log('Llama Guard models:', lg);
    const all = ids.filter(id => id.includes('llama'));
    console.log('Other Llama models:', all);
  } else console.log(d);
});
