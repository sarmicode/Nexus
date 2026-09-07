import { useState, useEffect } from 'react';
import { getLatestPrices, getPriceTrends, compareCrops } from '../../services/market';

export default function MarketPrices() {
  const [tab, setTab] = useState('prices');
  const [crop, setCrop] = useState('tomato');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [prices, setPrices] = useState(null);
  const [trends, setTrends] = useState(null);
  const [range, setRange] = useState('30');
  const [compare, setCompare] = useState(null);
  const [compareCropsInput, setCompareCropsInput] = useState('tomato,potato,onion');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tab !== 'prices') return;
    setLoading(true);
    setError(null);
    const params = { crop };
    if (state) params.state = state;
    if (district) params.district = district;
    getLatestPrices(params)
      .then(setPrices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab, crop, state, district]);

  useEffect(() => {
    if (tab !== 'trends') return;
    setLoading(true);
    setError(null);
    const params = { range };
    if (state) params.state = state;
    if (district) params.district = district;
    getPriceTrends(crop, params)
      .then(setTrends)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab, crop, range, state, district]);

  function handleCompare() {
    setLoading(true);
    setError(null);
    compareCrops({ crops: compareCropsInput, district: district || undefined })
      .then(setCompare)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="market-page">
      <h1>📈 Market Intelligence & Price Discovery</h1>
      <p className="subtitle">Real-time mandi prices from AGMARKNET / eNAM</p>

      <div className="tabs">
        <button className={tab === 'prices' ? 'active' : ''} onClick={() => setTab('prices')}>
          💰 Latest Prices
        </button>
        <button className={tab === 'trends' ? 'active' : ''} onClick={() => setTab('trends')}>
          📊 Trends
        </button>
        <button className={tab === 'compare' ? 'active' : ''} onClick={() => setTab('compare')}>
          ⚖️ Compare
        </button>
      </div>

      <div className="market-controls">
        <label>
          Crop
          <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. tomato" />
        </label>
        <label>
          State
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. West Bengal" />
        </label>
        {tab !== 'prices' && (
          <label>
            District
            <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Nadia" />
          </label>
        )}
        {tab === 'trends' && (
          <label>
            Range
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </label>
        )}
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error">Error: {error}</p>}

      {tab === 'prices' && prices && (
        <div>
          <p className="result-count">
            {prices.items.length} mandi price{prices.items.length !== 1 ? 's' : ''} ·
            <span className="data-badge">As of {new Date(prices.fetchedAt).toLocaleString()}</span>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mandi</th><th>District</th><th>State</th>
                  <th>Modal (₹/q)</th><th>Min</th><th>Max</th><th>7d Change</th><th>Source</th>
                </tr>
              </thead>
              <tbody>
                {prices.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.mandiName}</td>
                    <td>{item.district}</td>
                    <td>{item.state}</td>
                    <td><strong>₹{item.modalPrice}</strong></td>
                    <td>₹{item.minPrice}</td>
                    <td>₹{item.maxPrice}</td>
                    <td className={item.change7d > 0 ? 'positive' : item.change7d < 0 ? 'negative' : ''}>
                      {item.change7d !== null ? `${item.change7d > 0 ? '+' : ''}${item.change7d}%` : '—'}
                    </td>
                    <td>{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {prices.districtAverages.length > 0 && (
            <div className="district-averages">
              <h3>District Averages</h3>
              {prices.districtAverages.map((d, i) => (
                <span key={i} className="avg-chip">{d.district}: ₹{d.avgModalPrice}/q</span>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'trends' && trends && (
        <div>
          <h3>{crop} price trends ({range} days)</h3>
          <div className="trends-chart">
            <svg viewBox="0 0 800 300" className="trend-svg">
              {(() => {
                if (!trends.series.length) return null;
                const maxP = Math.max(...trends.series.map((s) => s.avgModal));
                const minP = Math.min(...trends.series.map((s) => s.avgModal));
                const range_ = maxP - minP || 1;
                const w = 800 / trends.series.length;
                const points = trends.series.map((s, i) => {
                  const x = i * w + w / 2;
                  const y = 280 - ((s.avgModal - minP) / range_) * 250;
                  return `${x},${y}`;
                });
                return (
                  <>
                    <polyline fill="none" stroke="#2e7d32" strokeWidth="2" points={points.join(' ')} />
                    {trends.series.map((s, i) => {
                      const x = i * w + w / 2;
                      const y = 280 - ((s.avgModal - minP) / range_) * 250;
                      return <circle key={i} cx={x} cy={y} r="3" fill="#2e7d32" />;
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Avg Modal (₹/q)</th><th>Avg Min</th><th>Avg Max</th><th>Records</th></tr></thead>
              <tbody>
                {trends.series.slice(-15).map((s, i) => (
                  <tr key={i}>
                    <td>{s.date}</td>
                    <td>₹{s.avgModal}</td>
                    <td>₹{s.avgMin}</td>
                    <td>₹{s.avgMax}</td>
                    <td>{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'compare' && (
        <div>
          <div className="market-controls">
            <label>
              Crops (comma-separated)
              <input value={compareCropsInput} onChange={(e) => setCompareCropsInput(e.target.value)} />
            </label>
            <button className="btn btn--primary" onClick={handleCompare}>Compare</button>
          </div>
          {compare && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Crop</th><th>Modal (₹/q)</th><th>Min</th><th>Max</th><th>Updated</th></tr></thead>
                <tbody>
                  {compare.items.map((c, i) => (
                    <tr key={i}>
                      <td><strong>{c.crop}</strong></td>
                      <td>₹{c.modalPrice}</td>
                      <td>₹{c.minPrice}</td>
                      <td>₹{c.maxPrice}</td>
                      <td>{c.recordedOn ? new Date(c.recordedOn).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
