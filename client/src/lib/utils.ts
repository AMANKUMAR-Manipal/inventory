import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function calculateStockStatus(quantity: number, minLevel: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (quantity <= 0) {
    return 'Out of Stock';
  } else if (quantity <= minLevel) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

export function getStockStatusColor(status: string): { bg: string, text: string } {
  switch (status) {
    case 'In Stock':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'Low Stock':
      return { bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'Out of Stock':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

export function parseCSV(content: string): any[] {
  // Simple CSV parsing logic
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(val => val.trim());
    const obj: Record<string, any> = {};
    
    for (let j = 0; j < headers.length; j++) {
      // Try to convert to number if possible
      const value = values[j];
      if (!isNaN(Number(value)) && value !== '') {
        obj[headers[j]] = Number(value);
      } else {
        obj[headers[j]] = value;
      }
    }
    
    results.push(obj);
  }
  
  return results;
}

export function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  
  const rows = data.map(obj => {
    return headers.map(header => {
      const val = obj[header];
      // Handle commas and quotes in values
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
}

export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
