import { useState, useMemo } from 'react'
import { toast } from 'react-hot-toast'

export default function WorkerPortal({ workers, onUpdateWorker }) {
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers[0]?.id || null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedShiftId, setSelectedShiftId] = useState('')
  const [shiftSummaryText, setShiftSummaryText] = useState('')

  const activeWorker = workers.find(w => w.id === selectedWorkerId)

  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const monthName = MONTHS[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1))

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount || 0)
  }

  const { monthlyShifts, totalDays, totalEarnings } = useMemo(() => {
    if (!activeWorker) return { monthlyShifts: [], totalDays: 0, totalEarnings: 0 }

    const prefix = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const baseRates = activeWorker.baseRates || { weekday: 0, weekend: 0 }

    const shifts = (activeWorker.shifts || []).filter(s => s.date.startsWith(prefix)).map(shift => {
      const base = shift.isWeekend ? baseRates.weekend : baseRates.weekday
      let multiplier = 1.0
      if (shift.holidayType === 'normal') multiplier = 1.3
      if (shift.holidayType === 'irrenunciable') multiplier = 2.0

      let payment = base * multiplier
      if (shift.isPartial && shift.totalHours > 0) {
        payment = payment * (shift.workedHours / shift.totalHours)
      }

      return {
        ...shift,
        payment
      }
    })

    // Sort shifts chronologically
    shifts.sort((a, b) => a.date.localeCompare(b.date))

    const totalE = shifts.reduce((sum, s) => sum + s.payment, 0)

    return {
      monthlyShifts: shifts,
      totalDays: shifts.length,
      totalEarnings: totalE
    }
  }, [activeWorker, currentDate, year])

  const handleSaveSummary = (e) => {
    e.preventDefault()
    if (!selectedShiftId) {
      toast.error('Selecciona un turno para asociar el resumen')
      return
    }
    if (!shiftSummaryText.trim()) {
      toast.error('Escribe el contenido del resumen')
      return
    }

    const updatedShifts = (activeWorker.shifts || []).map(s => {
      if (s.id === selectedShiftId) {
        return { ...s, summary: shiftSummaryText.trim() }
      }
      return s
    })

    onUpdateWorker({ ...activeWorker, shifts: updatedShifts })
    toast.success('Resumen de turno guardado correctamente')
    setShiftSummaryText('')
    setSelectedShiftId('')
  }

  const getHolidayLabel = (shift) => {
    let label = 'Día Normal'
    if (shift.holidayType === 'normal') label = 'Feriado (+30%)'
    if (shift.holidayType === 'irrenunciable') label = 'Feriado Irrenunciable (+100%)'
    if (shift.isPartial) label += ` (${shift.workedHours}/${shift.totalHours} hrs)`
    return label
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Barra superior de selección de trabajadora */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-primary)' }}>👩‍💼 Mi Perfil:</span>
          <select 
            value={selectedWorkerId || ''} 
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            style={{ padding: '0.6rem 1rem', fontSize: '1.1rem', fontWeight: 'bold', background: 'var(--color-background)', border: '1px solid var(--color-primary)', borderRadius: 'var(--border-radius-md)', flex: '1 1 250px' }}
          >
            {workers.length === 0 && <option value="">No hay trabajadoras registradas</option>}
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {activeWorker && (
          <div className="calendar-header" style={{ width: '100%', maxWidth: '300px', margin: '0 auto', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button className="btn" style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)' }} onClick={prevMonth}>&lt;</button>
            <h3 style={{ margin: 0, fontSize: '1.1rem', textAlign: 'center' }}>{monthName} {year}</h3>
            <button className="btn" style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)' }} onClick={nextMonth}>&gt;</button>
          </div>
        )}
      </div>

      {!activeWorker ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: 'var(--color-text-muted)' }}>👆 Selecciona tu nombre arriba para ver tus turnos y liquidaciones.</h3>
        </div>
      ) : (
        <>
          {/* Tarjetas de Resumen (Días, Valores, Total) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Días Trabajados</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{totalDays}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Turnos registrados en {monthName}</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Valor Turno Base</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Lunes a Viernes:</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(activeWorker.baseRates?.weekday)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Fines de Semana:</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(activeWorker.baseRates?.weekend)}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Estimado ({monthName})</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-accent)' }}>{formatCurrency(totalEarnings)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Antes de retenciones de impuestos</div>
            </div>

          </div>

          <div className="grid grid-cols-2">
            {/* Lista detallada de Turnos */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📅 Mis Turnos en {monthName}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {monthlyShifts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>No tienes turnos registrados este mes.</p>
                ) : (
                  monthlyShifts.map(shift => (
                    <div 
                      key={shift.id} 
                      style={{ 
                        background: 'rgba(15, 23, 42, 0.6)', 
                        padding: '1rem', 
                        borderRadius: 'var(--border-radius-md)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--color-text-main)' }}>{shift.date}</span>
                          <span style={{ fontSize: '0.85rem', color: shift.isWeekend ? 'var(--color-warning)' : 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                            {shift.isWeekend ? '• Fin de Semana' : '• Semana'}
                          </span>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--color-accent)', fontSize: '1.1rem' }}>
                          {formatCurrency(shift.payment)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <span>{getHolidayLabel(shift)}</span>
                        {shift.summary && <span style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>📝 Tiene resumen</span>}
                      </div>

                      {shift.summary && (
                        <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem', borderLeft: '3px solid var(--color-primary)' }}>
                          <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>RESUMEN DEL TURNO:</strong>
                          {shift.summary}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Apartado para ingresar Resumen de Turno */}
            <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📝 Ingresar Resumen de Turno
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.4rem 0 0 0' }}>
                  Selecciona la fecha de tu turno e ingresa la bitácora o reporte. (Apartado preparado para futuras personalizaciones).
                </p>
              </div>

              <form onSubmit={handleSaveSummary} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Seleccionar Turno Realizado:</label>
                  <select 
                    value={selectedShiftId} 
                    onChange={(e) => {
                      setSelectedShiftId(e.target.value)
                      const found = monthlyShifts.find(s => s.id === e.target.value)
                      if (found && found.summary) setShiftSummaryText(found.summary)
                      else setShiftSummaryText('')
                    }}
                    style={{ width: '100%', padding: '0.7rem' }}
                    required
                  >
                    <option value="">-- Selecciona una fecha --</option>
                    {monthlyShifts.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.date} - {formatCurrency(s.payment)} {s.summary ? '(Ya tiene nota)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Resumen / Novedades del Turno:</label>
                  <textarea 
                    rows="5"
                    placeholder="Escribe aquí el detalle, pacientes atendidos, horas extra o novedades de tu turno..."
                    value={shiftSummaryText}
                    onChange={(e) => setShiftSummaryText(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: 'var(--border-radius-md)',
                      color: 'var(--color-text-main)',
                      fontFamily: 'var(--font-main)',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontWeight: 'bold', width: '100%' }}>
                  💾 Guardar Resumen en el Turno
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
