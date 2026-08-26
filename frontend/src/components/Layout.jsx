import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
export default function Layout({children}){return <div className="app"><Sidebar/><div className="main"><Header/><main className="content">{children}</main></div></div>}
