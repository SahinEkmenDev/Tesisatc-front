import { useState, useRef } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const initialProjects = [
  {
    id: 1,
    title: "Villa Projesi - İstanbul",
    description:
      "Modern villa inşaatı, 500m² alan, lüks iç mekan tasarımı ve bahçe düzenlemesi ile tamamlanan proje.",
    image:
      "https://cdn.pixabay.com/photo/2016/02/19/16/29/construction-1210677_640.jpg",
  },
  {
    id: 2,
    title: "Ofis Binası - Ankara",
    description:
      "15 katlı modern ofis binası, akıllı bina sistemleri ve sürdürülebilir enerji çözümleri ile donatıldı.",
    image:
      "https://cdn.pixabay.com/photo/2017/06/08/04/44/mason-2382518_640.jpg",
  },
];

function TeslimEdilenler() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(initialProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addFiles, setAddFiles] = useState([]);
  const fileInputRef = useRef();

  // Detay modalı aç
  const openModal = (projectIdx) => {
    setModalProject({ ...projects[projectIdx], idx: projectIdx });
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
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addTitle || !addDesc || addFiles.length === 0) return;
    const newProject = {
      id: Date.now(),
      title: addTitle,
      description: addDesc,
      image: URL.createObjectURL(addFiles[0]),
    };
    setProjects([newProject, ...projects]);
    closeAddModal();
  };

  // Sil
  const handleDelete = () => {
    if (!modalProject) return;
    setProjects(projects.filter((p) => p.id !== modalProject.id));
    closeModal();
  };

  // Güncelleme
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const handleEditStart = () => {
    setEditTitle(modalProject.title);
    setEditDesc(modalProject.description);
    setEditMode(true);
  };
  const handleEditSave = () => {
    setProjects(
      projects.map((p) =>
        p.id === modalProject.id
          ? { ...p, title: editTitle, description: editDesc }
          : p
      )
    );
    setModalProject({
      ...modalProject,
      title: editTitle,
      description: editDesc,
    });
    setEditMode(false);
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
        {projects.map((project, i) => (
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
                src={project.image}
                alt={project.title}
              />
            </div>
            <div className="project-info">
              <div className="project-title">{project.title}</div>
              <div className="project-desc">{project.description}</div>
            </div>
          </div>
        ))}
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
              <img
                className="modal-img"
                src={modalProject.image}
                alt={modalProject.title}
              />
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
