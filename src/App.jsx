import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import AccessControl from './pages/AccessControl'; // File: AccessControl.jsx
import AgentOrchestrator from './pages/AgentOrchestrator';
import AgentTools from './pages/AgentTools';
import NeuralLogs from './pages/NeuralLogs';
import Login from './pages/Login';

const ProtectedLayout = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden relative">
        <div className="fixed inset-0 pointer-events-none opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 blur-[120px] rounded-full" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><UserManagement /></ProtectedLayout>} />
        
        {/* Mapping the path to your specific file */}
        <Route path="/access" element={<ProtectedLayout><AccessControl /></ProtectedLayout>} />
        
        <Route path="/agents" element={<ProtectedLayout><AgentOrchestrator /></ProtectedLayout>} />
        <Route path="/tools" element={<ProtectedLayout><AgentTools /></ProtectedLayout>} />
        <Route path="/logs" element={<ProtectedLayout><NeuralLogs /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;