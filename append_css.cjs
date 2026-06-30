const fs = require('fs');

const cssToAppend = `
/* =========================================================
   NOTIFICATIONS SYSTEM
   ========================================================= */

.notification-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
  box-shadow: 0 0 0 2px #1e293b;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
  color: #334155;
  cursor: default;
}

.notification-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: background-color 0.15s;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.notification-icon.info {
  background: #e0f2fe;
  color: #0284c7;
}

.notification-icon.error {
  background: #fee2e2;
  color: #dc2626;
}

.notification-icon.success {
  background: #dcfce7;
  color: #16a34a;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 2px;
}

.notification-message {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.notification-empty {
  padding: 32px 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

fs.appendFileSync('src/index.css', cssToAppend, 'utf8');
console.log('CSS appended successfully!');
