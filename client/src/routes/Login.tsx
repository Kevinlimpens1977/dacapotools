import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/api'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const data = await login(password)
      localStorage.setItem('token', data.token)
      navigate('/admin')
    } catch (err) {
      setError('Invalid password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-4 border-2 border-green-700" style={{ borderWidth: '2px' }}>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Admin Login</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          Login
        </button>
      </form>
    </div>
  )
}
