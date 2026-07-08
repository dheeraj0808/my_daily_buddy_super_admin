import React, { useState } from 'react'
import { processNotifications } from '../api'
import type { ProcessNotificationsResult } from '../types'

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

  return (
    <div>
      <div className="page-header">
        <h2>Notifications</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          Manually trigger delivery of all pending scheduled notifications. This sends any
          queued notifications whose scheduled time has passed.
        </p>
        <button type="button" onClick={handleProcess} disabled={loading}>
          {loading ? 'Processing...' : 'Process Pending Notifications'}
        </button>

        {result && (
          <div className="stats-grid" style={{ marginTop: 20, marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-label">Processed</div>
              <div className="stat-value">{result.processed}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sent</div>
              <div className="stat-value">{result.sent}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Failed</div>
              <div className="stat-value">{result.failed}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
