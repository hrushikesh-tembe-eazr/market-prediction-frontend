import { useEffect, useState } from 'react';
import { fetchOrderBook, type Exchange } from '../services/api';
import type { Market, OrderBook } from '../types/market';

interface OrderBookViewProps {
  market: Market;
  exchange: Exchange;
}

export function OrderBookView({ market, exchange }: OrderBookViewProps) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
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

    const loadOrderBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrderBook(exchange, selectedOutcome);
        setOrderBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order book');
        setOrderBook(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrderBook();
  }, [selectedOutcome, exchange]);

  const formatPrice = (price: number) => `${(price * 100).toFixed(1)}%`;
  const formatSize = (size: number) => size.toLocaleString();

  const maxBidSize = orderBook?.bids.reduce((max, b) => Math.max(max, b.size), 0) || 1;
  const maxAskSize = orderBook?.asks.reduce((max, a) => Math.max(max, a.size), 0) || 1;

  return (
    <div className="order-book">
      <div className="order-book-header">
        <h3>Order Book</h3>
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

      <div className="order-book-content">
        {loading ? (
          <div className="order-book-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="order-book-error">
            <p>{error}</p>
          </div>
        ) : orderBook ? (
          <div className="order-book-grid">
            <div className="bids-section">
              <div className="section-header">
                <span>Price</span>
                <span>Size</span>
              </div>
              {orderBook.bids.slice(0, 8).map((bid, i) => (
                <div key={i} className="order-row bid">
                  <div
                    className="order-bar"
                    style={{ width: `${(bid.size / maxBidSize) * 100}%` }}
                  />
                  <span className="order-price">{formatPrice(bid.price)}</span>
                  <span className="order-size">{formatSize(bid.size)}</span>
                </div>
              ))}
            </div>

            <div className="spread">
              <span>Spread</span>
            </div>

            <div className="asks-section">
              <div className="section-header">
                <span>Price</span>
                <span>Size</span>
              </div>
              {orderBook.asks.slice(0, 8).map((ask, i) => (
                <div key={i} className="order-row ask">
                  <div
                    className="order-bar"
                    style={{ width: `${(ask.size / maxAskSize) * 100}%` }}
                  />
                  <span className="order-price">{formatPrice(ask.price)}</span>
                  <span className="order-size">{formatSize(ask.size)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="order-book-empty">
            <p>No order book data</p>
          </div>
        )}
      </div>
    </div>
  );
}
