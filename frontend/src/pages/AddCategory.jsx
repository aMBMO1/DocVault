import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";

export default function AddCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Le nom de la catégorie est obligatoire.");
      return;
    }

    setSaving(true);

    try {
      const created = await categoryService.create({
        name: cleanName,
        description: description.trim(),
      });

      console.log("Catégorie créée :", created);

      // Retour vers le dashboard.
      // Sidebar se recharge grâce à useLocation().
      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Erreur création catégorie :",
        err
      );

      setError(
        err.message ||
          "Impossible de créer la catégorie."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Ajouter une catégorie</h1>

          <p>
            Créez une nouvelle catégorie dans votre
            Personal Drive.
          </p>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              required
              autoFocus
            />
          </div>

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
                setDescription(e.target.value)
              }
              placeholder="Description de la catégorie..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-light"
              onClick={() =>
                navigate("/dashboard")
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
              {saving
                ? "Création..."
                : "Ajouter la catégorie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}