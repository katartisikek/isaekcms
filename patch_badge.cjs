const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add state variable
content = content.replace(
  "const [showNotifications, setShowNotifications] = useState(false);",
  "const [showNotifications, setShowNotifications] = useState(false);\n  const [lastSeenNotifications, setLastSeenNotifications] = useState('[]');"
);

// 2. Add unseenCount calculation right after the useMemo block
const useMemoEnd = "}, [tasks, interests, students]);";
const unseenCountCode = `}, [tasks, interests, students]);

  const unseenCount = notifications.length > 0 && JSON.stringify(notifications.map(n => n.id)) !== lastSeenNotifications 
    ? notifications.length 
    : 0;

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      setLastSeenNotifications(JSON.stringify(notifications.map(n => n.id)));
    }
    setShowNotifications(!showNotifications);
  };`;
content = content.replace(useMemoEnd, unseenCountCode);

// 3. Update the onClick and badge rendering
const menuClick = "onClick={() => setShowNotifications(!showNotifications)}";
content = content.replace(menuClick, "onClick={handleToggleNotifications}");

const badgeRender = "{notifications.length > 0 && <span className=\"notification-badge\">{notifications.length}</span>}";
content = content.replace(badgeRender, "{unseenCount > 0 && <span className=\"notification-badge\">{unseenCount}</span>}");

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Badge logic patched successfully!');
