const fs = require('fs');

let loginPath = 'dashboard/src/pages/Login.tsx';
let loginContent = fs.readFileSync(loginPath, 'utf8');

// Replace the entire footer block
loginContent = loginContent.replace(/<footer className=\"login-footer\">[\s\S]*?<\/footer>/, Buffer.from('PGZvb3RlciBjbGFzc05hbWU9ImxvZ2luLWZvb3RlciI+PHNwYW4+2YTZiNit2Kkg2KrYrdmD2YUgSk9SIFRlY2ggfCDYrNmF2YrYuSDYp9mE2K3ZgtmI2YIg2YXYrdmB2YjYuLqpPC9zcGFuPjxhIGhyZWY9Imh0dHBzOi8vZ2l0aHViLmNvbS9haG1hZHNhbHNhYmJhZ2gtc3lzL2pvci10ZWNoIiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciBub3JlZmVycmVyIiBjbGFzc05hbWU9ImdpdGh1Yi1saW5rIiBhcmlhLWxhYmVsPSJHaXRIdWIiPjxHaXRodWJJY29uIHNpemUpezE4fSAvPjwvYT48L2Zvb3Rlcj4=', 'base64').toString('utf8'));

fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log('Fixed syntax error in footer.');