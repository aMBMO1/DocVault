import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login");

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!username.trim() || !password) {
      setError(
        "Veuillez remplir tous les champs."
      );
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Nom d'utilisateur ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterChange(e) {
    const { name, value } = e.target;

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleRegister(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !registerData.username.trim() ||
      !registerData.email.trim() ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      setError(
        "Veuillez remplir tous les champs obligatoires."
      );
      return;
    }

    if (
      registerData.password !==
      registerData.confirmPassword
    ) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    if (registerData.password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setLoading(true);

    try {
      await userService.create({
        username:
          registerData.username.trim(),
        email:
          registerData.email.trim(),
        password:
          registerData.password,
        first_name:
          registerData.first_name.trim(),
        last_name:
          registerData.last_name.trim(),
        role: "Utilisateur",
      });

      setSuccess(
        "Compte créé avec succès. Vous pouvez maintenant vous connecter."
      );

      // Put username in login form
      setUsername(
        registerData.username.trim()
      );

      // Reset register form
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
      });

      // Go back to login
      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <i className="bi bi-archive"></i>
          </div>

          <div>
            <h2>DocVault</h2>
            <span>
              Gestion des documents
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="login-title">
          {mode === "login" ? (
            <>
              <h1>Connexion</h1>
              <p>
                Connectez-vous à votre espace
                documentaire.
              </p>
            </>
          ) : (
            <>
              <h1>Créer un compte</h1>
              <p>
                Créez votre espace documentaire.
              </p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </div>
        )}

        {/* ============================ */}
        {/* LOGIN FORM */}
        {/* ============================ */}

        {mode === "login" && (
          <form onSubmit={handleLogin}>

            <div className="form-group mb-3">
              <label htmlFor="username">
                Nom d'utilisateur
              </label>

              <input
                id="username"
                type="text"
                className="form-control"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Votre nom d'utilisateur"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password">
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? "Connexion..."
                : "Se connecter"}
            </button>
          </form>
        )}

        {/* ============================ */}
        {/* REGISTER FORM */}
        {/* ============================ */}

        {mode === "register" && (
          <form onSubmit={handleRegister}>

            <div className="row">

              <div className="col-md-6 mb-3">
                <label htmlFor="first_name">
                  Prénom
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="form-control"
                  value={
                    registerData.first_name
                  }
                  onChange={
                    handleRegisterChange
                  }
                  placeholder="Prénom"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="last_name">
                  Nom
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="form-control"
                  value={
                    registerData.last_name
                  }
                  onChange={
                    handleRegisterChange
                  }
                  placeholder="Nom"
                />
              </div>

            </div>

            <div className="form-group mb-3">
              <label htmlFor="registerUsername">
                Nom d'utilisateur
              </label>

              <input
                id="registerUsername"
                name="username"
                type="text"
                className="form-control"
                value={
                  registerData.username
                }
                onChange={
                  handleRegisterChange
                }
                placeholder="Nom d'utilisateur"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="registerEmail">
                Email
              </label>

              <input
                id="registerEmail"
                name="email"
                type="email"
                className="form-control"
                value={
                  registerData.email
                }
                onChange={
                  handleRegisterChange
                }
                placeholder="exemple@email.com"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="registerPassword">
                Mot de passe
              </label>

              <input
                id="registerPassword"
                name="password"
                type="password"
                className="form-control"
                value={
                  registerData.password
                }
                onChange={
                  handleRegisterChange
                }
                placeholder="Minimum 8 caractères"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="confirmPassword">
                Confirmer le mot de passe
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                value={
                  registerData.confirmPassword
                }
                onChange={
                  handleRegisterChange
                }
                placeholder="Retapez le mot de passe"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? "Création..."
                : "Créer mon compte"}
            </button>
          </form>
        )}

        {/* ============================ */}
        {/* SWITCH */}
        {/* ============================ */}

        <div className="login-switch">
          {mode === "login" ? (
            <>
              <span>
                Vous n'avez pas encore de compte ?
              </span>

              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              <span>
                Vous avez déjà un compte ?
              </span>

              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Se connecter
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}