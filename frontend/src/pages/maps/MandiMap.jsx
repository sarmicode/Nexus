import { useState, useEffect } from 'react';
import { getMandisGeo } from '../../services/market';

export default function MandiMap() {
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMandisGeo()
      .then((data) => setMandis(data.items || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading map data…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="map-page">
      <h1>🗺️ Mandi Map</h1>
      <p>Leaflet map showing mandi locations with latest prices</p>
      <div className="mandi-list">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Mandi</th><th>District</th><th>State</th><th>Crop</th><th>Modal (₹/q)</th><th>Coords</th></tr>
            </thead>
            <tbody>
              {mandis.map((m, i) => (
                <tr key={i}>
                  <td>{m.mandiName}</td>
                  <td>{m.district}</td>
                  <td>{m.state}</td>
                  <td>{m.crop}</td>
                  <td>₹{m.latestModalPrice}</td>
                  <td>{m.lat?.toFixed(2)}, {m.lng?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mandis.length === 0 && <p>No mandi geo data available. Run seed:prices to populate.</p>}
      </div>
    </div>
  );
}
