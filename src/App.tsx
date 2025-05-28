import React, { useState, useEffect } from "react";
import { TenantPage } from "./pages/TenantPage";
import { DevicePage } from "./pages/DevicePage";
import { BillingPage } from "./pages/BillingPage";
import { AppBarHeader } from "./components/headers/AppBarHeader";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import "./App.css";

interface TenantNavigationEvent extends CustomEvent {
  detail: {
    tenant: any;
  };
}

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tenant");
  const { t } = useTranslation();
  
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
          {t('common.tenant')}
        </span>
        <span
          className={activeTab === "device" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("device")}
          style={{ fontSize: '1.2em' }}
        >
          {t('common.device')}
        </span>
        <span
          className={activeTab === "billing" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("billing")}
          style={{ fontSize: '1.2em' }}
        >
          {t('common.billing')}
        </span>
      </nav>
      <div className="content">{renderPage()}</div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
