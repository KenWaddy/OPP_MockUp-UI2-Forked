import { mockTenants } from '../mocks/index.js';
import { Tenant, DeviceContractItem } from '../mocks/types.js';
import { PaginationParams, PaginatedResponse, IBillingService } from './types.js';
import { delay } from '../utils/delay.js';
import { flatBilling, flatTenants } from '../mocks/data/index.js';

interface BillingItem {
  id: string;
  tenantId: string;
  tenantName: string;
  billingId: string;
  startDate: string;
  endDate: string;
  paymentType: string;
  nextBillingDate: string;
  totalDevices: number;
}

export class BillingService implements IBillingService {
  /**
   * Calculate the next billing month for a billing item
   * @param item The billing item
   * @returns The next billing month in YYYY-MM format
   */
  private calculateNextBillingMonth(item: BillingItem): string {
    if (!item) return '—';
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    
    if (item.endDate) {
      try {
        const endDate = new Date(item.endDate);
        const currentDate = new Date();
        
        if (currentDate > endDate) {
          return 'Ended';
        }
      } catch (e) {
      }
    }
    
    if (item.paymentType === 'Monthly') {
      let nextBillingYear = currentYear;
      let nextBillingMonth = currentMonth;
      
      return `${nextBillingYear}-${String(nextBillingMonth + 1).padStart(2, '0')}`;
    } 
    else if (item.paymentType === 'Annually') {
      if (!item.endDate) return '—';
      
      try {
        const endDate = new Date(item.endDate);
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth(); // 0-11
        
        return `${endYear}-${String(endMonth + 1).padStart(2, '0')}`;
      } catch (e) {
        return '—';
      }
    } 
    else if (item.paymentType === 'One-time') {
      if (!item.startDate) return '—';
      
      try {
        const startDate = new Date(item.startDate);
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth(); // 0-11
        
        return `${startYear}-${String(startMonth + 1).padStart(2, '0')}`;
      } catch (e) {
        return '—';
      }
    }
    
    return '—'; // Default for unknown payment types
  }

  /**
   * Get paginated billing information
   */
  async getBillingItems(params: PaginationParams): Promise<PaginatedResponse<BillingItem>> {
    await delay();
    
    const billingItems: BillingItem[] = [];
    
    flatBilling.forEach(billing => {
      const tenant = flatTenants.find(t => t.id === billing.tenantId);
      if (!tenant) return;
      
      const totalDevices = billing.deviceContract?.reduce(
        (sum: number, contract: DeviceContractItem) => sum + contract.quantity, 0
      ) || 0;
      
      let nextBillingDate = '';
      if (billing.paymentType === 'Monthly' && billing.dueDay) {
        nextBillingDate = new Date().toISOString().split('T')[0]; // Placeholder
      } else if (billing.paymentType === 'Annually' && billing.dueDay && billing.dueMonth) {
        nextBillingDate = new Date().toISOString().split('T')[0]; // Placeholder
      } else if (billing.paymentType === 'One-time' && billing.billingDate) {
        nextBillingDate = billing.billingDate;
      }
      
      billingItems.push({
        id: `${tenant.id}-${billing.billingId}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        billingId: billing.billingId || '',
        startDate: billing.startDate || '',
        endDate: billing.endDate || '',
        paymentType: billing.paymentType || 'Monthly',
        nextBillingDate,
        totalDevices
      });
    });
    
    let result = [...billingItems];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'unifiedSearch') {
            const searchValue = String(value).toLowerCase();
            result = result.filter(item => 
              item.tenantName.toLowerCase().includes(searchValue) || 
              item.billingId.toLowerCase().includes(searchValue)
            );
          } else if (key === 'tenantName') {
            result = result.filter(item => 
              item.tenantName.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'billingId') {
            result = result.filter(item => 
              item.billingId.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'paymentType') {
            result = result.filter(item => 
              item.paymentType === value
            );
          } else if (key === 'nextBillingFrom') {
            result = result.filter(item => {
              const nextBillingMonth = this.calculateNextBillingMonth(item);
              return nextBillingMonth !== '—' && nextBillingMonth >= String(value);
            });
          } else if (key === 'nextBillingTo') {
            result = result.filter(item => {
              const nextBillingMonth = this.calculateNextBillingMonth(item);
              return nextBillingMonth !== '—' && nextBillingMonth <= String(value);
            });
          } else {
            result = result.filter(item => 
              item[key as keyof BillingItem] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      result.sort((a, b) => {
        const valueA = a[params.sort!.field as keyof BillingItem];
        const valueB = b[params.sort!.field as keyof BillingItem];
        
        if (valueA < valueB) {
          return params.sort!.order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return params.sort!.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    const total = result.length;
    const totalPages = Math.ceil(total / params.limit);
    
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedData = result.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages
      }
    };
  }

  /**
   * Get all billing items without pagination, filtering, or sorting
   * Used for data export and other bulk operations
   */
  async getAllBillingItems(): Promise<any[]> {
    await delay();
    
    const billingItems: any[] = [];
    
    flatBilling.forEach(billing => {
      const tenant = flatTenants.find(t => t.id === billing.tenantId);
      if (!tenant) return;
      
      const totalDevices = billing.deviceContract?.reduce(
        (sum: number, contract: DeviceContractItem) => sum + contract.quantity, 0
      ) || 0;
      
      const deviceContractFormatted = billing.deviceContract?.map(contract => 
        `${contract.type}: ${contract.quantity}`
      ).join(', ') || '';
      
      const nextBillingMonth = this.calculateNextBillingMonth({
        id: `${tenant.id}-${billing.billingId}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        billingId: billing.billingId || '',
        startDate: billing.startDate || '',
        endDate: billing.endDate || '',
        paymentType: billing.paymentType || 'Monthly',
        nextBillingDate: '',
        totalDevices
      });
      
      let paymentSettings = billing.paymentType || 'N/A';
      
      if (billing.paymentType === 'One-time' && billing.billingDate) {
        paymentSettings += ` | Billing Date: ${billing.billingDate}`;
      }
      
      if ((billing.paymentType === 'Monthly' || billing.paymentType === 'Annually') && billing.dueDay) {
        paymentSettings += ` | Due Day: ${billing.dueDay}`;
      }
      
      if (billing.paymentType === 'Annually' && billing.dueMonth) {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = typeof billing.dueMonth === 'number' && billing.dueMonth >= 1 && billing.dueMonth <= 12
          ? months[billing.dueMonth - 1]
          : billing.dueMonth;
        
        paymentSettings += ` | Due Month: ${month}`;
      }
      
      billingItems.push({
        tenantId: tenant.id,
        tenantName: tenant.name,
        billingId: billing.billingId || '',
        startDate: billing.startDate || '',
        endDate: billing.endDate || '',
        billingStartDate: billing.billingStartDate || '',
        nextBillingMonth,
        paymentSettings,
        numberOfDevices: totalDevices,
        deviceContractDetails: deviceContractFormatted
      });
    });
    
    return billingItems;
  }
}
