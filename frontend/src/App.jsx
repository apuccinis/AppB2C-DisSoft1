import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { MarketProvider } from './hooks/useMarket.jsx';
import { PortfolioProvider } from './hooks/usePortfolio.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Trade from './pages/Trade.jsx';
import Orders from './pages/Orders.jsx';
import NotFound from './pages/NotFound.jsx';

// Zona privada: exige sesion y comparte los contextos de mercado y portfolio.
const PrivateArea = () => (
  <ProtectedRoute>
    <PortfolioProvider>
      <AppLayout />
    </PortfolioProvider>
  </ProtectedRoute>
);

export const App = () => (
  <AuthProvider>
    <MarketProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateArea />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </MarketProvider>
  </AuthProvider>
);

export default App;
