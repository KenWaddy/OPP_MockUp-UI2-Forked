import React, { useState } from "react";
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import "./TenantPage.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Engineer" | "Member";
  ipWhitelist: string[];
  mfaEnabled: boolean;
};

type Tenant = {
  id: string;
  name: string;
  description?: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    country?: string;
  };
  contract: string;
  status: string;
  billing: string;
  subscription?: {
    name?: string;
    id?: string;
    description?: string;
    services?: string[];
    termType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    configs?: string;
  };
  users?: User[];
};

const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Tenant A",
    description: "Main corporate tenant for Company A",
    owner: {
      name: "Alice",
      email: "alice@example.com",
      phone: "+1-555-123-4567",
      address: "123 Business Ave, Suite 100",
      country: "United States"
    },
    contract: "Evergreen",
    status: "Active",
    billing: "Monthly",
    subscription: {
      name: "Enterprise Plan",
      id: "EP-001",
      description: "Full-featured enterprise subscription with premium support",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-01-15",
      endDate: "2024-01-14",
      configs: "Custom deployment with high availability"
    },
    users: [
      {
        id: "u1",
        name: "Alice Smith",
        email: "alice@example.com",
        role: "Owner",
        ipWhitelist: ["192.168.1.1", "10.0.0.1", "172.16.0.1"],
        mfaEnabled: true
      },
      {
        id: "u2",
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "Engineer",
        ipWhitelist: ["192.168.1.2"],
        mfaEnabled: true
      },
      {
        id: "u3",
        name: "Carol Williams",
        email: "carol@example.com",
        role: "Member",
        ipWhitelist: [],
        mfaEnabled: false
      }
    ]
  },
  {
    id: "2",
    name: "Tenant B",
    description: "Regional office for Company B",
    owner: {
      name: "Bob",
      email: "bob@example.com",
      phone: "+44-20-1234-5678",
      address: "456 Commerce St",
      country: "United Kingdom"
    },
    contract: "Termed",
    status: "Active",
    billing: "Monthly",
    subscription: {
      name: "Standard Plan",
      id: "SP-002",
      description: "Standard subscription with basic features",
      services: ["Core Platform", "Basic Support"],
      termType: "Monthly",
      status: "Active",
      startDate: "2023-03-10",
      endDate: "",
      configs: "Default configuration"
    },
    users: [
      {
        id: "u4",
        name: "David Brown",
        email: "david@example.com",
        role: "Owner",
        ipWhitelist: ["192.168.2.1"],
        mfaEnabled: true
      },
      {
        id: "u5",
        name: "Emma Davis",
        email: "emma@example.com",
        role: "Engineer",
        ipWhitelist: ["192.168.2.2", "10.0.0.2"],
        mfaEnabled: true
      }
    ]
  },
  // 他のテナントも必要に応じて追加可能
];

export const TenantPage: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  if (selectedTenant) {
    return (
      <div className="tenant-detail">
        <button onClick={() => setSelectedTenant(null)}>Back</button>
        <h2>{selectedTenant.name} - Detail</h2>
        <div className="tabs">
          {["info", "users", "devices", "billing"].map((tab) => (
            <span
              key={tab}
              className={activeTab === tab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "info"
                ? "Tenant Info"
                : tab === "users"
                ? "User List"
                : tab === "devices"
                ? "Device List"
                : "Billing Info"}
            </span>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === "info" && <TenantInfoPanel tenant={selectedTenant} />}
          {activeTab === "users" && <TenantUserListPanel tenant={selectedTenant} />}
          {activeTab === "devices" && <p>デバイス一覧をここに表示します。</p>}
          {activeTab === "billing" && <p>請求情報をここに表示します。</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-list">
      <h2>Tenant List</h2>
      <table>
        <thead>
          <tr>
            <th>Tenant Name</th>
            <th>Owner Name</th>
            <th>Mail Address</th>
            <th>Contract</th>
            <th>Status</th>
            <th>Billing</th>
          </tr>
        </thead>
        <tbody>
          {mockTenants.map((tenant) => (
            <tr key={tenant.id}>
              <td>
                <span
                  className="clickable"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  {tenant.name}
                </span>
              </td>
              <td>{tenant.owner.name}</td>
              <td>{tenant.owner.email}</td>
              <td>{tenant.contract}</td>
              <td>{tenant.status}</td>
              <td>{tenant.billing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TenantInfoPanel: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  if (!tenant) return null;

  return (
    <Grid container spacing={3}>
      {/* Tenant Information Panel */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            height: '100%', 
            border: '1px solid #ddd', 
            borderRadius: '4px' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Tenant Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Name" 
                secondary={tenant.name} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="ID" 
                secondary={tenant.id} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Description" 
                secondary={tenant.description || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Owner
            </Typography>
            <Box sx={{ pl: 2 }}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary="Name" 
                  secondary={tenant.owner.name} 
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary="eMail" 
                  secondary={tenant.owner.email} 
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary="Phone" 
                  secondary={tenant.owner.phone || 'N/A'} 
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary="Address" 
                  secondary={tenant.owner.address || 'N/A'} 
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary="Country" 
                  secondary={tenant.owner.country || 'N/A'} 
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                />
              </ListItem>
            </Box>
          </List>
        </Paper>
      </Grid>

      {/* Subscription Information Panel */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            height: '100%', 
            border: '1px solid #ddd', 
            borderRadius: '4px' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Subscription Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Name" 
                secondary={tenant.subscription?.name || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="ID" 
                secondary={tenant.subscription?.id || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Description" 
                secondary={tenant.subscription?.description || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Services" 
                secondary={
                  tenant.subscription?.services ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {tenant.subscription.services.map((service) => (
                        <Chip key={service} label={service} size="small" />
                      ))}
                    </Box>
                  ) : 'N/A'
                }
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Term Type" 
                secondary={tenant.subscription?.termType || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Status" 
                secondary={tenant.subscription?.status || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Start Date" 
                secondary={tenant.subscription?.startDate || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="End Date" 
                secondary={tenant.subscription?.endDate || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText 
                primary="Configs" 
                secondary={tenant.subscription?.configs || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

const TenantUserListPanel: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  if (!tenant) return null;
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openIpDialog, setOpenIpDialog] = useState(false);
  
  const handleOpenIpDialog = (user: User) => {
    setSelectedUser(user);
    setOpenIpDialog(true);
  };
  
  const handleCloseIpDialog = () => {
    setOpenIpDialog(false);
  };
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    >
      <Typography variant="h6" gutterBottom>
        User List
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <TableContainer>
        <Table aria-label="user list table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>IP Whitelist</TableCell>
              <TableCell>MFA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenant.users && tenant.users.length > 0 ? (
              tenant.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenIpDialog(user)}
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openIpDialog} onClose={handleCloseIpDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          IP Whitelist for {selectedUser?.name}
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && selectedUser.ipWhitelist.length > 0 ? (
            <List dense>
              {selectedUser.ipWhitelist.map((ip, index) => (
                <ListItem key={index}>
                  <ListItemText primary={ip} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No IP addresses in whitelist
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIpDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
