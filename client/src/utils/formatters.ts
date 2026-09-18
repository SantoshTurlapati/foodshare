import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function isDateExpired(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    return isPast(parseISO(dateString));
  } catch {
    return false;
  }
}

export function formatCategoryName(category: string): string {
  const map: Record<string, string> = {
    cooked_meal: 'Cooked Meals',
    raw_grocery: 'Raw Groceries',
    bakery: 'Bakery & Bread',
    packaged: 'Packaged Foods',
    fruits_veggies: 'Fruits & Vegetables',
    dairy: 'Dairy Products',
    beverages: 'Beverages',
    other: 'Other Food'
  };
  return map[category] || category;
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    cooked_meal: 'bg-orange-100 text-orange-800 border-orange-200',
    raw_grocery: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bakery: 'bg-amber-100 text-amber-800 border-amber-200',
    packaged: 'bg-blue-100 text-blue-800 border-blue-200',
    fruits_veggies: 'bg-green-100 text-green-800 border-green-200',
    dairy: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    beverages: 'bg-teal-100 text-teal-800 border-teal-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return map[category] || 'bg-gray-100 text-gray-800 border-gray-200';
}
