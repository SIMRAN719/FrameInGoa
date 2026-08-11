export type ImageAdjust = { zoom:number; x:number; y:number };
export type Member = { id:number; name:string; photo:string|null; adjust:ImageAdjust };
export type FrameData = {
  members:Member[];
  displayName:string;
  role:string;
  title:string;
  mode:"solo"|"team";
  format:"profile"|"post";
};

function load(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src})}
function rr(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){g.beginPath();g.roundRect(x,y,w,h,r)}
function text(g:CanvasRenderingContext2D,s:string,x:number,y:number,size:number,font:string,fill:string,align:CanvasTextAlign="left"){
  g.fillStyle=fill;g.font=font;g.textAlign=align;g.textBaseline="middle";g.fillText(s,x,y)
}
function drawPixelBorder(g:CanvasRenderingContext2D,w:number,h:number){
  g.strokeStyle="#d5e39d";g.lineWidth=5;g.strokeRect(34,34,w-68,h-68);
  g.strokeStyle="#9bbd4a";g.lineWidth=2;g.strokeRect(49,49,w-98,h-98);
  g.fillStyle="#ffd31c";
  for(let x=58;x<w-58;x+=34){g.fillRect(x,22,13,7);g.fillRect(x,h-29,13,7)}
  for(let y=58;y<h-58;y+=34){g.fillRect(22,y,7,13);g.fillRect(w-29,y,7,13)}
}
async function drawPhoto(g:CanvasRenderingContext2D,m:Member,cx:number,cy:number,r:number){
  g.save();g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.clip();
  if(m.photo){
    const i=await load(m.photo), a=m.adjust;
    const base=Math.max((r*2)/i.width,(r*2)/i.height), scale=base*a.zoom;
    const iw=i.width*scale, ih=i.height*scale;
    g.drawImage(i,cx-iw/2+a.x,cy-ih/2+a.y,iw,ih);
  }else{g.fillStyle="#dce7dc";g.fillRect(cx-r,cy-r,r*2,r*2)}
  g.restore();
  g.strokeStyle="#b0cd62";g.lineWidth=15;g.beginPath();g.arc(cx,cy,r+4,0,Math.PI*2);g.stroke();
  g.strokeStyle="#053f29";g.lineWidth=4;g.beginPath();g.arc(cx,cy,r+18,0,Math.PI*2);g.stroke();
}
export async function makeFrame(d:FrameData){
  const W=d.format==="profile"?1200:1200, H=d.format==="profile"?1200:1500;
  const c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d")!;
  const green="#08643d",deep="#053f29",yellow="#ffd31c",pink="#f24d70",cream="#eef1d7",lime="#b0cd62",blue="#0e7066";
  const isPost=d.format==="post";
  g.fillStyle=isPost?deep:green;g.fillRect(0,0,W,H);
  if(isPost){g.fillStyle=green;g.fillRect(62,280,W-124,H-540);}
  // quiet paper-like pixel field
  g.globalAlpha=.12;g.fillStyle=lime;
  for(let y=0;y<H;y+=28)for(let x=0;x<W;x+=28)if((x/28+y/28)%4===0)g.fillRect(x+4,y+4,5,5);
  g.globalAlpha=1;
  drawPixelBorder(g,W,H);

  // editorial top line
  text(g,d.mode==="team"?"HH / TEAM PASS":"HH / BUILDER PASS",72,86,18,"700 18px monospace",cream);
  text(g,d.format==="profile"?"GOA / 2026":"GOA / 28—31 OCT 2026",W-72,86,16,"700 16px monospace",yellow,"right");

  text(g,"HACKER HOUSE",isPost?92:W/2,isPost?155:165,isPost?56:64,`700 ${isPost?56:64}px Georgia`,yellow,isPost?"left":"center");

  // sunset / graphic arc
  g.strokeStyle="#f24d70";g.lineWidth=9;g.beginPath();g.arc(W-120,120,86,Math.PI*.2,Math.PI*1.55);g.stroke();
  g.fillStyle=yellow;g.beginPath();g.arc(W-120,120,52,0,Math.PI*2);g.fill();

  const isTeam=d.mode==="team" && d.members.length>1;
  if(!isTeam){
    await drawPhoto(g,d.members[0],W/2,d.format==="profile"?555:635,isPost?275:255);
  }else{
    const count=Math.min(d.members.length,5);
    const centers = count===2 ? [[W*.38,690],[W*.62,690]] :
      count===3 ? [[W*.5,575],[W*.34,720],[W*.66,720]] :
      count===4 ? [[W*.36,585],[W*.64,585],[W*.36,750],[W*.64,750]] :
      [[W*.5,560],[W*.31,690],[W*.69,690],[W*.39,825],[W*.61,825]];
    for(let i=0;i<count;i++) await drawPhoto(g,d.members[i],centers[i][0],centers[i][1],175);
  }

  // Goa label
  rr(g,W-265,(d.format==="profile"?665:730),175,88,24);g.fillStyle=pink;g.fill();g.strokeStyle=cream;g.lineWidth=4;g.stroke();
  text(g,"गोवा",W-177,(d.format==="profile"?709:774),34,"700 34px Georgia",cream,"center");

  // beach line art
  g.strokeStyle="#79a95d";g.lineWidth=4;g.beginPath();g.moveTo(70,H-210);g.quadraticCurveTo(W*.28,H-260,W*.52,H-205);g.quadraticCurveTo(W*.75,H-150,W-70,H-205);g.stroke();
  g.strokeStyle=deep;g.lineWidth=8;g.beginPath();g.moveTo(W-150,H-190);g.quadraticCurveTo(W-120,H-280,W-80,H-340);g.stroke();
  g.strokeStyle=lime;g.lineWidth=6;
  for(let a=-1.3;a<1.4;a+=.55){g.beginPath();g.moveTo(W-80,H-340);g.quadraticCurveTo(W-80+Math.cos(a)*65,H-390+Math.sin(a)*30,W-80+Math.cos(a)*110,H-360+Math.sin(a)*60);g.stroke()}

  // information panel
  const panelY=H-235;
  g.fillStyle="#064d31";g.fillRect(62,panelY-28,W-124,150);
  g.strokeStyle=lime;g.lineWidth=2;g.strokeRect(62,panelY-28,W-124,150);
  text(g,d.mode==="team"?"TEAM NAME":"BUILDER",88,panelY+4,15,"700 15px monospace",yellow);
  text(g,d.displayName.slice(0,24),88,panelY+42,42,"700 42px Georgia",cream);
  text(g,d.role.slice(0,26),88,panelY+86,18,"700 18px monospace",lime);
  text(g,d.title.slice(0,31),W-88,panelY+86,18,"700 18px monospace",cream,"right");
  text(g,"ROLE",88,panelY+112,12,"700 12px monospace",yellow);
  text(g,"BUILDER TITLE",W-88,panelY+112,12,"700 12px monospace",yellow,"right");
  text(g,"#FrameInGoa",70,H-42,17,"700 17px monospace",pink);
  text(g,"2026",W-70,H-42,17,"700 17px monospace",yellow,"right");

  return new Promise<Blob>(resolve=>c.toBlob(b=>resolve(b!),"image/png",1));
}
