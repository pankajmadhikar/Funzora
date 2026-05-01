import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../services/apiService';
import AuthLayout, { AuthLogo } from './AuthLayout';

const primary = '#F17A7E';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstname = parts[0] || '';
  const lastname = parts.length > 1 ? parts.slice(1).join(' ') : 'User';
  return { firstname, lastname };
}

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions and Privacy Policy');
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    const { firstname, lastname } = splitFullName(formData.fullName);
    if (!firstname) {
      toast.error('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname,
          lastname,
          email: formData.email.trim(),
          phone: phoneDigits,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showTrustBar>
      <div className="relative z-20 w-full max-w-[400px] sm:max-w-[420px]">
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-6 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] sm:px-7 sm:py-7"
          style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
        >
          <AuthLogo />

          <h1 className="text-center text-[20px] font-semibold leading-tight text-[#1F2937] sm:text-[22px]">
            Create Account
          </h1>
          <p className="mt-1.5 text-center text-[13px] font-normal text-[#6B7280] sm:text-[14px]">
            Join FunZora and explore joy!
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3 sm:mt-6 sm:space-y-3.5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-medium text-[#1F2937]">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6B7280]"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-12 w-full rounded-[10px] border border-[#E5E7EB] bg-white pl-11 pr-4 text-[15px] text-[#1F2937] outline-none transition-[box-shadow,border-color] placeholder:text-[#9CA3AF] focus:border-[#F17A7E] focus:ring-2 focus:ring-[#F17A7E]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-[#1F2937]">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6B7280]"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-[10px] border border-[#E5E7EB] bg-white pl-11 pr-4 text-[15px] text-[#1F2937] outline-none transition-[box-shadow,border-color] placeholder:text-[#9CA3AF] focus:border-[#F17A7E] focus:ring-2 focus:ring-[#F17A7E]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-[13px] font-medium text-[#1F2937]">
                Mobile number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                maxLength={10}
                placeholder="10-digit number for orders"
                value={formData.phone}
                onChange={handleChange}
                className="h-12 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[15px] text-[#1F2937] outline-none transition-[box-shadow,border-color] placeholder:text-[#9CA3AF] focus:border-[#F17A7E] focus:ring-2 focus:ring-[#F17A7E]/20"
              />
              <p className="mt-1 text-[11px] leading-snug text-[#6B7280] sm:text-[12px]">
                Required for delivery updates (10 digits).
              </p>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-[#1F2937]">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6B7280]"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 w-full rounded-[10px] border border-[#E5E7EB] bg-white pl-11 pr-12 text-[15px] text-[#1F2937] outline-none transition-[box-shadow,border-color] placeholder:text-[#9CA3AF] focus:border-[#F17A7E] focus:ring-2 focus:ring-[#F17A7E]/20"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F9FAFB]"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-medium text-[#1F2937]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6B7280]"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-12 w-full rounded-[10px] border border-[#E5E7EB] bg-white pl-11 pr-12 text-[15px] text-[#1F2937] outline-none transition-[box-shadow,border-color] placeholder:text-[#9CA3AF] focus:border-[#F17A7E] focus:ring-2 focus:ring-[#F17A7E]/20"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F9FAFB]"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[#E5E7EB] text-[#F17A7E] focus:ring-[#F17A7E]"
              />
              <span className="text-[13px] font-normal leading-snug text-[#6B7280]">
                I agree to the{' '}
                <button type="button" className="font-semibold text-[#F17A7E] hover:underline" onClick={() => toast('Terms page coming soon')}>
                  Terms &amp; Conditions
                </button>{' '}
                and{' '}
                <button type="button" className="font-semibold text-[#F17A7E] hover:underline" onClick={() => toast('Privacy policy coming soon')}>
                  Privacy Policy
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: primary }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 sm:my-6">
            <span className="h-px flex-1 bg-[#E5E7EB]" />
            <span className="text-[13px] font-normal text-[#6B7280]">OR</span>
            <span className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#1F2937] hover:bg-[#F9FAFB]"
              onClick={() => toast('Google sign-in coming soon')}
            >
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#1F2937] hover:bg-[#F9FAFB]"
              onClick={() => toast('Facebook sign-in coming soon')}
            >
              <FacebookIcon />
              Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-[13px] text-[#6B7280] sm:mt-7 sm:text-[14px]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#F17A7E] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
