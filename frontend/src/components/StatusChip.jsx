/**
 * StatusChip — coloured label for a listing's lifecycle status (Phase 02).
 */
const LABELS = {
  draft: 'Draft',
  active: 'Active',
  sold: 'Sold',
  expired: 'Expired',
};

export default function StatusChip({ status }) {
  const normalized = status || 'draft';
  return <span className={`chip chip--${normalized}`}>{LABELS[normalized] || normalized}</span>;
}
