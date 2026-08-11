"use client";
import {useMemo,useRef,useState,useEffect} from "react";
import {ArrowLeft,ArrowRight,Download,ImagePlus,RefreshCw,Upload,Users,UserRound,ZoomIn,ZoomOut} from "lucide-react";
import {toPng} from "html-to-image";
import roleData from "../lib/roles";
import {makeFrame,Member,ImageAdjust} from "../lib/frame";

type Role={name:string;titles:readonly string[]};
const roles=roleData as readonly Role[];
const DEFAULT_CAPTION="I’m framed for Hacker House Goa 2026 🌴\n#FrameInGoa #HackerHouseGoa";
const extras=["ROBOTICS ENGINEER","BLOCKCHAIN DEVELOPER","QA ENGINEER","SITE RELIABILITY ENGINEER","AR/VR DEVELOPER","EMBEDDED ENGINEER","SOLUTIONS ARCHITECT","OPEN SOURCE DEVELOPER","RESEARCH ENGINEER","FIRMWARE ENGINEER","AUTOMATION ENGINEER","DATABASE ENGINEER","NETWORK ENGINEER","TECH LEAD","TECHNICAL PRODUCT MANAGER"];
const allRoles=[...roles,...extras.map(name=>({name,titles:["THE BUILDER","THE SHIPPER","THE TINKERER","THE SYSTEM MAKER"] as const}))];

const emptyMember=(id:number):Member=>({id,name:"",photo:null,adjust:{zoom:1,x:0,y:0}});
function initials(name:string){return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase()||"HH"}

export default function App(){
 const [screen,setScreen]=useState<"home"|"setup"|"people"|"craft"|"adjust"|"preview">("home");
 const [mode,setMode]=useState<"solo"|"team">("solo");
 const [format,setFormat]=useState<"profile"|"post">("profile");
 const [members,setMembers]=useState<Member[]>([emptyMember(1)]);
 const [activeId,setActiveId]=useState(1);
 const [teamName,setTeamName]=useState("");
 const [role,setRole]=useState("AI ENGINEER");
 const [title,setTitle]=useState("THE MODEL WHISPERER");
 const [caption,setCaption]=useState(DEFAULT_CAPTION);
 const [busy,setBusy]=useState(false);
 const [preparedExport,setPreparedExport]=useState<Blob|null>(null);
 const [uploadError,setUploadError]=useState("");
 const [drag,setDrag]=useState<{x:number;y:number}|null>(null);
 const input=useRef<HTMLInputElement>(null);
 const exportRef=useRef<HTMLDivElement>(null);
 const active=members.find(m=>m.id===activeId) || members[0];
 const current=useMemo(()=>allRoles.find(x=>x.name===role)!,[role]);

 useEffect(()=>{
   if(screen!=="preview"||!exportRef.current)return;
   let cancelled=false;
   setPreparedExport(null);
   const timer=window.setTimeout(async()=>{
     try{
       const dataUrl=await toPng(exportRef.current!,{pixelRatio:2,cacheBust:true});
       const blob=await fetch(dataUrl).then(response=>response.blob());
       if(!cancelled)setPreparedExport(blob);
     }catch{if(!cancelled)setPreparedExport(null)}
   },0);
   return()=>{cancelled=true;window.clearTimeout(timer)};
 },[screen,mode,format,teamName,role,title,members]);

 function reset(){setScreen("home");setMode("solo");setFormat("profile");setMembers([emptyMember(1)]);setActiveId(1);setTeamName("");setRole("AI ENGINEER");setTitle("THE MODEL WHISPERER");setCaption(DEFAULT_CAPTION)}
 function go(next:any){setScreen(next)}
 function updateMember(id:number,patch:Partial<Member>){setMembers(ms=>ms.map(m=>m.id===id?{...m,...patch}:m))}
 function updateAdjust(id:number,patch:Partial<ImageAdjust>){setMembers(ms=>ms.map(m=>m.id===id?{...m,adjust:{...m.adjust,...patch}}:m))}
 function pickRole(v:string){setRole(v);const r=allRoles.find(x=>x.name===v)!;setTitle(r.titles[Math.floor(Math.random()*r.titles.length)])}
 function randomTitle(){const a=current.titles;setTitle(a[Math.floor(Math.random()*a.length)])}
 function addMember(){if(members.length>=5)return;const id=Math.max(...members.map(m=>m.id))+1;setMembers(ms=>[...ms,emptyMember(id)]);setActiveId(id)}
 function removeMember(id:number){if(members.length<=1)return;const next=members.filter(m=>m.id!==id);setMembers(next);setActiveId(next[0].id)}
 async function upload(files:FileList|null){
   if(!files)return;
   setUploadError("");
   const chosen=Array.from(files).slice(0,mode==="team"?5:1);
   for(let i=0;i<chosen.length;i++){
     const file=chosen[i];
     try{
       let source:Blob=file;
       if(/image\/hei[cf]/i.test(file.type)||/\.hei[cf]$/i.test(file.name)){
         const {default:heic2any}=await import("heic2any");
         source=await heic2any({blob:file,toType:"image/jpeg",quality:.92}) as Blob;
       }else if(!/image\/(jpeg|png|webp)/i.test(file.type)){
         throw new Error("unsupported");
       }
       const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("read"));r.readAsDataURL(source)});
       if(mode==="solo") updateMember(1,{photo:data});
       else {const target=members[i]||emptyMember(Math.max(...members.map(m=>m.id))+i+1);if(!members[i])setMembers(ms=>[...ms,target]);updateMember(target.id,{photo:data})}
     }catch{setUploadError(`${file.name} could not be read. Try a JPG or PNG photo.`)}
   }
 }
 function startDrag(e:React.PointerEvent){if(!active?.photo)return;setDrag({x:e.clientX-active.adjust.x,y:e.clientY-active.adjust.y});(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}
 function moveDrag(e:React.PointerEvent){if(!drag||!active)return;updateAdjust(active.id,{x:e.clientX-drag.x,y:e.clientY-drag.y})}
 function stopDrag(){setDrag(null)}
 async function renderExport(){
   if(exportRef.current){
     const dataUrl=await toPng(exportRef.current,{pixelRatio:2,cacheBust:true});
     return fetch(dataUrl).then(response=>response.blob());
   }
   return makeFrame({members,displayName:mode==="team"?(teamName||"YOUR TEAM"):(members[0].name||"YOUR NAME"),role,title,mode,format});
 }
 function saveBlob(blob:Blob){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=`frame-in-goa-${format}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
 async function download(){setBusy(true);try{saveBlob(await renderExport())}finally{setBusy(false)}}
 async function share(){
   const builder=mode==="team"?(teamName||"Our team"):(members[0].name||"I");
   const personalized=caption===DEFAULT_CAPTION?`${builder} is framed for Hacker House Goa 2026 🌴\n${role} · ${title}\n#FrameInGoa #HackerHouseGoa`:caption;
   const requiredCaption=personalized.includes("#FrameInGoa")?personalized:`${personalized.trim()}\n#FrameInGoa`;
   const file=preparedExport?new File([preparedExport],`frame-in-goa-${format}.png`,{type:"image/png"}):null;
   const nav=navigator as Navigator & {canShare?: (data?:ShareData)=>boolean};
   if(file&&nav.canShare?.({files:[file]})){
     setBusy(true);
     navigator.share({files:[file],title:`${builder} — Frame in Goa`,text:requiredCaption}).catch(error=>{if((error as DOMException)?.name!=="AbortError")console.error(error)}).finally(()=>setBusy(false));
     return;
   }
   const shareUrl=`https://x.com/intent/post?text=${encodeURIComponent(requiredCaption)}`;
   const desktopWindow=window.open(shareUrl,"_blank","noopener,noreferrer");
   setBusy(true);
   try{
     const blob=await renderExport();
     const file=new File([blob],`frame-in-goa-${format}.png`,{type:"image/png"});
     const nav=navigator as Navigator & {canShare?: (data?:ShareData)=>boolean};
     if(nav.canShare?.({files:[file]})){
       desktopWindow?.close();
       await navigator.share({files:[file],title:`${builder} — Frame in Goa`,text:requiredCaption});
     }else saveBlob(blob);
   }catch(error){
     if((error as DOMException)?.name!=="AbortError") saveBlob(await renderExport());
   }finally{setBusy(false)}
 }

 return <div className="app">
  <Header onHome={()=>reset()} onStart={()=>go("setup")}/>
  {screen==="home"&&<Home onStart={()=>go("setup")}/>}
  {screen!=="home"&&screen!=="preview"&&<WizardTop screen={screen} onBack={()=>screen==="setup"?reset():screen==="people"?go("setup"):screen==="craft"?go("people"):go("craft")}/>}
  {screen==="setup"&&<Setup mode={mode} setMode={setMode} format={format} setFormat={setFormat} next={()=>go("people")}/>}
  {screen==="people"&&<People mode={mode} members={members} activeId={activeId} setActiveId={setActiveId} teamName={teamName} setTeamName={setTeamName} addMember={addMember} removeMember={removeMember} input={input} upload={upload} uploadError={uploadError} updateMember={updateMember} next={()=>go("craft")}/>} 
  {screen==="craft"&&<Craft role={role} pickRole={pickRole} title={title} randomTitle={randomTitle} current={current} next={()=>go("adjust")}/>}
  {screen==="adjust"&&<Adjust mode={mode} members={members} active={active} setActiveId={setActiveId} updateAdjust={updateAdjust} startDrag={startDrag} moveDrag={moveDrag} stopDrag={stopDrag} photoInput={input} upload={upload} next={()=>go("preview")}/>}
  {screen==="preview"&&<Preview members={members} mode={mode} format={format} teamName={teamName} setTeamName={setTeamName} role={role} title={title} caption={caption} setCaption={setCaption} updateMember={updateMember} exportRef={exportRef} busy={busy} download={download} share={share} again={()=>go("adjust")} home={reset}/>} 
  <Doodles/>
  <footer><b>BODHIX × HACKER HOUSE GOA 2026</b><span>28—31 OCT · GOA, INDIA</span><span>#FRAMEINGOA</span></footer>
 </div>
}

function Header({onHome,onStart}:{onHome:()=>void;onStart:()=>void}){return <header><button className="brand" onClick={onHome}><span>HH</span><div>HACKER HOUSE<small>GOA · 2026</small></div></button><div className="team-mark">BODHIX <small>OPEN TRIAL 01</small></div><nav><a href="#event">THE HOUSE</a><a href="#how">HOW IT WORKS</a><button onClick={onStart}>FRAME ME ↗</button></nav></header>}

function Home({onStart}:{onStart:()=>void}){return <main className="home">
 <section className="hero"><div className="hero-copy"><div className="eyebrow">28—31 OCT 2026 · GOA, INDIA</div><div className="hero-kicker">BODHIX PRESENTS · A BUILDER IDENTITY SYSTEM</div><h1>FRAME<br/><em>IN GOA.</em></h1><p>Make the profile picture you’ll use when the build gets serious. Or turn the whole crew into a Goa field poster.</p><button className="primary" onClick={onStart}>CREATE YOUR FRAME <ArrowRight size={18}/></button><div className="hero-meta"><span>NO ACCOUNT</span><span>LIVE PREVIEW</span><span>1200PX EXPORT</span></div></div><HeroIllustration/></section>
 <section id="event" className="manifesto"><div><div className="eyebrow">01 / THE HOUSE</div><h2>BUILD<br/><em>OUTSIDE.</em></h2></div><div className="manifesto-copy"><p>Hacker House Goa is a builder-first gathering where prototypes get real, people get sleep-deprived, and the best ideas tend to arrive somewhere between the beach and a terminal window.</p><p>FrameInGoa is the visual passport: one identity for one builder, or one crew.</p><button className="text-btn" onClick={onStart}>MAKE YOUR BUILDER ID <ArrowRight size={15}/></button></div></section>
 <section id="how" className="ritual"><div className="ritual-head"><div className="eyebrow">02 / THE RITUAL</div><h2>MAKE IT.<br/><em>MAKE IT YOURS.</em></h2></div><div className="ritual-grid"><Step n="01" t="SOLO OR CREW" d="One builder, or up to five people. Pick the format before you upload."/><Step n="02" t="ADJUST THE PHOTO" d="Drag and zoom until the portrait sits exactly where you want it."/><Step n="03" t="TAKE IT OUTSIDE" d="Export a polished 1200px frame for your profile or a tall social post." /></div></section>
 <section className="goa-section"><div className="goa-copy"><div className="eyebrow">GOA / 15.4909° N</div><h2>BEACH.<br/>BYTES.<br/><em>BUILDERS.</em></h2><p>Small visual cues, restrained type, tropical linework. Goa without turning the site into a cartoon.</p></div><HeroIllustration dense/></section>
 </main>}

function Step({n,t,d}:{n:string;t:string;d:string}){return <div className="step"><b>{n}</b><strong>{t}</strong><span>{d}</span></div>}

function Setup({mode,setMode,format,setFormat,next}:any){return <main className="wizard-page"><div className="wizard-title"><div className="eyebrow">01 / START</div><h2>WHO ARE<br/><em>WE FRAMING?</em></h2><p>Choose the identity first. You can change it later.</p></div><div className="option-grid">
 <button className={`choice ${mode==="solo"?"selected":""}`} onClick={()=>setMode("solo")}><UserRound/><small>SOLO</small><strong>ONE BUILDER</strong><span>One portrait, one role, one builder title.</span></button>
 <button className={`choice ${mode==="team"?"selected":""}`} onClick={()=>setMode("team")}><Users/><small>TEAM</small><strong>THE CREW</strong><span>Up to five builders in one shared frame.</span></button>
 </div><div className="format-row"><div><div className="eyebrow">OUTPUT</div><h3>WHERE'S IT GOING?</h3></div><div className="format-buttons"><button className={format==="profile"?"active":""} onClick={()=>setFormat("profile")}>PROFILE PIC <span>1200×1200</span></button><button className={format==="post"?"active":""} onClick={()=>setFormat("post")}>SOCIAL POST <span>1200×1500</span></button></div></div><button className="next-btn" onClick={next}>CONTINUE <ArrowRight/></button></main>}

function People({mode,members,activeId,setActiveId,teamName,setTeamName,addMember,removeMember,input,upload,uploadError,updateMember,next}:any){return <main className="wizard-page people-page"><div className="wizard-title"><div className="eyebrow">02 / PEOPLE</div><h2>{mode==="team"?"BUILD THE":"UPLOAD"}<br/><em>{mode==="team"?"CREW.":"PORTRAIT."}</em></h2><p>{mode==="team"?"Add up to five builders. Every portrait gets a name and a stack before export.":"Add your name and a clear photo. You’ll get full control over positioning next."}</p></div>{mode==="team"&&<input className="team-name" value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="TEAM NAME / OPTIONAL"/>}<div className="member-list">{members.map((m:Member,i:number)=><div className={`member-row ${activeId===m.id?"active":""}`} key={m.id} onClick={()=>setActiveId(m.id)}><div className="member-thumb">{m.photo?<img src={m.photo} alt=""/>:<Upload size={18}/>}</div><div className="member-details"><input className="member-name" value={m.name} onClick={e=>e.stopPropagation()} onChange={e=>updateMember(m.id,{name:e.target.value})} placeholder={mode==="team"?`BUILDER ${String(i+1).padStart(2,"0")} NAME`:"YOUR NAME"} maxLength={32}/><span>{m.photo?"READY TO ADJUST":"PHOTO REQUIRED"}</span></div>{mode==="team"&&members.length>1&&<button onClick={(e)=>{e.stopPropagation();removeMember(m.id)}}>REMOVE</button>}</div>)}</div><div className="people-actions"><button className="upload-btn" onClick={()=>input.current?.click()}><ImagePlus/> {mode==="team"?"UPLOAD / REPLACE PHOTOS":"UPLOAD PHOTO"}</button>{mode==="team"&&members.length<5&&<button className="add-btn" onClick={addMember}>+ ADD BUILDER</button>}<input ref={input} hidden type="file" multiple={mode==="team"} accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files)}/></div>{uploadError&&<p className="upload-error">{uploadError}</p>}<button className="next-btn" disabled={!members.some((m:Member)=>m.photo)&&!members.some((m:Member)=>m.name.trim())} onClick={next}>ADJUST PHOTOS <ArrowRight/></button></main>}

function Craft({role,pickRole,title,randomTitle,current,next}:any){return <main className="wizard-page craft-page"><div className="wizard-title"><div className="eyebrow">03 / CRAFT</div><h2>NAME<br/><em>THE BUILDER.</em></h2><p>Your role shapes the builder title. Keep changing it until it sounds like you.</p></div><label>WHAT DO YOU BUILD?<div className="select-wrap"><select value={role} onChange={e=>pickRole(e.target.value)}>{allRoles.map(r=><option key={r.name}>{r.name}</option>)}</select></div></label><div className="title-card"><span>BUILDER TITLE</span><strong>{title}</strong><button onClick={randomTitle}><RefreshCw size={16}/> CHANGE</button></div><div className="role-note">{current.titles.length} titles in this role family · 100+ roles available</div><button className="next-btn" onClick={next}>ADJUST PHOTO <ArrowRight/></button></main>}

 function Adjust({mode,members,active,setActiveId,updateAdjust,startDrag,moveDrag,stopDrag,photoInput,upload,next}:any){return <main className="adjust-page"><div className="adjust-side"><div className="eyebrow">04 / ADJUST</div><h2>GET THE<br/><em>SHOT RIGHT.</em></h2><p>Drag directly on the portrait. Use the slider for scale. Your exact crop is saved to the final export.</p>{mode==="team"&&<div className="adjust-members">{members.map((m:Member,i:number)=><button className={m.id===active.id?"active":""} onClick={()=>setActiveId(m.id)} key={m.id}>{i+1}</button>)}</div>}<div className="control"><div><span>ZOOM</span><b>{Math.round(active.adjust.zoom*100)}%</b></div><input type="range" min="1" max="2.6" step=".01" value={active.adjust.zoom} onChange={e=>updateAdjust(active.id,{zoom:Number(e.target.value)})}/><div className="range-labels"><ZoomOut size={14}/><ZoomIn size={14}/></div></div><button className="secondary" onClick={()=>updateAdjust(active.id,{zoom:1,x:0,y:0})}>RESET POSITION</button><button className="upload-btn" onClick={()=>photoInput.current?.click()}><Upload/> REPLACE PHOTO</button><input ref={photoInput} hidden type="file" accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files)}/><button className="next-btn" onClick={next}>PREVIEW FRAME <ArrowRight/></button></div><div className="adjust-canvas"><div className="crop-stage"><div className="drag-photo" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} style={{backgroundImage:active.photo?`url(${active.photo})`:undefined,backgroundPosition:`calc(50% + ${active.adjust.x}px) calc(50% + ${active.adjust.y}px)`,backgroundSize:active.adjust.zoom===1?"cover":`auto ${active.adjust.zoom*100}%`}}>{!active.photo&&<span>UPLOAD A PHOTO</span>}</div><div className="crop-ring"></div><span className="drag-label">DRAG TO POSITION</span></div></div></main>}

function Preview({members,mode,format,teamName,setTeamName,role,title,caption,setCaption,updateMember,exportRef,busy,download,share,again,home}:any){const displayName=mode==="team"?(teamName||"Your crew"):(members[0].name||"Your builder");return <main className="preview-page"><div className="preview-copy"><div className="eyebrow">05 / READY</div><h2>LOOKS<br/><em>GOOD.</em></h2><div className="personal-line"><span>{initials(displayName)}</span><label>{mode==="team"?"TEAM NAME":"YOUR NAME"}<input className="preview-name" value={mode==="team"?teamName:members[0].name} onChange={e=>mode==="team"?setTeamName(e.target.value):updateMember(1,{name:e.target.value})} placeholder={mode==="team"?"YOUR TEAM":"YOUR NAME"}/><small>{role} · {title}</small></label></div><label className="caption-label" htmlFor="share-caption">X CAPTION <span>EDIT BEFORE SHARING</span></label><textarea id="share-caption" className="share-caption" value={caption} onChange={e=>setCaption(e.target.value)} rows={4}/><button className="primary" disabled={busy} onClick={download}><Download size={18}/>{busy?"MAKING IT…":"DOWNLOAD PNG"}</button><button className="secondary full" disabled={busy} onClick={share}>𝕏 DOWNLOAD + SHARE TO X</button><p className="share-note">Your PNG downloads first, then X opens with this caption ready. Add the downloaded image to the post.</p><button className="text-btn" onClick={again}><ArrowLeft size={15}/> ADJUST AGAIN</button><button className="text-btn" onClick={home}>START OVER</button></div><FrameVisual exportRef={exportRef} members={members} mode={mode} format={format} teamName={teamName} role={role} title={title}/></main>}

function FrameVisual({exportRef,members,mode,format,teamName,role,title}:any){const displayName=mode==="team"?(teamName||"YOUR TEAM"):(members[0].name||"YOUR NAME");return <div ref={exportRef} className={`frame-visual ${format}`}><div className="frame-personal">BUILT BY <strong>{displayName}</strong></div>{mode==="team"&&<div className="frame-team-label">TEAM / {teamName||"CREW"}</div>}<div className="frame-brand">HACKER<br/>HOUSE</div><div className="frame-sun"></div><div className={`frame-photos count-${members.length}`}>{members.slice(0,5).map((m:Member)=><div className="frame-photo" key={m.id} style={{backgroundImage:m.photo?`url(${m.photo})`:undefined,backgroundPosition:`calc(50% + ${m.adjust.x}px) calc(50% + ${m.adjust.y}px)`,backgroundSize:m.adjust.zoom===1?"cover":`auto ${m.adjust.zoom*100}%`}}/>)}</div><div className="frame-goa">गोवा</div><div className="frame-copy"><small>{mode==="team"?"TEAM":"NAME"}</small><b>{displayName}</b><small>ROLE</small><b>{role}</b><small>BUILDER TITLE</small><b>{title}</b></div><div className="frame-palm">⌁</div><div className="frame-handle">#FrameInGoa</div><div className="frame-year">2026</div></div>}

function WizardTop({screen,onBack}:{screen:string;onBack:()=>void}){return <div className="wizard-top"><button onClick={onBack}><ArrowLeft size={17}/> BACK</button><div>{screen==="setup"?"01":screen==="people"?"02":screen==="craft"?"03":"04"} / FRAME BUILDER</div><span>FRAMEINGOA</span></div>}

function HeroIllustration({dense=false}:{dense?:boolean}){return <div className={"hero-art "+(dense?"dense":"")}><div className="art-sun"></div><div className="art-grid"></div><div className="art-mountain one"></div><div className="art-mountain two"></div><div className="art-ocean"></div><div className="art-palm">⌁</div><div className="art-scooter">○━○</div><div className="art-sticker">GOA<br/><small>BUILD OUTSIDE</small></div><div className="art-doodle">✳</div></div>}

function Doodles(){return <><div className="doodle d1">✳</div><div className="doodle d2">⌁</div><div className="doodle d3">○</div><div className="doodle d4">↗</div></>}
