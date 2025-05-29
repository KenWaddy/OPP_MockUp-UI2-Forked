/**
 * Utility functions for billing calculations
 */

import { Billing } from './models';

/**
 * Format a date to YYYY-MM-DD in local timezone
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the next billing date based on billing details
 * @param billing The billing details object
 * @returns Formatted string representing the next billing date (YYYY-MM-DD), "—" for ended contracts or invalid data
 */
export function calculateNextBillingDate(billing: any): string {
  if (!billing) return '—';

  if (billing.endDate) {
    try {
      const endDate = new Date(billing.endDate);
      const currentDate = new Date();
      if (currentDate > endDate) {
        return "—";
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
        candidateDate.setDate(endDay);
      }
      
      return formatLocalDate(candidateDate); // YYYY-MM-DD format in local timezone
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
      
      return formatLocalDate(nextBillingDate); // YYYY-MM-DD format in local timezone
    } catch (e) {
      return '—';
    }
  }

  return "—"; // Default fallback
}

/**
 * Calculate the contract period between start and end dates
 * @param startDate The contract start date (YYYY-MM-DD format)
 * @param endDate The contract end date (YYYY-MM-DD format) 
 * @returns Formatted string in "XX months (XXXX days)" format, or "N/A" for invalid/missing dates
 */
export function calculateContractPeriod(startDate: string, endDate: string | null | undefined): string {
  if (!startDate || !endDate || endDate === 'N/A') {
    return 'N/A';
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 'N/A';
    }

    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    const totalMonths = yearDiff * 12 + monthDiff;

    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return `${totalMonths} months (${totalDays} days)`;
  } catch (e) {
    return 'N/A';
  }
}
