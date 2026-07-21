import { useState } from 'react'
import toast from 'react-hot-toast'
import { Wallet as WalletIcon, ArrowDownToLine, Gift, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { useGetWalletQuery, useListTipsReceivedQuery, useListTransactionsQuery, useWithdrawMutation } from '@/services/wallet.api'
import { formatCurrency } from '@/utils/format'

export default function Wallet() {
  const { data: wallet, isLoading } = useGetWalletQuery()
  const { data: tips } = useListTipsReceivedQuery({ limit: 10 })
  const { data: transactions } = useListTransactionsQuery({ limit: 10 })
  const [withdraw, { isLoading: withdrawing }] = useWithdrawMutation()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(100)

  const submitWithdraw = async (e) => {
    e.preventDefault()
    try {
      await withdraw({ amount: Number(amount) }).unwrap()
      toast.success(`Withdrew ${formatCurrency(amount)}`)
      setOpen(false)
    } catch (err) {
      toast.error(err.message || 'Withdrawal failed')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="heading-eyebrow mb-1">Wallet</p>
        <h1 className="font-display text-3xl font-bold">Earnings & tips</h1>
      </div>

      <div className="card p-7 bg-gradient-to-br from-current/15 to-ember/10 border-current/20">
        <div className="flex items-center gap-2 mb-2 text-muted text-sm"><WalletIcon size={15} /> Available balance</div>
        {isLoading ? <Loader2 className="animate-spin text-current-2" size={22} /> : (
          <p className="font-display text-4xl font-bold mb-6">{formatCurrency(wallet?.balance || 0)}</p>
        )}
        <div className="flex gap-3">
          <Button size="sm" onClick={() => setOpen(true)}><ArrowDownToLine size={14} /> Withdraw</Button>
        </div>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">Recent tips received</h2>
        <div className="space-y-2">
          {tips?.results?.length ? tips.results.map((t) => (
            <div key={t._id} className="card p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-ember/15 flex items-center justify-center shrink-0"><Gift size={15} className="text-ember-2" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t.from?.name} {t.note && <span className="text-muted font-normal">— {t.note}</span>}</p>
                <p className="text-xs text-muted font-mono">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-current-2">+{formatCurrency(t.amount)}</span>
            </div>
          )) : <p className="text-sm text-muted text-center py-6">No tips yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">Transaction history</h2>
        <div className="space-y-2">
          {transactions?.results?.length ? transactions.results.map((t) => (
            <div key={t._id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{t.type}</p>
                <p className="text-xs text-muted font-mono">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
              <span className={`font-mono text-sm font-semibold ${t.amount < 0 ? 'text-ember-2' : 'text-current-2'}`}>
                {t.amount < 0 ? '' : '+'}{formatCurrency(t.amount)}
              </span>
            </div>
          )) : <p className="text-sm text-muted text-center py-6">No transactions yet.</p>}
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Withdraw funds">
        <form onSubmit={submitWithdraw} className="space-y-4">
          <Input label="Amount" type="number" min={1} max={wallet?.balance || 0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" className="w-full" disabled={withdrawing}>{withdrawing ? 'Processing…' : `Withdraw ${formatCurrency(amount)}`}</Button>
        </form>
      </Modal>
    </div>
  )
}
