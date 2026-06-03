const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const port = process.env.PORT || 5000;

// 1. Kill process on port
try {
  if (process.platform === 'win32') {
    // Windows
    const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
    const lines = stdout.split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        if (parseInt(pid) > 0) {
          pids.add(pid);
        }
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`Killed process ${pid} on port ${port}`);
      } catch (e) {}
    }
  } else {
    // Unix
    try {
      const pid = execSync(`lsof -t -i:${port}`).toString().trim();
      if (pid) {
        execSync(`kill -9 ${pid}`);
        console.log(`Killed process ${pid} on port ${port}`);
      }
    } catch (e) {}
  }
} catch (err) {}

// 2. Patch server.js
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  let content = fs.readFileSync(serverPath, 'utf8');
  
  // Replace app.listen(5000 with app.listen(process.env.PORT || 5000
  content = content.replace(/app\.listen\(\s*5000/g, 'app.listen(process.env.PORT || 5000');
  
  // Replace const PORT = 5000 or let PORT = 5000 or var PORT = 5000
  content = content.replace(/(const|let|var)\s+port\s*=\s*5000/gi, '$1 PORT = process.env.PORT || 5000');
  
  fs.writeFileSync(serverPath, content, 'utf8');
  console.log('Patched server.js successfully');
}