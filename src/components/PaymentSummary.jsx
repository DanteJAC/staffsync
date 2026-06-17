import React, { useState, useMemo, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { toast } from 'react-hot-toast'
import TaxCalculator from './TaxCalculator'
import WorkerInvoiceTemplate from './WorkerInvoiceTemplate'

export default function PaymentSummary({ workerName, shifts, baseRates, currentDate, agencySettings, onRemove }) {
  const [showTaxes, setShowTaxes] = useState(false)
  const [retentionRate, setRetentionRate] = useState(15.25)
  const [isTotalLiquid, setIsTotalLiquid] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const invoiceRef = useRef(null)
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
  }

  const calculateShiftPayment = (shift) => {
    const base = shift.isWeekend ? baseRates.weekend : baseRates.weekday
    let multiplier = 1.0
    
    if (shift.holidayType === 'normal') {
      multiplier = 1.3
    } else if (shift.holidayType === 'irrenunciable') {
      multiplier = 2.0
    }

    let payment = base * multiplier
    if (shift.isPartial && shift.totalHours > 0) {
      payment = payment * (shift.workedHours / shift.totalHours)
    }

    return payment
  }

  const getHolidayLabel = (shift) => {
    let label = 'Día Normal'
    if (shift.holidayType === 'normal') label = 'Feriado Normal (+30%)'
    if (shift.holidayType === 'irrenunciable') label = 'Feriado Irrenunciable (+100%)'
    
    if (shift.isPartial) {
      label += ` (${shift.workedHours}/${shift.totalHours} hrs)`
    }
    return label
  }

  // Filter shifts by current month
  const { currentMonthShifts, monthName, year, totalPayment } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1 // 1-12
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    
    // Filter by prefix and then sort chronologically
    const filtered = shifts
      .filter(s => s.date.startsWith(prefix))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
    // Calc payment with exact payment property for template
    const shiftsWithPayment = filtered.map(s => ({
      ...s,
      payment: calculateShiftPayment(s)
    }))
    
    const total = shiftsWithPayment.reduce((acc, shift) => acc + shift.payment, 0)
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    return {
      currentMonthShifts: shiftsWithPayment,
      monthName: monthNames[currentDate.getMonth()],
      year: year,
      totalPayment: total
    }
  }, [shifts, currentDate, baseRates])

  const { bruto, retencion, liquido } = useMemo(() => {
    const rate = retentionRate / 100
    let b = 0, r = 0, l = 0

    if (isTotalLiquid) {
      l = totalPayment
      b = l / (1 - rate)
      r = b * rate
    } else {
      b = totalPayment
      r = b * rate
      l = b - r
    }

    return { 
      bruto: Math.round(b), 
      retencion: Math.round(r), 
      liquido: Math.round(l) 
    }
  }, [totalPayment, retentionRate, isTotalLiquid])

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
    setIsGenerating(true)
    
    const element = invoiceRef.current
    const opt = {
      margin: 0,
      filename: `Liquidacion_${workerName.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    try {
      await html2pdf().set(opt).from(element).save()
      toast.success('Documento de honorarios descargado correctamente')
    } catch (e) {
      console.error("Error generating PDF", e)
      toast.error('Hubo un error al generar el PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '1.25rem' }}>
        Resumen de Pagos: <span style={{ color: 'var(--color-primary)' }}>{workerName}</span> <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>({monthName} {year})</span>
      </h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Total de turnos en este mes: <strong style={{ color: 'var(--color-text-main)' }}>{currentMonthShifts.length}</strong>
      </p>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
        {currentMonthShifts.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>No hay turnos registrados en este mes.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentMonthShifts.map((shift) => (
              <div 
                key={shift.id} 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  padding: '1rem', 
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {shift.date} {shift.isWeekend ? '(Fin de Semana)' : '(Semana)'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {getHolidayLabel(shift)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-accent)' }}>
                    {formatCurrency(shift.payment)}
                  </div>
                  <button 
                    onClick={() => onRemove(shift.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        borderTop: '1px solid var(--color-border)', 
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>Total a Pagar:</span>
        <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-accent)' }}>
          {formatCurrency(totalPayment)}
        </span>
      </div>

      {totalPayment > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setShowTaxes(!showTaxes)}
            className="btn btn-primary"
            style={{ flex: 1, background: showTaxes ? 'var(--color-text-muted)' : 'var(--color-primary)' }}
          >
            {showTaxes ? 'Ocultar Cálculo de Impuestos' : 'Calcular Boleta de Honorarios'}
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={isGenerating}
          >
            {isGenerating ? '⏳ Generando...' : '📄 Generar PDF'}
          </button>
        </div>
      )}

      {showTaxes && totalPayment > 0 && (
        <TaxCalculator 
          retentionRate={retentionRate}
          setRetentionRate={setRetentionRate}
          isTotalLiquid={isTotalLiquid}
          setIsTotalLiquid={setIsTotalLiquid}
          bruto={bruto}
          retencion={retencion}
          liquido={liquido}
        />
      )}

      {/* Hidden Invoice Template for Worker PDF */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <WorkerInvoiceTemplate 
          ref={invoiceRef}
          workerName={workerName}
          shifts={currentMonthShifts}
          totalPayment={totalPayment}
          monthName={monthName}
          year={year}
          agencySettings={agencySettings}
          bruto={bruto}
          retencion={retencion}
          liquido={liquido}
          retentionRate={retentionRate}
          isTotalLiquid={isTotalLiquid}
        />
      </div>
    </div>
  )
}
