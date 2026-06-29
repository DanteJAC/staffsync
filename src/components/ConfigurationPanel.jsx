import { useState } from 'react'

export default function ConfigurationPanel({ rates, onUpdate, clientId, clients, onAssignClient }) {
  const [localRates, setLocalRates] = useState(rates)
  const [prevRates, setPrevRates] = useState(rates)

  if (rates !== prevRates) {
    setPrevRates(rates)
    setLocalRates(rates)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setLocalRates({
      ...localRates,
      [name]: value === '' ? '' : Number(value)
    })
  }

  const handleSave = (e) => {
    e.preventDefault()
    onUpdate(localRates)
  }

  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Configuración de Trabajadora</h3>
      
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Asignar a Cliente</label>
        <select 
          value={clientId || ''} 
          onChange={(e) => onAssignClient(e.target.value === '' ? null : e.target.value)}
          style={{ width: '100%', background: 'var(--color-background)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '4px' }}
        >
          <option value="">-- Sin Cliente Asignado --</option>
          {clients && clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
          Los turnos sumarán a la cuota del cliente seleccionado.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="weekday">Valor Pago a Trabajadora (L-V)</label>
          <input 
            type="number" 
            id="weekday" 
            name="weekday" 
            value={localRates.weekday} 
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="weekend">Valor Pago (Sábado y Domingo)</label>
          <input 
            type="number" 
            id="weekend" 
            name="weekend" 
            value={localRates.weekend} 
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="standardHours">Horas Totales por Turno (Estándar)</label>
          <input 
            type="number" 
            id="standardHours" 
            name="standardHours" 
            value={localRates.standardHours || 8} 
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            min="1"
            max="24"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
          Actualizar Valores
        </button>
      </form>
    </div>
  )
}
