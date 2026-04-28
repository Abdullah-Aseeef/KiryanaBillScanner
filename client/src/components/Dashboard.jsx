import { useCallback, useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../api';
import { useLanguage } from '../context/LanguageContext';
import './Dashboard.css';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

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
    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>{t('loading_analytics')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <span className="error-icon">⚠️</span>
        <p>{t('failed_analytics')} {error}</p>
        <button type="button" onClick={fetchAnalytics} className="btn-retry">{t('retry')}</button>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h2>{t('dash_title')}</h2>
        <p className="dashboard-subtitle">{t('dash_subtitle')}</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card stat-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">{t('stat_revenue')}</span>
            <span className="stat-value">Rs. {(analytics?.totalRevenue || 0).toLocaleString()}</span>
            <span className="stat-note">{t('stat_revenue_note')}</span>
          </div>
        </div>

        <div className="stat-card stat-bills">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-label">{t('stat_bills')}</span>
            <span className="stat-value">{analytics?.totalBills || 0}</span>
            <span className="stat-note">{analytics?.verifiedBills || 0} {t('stat_verified').toLowerCase()}</span>
          </div>
        </div>

        <div className="stat-card stat-verified">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-label">{t('stat_verified')}</span>
            <span className="stat-value">{analytics?.verifiedBills || 0}</span>
            <span className="stat-note">{t('stat_verified_note')}</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">{t('stat_pending')}</span>
            <span className="stat-value">{analytics?.unverifiedBills || 0}</span>
            <span className="stat-note">{t('stat_pending_note')}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>{t('top_items_title')}</h3>
          <span className="section-badge">{analytics?.topItems?.length || 0} {t('items_label')}</span>
        </div>
        <div className="top-items-table-wrapper">
          {analytics?.topItems?.length > 0 ? (
            <table className="top-items-table">
              <thead>
                <tr>
                  <th>{t('col_rank')}</th>
                  <th>{t('col_item_name')}</th>
                  <th>{t('col_times_sold')}</th>
                  <th>{t('col_total_qty')}</th>
                  <th>{t('col_revenue')}</th>
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
              <p>{t('no_items')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>{t('recent_bills_title')}</h3>
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
              <p>{t('no_bills')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
