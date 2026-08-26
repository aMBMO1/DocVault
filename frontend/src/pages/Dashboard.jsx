import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import { categoryService } from "../services/categoryService";
import { documentService } from "../services/documentService";

export default function Dashboard() {
  const { user } = useAuth();

  const [cats, setCats] = useState([]);
  const [docs, setDocs] = useState([]);

  const [storage, setStorage] = useState({
    used_gb: 0,
    total_gb: 100,
    percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [categories, recentDocs, storageInfo] =
          await Promise.all([
            categoryService.getAll(),
            documentService.getRecent(5),
            storageService.getInfo(),
          ]);

        setCats(
          Array.isArray(categories)
            ? categories
            : []
        );

        setDocs(
          Array.isArray(recentDocs)
            ? recentDocs
            : []
        );

        setStorage({
          used_gb: Number(
            storageInfo?.used_gb ?? 0
          ),
          total_gb: Number(
            storageInfo?.total_gb ?? 100
          ),
          percentage: Number(
            storageInfo?.percentage ?? 0
          ),
        });
      } catch (e) {
        console.error(
          "Erreur Dashboard:",
          e
        );

        setError(
          e?.message ||
            "Impossible de charger le tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalDocuments = cats.reduce(
    (sum, category) =>
      sum +
      Number(
        category.count ??
          category.documentCount ??
          0
      ),
    0
  );

  const displayName =
    user?.first_name ||
    user?.name ||
    user?.nom ||
    user?.username ||
    "Utilisateur";

  return (
    <div>
      {/* =============================== */}
      {/* PAGE HEADER */}
      {/* =============================== */}

      <div className="page-header">
        <div>
          <h1>
            Bonjour, {displayName} 👋
          </h1>

          <p>
            Voici un aperçu de votre espace
            documentaire.
          </p>
        </div>
      </div>

      {/* =============================== */}
      {/* ERROR */}
      {/* =============================== */}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {/* =============================== */}
      {/* STATISTICS */}
      {/* =============================== */}

      <div className="stats-grid">
        {/* Categories */}
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-folder"></i>
          </div>

          <div>
            <span>Catégories</span>

            <strong>
              {loading
                ? "—"
                : cats.length}
            </strong>
          </div>
        </div>

        {/* Documents */}
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-file-earmark-text"></i>
          </div>

          <div>
            <span>Documents</span>

            <strong>
              {loading
                ? "—"
                : totalDocuments}
            </strong>
          </div>
        </div>

        {/* Storage */}
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-hdd"></i>
          </div>

          <div>
            <span>Stockage utilisé</span>

            <strong>
              {loading
                ? "—"
                : `${formatStorage(
                    storage.used_gb
                  )} Go`}
            </strong>

            <small className="text-muted">
              sur {storage.total_gb} Go disponibles
            </small>
          </div>
        </div>
      </div>

      {/* =============================== */}
      {/* DASHBOARD GRID */}
      {/* =============================== */}

      <div className="dashboard-grid">
        {/* ============================= */}
        {/* RECENT DOCUMENTS */}
        {/* ============================= */}

        <section className="panel">
          <div className="panel-head">
            <h2>Documents récents</h2>

            <Link to="/documents">
              Voir tout →
            </Link>
          </div>

          {loading ? (
            <div>
              Chargement…
            </div>
          ) : docs.length === 0 ? (
            <div className="empty-state">
              Aucun document récent.
            </div>
          ) : (
            docs.map((document) => (
              <div
                className="recent-row"
                key={document.id}
              >
                {/* File icon */}
                <div className="file-icon">
                  {getFileLabel(
                    document.type
                  )}
                </div>

                {/* Document information */}
                <div>
                  <strong>
                    {document.name ||
                      document.nom ||
                      "Document"}
                  </strong>

                  <span>
                    {document.categoryName ||
                      document.category_name ||
                      document.categorySlug ||
                      "Sans catégorie"}

                    {" · "}

                    {document.date ||
                      document.date_creation ||
                      "—"}
                  </span>
                </div>

                {/* File size */}
                <small>
                  {document.size ||
                    formatFileSize(
                      document.taille
                    )}
                </small>
              </div>
            ))
          )}
        </section>

        {/* ============================= */}
        {/* CATEGORY DISTRIBUTION */}
        {/* ============================= */}

        <section className="panel">
          <div className="panel-head">
            <h2>
              Répartition par catégorie
            </h2>
          </div>

          {loading ? (
            <div>
              Chargement…
            </div>
          ) : cats.length === 0 ? (
            <div className="empty-state">
              Aucune catégorie.
            </div>
          ) : (
            cats.map((category) => (
              <Link
                to={`/documents/${category.slug}`}
                className="category-row"
                key={category.id}
              >
                <span>
                  {category.name ||
                    category.nom}
                </span>

                <strong>
                  {category.count ??
                    category.documentCount ??
                    0}
                </strong>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

/* ========================================= */
/* STORAGE FORMAT */
/* ========================================= */

function formatStorage(value) {
  const number = Number(value || 0);

  if (number === 0) {
    return "0";
  }

  if (number < 0.01) {
    return number
      .toFixed(3)
      .replace(".", ",");
  }

  if (number < 1) {
    return number
      .toFixed(2)
      .replace(".", ",");
  }

  return number
    .toFixed(1)
    .replace(".", ",");
}

/* ========================================= */
/* FILE SIZE FORMAT */
/* ========================================= */

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (!size) {
    return "0 KB";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    size /
    (1024 * 1024 * 1024)
  ).toFixed(2)} GB`;
}

/* ========================================= */
/* FILE TYPE LABEL */
/* ========================================= */

function getFileLabel(type) {
  if (!type) {
    return "FILE";
  }

  const value = type
    .toString()
    .split("/")
    .pop()
    .toUpperCase();

  if (value === "PDF") {
    return "PDF";
  }

  if (
    value.includes("WORD") ||
    value === "DOC" ||
    value === "DOCX"
  ) {
    return "DOC";
  }

  if (
    value.includes("EXCEL") ||
    value === "XLS" ||
    value === "XLSX"
  ) {
    return "XLS";
  }

  if (
    value === "JPEG" ||
    value === "JPG" ||
    value === "PNG"
  ) {
    return "IMG";
  }

  return value.slice(0, 4) || "FILE";
}