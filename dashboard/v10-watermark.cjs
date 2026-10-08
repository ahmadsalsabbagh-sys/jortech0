const fs = require('fs');

let dashboardCss = fs.readFileSync('dashboard/src/pages/Dashboard.css', 'utf8');

// Replace the "display: none" block with a beautiful watermark styling
dashboardCss = dashboardCss.replace(
  /\/\* Remove the ugly cropped watermark \*\/[\s\S]*?\.dashboard \.stat-watermark\s*\{\s*display:\s*none\s*!important;\s*\}/g,
  `/* Beautiful Animated Watermark */
.dashboard .stat-watermark {
  display: block !important;
  position: absolute;
  bottom: -20px;
  left: -20px; /* For RTL, it goes to the left corner */
  width: 150px !important;
  height: 150px !important;
  opacity: 0.04;
  color: #0ea5e9;
  transform: rotate(15deg);
  pointer-events: none;
  z-index: 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  stroke-width: 1.5px !important;
}

.ltr .dashboard .stat-watermark {
  left: auto;
  right: -20px;
  transform: rotate(-15deg);
}

.dashboard .stat-card:hover .stat-watermark {
  opacity: 0.12;
  transform: rotate(0deg) scale(1.15) translateY(-10px);
  color: #0ea5e9;
}

[data-theme='dark'] .dashboard .stat-watermark,
.dark .dashboard .stat-watermark {
  opacity: 0.05;
  color: #ffffff;
}
[data-theme='dark'] .dashboard .stat-card:hover .stat-watermark,
.dark .dashboard .stat-card:hover .stat-watermark {
  opacity: 0.1;
  color: #38bdf8;
}

/* Ensure card content stays above watermark */
.dashboard .stat-header,
.dashboard .stat-value,
.dashboard .stat-detail {
  position: relative;
  z-index: 2;
}
`
);

fs.writeFileSync('dashboard/src/pages/Dashboard.css', dashboardCss, 'utf8');