import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Package,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Plus,
  Bell,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { listPlans, listSubscriptions, listUsers } from '../api'
import PageHeader from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
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
  totalPlans: null,
  activePlans: null,
  totalSubscriptions: null,
  activeSubscriptions: null,
  totalUsers: null,
}

const STAT_ICONS = [Users, Package, CreditCard, TrendingUp, TrendingUp]
const STAT_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

export default function Dashboard() {
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

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, to: '/users', sub: 'Registered accounts' },
    { label: 'Total Plans', value: stats.totalPlans, to: '/plans', sub: 'All subscription plans' },
    { label: 'Active Plans', value: stats.activePlans, to: '/plans', sub: 'Currently available' },
    { label: 'Subscriptions', value: stats.totalSubscriptions, to: '/subscriptions', sub: 'All assignments' },
    { label: 'Active Subs', value: stats.activeSubscriptions, to: '/subscriptions', sub: 'Currently active' },
  ]

  const chartData = [
    { name: 'Users', value: stats.totalUsers ?? 0, color: '#3b82f6' },
    { name: 'Plans', value: stats.totalPlans ?? 0, color: '#8b5cf6' },
    { name: 'Active Plans', value: stats.activePlans ?? 0, color: '#10b981' },
    { name: 'Subscriptions', value: stats.totalSubscriptions ?? 0, color: '#f59e0b' },
    { name: 'Active Subs', value: stats.activeSubscriptions ?? 0, color: '#f43f5e' },
  ]

  const quickActions = [
    { label: 'Create Plan', to: '/plans', icon: Plus, variant: 'primary' as const },
    { label: 'Assign Subscription', to: '/subscriptions', icon: CreditCard, variant: 'secondary' as const },
    { label: 'Browse Users', to: '/users', icon: Users, variant: 'secondary' as const },
    { label: 'Process Notifications', to: '/notifications', icon: Bell, variant: 'secondary' as const },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your platform metrics and quick actions."
      />

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = STAT_ICONS[i]
          return (
            <Link key={card.label} to={card.to} className="group">
              <Card hover className="relative overflow-hidden !p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {loading ? (
                        <span className="inline-block h-9 w-16 animate-pulse rounded bg-slate-200" />
                      ) : (
                        card.value ?? '—'
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${STAT_COLORS[i]} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-1 text-base font-semibold text-slate-900">Platform overview</h3>
          <p className="mb-6 text-sm text-slate-500">Key metrics at a glance</p>
          <div className="h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-1 text-base font-semibold text-slate-900">Quick actions</h3>
          <p className="mb-5 text-sm text-slate-500">Common admin tasks</p>
          <div className="space-y-2">
            {quickActions.map(action => (
              <Link key={action.label} to={action.to}>
                <Button variant={action.variant} className="w-full justify-start">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
