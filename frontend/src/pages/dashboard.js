import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b'];
const PRIORITY_COLORS = { low: '#43e97b', medium: '#f093fb', high: '#ff6b6b' };
const STATUS_COLORS = { todo: '#667eea', in_progress: '#f093fb', done: '#43e97b' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [showModal, setShowModal] = useState(false);
  const fetchTasks = async () => {
    try {
      const res = await API.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchTasks();
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTask) {
        await API.put(`/api/tasks/${editTask.id}`, { ...form, status: editTask.status });
        toast.success('Task updated!');
      } else {
        await API.post('/api/tasks', form);
        toast.success('Task created!');
      }
      setShowModal(false);
      setEditTask(null);
      setForm({ title: '', description: '', priority: 'medium', due_daye: '' });
      fetchTasks();
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/api/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };
  const handleStatusChange = async (task, newStatus) => {
    try {
      await API.put(`/api/tasks/${task.id}`, { ...task, status: newStatus });
      toast.success('Status updated!');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date? task.due_date.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const markAllRead = async () => {
    try {
      await API.put('/api/notifications/read/all');
      fetchNotifications();
    } catch (err) {}
  };

  const stats = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style ={styles.sidebar}>
        <div style={styles.sidebarLogo}> 💅️ Taskflow</div>
        <nav>
          <div style ={styles.navItem}>📊️ dashboard</div>
          <div style={styles.navItem} onClick={() => { setShowNotifications(!showNotifications); markAllRead(); }}>
            🔔️ Notifications {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </div>
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}> {user?.name}</div>
          <button style={styles.logoutBtn} onClick={() => {logout(); navigate('/'); }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>dashboard</h1>
          <button style={styles.createBtn} onClick={() => { setEditTask(null); setForm({ title: '', description: '', priority: 'medium', due_date: '' }); setShowModal(true); }}>
            + New Task
          </button>
        </div>

        {/* Notifications panel */}
        {showNotifications && (
          <div style={styles.notifpanel}>
            <h3 style={{ margin: '0.0 12px', color: '#333' }}>🔔️ Notifications</h3>
            {notifications.length === 0 ? (
              <p style={{ color: '#999' }}>No notification yet</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ ...styles.notifItem, background: n.is_read ? '#f9f9f9': '#f0f0ff' }}>
                  <span>{n.message}</span>
                  <span style={{ fontSize: '12px', color: '#999' }}>{new Date(n.created_at).tolocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #667eea' }}>
            <div style={styles.statNumber}>{tasks.length}</div>
            <div style={styles.statLabel}>Total Tasks</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #f093fb' }}>
            <div style={styles.statNumber}>{tasks.filter(t => t.status === 'todo').length}</div>
            <div style={styles.statLabel}>Todo</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #4facfe' }}>
            <div style={styles.statNumber}>{tasks.filter(t => t.status === 'in_progress').length}</div>
            <div style={styles.statLabel}>In progress</div>
          </div>
          <div style ={{ ...styles.statCard, borderTop: '4px solid #4facfe' }}>
            <div style={styles.statNumber}>{tasks.filter(t => t.status === 'done').length}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>

        {/* Chart + Table Row */}
        <div style={styles.contentRow}>
          {/* Pie Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.cardTitle}>Task Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {stats.map((_, i) => <cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Task Table */}
          <div style={styles.tableCard}>
            <h3 style={styles.cardTitle}>All Tasks</h3>
            {tasks.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>No tasks yet. Create your first task!</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Due Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} style={styles.tableRow}>
                      <td style={styles.td}>{task.title}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.pill, background: PRIORITY_COLORS[task.priority] }}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <select
                          style={{ ...styles.statusSelect, borderColor: STATUS_COLORS[task.status] }}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td style={styles.td}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                      <td style={styles.td}>
                        <button style={styles.editBtn} onClick={() => handleEdit(task)}>Edit</button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit ={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Title *</label>
                <input style={styles.input} placeholder="Task title" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  placeholder="Task description" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
             </div>
             <div style={styles.field}>
               <label style={styles.label}>Priority</label>
               <select style={styles.input} value={form.priority}
                 onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
               </select>
             </div>
             <div style={styles.field}>
               <label style={styles.label}>Due Date</label>
               <input style={styles.input} type="date" value={form.due_date}
                 onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
             </div>
             <div style={{display: 'flex', gap: '12px', marginTop: '8px' }}>
               <button type="submit" style={styles.button}>
                 {editTask ? 'Update Task' : 'Create Task'}
               </button>
               <button type="button" style={styles.cancelBtn}
                 onClick={() => { setShowModal(false); setEditTask(null); }}>
                 cancel
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
   </div>
  );
}

const styles = {
  container: {display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Segeo UI, sans-serif' },
  sidebar: { width: '240px', background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 0', posiiton: 'fixed', height: '100vh' },
  sidebarLogo: { fontSize: '24px', fontWeight: '800', padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
  navItem: { padding: '14px 24px', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s', ':hover': {background: 'rgba(255,255,255,0.1)' } },
  badge: { background: '#ff6b6b', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', marginLeft: '4px' },
  sidebarBottom: { marginTop: 'auto', padding: '24px' },
  userInfo: { fontSize: '14px', marginBottom: '12px', opacity: '0.9' },
  logoutBtn: { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  main: { marginLeft: '240px', flex:1, padding: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '28px', fontWeight: '700', color: '#333', margin: 0},
  createBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  notifPanel: {background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  notifItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08) ' },
  statNumber: { fontSize: '36px', fontWeight: '700',  color: '#333' },
  statLabel: { fontSize: '14px', color: '#888', marginTop: '4px' },
  contentRow: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' },
  chartCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08) ' },
  tableCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflowX: 'auto' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f8f9fa', },
  th: { padding: '12px', textAlign: 'left', fontSize: '13px', fontweight: '600', color: '#666', borderBottom: '2px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px', fontSize: '14px', color: '#333', },
  pill: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', color: '#fff', fontWeight: '600' },
  statusSelect: { padding: '4px 8px', borderRadius: '6px', border: '2px solid', fontSize: '13px', cursor: 'pointer', outline: 'none' },
  editBtn: { padding: '5px 12px', background: '#667eea', color: '#fff', border: 'none',  borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' },
  deleteBtn: { padding: '5px 12px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#333', margin: '0 0 24px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  button: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', background: '#f0f0f0', color: '#666', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
};
