import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/plans', label: 'Plans' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/users', label: 'Users' },
  { to: '/notifications', label: 'Notifications' },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">My Daily Buddy</div>
        <nav>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <span className="muted">{user?.email}</span>
          <button type="button" className="btn-secondary btn-small" onClick={logout}>Logout</button>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
