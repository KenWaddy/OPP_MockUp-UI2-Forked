import { Tenant } from './types';

export const mockTenants: Tenant[] = [
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
    billingDetails: [{
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
    }],
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
    billingDetails: [{
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
    }],
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
    billingDetails: [{
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
    {
      billingId: "BID-004-OT",
      deviceContract: [
        { type: "Server", quantity: 2 },
        { type: "Workstation", quantity: 5 }
      ],
      startDate: "2023-08-01",
      endDate: "2023-08-31",
      paymentType: "One-time",
      billingDate: "2023-08-15",
      billingStartDate: "2023-08-01"
    }],
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
    billingDetails: [{
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
    }],
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
    billingDetails: [{
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
    }],
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
        deviceId: "IOT-002",
        serialNo: "BCD123456789",
        description: "Main controller for production line",
        status: "Activated",
        attributes: [
          { key: "Connectivity", value: "Ethernet, Wi-Fi" },
          { key: "Protocol", value: "MQTT, OPC UA" },
          { key: "Certification", value: "IEC 61508 SIL 2" }
        ]
      }
    ]
  }
];
