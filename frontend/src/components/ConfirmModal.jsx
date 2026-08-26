import React, { useState } from "react";
import Modal from "./Modal";
export default function ConfirmModal({ title, message, confirmLabel = "Confirmer", danger = false, onCancel, onConfirm }) {
  const [loading, setLoading] = useState(false);
  async function confirm() { setLoading(true); try { await onConfirm(); } finally { setLoading(false); } }
  return <Modal title={title} onClose={onCancel}><p>{message}</p><div className="form-actions"><button className="btn btn-light" onClick={onCancel}>Annuler</button><button className={danger ? "btn btn-danger" : "btn btn-primary"} onClick={confirm} disabled={loading}>{loading ? "…" : confirmLabel}</button></div></Modal>;
}
