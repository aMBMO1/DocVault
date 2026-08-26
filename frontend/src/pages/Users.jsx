import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";
import AddUserModal from "../components/AddUserModal";
import RenameModal from "../components/RenameModal";
import ConfirmModal from "../components/ConfirmModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await userService.getAll();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        setError("La réponse du serveur est invalide.");
      }
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      setError(err.message || "Impossible de charger les utilisateurs.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleAddUser(data) {
    try {
      await userService.create(data);
      setShowAdd(false);
      await loadUsers();
    } catch (err) {
      throw new Error(
        err.message || "Impossible de créer l'utilisateur."
      );
    }
  }

  async function handleRename(newName) {
    if (!selectedUser) return;

    try {
      const updated = await userService.rename(
        selectedUser.id,
        newName
      );

      setUsers((current) =>
        current.map((user) =>
          user.id === selectedUser.id
            ? { ...user, ...updated }
            : user
        )
      );

      setSelectedUser(null);
    } catch (err) {
      setError(err.message || "Impossible de renommer l'utilisateur.");
    }
  }

  async function handleStatus(user) {
    try {
      const updated = await userService.setStatus(
        user.id,
        !user.is_active
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, ...updated }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Impossible de modifier le statut.");
    }
  }

  async function handleDelete() {
    if (!deleteUser) return;

    try {
      await userService.remove(deleteUser.id);

      setUsers((current) =>
        current.filter((user) => user.id !== deleteUser.id)
      );

      setDeleteUser(null);
    } catch (err) {
      setError(err.message || "Impossible de supprimer l'utilisateur.");
    }
  }

  if (loading) {
    return (
      <div className="center-page">
        <div>
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          />
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Utilisateurs</h1>
          <p>Gérez les comptes de la plateforme.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
        >
          <i className="bi bi-person-plus me-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-3">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      <div className="panel">
        {users.length === 0 ? (
          <div className="empty-state">
            <i
              className="bi bi-people"
              style={{ fontSize: "40px" }}
            />
            <p className="mt-3">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar">
                          {user.initials ||
                            user.initiales ||
                            "U"}
                        </div>

                        <div>
                          <strong>
                            {user.name ||
                              user.nom ||
                              user.username}
                          </strong>

                          <small className="d-block text-muted">
                            @{user.username}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={
                          user.role === "admin"
                            ? "badge bg-danger"
                            : "badge bg-info"
                        }
                      >
                        {user.role === "admin"
                          ? "Administrateur"
                          : "Utilisateur"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`status-badge ${
                          user.is_active
                            ? "active"
                            : "inactive"
                        }`}
                        onClick={() => handleStatus(user)}
                      >
                        {user.is_active
                          ? "Actif"
                          : "Désactivé"}
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="mini-action"
                        title="Renommer"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                      >
                        <i className="bi bi-pencil" />
                      </button>

                      <button
                        type="button"
                        className="mini-action danger"
                        title="Supprimer"
                        onClick={() =>
                          setDeleteUser(user)
                        }
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddUserModal
          onCancel={() => setShowAdd(false)}
          onSubmit={handleAddUser}
        />
      )}

      {selectedUser && (
        <RenameModal
          title="Renommer l'utilisateur"
          label="Nouveau nom"
          initialValue={
            selectedUser.name ||
            selectedUser.nom ||
            selectedUser.username
          }
          onCancel={() => setSelectedUser(null)}
          onConfirm={handleRename}
        />
      )}

      {deleteUser && (
        <ConfirmModal
          title="Supprimer l'utilisateur"
          message={`Voulez-vous vraiment supprimer "${
            deleteUser.name ||
            deleteUser.nom ||
            deleteUser.username
          }" ?`}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}