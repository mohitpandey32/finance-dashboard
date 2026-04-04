import { formatCurrency } from '../utils/formatCurrency';
import './StatCard.css';

/**
 * StatCard — Displays a financial metric with icon, label, and value.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {number} props.value
 * @param {string} props.variant - 'income' | 'expense' | 'balance'
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {boolean} [props.loading]
 */
export default function StatCard({ label, value, variant = 'balance', icon: Icon, loading }) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon stat-card-icon-${variant}`}>
          {Icon && <Icon size={22} />}
        </div>
        <span className="stat-card-label">{label}</span>
      </div>
      <div className="stat-card-value">
        {loading ? (
          <div className="skeleton" style={{ height: 32, width: 140 }} />
        ) : (
          formatCurrency(value || 0)
        )}
      </div>
      <div className={`stat-card-glow stat-card-glow-${variant}`} />
    </div>
  );
}
