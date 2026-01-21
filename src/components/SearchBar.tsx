import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Exchange } from '../services/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  exchange: Exchange;
  onExchangeChange: (exchange: Exchange) => void;
}

export function SearchBar({ onSearch, exchange, onExchangeChange }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="search-container">
      <div className="exchange-selector">
        <button
          className={`exchange-btn ${exchange === 'polymarket' ? 'active' : ''}`}
          onClick={() => onExchangeChange('polymarket')}
        >
          Polymarket
        </button>
        <button
          className={`exchange-btn ${exchange === 'kalshi' ? 'active' : ''}`}
          onClick={() => onExchangeChange('kalshi')}
        >
          Kalshi
        </button>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets (e.g., Bitcoin, Trump, Fed rates...)"
            className="search-input"
          />
        </div>
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
    </div>
  );
}
