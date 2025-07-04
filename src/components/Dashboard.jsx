import "./Dashboard.css";
import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";

function Dashboard({ onLogout }) {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1>Mekan Panel</h1>
        </div>
        <div className="header-right">
          <button onClick={onLogout} className="logout-button">
            Çıkış Yap
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <Link
          to="/dashboard"
          className={`nav-tab ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
        >
          Anasayfa
        </Link>
        <Link
          to="/stok"
          className={`nav-tab ${location.pathname === "/stok" ? "active" : ""}`}
        >
          Stok Yönetimi
        </Link>
        <Link
          to="/hizmetler"
          className={`nav-tab ${
            location.pathname === "/hizmetler" ? "active" : ""
          }`}
        >
          Hizmetler
        </Link>
        <Link
          to="/teslim"
          className={`nav-tab ${
            location.pathname === "/teslim" ? "active" : ""
          }`}
        >
          Teslim Edilen İşler
        </Link>
        <Link
          to="/detaylar"
          className={`nav-tab ${
            location.pathname === "/detaylar" ? "active" : ""
          }`}
        >
          Stok Detayları
        </Link>
      </nav>

      <main className="dashboard-main">
        <div className="content-area full">
          <div className="content-header">
            <div className="content-title">Hoş Geldiniz</div>
          </div>
          <div
            className="content-body"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
              textAlign: "center",
              gap: "24px",
            }}
          >
            <img
              src={logo}
              alt="Mekan Panel Logo"
              style={{
                width: "200px",
                height: "auto",
                marginBottom: "16px",
              }}
            />
            <h2
              style={{
                color: "#c20208",
                fontSize: "28px",
                fontWeight: "600",
                margin: "0",
              }}
            >
              Mekan Panel Yönetim Sistemi
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "16px",
                maxWidth: "500px",
                lineHeight: "1.6",
                margin: "0",
              }}
            >
              Stok yönetimi, hizmetler ve teslim edilen işlerinizi kolayca
              yönetebilirsiniz.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
