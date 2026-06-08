import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(date: Date, locale?: string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return locale === 'zh' ? '刚刚' : 'just now';
  if (diffMin < 60) return `${diffMin}${locale === 'zh' ? '分钟前' : 'm ago'}`;
  if (diffHour < 24) return `${diffHour}${locale === 'zh' ? '小时前' : 'h ago'}`;
  if (diffDay < 30) return `${diffDay}${locale === 'zh' ? '天前' : 'd ago'}`;
  return date.toLocaleDateString(locale);
}
