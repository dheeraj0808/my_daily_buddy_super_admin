import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Package, CreditCard, Zap, ArrowUpRight,
  Plus, Bell, TrendingUp, Activity,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { listPlans, listSubscriptions, listUsers } from '../api'
import PageHeader, { PageShell } from '../components/ui/PageHeader'
import { Card, CardHeader, StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

interface Stats {
  totalPlans: number | null
  activePlans: number | null
  totalSubscriptions: number | null
  activeSubscriptions: number | null
  totalUsers: number | null
}

const INITIAL: Stats = {
  totalPlans: null, activePlans: null, totalSubscriptions: null,
  activeSubscriptions: null, totalUsers: null,
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>(INITIAL)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [plansRes, activePlansRes, subsRes, activeSubsRes, usersRes] = await Promise.all([
          listPlans({ limit: 1 }),
          listPlans({ limit: 1, is_active: 'true' }),
          listSubscriptions({ limit: 1 }),
          listSubscriptions({ limit: 1, is_active: 'true' }),
          listUsers({ limit: 1 }),
        ])
        if (cancelled) return
        setStats({
          totalPlans: plansRes.meta?.total ?? 0,
          activePlans: activePlansRes.meta?.total ?? 0,
          totalSubscriptions: subsRes.meta?.total ?? 0,
          activeSubscriptions: activeSubsRes.meta?.total ?? 0,
          totalUsers: usersRes.meta?.total ?? 0,
        })
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const chartData = [
    { name: 'Users', value: stats.totalUsers ?? 0 },
    { name: 'Plans', value: stats.totalPlans ?? 0 },
    { name: 'Active', value: stats.activePlans ?? 0 },
    { name: 'Subs', value: stats.totalSubscriptions ?? 0 },
    { name: 'Live', value: stats.activeSubscriptions ?? 0 },
  ]

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, sub: 'Registered on platform', icon: Users, gradient: 'bg-gradient-to-br from-blue-500 to-blue-600', to: '/users' },
    { label: 'Active Plans', value: stats.activePlans, sub: `${stats.totalPlans ?? 0} total plans`, icon: Package, gradient: 'bg-gradient-to-br from-violet-500 to-purple-600', to: '/plans' },
    { label: 'Subscriptions', value: stats.totalSubscriptions, sub: 'All time assignments', icon: CreditCard, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', to: '/subscriptions' },
    { label: 'Active Subs', value: stats.activeSubscriptions, sub: 'Currently billing', icon: Zap, gradient: 'bg-gradient-to-br from-amber-500 to-orange-500', to: '/subscriptions' },
  ]

  const quickActions = [
    { label: 'Create new plan', desc: 'Add pricing tier', icon: Plus, to: '/plans', primary: true },
    { label: 'Assign subscription', desc: 'Link user to plan', icon: CreditCard, to: '/subscriptions' },
    { label: 'Manage users', desc: 'Browse directory', icon: Users, to: '/users' },
    { label: 'Push notifications', desc: 'Process queue', icon: Bell, to: '/notifications' },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your wellness platform — users, plans, and subscriptions."
        badge="Analytics"
      />

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value ?? '—'}
            sub={card.sub}
            icon={card.icon}
            gradient={card.gradient}
            loading={loading}
            onClick={() => navigate(card.to)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" glass>
          <CardHeader
            title="Platform metrics"
            description="Distribution across core entities"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Activity className="h-3.5 w-3.5" /> Live data
              </span>
            }
          />
          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      fontWeight: 600,
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card glass>
          <CardHeader title="Quick actions" description="Jump to common tasks" />
          <div className="space-y-2">
            {quickActions.map(action => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.to)}
                className="group flex w-full items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.primary ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25' : 'bg-white text-slate-600 ring-1 ring-slate-200/80'}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-500" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6" glass>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Platform health</p>
              <p className="text-sm text-slate-500">
                {loading ? 'Loading metrics…' : `${stats.totalUsers ?? 0} users · ${stats.activeSubscriptions ?? 0} active subscriptions`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
            View all users <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </PageShell>
  )
}
