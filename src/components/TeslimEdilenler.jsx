import { useState, useRef, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

function TeslimEdilenler() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addFiles, setAddFiles] = useState([]);
  const fileInputRef = useRef();

  // Loading ve error state'leri
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Backend'den teslim edilen işleri çek
  useEffect(() => {
    const fetchDeliveredWorks = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/DeliveredWorks`);
        if (!response.ok) {
          throw new Error(
            `Teslim edilen işler alınamadı! Status: ${response.status}`
          );
        }
        const data = await response.json();
        if (!data.$values) {
          throw new Error("Beklenen formatta veri gelmedi! (data.$values yok)");
        }
        setProjects(data.$values);
      } catch (err) {
        setError("Teslim edilen işler çekme hatası: " + (err.message || err));
        console.error("Teslim edilen işler çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveredWorks();
  }, []);

  // Detay modalı aç
  const openModal = (projectIdx) => {
    setModalProject({ ...projects[projectIdx], idx: projectIdx });
    setCurrentImageIndex(0); // Modal açıldığında ilk resmi göster
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalProject(null);
  };

  // Ekle modalı
  const openAddModal = () => {
    setAddModalOpen(true);
    setAddTitle("");
    setAddDesc("");
    setAddFiles([]);
  };
  const closeAddModal = () => {
    setAddModalOpen(false);
  };
  const handleFileChange = (e) => {
    setAddFiles(Array.from(e.target.files));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submit edildi");
    console.log("addTitle:", addTitle);
    console.log("addDesc:", addDesc);
    console.log("addFiles:", addFiles);

    if (!addTitle || !addDesc || addFiles.length === 0) {
      alert("Lütfen tüm alanları doldurun ve en az bir fotoğraf seçin!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Title", addTitle);
      formData.append("Description", addDesc);

      // Çoklu fotoğraf ekleme
      addFiles.forEach((file, index) => {
        formData.append("Images", file);
        console.log(`Fotoğraf ${index + 1}:`, file.name);
      });

      console.log("FormData içeriği:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log(
        "API isteği gönderiliyor:",
        `${API_BASE_URL}/api/DeliveredWorks`
      );

      const response = await fetch(`${API_BASE_URL}/api/DeliveredWorks`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error(
          `Teslim edilen iş eklenemedi! Status: ${response.status}`
        );
      }

      console.log("Başarılı! Veriler yeniden çekiliyor...");

      // Teslim edilen işleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/DeliveredWorks`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setProjects(data.$values);
        }
      }

      closeAddModal();
    } catch (err) {
      console.error("Hata:", err);
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // Sil
  const handleDelete = async () => {
    if (!modalProject) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/DeliveredWorks/${modalProject.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Teslim edilen iş silinemedi!");
      }

      // Teslim edilen işleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/DeliveredWorks`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setProjects(data.$values);
        }
      }

      closeModal();
    } catch (err) {
      alert(err.message || "Bir hata oluştu!");
    }
  };

  // Güncelleme
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFiles, setEditFiles] = useState([]);

  // Resim slider için state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleEditStart = () => {
    setEditTitle(modalProject.title);
    setEditDesc(modalProject.description);
    setEditFiles([]);
    setEditMode(true);
  };

  const handleEditSave = async () => {
    try {
      const formData = new FormData();
      formData.append("Title", editTitle);
      formData.append("Description", editDesc);

      if (editFiles.length > 0) {
        formData.append("Image", editFiles[0]);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/DeliveredWorks/${modalProject.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Teslim edilen iş güncellenemedi!");
      }

      // Teslim edilen işleri yeniden çek
      const res = await fetch(`${API_BASE_URL}/api/DeliveredWorks`);
      if (res.ok) {
        const data = await res.json();
        if (data.$values) {
          setProjects(data.$values);
          const updatedProject = data.$values.find(
            (p) => p.id === modalProject.id
          );
          if (updatedProject) {
            setModalProject(updatedProject);
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
        <div className="content-title">Teslim Edilen İşler</div>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            className="add-btn"
            onClick={openAddModal}
            title="Yeni proje ekle"
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
            <p>Teslim edilen işler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>Hata: {error}</p>
            <button onClick={() => window.location.reload()}>Yenile</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="no-projects">
            <p>Henüz teslim edilen iş bulunmuyor.</p>
          </div>
        ) : (
          projects.map((project, i) => (
            <div
              className="project-card"
              key={project.id}
              onClick={() => openModal(i)}
            >
              <div
                className="project-slider"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  className="project-img"
                  src={
                    project.images?.$values?.[0]?.url ||
                    "https://cdn.pixabay.com/photo/2016/02/19/16/29/construction-1210677_640.jpg"
                  }
                  alt={project.title}
                />
              </div>
              <div className="project-info">
                <div className="project-title">{project.title}</div>
                <div className="project-desc">{project.description}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && modalProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            style={{ maxWidth: 600, minWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-slider">
              {modalProject.images?.$values &&
              modalProject.images.$values.length > 0 ? (
                <div className="image-gallery" style={{ position: "relative" }}>
                  {modalProject.images.$values.map((image, index) => (
                    <img
                      key={image.id}
                      className="modal-img"
                      src={image.url}
                      alt={`${modalProject.title} - Resim ${index + 1}`}
                      style={{
                        display: index === currentImageIndex ? "block" : "none",
                      }}
                    />
                  ))}
                  {modalProject.images.$values.length > 1 && (
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
                              ? modalProject.images.$values.length - 1
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
                        {modalProject.images.$values.map((_, index) => (
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
                        ))}
                      </div>
                      <button
                        className="nav-btn next"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === modalProject.images.$values.length - 1
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
                  src="https://cdn.pixabay.com/photo/2016/02/19/16/29/construction-1210677_640.jpg"
                  alt={modalProject.title}
                />
              )}
            </div>
            <div className="modal-info">
              {!editMode ? (
                <>
                  <div className="modal-title">{modalProject.title}</div>
                  <div className="modal-desc">{modalProject.description}</div>
                  <div
                    className="modal-actions"
                    style={{ marginTop: 18, gap: 16, justifyContent: "center" }}
                  >
                    <button
                      className="modal-btn delete big"
                      onClick={handleDelete}
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

      {addModalOpen && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal add-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAddModal}>
              ×
            </button>
            <form
              className="add-form"
              style={{ gap: 18 }}
              onSubmit={handleAddSubmit}
            >
              <div className="add-form-title">Yeni Proje Ekle</div>
              <input
                className="add-input"
                style={{ fontSize: 18 }}
                type="text"
                placeholder="Başlık"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                required
              />
              <textarea
                className="add-input"
                style={{ fontSize: 16, minHeight: 80 }}
                placeholder="Açıklama"
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                rows={3}
                required
              />
              <input
                className="add-file"
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="add-preview-list">
                {addFiles.map((file, idx) => (
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

export default TeslimEdilenler;
