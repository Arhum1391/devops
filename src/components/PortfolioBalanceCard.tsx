'use client';

import { useEffect, useMemo, useState } from 'react';

export type TimeRange = '1Hr' | '1D' | '1W' | '1M' | '1Y';

export type ChartDatum = {
  label: string;
  value: number;
};

const GRID_POSITIONS = {
  monthLines: [12.5, 37.5, 62.5, 87.5],
  midLines: [25, 50, 75],
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100000 ? 0 : 2,
  }).format(value);

const RANGES: TimeRange[] = ['1Hr', '1D', '1W'];

export type PortfolioBalanceCardProps = {
  totalValue?: number | null;
  changePercent?: number | null;
  comparisonLabel?: string | null;
  chartData?: ChartDatum[];
  isLoading?: boolean;
  isChartLoading?: boolean;
  lastUpdated?: string | null;
  selectedRange?: TimeRange;
  onRangeChange?: (range: TimeRange) => void;
};

export default function PortfolioBalanceCard({
  totalValue,
  changePercent,
  comparisonLabel = 'Portfolio Value',
  chartData,
  isLoading = false,
  isChartLoading = false,
  selectedRange,
  onRangeChange,
}: PortfolioBalanceCardProps) {
  const [internalRange, setInternalRange] = useState<TimeRange>('1W');
  const activeRange = selectedRange ?? internalRange;
  const [recharts, setRecharts] = useState<typeof import('recharts') | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let mounted = true;
    import('recharts')
      .then(mod => {
        if (mounted) {
          setRecharts(mod);
        }
      })
      .catch(error => {
        console.error('Failed to load Recharts', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.matchMedia('(max-width: 768px)').matches);
      }
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  const series = useMemo<ChartDatum[]>(() => {
    if (!Array.isArray(chartData)) {
      return [];
    }
    return chartData
      .map(point => ({
        label: String(point?.label ?? ''),
        value: Number(point?.value ?? 0),
      }))
      .filter(point => Number.isFinite(point.value));
  }, [chartData]);

  const dataWithIndex = useMemo(
    () => series.map((point, index) => ({ ...point, index })),
    [series]
  );

  const hasData = dataWithIndex.length > 0;

  const yAxisLabels = useMemo(() => {
    if (!hasData) {
      return ['$0'];
    }
    
    // Get the range of values in the chart data
    const values = dataWithIndex.map(point => point.value).filter(v => Number.isFinite(v) && v > 0);
    if (values.length === 0) {
      return ['$0'];
    }
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // If all values are the same or very close, show a range around that value
    if (maxValue - minValue < maxValue * 0.01) {
      const baseValue = maxValue;
      const padding = Math.max(baseValue * 0.05, 100); // 5% padding or $100 minimum
      return [
        formatCurrency(baseValue + padding),
        formatCurrency(baseValue + padding * 0.33),
        formatCurrency(baseValue - padding * 0.33),
        formatCurrency(Math.max(0, baseValue - padding)),
      ];
    }
    
    // Normal case: show range from min to max with proper spacing
    const range = maxValue - minValue;
    const padding = range * 0.1; // 10% padding
    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);
    const step = (adjustedMax - adjustedMin) / 3;
    
    return [
      formatCurrency(adjustedMax),
      formatCurrency(adjustedMax - step),
      formatCurrency(adjustedMax - step * 2),
      formatCurrency(adjustedMin),
    ];
  }, [dataWithIndex, hasData]);

  const { yDomainMin, yDomainMax } = useMemo(() => {
    if (!hasData) {
      return { yDomainMin: 0, yDomainMax: 1 };
    }
    
    const values = dataWithIndex.map(point => point.value).filter(v => Number.isFinite(v) && v > 0);
    if (values.length === 0) {
      return { yDomainMin: 0, yDomainMax: 1 };
    }
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // If all values are the same or very close, use padding around that value
    if (maxValue - minValue < maxValue * 0.01) {
      const baseValue = maxValue;
      const padding = Math.max(baseValue * 0.05, 100);
      return {
        yDomainMin: Math.max(0, baseValue - padding),
        yDomainMax: baseValue + padding,
      };
    }
    
    // Normal case: use range with padding
    const range = maxValue - minValue;
    const padding = range * 0.1;
    return {
      yDomainMin: Math.max(0, minValue - padding),
      yDomainMax: maxValue + padding,
    };
  }, [dataWithIndex, hasData]);

  const sampledXAxisLabels = useMemo(() => {
    if (!hasData) {
      return [] as { percent: number; label: string }[];
    }

    const total = dataWithIndex.length;
    // Fewer labels on mobile to avoid crowding; keep desktop at 6
    const maxLabels = Math.min(isMobile ? 2 : 6, total);
    const step = Math.max(1, Math.floor(total / maxLabels));
    const indices: number[] = [];
    for (let i = 0; i < total; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== total - 1) {
      indices.push(total - 1);
    }

    return indices.map(idx => {
      const percent = total === 1 ? 50 : (idx / (total - 1)) * 100;
      return {
        percent,
        label: dataWithIndex[idx]?.label ?? '',
      };
    });
  }, [dataWithIndex, hasData, isMobile, activeRange]);

  const formattedValue =
    typeof totalValue === 'number' ? formatCurrency(totalValue) : '\u2014';
  const formattedChange =
    typeof changePercent === 'number'
      ? `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
      : null;



  const handleRangeClick = (range: TimeRange) => {
    if (!selectedRange) {
      setInternalRange(range);
    }
    onRangeChange?.(range);
  };

  const chartContainerState = useMemo(() => {
    if (isChartLoading) {
      return 'loading';
    }
    if (!hasData) {
      return 'empty';
    }
    return 'ready';
  }, [isChartLoading, hasData]);

  return (
    <div className="flex h-full min-h-[344px] w-full flex-col justify-between overflow-hidden rounded-2xl bg-[#1F1F1F] p-5 text-white shadow-[0_24px_48px_rgba(0,0,0,0.35)] portfolio-balance-card">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            /* Root card sizing to match mobile spec */
            .portfolio-balance-card {
              width: 343px !important;
              min-height: 215px !important;
              border-radius: 10px !important;
              padding: 20px 12px !important;
            }
            /* Header text sizes and layout breathing room */
            .portfolio-balance-card .text-[20px] {
              font-size: 16px !important;
              line-height: 130% !important;
            }
            .portfolio-balance-card .text-2xl {
              font-size: 20px !important;
              line-height: 120% !important;
            }
            /* Range selector pill like spec */
            .portfolio-balance-card .portfolio-range {
              background: rgba(222, 80, 236, 0.10) !important;
              border: 1px solid #DE50EC !important;
              border-radius: 100px !important;
              padding: 4px !important;
            }
            .portfolio-balance-card .portfolio-range button {
              padding: 4px 6px !important;
              font-size: 12px !important;
              line-height: 100% !important;
            }
            /* Chart area height in spec (within 215px card) */
            .portfolio-balance-card .chart-area {
              height: 160px !important;
            }
            /* X-axis labels smaller */
            .portfolio-balance-card .chart-area .text-xs {
              font-size: 9px !important;
              line-height: 1 !important;
              letter-spacing: 0 !important;
            }
            .portfolio-balance-card .x-axis-labels span {
              font-size: 9px !important;
              line-height: 1 !important;
            }
            /* Y-axis labels smaller */
            .portfolio-balance-card .y-axis-labels span {
              font-size: 10px !important;
              line-height: 1.1 !important;
              letter-spacing: 0.01em !important;
            }
            /* Hide amount and percent chip on mobile */
            .portfolio-balance-card .portfolio-balance-amount,
            .portfolio-balance-card .portfolio-balance-change {
              display: none !important;
            }
          }
        `,
        }}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[20px] font-semibold leading-[1.3]">{comparisonLabel}</span>
              <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                <span className="text-2xl font-semibold text-white portfolio-balance-amount">
                  {isLoading ? (
                    <span className="inline-block h-6 w-24 animate-pulse rounded bg-white/20" />
                  ) : (
                    formattedValue
                  )}
                </span>
                {formattedChange ? (
                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-medium portfolio-balance-change ${
                      changePercent && changePercent < 0
                        ? 'border-[#BB0404] bg-[rgba(187,4,4,0.12)] text-[#FF7A7A]'
                        : 'border-[#05B353] bg-[rgba(5,179,83,0.12)] text-[#05B353]'
                    }`}
                  >
                    {formattedChange}
                  </div>
                ) : null}
              </div>
              
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#DE50EC] bg-[rgba(222,80,236,0.1)] px-2 py-1 portfolio-range">
              {RANGES.map(range => {
                const isActive = range === activeRange;
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => handleRangeClick(range)}
                    className={`rounded-full px-3 py-1 text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1F1F1F] text-[#DE50EC] shadow-[0_0_0_1px_rgba(222,80,236,0.6)]'
                        : 'text-[#DE50EC]'
                    }`}
                    disabled={isChartLoading && isActive}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="max-w-[380px] text-sm font-medium leading-[1.1] text-white/80">
            Track allocation, P/L, and trends - all in one place.
          </p>
        </div>

        <div className="relative flex h-[200px] w-full items-center chart-area" key={activeRange}>
          <div className="flex h-full w-full gap-4 pl-6 pr-6">
            <div
              className="flex h-full flex-col justify-between text-right text-xs font-medium tracking-[0.02em] text-white y-axis-labels"
              style={{ paddingTop: '8px', paddingBottom: '24px' }}
            >
              {yAxisLabels.map(label => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="relative h-full w-full">
              <div className="pointer-events-none absolute inset-x-0 top-2 bottom-[24px] z-0">
                {GRID_POSITIONS.monthLines.map((position, index) => (
                  <span
                    key={`month-line-${index}`}
                    className="absolute top-0 bottom-0 border-l border-dashed border-[#909090]/45"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    aria-hidden
                  />
                ))}

                {GRID_POSITIONS.midLines.map((position, index) => (
                  <span
                    key={`mid-line-${index}`}
                    className="absolute top-0 bottom-0 border-l border-dashed border-[#909090]/25"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    aria-hidden
                  />
                ))}
              </div>

              {recharts && chartContainerState === 'ready' ? (
                <recharts.ResponsiveContainer width="100%" height="100%">
                  <recharts.AreaChart data={dataWithIndex} margin={{ top: 16, right: 0, bottom: 16, left: 0 }}>
                    <recharts.XAxis
                      dataKey="index"
                      type="number"
                      domain={dataWithIndex.length > 1 ? [0, dataWithIndex.length - 1] : [0, 1]}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={false}
                    />
                    <recharts.YAxis
                      domain={[yDomainMin, yDomainMax]}
                      hide
                      axisLine={false}
                      tickLine={false}
                      tickMargin={16}
                    />
                    <recharts.Area
                      type="monotone"
                      dataKey="value"
                      stroke="#DE50EC"
                      strokeWidth={4}
                      fill="none"
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                  </recharts.AreaChart>
                </recharts.ResponsiveContainer>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl border border-white/10 bg-[#151515] text-sm text-white/60">
                  {chartContainerState === 'loading' ? 'Loading chart…' : 'No chart data available yet.'}
                </div>
              )}

              {chartContainerState === 'loading' && hasData && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1F1F1F]/40">
                  <span className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                </div>
              )}

              {chartContainerState === 'ready' && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 flex items-start pt-1 text-xs font-medium tracking-[0.02em] text-white x-axis-labels">
                  {sampledXAxisLabels.map(({ percent, label }) => (
                    <span
                      key={`${percent}-${label}`}
                      className="absolute whitespace-nowrap"
                      style={{
                        left: `${percent}%`,
                        transform:
                          percent <= 0 ? 'translateX(0)' : percent >= 100 ? 'translateX(-100%)' : 'translateX(-50%)',
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

