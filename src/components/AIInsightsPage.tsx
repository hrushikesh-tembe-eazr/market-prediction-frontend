import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Briefcase,
  Newspaper,
  Brain,
  Target,
  Bell,
  BookOpen,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import type { Market } from '../types/market';
import './AIInsightsPage.css';

interface AIInsightsPageProps {
  selectedMarket: Market | null;
  markets: Market[];
}

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3847'
  : '/api/proxy';

interface SentimentData {
  overallScore: number;
  components: {
    priceAction: number;
    volumeTrend: number;
    marketMomentum: number;
    newsImpact: number;
    crowdWisdom: number;
  };
  interpretation: string;
  tradingSignal: string;
  confidence: number;
}

interface PredictionData {
  currentPrice: number;
  predictedPrice: number;
  confidenceInterval: { low: number; high: number };
  confidence: number;
  direction: string;
  keyFactors: string[];
  disclaimer: string;
}

interface NewsData {
  relatedNews: Array<{ headline: string; impact: string; sentiment: string }>;
  overallImpact: string;
  riskLevel: string;
}

interface AnomalyData {
  anomalies: Array<{
    marketId: string;
    marketTitle: string;
    anomalyType: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  marketHealth: string;
  summary: string;
}

interface PortfolioData {
  recommendations: Array<{
    marketId: string;
    marketTitle: string;
    action: string;
    confidence: number;
    reasoning: string;
    suggestedAllocation: number;
  }>;
  diversificationScore: number;
  overallStrategy: string;
  expectedReturn: string;
}

interface AlertData {
  alerts: Array<{
    condition: string;
    trigger: string;
    priority: string;
    reasoning: string;
  }>;
  keyDates: Array<{ date: string; event: string; importance: string }>;
  monitoringAdvice: string;
}

interface ExplainData {
  simpleExplanation: string;
  whatItMeans: string;
  whyItMatters: string;
  howToTrade: string;
  keyTerms: Array<{ term: string; definition: string }>;
  relatedConcepts: string[];
}

export function AIInsightsPage({ selectedMarket, markets }: AIInsightsPageProps) {
  const [activeTab, setActiveTab] = useState<string>('sentiment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [news, setNews] = useState<NewsData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [alerts, setAlerts] = useState<AlertData | null>(null);
  const [explain, setExplain] = useState<ExplainData | null>(null);

  const [predictionTimeframe, setPredictionTimeframe] = useState<string>('24h');
  const [riskTolerance, setRiskTolerance] = useState<string>('moderate');
  const [expertiseLevel, setExpertiseLevel] = useState<string>('beginner');

  const fetchData = async (endpoint: string, body: object, setter: (data: any) => void) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) {
        setter(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  const loadSentiment = () => {
    if (!selectedMarket) return;
    fetchData('sentiment', { market: selectedMarket }, setSentiment);
  };

  const loadPrediction = () => {
    if (!selectedMarket) return;
    fetchData('predict', { market: selectedMarket, timeframe: predictionTimeframe }, setPrediction);
  };

  const loadNews = () => {
    if (!selectedMarket) return;
    fetchData('news-impact', { market: selectedMarket }, setNews);
  };

  const loadAnomalies = () => {
    fetchData('anomalies', { markets }, setAnomalies);
  };

  const loadPortfolio = () => {
    fetchData('portfolio-advice', { markets, riskTolerance }, setPortfolio);
  };

  const loadAlerts = () => {
    if (!selectedMarket) return;
    fetchData('smart-alerts', { market: selectedMarket }, setAlerts);
  };

  const loadExplain = () => {
    if (!selectedMarket) return;
    fetchData('explain', { market: selectedMarket, expertiseLevel }, setExplain);
  };

  const tabs = [
    { id: 'sentiment', label: 'Sentiment Analysis', icon: Brain, requiresMarket: true, description: 'Get comprehensive sentiment score' },
    { id: 'predict', label: 'Price Prediction', icon: Target, requiresMarket: true, description: 'Predict future prices' },
    { id: 'news', label: 'News Impact', icon: Newspaper, requiresMarket: true, description: 'Analyze news affecting market' },
    { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle, requiresMarket: false, description: 'Detect unusual patterns' },
    { id: 'portfolio', label: 'Portfolio Advisor', icon: Briefcase, requiresMarket: false, description: 'Get investment advice' },
    { id: 'alerts', label: 'Smart Alerts', icon: Bell, requiresMarket: true, description: 'Generate alert conditions' },
    { id: 'explain', label: 'Market Explainer', icon: BookOpen, requiresMarket: true, description: 'Understand the market' },
  ];

  const getScoreColor = (score: number) => {
    if (score > 30) return 'positive';
    if (score < -30) return 'negative';
    return 'neutral';
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes('buy')) return 'positive';
    if (signal.includes('sell')) return 'negative';
    return 'neutral';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high' || severity === 'critical') return 'negative';
    if (severity === 'medium') return 'warning';
    return 'neutral';
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="ai-insights-page">
      {/* Sidebar */}
      <div className="ai-sidebar">
        <div className="ai-sidebar-header">
          <Sparkles size={24} />
          <h2>AI Insights</h2>
        </div>
        <nav className="ai-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`ai-nav-item ${activeTab === tab.id ? 'active' : ''} ${tab.requiresMarket && !selectedMarket ? 'disabled' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.requiresMarket && !selectedMarket}
            >
              <tab.icon size={20} />
              <div className="nav-text">
                <span className="nav-label">{tab.label}</span>
                <span className="nav-desc">{tab.description}</span>
              </div>
            </button>
          ))}
        </nav>
        {selectedMarket && (
          <div className="selected-market-info">
            <span className="label">Selected Market:</span>
            <span className="market-title">{selectedMarket.title}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="ai-main-content">
        <div className="ai-content-header">
          <div className="header-info">
            {currentTab && <currentTab.icon size={28} />}
            <div>
              <h1>{currentTab?.label}</h1>
              <p>{currentTab?.description}</p>
            </div>
          </div>
        </div>

        <div className="ai-content-body">
          {loading && (
            <div className="ai-loading-state">
              <Loader2 className="spin" size={40} />
              <span>Analyzing with AI...</span>
            </div>
          )}

          {error && (
            <div className="ai-error-state">
              <AlertTriangle size={24} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* SENTIMENT TAB */}
              {activeTab === 'sentiment' && (
                <div className="ai-tab-content">
                  {!selectedMarket ? (
                    <div className="ai-placeholder">
                      <Brain size={48} />
                      <h3>Select a Market</h3>
                      <p>Choose a market from the Markets tab to analyze sentiment</p>
                    </div>
                  ) : !sentiment ? (
                    <div className="ai-action-area">
                      <Brain size={48} />
                      <h3>Sentiment Analysis</h3>
                      <p>Get a comprehensive sentiment score for "{selectedMarket.title}"</p>
                      <button className="ai-action-btn" onClick={loadSentiment}>
                        <Brain size={20} />
                        Analyze Sentiment
                      </button>
                    </div>
                  ) : (
                    <div className="sentiment-result">
                      <div className="result-grid">
                        <div className={`sentiment-score-card ${getScoreColor(sentiment.overallScore)}`}>
                          <span className="score-value">{sentiment.overallScore > 0 ? '+' : ''}{sentiment.overallScore}</span>
                          <span className="score-label">Overall Score</span>
                          <div className={`trading-signal ${getSignalColor(sentiment.tradingSignal)}`}>
                            {sentiment.tradingSignal === 'strong_buy' || sentiment.tradingSignal === 'buy' ? <TrendingUp size={16} /> : sentiment.tradingSignal === 'strong_sell' || sentiment.tradingSignal === 'sell' ? <TrendingDown size={16} /> : null}
                            {sentiment.tradingSignal.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <div className="interpretation-card">
                          <h4>Analysis</h4>
                          <p>{sentiment.interpretation}</p>
                          <div className="confidence">Confidence: {(sentiment.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="components-section">
                        <h4>Sentiment Components</h4>
                        <div className="components-grid">
                          {Object.entries(sentiment.components).map(([key, value]) => (
                            <div key={key} className="component-item">
                              <span className="comp-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <div className="comp-bar-container">
                                <div className="comp-bar">
                                  <div className={`comp-fill ${getScoreColor(value)}`} style={{ width: `${Math.abs(value) / 2}%`, marginLeft: value < 0 ? `${50 - Math.abs(value) / 2}%` : '50%' }}></div>
                                </div>
                                <span className={`comp-value ${getScoreColor(value)}`}>{value > 0 ? '+' : ''}{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button className="ai-refresh-btn" onClick={loadSentiment}>
                        <RefreshCw size={16} /> Refresh Analysis
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PREDICTION TAB */}
              {activeTab === 'predict' && (
                <div className="ai-tab-content">
                  {!selectedMarket ? (
                    <div className="ai-placeholder">
                      <Target size={48} />
                      <h3>Select a Market</h3>
                      <p>Choose a market from the Markets tab to predict prices</p>
                    </div>
                  ) : (
                    <div className="prediction-content">
                      <div className="prediction-controls">
                        <label>Prediction Timeframe:</label>
                        <div className="timeframe-options">
                          {['1h', '24h', '7d', '30d'].map(tf => (
                            <button
                              key={tf}
                              className={`timeframe-btn ${predictionTimeframe === tf ? 'active' : ''}`}
                              onClick={() => setPredictionTimeframe(tf)}
                            >
                              {tf === '1h' ? '1 Hour' : tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : '30 Days'}
                            </button>
                          ))}
                        </div>
                        <button className="ai-action-btn" onClick={loadPrediction}>
                          <Target size={20} />
                          Predict Price
                        </button>
                      </div>
                      {prediction && (
                        <div className="prediction-result">
                          <div className="price-comparison">
                            <div className="price-box current">
                              <span className="price-label">Current</span>
                              <span className="price-value">{(prediction.currentPrice * 100).toFixed(1)}%</span>
                            </div>
                            <div className={`direction-indicator ${prediction.direction}`}>
                              {prediction.direction === 'up' ? <TrendingUp size={32} /> : prediction.direction === 'down' ? <TrendingDown size={32} /> : <span>→</span>}
                            </div>
                            <div className="price-box predicted">
                              <span className="price-label">Predicted ({predictionTimeframe})</span>
                              <span className="price-value">{(prediction.predictedPrice * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="confidence-range">
                            <span>Confidence Range: {(prediction.confidenceInterval.low * 100).toFixed(1)}% - {(prediction.confidenceInterval.high * 100).toFixed(1)}%</span>
                            <div className="range-bar">
                              <div className="range-fill" style={{ left: `${prediction.confidenceInterval.low * 100}%`, width: `${(prediction.confidenceInterval.high - prediction.confidenceInterval.low) * 100}%` }}></div>
                              <div className="predicted-marker" style={{ left: `${prediction.predictedPrice * 100}%` }}></div>
                            </div>
                          </div>
                          <div className="key-factors-section">
                            <h4>Key Factors</h4>
                            <ul>
                              {prediction.keyFactors.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                          </div>
                          <p className="disclaimer">{prediction.disclaimer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* NEWS TAB */}
              {activeTab === 'news' && (
                <div className="ai-tab-content">
                  {!selectedMarket ? (
                    <div className="ai-placeholder">
                      <Newspaper size={48} />
                      <h3>Select a Market</h3>
                      <p>Choose a market from the Markets tab to analyze news impact</p>
                    </div>
                  ) : !news ? (
                    <div className="ai-action-area">
                      <Newspaper size={48} />
                      <h3>News Impact Analysis</h3>
                      <p>Find news events that could affect "{selectedMarket.title}"</p>
                      <button className="ai-action-btn" onClick={loadNews}>
                        <Newspaper size={20} />
                        Analyze News
                      </button>
                    </div>
                  ) : (
                    <div className="news-result">
                      <div className="news-header">
                        <div className={`risk-badge ${news.riskLevel}`}>
                          Risk Level: {news.riskLevel.toUpperCase()}
                        </div>
                        <p className="overall-impact">{news.overallImpact}</p>
                      </div>
                      <div className="news-grid">
                        {news.relatedNews.map((item, i) => (
                          <div key={i} className={`news-card ${item.sentiment}`}>
                            <div className="news-card-header">
                              <span className={`sentiment-tag ${item.sentiment}`}>{item.sentiment}</span>
                            </div>
                            <h4>{item.headline}</h4>
                            <p>{item.impact}</p>
                          </div>
                        ))}
                      </div>
                      <button className="ai-refresh-btn" onClick={loadNews}>
                        <RefreshCw size={16} /> Refresh News
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ANOMALIES TAB */}
              {activeTab === 'anomalies' && (
                <div className="ai-tab-content">
                  {!anomalies ? (
                    <div className="ai-action-area">
                      <AlertTriangle size={48} />
                      <h3>Anomaly Detection</h3>
                      <p>Scan all {markets.length} markets for unusual patterns and opportunities</p>
                      <button className="ai-action-btn" onClick={loadAnomalies}>
                        <AlertTriangle size={20} />
                        Detect Anomalies
                      </button>
                    </div>
                  ) : (
                    <div className="anomalies-result">
                      <div className="anomalies-header">
                        <div className={`health-badge ${anomalies.marketHealth}`}>
                          Market Health: {anomalies.marketHealth.toUpperCase()}
                        </div>
                        <p className="summary">{anomalies.summary}</p>
                      </div>
                      {anomalies.anomalies.length === 0 ? (
                        <div className="no-anomalies">
                          <span>No anomalies detected across {markets.length} markets</span>
                        </div>
                      ) : (
                        <div className="anomalies-grid">
                          {anomalies.anomalies.map((a, i) => (
                            <div key={i} className={`anomaly-card ${getSeverityColor(a.severity)}`}>
                              <div className="anomaly-card-header">
                                <span className={`severity-tag ${a.severity}`}>{a.severity}</span>
                                <span className="anomaly-type">{a.anomalyType.replace(/_/g, ' ')}</span>
                              </div>
                              <h4>{a.marketTitle}</h4>
                              <p>{a.description}</p>
                              <div className="recommendation">
                                <strong>Recommendation:</strong> {a.recommendation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button className="ai-refresh-btn" onClick={loadAnomalies}>
                        <RefreshCw size={16} /> Rescan Markets
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PORTFOLIO TAB */}
              {activeTab === 'portfolio' && (
                <div className="ai-tab-content">
                  <div className="portfolio-content">
                    <div className="portfolio-controls">
                      <label>Risk Tolerance:</label>
                      <div className="risk-options">
                        {['conservative', 'moderate', 'aggressive'].map(risk => (
                          <button
                            key={risk}
                            className={`risk-btn ${riskTolerance === risk ? 'active' : ''}`}
                            onClick={() => setRiskTolerance(risk)}
                          >
                            {risk.charAt(0).toUpperCase() + risk.slice(1)}
                          </button>
                        ))}
                      </div>
                      <button className="ai-action-btn" onClick={loadPortfolio}>
                        <Briefcase size={20} />
                        Get Portfolio Advice
                      </button>
                    </div>
                    {portfolio && (
                      <div className="portfolio-result">
                        <div className="portfolio-summary">
                          <div className="summary-card">
                            <span className="summary-label">Diversification Score</span>
                            <span className="summary-value">{(portfolio.diversificationScore * 100).toFixed(0)}%</span>
                          </div>
                          <div className="strategy-card">
                            <h4>Strategy</h4>
                            <p>{portfolio.overallStrategy}</p>
                            <p className="expected-return"><strong>Expected Return:</strong> {portfolio.expectedReturn}</p>
                          </div>
                        </div>
                        <div className="recommendations-section">
                          <h4>Recommendations</h4>
                          <div className="recommendations-grid">
                            {portfolio.recommendations.map((r, i) => (
                              <div key={i} className={`rec-card ${r.action}`}>
                                <div className="rec-card-header">
                                  <span className={`action-tag ${r.action}`}>{r.action.replace('_', ' ')}</span>
                                  <span className="allocation">{(r.suggestedAllocation * 100).toFixed(0)}% allocation</span>
                                </div>
                                <h5>{r.marketTitle}</h5>
                                <p>{r.reasoning}</p>
                                <div className="rec-confidence">Confidence: {(r.confidence * 100).toFixed(0)}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ALERTS TAB */}
              {activeTab === 'alerts' && (
                <div className="ai-tab-content">
                  {!selectedMarket ? (
                    <div className="ai-placeholder">
                      <Bell size={48} />
                      <h3>Select a Market</h3>
                      <p>Choose a market from the Markets tab to generate smart alerts</p>
                    </div>
                  ) : !alerts ? (
                    <div className="ai-action-area">
                      <Bell size={48} />
                      <h3>Smart Alerts</h3>
                      <p>Generate personalized alert conditions for "{selectedMarket.title}"</p>
                      <button className="ai-action-btn" onClick={loadAlerts}>
                        <Bell size={20} />
                        Generate Alerts
                      </button>
                    </div>
                  ) : (
                    <div className="alerts-result">
                      <div className="monitoring-advice">
                        <h4>Monitoring Advice</h4>
                        <p>{alerts.monitoringAdvice}</p>
                      </div>
                      <div className="alerts-section">
                        <h4>Smart Alerts</h4>
                        <div className="alerts-grid">
                          {alerts.alerts.map((a, i) => (
                            <div key={i} className={`alert-card ${a.priority}`}>
                              <div className="alert-card-header">
                                <Bell size={16} />
                                <span className={`priority-tag ${a.priority}`}>{a.priority}</span>
                              </div>
                              <p className="condition">{a.condition}</p>
                              <p className="trigger"><strong>Trigger:</strong> {a.trigger}</p>
                              <p className="reasoning">{a.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {alerts.keyDates.length > 0 && (
                        <div className="key-dates-section">
                          <h4>Key Dates to Watch</h4>
                          <div className="dates-list">
                            {alerts.keyDates.map((d, i) => (
                              <div key={i} className="date-item">
                                <span className="date">{d.date}</span>
                                <span className="event">{d.event}</span>
                                <span className="importance">{d.importance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <button className="ai-refresh-btn" onClick={loadAlerts}>
                        <RefreshCw size={16} /> Refresh Alerts
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* EXPLAIN TAB */}
              {activeTab === 'explain' && (
                <div className="ai-tab-content">
                  {!selectedMarket ? (
                    <div className="ai-placeholder">
                      <BookOpen size={48} />
                      <h3>Select a Market</h3>
                      <p>Choose a market from the Markets tab to get an explanation</p>
                    </div>
                  ) : (
                    <div className="explain-content">
                      <div className="explain-controls">
                        <label>Your Expertise Level:</label>
                        <div className="expertise-options">
                          {['beginner', 'intermediate', 'expert'].map(level => (
                            <button
                              key={level}
                              className={`expertise-btn ${expertiseLevel === level ? 'active' : ''}`}
                              onClick={() => setExpertiseLevel(level)}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          ))}
                        </div>
                        <button className="ai-action-btn" onClick={loadExplain}>
                          <BookOpen size={20} />
                          Explain Market
                        </button>
                      </div>
                      {explain && (
                        <div className="explain-result">
                          <div className="explain-sections">
                            <section className="explain-section">
                              <h4>What is this market?</h4>
                              <p>{explain.simpleExplanation}</p>
                            </section>
                            <section className="explain-section">
                              <h4>What does the price mean?</h4>
                              <p>{explain.whatItMeans}</p>
                            </section>
                            <section className="explain-section">
                              <h4>Why does it matter?</h4>
                              <p>{explain.whyItMatters}</p>
                            </section>
                            <section className="explain-section">
                              <h4>How to trade?</h4>
                              <p>{explain.howToTrade}</p>
                            </section>
                          </div>
                          {explain.keyTerms.length > 0 && (
                            <div className="key-terms-section">
                              <h4>Key Terms</h4>
                              <div className="terms-grid">
                                {explain.keyTerms.map((t, i) => (
                                  <div key={i} className="term-item">
                                    <dt>{t.term}</dt>
                                    <dd>{t.definition}</dd>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {explain.relatedConcepts.length > 0 && (
                            <div className="related-section">
                              <h4>Related Concepts</h4>
                              <div className="concepts-list">
                                {explain.relatedConcepts.map((c, i) => (
                                  <span key={i} className="concept-tag">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
