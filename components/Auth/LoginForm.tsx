"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";

export default function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function login(e: any) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await authService.login({
        username,

        password,
      });

      if (res.data.status) {
        localStorage.setItem("user", JSON.stringify(res.data.user));

        router.push("/");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Login Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-xl rounded-xl p-8 w-[420px]">
      <h1 className="text-3xl font-bold text-center mb-8">
        Water Billing Login
      </h1>

      <form onSubmit={login} className="space-y-5">
        <div>
          <label>Username</label>

          <input
            className="border rounded w-full p-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            className="border rounded w-full p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-700 text-white p-3 rounded hover:bg-blue-800"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
}
