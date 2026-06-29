import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: '0.5rem 1rem', background: 'rgba(15, 23, 42, 0.95)' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: 0, color: 'var(--color-primary)' }}>
          Total: {formatCurrency(payload[0].value)}
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Turnos: {payload[0].payload.turnos}
        </p>
      </div>
    )
  }
  return null
}

export default function AnnualDashboard({ workerName, shifts, baseRates }) {
  const data = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    // Inicializar el arreglo de meses con 0
    const monthlyTotals = months.map(m => ({ name: m, total: 0, turnos: 0 }))

    shifts.forEach(shift => {
      // shift.date is YYYY-MM-DD
      const [, monthStr] = shift.date.split('-')
      const monthIndex = parseInt(monthStr, 10) - 1 // 0-11
      
      const base = shift.isWeekend ? baseRates.weekend : baseRates.weekday
      let multiplier = 1.0
      if (shift.holidayType === 'normal') multiplier = 1.3
      if (shift.holidayType === 'irrenunciable') multiplier = 2.0
      
      const payment = base * multiplier

      if (monthlyTotals[monthIndex]) {
        monthlyTotals[monthIndex].total += payment
        monthlyTotals[monthIndex].turnos += 1
      }
    })

    return monthlyTotals
  }, [shifts, baseRates])

  const yearlyTotal = data.reduce((acc, month) => acc + month.total, 0)
  const yearlyShifts = data.reduce((acc, month) => acc + month.turnos, 0)

  return (
    <div className="glass-panel" style={{ marginTop: '1rem' }}>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
        Resumen Anual: <span style={{ color: 'var(--color-primary)' }}>{workerName}</span>
      </h2>
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
        <div>
          <span style={{ fontSize: '0.9rem' }}>Ganancia Total Anual:</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
            {formatCurrency(yearlyTotal)}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.9rem' }}>Turnos Realizados:</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
            {yearlyShifts}
          </div>
        </div>
      </div>

      <div style={{ height: '350px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-text-muted)" />
            <YAxis 
              tickFormatter={(value) => `$${value/1000}k`} 
              stroke="var(--color-text-muted)"
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
