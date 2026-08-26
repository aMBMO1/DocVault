import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/notificationService";
export default function Header(){
 const {user,logout}=useAuth(); const [menu,setMenu]=useState(false); const [notif,setNotif]=useState(false); const [notifications,setNotifications]=useState([]); const navigate=useNavigate();
 useEffect(()=>{notificationService.getAll().then(setNotifications)},[]);
 const unread=notifications.filter(n=>!n.read).length;
 async function mark(id){await notificationService.markAsRead(id);setNotifications(await notificationService.getAll())}
 async function markAll(){await notificationService.markAllAsRead();setNotifications(await notificationService.getAll())}
 return <header className="header"><div className="search-box"><i className="bi bi-search"/><input placeholder="Rechercher un document, une catégorie…"/></div><div className="header-right"><div className="relative"><button className="icon-btn" onClick={()=>setNotif(v=>!v)}><i className="bi bi-bell"/>{unread>0&&<span className="notif-dot"/>}</button>{notif&&<div className="dropdown notif-panel"><div className="notif-head"><strong>Notifications</strong>{unread>0&&<button onClick={markAll}>Tout lire</button>}</div>{notifications.map(n=><div key={n.id} className={`notif-item ${n.read?"":"unread"}`} onClick={()=>mark(n.id)}><i className={`bi ${n.icon}`}/><div><div>{n.message}</div><small>{n.time}</small></div></div>)}</div>}</div><div className="relative"><button className="user-chip" onClick={()=>setMenu(v=>!v)}><span className="avatar">{user?.initials||"U"}</span><span><strong>{user?.name||user?.username}</strong><small>{user?.role==="admin"?"Administrateur":"Utilisateur"}</small></span><i className="bi bi-chevron-down"/></button>{menu&&<div className="dropdown user-menu"><button onClick={()=>navigate("/profile")}><i className="bi bi-person"/> Mon profil</button><button className="danger" onClick={()=>{logout();navigate("/login")}}><i className="bi bi-box-arrow-right"/> Déconnexion</button></div>}</div></div></header>
}
