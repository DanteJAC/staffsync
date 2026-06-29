import { forwardRef } from 'react'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}

const InvoiceTemplate = forwardRef(({ client, agencySettings, breakdown, totalRevenue, monthName, year, folioStr, dateStr }, ref) => {
  const tableData = []
    
  if (breakdown.normal.count > 0) {
    const uniqueDays = Array.from(new Map(breakdown.normal.days.map(d => [d.label, d])).values())
    const daysStr = uniqueDays.sort((a,b) => a.num - b.num).map(d => d.label).join(', ')
    tableData.push({
      desc: `Turnos Normales (${breakdown.normal.count})`,
      details: `Días: ${daysStr}`,
      total: formatCurrency(breakdown.normal.total)
    })
  }
  
  if (breakdown.holidayNormal.count > 0) {
    const uniqueDays = Array.from(new Map(breakdown.holidayNormal.days.map(d => [d.label, d])).values())
    const daysStr = uniqueDays.sort((a,b) => a.num - b.num).map(d => d.label).join(', ')
    tableData.push({
      desc: `Feriados Normales (${breakdown.holidayNormal.count})`,
      details: `Días: ${daysStr}`,
      total: formatCurrency(breakdown.holidayNormal.total)
    })
  }
  
  if (breakdown.holidayIrrenunciable.count > 0) {
    const uniqueDays = Array.from(new Map(breakdown.holidayIrrenunciable.days.map(d => [d.label, d])).values())
    const daysStr = uniqueDays.sort((a,b) => a.num - b.num).map(d => d.label).join(', ')
    tableData.push({
      desc: `Feriados Irrenunc. (${breakdown.holidayIrrenunciable.count})`,
      details: `Días: ${daysStr}`,
      total: formatCurrency(breakdown.holidayIrrenunciable.total)
    })
  }

  return (
    <div 
      ref={ref} 
      style={{
        width: '800px', // Fixed width for perfect PDF scaling
        minHeight: '1000px',
        padding: '50px 60px',
        background: '#ffffff',
        color: '#1a1a1a',
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        boxSizing: 'border-box'
      }}
    >
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f0f0f0', paddingBottom: '30px', marginBottom: '40px' }}>
        <div style={{ maxWidth: '350px' }}>
          {agencySettings?.logoBase64 ? (
            <img src={agencySettings.logoBase64} alt="Logo" style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', marginBottom: '20px' }} />
          ) : (
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
              {agencySettings?.agencyName || 'Agencia de Turnos'}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
            {agencySettings?.agencyName && agencySettings.logoBase64 && <div style={{ fontWeight: 'bold', color: '#334155' }}>{agencySettings.agencyName}</div>}
            {agencySettings?.agencyRut && <div>RUT: {agencySettings.agencyRut}</div>}
            {agencySettings?.agencyPhone && <div>Contacto: {agencySettings.agencyPhone}</div>}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 10px 0', color: '#0f172a', letterSpacing: '-1px' }}>
            FACTURA
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ fontWeight: '600' }}>Folio No:</span>
              <span style={{ color: '#0f172a' }}>#{folioStr}</span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ fontWeight: '600' }}>Fecha Emisión:</span>
              <span style={{ color: '#0f172a' }}>{dateStr}</span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ fontWeight: '600' }}>Período:</span>
              <span style={{ color: '#0f172a' }}>{monthName} {year}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', margin: '0 0 10px 0' }}>Facturar A:</h3>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 5px 0' }}>{client?.name}</div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>Servicios de Turnos Correspondientes al período de {monthName} {year}</div>
      </div>

      {/* Table Section */}
      <div style={{ marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '15px 10px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripción de Servicio</th>
              <th style={{ textAlign: 'right', padding: '15px 10px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td style={{ padding: '20px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '5px' }}>{row.desc}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', maxWidth: '500px' }}>{row.details}</div>
                </td>
                <td style={{ padding: '20px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#334155', verticalAlign: 'top' }}>
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '60px' }}>
        <div style={{ width: '350px', background: '#f8fafc', borderRadius: '12px', padding: '25px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', color: '#64748b', fontSize: '14px' }}>
            <span>Subtotal (Neto)</span>
            <span>{formatCurrency(totalRevenue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '2px dashed #cbd5e1' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>TOTAL A PAGAR</span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a' }}>{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #f0f0f0', textAlign: 'center', color: '#94a3b8', fontSize: '11px' }}>
        <p style={{ margin: '0 0 5px 0' }}>Gracias por preferir nuestros servicios.</p>
        <p style={{ margin: 0 }}>Documento emitido electrónicamente por Calculadora de Turnos.</p>
      </div>
    </div>
  )
})

export default InvoiceTemplate
