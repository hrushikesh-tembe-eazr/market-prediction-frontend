import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import type { Market } from '../types/market';
import './MarketCard.css';

interface MarketCardProps {
  market: Market;
  onSelect: (market: Market) => void;
  isSelected: boolean;
}

export function MarketCard({ market, onSelect, isSelected }: MarketCardProps) {
  const formatVolume = (vol: number | undefined) => {
    if (!vol) return '$0';
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
    return `$${vol.toFixed(2)}`;
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '—';
    return `${(price * 100).toFixed(1)}%`;
  };

  const cleanTitle = market.title?.split(' - ')[0] || 'Untitled Market';

  return (
    <div
      onClick={() => onSelect(market)}
      className={`card-container ${isSelected ? 'card-selected' : ''}`}
    >
      {market.image && (
        <img src={market.image} alt="" className="card-image" />
      )}
      <div className="card-body">
        <div className="card-title-row">
          <span className="card-title">{cleanTitle}</span>
          <a
            href={market.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="card-link"
          >
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="card-outcomes">
          {market.outcomes?.slice(0, 2).map((outcome, index) => (
            <div key={outcome.id || index} className="card-outcome">
              <span className="outcome-name">{outcome.label}</span>
              <div className="outcome-row">
                <span className="outcome-percent">{formatPrice(outcome.price)}</span>
                {outcome.priceChange24h !== undefined && outcome.priceChange24h !== 0 && (
                  <span className={`outcome-change ${outcome.priceChange24h >= 0 ? 'up' : 'down'}`}>
                    {outcome.priceChange24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(outcome.priceChange24h * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="card-footer-row">
          <span className="card-volume">Vol: {formatVolume(market.volume || market.volume24h)}</span>
          {market.category && <span className="card-category">{market.category}</span>}
        </div>
      </div>
    </div>
  );
}
