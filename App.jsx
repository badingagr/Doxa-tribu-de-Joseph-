import React, { useEffect, useMemo, useState } from "react";

const C = {
  bg: "#F5EFE4", bgCard: "#FFFFFF", brownDark: "#3D2314", brown: "#6B4226",
  brownMed: "#8B5A2B", brownLight: "#C9A876", tan: "#E8DCC4",
  accent: "#A8632E", danger: "#A83232", ok: "#4B7A3E", text: "#2B1A10",
  textSoft: "#6B5544"
};
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const todayISO = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36);
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return isNaN(d) ? iso : `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

function loadKey(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveKey(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error("Erreur stockage", e); }
}

const initial = {
  members: [], events: [], prayer24: [], gems: [], issues: [], visits: [], agenda: [],
  settings: { patriarche: "", orgName: "Gestion Tribu de Joseph" }
};

function Btn({children,onClick,variant="solid",small=false,disabled=false,type="button"}) {
  return <button type={type} disabled={disabled} onClick={onClick}
    className={`btn btn-${variant} ${small ? "btn-small":""}`}>{children}</button>;
}
function Input(props){ return <input {...props} className={`input ${props.className||""}`}/>; }
function Select(props){ return <select {...props} className={`input ${props.className||""}`}/>; }
function TextArea(props){ return <textarea {...props} className={`input textarea ${props.className||""}`}/>; }
function Field({label,children}){ return <label className="field"><span>{label}</span>{children}</label>; }
function Badge({children,tone="brown"}){ return <span className={`badge badge-${tone}`}>{children}</span>; }

function Modal({title,onClose,children,wide=false}) {
  return <div className="modal-backdrop" onClick={onClose}>
    <div className={`modal ${wide ? "modal-wide":""}`} onClick={e=>e.stopPropagation()}>
      <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}>✕</button></div>
      {children}
    </div>
  </div>;
}

const emptyMember = () => ({
  id:null, nom:"", prenom:"", tel:"", anniversaire:"", situation:"Célibataire",
  profession:"", adresse:"", bapteme:"Non", academie:"Non", departement:"Non",
  etat:"Actif", dateAjout:todayISO()
});

function App(){
  const [loaded,setLoaded] = useState(false);
  const [tab,setTab] = useState("dashboard");
  const [menuOpen,setMenuOpen] = useState(false);
  const [members,setMembers] = useState([]);
  const [events,setEvents] = useState([]);
  const [prayer24,setPrayer24] = useState([]);
  const [gems,setGems] = useState([]);
  const [issues,setIssues] = useState([]);
  const [visits,setVisits] = useState([]);
  const [agenda,setAgenda] = useState([]);
  const [settings,setSettings] = useState(initial.settings);

  useEffect(()=>{
    setMembers(loadKey("members",[])); setEvents(loadKey("events",[]));
    setPrayer24(loadKey("prayer24",[])); setGems(loadKey("gems",[]));
    setIssues(loadKey("issues",[])); setVisits(loadKey("visits",[]));
    setAgenda(loadKey("agenda",[])); setSettings(loadKey("settings",initial.settings));
    setLoaded(true);
  },[]);
  useEffect(()=>{if(loaded)saveKey("members",members)},[members,loaded]);
  useEffect(()=>{if(loaded)saveKey("events",events)},[events,loaded]);
  useEffect(()=>{if(loaded)saveKey("prayer24",prayer24)},[prayer24,loaded]);
  useEffect(()=>{if(loaded)saveKey("gems",gems)},[gems,loaded]);
  useEffect(()=>{if(loaded)saveKey("issues",issues)},[issues,loaded]);
  useEffect(()=>{if(loaded)saveKey("visits",visits)},[visits,loaded]);
  useEffect(()=>{if(loaded)saveKey("agenda",agenda)},[agenda,loaded]);
  useEffect(()=>{if(loaded)saveKey("settings",settings)},[settings,loaded]);

  const notifications = useMemo(()=>{
    const list=[]; const now=new Date(); const month=now.getMonth();
    members.forEach(m=>{
      if(m.anniversaire){
        const d=new Date(m.anniversaire+"T00:00:00");
        if(!isNaN(d) && d.getMonth()===month)
          list.push({id:"b-"+m.id,text:`🎂 ${m.prenom} ${m.nom} — anniversaire le ${d.getDate()} ${MONTHS[month]}`});
      }
    });
    issues.filter(x=>!x.resolved).forEach(i=>{
      const m=members.find(x=>x.id===i.memberId);
      list.push({id:"i-"+i.id,text:`⚠️ ${m ? m.prenom+" "+m.nom : "Membre"} — ${i.type} (${fmtDate(i.date)})`});
    });
    return list;
  },[members,issues]);

  if(!loaded) return <div className="loading">Chargement…</div>;

  const tabs=[
    ["dashboard","🏠","Accueil"],["membres","👥","Membres"],["evenements","📅","Événements"],
    ["priere24","🙏","Prière 24"],["gem","🏡","Familles GEM"],["visites","🚗","Visites"],
    ["agenda","🗓️","Agenda"],["parametres","⚙️","Paramètres"]
  ];
  const go=t=>{setTab(t);setMenuOpen(false)};

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="logo">TJ</div><div><b>{settings.orgName}</b><small>Communauté chrétienne</small></div></div>
      <button className="menu-button" onClick={()=>setMenuOpen(!menuOpen)}>☰</button>
    </header>
    {menuOpen && <nav className="nav">{tabs.map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>go(id)}>{icon} {label}</button>)}</nav>}
    {notifications.length>0 && <div className="notice">🔔 {notifications.length} notification(s)</div>}
    <main>
      {tab==="dashboard" && <Dashboard members={members} events={events} notifications={notifications} go={go}/>}
      {tab==="membres" && <Members members={members} setMembers={setMembers}/>}
      {tab==="evenements" && <Events events={events} setEvents={setEvents} members={members}/>}
      {tab==="priere24" && <Prayer items={prayer24} setItems={setPrayer24} members={members}/>}
      {tab==="gem" && <Gems items={gems} setItems={setGems} members={members}/>}
      {tab==="visites" && <Visits items={visits} setItems={setVisits} members={members}/>}
      {tab==="agenda" && <Agenda items={agenda} setItems={setAgenda}/>}
      {tab==="parametres" && <Settings settings={settings} setSettings={setSettings}/>}
    </main>
  </div>;
}

function Dashboard({members,events,notifications,go}){
  const stats=[["Membres",members.length,"membres"],["Actifs",members.filter(m=>m.etat==="Actif").length,"membres"],["Événements",events.length,"evenements"]];
  return <section>
    <h1>Tableau de bord</h1>
    <div className="stats">{stats.map(([l,v,t])=><button key={l} className="stat" onClick={()=>go(t)}><strong>{v}</strong><span>{l}</span></button>)}</div>
    <div className="card"><h2>Notifications</h2>{notifications.length?<ul className="list">{notifications.map(n=><li key={n.id}>{n.text}</li>)}</ul>:<Empty text="Aucune notification pour le moment."/>}</div>
    <div className="card"><h2>Bienvenue</h2><p>Utilise le menu pour gérer les membres, les événements, la prière, les familles GEM, les visites et l’agenda.</p><p className="muted">Les données sont actuellement enregistrées localement dans le navigateur.</p></div>
  </section>;
}

function Empty({text}){return <div className="empty">{text}</div>}

function Members({members,setMembers}){
  const [editing,setEditing]=useState(null),[search,setSearch]=useState(""),[filter,setFilter]=useState("Tous");
  const filtered=members.filter(m=>(!search||(m.nom+" "+m.prenom).toLowerCase().includes(search.toLowerCase()))&&(filter==="Tous"||m.etat===filter));
  const save=m=>{setMembers(m.id?members.map(x=>x.id===m.id?m:x):[...members,{...m,id:uid()}]);setEditing(null)};
  const remove=id=>{if(confirm("Supprimer ce membre ?"))setMembers(members.filter(m=>m.id!==id))};
  return <section>
    <div className="section-head"><h1>Membres ({members.length})</h1><Btn onClick={()=>setEditing(emptyMember())}>+ Ajouter</Btn></div>
    <div className="filters"><Input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}/><Select value={filter} onChange={e=>setFilter(e.target.value)}><option>Tous</option><option>Actif</option><option>Inactif</option></Select></div>
    <div className="card">
      {filtered.length===0?<Empty text="Aucun membre trouvé."/>:filtered.map(m=><div className="row" key={m.id}>
        <div><b>{m.prenom} {m.nom}</b><div className="muted">{m.tel||"—"} · {m.situation} · {m.profession||"—"}</div><div className="badges"><Badge tone={m.etat==="Actif"?"ok":"danger"}>{m.etat}</Badge>{m.bapteme==="Oui"&&<Badge>Baptisé</Badge>}{m.academie==="Oui"&&<Badge>Académie</Badge>}</div></div>
        <div className="actions"><button className="icon-btn" onClick={()=>setEditing(m)}>✏️</button><button className="icon-btn danger-icon" onClick={()=>remove(m.id)}>🗑️</button></div>
      </div>)}
    </div>
    {editing&&<MemberForm m={editing} onCancel={()=>setEditing(null)} onSave={save}/>}
  </section>;
}

function MemberForm({m,onCancel,onSave}){
  const [f,setF]=useState({...m}); const set=k=>e=>setF({...f,[k]:e.target.value});
  return <Modal title={f.id?"Modifier le membre":"Ajouter un membre"} onClose={onCancel} wide>
    <div className="grid2">
      <Field label="Nom"><Input value={f.nom} onChange={set("nom")}/></Field><Field label="Prénom"><Input value={f.prenom} onChange={set("prenom")}/></Field>
      <Field label="Téléphone"><Input value={f.tel} onChange={set("tel")}/></Field><Field label="Anniversaire"><Input type="date" value={f.anniversaire} onChange={set("anniversaire")}/></Field>
      <Field label="Situation"><Select value={f.situation} onChange={set("situation")}><option>Célibataire</option><option>Fiancé(e)</option><option>Marié(e)</option><option>Veuf/Veuve</option></Select></Field>
      <Field label="Profession"><Input value={f.profession} onChange={set("profession")}/></Field>
      <Field label="État"><Select value={f.etat} onChange={set("etat")}><option>Actif</option><option>Inactif</option></Select></Field>
      <Field label="Baptême"><Select value={f.bapteme} onChange={set("bapteme")}><option>Non</option><option>Oui</option></Select></Field>
      <Field label="Académie"><Select value={f.academie} onChange={set("academie")}><option>Non</option><option>Oui</option></Select></Field>
      <Field label="Département"><Select value={f.departement} onChange={set("departement")}><option>Non</option><option>Oui</option></Select></Field>
    </div>
    <Field label="Adresse"><TextArea value={f.adresse} onChange={set("adresse")}/></Field>
    <div className="modal-actions"><Btn variant="ghost" onClick={onCancel}>Annuler</Btn><Btn onClick={()=>f.nom&&f.prenom?onSave(f):alert("Nom et prénom requis")}>Enregistrer</Btn></div>
  </Modal>;
}

function Events({events,setEvents,members}){
  const [form,setForm]=useState(null);
  const save=e=>{setEvents(e.id?events.map(x=>x.id===e.id?e:x):[...events,{...e,id:uid()}]);setForm(null)};
  const remove=id=>{if(confirm("Supprimer cet événement ?"))setEvents(events.filter(e=>e.id!==id))};
  return <section><div className="section-head"><h1>Événements ({events.length})</h1><Btn onClick={()=>setForm({id:null,title:"",date:todayISO(),lieu:"",description:""})}>+ Ajouter</Btn></div>
    <div className="card">{events.length===0?<Empty text="Aucun événement enregistré."/>:events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=><div className="row" key={e.id}><div><b>{e.title}</b><div className="muted">📅 {fmtDate(e.date)} · 📍 {e.lieu||"—"}</div><div>{e.description}</div></div><div className="actions"><button className="icon-btn" onClick={()=>setForm(e)}>✏️</button><button className="icon-btn danger-icon" onClick={()=>remove(e.id)}>🗑️</button></div></div>)}</div>
    {form&&<Modal title={form.id?"Modifier l’événement":"Ajouter un événement"} onClose={()=>setForm(null)}><EventForm value={form} onSave={save} onCancel={()=>setForm(null)}/></Modal>}
  </section>;
}
function EventForm({value,onSave,onCancel}){const [f,setF]=useState({...value});const set=k=>e=>setF({...f,[k]:e.target.value});return <><Field label="Titre"><Input value={f.title} onChange={set("title")}/></Field><Field label="Date"><Input type="date" value={f.date} onChange={set("date")}/></Field><Field label="Lieu"><Input value={f.lieu} onChange={set("lieu")}/></Field><Field label="Description"><TextArea value={f.description} onChange={set("description")}/></Field><div className="modal-actions"><Btn variant="ghost" onClick={onCancel}>Annuler</Btn><Btn onClick={()=>f.title?onSave(f):alert("Titre requis")}>Enregistrer</Btn></div></>}

function Prayer({items,setItems,members}){
  const [form,setForm]=useState(null);
  const save=x=>{setItems(x.id?items.map(i=>i.id===x.id?x:i):[...items,{...x,id:uid()}]);setForm(null)};
  const remove=id=>{if(confirm("Supprimer cette prière ?"))setItems(items.filter(x=>x.id!==id))};
  return <section><div className="section-head"><h1>Prière 24 ({items.length})</h1><Btn onClick={()=>setForm({id:null,date:todayISO(),theme:"",responsable:"",notes:""})}>+ Ajouter</Btn></div><div className="card">{items.length===0?<Empty text="Aucune séance enregistrée."/>:items.map(x=><div className="row" key={x.id}><div><b>{x.theme||"Séance de prière"}</b><div className="muted">📅 {fmtDate(x.date)} · 🙏 {x.responsable||"—"}</div><div>{x.notes}</div></div><div className="actions"><button className="icon-btn" onClick={()=>setForm(x)}>✏️</button><button className="icon-btn danger-icon" onClick={()=>remove(x.id)}>🗑️</button></div></div>)}</div>{form&&<Modal title="Prière 24" onClose={()=>setForm(null)}><PrayerForm value={form} onSave={save} onCancel={()=>setForm(null)}/></Modal>}</section>;
}
function PrayerForm({value,onSave,onCancel}){const [f,setF]=useState({...value});const set=k=>e=>setF({...f,[k]:e.target.value});return <><Field label="Date"><Input type="date" value={f.date} onChange={set("date")}/></Field><Field label="Thème"><Input value={f.theme} onChange={set("theme")}/></Field><Field label="Responsable"><Input value={f.responsable} onChange={set("responsable")}/></Field><Field label="Notes / sujets"><TextArea value={f.notes} onChange={set("notes")}/></Field><div className="modal-actions"><Btn variant="ghost" onClick={onCancel}>Annuler</Btn><Btn onClick={()=>onSave(f)}>Enregistrer</Btn></div></>}

function Gems({items,setItems,members}){
  const [form,setForm]=useState(null);
  const save=x=>{setItems(x.id?items.map(i=>i.id===x.id?x:i):[...items,{...x,id:uid()}]);setForm(null)};
  const remove=id=>{if(confirm("Supprimer cette famille GEM ?"))setItems(items.filter(x=>x.id!==id))};
  return <section><div className="section-head"><h1>Familles GEM ({items.length})</h1><Btn onClick={()=>setForm({id:null,nom:"",responsable:"",membres:"",telephone:"",lieu:"",notes:""})}>+ Ajouter</Btn></div><div className="card">{items.length===0?<Empty text="Aucune famille GEM enregistrée."/>:items.map(x=><div className="row" key={x.id}><div><b>🏡 {x.nom||"Famille GEM"}</b><div className="muted">Responsable : {x.responsable||"—"} · {x.telephone||"—"}</div><div>{x.membres}</div><div className="muted">📍 {x.lieu||"—"}</div></div><div className="actions"><button className="icon-btn" onClick={()=>setForm(x)}>✏️</button><button className="icon-btn danger-icon" onClick={()=>remove(x.id)}>🗑️</button></div></div>)}</div>{form&&<Modal title="Famille GEM" onClose={()=>setForm(null)} wide><GemForm value={form} onSave={save} onCancel={()=>setForm(null)}/></Modal>}</section>;
}
function GemForm({value,onSave,onCancel}){const [f,setF]=useState({...value});const set=k=>e=>setF({...f,[k]:e.target.value});return <><div className="grid2"><Field label="Nom"><Input value={f.nom} onChange={set("nom")}/></Field><Field label="Responsable"><Input value={f.responsable} onChange={set("responsable")}/></Field><Field label="Téléphone"><Input value={f.telephone} onChange={set("telephone")}/></Field><Field label="Lieu"><Input value={f.lieu} onChange={set("lieu")}/></Field></div><Field label="Membres"><TextArea value={f.membres} onChange={set("membres")} placeholder="Noms des membres…"/></Field><Field label="Notes"><TextArea value={f.notes} onChange={set("notes")}/></Field><div className="modal-actions"><Btn variant="ghost" onClick={onCancel}>Annuler</Btn><Btn onClick={()=>onSave(f)}>Enregistrer</Btn></div></>}

function Visits({items,setItems,members}){
  const [form,setForm]=useState(null);
  const save=x=>{setItems(x.id?items.map(i=>i.id===x.id?x:i):[...items,{...x,id:uid()}]);setForm(null)};
  const remove=id=>{if(confirm("Supprimer cette visite ?"))setItems(items.filter(x=>x.id!==id))};
  return <section><div className="section-head"><h1>Visites ({items.length})</h1><Btn onClick={()=>setForm({id:null,date:todayISO(),personne:"",motif:"",visiteur:"",compteRendu:""})}>+ Ajouter</Btn></div><div className="card">{items.length===0?<Empty text="Aucune visite enregistrée."/>:items.map(x=><div className="row" key={x.id}><div><b>🚗 {x.personne||"Visite"}</b><div className="muted">📅 {fmtDate(x.date)} · 👤 {x.visiteur||"—"} · {x.motif||"—"}</div><div>{x.compteRendu}</div></div><div className="actions"><button className="icon-btn" onClick={()=>setForm(x)}>✏️</button><button className="icon-btn danger-icon" onClick={()=>remove(x.id)}>🗑️</button></div></div>)}</div>{form&&<Modal title="Visite" onClose={()=>setForm(null)}><VisitForm value={form} onSave={save} onCancel={()=>setForm(null)}/></Modal>}</section>;
}
function VisitForm({value,onSave,onCancel}){const [f,setF]=useState({...value});const set=k=>e=>setF({...f,[k]:e.target.value});return <><Field label="Date"><Input type="date" value={f.date} onChange={set("date")}/></Field><Field label="Personne visitée"><Input value={f.personne} onChange={set("personne")}/></Field><Field label="Motif"><Input value={f.motif} onChange={set("motif")}/></Field><Field label="Visiteur"><Input value={f.visiteur} onChange={set("visiteur")}/></Field><Field label="Compte rendu"><TextArea value={f.compteRendu} onChange={set("compteRendu")}/></Field><div className="modal-actions"><Btn variant="ghost" onClick={onCancel}>Annuler</Btn><Btn onClick={()=>onSave(f)}>Enregistrer</Btn></div></>}

function Agenda({items,setItems}){
  const [form,setForm]=useState(null);
  const save=x=>{setItems(x.id?items.map(i=>i.id===x.id?x:i):[...items,{...x,id:uid()}]);setForm(null)};
  const remove=id=>{if(confirm("Supprimer ce rendez-vous ?"))setItems(items.filter(x=>x.id!==id))};
  return <section><div className="section-head"><h1>Agenda ({items.length})</h1><Btn onClick={()=>setForm({id:null,date:todayISO(),heure:"",titre:"",lieu:"",notes:""})}>+ Ajouter</Btn></div><div className="card">{items.length===0?<Empty text="Agenda vide."/>:items.slice().sort((a,b)=>(a.date+a.heure).localeCompare(b.date+b.heure)).map(x=><div className="row" key={x.id}><div><b>🗓️ {x.titre||"Rendez-vous"}</b><div className="muted">📅 {fmtDate(x.date)} {x.heure&&"à "+x.heure} · 📍 {x.lieu||"—"}</div><div>{x.notes}</div></div><div className="actions"><button className="icon-btn" onClick={()=>setForm(x)}>✏️</button><button className="icon-btn danger-icon" onClick={()=>remove(x.id)}>🗑️</button></div></div>)}</div>{form&&<Modal title="Agenda" onClose={()=>setForm(null)}><AgendaForm value={form} onSave={save} onCancel={()=>setForm(null)}/></Modal>}</section>;
}
function AgendaForm({value,onSave,onCancel}){const [f,setF]=useState({...value});const set=k=>e=>setF({...f,[k]:e.target.value});return <><Field label="Date"><Input type="date" value={f.date} onChange={set("date")}/></Field><Field label="Heure"><Input type="time" value={f.heure} onChange={set("heure")}/></Field><Field label="Titre"><Input value={f.titre} onChange={set("titre")}/></Field><Field label="Lieu"><Input value={f.lieu} onChange={set("lieu")}/></Field><Field label="Notes"><TextArea value={f.notes} onChange={set("notes")}/></Field><div className="modal-actions"><Btn variant="ghost" onClick={onCancel}>Annuler</Btn><Btn onClick={()=>onSave(f)}>Enregistrer</Btn></div></>}

function Settings({settings,setSettings}){
  const [f,setF]=useState(settings); const save=()=>setSettings(f);
  const reset=()=>{if(confirm("Effacer toutes les données locales de cette application ?")){["members","events","prayer24","gems","issues","visits","agenda","settings"].forEach(k=>localStorage.removeItem(k));location.reload()}};
  return <section><h1>Paramètres</h1><div className="card"><Field label="Nom de l'organisation"><Input value={f.orgName} onChange={e=>setF({...f,orgName:e.target.value})}/></Field><Field label="Patriarche / responsable"><Input value={f.patriarche} onChange={e=>setF({...f,patriarche:e.target.value})}/></Field><Btn onClick={save}>Enregistrer les paramètres</Btn></div><div className="card"><h2>Données</h2><p className="muted">Les données de cette version sont stockées dans le navigateur avec localStorage. Elles ne sont pas encore synchronisées entre plusieurs téléphones.</p><Btn variant="danger" onClick={reset}>Réinitialiser les données locales</Btn></div></section>;
}

export default App;
