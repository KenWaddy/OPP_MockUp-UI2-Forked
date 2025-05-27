import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../commons/styles.js';
import { formatContactName } from '../mockAPI/utils.js';
import { TenantService, SubscriptionService } from '../mockAPI/index.js';
import { TenantType, Subscription } from '../commons/models.js';

const tenantService = new TenantService();
const subscriptionService = new SubscriptionService();

interface SubscriptionMap {
  [key: string]: Subscription | null;
}

export const TenantList: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantType[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionMap>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tenantsResponse = await tenantService.getTenants({
          page: 1,
          limit: 100
        });
        
        const fetchedTenants = tenantsResponse.data;
        setTenants(fetchedTenants);
        
        const subscriptionMap: SubscriptionMap = {};
        
        await Promise.all(
          fetchedTenants.map(async (tenant) => {
            try {
              const subscriptionResponse = await subscriptionService.getSubscriptionById(tenant.subscriptionId);
              subscriptionMap[tenant.subscriptionId] = subscriptionResponse.data;
            } catch (error) {
              console.error(`Error fetching subscription for tenant ${tenant.id}:`, error);
              subscriptionMap[tenant.subscriptionId] = null;
            }
          })
        );
        
        setSubscriptions(subscriptionMap);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleRowClick = (id: string) => {
    navigate(`/tenants/${id}`);
  };

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

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
            {tenants.map((tenant) => {
              const subscription = subscriptions[tenant.subscriptionId];
              return (
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
                  <TableCell sx={tableBodyCellStyle}>{subscription?.type || '-'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{subscription?.status || '-'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>Edit/Delete</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
