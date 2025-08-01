"use client"
import { signIn, getSession } from "next-auth/react";
import { useOptimizedSession } from "@/hooks/useOptimizedSession";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useOptimizedSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "authenticated") {
      if (session?.user?.profileCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/auth/complete-profile");
      }
    }
  }, [session, status, router]);

  const handleCredentialsLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log('Attempting credentials login for:', email);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log('Login result:', result);

      if (result?.error) {
        console.error('Login error:', result.error);
        setError("Invalid email or password");
      } else if (result?.ok) {
        console.log('Login successful, checking profile...');
        await checkProfileAndRedirect();
      } else {
        console.error('Unexpected login result:', result);
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Login exception:', error);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { redirect: false });
      await checkProfileAndRedirect();
    } catch {
      setError("Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const checkProfileAndRedirect = async () => {
    const session = await getSession();
    if (session?.user) {
      if (session?.user?.profileCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/auth/complete-profile");
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundImage: "url('/assets/PD/landing_bg.png')", backgroundSize: "cover", backgroundRepeat: "repeat", backgroundPosition: "center" }}>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <div className="absolute h-screen w-full" style={{ backgroundImage: "url('/assets/PD/landing1.png')", backgroundSize: "contain", backgroundPosition: "left", backgroundRepeat: "no-repeat" }}>
        </div>

        <div className="flex w-full justify-end h-screen">
          <div className="w-1/2"></div>
          <div className="flex w-1/2 justify-center items-center">
            <div className="m-auto w-1/2 min-w-[350px] bg-orange-50/90 backdrop-blur-sm border-3 border-gray-800/20 rounded-3xl p-8 shadow-xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-blue-900">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to your account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <div className="space-y-6">
                {/* Username Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800"
                      placeholder="Enter your email"
                      onKeyPress={(e) => e.key === 'Enter' && handleCredentialsLogin()}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800"
                      placeholder="Enter your password"
                      onKeyPress={(e) => e.key === 'Enter' && handleCredentialsLogin()}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      disabled={isLoading}
                    />
                    <label htmlFor="remember-me" className="text-gray-700 ml-2 block text-sm">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button
                      type="button"
                      className="font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm text-white font-semibold bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                  onClick={handleCredentialsLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                {/* Divider */}
                <div className="relative flex py-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 text-gray-700 disabled:opacity-50"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {isLoading ? "Please wait..." : "Continue with Google"}
                </button>

                
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
