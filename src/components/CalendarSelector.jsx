import { useState, useMemo } from 'react'
import { useHolidays } from '../hooks/useHolidays'

export default function CalendarSelector({ shifts, onChangeShifts, currentDate, setCurrentDate }) {
  const [brush, setBrush] = useState('normal')

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
    const existingShift = shifts.find(s => s.date === dateStr)

    // Calculate if weekend
    const dayOfWeek = new Date(year, month, day).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let newShifts = [...shifts]

    if (brush === 'erase') {
      newShifts = newShifts.filter(s => s.date !== dateStr)
    } else {
      let holidayType = 'none'
      
      // Auto-detect holiday if using normal brush
      if (brush === 'normal') {
        const apiHoliday = holidays.find(h => h.date === dateStr)
        if (apiHoliday) {
          holidayType = apiHoliday.type // 'normal' or 'irrenunciable'
        }
      } else if (brush === 'holiday-normal') {
        holidayType = 'normal'
      } else if (brush === 'holiday-irrenunciable') {
        holidayType = 'irrenunciable'
      }

      if (existingShift && existingShift.holidayType === holidayType) {
        // Toggle off
        newShifts = newShifts.filter(s => s.date !== dateStr)
      } else {
        const newShiftData = {
          id: existingShift ? existingShift.id : crypto.randomUUID(),
          date: dateStr,
          isWeekend,
          holidayType
        }

        if (existingShift) {
          newShifts = newShifts.map(s => s.date === dateStr ? newShiftData : s)
        } else {
          newShifts.push(newShiftData)
        }
      }
    }

    onChangeShifts(newShifts)
  }

  // Render helpers
  const getDayState = (day) => {
    const dateStr = getDateStr(day)
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

      return (
        <div 
          key={`day-${dayNumber}`} 
          className={`calendar-day ${stateClass}`}
          style={indicatorStyle}
          title={isUnselectedHoliday ? isUnselectedHoliday.name : ''}
          onClick={() => handleDayClick(dayNumber)}
        >
          {dayNumber}
        </div>
      )
    })

    return [...blanks, ...days]
  }

  return (
    <div className="glass-panel" style={{ userSelect: 'none' }}>
      <div className="calendar-toolbar">
        <button 
          className={`brush-btn ${brush === 'normal' ? 'active' : ''}`}
          onClick={() => setBrush('normal')}
        >
          🖌️ Turno Normal
        </button>
        <button 
          className={`brush-btn ${brush === 'holiday-normal' ? 'active' : ''}`}
          onClick={() => setBrush('holiday-normal')}
        >
          🟠 Feriado Normal
        </button>
        <button 
          className={`brush-btn ${brush === 'holiday-irrenunciable' ? 'active' : ''}`}
          onClick={() => setBrush('holiday-irrenunciable')}
        >
          🔴 Feriado Irren.
        </button>
        <button 
          className={`brush-btn ${brush === 'erase' ? 'active' : ''}`}
          onClick={() => setBrush('erase')}
        >
          ❌ Borrar
        </button>
      </div>

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
    </div>
  )
}
