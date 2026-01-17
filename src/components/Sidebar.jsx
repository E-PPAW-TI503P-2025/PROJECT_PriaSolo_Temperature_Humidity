import { LayoutDashboard, BarChart3, History, Settings, Cpu, MapPin, Server, AlertTriangle, LogOut } from 'lucide-react';

const Sidebar = ({ activeMenu, setActiveMenu, role, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Menu Admin (sesuai Use Case Laporan Data)
    ...(role === 'Admin' ? [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'rooms', label: 'Rooms', icon: MapPin },
      { id: 'devices', label: 'Devices', icon: Server },
      { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
    ] : []),
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Cpu size={18} />
        </div>
        <span className="sidebar-logo-text">IoT Monitor</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Divider for Logout */}
        <div style={{ flex: 1 }}></div>

        <button
          className="nav-item"
          onClick={onLogout}
          style={{ marginTop: '10px', color: '#ef4444' }}
        >
          <LogOut />
          <span>Logout</span>
        </button>
      </nav>

      {/* Device Status */}
      <div className="device-status">
        <div className="device-status-header">
          <div className="device-icon">
            ESP32
          </div>
          <div className="device-info">
            <h4>ESP32 Device</h4>
            <p>ID: abc1234</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
