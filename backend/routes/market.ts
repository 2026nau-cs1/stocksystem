import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import aliyunApiService from '../services/aliyunApiService';

const router = Router();

type StockSeed = {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  pe: string;
  pb: string;
  roe: string;
  revenueGrowth: string;
};

type StockRankRow = {
  code: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
};

const fallbackIndices = () => [
  {
    code: 'SH000001',
    name: '上证指数',
    price: (3287.45 + (Math.random() - 0.5) * 20).toFixed(2),
    change: (1.23 + (Math.random() - 0.5) * 0.5).toFixed(2),
    changePercent: (1.23 + (Math.random() - 0.5) * 0.5).toFixed(2),
  },
  {
    code: 'SZ399001',
    name: '深证成指',
    price: (10542.18 + (Math.random() - 0.5) * 50).toFixed(2),
    change: (0.87 + (Math.random() - 0.5) * 0.3).toFixed(2),
    changePercent: (0.87 + (Math.random() - 0.5) * 0.3).toFixed(2),
  },
  {
    code: 'SZ399006',
    name: '创业板指',
    price: (2156.33 + (Math.random() - 0.5) * 15).toFixed(2),
    change: (-0.34 + (Math.random() - 0.5) * 0.3).toFixed(2),
    changePercent: (-0.34 + (Math.random() - 0.5) * 0.3).toFixed(2),
  },
  {
    code: 'SH000300',
    name: '沪深 300',
    price: (3891.72 + (Math.random() - 0.5) * 25).toFixed(2),
    change: (1.05 + (Math.random() - 0.5) * 0.4).toFixed(2),
    changePercent: (1.05 + (Math.random() - 0.5) * 0.4).toFixed(2),
  },
  {
    code: 'HK.HSI',
    name: '恒生指数',
    price: (19234.56 + (Math.random() - 0.5) * 100).toFixed(2),
    change: (2.14 + (Math.random() - 0.5) * 0.5).toFixed(2),
    changePercent: (2.14 + (Math.random() - 0.5) * 0.5).toFixed(2),
  },
  {
    code: 'NASDAQ',
    name: '纳斯达克',
    price: (17845.23 + (Math.random() - 0.5) * 80).toFixed(2),
    change: (-0.56 + (Math.random() - 0.5) * 0.4).toFixed(2),
    changePercent: (-0.56 + (Math.random() - 0.5) * 0.4).toFixed(2),
  },
];

const stocksData: Record<string, StockSeed> = {
  '600519': {
    symbol: '600519.SH',
    name: '贵州茅台',
    price: 1742.5,
    open: 1718,
    high: 1756.8,
    low: 1710.2,
    volume: '3.24 亿',
    pe: '28.4',
    pb: '9.8',
    roe: '32.6',
    revenueGrowth: '+18.5',
  },
  '300750': {
    symbol: '300750.SZ',
    name: '宁德时代',
    price: 195.6,
    open: 193,
    high: 198.4,
    low: 191.2,
    volume: '8.56 亿',
    pe: '32.1',
    pb: '5.2',
    roe: '18.3',
    revenueGrowth: '+12.4',
  },
  '600036': {
    symbol: '600036.SH',
    name: '招商银行',
    price: 39.85,
    open: 39.2,
    high: 40.1,
    low: 38.9,
    volume: '12.3 亿',
    pe: '6.8',
    pb: '1.1',
    roe: '16.2',
    revenueGrowth: '+8.7',
  },
  '002594': {
    symbol: '002594.SZ',
    name: '比亚迪',
    price: 285.4,
    open: 280,
    high: 288.6,
    low: 278.3,
    volume: '15.7 亿',
    pe: '22.5',
    pb: '4.3',
    roe: '19.8',
    revenueGrowth: '+28.3',
  },
  '688981': {
    symbol: '688981.SH',
    name: '中芯国际',
    price: 62.18,
    open: 63,
    high: 64.2,
    low: 61.5,
    volume: '5.2 亿',
    pe: '45.2',
    pb: '3.8',
    roe: '8.4',
    revenueGrowth: '+15.6',
  },
  '601012': {
    symbol: '601012.SH',
    name: '隆基绿能',
    price: 24.56,
    open: 24.2,
    high: 25.1,
    low: 24,
    volume: '9.8 亿',
    pe: '18.3',
    pb: '2.1',
    roe: '11.5',
    revenueGrowth: '-5.2',
  },
  '300059': {
    symbol: '300059.SZ',
    name: '东方财富',
    price: 18.92,
    open: 18.3,
    high: 19.2,
    low: 18.1,
    volume: '22.4 亿',
    pe: '28.7',
    pb: '3.5',
    roe: '12.3',
    revenueGrowth: '+22.1',
  },
};

const sectors = [
  { name: '人工智能', changePercent: '+4.82', width: 96 },
  { name: '半导体', changePercent: '+3.67', width: 73 },
  { name: '新能源车', changePercent: '+2.91', width: 58 },
  { name: '白酒', changePercent: '+1.65', width: 33 },
  { name: '医药生物', changePercent: '-0.43', width: 9 },
  { name: '银行', changePercent: '+0.92', width: 18 },
  { name: '房地产', changePercent: '-1.23', width: 5 },
];

const newsData = [
  {
    id: '1',
    category: '重大',
    categoryType: 'major',
    title: '贵州茅台发布 2025 年度业绩预告，净利润同比增长 18.5%',
    time: '14:28',
    symbol: '600519',
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=80&fit=crop',
  },
  {
    id: '2',
    category: '行业',
    categoryType: 'industry',
    title: '半导体板块持续走强，产业链龙头股集体活跃',
    time: '13:55',
    symbol: '688981',
    image:
      'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=120&h=80&fit=crop',
  },
  {
    id: '3',
    category: '公告',
    categoryType: 'announcement',
    title: '宁德时代宣布与多家车企签署合作协议，推进新型电池量产',
    time: '11:30',
    symbol: '300750',
    image:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=80&fit=crop',
  },
  {
    id: '4',
    category: '宏观',
    categoryType: 'macro',
    title: '宏观流动性边际改善，市场风险偏好有所回升',
    time: '10:15',
    symbol: null,
    image:
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=120&h=80&fit=crop',
  },
];

const fallbackRankSeed: StockRankRow[] = [
  { code: '688001', symbol: '688001.SH', name: '华兴源创', price: '28.60', change: '+3.20', changePercent: '12.58' },
  { code: '688002', symbol: '688002.SH', name: '睿创微纳', price: '45.20', change: '+4.10', changePercent: '9.97' },
  { code: '688003', symbol: '688003.SH', name: '天准科技', price: '19.88', change: '+1.65', changePercent: '9.05' },
  { code: '920237', symbol: '920237.BJ', name: '力佳科技', price: '32.40', change: '+2.10', changePercent: '6.89' },
  { code: '688690', symbol: '688690.SH', name: '纳微科技', price: '58.20', change: '+2.85', changePercent: '5.15' },
  { code: '300750', symbol: '300750.SZ', name: '宁德时代', price: '195.60', change: '+2.30', changePercent: '4.22' },
  { code: '002594', symbol: '002594.SZ', name: '比亚迪', price: '285.40', change: '+3.20', changePercent: '3.88' },
  { code: '688981', symbol: '688981.SH', name: '中芯国际', price: '62.18', change: '+1.50', changePercent: '2.47' },
  { code: '600519', symbol: '600519.SH', name: '贵州茅台', price: '1742.50', change: '+5.20', changePercent: '1.96' },
  { code: '600036', symbol: '600036.SH', name: '招商银行', price: '39.85', change: '+0.50', changePercent: '1.27' },
];

function generateOrderBook(basePrice: number) {
  return {
    asks: [
      { level: '卖五', price: (basePrice + 1.5).toFixed(2), volume: Math.floor(Math.random() * 3000 + 1000) },
      { level: '卖四', price: (basePrice + 1.2).toFixed(2), volume: Math.floor(Math.random() * 2500 + 800) },
      { level: '卖三', price: (basePrice + 0.9).toFixed(2), volume: Math.floor(Math.random() * 4000 + 1500) },
      { level: '卖二', price: (basePrice + 0.6).toFixed(2), volume: Math.floor(Math.random() * 1500 + 500) },
      { level: '卖一', price: (basePrice + 0.3).toFixed(2), volume: Math.floor(Math.random() * 2000 + 800) },
    ],
    bids: [
      { level: '买一', price: (basePrice - 0.3).toFixed(2), volume: Math.floor(Math.random() * 2500 + 1000) },
      { level: '买二', price: (basePrice - 0.6).toFixed(2), volume: Math.floor(Math.random() * 4000 + 2000) },
      { level: '买三', price: (basePrice - 0.9).toFixed(2), volume: Math.floor(Math.random() * 1500 + 600) },
      { level: '买四', price: (basePrice - 1.2).toFixed(2), volume: Math.floor(Math.random() * 5000 + 3000) },
      { level: '买五', price: (basePrice - 1.5).toFixed(2), volume: Math.floor(Math.random() * 3000 + 1500) },
    ],
  };
}

function firstFiniteNum(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const numberValue = parseFloat(String(value).replace(/,/g, '').replace(/%/g, ''));
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return undefined;
}

function marketSuffixFromCode(code: string): 'SH' | 'SZ' | 'BJ' {
  if (!/^\d{6}$/.test(code)) return 'SH';
  const prefix = code.slice(0, 3);
  if (['000', '001', '002', '003', '300', '301'].includes(prefix)) return 'SZ';
  if (prefix.startsWith('8') || prefix.startsWith('4')) return 'BJ';
  return 'SH';
}

function formatListedSymbol(code: string, hint?: string): string {
  const normalizedHint = (hint || '').trim();
  if (/\.(SH|SZ|BJ)$/i.test(normalizedHint)) return normalizedHint.toUpperCase();
  if (/^\d{6}$/.test(code)) return `${code}.${marketSuffixFromCode(code)}`;
  return normalizedHint || code;
}

function normalizeStockRankRow(raw: Record<string, unknown>, index: number): StockRankRow | null {
  const symbolField = String(raw.symbol ?? raw.gpdm ?? raw.sc ?? '').trim();
  const digitsFromSymbol = symbolField.match(/(\d{6})/);
  const normalizedCode = String(raw.dm ?? raw.code ?? '').replace(/\D/g, '');
  const codeFromRaw =
    normalizedCode.length >= 6 ? normalizedCode.slice(-6) : normalizedCode.length === 6 ? normalizedCode : '';
  const code = (digitsFromSymbol?.[1] || codeFromRaw || '').slice(0, 6) || `__${index}`;

  const name =
    String(raw.name ?? raw.mc ?? raw.stockName ?? raw.secName ?? raw.stockname ?? '').trim() ||
    stocksData[code]?.name;
  if (!name) return null;

  const price =
    firstFiniteNum(raw.price, raw.lastPrice, raw.now, raw.current, raw.p, raw.zxj, raw.close, raw.newprice) ??
    stocksData[code]?.price;
  const change =
    firstFiniteNum(raw.change, raw.priceChange, raw.zd, raw.zhangdie);
  let changePercent = firstFiniteNum(
    raw.changeRate,
    raw.changePercent,
    raw.changepercent,
    raw.pctChg,
    raw.zdf,
    raw.zhangdief,
    raw.fd
  );

  if (changePercent === undefined && change !== undefined && price !== undefined) {
    const previousPrice = price - change;
    if (Math.abs(previousPrice) > 1e-6) {
      changePercent = (change / previousPrice) * 100;
    }
  }

  return {
    code,
    symbol: formatListedSymbol(code, symbolField),
    name,
    price: price !== undefined ? price.toFixed(2) : '',
    change: change !== undefined ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}` : '',
    changePercent: (changePercent ?? 0).toFixed(2),
  };
}

function buildAnimatedFallbackRank(): StockRankRow[] {
  const phase = Date.now() / 4000;
  return fallbackRankSeed.map((row, index) => {
    const base = stocksData[row.code];
    const basePrice = base ? base.price : parseFloat(row.price) || 0;
    const jitter = Math.sin(phase + index * 0.85) * 0.006;
    const currentPrice = basePrice > 0 ? basePrice * (1 + jitter) : parseFloat(row.price) || 0;
    const price = currentPrice.toFixed(2);
    const seedPercent = parseFloat(row.changePercent) || 0;
    const changePercent = (seedPercent + Math.sin(phase * 1.12 + index) * 0.28).toFixed(2);
    const diff = parseFloat(price) - basePrice;
    const change = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;

    return { ...row, price, changePercent, change };
  });
}

function buildFallbackStocks() {
  return Object.entries(stocksData).map(([code, stock]) => ({
    code,
    symbol: stock.symbol,
    name: stock.name,
    price: (stock.price + (Math.random() - 0.5) * 5).toFixed(2),
    changePercent: ((Math.random() - 0.4) * 5).toFixed(2),
  }));
}

function buildFallbackKline(code: string) {
  const stock = stocksData[code];
  const basePrice = stock ? stock.price : 100;
  const points = [];
  let price = basePrice * 0.85;

  for (let i = 60; i >= 0; i -= 1) {
    price *= 1 + (Math.random() - 0.48) * 0.02;
    const date = new Date();
    date.setDate(date.getDate() - i);
    points.push({
      date: date.toISOString().split('T')[0],
      open: (price * (1 - Math.random() * 0.01)).toFixed(2),
      close: price.toFixed(2),
      high: (price * (1 + Math.random() * 0.015)).toFixed(2),
      low: (price * (1 - Math.random() * 0.015)).toFixed(2),
      volume: Math.floor(Math.random() * 50000000 + 10000000),
    });
  }

  return points;
}

router.get('/indices', authenticateJWT, async (_req: Request, res: Response) => {
  try {
    const data = await aliyunApiService.getIndices();
    res.json({ success: true, data: data.data?.data?.list || fallbackIndices() });
  } catch (error) {
    console.error('Failed to fetch market indices:', error);
    res.json({ success: true, data: fallbackIndices() });
  }
});

router.get('/quote/:code', authenticateJWT, async (req: Request, res: Response) => {
  const code = req.params.code as string;

  try {
    const data = await aliyunApiService.getStockQuote(code);
    const formattedData = {
      ...data.data,
      orderBook:
        data.data.orderBook || generateOrderBook(parseFloat(String(data.data.price ?? 0))),
    };
    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Failed to fetch stock quote:', error);
    const stock = stocksData[code];
    if (!stock) {
      res.status(404).json({ success: false, message: 'Stock not found' });
      return;
    }

    const priceVariation = (Math.random() - 0.5) * 10;
    const currentPrice = stock.price + priceVariation;
    const changeAmount = currentPrice - stock.open;
    const changePercent = (changeAmount / stock.open) * 100;

    res.json({
      success: true,
      data: {
        ...stock,
        price: currentPrice.toFixed(2),
        change: changeAmount.toFixed(2),
        changePercent: changePercent.toFixed(2),
        orderBook: generateOrderBook(currentPrice),
      },
    });
  }
});

router.get('/stocks', authenticateJWT, async (_req: Request, res: Response) => {
  try {
    const data = await aliyunApiService.getStocks();
    res.json({ success: true, data: data.data?.data?.list || buildFallbackStocks() });
  } catch (error) {
    console.error('Failed to fetch stocks list:', error);
    res.json({ success: true, data: buildFallbackStocks() });
  }
});

router.get('/sectors', authenticateJWT, async (_req: Request, res: Response) => {
  try {
    const data = await aliyunApiService.getSectors();
    let formattedData = data.data?.data?.list || sectors;

    if (Array.isArray(formattedData) && formattedData.length > 0) {
      const maxChange = Math.max(
        ...formattedData.map((item) =>
          Math.abs(parseFloat(String((item as Record<string, unknown>).changeRate ?? 0)))
        )
      );

      formattedData = formattedData.map((item) => {
        const itemRecord = item as Record<string, unknown>;
        const changeRate = parseFloat(String(itemRecord.changeRate ?? 0));
        const width = maxChange > 0 ? (Math.abs(changeRate) / maxChange) * 100 : 0;

        return {
          ...itemRecord,
          changePercent: changeRate.toFixed(2),
          width: Math.min(Math.round(width), 100),
        };
      });
    }

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Failed to fetch sectors:', error);
    res.json({ success: true, data: sectors });
  }
});

router.get('/news', authenticateJWT, async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;

  try {
    const data = await aliyunApiService.getNews(category);
    res.json({ success: true, data: data.data?.data?.list || newsData });
  } catch (error) {
    console.error('Failed to fetch news:', error);
    const filteredNews =
      category && category !== 'all'
        ? newsData.filter((item) => item.categoryType === category)
        : newsData;
    res.json({ success: true, data: filteredNews });
  }
});

router.get('/fundamentals/:code', authenticateJWT, async (req: Request, res: Response) => {
  const code = req.params.code as string;

  try {
    const data = await aliyunApiService.getFundamentals(code);
    res.json({
      success: true,
      data:
        data.data || {
          symbol: stocksData[code]?.symbol,
          name: stocksData[code]?.name,
          pe: stocksData[code]?.pe,
          pb: stocksData[code]?.pb,
          roe: stocksData[code]?.roe,
          revenueGrowth: stocksData[code]?.revenueGrowth,
          events: [
            { date: '2026-03-10', title: '年度分红方案公告', type: '分红' },
            { date: '2026-02-28', title: '2025 年度业绩预告', type: '财报' },
            { date: '2026-01-15', title: '机构调研纪要披露', type: '公告' },
          ],
        },
    });
  } catch (error) {
    console.error('Failed to fetch fundamentals:', error);
    const stock = stocksData[code];
    if (!stock) {
      res.status(404).json({ success: false, message: 'Stock not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        symbol: stock.symbol,
        name: stock.name,
        pe: stock.pe,
        pb: stock.pb,
        roe: stock.roe,
        revenueGrowth: stock.revenueGrowth,
        events: [
          { date: '2026-03-10', title: '年度分红方案公告', type: '分红' },
          { date: '2026-02-28', title: '2025 年度业绩预告', type: '财报' },
          { date: '2026-01-15', title: '机构调研纪要披露', type: '公告' },
        ],
      },
    });
  }
});

router.get('/kline/:code', authenticateJWT, async (req: Request, res: Response) => {
  const code = req.params.code as string;

  try {
    const data = await aliyunApiService.getKline(code);
    const formattedData = data.data || [];
    if (Array.isArray(formattedData) && formattedData.length > 0) {
      res.json({ success: true, data: formattedData });
      return;
    }

    res.json({ success: true, data: buildFallbackKline(code) });
  } catch (error) {
    console.error('Failed to fetch kline data:', error);
    res.json({ success: true, data: buildFallbackKline(code) });
  }
});

router.get('/stock-rank', authenticateJWT, async (_req: Request, res: Response) => {
  try {
    const data = await aliyunApiService.getStockRank();
    const list = data.data?.data?.list;

    if (Array.isArray(list) && list.length > 0) {
      const rows = list
        .map((item, index) => normalizeStockRankRow(item as Record<string, unknown>, index))
        .filter((row): row is StockRankRow => row !== null)
        .slice(0, 10);

      if (rows.length > 0) {
        res.json({
          success: true,
          data: rows,
          updatedAt: Date.now(),
          source: 'live',
        });
        return;
      }
    }

    res.json({
      success: true,
      data: buildAnimatedFallbackRank(),
      updatedAt: Date.now(),
      source: 'mock',
    });
  } catch (error) {
    console.error('Failed to fetch stock rank:', error);
    res.json({
      success: true,
      data: buildAnimatedFallbackRank(),
      updatedAt: Date.now(),
      source: 'mock',
    });
  }
});

export default router;
