"use client"

import useSWR from "swr"
import axios from "axios"
import { useState } from "react"

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function Dashboard() {
  const { data, mutate } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/booking/booking_1`, fetcher)
  const [ticketId, setTicketId] = useState("ticket_1")

  const refund = async () => {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/refund/${ticketId}`)
    mutate()
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Agent Dashboard</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>Booking</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
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