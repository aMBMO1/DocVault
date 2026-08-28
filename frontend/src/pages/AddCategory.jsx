import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";

export default function AddCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanDescription =
      description.trim();

    if (!cleanName) {
      setError(
        "Le nom de la catégorie est obligatoire."
      );
      return;
    }

    if (cleanName.length > 100) {
      setError(
        "Le nom de la catégorie ne peut pas dépasser 100 caractères."
      );
      return;
    }

    setSaving(true);

    try {
      const created =
        await categoryService.create({
          name: cleanName,
          description: cleanDescription,
        });

      console.log(
        "Catégorie créée :",
        created
      );

      setSuccess(
        "Catégorie créée avec succès."
      );

      setName("");
      setDescription("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error(
        "Erreur création catégorie :",
        err
      );

      const backendMessage =
        err?.response?.data?.detail;

      if (backendMessage) {
        setError(backendMessage);
      } else if (err?.response?.status === 400) {
        setError(
          "Impossible de créer cette catégorie. Vérifiez que le nom n'existe pas déjà."
        );
      } else if (err?.response?.status === 401) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else {
        setError(
          err?.message ||
            "Impossible de créer la catégorie."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate("/dashboard");
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>
            Ajouter une catégorie
          </h1>

          <p>
            Créez une nouvelle catégorie
            dans votre Personal Drive.
          </p>
        </div>
      </div>

      <div className="card">

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

        {/* SUCCESS */}

        {success && (
          <div
            className="alert alert-success"
            role="alert"
          >
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* CATEGORY NAME */}

          <div className="form-group mb-3">
            <label htmlFor="categoryName">
              Nom de la catégorie
            </label>

            <input
              id="categoryName"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Ex : Comptabilité"
              maxLength={100}
              disabled={saving}
              autoFocus
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div className="form-group mb-3">
            <label htmlFor="categoryDescription">
              Description
            </label>

            <textarea
              id="categoryDescription"
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Description de la catégorie..."
              disabled={saving}
            />
          </div>

          {/* ACTIONS */}

          <div className="form-actions">

            <button
              type="button"
              className="btn btn-light"
              onClick={handleCancel}
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

                  Création...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Ajouter la catégorie
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}