// Type declarations for libraries with React 18 incompatibility issues

import { ComponentType } from 'react';

// Recharts components need special handling due to React types mismatch
declare module 'recharts' {
  export const ResponsiveContainer: ComponentType<any>;
  export const LineChart: ComponentType<any>;
  export const BarChart: ComponentType<any>;
  export const PieChart: ComponentType<any>;
  export const AreaChart: ComponentType<any>;
  export const Line: ComponentType<any>;
  export const Bar: ComponentType<any>;
  export const Pie: ComponentType<any>;
  export const Area: ComponentType<any>;
  export const XAxis: ComponentType<any>;
  export const YAxis: ComponentType<any>;
  export const CartesianGrid: ComponentType<any>;
  export const Tooltip: ComponentType<any>;
  export const Legend: ComponentType<any>;
  export const Cell: ComponentType<any>;
}

// bcrypt declaration
declare module 'bcrypt' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  export function hashSync(data: string, saltOrRounds: string | number): string;
  export function compareSync(data: string, encrypted: string): boolean;
  export function genSaltSync(rounds?: number): string;
}

// nodemailer declaration
declare module 'nodemailer' {
  export function createTransport(options: any): any;
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }
}

// node-fetch declaration
declare module 'node-fetch' {
  export default function fetch(url: string, init?: any): Promise<Response>;
  export { Response, Headers, Request };
}

// @headlessui/react declaration
declare module '@headlessui/react' {
  export const Menu: ComponentType<any> & {
    Button: ComponentType<any>;
    Items: ComponentType<any>;
    Item: ComponentType<any>;
  };
  export const Transition: ComponentType<any>;
  export const Dialog: ComponentType<any> & {
    Panel: ComponentType<any>;
    Title: ComponentType<any>;
    Description: ComponentType<any>;
  };
  export const Listbox: ComponentType<any>;
  export const Combobox: ComponentType<any>;
  export const Disclosure: ComponentType<any>;
  export const Popover: ComponentType<any>;
  export const RadioGroup: ComponentType<any>;
  export const Switch: ComponentType<any>;
  export const Tab: ComponentType<any>;
}
