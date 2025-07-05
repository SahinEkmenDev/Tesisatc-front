import { useState, useRef, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

function Hizmetler() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalService, setServiceModalService] = useState(null);
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [addServiceTitle, setAddServiceTitle] = useState("");
  const [addServiceDesc, setAddServiceDesc] = useState("");
  const [addServiceFiles, setAddServiceFiles] = useState([]);
  const serviceFileInputRef = useRef();

  // Loading ve error state'leri
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resim slider için state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Backend'den hizmetleri çek
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/services`);
        if (!response.ok) {
          throw new Error(`Hizmetler alınamadı! Status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.$values) {
          throw new Error("Beklenen formatta veri gelmedi! (data.$values yok)");
        }
        setServices(data.$values);
      } catch (err) {
        setError("Hizmet çekme hatası: " + (err.message || err));
        console.error("Hizmet çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Hizmet detay modalı aç
  const openServiceModal = (serviceIdx) => {
    setServiceModalService({ ...services[serviceIdx], idx: serviceIdx });
    setCurrentImageIndex(0); // Modal açıldığında ilk resmi göster
    setServiceModalOpen(true);
  };
  const closeServiceModal = () => {
    setServiceModalOpen(false);
    setServiceModalService(null);
  };

  // Hizmet ekleme modalı
  const openAddServiceModal = () => {
    setAddServiceModalOpen(true);
    setAddServiceTitle("");
    setAddServiceDesc("");
    setAddServiceFiles([]);
  };
  const closeAddServiceModal = () => {
    setAddServiceModalOpen(false);
  };
  const handleServiceFileChange = (e) => {
    setAddServiceFiles(Array.from(e.target.files));
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    if (!addServiceTitle || !addServiceDesc || addServiceFiles.length === 0) {
      alert("Lütfen tüm alanları doldurun ve en az bir fotoğraf seçin!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Title", addServiceTitle);
      formData.append("Description", addServiceDesc);

      // Çoklu fotoğraf ekleme
      addServiceFiles.forEach((file, index) => {
        formData.append("Images", file);
      });

      const response = await fetch(`${API_BASE_URL}/api/services`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error(`Hizmet eklenemedi! Status: ${response.status}`);
      }

      // Hizmetleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/services`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setServices(data.$values);
        }
      }

      closeAddServiceModal();
    } catch (err) {
      console.error("Hata:", err);
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // Hizmet sil
  const handleServiceDelete = async () => {
    if (!serviceModalService) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/services/${serviceModalService.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Hizmet silinemedi!");
      }

      // Hizmetleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/services`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setServices(data.$values);
        }
      }

      closeServiceModal();
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // Hizmet güncelleme
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFiles, setEditFiles] = useState([]);

  const handleEditStart = () => {
    setEditTitle(serviceModalService.title);
    setEditDesc(serviceModalService.description);
    setEditFiles([]);
    setEditMode(true);
  };

  const handleEditSave = async () => {
    try {
      const formData = new FormData();
      formData.append("Title", editTitle);
      formData.append("Description", editDesc);

      if (editFiles.length > 0) {
        editFiles.forEach((file, index) => {
          formData.append("Images", file);
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/api/services/${serviceModalService.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Hizmet güncellenemedi!");
      }

      // Hizmetleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/services`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setServices(data.$values);
          const updatedService = data.$values.find(
            (s) => s.id === serviceModalService.id
          );
          if (updatedService) {
            setServiceModalService(updatedService);
          }
        }
      }

      setEditMode(false);
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  const handleEditFileChange = (e) => {
    setEditFiles(Array.from(e.target.files));
  };

  return (
    <div className="content-area full" style={{ minHeight: "100vh" }}>
      <div
        className="content-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="content-title">Hizmetler</div>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            className="add-btn"
            onClick={openAddServiceModal}
            title="Yeni hizmet ekle"
          >
            <span style={{ fontWeight: 700, fontSize: 22, marginRight: 6 }}>
              +
            </span>{" "}
            Ekle
          </button>
          <button
            className="modal-btn edit big"
            style={{ padding: "10px 28px" }}
            onClick={() => navigate("/dashboard")}
          >
            Anasayfa
          </button>
        </div>
      </div>

      <div className="content-body project-list">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Hizmetler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>Hata: {error}</p>
            <button onClick={() => window.location.reload()}>Yenile</button>
          </div>
        ) : services.length === 0 ? (
          <div className="no-services">
            <p>Henüz hizmet bulunmuyor.</p>
          </div>
        ) : (
          services.map((service, i) => (
            <div
              className="project-card"
              key={service.id}
              onClick={() => openServiceModal(i)}
            >
              <div
                className="project-slider"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  className="project-img"
                  src={
                    service.imageUrls?.$values?.[0] ||
                    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"
                  }
                  alt={service.title}
                />
              </div>
              <div className="project-info">
                <div className="project-title">{service.title}</div>
                <div className="project-desc">{service.description}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {serviceModalOpen && serviceModalService && (
        <div className="modal-overlay" onClick={closeServiceModal}>
          <div
            className="modal"
            style={{ maxWidth: 600, minWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeServiceModal}>
              ×
            </button>
            <div className="modal-slider">
              {serviceModalService.imageUrls?.$values &&
              serviceModalService.imageUrls.$values.length > 0 ? (
                <div className="image-gallery" style={{ position: "relative" }}>
                  {serviceModalService.imageUrls.$values.map(
                    (imageUrl, index) => (
                      <img
                        key={index}
                        className="modal-img"
                        src={imageUrl}
                        alt={`${serviceModalService.title} - Resim ${
                          index + 1
                        }`}
                        style={{
                          display:
                            index === currentImageIndex ? "block" : "none",
                        }}
                      />
                    )
                  )}
                  {serviceModalService.imageUrls.$values.length > 1 && (
                    <div
                      className="image-nav"
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        color: "white",
                      }}
                    >
                      <button
                        className="nav-btn prev"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === 0
                              ? serviceModalService.imageUrls.$values.length - 1
                              : prev - 1
                          );
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "white",
                          fontSize: "20px",
                          cursor: "pointer",
                          padding: "5px 10px",
                        }}
                      >
                        ‹
                      </button>
                      <div
                        className="image-dots"
                        style={{ display: "flex", gap: "6px" }}
                      >
                        {serviceModalService.imageUrls.$values.map(
                          (_, index) => (
                            <div
                              key={index}
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor:
                                  index === currentImageIndex
                                    ? "white"
                                    : "rgba(255,255,255,0.5)",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                              }}
                            />
                          )
                        )}
                      </div>
                      <button
                        className="nav-btn next"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev ===
                            serviceModalService.imageUrls.$values.length - 1
                              ? 0
                              : prev + 1
                          );
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "white",
                          fontSize: "20px",
                          cursor: "pointer",
                          padding: "5px 10px",
                        }}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <img
                  className="modal-img"
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"
                  alt={serviceModalService.title}
                />
              )}
            </div>
            <div className="modal-info">
              {!editMode ? (
                <>
                  <div className="modal-title">{serviceModalService.title}</div>
                  <div className="modal-desc">
                    {serviceModalService.description}
                  </div>
                  <div
                    className="modal-actions"
                    style={{ marginTop: 18, gap: 16, justifyContent: "center" }}
                  >
                    <button
                      className="modal-btn delete big"
                      onClick={handleServiceDelete}
                    >
                      <span>Sil</span>
                    </button>
                    <button
                      className="modal-btn edit big"
                      onClick={handleEditStart}
                    >
                      <span>Düzenle</span>
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ width: "100%" }}>
                  <input
                    className="add-input"
                    style={{
                      fontSize: 20,
                      padding: "18px 20px",
                      marginBottom: 16,
                      width: "100%",
                    }}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="add-input"
                    style={{
                      fontSize: 17,
                      minHeight: 100,
                      padding: "16px 20px",
                      marginBottom: 22,
                      width: "100%",
                    }}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                  />
                  <input
                    className="add-file"
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    style={{ marginBottom: 16 }}
                  />
                  {editFiles.length > 0 && (
                    <div className="add-preview-list">
                      {editFiles.map((file, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="add-preview-img"
                        />
                      ))}
                    </div>
                  )}
                  <div
                    className="modal-actions"
                    style={{ marginTop: 18, gap: 18, justifyContent: "center" }}
                  >
                    <button
                      className="modal-btn edit big"
                      onClick={() => setEditMode(false)}
                    >
                      <span>Vazgeç</span>
                    </button>
                    <button
                      className="modal-btn add big"
                      onClick={handleEditSave}
                    >
                      <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {addServiceModalOpen && (
        <div className="modal-overlay" onClick={closeAddServiceModal}>
          <div className="modal add-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAddServiceModal}>
              ×
            </button>
            <form
              className="add-form"
              style={{ gap: 18 }}
              onSubmit={handleAddServiceSubmit}
            >
              <div className="add-form-title">Yeni Hizmet Ekle</div>
              <input
                className="add-input"
                style={{ fontSize: 18 }}
                type="text"
                placeholder="Hizmet Adı"
                value={addServiceTitle}
                onChange={(e) => setAddServiceTitle(e.target.value)}
                required
              />
              <textarea
                className="add-input"
                style={{ fontSize: 16, minHeight: 80 }}
                placeholder="Hizmet Açıklaması"
                value={addServiceDesc}
                onChange={(e) => setAddServiceDesc(e.target.value)}
                rows={3}
                required
              />
              <input
                className="add-file"
                type="file"
                multiple
                accept="image/*"
                ref={serviceFileInputRef}
                onChange={handleServiceFileChange}
              />
              <div className="add-preview-list">
                {addServiceFiles.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="add-preview-img"
                  />
                ))}
              </div>
              <button className="modal-btn add big" type="submit">
                <span>Ekle</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hizmetler;
