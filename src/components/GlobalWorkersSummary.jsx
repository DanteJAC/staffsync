import { useMemo, useState } from 'react'

export default function GlobalWorkersSummary({ workers, currentDate, setCurrentDate, onSelectWorker }) {
  const [retentionRate] = useState(15.25)

  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const monthName = MONTHS[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1))

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
  }

  const { rows, grandTotalBruto, grandTotalLiquido, totalGlobalShifts } = useMemo(() => {
    const prefix = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const rate = retentionRate / 100

    const computedRows = workers.map(worker => {
      const monthlyShifts = (worker.shifts || []).filter(s => s.date.startsWith(prefix))
      const baseRates = worker.baseRates || { weekday: 0, weekend: 0 }

      let workerBruto = 0
      
      monthlyShifts.forEach(shift => {
        const base = shift.isWeekend ? baseRates.weekend : baseRates.weekday
        let multiplier = 1.0
        
        if (shift.holidayType === 'normal') {
          multiplier = 1.3
        } else if (shift.holidayType === 'irrenunciable') {
          multiplier = 2.0
        }

        workerBruto += (base * multiplier)
      })

      const workerRetencion = workerBruto * rate
      const workerLiquido = workerBruto - workerRetencion

      return {
        id: worker.id,
        name: worker.name,
        shiftsCount: monthlyShifts.length,
        bruto: workerBruto,
        liquido: workerLiquido
      }
    })

    const totalBruto = computedRows.reduce((sum, r) => sum + r.bruto, 0)
    const totalShifts = computedRows.reduce((sum, r) => sum + r.shiftsCount, 0)

    // Sort rows by name or amount
    computedRows.sort((a, b) => b.bruto - a.bruto)

    const grandTotalRetencion = totalBruto * rate
    const totalLiquido = totalBruto - grandTotalRetencion

    return {
      rows: computedRows,
      grandTotalBruto: totalBruto,
      grandTotalLiquido: totalLiquido,
      totalGlobalShifts: totalShifts
    }
  }, [workers, currentDate, retentionRate, year])

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.5rem' }}>
            Nómina Global <span style={{ color: 'var(--color-primary)' }}>Trabajadoras</span>
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)' }}>
            Resumen total de honorarios de la agencia.
          </p>
        </div>
        
        <div className="calendar-header" style={{ minWidth: '300px', margin: 0, background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="btn" style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)' }} onClick={prevMonth}>&lt;</button>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{monthName} {year}</h3>
          <button className="btn" style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)' }} onClick={nextMonth}>&gt;</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
          No hay trabajadoras registradas.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Trabajadora</th>
                  <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: '600', textAlign: 'center' }}>Turnos Mes</th>
                  <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: '600', textAlign: 'right' }}>Total Bruto</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr 
                    key={row.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => onSelectWorker(row.id)}
                  >
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        background: 'rgba(59, 130, 246, 0.2)', 
                        color: 'var(--color-primary)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {row.shiftsCount}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-main)' }}>
                      {formatCurrency(row.bruto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', height: 'fit-content' }}>
            <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Totales de Nómina
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1rem' }}>
              <span>Total Turnos:</span>
              <span style={{ fontWeight: 'bold' }}>{totalGlobalShifts}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <span>Total Bruto:</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalBruto)}</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <span>Retención Legal ({retentionRate}%):</span>
              <span style={{ color: 'var(--color-danger)' }}>- {formatCurrency(grandTotalBruto * (retentionRate/100))}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>Pago Líquido Total:</span>
              <span style={{ color: 'var(--color-accent)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatCurrency(grandTotalLiquido)}
              </span>
            </div>
          </div>
          
        </div>
      )}
    </div>
  )
}
