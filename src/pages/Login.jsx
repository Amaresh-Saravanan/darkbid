import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { PageTransition } from '../components/shared/PageTransition'
import { Button } from '../components/ui/button'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [localError, setLocalError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setLocalError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setLocalError('Please fill in all fields')
      return
    }

    try {
      await login(formData.username, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-display mb-4">Welcome Back</h1>
            <p className="text-text-secondary text-lg">
              Sign in to your account to participate in sealed-bid auctions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-primary">
                Email Address
              </label>
              <input
                type="email"
                name="username"
                placeholder="you@example.com"
                value={formData.username}
                onChange={handleChange}
                className="px-4 py-3 rounded-lg bg-bg-elevated border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="px-4 py-3 rounded-lg bg-bg-elevated border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={loading}
              />
            </div>

            {/* Error message */}
            {(localError || error) && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {localError || error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-subtle"></div>
            <span className="text-text-muted text-sm">or</span>
            <div className="flex-1 h-px bg-border-subtle"></div>
          </div>

          {/* Footer */}
          <p className="text-center text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
              Create one
            </Link>
          </p>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-text-muted hover:text-text-secondary text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
