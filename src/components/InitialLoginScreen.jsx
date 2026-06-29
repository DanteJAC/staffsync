import { useState } from 'react'
import { auth, isFirebaseConfigured } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function InitialLoginScreen({ workers, onLoginSuccess }) {
  const [loginTab, setLoginTab] = useState('worker') // 'worker' | 'admin'
  
  // Worker login state
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers[0]?.id || '')

  // Admin login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWorkerLogin = (e) => {
    e.preventDefault()
    if (!selectedWorkerId) {
      toast.error('Por favor selecciona tu perfil de trabajadora')
      return
    }
    const worker = workers.find(w => w.id === selectedWorkerId)
    if (worker) {
      toast.success(`¡Bienvenida, ${worker.name}!`)
      onLoginSuccess({ role: 'worker', workerId: worker.id, name: worker.name })
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success('¡Sesión de Administrador iniciada correctamente!')
        onLoginSuccess({ role: 'admin', email })
      } else {
        // Modo local fallback
        if ((email === 'admin' || email === 'admin@staffsync.com') && password === 'admin123') {
          toast.success('¡Sesión de Administrador iniciada! (Modo Local)')
          onLoginSuccess({ role: 'admin', email: 'admin@staffsync.com' })
        } else {
          toast.error('Credenciales incorrectas. (Modo local: admin / admin123)')
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al iniciar sesión: Verifique su usuario y contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '85vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem' 
    }}>
      <motion.div 
        className="glass-panel" 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '2.5rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, var(--color-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            StaffSync
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Plataforma de Gestión y Calculadora de Turnos
          </p>
        </div>

        {/* Pestañas de Selección de Rol */}
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '50px', padding: '0.3rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            type="button"
            onClick={() => setLoginTab('worker')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '40px',
              border: 'none',
              background: loginTab === 'worker' ? 'var(--color-primary)' : 'transparent',
              color: loginTab === 'worker' ? '#fff' : 'var(--color-text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            👩‍💼 Soy Trabajadora
          </button>
          <button
            type="button"
            onClick={() => setLoginTab('admin')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '40px',
              border: 'none',
              background: loginTab === 'admin' ? 'var(--color-primary)' : 'transparent',
              color: loginTab === 'admin' ? '#fff' : 'var(--color-text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🔐 Administración
          </button>
        </div>

        {loginTab === 'worker' ? (
          <form onSubmit={handleWorkerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Selecciona tu Nombre:
              </label>
              {workers.length === 0 ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', color: 'var(--color-danger)', fontSize: '0.9rem' }}>
                  Aún no hay trabajadoras registradas en el sistema. Solicita al administrador que te registre.
                </div>
              ) : (
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem 1rem', 
                    fontSize: '1rem', 
                    background: 'rgba(15, 23, 42, 0.8)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--border-radius-md)',
                    color: 'var(--color-text-main)',
                    fontWeight: '600'
                  }}
                  required
                >
                  <option value="" disabled>-- Selecciona tu perfil --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.9rem', fontSize: '1.05rem', fontWeight: 'bold', marginTop: '0.5rem' }}
              disabled={workers.length === 0}
            >
              Ingresar a Mi Portal 🚀
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                Usuario / Correo:
              </label>
              <input 
                type="text" 
                placeholder="admin@staffsync.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem' }}
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                Contraseña:
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem' }}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.9rem', fontSize: '1.05rem', fontWeight: 'bold', marginTop: '0.5rem' }} 
              disabled={loading}
            >
              {loading ? '⏳ Verificando...' : 'Acceder al Sistema 🔐'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
