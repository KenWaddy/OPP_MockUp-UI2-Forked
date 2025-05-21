import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Button, Typography } from "@mui/material";

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
      {tab === 1 && <Box mt={2}><Typography>User List Content</Typography></Box>}
      {tab === 2 && <Box mt={2}><Typography>Device List Content</Typography></Box>}
      {tab === 3 && <Box mt={2}><Typography>Billing Info Content</Typography></Box>}
    </Box>
  );
};
