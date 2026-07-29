import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const roleHome = { admin: '/dashboard', teacher: '/dashboard', student: '/dashboard' };

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const user = await login(data.email, data.password);
      const to   = location.state?.from?.pathname || roleHome[user.role] || '/dashboard';
      navigate(to, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Check your credentials and try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f1a30 0%, #1a2744 50%, #0f1a30 100%)' }}>

      {/* Left panel — branding */}
      <div style={{ display: 'none', flex: '1', alignItems: 'center', justifyContent: 'center', padding: '48px' }}
        className="lg:flex flex-col">
        <div style={{ maxWidth: '360px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #c9a84c, #e8cc85)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 8px 24px rgba(201,168,76,0.35)' }}>
            <GraduationCap size={36} color="#1a2744" strokeWidth={2.5} />
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px', fontFamily: "'Segoe UI', sans-serif" }}>
            Mukuru Outreach<br />Academy
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.7', fontFamily: "'Segoe UI', sans-serif" }}>
            Exam Management System — securely manage learner results, report cards, and academic records.
          </p>
          <div style={{ marginTop: '40px', padding: '18px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: '#c9a84c', fontSize: '13px', fontStyle: 'italic', margin: 0, lineHeight: '1.6', fontFamily: "'Segoe UI', sans-serif" }}>
              "Learning and achieving together"
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#ffffff', borderRadius: '20px', padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #c9a84c, #e8cc85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#1a2744" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#1a2744', margin: 0 }}>Mukuru Outreach Academy</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Exam Management System</p>
            </div>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', fontFamily: "'Segoe UI', sans-serif" }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', fontFamily: "'Segoe UI', sans-serif" }}>
            Sign in to your account to continue
          </p>

          {serverError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
              <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, fontFamily: "'Segoe UI', sans-serif" }}>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: "'Segoe UI', sans-serif" }}>
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@school.ac.ke"
                style={{ width: '100%', padding: '11px 14px', fontSize: '14px', border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontFamily: "'Segoe UI', sans-serif", color: '#0f172a', background: '#f8fafc', boxSizing: 'border-box', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = '#1a2744'}
                onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0'}
                {...register('email')}
              />
              {errors.email && (
                <p style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '5px', fontFamily: "'Segoe UI', sans-serif" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: "'Segoe UI', sans-serif" }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  style={{ width: '100%', padding: '11px 40px 11px 14px', fontSize: '14px', border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontFamily: "'Segoe UI', sans-serif", color: '#0f172a', background: '#f8fafc', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#1a2744'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0'}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '5px', fontFamily: "'Segoe UI', sans-serif" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', color: '#ffffff', background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #1a2744, #243355)', border: 'none', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: "'Segoe UI', sans-serif", letterSpacing: '0.3px', transition: 'opacity .15s', boxShadow: '0 4px 14px rgba(26,39,68,0.35)' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Role hint */}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { role: 'Admin',   color: '#7c3aed', bg: '#f5f3ff' },
              { role: 'Teacher', color: '#1d4ed8', bg: '#eff6ff' },
              { role: 'Student', color: '#059669', bg: '#ecfdf5' },
            ].map(({ role, color, bg }) => (
              <div key={role} style={{ textAlign: 'center', padding: '8px 4px', background: bg, borderRadius: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color, margin: 0, fontFamily: "'Segoe UI', sans-serif" }}>{role}</p>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0', fontFamily: "'Segoe UI', sans-serif" }}>access</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '16px', fontFamily: "'Segoe UI', sans-serif" }}>
            Forgot your password? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}