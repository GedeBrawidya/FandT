import { useState, useMemo } from 'react'
import { useBills, useBillPayments, useDeleteBill } from '@/features/finance/hooks/use-bills'
import { BillFormModal } from '@/features/finance/components/bill-form-modal'
import { confirmDialog } from '@/components/ui/confirm-dialog'
import { PayBillModal } from '@/features/finance/components/pay-bill-modal'
import { Card } from '@/components/ui/card'
import { formatRupiah } from '@/lib/format'
import type { Bill } from '@/types/database'
import { Plus, CheckCircle2, Clock, Calendar, Pencil, Trash2 } from 'lucide-react'

export function BillsPage() {
  const { data: bills = [], isLoading } = useBills()
  const { data: payments = [] } = useBillPayments()
  const deleteBill = useDeleteBill()

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [payingBill, setPayingBill] = useState<Bill | null>(null)

  // Demo fallback if no bills created yet
  const displayBills: Bill[] = useMemo(() => {
    return bills
    return [
      {
        id: 'demo-bill-1',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'Internet & WiFi Indihome',
        amount: 385000,
        due_day: 20,
        due_date: null,
        recurrence: 'monthly',
        category_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'demo-bill-2',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'Listrik PLN Pascabayar',
        amount: 450000,
        due_day: 25,
        due_date: null,
        recurrence: 'monthly',
        category_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'demo-bill-3',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'Langganan Spotify Family',
        amount: 86900,
        due_day: 28,
        due_date: null,
        recurrence: 'monthly',
        category_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  }, [bills])

  const paidBillIds = useMemo(() => {
    return new Set(payments.map((p) => p.bill_id))
  }, [payments])

  const totalBillsAmount = displayBills.reduce((acc, b) => acc + (b.is_active ? b.amount : 0), 0)
  const paidCount = displayBills.filter((b) => paidBillIds.has(b.id)).length
  const unpaidCount = displayBills.length - paidCount

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Fixed Bills &amp; Obligations
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Fixed bills are automatically allocated at the beginning of the period to keep your daily allowance accurate.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null)
            setFormModalOpen(true)
          }}
          className="lisso-btn-black self-start gap-1.5"
        >
          <Plus size={16} />
          <span>Add Bill</span>
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="lisso-card p-6 space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Total Recurring Obligations
          </span>
          <p className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            {formatRupiah(totalBillsAmount)}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Fully allocated per month</p>
        </div>

        <div className="lisso-card p-6 space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Paid
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {paidCount} Bills
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">Recorded in active period</p>
        </div>

        <div className="lisso-card p-6 space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Unpaid
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
              {unpaidCount} Bills
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">Keep track of due dates</p>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
            Active Bills List
          </h2>
          <span className="text-xs text-stone-400 font-medium">{displayBills.length} bills</span>
        </div>

        <div className="space-y-3">
          {displayBills.map((bill) => {
            const isPaid = paidBillIds.has(bill.id)
            return (
              <div
                key={bill.id}
                className="lisso-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {isPaid ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                        {bill.name}
                      </h3>
                      <span className={isPaid ? 'lisso-pill-green' : 'lisso-pill-amber'}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Due on day {bill.due_day ?? '-'} •{' '}
                      {bill.recurrence === 'monthly' ? 'Monthly' : 'One-time'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                  <div className="text-left sm:text-right">
                    <p className="text-base font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                      {formatRupiah(bill.amount)}
                    </p>
                    <p className="text-[10px] text-stone-400">Fixed bill</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPaid && (
                      <button
                        onClick={() => setPayingBill(bill)}
                        className="lisso-btn-black text-xs px-4 py-2"
                      >
                        Pay Now
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingBill(bill)
                        setFormModalOpen(true)
                      }}
                      className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={async () => {
                        const ok = await confirmDialog({
                          title: 'Delete Bill',
                          description: `Are you sure you want to delete "${bill.name}"?`,
                          confirmText: 'Delete Bill',
                          cancelText: 'Cancel',
                          variant: 'destructive',
                        })
                        if (ok) {
                          await deleteBill.mutateAsync(bill.id)
                        }
                      }}
                      className="h-8 w-8 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bill Form Modal */}
      <BillFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={editingBill}
      />

      {/* Pay Bill Modal */}
      <PayBillModal
        open={Boolean(payingBill)}
        onClose={() => setPayingBill(null)}
        bill={payingBill}
      />
    </div>
  )
}
