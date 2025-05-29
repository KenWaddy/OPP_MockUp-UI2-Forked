/**
 * Utility functions for billing calculations
 */

import { Billing } from './models';

/**
 * Calculate the next billing date based on billing details
 * @param billing The billing details object
 * @returns Formatted string representing the next billing date (YYYY-MM-DD), "Ended" for ended contracts, or "—" for invalid data
 */
export function calculateNextBillingDate(billing: any): string {
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
    return "—";
  }

  if (billing.paymentType === "Monthly") {
    if (!billing.endDate) return '—';
    
    try {
      const endDate = new Date(billing.endDate);
      const endDay = endDate.getDate();
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-indexed
      
      const candidateDate = new Date(currentYear, currentMonth, endDay);
      
      if (candidateDate <= today) {
        candidateDate.setMonth(currentMonth + 1);
      }
      
      return candidateDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (e) {
      return '—';
    }
  }
  
  if (billing.paymentType === "Annually") {
    if (!billing.endDate) return '—';
    
    try {
      const endDate = new Date(billing.endDate);
      const nextBillingDate = new Date(endDate);
      nextBillingDate.setMonth(endDate.getMonth() - 1);
      
      return nextBillingDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (e) {
      return '—';
    }
  }

  return "—"; // Default fallback
}
