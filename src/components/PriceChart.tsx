import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchOHLCV, type Exchange } from '../services/api';
import type { Market, PriceCandle } from '../types/market';

interface PriceChartProps {
  market: Market;
  exchange: Exchange;
}

export function PriceChart({ market, exchange }: PriceChartProps) {
  const [candles, setCandles] = useState<PriceCandle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);

  useEffect(() => {
    // Reset selected outcome when market changes
    if (market.outcomes.length > 0) {
      setSelectedOutcome(market.outcomes[0].id);
    } else {
      setSelectedOutcome(null);
    }
  }, [market.id]);

  useEffect(() => {
    if (!selectedOutcome) return;

    const loadCandles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOHLCV(exchange, selectedOutcome, {
          resolution: '1h',
          limit: 48,
        });
        setCandles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
        setCandles([]);
      } finally {
        setLoading(false);
      }
    };

    loadCandles();
  }, [selectedOutcome, exchange]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => `${(price * 100).toFixed(1)}%`;

  const chartData = candles.map((c) => ({
    time: formatTime(c.timestamp),
    price: c.close,
    high: c.high,
    low: c.low,
  }));

  // Clean up title
  const cleanTitle = market.title.split(' - ')[0];

  return (
    <div className="price-chart">
      <div className="chart-header">
        <h3>{cleanTitle}</h3>
        <div className="outcome-tabs">
          {market.outcomes.slice(0, 2).map((outcome, index) => (
            <button
              key={outcome.id || index}
              className={`outcome-tab ${selectedOutcome === outcome.id ? 'active' : ''}`}
              onClick={() => setSelectedOutcome(outcome.id)}
            >
              {outcome.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <p>Loading chart...</p>
          </div>
        ) : error ? (
          <div className="chart-error">
            <p>{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="chart-empty">
            <p>No historical data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                stroke="#888"
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatPrice}
                stroke="#888"
                tick={{ fill: '#888', fontSize: 12 }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [formatPrice(value as number), 'Price']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#00d4aa"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
