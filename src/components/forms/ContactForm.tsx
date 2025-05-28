import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";

interface ContactData {
  first_name: string;
  last_name: string;
  email: string;
  language: '日本語' | 'English';
  company: string;
  department: string;
  phone_office: string;
  phone_mobile: string;
  address1: string;
  address2: string;
  city: string;
  state_prefecture: string;
  country: string;
  postal_code: string;
}

interface ContactFormProps {
  contact: ContactData;
  onChange: (updatedContact: ContactData) => void;
  requiredFields?: string[];
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onChange,
  requiredFields = ['first_name', 'last_name', 'email']
}) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleFieldChange = (field: keyof ContactData, value: string) => {
    onChange({
      ...contact,
      [field]: value
    });
  };

  const handleLanguageChange = (value: '日本語' | 'English') => {
    // Update both the contact's language and the global language
    handleFieldChange('language', value);
    setLanguage(value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.firstName')}
          value={contact.first_name}
          onChange={(e) => handleFieldChange('first_name', e.target.value)}
          margin="normal"
          required={requiredFields.includes('first_name')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.lastName')}
          value={contact.last_name}
          onChange={(e) => handleFieldChange('last_name', e.target.value)}
          margin="normal"
          required={requiredFields.includes('last_name')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.email')}
          value={contact.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          margin="normal"
          required={requiredFields.includes('email')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>{t('common.language')}</InputLabel>
          <Select
            value={contact.language}
            label={t('common.language')}
            onChange={(e) => handleLanguageChange(e.target.value as '日本語' | 'English')}
          >
            <MenuItem value="日本語">日本語</MenuItem>
            <MenuItem value="English">English</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.company')}
          value={contact.company}
          onChange={(e) => handleFieldChange('company', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.department')}
          value={contact.department}
          onChange={(e) => handleFieldChange('department', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.officePhone')}
          value={contact.phone_office}
          onChange={(e) => handleFieldChange('phone_office', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.mobilePhone')}
          value={contact.phone_mobile}
          onChange={(e) => handleFieldChange('phone_mobile', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.address1')}
          value={contact.address1}
          onChange={(e) => handleFieldChange('address1', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.address2')}
          value={contact.address2}
          onChange={(e) => handleFieldChange('address2', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.city')}
          value={contact.city}
          onChange={(e) => handleFieldChange('city', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.statePrefecture')}
          value={contact.state_prefecture}
          onChange={(e) => handleFieldChange('state_prefecture', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.country')}
          value={contact.country}
          onChange={(e) => handleFieldChange('country', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t('contact.postalCode')}
          value={contact.postal_code}
          onChange={(e) => handleFieldChange('postal_code', e.target.value)}
          margin="normal"
        />
      </Grid>
    </Grid>
  );
};
