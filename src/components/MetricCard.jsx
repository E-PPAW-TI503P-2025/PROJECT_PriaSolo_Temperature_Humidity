import { ArrowUpRight, ArrowDownRight, Wifi } from 'lucide-react';

const MetricCard = ({
    title,
    value,
    unit,
    status,
    trend,
    trendValue,
    icon: Icon,
    type // 'temperature', 'humidity', 'uptime'
}) => {
    const getStatusColor = (status) => {
        if (status === 'WARNING') return 'warning';
        return 'normal'; // for both NORMAL and CONNECTED
    };

    const getIconColor = (type) => {
        if (type === 'temperature') return 'warning';
        if (type === 'humidity') return 'normal-blue';
        return 'normal-green';
    };

    const isUp = trend === 'up';

    return (
        <div className="metric-card">
            <div className="metric-header">
                <div className={`metric-icon ${getIconColor(type)}`}>
                    <Icon />
                </div>
                <div className="metric-info">
                    <div className="metric-label-row">
                        <span className={`metric-status-badge ${getStatusColor(status)}`}>
                            {status}
                        </span>
                    </div>
                    <div className="metric-value">
                        {value}
                        <span>{unit}</span>
                    </div>
                    <div className="metric-label">{title}</div>
                </div>
            </div>

            <div className="metric-footer">
                <div className={`metric-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? <ArrowUpRight /> : <ArrowDownRight />}
                    {trendValue}
                </div>
                <span className="metric-change-text">from last hour</span>
            </div>
        </div>
    );
};

export default MetricCard;
