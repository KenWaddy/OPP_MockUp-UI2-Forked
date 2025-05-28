import React from "react";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

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
  saveText,
  cancelText,
  saveVariant = "contained",
  saveColor = "primary"
}) => {
  const { t } = useTranslation();
  
  return (
    <>
      <Button onClick={onClose}>{cancelText || t('common.cancel')}</Button>
      {onSave && (
        <Button
          onClick={onSave}
          variant={saveVariant}
          color={saveColor}
          disabled={saveDisabled}
        >
          {saveText || t('common.save')}
        </Button>
      )}
    </>
  );
};
