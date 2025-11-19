declare module "react-gauge-chart" {
  import * as React from "react";

  export interface GaugeChartProps {
    id?: string;
    nrOfLevels?: number;
    arcsLength?: number[];
    colors?: string[];
    arcPadding?: number;
    arcWidth?: number;
    cornerRadius?: number;
    needleColor?: string;
    needleBaseColor?: string;
    hideText?: boolean;
    animate?: boolean;
    animationDuration?: number;
    percent?: number;
    textColor?: string;
    className?: string;
    style?: React.CSSProperties;
    formatTextValue?: (value: number) => string;
    animateDuration?: number;
  }

  const GaugeChart: React.FC<GaugeChartProps>;

  export default GaugeChart;
}

