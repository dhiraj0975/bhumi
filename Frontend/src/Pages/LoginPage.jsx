import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../axios/axios";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const demoFill = () => {
    setUsername("admin");
    setPassword("password");
    toast.info("Demo filled");
  };

  const submit = async (e) => {
    e.preventDefault();   
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      // If using JWT
      login(data.token, data.user, { remember }); // respect remember for persistence in your context
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Soft animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-white via-sky-500 to-emerald-400 opacity-90" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

      {/* Center container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Branding / Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              {/* <span className="text-2xl font-extrabold text-white">B</span> */}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-black drop-shadow">
              Welcome to Bhumisha ERP
            </h1>
            <p className="mt-1 text-sm text-blue-500">Sign in to continue</p>
          </div>

          {/* Glassmorphism Card */}
          <div className="rounded-2xl border border-white/20 bg-white/25 p-6 shadow-2xl backdrop-blur-md transition-all">
            <form onSubmit={submit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Username
                </label>
                <div className="relative">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded-lg border border-white/30 bg-white/60 px-3 py-2 text-gray-800 placeholder:text-gray-500 outline-none ring-0 transition focus:border-white focus:bg-white"
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    @
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/30 bg-white/60 px-3 py-2 pr-10 text-gray-800 placeholder:text-gray-500 outline-none transition focus:border-white focus:bg-white"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-700 hover:bg-black/5"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember / Demo */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/40 bg-white/60 text-indigo-600 focus:ring-white"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={demoFill}
                  className="text-sm text-white/90 underline-offset-4 hover:underline"
                >
                  Fill demo
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white ring-indigo-300 transition hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring"
              >
                <span className="absolute inset-0 -z-10 translate-y-8 bg-white/20 opacity-0 blur-xl transition group-hover:translate-y-0 group-hover:opacity-100" />
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-4 flex items-center justify-between text-xs text-white/80">

              <a href="#" className="hover:underline">
                Privacy & Terms
              </a>
            </div>
          </div>

          {/* Bottom subtle note */}
          <div className="mt-4 text-center text-xs text-white/80">
            © {new Date().getFullYear()} Bhumisha • All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}
