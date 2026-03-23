import React, { useState } from 'react';
import { ChefHat, LayoutDashboard, ClipboardList, TrendingDown, Settings, Plus, Minus, Send } from 'lucide-react';
import './index.css';

const PASTA_TYPES = [
  'Gnocchi de plátano', 'Gnocchi de Papa', 'Panzotti', 'Pasticho',
  'Tortellini', 'Raviolis', 'Capeletti', 'Sorrentinos'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State
  // Real inventory available in fridge
  const [inventory, setInventory] = useState(
    PASTA_TYPES.reduce((acc, p) => ({ ...acc, [p]: Math.floor(Math.random() * 20) }), {})
  );
  // Portions consumed or wasted today
  const [consumed, setConsumed] = useState(
    PASTA_TYPES.reduce((acc, p) => ({ ...acc, [p]: Math.floor(Math.random() * 10) }), {})
  );
  // The expected total demand for the day (Par levels)
  const [pars, setPars] = useState(
    PASTA_TYPES.reduce((acc, p) => ({ ...acc, [p]: 30 }), {})
  );
  
  // Waste log state for UI
  const [wasteLogs, setWasteLogs] = useState([]);

  // Calculate the required preparation amounts based on Par and Inventory
  function getPrepStatus(pasta) {
    const stock = inventory[pasta];
    const target = pars[pasta];
    const missing = target - stock;
    const toPrep = missing > 0 ? missing : 0;
    
    // Status color logic based on percentage of target met
    const ratio = stock / target;
    let statusClass = 'status-green';
    let textClass = 'text-green';
    
    if (ratio < 0.4) {
      statusClass = 'status-red';
      textClass = 'text-red';
    } else if (ratio < 0.8) {
      statusClass = 'status-yellow';
      textClass = 'text-yellow';
    }
    
    return { stock, toPrep, statusClass, textClass };
  }

  // Action handlers
  const adjustInventory = (pasta, amount) => {
    setInventory(prev => ({ ...prev, [pasta]: Math.max(0, prev[pasta] + amount) }));
  };

  const handleWasteSubmit = (e) => {
    e.preventDefault();
    const pasta = e.target.pasta.value;
    const qty = parseInt(e.target.qty.value);
    const reason = e.target.reason.value;
    
    if (!pasta || qty <= 0 || !reason) return;
    
    // Deduct from inventory
    setInventory(prev => ({ ...prev, [pasta]: Math.max(0, prev[pasta] - qty) }));
    // Add to consumed
    setConsumed(prev => ({ ...prev, [pasta]: prev[pasta] + qty }));
    // Log the waste
    setWasteLogs(prev => [{ pasta, qty, reason, time: new Date().toLocaleTimeString() }, ...prev]);
    e.target.reset();
  };

  const handleConsumeSubmit = (e) => {
    e.preventDefault();
    const pasta = e.target.pasta.value;
    const qty = parseInt(e.target.qty.value);
    
    if (!pasta || qty <= 0) return;
    
    // POS Simulation: deduct from inventory, add to consumed
    setInventory(prev => ({ ...prev, [pasta]: Math.max(0, prev[pasta] - qty) }));
    setConsumed(prev => ({ ...prev, [pasta]: prev[pasta] + qty }));
    e.target.reset();
  };

  const updatePar = (pasta, amount) => {
    setPars(prev => ({ ...prev, [pasta]: Math.max(0, parseInt(amount) || 0) }));
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ChefHat size={28} />
          </div>
          DianheChef
        </div>
        
        <nav className="nav-menu">
          <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}>
            <ClipboardList size={20} />
            Conteo de Existencias
          </button>
          <button onClick={() => setActiveTab('consumption')} className={`nav-item ${activeTab === 'consumption' ? 'active' : ''}`}>
            <TrendingDown size={20} />
            Consumo y Mermas
          </button>
          <button onClick={() => setActiveTab('settings')} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <Settings size={20} />
            Niveles de Par
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <header className="page-header">
              <h1 className="page-title">Flujo de Servicio</h1>
            </header>
            <div className="grid-dashboard">
              {PASTA_TYPES.map(pasta => {
                const { stock, toPrep, statusClass, textClass } = getPrepStatus(pasta);
                return (
                  <div key={pasta} className={`pasta-card ${statusClass}`}>
                    <div className="card-header">
                      <h2 className="card-title">{pasta}</h2>
                    </div>
                    
                    <div className="card-metrics">
                      <div className="metric-box">
                        <div className="label">Existencias</div>
                        <div className="value">{stock}</div>
                      </div>
                      <div className="metric-box">
                        <div className="label">Consumidas hoy</div>
                        <div className="value">{consumed[pasta]}</div>
                      </div>
                    </div>
                    
                    <div className={`prep-box ${textClass}`}>
                      <div className="label">A PREPARAR</div>
                      <div className="value">{toPrep}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: ACTUALIZACIÓN DE EXISTENCIAS */}
        {activeTab === 'inventory' && (
          <div className="fade-in">
            <header className="page-header">
              <h1 className="page-title">Actualización de Existencias</h1>
            </header>
            <div className="stock-list">
              {PASTA_TYPES.map(pasta => (
                <div key={pasta} className="stock-item">
                  <div className="stock-name">{pasta}</div>
                  <div className="counter-controls">
                    <button className="btn-large" onClick={() => adjustInventory(pasta, -1)}>
                      <Minus size={36} />
                    </button>
                    <div className="counter-value">{inventory[pasta]}</div>
                    <button className="btn-large" onClick={() => adjustInventory(pasta, 1)}>
                      <Plus size={36} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: REGISTRO DE CONSUMO Y MERMAS */}
        {activeTab === 'consumption' && (
          <div className="fade-in">
            <header className="page-header">
              <h1 className="page-title">Registro de Consumo y Mermas</h1>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px' }}>
              
              {/* POS Simulation Form */}
              <div>
                <form className="form-card" onSubmit={handleConsumeSubmit}>
                  <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Simulador POS (Salida de Cocina)</h2>
                  <div className="form-group">
                    <label>Tipo de Pasta</label>
                    <select name="pasta" className="form-control" defaultValue="">
                      <option value="" disabled>Selecciona la pasta vendida...</option>
                      {PASTA_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Raciones Vendidas</label>
                    <input name="qty" type="number" className="form-control" placeholder="1" min="1" defaultValue="1" />
                  </div>
                  <button type="submit" className="btn-primary">
                    <Send size={24} /> Registrar Salida POS
                  </button>
                </form>
              </div>

              {/* Waste Registration Form */}
              <div>
                <form className="form-card" onSubmit={handleWasteSubmit} style={{ border: '2px dashed var(--neon-red)' }}>
                  <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', color: 'var(--neon-red)' }}>Registro de Mermas</h2>
                  <div className="form-group">
                    <label>Tipo de Pasta Merma</label>
                    <select name="pasta" className="form-control" defaultValue="">
                      <option value="" disabled>Selecciona la pasta...</option>
                      {PASTA_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cód. Motivo de Desperdicio</label>
                    <select name="reason" className="form-control" defaultValue="">
                      <option value="" disabled>Motivo...</option>
                      <option value="Raciones Caídas">Caída en cocina</option>
                      <option value="Mal Cocinado">Preparación incorrecta</option>
                      <option value="Caducidad">Caducidad</option>
                      <option value="Contaminación">Contaminación cruzada</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cantidad</label>
                    <input name="qty" type="number" className="form-control" placeholder="1" min="1" defaultValue="1" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ background: 'var(--neon-red)' }}>
                    Registrar Merma
                  </button>
                </form>

                {wasteLogs.length > 0 && (
                  <div className="form-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Mermas Recientes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {wasteLogs.map((log, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                          <div>
                            <strong>{log.pasta}</strong> ({log.qty})<br/>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{log.reason}</span>
                          </div>
                          <div className="badge badge-red">{log.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: CONFIGURACIÓN DE NIVELES DE PAR */}
        {activeTab === 'settings' && (
          <div className="fade-in">
            <header className="page-header">
              <h1 className="page-title">Configuración de Niveles de Par</h1>
            </header>
            <div className="form-card" style={{ maxWidth: '800px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.1rem' }}>
                Establece la demanda esperada para el turno/día actual. Si las existencias caen muy por debajo del Nivel de Par, la urgencia de preparación aumentará.
              </p>
              
              <table className="table-stats">
                <thead>
                  <tr>
                    <th>Tipo de Pasta</th>
                    <th>Nivel de Par Actual</th>
                    <th>Modificar</th>
                  </tr>
                </thead>
                <tbody>
                  {PASTA_TYPES.map(pasta => (
                    <tr key={pasta}>
                      <td style={{ fontWeight: '600' }}>{pasta}</td>
                      <td>
                        <div className="badge badge-green" style={{ display: 'inline-block' }}>{pars[pasta]} Raciones</div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-control" 
                          style={{ padding: '8px 16px', maxWidth: '120px', fontSize: '1.25rem' }} 
                          value={pars[pasta]} 
                          onChange={(e) => updatePar(pasta, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
