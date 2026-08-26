import React from "react";
import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PersonalDrive from "./pages/PersonalDrive";
import Documents from "./pages/Documents";
import AllDocuments from "./pages/AllDocuments";
import AddCategory from "./pages/AddCategory";
import AddDocument from "./pages/AddDocument";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
function PrivateLayout({children}){return <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>}
export default function App(){return <AuthProvider><BrowserRouter><Routes><Route path="/login" element={<Login/>}/><Route path="/dashboard" element={<PrivateLayout><Dashboard/></PrivateLayout>}/><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/drive" element={<PrivateLayout><PersonalDrive/></PrivateLayout>}/><Route path="/documents" element={<PrivateLayout><AllDocuments/></PrivateLayout>}/><Route path="/documents/:category" element={<PrivateLayout><Documents/></PrivateLayout>}/><Route path="/add-category" element={<PrivateLayout><AddCategory/></PrivateLayout>}/><Route path="/add-document" element={<PrivateLayout><AddDocument/></PrivateLayout>}/><Route path="/profile" element={<PrivateLayout><Profile/></PrivateLayout>}/><Route path="/users" element={<ProtectedRoute><AdminRoute><Layout><Users/></Layout></AdminRoute></ProtectedRoute>}/><Route path="*" element={<NotFound/>}/></Routes></BrowserRouter></AuthProvider>}
