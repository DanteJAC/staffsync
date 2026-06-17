import React, { forwardRef } from 'react'

const WorkerInvoiceTemplate = forwardRef(({ workerName, shifts, totalPayment, monthName, year, agencySettings, bruto, retencion, liquido, retentionRate, isTotalLiquid }, ref) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
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

  // Estilos de la plantilla
  const styles = {
    container: {
      width: '210mm',
      minHeight: '297mm',
      padding: '40px 50px',
      background: '#ffffff',
      color: '#1e293b',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      borderBottom: '2px solid #3b82f6',
      paddingBottom: '20px',
      marginBottom: '30px'
    },
    logoPlaceholder: {
      width: '120px',
      height: '60px',
      background: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      color: '#94a3b8',
      fontSize: '12px',
      fontWeight: 'bold',
      overflow: 'hidden'
    },
    logoImg: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    },
    titleBox: {
      textAlign: 'right'
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#0f172a',
      margin: '0 0 5px 0',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0
    },
    infoSection: {
      display: 'flex',
      justifyContent: 'space-between',
      background: '#f8fafc',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      marginBottom: '30px'
    },
    infoBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#64748b',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '16px',
      color: '#0f172a',
      fontWeight: '600'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '30px'
    },
    th: {
      background: '#f1f5f9',
      color: '#475569',
      padding: '12px 15px',
      textAlign: 'left',
      fontSize: '13px',
      textTransform: 'uppercase',
      fontWeight: '600',
      borderBottom: '2px solid #cbd5e1'
    },
    td: {
      padding: '12px 15px',
      borderBottom: '1px solid #e2e8f0',
      color: '#334155',
      fontSize: '14px'
    },
    tdRight: {
      textAlign: 'right',
      fontWeight: '600'
    },
    totalsSection: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    totalsBox: {
      width: '350px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      padding: '20px'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: '10px',
      marginBottom: '10px',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '14px',
      color: '#475569'
    },
    totalRowFinal: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: '5px',
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a'
    },
    footer: {
      marginTop: '50px',
      textAlign: 'center',
      fontSize: '12px',
      color: '#94a3b8',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '20px'
    }
  }

  // Configuración de boleta
  const assumptionText = isTotalLiquid 
    ? "(El total de turnos se asume como el Líquido deseado a recibir)"
    : "(El total de turnos se asume como el Monto Bruto de la boleta)"

  return (
    <div ref={ref} style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoPlaceholder}>
          {agencySettings?.logoBase64 ? (
            <img src={agencySettings.logoBase64} alt="Agency Logo" style={styles.logoImg} />
          ) : (
            <span>LOGO AGENCIA</span>
          )}
        </div>
        <div style={styles.titleBox}>
          <h1 style={styles.title}>Liquidación</h1>
          <p style={styles.subtitle}>Resumen de Honorarios y Turnos</p>
        </div>
      </div>

      <div style={styles.infoSection}>
        <div style={styles.infoBlock}>
          <span style={styles.infoLabel}>Trabajadora</span>
          <span style={styles.infoValue}>{workerName}</span>
        </div>
        <div style={styles.infoBlock}>
          <span style={styles.infoLabel}>Período</span>
          <span style={styles.infoValue}>{monthName} {year}</span>
        </div>
        <div style={styles.infoBlock}>
          <span style={styles.infoLabel}>Total Turnos</span>
          <span style={styles.infoValue}>{shifts.length}</span>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Fecha del Turno</th>
            <th style={styles.th}>Tipo de Día</th>
            <th style={styles.th}>Recargo / Feriado</th>
            <th style={{...styles.th, textAlign: 'right'}}>Valor Pagado</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift, idx) => (
            <tr key={idx}>
              <td style={styles.td}>{shift.date}</td>
              <td style={styles.td}>{shift.isWeekend ? 'Fin de Semana' : 'Día de Semana'}</td>
              <td style={styles.td}>{getHolidayLabel(shift)}</td>
              <td style={{...styles.td, ...styles.tdRight}}>{formatCurrency(shift.payment)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.totalsSection}>
        <div style={styles.totalsBox}>
          <div style={{ marginBottom: '15px', fontSize: '11px', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
            {assumptionText}
          </div>
          <div style={styles.totalRow}>
            <span>Total Turnos</span>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatCurrency(totalPayment)}</span>
          </div>
          <div style={styles.totalRow}>
            <span>Honorarios Brutos</span>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatCurrency(bruto)}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={{ color: '#ef4444' }}>Retención Impuestos ({retentionRate}%)</span>
            <span style={{ color: '#ef4444', fontWeight: '600' }}>- {formatCurrency(retencion)}</span>
          </div>
          <div style={styles.totalRowFinal}>
            <span style={{ color: '#10b981' }}>Total Líquido a Pagar</span>
            <span style={{ color: '#10b981' }}>{formatCurrency(liquido)}</span>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        Documento generado automáticamente por el sistema de Gestión de Turnos.
      </div>
    </div>
  )
})

WorkerInvoiceTemplate.displayName = 'WorkerInvoiceTemplate'

export default WorkerInvoiceTemplate
