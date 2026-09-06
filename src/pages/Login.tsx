import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && password) {
      alert("Login successful!");
      window.location.href = "/dashboard";
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">💧</div>

        <h1>AquaSense</h1>
        <p className="subtitle">
          Smart Water Purification & Quality Monitoring
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        <p className="signup">
          Don't have an account? <span>Sign up</span>
        </p>
      </div>
    </div>
  );
}