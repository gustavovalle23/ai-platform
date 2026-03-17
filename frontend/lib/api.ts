const API_URL = process.env.NEXT_PUBLIC_API_URL

export class ChatApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string | Record<string, unknown>
  ) {
    super(message)
    this.name = "ChatApiError"
  }
}

export async function sendMessage(message: string, user_id: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, user_id }),
    })
  } catch {
    throw new ChatApiError("Couldn't reach the server. Check your connection.", 0)
  }

  const body = await res.json().catch(() => ({}))
  const detail = body.detail ?? body.message

  if (!res.ok) {
    if (res.status === 422) {
      const msg = typeof detail === "string" ? detail : "Please enter a valid message."
      throw new ChatApiError(msg, 422, detail)
    }
    if (res.status === 404) throw new ChatApiError("Service unavailable. Please try again later.", 404, detail)
    if (res.status >= 500) throw new ChatApiError("Something went wrong on our side. Please try again.", res.status, detail)
    const msg = typeof detail === "string" ? detail : "Something went wrong. Please try again."
    throw new ChatApiError(msg, res.status, detail)
  }

  return body.response ?? ""
}
