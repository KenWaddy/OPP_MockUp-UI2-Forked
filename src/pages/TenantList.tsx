import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { tableHeaderCellStyle, tableBodyCellStyle } from '../styles/common.js';

interface Tenant {
  id: string;
  name: string;
  owner: string;
  email: string;
  contract: string;
  status: string;
  billing: string;
}

const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Acme Corp",
    owner: "John Doe",
    email: "john@acme.com",
    contract: "Premium",
    status: "Active",
    billing: "Monthly"
  },
  {
    id: "2",
    name: "Globex Inc",
    owner: "Jane Smith",
    email: "jane@globex.com",
    contract: "Standard",
    status: "Active",
    billing: "Annually"
  }
];

export const TenantList: React.FC = () => {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    navigate(`/tenants/${id}`);
  };

  return (
    <Box p={3}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderCellStyle}>Tenant Name</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Owner</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Email</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Contract</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Billing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTenants.map((tenant) => (
              <TableRow 
                key={tenant.id}
                onClick={() => handleRowClick(tenant.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={tableBodyCellStyle}>{tenant.name}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.owner}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.email}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.contract}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.status}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.billing}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
