import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { searchListings } from '../services/buyer';
import { assetUrl } from '../utils/assetUrl';

export default function Catalog() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    q: '', crop: '', district: '', organic: '', priceMin: '', priceMax: '', sort: 'newest', page: 1,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v != null) params[k] = v; });
      if (params.organic === 'true') params.organic = true;
      else if (params.organic === 'false') params.organic = false;
      else delete params.organic;
      const data = await searchListings(params);
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: name === 'page' ? parseInt(value) : 1 }));
  }

  return (
    <div className="catalog-page">
      <h1>🔎 Crop Catalog</h1>
      <div className="catalog-layout">
        <aside className="catalog-filters">
          <h3>Filters</h3>
          <label>
            Search
            <input name="q" value={filters.q} onChange={handleChange} placeholder="tomato, Nadia…" />
          </label>
          <label>
            Crop
            <input name="crop" value={filters.crop} onChange={handleChange} placeholder="e.g. rice" />
          </label>
          <label>
            District
            <input name="district" value={filters.district} onChange={handleChange} placeholder="e.g. Nadia" />
          </label>
          <label>
            Organic
            <select name="organic" value={filters.organic} onChange={handleChange}>
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label>
            Min Price (₹)
            <input type="number" name="priceMin" value={filters.priceMin} onChange={handleChange} />
          </label>
          <label>
            Max Price (₹)
            <input type="number" name="priceMax" value={filters.priceMax} onChange={handleChange} />
          </label>
          <label>
            Sort
            <select name="sort" value={filters.sort} onChange={handleChange}>
              <option value="newest">Newest</option>
              <option value="priceAsc">Price ↑</option>
              <option value="priceDesc">Price ↓</option>
              <option value="quantityDesc">Quantity ↓</option>
            </select>
          </label>
        </aside>

        <section className="catalog-results">
          {loading && <p className="loading">Loading…</p>}
          {error && <p className="error">Error: {error}</p>}
          {!loading && !error && (
            <>
              <p className="result-count">{total} listing{total !== 1 ? 's' : ''} found</p>
              <div className="listing-grid">
                {items.map((item) => (
                  <Link to={`/listings/${item._id}`} key={item._id} className="listing-card">
                    {item.images?.[0] && (
                      <img src={assetUrl(item.images[0])} alt={item.crop} className="listing-card__img" />
                    )}
                    <div className="listing-card__body">
                      <h3>{item.crop}</h3>
                      <p>Grade {item.grade} · {item.quantity.value} {item.quantity.unit}</p>
                      <p>
                        ₹{item.pricePerUnit}/{item.quantity.unit}
                        {item.priceType === 'negotiable' && <span className="tag">Negotiable</span>}
                      </p>
                      <p className="listing-card__location">
                        📍 {item.location.district}, {item.location.state}
                      </p>
                      {item.organic && <span className="tag tag--organic">Organic</span>}
                    </div>
                  </Link>
                ))}
                {items.length === 0 && <p>No listings match your filters.</p>}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={filters.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}>
                    ← Prev
                  </button>
                  <span>Page {filters.page} of {totalPages}</span>
                  <button disabled={filters.page >= totalPages} onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
