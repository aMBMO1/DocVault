import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { categoryService } from "../services/categoryService";
import { documentService } from "../services/documentService";

import RenameModal from "../components/RenameModal";
import ConfirmModal from "../components/ConfirmModal";

export default function Documents() {
  const { category: slug } = useParams();

  const [cat, setCat] = useState(null);
  const [docs, setDocs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [rename, setRename] =
    useState(null);

  const [remove, setRemove] =
    useState(null);

  const [error, setError] =
    useState("");

  // =========================================
  // LOAD CATEGORY + DOCUMENTS
  // =========================================

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [
          categoryData,
          documentsData,
        ] = await Promise.all([
          categoryService.getBySlug(slug),
          documentService.getByCategory(slug),
        ]);

        setCat(categoryData);

        setDocs(
          Array.isArray(documentsData)
            ? documentsData
            : []
        );
      } catch (err) {
        console.error(
          "Erreur chargement catégorie :",
          err
        );

        const backendMessage =
          err?.response?.data?.detail;

        setError(
          backendMessage ||
            err?.message ||
            "Impossible de charger cette catégorie."
        );

        setCat(null);
        setDocs([]);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadData();
    }
  }, [slug]);

  // =========================================
  // RENAME DOCUMENT
  // =========================================

  async function doRename(name) {
    if (!rename) return;

    try {
      setError("");

      const updated =
        await documentService.rename(
          rename.id,
          name
        );

      setDocs((currentDocs) =>
        currentDocs.map((doc) =>
          doc.id === rename.id
            ? updated
            : doc
        )
      );

      setRename(null);
    } catch (err) {
      console.error(
        "Erreur renommage document :",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Impossible de renommer le document."
      );
    }
  }

  // =========================================
  // DELETE DOCUMENT
  // =========================================

  async function doDelete() {
    if (!remove) return;

    try {
      setError("");

      await documentService.remove(
        remove.id
      );

      setDocs((currentDocs) =>
        currentDocs.filter(
          (doc) => doc.id !== remove.id
        )
      );

      setRemove(null);
    } catch (err) {
      console.error(
        "Erreur suppression document :",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Impossible de supprimer le document."
      );
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="breadcrumb">
              Personal Drive
            </div>

            <h1>
              Chargement...
            </h1>

            <p>
              Chargement de la catégorie.
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="empty-state">
            Chargement des documents...
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <div className="breadcrumb">
            Personal Drive
            {" / "}
            {cat?.name || slug}
          </div>

          <h1>
            {cat?.name || slug}
          </h1>

          <p>
            {docs.length} document
            {docs.length !== 1
              ? "s"
              : ""}
          </p>

        </div>

        <Link
          className="btn btn-primary"
          to={`/add-document?category=${encodeURIComponent(
            slug
          )}`}
        >
          <i className="bi bi-upload me-2"></i>
          Ajouter un document
        </Link>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {/* DOCUMENTS */}

      <div className="panel">

        {docs.length === 0 ? (
          <div className="empty-state">

            <i
              className="bi bi-folder2-open"
              style={{
                fontSize: "2rem",
              }}
            ></i>

            <p>
              Aucun document dans cette
              catégorie.
            </p>

          </div>
        ) : (
          docs.map((doc) => (
            <div
              className="document-row"
              key={doc.id}
            >

              {/* FILE ICON */}

              <div className="file-icon">
                <i className="bi bi-file-earmark-pdf"></i>
              </div>

              {/* INFO */}

              <div className="document-main">

                <strong>
                  {doc.name}
                </strong>

                <span>
                  {doc.size || "0 o"}
                  {" · "}
                  {doc.date || ""}
                </span>

              </div>

              {/* VIEW */}

              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mini-action"
                  title="Ouvrir"
                >
                  <i className="bi bi-eye"></i>
                </a>
              )}

              {/* RENAME */}

              <button
                type="button"
                className="mini-action"
                onClick={() =>
                  setRename(doc)
                }
                title="Renommer"
              >
                <i className="bi bi-pencil"></i>
              </button>

              {/* DELETE */}

              <button
                type="button"
                className="mini-action danger"
                onClick={() =>
                  setRemove(doc)
                }
                title="Supprimer"
              >
                <i className="bi bi-trash"></i>
              </button>

            </div>
          ))
        )}

      </div>

      {/* RENAME MODAL */}

      {rename && (
        <RenameModal
          title="Renommer le document"
          label="Nom du document"
          initialValue={rename.name}
          onCancel={() =>
            setRename(null)
          }
          onConfirm={doRename}
        />
      )}

      {/* DELETE MODAL */}

      {remove && (
        <ConfirmModal
          title="Supprimer le document"
          message={`Voulez-vous vraiment supprimer « ${remove.name} » ?`}
          danger
          onCancel={() =>
            setRemove(null)
          }
          onConfirm={doDelete}
        />
      )}

    </div>
  );
}