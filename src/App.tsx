import React, { useState, useEffect } from "react";
import { TenantPage } from "./pages/TenantPage";
import { DevicePage } from "./pages/DevicePage";
import { BillingPage } from "./pages/BillingPage";
import { AppBarHeader } from "./components/headers/AppBarHeader";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { LanguageSelector } from "./components/language/LanguageSelector";
import { useTranslation } from "react-i18next";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { RefineThemes, ThemedLayoutV2 } from "@refinedev/mui";
import { ThemeProvider } from "@mui/material/styles";
import simpleRestDataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import routerBindings from "@refinedev/react-router";
import i18n from "./i18n";
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
        <div style={{ marginLeft: 'auto' }}>
          <LanguageSelector variant="outlined" size="small" />
        </div>
      </nav>
      <div className="content">{renderPage()}</div>
    </div>
  );
};

const App: React.FC = () => {
  const API_URL = "https://api.fake-rest.refine.dev";
  
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider theme={RefineThemes.Blue}>
          <Refine
            dataProvider={simpleRestDataProvider(API_URL)}
            routerProvider={routerBindings}
            i18nProvider={{
              translate: (key, params) => String(i18n.t(key, params)),
              changeLocale: (lang) => i18n.changeLanguage(lang),
              getLocale: () => i18n.language,
            }}
            resources={[
              {
                name: "tenants",
                list: "/",
              },
              {
                name: "devices",
                list: "/devices",
              },
              {
                name: "billing",
                list: "/billing",
              }
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <LanguageProvider>
              <Routes>
                <Route
                  element={
                    <ThemedLayoutV2 
                      Header={AppBarHeader}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route path="/" element={<AppContent />} />
                </Route>
              </Routes>
            </LanguageProvider>
          </Refine>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;
