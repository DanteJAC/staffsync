import React from 'react'

export default function TaxCalculator({ 
  retentionRate, 
  setRetentionRate, 
  isTotalLiquid, 
  setIsTotalLiquid, 
  bruto, 
  retencion, 
  liquido 
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      padding: '1.5rem',
      borderRadius: 'var(--border-radius-md)',
      border: '1px solid var(--color-border)',
      marginTop: '1.5rem'
    }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Boleta de Honorarios</h3>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            Retención (%)
          </label>
          <input 
            type="number" 
            step="0.01"
            value={retentionRate}
            onChange={(e) => setRetentionRate(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            El Total de Turnos es...
          </label>
          <select 
            value={isTotalLiquid ? 'liquido' : 'bruto'} 
            onChange={(e) => setIsTotalLiquid(e.target.value === 'liquido')}
            style={{ width: '100%' }}
          >
            <option value="bruto">Bruto (Descontar de ahí)</option>
            <option value="liquido">Líquido (Quiero recibir eso)</option>
          </select>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem',
        background: 'rgba(0,0,0,0.2)',
        padding: '1rem',
        borderRadius: 'var(--border-radius-md)'
      }}>
        <div style={{ color: 'var(--color-text-muted)' }}>Monto Bruto (Boleta):</div>
        <div style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(bruto)}</div>
        
        <div style={{ color: 'var(--color-danger)' }}>Retención ({retentionRate}%):</div>
        <div style={{ textAlign: 'right', fontWeight: '600', color: 'var(--color-danger)' }}>
          - {formatCurrency(retencion)}
        </div>
        
        <div style={{ gridColumn: '1 / -1', height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }}></div>
        
        <div style={{ color: 'var(--color-accent)', fontWeight: '700', fontSize: '1.1rem' }}>Líquido a Pago:</div>
        <div style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-accent)', fontSize: '1.1rem' }}>
          {formatCurrency(liquido)}
        </div>
      </div>
    </div>
  )
}
