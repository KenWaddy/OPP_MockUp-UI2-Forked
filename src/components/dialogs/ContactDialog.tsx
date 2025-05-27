import React from "react";
import { ContactForm } from '../forms/ContactForm';
import { TenantType as Tenant } from '../../commons/models.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';

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
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Edit Contact Information"
      contentProps={{ dividers: true }}
      actions={
        <CommonDialogActions
          onClose={onClose}
          onSave={onSave}
          saveDisabled={!editableContact}
        />
      }
    >
      {editableContact && (
        <ContactForm
          contact={editableContact}
          onChange={(updatedContact) => setEditableContact(updatedContact)}
        />
      )}
    </BaseDialog>
  );
};
