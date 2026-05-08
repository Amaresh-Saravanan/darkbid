import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { PageTransition } from '../components/shared/PageTransition'
import { Button } from '../components/ui/button'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [localError, setLocalError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setLocalError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setLocalError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }

    if (!formData.username.includes('@')) {
      setLocalError('Please enter a valid email address')
      return
    }

    try {
      await register(formData.username, formData.password)
      // Redirect to login after successful registration
      navigate('/login', { state: { email: formData.username } })
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
            <h1 className="text-display mb-4">Join DarkBid</h1>
            <p className="text-text-secondary text-lg">
              Create an account to launch and participate in sealed-bid auctions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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
                Password (min 8 characters)
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-primary">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
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

            {/* Terms agreement */}
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-border-default"
                disabled={loading}
              />
              <span className="text-text-secondary">
                I agree to the terms and conditions and understand that sealed-bid auctions are immutable once committed
              </span>
            </label>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign in
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
