import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogPage } from './components/CatalogPage';
import { OrderPage } from './components/OrderPage';
import { ConfirmationPage } from './components/ConfirmationPage';
import { TrackingPage } from './components/TrackingPage';
import { ProfilePage } from './components/ProfilePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { Layout } from './components/Layout';
import { CartProvider } from './hooks/useCart';
import { SplashScreen } from './components/SplashScreen';
import { useState } from 'react';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <ErrorBoundary>
        <CartProvider>
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <>
              <GlobalErrorHandler />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/menu/:menuId" element={<CatalogPage />} />
                  <Route path="/order" element={<OrderPage />} />
                  <Route path="/confirmation/:orderId" element={<ConfirmationPage />} />
                  <Route path="/tracking/:orderId" element={<TrackingPage />} />
                  <Route path="/profile/*" element={<ProfilePage />} />
                  <Route path="/" element={<Navigate to="/menu/1" replace />} />
                </Route>
              </Routes>
            </>
          )}
        </CartProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
