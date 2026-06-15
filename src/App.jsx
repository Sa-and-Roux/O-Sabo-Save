import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Gift, Settings, Search, BarChart2, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ContactList from './pages/ContactList';
import ContactDetail from './pages/ContactDetail';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import ReportsPage from './pages/ReportsPage';
import AllGiftsPage from './pages/AllGiftsPage';
import './App.css'; 

function Layout({ children }) {
  return (
    <div className="container">
      <header className="app-header">
        <Link to="/" className="app-title" style={{textDecoration: 'none'}}>
          <Gift color="var(--color-primary)" size={28} />
          <span>オセーボセーブ</span>
        </Link>
        <nav className="flex gap-2 items-center">
          <Link to="/" className="btn btn-outline" style={{padding: '8px', borderRadius: '50%'}} title="ホーム">
            <Home size={20} />
          </Link>
          <Link to="/contacts" className="btn btn-outline" style={{padding: '8px', borderRadius: '50%'}} title="人物一覧">
            <Users size={20} />
          </Link>
          <Link to="/all-gifts" className="btn btn-outline" style={{padding: '8px', borderRadius: '50%'}} title="履歴一覧">
            <FileText size={20} />
          </Link>
          <Link to="/reports" className="btn btn-outline" style={{padding: '8px', borderRadius: '50%'}} title="レポート">
            <BarChart2 size={20} />
          </Link>
          <Link to="/search" className="btn btn-outline" style={{padding: '8px', borderRadius: '50%'}} title="検索">
            <Search size={20} />
          </Link>
          <Link to="/settings" className="btn btn-outline" style={{padding: '8px', borderRadius: '50%'}} title="設定">
            <Settings size={20} />
          </Link>
        </nav>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<ContactList />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/all-gifts" element={<AllGiftsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
