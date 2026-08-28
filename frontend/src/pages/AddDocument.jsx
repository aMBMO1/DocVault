import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  categoryService,
} from "../services/categoryService";

import {
  documentService,
} from "../services/documentService";

export default function AddDocument() {
  const [categories, setCategories] =
    useState([]);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [categoryId, setCategoryId] =
    useState("");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const navigate =
    useNavigate();

  const [params] =
    useSearchParams();

  // =========================================
  // LOAD CATEGORIES
  // =========================================

  useEffect(() => {
    async function loadCategories() {
      try {
        const data =
          await categoryService.getAll();

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );

        const wanted =
          params.get("category");

        const found =
          data.find(
            (category) =>
              category.slug === wanted
          );

        if (found) {
          setCategoryId(
            String(found.id)
          );
        } else if (data[0]) {
          setCategoryId(
            String(data[0].id)
          );
        }
      } catch (err) {
        console.error(
          "Erreur chargement catégories:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Impossible de charger les catégories."
        );
      }
    }

    loadCategories();
  }, [params]);

  // =========================================
  // FILE CHANGE
  // =========================================

  function handleFileChange(e) {
    const selectedFile =
      e.target.files?.[0];

    setFile(
      selectedFile || null
    );

    if (
      selectedFile &&
      !name.trim()
    ) {
      setName(
        selectedFile.name
      );
    }
  }

  // =========================================
  // SUBMIT
  // =========================================

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!file) {
      setError(
        "Veuillez choisir un fichier."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Veuillez choisir une catégorie."
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Veuillez saisir le nom du document."
      );
      return;
    }

    setSaving(true);

    try {
      const doc =
        await documentService.create({
          name: name.trim(),
          description:
            description.trim(),
          file,
          categoryId,
        });

      console.log(
        "Document créé :",
        doc
      );

      const categorySlug =
        doc?.categorySlug ||
        categories.find(
          (category) =>
            String(category.id) ===
            String(categoryId)
        )?.slug;

      if (categorySlug) {
        navigate(
          `/documents/${categorySlug}`
        );
      } else {
        navigate("/documents");
      }
    } catch (err) {
      console.error(
        "Erreur upload document:",
        err
      );

      const backendMessage =
        err?.response?.data?.detail;

      if (backendMessage) {
        setError(backendMessage);
      } else if (
        err?.response?.status === 401
      ) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (
        err?.response?.status === 413
      ) {
        setError(
          "Le fichier est trop volumineux."
        );
      } else if (
        err?.response?.status === 415
      ) {
        setError(
          "Format d'envoi incorrect. Veuillez réessayer."
        );
      } else {
        setError(
          err?.message ||
            "Impossible d'ajouter le document."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>
            Ajouter un document
          </h1>

          <p>
            Ajoutez un fichier à votre
            Drive.
          </p>
        </div>
      </div>

      <div className="form-card">

        <form onSubmit={submit}>

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

          {/* CATEGORY */}

          <div className="form-group mb-3">
            <label htmlFor="category">
              Catégorie
            </label>

            <select
              id="category"
              className="form-control"
              value={categoryId}
              onChange={(e) =>
                setCategoryId(
                  e.target.value
                )
              }
              disabled={saving}
              required
            >
              <option value="">
                Choisir une catégorie
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* FILE */}

          <div className="form-group mb-3">
            <label htmlFor="documentFile">
              Fichier
            </label>

            <input
              id="documentFile"
              type="file"
              className="form-control"
              onChange={
                handleFileChange
              }
              disabled={saving}
              required
            />
          </div>

          {/* DOCUMENT NAME */}

          <div className="form-group mb-3">
            <label htmlFor="documentName">
              Nom du document
            </label>

            <input
              id="documentName"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              disabled={saving}
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div className="form-group mb-3">
            <label htmlFor="documentDescription">
              Description
            </label>

            <textarea
              id="documentDescription"
              className="form-control"
              rows="5"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              disabled={saving}
              placeholder="Description du document..."
            />
          </div>

          {/* ACTIONS */}

          <div className="form-actions">

            <button
              type="button"
              className="btn btn-light"
              onClick={() =>
                navigate(-1)
              }
              disabled={saving}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>

                  Téléversement...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-2"></i>
                  Ajouter le document
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}