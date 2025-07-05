import { useState, useEffect } from "react";
import "./StockDetails.css";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { apiGet } from "../api";

function StockDetails() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dashboardData, setDashboardData] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState(null);

  // Backend'den dashboard verilerini çek
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiGet("api/Dashboard/stock-dashboard");
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Dashboard verileri çekilirken hata:", err);
        setError("Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Satış özeti verisini çek
  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        setSalesLoading(true);
        const data = await apiGet("api/Sales/summary");
        setSalesSummary(data);
        setSalesError(null);
      } catch (err) {
        console.error("Satış özeti çekilirken hata:", err);
        setSalesError("Satış özeti yüklenirken bir hata oluştu");
      } finally {
        setSalesLoading(false);
      }
    };
    fetchSalesSummary();
  }, []);

  // Loading durumu
  if (loading) {
    return (
      <div className="stock-details-container">
        <div className="stock-details-header">
          <div className="header-left">
            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <h1 className="page-title">Stok Detayları</h1>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="stock-details-container">
        <div className="stock-details-header">
          <div className="header-left">
            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <h1 className="page-title">Stok Detayları</h1>
          </div>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Backend'den gelen verileri kullan
  const totalProducts = dashboardData?.totalProducts || 0;
  const totalStock = dashboardData?.totalStock || 0;
  const totalCostValue = dashboardData?.totalCostValue || 0;
  const totalSaleValue = dashboardData?.totalSaleValue || 0;
  const criticalStockCount = dashboardData?.criticalStockCount || 0;

  // Ürün detayları
  const productDetails = dashboardData?.productDetails?.$values || [];

  // Kategori filtreleme
  const categories = [
    "all",
    ...new Set(productDetails.map((item) => item.category)),
  ];

  const filteredData =
    selectedCategory === "all"
      ? productDetails
      : productDetails.filter((item) => item.category === selectedCategory);

  const periodLabels = {
    monthly: "1 Aylık",
    quarterly: "3 Aylık",
    sixMonth: "6 Aylık",
    yearly: "1 Yıllık",
  };

  // Satış özeti kutuları için veriler
  const totalSales = salesSummary?.totalSales || 0;
  const totalRevenue = salesSummary?.totalRevenue || 0;
  const totalCost = salesSummary?.totalCost || 0;
  const totalProfit = salesSummary?.totalProfit || 0;

  return (
    <div className="stock-details-container">
      {/* Header */}
      <div className="stock-details-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
            Geri Dön
          </button>
          <h1 className="page-title">Stok Detayları</h1>
        </div>
      </div>

      <div className="stock-details-content">
        {/* Özet Kartları */}
        <div className="summary-cards">
          <div className="summary-card card-primary">
            <div className="card-icon">
              <Package size={24} />
            </div>
            <div className="card-content">
              <h3>Toplam Ürün</h3>
              <div className="card-value">{totalProducts}</div>
            </div>
          </div>

          <div className="summary-card card-success">
            <div className="card-icon">
              <TrendingUp size={24} />
            </div>
            <div className="card-content">
              <h3>Toplam Stok</h3>
              <div className="card-value">{totalStock.toLocaleString()}</div>
            </div>
          </div>

          <div className="summary-card card-info">
            <div className="card-icon">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <h3>Alış Değeri</h3>
              <div className="card-value">
                {totalCostValue.toLocaleString()} ₺
              </div>
            </div>
          </div>

          <div className="summary-card card-warning">
            <div className="card-icon">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <h3>Satış Değeri</h3>
              <div className="card-value">
                {totalSaleValue.toLocaleString()} ₺
              </div>
            </div>
          </div>

          <div className="summary-card card-danger">
            <div className="card-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="card-content">
              <h3>Kritik Stok</h3>
              <div className="card-value">{criticalStockCount}</div>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Kategori:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Tüm Kategoriler" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Dönem:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="monthly">1 Aylık</option>
              <option value="quarterly">3 Aylık</option>
              <option value="sixMonth">6 Aylık</option>
              <option value="yearly">1 Yıllık</option>
            </select>
          </div>
        </div>

        {/* Satış Özeti */}
        <div className="sales-summary">
          <h3 className="section-title">
            {periodLabels[selectedPeriod]} Satış Özeti
          </h3>
          {salesLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Satış özeti yükleniyor...</p>
            </div>
          ) : salesError ? (
            <div className="error-container">
              <p className="error-message">{salesError}</p>
            </div>
          ) : (
            <div className="sales-grid">
              <div className="sales-item">
                <div className="sales-value sales-total">
                  {totalSales.toLocaleString()}
                </div>
                <div className="sales-label">Toplam Satış</div>
              </div>
              <div className="sales-item">
                <div className="sales-value sales-revenue">
                  {totalRevenue.toLocaleString()} ₺
                </div>
                <div className="sales-label">Toplam Gelir</div>
              </div>
              <div className="sales-item">
                <div className="sales-value sales-cost">
                  {totalCost.toLocaleString()} ₺
                </div>
                <div className="sales-label">Toplam Maliyet</div>
              </div>
              <div className="sales-item">
                <div className="sales-value sales-profit">
                  {totalProfit.toLocaleString()} ₺
                </div>
                <div className="sales-label">Toplam Kar</div>
              </div>
            </div>
          )}
        </div>

        {/* Ürün Tablosu */}
        <div className="products-table-container">
          <h3 className="section-title">Ürün Detayları</h3>
          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Kategori</th>
                  <th>Stok</th>
                  <th>Alış Fiyatı</th>
                  <th>Satış Fiyatı</th>
                  <th>Kar Marjı</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const isCritical = item.status === "Kritik";

                  return (
                    <tr
                      key={item.$id}
                      className={index % 2 === 0 ? "even" : "odd"}
                    >
                      <td className="product-name">{item.name}</td>
                      <td className="product-category">{item.category}</td>
                      <td className="product-stock">{item.stock}</td>
                      <td className="product-price">
                        {item.costPrice.toLocaleString()} ₺
                      </td>
                      <td className="product-price">
                        {item.price.toLocaleString()} ₺
                      </td>
                      <td className="profit-margin">{item.profitMargin}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            isCritical ? "critical" : "normal"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetails;
