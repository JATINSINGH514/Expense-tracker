import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {

  // ================= STATES =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();

    // validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/users/login", {
        email,
        password
      });

      // store JWT token
      localStorage.setItem("token", res.data.token);

      // redirect
      navigate("/dashboard");

    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // ================= STYLES =================
  const inputStyle = {
    padding: "10px",
    width: "250px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    flexDirection: "column"
  };

  return (
    <div style={containerStyle}>
      <h2>Login</h2>

      {/* ERROR MESSAGE */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          style={inputStyle}
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />

        <input
          style={inputStyle}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
            border: "none"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "15px" }}>
      Don't have an account?{" "}
      <Link
        to="/register"
        style={{ color: "blue", textDecoration: "none", fontWeight: "bold" }}
      >
        Register here
      </Link>
    </p>
    </div>
  );
}

export default Login;