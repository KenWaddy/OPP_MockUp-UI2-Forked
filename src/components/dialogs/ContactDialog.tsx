import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { ContactForm } from '../forms/ContactForm';
import { TenantType as Tenant } from '../../commons/models.js';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editableContact: Tenant["contact"] | null;
  setEditableContact: React.Dispatch<React.SetStateAction<Tenant["contact"] | null>>;
}

export const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onClose,
  onSave,
  editableContact,
  setEditableContact
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Edit Contact Information
      </DialogTitle>
      <DialogContent dividers>
        {editableContact && (
          <ContactForm
            contact={editableContact}
            onChange={(updatedContact) => setEditableContact(updatedContact)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={!editableContact}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
