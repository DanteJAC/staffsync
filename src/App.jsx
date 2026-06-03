import { useState, useEffect } from 'react'
import ConfigurationPanel from './components/ConfigurationPanel'
import CalendarSelector from './components/CalendarSelector'
import PaymentSummary from './components/PaymentSummary'
import WorkerSelector from './components/WorkerSelector'
import AnnualDashboard from './components/AnnualDashboard'
import DataBackup from './components/DataBackup'
import ClientSelector from './components/ClientSelector'
import ClientDashboard from './components/ClientDashboard'
import AgencySettings from './components/AgencySettings'
import GlobalWorkersSummary from './components/GlobalWorkersSummary'
import { Toaster, toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('workersData')
    return saved ? JSON.parse(saved) : []
  })
  
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('clientsData')
    return saved ? JSON.parse(saved) : []
  })

  const [agencySettings, setAgencySettings] = useState(() => {
    const saved = localStorage.getItem('agencySettings')
    return saved ? JSON.parse(saved) : { logoBase64: null }
  })

  const [showSettings, setShowSettings] = useState(false)

  const [appMode, setAppMode] = useState('workers') // 'workers' | 'clients'
  
  const [activeWorkerId, setActiveWorkerId] = useState(null)
  const [activeClientId, setActiveClientId] = useState(null)
  const [currentView, setCurrentView] = useState('mensual') // 'mensual' | 'anual'
  const [calendarDate, setCalendarDate] = useState(new Date())

  useEffect(() => {
    localStorage.setItem('workersData', JSON.stringify(workers))
  }, [workers])

  useEffect(() => {
    localStorage.setItem('clientsData', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem('agencySettings', JSON.stringify(agencySettings))
  }, [agencySettings])

  // --- Handlers for Workers ---
  const handleAddWorker = (name) => {
    const newWorker = {
      id: Date.now().toString(),
      name,
      clientId: null,
      baseRates: { weekday: 0, weekend: 0 },
      shifts: [] // Array of { id, date, isWeekend, holidayType }
    }
    setWorkers(prev => [...prev, newWorker])
    toast.success(`Trabajadora ${name} añadida`)
  }

  const handleDeleteWorker = (id) => {
    setWorkers(prev => prev.filter(w => w.id !== id))
    if (activeWorkerId === id) setActiveWorkerId(null)
    toast.success('Trabajadora eliminada')
  }

  const activeWorker = workers.find(w => w.id === activeWorkerId)

  const handleUpdateRates = (newRates) => {
    if (!activeWorker) return
    setWorkers(workers.map(w => w.id === activeWorkerId ? { ...w, baseRates: newRates } : w))
  }

  const handleUpdateShifts = (newShifts) => {
    if (!activeWorker) return
    setWorkers(workers.map(w => w.id === activeWorkerId ? { ...w, shifts: newShifts } : w))
  }

  // --- Handlers for Clients ---
  const handleAddClient = (name) => {
    const newClient = {
      id: Date.now().toString(),
      name,
      monthlyQuota: 0,
      baseRates: {
        weekday: 0,
        weekend: 0
      }
    }
    setClients(prev => [...prev, newClient])
    toast.success(`Cliente ${name} añadido`)
  }

  const handleDeleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id))
    // Also detach workers from this client
    setWorkers(prev => prev.map(w => w.clientId === id ? { ...w, clientId: null } : w))
    if (activeClientId === id) setActiveClientId(null)
    toast.success('Cliente eliminado')
  }

  const activeClient = clients.find(c => c.id === activeClientId)

  const handleUpdateClient = (updatedClient) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c))
  }

  // Backup handler extra props
  const backupData = { workers, clients }
  const handleRestoreData = (data) => {
    if (data.workers) setWorkers(data.workers)
    if (data.clients) setClients(data.clients)
    toast.success('Copia de seguridad restaurada correctamente')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(30, 41, 59, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ visibility: 'hidden', width: '200px' }}>Espaciador</div>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Calculadora de Turnos</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Calcula tus pagos de forma rápida y precisa</p>
        </div>

        <div style={{ width: '250px', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button 
            className="btn" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)' }}
            onClick={() => setShowSettings(true)}
            title="Ajustes de Agencia"
          >
            ⚙️ Ajustes
          </button>
          <DataBackup data={backupData} onRestore={handleRestoreData} />
        </div>
      </header>

      {showSettings && (
        <AgencySettings 
          settings={agencySettings} 
          onUpdateSettings={setAgencySettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${appMode === 'workers' ? 'btn-primary' : ''}`}
          onClick={() => setAppMode('workers')}
          style={{ width: '200px' }}
        >
          👩‍⚕️ Gestión de Trabajadoras
        </button>
        <button 
          className={`btn ${appMode === 'clients' ? 'btn-primary' : ''}`}
          onClick={() => setAppMode('clients')}
          style={{ width: '200px' }}
        >
          🏢 Gestión de Clientes
        </button>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-xl)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {appMode === 'workers' ? (
            <motion.div 
              key="workers-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <WorkerSelector 
                workers={workers} 
                activeWorkerId={activeWorkerId} 
                onSelect={setActiveWorkerId} 
                onAdd={handleAddWorker} 
                onDelete={handleDeleteWorker} 
              />
              {activeWorker ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button 
                      className={`btn ${currentView === 'mensual' ? 'btn-primary' : ''}`}
                      onClick={() => setCurrentView('mensual')}
                    >
                      📅 Calendario Mensual
                    </button>
                    <button 
                      className={`btn ${currentView === 'anual' ? 'btn-primary' : ''}`}
                      onClick={() => setCurrentView('anual')}
                    >
                      📊 Resumen Anual
                    </button>
                  </div>

                  {currentView === 'mensual' ? (
                    <div className="grid grid-cols-2">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <ConfigurationPanel 
                          rates={activeWorker.baseRates || { weekday: 0, weekend: 0 }} 
                          onUpdate={handleUpdateRates}
                          clientId={activeWorker.clientId}
                          clients={clients}
                          onAssignClient={(cId) => {
                            setWorkers(workers.map(w => w.id === activeWorkerId ? { ...w, clientId: cId } : w))
                          }}
                        />
                        <CalendarSelector 
                          shifts={activeWorker.shifts || []} 
                          onChangeShifts={handleUpdateShifts} 
                          currentDate={calendarDate}
                          setCurrentDate={setCalendarDate}
                        />
                      </div>
                      
                      <div>
                        <PaymentSummary 
                          workerName={activeWorker.name}
                          shifts={activeWorker.shifts || []} 
                          baseRates={activeWorker.baseRates || { weekday: 0, weekend: 0 }}
                          currentDate={calendarDate}
                          agencySettings={agencySettings}
                          onRemove={(shiftId) => {
                            handleUpdateShifts((activeWorker.shifts || []).filter(s => s.id !== shiftId))
                          }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <AnnualDashboard 
                      workerName={activeWorker.name} 
                      shifts={activeWorker.shifts || []} 
                      baseRates={activeWorker.baseRates || { weekday: 0, weekend: 0 }} 
                    />
                  )}
                </>
              ) : (
                <GlobalWorkersSummary 
                  workers={workers} 
                  currentDate={calendarDate} 
                  setCurrentDate={setCalendarDate}
                  onSelectWorker={setActiveWorkerId}
                />
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="clients-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ClientSelector 
                clients={clients}
                activeClientId={activeClientId}
                onSelect={setActiveClientId}
                onAdd={handleAddClient}
                onDelete={handleDeleteClient}
              />
              {activeClient ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="calendar-header" style={{ width: '300px', margin: '0' }}>
                      <button className="btn" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>&lt;</button>
                      <h3 style={{ margin: 0 }}>{['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
                      <button className="btn" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>&gt;</button>
                    </div>
                  </div>
                  
                  <ClientDashboard 
                    client={activeClient}
                    onUpdateClient={handleUpdateClient}
                    workers={workers}
                    currentDate={calendarDate}
                    agencySettings={agencySettings}
                  />
                </>
              ) : (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                  <h3 style={{ color: 'var(--color-text-muted)' }}>👆 Selecciona o agrega un cliente arriba para continuar.</h3>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
