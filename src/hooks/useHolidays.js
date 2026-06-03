import { useState, useEffect } from 'react'

export function useHolidays(year) {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true)
      try {
        // Usamos una API pública y confiable globalmente para feriados
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/CL`)
        if (!response.ok) throw new Error('Network response was not ok')
        
        const data = await response.json()
        
        const processedHolidays = data.map(h => {
          const dateStr = h.date // Format: YYYY-MM-DD
          const [, month, day] = dateStr.split('-')
          const monthDay = `${month}-${day}`
          
          // Regla fija chilena para feriados irrenunciables
          const isIrrenunciable = ['01-01', '05-01', '09-18', '09-19', '12-25'].includes(monthDay)
          
          return {
            date: dateStr,
            name: h.localName,
            type: isIrrenunciable ? 'irrenunciable' : 'normal',
            monthDay: monthDay
          }
        })
        
        // Excluir fechas solicitadas por el usuario: 7 junio, 21 junio, 20 agosto
        const excludedDates = ['06-07', '06-21', '08-20']
        const filteredHolidays = processedHolidays.filter(h => !excludedDates.includes(h.monthDay))
        
        setHolidays(filteredHolidays)
      } catch (error) {
        console.error('Error fetching holidays:', error)
        // Fallback básico en caso de error de red (solo irrenunciables)
        setHolidays([
          { date: `${year}-01-01`, name: 'Año Nuevo', type: 'irrenunciable' },
          { date: `${year}-05-01`, name: 'Día del Trabajador', type: 'irrenunciable' },
          { date: `${year}-09-18`, name: 'Independencia Nacional', type: 'irrenunciable' },
          { date: `${year}-09-19`, name: 'Día de las Glorias del Ejército', type: 'irrenunciable' },
          { date: `${year}-12-25`, name: 'Navidad', type: 'irrenunciable' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHolidays()
  }, [year])

  return { holidays, loading }
}
