import { useState, useMemo } from 'react'
import { useHolidays } from '../hooks/useHolidays'
import { toast } from 'react-hot-toast'

export default function CalendarSelector({ shifts, onChangeShifts, currentDate, setCurrentDate, otherOccupiedDates = new Set(), standardHours = 8 }) {
  const [partialModal, setPartialModal] = useState({ isOpen: false, dateStr: '', workedHours: standardHours })

  // Calendar calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const { holidays } = useHolidays(year)

  // Constants (Monday to Sunday)
  const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  const { daysInMonth, firstDayOfMonth } = useMemo(() => {
    const days = new Date(year, month + 1, 0).getDate()
    const jsFirstDay = new Date(year, month, 1).getDay() // 0 is Sunday, 1 is Monday
    // Shift so Monday is 0, Sunday is 6
    const firstDay = (jsFirstDay + 6) % 7
    return { daysInMonth: days, firstDayOfMonth: firstDay }
  }, [year, month])

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // Interaction
  const handleDayClick = (day) => {
    const dateStr = getDateStr(day)

    if (otherOccupiedDates.has(dateStr)) {
      toast.error('Este turno ya está ocupado por otra trabajadora en este domicilio.')
      return
    }

    const existingShift = shifts.find(s => s.date === dateStr)

    // Calculate if weekend
    const dayOfWeek = new Date(year, month, day).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let newShifts = [...shifts]

    if (existingShift) {
      // Toggle off
      newShifts = newShifts.filter(s => s.date !== dateStr)
    } else {
      let holidayType = 'none'
      const apiHoliday = holidays.find(h => h.date === dateStr)
      if (apiHoliday) {
        holidayType = apiHoliday.type // 'normal' or 'irrenunciable'
      }

      newShifts.push({
        id: crypto.randomUUID(),
        date: dateStr,
        isWeekend,
        holidayType
      })
    }

    onChangeShifts(newShifts)
  }

  const handleContextMenu = (e, day) => {
    e.preventDefault()
    const dateStr = getDateStr(day)
    
    if (otherOccupiedDates.has(dateStr)) {
      toast.error('Este turno ya está ocupado por otra trabajadora en este domicilio.')
      return
    }

    const shift = shifts.find(s => s.date === dateStr)

    setPartialModal({
      isOpen: true,
      dateStr,
      workedHours: (shift && shift.isPartial) ? shift.workedHours : standardHours
    })
  }

  const handleSavePartial = () => {
    const existingIndex = shifts.findIndex(s => s.date === partialModal.dateStr)
    let newShifts = [...shifts]

    if (existingIndex >= 0) {
      newShifts[existingIndex] = {
        ...newShifts[existingIndex],
        isPartial: true,
        totalHours: standardHours,
        workedHours: Number(partialModal.workedHours)
      }
    } else {
      const [, monthStr, dayStr] = partialModal.dateStr.split('-')
      const dayNum = parseInt(dayStr, 10)
      const monthIndex = parseInt(monthStr, 10) - 1
      const dayOfWeek = new Date(year, monthIndex, dayNum).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      let holidayType = 'none'
      const apiHoliday = holidays.find(h => h.date === partialModal.dateStr)
      if (apiHoliday) {
        holidayType = apiHoliday.type
      }

      newShifts.push({
        id: crypto.randomUUID(),
        date: partialModal.dateStr,
        isWeekend,
        holidayType,
        isPartial: true,
        totalHours: standardHours,
        workedHours: Number(partialModal.workedHours)
      })
    }

    onChangeShifts(newShifts)
    setPartialModal({ isOpen: false, dateStr: '', workedHours: standardHours })
    toast.success('Turno parcial guardado')
  }

  const handleClearPartial = () => {
    let newShifts = shifts.map(s => {
      if (s.date === partialModal.dateStr) {
        const rest = { ...s }
        delete rest.isPartial
        delete rest.totalHours
        delete rest.workedHours
        return rest
      }
      return s
    })
    onChangeShifts(newShifts)
    setPartialModal({ isOpen: false, dateStr: '', workedHours: standardHours })
    toast.success('Turno parcial removido')
  }

  // Render helpers
  const getDayState = (day) => {
    const dateStr = getDateStr(day)
    if (otherOccupiedDates.has(dateStr)) return 'state-occupied-other'
    const shift = shifts.find(s => s.date === dateStr)
    
    if (!shift) return ''
    if (shift.holidayType === 'normal') return 'state-holiday-normal'
    if (shift.holidayType === 'irrenunciable') return 'state-holiday-irrenunciable'
    return 'state-normal'
  }

  const renderDays = () => {
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
      <div key={`blank-${i}`} className="calendar-day empty"></div>
    ))

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1
      const stateClass = getDayState(dayNumber)
      
      // Check if it's an unselected API holiday to show an indicator
      const dateStr = getDateStr(dayNumber)
      const isUnselectedHoliday = !stateClass && holidays.find(h => h.date === dateStr)
      const indicatorStyle = isUnselectedHoliday ? { border: '1px dashed var(--color-warning)', color: 'var(--color-warning)' } : {}

      // Check if partial
      const shift = shifts.find(s => s.date === dateStr)
      const isPartial = shift && shift.isPartial

      return (
        <div 
          key={`day-${dayNumber}`} 
          className={`calendar-day ${stateClass}`}
          style={indicatorStyle}
          title={isUnselectedHoliday ? isUnselectedHoliday.name : ''}
          onClick={() => handleDayClick(dayNumber)}
          onContextMenu={(e) => handleContextMenu(e, dayNumber)}
        >
          {dayNumber}
          {isPartial && <span className="partial-indicator">⏱️</span>}
        </div>
      )
    })

    return [...blanks, ...days]
  }

  return (
    <div className="glass-panel" style={{ userSelect: 'none' }}>

      <div className="calendar-header">
        <button className="btn" style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={prevMonth}>
          &lt;
        </button>
        <h3 style={{ margin: 0 }}>{MONTHS[month]} {year}</h3>
        <button className="btn" style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={nextMonth}>
          &gt;
        </button>
      </div>

      <div className="calendar-grid">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {renderDays()}
      </div>

      {partialModal.isOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ width: '300px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Turno Parcial</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
              Fecha: {partialModal.dateStr}<br/>
              Horas del turno estándar: {standardHours} hrs
            </p>
            <div className="form-group">
              <label>Horas Trabajadas</label>
              <input 
                type="number" 
                value={partialModal.workedHours} 
                onChange={e => setPartialModal({...partialModal, workedHours: e.target.value})}
                min="0.5"
                max={standardHours}
                step="0.5"
                onFocus={e => e.target.select()}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSavePartial}>Guardar</button>
              <button className="btn" style={{ flex: 1 }} onClick={() => setPartialModal({ isOpen: false, dateStr: '', workedHours: standardHours })}>Cancelar</button>
              <button className="btn" style={{ flex: '1 1 100%', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={handleClearPartial}>Quitar Parcial</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
