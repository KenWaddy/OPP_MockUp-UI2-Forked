/**
 * Utility functions for billing calculations
 */

import { Billing } from './models';

/**
 * Calculate the next billing month based on billing details
 * @param billing The billing details object
 * @returns Formatted string representing the next billing month (YYYY-MM), "Ended" for ended contracts, or "—" for invalid data
 */
export function calculateNextBillingMonth(billing: any): string {
  if (!billing) return '—';

  if (billing.endDate) {
    try {
      const endDate = new Date(billing.endDate);
      const currentDate = new Date();

      if (currentDate > endDate) {
        return "Ended";
      }
    } catch (e) {
      // Invalid date format, continue with other calculations
    }
  }

  if (billing.paymentType === "One-time") {
    if (billing.startDate) {
      try {
        const startDate = new Date(billing.startDate);
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth(); // 0-indexed
        
        return `${startYear}-${String(startMonth + 1).padStart(2, '0')}`;
      } catch (e) {
        return '—'; // Invalid start date
      }
    }
    return '—'; // No start date available
  }

  if (billing.paymentType === "Monthly") {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // JavaScript months are 0-indexed

    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  }
  
  if (billing.paymentType === "Annually") {
    if (billing.endDate) {
      try {
        const endDate = new Date(billing.endDate);
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth(); // 0-11

        return `${endYear}-${String(endMonth + 1).padStart(2, '0')}`;
      } catch (e) {
        return '—'; // Invalid end date
      }
    }
    return '—'; // No end date available
  }

  return "—"; // Default fallback
}
