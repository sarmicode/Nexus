import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchListings } from '../services/search';
import { createSavedSearch } from '../services/savedSearches';
import { useAuth } from '../context/AuthContext';
import { CROPS } from '../data/crops';
import { STATES, DISTRICTS } from '../data/locations';
import ListingCard from '../components/ListingCard';
import CompareTable from '../components/CompareTable';
import Field from '../components/Field';

const SORTS = [
  ['newest', 'Newest'],
  ['priceAsc', 'Price: low → high'],
  ['priceDesc', 'Price: high → low'],
  ['qtyAsc', 'Quantity: low → high'],
  ['qtyDesc', 'Quantity: high → low'],
];

/**
 * Catalog — the buyer-facing marketplace browse page (Phase 03).
 *
 * The URL query string is the single source of truth for the search params
 * (q, crop, district, organic, minQty, priceMin, priceMax, sort, page), which
 * is what makes "recreate a saved search from the URL query" work. A search
 * can also be saved for later (and for Phase 4 alerts).
 */
export default function Catalog() {
  const { isAuthed } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [savedFlash, setSavedFlash] = useState(null);

  // Read the current filter state from the URL. `all` is used inside the fetch
  // effect so the query string is the single dependency.
  const first = useMemo(() => {
    const get = (k) => searchParams.get(k) || undefined;
    return {
      q: get('q'),
      crop: get('crop'),
      state: get('state'), // drives the district dropdown only (not an API filter)
      district: get('district'),
      organic: get('organic'),
      minQty: get('minQty'),
      priceMin: get('priceMin'),
      priceMax: get('priceMax'),
      sort: get('sort') || 'newest',
      page: get('page') || '1',
    };
  }, [searchParams]);

  const page = Math.max(1, parseInt(first.page, 10) || 1);
  const limit = 12;

  useEffect(() => {
    let active = true;
    // `state` is UI-only (drives the district options) and is not a search
    // filter — strip it before hitting the API.
    const { state: _state, ...query } = first;
    searchListings({ ...query, page, limit })
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.apiError || { code: 'UNKNOWN', message: err.message });
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [first, page, limit]);

  // The compare tray needs the actual listing objects for the selected ids.
  const compareListings = useMemo(
    () => data.items.filter((l) => compareIds.includes(l._id)),
    [data.items, compareIds]
  );

  const updateFilter = useCallback(
    (patch) => {
      setLoading(true); // immediate spinner (event-handler-triggered, not an effect)
      const next = { ...first, ...patch };
      // Reset to page 1 whenever a filter (not page) changes.
      if (!('page' in patch)) next.page = '1';
      // Drop empty values.
      const params = {};
      Object.entries(next).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params[k] = String(v);
      });
      setSearchParams(params, { replace: true });
    },
    [first, setSearchParams]
  );

  const toggleCompare = useCallback((id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev; // max 4 lots
      return [...prev, id];
    });
  }, []);

  const saveCurrentSearch = useCallback(async () => {
    const { page: _p, ...query } = first; // don't store the page
    try {
      await createSavedSearch(query);
      setSavedFlash('Search saved — find it in your Buyer Dashboard.');
    } catch (err) {
      setSavedFlash(err.apiError?.message || 'Could not save the search.');
    }
    setTimeout(() => setSavedFlash(null), 4000);
  }, [first]);

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Marketplace</h1>
          <p className="muted">Find and compare crop lots from farmers &amp; FPOs</p>
        </div>
        {isAuthed && (
          <button type="button" className="btn btn--ghost" onClick={saveCurrentSearch}>
            ♡ Save search
          </button>
        )}
      </div>

      {savedFlash && <div className="alert alert--success">{savedFlash}</div>}
      {error && (
        <div className="alert alert--error" role="alert">
          {error.message}
        </div>
      )}

      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          updateFilter({ q: e.currentTarget.elements.q.value });
        }}
      >
        <input
          name="q"
          className="input"
          type="search"
          placeholder="Search crop, variety or district (e.g. tomato)"
          aria-label="Search"
          defaultValue={first.q || ''}
        />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </form>

      <div className="catalog-layout">
        <aside className="card filters">
          <h2 className="filters__title">Filters</h2>
          <Field label="Crop">
            <select
              className="input"
              value={first.crop || ''}
              onChange={(e) => updateFilter({ crop: e.target.value })}
            >
              <option value="">All crops</option>
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="State">
            <select
              className="input"
              value={first.state || ''}
              onChange={(e) => updateFilter({ state: e.target.value, district: '' })}
            >
              <option value="">All states</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="District">
            <select
              className="input"
              value={first.district || ''}
              onChange={(e) => updateFilter({ district: e.target.value })}
            >
              <option value="">All districts</option>
              {(first.state && DISTRICTS[first.state] ? DISTRICTS[first.state] : []).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Min price/unit">
            <input
              type="number"
              className="input"
              min="0"
              placeholder="₹"
              value={first.priceMin || ''}
              onChange={(e) => updateFilter({ priceMin: e.target.value })}
            />
          </Field>
          <Field label="Max price/unit">
            <input
              type="number"
              className="input"
              min="0"
              placeholder="₹"
              value={first.priceMax || ''}
              onChange={(e) => updateFilter({ priceMax: e.target.value })}
            />
          </Field>
          <Field label="Min quantity">
            <input
              type="number"
              className="input"
              min="0"
              placeholder="e.g. 5"
              value={first.minQty || ''}
              onChange={(e) => updateFilter({ minQty: e.target.value })}
            />
          </Field>
          <label className="toggle">
            <input
              type="checkbox"
              checked={first.organic === 'true'}
              onChange={(e) => updateFilter({ organic: e.target.checked ? 'true' : '' })}
            />
            Organic only
          </label>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => setSearchParams({}, { replace: true })}
          >
            Clear filters
          </button>
        </aside>

        <div className="catalog-results">
          <div className="catalog-toolbar">
            <span className="muted">
              {data.total} result{data.total === 1 ? '' : 's'}
            </span>
            <select
              className="input"
              value={first.sort || 'newest'}
              onChange={(e) => updateFilter({ sort: e.target.value })}
              aria-label="Sort"
            >
              {SORTS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="card status status--loading">⏳ Searching…</div>
          ) : data.items.length === 0 ? (
            <div className="card">
              <p>No lots match your search.</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Reset search
              </button>
            </div>
          ) : (
            <div className="listing-grid">
              {data.items.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  compareSelected={compareIds.includes(listing._id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn--ghost"
                disabled={page <= 1}
                onClick={() => {
                  updateFilter({ page: String(page - 1) });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                ← Prev
              </button>
              <span className="muted">
                Page {page} of {data.totalPages}
              </span>
              <button
                type="button"
                className="btn btn--ghost"
                disabled={page >= data.totalPages}
                onClick={() => {
                  updateFilter({ page: String(page + 1) });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {compareIds.length > 0 && (
        <div className="compare-tray">
          <CompareTable listings={compareListings} onRemove={toggleCompare} />
        </div>
      )}
    </section>
  );
}
