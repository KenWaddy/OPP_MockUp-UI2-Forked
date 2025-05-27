import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Button } from "@mui/material";
import { TenantDetailInfo } from './TenantDetailInfo';
import { TenantDetailUsers } from './TenantDetailUsers';
import { TenantDetailDevices } from './TenantDetailDevices';
import { TenantDetailBilling } from './TenantDetailBilling';
import { useSorting } from '../hooks/useSorting';

export const TenantDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { sortConfig, requestSort } = useSorting();

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

      {tab === 0 && <TenantDetailInfo tenantId={id} />}
      {tab === 1 && (
        <TenantDetailUsers 
          tenantId={id}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
      )}
      {tab === 2 && (
        <TenantDetailDevices 
          tenantId={id}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
      )}
      {tab === 3 && (
        <TenantDetailBilling 
          tenantId={id}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
      )}
    </Box>
  );
};
