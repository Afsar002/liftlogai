import { useState } from "react";
import { FiMail, FiLock, FiUser, FiAlertCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../../shared/components/layout/Layout";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import { AnimatedPage } from "../../../shared/components/motion";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(username, password);
    if (success) {
      navigate("/profile");
    } else {
      setError("Invalid username or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <AnimatedPage className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card variant="elevated" padding="lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome Back</h1>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                Sign in to sync your workouts with wger
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-2 rounded-xl bg-red-50/80 p-3 text-red-700 dark:bg-red-500/15 dark:text-red-400"
              >
                <FiAlertCircle size={18} className="shrink-0" aria-hidden="true" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    disabled={loading || authLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={loading || authLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                loading={loading || authLoading}
              >
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
                Create one
              </Link>
            </p>
          </Card>

          <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            By signing in, you agree to wger's Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </AnimatedPage>
    </Layout>
  );
}