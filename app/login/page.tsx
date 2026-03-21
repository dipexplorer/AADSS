"use client";

import axios from "axios";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });
  const [error, setError] = React.useState("");
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const login = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post("/api/user/login", user);
      console.log("login success", res.data);
      // toast.success("Login Success");
      router.push("/profile");
    } catch (err: any) {
      console.log("login error", err.message);
      // toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    }
  }, [user]);

  return (
    <div>
      <h1>Login Page {isLoading ? "Processing" : ""}</h1>
      <br />
      <label htmlFor="email">email</label>
      <input
        type="text"
        id="email"
        placeholder="Enter your email"
        value={user.email}
        onChange={(e) => {
          setUser({ ...user, email: e.target.value });
        }}
      />
      <br />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        placeholder="Enter your password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      <br />
      <button type="submit" onClick={login}>
        {buttonDisabled ? "Disabled" : "Login"}
      </button>
      <br />
      <Link href="/signup">Visit Signup</Link>
    </div>
  );
}
