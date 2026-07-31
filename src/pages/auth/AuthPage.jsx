/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, GraduationCap, ArrowLeft, Mail, Lock, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';

// ── Schemas ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const emailSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a number'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match', path: ['confirm'],
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Digits only'),
});

// ── Shared style helpers ──────────────────────────────────────────────────────
const S = {
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: "'Segoe UI',sans-serif" },
  input: (hasError) => ({
    width: '100%', padding: '11px 14px', fontSize: '13.5px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    borderRadius: '10px', outline: 'none',
    fontFamily: "'Segoe UI',sans-serif", color: '#0f172a',
    background: '#f8fafc', boxSizing: 'border-box',
  }),
  error: { fontSize: '11.5px', color: '#ef4444', marginTop: '5px', fontFamily: "'Segoe UI',sans-serif" },
  btn: (variant = 'primary') => ({
    width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700',
    background: variant === 'primary' ? 'linear-gradient(135deg,#1a2744,#243355)' : '#f1f5f9',
    border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontFamily: "'Segoe UI',sans-serif",
    boxShadow: variant === 'primary' ? '0 4px 14px rgba(26,39,68,0.3)' : 'none',
    color: variant === 'primary' ? '#fff' : '#374151',
  }),
};

// ── OTP input — 6 digit boxes ─────────────────────────────────────────────────
const OtpInput = ({ value, onChange, error }) => {
  const digits = (value || '').split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    onChange(next.join(''));
    if (v && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(text);
    e.preventDefault();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: '44px', height: '52px', textAlign: 'center',
              fontSize: '22px', fontWeight: '700', color: '#1a2744',
              border: `2px solid ${d ? '#c9a84c' : '#e2e8f0'}`,
              borderRadius: '10px', outline: 'none', background: d ? '#fffbeb' : '#f8fafc',
              fontFamily: "'Segoe UI',sans-serif", transition: 'border-color .15s',
            }}
          />
        ))}
      </div>
      {error && <p style={{ ...S.error, textAlign: 'center', marginTop: '8px' }}>{error}</p>}
    </div>
  );
};

// ── Left branding panel ───────────────────────────────────────────────────────
const BrandPanel = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }} className="hidden lg:flex">
    <div style={{ maxWidth: '340px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg,#c9a84c,#e8cc85)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(201,168,76,0.35)' }}>
        <GraduationCap size={40} color="#1a2744" strokeWidth={2.5} />
      </div>
      <h1 style={{ color: '#fff', fontSize: '30px', fontWeight: '900', margin: '0 0 8px', fontFamily: "'Segoe UI',sans-serif", lineHeight: 1.2 }}>
        Mukuru Outreach<br />Academy
      </h1>
      <p style={{ color: '#c9a84c', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 28px', fontFamily: "'Segoe UI',sans-serif" }}>
        Exam Management System
      </p>
      <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', fontFamily: "'Segoe UI',sans-serif", margin: '0 0 32px' }}>
        Manage learner results, generate report cards, and track academic progress across all classes and divisions.
      </p>

      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px 24px' }}>
        <p style={{ color: '#c9a84c', fontSize: '13px', fontStyle: 'italic', margin: '0 0 12px', fontFamily: "'Segoe UI',sans-serif", lineHeight: '1.6' }}>
          "Learning and achieving together"
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
          {[
            { label: 'Admin',   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
            { label: 'Teacher', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
            { label: 'Parent',  color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
          ].map(({ label, color, bg }) => (
            <div key={label} style={{ textAlign: 'center', padding: '8px 4px', background: bg, borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color, margin: 0, fontFamily: "'Segoe UI',sans-serif" }}>{label}</p>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0', fontFamily: "'Segoe UI',sans-serif" }}>portal</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Card = ({ children }) => (
  <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '20px', padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', fontFamily: "'Segoe UI',sans-serif" }}>
    {/* Mobile logo */}
    <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: 'linear-gradient(135deg,#c9a84c,#e8cc85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GraduationCap size={18} color="#1a2744" strokeWidth={2.5} />
      </div>
      <div>
        <p style={{ fontSize: '12px', fontWeight: '800', color: '#fff', margin: 0 }}>Mukuru Outreach Academy</p>
        <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Exam Management System</p>
      </div>
    </div>
    {children}
  </div>
);

const ErrorBanner = ({ msg }) => msg ? (
  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px', fontSize: '13px', color: '#dc2626', lineHeight: '1.5' }}>
    {msg}
  </div>
) : null;

const PwInput = ({ fieldName, form, show, onToggle, label, placeholder }) => {
  const err = form.formState.errors[fieldName];
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={S.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          style={{ ...S.input(!!err), paddingRight: '40px' }}
          {...form.register(fieldName)}
        />
        <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {err && <p style={S.error}>{err.message}</p>}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AuthPage() {
  const { login: contextLogin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  // view: 'login' | 'register-email' | 'register-otp' | 'register-password' | 'register-done'
  //     | 'forgot-email' | 'forgot-otp' | 'forgot-password' | 'forgot-done'
  const [view, setView]             = useState('login');
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showPw2, setShowPw2]       = useState(false);
  const [otpValue, setOtpValue]     = useState('');
  const [otpError, setOtpError]     = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingRole,  setPendingRole]  = useState('');
  const [resending,    setResending]    = useState(false);

  const clearErrors = () => { setServerError(''); setOtpError(''); };

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const pwForm    = useForm({ resolver: zodResolver(passwordSchema) });

  // ── Login submit ────────────────────────────────────────────────────────────
  const onLogin = async (data) => {
    clearErrors();
    try {
      await contextLogin(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    }
  };

  // ── Register: request OTP ───────────────────────────────────────────────────
  const onRequestOtp = async (data) => {
    clearErrors();
    try {
      const res = await authApi.requestOtp(data.email);
      setPendingEmail(data.email);
      setPendingRole(res.role);
      setOtpValue('');
      setView('register-otp');
    } catch (err) {
      setServerError(err.message);
    }
  };

  // ── Register: verify OTP ────────────────────────────────────────────────────
  const onVerifyOtp = () => {
    if (otpValue.length !== 6) { setOtpError('Enter the 6-digit code from your email'); return; }
    setOtpError('');
    setView('register-password');
  };

  // ── Register: complete ──────────────────────────────────────────────────────
  const onCompleteRegister = async (data) => {
    clearErrors();
    try {
      const res = await authApi.completeRegister({
        email: pendingEmail, otp: otpValue, password: data.password,
      });
      // Auto-login
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setView('register-done');
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err) {
      setServerError(err.message);
      if (err.message?.toLowerCase().includes('code')) setView('register-otp');
    }
  };

  // ── Forgot: request OTP ─────────────────────────────────────────────────────
  const onForgotRequest = async (data) => {
    clearErrors();
    try {
      await authApi.forgotPassword(data.email);
      setPendingEmail(data.email);
      setOtpValue('');
      setView('forgot-otp');
    } catch (err) {
      setServerError(err.message);
    }
  };

  // ── Forgot: verify OTP ──────────────────────────────────────────────────────
  const onForgotVerifyOtp = () => {
    if (otpValue.length !== 6) { setOtpError('Enter the 6-digit code from your email'); return; }
    setOtpError('');
    setView('forgot-password');
  };

  // ── Forgot: reset password ──────────────────────────────────────────────────
  const onResetPassword = async (data) => {
    clearErrors();
    try {
      await authApi.resetPassword({ email: pendingEmail, otp: otpValue, new_password: data.password });
      setView('forgot-done');
    } catch (err) {
      setServerError(err.message);
      if (err.message?.toLowerCase().includes('code')) setView('forgot-otp');
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const resendOtp = async (type) => {
    setResending(true);
    try {
      if (type === 'register') await authApi.requestOtp(pendingEmail);
      else await authApi.forgotPassword(pendingEmail);
      setOtpValue('');
      clearErrors();
    } catch (err) {
      setServerError(err.message);
    } finally { setResending(false); }
  };

  // ── VIEW: Login ─────────────────────────────────────────────────────────────
  if (view === 'login') return (
    <Layout>
      <Card>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>Welcome back</h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 22px' }}>Sign in to your account</p>
        <ErrorBanner msg={serverError} />
        <form onSubmit={loginForm.handleSubmit(onLogin)}>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Email address</label>
            <input type="email" autoComplete="email" placeholder="you@school.ac.ke"
              style={S.input(!!loginForm.formState.errors.email)}
              {...loginForm.register('email')} />
            {loginForm.formState.errors.email && <p style={S.error}>{loginForm.formState.errors.email.message}</p>}
          </div>
          <div style={{ marginBottom: '22px' }}>
            <label style={S.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} autoComplete="current-password"
                placeholder="Enter your password"
                style={{ ...S.input(!!loginForm.formState.errors.password), paddingRight: '40px' }}
                {...loginForm.register('password')} />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {loginForm.formState.errors.password && <p style={S.error}>{loginForm.formState.errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loginForm.formState.isSubmitting} style={{ ...S.btn('primary'), marginBottom: '12px' }}>
            {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <button onClick={() => { clearErrors(); setView('forgot-email'); }} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'center', fontSize: '12.5px', color: '#1a2744', cursor: 'pointer', padding: '6px', fontFamily: "'Segoe UI',sans-serif", fontWeight: '600' }}>
          Forgot your password?
        </button>
        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '18px', paddingTop: '18px', textAlign: 'center' }}>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 10px' }}>Don't have an account?</p>
          <button onClick={() => { clearErrors(); emailForm.reset(); setView('register-email'); }} style={{ ...S.btn('secondary'), fontSize: '13px' }}>
            Create an account
          </button>
        </div>
      </Card>
    </Layout>
  );

  // ── VIEW: Register — enter email ────────────────────────────────────────────
  if (view === 'register-email') return (
    <Layout>
      <Card>
        <button onClick={() => { clearErrors(); setView('login'); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12.5px', marginBottom: '20px', padding: 0, fontFamily: "'Segoe UI',sans-serif" }}>
          <ArrowLeft size={14} /> Back to login
        </button>
        <Mail size={28} color="#1a2744" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>Create your account</h2>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.6' }}>
          Teachers: use your official school email.<br />
          Parents: use the email registered for your child.
        </p>
        <ErrorBanner msg={serverError} />
        <form onSubmit={emailForm.handleSubmit(onRequestOtp)}>
          <div style={{ marginBottom: '18px' }}>
            <label style={S.label}>Email address</label>
            <input type="email" placeholder="Enter your email"
              style={S.input(!!emailForm.formState.errors.email)}
              {...emailForm.register('email')} />
            {emailForm.formState.errors.email && <p style={S.error}>{emailForm.formState.errors.email.message}</p>}
          </div>
          <button type="submit" disabled={emailForm.formState.isSubmitting} style={S.btn('primary')}>
            {emailForm.formState.isSubmitting ? 'Checking…' : 'Send verification code'}
          </button>
        </form>
      </Card>
    </Layout>
  );

  // ── VIEW: Register — enter OTP ──────────────────────────────────────────────
  if (view === 'register-otp') return (
    <Layout>
      <Card>
        <KeyRound size={28} color="#1a2744" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>Check your email</h2>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 4px', lineHeight: '1.6' }}>
          We sent a 6-digit code to
        </p>
        <p style={{ fontSize: '13.5px', fontWeight: '700', color: '#1a2744', margin: '0 0 20px' }}>{pendingEmail}</p>
        {pendingRole && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
            ✓ Recognised as: {pendingRole === 'admin' ? 'Administrator' : pendingRole === 'teacher' ? 'Teacher' : 'Parent / Student'}
          </div>
        )}
        <ErrorBanner msg={serverError} />
        <div style={{ marginBottom: '22px' }}>
          <OtpInput value={otpValue} onChange={setOtpValue} error={otpError} />
        </div>
        <button onClick={onVerifyOtp} style={{ ...S.btn('primary'), marginBottom: '12px' }}>
          Verify code
        </button>
        <button onClick={() => resendOtp('register')} disabled={resending} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'center', fontSize: '12.5px', color: '#1a2744', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontFamily: "'Segoe UI',sans-serif" }}>
          <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
          {resending ? 'Resending…' : 'Resend code'}
        </button>
      </Card>
    </Layout>
  );

  // ── VIEW: Register — set password ───────────────────────────────────────────
  if (view === 'register-password') return (
    <Layout>
      <Card>
        <Lock size={28} color="#1a2744" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>Set your password</h2>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 20px' }}>
          Choose a secure password for your account.
        </p>
        <ErrorBanner msg={serverError} />
        <form onSubmit={pwForm.handleSubmit(onCompleteRegister)}>
          <PwInput fieldName="password" form={pwForm} show={showPw} onToggle={() => setShowPw(s => !s)} label="Password" placeholder="Min 8 chars, uppercase, number" />
          <PwInput fieldName="confirm" form={pwForm} show={showPw2} onToggle={() => setShowPw2(s => !s)} label="Confirm password" placeholder="Repeat your password" />
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', marginBottom: '18px', fontSize: '11.5px', color: '#64748b', lineHeight: '1.7' }}>
            Must be 8+ characters · one uppercase · one lowercase · one number
          </div>
          <button type="submit" disabled={pwForm.formState.isSubmitting} style={S.btn('primary')}>
            {pwForm.formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </Card>
    </Layout>
  );

  // ── VIEW: Register done ─────────────────────────────────────────────────────
  if (view === 'register-done') return (
    <Layout>
      <Card>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <CheckCircle2 size={52} color="#15803d" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>Account created!</h2>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>Redirecting to your dashboard…</p>
        </div>
      </Card>
    </Layout>
  );

  // ── VIEW: Forgot — enter email ──────────────────────────────────────────────
  if (view === 'forgot-email') return (
    <Layout>
      <Card>
        <button onClick={() => { clearErrors(); setView('login'); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12.5px', marginBottom: '20px', padding: 0, fontFamily: "'Segoe UI',sans-serif" }}>
          <ArrowLeft size={14} /> Back to login
        </button>
        <Lock size={28} color="#1a2744" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>Reset your password</h2>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.6' }}>
          Enter your account email and we'll send you a reset code.
        </p>
        <ErrorBanner msg={serverError} />
        <form onSubmit={emailForm.handleSubmit(onForgotRequest)}>
          <div style={{ marginBottom: '18px' }}>
            <label style={S.label}>Email address</label>
            <input type="email" placeholder="Enter your email"
              style={S.input(!!emailForm.formState.errors.email)}
              {...emailForm.register('email')} />
            {emailForm.formState.errors.email && <p style={S.error}>{emailForm.formState.errors.email.message}</p>}
          </div>
          <button type="submit" disabled={emailForm.formState.isSubmitting} style={S.btn('primary')}>
            {emailForm.formState.isSubmitting ? 'Sending…' : 'Send reset code'}
          </button>
        </form>
      </Card>
    </Layout>
  );

  // ── VIEW: Forgot — enter OTP ────────────────────────────────────────────────
  if (view === 'forgot-otp') return (
    <Layout>
      <Card>
        <KeyRound size={28} color="#1a2744" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>Enter reset code</h2>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 4px' }}>Code sent to</p>
        <p style={{ fontSize: '13.5px', fontWeight: '700', color: '#1a2744', margin: '0 0 20px' }}>{pendingEmail}</p>
        <ErrorBanner msg={serverError} />
        <div style={{ marginBottom: '22px' }}>
          <OtpInput value={otpValue} onChange={setOtpValue} error={otpError} />
        </div>
        <button onClick={onForgotVerifyOtp} style={{ ...S.btn('primary'), marginBottom: '12px' }}>
          Verify code
        </button>
        <button onClick={() => resendOtp('forgot')} disabled={resending} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'center', fontSize: '12.5px', color: '#1a2744', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontFamily: "'Segoe UI',sans-serif" }}>
          <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
          {resending ? 'Resending…' : 'Resend code'}
        </button>
      </Card>
    </Layout>
  );

  // ── VIEW: Forgot — new password ─────────────────────────────────────────────
  if (view === 'forgot-password') return (
    <Layout>
      <Card>
        <Lock size={28} color="#1a2744" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>Choose a new password</h2>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 20px' }}>Enter your new password below.</p>
        <ErrorBanner msg={serverError} />
        <form onSubmit={pwForm.handleSubmit(onResetPassword)}>
          <PwInput fieldName="password" form={pwForm} show={showPw} onToggle={() => setShowPw(s => !s)} label="New password" placeholder="Min 8 chars, uppercase, number" />
          <PwInput fieldName="confirm" form={pwForm} show={showPw2} onToggle={() => setShowPw2(s => !s)} label="Confirm password" placeholder="Repeat new password" />
          <button type="submit" disabled={pwForm.formState.isSubmitting} style={{ ...S.btn('primary'), marginTop: '8px' }}>
            {pwForm.formState.isSubmitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </Card>
    </Layout>
  );

  // ── VIEW: Forgot done ───────────────────────────────────────────────────────
  if (view === 'forgot-done') return (
    <Layout>
      <Card>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <CheckCircle2 size={52} color="#15803d" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>Password reset!</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.6' }}>
            Your password has been updated successfully.
          </p>
          <button onClick={() => { clearErrors(); pwForm.reset(); setView('login'); }} style={S.btn('primary')}>
            Sign in now
          </button>
        </div>
      </Card>
    </Layout>
  );

  return null;
}

// ── Outer layout wrapper shared by all views ──────────────────────────────────
function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg,#0f1a30 0%,#1a2744 50%,#0f1a30 100%)' }}>
      <BrandPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}