import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ReviewPanel from './components/ReviewPanel';
import UploadForm from './components/UploadForm';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setActiveTab('review');
    setRefreshKey((k) => k + 1);
  };

  const handleBillVerified = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏪</span>
            <div className="logo-text">
              <h1>Tajir</h1>
              <span className="logo-tagline">Kiryana Bill Scanner</span>
            </div>
          </div>
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              📸 Upload
            </button>
            <button
              className={`nav-tab ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              ✏️ Review
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          {activeTab === 'dashboard' && <Dashboard key={`dash-${refreshKey}`} />}
          {activeTab === 'upload' && <UploadForm onUploadSuccess={handleUploadSuccess} />}
          {activeTab === 'review' && (
            <ReviewPanel key={`review-${refreshKey}`} onBillVerified={handleBillVerified} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
