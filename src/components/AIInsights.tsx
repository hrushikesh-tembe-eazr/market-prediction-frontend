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
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import type { Market } from '../types/market';
import './AIInsights.css';

interface AIInsightsProps {
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

export function AIInsights({ selectedMarket, markets }: AIInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    { id: 'sentiment', label: 'Sentiment', icon: Brain, requiresMarket: true },
    { id: 'predict', label: 'Predict', icon: Target, requiresMarket: true },
    { id: 'news', label: 'News', icon: Newspaper, requiresMarket: true },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle, requiresMarket: false },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase, requiresMarket: false },
    { id: 'alerts', label: 'Alerts', icon: Bell, requiresMarket: true },
    { id: 'explain', label: 'Explain', icon: BookOpen, requiresMarket: true },
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

  if (!isOpen) {
    return (
      <button className="ai-insights-fab" onClick={() => setIsOpen(true)}>
        <Sparkles size={20} />
        <span>AI Insights</span>
      </button>
    );
  }

  return (
    <div className="ai-insights-panel">
      <div className="ai-insights-header">
        <div className="ai-insights-title">
          <Sparkles size={20} />
          <span>AI Insights</span>
        </div>
        <button className="ai-insights-close" onClick={() => setIsOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="ai-insights-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ai-tab ${activeTab === tab.id ? 'active' : ''} ${tab.requiresMarket && !selectedMarket ? 'disabled' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={tab.requiresMarket && !selectedMarket}
            title={tab.requiresMarket && !selectedMarket ? 'Select a market first' : tab.label}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ai-insights-content">
        {loading && (
          <div className="ai-loading">
            <Loader2 className="spin" size={24} />
            <span>Analyzing...</span>
          </div>
        )}

        {error && (
          <div className="ai-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* SENTIMENT TAB */}
            {activeTab === 'sentiment' && (
              <div className="ai-tab-content">
                {!selectedMarket ? (
                  <p className="ai-hint">Select a market to analyze sentiment</p>
                ) : !sentiment ? (
                  <button className="ai-action-btn" onClick={loadSentiment}>
                    <Brain size={18} />
                    Analyze Sentiment
                  </button>
                ) : (
                  <div className="sentiment-result">
                    <div className={`sentiment-score ${getScoreColor(sentiment.overallScore)}`}>
                      <span className="score-value">{sentiment.overallScore > 0 ? '+' : ''}{sentiment.overallScore}</span>
                      <span className="score-label">Overall Score</span>
                    </div>
                    <div className={`trading-signal ${getSignalColor(sentiment.tradingSignal)}`}>
                      {sentiment.tradingSignal === 'strong_buy' || sentiment.tradingSignal === 'buy' ? <TrendingUp size={16} /> : sentiment.tradingSignal === 'strong_sell' || sentiment.tradingSignal === 'sell' ? <TrendingDown size={16} /> : null}
                      {sentiment.tradingSignal.replace('_', ' ').toUpperCase()}
                    </div>
                    <p className="interpretation">{sentiment.interpretation}</p>
                    <div className="sentiment-components">
                      {Object.entries(sentiment.components).map(([key, value]) => (
                        <div key={key} className="component">
                          <span className="comp-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="comp-bar">
                            <div className={`comp-fill ${getScoreColor(value)}`} style={{ width: `${Math.abs(value) / 2}%`, marginLeft: value < 0 ? `${50 - Math.abs(value) / 2}%` : '50%' }}></div>
                          </div>
                          <span className={`comp-value ${getScoreColor(value)}`}>{value > 0 ? '+' : ''}{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="confidence">Confidence: {(sentiment.confidence * 100).toFixed(0)}%</div>
                    <button className="ai-refresh" onClick={loadSentiment}>Refresh</button>
                  </div>
                )}
              </div>
            )}

            {/* PREDICTION TAB */}
            {activeTab === 'predict' && (
              <div className="ai-tab-content">
                {!selectedMarket ? (
                  <p className="ai-hint">Select a market to predict prices</p>
                ) : (
                  <>
                    <div className="prediction-options">
                      <label>Timeframe:</label>
                      <select value={predictionTimeframe} onChange={(e) => setPredictionTimeframe(e.target.value)}>
                        <option value="1h">1 Hour</option>
                        <option value="24h">24 Hours</option>
                        <option value="7d">7 Days</option>
                        <option value="30d">30 Days</option>
                      </select>
                      <button className="ai-action-btn" onClick={loadPrediction}>
                        <Target size={18} />
                        Predict
                      </button>
                    </div>
                    {prediction && (
                      <div className="prediction-result">
                        <div className="price-prediction">
                          <div className="current-price">
                            <span>Current</span>
                            <strong>{(prediction.currentPrice * 100).toFixed(1)}%</strong>
                          </div>
                          <div className={`direction ${prediction.direction}`}>
                            {prediction.direction === 'up' ? <TrendingUp /> : prediction.direction === 'down' ? <TrendingDown /> : '→'}
                          </div>
                          <div className="predicted-price">
                            <span>Predicted</span>
                            <strong>{(prediction.predictedPrice * 100).toFixed(1)}%</strong>
                          </div>
                        </div>
                        <div className="confidence-interval">
                          <span>Range: {(prediction.confidenceInterval.low * 100).toFixed(1)}% - {(prediction.confidenceInterval.high * 100).toFixed(1)}%</span>
                        </div>
                        <div className="key-factors">
                          <strong>Key Factors:</strong>
                          <ul>
                            {prediction.keyFactors.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                        <p className="disclaimer">{prediction.disclaimer}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* NEWS TAB */}
            {activeTab === 'news' && (
              <div className="ai-tab-content">
                {!selectedMarket ? (
                  <p className="ai-hint">Select a market to analyze news impact</p>
                ) : !news ? (
                  <button className="ai-action-btn" onClick={loadNews}>
                    <Newspaper size={18} />
                    Analyze News
                  </button>
                ) : (
                  <div className="news-result">
                    <div className={`risk-badge ${news.riskLevel}`}>
                      Risk Level: {news.riskLevel.toUpperCase()}
                    </div>
                    <p className="overall-impact">{news.overallImpact}</p>
                    <div className="news-items">
                      {news.relatedNews.map((item, i) => (
                        <div key={i} className={`news-item ${item.sentiment}`}>
                          <strong>{item.headline}</strong>
                          <p>{item.impact}</p>
                          <span className="sentiment-badge">{item.sentiment}</span>
                        </div>
                      ))}
                    </div>
                    <button className="ai-refresh" onClick={loadNews}>Refresh</button>
                  </div>
                )}
              </div>
            )}

            {/* ANOMALIES TAB */}
            {activeTab === 'anomalies' && (
              <div className="ai-tab-content">
                {!anomalies ? (
                  <button className="ai-action-btn" onClick={loadAnomalies}>
                    <AlertTriangle size={18} />
                    Detect Anomalies
                  </button>
                ) : (
                  <div className="anomalies-result">
                    <div className={`health-badge ${anomalies.marketHealth}`}>
                      Market Health: {anomalies.marketHealth.toUpperCase()}
                    </div>
                    <p className="summary">{anomalies.summary}</p>
                    {anomalies.anomalies.length === 0 ? (
                      <p className="no-anomalies">No anomalies detected</p>
                    ) : (
                      <div className="anomaly-items">
                        {anomalies.anomalies.map((a, i) => (
                          <div key={i} className={`anomaly-item ${getSeverityColor(a.severity)}`}>
                            <div className="anomaly-header">
                              <strong>{a.marketTitle}</strong>
                              <span className={`severity ${a.severity}`}>{a.severity}</span>
                            </div>
                            <span className="anomaly-type">{a.anomalyType.replace(/_/g, ' ')}</span>
                            <p>{a.description}</p>
                            <p className="recommendation"><strong>Recommendation:</strong> {a.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="ai-refresh" onClick={loadAnomalies}>Refresh</button>
                  </div>
                )}
              </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
              <div className="ai-tab-content">
                <div className="portfolio-options">
                  <label>Risk Tolerance:</label>
                  <select value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                  <button className="ai-action-btn" onClick={loadPortfolio}>
                    <Briefcase size={18} />
                    Get Advice
                  </button>
                </div>
                {portfolio && (
                  <div className="portfolio-result">
                    <div className="portfolio-summary">
                      <div className="diversification">
                        Diversification: {(portfolio.diversificationScore * 100).toFixed(0)}%
                      </div>
                      <p className="strategy">{portfolio.overallStrategy}</p>
                      <p className="expected-return"><strong>Expected Return:</strong> {portfolio.expectedReturn}</p>
                    </div>
                    <div className="recommendations">
                      <strong>Recommendations:</strong>
                      {portfolio.recommendations.map((r, i) => (
                        <div key={i} className={`rec-item ${r.action}`}>
                          <div className="rec-header">
                            <span className="rec-title">{r.marketTitle}</span>
                            <span className={`rec-action ${r.action}`}>{r.action.replace('_', ' ')}</span>
                          </div>
                          <p>{r.reasoning}</p>
                          <div className="rec-stats">
                            <span>Allocation: {(r.suggestedAllocation * 100).toFixed(0)}%</span>
                            <span>Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'alerts' && (
              <div className="ai-tab-content">
                {!selectedMarket ? (
                  <p className="ai-hint">Select a market to generate smart alerts</p>
                ) : !alerts ? (
                  <button className="ai-action-btn" onClick={loadAlerts}>
                    <Bell size={18} />
                    Generate Alerts
                  </button>
                ) : (
                  <div className="alerts-result">
                    <p className="monitoring-advice">{alerts.monitoringAdvice}</p>
                    <div className="alert-items">
                      <strong>Smart Alerts:</strong>
                      {alerts.alerts.map((a, i) => (
                        <div key={i} className={`alert-item ${a.priority}`}>
                          <div className="alert-header">
                            <Bell size={14} />
                            <span className={`priority ${a.priority}`}>{a.priority}</span>
                          </div>
                          <p className="condition">{a.condition}</p>
                          <p className="trigger">Trigger: {a.trigger}</p>
                          <p className="reasoning">{a.reasoning}</p>
                        </div>
                      ))}
                    </div>
                    {alerts.keyDates.length > 0 && (
                      <div className="key-dates">
                        <strong>Key Dates to Watch:</strong>
                        {alerts.keyDates.map((d, i) => (
                          <div key={i} className="date-item">
                            <span className="date">{d.date}</span>
                            <span className="event">{d.event}</span>
                            <span className="importance">{d.importance}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="ai-refresh" onClick={loadAlerts}>Refresh</button>
                  </div>
                )}
              </div>
            )}

            {/* EXPLAIN TAB */}
            {activeTab === 'explain' && (
              <div className="ai-tab-content">
                {!selectedMarket ? (
                  <p className="ai-hint">Select a market to get an explanation</p>
                ) : (
                  <>
                    <div className="explain-options">
                      <label>Expertise Level:</label>
                      <select value={expertiseLevel} onChange={(e) => setExpertiseLevel(e.target.value)}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                      <button className="ai-action-btn" onClick={loadExplain}>
                        <BookOpen size={18} />
                        Explain
                      </button>
                    </div>
                    {explain && (
                      <div className="explain-result">
                        <section>
                          <h4>What is this market?</h4>
                          <p>{explain.simpleExplanation}</p>
                        </section>
                        <section>
                          <h4>What does the price mean?</h4>
                          <p>{explain.whatItMeans}</p>
                        </section>
                        <section>
                          <h4>Why does it matter?</h4>
                          <p>{explain.whyItMatters}</p>
                        </section>
                        <section>
                          <h4>How to trade?</h4>
                          <p>{explain.howToTrade}</p>
                        </section>
                        {explain.keyTerms.length > 0 && (
                          <section>
                            <h4>Key Terms</h4>
                            <dl className="key-terms">
                              {explain.keyTerms.map((t, i) => (
                                <div key={i}>
                                  <dt>{t.term}</dt>
                                  <dd>{t.definition}</dd>
                                </div>
                              ))}
                            </dl>
                          </section>
                        )}
                        {explain.relatedConcepts.length > 0 && (
                          <section>
                            <h4>Related Concepts</h4>
                            <div className="related-concepts">
                              {explain.relatedConcepts.map((c, i) => (
                                <span key={i} className="concept-tag">{c}</span>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
