import { TenantType, DeviceContractItem, BillingWithTenant } from '../commons/models.js';
import { PaginationParams, PaginatedResponse, ItemResponse, IBillingService } from './types.js';
import { delay } from './utils/delay.js';
import { 
  billing, tenants,
  addBilling as addBillingToStore,
  updateBilling as updateBillingInStore,
  deleteBilling as deleteBillingFromStore,
  getNextBillingIdForTenant
} from './FakerData/index.js';
import { Billing } from '../commons/models.js';

export class BillingService implements IBillingService {
  /**
   * Calculate the next billing date for a billing item
   * @param item The billing item
   * @returns The next billing date in YYYY-MM-DD format, "Ended" for ended contracts, or "—" for invalid data
   */
  private calculateNextBillingDate(item: BillingWithTenant): string {
    if (!item) return '—';
    
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
    
    if (item.paymentType === 'One-time') {
      return '—';
    } 
    else if (item.paymentType === 'Monthly') {
      if (!item.endDate) return '—';
      
      try {
        const endDate = new Date(item.endDate);
        const endDay = endDate.getDate();
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-indexed
        
        const candidateDate = new Date(currentYear, currentMonth, endDay);
        
        if (candidateDate <= today) {
          candidateDate.setMonth(currentMonth + 1);
          candidateDate.setDate(endDay);
        }
        
        return candidateDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (e) {
        return '—';
      }
    }
    else if (item.paymentType === 'Annually') {
      if (!item.endDate) return '—';
      
      try {
        const endDate = new Date(item.endDate);
        const nextBillingDate = new Date(endDate);
        nextBillingDate.setMonth(endDate.getMonth() - 1);
        
        return nextBillingDate.toISOString().split('T')[0]; // YYYY-MM-DD format
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
      } else if (billingItem.paymentType === 'Annually') {
        nextBillingDate = new Date().toISOString().split('T')[0]; // Placeholder
      } else if (billingItem.paymentType === 'One-time') {
        nextBillingDate = billingItem.startDate || '';
      }
      
      billingItems.push({
        id: billingItem.id,
        subscriptionId: tenant.id,
        tenantName: tenant.name,
        deviceContract: billingItem.deviceContract || [],
        startDate: billingItem.startDate || '',
        endDate: billingItem.endDate || '',
        paymentType: billingItem.paymentType || 'Monthly',
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
              const nextBillingDate = this.calculateNextBillingDate(item);
              return nextBillingDate !== '—' && nextBillingDate >= String(value);
            });
          } else if (key === 'nextBillingTo') {
            result = result.filter(item => {
              const nextBillingDate = this.calculateNextBillingDate(item);
              return nextBillingDate !== '—' && nextBillingDate <= String(value);
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
        
        if (field === 'nextBillingDate') {
          const nextBillingDateA = this.calculateNextBillingDate(a);
          const nextBillingDateB = this.calculateNextBillingDate(b);
          
          if (nextBillingDateA === 'Ended' && nextBillingDateB !== 'Ended') {
            return params.sort!.order === 'asc' ? 1 : -1;
          }
          if (nextBillingDateA !== 'Ended' && nextBillingDateB === 'Ended') {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          if (nextBillingDateA === '—' && nextBillingDateB !== '—') {
            return params.sort!.order === 'asc' ? 1 : -1;
          }
          if (nextBillingDateA !== '—' && nextBillingDateB === '—') {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          
          if (nextBillingDateA !== '—' && nextBillingDateA !== 'Ended' && 
              nextBillingDateB !== '—' && nextBillingDateB !== 'Ended') {
            // For ISO date strings (YYYY-MM-DD), string comparison works for sorting
            if (nextBillingDateA < nextBillingDateB) {
              return params.sort!.order === 'asc' ? -1 : 1;
            }
            if (nextBillingDateA > nextBillingDateB) {
              return params.sort!.order === 'asc' ? 1 : -1;
            }
          }
          
          if (nextBillingDateA < nextBillingDateB) {
            return params.sort!.order === 'asc' ? -1 : 1;
          }
          if (nextBillingDateA > nextBillingDateB) {
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
      
      const nextBillingDate = this.calculateNextBillingDate({
        id: billingItem.id,
        subscriptionId: tenant.id,
        tenantName: tenant.name,
        deviceContract: billingItem.deviceContract || [],
        startDate: billingItem.startDate || '',
        endDate: billingItem.endDate || '',
        paymentType: billingItem.paymentType || 'Monthly',
        description: billingItem.description,
        nextBillingDate: '',
        totalDevices
      });
      
      // Payment settings now only show the payment type without additional date/month information
      let paymentSettings = billingItem.paymentType || 'N/A';
      
      billingItems.push({
        subscriptionId: tenant.id,
        tenantName: tenant.name,
        id: billingItem.id || '',
        startDate: billingItem.startDate || '',
        endDate: billingItem.endDate || '',
        nextBillingDate,
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
