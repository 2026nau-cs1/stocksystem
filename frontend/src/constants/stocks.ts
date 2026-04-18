import type { StockListItem } from '@/types';

export interface StockOption {
  code: string;
  symbol: string;
  name: string;
  price?: string;
}

export const CORE_STOCK_OPTIONS: StockOption[] = [
  { code: '600519', symbol: '600519.SH', name: '贵州茅台', price: '1742.50' },
  { code: '300750', symbol: '300750.SZ', name: '宁德时代', price: '195.60' },
  { code: '600036', symbol: '600036.SH', name: '招商银行', price: '39.85' },
  { code: '002594', symbol: '002594.SZ', name: '比亚迪', price: '285.40' },
  { code: '688981', symbol: '688981.SH', name: '中芯国际', price: '62.18' },
  { code: '601012', symbol: '601012.SH', name: '隆基绿能', price: '24.56' },
  { code: '300059', symbol: '300059.SZ', name: '东方财富', price: '18.92' },
];

export function findStockOption(symbol: string) {
  return CORE_STOCK_OPTIONS.find((stock) => stock.symbol === symbol);
}

export function filterStockOptions(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return CORE_STOCK_OPTIONS;
  }

  return CORE_STOCK_OPTIONS.filter(
    (stock) => stock.name.includes(normalizedQuery) || stock.symbol.includes(normalizedQuery)
  );
}

export function getStockPriceSummary(stocks: StockListItem[], symbol: string) {
  const stock = stocks.find((item) => item.symbol === symbol);
  return stock ? { price: stock.price, changePercent: stock.changePercent } : null;
}
