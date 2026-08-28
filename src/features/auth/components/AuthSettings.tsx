import { useState } from "react";
import { FiUserCheck, FiLogOut, FiKey, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { useAuth } from "../hooks/useAuth";

export default function AuthSettings() {
  const { user, isAuthenticated, login, register, logout, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const successResult = await login(username, password);
    if (successResult) {
      setSuccess("Successfully signed in!");
      setUsername("");
      setPassword("");
    } else {
      setError("Invalid username or password");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !password || !firstName || !lastName) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);
    const successResult = await register(username, email, password, firstName, lastName);
    if (successResult) {
      setSuccess("Account created and signed in!");
      setUsername("");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    } else {
      setError("Registration failed. Username or email may already be taken.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    setError("");
    setSuccess("");
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-5">
        <div className="flex gap-2 border-b border-zinc-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab("signin")}
            className={`flex-1 py-3 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === "signin"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === "register"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50/80 p-3 text-red-700 dark:bg-red-500/15 dark:text-red-400">
            <FiAlertCircle size={18} className="shrink-0" aria-hidden="true" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 p-3 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <FiCheckCircle size={18} className="shrink-0" aria-hidden="true" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {activeTab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="auth-username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <FiUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <FiUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                  <input
                    id="reg-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                    placeholder="John"
                    required
                    autoComplete="given-name"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <FiUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                  <input
                    id="reg-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                    placeholder="Doe"
                    required
                    autoComplete="family-name"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <FiUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                  placeholder="Choose a username"
                  required
                  autoComplete="username"
                  disabled={loading}
                  minLength={3}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          By signing in, you agree to wger's Terms of Service and Privacy Policy
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50 dark:bg-emerald-500/10 dark:border-emerald-500/20">
        <FiUserCheck className="flex-shrink-0 text-emerald-600 dark:text-emerald-400" size={24} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-white truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">@{user?.username}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
          icon={<FiLogOut size={18} aria-hidden="true" />}
        >
          Sign Out
        </Button>

        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
          Your workouts and data will remain stored locally.
        </p>
      </div>
    </div>
  );
}