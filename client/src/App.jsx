import { useState } from 'react';
import Dashboard from './components/Dashboard';
import HelpPanel from './components/HelpPanel';
import ReviewPanel from './components/ReviewPanel';
import UploadForm from './components/UploadForm';
import { useLanguage } from './context/LanguageContext';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const { lang, toggle, t } = useLanguage();

  const handleUploadSuccess = () => {
    setActiveTab('review');
    setRefreshKey((k) => k + 1);
  };

  const handleBillVerified = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app" lang={lang === 'ur' ? 'ur' : undefined}>
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏪</span>
            <div className="logo-text">
              <h1>Tajir</h1>
              <span className="logo-tagline">{t('tagline')}</span>
            </div>
          </div>
          <div className="header-right">
            <nav className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 {t('nav_dashboard')}
              </button>
              <button
                className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                📸 {t('nav_upload')}
              </button>
              <button
                className={`nav-tab ${activeTab === 'review' ? 'active' : ''}`}
                onClick={() => setActiveTab('review')}
              >
                ✏️ {t('nav_review')}
              </button>
              <button
                className={`nav-tab ${activeTab === 'help' ? 'active' : ''}`}
                onClick={() => setActiveTab('help')}
              >
                ❓ {t('nav_help')}
              </button>
            </nav>
            <button className="lang-toggle" onClick={toggle} title="Switch language">
              {t('lang_toggle')}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          {activeTab === 'dashboard' && <Dashboard key={`dash-${refreshKey}`} />}
          {activeTab === 'upload' && <UploadForm onUploadSuccess={handleUploadSuccess} />}
          {activeTab === 'review' && (
            <ReviewPanel key={`review-${refreshKey}`} onBillVerified={handleBillVerified} />
          )}
          {activeTab === 'help' && <HelpPanel />}
        </div>
      </main>
    </div>
  );
}

export default App;
