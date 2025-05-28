import React from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../languages/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'standard',
  size = 'small'
}) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value as '日本語' | 'English');
  };

  return (
    <FormControl variant={variant} size={size}>
      <Select
        value={language}
        onChange={handleChange}
        displayEmpty
        sx={{ 
          minWidth: '120px',
          color: 'white',
          '& .MuiSelect-icon': {
            color: 'white'
          }
        }}
      >
        <MenuItem value="English">English</MenuItem>
        <MenuItem value="日本語">日本語</MenuItem>
      </Select>
    </FormControl>
  );
};
