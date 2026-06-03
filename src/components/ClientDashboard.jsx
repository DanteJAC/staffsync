import React, { useMemo, useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import InvoiceTemplate from './InvoiceTemplate'
import { toast } from 'react-hot-toast'

export default function ClientDashboard({ client, onUpdateClient, workers, currentDate, agencySettings }) {
  const invoiceRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const yearNum = currentDate.getFullYear()
  const monthNum = currentDate.getMonth() + 1
  const monthKey = `${yearNum}-${String(monthNum).padStart(2, '0')}`

  const currentRates = client.monthlyRates?.[monthKey] || client.baseRates || { weekday: 0, weekend: 0 }
  const currentQuota = client.monthlyQuotas?.[monthKey] !== undefined ? client.monthlyQuotas[monthKey] : (client.monthlyQuota || 0)

  const handleRateChange = (e) => {
    const { name, value } = e.target
    const numValue = value === '' ? '' : Number(value)
    onUpdateClient({
      ...client,
      monthlyRates: {
        ...(client.monthlyRates || {}),
        [monthKey]: {
          ...currentRates,
          [name]: numValue
        }
      }
    })
  }

  const handleQuotaChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value)
    onUpdateClient({
      ...client,
      monthlyQuotas: {
        ...(client.monthlyQuotas || {}),
        [monthKey]: value
      }
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
  }

  // Calculate shifts for the selected month
  const { assignedWorkers, totalShifts, totalRevenue, breakdown, allClientShifts, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    
    // Find all workers assigned to this client
    const assigned = workers.filter(w => w.clientId === client.id)
    
    let combinedShiftsCount = 0
    let revenue = 0
    
    const breakdownData = {
      normal: { count: 0, total: 0, days: [] },
      holidayNormal: { count: 0, total: 0, days: [] },
      holidayIrrenunciable: { count: 0, total: 0, days: [] }
    }
    
    const shiftsList = []

    assigned.forEach(worker => {
      // Filter worker shifts by month
      const monthlyShifts = worker.shifts.filter(s => s.date.startsWith(prefix))
      combinedShiftsCount += monthlyShifts.length
      
      // Calculate revenue based on client rates for THIS month
      monthlyShifts.forEach(shift => {
        const base = shift.isWeekend ? currentRates.weekend : currentRates.weekday
        let multiplier = 1.0
        let type = 'normal'
        
        if (shift.holidayType === 'normal') {
          multiplier = 1.3
          type = 'holidayNormal'
        } else if (shift.holidayType === 'irrenunciable') {
          multiplier = 2.0
          type = 'holidayIrrenunciable'
        }
        
        const payment = base * multiplier
        revenue += payment
        
        breakdownData[type].count += 1
        breakdownData[type].total += payment
        breakdownData[type].days.push(parseInt(shift.date.split('-')[2], 10))
        
        shiftsList.push({
          id: shift.id,
          date: shift.date,
          type: shift.holidayType,
          payment: payment
        })
      })
    })
    
    shiftsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    return {
      assignedWorkers: assigned,
      totalShifts: combinedShiftsCount,
      totalRevenue: revenue,
      breakdown: breakdownData,
      allClientShifts: shiftsList,
      monthName: monthNames[currentDate.getMonth()],
      year: year
    }
  }, [client, workers, currentDate])

  // Progress Bar calculation
  const quota = currentQuota || 1
  const progressPercent = Math.min((totalShifts / quota) * 100, 100)

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
    
    setIsGenerating(true)
    
    const element = invoiceRef.current
    
    const opt = {
      margin: 0,
      filename: `Factura_${client.name.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    try {
      await html2pdf().set(opt).from(element).save()
      toast.success('Documento PDF descargado correctamente')
    } catch (e) {
      console.error("Error generating PDF", e)
      toast.error('Hubo un error al generar el PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  // Pre-calculate folio and date for the template
  const folioStr = useMemo(() => {
    const month = currentDate.getMonth()
    const invoiceKey = `invoice_folio_${client.id}_${year}_${month}`
    
    let savedFolio = localStorage.getItem(invoiceKey)
    if (!savedFolio) {
      // Retrieve the global next folio counter (defaults to 1001)
      let nextFolio = parseInt(localStorage.getItem('agencyNextFolio') || '1001', 10)
      savedFolio = String(nextFolio)
      
      // Save it for this specific invoice
      localStorage.setItem(invoiceKey, savedFolio)
      
      // Increment global counter
      localStorage.setItem('agencyNextFolio', String(nextFolio + 1))
    }
    
    return savedFolio.padStart(5, '0')
  }, [client, year, currentDate])
  
  const dateStr = useMemo(() => {
    const today = new Date()
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth()+1).padStart(2, '0')}/${today.getFullYear()}`
  }, [])

  return (
    <div className="grid grid-cols-2">
      {/* Columna Izquierda: Configuración */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Configuración de Cobro</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Cuota Mensual (Turnos Solicitados)</label>
              <input 
                type="number" 
                value={currentQuota} 
                onChange={handleQuotaChange} 
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Valor Cobro Semana (L-V)</label>
              <input 
                type="number" 
                name="weekday" 
                value={currentRates.weekday} 
                onChange={handleRateChange} 
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Valor Cobro Fin de Semana / Feriado</label>
              <input 
                type="number" 
                name="weekend" 
                value={currentRates.weekend} 
                onChange={handleRateChange} 
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Resumen */}
      <div>
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '1.25rem' }}>
            Estado de Cuenta: <span style={{ color: 'var(--color-primary)' }}>{client.name}</span> <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>({monthName} {year})</span>
          </h2>
          
          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Progreso de Cuota</span>
              <span style={{ fontWeight: 'bold' }}>{totalShifts} / {currentQuota} turnos</span>
            </div>
            <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: progressPercent >= 100 ? 'var(--color-success)' : 'var(--color-accent)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Facturación (Ingresos del Mes)</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '1rem' }}>
              {formatCurrency(totalRevenue)}
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-main)' }}>
                <span>Turnos Normales ({breakdown.normal.count})</span>
                <span>{formatCurrency(breakdown.normal.total)}</span>
              </div>
              {breakdown.holidayNormal.count > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-warning)' }}>
                  <span>Feriados Normales +30% ({breakdown.holidayNormal.count})</span>
                  <span>{formatCurrency(breakdown.holidayNormal.total)}</span>
                </div>
              )}
              {breakdown.holidayIrrenunciable.count > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                  <span>Feriados Irrenunc. +100% ({breakdown.holidayIrrenunciable.count})</span>
                  <span>{formatCurrency(breakdown.holidayIrrenunciable.total)}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <button 
              onClick={handleDownloadPDF}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={allClientShifts.length === 0 || isGenerating}
            >
              {isGenerating ? '⏳ Generando Documento...' : '📄 Generar y Descargar PDF'}
            </button>
            {allClientShifts.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No hay turnos para generar documento este mes.</p>
            )}
          </div>

          <div style={{ marginTop: 'auto' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Trabajadoras Asignadas:</h3>
            {assignedWorkers.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>No hay trabajadoras asignadas a este cliente.</p>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {assignedWorkers.map(w => (
                  <span key={w.id} style={{ background: 'var(--color-surface)', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                    {w.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden Invoice Template for PDF Generation */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <InvoiceTemplate 
          ref={invoiceRef}
          client={client}
          agencySettings={agencySettings}
          breakdown={breakdown}
          totalRevenue={totalRevenue}
          monthName={monthName}
          year={year}
          folioStr={folioStr}
          dateStr={dateStr}
        />
      </div>
    </div>
  )
}
