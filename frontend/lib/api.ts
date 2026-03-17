const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function sendMessage(message: string, user_id: string): Promise<string> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user_id }),
  })
  if (!res.ok) throw new Error("Failed to send message")
  const data = await res.json()
  return data.response
}
