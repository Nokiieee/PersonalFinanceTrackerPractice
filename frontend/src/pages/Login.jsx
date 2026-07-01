import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Please enter your username and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 mb-3">
            <Wallet size={24} strokeWidth={2} />
          </div>
          <h1 className="text-[22px] font-semibold text-slate-50 tracking-tight">
            Monetra
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-slate-950/50">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5">
              <p className="text-[13px] text-rose-400">{error}</p>
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
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange("username")}
                disabled={isLoading}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3.5 py-2.5
                           text-[14px] text-slate-100 placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                           transition-shadow disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange("password")}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3.5 py-2.5 pr-11
                             text-[14px] text-slate-100 placeholder:text-slate-500
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                             transition-shadow disabled:opacity-60"
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
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-[13px] text-slate-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
