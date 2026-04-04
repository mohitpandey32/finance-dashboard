import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { recordService } from '../services/recordService';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import Navbar from '../components/Navbar';
import RecordForm from '../components/RecordForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import {
  Plus, Search, Filter, Edit2, Trash2,
  FileText, X, RefreshCw, ChevronDown,
} from 'lucide-react';
import './Records.css';

const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rent', 'Food', 'Transport',
  'Shopping', 'Utilities', 'Healthcare', 'Entertainment', 'Education', 'Other',
];

export default function Records() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  // Data state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (filterType) filters.type = filterType;
      if (filterCategory) filters.category = filterCategory;
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;

      const res = await recordService.getRecords(filters);
      setRecords(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Create / Update record
  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingRecord) {
        await recordService.updateRecord(editingRecord._id, data);
        showToast('Record updated successfully');
      } else {
        await recordService.createRecord(data);
        showToast('Record created successfully');
      }
      setFormOpen(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete record
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await recordService.deleteRecord(deleteTarget._id);
      showToast('Record deleted successfully');
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilterType('');
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const hasActiveFilters = filterType || filterCategory || filterStartDate || filterEndDate;

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Records</h1>
            <p className="page-subtitle">
              {loading ? 'Loading...' : `${records.length} record${records.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="records-header-actions">
            <button
              className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && <span className="filter-dot" />}
            </button>
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingRecord(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={16} />
                Add Record
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card records-filters">
            <div className="records-filters-grid">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm records-clear-filters" onClick={clearFilters}>
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="dashboard-error">
            <span>{error}</span>
            <button className="btn btn-sm btn-secondary" onClick={fetchRecords}>
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="glass-card records-table-wrapper">
          {loading ? (
            <div className="records-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton records-skeleton-row" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} className="empty-state-icon" />
              <p className="empty-state-title">No records found</p>
              <p className="empty-state-text">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Start adding financial records to see them here'}
              </p>
              {isAdmin && !hasActiveFilters && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingRecord(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Add First Record
                </button>
              )}
            </div>
          ) : (
            <div className="records-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Note</th>
                    {isAdmin && <th style={{ width: 100 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td className="records-date">{formatDate(record.date)}</td>
                      <td>
                        <span className={`badge badge-${record.type}`}>
                          {record.type}
                        </span>
                      </td>
                      <td>{record.category}</td>
                      <td className={`records-amount records-amount-${record.type}`}>
                        {record.type === 'expense' ? '−' : '+'}{formatCurrency(record.amount)}
                      </td>
                      <td className="records-note">{record.note || '—'}</td>
                      {isAdmin && (
                        <td>
                          <div className="records-actions">
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              title="Edit"
                              onClick={() => {
                                setEditingRecord(record);
                                setFormOpen(true);
                              }}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              title="Delete"
                              onClick={() => setDeleteTarget(record)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Form Modal */}
      <RecordForm
        open={formOpen}
        record={editingRecord}
        loading={formLoading}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditingRecord(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Record"
        message={`Are you sure you want to delete this ${deleteTarget?.type} record of ${deleteTarget ? formatCurrency(deleteTarget.amount) : ''}? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
