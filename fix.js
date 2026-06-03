const fs = require('fs');

try {
  const content = fs.readFileSync('src/App.jsx', 'utf8');
  const lines = content.split('\n');
  console.log('=== TOTAL LINES ===', lines.length);
  console.log('=== LINES 540-580 ===');
  for (let i = Math.max(0, 535); i < Math.min(lines.length, 585); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
  console.log('=== LAST 20 LINES ===');
  for (let i = Math.max(0, lines.length - 20); i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} catch (err) {
  console.error(err);
}
process.exit(1);