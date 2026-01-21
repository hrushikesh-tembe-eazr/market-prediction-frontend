import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { MarketList } from './components/MarketList';
import { PriceChart } from './components/PriceChart';
import { OrderBookView } from './components/OrderBookView';
import { fetchMarkets, searchMarkets, type Exchange } from './services/api';
import type { Market } from './types/market';
import './App.css';

function App() {
  const [exchange, setExchange] = useState<Exchange>('polymarket');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarkets = async (exch: Exchange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarkets(exch, { limit: 20 });
      setMarkets(data);
      setSelectedMarket(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load markets');
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadMarkets(exchange);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchMarkets(exchange, query, { limit: 20 });
      setMarkets(data);
      setSelectedMarket(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeChange = (exch: Exchange) => {
    setExchange(exch);
    loadMarkets(exch);
  };

  useEffect(() => {
    loadMarkets(exchange);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Prediction Market Dashboard</h1>
        <p className="subtitle">Real-time data from Polymarket & Kalshi</p>
      </header>

      <SearchBar
        onSearch={handleSearch}
        exchange={exchange}
        onExchangeChange={handleExchangeChange}
      />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => loadMarkets(exchange)}>Retry</button>
        </div>
      )}

      <div className="main-content">
        <div className="markets-panel">
          <h2>Markets</h2>
          <MarketList
            markets={markets}
            selectedMarket={selectedMarket}
            onSelectMarket={setSelectedMarket}
            loading={loading}
          />
        </div>

        <div className="details-panel">
          {selectedMarket ? (
            <>
              <PriceChart market={selectedMarket} exchange={exchange} />
              <OrderBookView market={selectedMarket} exchange={exchange} />
            </>
          ) : (
            <div className="no-selection">
              <h3>Select a market</h3>
              <p>Click on a market card to view price charts and order book</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
