const fs = require('fs');

const step251 = JSON.parse(fs.readFileSync('C:\\Users\\laptop\\Desktop\\Projects\\AEGIS\\scratch\\step251.json', 'utf8'))[0];
let content = step251.args.CodeContent;
if (typeof content === 'string' && content.startsWith('"') && content.endsWith('"')) {
   content = JSON.parse(content);
}

const step314 = JSON.parse(fs.readFileSync('C:\\Users\\laptop\\Desktop\\Projects\\AEGIS\\scratch\\step314.json', 'utf8'))[0];
let chunksStr = step314.args.ReplacementChunks;
if (typeof chunksStr === 'string' && chunksStr.startsWith('"') && chunksStr.endsWith('"')) {
   chunksStr = JSON.parse(chunksStr);
}
const chunks = JSON.parse(chunksStr);

for (const chunk of chunks) {
    const target = chunk.TargetContent;
    const replacement = chunk.ReplacementContent;
    content = content.replace(target, replacement);
}

fs.writeFileSync('C:\\Users\\laptop\\Desktop\\Projects\\AEGIS\\src\\components\\HoneypotViewer.tsx', content);
console.log("Restored content written directly to HoneypotViewer.tsx");
