import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // login / register
  const [mode, setMode] = useState("login");

  // ==============================
  // LOGIN
  // ==============================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ==============================
  // REGISTER
  // ==============================

  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ==============================
  // UI
  // ==============================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==============================
  // LOGIN
  // ==============================

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError(
        "Veuillez saisir votre email et votre mot de passe."
      );
      return;
    }

    setLoading(true);

    try {
      await login(cleanEmail, password);

      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur login :", err);

      setError(
        err?.message ||
          "Email ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // REGISTER INPUT
  // ==============================

  function handleRegisterChange(event) {
    const { name, value } = event.target;

    setRegisterData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ==============================
  // REGISTER
  // ==============================

  async function handleRegister(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const username =
      registerData.username.trim();

    const registerEmail =
      registerData.email.trim();

    const firstName =
      registerData.first_name.trim();

    const lastName =
      registerData.last_name.trim();

    if (
      !username ||
      !registerEmail ||
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

    if (
      registerData.password.length < 8
    ) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setLoading(true);

    try {
      await userService.create({
        username: username,
        email: registerEmail,
        password: registerData.password,
        first_name: firstName,
        last_name: lastName,
        role: "Utilisateur",
      });

      // Registration succeeded
      setSuccess(
        "Compte créé avec succès ! Vous pouvez maintenant vous connecter."
      );

      // Automatically put the email in login form
      setEmail(registerEmail);

      // Reset registration form
      setRegisterData({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Switch to login after a short delay
      setTimeout(() => {
        setMode("login");
        setSuccess("");
        setPassword("");
      }, 1500);
    } catch (err) {
      console.error(
        "Erreur création compte :",
        err
      );

      let message =
        "Impossible de créer le compte.";

      if (err?.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // SWITCH TO REGISTER
  // ==============================

  function openRegister() {
    setMode("register");
    setError("");
    setSuccess("");
    setPassword("");
  }

  // ==============================
  // SWITCH TO LOGIN
  // ==============================

  function openLogin() {
    setMode("login");
    setError("");
    setSuccess("");
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* ================================= */}
        {/* LOGO */}
        {/* ================================= */}

        <div className="login-logo">
          <div className="logo-icon">
            <i className="bi bi-archive"></i>
          </div>

          <div>
            <strong>DocVault</strong>

            <span>
              Gestion des documents
            </span>
          </div>
        </div>

        {/* ================================= */}
        {/* TITLE */}
        {/* ================================= */}

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
                Créez votre compte DocVault
                pour accéder à votre espace.
              </p>
            </>
          )}
        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* SUCCESS */}
        {/* ================================= */}

        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </div>
        )}

        {/* ================================= */}
        {/* LOGIN FORM */}
        {/* ================================= */}

        {mode === "login" && (
          <form onSubmit={handleLogin}>

            <div className="form-group mb-3">
              <label htmlFor="loginEmail">
                Email
              </label>

              <input
                id="loginEmail"
                name="email"
                type="email"
                className="form-control"
                placeholder="exemple@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="loginPassword">
                Mot de passe
              </label>

              <input
                id="loginPassword"
                name="password"
                type="password"
                className="form-control"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>

                  Connexion...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Se connecter
                </>
              )}
            </button>

          </form>
        )}

        {/* ================================= */}
        {/* REGISTER FORM */}
        {/* ================================= */}

        {mode === "register" && (
          <form onSubmit={handleRegister}>

            {/* First / Last name */}

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
                  placeholder="Prénom"
                  value={
                    registerData.first_name
                  }
                  onChange={
                    handleRegisterChange
                  }
                  autoComplete="given-name"
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
                  placeholder="Nom"
                  value={
                    registerData.last_name
                  }
                  onChange={
                    handleRegisterChange
                  }
                  autoComplete="family-name"
                />
              </div>

            </div>

            {/* Username */}

            <div className="form-group mb-3">
              <label htmlFor="registerUsername">
                Nom d'utilisateur
              </label>

              <input
                id="registerUsername"
                name="username"
                type="text"
                className="form-control"
                placeholder="Nom d'utilisateur"
                value={
                  registerData.username
                }
                onChange={
                  handleRegisterChange
                }
                autoComplete="username"
                required
              />
            </div>

            {/* Email */}

            <div className="form-group mb-3">
              <label htmlFor="registerEmail">
                Email
              </label>

              <input
                id="registerEmail"
                name="email"
                type="email"
                className="form-control"
                placeholder="exemple@email.com"
                value={
                  registerData.email
                }
                onChange={
                  handleRegisterChange
                }
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}

            <div className="form-group mb-3">
              <label htmlFor="registerPassword">
                Mot de passe
              </label>

              <input
                id="registerPassword"
                name="password"
                type="password"
                className="form-control"
                placeholder="Minimum 8 caractères"
                value={
                  registerData.password
                }
                onChange={
                  handleRegisterChange
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {/* Confirm password */}

            <div className="form-group mb-3">
              <label htmlFor="confirmPassword">
                Confirmer le mot de passe
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Retapez votre mot de passe"
                value={
                  registerData.confirmPassword
                }
                onChange={
                  handleRegisterChange
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {/* Register button */}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>

                  Création...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Créer mon compte
                </>
              )}
            </button>

          </form>
        )}

        {/* ================================= */}
        {/* SWITCH LOGIN / REGISTER */}
        {/* ================================= */}

        <div className="login-switch">

          {mode === "login" ? (
            <>
              <span>
                Vous n'avez pas encore de compte ?
              </span>

              <button
                type="button"
                className="btn btn-link p-0"
                onClick={openRegister}
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
                onClick={openLogin}
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