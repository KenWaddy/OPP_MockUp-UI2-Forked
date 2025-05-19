import React from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  Table,
  useTable,
  TableColumn,
} from "@refinedev/mui";

interface Tenant {
  id: string;
  name: string;
  owner: string;
  email: string;
  contract: string;
  status: string;
  billing: string;
}

export const TenantList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<Tenant>();

  const columns: TableColumn<Tenant>[] = [
    {
      field: "name",
      headerName: "Tenant Name",
      flex: 1,
      renderCell: (params) => (
        <a
          style={{ cursor: "pointer", color: "blue" }}
          onClick={() => navigate(`/tenants/${params.row.id}`)}
        >
          {params.value}
        </a>
      ),
    },
    { field: "owner", headerName: "Owner Name", flex: 1 },
    { field: "email", headerName: "Mail Address", flex: 1 },
    { field: "contract", headerName: "Contract", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "billing", headerName: "Billing", flex: 1 },
  ];

  return (
    <List>
      <Table columns={columns} {...tableQueryResult} />
    </List>
  );
};
