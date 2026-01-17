import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

const TrendsChart = ({ data }) => {
    const [timeRange, setTimeRange] = useState('Today');

    return (
        <div className="chart-card">
            <div className="chart-header">
                <div className="chart-title">
                    <Activity />
                    Trends Temperature & Humidity
                </div>
                <div className="chart-filters">
                    {['Today', 'This Week', 'This Month'].map((range) => (
                        <button
                            key={range}
                            className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ dy: 10 }}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ dx: -10 }}
                            domain={[20, 40]}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ dx: 10 }}
                            domain={[60, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="temperature"
                            stroke="#F97316"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="humidity"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-legend">
                <div className="legend-item">
                    <div className="legend-dot orange"></div>
                    <span>Temperature (°C)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot blue"></div>
                    <span>Humidity (%)</span>
                </div>
            </div>
        </div>
    );
};

export default TrendsChart;
