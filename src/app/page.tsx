"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (login(email)) {
      router.push('/dashboard');
    } else {
      setError("Email not found. Please use a valid Project Duo email.");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b lg:bg-gradient-to-r from-white to-blue/90 lg:to-orange/90">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Logo */}
        <div className="h-[25vh] lg:h-screen flex lg:w-1/2 items-center justify-center p-4 lg:p-12">
          <div className="m-auto mb-0 lg:mb-auto w-full max-w-sm lg:max-w-3xl">
            <Image 
              src="/assets/pd/colored_wide_logo.png" 
              alt="logo" 
              width={1200} 
              height={144}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white/70 backdrop-blur-sm border border-orange/20 rounded-2xl p-8 shadow-lg">
              {/* Header */}
              <div className="text-center mb-8 text-orange">
                <h2 className="text-3xl font-bold mb-2 text-blue/90">
                  Welcome Back
                </h2>
                <p className="text-black/80">
                  Sign in to your account
                </p>
              </div>

              {/* Login Form */}
              <div className="space-y-6">
                {/* Username Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black/50 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-lg placeholder-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all duration-200"
                      placeholder="Enter your username"
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-black/50 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-lg placeholder-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="h-4 w-4 text-orange bg-white/10 border-white/30 focus:ring-orange focus:ring-2"
                    />
                    <label htmlFor="remember-me" className="text-black/80 ml-2 block text-sm">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button
                      type="button"
                      className="font-medium text-black/80 hover:text-orange/80 transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm text-white font-medium bg-blue hover:bg-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange transition-all duration-200"
                  onClick={handleLogin}
                >
                  Sign In
                </button>

                {/* Divider */}
                <div className="relative flex">
                    <div className="m-auto w-5/6 border-t border-black/20" />
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  className="w-full flex justify-center items-center py-3 px-4 border border-white/30 rounded-lg shadow-sm text-sm font-medium bg-white/90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
