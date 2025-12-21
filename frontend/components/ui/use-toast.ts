/**
 * Missing UI Component Utility
 * Create this file for the use-toast hook referenced in components
 */

import { toast } from 'react-hot-toast';

export function useToast() {
  return {
    toast: (options: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      if (options.variant === 'destructive') {
        toast.error(`${options.title}${options.description ? ': ' + options.description : ''}`);
      } else {
        toast.success(`${options.title}${options.description ? ': ' + options.description : ''}`);
      }
    }
  };
}