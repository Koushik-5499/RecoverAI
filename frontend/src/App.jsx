import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import FailedPayments from './pages/FailedPayments';
import PaymentDetails from './pages/PaymentDetails';
import RecoveryActions from './pages/RecoveryActions';
import AuditTrail from './pages/AuditTrail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="w-full grow p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/payments" element={<FailedPayments />} />
              <Route path="/payments/:id" element={<PaymentDetails />} />
              <Route path="/recovery" element={<RecoveryActions />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
