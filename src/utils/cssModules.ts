/**
 * CSS Modules Utility Functions
 * Provides type-safe class name generation for CSS Modules
 */

import clsx from 'clsx';

/**
 * Combines CSS module classes with conditional logic
 * @param classes - Object mapping class names to their CSS module equivalents
 * @param conditions - Object mapping condition names to boolean values
 * @returns Combined class names string
 */
export function cn(
  classes: Record<string, string>,
  conditions: Record<string, boolean | undefined> = {}
): string {
  const classArray: string[] = [];
  
  Object.entries(conditions).forEach(([key, condition]) => {
    if (condition && classes[key]) {
      classArray.push(classes[key]);
    }
  });
  
  return clsx(...classArray);
}

/**
 * Simple class name utility for CSS Modules
 * @param styles - CSS Module styles object
 * @param classNames - Array of class names or conditional objects
 * @returns Combined class names string
 */
export function classNames(
  styles: Record<string, string>,
  ...classNames: Array<string | Record<string, boolean> | undefined>
): string {
  return clsx(
    ...classNames.map(cls => {
      if (typeof cls === 'string') {
        return styles[cls] || cls;
      }
      if (typeof cls === 'object' && cls) {
        return Object.entries(cls)
          .filter(([, condition]) => condition)
          .map(([name]) => styles[name] || name);
      }
      return undefined;
    })
  );
}

/**
 * Debug utility to see what CSS classes are being applied
 * Only works in development mode
 */
export function debugClasses(componentName: string, classes: string): void {
  if (import.meta.env.DEV) {
    console.log(`[CSS Modules Debug] ${componentName}:`, classes);
  }
}