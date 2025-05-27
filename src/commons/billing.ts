/**
 * Utility functions for billing calculations
 */

import { Billing } from './models';

/**
 * Calculate the next billing month based on billing details
 * @param billing The billing details object
 * @returns Formatted string representing the next billing month (YYYY-MM), "Ended" for ended contracts, or "—" for one-time payments
 */
export function calculateNextBillingMonth(billing: any): string {
  if (!billing) return '—';

  if (billing.paymentType === "One-time") {
    return "—";
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // JavaScript months are 0-indexed

  if (billing.endDate) {
    try {
      const endDate = new Date(billing.endDate);
      const currentDate = new Date();

      if (currentDate > endDate) {
        return "Ended";
      }
    } catch (e) {
    }
  }

  if (billing.paymentType === "Monthly") {
    let nextBillingYear = currentYear;
    let nextBillingMonth = currentMonth;

    return `${nextBillingYear}-${String(nextBillingMonth + 1).padStart(2, '0')}`;
  }
  else if (billing.paymentType === "Annually") {
    if (billing.dueMonth) {
      let nextBillingYear = currentYear;
      let nextBillingMonth = billing.dueMonth;
      
      if (currentMonth + 1 > billing.dueMonth) {
        nextBillingYear = currentYear + 1;
      }
      
      return `${nextBillingYear}-${nextBillingMonth.toString().padStart(2, '0')}`;
    }
    
    if (!billing.endDate) return '—';

    try {
      const endDate = new Date(billing.endDate);
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth(); // 0-11

      return `${endYear}-${String(endMonth + 1).padStart(2, '0')}`;
    } catch (e) {
      return '—';
    }
  }

  return "—";
}
