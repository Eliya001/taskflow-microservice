import React, {useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: ''});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/users/register', form);
      toast.success('Account created! Please login.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data.error || 'Registration failed'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style ={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}> 💅️ Taskflow</div>
        <h2 style={styles.title}>Create your account</h2>
        <form onSubmit={handleSubmit}>
          <div style ={styles.field}>
            <label style={styles.label}>Full name</label>
            <input style={styles.input} name="name" placeholder="john Doe"
              value={form.name} onChange={handleChange} required/>

          </div>
          <div style ={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" type="email" placeholder="Eliya.eyed@gmail.com"
              value={form.email} onChange={handleChange} required/>
          </div>

          <div style ={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} name="password" type= "password" placeholder="🍏️🍏️🍏️🍏️🍏️🍏️🍏️"
              value={form.password} onChange={handleChange} required/> 
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account? <Link to="/" style={styles.a}>Sign In </Link>
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
  logo: { fontSize: '28px', fontWeight: '800', color: '667eea', marginBottom: '8px', textAlign: 'center' },
  title: { fontSize: '18px', color: '#333', marginBottom: '24px', textAlign: 'center', fontWeight: '500' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontweight: '500' },
  input: {
    width: '100%', padding: '12px', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  button: {
    width: '100px', padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '16px', fontweight: '600', cursor: 'pointer', marginTop: '8px',
  },
  link: { textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' },
  a: {color: '#667eea', textDecoration: 'none', fontweight: '600' },
};
