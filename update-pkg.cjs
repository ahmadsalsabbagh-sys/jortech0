const fs = require('fs');
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace('"start:prod": "node dist/main",', '"start:prod": "node scheduler-daemon.js & node dist/main",');
fs.writeFileSync('package.json', pkg, 'utf8');