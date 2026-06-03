import React, { useRef } from 'react'
import { motion } from 'framer-motion'

export default function AgencySettings({ settings, onUpdateSettings, onClose }) {
  const fileInputRef = useRef(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      onUpdateSettings({
        ...settings,
        logoBase64: event.target.result
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    onUpdateSettings({
      ...settings,
      logoBase64: null
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    onUpdateSettings({
      ...settings,
      [name]: value
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-panel" 
        style={{ width: '500px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          ×
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary)' }}>⚙️ Ajustes de Agencia</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Logo de la Empresa</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Este logo aparecerá en la cabecera de los documentos PDF generados. Se recomienda una imagen apaisada o cuadrada.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
              {settings?.logoBase64 ? (
                <>
                  <img 
                    src={settings.logoBase64} 
                    alt="Logo Empresa" 
                    style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} 
                  />
                  <button onClick={handleRemoveLogo} className="delete-btn" style={{ position: 'static' }}>Eliminar Logo</button>
                </>
              ) : (
                <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin logo configurado</div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn"
                style={{ width: '100%', border: '1px solid var(--color-border)' }}
              >
                {settings?.logoBase64 ? 'Cambiar Imagen' : 'Subir Imagen'}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre de la Empresa / Agencia</label>
              <input 
                type="text" 
                name="agencyName" 
                value={settings?.agencyName || ''} 
                onChange={handleChange} 
                placeholder="Ej: Agencia Enfermeras Pro"
              />
            </div>
            <div className="form-group">
              <label>RUT / Identificación</label>
              <input 
                type="text" 
                name="agencyRut" 
                value={settings?.agencyRut || ''} 
                onChange={handleChange} 
                placeholder="Ej: 76.123.456-7"
              />
            </div>
            <div className="form-group">
              <label>Teléfono o Correo de Contacto</label>
              <input 
                type="text" 
                name="agencyPhone" 
                value={settings?.agencyPhone || ''} 
                onChange={handleChange} 
                placeholder="Ej: +56 9 1234 5678"
              />
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>Guardar y Cerrar</button>
        </div>
      </motion.div>
    </div>
  )
}
