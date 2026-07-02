import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError(null);
  };

  const validate = () => {
    const next = {};
    if (!form.username.trim() || form.username.trim().length < 3)
      next.username = "Username must be at least 3 characters";
    if (!form.password || form.password.length < 6)
      next.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form.username.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full rounded-xl bg-slate-800/70 border px-3.5 py-2.5
     text-[14px] text-slate-100 placeholder:text-slate-500
     focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60
     ${
       hasError
         ? "border-rose-500/60 focus:ring-rose-500/30"
         : "border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50"
     }`;

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Brand — absolute top-left, out of flow so form stays truly centered */}
      <div className="absolute top-0 left-0 flex items-center gap-3 px-6 h-16">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
          <Wallet size={18} strokeWidth={2.25} />
        </div>
        <span className="font-semibold text-[20px] md:text-[24px] tracking-tight text-slate-50">
          Monetra<span className="text-emerald-400">.</span>
        </span>
      </div>

      {/* Form — perfectly centered */}
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-slate-950/50">
          {/* Title + divider */}
          <div className="mb-5">
            <h1 className="text-[17px] font-semibold text-slate-100 tracking-tight">
              Create an account
            </h1>
            <div className="mt-3 h-px bg-white/10" />
          </div>

          {serverError && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5">
              <p className="text-[13px] text-rose-400">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange("username")}
                disabled={isLoading}
                className={fieldClass(errors.username)}
              />
              {errors.username && (
                <p className="mt-1 text-[12px] text-rose-400">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Choose a password"
                  value={form.password}
                  onChange={handleChange("password")}
                  disabled={isLoading}
                  className={fieldClass(errors.password) + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[12px] text-rose-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                disabled={isLoading}
                className={fieldClass(errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[12px] text-rose-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400
                         py-2.5 text-[14px] font-semibold text-slate-950 transition-colors mt-2
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-[13px] text-slate-500 mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
