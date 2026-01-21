import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Brain,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import './StockDashboard.css';

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3847'
  : '/api/proxy';

interface StockQuote {
  symbol: string;
  companyName: string;
  lastPrice: number;
  change: number;
  pChange: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  totalTradedVolume: number;
  yearHigh: number;
  yearLow: number;
  lastUpdateTime: string;
  industry?: string;
}

interface IndexData {
  indexName: string;
  current: number;
  change: number;
  pChange: number;
  high: number;
  low: number;
  lastUpdateTime: string;
}

interface MarketStatus {
  market: string;
  marketStatus: string;
  marketStatusMessage: string;
}

export function StockDashboard() {
  const [activeSection, setActiveSection] = useState<'overview' | 'search' | 'ai'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Market data
  const [nifty, setNifty] = useState<{ indexData: IndexData; stocks: StockQuote[] } | null>(null);
  const [bankNifty, setBankNifty] = useState<{ indexData: IndexData; stocks: StockQuote[] } | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus[]>([]);
  const [gainers, setGainers] = useState<StockQuote[]>([]);
  const [losers, setLosers] = useState<StockQuote[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Selected stock for AI analysis
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<Array<{role: string; content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [niftyRes, bankNiftyRes, statusRes, gainersRes, losersRes] = await Promise.all([
        fetch(`${API_BASE}/api/stocks/nifty50`),
        fetch(`${API_BASE}/api/stocks/banknifty`),
        fetch(`${API_BASE}/api/stocks/market-status`),
        fetch(`${API_BASE}/api/stocks/gainers`),
        fetch(`${API_BASE}/api/stocks/losers`),
      ]);

      const niftyData = await niftyRes.json();
      const bankNiftyData = await bankNiftyRes.json();
      const statusData = await statusRes.json();
      const gainersData = await gainersRes.json();
      const losersData = await losersRes.json();

      if (niftyData.success) setNifty(niftyData.data);
      if (bankNiftyData.success) setBankNifty(bankNiftyData.data);
      if (statusData.success) setMarketStatus(statusData.data);
      if (gainersData.success) setGainers(gainersData.data);
      if (losersData.success) setLosers(losersData.data);
    } catch (err) {
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stocks/quote/${encodeURIComponent(searchQuery.toUpperCase())}`);
      const data = await res.json();

      if (data.success) {
        setSearchResults([data.data]);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const analyzeStock = async (stock: StockQuote) => {
    setSelectedStock(stock);
    setActiveSection('ai');
    setAiLoading(true);
    setAiError(null);
    setAiAnalysis(null);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    try {
      const res = await fetch(`${API_BASE}/api/stocks/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.success && data.data) {
        setAiAnalysis(data.data);
      } else {
        setAiError(data.error?.message || 'Failed to analyze stock. Please try again.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setAiError('Analysis timed out. Please try again.');
      } else {
        setAiError('Failed to analyze stock. Please check your connection and try again.');
      }
      console.error('Analysis failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/stocks/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          stockContext: selectedStock
        }),
      });
      const data = await res.json();

      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.data.response }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, failed to get response.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const formatVolume = (vol: number) => vol >= 10000000 ? `${(vol / 10000000).toFixed(2)} Cr` : vol >= 100000 ? `${(vol / 100000).toFixed(2)} L` : vol.toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="stock-dashboard">
        <div className="stock-loading">
          <Loader2 className="spin" size={40} />
          <span>Loading Indian Stock Market Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-dashboard">
        <div className="stock-error">
          <AlertTriangle size={40} />
          <span>{error}</span>
          <button onClick={loadMarketData}>Retry</button>
        </div>
      </div>
    );
  }

  const currentStatus = marketStatus.find(s => s.market === 'Capital Market');
  const isMarketOpen = currentStatus?.marketStatus === 'Open';

  return (
    <div className="stock-dashboard">
      {/* Header */}
      <div className="stock-header">
        <div className="stock-title">
          <BarChart3 size={28} />
          <div>
            <h1>Indian Stock Market</h1>
            <p>NSE Live Data</p>
          </div>
        </div>
        <div className="stock-actions">
          <div className={`market-status ${isMarketOpen ? 'open' : 'closed'}`}>
            <Clock size={14} />
            <span>{isMarketOpen ? 'Market Open' : 'Market Closed'}</span>
          </div>
          <button className="refresh-btn" onClick={loadMarketData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="stock-nav">
        <button
          className={activeSection === 'overview' ? 'active' : ''}
          onClick={() => setActiveSection('overview')}
        >
          <BarChart3 size={18} />
          Market Overview
        </button>
        <button
          className={activeSection === 'search' ? 'active' : ''}
          onClick={() => setActiveSection('search')}
        >
          <Search size={18} />
          Search Stocks
        </button>
        <button
          className={activeSection === 'ai' ? 'active' : ''}
          onClick={() => setActiveSection('ai')}
        >
          <Brain size={18} />
          AI Analysis
        </button>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="stock-content">
          {/* Index Cards */}
          <div className="index-cards">
            {nifty && (
              <div className={`index-card ${nifty.indexData.change >= 0 ? 'positive' : 'negative'}`}>
                <div className="index-name">NIFTY 50</div>
                <div className="index-value">{nifty.indexData.current.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="index-change">
                  {nifty.indexData.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>{nifty.indexData.change >= 0 ? '+' : ''}{nifty.indexData.change.toFixed(2)}</span>
                  <span>({nifty.indexData.pChange >= 0 ? '+' : ''}{nifty.indexData.pChange.toFixed(2)}%)</span>
                </div>
                <div className="index-range">
                  <span>L: {nifty.indexData.low.toLocaleString('en-IN')}</span>
                  <span>H: {nifty.indexData.high.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
            {bankNifty && (
              <div className={`index-card ${bankNifty.indexData.change >= 0 ? 'positive' : 'negative'}`}>
                <div className="index-name">BANK NIFTY</div>
                <div className="index-value">{bankNifty.indexData.current.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="index-change">
                  {bankNifty.indexData.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>{bankNifty.indexData.change >= 0 ? '+' : ''}{bankNifty.indexData.change.toFixed(2)}</span>
                  <span>({bankNifty.indexData.pChange >= 0 ? '+' : ''}{bankNifty.indexData.pChange.toFixed(2)}%)</span>
                </div>
                <div className="index-range">
                  <span>L: {bankNifty.indexData.low.toLocaleString('en-IN')}</span>
                  <span>H: {bankNifty.indexData.high.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Gainers & Losers */}
          <div className="gainers-losers">
            <div className="gl-section">
              <h3><TrendingUp size={20} /> Top Gainers</h3>
              <div className="gl-list">
                {gainers.slice(0, 5).map(stock => (
                  <div key={stock.symbol} className="gl-item" onClick={() => analyzeStock(stock)}>
                    <div className="gl-info">
                      <span className="gl-symbol">{stock.symbol}</span>
                      <span className="gl-name">{stock.companyName?.slice(0, 20)}</span>
                    </div>
                    <div className="gl-price">
                      <span>{formatPrice(stock.lastPrice)}</span>
                      <span className="positive">+{stock.pChange.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="gl-section">
              <h3><TrendingDown size={20} /> Top Losers</h3>
              <div className="gl-list">
                {losers.slice(0, 5).map(stock => (
                  <div key={stock.symbol} className="gl-item" onClick={() => analyzeStock(stock)}>
                    <div className="gl-info">
                      <span className="gl-symbol">{stock.symbol}</span>
                      <span className="gl-name">{stock.companyName?.slice(0, 20)}</span>
                    </div>
                    <div className="gl-price">
                      <span>{formatPrice(stock.lastPrice)}</span>
                      <span className="negative">{stock.pChange.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NIFTY 50 Stocks */}
          {nifty && (
            <div className="stocks-table-section">
              <h3>NIFTY 50 Stocks</h3>
              <div className="stocks-table">
                <div className="stocks-header">
                  <span>Symbol</span>
                  <span>LTP</span>
                  <span>Change</span>
                  <span>% Change</span>
                  <span>Volume</span>
                  <span>Action</span>
                </div>
                {nifty.stocks.slice(0, 20).map(stock => (
                  <div key={stock.symbol} className="stocks-row">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span>{formatPrice(stock.lastPrice)}</span>
                    <span className={stock.change >= 0 ? 'positive' : 'negative'}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </span>
                    <span className={stock.pChange >= 0 ? 'positive' : 'negative'}>
                      {stock.pChange >= 0 ? '+' : ''}{stock.pChange.toFixed(2)}%
                    </span>
                    <span>{formatVolume(stock.totalTradedVolume)}</span>
                    <button className="analyze-btn" onClick={() => analyzeStock(stock)}>
                      <Brain size={14} /> Analyze
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Section */}
      {activeSection === 'search' && (
        <div className="stock-content">
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Enter stock symbol (e.g., RELIANCE, TCS, INFY)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? <Loader2 className="spin" size={18} /> : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(stock => (
                  <div key={stock.symbol} className="search-result-card">
                    <div className="src-header">
                      <div>
                        <h3>{stock.symbol}</h3>
                        <p>{stock.companyName}</p>
                      </div>
                      <div className={`src-price ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                        <span className="price">{formatPrice(stock.lastPrice)}</span>
                        <span className="change">
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.pChange >= 0 ? '+' : ''}{stock.pChange.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="src-details">
                      <div className="src-detail">
                        <span>Open</span>
                        <span>{formatPrice(stock.open)}</span>
                      </div>
                      <div className="src-detail">
                        <span>High</span>
                        <span>{formatPrice(stock.dayHigh)}</span>
                      </div>
                      <div className="src-detail">
                        <span>Low</span>
                        <span>{formatPrice(stock.dayLow)}</span>
                      </div>
                      <div className="src-detail">
                        <span>Prev Close</span>
                        <span>{formatPrice(stock.previousClose)}</span>
                      </div>
                      <div className="src-detail">
                        <span>52W High</span>
                        <span>{formatPrice(stock.yearHigh)}</span>
                      </div>
                      <div className="src-detail">
                        <span>52W Low</span>
                        <span>{formatPrice(stock.yearLow)}</span>
                      </div>
                      <div className="src-detail">
                        <span>Volume</span>
                        <span>{formatVolume(stock.totalTradedVolume)}</span>
                      </div>
                    </div>
                    <button className="src-analyze" onClick={() => analyzeStock(stock)}>
                      <Brain size={18} /> AI Analysis
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="popular-stocks">
              <h4>Popular Stocks</h4>
              <div className="popular-list">
                {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK'].map(symbol => (
                  <button key={symbol} onClick={() => { setSearchQuery(symbol); handleSearch(); }}>
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Section */}
      {activeSection === 'ai' && (
        <div className="stock-content">
          <div className="ai-section">
            {!selectedStock ? (
              <div className="ai-placeholder">
                <Brain size={48} />
                <h3>Select a Stock for AI Analysis</h3>
                <p>Search for a stock or click "Analyze" on any stock to get AI-powered insights</p>
              </div>
            ) : (
              <div className="ai-analysis">
                <div className="ai-stock-header">
                  <div>
                    <h2>{selectedStock.symbol}</h2>
                    <p>{selectedStock.companyName}</p>
                  </div>
                  <div className={`ai-stock-price ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                    <span>{formatPrice(selectedStock.lastPrice)}</span>
                    <span>{selectedStock.change >= 0 ? '+' : ''}{selectedStock.pChange.toFixed(2)}%</span>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="ai-loading">
                    <Loader2 className="spin" size={32} />
                    <span>Analyzing {selectedStock.symbol}...</span>
                    <p className="ai-loading-hint">This may take up to 30 seconds</p>
                  </div>
                ) : aiError ? (
                  <div className="ai-error">
                    <AlertTriangle size={32} />
                    <span>{aiError}</span>
                    <button onClick={() => analyzeStock(selectedStock)}>
                      <RefreshCw size={16} /> Try Again
                    </button>
                  </div>
                ) : aiAnalysis ? (
                  <div className="ai-results">
                    <div className="ai-summary">
                      <div className={`ai-recommendation ${aiAnalysis.recommendation}`}>
                        {aiAnalysis.recommendation?.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className={`ai-risk ${aiAnalysis.riskLevel}`}>
                        Risk: {aiAnalysis.riskLevel?.toUpperCase()}
                      </div>
                    </div>

                    <div className="ai-section-block">
                      <h4>Summary</h4>
                      <p>{aiAnalysis.summary}</p>
                    </div>

                    <div className="ai-section-block">
                      <h4>Technical Analysis</h4>
                      <p>{aiAnalysis.technicalAnalysis}</p>
                    </div>

                    <div className="ai-section-block">
                      <h4>Fundamental Outlook</h4>
                      <p>{aiAnalysis.fundamentalOutlook}</p>
                    </div>

                    {aiAnalysis.targetPrice && (
                      <div className="ai-target-price">
                        <h4>Target Price Range</h4>
                        <div className="target-range">
                          <div className="target-item">
                            <span>Low</span>
                            <span>{formatPrice(aiAnalysis.targetPrice.low)}</span>
                          </div>
                          <div className="target-item mid">
                            <span>Target</span>
                            <span>{formatPrice(aiAnalysis.targetPrice.mid)}</span>
                          </div>
                          <div className="target-item">
                            <span>High</span>
                            <span>{formatPrice(aiAnalysis.targetPrice.high)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {aiAnalysis.keyFactors && (
                      <div className="ai-section-block">
                        <h4>Key Factors</h4>
                        <ul>
                          {aiAnalysis.keyFactors.map((factor: string, i: number) => (
                            <li key={i}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="analyze-stock-btn" onClick={() => analyzeStock(selectedStock)}>
                    <Brain size={20} /> Analyze This Stock
                  </button>
                )}

                {/* Chat Section */}
                <div className="ai-chat">
                  <h4><MessageSquare size={18} /> Ask about {selectedStock.symbol}</h4>
                  <div className="chat-messages">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chat-message ${msg.role}`}>
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="chat-message assistant loading">
                        <Loader2 className="spin" size={16} /> Thinking...
                      </div>
                    )}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      placeholder={`Ask anything about ${selectedStock.symbol}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <button onClick={sendChatMessage} disabled={chatLoading}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
