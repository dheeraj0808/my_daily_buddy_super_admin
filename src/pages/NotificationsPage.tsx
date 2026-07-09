import React, { useState } from 'react'
import { Bell, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { processNotifications } from '../api'
import type { ProcessNotificationsResult } from '../types'
import PageHeader from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProcessNotificationsResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleProcess() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await processNotifications()
      setResult(res.data)
    } catch (err: any) {
      setError(err.message || 'Failed to process notifications')
    } finally {
      setLoading(false)
    }
  }

  const resultCards = result ? [
    { label: 'Processed', value: result.processed, icon: Loader2, color: 'bg-blue-500' },
    { label: 'Sent', value: result.sent, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Failed', value: result.failed, icon: XCircle, color: 'bg-red-500' },
  ] : []

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Manually trigger delivery of pending scheduled push notifications."
      />

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <Bell className="h-6 w-6 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Process pending queue</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Sends all queued notifications whose scheduled time has passed. Use this when the
            automatic cron job needs a manual trigger or for debugging delivery issues.
          </p>
          <Button className="mt-6" onClick={handleProcess} loading={loading}>
            <Send className="h-4 w-4" />
            Process notifications
          </Button>
        </Card>

        {result && (
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Last run results</h3>
            <div className="grid grid-cols-3 gap-4">
              {resultCards.map(item => (
                <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${item.color} text-white`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
