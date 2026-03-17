import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
})

export const sendMessage = async (message: string, user_id: string) => {
  const res = await api.post("/chat", { message, user_id })
  return res.data.response
}