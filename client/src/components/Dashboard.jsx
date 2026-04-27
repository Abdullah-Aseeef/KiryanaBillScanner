import { useCallback, useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../api';
import './Dashboard.css';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAnalyticsSummary();
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <span className="error-icon">⚠️</span>
        <p>Failed to load analytics: {error}</p>
        <button type="button" onClick={fetchAnalytics} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-subtitle">Your store performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card stat-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">Rs. {(analytics?.totalRevenue || 0).toLocaleString()}</span>
            <span className="stat-note">From verified bills</span>
          </div>
        </div>

        <div className="stat-card stat-bills">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-label">Total Bills</span>
            <span className="stat-value">{analytics?.totalBills || 0}</span>
            <span className="stat-note">{analytics?.verifiedBills || 0} verified</span>
          </div>
        </div>

        <div className="stat-card stat-verified">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-label">Verified</span>
            <span className="stat-value">{analytics?.verifiedBills || 0}</span>
            <span className="stat-note">Confirmed accurate</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">Needs Review</span>
            <span className="stat-value">{analytics?.unverifiedBills || 0}</span>
            <span className="stat-note">Awaiting verification</span>
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>🏆 Top Selling Items</h3>
          <span className="section-badge">{analytics?.topItems?.length || 0} items</span>
        </div>
        <div className="top-items-table-wrapper">
          {analytics?.topItems?.length > 0 ? (
            <table className="top-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Name</th>
                  <th>Times Sold</th>
                  <th>Total Qty</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topItems.map((item, index) => (
                  <tr key={item.name} className="slide-up" style={{ animationDelay: `${index * 60}ms` }}>
                    <td>
                      <span className={`rank-badge rank-${index + 1}`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </span>
                    </td>
                    <td className="item-name-cell">{item.name}</td>
                    <td>{item.count}</td>
                    <td>{item.totalQty}</td>
                    <td className="revenue-cell">Rs. {item.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No items recorded yet. Upload a bill to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bills */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>📄 Recent Bills</h3>
        </div>
        <div className="recent-bills-list">
          {analytics?.recentBills?.length > 0 ? (
            analytics.recentBills.map((bill, index) => (
              <div key={bill._id} className="recent-bill-card slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="bill-source">
                  <span className={`source-badge source-${bill.source}`}>
                    {bill.source === 'whatsapp' ? '💬' : '🌐'} {bill.source}
                  </span>
                </div>
                <div className="bill-amount">Rs. {bill.totalAmount?.toLocaleString()}</div>
                <div className={`bill-status status-${bill.status}`}>
                  {bill.status === 'verified' ? '✅' : '⏳'} {bill.status}
                </div>
                <div className="bill-date">
                  {new Date(bill.createdAt).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No bills yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
