import React, { useState } from "react";
import Modal from "./Modal";
export default function RenameModal({ title = "Renommer", label = "Nouveau nom", initialValue = "", onCancel, onConfirm }) {
  const [value, setValue] = useState(initialValue); const [saving, setSaving] = useState(false);
  async function submit(e) { e.preventDefault(); if (!value.trim()) return; setSaving(true); try { await onConfirm(value.trim()); } finally { setSaving(false); } }
  return <Modal title={title} onClose={onCancel}><form onSubmit={submit}><div className="form-group"><label>{label}</label><input className="form-control" autoFocus value={value} onChange={e => setValue(e.target.value)} /></div><div className="form-actions"><button type="button" className="btn btn-light" onClick={onCancel}>Annuler</button><button className="btn btn-primary" disabled={saving}>{saving ? "Enregistrement…" : "Renommer"}</button></div></form></Modal>;
}
