import React, { useState } from "react";
import "./TenantPage.css";

type Tenant = {
  id: string;
  name: string;
  owner: string;
  email: string;
  contract: string;
  status: string;
  billing: string;
};

const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Tenant A",
    owner: "Alice",
    email: "alice@example.com",
    contract: "Evergreen",
    status: "Active",
    billing: "Monthly",
  },
  {
    id: "2",
    name: "Tenant B",
    owner: "Bob",
    email: "bob@example.com",
    contract: "Termed",
    status: "Active",
    billing: "Monthly",
  },
  // 他のテナントも必要に応じて追加可能
];

export const TenantPage: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  if (selectedTenant) {
    return (
      <div className="tenant-detail">
        <button onClick={() => setSelectedTenant(null)}>Back</button>
        <h2>{selectedTenant.name} - Detail</h2>
        <div className="tabs">
          {["info", "users", "devices", "billing"].map((tab) => (
            <span
              key={tab}
              className={activeTab === tab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "info"
                ? "Tenant Info"
                : tab === "users"
                ? "User List"
                : tab === "devices"
                ? "Device List"
                : "Billing Info"}
            </span>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === "info" && <p>テナント情報の詳細をここに表示します。</p>}
          {activeTab === "users" && <p>ユーザー一覧をここに表示します。</p>}
          {activeTab === "devices" && <p>デバイス一覧をここに表示します。</p>}
          {activeTab === "billing" && <p>請求情報をここに表示します。</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-list">
      <h2>Tenant List</h2>
      <table>
        <thead>
          <tr>
            <th>Tenant Name</th>
            <th>Owner Name</th>
            <th>Mail Address</th>
            <th>Contract</th>
            <th>Status</th>
            <th>Billing</th>
          </tr>
        </thead>
        <tbody>
          {mockTenants.map((tenant) => (
            <tr key={tenant.id}>
              <td>
                <span
                  className="clickable"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  {tenant.name}
                </span>
              </td>
              <td>{tenant.owner}</td>
              <td>{tenant.email}</td>
              <td>{tenant.contract}</td>
              <td>{tenant.status}</td>
              <td>{tenant.billing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
