import Link from "next/link"

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>AI Support Platform</h1>
      <div style={{ display: "flex", gap: 20 }}>
        <Link href="/chat">Chat</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </div>
  )
}