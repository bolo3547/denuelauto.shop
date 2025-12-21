/**
 * Recharts React 18 Type Compatibility Fix
 * 
 * This file provides type-safe wrappers for recharts components
 * to work around the React 18 type incompatibility issue.
 * 
 * Issue: recharts uses an older version of @types/react internally,
 * which conflicts with React 18's stricter JSX element types.
 */

'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  FunnelChart,
  Funnel,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList,
} from 'recharts';
import React from 'react';

// Type-safe wrapper components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ResponsiveContainerFix = ResponsiveContainer as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LineChartFix = LineChart as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LineFix = Line as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AreaChartFix = AreaChart as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AreaFix = Area as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BarChartFix = BarChart as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BarFix = Bar as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PieChartFix = PieChart as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PieFix = Pie as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FunnelChartFix = FunnelChart as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FunnelFix = Funnel as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const XAxisFix = XAxis as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const YAxisFix = YAxis as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CartesianGridFix = CartesianGrid as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TooltipFix = Tooltip as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LegendFix = Legend as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CellFix = Cell as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LabelListFix = LabelList as unknown as React.FC<any>;
