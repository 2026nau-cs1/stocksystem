import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { marketApi } from '@/lib/api';
import type { KLinePoint, MarketIndex, StockQuote, StockRankItem } from '@/types';
import { MARKET_AI_INSIGHTS, MARKET_PERIODS } from '@/constants/market';

function MiniChart({
  points,
  positive,
}: {
  points: KLinePoint[];
  positive: boolean;
}) {
  if (points.length < 2) {
    return null;
  }

  const prices = points.map((point) => parseFloat(point.close));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 300;
  const height = 80;
  const polyline = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * width;
      const y = height - ((price - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  const fillPoints = `0,${height} ${polyline} ${width},${height}`;
  const color = positive ? '#16A34A' : '#EF4444';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`market-grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" />
      <polygon points={fillPoints} fill={`url(#market-grad-${positive})`} />
    </svg>
  );
}

type MarketViewProps = {
  selectedStock: string;
  onSelectStock: (code: string) => void;
};

export default function MarketView({ selectedStock, onSelectStock }: MarketViewProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [stockRank, setStockRank] = useState<StockRankItem[]>([]);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [kline, setKline] = useState<KLinePoint[]>([]);
  const [period, setPeriod] = useState<(typeof MARKET_PERIODS)[number]>('日线');
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [indicesResponse, quoteResponse, klineResponse, rankResponse] = await Promise.all([
        marketApi.getIndices(),
        marketApi.getQuote(selectedStock),
        marketApi.getKLine(selectedStock),
        marketApi.getStockRank(),
      ]);

      if (indicesResponse.success) {
        setIndices(indicesResponse.data);
      }

      if (quoteResponse.success) {
        setQuote(quoteResponse.data);
      }

      if (klineResponse.success) {
        setKline(klineResponse.data);
      }

      if (rankResponse.success) {
        setStockRank(rankResponse.data);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isPositive = (value: string) => parseFloat(value) >= 0;

  const stats = quote
    ? [
        { label: '今开', value: quote.open, color: 'text-[var(--app-text)]' },
        { label: '最高', value: quote.high, color: 'text-[#16A34A]' },
        { label: '最低', value: quote.low, color: 'text-red-500' },
        { label: '成交量', value: quote.volume, color: 'text-[var(--app-text)]' },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto px-4 py-2.5 scrollbar-hide">
          {loading ? (
            <span className="text-xs font-mono text-[var(--app-muted)]">加载行情数据...</span>
          ) : (
            indices.map((indexItem) => (
              <div key={indexItem.code} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-mono text-[var(--app-muted)]">{indexItem.name}</span>
                <span className="text-sm font-mono font-semibold text-[var(--app-text)]">
                  {indexItem.price}
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    isPositive(indexItem.changePercent) ? 'text-[#16A34A]' : 'text-red-500'
                  }`}
                >
                  {isPositive(indexItem.changePercent) ? '+' : ''}
                  {indexItem.changePercent}%
                </span>
              </div>
            ))
          )}
          <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap">
            <span className="animate-pulse text-xs text-amber-500">实时</span>
            <span className="text-xs font-mono text-[var(--app-muted)]">
              {time.toLocaleTimeString('zh-CN')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--app-border)] px-4 pb-2 pt-3 scrollbar-hide">
            {loading ? (
              <span className="text-xs font-mono text-[var(--app-muted)]">加载排行榜数据...</span>
            ) : (
              stockRank.map((stock, index) => (
                <button
                  key={stock.code}
                  onClick={() => onSelectStock(stock.code)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-mono transition-colors ${
                    selectedStock === stock.code
                      ? 'border border-[#16A34A]/40 bg-[#16A34A]/10 text-[#16A34A]'
                      : 'border border-[var(--app-border)] text-[var(--app-muted)] hover:border-[#16A34A]/30 hover:text-[var(--app-text)]'
                  }`}
                >
                  {index + 1}. {stock.name}
                </button>
              ))
            )}
          </div>

          {quote ? (
            <>
              <div className="flex items-start justify-between px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-[var(--app-text)]">
                      {quote.name}
                    </span>
                    <span className="text-sm font-mono text-[var(--app-muted)]">{quote.symbol}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="font-mono text-3xl font-bold text-[var(--app-text)]">
                      {quote.price}
                    </span>
                    <span
                      className={`font-mono text-lg font-semibold ${
                        isPositive(quote.change) ? 'text-[#16A34A]' : 'text-red-500'
                      }`}
                    >
                      {isPositive(quote.change) ? '+' : ''}
                      {quote.change}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-sm font-mono ${
                        isPositive(quote.changePercent)
                          ? 'bg-[#16A34A]/10 text-[#16A34A]'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {isPositive(quote.changePercent) ? '+' : ''}
                      {quote.changePercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {MARKET_PERIODS.map((currentPeriod) => (
                    <button
                      key={currentPeriod}
                      onClick={() => setPeriod(currentPeriod)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                        period === currentPeriod
                          ? 'border border-[#16A34A] bg-[#16A34A]/10 text-[#16A34A]'
                          : 'border border-[var(--app-border)] text-[var(--app-muted)] hover:border-[#16A34A] hover:text-[#16A34A]'
                      }`}
                    >
                      {currentPeriod}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-48 px-5 pb-2">
                <MiniChart points={kline} positive={isPositive(quote.changePercent)} />
              </div>

              <div className="grid grid-cols-4 border-t border-[var(--app-border)]">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`px-4 py-3 ${
                      index < stats.length - 1 ? 'border-r border-[var(--app-border)]' : ''
                    }`}
                  >
                    <div className="mb-1 text-xs font-mono text-[var(--app-muted)]">{stat.label}</div>
                    <div className={`text-sm font-mono font-semibold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--app-text)]">
                智能分析
              </h3>
              <span className="animate-pulse text-xs font-mono text-[#16A34A]">实时</span>
            </div>
            <div className="space-y-3">
              {MARKET_AI_INSIGHTS.map((insight) => (
                <div key={insight.label} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                  <div className="mb-2 text-xs font-mono text-[#16A34A]">{insight.label}</div>
                  {insight.accent ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-[var(--app-soft)]">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-[#16A34A]"
                          style={{ width: insight.accent }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[var(--app-text)]">{insight.value}</span>
                    </div>
                  ) : (
                    <p className="text-xs font-mono leading-relaxed text-[var(--app-text)]">
                      {insight.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => void fetchData()}
          className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-mono text-[var(--app-muted)] transition-colors hover:border-[#16A34A]/40 hover:text-[#16A34A]"
        >
          <RefreshCw className="h-3 w-3" />
          刷新行情
        </button>
      </div>
    </div>
  );
}
