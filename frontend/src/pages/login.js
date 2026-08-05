import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/users/login', { email, password });
      login(res.data.token, res.data.name);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      console.log('REAL ERROR:', err);
      console.log('ERROR MESSAGE:', err.message);
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}> 💅️TaskFlow</div>
        <h2 style={styles.title}>Sign in to your account </h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Eliya.eyed@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="🎱️🎱️🎱️🎱️🎱️"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in ...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={styles.a}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#667eea',
    marginBottom: '8px',
    textAlign: 'center',
  },
  title: {
    fontSize: '18px',
    marginBottom: '24px',
    textAlign: 'center',
    fontWeight: '500',
  },

  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontweight: '500' },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  link: { textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' },
  a: { color: '#667eea', textDecoration: 'none', fontweight: '600' },
};
