import React from "react";
import { Box, Typography } from "@mui/material";

interface TenantDetailInfoProps {
  tenantId?: string;
}

export const TenantDetailInfo: React.FC<TenantDetailInfoProps> = ({ tenantId }) => {
  return (
    <Box mt={2}>
      <Typography>Basic Info Content</Typography>
    </Box>
  );
};
