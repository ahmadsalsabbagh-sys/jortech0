const fs = require('fs');

let loginPath = 'dashboard/src/pages/Login.tsx';
let loginContent = fs.readFileSync(loginPath, 'utf8');

loginContent = loginContent.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, Buffer.from('PGgyIHN0eWxlPXt7IGZvbnRTaXplOiAiMS4yNXJlbSIsIGZvbnRXZWlnaHQ6IDcwMCwgbWFyZ2luOiAiNHB4IDAiLCBjb2xvcjogImluaGVyaXQiIH19PtmE2YjYrdipINiq2K3Zg9mFIEpPUiBUZWNoPC9oMj4=', 'base64').toString('utf8'));

loginContent = loginContent.replace(/<span className="version-info"[^>]*>[\s\S]*?<\/span>/, Buffer.from('PHNwYW4gY2xhc3NOYW1lPSJ2ZXJzaW9uLWluZm8iIHN0eWxlPXt7IGZvbnRTaXplOiAiMC44NXJlbSIsIGNvbG9yOiAiIzNiODJmNiIsIGZvbnRXZWlnaHQ6IDYwMCB9fT7YqtmF2YLZitmOINin2YTYtNio2KfYqCDZiNin2YTYrdmE2YjZhCDYp9mE2LHZgdmF24zYqSB8IHZ7X19BUFBfVkVSU0lPTl9ffTwvc3Bhbj4=', 'base64').toString('utf8'));

loginContent = loginContent.replace(/<p className="login-help">[\s\S]*?<\/p>/, Buffer.from('PHAgY2xhc3NOYW1lPSJsb2dpbi1oZWxwIj7ZhNmE2K3YtdmI2YQg2LnZhNmJIMin2YTZhdiz2KfYudiv2Kkg2YrYsdmK2q8g2YXYsdin2KzYudipIDxhIGhyZWY9Imh0dHBzOi8vd3d3LmpvcnRlY2hqby5jb20iIHRhcmdldD0iX2JsYW5rIiByZWw9Im5vb3BlbmVyIG5vcmVmZXJyZXIiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT7ZhdmI2YLYuSBKT1IgVGVjaDwvYT48L3A+', 'base64').toString('utf8'));

loginContent = loginContent.replace(/<footer className="login-footer">[\s\S]*?<\/footer>/, Buffer.from('PGZvb3RlciBjbGFzc05hbWU9ImxvZ2luLWZvb3RlciI+PHNwYW4+2YTZiNit2Kkg2KrYrdmD2YUgSk9SIFRlY2ggfCDYrNmF2YrYuSDYp9mE2K3ZgtmI2YIg2YXYrdmB2YjYuLhpPC9zcGFuPjxhIGhyZWY9Imh0dHBzOi8vZ2l0aHViLmNvbS9haG1hZHNhbHNhYmJhZ2gtc3lzL2pvci10ZWNoIiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciBub3JlZmVycmVyIiBjbGFzc05hbWU9ImdpdGh1Yi1saW5rIiBhcmlhLWxhYmVsPSJHaXRIdWIiPjxHaXRodWJJY29uIHNpemUpezE4fSAvPjwvYT48L2Zvb3Rlcj4=', 'base64').toString('utf8'));

fs.writeFileSync(loginPath, loginContent, 'utf8');

let layoutPath = 'dashboard/src/components/Layout.tsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

layoutContent = layoutContent.replace(/<span className="brand-version"[^>]*>[\s\S]*?<\/span>/, Buffer.from('PHNwYW4gY2xhc3NOYW1lPSJicmFuZC12ZXJzaW9uIiBzdHlsZT17eyBmb250U2l6ZTogIjAuNzVyZW0iLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAiIzNiODJmNiIgfX0+2KfZhNil2LXYrdiv2KfYsSB2e3ZlcnNpb259PC9zcGFuPg==', 'base64').toString('utf8'));

fs.writeFileSync(layoutPath, layoutContent, 'utf8');
console.log('Done!');