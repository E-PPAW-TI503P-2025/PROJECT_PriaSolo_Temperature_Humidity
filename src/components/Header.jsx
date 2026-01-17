import { Clock } from 'lucide-react';

const Header = ({ lastUpdate }) => {
    const formatDate = (date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <header className="header">
            <h1>Dashboard</h1>
            <div className="header-right">
                <div className="last-update">
                    <Clock />
                    <span>Last update: {formatDate(lastUpdate)}</span>
                </div>
                <div className="online-badge">
                    <span className="online-dot"></span>
                    <span>Online</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
