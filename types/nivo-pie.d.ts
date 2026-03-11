declare module '@nivo/pie' {
  import type { CSSProperties, ReactNode } from 'react';

  export type PieLayer<Datum> =
    | 'arcs'
    | 'arcLabels'
    | 'arcLinkLabels'
    | 'legends'
    | ((props: PieCustomLayerProps<Datum>) => ReactNode);

  export type DatumValue = number;

  export interface ComputedArc {
    startAngle: number;
    endAngle: number;
    angle: number;
    padAngle: number;
    innerRadius: number;
    outerRadius: number;
  }

  export interface ComputedDatum<Datum> {
    id: string;
    value: DatumValue;
    label: string;
    color: string;
    data: Datum;
    arc: ComputedArc;
  }

  export interface PieCustomLayerProps<Datum> {
    centerX: number;
    centerY: number;
    radius: number;
    innerRadius: number;
    dataWithArc: ComputedDatum<Datum>[];
  }

  export interface ResponsivePieProps<Datum> {
    data: Datum[];
    margin?: { top: number; right: number; bottom: number; left: number };
    innerRadius?: number;
    padAngle?: number;
    cornerRadius?: number;
    activeOuterRadiusOffset?: number;
    sortByValue?: boolean;
    enableArcLinkLabels?: boolean;
    enableArcLabels?: boolean;
    borderWidth?: number;
    colors?: string[] | ((datum: Datum) => string);
    defs?: Array<Record<string, unknown>>;
    fill?: Array<Record<string, unknown>>;
    layers?: PieLayer<Datum>[];
    theme?: Record<string, unknown>;
    tooltip?: (...args: any[]) => ReactNode;
    legends?: Array<Record<string, unknown>>;
    role?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    style?: CSSProperties;
  }

  export function ResponsivePie<Datum>(props: ResponsivePieProps<Datum>): JSX.Element;
}

