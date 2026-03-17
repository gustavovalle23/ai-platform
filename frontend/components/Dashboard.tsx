"use client"

import { useState, useEffect, useCallback } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function Dashboard() {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState("ticket_1")

  const fetchBooking = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/booking/booking_1`)
      if (!res.ok) throw new Error("Failed to fetch booking")
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const refund = async () => {
    try {
      const res = await fetch(`${API_URL}/refund/${ticketId}`, { method: "POST" })
      if (!res.ok) throw new Error("Refund failed")
      await fetchBooking()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refund failed")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Agent Dashboard</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>Booking</h3>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>

      <div>
        <h3>Actions</h3>
        <input
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
        <button onClick={refund}>Refund</button>
      </div>
    </div>
  )
}
