import { useState, useRef } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const initialServices = [
  {
    id: 1,
    title: "Teknik Danışmanlık",
    description:
      "Projeleriniz için uzman teknik danışmanlık hizmeti sunuyoruz. Deneyimli ekibimiz size en uygun çözümleri önerir. Profesyonel analiz ve önerilerle projelerinizi optimize ediyoruz.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Proje Yönetimi",
    description:
      "Büyük ölçekli projeleriniz için profesyonel proje yönetimi hizmeti. Zamanında ve bütçe dahilinde teslim. Proje sürecinin her aşamasını yakından takip ediyoruz.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Montaj Hizmeti",
    description:
      "Satın aldığınız ürünlerin profesyonel montajını yapıyoruz. Uzman ekibimizle güvenli ve kaliteli montaj. Montaj sonrası test ve kontrol hizmeti de sunuyoruz.",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
  },
];

function Hizmetler() {
  const navigate = useNavigate();
  const [services, setServices] = useState(initialServices);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalService, setServiceModalService] = useState(null);
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [addServiceTitle, setAddServiceTitle] = useState("");
  const [addServiceDesc, setAddServiceDesc] = useState("");
  const [addServiceFiles, setAddServiceFiles] = useState([]);
  const serviceFileInputRef = useRef();

  // Hizmet detay modalı aç
  const openServiceModal = (serviceIdx) => {
    setServiceModalService({ ...services[serviceIdx], idx: serviceIdx });
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
  const handleAddServiceSubmit = (e) => {
    e.preventDefault();
    if (!addServiceTitle || !addServiceDesc || addServiceFiles.length === 0)
      return;
    const newService = {
      id: Date.now(),
      title: addServiceTitle,
      description: addServiceDesc,
      image: URL.createObjectURL(addServiceFiles[0]),
    };
    setServices([newService, ...services]);
    closeAddServiceModal();
  };

  // Hizmet sil
  const handleServiceDelete = () => {
    if (!serviceModalService) return;
    setServices(services.filter((s) => s.id !== serviceModalService.id));
    closeServiceModal();
  };

  // Hizmet güncelleme (demo, sadece başlık ve açıklama)
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const handleEditStart = () => {
    setEditTitle(serviceModalService.title);
    setEditDesc(serviceModalService.description);
    setEditMode(true);
  };
  const handleEditSave = () => {
    setServices(
      services.map((s) =>
        s.id === serviceModalService.id
          ? { ...s, title: editTitle, description: editDesc }
          : s
      )
    );
    setServiceModalService({
      ...serviceModalService,
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
        {services.map((service, i) => (
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
                src={service.image}
                alt={service.title}
              />
            </div>
            <div className="project-info">
              <div className="project-title">{service.title}</div>
              <div className="project-desc">{service.description}</div>
            </div>
          </div>
        ))}
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
              <img
                className="modal-img"
                src={serviceModalService.image}
                alt={serviceModalService.title}
              />
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
