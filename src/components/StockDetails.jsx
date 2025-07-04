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

// Örnek stok verileri
const stockData = [
  {
    id: 1,
    name: "Vana",
    category: "Tesisat",
    subCategory: "Vanalar",
    brand: "Viega",
    unit: "Adet",
    purchasePrice: 150,
    salePrice: 220,
    stock: 45,
    minStock: 10,
    monthlySales: [12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40],
    quarterlySales: [45, 52, 58, 65],
    sixMonthSales: [90, 105, 120],
    yearlySales: [180, 220, 250, 280],
  },
  {
    id: 2,
    name: "Pompa",
    category: "Tesisat",
    subCategory: "Pompalar",
    brand: "Grundfos",
    unit: "Adet",
    purchasePrice: 1200,
    salePrice: 1800,
    stock: 8,
    minStock: 5,
    monthlySales: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    quarterlySales: [12, 15, 18, 21],
    sixMonthSales: [25, 30, 35],
    yearlySales: [50, 60, 70, 80],
  },
  {
    id: 3,
    name: "Klozet",
    category: "Vitrifiye",
    subCategory: "Klozetler",
    brand: "Vitra",
    unit: "Adet",
    purchasePrice: 800,
    salePrice: 1200,
    stock: 25,
    minStock: 15,
    monthlySales: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    quarterlySales: [30, 36, 42, 48],
    sixMonthSales: [60, 72, 84],
    yearlySales: [120, 144, 168, 192],
  },
  {
    id: 4,
    name: "Lavabo",
    category: "Vitrifiye",
    subCategory: "Lavabolar",
    brand: "Eczacıbaşı",
    unit: "Adet",
    purchasePrice: 400,
    salePrice: 650,
    stock: 35,
    minStock: 20,
    monthlySales: [15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48],
    quarterlySales: [54, 63, 72, 81],
    sixMonthSales: [108, 126, 144],
    yearlySales: [216, 252, 288, 324],
  },
  {
    id: 5,
    name: "Radyatör",
    category: "Isıtma Soğutma",
    subCategory: "Radyatörler",
    brand: "Demirdöküm",
    unit: "Adet",
    purchasePrice: 350,
    salePrice: 550,
    stock: 60,
    minStock: 25,
    monthlySales: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
    quarterlySales: [75, 90, 105, 120],
    sixMonthSales: [150, 180, 210],
    yearlySales: [300, 360, 420, 480],
  },
];

function StockDetails() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Toplam hesaplamalar
  const totalProducts = stockData.length;
  const totalStock = stockData.reduce((sum, item) => sum + item.stock, 0);
  const totalPurchaseValue = stockData.reduce(
    (sum, item) => sum + item.purchasePrice * item.stock,
    0
  );
  const totalSaleValue = stockData.reduce(
    (sum, item) => sum + item.salePrice * item.stock,
    0
  );
  const criticalStock = stockData.filter(
    (item) => item.stock <= item.minStock
  ).length;

  // Satış verilerini hesapla
  const getSalesData = (period) => {
    const periods = {
      monthly: "monthlySales",
      quarterly: "quarterlySales",
      sixMonth: "sixMonthSales",
      yearly: "yearlySales",
    };

    const salesKey = periods[period];
    const totalSales = stockData.reduce((sum, item) => {
      const sales = item[salesKey];
      return sum + sales[sales.length - 1];
    }, 0);

    const totalRevenue = stockData.reduce((sum, item) => {
      const sales = item[salesKey];
      const lastSales = sales[sales.length - 1];
      return sum + lastSales * item.salePrice;
    }, 0);

    const totalCost = stockData.reduce((sum, item) => {
      const sales = item[salesKey];
      const lastSales = sales[sales.length - 1];
      return sum + lastSales * item.purchasePrice;
    }, 0);

    const totalProfit = totalRevenue - totalCost;

    return { totalSales, totalRevenue, totalCost, totalProfit };
  };

  const currentSalesData = getSalesData(selectedPeriod);

  // Kategori filtreleme
  const categories = [
    "all",
    ...new Set(stockData.map((item) => item.category)),
  ];
  const filteredData =
    selectedCategory === "all"
      ? stockData
      : stockData.filter((item) => item.category === selectedCategory);

  const periodLabels = {
    monthly: "1 Aylık",
    quarterly: "3 Aylık",
    sixMonth: "6 Aylık",
    yearly: "1 Yıllık",
  };

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
                {totalPurchaseValue.toLocaleString()} ₺
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
              <div className="card-value">{criticalStock}</div>
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
          <div className="sales-grid">
            <div className="sales-item">
              <div className="sales-value sales-total">
                {currentSalesData.totalSales.toLocaleString()}
              </div>
              <div className="sales-label">Toplam Satış</div>
            </div>
            <div className="sales-item">
              <div className="sales-value sales-revenue">
                {currentSalesData.totalRevenue.toLocaleString()} ₺
              </div>
              <div className="sales-label">Toplam Gelir</div>
            </div>
            <div className="sales-item">
              <div className="sales-value sales-cost">
                {currentSalesData.totalCost.toLocaleString()} ₺
              </div>
              <div className="sales-label">Toplam Maliyet</div>
            </div>
            <div className="sales-item">
              <div className="sales-value sales-profit">
                {currentSalesData.totalProfit.toLocaleString()} ₺
              </div>
              <div className="sales-label">Toplam Kar</div>
            </div>
          </div>
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
                  <th>Marka</th>
                  <th>Stok</th>
                  <th>Alış Fiyatı</th>
                  <th>Satış Fiyatı</th>
                  <th>Kar Marjı</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const profitMargin = (
                    ((item.salePrice - item.purchasePrice) /
                      item.purchasePrice) *
                    100
                  ).toFixed(1);
                  const isCritical = item.stock <= item.minStock;

                  return (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "even" : "odd"}
                    >
                      <td className="product-name">{item.name}</td>
                      <td className="product-category">
                        {item.category} / {item.subCategory}
                      </td>
                      <td className="product-brand">{item.brand}</td>
                      <td className="product-stock">{item.stock}</td>
                      <td className="product-price">
                        {item.purchasePrice.toLocaleString()} ₺
                      </td>
                      <td className="product-price">
                        {item.salePrice.toLocaleString()} ₺
                      </td>
                      <td className="profit-margin">%{profitMargin}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            isCritical ? "critical" : "normal"
                          }`}
                        >
                          {isCritical ? "Kritik" : "Normal"}
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
