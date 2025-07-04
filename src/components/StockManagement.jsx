import { useState, useEffect } from "react";
import "./StockManagement.css";
import { jsPDF } from "jspdf";
import logob64 from "./logob64";

import RobotoTTF from "../assets/Roboto-Regular.ttf";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { API_BASE_URL, apiGet, apiPost } from "../api";

// Fontu react-pdf'ye kaydet
Font.register({
  family: "Roboto",
  src: RobotoTTF,
  fontStyle: "normal",
  fontWeight: "normal",
});

const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: "#fcfefe",
    color: "#000205",
    padding: 32,
    fontFamily: "Roboto",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c20208",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  logo: { width: 48, height: 48, marginRight: 16 },
  company: { color: "#fcfefe", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "#fcfefe", fontSize: 10, marginTop: 2 },
  contact: { color: "#fcfefe", fontSize: 9, marginTop: 2 },
  title: {
    color: "#c20208",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  infoLabel: {
    color: "#c20208",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  infoText: { color: "#000205", fontSize: 10, marginBottom: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000205",
    color: "#fcfefe",
    borderRadius: 4,
    padding: 6,
    fontWeight: "bold",
    fontSize: 11,
  },
  tableRow: {
    flexDirection: "row",
    fontSize: 10,
    padding: 6,
    borderBottom: "1px solid #eee",
    alignItems: "center",
  },
  tableCell: { flex: 1, textAlign: "left" },
  tableCellRight: { flex: 1, textAlign: "right" },
  tableCellMid: { flex: 1, textAlign: "center" },
  totalBox: {
    backgroundColor: "#c20208",
    color: "#fcfefe",
    borderRadius: 6,
    padding: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  totalLabel: { fontWeight: "bold", fontSize: 12 },
  totalValue: { fontWeight: "bold", fontSize: 12, textAlign: "right" },
  notesBox: {
    backgroundColor: "#fce0e0",
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
  },
  notesLabel: {
    color: "#c20208",
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 4,
  },
  notesText: { color: "#000205", fontSize: 10 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    textAlign: "center",
    color: "#000205",
    fontSize: 8,
  },
});

const TeklifFaturaPDF = ({ tip, data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header ve logo */}
      <View style={pdfStyles.header}>
        <Image
          style={pdfStyles.logo}
          src={`data:image/png;base64,${logob64}`}
        />
        <View>
          <Text style={pdfStyles.company}>MEKAN PANEL</Text>
          <Text style={pdfStyles.subtitle}>Tesisat ve İnşaat Malzemeleri</Text>
          <Text style={pdfStyles.contact}>
            Tel: +90 xxx xxx xx xx | Email: info@mekanpanel.com
          </Text>
        </View>
      </View>
      {/* Ana başlık */}
      <Text style={pdfStyles.title}>{tip.toUpperCase()}</Text>
      {/* Tarih ve belge no */}
      <View style={pdfStyles.infoRow}>
        <Text style={pdfStyles.infoText}>Tarih: {data.tarih}</Text>
        <Text style={pdfStyles.infoText}>Belge No: {Date.now()}</Text>
      </View>
      {/* Müşteri Bilgileri */}
      <View style={pdfStyles.infoBox}>
        <Text style={pdfStyles.infoLabel}>MÜŞTERİ BİLGİLERİ</Text>
        <Text style={pdfStyles.infoText}>Ad Soyad: {data.musteriAdi}</Text>
        <Text style={pdfStyles.infoText}>Telefon: {data.musteriTelefon}</Text>
        <Text style={pdfStyles.infoText}>Adres: {data.musteriAdres}</Text>
      </View>
      {/* Ürün Tablosu */}
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.tableCellMid}>SIRA</Text>
        <Text style={pdfStyles.tableCell}>ÜRÜN</Text>
        <Text style={pdfStyles.tableCellMid}>MİKTAR</Text>
        <Text style={pdfStyles.tableCellRight}>BİRİM FİYAT</Text>
        <Text style={pdfStyles.tableCellRight}>TOPLAM</Text>
      </View>
      {data.urunler.map((urun, i) => (
        <View style={pdfStyles.tableRow} key={urun.id}>
          <Text style={pdfStyles.tableCellMid}>{i + 1}</Text>
          <Text style={pdfStyles.tableCell}>{urun.marka}</Text>
          <Text style={pdfStyles.tableCellMid}>
            {urun.miktar} {urun.birim}
          </Text>
          <Text style={pdfStyles.tableCellRight}>
            {urun.satisFiyati.toLocaleString("tr-TR")} ₺
          </Text>
          <Text style={pdfStyles.tableCellRight}>
            {urun.toplamFiyat.toLocaleString("tr-TR")} ₺
          </Text>
        </View>
      ))}
      {/* Toplamlar */}
      <View style={pdfStyles.totalBox}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={pdfStyles.totalLabel}>Ürün Toplamı:</Text>
          <Text style={pdfStyles.totalValue}>
            {data.urunler
              .reduce((t, u) => t + u.toplamFiyat, 0)
              .toLocaleString("tr-TR")}{" "}
            ₺
          </Text>
        </View>
        {data.iscilikMaliyeti > 0 && (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={pdfStyles.totalLabel}>İşçilik:</Text>
            <Text style={pdfStyles.totalValue}>
              {data.iscilikMaliyeti.toLocaleString("tr-TR")} ₺
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <Text style={pdfStyles.totalLabel}>GENEL TOPLAM:</Text>
          <Text style={pdfStyles.totalValue}>
            {data.toplam.toLocaleString("tr-TR")} ₺
          </Text>
        </View>
      </View>
      {/* Notlar */}
      {data.notlar && data.notlar.trim() && (
        <View style={pdfStyles.notesBox}>
          <Text style={pdfStyles.notesLabel}>NOTLAR</Text>
          <Text style={pdfStyles.notesText}>{data.notlar}</Text>
        </View>
      )}
      {/* Footer */}
      <Text
        style={pdfStyles.footer}
        render={({ pageNumber, totalPages }) =>
          `Bu belge Mekan Panel sistemi tarafından otomatik olarak oluşturulmuştur.  © 2024 Mekan Panel - Tüm hakları saklıdır.  Sayfa ${pageNumber}/${totalPages}`
        }
        fixed
      />
    </Page>
  </Document>
);

function StockManagement() {
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [modalType, setModalType] = useState(""); // "anaKategori" | "altKategori" | "urun" | "teklif" | "fatura"
  const [modalOpen, setModalOpen] = useState(false);
  const [kritikStokModu, setKritikStokModu] = useState(false);
  const [tumUrunlerModu, setTumUrunlerModu] = useState(false);

  // Dinamik veri state'leri
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Backend'den kategorileri çekmek için state
  const [backendCategories, setBackendCategories] = useState([]);
  const [backendCategoriesLoading, setBackendCategoriesLoading] =
    useState(false);
  const [backendCategoriesError, setBackendCategoriesError] = useState("");

  // Backend'den ürünleri çekmek için state
  const [backendProducts, setBackendProducts] = useState([]);
  const [backendProductsLoading, setBackendProductsLoading] = useState(false);
  const [backendProductsError, setBackendProductsError] = useState("");

  // Kategorileri çek
  useEffect(() => {
    const fetchCategories = async () => {
      setBackendCategoriesLoading(true);
      setBackendCategoriesError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/Category`);
        if (!res.ok)
          throw new Error(`Kategoriler alınamadı! Status: ${res.status}`);
        const data = await res.json();
        if (!data.$values)
          throw new Error("Beklenen formatta veri gelmedi! (data.$values yok)");
        setBackendCategories(data.$values);
      } catch (err) {
        setBackendCategoriesError(
          "Kategori çekme hatası: " + (err.message || err)
        );
        console.error("Kategori çekme hatası:", err);
      } finally {
        setBackendCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      setBackendProductsLoading(true);
      setBackendProductsError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/Product`);
        if (!res.ok)
          throw new Error(`Ürünler alınamadı! Status: ${res.status}`);
        const data = await res.json();
        if (!data.$values)
          throw new Error("Beklenen formatta veri gelmedi! (data.$values yok)");
        setBackendProducts(data.$values);
      } catch (err) {
        setBackendProductsError("Ürün çekme hatası: " + (err.message || err));
        console.error("Ürün çekme hatası:", err);
      } finally {
        setBackendProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Ana kategorileri al (parentCategoryId null olanlar)
  const getMainCategories = () => {
    return backendCategories.filter((cat) => cat.parentCategoryId === null);
  };

  // Alt kategorileri al (parentCategoryId belirli bir ana kategoriye ait olanlar)
  const getSubCategories = (mainCategoryId) => {
    return backendCategories.filter(
      (cat) => cat.parentCategoryId === mainCategoryId
    );
  };

  // Kategori adını ID'den al
  const getCategoryName = (categoryId) => {
    const category = backendCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Bilinmeyen Kategori";
  };

  // Dinamik stok verileri - artık kullanılmıyor, doğrudan backendProducts kullanılıyor

  // Teklif/Fatura modal state'leri
  const [teklifUrunler, setTeklifUrunler] = useState([]);
  const [faturaUrunler, setFaturaUrunler] = useState([]);
  const [iscilikMaliyeti, setIscilikMaliyeti] = useState("");
  const [musteriAdi, setMusteriAdi] = useState("");
  const [musteriTelefon, setMusteriTelefon] = useState("");
  const [musteriAdres, setMusteriAdres] = useState("");
  const [teklifNotlari, setTeklifNotlari] = useState("");
  const [faturaNotlari, setFaturaNotlari] = useState("");
  const [urunAramaTerm, setUrunAramaTerm] = useState("");
  const [seciliUrunMiktar, setSeciliUrunMiktar] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Modal açma fonksiyonları
  const openAnaKategoriModal = () => {
    setModalType("anaKategori");
    setModalOpen(true);
  };
  const openAltKategoriModal = () => {
    setModalType("altKategori");
    setModalOpen(true);
  };
  const openUrunModal = () => {
    setModalType("urun");
    setModalOpen(true);
  };
  const openTeklifModal = () => {
    setModalType("teklif");
    setModalOpen(true);
    setTeklifUrunler([]);
    setIscilikMaliyeti("");
    setMusteriAdi("");
    setMusteriTelefon("");
    setMusteriAdres("");
    setTeklifNotlari("");
    setUrunAramaTerm("");
    setSeciliUrunMiktar(1);
  };
  const openFaturaModal = () => {
    setModalType("fatura");
    setModalOpen(true);
    setFaturaUrunler([]);
    setIscilikMaliyeti("");
    setMusteriAdi("");
    setMusteriTelefon("");
    setMusteriAdres("");
    setFaturaNotlari("");
    setUrunAramaTerm("");
    setSeciliUrunMiktar(1);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalType("");
  };

  // Modal form state'leri
  const [newAnaKategori, setNewAnaKategori] = useState("");
  const [newUrunDescription, setNewUrunDescription] = useState("");

  const [newAltAnaKategori, setNewAltAnaKategori] = useState("");
  const [newAltKategori, setNewAltKategori] = useState("");
  const [newUrunAnaKategori, setNewUrunAnaKategori] = useState("");
  const [newUrunAltKategori, setNewUrunAltKategori] = useState("");
  const [newUrunMarka, setNewUrunMarka] = useState("");
  const [newUrunBirim, setNewUrunBirim] = useState("");
  const [newUrunAlis, setNewUrunAlis] = useState("");
  const [newUrunSatis, setNewUrunSatis] = useState("");
  const [newUrunStok, setNewUrunStok] = useState("");
  const [newUrunMinStok, setNewUrunMinStok] = useState("");
  const [newUrunImageFile, setNewUrunImageFile] = useState(null);

  // Görsel önizleme için
  const [newUrunImagePreview, setNewUrunImagePreview] = useState("");

  // Görsel dosya seçimi
  const handleUrunImageChange = (e) => {
    const file = e.target.files[0];
    setNewUrunImageFile(file);
    if (file) {
      setNewUrunImagePreview(URL.createObjectURL(file));
    } else {
      setNewUrunImagePreview("");
    }
  };

  // Modal submit handlerları (şimdilik sadece kapatıyor, veri ekleme bir sonraki adımda)
  const handleAnaKategoriSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/Category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 0,
          name: newAnaKategori,
          parentCategoryId: null,
        }),
      });
      if (!response.ok) {
        throw new Error("Kategori eklenemedi!");
      }
      // Başarılı ise modalı kapat
      closeModal();
      // Kategori listesini güncelle
      const res = await fetch(`${API_BASE_URL}/api/Category`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setBackendCategories(data.$values);
        }
      }
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // ALT KATEGORİ EKLEME
  const handleAltKategoriSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/Category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 0,
          name: newAltKategori,
          parentCategoryId: Number(newAltAnaKategori),
        }),
      });
      if (!response.ok) {
        throw new Error("Alt kategori eklenemedi!");
      }
      closeModal();
      // Kategori listesini güncelle
      const res = await fetch(`${API_BASE_URL}/api/Category`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setBackendCategories(data.$values);
        }
      }
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // ÜRÜN EKLEME
  const handleUrunSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("Name", newUrunMarka);
      formData.append("Unit", newUrunBirim);
      formData.append("Price", newUrunSatis);
      formData.append("Description", newUrunDescription || "Açıklama yok"); // boş gönderme
      formData.append("CostPrice", newUrunAlis);
      formData.append("Stock", newUrunStok);
      formData.append("CriticalStock", newUrunMinStok);
      formData.append("CategoryId", newUrunAltKategori);
      if (newUrunImageFile) {
        formData.append("Image", newUrunImageFile);
      } else {
        alert("Lütfen ürün görseli seçiniz.");
        return;
      }

      console.log("Form Data Gönderiliyor:", [...formData.entries()]);

      const response = await fetch(`${API_BASE_URL}/api/Product`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error("Ürün eklenemedi!");
      }
      closeModal();
      // Ürün listesini güncelle
      const res = await fetch(`${API_BASE_URL}/api/Product`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setBackendProducts(data.$values);
        }
      }
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  const mainCategories = getMainCategories().map((cat) => cat.name);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Tüm ana kategoriler için select ve tümünü göster
  const [showAll, setShowAll] = useState(false);

  const getFilteredProducts = () => {
    if (!selectedMainCategory) return [];

    const mainCatId = backendCategories.find(
      (cat) => cat.name === selectedMainCategory
    )?.id;
    if (!mainCatId) return [];

    if (showAll || !selectedSubCategory) {
      // Tüm alt kategorilerdeki ürünleri birleştir
      const subCatIds = getSubCategories(mainCatId).map((cat) => cat.id);
      return backendProducts
        .filter((prod) => subCatIds.includes(prod.categoryId))
        .map((prod) => ({
          id: prod.id,
          marka: prod.name,
          birim: prod.unit,
          alisFiyati: prod.costPrice,
          satisFiyati: prod.price,
          stokSayisi: prod.stock,
          minimumStok: prod.criticalStock,
          imageUrl:
            prod.imageUrl ||
            "https://cdn.pixabay.com/photo/2020/08/10/15/16/hose-5478113_640.jpg",
          anaKategori: selectedMainCategory,
          altKategori: getCategoryName(prod.categoryId),
          description: prod.description,
        }));
    }

    const subCatId = backendCategories.find(
      (cat) =>
        cat.name === selectedSubCategory && cat.parentCategoryId === mainCatId
    )?.id;
    if (!subCatId) return [];

    const products = backendProducts
      .filter((prod) => prod.categoryId === subCatId)
      .map((prod) => ({
        id: prod.id,
        marka: prod.name,
        birim: prod.unit,
        alisFiyati: prod.costPrice,
        satisFiyati: prod.price,
        stokSayisi: prod.stock,
        minimumStok: prod.criticalStock,
        imageUrl:
          prod.imageUrl ||
          "https://cdn.pixabay.com/photo/2020/08/10/15/16/hose-5478113_640.jpg",
        anaKategori: selectedMainCategory,
        altKategori: selectedSubCategory,
        description: prod.description,
      }));

    if (!searchTerm) return products;
    return products.filter((product) =>
      product.marka.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Tüm ürünleri ana ve alt kategoriyle birlikte düz liste olarak döndür (arama fonksiyonu gibi ama aramasız)
  const getTumUrunler = () => {
    return backendProducts.map((prod) => {
      const category = backendCategories.find(
        (cat) => cat.id === prod.categoryId
      );
      const parentCategory = category
        ? backendCategories.find((cat) => cat.id === category.parentCategoryId)
        : null;

      return {
        id: prod.id,
        marka: prod.name,
        birim: prod.unit,
        alisFiyati: prod.costPrice,
        satisFiyati: prod.price,
        stokSayisi: prod.stock,
        minimumStok: prod.criticalStock,
        imageUrl:
          prod.imageUrl ||
          "https://cdn.pixabay.com/photo/2020/08/10/15/16/hose-5478113_640.jpg",
        anaKategori: parentCategory
          ? parentCategory.name
          : "Bilinmeyen Kategori",
        altKategori: category ? category.name : "Bilinmeyen Alt Kategori",
        description: prod.description,
      };
    });
  };

  // Arama için tüm ürünleri filtrele
  const getAllMatchingProducts = () => {
    if (!searchTerm) return [];
    const allProducts = getTumUrunler();
    return allProducts.filter(
      (product) =>
        product.marka.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.anaKategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.altKategori.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Kritik stok ürünlerini ana ve alt kategoriyle birlikte döndür
  const getKritikStokUrunler = () => {
    return backendProducts
      .filter((prod) => prod.stock <= prod.criticalStock)
      .map((prod) => {
        const category = backendCategories.find(
          (cat) => cat.id === prod.categoryId
        );
        const parentCategory = category
          ? backendCategories.find(
              (cat) => cat.id === category.parentCategoryId
            )
          : null;

        return {
          id: prod.id,
          marka: prod.name,
          birim: prod.unit,
          alisFiyati: prod.costPrice,
          satisFiyati: prod.price,
          stokSayisi: prod.stock,
          minimumStok: prod.criticalStock,
          imageUrl:
            prod.imageUrl ||
            "https://cdn.pixabay.com/photo/2020/08/10/15/16/hose-5478113_640.jpg",
          anaKategori: parentCategory
            ? parentCategory.name
            : "Bilinmeyen Kategori",
          altKategori: category ? category.name : "Bilinmeyen Alt Kategori",
          description: prod.description,
        };
      });
  };

  const isLowStock = (product) => {
    return product.stokSayisi <= product.minimumStok;
  };

  const renderProductCard = (product) => {
    const lowStock = isLowStock(product);
    return (
      <div
        key={product.id}
        className={`product-card ${lowStock ? "low-stock" : ""}`}
        onClick={() => handleUrunDetayAc(product)}
      >
        <div className="product-image">
          <img src={product.imageUrl} alt={product.marka} />
        </div>
        <div className="product-info">
          <h3>{product.marka}</h3>
          <div className="product-details">
            <div className="detail-row">
              <span className="label">Birim:</span>
              <span className="value">{product.birim}</span>
            </div>
            <div className="detail-row">
              <span className="label">Alış Fiyatı:</span>
              <span className="value">
                {product.alisFiyati.toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Satış Fiyatı:</span>
              <span className="value">
                {product.satisFiyati.toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Stok Sayısı:</span>
              <span className={`value ${lowStock ? "low-stock-text" : ""}`}>
                {product.stokSayisi}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Minimum Stok:</span>
              <span className="value">{product.minimumStok}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Gruplu render fonksiyonu (tümünü göster için)
  const renderGroupedProducts = () => {
    const mainCatId = backendCategories.find(
      (cat) => cat.name === selectedMainCategory
    )?.id;
    if (!mainCatId) return null;

    const subCategoriesWithProducts = getSubCategories(mainCatId)
      .map((subCat) => {
        const categoryProducts = backendProducts
          .filter((prod) => prod.categoryId === subCat.id)
          .map((prod) => ({
            id: prod.id,
            marka: prod.name,
            birim: prod.unit,
            alisFiyati: prod.costPrice,
            satisFiyati: prod.price,
            stokSayisi: prod.stock,
            minimumStok: prod.criticalStock,
            imageUrl:
              prod.imageUrl ||
              "https://cdn.pixabay.com/photo/2020/08/10/15/16/hose-5478113_640.jpg",
            anaKategori: selectedMainCategory,
            altKategori: subCat.name,
            description: prod.description,
          }));

        return { name: subCat.name, products: categoryProducts };
      })
      .filter((group) => group.products.length > 0);

    return subCategoriesWithProducts.map((group) => (
      <div key={group.name} className="grouped-category-block">
        <h3 className="grouped-category-title">{group.name}</h3>
        <div className="products-grid">
          {group.products.map(renderProductCard)}
        </div>
      </div>
    ));
  };

  // Kategori sidebarında select ile gösterim
  const renderSubCategorySelect = (category) => {
    const mainCatId = backendCategories.find(
      (cat) => cat.name === category
    )?.id;
    if (!mainCatId) return null;

    const subCats = getSubCategories(mainCatId);

    return (
      <select
        className="tesisat-select"
        value={showAll ? "all" : selectedSubCategory}
        onChange={(e) => {
          if (e.target.value === "all") {
            setShowAll(true);
          } else {
            setShowAll(false);
            handleSubCategorySelect(e.target.value);
          }
        }}
      >
        <option value="all">Tümünü Göster</option>
        {subCats.map((subCategory) => (
          <option key={subCategory.id} value={subCategory.name}>
            {subCategory.name}
          </option>
        ))}
      </select>
    );
  };

  // Ana kategori seçilince ilk alt kategoriyi seçme, selectedSubCategory'yi boş bırak
  const handleMainCategorySelect = (category) => {
    setSelectedMainCategory(category);
    setShowAll(false);
    setSelectedSubCategory("");
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  // Tesisat Sistemleri için özel select ve tümünü göster
  const isTesisat = selectedMainCategory === "Tesisat Sistemleri";
  const subCategories = selectedMainCategory
    ? getSubCategories(
        backendCategories.find((cat) => cat.name === selectedMainCategory)
          ?.id || 0
      ).map((cat) => cat.name)
    : [];

  // Filtreyi temizle fonksiyonu
  const handleFiltreTemizle = () => {
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    setShowAll(false);
    setSearchTerm("");
    setExpandedCategories({});
    setKritikStokModu(false);
    setTumUrunlerModu(false);
  };

  // Stok özeti hesaplama
  const getStokOzet = () => {
    const toplam = backendProducts.length;
    const kritik = backendProducts.filter(
      (prod) => prod.stock <= prod.criticalStock
    ).length;
    return { toplam, kritik };
  };

  // Ürün detay modalı için state
  const [detayModalOpen, setDetayModalOpen] = useState(false);
  const [detayUrun, setDetayUrun] = useState(null);
  const [detayEditMod, setDetayEditMod] = useState(false);

  // Ürün kartına tıklayınca modalı aç
  const handleUrunDetayAc = (urun) => {
    setDetayUrun(urun);
    setDetayEditMod(false);
    setDetayModalOpen(true);
  };
  const handleDetayModalKapat = () => {
    setDetayModalOpen(false);
    setDetayUrun(null);
    setDetayEditMod(false);
  };

  // Ürün silme fonksiyonu
  const handleUrunSil = async () => {
    if (!detayUrun) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Product/${detayUrun.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Ürün silinemedi!");
      }

      // Backend'den ürünleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/Product`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setBackendProducts(data.$values);
        }
      }

      handleDetayModalKapat();
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // Ürün güncelleme fonksiyonu
  const handleUrunGuncelle = async (guncelUrun) => {
    if (!detayUrun) return;

    try {
      const formData = new FormData();
      formData.append("Name", guncelUrun.marka);
      formData.append("Unit", guncelUrun.birim);
      formData.append("Price", guncelUrun.satisFiyati);
      formData.append("Description", guncelUrun.description || "Açıklama yok");
      formData.append("CostPrice", guncelUrun.alisFiyati);
      formData.append("Stock", guncelUrun.stokSayisi);
      formData.append("CriticalStock", guncelUrun.minimumStok);
      formData.append(
        "CategoryId",
        detayUrun.categoryId || detayUrun.altKategoriId
      );

      if (editImageFile) {
        formData.append("Image", editImageFile);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/Product/${detayUrun.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Ürün güncellenemedi!");
      }

      // Backend'den ürünleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/Product`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setBackendProducts(data.$values);
        }
      }

      setDetayUrun({ ...guncelUrun, id: detayUrun.id });
      setDetayEditMod(false);
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // Güncelleme formu için state
  const [editMarka, setEditMarka] = useState("");
  const [editBirim, setEditBirim] = useState("");
  const [editAlis, setEditAlis] = useState("");
  const [editSatis, setEditSatis] = useState("");
  const [editStok, setEditStok] = useState("");
  const [editMinStok, setEditMinStok] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  // Görseli sil
  const handleEditImageSil = () => {
    setEditImageFile(null);
    setEditImagePreview("");
  };

  // Güncelleme moduna geçerken mevcut verileri doldur
  const handleEditModAc = () => {
    if (!detayUrun) return;
    setEditMarka(detayUrun.marka);
    setEditBirim(detayUrun.birim);
    setEditAlis(detayUrun.alisFiyati);
    setEditSatis(detayUrun.satisFiyati);
    setEditStok(detayUrun.stokSayisi);
    setEditMinStok(detayUrun.minimumStok);
    setEditImageFile(null);
    setEditImagePreview(detayUrun.imageUrl || detayUrun.image || "");
    setDetayEditMod(true);
  };

  // Görsel dosya seçimi (güncelleme için)
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setEditImageFile(file);
    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      setEditImagePreview(detayUrun.imageUrl || detayUrun.image || "");
    }
  };

  // Güncelleme submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEditError("");
    if (!editImagePreview) {
      setEditError("En az bir görsel seçmelisiniz.");
      return;
    }
    handleUrunGuncelle({
      ...detayUrun,
      marka: editMarka,
      birim: editBirim,
      alisFiyati: Number(editAlis),
      satisFiyati: Number(editSatis),
      stokSayisi: Number(editStok),
      minimumStok: Number(editMinStok),
      imageUrl: editImagePreview,
    });
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setDetayModalOpen(false);
      setDetayEditMod(false);
      setDetayUrun(null);
    }, 1200);
  };

  // Teklif/Fatura ürün ekleme fonksiyonları
  const urunEkle = (urun, miktar = 1) => {
    const yeniUrun = {
      ...urun,
      miktar: miktar,
      toplamFiyat: urun.satisFiyati * miktar,
    };

    if (modalType === "teklif") {
      const mevcutIndex = teklifUrunler.findIndex((u) => u.id === urun.id);
      if (mevcutIndex >= 0) {
        const guncelUrunler = [...teklifUrunler];
        guncelUrunler[mevcutIndex].miktar += miktar;
        guncelUrunler[mevcutIndex].toplamFiyat =
          guncelUrunler[mevcutIndex].satisFiyati *
          guncelUrunler[mevcutIndex].miktar;
        setTeklifUrunler(guncelUrunler);
      } else {
        setTeklifUrunler([...teklifUrunler, yeniUrun]);
      }
    } else if (modalType === "fatura") {
      const mevcutIndex = faturaUrunler.findIndex((u) => u.id === urun.id);
      if (mevcutIndex >= 0) {
        const guncelUrunler = [...faturaUrunler];
        guncelUrunler[mevcutIndex].miktar += miktar;
        guncelUrunler[mevcutIndex].toplamFiyat =
          guncelUrunler[mevcutIndex].satisFiyati *
          guncelUrunler[mevcutIndex].miktar;
        setFaturaUrunler(guncelUrunler);
      } else {
        setFaturaUrunler([...faturaUrunler, yeniUrun]);
      }
    }
    // Ürün eklendikten sonra miktarı sıfırla
    setSeciliUrunMiktar(1);
  };

  const urunCikar = (urunId) => {
    if (modalType === "teklif") {
      setTeklifUrunler(teklifUrunler.filter((u) => u.id !== urunId));
    } else if (modalType === "fatura") {
      setFaturaUrunler(faturaUrunler.filter((u) => u.id !== urunId));
    }
  };

  const miktarGuncelle = (urunId, yeniMiktar) => {
    if (modalType === "teklif") {
      setTeklifUrunler(
        teklifUrunler.map((u) =>
          u.id === urunId
            ? {
                ...u,
                miktar: yeniMiktar,
                toplamFiyat: u.satisFiyati * yeniMiktar,
              }
            : u
        )
      );
    } else if (modalType === "fatura") {
      setFaturaUrunler(
        faturaUrunler.map((u) =>
          u.id === urunId
            ? {
                ...u,
                miktar: yeniMiktar,
                toplamFiyat: u.satisFiyati * yeniMiktar,
              }
            : u
        )
      );
    }
  };

  // Toplam hesaplama
  const toplamHesapla = () => {
    const urunler = modalType === "teklif" ? teklifUrunler : faturaUrunler;
    const urunToplami = urunler.reduce(
      (toplam, urun) => toplam + urun.toplamFiyat,
      0
    );
    const iscilik = Number(iscilikMaliyeti) || 0;
    return urunToplami + iscilik;
  };

  // Filtrelenmiş ürün listesi
  const getFiltrelenmisUrunler = () => {
    const tumUrunler = getTumUrunler();
    if (!urunAramaTerm) return tumUrunler;

    return tumUrunler.filter(
      (urun) =>
        urun.marka.toLowerCase().includes(urunAramaTerm.toLowerCase()) ||
        urun.anaKategori.toLowerCase().includes(urunAramaTerm.toLowerCase()) ||
        urun.altKategori.toLowerCase().includes(urunAramaTerm.toLowerCase())
    );
  };

  // Teklif/Fatura oluşturma
  const teklifOlustur = () => {
    const toplam = toplamHesapla();
    const teklif = {
      musteriAdi,
      musteriTelefon,
      musteriAdres,
      urunler: teklifUrunler,
      iscilikMaliyeti: Number(iscilikMaliyeti) || 0,
      toplam,
      notlar: teklifNotlari,
      tarih: new Date().toLocaleDateString("tr-TR"),
    };
    console.log("Teklif oluşturuldu:", teklif);
    closeModal();
  };

  const faturaOlustur = () => {
    const toplam = toplamHesapla();
    const fatura = {
      musteriAdi,
      musteriTelefon,
      musteriAdres,
      urunler: faturaUrunler,
      iscilikMaliyeti: Number(iscilikMaliyeti) || 0,
      toplam,
      notlar: faturaNotlari,
      tarih: new Date().toLocaleDateString("tr-TR"),
    };
    console.log("Fatura oluşturuldu:", fatura);
    closeModal();
  };

  return (
    <div className="stock-management">
      <div className="stock-header">
        <h1>Stok Yönetimi</h1>
        <div className="header-actions">
          <button className="header-btn" onClick={openAnaKategoriModal}>
            <span className="plus">+</span> Ana Kategori Ekle
          </button>
          <button className="header-btn" onClick={openAltKategoriModal}>
            <span className="plus">+</span> Alt Kategori Ekle
          </button>
          <button className="header-btn" onClick={openUrunModal}>
            <span className="plus">+</span> Ürün Ekle
          </button>
          <button className="header-btn teklif-btn" onClick={openTeklifModal}>
            <span className="plus">📋</span> Teklif Ver
          </button>
          <button className="header-btn fatura-btn" onClick={openFaturaModal}>
            <span className="plus">🧾</span> Fatura
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* Modal içeriği */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            {modalType === "anaKategori" && (
              <form
                className="modal add-modal add-form"
                onSubmit={handleAnaKategoriSubmit}
              >
                <div className="add-form-title">Ana Kategori Ekle</div>
                <input
                  className="add-input"
                  type="text"
                  placeholder="Kategori İsmi"
                  value={newAnaKategori}
                  onChange={(e) => setNewAnaKategori(e.target.value)}
                  required
                />
                <button type="submit" className="modal-btn add">
                  <span>Ekle</span>
                </button>
              </form>
            )}
            {modalType === "altKategori" && (
              <form
                className="modal add-modal add-form"
                onSubmit={handleAltKategoriSubmit}
              >
                <div className="add-form-title">Alt Kategori Ekle</div>
                <select
                  className="add-input"
                  value={newAltAnaKategori}
                  onChange={(e) => setNewAltAnaKategori(e.target.value)}
                  required
                >
                  <option value="">Ana Kategori Seç</option>
                  {backendCategoriesLoading && (
                    <option disabled>Yükleniyor...</option>
                  )}
                  {backendCategoriesError && (
                    <option disabled>Hata: {backendCategoriesError}</option>
                  )}
                  {!backendCategoriesLoading &&
                    !backendCategoriesError &&
                    backendCategories.filter(
                      (cat) => cat.parentCategoryId === null
                    ).length === 0 && (
                      <option disabled>Kategori bulunamadı</option>
                    )}
                  {backendCategories
                    .filter((cat) => cat.parentCategoryId === null)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <input
                  className="add-input"
                  type="text"
                  placeholder="Alt Kategori İsmi"
                  value={newAltKategori}
                  onChange={(e) => setNewAltKategori(e.target.value)}
                  required
                />
                <button type="submit" className="modal-btn add">
                  <span>Ekle</span>
                </button>
              </form>
            )}
            {modalType === "urun" && (
              <form
                className="modal add-modal add-form"
                onSubmit={handleUrunSubmit}
              >
                <div className="add-form-title">Ürün Ekle</div>
                <select
                  className="add-input"
                  value={newUrunAnaKategori}
                  onChange={(e) => setNewUrunAnaKategori(e.target.value)}
                  required
                >
                  <option value="">Ana Kategori Seç</option>
                  {backendCategoriesLoading && (
                    <option disabled>Yükleniyor...</option>
                  )}
                  {backendCategoriesError && (
                    <option disabled>Hata: {backendCategoriesError}</option>
                  )}
                  {!backendCategoriesLoading &&
                    !backendCategoriesError &&
                    backendCategories.filter(
                      (cat) => cat.parentCategoryId === null
                    ).length === 0 && (
                      <option disabled>Kategori bulunamadı</option>
                    )}
                  {backendCategories
                    .filter((cat) => cat.parentCategoryId === null)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <select
                  className="add-input"
                  value={newUrunAltKategori}
                  onChange={(e) => setNewUrunAltKategori(e.target.value)}
                  required
                  disabled={!newUrunAnaKategori}
                >
                  <option value="">Alt Kategori Seç</option>
                  {backendCategories
                    .filter(
                      (cat) =>
                        cat.parentCategoryId !== null &&
                        Number(cat.parentCategoryId) ===
                          Number(newUrunAnaKategori)
                    )
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <input
                  className="add-input"
                  type="text"
                  placeholder="Marka"
                  value={newUrunMarka}
                  onChange={(e) => setNewUrunMarka(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="text"
                  placeholder="Birim"
                  value={newUrunBirim}
                  onChange={(e) => setNewUrunBirim(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Alış Fiyatı"
                  value={newUrunAlis}
                  onChange={(e) => setNewUrunAlis(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Satış Fiyatı"
                  value={newUrunSatis}
                  onChange={(e) => setNewUrunSatis(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Stok Sayısı"
                  value={newUrunStok}
                  onChange={(e) => setNewUrunStok(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Minimum Stok"
                  value={newUrunMinStok}
                  onChange={(e) => setNewUrunMinStok(e.target.value)}
                  required
                />
                <input
                  className="add-file"
                  type="file"
                  accept="image/*"
                  onChange={handleUrunImageChange}
                />
                {newUrunImagePreview && (
                  <div className="add-preview-list">
                    <img
                      src={newUrunImagePreview}
                      alt="Önizleme"
                      className="add-preview-img"
                    />
                  </div>
                )}
                <button type="submit" className="modal-btn add">
                  <span>Ekle</span>
                </button>
              </form>
            )}
            {(modalType === "teklif" || modalType === "fatura") && (
              <div className="teklif-fatura-modal">
                <div className="teklif-fatura-header">
                  <h2>
                    {modalType === "teklif"
                      ? "Teklif Oluştur"
                      : "Fatura Oluştur"}
                  </h2>
                </div>

                <div className="teklif-fatura-content">
                  <div className="musteri-bilgileri">
                    <h3>Müşteri Bilgileri</h3>
                    <input
                      className="add-input"
                      type="text"
                      placeholder="Müşteri Adı"
                      value={musteriAdi}
                      onChange={(e) => setMusteriAdi(e.target.value)}
                    />
                    <input
                      className="add-input"
                      type="text"
                      placeholder="Telefon"
                      value={musteriTelefon}
                      onChange={(e) => setMusteriTelefon(e.target.value)}
                    />
                    <textarea
                      className="add-input"
                      placeholder="Adres"
                      value={musteriAdres}
                      onChange={(e) => setMusteriAdres(e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="urun-secimi">
                    <h3>Ürün Seçimi</h3>
                    <div className="urun-arama">
                      <input
                        className="add-input"
                        type="text"
                        placeholder="Ürün ara (marka, kategori...)"
                        value={urunAramaTerm}
                        onChange={(e) => setUrunAramaTerm(e.target.value)}
                      />
                    </div>
                    <div className="urun-listesi">
                      {getFiltrelenmisUrunler().map((urun) => (
                        <div key={urun.id} className="urun-secim-karti">
                          <img
                            src={urun.imageUrl}
                            alt={urun.marka}
                            className="urun-secim-img"
                          />
                          <div className="urun-secim-bilgi">
                            <h4>{urun.marka}</h4>
                            <p>
                              {urun.anaKategori} - {urun.altKategori}
                            </p>
                            <p>Birim: {urun.birim}</p>
                            <p>
                              Fiyat: {urun.satisFiyati.toLocaleString("tr-TR")}{" "}
                              ₺
                            </p>
                            <p>Stok: {urun.stokSayisi}</p>
                          </div>
                          <div className="urun-ekle-kontrol">
                            <input
                              type="number"
                              min="1"
                              max={urun.stokSayisi}
                              value={seciliUrunMiktar}
                              onChange={(e) =>
                                setSeciliUrunMiktar(Number(e.target.value))
                              }
                              className="miktar-input-kucuk"
                              placeholder="Miktar"
                            />
                            <button
                              className="urun-ekle-btn"
                              onClick={() => urunEkle(urun, seciliUrunMiktar)}
                              disabled={
                                urun.stokSayisi <= 0 || seciliUrunMiktar <= 0
                              }
                            >
                              Ekle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="secili-urunler">
                    <h3>Seçili Ürünler</h3>
                    {(modalType === "teklif"
                      ? teklifUrunler
                      : faturaUrunler
                    ).map((urun) => (
                      <div key={urun.id} className="secili-urun-karti">
                        <div className="secili-urun-bilgi">
                          <h4>{urun.marka}</h4>
                          <p>
                            {urun.anaKategori} - {urun.altKategori}
                          </p>
                          <p>
                            Birim Fiyat:{" "}
                            {urun.satisFiyati.toLocaleString("tr-TR")} ₺
                          </p>
                        </div>
                        <div className="secili-urun-kontroller">
                          <input
                            type="number"
                            min="1"
                            max={urun.stokSayisi}
                            value={urun.miktar}
                            onChange={(e) =>
                              miktarGuncelle(urun.id, Number(e.target.value))
                            }
                            className="miktar-input"
                          />
                          <span className="birim">{urun.birim}</span>
                          <span className="toplam-fiyat">
                            {urun.toplamFiyat.toLocaleString("tr-TR")} ₺
                          </span>
                          <button
                            className="urun-cikar-btn"
                            onClick={() => urunCikar(urun.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="iscilik-maliyeti">
                    <h3>İşçilik Maliyeti</h3>
                    <input
                      className="add-input"
                      type="number"
                      placeholder="İşçilik Maliyeti (₺)"
                      value={iscilikMaliyeti}
                      onChange={(e) => setIscilikMaliyeti(e.target.value)}
                    />
                  </div>

                  <div className="notlar">
                    <h3>Notlar</h3>
                    <textarea
                      className="add-input"
                      placeholder={
                        modalType === "teklif"
                          ? "Teklif notları..."
                          : "Fatura notları..."
                      }
                      value={
                        modalType === "teklif" ? teklifNotlari : faturaNotlari
                      }
                      onChange={(e) =>
                        modalType === "teklif"
                          ? setTeklifNotlari(e.target.value)
                          : setFaturaNotlari(e.target.value)
                      }
                      rows="3"
                    />
                  </div>

                  <div className="toplam-ozet">
                    <div className="toplam-satir">
                      <span>Ürün Toplamı:</span>
                      <span>
                        {(modalType === "teklif"
                          ? teklifUrunler
                          : faturaUrunler
                        )
                          .reduce(
                            (toplam, urun) => toplam + urun.toplamFiyat,
                            0
                          )
                          .toLocaleString("tr-TR")}{" "}
                        ₺
                      </span>
                    </div>
                    <div className="toplam-satir">
                      <span>İşçilik:</span>
                      <span>
                        {(Number(iscilikMaliyeti) || 0).toLocaleString("tr-TR")}{" "}
                        ₺
                      </span>
                    </div>
                    <div className="toplam-satir toplam-genel">
                      <span>Genel Toplam:</span>
                      <span>{toplamHesapla().toLocaleString("tr-TR")} ₺</span>
                    </div>
                  </div>

                  <div className="teklif-fatura-actions">
                    {(modalType === "teklif" ? teklifUrunler : faturaUrunler)
                      .length > 0 && (
                      <PDFDownloadLink
                        document={
                          <TeklifFaturaPDF
                            tip={modalType === "teklif" ? "Teklif" : "Fatura"}
                            data={{
                              musteriAdi: musteriAdi || "-",
                              musteriTelefon: musteriTelefon || "-",
                              musteriAdres: musteriAdres || "-",
                              urunler:
                                (modalType === "teklif"
                                  ? teklifUrunler
                                  : faturaUrunler) || [],
                              iscilikMaliyeti: Number(iscilikMaliyeti) || 0,
                              toplam: toplamHesapla(),
                              notlar:
                                modalType === "teklif"
                                  ? teklifNotlari || ""
                                  : faturaNotlari || "",
                              tarih: new Date().toLocaleDateString("tr-TR"),
                            }}
                          />
                        }
                        fileName={`${
                          modalType === "teklif" ? "Teklif" : "Fatura"
                        }_${
                          musteriAdi || "Musteri"
                        }_${new Date().toLocaleDateString("tr-TR")}.pdf`}
                      >
                        {({ loading }) =>
                          loading ? (
                            <>
                              <div className="spinner"></div>
                              <span>PDF Hazırlanıyor...</span>
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                              <span>PDF Oluştur ve İndir</span>
                            </>
                          )
                        }
                      </PDFDownloadLink>
                    )}
                    <button
                      className="modal-btn add"
                      onClick={
                        modalType === "teklif" ? teklifOlustur : faturaOlustur
                      }
                      disabled={
                        (modalType === "teklif" ? teklifUrunler : faturaUrunler)
                          .length === 0
                      }
                    >
                      <span>
                        {modalType === "teklif"
                          ? "Teklif Oluştur"
                          : "Fatura Oluştur"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {detayModalOpen && detayUrun && (
        <div className="modal-overlay" onClick={handleDetayModalKapat}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleDetayModalKapat}>
              ×
            </button>
            {!detayEditMod ? (
              <>
                <div className="modal-slider">
                  <img
                    className="modal-img"
                    src={detayUrun.imageUrl || detayUrun.image}
                    alt={detayUrun.marka}
                  />
                </div>
                <div className="modal-info">
                  <div className="modal-title">{detayUrun.marka}</div>
                  <div className="modal-desc">
                    <div>
                      <b>Ana Kategori:</b> {detayUrun.anaKategori}
                    </div>
                    <div>
                      <b>Alt Kategori:</b> {detayUrun.altKategori}
                    </div>
                    <div>
                      <b>Birim:</b> {detayUrun.birim}
                    </div>
                    <div>
                      <b>Alış Fiyatı:</b> {detayUrun.alisFiyati} ₺
                    </div>
                    <div>
                      <b>Satış Fiyatı:</b> {detayUrun.satisFiyati} ₺
                    </div>
                    <div>
                      <b>Stok Sayısı:</b> {detayUrun.stokSayisi}
                    </div>
                    <div>
                      <b>Minimum Stok:</b> {detayUrun.minimumStok}
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button
                      className="modal-btn edit big"
                      onClick={handleEditModAc}
                    >
                      <span>Güncelle</span>
                    </button>
                    <button
                      className="modal-btn delete big"
                      onClick={handleUrunSil}
                    >
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <form
                className="modal add-modal add-form"
                onSubmit={handleEditSubmit}
              >
                <div className="add-form-title">Ürün Bilgilerini Güncelle</div>
                <input
                  className="add-input"
                  type="text"
                  placeholder="Marka"
                  value={editMarka}
                  onChange={(e) => setEditMarka(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="text"
                  placeholder="Birim"
                  value={editBirim}
                  onChange={(e) => setEditBirim(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Alış Fiyatı"
                  value={editAlis}
                  onChange={(e) => setEditAlis(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Satış Fiyatı"
                  value={editSatis}
                  onChange={(e) => setEditSatis(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Stok Sayısı"
                  value={editStok}
                  onChange={(e) => setEditStok(e.target.value)}
                  required
                />
                <input
                  className="add-input"
                  type="number"
                  placeholder="Minimum Stok"
                  value={editMinStok}
                  onChange={(e) => setEditMinStok(e.target.value)}
                  required
                />
                <input
                  className="add-file"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
                {editImagePreview && (
                  <div
                    className="add-preview-list"
                    style={{ position: "relative" }}
                  >
                    <img
                      src={editImagePreview}
                      alt="Önizleme"
                      className="add-preview-img"
                    />
                    <button
                      type="button"
                      className="gorsel-sil-btn"
                      onClick={handleEditImageSil}
                    >
                      Görseli Sil
                    </button>
                  </div>
                )}
                {editError && <div className="edit-error">{editError}</div>}
                {editSuccess && (
                  <div className="edit-success">Başarıyla kaydedildi!</div>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-btn edit big"
                    onClick={() => setDetayEditMod(false)}
                  >
                    <span>Vazgeç</span>
                  </button>
                  <button type="submit" className="modal-btn add big">
                    <span>Kaydet</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="stock-content">
        <div className="categories-sidebar">
          <h2>Kategoriler</h2>
          <button className="filtre-temizle-btn" onClick={handleFiltreTemizle}>
            Filtreyi Temizle
          </button>
          <button
            className="kritik-stok-btn"
            onClick={() => {
              setKritikStokModu(true);
              setTumUrunlerModu(false);
            }}
          >
            Kritik Stokları Getir
          </button>
          <button
            className="tum-urunler-btn"
            onClick={() => {
              setTumUrunlerModu(true);
              setKritikStokModu(false);
            }}
          >
            Tüm Ürünleri Getir
          </button>
          <div className="main-categories">
            {mainCategories.map((category) => (
              <div key={category} className="main-category">
                <div
                  className={`main-category-header ${
                    selectedMainCategory === category ? "active" : ""
                  }`}
                  onClick={() => handleMainCategorySelect(category)}
                >
                  <span>{category}</span>
                  <button
                    className="expand-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category);
                    }}
                  >
                    {expandedCategories[category] ? "▼" : "▶"}
                  </button>
                </div>
                {expandedCategories[category] && (
                  <div className="sub-categories">
                    {renderSubCategorySelect(category)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="products-section">
          {backendCategoriesLoading || backendProductsLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Veriler yükleniyor...</p>
            </div>
          ) : backendCategoriesError || backendProductsError ? (
            <div className="error">
              <p>Hata: {backendCategoriesError || backendProductsError}</p>
              <button onClick={() => window.location.reload()}>Yenile</button>
            </div>
          ) : tumUrunlerModu ? (
            <>
              <div className="section-header">
                <h2>Tüm Ürünler</h2>
                <span className="product-count">
                  {getTumUrunler().length} ürün bulundu
                </span>
              </div>
              <div className="products-grid">
                {getTumUrunler().map((product) => (
                  <div
                    key={product.id + product.anaKategori + product.altKategori}
                    className={`product-card${
                      product.stokSayisi <= product.minimumStok
                        ? " low-stock"
                        : ""
                    }`}
                    onClick={() => handleUrunDetayAc(product)}
                  >
                    <div className="product-image">
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.marka}
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.marka}</h3>
                      <div className="product-details">
                        <div className="detail-row">
                          <span className="label">Ana Kategori:</span>
                          <span className="value">{product.anaKategori}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Alt Kategori:</span>
                          <span className="value">{product.altKategori}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Birim:</span>
                          <span className="value">{product.birim}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Alış Fiyatı:</span>
                          <span className="value">
                            {product.alisFiyati.toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Satış Fiyatı:</span>
                          <span className="value">
                            {product.satisFiyati.toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Stok Sayısı:</span>
                          <span
                            className={`value${
                              product.stokSayisi <= product.minimumStok
                                ? " low-stock-text"
                                : ""
                            }`}
                          >
                            {product.stokSayisi}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Minimum Stok:</span>
                          <span className="value">{product.minimumStok}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : kritikStokModu ? (
            <>
              <div className="section-header">
                <h2>Kritik Stoklar</h2>
                <span className="product-count">
                  {getKritikStokUrunler().length} ürün kritik stokta
                </span>
              </div>
              <div className="products-grid">
                {getKritikStokUrunler().map((product) => (
                  <div
                    key={product.id + product.anaKategori + product.altKategori}
                    className="product-card low-stock"
                  >
                    <div className="product-image">
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.marka}
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.marka}</h3>
                      <div className="product-details">
                        <div className="detail-row">
                          <span className="label">Ana Kategori:</span>
                          <span className="value">{product.anaKategori}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Alt Kategori:</span>
                          <span className="value">{product.altKategori}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Birim:</span>
                          <span className="value">{product.birim}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Alış Fiyatı:</span>
                          <span className="value">
                            {product.alisFiyati.toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Satış Fiyatı:</span>
                          <span className="value">
                            {product.satisFiyati.toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Stok Sayısı:</span>
                          <span className="value low-stock-text">
                            {product.stokSayisi}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Minimum Stok:</span>
                          <span className="value">{product.minimumStok}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {getKritikStokUrunler().length === 0 && (
                <div className="no-products">
                  <p>Kritik stokta ürün yok.</p>
                </div>
              )}
            </>
          ) : !selectedMainCategory && !selectedSubCategory && !searchTerm ? (
            <div className="stok-ozet-bilgi">
              <h2>Stok Özeti</h2>
              <p>
                Stoğunuzda <b>{getStokOzet().toplam}</b> farklı ürün var.
                Bunlardan <b>{getStokOzet().kritik}</b> tanesi kritik stok
                seviyesinde.
              </p>
              <p>
                Stoklarınızı güncel tutmak için kritik stoktaki ürünlerinizi
                gözden geçirin.
              </p>
            </div>
          ) : searchTerm ? (
            <>
              <div className="section-header">
                <h2>Arama Sonuçları</h2>
                <span className="product-count">
                  {getAllMatchingProducts().length} ürün bulundu
                </span>
              </div>
              <div className="products-grid">
                {getAllMatchingProducts().map((product) => (
                  <div
                    key={product.id + product.anaKategori + product.altKategori}
                    className={`product-card${
                      product.stokSayisi <= product.minimumStok
                        ? " low-stock"
                        : ""
                    }`}
                  >
                    <div className="product-image">
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.marka}
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.marka}</h3>
                      <div className="product-details">
                        <div className="detail-row">
                          <span className="label">Ana Kategori:</span>
                          <span className="value">{product.anaKategori}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Alt Kategori:</span>
                          <span className="value">{product.altKategori}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Birim:</span>
                          <span className="value">{product.birim}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Alış Fiyatı:</span>
                          <span className="value">
                            {product.alisFiyati.toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Satış Fiyatı:</span>
                          <span className="value">
                            {product.satisFiyati.toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Stok Sayısı:</span>
                          <span
                            className={`value${
                              product.stokSayisi <= product.minimumStok
                                ? " low-stock-text"
                                : ""
                            }`}
                          >
                            {product.stokSayisi}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Minimum Stok:</span>
                          <span className="value">{product.minimumStok}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {getAllMatchingProducts().length === 0 && (
                <div className="no-products">
                  <p>Arama kriterlerinize uygun ürün bulunamadı.</p>
                </div>
              )}
            </>
          ) : selectedMainCategory && (showAll || !selectedSubCategory) ? (
            <>
              <div className="section-header">
                <h2>{selectedMainCategory} - Tüm Alt Kategoriler</h2>
                <span className="product-count">
                  {getFilteredProducts().length} ürün bulundu
                </span>
              </div>
              {renderGroupedProducts()}
            </>
          ) : selectedMainCategory && selectedSubCategory ? (
            <>
              <div className="section-header">
                <h2>
                  {selectedMainCategory} - {selectedSubCategory}
                </h2>
                <span className="product-count">
                  {getFilteredProducts().length} ürün bulundu
                </span>
              </div>
              <div className="products-grid">
                {getFilteredProducts().map(renderProductCard)}
              </div>
              {getFilteredProducts().length === 0 && (
                <div className="no-products">
                  <p>Arama kriterlerinize uygun ürün bulunamadı.</p>
                </div>
              )}
            </>
          ) : (
            <div className="select-category">
              <p>Lütfen bir kategori seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockManagement;
