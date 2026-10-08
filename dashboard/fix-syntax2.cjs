const correctFooter = '<footer className="login-footer"><span>لوحة تحكم JOR Tech | جميع الحقوق محفوظة</span><a href="https://github.com/ahmadsalsabbagh-sys/jor-tech" target="_blank" rel="noopener noreferrer" className="github-link" aria-label="GitHub"><GithubIcon size={18} /></a></footer>';

const fs = require('fs');
let loginPath = 'dashboard/src/pages/Login.tsx';
let loginContent = fs.readFileSync(loginPath, 'utf8');

loginContent = loginContent.replace(/<footer className="login-footer">[\s\S]*?<\/footer>/, correctFooter);
fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log('Fixed correctly.');