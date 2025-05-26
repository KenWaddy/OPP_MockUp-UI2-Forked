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
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common.js';
import { formatContactName } from '../services/utils.js';

interface Tenant {
  id: string;
  name: string;
  contact: {
    first_name: string;
    last_name: string;
    language: '日本語' | 'English';
    email: string;
  };
  subscription?: {
    type: 'Evergreen' | 'Termed';
    status: 'Active' | 'Cancelled';
  };
}

const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Acme Corp",
    contact: {
      first_name: "John",
      last_name: "Doe",
      language: "English",
      email: "john@acme.com"
    },
    subscription: {
      type: "Evergreen",
      status: "Active"
    }
  },
  {
    id: "2",
    name: "Globex Inc",
    contact: {
      first_name: "Jane",
      last_name: "Smith",
      language: "English",
      email: "jane@globex.com"
    },
    subscription: {
      type: "Termed",
      status: "Active"
    }
  }
];

export const TenantList: React.FC = () => {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    navigate(`/tenants/${id}`);
  };

  return (
    <Box p={3}>
      <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderCellStyle}>Tenant</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Contact</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Email</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
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
                <TableCell sx={tableBodyCellStyle}>
                  {formatContactName(tenant.contact.first_name, tenant.contact.last_name, tenant.contact.language)}
                </TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.contact.email}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.subscription?.type || '-'}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{tenant.subscription?.status || '-'}</TableCell>
                <TableCell sx={tableBodyCellStyle}>Edit/Delete</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
