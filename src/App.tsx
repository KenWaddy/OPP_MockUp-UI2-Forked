import React, { useState, useEffect } from "react";
import { TenantPage } from "./pages/TenantPage";
import { DevicePage } from "./pages/DevicePage";
import { BillingPage } from "./pages/BillingPage";
import { Header } from "./components/Header";
import "./App.css";

interface TenantNavigationEvent extends CustomEvent {
  detail: {
    tenant: any;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState("tenant");
  
  useEffect(() => {
    const handleTenantNavigation = (event: TenantNavigationEvent) => {
      setActiveTab("tenant");
      localStorage.setItem('selectedTenantId', event.detail.tenant.id);
    };
    
    window.addEventListener('navigate-to-tenant', handleTenantNavigation as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-tenant', handleTenantNavigation as EventListener);
    };
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case "device":
        return <DevicePage />;
      case "billing":
        return <BillingPage />;
      default:
        return <TenantPage />;
    }
  };

  return (
    <div className="app">
      <nav className="nav">
        <span
          className={activeTab === "tenant" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("tenant")}
          style={{ fontSize: '1.2em' }}
        >
          Tenant
        </span>
        <span
          className={activeTab === "device" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("device")}
          style={{ fontSize: '1.2em' }}
        >
          Device
        </span>
        <span
          className={activeTab === "billing" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("billing")}
          style={{ fontSize: '1.2em' }}
        >
          Billing
        </span>
      </nav>
      <div className="content">{renderPage()}</div>
    </div>
  );
}
