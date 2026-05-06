import React from 'react';

type HoldingRow = {
  asset: string;
  free: number;
  locked: number;
  total: number;
  unitPrice?: number | null;
  unitPriceSymbol?: string | null;
  value?: number | null;
};

type HoldingsTableProps = {
  holdings: HoldingRow[];
  totalValue: number;
  isLoading?: boolean;
  error?: string | null;
  missingPriceAssets?: string[];
};

const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100000 ? 0 : 2,
  }).format(value);
};

const formatNumber = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

const formatPercent = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(2)}%`;
};

export default function HoldingsTable({
  holdings,
  totalValue,
  isLoading = false,
  error,
  missingPriceAssets,
}: HoldingsTableProps) {
  const safeTotalValue = totalValue > 0 ? totalValue : 0;
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    // Reset to page 1 when holdings change
    setCurrentPage(1);
  }, [holdings.length]);

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-[#1F1F1F] p-6 text-white">
        <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
      </div>
    );
  }

  if (!holdings.length) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-[#1F1F1F] p-6 text-sm text-white/70">
        No holdings to display yet. Connect your Binance account to see live balances.
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(holdings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHoldings = holdings.slice(startIndex, endIndex);
  
  // Calculate page numbers to display (max 4 pages shown)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 4;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page area, and last page
      if (currentPage <= 2) {
        pages.push(1, 2, 3, 4);
      } else if (currentPage >= totalPages - 1) {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    return pages;
  };


  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1F1F1F] holdings-root">
      <style dangerouslySetInnerHTML={{__html: `
        /* Web version styles */
        .holdings-root {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          gap: 32px;
          width: 1280px;
          max-width: 100%;
          min-height: 784px;
          background: #1F1F1F;
          border-radius: 16px;
        }
        .holdings-table-desktop {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 40px;
          width: 1232px;
          max-width: 100%;
        }
        .holdings-title-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .holdings-title {
          width: 145px;
          height: 36px;
          font-family: 'Gilroy-SemiBold';
          font-style: normal;
          font-weight: 400;
          font-size: 36px;
          line-height: 100%;
          color: #FFFFFF;
          margin: 0;
        }
        .holdings-table-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .holdings-table-header,
        .holdings-table-row {
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 16px;
          gap: 24px;
          width: 100%;
          height: 46px;
          border-radius: 8px;
        }
        .holdings-table-header {
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .holdings-table-row {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .holdings-table-cell {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0px;
          gap: 8px;
          flex: 1;
          height: 14px;
        }
        .holdings-table-cell-label,
        .holdings-table-cell-value {
          font-family: 'Gilroy-Medium';
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 100%;
          text-align: center;
          width: 100%;
        }
        .holdings-table-cell-label {
          color: #FFFFFF;
        }
        .holdings-table-cell-value {
          color: #909090;
        }
        .holdings-actions-cell {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 4px;
          height: 16px;
        }
        .holdings-action-button {
          width: 20px;
          height: 20px;
          padding: 4px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          background: transparent;
        }
        .holdings-action-edit {
          background: #FFFFFF;
        }
        .holdings-action-delete {
          background: rgba(187, 4, 4, 0.12);
          border: 1px solid #BB0404;
        }
        .holdings-action-icon {
          width: 12px;
          height: 12px;
        }
        .holdings-pagination {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          width: 100%;
          height: 30px;
        }
        .holdings-pagination-info {
          font-family: 'Gilroy-Medium';
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 100%;
          color: #909090;
          flex: none;
          order: 0;
        }
        .holdings-pagination-controls {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 8px;
          flex: none;
          order: 1;
          margin-left: auto;
        }
        .holdings-pagination-button {
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: center;
          padding: 8px 12px;
          width: 32px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid #909090;
          background: transparent;
          color: #909090;
          font-family: 'Gilroy-Medium';
          font-size: 14px;
          line-height: 100%;
          cursor: pointer;
        }
        .holdings-pagination-button.active {
          background: #667EEA;
          border: 1px solid #667EEA;
          color: #FFFFFF;
        }
        @media (max-width:768px){
          /* Hide desktop table and show mobile cards */
          .holdings-root { width: 100% !important; min-height: auto !important; padding: 0 !important; gap: 0 !important; }
          .holdings-root .holdings-table-desktop{ display:none !important; }
          .holdings-root .holdings-mobile{ display:flex !important; }
          /* Mobile container */
          .holdings-mobile{
            flex-direction: column;
            align-items: center;
            padding: 20px 12px 16px;
            gap: 8px;
            width: 343px;
            margin: 0 auto;
            background: #1F1F1F;
            border-radius: 10px;
          }
          .holdings-mobile-header{
            display:flex;flex-direction:row;align-items:center;justify-content:space-between;
            width:319px;height:20px;
          }
          .holdings-mobile-header h3{
            margin:0;font-family: Gilroy-SemiBold; font-weight:400; font-size:20px; line-height:100%; color:#FFFFFF;
          }
          .holdings-mobile-header a{
            display:flex;align-items:center;gap:4px;font-family:Gilroy-SemiBold;font-size:12px;line-height:145%;color:#FFFFFF;text-decoration:none;
          }
          .holdings-mobile-list{
            display:flex;flex-direction:column;gap:16px;width:319px;
          }
          .holdings-mobile-card{
            border:1px solid rgba(255,255,255,0.3); border-radius:8px; padding:16px 12px; display:flex;flex-direction:column; gap:12px;
          }
          .holdings-row{
            display:flex;flex-direction:row;align-items:center;justify-content:space-between; gap:16px; width:100%;
          }
          .holdings-row .label{ font-family:Gilroy-Medium;font-size:14px;line-height:100%; color:#FFFFFF; }
          .holdings-row .value{ font-family:Gilroy-Medium;font-size:14px;line-height:100%; color:#909090; text-align:right; }
          .holdings-divider{ width:100%; height:1px; background:#404040; }
        }
      `}} />

      <div className="holdings-table-desktop">
        <div className="holdings-title-section">
          <h2 className="holdings-title">Holdings</h2>
        </div>
        <div className="holdings-table-container">
          {/* Header Row */}
          <div className="holdings-table-header">
            <div className="holdings-table-cell">
              <span className="holdings-table-cell-label">Asset</span>
            </div>
            <div className="holdings-table-cell">
              <span className="holdings-table-cell-label">Quantity</span>
            </div>
            <div className="holdings-table-cell">
              <span className="holdings-table-cell-label">AVG Price</span>
            </div>
            <div className="holdings-table-cell">
              <span className="holdings-table-cell-label">Current Price</span>
            </div>
            <div className="holdings-table-cell">
              <span className="holdings-table-cell-label">Value</span>
            </div>
            <div className="holdings-table-cell">
              <span className="holdings-table-cell-label">Actions</span>
            </div>
          </div>

          {/* Data Rows */}
          {paginatedHoldings.map(row => {
            const avgPrice = row.unitPrice ? row.unitPrice * 0.95 : null; // Note: Binance API doesn't provide avg purchase price
            
            return (
              <div key={row.asset} className="holdings-table-row">
                <div className="holdings-table-cell">
                  <span className="holdings-table-cell-value">{row.asset}</span>
                </div>
                <div className="holdings-table-cell">
                  <span className="holdings-table-cell-value">{formatNumber(row.total)}</span>
                </div>
                <div className="holdings-table-cell">
                  <span className="holdings-table-cell-value">{formatCurrency(avgPrice)}</span>
                </div>
                <div className="holdings-table-cell">
                  <span className="holdings-table-cell-value">{formatCurrency(row.unitPrice)}</span>
                </div>
                <div className="holdings-table-cell">
                  <span className="holdings-table-cell-value">{formatCurrency(row.value)}</span>
                </div>
                <div className="holdings-table-cell">
                  <div className="holdings-actions-cell">
                    <button className="holdings-action-button holdings-action-edit" type="button" title="Edit">
                      <svg className="holdings-action-icon" viewBox="0 0 16 16" fill="none">
                        <path d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68606 11.9446 1.59131C12.1728 1.49656 12.4171 1.44775 12.6667 1.44775C12.9162 1.44775 13.1605 1.49656 13.3887 1.59131C13.617 1.68606 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.38304 14.4087 2.6113C14.5035 2.83956 14.5523 3.08384 14.5523 3.33337C14.5523 3.58291 14.5035 3.82719 14.4087 4.05545C14.314 4.28371 14.1751 4.49162 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z" stroke="#0A0A0A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="holdings-action-button holdings-action-delete" type="button" title="Delete">
                      <svg className="holdings-action-icon" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4H3.33333H14" stroke="#BB0404" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.33334 4V2.66667C5.33334 2.31305 5.47382 1.97391 5.72387 1.72386C5.97392 1.47381 6.31306 1.33333 6.66667 1.33333H9.33334C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.6869 14.6667 11.3333 14.6667H4.66667C4.31306 14.6667 3.97392 14.5262 3.72387 14.2761C3.47382 14.0261 3.33334 13.687 3.33334 13.3333V4H12.6667Z" stroke="#BB0404" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.66667 7.33333V11.3333" stroke="#BB0404" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.33334 7.33333V11.3333" stroke="#BB0404" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="holdings-pagination">
            <span className="holdings-pagination-info">
              {currentPage === totalPages ? paginatedHoldings.length : itemsPerPage} of {holdings.length}
            </span>
            <div className="holdings-pagination-controls">
              {getPageNumbers().map((page, index) => {
                if (typeof page === 'number') {
                  return (
                    <button
                      key={page}
                      className={`holdings-pagination-button ${currentPage === page ? 'active' : ''}`}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}
              {currentPage < totalPages && (
                <button
                  className="holdings-pagination-button"
                  type="button"
                  title="Next"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: 'rotate(-90deg)' }}>
                    <path d="M5 1L9 5L5 9M1 5L9 5" stroke="#909090" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="holdings-mobile" style={{ display: 'none' }}>
        <div className="holdings-mobile-header">
          <h3>Holdings</h3>
          <a href="#holdings-view-all" onClick={(e)=>e.preventDefault()}>
            <span>View All</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: 'rotate(-90deg)' }}>
              <path d="M8 3V13" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 6L8 3L5 6" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
        <div className="holdings-mobile-list">
            {holdings.map(row => {
              const allocation =
                safeTotalValue > 0 && typeof row.value === 'number'
                  ? (row.value / safeTotalValue) * 100
                  : null;
              return (
              <div key={`m-${row.asset}`} className="holdings-mobile-card">
                <div className="holdings-row">
                  <span className="label">Asset</span>
                  <span className="value">{row.asset}</span>
                </div>
                <div className="holdings-divider" />
                <div className="holdings-row">
                  <span className="label">Quantity</span>
                  <span className="value">{formatNumber(row.total)}</span>
                </div>
                <div className="holdings-row">
                  <span className="label">AVG Price</span>
                  <span className="value">{formatCurrency(row.unitPrice ?? null)}</span>
                </div>
                <div className="holdings-row">
                  <span className="label">Current Price</span>
                  <span className="value">{formatCurrency(row.unitPrice ?? null)}</span>
                </div>
                <div className="holdings-row">
                  <span className="label">Value</span>
                  <span className="value">{formatCurrency(row.value)}</span>
                </div>
                <div className="holdings-row">
                  <span className="label">Allocation</span>
                  <span className="value">{formatPercent(allocation)}</span>
                </div>
              </div>
              );
            })}
        </div>
      </div>

      {missingPriceAssets && missingPriceAssets.length > 0 ? (
        <div className="border-t border-white/5 px-6 py-4 text-xs text-white/60">
          No live USD price for: {missingPriceAssets.join(', ')}. Values shown as quantities only.
        </div>
      ) : null}
    </div>
  );
}

export type { HoldingRow };
