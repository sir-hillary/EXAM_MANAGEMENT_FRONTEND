import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  GraduationCap,
  ArrowLeft,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth.api";
import { useActiveBanners } from "../../hooks/useBanners";
import { useEffect } from "react";

// ── Schemas ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// ── Tiny shared components ────────────────────────────────────────────────────
const ErrorBanner = ({ msg }) =>
  !msg ? null : (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mb-5 text-sm text-red-700 leading-relaxed">
      {msg}
    </div>
  );

// const SuccessBanner = ({ msg }) => !msg ? null : (
//   <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3.5 py-3 mb-5 text-sm text-green-700 leading-relaxed">
//     {msg}
//   </div>
// );

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
    {children}
  </label>
);

const InputField = ({
  register,
  name,
  type = "text",
  placeholder,
  error,
  autoComplete,
  rightSlot,
}) => (
  <div className="mb-4">
    <div className="relative">
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors
          ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-slate-800"}
          ${rightSlot ? "pr-10" : ""}`}
        {...register(name)}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error.message}</p>}
  </div>
);

const PrimaryBtn = ({ children, disabled, type = "submit", onClick }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className="w-full py-3 text-sm font-bold text-white rounded-xl transition-opacity disabled:opacity-60"
    style={{
      background: "linear-gradient(135deg,#1a2744,#243355)",
      boxShadow: "0 4px 14px rgba(26,39,68,0.28)",
    }}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-2.5 text-sm font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
  >
    {children}
  </button>
);

const BackBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-5 transition-colors"
  >
    <ArrowLeft size={13} /> Back
  </button>
);

// ── OTP input ─────────────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange, error }) => {
  const digits = (value || "").split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    onChange(next.join(""));
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text);
    e.preventDefault();
  };

  return (
    <div className="mb-5">
      <div className="flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
            style={{
              width: "clamp(36px, 12vw, 48px)",
              height: "clamp(44px, 14vw, 56px)",
              borderColor: d ? "#c9a84c" : "#e2e8f0",
              background: d ? "#fffbeb" : "#f8fafc",
              color: "#1a2744",
            }}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};

// ── Brand panel — desktop left side ──────────────────────────────────────────
const BrandPanel = () => {
  const banners = useActiveBanners();
  const slides = banners.data ?? [];

  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setFading(true);

      setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length);
        setFading(false);
      }, 400);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[current];

  return (
    <div
      className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Background image layer */}
      {activeSlide ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url(${activeSlide.image_url})`,
            opacity: fading ? 0 : 1,
          }}
        />
      ) : (
        // Fallback gradient when no banners have been uploaded
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0f1a30 0%, #1a2744 60%, #1a3a2a 100%)",
          }}
        />
      )}

      {/* Overlay — keeps text readable over the image */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,20,40,0.45) 0%, rgba(10,20,40,0.72) 100%)",
        }}
      />

      {/* Content on top of the image */}
      <div className="relative z-10 flex flex-col h-full px-12 py-10">
        {/* School identity */}
        <div className="flex items-center gap-3 mb-auto">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,#c9a84c,#e8cc85)",
              boxShadow: "0 4px 14px rgba(201,168,76,0.4)",
            }}
          >
            <GraduationCap size={22} color="#1a2744" strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-sm font-black text-white leading-tight">
              Mukuru Outreach Academy
            </p>

            <p
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: "#c9a84c" }}
            >
              Exam Management System
            </p>
          </div>
        </div>

        {/* Slide caption */}
        {activeSlide && (
          <div
            className="mb-8 transition-opacity duration-500"
            style={{
              opacity: fading ? 0 : 1,
            }}
          >
            {activeSlide.title && (
              <h2 className="text-2xl font-black text-white leading-tight mb-2">
                {activeSlide.title}
              </h2>
            )}

            {activeSlide.caption && (
              <p className="text-sm text-white/75 leading-relaxed max-w-xs">
                {activeSlide.caption}
              </p>
            )}
          </div>
        )}

        {/* Fallback text when no banners exist */}
        {slides.length === 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white leading-tight mb-2">
              Learning and
              <br />
              achieving together
            </h2>

            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Manage learner results, generate report cards, and track academic
              progress across all classes and divisions.
            </p>
          </div>
        )}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2 mb-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setFading(true);

                  setTimeout(() => {
                    setCurrent(i);
                    setFading(false);
                  }, 300);
                }}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px",
                  background:
                    i === current ? "#c9a84c" : "rgba(255,255,255,0.35)",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Card wrapper ──────────────────────────────────────────────────────────────
const Card = ({ children }) => (
  <div
    className="w-full rounded-2xl p-7 sm:p-8"
    style={{
      maxWidth: "400px",
      background: "#ffffff",
      boxShadow: "0 24px 64px rgba(0,0,0,0.32)",
    }}
  >
    {/* Mobile-only header */}
    <div className="flex lg:hidden items-center gap-2.5 mb-6">
      <div
        className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: "linear-gradient(135deg,#c9a84c,#e8cc85)" }}
      >
        <GraduationCap size={17} color="#1a2744" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-xs font-bold text-white leading-tight">
          Mukuru Outreach Academy
        </p>
        <p className="text-xs text-slate-400">Exam Management System</p>
      </div>
    </div>
    {children}
  </div>
);

// ── Outer layout ──────────────────────────────────────────────────────────────
const Layout = ({ children }) => (
  <div
    className="min-h-screen flex"
    style={{
      background: "linear-gradient(135deg,#0f1a30 0%,#1a2744 55%,#0f1a30 100%)",
    }}
  >
    <BrandPanel />
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
      {children}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function AuthPage() {
  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [view, setView] = useState("login");
  const [serverError, setServerError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingRole, setPendingRole] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [resending, setResending] = useState(false);

  const go = (v) => {
    setServerError("");
    setOtpError("");
    setView(v);
  };
  const err = (msg) =>
    setServerError(msg || "Something went wrong. Try again.");

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const pwForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onLogin = async (data) => {
    setServerError("");
    try {
      await contextLogin(data.email, data.password);
      navigate(from, { replace: true });
    } catch (e) {
      err(e.message);
    }
  };

  const onRequestOtp = async (data) => {
    setServerError("");
    try {
      const res = await authApi.requestOtp(data.email);
      setPendingEmail(data.email);
      setPendingRole(res.role);
      setOtpValue("");
      go("register-otp");
    } catch (e) {
      err(e.message);
    }
  };

  const onVerifyOtp = () => {
    if (otpValue.length !== 6) {
      setOtpError("Enter the 6-digit code from your email");
      return;
    }
    setOtpError("");
    go("register-password");
  };

  const onCompleteRegister = async (data) => {
    setServerError("");
    try {
      const res = await authApi.completeRegister({
        email: pendingEmail,
        otp: otpValue,
        password: data.password,
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      go("register-done");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
    } catch (e) {
      err(e.message);
      if (e.message?.toLowerCase().includes("code")) go("register-otp");
    }
  };

  const onForgotRequest = async (data) => {
    setServerError("");
    try {
      await authApi.forgotPassword(data.email);
      setPendingEmail(data.email);
      setOtpValue("");
      go("forgot-otp");
    } catch (e) {
      err(e.message);
    }
  };

  const onForgotVerifyOtp = () => {
    if (otpValue.length !== 6) {
      setOtpError("Enter the 6-digit code from your email");
      return;
    }
    setOtpError("");
    go("forgot-password");
  };

  const onResetPassword = async (data) => {
    setServerError("");
    try {
      await authApi.resetPassword({
        email: pendingEmail,
        otp: otpValue,
        new_password: data.password,
      });
      go("forgot-done");
    } catch (e) {
      err(e.message);
      if (e.message?.toLowerCase().includes("code")) go("forgot-otp");
    }
  };

  const resendOtp = async (type) => {
    setResending(true);
    try {
      if (type === "register") await authApi.requestOtp(pendingEmail);
      else await authApi.forgotPassword(pendingEmail);
      setOtpValue("");
      setServerError("");
    } catch (e) {
      err(e.message);
    } finally {
      setResending(false);
    }
  };

  // ── VIEW: Login ──────────────────────────────────────────────────────────
  if (view === "login")
    return (
      <Layout>
        <Card>
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Sign in to your account to continue
          </p>
          <ErrorBanner msg={serverError} />
          <form onSubmit={loginForm.handleSubmit(onLogin)}>
            <Label>Email address</Label>
            <InputField
              register={loginForm.register}
              name="email"
              type="email"
              placeholder="you@school.ac.ke"
              autoComplete="email"
              error={loginForm.formState.errors.email}
            />
            <Label>Password</Label>
            <InputField
              register={loginForm.register}
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              error={loginForm.formState.errors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <div className="mb-5">
              <PrimaryBtn disabled={loginForm.formState.isSubmitting}>
                {loginForm.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </PrimaryBtn>
            </div>
          </form>

          <button
            type="button"
            onClick={() => go("forgot-email")}
            className="w-full text-center text-xs text-slate-700 font-semibold mb-4 hover:text-slate-900 transition-colors"
          >
            Forgot your password?
          </button>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 text-center mb-2.5">
              Don't have an account?
            </p>
            <GhostBtn
              onClick={() => {
                emailForm.reset();
                go("register-email");
              }}
            >
              Create an account
            </GhostBtn>
          </div>
        </Card>
      </Layout>
    );

  // ── VIEW: Register — email ───────────────────────────────────────────────
  if (view === "register-email")
    return (
      <Layout>
        <Card>
          <BackBtn onClick={() => go("login")} />
          <Mail size={26} color="#1a2744" className="mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Create your account
          </h2>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            Teachers: use your official school email.
            <br />
            Parents: use the email registered for your child.
          </p>
          <ErrorBanner msg={serverError} />
          <form onSubmit={emailForm.handleSubmit(onRequestOtp)}>
            <Label>Email address</Label>
            <InputField
              register={emailForm.register}
              name="email"
              type="email"
              placeholder="Enter your email"
              error={emailForm.formState.errors.email}
            />
            <PrimaryBtn disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting
                ? "Checking…"
                : "Send verification code"}
            </PrimaryBtn>
          </form>
        </Card>
      </Layout>
    );

  // ── VIEW: Register — OTP ─────────────────────────────────────────────────
  if (view === "register-otp")
    return (
      <Layout>
        <Card>
          <KeyRound size={26} color="#1a2744" className="mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Check your email
          </h2>
          <p className="text-xs text-gray-500 mb-1">
            We sent a 6-digit code to
          </p>
          <p className="text-sm font-bold text-slate-800 mb-4 truncate">
            {pendingEmail}
          </p>
          {pendingRole && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4 text-xs font-semibold text-green-700">
              ✓ Recognised as:{" "}
              {pendingRole === "admin"
                ? "Administrator"
                : pendingRole === "teacher"
                  ? "Teacher"
                  : "Parent / Student"}
            </div>
          )}
          <ErrorBanner msg={serverError} />
          <OtpInput value={otpValue} onChange={setOtpValue} error={otpError} />
          <div className="mb-3">
            <PrimaryBtn type="button" onClick={onVerifyOtp}>
              Verify code
            </PrimaryBtn>
          </div>
          <button
            type="button"
            onClick={() => resendOtp("register")}
            disabled={resending}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 py-2"
          >
            <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
            {resending ? "Resending…" : "Resend code"}
          </button>
        </Card>
      </Layout>
    );

  // ── VIEW: Register — set password ────────────────────────────────────────
  if (view === "register-password")
    return (
      <Layout>
        <Card>
          <Lock size={26} color="#1a2744" className="mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Set your password
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Choose a secure password for your account.
          </p>
          <ErrorBanner msg={serverError} />
          <form onSubmit={pwForm.handleSubmit(onCompleteRegister)}>
            <Label>Password</Label>
            <InputField
              register={pwForm.register}
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Min 8 chars, uppercase, number"
              error={pwForm.formState.errors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <Label>Confirm password</Label>
            <InputField
              register={pwForm.register}
              name="confirm"
              type={showPw2 ? "text" : "password"}
              placeholder="Repeat your password"
              error={pwForm.formState.errors.confirm}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw2((s) => !s)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-4 text-xs text-gray-500 leading-relaxed">
              8+ characters · one uppercase · one lowercase · one number
            </div>
            <PrimaryBtn disabled={pwForm.formState.isSubmitting}>
              {pwForm.formState.isSubmitting
                ? "Creating account…"
                : "Create account"}
            </PrimaryBtn>
          </form>
        </Card>
      </Layout>
    );

  // ── VIEW: Register done ──────────────────────────────────────────────────
  if (view === "register-done")
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 size={48} color="#15803d" className="mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Account created!
            </h2>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard…
            </p>
          </div>
        </Card>
      </Layout>
    );

  // ── VIEW: Forgot — email ─────────────────────────────────────────────────
  if (view === "forgot-email")
    return (
      <Layout>
        <Card>
          <BackBtn onClick={() => go("login")} />
          <Lock size={26} color="#1a2744" className="mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Reset your password
          </h2>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            Enter your account email and we'll send a reset code.
          </p>
          <ErrorBanner msg={serverError} />
          <form onSubmit={emailForm.handleSubmit(onForgotRequest)}>
            <Label>Email address</Label>
            <InputField
              register={emailForm.register}
              name="email"
              type="email"
              placeholder="Enter your email"
              error={emailForm.formState.errors.email}
            />
            <PrimaryBtn disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting
                ? "Sending…"
                : "Send reset code"}
            </PrimaryBtn>
          </form>
        </Card>
      </Layout>
    );

  // ── VIEW: Forgot — OTP ───────────────────────────────────────────────────
  if (view === "forgot-otp")
    return (
      <Layout>
        <Card>
          <KeyRound size={26} color="#1a2744" className="mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Enter reset code
          </h2>
          <p className="text-xs text-gray-500 mb-1">Code sent to</p>
          <p className="text-sm font-bold text-slate-800 mb-5 truncate">
            {pendingEmail}
          </p>
          <ErrorBanner msg={serverError} />
          <OtpInput value={otpValue} onChange={setOtpValue} error={otpError} />
          <div className="mb-3">
            <PrimaryBtn type="button" onClick={onForgotVerifyOtp}>
              Verify code
            </PrimaryBtn>
          </div>
          <button
            type="button"
            onClick={() => resendOtp("forgot")}
            disabled={resending}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 py-2"
          >
            <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
            {resending ? "Resending…" : "Resend code"}
          </button>
        </Card>
      </Layout>
    );

  // ── VIEW: Forgot — new password ──────────────────────────────────────────
  if (view === "forgot-password")
    return (
      <Layout>
        <Card>
          <Lock size={26} color="#1a2744" className="mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Choose a new password
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Enter your new password below.
          </p>
          <ErrorBanner msg={serverError} />
          <form onSubmit={pwForm.handleSubmit(onResetPassword)}>
            <Label>New password</Label>
            <InputField
              register={pwForm.register}
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Min 8 chars, uppercase, number"
              error={pwForm.formState.errors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <Label>Confirm password</Label>
            <InputField
              register={pwForm.register}
              name="confirm"
              type={showPw2 ? "text" : "password"}
              placeholder="Repeat new password"
              error={pwForm.formState.errors.confirm}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw2((s) => !s)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <PrimaryBtn disabled={pwForm.formState.isSubmitting}>
              {pwForm.formState.isSubmitting ? "Resetting…" : "Reset password"}
            </PrimaryBtn>
          </form>
        </Card>
      </Layout>
    );

  // ── VIEW: Forgot done ────────────────────────────────────────────────────
  if (view === "forgot-done")
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 size={48} color="#15803d" className="mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Password reset!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been updated successfully.
            </p>
            <PrimaryBtn
              type="button"
              onClick={() => {
                pwForm.reset();
                go("login");
              }}
            >
              Sign in now
            </PrimaryBtn>
          </div>
        </Card>
      </Layout>
    );

  return null;
}
