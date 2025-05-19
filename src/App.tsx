import React, { useState } from "react";
import { TenantPage } from "./pages/TenantPage";
import { DevicePage } from "./pages/DevicePage";
import { BillingPage } from "./pages/BillingPage";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("tenant");

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
        >
          Tenant
        </span>
        <span
          className={activeTab === "device" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("device")}
        >
          Device
        </span>
        <span
          className={activeTab === "billing" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </span>
      </nav>
      <div className="content">{renderPage()}</div>
    </div>
  );
}
