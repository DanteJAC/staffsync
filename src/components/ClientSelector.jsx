import { useState } from 'react'

export default function ClientSelector({ clients, activeClientId, onSelect, onAdd, onDelete }) {
  const [newClientName, setNewClientName] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (newClientName.trim()) {
      onAdd(newClientName.trim())
      setNewClientName('')
    }
  }

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>🏢 Clientes</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Nuevo Cliente (Ej: Flia Pérez)" 
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            style={{ width: '200px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={!newClientName.trim()}>
            + Agregar
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', minHeight: '40px' }}>
        {clients.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>
            No hay clientes registrados.
          </div>
        ) : (
          clients.map(client => (
            <div 
              key={client.id}
              className={`worker-tab ${activeClientId === client.id ? 'active' : ''}`}
            >
              <span 
                onClick={() => onSelect(client.id)}
                style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'inline-block' }}
              >
                {client.name}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`¿Eliminar al cliente ${client.name}?`)) {
                    onDelete(client.id)
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-danger)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  fontWeight: 'bold'
                }}
                title="Eliminar cliente"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
