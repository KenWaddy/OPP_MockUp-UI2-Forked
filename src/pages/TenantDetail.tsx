import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Button } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { TenantDetailInfo } from './TenantDetailInfo';
import { TenantDetailUsers } from './TenantDetailUsers';
import { TenantDetailDevices } from './TenantDetailDevices';
import { TenantDetailBilling } from './TenantDetailBilling';

export const TenantDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }

    setSortConfig({ key, direction });
  };

  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending'
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />;
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
          getSortDirectionIndicator={getSortDirectionIndicator}
        />
      )}
      {tab === 2 && (
        <TenantDetailDevices 
          tenantId={id}
          sortConfig={sortConfig}
          requestSort={requestSort}
          getSortDirectionIndicator={getSortDirectionIndicator}
        />
      )}
      {tab === 3 && (
        <TenantDetailBilling 
          tenantId={id}
          sortConfig={sortConfig}
          requestSort={requestSort}
          getSortDirectionIndicator={getSortDirectionIndicator}
        />
      )}
    </Box>
  );
};
