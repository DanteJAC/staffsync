import { useState } from 'react'

export default function WorkerSelector({ workers, activeWorkerId, onSelect, onAdd, onDelete }) {
  const [newWorkerName, setNewWorkerName] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (newWorkerName.trim()) {
      onAdd(newWorkerName.trim())
      setNewWorkerName('')
    }
  }

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--color-text-main)', fontSize: '1.25rem', margin: 0 }}>
          👩‍💼 Trabajadoras
        </h2>
        
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Nombre de trabajadora..." 
            value={newWorkerName}
            onChange={(e) => setNewWorkerName(e.target.value)}
            style={{ width: 'auto', padding: '0.5rem 1rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            + Agregar
          </button>
        </form>
      </div>

      {workers.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-warning)' }}>
          Agrega una trabajadora para empezar.
        </p>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {workers.map(worker => (
            <div 
              key={worker.id}
              className={`worker-tab ${worker.id === activeWorkerId ? 'active' : ''}`}
            >
              <span 
                onClick={() => onSelect(worker.id)}
                style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'inline-block' }}
              >
                {worker.name}
              </span>
              <button 
                onClick={() => onDelete(worker.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-danger)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  fontWeight: 'bold'
                }}
                title="Eliminar Trabajadora"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
