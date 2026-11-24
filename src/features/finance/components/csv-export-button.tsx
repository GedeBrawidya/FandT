import { useState } from 'react'
import { useTransactions } from '@/features/finance/hooks/use-transactions'
import { formatTransactionsToCSV, downloadCSV } from '@/features/finance/api/export'
import { Download, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export function CSVExportButton({ className }: { className?: string }) {
  const { data: transactions = [], isLoading } = useTransactions({})
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    setExporting(true)
    try {
      const csv = formatTransactionsToCSV(transactions)
      const filename = `transaksi-${format(new Date(), 'yyyy-MM-dd')}.csv`
      downloadCSV(filename, csv)
    } finally {
      setTimeout(() => setExporting(false), 500)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isLoading || exporting}
      className={`lisso-btn-secondary text-xs gap-1.5 ${className ?? ''}`}
      title="Export transactions to CSV format"
    >
      {exporting ? (
        <Loader2 size={14} className="animate-spin text-stone-500" />
      ) : (
        <Download size={14} />
      )}
      <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
    </button>
  )
}
