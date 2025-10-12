declare module 'react-day-picker' {
  import * as React from 'react';
  export interface DayPickerProps extends React.HTMLAttributes<HTMLDivElement> {
    showOutsideDays?: boolean;
    className?: string;
    components?: {
      IconLeft?: React.ComponentType<any>;
      IconRight?: React.ComponentType<any>;
    };
    [key: string]: any;
  }
  export const DayPicker: React.FC<DayPickerProps>;
}