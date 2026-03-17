"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase"; 
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";
import Link from "next/link"; 

// --- ESTILOS COMPARTIDOS ---
const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "white", marginBottom: "10px", fontSize: "0.9rem" };
const btnStyle = { width: "100%", padding: "12px", backgroundColor: "#fb2424", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", color: "#0f172a", transition: "0.3s" };
const cardStyle = { backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155" };
const navBtn = (active: boolean) => ({ padding: "10px 15px", backgroundColor: active ? "#fb2424" : "#1e293b", color: active ? "#0f172a" : "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", flex: 1 });
const badgeStyle = { fontSize: "0.7rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fb2424", color: "white", marginRight: "5px", textTransform: "uppercase" as const };

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [claveInput, setClaveInput] = useState("");
  const [seccion, setSeccion] = useState("partidos"); 

  const intentarAcceso = () => {
    if (claveInput === "Champions2026*") setAutenticado(true);
    else alert("Contraseña incorrecta");
  };

  if (!autenticado) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "20px", textAlign: "center", border: "1px solid #fb2424", maxWidth: "400px", width: "100%" }}>
          <h2 style={{ color: "white", marginBottom: "20px" }}>🔒 Panel Administrativo</h2>
          <input type="password" placeholder="Contraseña" value={claveInput} onChange={(e) => setClaveInput(e.target.value)} style={inputStyle} />
          <button onClick={intentarAcceso} style={btnStyle}>INGRESAR</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "650px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>⚙️ ADMIN CHAMPIONS</h1>
          <Link href="/">
            <button style={{ backgroundColor: "transparent", border: "1px solid #fb2424", color: "#fb2424", padding: "8px 15px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}>
              🏠 VER TABLA PÚBLICA
            </button>
          </Link>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", backgroundColor: "#1e293b", padding: "10px", borderRadius: "12px" }}>
          <button style={navBtn(seccion === "equipos")} onClick={() => setSeccion("equipos")}>🛡️ EQUIPOS</button>
          <button style={navBtn(seccion === "partidos")} onClick={() => setSeccion("partidos")}>🏆 PARTIDOS</button>
          <button style={navBtn(seccion === "calendario")} onClick={() => setSeccion("calendario")}>📅 CALENDARIO</button>
        </div>

        {seccion === "equipos" && <EquiposComponent />}
        {seccion === "partidos" && <PartidosComponent />}
        {seccion === "calendario" && <CalendarioComponent />}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE EQUIPOS ---
function EquiposComponent() {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("2006");
  const [equipos, setEquipos] = useState<any[]>([]);

  useEffect(() => {
    // Consulta filtrada solo por categoría de año
    const q = query(collection(db, "equipos"), where("categoria", "==", categoria));
    return onSnapshot(q, (snapshot) => setEquipos(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [categoria]);

  const agregar = async () => {
    if (!nombre.trim()) return;
    await addDoc(collection(db, "equipos"), { 
      nombre: nombre.trim(), 
      categoria: categoria, 
      fechaCreacion: new Date().toISOString() 
    });
    setNombre("");
  };

  return (
    <div>
      <h2 style={{ color: "#fb2424", textAlign: "center", marginBottom: "20px" }}>GESTIÓN DE CLUBES</h2>
      <div style={cardStyle}>
        <label style={{fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '5px'}}>Seleccionar Año:</label>
        <select style={inputStyle} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="2006">2006</option>
          <option value="2007">2007</option>
          <option value="2008">2008</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="Nombre del equipo..." value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <button onClick={agregar} style={{ ...btnStyle, width: "auto" }}>REGISTRAR</button>
      </div>
      <div style={cardStyle}>
        {equipos.length === 0 && <p style={{textAlign: 'center', color: '#64748b'}}>No hay equipos en esta categoría</p>}
        {equipos.map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #334155" }}>
            <span>{e.nombre}</span>
            <button onClick={() => deleteDoc(doc(db, "equipos", e.id))} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE PARTIDOS ---
function PartidosComponent() {
  const [categoria, setCategoria] = useState("2006");
  const [equipos, setEquipos] = useState<string[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [partido, setPartido] = useState({ local: "", visitante: "", golesLocal: "", golesVisitante: "", goleadoresLocal: "", goleadoresVisitante: "", mvp: "" });

  useEffect(() => {
    const qE = query(collection(db, "equipos"), where("categoria", "==", categoria));
    onSnapshot(qE, (s) => setEquipos(s.docs.map(d => d.data().nombre)));
    
    const qP = query(collection(db, "partidos"), where("categoria", "==", categoria), orderBy("fecha", "desc"));
    onSnapshot(qP, (s) => setPartidos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [categoria]);

  const guardar = async () => {
    if (!partido.local || !partido.visitante) return alert("Selecciona los equipos");
    await addDoc(collection(db, "partidos"), { 
        ...partido, 
        categoria: categoria, 
        golesLocal: Number(partido.golesLocal || 0),
        golesVisitante: Number(partido.golesVisitante || 0),
        fecha: new Date().toISOString() 
    });
    setPartido({ local: "", visitante: "", golesLocal: "", golesVisitante: "", goleadoresLocal: "", goleadoresVisitante: "", mvp: "" });
  };

  return (
    <div>
      <h2 style={{ color: "#fb2424", textAlign: "center", marginBottom: "20px" }}>REGISTRAR RESULTADO</h2>
      <select style={inputStyle} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="2006">Año 2006</option>
        <option value="2007">Año 2007</option>
        <option value="2008">Año 2008</option>
      </select>
      
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
          <select style={inputStyle} value={partido.local} onChange={(e) => setPartido({...partido, local: e.target.value})}><option value="">Local</option>{equipos.map(n => <option key={n} value={n}>{n}</option>)}</select>
          <span style={{ fontWeight: "bold" }}>VS</span>
          <select style={inputStyle} value={partido.visitante} onChange={(e) => setPartido({...partido, visitante: e.target.value})}><option value="">Visitante</option>{equipos.map(n => <option key={n} value={n}>{n}</option>)}</select>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "15px", gap: "20px" }}>
           <div style={{textAlign: 'center'}}>
             <span style={{fontSize: '0.7rem', color: '#94a3b8'}}>GOLES L</span>
             <input type="number" style={{...inputStyle, width: "70px", backgroundColor: "#fb2424", color: "white", fontSize: "1.2rem", textAlign: "center", marginBottom: 0}} value={partido.golesLocal} onChange={(e) => setPartido({...partido, golesLocal: e.target.value})}/>
           </div>
           <div style={{textAlign: 'center'}}>
             <span style={{fontSize: '0.7rem', color: '#94a3b8'}}>GOLES V</span>
             <input type="number" style={{...inputStyle, width: "70px", backgroundColor: "#fb2424", color: "white", fontSize: "1.2rem", textAlign: "center", marginBottom: 0}} value={partido.golesVisitante} onChange={(e) => setPartido({...partido, golesVisitante: e.target.value})}/>
           </div>
        </div>
        <input style={inputStyle} placeholder="Goleadores Local (Ej: Juan(2), Pedro)" value={partido.goleadoresLocal} onChange={(e) => setPartido({...partido, goleadoresLocal: e.target.value})} />
        <input style={inputStyle} placeholder="Goleadores Visitante" value={partido.goleadoresVisitante} onChange={(e) => setPartido({...partido, goleadoresVisitante: e.target.value})} />
        <input style={inputStyle} placeholder="MVP del Partido" value={partido.mvp} onChange={(e) => setPartido({...partido, mvp: e.target.value})} />
        <button onClick={guardar} style={btnStyle}>PUBLICAR RESULTADO</button>
      </div>

      <div style={{marginTop: "20px"}}>
        {partidos.map(p => (
           <div key={p.id} style={{...cardStyle, marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
             <div>
               <div style={{fontWeight: "bold"}}>{p.local} <span style={{color: "#fb2424"}}>{p.golesLocal} - {p.golesVisitante}</span> {p.visitante}</div>
               <div style={{fontSize: "0.8rem", color: "#94a3b8"}}>⚽ {p.goleadoresLocal} {p.goleadoresVisitante}</div>
               {p.mvp && <div style={{fontSize: "0.8rem", color: "#fb2424"}}>⭐ MVP: {p.mvp}</div>}
             </div>
             <button onClick={() => deleteDoc(doc(db, "partidos", p.id))} style={{color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: "bold"}}>Borrar</button>
           </div>
        ))}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE CALENDARIO ---
function CalendarioComponent() {
  const [categoria, setCategoria] = useState("2006");
  const [equipos, setEquipos] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ local: "", visitante: "", fecha: "", hora: "" });

  useEffect(() => {
    const qE = query(collection(db, "equipos"), where("categoria", "==", categoria));
    onSnapshot(qE, (s) => setEquipos(s.docs.map(d => d.data().nombre)));
    
    const qC = query(collection(db, "calendario"), where("categoria", "==", categoria), orderBy("fecha", "asc"));
    onSnapshot(qC, (s) => setEventos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [categoria]);

  const agendar = async () => {
    if (!nuevo.local || !nuevo.visitante || !nuevo.fecha || !nuevo.hora) return alert("Completa todos los datos");
    await addDoc(collection(db, "calendario"), { ...nuevo, categoria: categoria });
    setNuevo({ local: "", visitante: "", fecha: "", hora: "" });
  };

  return (
    <div>
      <h2 style={{ color: "#fb2424", textAlign: "center", marginBottom: "20px" }}>PROGRAMACIÓN</h2>
      <select style={inputStyle} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="2006">Año 2006</option>
        <option value="2007">Año 2007</option>
        <option value="2008">Año 2008</option>
      </select>
      
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <select style={{...inputStyle, marginBottom: 0}} value={nuevo.local} onChange={(e) => setNuevo({...nuevo, local: e.target.value})}><option value="">Local</option>{equipos.map(n => <option key={n} value={n}>{n}</option>)}</select>
          <select style={{...inputStyle, marginBottom: 0}} value={nuevo.visitante} onChange={(e) => setNuevo({...nuevo, visitante: e.target.value})}><option value="">Visitante</option>{equipos.map(n => <option key={n} value={n}>{n}</option>)}</select>
        </div>
        <input type="date" style={inputStyle} value={nuevo.fecha} onChange={(e) => setNuevo({...nuevo, fecha: e.target.value})} />
        <input type="time" style={inputStyle} value={nuevo.hora} onChange={(e) => setNuevo({...nuevo, hora: e.target.value})} />
        <button onClick={agendar} style={btnStyle}>AGENDAR PARTIDO</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {eventos.map(ev => (
          <div key={ev.id} style={{ ...cardStyle, marginBottom: "10px", borderLeft: "4px solid #fb2424" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={badgeStyle}>CAT. {ev.categoria}</span>
                <div style={{ fontWeight: "bold", marginTop: '5px' }}>{ev.local} vs {ev.visitante}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>
                  📅 {ev.fecha} | 🕒 {ev.hora}
                </div>
              </div>
              <button onClick={() => deleteDoc(doc(db, "calendario", ev.id))} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>✖</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}