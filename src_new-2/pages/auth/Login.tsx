"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { authAPI, LoginError } from "../../api/auth"
import { useAuthStore } from "../../store/authStore"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const loginMutation = useMutation({
    mutationFn: () => authAPI.login(username, password),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      if (data.user.roles?.includes("administrator") || data.user.roles?.includes("shop_manager")) {
        navigate("/dashboard")
      } else {
        navigate("/account")
      }
    },
     onError: (err) => {
      if (err instanceof LoginError) {
        setError(err.message)
      } else {
        setError("Unexpected error. Please try again.")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    loginMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Toyfront</h1>
          <p className="text-gray-600">Welcome Back</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" disabled={loginMutation.isPending} className="w-full btn btn-primary py-3 text-lg">
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up here
              </Link>
            </p>
            <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm block">
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
