const fs = require('fs');

// 1. Fix Global `.page-header` box issue in App/Index CSS
let indexCss = fs.readFileSync('dashboard/src/index.css', 'utf8');
// Target the specific block applying card styles to page-header and remove it.
indexCss = indexCss.replace(/\.page-header,\s*/g, ''); 
indexCss += `
/* Global Page Header Override to perfectly blend into backgrounds */
.page-header {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  padding: 0 !important;
  margin-bottom: 2rem;
}
[data-theme='dark'] .page-header {
  border: none !important;
}
`;
fs.writeFileSync('dashboard/src/index.css', indexCss, 'utf8');

// 2. Fix Dashboard Cards CSS
let dashboardCss = fs.readFileSync('dashboard/src/pages/Dashboard.css', 'utf8');
const dashboardOverrides = `
/* Modern Premium Stat Cards */
.dashboard .stats-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-bottom: 2rem;
}

.dashboard .stat-card {
  position: relative;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem 1.8rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

[data-theme='dark'] .dashboard .stat-card,
.dark .dashboard .stat-card {
  background: rgba(30, 41, 59, 0.7) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dashboard .stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(14, 165, 233, 0.15);
  border-color: rgba(14, 165, 233, 0.4) !important;
}

/* Remove the ugly cropped watermark */
.dashboard .stat-watermark {
  display: none !important;
}

.dashboard .stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
}

.dashboard .stat-label {
  font-size: 1.1rem;
  font-weight: 800;
  color: #334155;
  line-height: 1.4;
}
[data-theme='dark'] .dashboard .stat-label,
.dark .dashboard .stat-label {
  color: #f1f5f9;
}

/* Beautiful icon container */
.dashboard .stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(37, 99, 235, 0.1));
  color: #0ea5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.15);
  transition: all 0.3s;
}
.dashboard .stat-card:hover .stat-icon {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: white;
  transform: scale(1.1) rotate(5deg);
}

.dashboard .stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
}
[data-theme='dark'] .dashboard .stat-value,
.dark .dashboard .stat-value {
  color: #ffffff;
}

.dashboard .stat-detail {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}
`;
fs.appendFileSync('dashboard/src/pages/Dashboard.css', dashboardOverrides, 'utf8');


// 3. Fix Scheduler Inputs CSS
let schedulerCss = fs.readFileSync('dashboard/src/pages/Scheduler.css', 'utf8');
const schedulerOverrides = `
/* Scheduler Specific Layout Fixes */
.form-row {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 1rem;
}
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
}
.flex-1 {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
}
.dark .form-group label {
  color: #cbd5e1;
}

/* Hard reset and styling for date/time inputs to fix cropped borders */
input[type="date"].input-field,
input[type="time"].input-field {
  width: 100%;
  padding: 0.8rem 1rem !important;
  border: 2px solid #e2e8f0 !important;
  border-radius: 12px !important;
  font-family: inherit;
  font-size: 1rem;
  background-color: #ffffff !important;
  color: #0f172a !important;
  box-sizing: border-box !important;
  height: auto !important;
  line-height: normal !important;
  appearance: none;
  -webkit-appearance: none;
}
input[type="date"].input-field:focus,
input[type="time"].input-field:focus {
  border-color: #0ea5e9 !important;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1) !important;
  outline: none;
}
.dark input[type="date"].input-field,
.dark input[type="time"].input-field {
  background-color: rgba(15, 23, 42, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}
.dark input[type="date"].input-field::-webkit-calendar-picker-indicator,
.dark input[type="time"].input-field::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
`;
fs.appendFileSync('dashboard/src/pages/Scheduler.css', schedulerOverrides, 'utf8');
