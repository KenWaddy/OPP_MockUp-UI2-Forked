import { mockTenants } from '../mocks/index.js';

export class BillingService {
  /**
   * Get paginated billing information
   */
  getBillingItems(params) {
    const billingItems = [];
    
    mockTenants.forEach(tenant => {
      if (tenant.billingDetails && tenant.billingDetails.length > 0) {
        tenant.billingDetails.forEach(billing => {
          const totalDevices = billing.deviceContract?.reduce(
            (sum, contract) => sum + contract.quantity, 0
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
      }
    });
    
    let result = [...billingItems];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'tenantName') {
            result = result.filter(item => 
              item.tenantName.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'paymentType') {
            result = result.filter(item => 
              item.paymentType === value
            );
          } else {
            result = result.filter(item => 
              item[key] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      result.sort((a, b) => {
        const valueA = a[params.sort?.field] || '';
        const valueB = b[params.sort?.field] || '';
        
        if (valueA < valueB) {
          return params.sort?.order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return params.sort?.order === 'asc' ? 1 : -1;
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
}
