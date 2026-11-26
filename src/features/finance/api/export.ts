import type { Transaction } from '@/types/database'

export function formatTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Type', 'Amount', 'Category', 'Notes']
  const rows = transactions.map((tx) => {
    const typeLabel =
      tx.type === 'expense' ? 'Expense' : tx.type === 'income' ? 'Income' : 'Transfer'
    const categoryName = tx.category?.name ?? '-'
    const note = (tx.note ?? '').replace(/"/g, '""')
    return [
      tx.occurred_on,
      typeLabel,
      tx.amount.toString(),
      `"${categoryName}"`,
      `"${note}"`,
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\r\n')
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
