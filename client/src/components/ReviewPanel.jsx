import { useCallback, useEffect, useState } from 'react';
import { getBills, verifyBill } from '../api';
import './ReviewPanel.css';

function ReviewPanel({ onBillVerified }) {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const selectBill = useCallback((bill) => {
    setSelectedBill(bill);
    setMessage(null);
    setEditItems(
      (bill.items || []).map((it) => ({
        _id: it._id,
        item: it.item || '',
        quantity: it.quantity ?? 0,
        price: it.price ?? 0,
        subtotal: it.subtotal ?? 0,
      }))
    );
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBills();
      setBills(res.data);
      const unverified = res.data.find((b) => b.status === 'unverified');
      if (unverified) {
        selectBill(unverified);
      } else if (res.data.length > 0) {
        selectBill(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  }, [selectBill]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBills]);

  const handleItemChange = (index, field, value) => {
    const updated = [...editItems];
    if (field === 'quantity' || field === 'price') {
      updated[index][field] = parseFloat(value) || 0;
      updated[index].subtotal = updated[index].quantity * updated[index].price;
    } else {
      updated[index][field] = value;
    }
    setEditItems(updated);
  };

  const getTotal = () => editItems.reduce((sum, it) => sum + (it.subtotal || 0), 0);

  const handleConfirm = async () => {
    if (!selectedBill) return;
    try {
      setSaving(true);
      setMessage(null);
      const payload = {
        items: editItems.map((it) => ({
          item: it.item,
          quantity: it.quantity,
          price: it.price,
        })),
        totalAmount: getTotal(),
      };
      const res = await verifyBill(selectedBill._id, payload);
      setMessage({ type: 'success', text: 'Bill verified successfully!' });
      const updatedBills = bills.map((b) =>
        b._id === selectedBill._id ? res.data : b
      );
      setBills(updatedBills);
      setSelectedBill(res.data);
      if (onBillVerified) onBillVerified();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to verify bill: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setEditItems([
      ...editItems,
      { item: '', quantity: 1, price: 0, subtotal: 0 },
    ]);
  };

  const removeItem = (index) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="review-loading">
        <div className="spinner"></div>
        <p>Loading bills...</p>
      </div>
    );
  }

  return (
    <div className="review-panel fade-in">
      <div className="review-header">
        <h2>Review & Verify</h2>
        <p className="review-subtitle">Edit scanned results and confirm accuracy</p>
      </div>

      <div className="review-layout">
        {/* Bills List Sidebar */}
        <div className="bills-sidebar">
          <h3 className="sidebar-title">Bills</h3>
          <div className="bills-list">
            {bills.map((bill) => (
              <button
                key={bill._id}
                className={`bill-list-item ${selectedBill?._id === bill._id ? 'active' : ''} ${bill.status === 'verified' ? 'is-verified' : ''}`}
                onClick={() => selectBill(bill)}
              >
                <div className="bill-list-top">
                  <span className={`source-dot source-${bill.source}`}></span>
                  <span className="bill-list-amount">Rs. {bill.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="bill-list-bottom">
                  <span className="bill-list-date">
                    {new Date(bill.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className={`bill-list-status status-${bill.status}`}>
                    {bill.status === 'verified' ? '✅' : '⏳'}
                  </span>
                </div>
              </button>
            ))}
            {bills.length === 0 && (
              <div className="empty-state-sm">No bills found</div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="editor-area">
          {selectedBill ? (
            <>
              {/* Bill meta */}
              <div className="bill-meta">
                <div className="meta-row">
                  <span className="meta-label">Source</span>
                  <span className={`source-badge source-${selectedBill.source}`}>
                    {selectedBill.source === 'whatsapp' ? '💬' : '🌐'} {selectedBill.source}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Status</span>
                  <span className={`status-pill status-${selectedBill.status}`}>
                    {selectedBill.status}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Date</span>
                  <span className="meta-value">
                    {new Date(selectedBill.createdAt).toLocaleString('en-PK')}
                  </span>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`alert alert-${message.type}`}>
                  {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
              )}

              {/* Editable Table */}
              <div className="edit-table-wrapper">
                <table className="edit-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Price (Rs.)</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editItems.map((it, index) => (
                      <tr key={index} className="slide-up" style={{ animationDelay: `${index * 40}ms` }}>
                        <td>
                          <input
                            type="text"
                            value={it.item}
                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                            className="cell-input"
                            placeholder="Item name"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="cell-input cell-input-num"
                            min="0"
                            step="0.5"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={it.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            className="cell-input cell-input-num"
                            min="0"
                          />
                        </td>
                        <td>
                          <span className="subtotal-value">Rs. {(it.subtotal || 0).toLocaleString()}</span>
                        </td>
                        <td>
                          <button className="btn-remove" onClick={() => removeItem(index)} title="Remove item">
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="editor-footer">
                <button className="btn-add-item" onClick={addItem}>
                  + Add Item
                </button>
                <div className="footer-right">
                  <div className="total-display">
                    <span className="total-label">Total</span>
                    <span className="total-value">Rs. {getTotal().toLocaleString()}</span>
                  </div>
                  <button
                    className="btn-confirm"
                    onClick={handleConfirm}
                    disabled={saving || editItems.length === 0}
                  >
                    {saving ? (
                      <>
                        <span className="btn-spinner"></span> Saving...
                      </>
                    ) : (
                      '✅ Confirm & Verify'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a bill from the sidebar to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewPanel;
