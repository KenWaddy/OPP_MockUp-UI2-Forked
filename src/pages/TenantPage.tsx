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
  DialogActions,
  Switch,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import "./TenantPage.css";

type User = {
  id: string;
  name: string;
  email: string;
  roles: ("Owner" | "Engineer" | "Member")[];
  ipWhitelist: string[];
  mfaEnabled: boolean;
};

type Attribute = {
  key: string;
  value: string;
};

type Device = {
  id: string;
  name: string;
  type: "Server" | "Workstation" | "Mobile" | "IoT" | "Other";
  deviceId: string;
  serialNo: string;
  description: string;
  status: "Registered" | "Activated";
  attributes: Attribute[];
};

type DeviceContractItem = {
  type: Device["type"];
  quantity: number;
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
  billingDetails?: {
    billingId?: string;
    deviceContract?: DeviceContractItem[];
    startDate?: string;
    endDate?: string;
    paymentType?: "One-time" | "Monthly" | "Annually";
    billingDate?: string; // For One-time payment
    dueDay?: number | "End of Month"; // For Monthly/Annually payment
    dueMonth?: number; // For Annually payment
    billingStartDate?: string;
  };
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
  devices?: Device[];
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
    billingDetails: {
      billingId: "BID-001",
      deviceContract: [
        { type: "Server", quantity: 5 },
        { type: "Workstation", quantity: 10 },
        { type: "Mobile", quantity: 15 }
      ],
      startDate: "2023-01-15",
      endDate: "2024-01-14",
      paymentType: "Monthly",
      dueDay: 15,
      billingStartDate: "2023-01-15"
    },
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
        roles: ["Owner"],
        ipWhitelist: ["192.168.1.1", "10.0.0.1", "172.16.0.1"],
        mfaEnabled: true
      },
      {
        id: "u2",
        name: "Bob Johnson",
        email: "bob@example.com",
        roles: ["Engineer", "Member"],
        ipWhitelist: ["192.168.1.2"],
        mfaEnabled: true
      },
      {
        id: "u3",
        name: "Carol Williams",
        email: "carol@example.com",
        roles: ["Member"],
        ipWhitelist: [],
        mfaEnabled: false
      }
    ],
    devices: [
      {
        id: "d1",
        name: "Production Server",
        type: "Server",
        deviceId: "SRV-001",
        serialNo: "ABC123456789",
        description: "Main production server for Company A",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "12 cores" },
          { key: "RAM", value: "64GB" },
          { key: "Storage", value: "2TB SSD" },
          { key: "OS", value: "Ubuntu 22.04" }
        ]
      },
      {
        id: "d2",
        name: "Development Workstation",
        type: "Workstation",
        deviceId: "WS-001",
        serialNo: "DEF987654321",
        description: "Developer workstation for engineering team",
        status: "Registered",
        attributes: [
          { key: "CPU", value: "8 cores" },
          { key: "RAM", value: "32GB" },
          { key: "Storage", value: "1TB SSD" },
          { key: "OS", value: "Windows 11" }
        ]
      },
      {
        id: "d3",
        name: "Field Tablet",
        type: "Mobile",
        deviceId: "MOB-001",
        serialNo: "GHI112233445",
        description: "Tablet for field technicians",
        status: "Activated",
        attributes: [
          { key: "Screen", value: "10.5 inch" },
          { key: "Battery", value: "10000mAh" },
          { key: "Storage", value: "128GB" }
        ]
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
    billingDetails: {
      billingId: "BID-002",
      deviceContract: [
        { type: "Server", quantity: 2 },
        { type: "Workstation", quantity: 5 }
      ],
      startDate: "2023-03-10",
      endDate: "2024-03-09",
      paymentType: "Monthly",
      dueDay: "End of Month",
      billingStartDate: "2023-03-10"
    },
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
        roles: ["Owner", "Engineer"],
        ipWhitelist: ["192.168.2.1"],
        mfaEnabled: true
      },
      {
        id: "u5",
        name: "Emma Davis",
        email: "emma@example.com",
        roles: ["Engineer", "Member"],
        ipWhitelist: ["192.168.2.2", "10.0.0.2"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d4",
        name: "Analytics Server",
        type: "Server",
        deviceId: "SRV-002",
        serialNo: "JKL123789456",
        description: "Data analytics server for Company B",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "16 cores" },
          { key: "RAM", value: "128GB" },
          { key: "Storage", value: "4TB SSD" },
          { key: "OS", value: "Red Hat Enterprise Linux" }
        ]
      },
      {
        id: "d5",
        name: "IoT Gateway",
        type: "IoT",
        deviceId: "IOT-001",
        serialNo: "MNO456789123",
        description: "Gateway for IoT devices",
        status: "Registered",
        attributes: [
          { key: "Connectivity", value: "Wi-Fi, Bluetooth, Zigbee" },
          { key: "Power", value: "PoE" },
          { key: "Enclosure", value: "IP66 Waterproof" }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Tenant C",
    description: "Healthcare provider system",
    owner: {
      name: "Charlie",
      email: "charlie@healthcare.com",
      phone: "+1-333-444-5555",
      address: "789 Medical Center Blvd",
      country: "United States"
    },
    contract: "Termed",
    status: "Active",
    billing: "Annually",
    billingDetails: {
      billingId: "BID-003",
      deviceContract: [
        { type: "Server", quantity: 8 },
        { type: "Workstation", quantity: 25 },
        { type: "Mobile", quantity: 40 },
        { type: "IoT", quantity: 15 }
      ],
      startDate: "2023-02-01",
      endDate: "2026-01-31",
      paymentType: "Annually",
      dueDay: 1,
      dueMonth: 2,
      billingStartDate: "2023-02-01"
    },
    subscription: {
      name: "Healthcare Enterprise",
      id: "HE-003",
      description: "HIPAA-compliant healthcare system with advanced security",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "Compliance Monitoring", "Audit Logging"],
      termType: "Multi-year",
      status: "Active",
      startDate: "2023-02-01",
      endDate: "2026-01-31",
      configs: "High-security deployment with redundancy"
    },
    users: [
      {
        id: "u6",
        name: "Dr. Sarah Chen",
        email: "sarah@healthcare.com",
        roles: ["Owner"],
        ipWhitelist: ["192.168.3.1", "10.0.0.3"],
        mfaEnabled: true
      },
      {
        id: "u7",
        name: "Michael Johnson",
        email: "michael@healthcare.com",
        roles: ["Engineer"],
        ipWhitelist: ["192.168.3.2"],
        mfaEnabled: true
      },
      {
        id: "u8",
        name: "Lisa Rodriguez",
        email: "lisa@healthcare.com",
        roles: ["Member"],
        ipWhitelist: ["192.168.3.3"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d6",
        name: "Patient Records Server",
        type: "Server",
        deviceId: "SRV-003",
        serialNo: "PQR123456789",
        description: "Secure server for patient records",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "24 cores" },
          { key: "RAM", value: "256GB" },
          { key: "Storage", value: "10TB SSD RAID" },
          { key: "OS", value: "RHEL 8 Secure" }
        ]
      },
      {
        id: "d7",
        name: "Nurse Station Workstation",
        type: "Workstation",
        deviceId: "WS-003",
        serialNo: "STU987654321",
        description: "Workstation for nursing staff",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "8 cores" },
          { key: "RAM", value: "32GB" },
          { key: "Storage", value: "1TB SSD" },
          { key: "OS", value: "Windows 10 Enterprise LTSC" }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Tenant D",
    description: "Financial services company",
    owner: {
      name: "Diana",
      email: "diana@finance.com",
      phone: "+1-444-555-6666",
      address: "101 Wall Street",
      country: "United States"
    },
    contract: "Evergreen",
    status: "Active",
    billing: "Monthly",
    billingDetails: {
      billingId: "BID-004",
      deviceContract: [
        { type: "Server", quantity: 12 },
        { type: "Workstation", quantity: 50 },
        { type: "Mobile", quantity: 20 }
      ],
      startDate: "2023-04-15",
      endDate: "",
      paymentType: "Monthly",
      dueDay: 15,
      billingStartDate: "2023-04-15"
    },
    subscription: {
      name: "Financial Enterprise",
      id: "FE-004",
      description: "High-security financial services platform",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "Financial Compliance", "Real-time Monitoring"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-04-15",
      endDate: "2024-04-14",
      configs: "High-frequency trading optimized deployment"
    },
    users: [
      {
        id: "u9",
        name: "Frank Williams",
        email: "frank@finance.com",
        roles: ["Owner", "Engineer"],
        ipWhitelist: ["192.168.4.1", "10.0.0.4"],
        mfaEnabled: true
      },
      {
        id: "u10",
        name: "Grace Lee",
        email: "grace@finance.com",
        roles: ["Engineer"],
        ipWhitelist: ["192.168.4.2"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d8",
        name: "Trading Server",
        type: "Server",
        deviceId: "SRV-004",
        serialNo: "VWX123456789",
        description: "Low-latency trading server",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "32 cores" },
          { key: "RAM", value: "512GB" },
          { key: "Storage", value: "4TB NVMe" },
          { key: "Network", value: "10Gbps dedicated" }
        ]
      }
    ]
  },
  {
    id: "5",
    name: "Tenant E",
    description: "E-commerce platform",
    owner: {
      name: "Edward",
      email: "edward@ecommerce.com",
      phone: "+1-555-666-7777",
      address: "202 Market Street",
      country: "United States"
    },
    contract: "Termed",
    status: "Active",
    billing: "Annually",
    billingDetails: {
      billingId: "BID-005",
      deviceContract: [
        { type: "Server", quantity: 20 },
        { type: "Workstation", quantity: 15 },
        { type: "Mobile", quantity: 10 }
      ],
      startDate: "2023-05-01",
      endDate: "2025-04-30",
      paymentType: "Annually",
      dueDay: 1,
      dueMonth: 5,
      billingStartDate: "2023-05-01"
    },
    subscription: {
      name: "E-commerce Enterprise",
      id: "EE-005",
      description: "Scalable e-commerce platform with peak season support",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "Elastic Scaling", "CDN Integration"],
      termType: "Multi-year",
      status: "Active",
      startDate: "2023-05-01",
      endDate: "2025-04-30",
      configs: "Auto-scaling with load balancing"
    },
    users: [
      {
        id: "u11",
        name: "Helen Brown",
        email: "helen@ecommerce.com",
        roles: ["Owner"],
        ipWhitelist: ["192.168.5.1"],
        mfaEnabled: true
      },
      {
        id: "u12",
        name: "Ian Clark",
        email: "ian@ecommerce.com",
        roles: ["Engineer", "Member"],
        ipWhitelist: ["192.168.5.2", "10.0.0.5"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d9",
        name: "Web Server Cluster",
        type: "Server",
        deviceId: "SRV-005",
        serialNo: "YZA123456789",
        description: "Web server for e-commerce platform",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "16 cores" },
          { key: "RAM", value: "128GB" },
          { key: "Storage", value: "2TB SSD" },
          { key: "OS", value: "Ubuntu 22.04 LTS" }
        ]
      }
    ]
  },
  {
    id: "6",
    name: "Tenant F",
    description: "Manufacturing company",
    owner: {
      name: "Fiona",
      email: "fiona@manufacturing.com",
      phone: "+1-666-777-8888",
      address: "303 Factory Road",
      country: "United States"
    },
    contract: "Termed",
    status: "Active",
    billing: "Monthly",
    billingDetails: {
      billingId: "BID-006",
      deviceContract: [
        { type: "Server", quantity: 5 },
        { type: "Workstation", quantity: 30 },
        { type: "IoT", quantity: 100 }
      ],
      startDate: "2023-06-15",
      endDate: "2024-06-14",
      paymentType: "Monthly",
      dueDay: "End of Month",
      billingStartDate: "2023-06-15"
    },
    subscription: {
      name: "Manufacturing Suite",
      id: "MS-006",
      description: "IoT-enabled manufacturing management system",
      services: ["Core Platform", "Analytics", "IoT Hub", "Basic Support"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-06-15",
      endDate: "2024-06-14",
      configs: "Factory floor integration"
    },
    users: [
      {
        id: "u13",
        name: "George Martinez",
        email: "george@manufacturing.com",
        roles: ["Owner"],
        ipWhitelist: ["192.168.6.1"],
        mfaEnabled: true
      },
      {
        id: "u14",
        name: "Hannah Wilson",
        email: "hannah@manufacturing.com",
        roles: ["Engineer"],
        ipWhitelist: ["192.168.6.2"],
        mfaEnabled: false
      }
    ],
    devices: [
      {
        id: "d10",
        name: "Production Line Controller",
        type: "IoT",
        deviceId: "IOT-006",
        serialNo: "BCD987654321",
        description: "Main controller for production line",
        status: "Activated",
        attributes: [
          { key: "Connectivity", value: "Industrial Ethernet" },
          { key: "Power", value: "24V DC" },
          { key: "Enclosure", value: "IP67 Industrial" }
        ]
      }
    ]
  },
  {
    id: "7",
    name: "Tenant G",
    description: "Government agency",
    owner: {
      name: "Gregory",
      email: "gregory@gov.gov",
      phone: "+1-777-888-9999",
      address: "404 Government Plaza",
      country: "United States"
    },
    contract: "Termed",
    status: "Active",
    billing: "Annually",
    billingDetails: {
      billingId: "BID-007",
      deviceContract: [
        { type: "Server", quantity: 15 },
        { type: "Workstation", quantity: 200 },
        { type: "Mobile", quantity: 50 }
      ],
      startDate: "2023-07-01",
      endDate: "2026-06-30",
      paymentType: "Annually",
      dueDay: 1,
      dueMonth: 7,
      billingStartDate: "2023-07-01"
    },
    subscription: {
      name: "Government Secure",
      id: "GS-007",
      description: "FedRAMP-compliant secure government platform",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "Compliance Monitoring", "Audit Logging"],
      termType: "Multi-year",
      status: "Active",
      startDate: "2023-07-01",
      endDate: "2026-06-30",
      configs: "Air-gapped secure deployment"
    },
    users: [
      {
        id: "u15",
        name: "Irene Taylor",
        email: "irene@gov.gov",
        roles: ["Owner"],
        ipWhitelist: ["192.168.7.1", "10.0.0.7"],
        mfaEnabled: true
      },
      {
        id: "u16",
        name: "Jack Robinson",
        email: "jack@gov.gov",
        roles: ["Engineer", "Member"],
        ipWhitelist: ["192.168.7.2"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d11",
        name: "Secure Database Server",
        type: "Server",
        deviceId: "SRV-007",
        serialNo: "EFG123456789",
        description: "Classified information database",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "64 cores" },
          { key: "RAM", value: "1TB" },
          { key: "Storage", value: "20TB SSD RAID" },
          { key: "Security", value: "FIPS 140-2" }
        ]
      }
    ]
  },
  {
    id: "8",
    name: "Tenant H",
    description: "Educational institution",
    owner: {
      name: "Henry",
      email: "henry@edu.edu",
      phone: "+1-888-999-0000",
      address: "505 Campus Drive",
      country: "United States"
    },
    contract: "Termed",
    status: "Active",
    billing: "Annually",
    billingDetails: {
      billingId: "BID-008",
      deviceContract: [
        { type: "Server", quantity: 10 },
        { type: "Workstation", quantity: 500 },
        { type: "Mobile", quantity: 100 }
      ],
      startDate: "2023-08-15",
      endDate: "2024-08-14",
      paymentType: "Annually",
      dueDay: 15,
      dueMonth: 8,
      billingStartDate: "2023-08-15"
    },
    subscription: {
      name: "Education Suite",
      id: "ES-008",
      description: "Learning management system with student portal",
      services: ["Core Platform", "Analytics", "API Access", "Basic Support", "Learning Tools"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-08-15",
      endDate: "2024-08-14",
      configs: "Campus-wide deployment"
    },
    users: [
      {
        id: "u17",
        name: "Karen White",
        email: "karen@edu.edu",
        roles: ["Owner"],
        ipWhitelist: ["192.168.8.1"],
        mfaEnabled: true
      },
      {
        id: "u18",
        name: "Larry Green",
        email: "larry@edu.edu",
        roles: ["Engineer"],
        ipWhitelist: ["192.168.8.2"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d12",
        name: "Student Lab Server",
        type: "Server",
        deviceId: "SRV-008",
        serialNo: "HIJ123456789",
        description: "Server for student computer labs",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "32 cores" },
          { key: "RAM", value: "256GB" },
          { key: "Storage", value: "8TB SSD" },
          { key: "OS", value: "Windows Server 2022" }
        ]
      }
    ]
  },
  {
    id: "9",
    name: "Tenant I",
    description: "Insurance company",
    owner: {
      name: "Isabella",
      email: "isabella@insurance.com",
      phone: "+1-999-000-1111",
      address: "606 Policy Boulevard",
      country: "United States"
    },
    contract: "Evergreen",
    status: "Active",
    billing: "Monthly",
    billingDetails: {
      billingId: "BID-009",
      deviceContract: [
        { type: "Server", quantity: 8 },
        { type: "Workstation", quantity: 120 },
        { type: "Mobile", quantity: 60 }
      ],
      startDate: "2023-09-01",
      endDate: "",
      paymentType: "Monthly",
      dueDay: 1,
      billingStartDate: "2023-09-01"
    },
    subscription: {
      name: "Insurance Enterprise",
      id: "IE-009",
      description: "Claims processing and policy management system",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "Document Management"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-09-01",
      endDate: "2024-08-31",
      configs: "High-availability deployment"
    },
    users: [
      {
        id: "u19",
        name: "Mark Johnson",
        email: "mark@insurance.com",
        roles: ["Owner", "Engineer"],
        ipWhitelist: ["192.168.9.1", "10.0.0.9"],
        mfaEnabled: true
      },
      {
        id: "u20",
        name: "Nancy Davis",
        email: "nancy@insurance.com",
        roles: ["Member"],
        ipWhitelist: ["192.168.9.2"],
        mfaEnabled: false
      }
    ],
    devices: [
      {
        id: "d13",
        name: "Claims Processing Server",
        type: "Server",
        deviceId: "SRV-009",
        serialNo: "KLM123456789",
        description: "Server for processing insurance claims",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "24 cores" },
          { key: "RAM", value: "192GB" },
          { key: "Storage", value: "6TB SSD" },
          { key: "OS", value: "RHEL 9" }
        ]
      }
    ]
  },
  {
    id: "10",
    name: "Tenant J",
    description: "Media and entertainment company",
    owner: {
      name: "James",
      email: "james@media.com",
      phone: "+1-000-111-2222",
      address: "707 Studio Way",
      country: "United States"
    },
    contract: "Termed",
    status: "Active",
    billing: "Monthly",
    billingDetails: {
      billingId: "BID-010",
      deviceContract: [
        { type: "Server", quantity: 25 },
        { type: "Workstation", quantity: 75 },
        { type: "Mobile", quantity: 30 }
      ],
      startDate: "2023-10-15",
      endDate: "2024-10-14",
      paymentType: "Monthly",
      dueDay: 15,
      billingStartDate: "2023-10-15"
    },
    subscription: {
      name: "Media Production Suite",
      id: "MP-010",
      description: "Content creation and distribution platform",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "Content Delivery", "Media Storage"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-10-15",
      endDate: "2024-10-14",
      configs: "High-bandwidth media optimized"
    },
    users: [
      {
        id: "u21",
        name: "Oliver Smith",
        email: "oliver@media.com",
        roles: ["Owner"],
        ipWhitelist: ["192.168.10.1"],
        mfaEnabled: true
      },
      {
        id: "u22",
        name: "Patricia Brown",
        email: "patricia@media.com",
        roles: ["Engineer", "Member"],
        ipWhitelist: ["192.168.10.2", "10.0.0.10"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d14",
        name: "Media Rendering Farm",
        type: "Server",
        deviceId: "SRV-010",
        serialNo: "NOP123456789",
        description: "High-performance rendering cluster",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "128 cores" },
          { key: "RAM", value: "1TB" },
          { key: "Storage", value: "100TB SSD" },
          { key: "GPU", value: "8x NVIDIA A100" }
        ]
      }
    ]
  },
  {
    id: "11",
    name: "Tenant K",
    description: "Retail chain",
    owner: {
      name: "Katherine",
      email: "katherine@retail.com",
      phone: "+1-111-222-3333",
      address: "808 Shopping Center Rd",
      country: "United States"
    },
    contract: "Termed",
    status: "Active",
    billing: "Annually",
    billingDetails: {
      billingId: "BID-011",
      deviceContract: [
        { type: "Server", quantity: 15 },
        { type: "Workstation", quantity: 300 },
        { type: "Mobile", quantity: 150 },
        { type: "IoT", quantity: 200 }
      ],
      startDate: "2023-11-01",
      endDate: "2024-10-31",
      paymentType: "Annually",
      dueDay: 1,
      dueMonth: 11,
      billingStartDate: "2023-11-01"
    },
    subscription: {
      name: "Retail Management",
      id: "RM-011",
      description: "Point-of-sale and inventory management system",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "Inventory Management", "POS Integration"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-11-01",
      endDate: "2024-10-31",
      configs: "Multi-location deployment"
    },
    users: [
      {
        id: "u23",
        name: "Quinn Adams",
        email: "quinn@retail.com",
        roles: ["Owner"],
        ipWhitelist: ["192.168.11.1", "10.0.0.11"],
        mfaEnabled: true
      },
      {
        id: "u24",
        name: "Robert Miller",
        email: "robert@retail.com",
        roles: ["Engineer"],
        ipWhitelist: ["192.168.11.2"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d15",
        name: "Inventory Control System",
        type: "Server",
        deviceId: "SRV-011",
        serialNo: "QRS123456789",
        description: "Central inventory management server",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "16 cores" },
          { key: "RAM", value: "128GB" },
          { key: "Storage", value: "8TB SSD" },
          { key: "OS", value: "Ubuntu 20.04 LTS" }
        ]
      }
    ]
  },
  {
    id: "12",
    name: "Tenant L",
    description: "Logistics company",
    owner: {
      name: "Leonard",
      email: "leonard@logistics.com",
      phone: "+1-222-333-4444",
      address: "909 Shipping Lane",
      country: "United States"
    },
    contract: "Evergreen",
    status: "Active",
    billing: "Monthly",
    billingDetails: {
      billingId: "BID-012",
      deviceContract: [
        { type: "Server", quantity: 10 },
        { type: "Workstation", quantity: 50 },
        { type: "Mobile", quantity: 200 },
        { type: "IoT", quantity: 500 }
      ],
      startDate: "2023-12-15",
      endDate: "",
      paymentType: "Monthly",
      dueDay: "End of Month",
      billingStartDate: "2023-12-15"
    },
    subscription: {
      name: "Logistics Suite",
      id: "LS-012",
      description: "Fleet management and package tracking system",
      services: ["Core Platform", "Analytics", "API Access", "Premium Support", "GPS Tracking", "Route Optimization"],
      termType: "Annual",
      status: "Active",
      startDate: "2023-12-15",
      endDate: "2024-12-14",
      configs: "Global distribution network"
    },
    users: [
      {
        id: "u25",
        name: "Susan Clark",
        email: "susan@logistics.com",
        roles: ["Owner", "Engineer"],
        ipWhitelist: ["192.168.12.1"],
        mfaEnabled: true
      },
      {
        id: "u26",
        name: "Thomas Wilson",
        email: "thomas@logistics.com",
        roles: ["Member"],
        ipWhitelist: ["192.168.12.2", "10.0.0.12"],
        mfaEnabled: true
      }
    ],
    devices: [
      {
        id: "d16",
        name: "Fleet Tracking Server",
        type: "Server",
        deviceId: "SRV-012",
        serialNo: "TUV123456789",
        description: "Real-time fleet tracking system",
        status: "Activated",
        attributes: [
          { key: "CPU", value: "32 cores" },
          { key: "RAM", value: "256GB" },
          { key: "Storage", value: "12TB SSD" },
          { key: "OS", value: "RHEL 8" }
        ]
      }
    ]
  }
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
          {activeTab === "devices" && <TenantDeviceListPanel tenant={selectedTenant} />}
          {activeTab === "billing" && <TenantBillingInfoPanel tenant={selectedTenant} />}
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
    <Grid container spacing={3} direction="column">
      {/* Basic Info Panel */}
      <Grid item xs={12}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            border: '1px solid #ddd', 
            borderRadius: '4px' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Basic Info
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Name" 
                secondary={tenant.name} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="ID" 
                secondary={tenant.id} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '250px', flex: '1 1 auto' }}>
              <ListItemText 
                primary="Description" 
                secondary={tenant.description || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
          </Box>
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Owner
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pl: 2, justifyContent: 'flex-start' }}>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Name" 
                secondary={tenant.owner.name} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="eMail" 
                secondary={tenant.owner.email} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Phone" 
                secondary={tenant.owner.phone || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '250px', flex: '1 1 auto' }}>
              <ListItemText 
                primary="Address" 
                secondary={tenant.owner.address || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Country" 
                secondary={tenant.owner.country || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Subscription Panel */}
      <Grid item xs={12}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            border: '1px solid #ddd', 
            borderRadius: '4px' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Subscription
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Name" 
                secondary={tenant.subscription?.name || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="ID" 
                secondary={tenant.subscription?.id || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '250px', flex: '1 1 auto' }}>
              <ListItemText 
                primary="Description" 
                secondary={tenant.subscription?.description || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            
            <Box sx={{ minWidth: '300px', flex: '2 1 auto' }}>
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
            </Box>
            
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Term Type" 
                secondary={tenant.subscription?.termType || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Status" 
                secondary={tenant.subscription?.status || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="Start Date" 
                secondary={tenant.subscription?.startDate || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
              <ListItemText 
                primary="End Date" 
                secondary={tenant.subscription?.endDate || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
            <Box sx={{ minWidth: '250px', flex: '1 1 auto' }}>
              <ListItemText 
                primary="Configs" 
                secondary={tenant.subscription?.configs || 'N/A'} 
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const TenantUserListPanel: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  if (!tenant) return null;
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openIpDialog, setOpenIpDialog] = useState(false);
  const [users, setUsers] = useState<User[]>(tenant.users || []);
  const [editMode, setEditMode] = useState(false);
  const [editableIpList, setEditableIpList] = useState<string[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');
  
  const handleOpenIpDialog = (user: User) => {
    setSelectedUser(user);
    setEditableIpList(user.ipWhitelist.slice());
    setEditMode(false);
    setOpenIpDialog(true);
  };
  
  const handleCloseIpDialog = () => {
    setOpenIpDialog(false);
    setEditMode(false);
  };
  
  const handleEditClick = () => {
    setEditMode(true);
  };
  
  const handleSaveClick = () => {
    if (selectedUser) {
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ipWhitelist: editableIpList } 
          : user
      );
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, ipWhitelist: editableIpList });
      setEditMode(false);
    }
  };
  
  const handleAddIp = () => {
    if (newIpAddress.trim() !== '') {
      setEditableIpList([...editableIpList, newIpAddress.trim()]);
      setNewIpAddress('');
    }
  };
  
  const handleRemoveIp = (index: number) => {
    const newList = [...editableIpList];
    newList.splice(index, 1);
    setEditableIpList(newList);
  };
  
  const handleMfaToggle = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, mfaEnabled: !user.mfaEnabled } : user
      )
    );
  };
  
  const handleRoleToggle = (userId: string, role: "Owner" | "Engineer" | "Member") => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          const hasRole = user.roles.includes(role);
          const newRoles = hasRole 
            ? user.roles.filter(r => r !== role) 
            : [...user.roles, role];
          return { ...user, roles: newRoles };
        }
        return user;
      })
    );
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
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            size="small"
                            checked={user.roles.includes("Owner")}
                            onChange={() => handleRoleToggle(user.id, "Owner")}
                          />
                        }
                        label="Owner"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            size="small"
                            checked={user.roles.includes("Engineer")}
                            onChange={() => handleRoleToggle(user.id, "Engineer")}
                          />
                        }
                        label="Engineer"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            size="small"
                            checked={user.roles.includes("Member")}
                            onChange={() => handleRoleToggle(user.id, "Member")}
                          />
                        }
                        label="Member"
                      />
                    </FormGroup>
                  </TableCell>
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
                    <Switch
                      checked={user.mfaEnabled}
                      onChange={() => handleMfaToggle(user.id)}
                      size="small"
                    />
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
          {editMode ? (
            <>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="New IP Address"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={handleAddIp}
                          disabled={!newIpAddress.trim()}
                        >
                          Add
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newIpAddress.trim() !== '') {
                      handleAddIp();
                    }
                  }}
                />
              </Box>
              {editableIpList.length > 0 ? (
                <List dense>
                  {editableIpList.map((ip, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleRemoveIp(index)}
                          size="small"
                        >
                          <DeleteIcon>delete</DeleteIcon>
                        </IconButton>
                      }
                    >
                      <ListItemText primary={ip} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No IP addresses in whitelist
                </Typography>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={handleSaveClick} color="primary">
                Save
              </Button>
              <Button onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEditClick} color="primary">
                Edit
              </Button>
              <Button onClick={handleCloseIpDialog}>Close</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const TenantDeviceListPanel: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  if (!tenant) return null;
  
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [openAttributesDialog, setOpenAttributesDialog] = useState(false);
  const [devices, setDevices] = useState<Device[]>(tenant.devices || []);
  const [editMode, setEditMode] = useState(false);
  const [editableAttributes, setEditableAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Attribute>({ key: '', value: '' });
  
  const deviceTypes: Device["type"][] = ["Server", "Workstation", "Mobile", "IoT", "Other"];
  const statusOptions: Device["status"][] = ["Registered", "Activated"];
  
  const handleOpenAttributesDialog = (device: Device) => {
    setSelectedDevice(device);
    setEditableAttributes(device.attributes.map(attr => ({ ...attr })));
    setEditMode(false);
    setOpenAttributesDialog(true);
  };
  
  const handleCloseAttributesDialog = () => {
    setOpenAttributesDialog(false);
    setEditMode(false);
  };
  
  const handleEditClick = () => {
    setEditMode(true);
  };
  
  const handleSaveClick = () => {
    if (selectedDevice) {
      const updatedDevices = devices.map(device => 
        device.id === selectedDevice.id 
          ? { ...device, attributes: editableAttributes } 
          : device
      );
      setDevices(updatedDevices);
      setSelectedDevice({ ...selectedDevice, attributes: editableAttributes });
      setEditMode(false);
    }
  };
  
  const handleAddAttribute = () => {
    if (newAttribute.key.trim() !== '') {
      setEditableAttributes([...editableAttributes, { ...newAttribute }]);
      setNewAttribute({ key: '', value: '' });
    }
  };
  
  const handleRemoveAttribute = (index: number) => {
    const newList = [...editableAttributes];
    newList.splice(index, 1);
    setEditableAttributes(newList);
  };
  
  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...editableAttributes];
    newAttributes[index][field] = value;
    setEditableAttributes(newAttributes);
  };
  
  const handleTypeChange = (deviceId: string, newType: Device["type"]) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId ? { ...device, type: newType } : device
      )
    );
  };
  
  const handleStatusChange = (deviceId: string, newStatus: Device["status"]) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId ? { ...device, status: newStatus } : device
      )
    );
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
        Device List
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <TableContainer>
        <Table aria-label="device list table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Device ID</TableCell>
              <TableCell>Serial No.</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Attributes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length > 0 ? (
              devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={device.type}
                        onChange={(e) => handleTypeChange(device.id, e.target.value as Device["type"])}
                      >
                        {deviceTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{device.deviceId}</TableCell>
                  <TableCell>{device.serialNo}</TableCell>
                  <TableCell>{device.description}</TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={device.status}
                        onChange={(e) => handleStatusChange(device.id, e.target.value as Device["status"])}
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenAttributesDialog(device)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No devices found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openAttributesDialog} onClose={handleCloseAttributesDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Attributes for {selectedDevice?.name}
        </DialogTitle>
        <DialogContent dividers>
          {editMode ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-end' }}>
                <TextField
                  label="Key"
                  value={newAttribute.key}
                  onChange={(e) => setNewAttribute({ ...newAttribute, key: e.target.value })}
                  sx={{ mr: 1, flex: 1 }}
                  size="small"
                />
                <TextField
                  label="Value"
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                  sx={{ mr: 1, flex: 1 }}
                  size="small"
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddAttribute}
                  disabled={!newAttribute.key.trim()}
                >
                  Add
                </Button>
              </Box>
              {editableAttributes.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell width={50}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editableAttributes.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={attr.key}
                              onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={attr.value}
                              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              edge="end"
                              onClick={() => handleRemoveAttribute(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attributes found. Add some using the form above.
                </Typography>
              )}
            </>
          ) : (
            <>
              {selectedDevice && selectedDevice.attributes.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDevice.attributes.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell>{attr.key}</TableCell>
                          <TableCell>{attr.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attributes found
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={handleSaveClick} color="primary">
                Save
              </Button>
              <Button onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEditClick} color="primary">
                Edit
              </Button>
              <Button onClick={handleCloseAttributesDialog}>Close</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
const TenantBillingInfoPanel: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  if (!tenant) return null;

  const [paymentType, setPaymentType] = useState<"One-time" | "Monthly" | "Annually">(
    tenant.billingDetails?.paymentType || "Monthly"
  );
  
  const [deviceContract, setDeviceContract] = useState<DeviceContractItem[]>(
    tenant.billingDetails?.deviceContract || []
  );

  const deviceTypes: Device["type"][] = ["Server", "Workstation", "Mobile", "IoT", "Other"];
  
  const totalDevices = deviceContract.reduce((sum, item) => sum + item.quantity, 0);

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
        Billing Information
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {/* Basic Billing Info */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'flex-start' }}>
        <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
          <ListItemText 
            primary="Billing ID" 
            secondary={tenant.billingDetails?.billingId || 'N/A'} 
            primaryTypographyProps={{ variant: 'subtitle2' }}
          />
        </Box>
        <Box sx={{ minWidth: '200px', flex: '1 1 auto' }}>
          <ListItemText 
            primary="Contract Start" 
            secondary={tenant.billingDetails?.startDate || 'N/A'} 
            primaryTypographyProps={{ variant: 'subtitle2' }}
          />
        </Box>
        <Box sx={{ minWidth: '200px', flex: '1 1 auto' }}>
          <ListItemText 
            primary="Contract End" 
            secondary={tenant.billingDetails?.endDate || 'N/A'} 
            primaryTypographyProps={{ variant: 'subtitle2' }}
          />
        </Box>
        <Box sx={{ minWidth: '200px', flex: '1 1 auto' }}>
          <ListItemText 
            primary="Billing Start Date" 
            secondary={tenant.billingDetails?.billingStartDate || 'N/A'} 
            primaryTypographyProps={{ variant: 'subtitle2' }}
          />
        </Box>
      </Box>
      
      {/* Payment Type Section */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Payment Settings
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pl: 2, mb: 3, justifyContent: 'flex-start' }}>
        <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
          <FormControl size="small" sx={{ width: 'auto', minWidth: '120px' }}>
            <InputLabel>Payment Type</InputLabel>
            <Select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as "One-time" | "Monthly" | "Annually")}
              label="Payment Type"
            >
              <MenuItem value="One-time">One-time</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Annually">Annually</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Conditional Fields Based on Payment Type */}
        {paymentType === "One-time" && (
          <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
            <ListItemText 
              primary="Billing Date" 
              secondary={tenant.billingDetails?.billingDate || 'N/A'} 
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </Box>
        )}
        
        {(paymentType === "Monthly" || paymentType === "Annually") && (
          <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
            <FormControl size="small" sx={{ width: 'auto', minWidth: '80px' }}>
              <InputLabel>Due Day</InputLabel>
              <Select
                value={tenant.billingDetails?.dueDay || 1}
                label="Due Day"
              >
                {[...Array(31)].map((_, i) => (
                  <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
                ))}
                <MenuItem value="End of Month">End of Month</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        
        {paymentType === "Annually" && (
          <Box sx={{ minWidth: '200px', flex: '0 1 auto' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Due Month</InputLabel>
              <Select
                value={tenant.billingDetails?.dueMonth || 1}
                label="Due Month"
              >
                {[
                  { value: 1, label: "January" },
                  { value: 2, label: "February" },
                  { value: 3, label: "March" },
                  { value: 4, label: "April" },
                  { value: 5, label: "May" },
                  { value: 6, label: "June" },
                  { value: 7, label: "July" },
                  { value: 8, label: "August" },
                  { value: 9, label: "September" },
                  { value: 10, label: "October" },
                  { value: 11, label: "November" },
                  { value: 12, label: "December" }
                ].map(month => (
                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
      
      {/* Device Contract Section */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Device Contract
      </Typography>
      <Box sx={{ pl: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Total Devices: {totalDevices}
        </Typography>
        
        {deviceContract.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pr: 0, width: '120px' }}>Device Type</TableCell>
                  <TableCell align="left" sx={{ pl: 0, width: '60px' }}>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deviceContract.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ pr: 0, width: '120px' }}>{item.type}</TableCell>
                    <TableCell align="left" sx={{ pl: 0, width: '60px' }}>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No device contract information available.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
