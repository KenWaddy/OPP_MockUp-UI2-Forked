import React from "react";
import { Button } from "@mui/material";

interface CommonDialogActionsProps {
  onClose: () => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveText?: string;
  cancelText?: string;
  saveVariant?: "contained" | "outlined" | "text";
  saveColor?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

export const CommonDialogActions: React.FC<CommonDialogActionsProps> = ({
  onClose,
  onSave,
  saveDisabled = false,
  saveText = "Save",
  cancelText = "Cancel",
  saveVariant = "contained",
  saveColor = "primary"
}) => {
  return (
    <>
      <Button onClick={onClose}>{cancelText}</Button>
      {onSave && (
        <Button
          onClick={onSave}
          variant={saveVariant}
          color={saveColor}
          disabled={saveDisabled}
        >
          {saveText}
        </Button>
      )}
    </>
  );
};
