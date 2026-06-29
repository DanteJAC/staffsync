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
import InitialLoginScreen from './components/InitialLoginScreen'
import WorkerPortal from './components/WorkerPortal'
import { Toaster, toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { db, auth } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  const [showSettings, setShowSettings] = useState(false)

  const [appMode, setAppMode] = useState('workers') // 'workers' | 'clients'
  
  const [activeWorkerId, setActiveWorkerId] = useState(null)
  const [activeClientId, setActiveClientId] = useState(null)
  const [currentView, setCurrentView] = useState('mensual') // 'mensual' | 'anual'
  const [calendarDate, setCalendarDate] = useState(new Date())

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser))
  }, [currentUser])

  useEffect(() => {
    if (currentUser?.role === 'admin' && db) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, 'staffsync', 'mainData')
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.workers) setWorkers(data.workers)
            if (data.clients) setClients(data.clients)
            if (data.agencySettings) setAgencySettings(data.agencySettings)
            toast.success('Base de datos sincronizada desde Firestore')
          }
        } catch (err) {
          console.error('Error fetching from Firebase:', err)
        }
      }
      fetchData()
    }
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('workersData', JSON.stringify(workers))
    localStorage.setItem('clientsData', JSON.stringify(clients))
    localStorage.setItem('agencySettings', JSON.stringify(agencySettings))

    if (currentUser?.role === 'admin' && db) {
      setDoc(doc(db, 'staffsync', 'mainData'), { workers, clients, agencySettings }, { merge: true })
        .catch(err => console.error('Error syncing data to Firebase:', err))
    }
  }, [workers, clients, agencySettings, currentUser?.role])

  // --- Handlers for Workers ---
  const handleAddWorker = (name) => {
    const newWorker = {
      id: Date.now().toString(),
      name,
      clientId: null,
      baseRates: { weekday: 0, weekend: 0, standardHours: 8 },
      shifts: [] // Array of { id, date, isWeekend, holidayType, isPartial, totalHours, workedHours }
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

  const otherOccupiedDates = new Set()
  if (activeWorker && activeWorker.clientId) {
    workers.filter(w => w.clientId === activeWorker.clientId && w.id !== activeWorker.id).forEach(w => {
      (w.shifts || []).forEach(s => otherOccupiedDates.add(s.date))
    })
  }

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

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', padding: '1rem', background: 'var(--color-background)' }}>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'rgba(30, 41, 59, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} />
        <InitialLoginScreen workers={workers} onLoginSuccess={setCurrentUser} />
      </div>
    )
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
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 100%', textAlign: 'center', order: 1 }}>
          <h1 style={{ margin: 0 }}>Calculadora de Turnos</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Calcula tus pagos de forma rápida y precisa</p>
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', order: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 1rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: '600' }}>
              👤 {currentUser.role === 'admin' ? 'Administrador' : currentUser.name}
            </span>
            <button 
              className="btn"
              onClick={() => {
                if (confirm('¿Deseas cerrar sesión?')) {
                  setCurrentUser(null)
                  auth && auth.signOut()
                  toast.success('Sesión cerrada')
                }
              }}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)' }}
              title="Cerrar sesión"
            >
              🚪 Salir
            </button>
          </div>

          {currentUser.role === 'admin' && (
            <>
              <button 
                className="btn" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)' }}
                onClick={() => setShowSettings(true)}
                title="Ajustes de Agencia"
              >
                ⚙️ Ajustes
              </button>
              <DataBackup data={backupData} onRestore={handleRestoreData} />
            </>
          )}
        </div>
      </header>

      {showSettings && currentUser.role === 'admin' && (
        <AgencySettings 
          settings={agencySettings} 
          onUpdateSettings={setAgencySettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      <main style={{ maxWidth: '1200px', margin: '0 auto', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-xl)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {currentUser.role === 'worker' ? (
            <motion.div 
              key="worker-portal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ padding: '2rem' }}
            >
              <WorkerPortal 
                workers={workers} 
                lockedWorkerId={currentUser.workerId}
                onUpdateWorker={(updatedWorker) => {
                  setWorkers(workers.map(w => w.id === updatedWorker.id ? updatedWorker : w))
                }} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="admin-portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap' }}>
                <button 
                  className={`btn ${appMode === 'workers' ? 'btn-primary' : ''}`}
                  onClick={() => setAppMode('workers')}
                  style={{ flex: '1 1 200px', maxWidth: '300px' }}
                >
                  👩‍⚕️ Gestión de Trabajadoras
                </button>
                <button 
                  className={`btn ${appMode === 'clients' ? 'btn-primary' : ''}`}
                  onClick={() => setAppMode('clients')}
                  style={{ flex: '1 1 200px', maxWidth: '300px' }}
                >
                  🏢 Gestión de Clientes
                </button>
              </div>

              {appMode === 'workers' ? (
                <div style={{ padding: '0 2rem 2rem 2rem' }}>
                  <WorkerSelector 
                    workers={workers} 
                    activeWorkerId={activeWorkerId} 
                    onSelect={setActiveWorkerId} 
                    onAdd={handleAddWorker} 
                    onDelete={handleDeleteWorker} 
                  />
                  {activeWorker ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div className="calendar-header" style={{ width: '300px', margin: '0' }}>
                          <button className="btn" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>&lt;</button>
                          <h3 style={{ margin: 0 }}>{['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
                          <button className="btn" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>&gt;</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <button 
                          className={`btn ${currentView === 'mensual' ? 'btn-primary' : ''}`}
                          onClick={() => setCurrentView('mensual')}
                          style={{ flex: '1 1 200px' }}
                        >
                          📅 Calendario Mensual
                        </button>
                        <button 
                          className={`btn ${currentView === 'anual' ? 'btn-primary' : ''}`}
                          onClick={() => setCurrentView('anual')}
                          style={{ flex: '1 1 200px' }}
                        >
                          📊 Resumen Anual
                        </button>
                      </div>

                      {currentView === 'mensual' ? (
                        <div className="grid grid-cols-2">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <ConfigurationPanel 
                              rates={activeWorker.baseRates || { weekday: 0, weekend: 0, standardHours: 8 }} 
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
                              otherOccupiedDates={otherOccupiedDates}
                              standardHours={activeWorker.baseRates?.standardHours || 8}
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
                </div>
              ) : (
                <div style={{ padding: '0 2rem 2rem 2rem' }}>
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
