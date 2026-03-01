import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {

  // ================= STATES =================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();

    // validation
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await API.post("/users/register", {
        name,
        email,
        password
      });

      setSuccess("Registration successful ✅");

      // redirect after short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError("Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  // ================= STYLES =================
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    flexDirection: "column"
  };

  const inputStyle = {
    padding: "10px",
    width: "250px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  };

  return (
    <div style={containerStyle}>
      <h2>Register</h2>

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* SUCCESS */}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleRegister}>

        <input
          style={inputStyle}
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />

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
            borderRadius: "5px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;