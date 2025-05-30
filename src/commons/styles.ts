import { SxProps, Theme } from "@mui/material/styles";

export const tableHeaderCellStyle: SxProps<Theme> = {
  fontWeight: "bold",
  fontSize: "0.875rem",
  color: "text.primary",
  cursor: "pointer",
  backgroundColor: "#DAD7FE",
};

export const tableBodyCellStyle: SxProps<Theme> = {
  fontSize: "0.875rem",
  color: "text.primary",
};

export const oldRowStyle: SxProps<Theme> = {
  backgroundColor: "#f5f5f5",
};

export const paperStyle: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  padding: 2,
};

export const tableContainerStyle: SxProps<Theme> = {
  border: "2px solid",
  borderColor: "divider",
};

export const primaryTypographyStyle: SxProps<Theme> = {
  fontWeight: "medium",
  fontSize: "0.875rem",
};

export const groupTitleStyle: SxProps<Theme> = {
  ...primaryTypographyStyle,
  backgroundColor: "#DAD7FE",
  padding: "8px 12px",
  borderRadius: "4px",
};

export const secondaryTypographyStyle: SxProps<Theme> = {
  fontSize: "0.75rem",
};

export const formControlStyle: SxProps<Theme> = {
  width: "100%",
  marginBottom: 2,
};

export const actionButtonStyle: SxProps<Theme> = {
  marginLeft: 1,
};

export const dialogContentStyle: SxProps<Theme> = {
  padding: 2,
};

export const listItemStyle: SxProps<Theme> = {
  borderBottom: "1px solid",
  borderColor: "divider",
};
