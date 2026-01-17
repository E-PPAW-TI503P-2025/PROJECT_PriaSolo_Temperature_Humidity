import { useState, useEffect, useCallback } from 'react';
import { Thermometer, Droplets, Wifi, Lightbulb, User } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import TrendsChart from './components/TrendsChart';
import Analytics from './components/Analytics';
import RoomManager from './components/RoomManager';
import DeviceManager from './components/DeviceManager';
import Alerts from './components/Alerts';
import Login from './components/Login';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // State Data
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    cahaya: 0,
    status: 'Offline'
  });
  const [chartData, setChartData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Handle Login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Fetch Realtime Data (Dashboard Cards)
  const fetchLatestData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sensor/latest');
      const data = await response.json();

      setSensorData({
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        cahaya: data.cahaya || 0,
        status: data.status || 'Offline'
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  }, []);

  // Fetch Chart Data
  const fetchChartData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sensor/history');
      const data = await response.json();
      // Backend sudah return array reversed, format juga sudah cocok
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }, []);

  // Polling Data setiap 5 detik jika login + dashboard aktif
  useEffect(() => {
    if (!isLoggedIn || activeMenu !== 'dashboard') return;

    // Fetch pertama kali
    fetchLatestData();
    fetchChartData();

    const interval = setInterval(() => {
      fetchLatestData();
      fetchChartData();
    }, 5000); // Update tiap 5 detik

    return () => clearInterval(interval);
  }, [isLoggedIn, activeMenu, fetchLatestData, fetchChartData]);

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        role={user?.role}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Header lastUpdate={lastUpdate} />

        {activeMenu === 'dashboard' && (
          <>
            {/* Welcome text */}
            <div style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Welcome, <b>{user?.username || 'Admin'}</b> ({user?.role || 'User'})
            </div>

            <div className="metrics-grid">
              <MetricCard
                title="TEMPERATURE"
                value={sensorData.temperature}
                unit="°C"
                status={sensorData.temperature > 30 ? 'WARNING' : 'NORMAL'}
                trend="up" // Logic trend nanti bisa diperbaiki dengan membandingkan data sebelumnya
                trendValue="Latest"
                icon={Thermometer}
                type="temperature"
              />
              <MetricCard
                title="HUMIDITY"
                value={sensorData.humidity}
                unit="%"
                status={sensorData.humidity > 80 ? 'WARNING' : 'NORMAL'}
                trend="down"
                trendValue="Latest"
                icon={Droplets}
                type="humidity"
              />
              <MetricCard
                title="LIGHT INTENSITY" // Tambahan card untuk cahaya
                value={sensorData.cahaya || 0}
                unit=" Lux"
                status="NORMAL"
                trend="up"
                trendValue="Indoor"
                icon={Lightbulb} // Pake icon Lightbulb
                type="uptime" // Styling pinjam uptime (hijau)
              />
            </div>

            <TrendsChart data={chartData} />
          </>
        )}

        {activeMenu === 'analytics' && <Analytics />}
        {activeMenu === 'rooms' && <RoomManager />}
        {activeMenu === 'devices' && <DeviceManager />}
        {activeMenu === 'alerts' && <Alerts />}
      </main>
    </div>
  );
}

export default App;
