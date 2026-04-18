import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Menu,
  Newspaper,
  PieChart,
  Search,
  Star,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import MarketView from '@/components/custom/MarketView';
import WatchlistView from '@/components/custom/WatchlistView';
import PortfolioView from '@/components/custom/PortfolioView';
import AlertsView from '@/components/custom/AlertsView';
import NewsView from '@/components/custom/NewsView';
import ProfileView from '@/components/custom/ProfileView';
import { marketApi } from '@/lib/api';
import type { StockListItem, ViewType } from '@/types';

const NAV_ITEMS: { key: ViewType; label: string; icon: React.ElementType }[] = [
  { key: 'market', label: '行情', icon: TrendingUp },
  { key: 'watchlist', label: '自选股', icon: Star },
  { key: 'portfolio', label: '持仓', icon: PieChart },
  { key: 'alerts', label: '预警', icon: Bell },
  { key: 'news', label: '资讯', icon: Newspaper },
  { key: 'profile', label: '我的', icon: User },
];

type SearchBoxProps = {
  value: string;
  results: StockListItem[];
  loading: boolean;
  open: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSelect: (item: StockListItem) => void;
  placeholder?: string;
  className?: string;
};

function SearchBox({
  value,
  results,
  loading,
  open,
  onChange,
  onFocus,
  onSelect,
  placeholder = '搜索代码或股票名称',
  className = '',
}: SearchBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5">
        <Search className="h-4 w-4 text-[var(--app-muted)]" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className="w-full bg-transparent font-mono text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
        />
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg">
          {loading ? (
            <div className="px-3 py-3 text-xs font-mono text-[var(--app-muted)]">搜索中...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.code}
                onClick={() => onSelect(item)}
                className="flex w-full items-center justify-between border-b border-[var(--app-border)] px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--app-soft)]"
              >
                <div>
                  <div className="font-mono text-sm text-[var(--app-text)]">{item.name}</div>
                  <div className="mt-1 font-mono text-xs text-[var(--app-muted)]">
                    {item.code} · {item.symbol}
                  </div>
                </div>
                <div className="font-mono text-xs text-[var(--app-muted)]">{item.price}</div>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs font-mono text-[var(--app-muted)]">没有找到匹配的股票</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function Index() {
  const [currentView, setCurrentView] = useState<ViewType>('market');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockListItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState('600519');
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await marketApi.searchStocks(trimmedQuery);
        if (response.success) {
          setSearchResults(response.data);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleSelectStock = (item: StockListItem) => {
    setSelectedStock(item.code);
    setCurrentView('market');
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchOpen(value.trim().length > 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'market':
        return <MarketView selectedStock={selectedStock} onSelectStock={setSelectedStock} />;
      case 'watchlist':
        return <WatchlistView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'alerts':
        return <AlertsView />;
      case 'news':
        return <NewsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <MarketView selectedStock={selectedStock} onSelectStock={setSelectedStock} />;
    }
  };

  return (
    <div ref={shellRef} className="min-h-screen bg-[var(--app-bg)] pb-16 text-[var(--app-text)] md:pb-0">
      <nav className="sticky top-0 z-50 border-b border-[var(--app-border)] bg-[rgb(var(--app-surface-rgb)/0.9)] backdrop-blur-md">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#16A34A]">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span className="font-mono text-lg font-bold tracking-tight text-[var(--app-text)]">
                  StockPulse
                </span>
              </div>

              <div className="ml-6 hidden items-center gap-1 md:flex">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNavClick(item.key)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-sm transition-all duration-200 ${
                        currentView === item.key
                          ? 'bg-[#16A34A]/10 text-[#15803D]'
                          : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SearchBox
                value={searchQuery}
                results={searchResults}
                loading={searchLoading}
                open={searchOpen}
                onChange={handleSearchChange}
                onFocus={() => setSearchOpen(searchQuery.trim().length > 0)}
                onSelect={handleSelectStock}
                className="hidden w-64 sm:block"
              />

              <button
                onClick={() => handleNavClick('alerts')}
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-soft)] transition-colors hover:bg-[#16A34A]/10"
                title="查看预警"
              >
                <Bell className="h-4 w-4 text-[var(--app-muted)]" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#E11D48]" />
              </button>

              <button
                onClick={() => handleNavClick('profile')}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#16A34A] to-[#0EA5E9] text-xs font-bold text-white"
                title="个人中心"
              >
                <User className="h-4 w-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen((current) => !current)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-soft)] text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)] md:hidden"
                title={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-[var(--app-border)] bg-[var(--app-surface)] md:hidden">
            <div className="space-y-1 px-4 py-3">
              <SearchBox
                value={searchQuery}
                results={searchResults}
                loading={searchLoading}
                open={searchOpen}
                onChange={handleSearchChange}
                onFocus={() => setSearchOpen(searchQuery.trim().length > 0)}
                onSelect={handleSelectStock}
                className="mb-3"
              />

              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-all duration-200 ${
                      currentView === item.key
                        ? 'bg-[#16A34A]/10 text-[#15803D]'
                        : 'text-[var(--app-muted)] hover:bg-[var(--app-soft-hover)] hover:text-[var(--app-text)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </nav>

      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">{renderView()}</main>

      <footer className="mt-8 border-t border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="mx-auto max-w-screen-xl px-4 py-5 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#16A34A]">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-mono text-sm font-semibold text-[var(--app-text)]">StockPulse</span>
              <span className="font-mono text-xs text-[var(--app-muted)]">版本 1.0</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-[var(--app-muted)]">行情延迟 ≤ 2s</span>
              <span className="font-mono text-xs text-[var(--app-muted)]">系统可用率 99.9%</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" />
                <span className="font-mono text-xs text-[#15803D]">系统正常</span>
              </div>
            </div>

            <p className="font-mono text-xs text-[var(--app-muted)]">
              © 2026 StockPulse · 行情数据仅供参考，不构成投资建议
            </p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--app-border)] bg-[var(--app-surface)] md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-all duration-200 ${
                  currentView === item.key ? 'text-[#15803D]' : 'text-[var(--app-muted)]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-mono text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <OmniflowBadge />
      <Toaster />
    </div>
  );
}
