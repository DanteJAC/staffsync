import { useState } from 'react'
import { auth, isFirebaseConfigured } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'react-hot-toast'

export default function AdminLoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success('Sesión iniciada correctamente en Firebase')
        onLoginSuccess({ email })
      } else {
        // Fallback admin login cuando Firebase no ha sido configurado en el .env aún
        if ((email === 'admin' || email === 'admin@staffsync.com') && password === 'admin123') {
          toast.success('Sesión de Administrador iniciada (Modo Local)')
          onLoginSuccess({ email: 'admin@staffsync.com' })
        } else {
          toast.error('Credenciales incorrectas. (Modo local: admin / admin123)')
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al iniciar sesión: Verifique sus credenciales')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ width: '90%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>🔐 Acceso Administrador</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {isFirebaseConfigured ? 
            'Ingresa tus credenciales de Firebase para sincronizar y administrar la base de datos.' : 
            'Modo Local activado. Ingresa como administrador para gestionar la agencia (Default: admin / admin123).'}
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Correo / Usuario</label>
            <input 
              type="text" 
              placeholder="admin@staffsync.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.8rem' }} disabled={loading}>
            {loading ? '⏳ Conectando...' : 'Entrar como Administrador'}
          </button>
        </form>
      </div>
    </div>
  )
}
