import { Subscription } from '../commons/models.js';
import { PaginationParams, PaginatedResponse, ItemResponse, ISubscriptionService } from './types.js';
import { delay } from './utils/delay.js';
import { subscriptions } from './FakerData/index.js';

export class SubscriptionService implements ISubscriptionService {
  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<ItemResponse<Subscription>> {
    await delay();
    
    const subscription = subscriptions.find((sub: any) => sub.id === id);
    
    if (!subscription) {
      return {
        data: null,
        success: false,
        message: `Subscription with ID ${id} not found`
      };
    }
    
    return {
      data: subscription,
      success: true
    };
  }

  /**
   * Get paginated list of subscriptions with filtering and sorting
   */
  async getSubscriptions(params: PaginationParams): Promise<PaginatedResponse<Subscription>> {
    await delay();
    
    let result = [...subscriptions];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'name') {
            result = result.filter(subscription => 
              subscription.name.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'type') {
            result = result.filter(subscription => 
              subscription.type === value
            );
          } else if (key === 'status') {
            result = result.filter(subscription => 
              subscription.status === value
            );
          } else {
            result = result.filter(subscription => 
              (subscription as any)[key] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      result.sort((a, b) => {
        let valueA = a[params.sort!.field as keyof Subscription] || '';
        let valueB = b[params.sort!.field as keyof Subscription] || '';
        
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
   * Get all subscriptions without pagination, filtering, or sorting
   * Used for data export and other bulk operations
   */
  async getAllSubscriptions(): Promise<Subscription[]> {
    await delay();
    return subscriptions;
  }
}
