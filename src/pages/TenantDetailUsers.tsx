import React, { useState, useEffect, useMemo } from "react";
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Typography, 
  CircularProgress,
  Chip,
  Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../commons/styles.js';
import { UserService } from '../mockAPI/user.service.js';
import { UserType as User, TenantType as Tenant } from '../commons/models.js';
import { UserDialog } from '../components/dialogs/UserDialog';

const userService = new UserService();

interface TenantDetailUsersProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
  tenantUsers?: User[];
  setTenantUsers?: React.Dispatch<React.SetStateAction<User[]>>;
  selectedTenant?: Tenant | null;
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  error?: string | null;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
}

export const TenantDetailUsers: React.FC<TenantDetailUsersProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  getSortDirectionIndicator,
  tenantUsers: externalTenantUsers,
  setTenantUsers: externalSetTenantUsers,
  selectedTenant,
  loading: externalLoading,
  setLoading: externalSetLoading,
  error: externalError,
  setError: externalSetError
}) => {
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const users = externalTenantUsers || localUsers;
  const setUsers = externalSetTenantUsers || setLocalUsers;
  const loading = externalLoading !== undefined ? externalLoading : localLoading;
  const setLoading = externalSetLoading || setLocalLoading;
  const error = externalError !== undefined ? externalError : localError;
  const setError = externalSetError || setLocalError;
  
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editableUser, setEditableUser] = useState<User | null>(null);

  useEffect(() => {
    if (externalTenantUsers || !tenantId) return;
    
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await userService.getUsersForTenant(tenantId, {
          page: 1,
          limit: 100
        });
        setUsers(response.data);
      } catch (err) {
        setError(`Error loading users: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [tenantId, externalTenantUsers, setLoading, setUsers, setError]);

  const sortedUsers = useMemo(() => {
    if (!users || !sortConfig) return users || [];
    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortConfig]);

  const handleOpenUserDialog = () => {
    if (!selectedTenant && !tenantId) return;

    const isFirstUser = users.length === 0;

    setEditableUser({
      id: `u-new-${Math.floor(Math.random() * 1000)}`,
      name: '',
      email: '',
      roles: isFirstUser ? ['Owner'] : ['Member'], // Set 'Owner' role for first user, otherwise 'Member'
      ipWhitelist: [],
      mfaEnabled: false
    });

    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleSaveUser = () => {
    if ((!selectedTenant && !tenantId) || !editableUser) return;

    try {
      setLoading(true);

      const existingUserIndex = users.findIndex((user: User) => user.id === editableUser.id);

      if (existingUserIndex >= 0) {
        const updatedUsers = [...users];
        updatedUsers[existingUserIndex] = editableUser;

        setUsers(updatedUsers);
      } else {
        const updatedUsers = [
          ...users,
          editableUser
        ];

        setUsers(updatedUsers);
      }

      setOpenUserDialog(false);
    } catch (err) {
      setError(`Error saving user: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    if (!selectedTenant && !tenantId) return;

    setEditableUser({
      ...user
    });

    setOpenUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (!selectedTenant && !tenantId) return;

    const userToDelete = users.find((user: User) => user.id === userId);

    if (userToDelete && userToDelete.roles.includes('Owner')) {
      return;
    }

    try {
      setLoading(true);

      const updatedUsers = users.filter((user: User) => user.id !== userId);

      setUsers(updatedUsers);
    } catch (err) {
      setError(`Error deleting user: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={2}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={handleOpenUserDialog}
          disabled={!tenantId && !selectedTenant}
          sx={{ fontWeight: 'bold' }}
        >
          Add User
        </Button>
      </Box>
      
      {loading && <CircularProgress size={24} sx={{ display: 'block', margin: '20px auto' }} />}
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {!loading && users.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 2 }}>
          No users found for this tenant.
        </Typography>
      )}
      
      {users.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  Name {getSortDirectionIndicator('name')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('email')}
                  style={{ cursor: 'pointer' }}
                >
                  Email {getSortDirectionIndicator('email')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('roles')}
                  style={{ cursor: 'pointer' }}
                >
                  Roles {getSortDirectionIndicator('roles')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('ipWhitelist')}
                  style={{ cursor: 'pointer' }}
                >
                  IP Whitelist {getSortDirectionIndicator('ipWhitelist')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('mfa')}
                  style={{ cursor: 'pointer' }}
                >
                  MFA {getSortDirectionIndicator('mfa')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers && sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell sx={tableBodyCellStyle}>{user.name}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{user.email}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.roles.map((role, index) => (
                          <Chip
                            key={index}
                            label={role}
                            size="small"
                            color={
                              role === "Owner" ? "primary" :
                              role === "Engineer" ? "secondary" :
                              "default"
                            }
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      {user.ipWhitelist.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {user.ipWhitelist.map((ip, index) => (
                            <Chip key={index} label={ip} size="small" />
                          ))}
                        </Box>
                      ) : (
                        'None'
                      )}
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Chip
                        label={user.mfaEnabled ? 'Enabled' : 'Disabled'}
                        color={user.mfaEnabled ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        aria-label="edit"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <Tooltip title={user.roles.includes('Owner') ? "Owner users cannot be deleted" : ""}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            aria-label="delete"
                            disabled={user.roles.includes('Owner')}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={tableBodyCellStyle}>No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* User Dialog */}
      <UserDialog
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        onSave={handleSaveUser}
        editableUser={editableUser}
        setEditableUser={setEditableUser}
        selectedTenant={selectedTenant || (tenantId ? { id: tenantId } as Tenant : null)}
        tenantUsers={users}
      />
    </Box>
  );
};
