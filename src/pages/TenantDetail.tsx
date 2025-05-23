import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from "@mui/material";
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common.js';

export const TenantDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box p={3}>
      <Button onClick={() => navigate(-1)}>Tenant List</Button>
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Basic Info" />
        <Tab label="User List" />
        <Tab label="Device List" />
        <Tab label="Billing Info" />
      </Tabs>

      {tab === 0 && <Box mt={2}><Typography>Basic Info Content</Typography></Box>}
      {tab === 1 && (
        <Box mt={2}>
          <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyle}>Name</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Email</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Role</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={tableBodyCellStyle}>John Doe</TableCell>
                  <TableCell sx={tableBodyCellStyle}>john@example.com</TableCell>
                  <TableCell sx={tableBodyCellStyle}>Admin</TableCell>
                  <TableCell sx={tableBodyCellStyle}>Edit</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {tab === 2 && (
        <Box mt={2}>
          <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyle}>Name</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={tableBodyCellStyle}>Device 1</TableCell>
                  <TableCell sx={tableBodyCellStyle}>Sensor</TableCell>
                  <TableCell sx={tableBodyCellStyle}>Active</TableCell>
                  <TableCell sx={tableBodyCellStyle}>Edit</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {tab === 3 && <Box mt={2}><Typography>Billing Info Content</Typography></Box>}
    </Box>
  );
};
