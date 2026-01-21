import { MarketCard } from './MarketCard';
import type { Market } from '../types/market';

interface MarketListProps {
  markets: Market[];
  selectedMarket: Market | null;
  onSelectMarket: (market: Market) => void;
  loading: boolean;
}

export function MarketList({
  markets,
  selectedMarket,
  onSelectMarket,
  loading,
}: MarketListProps) {
  if (loading) {
    return (
      <div className="market-list loading">
        <div className="loading-spinner"></div>
        <p>Loading markets...</p>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="market-list empty">
        <p>No markets found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="market-list">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          onSelect={onSelectMarket}
          isSelected={selectedMarket?.id === market.id}
        />
      ))}
    </div>
  );
}
