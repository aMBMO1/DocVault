import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { categoryService } from "../services/categoryService";
import { storageService } from "../services/storageService";

import RenameModal from "./RenameModal";
import ConfirmModal from "./ConfirmModal";

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const location = useLocation();

  const [open, setOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [storage, setStorage] = useState({
    used_gb: 0,
    total_gb: 100,
    percentage: 0,
  });

  // Category currently being renamed
  const [renamingCategory, setRenamingCategory] = useState(null);

  // Category currently being deleted
  const [deletingCategory, setDeletingCategory] = useState(null);

  // --------------------------------------------------
  // LOAD CATEGORIES
  // --------------------------------------------------

  async function loadCategories() {
    setLoadingCategories(true);

    try {
      const data = await categoryService.getAll();

      setCategories(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement catégories :",
        error
      );

      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }

  // --------------------------------------------------
  // LOAD STORAGE
  // --------------------------------------------------

  async function loadStorage() {
    try {
      const data = await storageService.getInfo();

      setStorage({
        used_gb: Number(data?.used_gb ?? 0),
        total_gb: Number(data?.total_gb ?? 100),
        percentage: Number(data?.percentage ?? 0),
      });
    } catch (error) {
      console.error(
        "Erreur chargement stockage :",
        error
      );
    }
  }

  useEffect(() => {
  loadCategories();
}, [location.pathname]);

useEffect(() => {
  loadStorage();
}, []);

  // --------------------------------------------------
  // RENAME CATEGORY
  // --------------------------------------------------

  async function handleRenameCategory(newName) {
    if (!renamingCategory) {
      return;
    }

    try {
      const updated =
        await categoryService.rename(
          renamingCategory.id,
          newName
        );

      setCategories((current) =>
        current.map((category) =>
          category.id === renamingCategory.id
            ? {
                ...category,
                ...updated,

                // Support both backend names
                name:
                  updated?.name ||
                  updated?.nom ||
                  newName,

                nom:
                  updated?.nom ||
                  updated?.name ||
                  newName,
              }
            : category
        )
      );

      setRenamingCategory(null);
    } catch (error) {
      console.error(
        "Erreur renommage catégorie :",
        error
      );

      alert(
        error.message ||
          "Impossible de renommer la catégorie."
      );
    }
  }

  // --------------------------------------------------
  // DELETE CATEGORY
  // --------------------------------------------------

  async function handleDeleteCategory() {
    if (!deletingCategory) {
      return;
    }

    try {
      await categoryService.remove(
        deletingCategory.id
      );

      setCategories((current) =>
        current.filter(
          (category) =>
            category.id !== deletingCategory.id
        )
      );

      setDeletingCategory(null);
    } catch (error) {
      console.error(
        "Erreur suppression catégorie :",
        error
      );

      alert(
        error.message ||
          "Impossible de supprimer la catégorie."
      );
    }
  }

  return (
    <aside className="sidebar">
      {/* ------------------------------------------ */}
      {/* LOGO */}
      {/* ------------------------------------------ */}

      <div className="logo">
        <div className="logo-icon">
          <i className="bi bi-archive"></i>
        </div>

        <div>
          <strong>DocVault</strong>
          <span>Gestion des documents</span>
        </div>
      </div>

      {/* ------------------------------------------ */}
      {/* NAVIGATION */}
      {/* ------------------------------------------ */}

      <div className="sidebar-title">
        NAVIGATION
      </div>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `sidebar-link ${
            isActive ? "active" : ""
          }`
        }
      >
        <i className="bi bi-grid"></i>
        <span>Tableau de bord</span>
      </NavLink>

      {/* ------------------------------------------ */}
      {/* PERSONAL DRIVE */}
      {/* ------------------------------------------ */}

      <div className="drive-section">
        <button
          type="button"
          className="sidebar-link drive-link"
          onClick={() =>
            setOpen((value) => !value)
          }
        >
          <i className="bi bi-folder"></i>

          <span>Personal Drive</span>

          <i
            className={`bi ${
              open
                ? "bi-chevron-up"
                : "bi-chevron-down"
            } ms-auto`}
          ></i>
        </button>

        {open && (
          <div className="categories">
            {/* Loading */}
            {loadingCategories && (
              <div className="px-3 py-2 text-muted">
                Chargement...
              </div>
            )}

            {/* No categories */}
            {!loadingCategories &&
              categories.length === 0 && (
                <div className="px-3 py-2 text-muted">
                  Aucune catégorie
                </div>
              )}

            {/* Categories */}
            {!loadingCategories &&
              categories.map((category) => (
                <div
                  key={category.id}
                  className="category-item"
                >
                  <NavLink
                    to={`/documents/${category.slug}`}
                    className={({ isActive }) =>
                      `category-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <i className="bi bi-folder2"></i>

                    <span className="category-name">
                      {category.name ||
                        category.nom}
                    </span>
                  </NavLink>

                  {/* ACTIONS */}
                  <div className="category-actions">
                    <button
                      type="button"
                      className="category-action"
                      title="Renommer"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setRenamingCategory(
                          category
                        );
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      type="button"
                      className="category-action danger"
                      title="Supprimer"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setDeletingCategory(
                          category
                        );
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

            {/* Add category */}
            <Link
              to="/add-category"
              className="add-category"
            >
              <i className="bi bi-plus-circle"></i>

              <span>
                Ajouter catégorie
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* ------------------------------------------ */}
      {/* ALL DOCUMENTS */}
      {/* ------------------------------------------ */}

      <NavLink
        to="/documents"
        className={({ isActive }) =>
          `sidebar-link ${
            isActive ? "active" : ""
          }`
        }
      >
        <i className="bi bi-files"></i>

        <span>
          Tous les documents
        </span>
      </NavLink>

      {/* ------------------------------------------ */}
      {/* ADMINISTRATION */}
      {/* ------------------------------------------ */}

      {isAdmin && (
        <>
          <div className="sidebar-title">
            ADMINISTRATION
          </div>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className="bi bi-people"></i>

            <span>Utilisateurs</span>

            <span className="admin-badge">
              admin
            </span>
          </NavLink>
        </>
      )}

      {/* ------------------------------------------ */}
      {/* ACCOUNT */}
      {/* ------------------------------------------ */}

      <div className="sidebar-title">
        COMPTE
      </div>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `sidebar-link ${
            isActive ? "active" : ""
          }`
        }
      >
        <i className="bi bi-person"></i>

        <span>
          Mon profil
        </span>
      </NavLink>

      {/* ------------------------------------------ */}
      {/* STORAGE */}
      {/* ------------------------------------------ */}

      <div className="storage">
        <StorageRing
          used={storage.used_gb}
          total={storage.total_gb}
          percentage={storage.percentage}
        />

        <div>
          <strong>
            {formatStorage(
              storage.used_gb
            )}{" "}
            Go utilisés
          </strong>

          <small>
            sur {storage.total_gb} Go disponibles
          </small>
        </div>
      </div>

      {/* ------------------------------------------ */}
      {/* RENAME MODAL */}
      {/* ------------------------------------------ */}

      {renamingCategory && (
        <RenameModal
          title="Renommer la catégorie"
          label="Nom de la catégorie"
          initialValue={
            renamingCategory.name ||
            renamingCategory.nom
          }
          onCancel={() =>
            setRenamingCategory(null)
          }
          onConfirm={handleRenameCategory}
        />
      )}

      {/* ------------------------------------------ */}
      {/* DELETE MODAL */}
      {/* ------------------------------------------ */}

      {deletingCategory && (
        <ConfirmModal
          title="Supprimer la catégorie"
          message={`Voulez-vous vraiment supprimer la catégorie "${
            deletingCategory.name ||
            deletingCategory.nom
          }" ? Les documents associés pourront également être supprimés.`}
          confirmLabel="Supprimer"
          danger
          onCancel={() =>
            setDeletingCategory(null)
          }
          onConfirm={handleDeleteCategory}
        />
      )}
    </aside>
  );
}

/* ================================================== */
/* STORAGE RING */
/* ================================================== */

function StorageRing({
  used,
  total,
  percentage,
  size = 34,
}) {
  const radius =
    (size - 4) / 2;

  const circumference =
    2 * Math.PI * radius;

  const calculatedPercentage =
    total > 0
      ? Math.min(
          (used / total) * 100,
          100
        )
      : 0;

  const progress =
    percentage > 0
      ? Math.min(
          percentage / 100,
          1
        )
      : Math.min(
          calculatedPercentage / 100,
          1
        );

  const offset =
    circumference *
    (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      className="storage-ring"
      style={{
        flexShrink: 0,
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#dbeafe"
        strokeWidth="3"
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={
          circumference
        }
        strokeDashoffset={offset}
        transform={`rotate(-90 ${
          size / 2
        } ${size / 2})`}
      />
    </svg>
  );
}

/* ================================================== */
/* STORAGE FORMAT */
/* ================================================== */

function formatStorage(value) {
  const number = Number(
    value || 0
  );

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