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
  CircularProgress 
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../commons/styles.js';
import { UserService } from '../mockAPI/user.service.js';
import { User } from '../commons/models.js';

const userService = new UserService();

interface TenantDetailUsersProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
}

export const TenantDetailUsers: React.FC<TenantDetailUsersProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  getSortDirectionIndicator
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editableUser, setEditableUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      if (!tenantId) return;
      
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
  }, [tenantId]);

  const sortedUsers = useMemo(() => {
    if (!sortConfig) return users;
    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof User] as string;
      const bValue = b[sortConfig.key as keyof User] as string;
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortConfig]);

  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setEditableUser({...user});
    } else {
      setSelectedUser(null);
      setEditableUser({
        id: '',
        name: '',
        email: '',
        roles: ['Member'],
        ipWhitelist: [],
        mfaEnabled: false,
        subscriptionId: tenantId || ''
      });
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleSaveUser = async () => {
    if (editableUser && tenantId) {
      try {
        setLoading(true);
        
        if (selectedUser) {
          await userService.updateUser(editableUser);
        } else {
          await userService.addUser(editableUser);
        }
        
        setOpenUserDialog(false);
        
        const response = await userService.getUsersForTenant(tenantId, {
          page: 1,
          limit: 100
        });
        setUsers(response.data);
      } catch (err) {
        setError(`Error saving user: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      await userService.deleteUser(userId);
      
      const response = await userService.getUsersForTenant(tenantId, {
        page: 1,
        limit: 100
      });
      setUsers(response.data);
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
          onClick={() => handleOpenUserDialog()}
          disabled={!tenantId}
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
          <Table>
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
                  onClick={() => requestSort('role')}
                  style={{ cursor: 'pointer' }}
                >
                  Role {getSortDirectionIndicator('role')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={tableBodyCellStyle}>{user.name}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{user.email}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{user.roles.join(', ')}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenUserDialog(user)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* User Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              value={editableUser?.name || ''}
              onChange={(e) => setEditableUser(prev => prev ? {...prev, name: e.target.value} : null)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              value={editableUser?.email || ''}
              onChange={(e) => setEditableUser(prev => prev ? {...prev, email: e.target.value} : null)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Roles"
              value={editableUser?.roles?.join(', ') || ''}
              onChange={(e) => {
                const rolesArray = e.target.value.split(',').map(r => r.trim()) as ("Owner" | "Engineer" | "Member")[];
                setEditableUser(prev => prev ? {...prev, roles: rolesArray} : null);
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            color="primary"
            disabled={!editableUser?.name || !editableUser?.email}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
