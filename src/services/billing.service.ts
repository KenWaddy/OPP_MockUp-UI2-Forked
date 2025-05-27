import { mockTenants } from '../mocks/index.js';
import { TenantType, DeviceContractItem } from '../types/models.js';
import { PaginationParams, PaginatedResponse, ItemResponse, IBillingService } from './types.js';
import { delay } from '../utils/delay.js';
import { 
  billing, tenants,
  addBilling as addBillingToStore,
  updateBilling as updateBillingInStore,
  deleteBilling as deleteBillingFromStore,
  getNextBillingIdForTenant
} from '../mocks/data/index.js';
import { Billing } from '../types/models.js';

interface BillingWithTenant extends Billing {
  tenantName: string;
  nextBillingDate: string;
  totalDevices: number;
}

export class BillingService implements IBillingService {
  /**
   * Calculate the next billing month for a billing item
   * @param item The billing item
   * @returns The next billing month in YYYY-MM format
   */
  private calculateNextBillingMonth(item: BillingWithTenant): string {
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
  async getBillingItems(params: PaginationParams): Promise<PaginatedResponse<Billing>> {
    await delay();
    
    const billingItems: BillingWithTenant[] = [];
    
    billing.forEach((billingItem: any) => {
      const tenant = tenants.find((t: any) => t.id === billingItem.subscriptionId);
      if (!tenant) return;
      
      const totalDevices = billingItem.deviceContract?.reduce(
        (sum: number, contract: DeviceContractItem) => sum + contract.quantity, 0
      ) || 0;
      
      let nextBillingDate = '';
      if (billingItem.paymentType === 'Monthly') {
        nextBillingDate = new Date().toISOString().split('T')[0]; // Placeholder
      } else if (billingItem.paymentType === 'Annually' && billingItem.dueMonth) {
        nextBillingDate = new Date().toISOString().split('T')[0]; // Placeholder
      } else if (billingItem.paymentType === 'One-time' && billingItem.billingDate) {
        nextBillingDate = billingItem.billingDate;
      }
      
      billingItems.push({
        id: `${tenant.id}-${billingItem.id}`,
        subscriptionId: tenant.id,
        tenantName: tenant.name,
        deviceContract: billingItem.deviceContract || [],
        startDate: billingItem.startDate || '',
        endDate: billingItem.endDate || '',
        paymentType: billingItem.paymentType || 'Monthly',
        billingDate: billingItem.billingDate,
        dueMonth: billingItem.dueMonth,
        description: billingItem.description,
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
              item.id.toLowerCase().includes(searchValue)
            );
          } else if (key === 'tenantName') {
            result = result.filter(item => 
              item.tenantName.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'id') {
            result = result.filter(item => 
              item.id.toLowerCase().includes(String(value).toLowerCase())
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
              item[key as keyof BillingWithTenant] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      result.sort((a, b) => {
        let field = params.sort!.field;
        if (field === 'paymentSettings') field = 'paymentType';
        if (field === 'contractStart') field = 'startDate';
        if (field === 'contractEnd') field = 'endDate';
        
        if (field === 'nextBillingMonth') {
          const nextBillingMonthA = this.calculateNextBillingMonth(a);
          const nextBillingMonthB = this.calculateNextBillingMonth(b);
          
          if (nextBillingMonthA === 'Ended' && nextBillingMonthB !== 'Ended') {
            return params.sort!.order === 'asc' ? 1 : -1;
          }
          if (nextBillingMonthA !== 'Ended' && nextBillingMonthB === 'Ended') {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          if (nextBillingMonthA === '—' && nextBillingMonthB !== '—') {
            return params.sort!.order === 'asc' ? 1 : -1;
          }
          if (nextBillingMonthA !== '—' && nextBillingMonthB === '—') {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          
          if (nextBillingMonthA !== '—' && nextBillingMonthA !== 'Ended' && 
              nextBillingMonthB !== '—' && nextBillingMonthB !== 'Ended') {
            const [yearA, monthA] = nextBillingMonthA.split('-').map(Number);
            const [yearB, monthB] = nextBillingMonthB.split('-').map(Number);
            
            if (yearA !== yearB) {
              return (yearA - yearB) * (params.sort!.order === 'asc' ? 1 : -1);
            }
            return (monthA - monthB) * (params.sort!.order === 'asc' ? 1 : -1);
          }
          
          if (nextBillingMonthA < nextBillingMonthB) {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          if (nextBillingMonthA > nextBillingMonthB) {
            return params.sort!.order === 'asc' ? 1 : -1;
          }
          return 0;
        }
        else if (field === 'startDate' || field === 'endDate') {
          const dateA = a[field as keyof BillingWithTenant] ? new Date(a[field as keyof BillingWithTenant] as string).getTime() : 0;
          const dateB = b[field as keyof BillingWithTenant] ? new Date(b[field as keyof BillingWithTenant] as string).getTime() : 0;
          
          if (dateA === 0 && dateB !== 0) {
            return params.sort!.order === 'asc' ? 1 : -1;
          }
          if (dateA !== 0 && dateB === 0) {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          
          return (dateA - dateB) * (params.sort!.order === 'asc' ? 1 : -1);
        }
        else {
          const valueA = a[field as keyof BillingWithTenant] || '';
          const valueB = b[field as keyof BillingWithTenant] || '';
          
          if (valueA < valueB) {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return params.sort!.order === 'asc' ? 1 : -1;
          }
          return 0;
        }
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
    
    billing.forEach((billingItem: any) => {
      const tenant = tenants.find((t: any) => t.id === billingItem.subscriptionId);
      if (!tenant) return;
      
      const totalDevices = billingItem.deviceContract?.reduce(
        (sum: number, contract: DeviceContractItem) => sum + contract.quantity, 0
      ) || 0;
      
      const deviceContractFormatted = billingItem.deviceContract?.map((contract: any) => 
        `${contract.type}: ${contract.quantity}`
      ).join(', ') || '';
      
      const nextBillingMonth = this.calculateNextBillingMonth({
        id: `${tenant.id}-${billingItem.id}`,
        subscriptionId: tenant.id,
        tenantName: tenant.name,
        deviceContract: billingItem.deviceContract || [],
        startDate: billingItem.startDate || '',
        endDate: billingItem.endDate || '',
        paymentType: billingItem.paymentType || 'Monthly',
        billingDate: billingItem.billingDate,
        dueMonth: billingItem.dueMonth,
        description: billingItem.description,
        nextBillingDate: '',
        totalDevices
      });
      
      let paymentSettings = billingItem.paymentType || 'N/A';
      
      if (billingItem.paymentType === 'One-time' && billingItem.billingDate) {
        paymentSettings += ` | Billing Date: ${billingItem.billingDate}`;
      }
      

      
      if (billingItem.paymentType === 'Annually' && billingItem.dueMonth) {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = typeof billingItem.dueMonth === 'number' && billingItem.dueMonth >= 1 && billingItem.dueMonth <= 12
          ? months[billingItem.dueMonth - 1]
          : billingItem.dueMonth;
        
        paymentSettings += ` | Due Month: ${month}`;
      }
      
      billingItems.push({
        subscriptionId: tenant.id,
        tenantName: tenant.name,
        id: billingItem.id || '',
        startDate: billingItem.startDate || '',
        endDate: billingItem.endDate || '',
        nextBillingMonth,
        paymentSettings,
        numberOfDevices: totalDevices,
        deviceContractDetails: deviceContractFormatted
      });
    });
    
    return billingItems;
  }

  /**
   * Add a new billing record
   */
  async addBilling(billingRecord: any): Promise<ItemResponse<any>> {
    await delay();
    
    try {
      const newBilling = {
        ...billingRecord,
        id: billingRecord.id || getNextBillingIdForTenant(billingRecord.subscriptionId)
      };
      
      addBillingToStore(newBilling);
      
      return {
        data: newBilling,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Error adding billing record: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Update an existing billing record
   */
  async updateBilling(billingRecord: any): Promise<ItemResponse<any>> {
    await delay();
    
    try {
      const existingBilling = billing.find((b: Billing) => b.id === billingRecord.id);
      
      if (!existingBilling) {
        return {
          data: null,
          success: false,
          message: `Billing record with ID ${billingRecord.id} not found`
        };
      }
      
      updateBillingInStore(billingRecord);
      
      return {
        data: billingRecord,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Error updating billing record: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Delete a billing record by ID
   */
  async deleteBilling(id: string): Promise<ItemResponse<boolean>> {
    await delay();
    
    try {
      const existingBilling = billing.find((b: Billing) => b.id === id);
      
      if (!existingBilling) {
        return {
          data: false,
          success: false,
          message: `Billing record with ID ${id} not found`
        };
      }
      
      deleteBillingFromStore(id);
      
      return {
        data: true,
        success: true
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: `Error deleting billing record: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
