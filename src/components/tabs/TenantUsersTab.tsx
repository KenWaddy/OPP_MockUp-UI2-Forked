import React from "react";
import { 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Chip,
  Tooltip,
  CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from "../../commons/styles.js";
import { User } from "../../commons/models.js";

interface TenantUsersTabProps {
  sortedUsers: User[];
  loading?: boolean;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
  handleOpenUserDialog: () => void;
  handleEditUser: (user: User) => void;
  handleDeleteUser: (userId: string) => void;
}

export const TenantUsersTab: React.FC<TenantUsersTabProps> = ({
  sortedUsers,
  loading = false,
  requestSort,
  getSortDirectionIndicator,
  handleOpenUserDialog,
  handleEditUser,
  handleDeleteUser
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenUserDialog}
          sx={{ fontWeight: 'bold' }}
        >
          Add User
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
    </>
  );
};
