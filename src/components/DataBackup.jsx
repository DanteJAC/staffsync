import React, { useRef } from 'react'

export default function DataBackup({ workers, setWorkers }) {
  const fileInputRef = useRef(null)

  const handleExport = () => {
    const dataStr = JSON.stringify(workers, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `calculadora_turnos_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result)
        
        // Basic validation: must be an array of objects
        if (!Array.isArray(parsedData)) {
          throw new Error('El archivo no contiene un arreglo válido.')
        }

        // Check if it looks like our workers data
        if (parsedData.length > 0 && !parsedData[0].hasOwnProperty('baseRates')) {
           throw new Error('Formato de datos no reconocido.')
        }

        setWorkers(parsedData)
        alert('✅ Datos importados correctamente.')
      } catch (error) {
        console.error("Error al importar:", error)
        alert('❌ Error al importar. El archivo puede estar corrupto o no ser el correcto.')
      }
      
      // Reset input so the same file can be selected again if needed
      e.target.value = ''
    }
    
    reader.readAsText(file)
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button 
        onClick={handleExport}
        className="btn" 
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)' }}
        title="Descargar copia de seguridad"
      >
        ⬇️ Exportar
      </button>

      <button 
        onClick={handleImportClick}
        className="btn" 
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)' }}
        title="Restaurar datos desde un archivo"
      >
        ⬆️ Importar
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        style={{ display: 'none' }} 
      />
    </div>
  )
}
