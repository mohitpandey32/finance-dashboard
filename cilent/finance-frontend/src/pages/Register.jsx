import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import './Register.css';

/* ── Password-strength helper ── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: 'Weak' };
  if (score === 2) return { score: 2, label: 'Fair' };
  if (score === 3) return { score: 3, label: 'Good' };
  return { score: 4, label: 'Strong' };
}

const strengthClass = {
  1: 'strength-weak',
  2: 'strength-fair',
  3: 'strength-good',
  4: 'strength-strong',
};

export default function Register() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const strength = getPasswordStrength(password);

  /* ── Validate & submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(name.trim(), email.trim(), password);
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success overlay ── */
  if (success) {
    return (
      <div className="login-page">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />

        <div className="register-success-overlay">
          <div className="register-success-card">
            <div className="register-success-icon">
              <CheckCircle size={36} />
            </div>
            <h2 className="register-success-title">Account Created!</h2>
            <p className="register-success-text">
              Your account has been created successfully. You can now sign in
              with your credentials.
            </p>
            <button
              className="btn btn-primary register-success-btn"
              onClick={() => navigate('/')}
            >
              <ArrowRight size={18} />
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <div className="login-container">
        {/* Branding */}
        <div className="login-brand">
          <div className="login-logo">
            <span className="login-logo-icon">₹</span>
          </div>
          <h1 className="login-title">FinanceHub</h1>
          <p className="login-subtitle">
            Start tracking your finances today
          </p>
        </div>

        {/* Register Card */}
        <div className="register-card">
          <h2 className="register-card-title">Create an account</h2>
          <p className="register-card-subtitle">
            Fill in your details to get started
          </p>

          {error && (
            <div className="register-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name
              </label>
              <div className="register-input-wrapper">
                <User size={18} className="register-input-icon" />
                <input
                  id="register-name"
                  type="text"
                  className="form-input register-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address
              </label>
              <div className="register-input-wrapper">
                <Mail size={18} className="register-input-icon" />
                <input
                  id="register-email"
                  type="email"
                  className="form-input register-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} className="register-input-icon" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input register-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="password-strength">
                  <div className="password-strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`password-strength-bar ${
                          i <= strength.score
                            ? `active ${strengthClass[strength.score]}`
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`password-strength-label ${strengthClass[strength.score]}`}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">
                Confirm Password
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} className="register-input-icon" />
                <input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input register-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary register-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="register-footer">
          Already have an account?{' '}
          <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
