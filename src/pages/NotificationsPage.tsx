import React, { useState } from 'react'
import { Bell, Send, CheckCircle2, XCircle, Loader2, Zap, Clock, Radio } from 'lucide-react'
import { processNotifications } from '../api'
import type { ProcessNotificationsResult } from '../types'
import PageHeader, { PageShell } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

const STEPS = [
  { icon: Clock, title: 'Queue scan', desc: 'Finds pending notifications past their scheduled time' },
  { icon: Zap, title: 'Delivery', desc: 'Pushes messages through the configured provider' },
  { icon: Radio, title: 'Status update', desc: 'Marks each notification as sent or failed' },
]

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
    { label: 'Processed', value: result.processed, icon: Loader2, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Sent', value: result.sent, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Failed', value: result.failed, icon: XCircle, gradient: 'from-red-500 to-rose-500' },
  ] : []

  return (
    <PageShell>
      <PageHeader
        title="Notifications"
        description="Manually trigger delivery of pending scheduled push notifications."
        badge="Engagement"
      />

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-card">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-500/30">
                <Bell className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Process notification queue</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
                Sends all queued notifications whose scheduled time has passed. Use this when the
                automatic cron job needs a manual trigger or for debugging delivery issues.
              </p>

              <div className="mt-8 space-y-4">
                {STEPS.map((step, i) => (
                  <div key={step.title} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/80">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Step {i + 1}</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{step.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-8" size="lg" onClick={handleProcess} loading={loading}>
                <Send className="h-4 w-4" />
                Process notifications now
              </Button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <Card glass className="h-full">
            <h3 className="text-lg font-bold text-slate-900">Run summary</h3>
            <p className="mt-1 text-sm text-slate-500">Results from the most recent processing run</p>

            {!result && !loading && (
              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-medium text-slate-700">No runs yet</p>
                <p className="mt-1 max-w-[200px] text-xs text-slate-400">Trigger processing to see delivery stats here</p>
              </div>
            )}

            {loading && (
              <div className="mt-8 flex flex-col items-center justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
                <p className="mt-4 text-sm font-medium text-slate-600">Processing queue…</p>
              </div>
            )}

            {result && !loading && (
              <div className="mt-6 space-y-4">
                {resultCards.map(item => (
                  <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                      <p className="text-sm text-slate-500">{item.label}</p>
                    </div>
                  </div>
                ))}
                {result.failed > 0 && (
                  <Alert variant="error">
                    {result.failed} notification{result.failed > 1 ? 's' : ''} failed to deliver. Check backend logs for details.
                  </Alert>
                )}
                {result.sent > 0 && result.failed === 0 && (
                  <Alert variant="success">All notifications delivered successfully.</Alert>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
