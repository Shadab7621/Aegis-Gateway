const fs = require('fs');

const lines = fs.readFileSync('C:\\Users\\laptop\\.gemini\\antigravity\\brain\\3821e660-b6c6-4c50-bd71-25d83d20bbbe\\.system_generated\\logs\\transcript.jsonl', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const step = JSON.parse(lines[i]);
    if (step.tool_calls) {
      for (const call of step.tool_calls) {
        if (call.name === 'view_file') {
             console.log("View file at step " + step.step_index + " " + JSON.stringify(call.args));
        }
      }
    }
  } catch(e) {}
}
