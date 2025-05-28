import React, { useState, useEffect } from "react";
import { TenantPage } from "./pages/TenantPage";
import { DevicePage } from "./pages/DevicePage";
import { BillingPage } from "./pages/BillingPage";
import { AppBarHeader } from "./components/headers/AppBarHeader";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
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
  const { language, setLanguage } = useLanguage();
  
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <div style={{ marginRight: '20px' }}>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as '日本語' | 'English')}
            style={{ padding: '5px' }}
          >
            <option value="English">English</option>
            <option value="日本語">日本語</option>
          </select>
        </div>
      </div>
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

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
