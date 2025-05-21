import { Tenant } from './types.js';

export const mockTenants = [
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
    billingDetails: [{
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
    {
      billingId: "BID-001-A",
      deviceContract: [
        { type: "IoT", quantity: 25 }
      ],
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      paymentType: "Annually",
      dueDay: 1,
      dueMonth: 6,
      billingStartDate: "2023-06-01"
    }],
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
      }
    ]
  }
];
