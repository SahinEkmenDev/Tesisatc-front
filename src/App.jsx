import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import StockManagement from "./components/StockManagement";
import Hizmetler from "./components/Hizmetler";
import TeslimEdilenler from "./components/TeslimEdilenler";
import StockDetails from "./components/StockDetails";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route
                path="/dashboard"
                element={<Dashboard onLogout={handleLogout} />}
              />
              <Route path="/stok" element={<StockManagement />} />
              <Route path="/hizmetler" element={<Hizmetler />} />
              <Route path="/teslim" element={<TeslimEdilenler />} />
              <Route path="/detaylar" element={<StockDetails />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
