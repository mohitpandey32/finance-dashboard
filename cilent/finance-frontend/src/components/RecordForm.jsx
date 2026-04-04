import { useState, useEffect } from 'react';
import './RecordForm.css';

const CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Rent',
  'Food',
  'Transport',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Education',
  'Other',
];

const EMPTY_FORM = {
  amount: '',
  type: 'income',
  category: '',
  date: new Date().toISOString().split('T')[0],
  note: '',
};

/**
 * RecordForm — Create or Edit financial record.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {object|null} props.record - If provided, form is in edit mode
 * @param {boolean} [props.loading]
 * @param {(data: object) => void} props.onSubmit
 * @param {() => void} props.onClose
 */
export default function RecordForm({ open, record, loading = false, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const isEditMode = !!record;

  useEffect(() => {
    if (record) {
      setForm({
        amount: record.amount || '',
        type: record.type || 'income',
        category: record.category || '',
        date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        note: record.note || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [record, open]);

  const validate = () => {
    const newErrors = {};
    if (!form.amount || Number(form.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!form.type) {
      newErrors.type = 'Type is required';
    }
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date || undefined,
      note: form.note || undefined,
    });
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal record-form-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="record-form-title">
          {isEditMode ? 'Edit Record' : 'Add New Record'}
        </h3>

        <form onSubmit={handleSubmit} className="record-form">
          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange('amount')}
              min="1"
              step="any"
            />
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="record-form-type-toggle">
              <button
                type="button"
                className={`type-btn ${form.type === 'income' ? 'type-btn-income active' : ''}`}
                onClick={() => setForm((p) => ({ ...p, type: 'income' }))}
              >
                Income
              </button>
              <button
                type="button"
                className={`type-btn ${form.type === 'expense' ? 'type-btn-expense active' : ''}`}
                onClick={() => setForm((p) => ({ ...p, type: 'expense' }))}
              >
                Expense
              </button>
            </div>
            {errors.type && <span className="form-error">{errors.type}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={handleChange('category')}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={form.date}
              onChange={handleChange('date')}
            />
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Add a note..."
              value={form.note}
              onChange={handleChange('note')}
            />
          </div>

          {/* Actions */}
          <div className="record-form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (isEditMode ? 'Update Record' : 'Add Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
