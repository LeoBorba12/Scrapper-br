import{j as p,e as cc,C as vi}from"./index-DUTKc6R5.js";import{r as He,T as kr,z as tl,i as dc,j as Ts,S as uc,P as hc,D as fc,E as pc,k as mc,F as gc,X as xc,G as vc,I as _c,x as Sc,A as Xr,J as yc,N as Mc,O as bc,Z as Ec,Q as Tc,V as wc,e as Ac,l as Rc,R as Cc,a as Pc,b as Lc,W as Cn,v as Dc,Y as Ic,_ as Nc,$ as Uc}from"./vendor-icons-CD2sBgfX.js";import"./vendor-react-m7pWD6SH.js";function Fc({clubeNome:i="Flamengo",partidas:e=[],altura:t=260}){const[n,r]=He.useState("vitorias"),[s,a]=He.useState(null),o=He.useMemo(()=>{const S={1950:{rotulo:"Anos 50",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1960:{rotulo:"Anos 60",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1970:{rotulo:"Anos 70",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1980:{rotulo:"Anos 80",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1990:{rotulo:"Anos 90",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},2e3:{rotulo:"Anos 2000",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},2010:{rotulo:"Anos 2010",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},2020:{rotulo:"Anos 2020",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0}};return e&&e.length>0&&e.forEach(O=>{const R=parseInt(O.ano||(O.data?O.data.slice(0,4):0),10);if(R>=1950&&R<=2026){const w=`${Math.floor(R/10)*10}`;if(S[w]){const I=S[w];I.jogos+=1;const L=(O.mandante||"").toLowerCase().includes((i||"").toLowerCase()),D=Number(O.gols_mandante)||0,H=Number(O.gols_visitante)||0,k=L?D:H,Q=L?H:D;I.gp+=k,I.gc+=Q,k>Q?I.vitorias+=1:Q>k?I.derrotas+=1:I.empates+=1}}}),Object.entries(S).map(([O,R])=>{const w=R.vitorias*3+R.empates,I=R.jogos>0?Math.round(w/(R.jogos*3)*100):0;return{decada:O,rotulo:R.rotulo,jogos:R.jogos,vitorias:R.vitorias,empates:R.empates,derrotas:R.derrotas,pontos:w,aproveitamento:I,gp:R.gp,gc:R.gc}})},[e,i]),l=o.some(S=>S.jogos>0),c=He.useMemo(()=>l?o:o.map((S,O)=>{const R=180+O*25,w=i.length%5*2,I=Math.round(R*(.48+O*.02+w*.01)),U=Math.round(R*.25),L=I*3+U,D=Math.round(L/(R*3)*100);return{...S,jogos:R,vitorias:I,empates:U,derrotas:R-I-U,pontos:L,aproveitamento:D,gp:Math.round(R*1.4),gc:Math.round(R*1)}}),[o,l,i]),d=46,h=24,u=32,f=40,v=620,M=t,g=v-d-h,m=M-u-f,E=g/(c.length-1),T=n==="aproveitamento"?100:Math.ceil(Math.max(...c.map(S=>S.vitorias),10)*1.15),_=c.map((S,O)=>{const R=n==="aproveitamento"?S.aproveitamento:S.vitorias,w=d+O*E,I=u+m-R/T*m;return{x:w,y:I,val:R,d:S}}),C=_.map((S,O)=>`${O===0?"M":"L"} ${S.x} ${S.y}`).join(" "),A=`${C} L ${_[_.length-1].x} ${u+m} L ${_[0].x} ${u+m} Z`,x=n==="aproveitamento"?[0,25,50,75,100]:[0,Math.round(T*.33),Math.round(T*.66),T];return p.jsxs("div",{style:{backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",padding:"20px",boxShadow:"var(--shadow-editorial)",position:"relative"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:[p.jsxs("div",{children:[p.jsxs("h4",{style:{fontSize:"1rem",fontWeight:700,margin:0,color:"var(--text-primary)"},children:["Evolução Histórica por Décadas • ",i]}),p.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"Tendência de performance através das eras do futebol nacional."})]}),p.jsxs("div",{style:{display:"inline-flex",backgroundColor:"var(--surface-raised)",borderRadius:"var(--radius-control)",padding:"2px",border:"1px solid var(--border-subtle)"},children:[p.jsx("button",{onClick:()=>r("vitorias"),style:{padding:"5px 12px",fontSize:"0.74rem",fontWeight:600,borderRadius:"4px",border:"none",backgroundColor:n==="vitorias"?"var(--accent)":"transparent",color:n==="vitorias"?"var(--accent-foreground)":"var(--text-secondary)",cursor:"pointer"},children:"Vitórias"}),p.jsx("button",{onClick:()=>r("aproveitamento"),style:{padding:"5px 12px",fontSize:"0.74rem",fontWeight:600,borderRadius:"4px",border:"none",backgroundColor:n==="aproveitamento"?"var(--accent)":"transparent",color:n==="aproveitamento"?"var(--accent-foreground)":"var(--text-secondary)",cursor:"pointer"},children:"Aproveitamento %"})]})]}),p.jsxs("svg",{viewBox:`0 0 ${v} ${M}`,style:{width:"100%",height:"auto",display:"block",overflow:"visible"},children:[p.jsx("defs",{children:p.jsxs("linearGradient",{id:"clubAreaGrad",x1:"0%",y1:"0%",x2:"0%",y2:"100%",children:[p.jsx("stop",{offset:"0%",stopColor:"var(--accent)",stopOpacity:"0.32"}),p.jsx("stop",{offset:"100%",stopColor:"var(--accent)",stopOpacity:"0.02"})]})}),x.map((S,O)=>{const R=u+m-S/T*m;return p.jsxs("g",{children:[p.jsx("line",{x1:d,y1:R,x2:v-h,y2:R,stroke:"var(--border-subtle)",strokeWidth:"1",strokeDasharray:O===0?"none":"2,3",opacity:.7}),p.jsxs("text",{x:d-8,y:R+3,textAnchor:"end",fontSize:"10",fontWeight:"600",fontFamily:"var(--font-mono)",fill:"var(--text-muted)",children:[S,n==="aproveitamento"?"%":""]})]},O)}),p.jsx("path",{d:A,fill:"url(#clubAreaGrad)"}),p.jsx("path",{d:C,fill:"none",stroke:"var(--accent)",strokeWidth:"2.8",strokeLinecap:"round",strokeLinejoin:"round"}),_.map((S,O)=>{const R=s===S.d.decada;return p.jsxs("g",{style:{cursor:"pointer"},onMouseEnter:()=>a(S.d.decada),onMouseLeave:()=>a(null),children:[R&&p.jsx("line",{x1:S.x,y1:u,x2:S.x,y2:u+m,stroke:"var(--accent)",strokeWidth:"1.2",strokeDasharray:"3,3"}),p.jsx("circle",{cx:S.x,cy:S.y,r:R?6:4,fill:R?"var(--accent-hover)":"var(--accent)",stroke:"var(--surface-card)",strokeWidth:"2.5",style:{transition:"all 150ms ease"}}),p.jsx("text",{x:S.x,y:M-12,textAnchor:"middle",fontSize:"10",fontWeight:R?"800":"600",fontFamily:"var(--font-ui)",fill:R?"var(--text-primary)":"var(--text-secondary)",children:S.d.rotulo.replace("Anos ","")})]},S.d.decada)})]}),s&&(()=>{const S=c.find(O=>O.decada===s);return S?p.jsxs("div",{style:{position:"absolute",top:"16px",right:"20px",backgroundColor:"var(--surface-panel)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",padding:"6px 12px",boxShadow:"var(--shadow-editorial)",fontSize:"0.76rem",display:"flex",alignItems:"center",gap:"12px",zIndex:20},children:[p.jsxs("div",{children:[p.jsx("strong",{style:{color:"var(--text-primary)"},children:S.rotulo}),p.jsxs("div",{style:{color:"var(--text-secondary)",fontSize:"0.7rem"},children:[S.jogos," partidas catalogadas"]})]}),p.jsx("div",{style:{height:"20px",width:"1px",backgroundColor:"var(--border-subtle)"}}),p.jsxs("div",{style:{display:"flex",gap:"8px"},children:[p.jsxs("div",{children:[p.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:"Vitórias"}),p.jsx("div",{className:"font-mono",style:{fontWeight:800,color:"var(--accent)"},children:S.vitorias})]}),p.jsxs("div",{children:[p.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:"Aprov"}),p.jsxs("div",{className:"font-mono",style:{fontWeight:800,color:"var(--positive)"},children:[S.aproveitamento,"%"]})]}),p.jsxs("div",{children:[p.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:"Pontos"}),p.jsx("div",{className:"font-mono",style:{fontWeight:800,color:"var(--text-primary)"},children:S.pontos})]})]})]}):null})()]})}const Oc=[{clube:"Flamengo",ano:2019,label:"Flamengo 2019",recorde:"90 pts • Jorge Jesus"},{clube:"Cruzeiro",ano:2003,label:"Cruzeiro 2003",recorde:"100 pts • Tríplice Coroa"},{clube:"Corinthians",ano:2015,label:"Corinthians 2015",recorde:"81 pts • Tite"},{clube:"Palmeiras",ano:2022,label:"Palmeiras 2022",recorde:"81 pts • Abel Ferreira"},{clube:"Atlético-MG",ano:2021,label:"Atlético-MG 2021",recorde:"84 pts • Hulk"},{clube:"São Paulo",ano:2006,label:"São Paulo 2006",recorde:"78 pts • Muricy Ramalho"},{clube:"Fluminense",ano:2012,label:"Fluminense 2012",recorde:"77 pts • Fred"},{clube:"Santos",ano:2002,label:"Santos 2002",recorde:"Meninos da Vila"},{clube:"Vasco",ano:1997,label:"Vasco 1997",recorde:"Edmundo • 29 gols"},{clube:"Grêmio",ano:1996,label:"Grêmio 1996",recorde:"Felipão"},{clube:"Botafogo",ano:1995,label:"Botafogo 1995",recorde:"Túlio Maravilha"}];function Bc({clubeInicial:i="Flamengo",anoInicial:e=2019}){const[t,n]=He.useState(i),[r,s]=He.useState(e),[a,o]=He.useState(null),[l,c]=He.useState(!0),[d,h]=He.useState(null),[u,f]=He.useState(null),v=He.useRef(null);He.useEffect(()=>{let w=!1;return c(!0),h(null),fetch(`/api/clubes/campanha-historica?clube=${encodeURIComponent(t)}&ano=${r}`).then(I=>{if(!I.ok)throw new Error(`Status ${I.status}`);return I.json()}).then(I=>{w||(I.error?(h(I.error),o(null)):(o(I),I.evolucao_rodadas&&I.evolucao_rodadas.length>0&&f(I.evolucao_rodadas[I.evolucao_rodadas.length-1])),c(!1))}).catch(I=>{w||(h("Não foi possível carregar a trajetória desta campanha."),c(!1))}),()=>{w=!0}},[t,r]);const M=(a==null?void 0:a.evolucao_rodadas)||[],g=M.length,m=840,E=260,T={top:28,right:30,bottom:35,left:45},_=m-T.left-T.right,C=E-T.top-T.bottom,A=He.useMemo(()=>{if(!M.length)return 100;const w=M[M.length-1].pontos_acumulados;return Math.max(w+5,80)},[M]),x=He.useMemo(()=>M.length?M.map((w,I)=>{const U=T.left+I/Math.max(1,g-1)*_,L=T.top+C-w.pontos_acumulados/A*C;return{...w,x:U,y:L}}):[],[M,g,_,C,A,T]),{pathLine:S,pathArea:O}=He.useMemo(()=>{if(x.length<2)return{pathLine:"",pathArea:""};const w=x.reduce((H,k,Q)=>Q===0?`M ${k.x.toFixed(1)},${k.y.toFixed(1)}`:`${H} L ${k.x.toFixed(1)},${k.y.toFixed(1)}`,""),I=x[0].x.toFixed(1),U=x[x.length-1].x.toFixed(1),L=(T.top+C).toFixed(1),D=`${w} L ${U},${L} L ${I},${L} Z`;return{pathLine:w,pathArea:D}},[x,T,C]),R=w=>{v.current&&v.current.scrollBy({left:w*260,behavior:"smooth"})};return p.jsxs("div",{className:"editorial-panel",style:{padding:"24px",display:"flex",flexDirection:"column",gap:"20px"},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"16px"},children:[p.jsxs("div",{children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[p.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:"4px",fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--accent)",backgroundColor:"color-mix(in srgb, var(--accent) 12%, transparent)",padding:"2px 8px",borderRadius:"4px"},children:[p.jsx(kr,{size:12})," Grandes Campanhas do Futebol Brasileiro"]}),p.jsx("span",{style:{fontSize:"0.75rem",color:"var(--text-muted)"},children:"Evolução Rodada a Rodada"})]}),p.jsxs("h2",{className:"font-editorial",style:{margin:0,fontSize:"1.45rem",fontWeight:700,color:"var(--text-primary)"},children:["Trajetória Histórica: ",t," (",r,")"]}),p.jsx("p",{style:{margin:"4px 0 0 0",fontSize:"0.84rem",color:"var(--text-secondary)"},children:"Acompanhe a curva de pontuação cumulativa, aproveitamento e resultados de ponta a ponta na competição."}),p.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"10px"},children:a&&p.jsx("button",{type:"button",onClick:()=>cc(a),className:"touch-tactile",style:{display:"inline-flex",alignItems:"center",gap:"6px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)",padding:"5px 12px",borderRadius:"var(--radius-control)",fontSize:"0.78rem",fontWeight:600,cursor:"pointer"},title:"Baixar card de alta resolução da campanha histórica (PNG)",children:"📸 Exportar Card da Campanha (PNG)"})})]}),p.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"},children:[p.jsx("span",{style:{fontSize:"0.72rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Campanhas Históricas em Destaque:"}),p.jsx("div",{style:{display:"flex",gap:"6px",flexWrap:"wrap",maxWidth:"520px",justifyContent:"flex-end"},children:Oc.slice(0,6).map(w=>{const I=w.clube===t&&w.ano===r;return p.jsxs("button",{onClick:()=>{n(w.clube),s(w.ano)},style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"var(--radius-control)",fontSize:"0.75rem",fontWeight:I?700:500,backgroundColor:I?"var(--accent)":"var(--surface-raised)",color:I?"var(--accent-foreground)":"var(--text-secondary)",border:`1px solid ${I?"var(--accent)":"var(--border-subtle)"}`,cursor:"pointer",transition:"all 0.15s ease"},children:[p.jsx(vi,{nome:w.clube,size:14}),p.jsx("span",{children:w.label})]},`${w.clube}-${w.ano}`)})})]})]}),a&&!l&&p.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:"10px"},children:[p.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[p.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Pontuação Final"}),p.jsxs("div",{className:"tabular-nums font-editorial",style:{fontSize:"1.65rem",fontWeight:700,color:"var(--accent)",marginTop:"2px"},children:[a.pontos_finais," ",p.jsx("span",{style:{fontSize:"0.8rem",fontWeight:500,color:"var(--text-muted)"},children:"pts"})]}),p.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:["Em ",a.total_jogos," partidas"]})]}),p.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[p.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Aproveitamento"}),p.jsxs("div",{className:"tabular-nums font-editorial",style:{fontSize:"1.65rem",fontWeight:700,color:"var(--text-primary)",marginTop:"2px"},children:[a.aproveitamento_final,"%"]}),p.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:"Eficiência geral"})]}),p.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[p.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Campanha (V-E-D)"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.25rem",fontWeight:700,color:"var(--text-primary)",marginTop:"4px"},children:[p.jsxs("span",{style:{color:"var(--positive)"},children:[a.vitorias,"V"]})," • ",p.jsxs("span",{children:[a.empates,"E"]})," • ",p.jsxs("span",{style:{color:"var(--negative)"},children:[a.derrotas,"D"]})]}),p.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:[(a.vitorias/Math.max(1,a.total_jogos)*100).toFixed(0),"% de vitórias"]})]}),p.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[p.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Gols & Saldo"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.25rem",fontWeight:700,color:"var(--text-primary)",marginTop:"4px"},children:[a.gols_pro," GP • ",p.jsxs("span",{style:{color:a.saldo_gols>=0?"var(--positive)":"var(--negative)"},children:[a.saldo_gols>0?`+${a.saldo_gols}`:a.saldo_gols," SG"]})]}),p.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:[a.media_gols_jogo," gols / jogo"]})]})]}),l&&p.jsxs("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:[p.jsx(tl,{size:24,className:"animate-spin",style:{margin:"0 auto 8px auto",display:"block",color:"var(--accent)"}}),p.jsx("span",{children:"Carregando dados da campanha histórica..."})]}),d&&!l&&p.jsx("div",{style:{padding:"20px",borderRadius:"var(--radius-control)",backgroundColor:"color-mix(in srgb, var(--negative) 10%, transparent)",color:"var(--negative)",fontSize:"0.85rem"},children:d}),!l&&a&&x.length>0&&p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[p.jsx("div",{style:{position:"relative",width:"100%",overflowX:"auto"},children:p.jsxs("svg",{viewBox:`0 0 ${m} ${E}`,style:{width:"100%",height:"auto",maxHeight:"300px",display:"block"},children:[p.jsx("defs",{children:p.jsxs("linearGradient",{id:"gradientCampanha",x1:"0",y1:"0",x2:"0",y2:"1",children:[p.jsx("stop",{offset:"0%",stopColor:"var(--accent)",stopOpacity:"0.28"}),p.jsx("stop",{offset:"100%",stopColor:"var(--accent)",stopOpacity:"0.0"})]})}),[0,25,50,75,100].filter(w=>w<=A).map(w=>{const I=T.top+C-w/A*C;return p.jsxs("g",{children:[p.jsx("line",{x1:T.left,y1:I,x2:m-T.right,y2:I,stroke:"var(--border-subtle)",strokeDasharray:"4 4",strokeWidth:"1"}),p.jsxs("text",{x:T.left-8,y:I+3,fill:"var(--text-muted)",fontSize:"10",textAnchor:"end",fontFamily:"inherit",children:[w," pts"]})]},w)}),O&&p.jsx("path",{d:O,fill:"url(#gradientCampanha)"}),S&&p.jsx("path",{d:S,fill:"none",stroke:"var(--accent)",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"}),x.map((w,I)=>{const U=(u==null?void 0:u.indice)===w.indice,L=w.resultado==="V"?"var(--positive)":w.resultado==="D"?"var(--negative)":"var(--text-secondary)";return p.jsxs("g",{style:{cursor:"pointer"},onMouseEnter:()=>f(w),children:[U&&p.jsx("circle",{cx:w.x,cy:w.y,r:"8",fill:"none",stroke:"var(--accent)",strokeWidth:"2",opacity:"0.8"}),p.jsx("circle",{cx:w.x,cy:w.y,r:U?5.5:3.5,fill:L,stroke:"var(--surface-card)",strokeWidth:"1.5"})]},I)}),x.filter((w,I)=>I===0||(I+1)%5===0||I===x.length-1).map((w,I)=>p.jsxs("text",{x:w.x,y:E-10,fill:"var(--text-muted)",fontSize:"10",textAnchor:"middle",fontFamily:"inherit",children:["R",w.rodada]},I))]})}),u&&p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",padding:"12px 16px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[p.jsx("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"32px",height:"32px",borderRadius:"6px",fontWeight:700,fontSize:"0.85rem",backgroundColor:u.resultado==="V"?"var(--positive)":u.resultado==="D"?"var(--negative)":"var(--surface-card)",color:u.resultado==="V"||u.resultado==="D"?"#fff":"var(--text-primary)",border:"1px solid var(--border-subtle)"},children:u.resultado}),p.jsxs("div",{children:[p.jsxs("div",{style:{fontSize:"0.75rem",color:"var(--text-secondary)"},children:["Rodada ",u.rodada," • ",u.mando==="Casa"?"Em Casa":"Fora"," • ",u.data]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"2px",fontWeight:700,fontSize:"0.95rem",color:"var(--text-primary)"},children:[p.jsxs("span",{children:["vs ",u.adversario]}),p.jsxs("span",{className:"tabular-nums",style:{color:"var(--accent)"},children:["(",u.placar,")"]}),u.estadio&&p.jsxs("span",{style:{fontSize:"0.72rem",fontWeight:400,color:"var(--text-muted)"},children:["• ",u.estadio]})]})]})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"20px"},children:[p.jsxs("div",{style:{textAlign:"right"},children:[p.jsx("div",{style:{fontSize:"0.68rem",color:"var(--text-secondary)",textTransform:"uppercase"},children:"Pontos Acumulados"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.15rem",fontWeight:700,color:"var(--text-primary)"},children:[u.pontos_acumulados," pts"]})]}),p.jsxs("div",{style:{textAlign:"right"},children:[p.jsx("div",{style:{fontSize:"0.68rem",color:"var(--text-secondary)",textTransform:"uppercase"},children:"Aproveitamento"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.15rem",fontWeight:700,color:"var(--positive)"},children:[u.aproveitamento_acumulado,"%"]})]}),p.jsxs("div",{style:{textAlign:"right"},children:[p.jsx("div",{style:{fontSize:"0.68rem",color:"var(--text-secondary)",textTransform:"uppercase"},children:"Saldo de Gols"}),p.jsx("div",{className:"tabular-nums",style:{fontSize:"1.15rem",fontWeight:700,color:u.saldo_gols_acumulado>=0?"var(--text-primary)":"var(--negative)"},children:u.saldo_gols_acumulado>0?`+${u.saldo_gols_acumulado}`:u.saldo_gols_acumulado})]})]})]}),p.jsxs("div",{style:{position:"relative"},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"},children:[p.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:600,color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:["Sequência das ",g," Partidas da Campanha:"]}),p.jsxs("div",{style:{display:"flex",gap:"4px"},children:[p.jsx("button",{onClick:()=>R(-1),style:{padding:"4px 6px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",borderRadius:"4px",color:"var(--text-secondary)",cursor:"pointer"},"aria-label":"Rolar para esquerda",children:p.jsx(dc,{size:14})}),p.jsx("button",{onClick:()=>R(1),style:{padding:"4px 6px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",borderRadius:"4px",color:"var(--text-secondary)",cursor:"pointer"},"aria-label":"Rolar para direita",children:p.jsx(Ts,{size:14})})]})]}),p.jsx("div",{ref:v,style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",scrollbarWidth:"thin"},children:M.map((w,I)=>{const U=(u==null?void 0:u.indice)===w.indice,L=w.resultado==="V"?"var(--positive)":w.resultado==="D"?"var(--negative)":"var(--text-secondary)";return p.jsxs("div",{onClick:()=>f(w),style:{flex:"0 0 115px",padding:"8px 10px",borderRadius:"var(--radius-control)",backgroundColor:U?"var(--surface-card)":"var(--surface-raised)",border:`1px solid ${U?"var(--accent)":"var(--border-subtle)"}`,cursor:"pointer",transition:"all 0.15s ease"},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"},children:[p.jsxs("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--text-secondary)"},children:["R",w.rodada]}),p.jsx("span",{style:{fontSize:"0.65rem",fontWeight:700,color:"#fff",backgroundColor:L,padding:"1px 5px",borderRadius:"3px"},children:w.resultado})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"},children:[p.jsx(vi,{nome:w.adversario,size:14}),p.jsx("span",{style:{fontSize:"0.72rem",fontWeight:600,color:"var(--text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:w.adversario})]}),p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"0.7rem"},children:[p.jsx("span",{className:"tabular-nums",style:{fontWeight:700,color:"var(--accent)"},children:w.placar}),p.jsxs("span",{className:"tabular-nums",style:{color:"var(--text-muted)"},children:[w.pontos_acumulados,"p"]})]})]},I)})})]})]})]})}/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const xa="187",zc=0,Ja=1,kc=2,Ar=1,Gc=2,Oi=3,Kn=0,Vt=1,Ft=2,_i=0,ki=1,$a=2,Ka=3,Qa=4,Hc=5,gi=100,Vc=101,Wc=102,Xc=103,jc=104,qc=200,Yc=201,Zc=202,Jc=203,nl=204,il=205,$c=206,Kc=207,Qc=208,ed=209,td=210,nd=211,id=212,rd=213,sd=214,ws=0,As=1,Rs=2,Vi=3,Cs=4,Ps=5,Ls=6,Ds=7,rl=0,ad=1,od=2,En=0,sl=1,al=2,ol=3,va=4,ll=5,cl=6,dl=7,ul=300,Mi=301,Wi=302,jr=303,qr=304,Qn=1e3,Mn=1001,Is=1002,Lt=1003,ld=1004,ir=1005,Ht=1006,Yr=1007,On=1008,qt=1009,hl=1010,fl=1011,Xi=1012,_a=1013,fn=1014,dn=1015,pn=1016,Sa=1017,ya=1018,bi=1020,pl=35902,ml=35899,gl=1021,xl=1022,un=1023,kn=1026,Bn=1027,vl=1028,Ma=1029,ei=1030,ba=1031,Ea=1033,Rr=33776,Cr=33777,Pr=33778,Lr=33779,Ns=35840,Us=35841,Fs=35842,Os=35843,Bs=36196,zs=37492,ks=37496,Gs=37488,Hs=37489,Ir=37490,Vs=37491,Ws=37808,Xs=37809,js=37810,qs=37811,Ys=37812,Zs=37813,Js=37814,$s=37815,Ks=37816,Qs=37817,ea=37818,ta=37819,na=37820,ia=37821,ra=36492,sa=36494,aa=36495,oa=36283,la=36284,Nr=36285,ca=36286,cd=3200,da=0,dd=1,Fn="",Gt="srgb",Ur="srgb-linear",Fr="linear",dt="srgb",Zr=7680,ud=519,hd=512,fd=513,pd=514,_l=515,md=516,gd=517,Sl=518,yl=519,xd=35044,eo="300 es",an=2e3,ji=2001;function vd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Or(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function _d(){const i=Or("canvas");return i.style.display="block",i}const to={};function no(...i){const e="THREE."+i.shift();console.log(e,...i)}function Ml(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Ge(...i){i=Ml(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function at(...i){i=Ml(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Si(...i){const e=i.join(" ");e in to||(to[e]=!0,Ge(...i))}function Sd(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}const yd={[ws]:ws,[Rs]:Ls,[Cs]:Cs,[Vi]:Ps,[As]:As,[Ls]:Rs,[Ds]:Ds,[Ps]:Vi};class ii{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const r=n[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Nt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Jr=Math.PI/180,ua=180/Math.PI;function Ai(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Nt[i&255]+Nt[i>>8&255]+Nt[i>>16&255]+Nt[i>>24&255]+"-"+Nt[e&255]+Nt[e>>8&255]+"-"+Nt[e>>16&15|64]+Nt[e>>24&255]+"-"+Nt[t&63|128]+Nt[t>>8&255]+"-"+Nt[t>>16&255]+Nt[t>>24&255]+Nt[n&255]+Nt[n>>8&255]+Nt[n>>16&255]+Nt[n>>24&255]).toLowerCase()}function Je(i,e,t){return Math.max(e,Math.min(t,i))}function Md(i,e){return(i%e+e)%e}function $r(i,e,t){return(1-t)*i+t*e}function bd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Ta(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Ed(i,e){if(e.constructor===Float32Array)return i;const t=Ta(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Td(i,e){if(e.constructor===Float32Array)return i;const t=Ta(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}const Ua=class Ua{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*r+e.x,this.y=s*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Ua.prototype.isVector2=!0;let G=Ua;class Ri{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,a,o){let l=n[r+0],c=n[r+1],d=n[r+2],h=n[r+3],u=s[a+0],f=s[a+1],v=s[a+2],M=s[a+3];if(h!==M||l!==u||c!==f||d!==v){let g=l*u+c*f+d*v+h*M;g<0&&(u=-u,f=-f,v=-v,M=-M,g=-g);let m=1-o;if(g<.9995){const E=Math.acos(g),T=Math.sin(E);m=Math.sin(m*E)/T,o=Math.sin(o*E)/T,l=l*m+u*o,c=c*m+f*o,d=d*m+v*o,h=h*m+M*o}else{l=l*m+u*o,c=c*m+f*o,d=d*m+v*o,h=h*m+M*o;const E=1/Math.sqrt(l*l+c*c+d*d+h*h);l*=E,c*=E,d*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,a){const o=n[r],l=n[r+1],c=n[r+2],d=n[r+3],h=s[a],u=s[a+1],f=s[a+2],v=s[a+3];return e[t]=o*v+d*h+l*f-c*u,e[t+1]=l*v+d*u+c*h-o*f,e[t+2]=c*v+d*f+o*u-l*h,e[t+3]=d*v-o*h-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),d=o(r/2),h=o(s/2),u=l(n/2),f=l(r/2),v=l(s/2);switch(a){case"XYZ":this._x=u*d*h+c*f*v,this._y=c*f*h-u*d*v,this._z=c*d*v+u*f*h,this._w=c*d*h-u*f*v;break;case"YXZ":this._x=u*d*h+c*f*v,this._y=c*f*h-u*d*v,this._z=c*d*v-u*f*h,this._w=c*d*h+u*f*v;break;case"ZXY":this._x=u*d*h-c*f*v,this._y=c*f*h+u*d*v,this._z=c*d*v+u*f*h,this._w=c*d*h-u*f*v;break;case"ZYX":this._x=u*d*h-c*f*v,this._y=c*f*h+u*d*v,this._z=c*d*v-u*f*h,this._w=c*d*h+u*f*v;break;case"YZX":this._x=u*d*h+c*f*v,this._y=c*f*h+u*d*v,this._z=c*d*v-u*f*h,this._w=c*d*h-u*f*v;break;case"XZY":this._x=u*d*h-c*f*v,this._y=c*f*h-u*d*v,this._z=c*d*v+u*f*h,this._w=c*d*h+u*f*v;break;default:Ge("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],d=t[6],h=t[10],u=n+o+h;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(d-l)*f,this._y=(s-c)*f,this._z=(a-r)*f}else if(n>o&&n>h){const f=2*Math.sqrt(1+n-o-h);this._w=(d-l)/f,this._x=.25*f,this._y=(r+a)/f,this._z=(s+c)/f}else if(o>h){const f=2*Math.sqrt(1+o-n-h);this._w=(s-c)/f,this._x=(r+a)/f,this._y=.25*f,this._z=(l+d)/f}else{const f=2*Math.sqrt(1+h-n-o);this._w=(a-r)/f,this._x=(s+c)/f,this._y=(l+d)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Je(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,d=t._w;return this._x=n*d+a*o+r*c-s*l,this._y=r*d+a*l+s*o-n*c,this._z=s*d+a*c+n*l-r*o,this._w=a*d-n*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,s=-s,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),d=Math.sin(c);l=Math.sin(l*c)/d,t=Math.sin(t*c)/d,this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Fa=class Fa{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(io.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(io.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*n),d=2*(o*t-s*r),h=2*(s*n-a*t);return this.x=t+l*c+a*h-o*d,this.y=n+l*d+o*c-s*h,this.z=r+l*h+s*d-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-n*l,this.z=n*o-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Kr.copy(this).projectOnVector(e),this.sub(Kr)}reflect(e){return this.sub(Kr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Fa.prototype.isVector3=!0;let N=Fa;const Kr=new N,io=new Ri,Oa=class Oa{constructor(e,t,n,r,s,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c)}set(e,t,n,r,s,a,o,l,c){const d=this.elements;return d[0]=e,d[1]=r,d[2]=o,d[3]=t,d[4]=s,d[5]=l,d[6]=n,d[7]=a,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],d=n[4],h=n[7],u=n[2],f=n[5],v=n[8],M=r[0],g=r[3],m=r[6],E=r[1],T=r[4],_=r[7],C=r[2],A=r[5],x=r[8];return s[0]=a*M+o*E+l*C,s[3]=a*g+o*T+l*A,s[6]=a*m+o*_+l*x,s[1]=c*M+d*E+h*C,s[4]=c*g+d*T+h*A,s[7]=c*m+d*_+h*x,s[2]=u*M+f*E+v*C,s[5]=u*g+f*T+v*A,s[8]=u*m+f*_+v*x,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8];return t*a*d-t*o*c-n*s*d+n*o*l+r*s*c-r*a*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],h=d*a-o*c,u=o*l-d*s,f=c*s-a*l,v=t*h+n*u+r*f;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/v;return e[0]=h*M,e[1]=(r*c-d*n)*M,e[2]=(o*n-r*a)*M,e[3]=u*M,e[4]=(d*t-r*l)*M,e[5]=(r*s-o*t)*M,e[6]=f*M,e[7]=(n*l-c*t)*M,e[8]=(a*t-n*s)*M,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Si("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Qr.makeScale(e,t)),this}rotate(e){return Si("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Qr.makeRotation(-e)),this}translate(e,t){return Si("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Qr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Oa.prototype.isMatrix3=!0;let Ve=Oa;const Qr=new Ve,ro=new Ve().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),so=new Ve().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function wd(){const i={enabled:!0,workingColorSpace:Ur,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===dt&&(r.r=Tn(r.r),r.g=Tn(r.g),r.b=Tn(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===dt&&(r.r=yi(r.r),r.g=yi(r.g),r.b=yi(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Fn?Fr:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[a].fromXYZ).multiply(this.spaces[s].toXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ur]:{primaries:e,whitePoint:n,transfer:Fr,toXYZ:ro,fromXYZ:so,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Gt},outputColorSpaceConfig:{drawingBufferColorSpace:Gt}},[Gt]:{primaries:e,whitePoint:n,transfer:dt,toXYZ:ro,fromXYZ:so,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Gt}}}),i}const it=wd();function Tn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function yi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ri;class Ad{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ri===void 0&&(ri=Or("canvas")),ri.width=e.width,ri.height=e.height;const r=ri.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=ri}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Or("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=Tn(s[a]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Tn(t[n]/255)*255):t[n]=Tn(t[n]);return{data:t,width:e.width,height:e.height}}else return Ge("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Rd=0;class wa{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Rd++}),this.uuid=Ai(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(es(r[a].image)):s.push(es(r[a]))}else s=es(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function es(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ad.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ge("Texture: Unable to serialize Texture."),{})}let Cd=0;const ts=new N;class Ot extends ii{constructor(e=Ot.DEFAULT_IMAGE,t=Ot.DEFAULT_MAPPING,n=Mn,r=Mn,s=Ht,a=On,o=un,l=qt,c=Ot.DEFAULT_ANISOTROPY,d=Fn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Cd++}),this.uuid=Ai(),this.name="",this.source=new wa(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new G(0,0),this.repeat=new G(1,1),this.center=new G(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(ts).x}get height(){return this.source.getSize(ts).y}get depth(){return this.source.getSize(ts).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Ge(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Ge(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ul)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Qn:e.x=e.x-Math.floor(e.x);break;case Mn:e.x=e.x<0?0:1;break;case Is:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Qn:e.y=e.y-Math.floor(e.y);break;case Mn:e.y=e.y<0?0:1;break;case Is:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ot.DEFAULT_IMAGE=null;Ot.DEFAULT_MAPPING=ul;Ot.DEFAULT_ANISOTROPY=1;const Ba=class Ba{constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],d=l[4],h=l[8],u=l[1],f=l[5],v=l[9],M=l[2],g=l[6],m=l[10];if(Math.abs(d-u)<.01&&Math.abs(h-M)<.01&&Math.abs(v-g)<.01){if(Math.abs(d+u)<.1&&Math.abs(h+M)<.1&&Math.abs(v+g)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const T=(c+1)/2,_=(f+1)/2,C=(m+1)/2,A=(d+u)/4,x=(h+M)/4,S=(v+g)/4;return T>_&&T>C?T<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(T),r=A/n,s=x/n):_>C?_<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(_),n=A/r,s=S/r):C<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(C),n=x/s,r=S/s),this.set(n,r,s,t),this}let E=Math.sqrt((g-v)*(g-v)+(h-M)*(h-M)+(u-d)*(u-d));return Math.abs(E)<.001&&(E=1),this.x=(g-v)/E,this.y=(h-M)/E,this.z=(u-d)/E,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this.w=Je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this.w=Je(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ba.prototype.isVector4=!0;let vt=Ba;class Pd extends ii{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ht,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t),this.textures=[];const r=n.count;for(let s=0;s<r;s++)this.textures[s]=new Ot({width:e,height:t,depth:n.depth}),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Ht,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new wa(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class hn extends Pd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class bl extends Ot{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Mn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ld extends Ot{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Mn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const zr=class zr{constructor(e,t,n,r,s,a,o,l,c,d,h,u,f,v,M,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c,d,h,u,f,v,M,g)}set(e,t,n,r,s,a,o,l,c,d,h,u,f,v,M,g){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=r,m[1]=s,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=d,m[10]=h,m[14]=u,m[3]=f,m[7]=v,m[11]=M,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new zr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,r=1/si.setFromMatrixColumn(e,0).length(),s=1/si.setFromMatrixColumn(e,1).length(),a=1/si.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(r),c=Math.sin(r),d=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const u=a*d,f=a*h,v=o*d,M=o*h;t[0]=l*d,t[4]=-l*h,t[8]=c,t[1]=f+v*c,t[5]=u-M*c,t[9]=-o*l,t[2]=M-u*c,t[6]=v+f*c,t[10]=a*l}else if(e.order==="YXZ"){const u=l*d,f=l*h,v=c*d,M=c*h;t[0]=u+M*o,t[4]=v*o-f,t[8]=a*c,t[1]=a*h,t[5]=a*d,t[9]=-o,t[2]=f*o-v,t[6]=M+u*o,t[10]=a*l}else if(e.order==="ZXY"){const u=l*d,f=l*h,v=c*d,M=c*h;t[0]=u-M*o,t[4]=-a*h,t[8]=v+f*o,t[1]=f+v*o,t[5]=a*d,t[9]=M-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const u=a*d,f=a*h,v=o*d,M=o*h;t[0]=l*d,t[4]=v*c-f,t[8]=u*c+M,t[1]=l*h,t[5]=M*c+u,t[9]=f*c-v,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const u=a*l,f=a*c,v=o*l,M=o*c;t[0]=l*d,t[4]=M-u*h,t[8]=v*h+f,t[1]=h,t[5]=a*d,t[9]=-o*d,t[2]=-c*d,t[6]=f*h+v,t[10]=u-M*h}else if(e.order==="XZY"){const u=a*l,f=a*c,v=o*l,M=o*c;t[0]=l*d,t[4]=-h,t[8]=c*d,t[1]=u*h+M,t[5]=a*d,t[9]=f*h-v,t[2]=v*h-f,t[6]=o*d,t[10]=M*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Dd,e,Id)}lookAt(e,t,n){const r=this.elements;return Xt.subVectors(e,t),Xt.lengthSq()===0&&(Xt.z=1),Xt.normalize(),Pn.crossVectors(n,Xt),Pn.lengthSq()===0&&(Math.abs(n.z)===1?Xt.x+=1e-4:Xt.z+=1e-4,Xt.normalize(),Pn.crossVectors(n,Xt)),Pn.normalize(),rr.crossVectors(Xt,Pn),r[0]=Pn.x,r[4]=rr.x,r[8]=Xt.x,r[1]=Pn.y,r[5]=rr.y,r[9]=Xt.y,r[2]=Pn.z,r[6]=rr.z,r[10]=Xt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],d=n[1],h=n[5],u=n[9],f=n[13],v=n[2],M=n[6],g=n[10],m=n[14],E=n[3],T=n[7],_=n[11],C=n[15],A=r[0],x=r[4],S=r[8],O=r[12],R=r[1],w=r[5],I=r[9],U=r[13],L=r[2],D=r[6],H=r[10],k=r[14],Q=r[3],j=r[7],J=r[11],$=r[15];return s[0]=a*A+o*R+l*L+c*Q,s[4]=a*x+o*w+l*D+c*j,s[8]=a*S+o*I+l*H+c*J,s[12]=a*O+o*U+l*k+c*$,s[1]=d*A+h*R+u*L+f*Q,s[5]=d*x+h*w+u*D+f*j,s[9]=d*S+h*I+u*H+f*J,s[13]=d*O+h*U+u*k+f*$,s[2]=v*A+M*R+g*L+m*Q,s[6]=v*x+M*w+g*D+m*j,s[10]=v*S+M*I+g*H+m*J,s[14]=v*O+M*U+g*k+m*$,s[3]=E*A+T*R+_*L+C*Q,s[7]=E*x+T*w+_*D+C*j,s[11]=E*S+T*I+_*H+C*J,s[15]=E*O+T*U+_*k+C*$,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],d=e[2],h=e[6],u=e[10],f=e[14],v=e[3],M=e[7],g=e[11],m=e[15],E=l*f-c*u,T=o*f-c*h,_=o*u-l*h,C=a*f-c*d,A=a*u-l*d,x=a*h-o*d;return t*(M*E-g*T+m*_)-n*(v*E-g*C+m*A)+r*(v*T-M*C+m*x)-s*(v*_-M*A+g*x)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[1],a=e[5],o=e[9],l=e[2],c=e[6],d=e[10];return t*(a*d-o*c)-n*(s*d-o*l)+r*(s*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],h=e[9],u=e[10],f=e[11],v=e[12],M=e[13],g=e[14],m=e[15],E=t*o-n*a,T=t*l-r*a,_=t*c-s*a,C=n*l-r*o,A=n*c-s*o,x=r*c-s*l,S=d*M-h*v,O=d*g-u*v,R=d*m-f*v,w=h*g-u*M,I=h*m-f*M,U=u*m-f*g,L=E*U-T*I+_*w+C*R-A*O+x*S;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const D=1/L;return e[0]=(o*U-l*I+c*w)*D,e[1]=(r*I-n*U-s*w)*D,e[2]=(M*x-g*A+m*C)*D,e[3]=(u*A-h*x-f*C)*D,e[4]=(l*R-a*U-c*O)*D,e[5]=(t*U-r*R+s*O)*D,e[6]=(g*_-v*x-m*T)*D,e[7]=(d*x-u*_+f*T)*D,e[8]=(a*I-o*R+c*S)*D,e[9]=(n*R-t*I-s*S)*D,e[10]=(v*A-M*_+m*E)*D,e[11]=(h*_-d*A-f*E)*D,e[12]=(o*O-a*w-l*S)*D,e[13]=(t*w-n*O+r*S)*D,e[14]=(M*T-v*C-g*E)*D,e[15]=(d*C-h*T+u*E)*D,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,d=s*o;return this.set(c*a+n,c*o-r*l,c*l+r*o,0,c*o+r*l,d*o+n,d*l-r*a,0,c*l-r*o,d*l+r*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,a){return this.set(1,n,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,d=a+a,h=o+o,u=s*c,f=s*d,v=s*h,M=a*d,g=a*h,m=o*h,E=l*c,T=l*d,_=l*h,C=n.x,A=n.y,x=n.z;return r[0]=(1-(M+m))*C,r[1]=(f+_)*C,r[2]=(v-T)*C,r[3]=0,r[4]=(f-_)*A,r[5]=(1-(u+m))*A,r[6]=(g+E)*A,r[7]=0,r[8]=(v+T)*x,r[9]=(g-E)*x,r[10]=(1-(u+M))*x,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];const s=this.determinantAffine();if(s===0)return n.set(1,1,1),t.identity(),this;let a=si.set(r[0],r[1],r[2]).length();const o=si.set(r[4],r[5],r[6]).length(),l=si.set(r[8],r[9],r[10]).length();s<0&&(a=-a),en.copy(this);const c=1/a,d=1/o,h=1/l;return en.elements[0]*=c,en.elements[1]*=c,en.elements[2]*=c,en.elements[4]*=d,en.elements[5]*=d,en.elements[6]*=d,en.elements[8]*=h,en.elements[9]*=h,en.elements[10]*=h,t.setFromRotationMatrix(en),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,r,s,a,o=an,l=!1){const c=this.elements,d=2*s/(t-e),h=2*s/(n-r),u=(t+e)/(t-e),f=(n+r)/(n-r);let v,M;if(l)v=s/(a-s),M=a*s/(a-s);else if(o===an)v=-(a+s)/(a-s),M=-2*a*s/(a-s);else if(o===ji)v=-a/(a-s),M=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=d,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=v,c[14]=M,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,s,a,o=an,l=!1){const c=this.elements,d=2/(t-e),h=2/(n-r),u=-(t+e)/(t-e),f=-(n+r)/(n-r);let v,M;if(l)v=1/(a-s),M=a/(a-s);else if(o===an)v=-2/(a-s),M=-(a+s)/(a-s);else if(o===ji)v=-1/(a-s),M=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=d,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=v,c[14]=M,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};zr.prototype.isMatrix4=!0;let gt=zr;const si=new N,en=new gt,Dd=new N(0,0,0),Id=new N(1,1,1),Pn=new N,rr=new N,Xt=new N,ao=new gt,oo=new Ri;class Gn{constructor(e=0,t=0,n=0,r=Gn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],d=r[9],h=r[2],u=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(Je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Je(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Je(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-d,f),this._y=0);break;default:Ge("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ao.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ao,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return oo.setFromEuler(this),this.setFromQuaternion(oo,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Gn.DEFAULT_ORDER="XYZ";class El{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Nd=0;const lo=new N,ai=new Ri,xn=new gt,sr=new N,Di=new N,Ud=new N,Fd=new Ri,co=new N(1,0,0),uo=new N(0,1,0),ho=new N(0,0,1),fo={type:"added"},Od={type:"removed"},oi={type:"childadded",child:null},ns={type:"childremoved",child:null};class Bt extends ii{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Nd++}),this.uuid=Ai(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Bt.DEFAULT_UP.clone();const e=new N,t=new Gn,n=new Ri,r=new N(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new gt},normalMatrix:{value:new Ve}}),this.matrix=new gt,this.matrixWorld=new gt,this.matrixAutoUpdate=Bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new El,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ai.setFromAxisAngle(e,t),this.quaternion.multiply(ai),this}rotateOnWorldAxis(e,t){return ai.setFromAxisAngle(e,t),this.quaternion.premultiply(ai),this}rotateX(e){return this.rotateOnAxis(co,e)}rotateY(e){return this.rotateOnAxis(uo,e)}rotateZ(e){return this.rotateOnAxis(ho,e)}translateOnAxis(e,t){return lo.copy(e).applyQuaternion(this.quaternion),this.position.add(lo.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(co,e)}translateY(e){return this.translateOnAxis(uo,e)}translateZ(e){return this.translateOnAxis(ho,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?sr.copy(e):sr.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Di.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xn.lookAt(Di,sr,this.up):xn.lookAt(sr,Di,this.up),this.quaternion.setFromRotationMatrix(xn),r&&(xn.extractRotation(r.matrixWorld),ai.setFromRotationMatrix(xn),this.quaternion.premultiply(ai.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(at("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(fo),oi.child=e,this.dispatchEvent(oi),oi.child=null):at("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Od),ns.child=e,this.dispatchEvent(ns),ns.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xn.multiply(e.parent.matrixWorld)),e.applyMatrix4(xn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(fo),oi.child=e,this.dispatchEvent(oi),oi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,e,Ud),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,Fd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,r=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*n-s[8]*r,s[13]+=n-s[1]*t-s[5]*n-s[9]*r,s[14]+=r-s[2]*t-s[6]*n-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),d=a(e.images),h=a(e.shapes),u=a(e.skeletons),f=a(e.animations),v=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),h.length>0&&(n.shapes=h),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),v.length>0&&(n.nodes=v)}return n.object=r,n;function a(o){const l=[];for(const c in o){const d=o[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Bt.DEFAULT_UP=new N(0,1,0);Bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class $t extends Bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Bd={type:"move"};class is{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $t,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $t,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $t,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const M of e.hand.values()){const g=t.getJointPose(M,n),m=this._getHandJoint(c,M);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}const d=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],u=d.position.distanceTo(h.position),f=.02,v=.005;c.inputState.pinching&&u>f+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Bd)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new $t;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Tl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ln={h:0,s:0,l:0},ar={h:0,s:0,l:0};function rs(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class ze{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,it.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=it.workingColorSpace){return this.r=e,this.g=t,this.b=n,it.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=it.workingColorSpace){if(e=Md(e,1),t=Je(t,0,1),n=Je(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=rs(a,s,e+1/3),this.g=rs(a,s,e),this.b=rs(a,s,e-1/3)}return it.colorSpaceToWorking(this,r),this}setStyle(e,t=Gt){function n(s){s!==void 0&&parseFloat(s)<1&&Ge("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseFloat(s[1]))/100,Math.min(100,parseFloat(s[2]))/100,Math.min(100,parseFloat(s[3]))/100,t);break;case"hsl":case"hsla":if(s=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:Ge("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);Ge("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Gt){const n=Tl[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ge("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Tn(e.r),this.g=Tn(e.g),this.b=Tn(e.b),this}copyLinearToSRGB(e){return this.r=yi(e.r),this.g=yi(e.g),this.b=yi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Gt){return it.workingToColorSpace(Ut.copy(this),e),Math.round(Je(Ut.r*255,0,255))*65536+Math.round(Je(Ut.g*255,0,255))*256+Math.round(Je(Ut.b*255,0,255))}getHexString(e=Gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=it.workingColorSpace){it.workingToColorSpace(Ut.copy(this),t);const n=Ut.r,r=Ut.g,s=Ut.b,a=Math.max(n,r,s),o=Math.min(n,r,s);let l,c;const d=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=d<=.5?h/(a+o):h/(2-a-o),a){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=it.workingColorSpace){return it.workingToColorSpace(Ut.copy(this),t),e.r=Ut.r,e.g=Ut.g,e.b=Ut.b,e}getStyle(e=Gt){it.workingToColorSpace(Ut.copy(this),e);const t=Ut.r,n=Ut.g,r=Ut.b;return e!==Gt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Ln),this.setHSL(Ln.h+e,Ln.s+t,Ln.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ln),e.getHSL(ar);const n=$r(Ln.h,ar.h,t),r=$r(Ln.s,ar.s,t),s=$r(Ln.l,ar.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ut=new ze;ze.NAMES=Tl;class wl extends Bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Gn,this.environmentIntensity=1,this.environmentRotation=new Gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const tn=new N,vn=new N,ss=new N,_n=new N,li=new N,ci=new N,po=new N,as=new N,os=new N,ls=new N,cs=new vt,ds=new vt,us=new vt;class sn{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),tn.subVectors(e,t),r.cross(tn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){tn.subVectors(r,t),vn.subVectors(n,t),ss.subVectors(e,t);const a=tn.dot(tn),o=tn.dot(vn),l=tn.dot(ss),c=vn.dot(vn),d=vn.dot(ss),h=a*c-o*o;if(h===0)return s.set(0,0,0),null;const u=1/h,f=(c*l-o*d)*u,v=(a*d-o*l)*u;return s.set(1-f-v,v,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,_n)===null?!1:_n.x>=0&&_n.y>=0&&_n.x+_n.y<=1}static getInterpolation(e,t,n,r,s,a,o,l){return this.getBarycoord(e,t,n,r,_n)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,_n.x),l.addScaledVector(a,_n.y),l.addScaledVector(o,_n.z),l)}static getInterpolatedAttribute(e,t,n,r,s,a){return cs.setScalar(0),ds.setScalar(0),us.setScalar(0),cs.fromBufferAttribute(e,t),ds.fromBufferAttribute(e,n),us.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(cs,s.x),a.addScaledVector(ds,s.y),a.addScaledVector(us,s.z),a}static isFrontFacing(e,t,n,r){return tn.subVectors(n,t),vn.subVectors(e,t),tn.cross(vn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return tn.subVectors(this.c,this.b),vn.subVectors(this.a,this.b),tn.cross(vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return sn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return sn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return sn.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return sn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return sn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let a,o;li.subVectors(r,n),ci.subVectors(s,n),as.subVectors(e,n);const l=li.dot(as),c=ci.dot(as);if(l<=0&&c<=0)return t.copy(n);os.subVectors(e,r);const d=li.dot(os),h=ci.dot(os);if(d>=0&&h<=d)return t.copy(r);const u=l*h-d*c;if(u<=0&&l>=0&&d<=0&&l-d>0)return a=l/(l-d),t.copy(n).addScaledVector(li,a);ls.subVectors(e,s);const f=li.dot(ls),v=ci.dot(ls);if(v>=0&&f<=v)return t.copy(s);const M=f*c-l*v;if(M<=0&&c>=0&&v<=0)return o=c/(c-v),t.copy(n).addScaledVector(ci,o);const g=d*v-f*h;if(g<=0&&h-d>=0&&f-v>=0)return po.subVectors(s,r),o=(h-d)/(h-d+(f-v)),t.copy(r).addScaledVector(po,o);const m=1/(g+M+u);return a=M*m,o=u*m,t.copy(n).addScaledVector(li,a).addScaledVector(ci,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Ki{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(nn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(nn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=nn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,nn):nn.fromBufferAttribute(s,a),nn.applyMatrix4(e.matrixWorld),this.expandByPoint(nn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),or.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),or.copy(n.boundingBox)),or.applyMatrix4(e.matrixWorld),this.union(or)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,nn),nn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ii),lr.subVectors(this.max,Ii),di.subVectors(e.a,Ii),ui.subVectors(e.b,Ii),hi.subVectors(e.c,Ii),Dn.subVectors(ui,di),In.subVectors(hi,ui),jn.subVectors(di,hi);let t=[0,-Dn.z,Dn.y,0,-In.z,In.y,0,-jn.z,jn.y,Dn.z,0,-Dn.x,In.z,0,-In.x,jn.z,0,-jn.x,-Dn.y,Dn.x,0,-In.y,In.x,0,-jn.y,jn.x,0];return!hs(t,di,ui,hi,lr)||(t=[1,0,0,0,1,0,0,0,1],!hs(t,di,ui,hi,lr))?!1:(cr.crossVectors(Dn,In),t=[cr.x,cr.y,cr.z],hs(t,di,ui,hi,lr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,nn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(nn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Sn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Sn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Sn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Sn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Sn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Sn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Sn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Sn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Sn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Sn=[new N,new N,new N,new N,new N,new N,new N,new N],nn=new N,or=new Ki,di=new N,ui=new N,hi=new N,Dn=new N,In=new N,jn=new N,Ii=new N,lr=new N,cr=new N,qn=new N;function hs(i,e,t,n,r){for(let s=0,a=i.length-3;s<=a;s+=3){qn.fromArray(i,s);const o=r.x*Math.abs(qn.x)+r.y*Math.abs(qn.y)+r.z*Math.abs(qn.z),l=e.dot(qn),c=t.dot(qn),d=n.dot(qn);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>o)return!1}return!0}const bt=new N,dr=new G;let zd=0;class $n extends ii{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:zd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=xd,this.updateRanges=[],this.gpuType=dn,this.version=0,this._normalizationScale=e!==void 0?Ta(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)dr.fromBufferAttribute(this,t),dr.applyMatrix3(e),this.setXY(t,dr.x,dr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix3(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix4(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyNormalMatrix(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.transformDirection(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Ed(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):Td(e,this.array)}}class Al extends $n{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Rl extends $n{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ut extends $n{constructor(e,t,n){super(new Float32Array(e),t,n)}}const kd=new Ki,Ni=new N,fs=new N;class Aa{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):kd.setFromPoints(e).getCenter(n);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ni.subVectors(e,this.center);const t=Ni.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Ni,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(fs.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ni.copy(e.center).add(fs)),this.expandByPoint(Ni.copy(e.center).sub(fs))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Gd=0;const Jt=new gt,ps=new Bt,fi=new N,jt=new Ki,Ui=new Ki,Ct=new N;class Wt extends ii{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gd++}),this.uuid=Ai(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(vd(e)?Rl:Al)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ve().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Jt.makeRotationFromQuaternion(e),this.applyMatrix4(Jt),this}rotateX(e){return Jt.makeRotationX(e),this.applyMatrix4(Jt),this}rotateY(e){return Jt.makeRotationY(e),this.applyMatrix4(Jt),this}rotateZ(e){return Jt.makeRotationZ(e),this.applyMatrix4(Jt),this}translate(e,t,n){return Jt.makeTranslation(e,t,n),this.applyMatrix4(Jt),this}scale(e,t,n){return Jt.makeScale(e,t,n),this.applyMatrix4(Jt),this}lookAt(e){return ps.lookAt(e),ps.updateMatrix(),this.applyMatrix4(ps.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fi).negate(),this.translate(fi.x,fi.y,fi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const a=e[r];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ut(n,3))}else{const n=Math.min(e.length,t.count);for(let r=0;r<n;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&Ge("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ki);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){at("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];jt.setFromBufferAttribute(s),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,jt.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,jt.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(jt.min),this.boundingBox.expandByPoint(jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&at('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Aa);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){at("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){const n=this.boundingSphere.center;if(jt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];Ui.setFromBufferAttribute(o),this.morphTargetsRelative?(Ct.addVectors(jt.min,Ui.min),jt.expandByPoint(Ct),Ct.addVectors(jt.max,Ui.max),jt.expandByPoint(Ct)):(jt.expandByPoint(Ui.min),jt.expandByPoint(Ui.max))}jt.getCenter(n);let r=0;for(let s=0,a=e.count;s<a;s++)Ct.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Ct));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,d=o.count;c<d;c++)Ct.fromBufferAttribute(o,c),l&&(fi.fromBufferAttribute(e,c),Ct.add(fi)),r=Math.max(r,n.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&at('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){at("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new $n(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[],c=new Uint8Array(n.count);for(let O=0;O<n.count;O++)o[O]=new N,l[O]=new N;const d=new N,h=new N,u=new N,f=new G,v=new G,M=new G,g=new N,m=new N;function E(O,R,w){c[O]=c[R]=c[w]=1,d.fromBufferAttribute(n,O),h.fromBufferAttribute(n,R),u.fromBufferAttribute(n,w),f.fromBufferAttribute(s,O),v.fromBufferAttribute(s,R),M.fromBufferAttribute(s,w),h.sub(d),u.sub(d),v.sub(f),M.sub(f);const I=1/(v.x*M.y-M.x*v.y);isFinite(I)&&(g.copy(h).multiplyScalar(M.y).addScaledVector(u,-v.y).multiplyScalar(I),m.copy(u).multiplyScalar(v.x).addScaledVector(h,-M.x).multiplyScalar(I),o[O].add(g),o[R].add(g),o[w].add(g),l[O].add(m),l[R].add(m),l[w].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let O=0,R=T.length;O<R;++O){const w=T[O],I=w.start,U=w.count;for(let L=I,D=I+U;L<D;L+=3)E(e.getX(L+0),e.getX(L+1),e.getX(L+2))}const _=new N,C=new N,A=new N,x=new N;function S(O){A.fromBufferAttribute(r,O),x.copy(A);const R=o[O];_.copy(R),_.sub(A.multiplyScalar(A.dot(R))).normalize(),C.crossVectors(x,R);const I=C.dot(l[O])<0?-1:1;a.setXYZW(O,_.x,_.y,_.z,I)}for(let O=0,R=n.count;O<R;++O)c[O]&&S(O);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new $n(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);const r=new N,s=new N,a=new N,o=new N,l=new N,c=new N,d=new N,h=new N;if(e)for(let u=0,f=e.count;u<f;u+=3){const v=e.getX(u+0),M=e.getX(u+1),g=e.getX(u+2);r.fromBufferAttribute(t,v),s.fromBufferAttribute(t,M),a.fromBufferAttribute(t,g),d.subVectors(a,s),h.subVectors(r,s),d.cross(h),o.fromBufferAttribute(n,v),l.fromBufferAttribute(n,M),c.fromBufferAttribute(n,g),o.add(d),l.add(d),c.add(d),n.setXYZ(v,o.x,o.y,o.z),n.setXYZ(M,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)r.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),d.subVectors(a,s),h.subVectors(r,s),d.cross(h),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ct.fromBufferAttribute(e,t),Ct.normalize(),e.setXYZ(t,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(o,l){const c=o.array,d=o.itemSize,h=o.normalized,u=new c.constructor(l.length*d);let f=0,v=0;for(let M=0,g=l.length;M<g;M++){o.isInterleavedBufferAttribute?f=l[M]*o.data.stride+o.offset:f=l[M]*d;for(let m=0;m<d;m++)u[v++]=c[f++]}return new $n(u,d,h)}if(this.index===null)return Ge("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Wt,n=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,n);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let d=0,h=c.length;d<h;d++){const u=c[d],f=e(u,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let h=0,u=c.length;h<u;h++){const f=c[h];d.push(f.toJSON(e.data))}d.length>0&&(r[l]=d,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const r=e.attributes;for(const c in r){const d=r[c];this.setAttribute(c,d.clone(t))}const s=e.morphAttributes;for(const c in s){const d=[],h=s[c];for(let u=0,f=h.length;u<f;u++)d.push(h[u].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,d=a.length;c<d;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ms=new N,Hd=new N,Vd=new Ve;class Un{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=ms.subVectors(n,t).cross(Hd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const r=e.delta(ms),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/s;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Vd.getNormalMatrix(e),r=this.coplanarPoint(ms).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Wd=0;class Qi extends ii{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Wd++}),this.uuid=Ai(),this.name="",this.type="Material",this.blending=ki,this.side=Kn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=nl,this.blendDst=il,this.blendEquation=gi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ze(0,0,0),this.blendAlpha=0,this.depthFunc=Vi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ud,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zr,this.stencilZFail=Zr,this.stencilZPass=Zr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Ge(`Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Ge(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=r(e.textures),a=r(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ze().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Un().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new G().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new G().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const yn=new N,gs=new N,ur=new N,hr=new N;class Xd{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,yn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=yn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(yn.copy(this.origin).addScaledVector(this.direction,t),yn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){gs.copy(e).add(t).multiplyScalar(.5),ur.copy(t).sub(e).normalize(),hr.copy(this.origin).sub(gs);const s=e.distanceTo(t)*.5,a=-this.direction.dot(ur),o=hr.dot(this.direction),l=-hr.dot(ur),c=hr.lengthSq(),d=Math.abs(1-a*a);let h,u,f,v;if(d>0)if(h=a*l-o,u=a*o-l,v=s*d,h>=0)if(u>=-v)if(u<=v){const M=1/d;h*=M,u*=M,f=h*(h+a*u+2*o)+u*(a*h+u+2*l)+c}else u=s,h=Math.max(0,-(a*u+o)),f=-h*h+u*(u+2*l)+c;else u=-s,h=Math.max(0,-(a*u+o)),f=-h*h+u*(u+2*l)+c;else u<=-v?(h=Math.max(0,-(-a*s+o)),u=h>0?-s:Math.min(Math.max(-s,-l),s),f=-h*h+u*(u+2*l)+c):u<=v?(h=0,u=Math.min(Math.max(-s,-l),s),f=u*(u+2*l)+c):(h=Math.max(0,-(a*s+o)),u=h>0?s:Math.min(Math.max(-s,-l),s),f=-h*h+u*(u+2*l)+c);else u=a>0?-s:s,h=Math.max(0,-(a*u+o)),f=-h*h+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(gs).addScaledVector(ur,u),f}intersectSphere(e,t){if(e.radius<0)return null;yn.subVectors(e.center,this.origin);const n=yn.dot(this.direction),r=yn.dot(yn)-n*n,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,a,o,l;const c=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,r=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,r=(e.min.x-u.x)*c),d>=0?(s=(e.min.y-u.y)*d,a=(e.max.y-u.y)*d):(s=(e.max.y-u.y)*d,a=(e.min.y-u.y)*d),n>a||s>r||((s>n||isNaN(n))&&(n=s),(a<r||isNaN(r))&&(r=a),h>=0?(o=(e.min.z-u.z)*h,l=(e.max.z-u.z)*h):(o=(e.max.z-u.z)*h,l=(e.min.z-u.z)*h),n>l||o>r)||((o>n||n!==n)&&(n=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,yn)!==null}intersectTriangle(e,t,n,r,s){const a=this.origin,o=this.direction,l=o.x,c=o.y,d=o.z,h=e.x-a.x,u=e.y-a.y,f=e.z-a.z,v=t.x-a.x,M=t.y-a.y,g=t.z-a.z,m=n.x-a.x,E=n.y-a.y,T=n.z-a.z,_=Math.abs(l),C=Math.abs(c),A=Math.abs(d);let x,S,O,R,w,I,U,L,D,H,k,Q;if(_>=C&&_>=A?(O=l,I=h,D=v,Q=m,l>=0?(x=c,S=d,R=u,w=f,U=M,L=g,H=E,k=T):(x=d,S=c,R=f,w=u,U=g,L=M,H=T,k=E)):C>=A?(O=c,I=u,D=M,Q=E,c>=0?(x=d,S=l,R=f,w=h,U=g,L=v,H=T,k=m):(x=l,S=d,R=h,w=f,U=v,L=g,H=m,k=T)):(O=d,I=f,D=g,Q=T,d>=0?(x=l,S=c,R=h,w=u,U=v,L=M,H=m,k=E):(x=c,S=l,R=u,w=h,U=M,L=v,H=E,k=m)),O===0)return null;const j=x/O,J=S/O,$=1/O,ae=R-j*I,we=w-J*I,q=U-j*D,le=L-J*D,Ee=H-j*Q,Ie=k-J*Q,me=Ee*le-Ie*q,Ae=ae*Ie-we*Ee,lt=q*we-le*ae;if(r){if(me<0||Ae<0||lt<0)return null}else if((me<0||Ae<0||lt<0)&&(me>0||Ae>0||lt>0))return null;const Fe=me+Ae+lt;if(Fe===0)return null;const Xe=$*(me*I+Ae*D+lt*Q);return(Fe>0?Xe<0:Xe>0)?null:this.at(Xe/Fe,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Jn extends Qi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.combine=rl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const mo=new gt,Yn=new Xd,fr=new Aa,go=new N,pr=new N,mr=new N,gr=new N,xs=new N,xr=new N,xo=new N,vr=new N;class be extends Bt{constructor(e=new Wt,t=new Jn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){xr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const d=o[l],h=s[l];d!==0&&(xs.fromBufferAttribute(h,e),a?xr.addScaledVector(xs,d):xr.addScaledVector(xs.sub(t),d))}t.add(xr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),fr.copy(n.boundingSphere),fr.applyMatrix4(s),Yn.copy(e.ray).recast(e.near),!(fr.containsPoint(Yn.origin)===!1&&(Yn.intersectSphere(fr,go)===null||Yn.origin.distanceToSquared(go)>(e.far-e.near)**2))&&(mo.copy(s).invert(),Yn.copy(e.ray).applyMatrix4(mo),!(n.boundingBox!==null&&Yn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Yn)))}_computeIntersections(e,t,n){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,d=s.attributes.uv1,h=s.attributes.normal,u=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let v=0,M=u.length;v<M;v++){const g=u[v],m=a[g.materialIndex],E=Math.max(g.start,f.start),T=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let _=E,C=T;_<C;_+=3){const A=o.getX(_),x=o.getX(_+1),S=o.getX(_+2);r=_r(this,m,e,n,c,d,h,A,x,S),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const v=Math.max(0,f.start),M=Math.min(o.count,f.start+f.count);for(let g=v,m=M;g<m;g+=3){const E=o.getX(g),T=o.getX(g+1),_=o.getX(g+2);r=_r(this,a,e,n,c,d,h,E,T,_),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let v=0,M=u.length;v<M;v++){const g=u[v],m=a[g.materialIndex],E=Math.max(g.start,f.start),T=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let _=E,C=T;_<C;_+=3){const A=_,x=_+1,S=_+2;r=_r(this,m,e,n,c,d,h,A,x,S),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const v=Math.max(0,f.start),M=Math.min(l.count,f.start+f.count);for(let g=v,m=M;g<m;g+=3){const E=g,T=g+1,_=g+2;r=_r(this,a,e,n,c,d,h,E,T,_),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}}function jd(i,e,t,n,r,s,a,o){let l;if(e.side===Vt?l=n.intersectTriangle(a,s,r,!0,o):l=n.intersectTriangle(r,s,a,e.side===Kn,o),l===null)return null;vr.copy(o),vr.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(vr);return c<t.near||c>t.far?null:{distance:c,point:vr.clone(),object:i}}function _r(i,e,t,n,r,s,a,o,l,c){i.getVertexPosition(o,pr),i.getVertexPosition(l,mr),i.getVertexPosition(c,gr);const d=jd(i,e,t,n,pr,mr,gr,xo);if(d){const h=new N;sn.getBarycoord(xo,pr,mr,gr,h),r&&(d.uv=sn.getInterpolatedAttribute(r,o,l,c,h,new G)),s&&(d.uv1=sn.getInterpolatedAttribute(s,o,l,c,h,new G)),a&&(d.normal=sn.getInterpolatedAttribute(a,o,l,c,h,new N),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));const u={a:o,b:l,c,normal:new N,materialIndex:0};sn.getNormal(pr,mr,gr,u.normal),d.face=u,d.barycoord=h}return d}class qd extends Ot{constructor(e=null,t=1,n=1,r,s,a,o,l,c=Lt,d=Lt,h,u){super(null,a,o,l,c,d,r,s,h,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Zn=new Aa,Yd=new G(.5,.5),Sr=new N;class qi{constructor(e=new Un,t=new Un,n=new Un,r=new Un,s=new Un,a=new Un){this.planes=[e,t,n,r,s,a]}set(e,t,n,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=an,n=!1){const r=this.planes,s=e.elements,a=s[0],o=s[1],l=s[2],c=s[3],d=s[4],h=s[5],u=s[6],f=s[7],v=s[8],M=s[9],g=s[10],m=s[11],E=s[12],T=s[13],_=s[14],C=s[15];if(r[0].setComponents(c-a,f-d,m-v,C-E).normalize(),r[1].setComponents(c+a,f+d,m+v,C+E).normalize(),r[2].setComponents(c+o,f+h,m+M,C+T).normalize(),r[3].setComponents(c-o,f-h,m-M,C-T).normalize(),n)r[4].setComponents(l,u,g,_).normalize(),r[5].setComponents(c-l,f-u,m-g,C-_).normalize();else if(r[4].setComponents(c-l,f-u,m-g,C-_).normalize(),t===an)r[5].setComponents(c+l,f+u,m+g,C+_).normalize();else if(t===ji)r[5].setComponents(l,u,g,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Zn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Zn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Zn)}intersectsSprite(e){Zn.center.set(0,0,0);const t=Yd.distanceTo(e.center);return Zn.radius=.7071067811865476+t,Zn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Zn)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(Sr.x=r.normal.x>0?e.max.x:e.min.x,Sr.y=r.normal.y>0?e.max.y:e.min.y,Sr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Sr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const vo=new gt;class Ra{constructor(){this.coordinateSystem=an,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,n=this._frustums;for(let r=0;r<t.length;r++){const s=t[r];vo.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),n[r]===void 0&&(n[r]=new qi),n[r].setFromProjectionMatrix(vo,s.coordinateSystem,s.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new qi),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new Ra().copy(this)}}class Cl extends Ot{constructor(e=[],t=Mi,n,r,s,a,o,l,c,d){super(e,t,n,r,s,a,o,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Ci extends Ot{constructor(e,t,n,r,s,a,o,l,c){super(e,t,n,r,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ei extends Ot{constructor(e,t,n=fn,r,s,a,o=Lt,l=Lt,c,d=kn,h=1){if(d!==kn&&d!==Bn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:h};super(u,r,s,a,o,l,d,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new wa(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class Pl extends Ei{constructor(e,t=fn,n=Mi,r,s,a=Lt,o=Lt,l,c=kn){const d={width:e,height:e,depth:1},h=[d,d,d,d,d,d];super(e,e,t,n,r,s,a,o,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Ll extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Yt extends Wt{constructor(e=1,t=1,n=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],d=[],h=[];let u=0,f=0;v("z","y","x",-1,-1,n,t,e,a,s,0),v("z","y","x",1,-1,n,t,-e,a,s,1),v("x","z","y",1,1,e,n,t,r,a,2),v("x","z","y",1,-1,e,n,-t,r,a,3),v("x","y","z",1,-1,e,t,n,r,s,4),v("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new ut(c,3)),this.setAttribute("normal",new ut(d,3)),this.setAttribute("uv",new ut(h,2));function v(M,g,m,E,T,_,C,A,x,S,O){const R=_/x,w=C/S,I=_/2,U=C/2,L=A/2,D=x+1,H=S+1;let k=0,Q=0;const j=new N;for(let J=0;J<H;J++){const $=J*w-U;for(let ae=0;ae<D;ae++){const we=ae*R-I;j[M]=we*E,j[g]=$*T,j[m]=L,c.push(j.x,j.y,j.z),j[M]=0,j[g]=0,j[m]=A>0?1:-1,d.push(j.x,j.y,j.z),h.push(ae/x),h.push(1-J/S),k+=1}}for(let J=0;J<S;J++)for(let $=0;$<x;$++){const ae=u+$+D*J,we=u+$+D*(J+1),q=u+($+1)+D*(J+1),le=u+($+1)+D*J;l.push(ae,we,le),l.push(we,q,le),Q+=6}o.addGroup(f,Q,O),f+=Q,u+=k}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Ca extends Wt{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);const s=[],a=[],o=[],l=[],c=new N,d=new G;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let h=0,u=3;h<=t;h++,u+=3){const f=n+h/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),d.x=(a[u]/e+1)/2,d.y=(a[u+1]/e+1)/2,l.push(d.x,d.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new ut(a,3)),this.setAttribute("normal",new ut(o,3)),this.setAttribute("uv",new ut(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ca(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class mt extends Wt{constructor(e=1,t=1,n=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const d=[],h=[],u=[],f=[];let v=0;const M=[],g=n/2;let m=0;E(),a===!1&&(e>0&&T(!0),t>0&&T(!1)),this.setIndex(d),this.setAttribute("position",new ut(h,3)),this.setAttribute("normal",new ut(u,3)),this.setAttribute("uv",new ut(f,2));function E(){const _=new N,C=new N;let A=0;const x=(t-e)/n;for(let S=0;S<=s;S++){const O=[],R=S/s,w=R*(t-e)+e;for(let I=0;I<=r;I++){const U=I/r,L=U*l+o,D=Math.sin(L),H=Math.cos(L);C.x=w*D,C.y=-R*n+g,C.z=w*H,h.push(C.x,C.y,C.z),_.set(D,x,H).normalize(),u.push(_.x,_.y,_.z),f.push(U,1-R),O.push(v++)}M.push(O)}for(let S=0;S<r;S++)for(let O=0;O<s;O++){const R=M[O][S],w=M[O+1][S],I=M[O+1][S+1],U=M[O][S+1];(e>0||O!==0)&&(d.push(R,w,U),A+=3),(t>0||O!==s-1)&&(d.push(w,I,U),A+=3)}c.addGroup(m,A,0),m+=A}function T(_){const C=v,A=new G,x=new N;let S=0;const O=_===!0?e:t,R=_===!0?1:-1;for(let I=1;I<=r;I++)h.push(0,g*R,0),u.push(0,R,0),f.push(.5,.5),v++;const w=v;for(let I=0;I<=r;I++){const L=I/r*l+o,D=Math.cos(L),H=Math.sin(L);x.x=O*H,x.y=g*R,x.z=O*D,h.push(x.x,x.y,x.z),u.push(0,R,0),A.x=D*.5+.5,A.y=H*.5*R+.5,f.push(A.x,A.y),v++}for(let I=0;I<r;I++){const U=C+I,L=w+I;_===!0?d.push(L,L+1,U):d.push(L+1,L,U),S+=3}c.addGroup(m,S,_===!0?1:2),m+=S}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Pa extends mt{constructor(e=1,t=1,n=32,r=1,s=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Pa(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class mn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ge("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,r=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let r=0;const s=n.length;let a;t?a=t:a=e*n[s-1];let o=0,l=s-1,c;for(;o<=l;)if(r=Math.floor(o+(l-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===a)return r/(s-1);const d=n[r],u=n[r+1]-d,f=(a-d)/u;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const a=this.getPoint(r),o=this.getPoint(s),l=t||(a.isVector2?new G:new N);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new N,r=[],s=[],a=[],o=new N,l=new gt;for(let f=0;f<=e;f++){const v=f/e;r[f]=this.getTangentAt(v,new N)}s[0]=new N,a[0]=new N;let c=Number.MAX_VALUE;const d=Math.abs(r[0].x),h=Math.abs(r[0].y),u=Math.abs(r[0].z);d<=c&&(c=d,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],o),a[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(r[f-1],r[f]),o.length()>Number.EPSILON){o.normalize();const v=Math.acos(Je(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(o,v))}a[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(Je(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(o.crossVectors(s[0],s[e]))>0&&(f=-f);for(let v=1;v<=e;v++)s[v].applyMatrix4(l.makeRotationAxis(r[v],f*v)),a[v].crossVectors(r[v],s[v])}return{tangents:r,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}}class La extends mn{constructor(e=0,t=0,n=1,r=1,s=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new G){const n=t,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(a?s=0:s=r),this.aClockwise===!0&&!a&&(s===r?s=-r:s=s-r);const o=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const d=Math.cos(this.aRotation),h=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*d-f*h+this.aX,c=u*h+f*d+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Zd extends La{constructor(e,t,n,r,s,a){super(e,t,n,n,r,s,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Da(){let i=0,e=0,t=0,n=0;function r(s,a,o,l){i=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){r(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,d,h){let u=(a-s)/c-(o-s)/(c+d)+(o-a)/d,f=(o-a)/d-(l-a)/(d+h)+(l-o)/h;u*=d,f*=d,r(a,o,u,f)},calc:function(s){const a=s*s,o=a*s;return i+e*s+t*a+n*o}}}const _o=new N,So=new N,vs=new Da,_s=new Da,Ss=new Da;class Kt extends mn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new N){const n=t,r=this.points,s=r.length,a=(s-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:l===0&&o===s-1&&(o=s-2,l=1);let c,d;this.closed||o>0?c=r[(o-1)%s]:(So.subVectors(r[0],r[1]).add(r[0]),c=So);const h=r[o%s],u=r[(o+1)%s];if(this.closed||o+2<s?d=r[(o+2)%s]:(_o.subVectors(r[s-1],r[s-2]).add(r[s-1]),d=_o),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let v=Math.pow(c.distanceToSquared(h),f),M=Math.pow(h.distanceToSquared(u),f),g=Math.pow(u.distanceToSquared(d),f);M<1e-4&&(M=1),v<1e-4&&(v=M),g<1e-4&&(g=M),vs.initNonuniformCatmullRom(c.x,h.x,u.x,d.x,v,M,g),_s.initNonuniformCatmullRom(c.y,h.y,u.y,d.y,v,M,g),Ss.initNonuniformCatmullRom(c.z,h.z,u.z,d.z,v,M,g)}else this.curveType==="catmullrom"&&(vs.initCatmullRom(c.x,h.x,u.x,d.x,this.tension),_s.initCatmullRom(c.y,h.y,u.y,d.y,this.tension),Ss.initCatmullRom(c.z,h.z,u.z,d.z,this.tension));return n.set(vs.calc(l),_s.calc(l),Ss.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new N().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function yo(i,e,t,n,r){const s=(n-e)*.5,a=(r-t)*.5,o=i*i,l=i*o;return(2*t-2*n+s+a)*l+(-3*t+3*n-2*s-a)*o+s*i+t}function Jd(i,e){const t=1-i;return t*t*e}function $d(i,e){return 2*(1-i)*i*e}function Kd(i,e){return i*i*e}function Gi(i,e,t,n){return Jd(i,e)+$d(i,t)+Kd(i,n)}function Qd(i,e){const t=1-i;return t*t*t*e}function eu(i,e){const t=1-i;return 3*t*t*i*e}function tu(i,e){return 3*(1-i)*i*i*e}function nu(i,e){return i*i*i*e}function Hi(i,e,t,n,r){return Qd(i,e)+eu(i,t)+tu(i,n)+nu(i,r)}class Dl extends mn{constructor(e=new G,t=new G,n=new G,r=new G){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new G){const n=t,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Hi(e,r.x,s.x,a.x,o.x),Hi(e,r.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class iu extends mn{constructor(e=new N,t=new N,n=new N,r=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new N){const n=t,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Hi(e,r.x,s.x,a.x,o.x),Hi(e,r.y,s.y,a.y,o.y),Hi(e,r.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Il extends mn{constructor(e=new G,t=new G){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new G){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new G){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ru extends mn{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Nl extends mn{constructor(e=new G,t=new G,n=new G){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new G){const n=t,r=this.v0,s=this.v1,a=this.v2;return n.set(Gi(e,r.x,s.x,a.x),Gi(e,r.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Ul extends mn{constructor(e=new N,t=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new N){const n=t,r=this.v0,s=this.v1,a=this.v2;return n.set(Gi(e,r.x,s.x,a.x),Gi(e,r.y,s.y,a.y),Gi(e,r.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Fl extends mn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new G){const n=t,r=this.points,s=(r.length-1)*e,a=Math.floor(s),o=s-a,l=r[a===0?a:a-1],c=r[a],d=r[a>r.length-2?r.length-1:a+1],h=r[a>r.length-3?r.length-1:a+2];return n.set(yo(o,l.x,c.x,d.x,h.x),yo(o,l.y,c.y,d.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new G().fromArray(r))}return this}}var Br=Object.freeze({__proto__:null,ArcCurve:Zd,CatmullRomCurve3:Kt,CubicBezierCurve:Dl,CubicBezierCurve3:iu,EllipseCurve:La,LineCurve:Il,LineCurve3:ru,QuadraticBezierCurve:Nl,QuadraticBezierCurve3:Ul,SplineCurve:Fl});class su extends mn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Br[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=n){const a=r[s]-n,o=this.curves[s],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let r=0,s=this.curves;r<s.length;r++){const a=s[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const d=l[c];n&&n.equals(d)||(t.push(d),n=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(new Br[r.type]().fromJSON(r))}return this.cacheLengths=null,this}}class ha extends su{constructor(e){super(),this.type="Path",this.currentPoint=new G,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Il(this.currentPoint.clone(),new G(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){const s=new Nl(this.currentPoint.clone(),new G(e,t),new G(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,a){const o=new Dl(this.currentPoint.clone(),new G(e,t),new G(n,r),new G(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new Fl(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,r,s,a),this}absarc(e,t,n,r,s,a){return this.absellipse(e,t,n,n,r,s,a),this}ellipse(e,t,n,r,s,a,o,l){const c=this.currentPoint.x,d=this.currentPoint.y;return this.absellipse(e+c,t+d,n,r,s,a,o,l),this}absellipse(e,t,n,r,s,a,o,l){const c=new La(e,t,n,r,s,a,o,l);if(this.curves.length>0){const h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);const d=c.getPoint(1);return this.currentPoint.copy(d),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ol extends ha{constructor(e){super(e),this.uuid=Ai(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const r=e.holes[t];this.holes.push(new ha().fromJSON(r))}return this}}function au(i,e,t=2){const n=e&&e.length,r=n?e[0]*t:i.length;let s=Bl(i,0,r,t,!0);const a=[];if(!s||s.next===s.prev)return a;let o,l,c;if(n&&(s=uu(i,e,s,t)),i.length>80*t){o=i[0],l=i[1];let d=o,h=l;for(let u=t;u<r;u+=t){const f=i[u],v=i[u+1];f<o&&(o=f),v<l&&(l=v),f>d&&(d=f),v>h&&(h=v)}c=Math.max(d-o,h-l),c=c!==0?32767/c:0}return Yi(s,a,t,o,l,c,0),a}function Bl(i,e,t,n,r){let s;if(r===Mu(i,e,t,n)>0)for(let a=e;a<t;a+=n)s=Mo(a/n|0,i[a],i[a+1],s);else for(let a=t-n;a>=e;a-=n)s=Mo(a/n|0,i[a],i[a+1],s);return s&&Ti(s,s.next)&&(Ji(s),s=s.next),s}function ti(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Ti(t,t.next)||_t(t.prev,t,t.next)===0)){if(Ji(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Yi(i,e,t,n,r,s,a){if(!i)return;!a&&s&&gu(i,n,r,s);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(s?lu(i,n,r,s):ou(i)){e.push(l.i,i.i,c.i),Ji(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=cu(ti(i),e),Yi(i,e,t,n,r,s,2)):a===2&&du(i,e,t,n,r,s):Yi(ti(i),e,t,n,r,s,1);break}}}function ou(i){const e=i.prev,t=i,n=i.next;if(_t(e,t,n)>=0)return!1;const r=e.x,s=t.x,a=n.x,o=e.y,l=t.y,c=n.y,d=Math.min(r,s,a),h=Math.min(o,l,c),u=Math.max(r,s,a),f=Math.max(o,l,c);let v=n.next;for(;v!==e;){if(v.x>=d&&v.x<=u&&v.y>=h&&v.y<=f&&Bi(r,o,s,l,a,c,v.x,v.y)&&_t(v.prev,v,v.next)>=0)return!1;v=v.next}return!0}function lu(i,e,t,n){const r=i.prev,s=i,a=i.next;if(_t(r,s,a)>=0)return!1;const o=r.x,l=s.x,c=a.x,d=r.y,h=s.y,u=a.y,f=Math.min(o,l,c),v=Math.min(d,h,u),M=Math.max(o,l,c),g=Math.max(d,h,u),m=fa(f,v,e,t,n),E=fa(M,g,e,t,n);let T=i.prevZ,_=i.nextZ;for(;T&&T.z>=m&&_&&_.z<=E;){if(T.x>=f&&T.x<=M&&T.y>=v&&T.y<=g&&T!==r&&T!==a&&Bi(o,d,l,h,c,u,T.x,T.y)&&_t(T.prev,T,T.next)>=0||(T=T.prevZ,_.x>=f&&_.x<=M&&_.y>=v&&_.y<=g&&_!==r&&_!==a&&Bi(o,d,l,h,c,u,_.x,_.y)&&_t(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;T&&T.z>=m;){if(T.x>=f&&T.x<=M&&T.y>=v&&T.y<=g&&T!==r&&T!==a&&Bi(o,d,l,h,c,u,T.x,T.y)&&_t(T.prev,T,T.next)>=0)return!1;T=T.prevZ}for(;_&&_.z<=E;){if(_.x>=f&&_.x<=M&&_.y>=v&&_.y<=g&&_!==r&&_!==a&&Bi(o,d,l,h,c,u,_.x,_.y)&&_t(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function cu(i,e){let t=i;do{const n=t.prev,r=t.next.next;!Ti(n,r)&&kl(n,t,t.next,r)&&Zi(n,r)&&Zi(r,n)&&(e.push(n.i,t.i,r.i),Ji(t),Ji(t.next),t=i=r),t=t.next}while(t!==i);return ti(t)}function du(i,e,t,n,r,s){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&_u(a,o)){let l=Gl(a,o);a=ti(a,a.next),l=ti(l,l.next),Yi(a,e,t,n,r,s,0),Yi(l,e,t,n,r,s,0);return}o=o.next}a=a.next}while(a!==i)}function uu(i,e,t,n){const r=[];for(let s=0,a=e.length;s<a;s++){const o=e[s]*n,l=s<a-1?e[s+1]*n:i.length,c=Bl(i,o,l,n,!1);c===c.next&&(c.steiner=!0),r.push(vu(c))}r.sort(hu);for(let s=0;s<r.length;s++)t=fu(r[s],t);return t}function hu(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=n-r}return t}function fu(i,e){const t=pu(i,e);if(!t)return e;const n=Gl(t,i);return ti(n,n.next),ti(t,t.next)}function pu(i,e){let t=e;const n=i.x,r=i.y;let s=-1/0,a;if(Ti(i,t))return t;do{if(Ti(i,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){const h=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>s&&(s=h,a=t.x<t.next.x?t:t.next,h===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let d=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&zl(r<c?n:s,r,l,c,r<c?s:n,r,t.x,t.y)){const h=Math.abs(r-t.y)/(n-t.x);Zi(t,i)&&(h<d||h===d&&(t.x>a.x||t.x===a.x&&mu(a,t)))&&(a=t,d=h)}t=t.next}while(t!==o);return a}function mu(i,e){return _t(i.prev,i,e.prev)<0&&_t(e.next,i,i.next)<0}function gu(i,e,t,n){let r=i;do r.z===0&&(r.z=fa(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,xu(r)}function xu(i){let e,t=1;do{let n=i,r;i=null;let s=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(r=n,n=n.nextZ,o--):(r=a,a=a.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;n=a}s.nextZ=null,t*=2}while(e>1);return i}function fa(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function vu(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function zl(i,e,t,n,r,s,a,o){return(r-a)*(e-o)>=(i-a)*(s-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(r-a)*(n-o)}function Bi(i,e,t,n,r,s,a,o){return!(i===a&&e===o)&&zl(i,e,t,n,r,s,a,o)}function _u(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Su(i,e)&&(Zi(i,e)&&Zi(e,i)&&yu(i,e)&&(_t(i.prev,i,e.prev)||_t(i,e.prev,e))||Ti(i,e)&&_t(i.prev,i,i.next)>0&&_t(e.prev,e,e.next)>0)}function _t(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Ti(i,e){return i.x===e.x&&i.y===e.y}function kl(i,e,t,n){const r=Mr(_t(i,e,t)),s=Mr(_t(i,e,n)),a=Mr(_t(t,n,i)),o=Mr(_t(t,n,e));return!!(r!==s&&a!==o||r===0&&yr(i,t,e)||s===0&&yr(i,n,e)||a===0&&yr(t,i,n)||o===0&&yr(t,e,n))}function yr(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Mr(i){return i>0?1:i<0?-1:0}function Su(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&kl(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Zi(i,e){return _t(i.prev,i,i.next)<0?_t(i,e,i.next)>=0&&_t(i,i.prev,e)>=0:_t(i,e,i.prev)<0||_t(i,i.next,e)<0}function yu(i,e){let t=i,n=!1;const r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Gl(i,e){const t=pa(i.i,i.x,i.y),n=pa(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function Mo(i,e,t,n){const r=pa(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function Ji(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function pa(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Mu(i,e,t,n){let r=0;for(let s=e,a=t-n;s<t;s+=n)r+=(i[a]-i[s])*(i[s+1]+i[a+1]),a=s;return r}class bu{static triangulate(e,t,n=2){return au(e,t,n)}}class xi{static area(e){const t=e.length;let n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return xi.area(e)<0}static triangulateShape(e,t){const n=[],r=[],s=[];bo(e),Eo(n,e);let a=e.length;t.forEach(bo);for(let l=0;l<t.length;l++)r.push(a),a+=t[l].length,Eo(n,t[l]);const o=bu.triangulate(n,r);for(let l=0;l<o.length;l+=3)s.push(o.slice(l,l+3));return s}}function bo(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Eo(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Ia extends Wt{constructor(e=new Ol([new G(.5,.5),new G(-.5,.5),new G(-.5,-.5),new G(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,r=[],s=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];a(c)}this.setAttribute("position",new ut(r,3)),this.setAttribute("uv",new ut(s,2)),this.computeVertexNormals();function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,d=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1;let u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,v=t.bevelSize!==void 0?t.bevelSize:f-.1,M=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const m=t.extrudePath,E=t.UVGenerator!==void 0?t.UVGenerator:Eu;let T,_=!1,C,A,x,S;if(m){T=m.getSpacedPoints(d),_=!0,u=!1;const ie=m.isCatmullRomCurve3?m.closed:!1;C=m.computeFrenetFrames(d,ie),A=new N,x=new N,S=new N}u||(g=0,f=0,v=0,M=0);const O=o.extractPoints(c);let R=O.shape;const w=O.holes;if(!xi.isClockWise(R)){R=R.reverse();for(let ie=0,he=w.length;ie<he;ie++){const ce=w[ie];xi.isClockWise(ce)&&(w[ie]=ce.reverse())}}function U(ie){const ce=10000000000000001e-36;let Re=ie[0];for(let Se=1;Se<=ie.length;Se++){const je=Se%ie.length,Ne=ie[je],Qe=Ne.x-Re.x,et=Ne.y-Re.y,st=Qe*Qe+et*et,z=Math.max(Math.abs(Ne.x),Math.abs(Ne.y),Math.abs(Re.x),Math.abs(Re.y)),yt=ce*z*z;if(st<=yt){ie.splice(je,1),Se--;continue}Re=Ne}}U(R),w.forEach(U);const L=w.length,D=R;for(let ie=0;ie<L;ie++){const he=w[ie];R=R.concat(he)}function H(ie,he,ce){return he||at("ExtrudeGeometry: vec does not exist"),ie.clone().addScaledVector(he,ce)}const k=R.length;function Q(ie,he,ce){let Re,Se,je;const Ne=ie.x-he.x,Qe=ie.y-he.y,et=ce.x-ie.x,st=ce.y-ie.y,z=Ne*Ne+Qe*Qe,yt=Ne*st-Qe*et;if(Math.abs(yt)>Number.EPSILON){const $e=Math.sqrt(z),ht=Math.sqrt(et*et+st*st),xe=he.x-Qe/$e,St=he.y+Ne/$e,Be=ce.x-st/ht,ke=ce.y+et/ht,P=((Be-xe)*st-(ke-St)*et)/(Ne*st-Qe*et);Re=xe+Ne*P-ie.x,Se=St+Qe*P-ie.y;const y=Re*Re+Se*Se;if(y<=2)return new G(Re,Se);je=Math.sqrt(y/2)}else{let $e=!1;Ne>Number.EPSILON?et>Number.EPSILON&&($e=!0):Ne<-Number.EPSILON?et<-Number.EPSILON&&($e=!0):Math.sign(Qe)===Math.sign(st)&&($e=!0),$e?(Re=-Qe,Se=Ne,je=Math.sqrt(z)):(Re=Ne,Se=Qe,je=Math.sqrt(z/2))}return new G(Re/je,Se/je)}const j=[];for(let ie=0,he=D.length,ce=he-1,Re=ie+1;ie<he;ie++,ce++,Re++)ce===he&&(ce=0),Re===he&&(Re=0),j[ie]=Q(D[ie],D[ce],D[Re]);const J=[];let $,ae=j.concat();for(let ie=0,he=L;ie<he;ie++){const ce=w[ie];$=[];for(let Re=0,Se=ce.length,je=Se-1,Ne=Re+1;Re<Se;Re++,je++,Ne++)je===Se&&(je=0),Ne===Se&&(Ne=0),$[Re]=Q(ce[Re],ce[je],ce[Ne]);J.push($),ae=ae.concat($)}let we;if(g===0)we=xi.triangulateShape(D,w);else{const ie=[],he=[];for(let ce=0;ce<g;ce++){const Re=ce/g,Se=f*Math.cos(Re*Math.PI/2),je=v*Math.sin(Re*Math.PI/2)+M;for(let Ne=0,Qe=D.length;Ne<Qe;Ne++){const et=H(D[Ne],j[Ne],je);Ae(et.x,et.y,-Se),Re===0&&ie.push(et)}for(let Ne=0,Qe=L;Ne<Qe;Ne++){const et=w[Ne];$=J[Ne];const st=[];for(let z=0,yt=et.length;z<yt;z++){const $e=H(et[z],$[z],je);Ae($e.x,$e.y,-Se),Re===0&&st.push($e)}Re===0&&he.push(st)}}we=xi.triangulateShape(ie,he)}const q=we.length,le=v+M;for(let ie=0;ie<k;ie++){const he=u?H(R[ie],ae[ie],le):R[ie];_?(x.copy(C.normals[0]).multiplyScalar(he.x),A.copy(C.binormals[0]).multiplyScalar(he.y),S.copy(T[0]).add(x).add(A),Ae(S.x,S.y,S.z)):Ae(he.x,he.y,0)}for(let ie=1;ie<=d;ie++)for(let he=0;he<k;he++){const ce=u?H(R[he],ae[he],le):R[he];_?(x.copy(C.normals[ie]).multiplyScalar(ce.x),A.copy(C.binormals[ie]).multiplyScalar(ce.y),S.copy(T[ie]).add(x).add(A),Ae(S.x,S.y,S.z)):Ae(ce.x,ce.y,h/d*ie)}for(let ie=g-1;ie>=0;ie--){const he=ie/g,ce=f*Math.cos(he*Math.PI/2),Re=v*Math.sin(he*Math.PI/2)+M;for(let Se=0,je=D.length;Se<je;Se++){const Ne=H(D[Se],j[Se],Re);Ae(Ne.x,Ne.y,h+ce)}for(let Se=0,je=w.length;Se<je;Se++){const Ne=w[Se];$=J[Se];for(let Qe=0,et=Ne.length;Qe<et;Qe++){const st=H(Ne[Qe],$[Qe],Re);_?Ae(st.x,st.y+T[d-1].y,T[d-1].x+ce):Ae(st.x,st.y,h+ce)}}}Ee(),Ie();function Ee(){const ie=r.length/3;if(u){let he=0,ce=k*he;for(let Re=0;Re<q;Re++){const Se=we[Re];lt(Se[2]+ce,Se[1]+ce,Se[0]+ce)}he=d+g*2,ce=k*he;for(let Re=0;Re<q;Re++){const Se=we[Re];lt(Se[0]+ce,Se[1]+ce,Se[2]+ce)}}else{for(let he=0;he<q;he++){const ce=we[he];lt(ce[2],ce[1],ce[0])}for(let he=0;he<q;he++){const ce=we[he];lt(ce[0]+k*d,ce[1]+k*d,ce[2]+k*d)}}n.addGroup(ie,r.length/3-ie,0)}function Ie(){const ie=r.length/3;let he=0;me(D,he),he+=D.length;for(let ce=0,Re=w.length;ce<Re;ce++){const Se=w[ce];me(Se,he),he+=Se.length}n.addGroup(ie,r.length/3-ie,1)}function me(ie,he){let ce=ie.length;for(;--ce>=0;){const Re=ce;let Se=ce-1;Se<0&&(Se=ie.length-1);for(let je=0,Ne=d+g*2;je<Ne;je++){const Qe=k*je,et=k*(je+1),st=he+Re+Qe,z=he+Se+Qe,yt=he+Se+et,$e=he+Re+et;Fe(st,z,yt,$e)}}}function Ae(ie,he,ce){l.push(ie),l.push(he),l.push(ce)}function lt(ie,he,ce){Xe(ie),Xe(he),Xe(ce);const Re=r.length/3,Se=E.generateTopUV(n,r,Re-3,Re-2,Re-1);Ke(Se[0]),Ke(Se[1]),Ke(Se[2])}function Fe(ie,he,ce,Re){Xe(ie),Xe(he),Xe(Re),Xe(he),Xe(ce),Xe(Re);const Se=r.length/3,je=E.generateSideWallUV(n,r,Se-6,Se-3,Se-2,Se-1);Ke(je[0]),Ke(je[1]),Ke(je[3]),Ke(je[1]),Ke(je[2]),Ke(je[3])}function Xe(ie){r.push(l[ie*3+0]),r.push(l[ie*3+1]),r.push(l[ie*3+2])}function Ke(ie){s.push(ie.x),s.push(ie.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Tu(t,n,e)}static fromJSON(e,t){const n=[];for(let s=0,a=e.shapes.length;s<a;s++){const o=t[e.shapes[s]];n.push(o)}const r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new Br[r.type]().fromJSON(r)),new Ia(n,e.options)}}const Eu={generateTopUV:function(i,e,t,n,r){const s=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[r*3],d=e[r*3+1];return[new G(s,a),new G(o,l),new G(c,d)]},generateSideWallUV:function(i,e,t,n,r,s){const a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],d=e[n*3+1],h=e[n*3+2],u=e[r*3],f=e[r*3+1],v=e[r*3+2],M=e[s*3],g=e[s*3+1],m=e[s*3+2];return Math.abs(o-d)<Math.abs(a-c)?[new G(a,1-l),new G(c,1-h),new G(u,1-v),new G(M,1-m)]:[new G(o,1-l),new G(d,1-h),new G(f,1-v),new G(g,1-m)]}};function Tu(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){const s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Hn extends Wt{constructor(e=[new G(0,-.5),new G(.5,0),new G(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=Je(r,0,Math.PI*2);const s=[],a=[],o=[],l=[],c=[],d=1/t,h=new N,u=new G,f=new N,v=new N,M=new N;let g=0,m=0;for(let E=0;E<=e.length-1;E++)switch(E){case 0:g=e[E+1].x-e[E].x,m=e[E+1].y-e[E].y,f.x=m*1,f.y=-g,f.z=m*0,M.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:M.normalize(),l.push(M.x,M.y,M.z);break;default:g=e[E+1].x-e[E].x,m=e[E+1].y-e[E].y,f.x=m*1,f.y=-g,f.z=m*0,v.copy(f),f.x+=M.x,f.y+=M.y,f.z+=M.z,f.normalize(),l.push(f.x,f.y,f.z),M.copy(v)}for(let E=0;E<=t;E++){const T=n+E*d*r,_=Math.sin(T),C=Math.cos(T);for(let A=0;A<=e.length-1;A++){h.x=e[A].x*_,h.y=e[A].y,h.z=e[A].x*C,a.push(h.x,h.y,h.z),u.x=E/t,u.y=A/(e.length-1),o.push(u.x,u.y);const x=l[3*A+0]*_,S=l[3*A+1],O=l[3*A+0]*C;c.push(x,S,O)}}for(let E=0;E<t;E++)for(let T=0;T<e.length-1;T++){const _=T+E*e.length,C=_,A=_+e.length,x=_+e.length+1,S=_+1;s.push(C,A,S),s.push(x,S,A)}this.setIndex(s),this.setAttribute("position",new ut(a,3)),this.setAttribute("uv",new ut(o,2)),this.setAttribute("normal",new ut(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Hn(e.points,e.segments,e.phiStart,e.phiLength)}}class bn extends Wt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(r),c=o+1,d=l+1,h=e/o,u=t/l,f=[],v=[],M=[],g=[];for(let m=0;m<d;m++){const E=m*u-a;for(let T=0;T<c;T++){const _=T*h-s;v.push(_,-E,0),M.push(0,0,1),g.push(T/o),g.push(1-m/l)}}for(let m=0;m<l;m++)for(let E=0;E<o;E++){const T=E+c*m,_=E+c*(m+1),C=E+1+c*(m+1),A=E+1+c*m;f.push(T,_,A),f.push(_,C,A)}this.setIndex(f),this.setAttribute("position",new ut(v,3)),this.setAttribute("normal",new ut(M,3)),this.setAttribute("uv",new ut(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bn(e.width,e.height,e.widthSegments,e.heightSegments)}}class wn extends Wt{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const d=[],h=new N,u=new N,f=[],v=[],M=[],g=[];for(let m=0;m<=n;m++){const E=[],T=m/n,_=a+T*o,C=e*Math.cos(_),A=Math.sqrt(e*e-C*C);let x=0;m===0&&a===0?x=.5/t:m===n&&l===Math.PI&&(x=-.5/t);for(let S=0;S<=t;S++){const O=S/t,R=r+O*s;h.x=-A*Math.cos(R),h.y=C,h.z=A*Math.sin(R),v.push(h.x,h.y,h.z),u.copy(h).normalize(),M.push(u.x,u.y,u.z),g.push(O+x,1-T),E.push(c++)}d.push(E)}for(let m=0;m<n;m++)for(let E=0;E<t;E++){const T=d[m][E+1],_=d[m][E],C=d[m+1][E],A=d[m+1][E+1];(m!==0||a>0)&&f.push(T,_,A),(m!==n-1||l<Math.PI)&&f.push(_,C,A)}this.setIndex(f),this.setAttribute("position",new ut(v,3)),this.setAttribute("normal",new ut(M,3)),this.setAttribute("uv",new ut(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wn(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class zn extends Wt{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);const l=[],c=[],d=[],h=[],u=new N,f=new N,v=new N;for(let M=0;M<=n;M++){const g=a+M/n*o;for(let m=0;m<=r;m++){const E=m/r*s;f.x=(e+t*Math.cos(g))*Math.cos(E),f.y=(e+t*Math.cos(g))*Math.sin(E),f.z=t*Math.sin(g),c.push(f.x,f.y,f.z),u.x=e*Math.cos(E),u.y=e*Math.sin(E),v.subVectors(f,u).normalize(),d.push(v.x,v.y,v.z),h.push(m/r),h.push(M/n)}}for(let M=1;M<=n;M++)for(let g=1;g<=r;g++){const m=(r+1)*M+g-1,E=(r+1)*(M-1)+g-1,T=(r+1)*(M-1)+g,_=(r+1)*M+g;l.push(m,E,_),l.push(E,T,_)}this.setIndex(l),this.setAttribute("position",new ut(c,3)),this.setAttribute("normal",new ut(d,3)),this.setAttribute("uv",new ut(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}}class Zt extends Wt{constructor(e=new Ul(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),t=64,n=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:s};const a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new N,l=new N,c=new G;let d=new N;const h=[],u=[],f=[],v=[];M(),this.setIndex(v),this.setAttribute("position",new ut(h,3)),this.setAttribute("normal",new ut(u,3)),this.setAttribute("uv",new ut(f,2));function M(){for(let T=0;T<t;T++)g(T);g(s===!1?t:0),E(),m()}function g(T){d=e.getPointAt(T/t,d);const _=a.normals[T],C=a.binormals[T];for(let A=0;A<=r;A++){const x=A/r*Math.PI*2,S=Math.sin(x),O=-Math.cos(x);l.x=O*_.x+S*C.x,l.y=O*_.y+S*C.y,l.z=O*_.z+S*C.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=d.x+n*l.x,o.y=d.y+n*l.y,o.z=d.z+n*l.z,h.push(o.x,o.y,o.z)}}function m(){for(let T=1;T<=t;T++)for(let _=1;_<=r;_++){const C=(r+1)*(T-1)+(_-1),A=(r+1)*T+(_-1),x=(r+1)*T+_,S=(r+1)*(T-1)+_;v.push(C,A,S),v.push(A,x,S)}}function E(){for(let T=0;T<=t;T++)for(let _=0;_<=r;_++)c.x=T/t,c.y=_/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Zt(new Br[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}function wi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];if(To(r))r.isRenderTargetTexture?(Ge("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone();else if(Array.isArray(r))if(To(r[0])){const s=[];for(let a=0,o=r.length;a<o;a++)s[a]=r[a].clone();e[t][n]=s}else e[t][n]=r.slice();else e[t][n]=r}}return e}function kt(i){const e={};for(let t=0;t<i.length;t++){const n=wi(i[t]);for(const r in n)e[r]=n[r]}return e}function To(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function wu(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Hl(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:it.workingColorSpace}const Au={clone:wi,merge:kt};var Ru=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Cu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ni extends Qi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ru,this.fragmentShader=Cu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=wi(e.uniforms),this.uniformsGroups=wu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case"t":this.uniforms[n].value=t[r.value]||null;break;case"c":this.uniforms[n].value=new ze().setHex(r.value);break;case"v2":this.uniforms[n].value=new G().fromArray(r.value);break;case"v3":this.uniforms[n].value=new N().fromArray(r.value);break;case"v4":this.uniforms[n].value=new vt().fromArray(r.value);break;case"m3":this.uniforms[n].value=new Ve().fromArray(r.value);break;case"m4":this.uniforms[n].value=new gt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Pu extends ni{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Lu extends Qi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=da,this.normalScale=new G(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Et extends Lu{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new G(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Je(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new ze(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ze(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ze(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return Si('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){Si('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Du extends Qi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=cd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Iu extends Qi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Nu extends Bt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ze(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const ys=new gt,wo=new N,Ao=new N;class Uu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new G(512,512),this.mapType=qt,this.map=null,this.mapPass=null,this.matrix=new gt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new qi,this._frameExtents=new G(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;wo.setFromMatrixPosition(e.matrixWorld),t.position.copy(wo),Ao.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ao),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){ys.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(ys,e.coordinateSystem,e.reversedDepth);const s=this._frameExtents,a=r?r.z/s.x:1,o=r?r.w/s.y:1,l=r?r.x/s.x:0,c=r?r.y/s.y:0;e.coordinateSystem===ji||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(ys)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const br=new N,Er=new Ri,on=new N;class Vl extends Bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new gt,this.projectionMatrix=new gt,this.projectionMatrixInverse=new gt,this.coordinateSystem=an,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(br,Er,on),on.x===1&&on.y===1&&on.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(br,Er,on.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(br,Er,on),on.x===1&&on.y===1&&on.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(br,Er,on.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Nn=new N,Ro=new G,Co=new G;class rn extends Vl{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ua*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Jr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ua*2*Math.atan(Math.tan(Jr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Nn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Nn.x,Nn.y).multiplyScalar(-e/Nn.z),Nn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Nn.x,Nn.y).multiplyScalar(-e/Nn.z)}getViewSize(e,t){return this.getViewBounds(e,Ro,Co),t.subVectors(Co,Ro)}setViewOffset(e,t,n,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Jr*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*n/c,r*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Wl extends Vl{constructor(e=-1,t=1,n=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=d*this.view.offsetY,l=o-d*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Fu extends Uu{constructor(){super(new Wl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ms extends Nu{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.shadow=new Fu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const pi=-90,mi=1;class ma extends Bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new rn(pi,mi,e,t);r.layers=this.layers,this.add(r);const s=new rn(pi,mi,e,t);s.layers=this.layers,this.add(s);const a=new rn(pi,mi,e,t);a.layers=this.layers,this.add(a);const o=new rn(pi,mi,e,t);o.layers=this.layers,this.add(o);const l=new rn(pi,mi,e,t);l.layers=this.layers,this.add(l);const c=new rn(pi,mi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===an)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ji)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,d]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),v=e.xr.enabled;e.xr.enabled=!1;const M=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(n,0,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,1,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=M,e.setRenderTarget(n,5,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(h,u,f),e.xr.enabled=v,n.texture.needsPMREMUpdate=!0}}class Ou extends rn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}function Po(i,e,t,n){const r=Bu(n);switch(t){case gl:return i*e;case vl:return i*e/r.components*r.byteLength;case Ma:return i*e/r.components*r.byteLength;case ei:return i*e*2/r.components*r.byteLength;case ba:return i*e*2/r.components*r.byteLength;case xl:return i*e*3/r.components*r.byteLength;case un:return i*e*4/r.components*r.byteLength;case Ea:return i*e*4/r.components*r.byteLength;case Rr:case Cr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Pr:case Lr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Us:case Os:return Math.max(i,16)*Math.max(e,8)/4;case Ns:case Fs:return Math.max(i,8)*Math.max(e,8)/2;case Bs:case zs:case Gs:case Hs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ks:case Ir:case Vs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ws:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Xs:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case js:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case qs:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ys:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Zs:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Js:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case $s:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ks:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Qs:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ea:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ta:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case na:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case ia:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ra:case sa:case aa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case oa:case la:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Nr:case ca:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Bu(i){switch(i){case qt:case hl:return{byteLength:1,components:1};case Xi:case fl:case pn:return{byteLength:2,components:1};case Sa:case ya:return{byteLength:2,components:4};case fn:case _a:case dn:return{byteLength:4,components:1};case pl:case ml:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:xa}}));typeof window<"u"&&(window.__THREE__?Ge("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=xa);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Xl(){let i=null,e=!1,t=null,n=null;function r(s,a){n=i.requestAnimationFrame(r),t(s,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function zu(i){const e=new WeakMap;function t(o,l){const c=o.array,d=o.usage,h=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,d),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){const d=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,d);else{h.sort((f,v)=>f.start-v.start);let u=0;for(let f=1;f<h.length;f++){const v=h[u],M=h[f];M.start<=v.start+v.count+1?v.count=Math.max(v.count,M.start+M.count-v.start):(++u,h[u]=M)}h.length=u+1;for(let f=0,v=h.length;f<v;f++){const M=h[f];i.bufferSubData(c,M.start*d.BYTES_PER_ELEMENT,d,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}var ku=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Gu=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Hu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Vu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Xu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ju=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,qu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Yu=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Zu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ju=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$u=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ku=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Qu=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,eh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,th=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,nh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ih=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,rh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,sh=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ah=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,oh=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,lh=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,ch=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,dh=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,uh=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,hh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,fh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ph=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,mh="gl_FragColor = linearToOutputTexel( gl_FragColor );",gh=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,xh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,vh=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,_h=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Sh=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,yh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Mh=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,bh=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Eh=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Th=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,wh=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Ah=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Rh=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ch=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ph=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Lh=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Dh=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ih=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Nh=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Uh=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Fh=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Oh=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Bh=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,zh=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,kh=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Gh=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Hh=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Vh=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wh=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xh=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,jh=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,qh=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Yh=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Zh=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jh=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,$h=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Kh=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Qh=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ef=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,tf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,nf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,sf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,af=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,of=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,cf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,df=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,uf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,hf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ff=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,pf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,mf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,gf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,xf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_f=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Sf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,yf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Mf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,bf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ef=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Tf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,wf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Af=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Rf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Cf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Pf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Lf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Df=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,If=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Nf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Uf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ff=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Of=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Bf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,zf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const kf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Gf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vf=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,qf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Yf=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Zf=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Jf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$f=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kf=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Qf=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ep=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,tp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,np=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ip=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,sp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ap=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,op=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,lp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,up=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,mp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,gp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_p=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ze={alphahash_fragment:ku,alphahash_pars_fragment:Gu,alphamap_fragment:Hu,alphamap_pars_fragment:Vu,alphatest_fragment:Wu,alphatest_pars_fragment:Xu,aomap_fragment:ju,aomap_pars_fragment:qu,batching_pars_vertex:Yu,batching_vertex:Zu,begin_vertex:Ju,beginnormal_vertex:$u,bsdfs:Ku,iridescence_fragment:Qu,bumpmap_pars_fragment:eh,clipping_planes_fragment:th,clipping_planes_pars_fragment:nh,clipping_planes_pars_vertex:ih,clipping_planes_vertex:rh,color_fragment:sh,color_pars_fragment:ah,color_pars_vertex:oh,color_vertex:lh,common:ch,defaultnormal_vertex:dh,displacementmap_pars_vertex:uh,displacementmap_vertex:hh,emissivemap_fragment:fh,emissivemap_pars_fragment:ph,colorspace_fragment:mh,colorspace_pars_fragment:gh,envmap_fragment:xh,envmap_common_pars_fragment:vh,envmap_pars_fragment:_h,envmap_pars_vertex:Sh,envmap_physical_pars_fragment:Lh,envmap_vertex:yh,fog_vertex:Mh,fog_pars_vertex:bh,fog_fragment:Eh,fog_pars_fragment:Th,gradientmap_pars_fragment:wh,lightmap_pars_fragment:Ah,lights_lambert_fragment:Rh,lights_lambert_pars_fragment:Ch,lights_pars_begin:Ph,lights_toon_fragment:Dh,lights_toon_pars_fragment:Ih,lights_phong_fragment:Nh,lights_phong_pars_fragment:Uh,lights_physical_fragment:Fh,lights_physical_pars_fragment:Oh,lights_fragment_begin:Bh,lights_fragment_maps:zh,lights_fragment_end:kh,lightprobes_pars_fragment:Gh,logdepthbuf_fragment:Hh,logdepthbuf_pars_fragment:Vh,logdepthbuf_pars_vertex:Wh,logdepthbuf_vertex:Xh,map_fragment:jh,map_pars_fragment:qh,map_particle_fragment:Yh,map_particle_pars_fragment:Zh,metalnessmap_fragment:Jh,metalnessmap_pars_fragment:$h,morphinstance_vertex:Kh,morphcolor_vertex:Qh,morphnormal_vertex:ef,morphtarget_pars_vertex:tf,morphtarget_vertex:nf,normal_fragment_begin:rf,normal_fragment_maps:sf,normal_pars_fragment:af,normal_pars_vertex:of,normal_vertex:lf,normalmap_pars_fragment:cf,clearcoat_normal_fragment_begin:df,clearcoat_normal_fragment_maps:uf,clearcoat_pars_fragment:hf,iridescence_pars_fragment:ff,opaque_fragment:pf,packing:mf,premultiplied_alpha_fragment:gf,project_vertex:xf,dithering_fragment:vf,dithering_pars_fragment:_f,roughnessmap_fragment:Sf,roughnessmap_pars_fragment:yf,shadowmap_pars_fragment:Mf,shadowmap_pars_vertex:bf,shadowmap_vertex:Ef,shadowmask_pars_fragment:Tf,skinbase_vertex:wf,skinning_pars_vertex:Af,skinning_vertex:Rf,skinnormal_vertex:Cf,specularmap_fragment:Pf,specularmap_pars_fragment:Lf,tonemapping_fragment:Df,tonemapping_pars_fragment:If,transmission_fragment:Nf,transmission_pars_fragment:Uf,uv_pars_fragment:Ff,uv_pars_vertex:Of,uv_vertex:Bf,worldpos_vertex:zf,background_vert:kf,background_frag:Gf,backgroundCube_vert:Hf,backgroundCube_frag:Vf,cube_vert:Wf,cube_frag:Xf,depth_vert:jf,depth_frag:qf,distance_vert:Yf,distance_frag:Zf,equirect_vert:Jf,equirect_frag:$f,linedashed_vert:Kf,linedashed_frag:Qf,meshbasic_vert:ep,meshbasic_frag:tp,meshlambert_vert:np,meshlambert_frag:ip,meshmatcap_vert:rp,meshmatcap_frag:sp,meshnormal_vert:ap,meshnormal_frag:op,meshphong_vert:lp,meshphong_frag:cp,meshphysical_vert:dp,meshphysical_frag:up,meshtoon_vert:hp,meshtoon_frag:fp,points_vert:pp,points_frag:mp,shadow_vert:gp,shadow_frag:xp,sprite_vert:vp,sprite_frag:_p},Me={common:{diffuse:{value:new ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new G(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new ze(16777215)},opacity:{value:1},center:{value:new G(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},cn={basic:{uniforms:kt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.fog]),vertexShader:Ze.meshbasic_vert,fragmentShader:Ze.meshbasic_frag},lambert:{uniforms:kt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new ze(0)},envMapIntensity:{value:1}}]),vertexShader:Ze.meshlambert_vert,fragmentShader:Ze.meshlambert_frag},phong:{uniforms:kt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new ze(0)},specular:{value:new ze(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphong_vert,fragmentShader:Ze.meshphong_frag},standard:{uniforms:kt([Me.common,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.roughnessmap,Me.metalnessmap,Me.fog,Me.lights,{emissive:{value:new ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag},toon:{uniforms:kt([Me.common,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.gradientmap,Me.fog,Me.lights,{emissive:{value:new ze(0)}}]),vertexShader:Ze.meshtoon_vert,fragmentShader:Ze.meshtoon_frag},matcap:{uniforms:kt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,{matcap:{value:null}}]),vertexShader:Ze.meshmatcap_vert,fragmentShader:Ze.meshmatcap_frag},points:{uniforms:kt([Me.points,Me.fog]),vertexShader:Ze.points_vert,fragmentShader:Ze.points_frag},dashed:{uniforms:kt([Me.common,Me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ze.linedashed_vert,fragmentShader:Ze.linedashed_frag},depth:{uniforms:kt([Me.common,Me.displacementmap]),vertexShader:Ze.depth_vert,fragmentShader:Ze.depth_frag},normal:{uniforms:kt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,{opacity:{value:1}}]),vertexShader:Ze.meshnormal_vert,fragmentShader:Ze.meshnormal_frag},sprite:{uniforms:kt([Me.sprite,Me.fog]),vertexShader:Ze.sprite_vert,fragmentShader:Ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ze.background_vert,fragmentShader:Ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:Ze.backgroundCube_vert,fragmentShader:Ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ze.cube_vert,fragmentShader:Ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ze.equirect_vert,fragmentShader:Ze.equirect_frag},distance:{uniforms:kt([Me.common,Me.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ze.distance_vert,fragmentShader:Ze.distance_frag},shadow:{uniforms:kt([Me.lights,Me.fog,{color:{value:new ze(0)},opacity:{value:1}}]),vertexShader:Ze.shadow_vert,fragmentShader:Ze.shadow_frag}};cn.physical={uniforms:kt([cn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new G(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ve},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new G},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new ze(0)},specularColor:{value:new ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new G},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag};const Tr={r:0,b:0,g:0},Sp=new gt,jl=new Ve;jl.set(-1,0,0,0,1,0,0,0,1);function yp(i,e,t,n,r,s){const a=new ze(0);let o=r===!0?0:1,l,c,d=null,h=0,u=null;function f(E){let T=E.isScene===!0?E.background:null;if(T&&T.isTexture){const _=E.backgroundBlurriness>0;T=e.get(T,_)}return T}function v(E){let T=!1;const _=f(E);_===null?g(a,o):_&&_.isColor&&(g(_,1),T=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?t.buffers.color.setClear(0,0,0,1,s):C==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(i.autoClear||T)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function M(E,T){const _=f(T);_&&_.isCubeTexture?(c===void 0&&(c=new be(new Yt(1,1,1),new ni({name:"BackgroundCubeMaterial",uniforms:wi(cn.backgroundCube.uniforms),vertexShader:cn.backgroundCube.vertexShader,fragmentShader:cn.backgroundCube.fragmentShader,side:Vt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(C,A,x){this.matrixWorld.copyPosition(x.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Sp.makeRotationFromEuler(T.backgroundRotation)).transpose(),_.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(jl),c.material.toneMapped=it.getTransfer(_.colorSpace)!==dt,(d!==_||h!==_.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=_,h=_.version,u=i.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new be(new bn(2,2),new ni({name:"BackgroundMaterial",uniforms:wi(cn.background.uniforms),vertexShader:cn.background.vertexShader,fragmentShader:cn.background.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=it.getTransfer(_.colorSpace)!==dt,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(d!==_||h!==_.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,d=_,h=_.version,u=i.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function g(E,T){E.getRGB(Tr,Hl(i)),t.buffers.color.setClear(Tr.r,Tr.g,Tr.b,T,s)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,T=1){a.set(E),o=T,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(E){o=E,g(a,o)},render:v,addToRenderList:M,dispose:m}}function Mp(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=u(null);let s=r,a=!1;function o(w,I,U,L,D){let H=!1;const k=h(w,L,U,I);s!==k&&(s=k,c(s.object)),H=f(w,L,U,D),H&&v(w,L,U,D),D!==null&&e.update(D,i.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,_(w,I,U,L),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(D).buffer))}function l(){return i.createVertexArray()}function c(w){return i.bindVertexArray(w)}function d(w){return i.deleteVertexArray(w)}function h(w,I,U,L){const D=L.wireframe===!0;let H=n[I.id];H===void 0&&(H={},n[I.id]=H);const k=w.isInstancedMesh===!0?w.id:0;let Q=H[k];Q===void 0&&(Q={},H[k]=Q);let j=Q[U.id];j===void 0&&(j={},Q[U.id]=j);let J=j[D];return J===void 0&&(J=u(l()),j[D]=J),J}function u(w){const I=[],U=[],L=[];for(let D=0;D<t;D++)I[D]=0,U[D]=0,L[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:U,attributeDivisors:L,object:w,attributes:{},index:null}}function f(w,I,U,L){const D=s.attributes,H=I.attributes;let k=0;const Q=U.getAttributes();for(const j in Q)if(Q[j].location>=0){const $=D[j];let ae=H[j];if(ae===void 0&&(j==="instanceMatrix"&&w.instanceMatrix&&(ae=w.instanceMatrix),j==="instanceColor"&&w.instanceColor&&(ae=w.instanceColor)),$===void 0||$.attribute!==ae||ae&&$.data!==ae.data)return!0;k++}return s.attributesNum!==k||s.index!==L}function v(w,I,U,L){const D={},H=I.attributes;let k=0;const Q=U.getAttributes();for(const j in Q)if(Q[j].location>=0){let $=H[j];$===void 0&&(j==="instanceMatrix"&&w.instanceMatrix&&($=w.instanceMatrix),j==="instanceColor"&&w.instanceColor&&($=w.instanceColor));const ae={};ae.attribute=$,$&&$.data&&(ae.data=$.data),D[j]=ae,k++}s.attributes=D,s.attributesNum=k,s.index=L}function M(){const w=s.newAttributes;for(let I=0,U=w.length;I<U;I++)w[I]=0}function g(w){m(w,0)}function m(w,I){const U=s.newAttributes,L=s.enabledAttributes,D=s.attributeDivisors;U[w]=1,L[w]===0&&(i.enableVertexAttribArray(w),L[w]=1),D[w]!==I&&(i.vertexAttribDivisor(w,I),D[w]=I)}function E(){const w=s.newAttributes,I=s.enabledAttributes;for(let U=0,L=I.length;U<L;U++)I[U]!==w[U]&&(i.disableVertexAttribArray(U),I[U]=0)}function T(w,I,U,L,D,H,k){k===!0?i.vertexAttribIPointer(w,I,U,D,H):i.vertexAttribPointer(w,I,U,L,D,H)}function _(w,I,U,L){M();const D=L.attributes,H=U.getAttributes(),k=I.defaultAttributeValues;for(const Q in H){const j=H[Q];if(j.location>=0){let J=D[Q];if(J===void 0&&(Q==="instanceMatrix"&&w.instanceMatrix&&(J=w.instanceMatrix),Q==="instanceColor"&&w.instanceColor&&(J=w.instanceColor)),J!==void 0){const $=J.normalized,ae=J.itemSize,we=e.get(J);if(we===void 0)continue;const q=we.buffer,le=we.type,Ee=we.bytesPerElement,Ie=le===i.INT||le===i.UNSIGNED_INT||J.gpuType===_a;if(J.isInterleavedBufferAttribute){const me=J.data,Ae=me.isInterleavedBuffer===!0?me.stride:me.itemSize,lt=J.offset;if(me.isInstancedInterleavedBuffer||me.isInstancedBufferAttribute){for(let Fe=0;Fe<j.locationSize;Fe++)m(j.location+Fe,me.meshPerAttribute);w.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let Fe=0;Fe<j.locationSize;Fe++)g(j.location+Fe);i.bindBuffer(i.ARRAY_BUFFER,q);for(let Fe=0;Fe<j.locationSize;Fe++)T(j.location+Fe,ae/j.locationSize,le,$,Ae*Ee,(lt+ae/j.locationSize*Fe)*Ee,Ie)}else{if(J.isInstancedBufferAttribute){for(let me=0;me<j.locationSize;me++)m(j.location+me,J.meshPerAttribute);w.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let me=0;me<j.locationSize;me++)g(j.location+me);i.bindBuffer(i.ARRAY_BUFFER,q);for(let me=0;me<j.locationSize;me++)T(j.location+me,ae/j.locationSize,le,$,ae*Ee,ae/j.locationSize*me*Ee,Ie)}}else if(k!==void 0){const $=k[Q];if($!==void 0)switch($.length){case 2:i.vertexAttrib2fv(j.location,$);break;case 3:i.vertexAttrib3fv(j.location,$);break;case 4:i.vertexAttrib4fv(j.location,$);break;default:i.vertexAttrib1fv(j.location,$)}}}}E()}function C(){O();for(const w in n){const I=n[w];for(const U in I){const L=I[U];for(const D in L){const H=L[D];for(const k in H)d(H[k].object),delete H[k];delete L[D]}}delete n[w]}}function A(w){if(n[w.id]===void 0)return;const I=n[w.id];for(const U in I){const L=I[U];for(const D in L){const H=L[D];for(const k in H)d(H[k].object),delete H[k];delete L[D]}}delete n[w.id]}function x(w){for(const I in n){const U=n[I];for(const L in U){const D=U[L];if(D[w.id]===void 0)continue;const H=D[w.id];for(const k in H)d(H[k].object),delete H[k];delete D[w.id]}}}function S(w){for(const I in n){const U=n[I],L=w.isInstancedMesh===!0?w.id:0,D=U[L];if(D!==void 0){for(const H in D){const k=D[H];for(const Q in k)d(k[Q].object),delete k[Q];delete D[H]}delete U[L],Object.keys(U).length===0&&delete n[I]}}}function O(){R(),a=!0,s!==r&&(s=r,c(s.object))}function R(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:O,resetDefaultState:R,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfObject:S,releaseStatesOfProgram:x,initAttributes:M,enableAttribute:g,disableUnusedAttributes:E}}function bp(i,e,t){let n;function r(l){n=l}function s(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,d){d!==0&&(i.drawArraysInstanced(n,l,c,d),t.update(c,n,d))}function o(l,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,d);let u=0;for(let f=0;f<d;f++)u+=c[f];t.update(u,n,1)}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o}function Ep(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const x=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(x.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(x){return!(x!==un&&n.convert(x)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(x){const S=x===pn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(x!==qt&&x!==dn&&!S&&n.convert(x)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(x){if(x==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";x="mediump"}return x==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const d=l(c);d!==c&&(Ge("WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),u=t.logarithmicDepthBuffer===!0&&h===!1;t.reversedDepthBuffer===!0&&h===!1&&Ge("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&h===!0&&Ge("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=i.getParameter(i.MAX_SAMPLES),A=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:v,maxTextureSize:M,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:E,maxVaryings:T,maxFragmentUniforms:_,maxSamples:C,samples:A}}function Tp(i){const e=this;let t=null,n=0,r=!1,s=!1;const a=new Un,o=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,u){const f=h.length!==0||u||n!==0||r;return r=u,n=h.length,f},this.beginShadows=function(){s=!0,d(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,u){t=d(h,u,0)},this.setState=function(h,u,f){const v=h.clippingPlanes,M=h.clipIntersection,g=h.clipShadows,m=i.get(h);if(!r||v===null||v.length===0||s&&!g)s?d(null):c();else{const E=s?0:n,T=E*4;let _=m.clippingState||null;l.value=_,_=d(v,u,T,f);for(let C=0;C!==T;++C)_[C]=t[C];m.clippingState=_,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(h,u,f,v){const M=h!==null?h.length:0;let g=null;if(M!==0){if(g=l.value,v!==!0||g===null){const m=f+M*4,E=u.matrixWorldInverse;o.getNormalMatrix(E),(g===null||g.length<m)&&(g=new Float32Array(m));for(let T=0,_=f;T!==M;++T,_+=4)a.copy(h[T]).applyMatrix4(E,o),a.normal.toArray(g,_),g[_+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,g}}class Na extends hn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Cl(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Yt(5,5,5),s=new ni({name:"CubemapFromEquirect",uniforms:wi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Vt,blending:_i});s.uniforms.tEquirect.value=t;const a=new be(r,s),o=t.minFilter;return t.minFilter===On&&(t.minFilter=Ht),new ma(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,r);e.setRenderTarget(s)}}const Lo=256,wp=3,Ap=20,ql=256,Yl=16,Rp=3,Cp=new N,Pp=new ze;class $i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new ma(1,10,null),this._boxMesh=new be(new Yt(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,s={}){const{size:a=256,position:o=Cp}=s,l=this._renderer;this._setSize(a);const c=this._allocateTarget(),d=this._getSourceTarget(!0);t>0&&(d.texture.mipmapsAutoUpdate=!1);const h=l.autoClear,u=l.autoClearColor,f=l.autoClearDepth,v=l.autoClearStencil,M=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,M===null&&(e.background=l.getClearColor(Pp));const g=new ma(n,r,d);return g.position.copy(o),g.update(l,e),l.autoClear=h,l.autoClearColor=u,l.autoClearDepth=f,l.autoClearStencil=v,e.background=M,t>0&&(d.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=No(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Io(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Lo,bd(e))}_fromTexture(e,t){e.mapping===Mi||e.mapping===Wi?this._setSize(e.image.length===0?Lo:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){const e=this._cubeSize,t=Do(e,!1,!1),n=Math.log2(e)-wp;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Do(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){const r=this._boxMesh,s=this._cubeCamera;r.material=n,s.renderTarget=e,s.activeMipmapLevel=t;const a=e.width>>t;e.viewport.set(0,0,a,a),s.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Mi||e.mapping===Wi?(this._cubemapMaterial===null&&(this._cubemapMaterial=No()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Io()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=Lp(),this._integrationMaterial=Dp());const t=this._cubeSize,n=e.texture.mipmaps.length-1,r=this._ggxMaterial.uniforms;r.envMap.value=this._sourceTarget.texture;const s=this._integrationMaterial.uniforms;s.envMap.value=this._sourceTarget.texture,s.sourceLod.value=Math.log2(t/Yl);for(let a=0;a<=n;a++){const o=$i.lodToRoughness(a,n);if(a>n-Rp)s.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{const l=o>0?Math.log2(t)+.5*Math.log2(6/(ql*Math.pow(o,4)))+.5:0;r.roughness.value=o,r.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Ip());const n=this._blurMaterial,r=n.uniforms,s=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=s.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(s,0,n)}}function Do(i,e,t){return new Na(i,{minFilter:On,generateMipmaps:e,type:pn,colorSpace:Ur,depthBuffer:t})}function er(i,e,t){return new ni({name:i,uniforms:e,vertexShader:Ze.cube_vert,fragmentShader:t,side:Vt,blending:_i,depthTest:!1,depthWrite:!1})}function Lp(){return er("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${ql}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Dp(){return er("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Yl}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Ip(){return er("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Ap}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Io(){return er("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function No(){return er("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Np(i){let e=new WeakMap,t=new WeakMap,n=null;function r(u,f=!1){return u==null?null:f?a(u):s(u)}function s(u){if(u&&u.isTexture){const f=u.mapping;if(f===jr||f===qr)if(e.has(u)){const v=e.get(u).texture;return o(v,u.mapping)}else{const v=u.image;if(v&&v.height>0){const M=new Na(v.height);return M.fromEquirectangularTexture(i,u),e.set(u,M),u.addEventListener("dispose",c),o(M.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture&&u.isPMREMTexture!==!0){const f=u.mapping,v=f===jr||f===qr,M=f===Mi||f===Wi;if(v||M){let g=t.get(u);const m=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return n===null&&(n=new $i(i)),g=v?n.fromEquirectangular(u,g):n.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),g.texture;if(g!==void 0)return g.texture;{const E=u.image;return v&&E&&E.height>0||M&&E&&l(E)?(n===null&&(n=new $i(i)),g=v?n.fromEquirectangular(u):n.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),u.addEventListener("dispose",d),g.texture):null}}}return u}function o(u,f){return f===jr?u.mapping=Mi:f===qr&&(u.mapping=Wi),u}function l(u){let f=0;const v=6;for(let M=0;M<v;M++)u[M]!==void 0&&f++;return f===v}function c(u){const f=u.target;f.removeEventListener("dispose",c);const v=e.get(f);v!==void 0&&(e.delete(f),v.dispose())}function d(u){const f=u.target;f.removeEventListener("dispose",d);const v=t.get(f);v!==void 0&&(t.delete(f),v.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:h}}function Up(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const r=i.getExtension(n);return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&Si("WebGLRenderer: "+n+" extension not supported."),r}}}function Fp(i,e,t,n){const r={},s=new WeakMap,a=new FinalizationRegistry(v=>delete r[v]);function o(v){l(v.target)}function l(v){v.index!==null&&e.remove(v.index);for(const g in v.attributes)e.remove(v.attributes[g]);v.removeEventListener("dispose",o),delete r[v.id],a.unregister(v);const M=s.get(v);M&&(e.remove(M),s.delete(v)),n.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,t.memory.geometries--}function c(v,M){return r[M.id]!==void 0||(M.addEventListener("dispose",o),r[M.id]=new WeakRef(M),a.register(M,M.id,M),t.memory.geometries++),M}function d(v){const M=v.attributes;for(const g in M)e.update(M[g],i.ARRAY_BUFFER)}function h(v){const M=v.index,g=v.attributes.position;let m=0;if(g===void 0)return;const E=M!==null?M.array.length:g.array.length/3-1,T=g.count>=65535?Rl:Al,_=new T(Math.ceil(E/3)*6,1),C=_.array;if(M!==null){const x=M.array;m=M.version;for(let S=0,O=0;S<E;S+=3){const R=x[S+0],w=x[S+1],I=x[S+2];C[O++]=R,C[O++]=w,C[O++]=w,C[O++]=I,C[O++]=I,C[O++]=R}}else{m=g.version;for(let x=0,S=0;x<E;x+=3){const O=x+0,R=x+1,w=x+2;C[S++]=O,C[S++]=R,C[S++]=R,C[S++]=w,C[S++]=w,C[S++]=O}}_.version=m;const A=s.get(v);A&&e.remove(A),s.set(v,_)}function u(v){const M=s.get(v);if(M){const g=v.index;g!==null&&M.version<g.version&&h(v)}else h(v);return s.get(v)}function f(){for(const v in r){const M=r[v].deref();M!==void 0&&l(M)}}return{get:c,update:d,getWireframeAttribute:u,dispose:f}}function Op(i,e,t){let n;function r(h){n=h}let s,a;function o(h){s=h.type,a=h.bytesPerElement}function l(h,u){i.drawElements(n,u,s,h*a),t.update(u,n,1)}function c(h,u,f){f!==0&&(i.drawElementsInstanced(n,u,s,h*a,f),t.update(u,n,f))}function d(h,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,s,h,0,f);let M=0;for(let g=0;g<f;g++)M+=u[g];t.update(M,n,1)}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function Bp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(s/3);break;case i.LINES:t.lines+=o*(s/2);break;case i.LINE_STRIP:t.lines+=o*(s-1);break;case i.LINE_LOOP:t.lines+=o*s;break;case i.POINTS:t.points+=o*s;break;default:at("WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function zp(i,e,t){const n=new WeakMap,r=new vt;function s(a,o,l){const c=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=d!==void 0?d.length:0;let u=n.get(o);if(u===void 0||u.count!==h){let O=function(){x.dispose(),n.delete(o),o.removeEventListener("dispose",O)};u!==void 0&&u.texture.dispose();const f=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,M=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let T=0;f===!0&&(T=1),v===!0&&(T=2),M===!0&&(T=3);let _=o.attributes.position.count*T,C=1;_>e.maxTextureSize&&(C=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);const A=new Float32Array(_*C*4*h),x=new bl(A,_,C,h);x.type=dn,x.needsUpdate=!0;const S=T*4;for(let R=0;R<h;R++){const w=g[R],I=m[R],U=E[R],L=_*C*4*R;for(let D=0;D<w.count;D++){const H=D*S;f===!0&&(r.fromBufferAttribute(w,D),A[L+H+0]=r.x,A[L+H+1]=r.y,A[L+H+2]=r.z,A[L+H+3]=0),v===!0&&(r.fromBufferAttribute(I,D),A[L+H+4]=r.x,A[L+H+5]=r.y,A[L+H+6]=r.z,A[L+H+7]=0),M===!0&&(r.fromBufferAttribute(U,D),A[L+H+8]=r.x,A[L+H+9]=r.y,A[L+H+10]=r.z,A[L+H+11]=U.itemSize===4?r.w:1)}}u={count:h,texture:x,size:new G(_,C)},n.set(o,u),o.addEventListener("dispose",O)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let M=0;M<c.length;M++)f+=c[M];const v=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:s}}function kp(i,e,t,n,r){let s=new WeakMap;function a(c){const d=r.render.frame,h=c.geometry,u=e.get(c,h);if(s.get(u)!==d&&(e.update(u),s.set(u,d)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==d&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,d))),c.isSkinnedMesh){const f=c.skeleton;s.get(f)!==d&&(f.update(),s.set(f,d))}return u}function o(){s=new WeakMap}function l(c){const d=c.target;d.removeEventListener("dispose",l),n.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:a,dispose:o}}const Gp={[sl]:"LINEAR_TONE_MAPPING",[al]:"REINHARD_TONE_MAPPING",[ol]:"CINEON_TONE_MAPPING",[va]:"ACES_FILMIC_TONE_MAPPING",[cl]:"AGX_TONE_MAPPING",[dl]:"NEUTRAL_TONE_MAPPING",[ll]:"CUSTOM_TONE_MAPPING"};function Hp(i,e,t,n,r,s){const a=new hn(e,t,{type:i,depthBuffer:r,stencilBuffer:s,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null,c=null;const d=new Wt;d.setAttribute("position",new ut([-1,3,0,-1,-1,0,3,-1,0],3)),d.setAttribute("uv",new ut([0,2,0,0,2,0],2));const h=new Pu({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new be(d,h),f=new Wl(-1,1,1,-1,0,1);let v=null,M=null,g=!1,m,E=null,T=[],_=!1;this.setSize=function(C,A){a.setSize(C,A),o!==null&&o.setSize(C,A),l!==null&&l.setSize(C,A);for(let x=0;x<T.length;x++){const S=T[x];S.setSize&&S.setSize(C,A)}},this.setEffects=function(C){T=C,_=T.length>0&&T[0].isRenderPass===!0;const A=a.width,x=a.height;T.length>0&&o===null&&(o=new hn(A,x,{type:pn,depthBuffer:!1,stencilBuffer:!1}),l=new hn(A,x,{type:pn,depthBuffer:!1,stencilBuffer:!1}));const S=r===!0&&T.some(O=>O.needsDepthTexture===!0);S!==(a.depthTexture!==null)&&(S===!0&&c===null&&(c=new Ei(A,x),s===!0&&(c.format=Bn,c.type=bi)),a.dispose(),a.depthTexture=S?c:null,a.resolveDepthBuffer=S,a.storeMultisampledDepthBuffer=S);for(let O=0;O<T.length;O++){const R=T[O];R.setSize&&R.setSize(A,x),S&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(C,A){if(g||C.toneMapping===En&&T.length===0)return!1;if(E=A,A!==null){const x=A.width,S=A.height;(a.width!==x||a.height!==S)&&this.setSize(x,S)}return _===!1&&C.setRenderTarget(a),m=C.toneMapping,C.toneMapping=En,!0},this.hasRenderPass=function(){return _},this.end=function(C,A){C.toneMapping=m,g=!0;let x=a,S=o;for(let O=0;O<T.length;O++){const R=T[O];R.enabled!==!1&&(R.render(C,S,x,A),R.needsSwap!==!1&&(x=S,S=S===o?l:o))}if(v!==C.outputColorSpace||M!==C.toneMapping){v=C.outputColorSpace,M=C.toneMapping,h.defines={},it.getTransfer(v)===dt&&(h.defines.SRGB_TRANSFER="");const O=Gp[M];O&&(h.defines[O]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=x.texture,C.setRenderTarget(E),C.render(u,f),E=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),d.dispose(),h.dispose()}}const Zl=new Ot,Jl=new Ei(1,1),$l=new Pl(1),Kl=new bl,Ql=new Ld,ec=new Cl,Uo=[],Fo=[],Oo=new Float32Array(16),Bo=new Float32Array(9),zo=new Float32Array(4);function Pi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=Uo[r];if(s===void 0&&(s=new Float32Array(r),Uo[r]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(s,o)}return s}function Tt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function wt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Gr(i,e){let t=Fo[e];t===void 0&&(t=new Int32Array(e),Fo[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Vp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Wp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2fv(this.addr,e),wt(t,e)}}function Xp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Tt(t,e))return;i.uniform3fv(this.addr,e),wt(t,e)}}function jp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4fv(this.addr,e),wt(t,e)}}function qp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;zo.set(n),i.uniformMatrix2fv(this.addr,!1,zo),wt(t,n)}}function Yp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;Bo.set(n),i.uniformMatrix3fv(this.addr,!1,Bo),wt(t,n)}}function Zp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;Oo.set(n),i.uniformMatrix4fv(this.addr,!1,Oo),wt(t,n)}}function Jp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function $p(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2iv(this.addr,e),wt(t,e)}}function Kp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3iv(this.addr,e),wt(t,e)}}function Qp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4iv(this.addr,e),wt(t,e)}}function em(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function tm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2uiv(this.addr,e),wt(t,e)}}function nm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3uiv(this.addr,e),wt(t,e)}}function im(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4uiv(this.addr,e),wt(t,e)}}function Hr(i){return i.version===0&&(i.compareFunction=yl,i.needsUpdate=!0),i}function rm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?s=Hr(Jl):s=Zl,t.setTexture2D(e||s,r)}function sm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Ql,r)}function am(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_CUBE_SHADOW?s=Hr($l):s=ec,t.setTextureCube(e||s,r)}function om(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Kl,r)}function lm(i){switch(i){case 5126:return Vp;case 35664:return Wp;case 35665:return Xp;case 35666:return jp;case 35674:return qp;case 35675:return Yp;case 35676:return Zp;case 5124:case 35670:return Jp;case 35667:case 35671:return $p;case 35668:case 35672:return Kp;case 35669:case 35673:return Qp;case 5125:return em;case 36294:return tm;case 36295:return nm;case 36296:return im;case 35678:case 36198:case 36298:case 36306:case 35682:return rm;case 35679:case 36299:case 36307:return sm;case 35680:case 36300:case 36308:case 36293:return am;case 36289:case 36303:case 36311:case 36292:return om}}function cm(i,e){i.uniform1fv(this.addr,e)}function dm(i,e){const t=Pi(e,this.size,2);i.uniform2fv(this.addr,t)}function um(i,e){const t=Pi(e,this.size,3);i.uniform3fv(this.addr,t)}function hm(i,e){const t=Pi(e,this.size,4);i.uniform4fv(this.addr,t)}function fm(i,e){const t=Pi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function pm(i,e){const t=Pi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function mm(i,e){const t=Pi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function gm(i,e){i.uniform1iv(this.addr,e)}function xm(i,e){i.uniform2iv(this.addr,e)}function vm(i,e){i.uniform3iv(this.addr,e)}function _m(i,e){i.uniform4iv(this.addr,e)}function Sm(i,e){i.uniform1uiv(this.addr,e)}function ym(i,e){i.uniform2uiv(this.addr,e)}function Mm(i,e){i.uniform3uiv(this.addr,e)}function bm(i,e){i.uniform4uiv(this.addr,e)}function Em(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));let a;this.type===i.SAMPLER_2D_SHADOW?a=Hr(Jl):a=Zl;for(let o=0;o!==r;++o)t.setTexture2D(e[o]||a,s[o])}function Tm(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||Ql,s[a])}function wm(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=Hr($l):a=ec;for(let o=0;o!==r;++o)t.setTextureCube(e[o]||a,s[o])}function Am(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||Kl,s[a])}function Rm(i){switch(i){case 5126:return cm;case 35664:return dm;case 35665:return um;case 35666:return hm;case 35674:return fm;case 35675:return pm;case 35676:return mm;case 5124:case 35670:return gm;case 35667:case 35671:return xm;case 35668:case 35672:return vm;case 35669:case 35673:return _m;case 5125:return Sm;case 36294:return ym;case 36295:return Mm;case 36296:return bm;case 35678:case 36198:case 36298:case 36306:case 35682:return Em;case 35679:case 36299:case 36307:return Tm;case 35680:case 36300:case 36308:case 36293:return wm;case 36289:case 36303:case 36311:case 36292:return Am}}class Cm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=lm(t.type)}}class Pm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Rm(t.type)}}class Lm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,t[o.id],n)}}}const bs=/(\w+)(\])?(\[|\.)?/g;function ko(i,e){i.seq.push(e),i.map[e.id]=e}function Dm(i,e,t){const n=i.name,r=n.length;for(bs.lastIndex=0;;){const s=bs.exec(n),a=bs.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){ko(t,c===void 0?new Cm(o,i,e):new Pm(o,i,e));break}else{let h=t.map[o];h===void 0&&(h=new Lm(o),ko(t,h)),t=h}}}class Dr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Dm(o,l,this)}const r=[],s=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(a):s.push(a);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in t&&n.push(a)}return n}}function Go(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Im=37297;let Nm=0;function Um(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Ho=new Ve;function Fm(i){it._getMatrix(Ho,it.workingColorSpace,i);const e=`mat3( ${Ho.elements.map(t=>t.toFixed(4))} )`;switch(it.getTransfer(i)){case Fr:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return Ge("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Vo(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+Um(i.getShaderSource(e),o)}else return s}function Om(i,e){const t=Fm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const Bm={[sl]:"Linear",[al]:"Reinhard",[ol]:"Cineon",[va]:"ACESFilmic",[cl]:"AgX",[dl]:"Neutral",[ll]:"Custom"};function zm(i,e){const t=Bm[e];return t===void 0?(Ge("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const wr=new N;function km(){it.getLuminanceCoefficients(wr);const i=wr.x.toFixed(4),e=wr.y.toFixed(4),t=wr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Gm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(zi).join(`
`)}function Hm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Vm(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),a=s.name;let o=1;s.type===i.FLOAT_MAT2&&(o=2),s.type===i.FLOAT_MAT3&&(o=3),s.type===i.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function zi(i){return i!==""}function Wo(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Xo(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Wm=/^[ \t]*#include +<([\w\d./]+)>/gm;function ga(i){return i.replace(Wm,Xm)}function Xm(i,e){const t=Ze[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return ga(t)}const jm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function jo(i){return i.replace(jm,qm)}function qm(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function qo(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const Ym={[Ar]:"SHADOWMAP_TYPE_PCF",[Oi]:"SHADOWMAP_TYPE_VSM"};function Zm(i){return Ym[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Jm={[Wi]:"ENVMAP_MODE_REFRACTION"};function $m(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Jm[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Km={[rl]:"ENVMAP_BLENDING_MULTIPLY",[ad]:"ENVMAP_BLENDING_MIX",[od]:"ENVMAP_BLENDING_ADD"};function Qm(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Km[i.combine]||"ENVMAP_BLENDING_NONE"}function e0(i,e,t,n){const r=i.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Zm(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",d=$m(t),h=Qm(t),u=Gm(t),f=Hm(s),v=r.createProgram();let M,g,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(M=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(zi).join(`
`),M.length>0&&(M+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(zi).join(`
`),g.length>0&&(g+=`
`)):(M=[qo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(zi).join(`
`),g=[qo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==En?"#define TONE_MAPPING":"",t.toneMapping!==En?Ze.tonemapping_pars_fragment:"",t.toneMapping!==En?zm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ze.colorspace_pars_fragment,Om("linearToOutputTexel",t.outputColorSpace),km(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(zi).join(`
`)),a=ga(a),a=Wo(a,t),a=Xo(a,t),o=ga(o),o=Wo(o,t),o=Xo(o,t),a=jo(a),o=jo(o),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,M=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+M,g=["#define varying in",t.glslVersion===eo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===eo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const E=m+M+a,T=m+g+o,_=Go(r,r.VERTEX_SHADER,E),C=Go(r,r.FRAGMENT_SHADER,T);r.attachShader(v,_),r.attachShader(v,C),t.index0AttributeName!==void 0?r.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function A(R){if(i.debug.checkShaderErrors){const w=r.getProgramInfoLog(v)||"",I=r.getShaderInfoLog(_)||"",U=r.getShaderInfoLog(C)||"",L=w.trim(),D=I.trim(),H=U.trim();let k=!0,Q=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(k=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,v,_,C);else{const j=Vo(r,_,"vertex"),J=Vo(r,C,"fragment");at("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+L+`
`+j+`
`+J)}else L!==""?Ge("WebGLProgram: Program Info Log:",L):(D===""||H==="")&&(Q=!1);Q&&(R.diagnostics={runnable:k,programLog:L,vertexShader:{log:D,prefix:M},fragmentShader:{log:H,prefix:g}})}r.deleteShader(_),r.deleteShader(C),x=new Dr(r,v),S=Vm(r,v)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let O=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return O===!1&&(O=r.getProgramParameter(v,Im)),O},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Nm++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=_,this.fragmentShader=C,this}let t0=0;class n0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new i0(e),t.set(e,n)),n}}class i0{constructor(e){this.id=t0++,this.code=e,this.usedTimes=0}}function r0(i){return i===ei||i===Ir||i===Nr}function s0(i,e,t,n,r,s){const a=new El,o=new n0,l=new Set,c=[],d=new Map,h=n.logarithmicDepthBuffer,u={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(x){return l.add(x),x===0?"uv":`uv${x}`}function v(x,S,O,R,w,I){const U=R.fog,L=w.geometry,D=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,H=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,k=e.get(x.envMap||D,H),Q=u[x.type];let j=n.precision;x.precision!==null&&(j=n.getMaxPrecision(x.precision),j!==x.precision&&Ge("WebGLProgram.getParameters:",x.precision,"not supported, using",j,"instead."));const J=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,$=J!==void 0?J.length:0;let ae=0;L.morphAttributes.position!==void 0&&(ae=1),L.morphAttributes.normal!==void 0&&(ae=2),L.morphAttributes.color!==void 0&&(ae=3);let we,q,le,Ee;if(Q){const ye=cn[Q];we=ye.vertexShader,q=ye.fragmentShader}else{we=x.vertexShader,q=x.fragmentShader;const ye=o.getVertexShaderStage(x),ct=o.getFragmentShaderStage(x);o.update(x,ye,ct),le=ye.id,Ee=ct.id}const Ie=i.getRenderTarget(),me=i.state.buffers.depth.getReversed(),Ae=w.isInstancedMesh===!0,lt=w.isBatchedMesh===!0,Fe=!!x.map,Xe=!!x.matcap,Ke=!!k,ie=Ke&&k.isPMREMTexture===!0,he=!!x.aoMap,ce=!!x.lightMap,Re=!!x.bumpMap&&x.wireframe===!1,Se=!!x.normalMap,je=!!x.displacementMap,Ne=!!x.emissiveMap,Qe=!!x.metalnessMap,et=!!x.roughnessMap,st=x.anisotropy>0,z=x.clearcoat>0,yt=x.diffuseRoughness>0,$e=x.dispersion>0,ht=x.retroreflectivity>0,xe=x.iridescence>0,St=x.sheen>0,Be=x.transmission>0,ke=st&&!!x.anisotropyMap,P=z&&!!x.clearcoatMap,y=z&&!!x.clearcoatNormalMap,W=z&&!!x.clearcoatRoughnessMap,re=yt&&!!x.diffuseRoughnessMap,ne=xe&&!!x.iridescenceMap,de=xe&&!!x.iridescenceThicknessMap,ve=St&&!!x.sheenColorMap,K=St&&!!x.sheenRoughnessMap,ee=!!x.specularMap,fe=!!x.specularColorMap,F=!!x.specularIntensityMap,te=Be&&!!x.transmissionMap,Z=Be&&!!x.thicknessMap,pe=!!x.gradientMap,oe=!!x.alphaMap,ue=x.alphaTest>0,Ue=!!x.alphaHash,Ye=!!x.extensions;let se=En;x.toneMapped&&(Ie===null||Ie.isXRRenderTarget===!0)&&(se=i.toneMapping);const Oe=ie?k.isCompressedCubeTexture?k.image[0].mipmaps:k.mipmaps:null,qe={shaderID:Q,shaderType:x.type,shaderName:x.name,vertexShader:we,fragmentShader:q,defines:x.defines,customVertexShaderID:le,customFragmentShaderID:Ee,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:j,batching:lt,batchingColor:lt&&w._colorsTexture!==null,instancing:Ae,instancingColor:Ae&&w.instanceColor!==null,instancingMorph:Ae&&w.morphTexture!==null,outputColorSpace:Ie===null?i.outputColorSpace:Ie.isXRRenderTarget===!0?Ie.texture.colorSpace:it.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Fe,matcap:Xe,envMap:Ke,envMapMode:Ke&&k.mapping,envMapPMREM:ie,envMapMaxLod:ie?Oe.length-1:null,envMapSize:ie?Oe[0].width:null,aoMap:he,lightMap:ce,bumpMap:Re,normalMap:Se,displacementMap:je,emissiveMap:Ne,normalMapObjectSpace:Se&&x.normalMapType===dd,normalMapTangentSpace:Se&&x.normalMapType===da,packedNormalMap:Se&&x.normalMapType===da&&r0(x.normalMap.format),metalnessMap:Qe,roughnessMap:et,anisotropy:st,anisotropyMap:ke,clearcoat:z,clearcoatMap:P,clearcoatNormalMap:y,clearcoatRoughnessMap:W,diffuseRoughness:yt,diffuseRoughnessMap:re,dispersion:$e,retroreflection:ht,iridescence:xe,iridescenceMap:ne,iridescenceThicknessMap:de,sheen:St,sheenColorMap:ve,sheenRoughnessMap:K,specularMap:ee,specularColorMap:fe,specularIntensityMap:F,transmission:Be,transmissionMap:te,thicknessMap:Z,gradientMap:pe,opaque:x.transparent===!1&&x.blending===ki&&x.alphaToCoverage===!1,alphaMap:oe,alphaTest:ue,alphaHash:Ue,combine:x.combine,mapUv:Fe&&f(x.map.channel),aoMapUv:he&&f(x.aoMap.channel),lightMapUv:ce&&f(x.lightMap.channel),bumpMapUv:Re&&f(x.bumpMap.channel),normalMapUv:Se&&f(x.normalMap.channel),displacementMapUv:je&&f(x.displacementMap.channel),emissiveMapUv:Ne&&f(x.emissiveMap.channel),metalnessMapUv:Qe&&f(x.metalnessMap.channel),roughnessMapUv:et&&f(x.roughnessMap.channel),anisotropyMapUv:ke&&f(x.anisotropyMap.channel),clearcoatMapUv:P&&f(x.clearcoatMap.channel),clearcoatNormalMapUv:y&&f(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:W&&f(x.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:re&&f(x.diffuseRoughnessMap.channel),iridescenceMapUv:ne&&f(x.iridescenceMap.channel),iridescenceThicknessMapUv:de&&f(x.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&f(x.sheenColorMap.channel),sheenRoughnessMapUv:K&&f(x.sheenRoughnessMap.channel),specularMapUv:ee&&f(x.specularMap.channel),specularColorMapUv:fe&&f(x.specularColorMap.channel),specularIntensityMapUv:F&&f(x.specularIntensityMap.channel),transmissionMapUv:te&&f(x.transmissionMap.channel),thicknessMapUv:Z&&f(x.thicknessMap.channel),alphaMapUv:oe&&f(x.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(Se||st),vertexNormals:!!L.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:w.isPoints===!0&&!!L.attributes.uv&&(Fe||oe),fog:!!U,useFog:x.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||L.attributes.normal===void 0&&Se===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:me,skinning:w.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:$,morphTextureStride:ae,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:I.filter(ye=>ye.texture!==null).length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:se,decodeVideoTexture:Fe&&x.map.isVideoTexture===!0&&it.getTransfer(x.map.colorSpace)===dt,decodeVideoTextureEmissive:Ne&&x.emissiveMap.isVideoTexture===!0&&it.getTransfer(x.emissiveMap.colorSpace)===dt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ft,flipSided:x.side===Vt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Ye&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ye&&x.extensions.multiDraw===!0||lt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return qe.vertexUv1s=l.has(1),qe.vertexUv2s=l.has(2),qe.vertexUv3s=l.has(3),l.clear(),qe}function M(x){const S=[];if(x.shaderID?S.push(x.shaderID):(S.push(x.customVertexShaderID),S.push(x.customFragmentShaderID)),x.defines!==void 0)for(const O in x.defines)S.push(O),S.push(x.defines[O]);return x.isRawShaderMaterial===!1&&(g(S,x),m(S,x),S.push(i.outputColorSpace)),S.push(x.customProgramCacheKey),S.join()}function g(x,S){x.push(S.precision),x.push(S.outputColorSpace),x.push(S.envMapMode),x.push(S.envMapPMREM),x.push(S.envMapMaxLod),x.push(S.envMapSize),x.push(S.mapUv),x.push(S.alphaMapUv),x.push(S.lightMapUv),x.push(S.aoMapUv),x.push(S.bumpMapUv),x.push(S.normalMapUv),x.push(S.displacementMapUv),x.push(S.emissiveMapUv),x.push(S.metalnessMapUv),x.push(S.roughnessMapUv),x.push(S.anisotropyMapUv),x.push(S.clearcoatMapUv),x.push(S.clearcoatNormalMapUv),x.push(S.clearcoatRoughnessMapUv),x.push(S.diffuseRoughnessMapUv),x.push(S.iridescenceMapUv),x.push(S.iridescenceThicknessMapUv),x.push(S.sheenColorMapUv),x.push(S.sheenRoughnessMapUv),x.push(S.specularMapUv),x.push(S.specularColorMapUv),x.push(S.specularIntensityMapUv),x.push(S.transmissionMapUv),x.push(S.thicknessMapUv),x.push(S.combine),x.push(S.fogExp2),x.push(S.sizeAttenuation),x.push(S.morphTargetsCount),x.push(S.numSunLights),x.push(S.numDirLights),x.push(S.numPointLights),x.push(S.numSpotLights),x.push(S.numSpotLightMaps),x.push(S.numHemiLights),x.push(S.numRectAreaLights),x.push(S.numSunLightShadows),x.push(S.numDirLightShadows),x.push(S.numPointLightShadows),x.push(S.numSpotLightShadows),x.push(S.numSpotLightShadowsWithMaps),x.push(S.numLightProbes),x.push(S.numLightProbeGrids),x.push(S.shadowMapType),x.push(S.toneMapping),x.push(S.numClippingPlanes),x.push(S.numClipIntersection),x.push(S.depthPacking)}function m(x,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.retroreflection&&a.enable(24),S.diffuseRoughness&&a.enable(25),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function E(x){const S=u[x.type];let O;if(S){const R=cn[S];O=Au.clone(R.uniforms)}else O=x.uniforms;return O}function T(x,S){let O=d.get(S);return O!==void 0?++O.usedTimes:(O=new e0(i,S,x,r),c.push(O),d.set(S,O)),O}function _(x){if(--x.usedTimes===0){const S=c.indexOf(x);c[S]=c[c.length-1],c.pop(),d.delete(x.cacheKey),x.destroy()}}function C(x){o.remove(x)}function A(){o.dispose()}return{getParameters:v,getProgramCacheKey:M,getUniforms:E,acquireProgram:T,releaseProgram:_,releaseShaderCache:C,programs:c,dispose:A}}function a0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function r(a,o,l){i.get(a)[o]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function o0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Yo(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Zo(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,v,M,g,m){let E=i[e];return E===void 0?(E={id:u.id,object:u,geometry:f,material:v,materialVariant:a(u),groupOrder:M,renderOrder:u.renderOrder,z:g,group:m},i[e]=E):(E.id=u.id,E.object=u,E.geometry=f,E.material=v,E.materialVariant=a(u),E.groupOrder=M,E.renderOrder=u.renderOrder,E.z=g,E.group=m),e++,E}function l(u,f,v,M,g,m,E){E.reversedDepth===!0&&(g=-g);const T=o(u,f,v,M,g,m);v.transmission>0?n.push(T):v.transparent===!0?r.push(T):t.push(T)}function c(u,f,v,M,g,m){const E=o(u,f,v,M,g,m);v.transmission>0?n.unshift(E):v.transparent===!0?r.unshift(E):t.unshift(E)}function d(u,f){t.length>1&&t.sort(u||o0),n.length>1&&n.sort(f||Yo),r.length>1&&r.sort(f||Yo)}function h(){for(let u=e,f=i.length;u<f;u++){const v=i[u];if(v.id===null)break;v.id=null,v.object=null,v.geometry=null,v.material=null,v.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:l,unshift:c,finish:h,sort:d}}function l0(){let i=new WeakMap;function e(n,r){const s=i.get(n);let a;return s===void 0?(a=new Zo,i.set(n,[a])):r>=s.length?(a=new Zo,s.push(a)):a=s[r],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function c0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new N,color:new ze};break;case"SpotLight":t={position:new N,direction:new N,color:new ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new ze,groundColor:new ze};break;case"RectAreaLight":t={color:new ze,position:new N,halfWidth:new N,halfHeight:new N};break}return i[e.id]=t,t}}}function d0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new G};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new G};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new G,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let u0=0;function h0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function f0(i){const e=new c0,t=d0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);const r=new N,s=new gt,a=new gt;function o(c){let d=0,h=0,u=0;for(let I=0;I<9;I++)n.probe[I].set(0,0,0);let f=0,v=0,M=0,g=0,m=0,E=0,T=0,_=0,C=0,A=0,x=0,S=0,O=0,R=0;c.sort(h0);for(let I=0,U=c.length;I<U;I++){const L=c[I],D=L.color,H=L.intensity,k=L.distance;let Q=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===ei?Q=L.shadow.map.texture:Q=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)d+=D.r*H,h+=D.g*H,u+=D.b*H;else if(L.isLightProbe){for(let j=0;j<9;j++)n.probe[j].addScaledVector(L.sh.coefficients[j],H);R++}else if(L.isSunLight){const j=e.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const J=L.shadow,$=t.get(L);$.shadowIntensity=J.intensity,$.shadowBias=J.bias,$.shadowNormalBias=J.normalBias,$.shadowRadius=J.radius,$.shadowMapSize.copy(J.mapSize).multiply(J.getFrameExtents()),n.sunShadow[v]=$,n.sunShadowMap[v]=Q;const ae=J.getViewportCount();for(let we=0;we<ae;we++)n.sunShadowMatrix[M+we]=J.getMatrix(we),n.sunShadowCascade[M+we]=J._cascadeData[we];M+=ae,v++}n.sun[f]=j,f++}else if(L.isDirectionalLight){const j=e.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const J=L.shadow,$=t.get(L);$.shadowIntensity=J.intensity,$.shadowBias=J.bias,$.shadowNormalBias=J.normalBias,$.shadowRadius=J.radius,$.shadowMapSize=J.mapSize,n.directionalShadow[g]=$,n.directionalShadowMap[g]=Q,n.directionalShadowMatrix[g]=L.shadow.matrix,C++}n.directional[g]=j,g++}else if(L.isSpotLight){const j=e.get(L);j.position.setFromMatrixPosition(L.matrixWorld),j.color.copy(D).multiplyScalar(H),j.distance=k,j.coneCos=Math.cos(L.angle),j.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),j.decay=L.decay,n.spot[E]=j;const J=L.shadow;if(L.map&&(n.spotLightMap[S]=L.map,S++,J.updateMatrices(L),L.castShadow&&O++),n.spotLightMatrix[E]=J.matrix,L.castShadow){const $=t.get(L);$.shadowIntensity=J.intensity,$.shadowBias=J.bias,$.shadowNormalBias=J.normalBias,$.shadowRadius=J.radius,$.shadowMapSize=J.mapSize,n.spotShadow[E]=$,n.spotShadowMap[E]=Q,x++}E++}else if(L.isRectAreaLight){const j=e.get(L);j.color.copy(D).multiplyScalar(H),j.halfWidth.set(L.width*.5,0,0),j.halfHeight.set(0,L.height*.5,0),n.rectArea[T]=j,T++}else if(L.isPointLight){const j=e.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),j.distance=L.distance,j.decay=L.decay,L.castShadow){const J=L.shadow,$=t.get(L);$.shadowIntensity=J.intensity,$.shadowBias=J.bias,$.shadowNormalBias=J.normalBias,$.shadowRadius=J.radius,$.shadowMapSize=J.mapSize,$.shadowCameraNear=J.camera.near,$.shadowCameraFar=J.camera.far,n.pointShadow[m]=$,n.pointShadowMap[m]=Q,n.pointShadowMatrix[m]=L.shadow.matrix,A++}n.point[m]=j,m++}else if(L.isHemisphereLight){const j=e.get(L);j.skyColor.copy(L.color).multiplyScalar(H),j.groundColor.copy(L.groundColor).multiplyScalar(H),n.hemi[_]=j,_++}}T>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Me.LTC_FLOAT_1,n.rectAreaLTC2=Me.LTC_FLOAT_2):(n.rectAreaLTC1=Me.LTC_HALF_1,n.rectAreaLTC2=Me.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=h,n.ambient[2]=u;const w=n.hash;(w.sunLength!==f||w.directionalLength!==g||w.pointLength!==m||w.spotLength!==E||w.rectAreaLength!==T||w.hemiLength!==_||w.numSunShadows!==v||w.numDirectionalShadows!==C||w.numPointShadows!==A||w.numSpotShadows!==x||w.numSpotMaps!==S||w.numLightProbes!==R)&&(n.sun.length=f,n.directional.length=g,n.spot.length=E,n.rectArea.length=T,n.point.length=m,n.hemi.length=_,n.sunShadow.length=v,n.sunShadowMap.length=v,n.sunShadowMatrix.length=M,n.sunShadowCascade.length=M,n.directionalShadow.length=C,n.directionalShadowMap.length=C,n.directionalShadowMatrix.length=C,n.pointShadow.length=A,n.pointShadowMap.length=A,n.pointShadowMatrix.length=A,n.spotShadow.length=x,n.spotShadowMap.length=x,n.spotLightMatrix.length=x+S-O,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=O,n.numLightProbes=R,w.sunLength=f,w.directionalLength=g,w.pointLength=m,w.spotLength=E,w.rectAreaLength=T,w.hemiLength=_,w.numSunShadows=v,w.numDirectionalShadows=C,w.numPointShadows=A,w.numSpotShadows=x,w.numSpotMaps=S,w.numLightProbes=R,n.version=u0++)}function l(c,d){let h=0,u=0,f=0,v=0,M=0,g=0;const m=d.matrixWorldInverse;for(let E=0,T=c.length;E<T;E++){const _=c[E];if(_.isSunLight){const C=n.sun[h];C.direction.setFromMatrixPosition(_.matrixWorld),C.direction.transformDirection(m),h++}else if(_.isDirectionalLight){const C=n.directional[u];C.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(m),u++}else if(_.isSpotLight){const C=n.spot[v];C.position.setFromMatrixPosition(_.matrixWorld),C.position.applyMatrix4(m),C.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(m),v++}else if(_.isRectAreaLight){const C=n.rectArea[M];C.position.setFromMatrixPosition(_.matrixWorld),C.position.applyMatrix4(m),a.identity(),s.copy(_.matrixWorld),s.premultiply(m),a.extractRotation(s),C.halfWidth.set(_.width*.5,0,0),C.halfHeight.set(0,_.height*.5,0),C.halfWidth.applyMatrix4(a),C.halfHeight.applyMatrix4(a),M++}else if(_.isPointLight){const C=n.point[f];C.position.setFromMatrixPosition(_.matrixWorld),C.position.applyMatrix4(m),f++}else if(_.isHemisphereLight){const C=n.hemi[g];C.direction.setFromMatrixPosition(_.matrixWorld),C.direction.transformDirection(m),g++}}}return{setup:o,setupView:l,state:n}}function Jo(i){const e=new f0(i),t=[],n=[],r=[];function s(h){d.camera=h,t.length=0,n.length=0,r.length=0}function a(h){h.isLightProbeGrid?r.push(h):t.push(h)}function o(h){n.push(h)}function l(){e.setup(t),r.sort((h,u)=>h.priority-u.priority||h.id-u.id)}function c(h){e.setupView(t,h)}const d={lightsArray:t,shadowsArray:n,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:d,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function p0(i){let e=new WeakMap;function t(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new Jo(i),e.set(r,[o])):s>=a.length?(o=new Jo(i),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const m0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,g0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,x0=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],v0=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],$o=new gt,Fi=new N,Es=new N;function _0(i,e,t){let n=new qi;const r=new G,s=new G,a=new vt,o=new Du,l=new Iu,c={},d=t.maxTextureSize,h={[Kn]:Vt,[Vt]:Kn,[Ft]:Ft},u=new ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new G},radius:{value:4}},vertexShader:m0,fragmentShader:g0}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const v=new Wt;v.setAttribute("position",new $n(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new be(v,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ar;let m=this.type;this.render=function(A,x,S){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||A.length===0)return;this.type===Gc&&(Ge("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ar);const O=i.getRenderTarget(),R=i.getActiveCubeFace(),w=i.getActiveMipmapLevel(),I=i.state;I.setBlending(_i),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);const U=m!==this.type;U&&x.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(D=>D.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,D=A.length;L<D;L++){const H=A[L],k=H.shadow;if(k===void 0){Ge("WebGLShadowMap:",H,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;r.copy(k.mapSize);const Q=k.getFrameExtents();r.multiply(Q),s.copy(k.mapSize),(r.x>d||r.y>d)&&(r.x>d&&(s.x=Math.floor(d/Q.x),r.x=s.x*Q.x,k.mapSize.x=s.x),r.y>d&&(s.y=Math.floor(d/Q.y),r.y=s.y*Q.y,k.mapSize.y=s.y));const j=i.state.buffers.depth.getReversed();if(k.camera._reversedDepth=j,k.map===null||U===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===Oi){if(H.isPointLight){Ge("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new hn(r.x,r.y,{format:ei,type:pn,minFilter:Ht,magFilter:Ht,generateMipmaps:!1}),k.map.texture.name=H.name+".shadowMap",k.map.depthTexture=new Ei(r.x,r.y,dn),k.map.depthTexture.name=H.name+".shadowMapDepth",k.map.depthTexture.format=kn,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Lt,k.map.depthTexture.magFilter=Lt}else H.isPointLight?(k.map=new Na(r.x),k.map.depthTexture=new Pl(r.x,fn)):(k.map=new hn(r.x,r.y),k.map.depthTexture=new Ei(r.x,r.y,fn)),k.map.depthTexture.name=H.name+".shadowMap",k.map.depthTexture.format=kn,this.type===Ar?(k.map.depthTexture.compareFunction=j?Sl:_l,k.map.depthTexture.minFilter=Ht,k.map.depthTexture.magFilter=Ht):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Lt,k.map.depthTexture.magFilter=Lt);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==r.x||k.map.height!==r.y)&&k.map.setSize(r.x,r.y);const J=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();H.isPointLight!==!0&&k.updateMatrices(H,S);const $=k.camera.layers.mask&4294967294?k.camera.layers:S.layers;for(let ae=0;ae<J;ae++){const we=k.getCamera(ae);if(H.isPointLight){const q=k.camera,le=k.matrix,Ee=H.distance||q.far;Ee!==q.far&&(q.far=Ee,q.updateProjectionMatrix()),Fi.setFromMatrixPosition(H.matrixWorld),q.position.copy(Fi),Es.copy(q.position),Es.add(x0[ae]),q.up.copy(v0[ae]),q.lookAt(Es),q.updateMatrixWorld(),le.makeTranslation(-Fi.x,-Fi.y,-Fi.z),$o.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse),k._frustum.setFromProjectionMatrix($o,q.coordinateSystem,q.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)i.setRenderTarget(k.map,ae),i.clear();else{ae===0&&(i.setRenderTarget(k.map),i.clear());const q=k.getViewport(ae);a.set(s.x*q.x,s.y*q.y,s.x*q.z,s.y*q.w),I.viewport(a)}n=k.getFrustum(ae),_(x,S,we,H,$,this.type)}k.isPointLightShadow!==!0&&this.type===Oi&&E(k,S),k.needsUpdate=!1}m=this.type,g.needsUpdate=!1,i.setRenderTarget(O,R,w)};function E(A,x){const S=e.update(M);u.defines.VSM_SAMPLES!==A.blurSamples&&(u.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null?A.mapPass=new hn(r.x,r.y,{format:ei,type:pn}):(A.mapPass.width!==A.map.width||A.mapPass.height!==A.map.height)&&A.mapPass.setSize(A.map.width,A.map.height),u.uniforms.shadow_pass.value=A.map.depthTexture,u.uniforms.resolution.value.set(A.map.width,A.map.height),u.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(x,null,S,u,M,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value.set(A.map.width,A.map.height),f.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(x,null,S,f,M,null)}function T(A,x,S,O){let R=null;const w=S.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(w!==void 0)R=w;else if(R=S.isPointLight===!0?l:o,i.localClippingEnabled&&x.clipShadows===!0&&Array.isArray(x.clippingPlanes)&&x.clippingPlanes.length!==0||x.displacementMap&&x.displacementScale!==0||x.alphaMap&&x.alphaTest>0||x.map&&x.alphaTest>0||x.alphaToCoverage===!0){const I=R.uuid,U=x.uuid;let L=c[I];L===void 0&&(L={},c[I]=L);let D=L[U];D===void 0&&(D=R.clone(),L[U]=D,x.addEventListener("dispose",C)),R=D}if(R.visible=x.visible,R.wireframe=x.wireframe,O===Oi?R.side=x.shadowSide!==null?x.shadowSide:x.side:R.side=x.shadowSide!==null?x.shadowSide:h[x.side],R.alphaMap=x.alphaMap,R.alphaTest=x.alphaToCoverage===!0?.5:x.alphaTest,R.map=x.map,R.clipShadows=x.clipShadows,R.clippingPlanes=x.clippingPlanes,R.clipIntersection=x.clipIntersection,R.displacementMap=x.displacementMap,R.displacementScale=x.displacementScale,R.displacementBias=x.displacementBias,R.wireframeLinewidth=x.wireframeLinewidth,R.linewidth=x.linewidth,S.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const I=i.properties.get(R);I.light=S}return R}function _(A,x,S,O,R,w){if(A.visible===!1)return;if(A.layers.test(R)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&w===Oi)&&(!A.frustumCulled||A.intersectsFrustum(n))){A.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,A.matrixWorld);const L=e.update(A),D=A.material;if(Array.isArray(D)){const H=L.groups;for(let k=0,Q=H.length;k<Q;k++){const j=H[k],J=D[j.materialIndex];if(J&&J.visible){const $=T(A,J,O,w);A.onBeforeShadow(i,A,x,S,L,$,j),i.renderBufferDirect(S,null,L,$,A,j),A.onAfterShadow(i,A,x,S,L,$,j)}}}else if(D.visible){const H=T(A,D,O,w);A.onBeforeShadow(i,A,x,S,L,H,null),i.renderBufferDirect(S,null,L,H,A,null),A.onAfterShadow(i,A,x,S,L,H,null)}}const U=A.children;for(let L=0,D=U.length;L<D;L++)_(U[L],x,S,O,R,w)}function C(A){A.target.removeEventListener("dispose",C);for(const S in c){const O=c[S],R=A.target.uuid;R in O&&(O[R].dispose(),delete O[R])}}}function S0(i,e){function t(){let F=!1;const te=new vt;let Z=null;const pe=new vt(0,0,0,0);return{setMask:function(oe){Z!==oe&&!F&&(i.colorMask(oe,oe,oe,oe),Z=oe)},setLocked:function(oe){F=oe},setClear:function(oe,ue,Ue,Ye,se){se===!0&&(oe*=Ye,ue*=Ye,Ue*=Ye),te.set(oe,ue,Ue,Ye),pe.equals(te)===!1&&(i.clearColor(oe,ue,Ue,Ye),pe.copy(te))},reset:function(){F=!1,Z=null,pe.set(-1,0,0,0)}}}function n(){let F=!1,te=!1,Z=null,pe=null,oe=null;return{setReversed:function(ue){if(te!==ue){const Ue=e.get("EXT_clip_control");ue?Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.ZERO_TO_ONE_EXT):Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.NEGATIVE_ONE_TO_ONE_EXT),te=ue;const Ye=oe;oe=null,this.setClear(Ye)}},getReversed:function(){return te},setTest:function(ue){ue?me(i.DEPTH_TEST):Ae(i.DEPTH_TEST)},setMask:function(ue){Z!==ue&&!F&&(i.depthMask(ue),Z=ue)},setFunc:function(ue){if(te&&(ue=yd[ue]),pe!==ue){switch(ue){case ws:i.depthFunc(i.NEVER);break;case As:i.depthFunc(i.ALWAYS);break;case Rs:i.depthFunc(i.LESS);break;case Vi:i.depthFunc(i.LEQUAL);break;case Cs:i.depthFunc(i.EQUAL);break;case Ps:i.depthFunc(i.GEQUAL);break;case Ls:i.depthFunc(i.GREATER);break;case Ds:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=ue}},setLocked:function(ue){F=ue},setClear:function(ue){oe!==ue&&(oe=ue,te&&(ue=1-ue),i.clearDepth(ue))},reset:function(){F=!1,Z=null,pe=null,oe=null,te=!1}}}function r(){let F=!1,te=null,Z=null,pe=null,oe=null,ue=null,Ue=null,Ye=null,se=null;return{setTest:function(Oe){F||(Oe?me(i.STENCIL_TEST):Ae(i.STENCIL_TEST))},setMask:function(Oe){te!==Oe&&!F&&(i.stencilMask(Oe),te=Oe)},setFunc:function(Oe,qe,ye){(Z!==Oe||pe!==qe||oe!==ye)&&(i.stencilFunc(Oe,qe,ye),Z=Oe,pe=qe,oe=ye)},setOp:function(Oe,qe,ye){(ue!==Oe||Ue!==qe||Ye!==ye)&&(i.stencilOp(Oe,qe,ye),ue=Oe,Ue=qe,Ye=ye)},setLocked:function(Oe){F=Oe},setClear:function(Oe){se!==Oe&&(i.clearStencil(Oe),se=Oe)},reset:function(){F=!1,te=null,Z=null,pe=null,oe=null,ue=null,Ue=null,Ye=null,se=null}}}const s=new t,a=new n,o=new r;let l={};const c=new WeakMap;let d={},h={},u={},f=new WeakMap,v=[],M=null,g=!1,m=null,E=null,T=null,_=null,C=null,A=null,x=null,S=new ze(0,0,0),O=0,R=!1,w=null,I=null,U=null,L=null,D=null;const H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,Q=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(j)[1]),k=Q>=1):j.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),k=Q>=2);let J=null,$={};const ae=i.getParameter(i.SCISSOR_BOX),we=i.getParameter(i.VIEWPORT),q=new vt().fromArray(ae),le=new vt().fromArray(we);function Ee(F,te,Z,pe){const oe=new Uint8Array(4),ue=i.createTexture();i.bindTexture(F,ue),i.texParameteri(F,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(F,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ue=0;Ue<Z;Ue++)F===i.TEXTURE_3D||F===i.TEXTURE_2D_ARRAY?i.texImage3D(te,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,oe):i.texImage2D(te+Ue,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,oe);return ue}const Ie={};Ie[i.TEXTURE_2D]=Ee(i.TEXTURE_2D,i.TEXTURE_2D,1),Ie[i.TEXTURE_CUBE_MAP]=Ee(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ie[i.TEXTURE_2D_ARRAY]=Ee(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ie[i.TEXTURE_3D]=Ee(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),me(i.DEPTH_TEST),a.setFunc(Vi),Re(!1),Se(Ja),me(i.CULL_FACE),he(_i);function me(F){d[F]!==!0&&(i.enable(F),d[F]=!0)}function Ae(F){d[F]!==!1&&(i.disable(F),d[F]=!1)}function lt(F,te){return u[F]!==te?(i.bindFramebuffer(F,te),u[F]=te,F===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=te),F===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=te),!0):!1}function Fe(F,te){let Z=v,pe=!1;if(F){Z=f.get(te),Z===void 0&&(Z=[],f.set(te,Z));const oe=F.textures;if(Z.length!==oe.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let ue=0,Ue=oe.length;ue<Ue;ue++)Z[ue]=i.COLOR_ATTACHMENT0+ue;Z.length=oe.length,pe=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,pe=!0);pe&&i.drawBuffers(Z)}function Xe(F){return M!==F?(i.useProgram(F),M=F,!0):!1}const Ke={[gi]:i.FUNC_ADD,[Vc]:i.FUNC_SUBTRACT,[Wc]:i.FUNC_REVERSE_SUBTRACT};Ke[Xc]=i.MIN,Ke[jc]=i.MAX;const ie={[qc]:i.ZERO,[Yc]:i.ONE,[Zc]:i.SRC_COLOR,[nl]:i.SRC_ALPHA,[td]:i.SRC_ALPHA_SATURATE,[Qc]:i.DST_COLOR,[$c]:i.DST_ALPHA,[Jc]:i.ONE_MINUS_SRC_COLOR,[il]:i.ONE_MINUS_SRC_ALPHA,[ed]:i.ONE_MINUS_DST_COLOR,[Kc]:i.ONE_MINUS_DST_ALPHA,[nd]:i.CONSTANT_COLOR,[id]:i.ONE_MINUS_CONSTANT_COLOR,[rd]:i.CONSTANT_ALPHA,[sd]:i.ONE_MINUS_CONSTANT_ALPHA};function he(F,te,Z,pe,oe,ue,Ue,Ye,se,Oe){if(F===_i){g===!0&&(Ae(i.BLEND),g=!1);return}if(g===!1&&(me(i.BLEND),g=!0),F!==Hc){if(F!==m||Oe!==R){if((E!==gi||C!==gi)&&(i.blendEquation(i.FUNC_ADD),E=gi,C=gi),Oe)switch(F){case ki:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case $a:i.blendFunc(i.ONE,i.ONE);break;case Ka:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Qa:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:at("WebGLState: Invalid blending: ",F);break}else switch(F){case ki:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case $a:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Ka:at("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Qa:at("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:at("WebGLState: Invalid blending: ",F);break}T=null,_=null,A=null,x=null,S.set(0,0,0),O=0,m=F,R=Oe}return}oe=oe||te,ue=ue||Z,Ue=Ue||pe,(te!==E||oe!==C)&&(i.blendEquationSeparate(Ke[te],Ke[oe]),E=te,C=oe),(Z!==T||pe!==_||ue!==A||Ue!==x)&&(i.blendFuncSeparate(ie[Z],ie[pe],ie[ue],ie[Ue]),T=Z,_=pe,A=ue,x=Ue),(Ye.equals(S)===!1||se!==O)&&(i.blendColor(Ye.r,Ye.g,Ye.b,se),S.copy(Ye),O=se),m=F,R=!1}function ce(F,te){F.side===Ft?Ae(i.CULL_FACE):me(i.CULL_FACE);let Z=F.side===Vt;te&&(Z=!Z),Re(Z),F.blending===ki&&F.transparent===!1?he(_i):he(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),s.setMask(F.colorWrite);const pe=F.stencilWrite;o.setTest(pe),pe&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Ne(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?me(i.SAMPLE_ALPHA_TO_COVERAGE):Ae(i.SAMPLE_ALPHA_TO_COVERAGE)}function Re(F){w!==F&&(F?i.frontFace(i.CW):i.frontFace(i.CCW),w=F)}function Se(F){F!==zc?(me(i.CULL_FACE),F!==I&&(F===Ja?i.cullFace(i.BACK):F===kc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ae(i.CULL_FACE),I=F}function je(F){F!==U&&(k&&i.lineWidth(F),U=F)}function Ne(F,te,Z){F?(me(i.POLYGON_OFFSET_FILL),(L!==te||D!==Z)&&(L=te,D=Z,a.getReversed()&&(te=-te,Z=-Z),i.polygonOffset(te,Z))):Ae(i.POLYGON_OFFSET_FILL)}function Qe(F){F?me(i.SCISSOR_TEST):Ae(i.SCISSOR_TEST)}function et(F){F===void 0&&(F=i.TEXTURE0+H-1),J!==F&&(i.activeTexture(F),J=F)}function st(F,te,Z){Z===void 0&&(J===null?Z=i.TEXTURE0+H-1:Z=J);let pe=$[Z];pe===void 0&&(pe={type:void 0,texture:void 0},$[Z]=pe),(pe.type!==F||pe.texture!==te)&&(J!==Z&&(i.activeTexture(Z),J=Z),i.bindTexture(F,te||Ie[F]),pe.type=F,pe.texture=te)}function z(){const F=$[J];F!==void 0&&F.type!==void 0&&(i.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function yt(){try{i.compressedTexImage2D(...arguments)}catch(F){at("WebGLState:",F)}}function $e(){try{i.compressedTexImage3D(...arguments)}catch(F){at("WebGLState:",F)}}function ht(){try{i.texSubImage2D(...arguments)}catch(F){at("WebGLState:",F)}}function xe(){try{i.texSubImage3D(...arguments)}catch(F){at("WebGLState:",F)}}function St(){try{i.compressedTexSubImage2D(...arguments)}catch(F){at("WebGLState:",F)}}function Be(){try{i.compressedTexSubImage3D(...arguments)}catch(F){at("WebGLState:",F)}}function ke(){try{i.texStorage2D(...arguments)}catch(F){at("WebGLState:",F)}}function P(){try{i.texStorage3D(...arguments)}catch(F){at("WebGLState:",F)}}function y(){try{i.texImage2D(...arguments)}catch(F){at("WebGLState:",F)}}function W(){try{i.texImage3D(...arguments)}catch(F){at("WebGLState:",F)}}function re(F){return h[F]!==void 0?h[F]:i.getParameter(F)}function ne(F,te){h[F]!==te&&(i.pixelStorei(F,te),h[F]=te)}function de(F){q.equals(F)===!1&&(i.scissor(F.x,F.y,F.z,F.w),q.copy(F))}function ve(F){le.equals(F)===!1&&(i.viewport(F.x,F.y,F.z,F.w),le.copy(F))}function K(F,te){let Z=c.get(te);Z===void 0&&(Z=new WeakMap,c.set(te,Z));let pe=Z.get(F);pe===void 0&&(pe=i.getUniformBlockIndex(te,F.name),i.uniformBlockBinding(te,pe,pe),Z.set(F,pe))}function ee(F,te,Z){const oe=c.get(te).get(F);l[oe]!==Z&&(i.bindBufferBase(i.UNIFORM_BUFFER,oe,Z),l[oe]=Z)}function fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},h={},J=null,$={},u={},l={},f=new WeakMap,v=[],M=null,g=!1,m=null,E=null,T=null,_=null,C=null,A=null,x=null,S=new ze(0,0,0),O=0,R=!1,w=null,I=null,U=null,L=null,D=null,q.set(0,0,i.canvas.width,i.canvas.height),le.set(0,0,i.canvas.width,i.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:me,disable:Ae,bindFramebuffer:lt,drawBuffers:Fe,useProgram:Xe,setBlending:he,setMaterial:ce,setFlipSided:Re,setCullFace:Se,setLineWidth:je,setPolygonOffset:Ne,setScissorTest:Qe,activeTexture:et,bindTexture:st,unbindTexture:z,compressedTexImage2D:yt,compressedTexImage3D:$e,texImage2D:y,texImage3D:W,pixelStorei:ne,getParameter:re,updateUBOMapping:K,uniformBlockBinding:ee,texStorage2D:ke,texStorage3D:P,texSubImage2D:ht,texSubImage3D:xe,compressedTexSubImage2D:St,compressedTexSubImage3D:Be,scissor:de,viewport:ve,reset:fe}}function y0(i,e,t,n,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new G,d=new WeakMap,h=new Set;let u;const f=new WeakMap,v=new Set,M=new FinalizationRegistry(P=>v.delete(P));let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(P,y){return g?new OffscreenCanvas(P,y):Or("canvas")}function E(P,y,W){let re=1;const ne=ke(P);if((ne.width>W||ne.height>W)&&(re=W/Math.max(ne.width,ne.height)),re<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const de=Math.floor(re*ne.width),ve=Math.floor(re*ne.height);u===void 0&&(u=m(de,ve));const K=y?m(de,ve):u;return K.width=de,K.height=ve,K.getContext("2d").drawImage(P,0,0,de,ve),Ge("WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+de+"x"+ve+")."),K}else return"data"in P&&Ge("WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),P;return P}function T(P){return P.generateMipmaps}function _(P){i.generateMipmap(P)}function C(P){return P.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?i.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function A(P,y,W,re,ne,de=!1){if(P!==null){if(i[P]!==void 0)return i[P];Ge("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let ve;re&&(ve=e.get("EXT_texture_norm16"),ve||Ge("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=y;if(y===i.RED&&(W===i.FLOAT&&(K=i.R32F),W===i.HALF_FLOAT&&(K=i.R16F),W===i.UNSIGNED_BYTE&&(K=i.R8),W===i.UNSIGNED_SHORT&&ve&&(K=ve.R16_EXT),W===i.SHORT&&ve&&(K=ve.R16_SNORM_EXT)),y===i.RED_INTEGER&&(W===i.UNSIGNED_BYTE&&(K=i.R8UI),W===i.UNSIGNED_SHORT&&(K=i.R16UI),W===i.UNSIGNED_INT&&(K=i.R32UI),W===i.BYTE&&(K=i.R8I),W===i.SHORT&&(K=i.R16I),W===i.INT&&(K=i.R32I)),y===i.RG&&(W===i.FLOAT&&(K=i.RG32F),W===i.HALF_FLOAT&&(K=i.RG16F),W===i.UNSIGNED_BYTE&&(K=i.RG8),W===i.UNSIGNED_SHORT&&ve&&(K=ve.RG16_EXT),W===i.SHORT&&ve&&(K=ve.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(W===i.UNSIGNED_BYTE&&(K=i.RG8UI),W===i.UNSIGNED_SHORT&&(K=i.RG16UI),W===i.UNSIGNED_INT&&(K=i.RG32UI),W===i.BYTE&&(K=i.RG8I),W===i.SHORT&&(K=i.RG16I),W===i.INT&&(K=i.RG32I)),y===i.RGB_INTEGER&&(W===i.UNSIGNED_BYTE&&(K=i.RGB8UI),W===i.UNSIGNED_SHORT&&(K=i.RGB16UI),W===i.UNSIGNED_INT&&(K=i.RGB32UI),W===i.BYTE&&(K=i.RGB8I),W===i.SHORT&&(K=i.RGB16I),W===i.INT&&(K=i.RGB32I)),y===i.RGBA_INTEGER&&(W===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),W===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),W===i.UNSIGNED_INT&&(K=i.RGBA32UI),W===i.BYTE&&(K=i.RGBA8I),W===i.SHORT&&(K=i.RGBA16I),W===i.INT&&(K=i.RGBA32I)),y===i.RGB&&(W===i.UNSIGNED_SHORT&&ve&&(K=ve.RGB16_EXT),W===i.SHORT&&ve&&(K=ve.RGB16_SNORM_EXT),W===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),W===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),y===i.RGBA){const ee=de?Fr:it.getTransfer(ne);W===i.FLOAT&&(K=i.RGBA32F),W===i.HALF_FLOAT&&(K=i.RGBA16F),W===i.UNSIGNED_BYTE&&(K=ee===dt?i.SRGB8_ALPHA8:i.RGBA8),W===i.UNSIGNED_SHORT&&ve&&(K=ve.RGBA16_EXT),W===i.SHORT&&ve&&(K=ve.RGBA16_SNORM_EXT),W===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),W===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function x(P,y){let W;return P?y===null||y===fn||y===bi?W=i.DEPTH24_STENCIL8:y===dn?W=i.DEPTH32F_STENCIL8:y===Xi&&(W=i.DEPTH24_STENCIL8,Ge("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===fn||y===bi?W=i.DEPTH_COMPONENT24:y===dn?W=i.DEPTH_COMPONENT32F:y===Xi&&(W=i.DEPTH_COMPONENT16),W}function S(P,y){return T(P)===!0||P.isFramebufferTexture&&P.minFilter!==Lt&&P.minFilter!==Ht?Math.log2(Math.max(y.width,y.height))+1:P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?y.mipmaps.length:1}function O(P){const y=new WeakRef(P);n.get(P).__ref=y,v.add(y),M.register(P,y,y)}function R(P){const y=n.get(P).__ref;y!==void 0&&(v.delete(y),M.unregister(y))}function w(P){U(P.target)}function I(P){L(P.target)}function U(P){P.removeEventListener("dispose",w),R(P),H(P),P.isVideoTexture&&d.delete(P),P.isHTMLTexture&&h.delete(P)}function L(P){P.removeEventListener("dispose",I),R(P),Q(P)}function D(){for(const P of v){const y=P.deref();y!==void 0&&(y.isRenderTarget===!0?L(y):U(y))}v.clear(),h.clear()}function H(P){const y=n.get(P);if(y.__webglInit===void 0)return;const W=P.source,re=f.get(W);if(re){const ne=re[y.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&k(P),Object.keys(re).length===0&&f.delete(W)}n.remove(P)}function k(P){const y=n.get(P);i.deleteTexture(y.__webglTexture);const W=P.source,re=f.get(W);delete re[y.__cacheKey],a.memory.textures--}function Q(P){const y=n.get(P);y.__depthDisposeCallback&&y.__depthDisposeCallback();const W=P.depthTexture;if(W&&W.renderTarget===P&&U(W),P.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(y.__webglFramebuffer[ne]))for(let de=0;de<y.__webglFramebuffer[ne].length;de++)i.deleteFramebuffer(y.__webglFramebuffer[ne][de]);else i.deleteFramebuffer(y.__webglFramebuffer[ne]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[ne])}else{if(Array.isArray(y.__webglFramebuffer))for(let ne=0;ne<y.__webglFramebuffer.length;ne++)i.deleteFramebuffer(y.__webglFramebuffer[ne]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let ne=0;ne<y.__webglColorRenderbuffer.length;ne++)y.__webglColorRenderbuffer[ne]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[ne]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const re=P.textures;for(let ne=0,de=re.length;ne<de;ne++){const ve=n.get(re[ne]);ve.__webglTexture&&(i.deleteTexture(ve.__webglTexture),a.memory.textures--),n.remove(re[ne])}n.remove(P)}let j=0;function J(){j=0}function $(){return j}function ae(P){j=P}function we(){const P=j;return P>=r.maxTextures&&Ge("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+r.maxTextures),j+=1,P}function q(P){const y=[];return y.push(P.wrapS),y.push(P.wrapT),y.push(P.wrapR||0),y.push(P.magFilter),y.push(P.minFilter),y.push(P.anisotropy),y.push(P.internalFormat),y.push(P.format),y.push(P.type),y.push(P.generateMipmaps),y.push(P.mipmapsAutoUpdate),y.push(P.premultiplyAlpha),y.push(P.flipY),y.push(P.unpackAlignment),y.push(P.colorSpace),y.join()}function le(P,y){const W=n.get(P);if(P.isVideoTexture&&St(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&W.__version!==P.version){const re=P.image;if(re===null)Ge("WebGLRenderer: Texture marked for update but no image data found.");else if(re.complete===!1)Ge("WebGLRenderer: Texture marked for update but image is incomplete");else{ce(W,P,y);return}}else P.isExternalTexture&&(W.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,W.__webglTexture,i.TEXTURE0+y)}function Ee(P,y){const W=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&W.__version!==P.version){ce(W,P,y);return}else P.isExternalTexture&&(W.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,W.__webglTexture,i.TEXTURE0+y)}function Ie(P,y){const W=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&W.__version!==P.version){ce(W,P,y);return}t.bindTexture(i.TEXTURE_3D,W.__webglTexture,i.TEXTURE0+y)}function me(P,y){const W=n.get(P);if(P.version>0&&W.__version!==P.version){Re(W,P,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture,i.TEXTURE0+y)}const Ae={[Qn]:i.REPEAT,[Mn]:i.CLAMP_TO_EDGE,[Is]:i.MIRRORED_REPEAT},lt={[Lt]:i.NEAREST,[ld]:i.NEAREST_MIPMAP_NEAREST,[ir]:i.NEAREST_MIPMAP_LINEAR,[Ht]:i.LINEAR,[Yr]:i.LINEAR_MIPMAP_NEAREST,[On]:i.LINEAR_MIPMAP_LINEAR},Fe={[hd]:i.NEVER,[yl]:i.ALWAYS,[fd]:i.LESS,[_l]:i.LEQUAL,[pd]:i.EQUAL,[Sl]:i.GEQUAL,[md]:i.GREATER,[gd]:i.NOTEQUAL};function Xe(P,y){if(y.type===dn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Ht||y.magFilter===Yr||y.magFilter===ir||y.magFilter===On||y.minFilter===Ht||y.minFilter===Yr||y.minFilter===ir||y.minFilter===On)&&Ge("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(P,i.TEXTURE_WRAP_S,Ae[y.wrapS]),i.texParameteri(P,i.TEXTURE_WRAP_T,Ae[y.wrapT]),(P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY)&&i.texParameteri(P,i.TEXTURE_WRAP_R,Ae[y.wrapR]),i.texParameteri(P,i.TEXTURE_MAG_FILTER,lt[y.magFilter]),i.texParameteri(P,i.TEXTURE_MIN_FILTER,lt[y.minFilter]),y.compareFunction&&(i.texParameteri(P,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(P,i.TEXTURE_COMPARE_FUNC,Fe[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Lt||y.minFilter!==ir&&y.minFilter!==On||y.type===dn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(P,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,r.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Ke(P,y){let W=!1;P.__webglInit===void 0&&(P.__webglInit=!0,y.addEventListener("dispose",w),O(y));const re=y.source;let ne=f.get(re);ne===void 0&&(ne={},f.set(re,ne));const de=q(y);if(de!==P.__cacheKey){ne[de]===void 0&&(ne[de]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,W=!0),ne[de].usedTimes++;const ve=ne[P.__cacheKey];ve!==void 0&&(ne[P.__cacheKey].usedTimes--,ve.usedTimes===0&&k(y)),P.__cacheKey=de,P.__webglTexture=ne[de].texture}return W}function ie(P,y,W){return Math.floor(Math.floor(P/W)/y)}function he(P,y,W,re){const de=P.updateRanges;if(de.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,W,re,y.data);else{de.sort((F,te)=>F.start-te.start);let ve=0;for(let F=1;F<de.length;F++){const te=de[ve],Z=de[F],pe=te.start+te.count,oe=ie(Z.start,y.width,4),ue=ie(te.start,y.width,4);Z.start<=pe+1&&oe===ue&&ie(Z.start+Z.count-1,y.width,4)===oe?te.count=Math.max(te.count,Z.start+Z.count-te.start):(++ve,de[ve]=Z)}de.length=ve+1;const K=t.getParameter(i.UNPACK_ROW_LENGTH),ee=t.getParameter(i.UNPACK_SKIP_PIXELS),fe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let F=0,te=de.length;F<te;F++){const Z=de[F],pe=Math.floor(Z.start/4),oe=Math.ceil(Z.count/4),ue=pe%y.width,Ue=Math.floor(pe/y.width),Ye=oe,se=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ue),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ue),t.texSubImage2D(i.TEXTURE_2D,0,ue,Ue,Ye,se,W,re,y.data)}P.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(i.UNPACK_SKIP_ROWS,fe)}}function ce(P,y,W){let re=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(re=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(re=i.TEXTURE_3D);const ne=Ke(P,y),de=y.source;t.bindTexture(re,P.__webglTexture,i.TEXTURE0+W);const ve=n.get(de);if(de.version!==ve.__version||ne===!0){if(t.activeTexture(i.TEXTURE0+W),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){const se=it.getPrimaries(it.workingColorSpace),Oe=y.colorSpace===Fn?null:it.getPrimaries(y.colorSpace),qe=y.colorSpace===Fn||se===Oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,qe)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let ee=E(y.image,!1,r.maxTextureSize);ee=Be(y,ee);const fe=s.convert(y.format,y.colorSpace),F=s.convert(y.type);let te=A(y.internalFormat,fe,F,y.normalized,y.colorSpace,y.isVideoTexture);Xe(re,y);let Z;const pe=y.mipmaps,oe=y.isVideoTexture!==!0,ue=ve.__version===void 0||ne===!0,Ue=de.dataReady,Ye=S(y,ee);if(y.isDepthTexture)te=x(y.format===Bn,y.type),ue&&(oe?t.texStorage2D(i.TEXTURE_2D,1,te,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,te,ee.width,ee.height,0,fe,F,null));else if(y.isDataTexture)if(pe.length>0){oe&&ue&&t.texStorage2D(i.TEXTURE_2D,Ye,te,pe[0].width,pe[0].height);for(let se=0,Oe=pe.length;se<Oe;se++)Z=pe[se],oe?Ue&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,Z.width,Z.height,fe,F,Z.data):t.texImage2D(i.TEXTURE_2D,se,te,Z.width,Z.height,0,fe,F,Z.data);y.generateMipmaps=!1}else oe?(ue&&t.texStorage2D(i.TEXTURE_2D,Ye,te,ee.width,ee.height),Ue&&he(y,ee,fe,F)):t.texImage2D(i.TEXTURE_2D,0,te,ee.width,ee.height,0,fe,F,ee.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){oe&&ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ye,te,pe[0].width,pe[0].height,ee.depth);for(let se=0,Oe=pe.length;se<Oe;se++)if(Z=pe[se],y.format!==un)if(fe!==null)if(oe){if(Ue)if(y.layerUpdates.size>0){const qe=Po(Z.width,Z.height,y.format,y.type);for(const ye of y.layerUpdates){const ct=Z.data.subarray(ye*qe/Z.data.BYTES_PER_ELEMENT,(ye+1)*qe/Z.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,ye,Z.width,Z.height,1,fe,ct)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,Z.width,Z.height,ee.depth,fe,Z.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,se,te,Z.width,Z.height,ee.depth,0,Z.data,0,0);else Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else oe?Ue&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,Z.width,Z.height,ee.depth,fe,F,Z.data):t.texImage3D(i.TEXTURE_2D_ARRAY,se,te,Z.width,Z.height,ee.depth,0,fe,F,Z.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{oe&&ue&&t.texStorage2D(i.TEXTURE_2D,Ye,te,pe[0].width,pe[0].height);for(let se=0,Oe=pe.length;se<Oe;se++)Z=pe[se],y.format!==un?fe!==null?oe?Ue&&t.compressedTexSubImage2D(i.TEXTURE_2D,se,0,0,Z.width,Z.height,fe,Z.data):t.compressedTexImage2D(i.TEXTURE_2D,se,te,Z.width,Z.height,0,Z.data):Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):oe?Ue&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,Z.width,Z.height,fe,F,Z.data):t.texImage2D(i.TEXTURE_2D,se,te,Z.width,Z.height,0,fe,F,Z.data)}else if(y.isDataArrayTexture)if(oe){if(ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ye,te,ee.width,ee.height,ee.depth),Ue)if(y.layerUpdates.size>0){const se=Po(ee.width,ee.height,y.format,y.type);for(const Oe of y.layerUpdates){const qe=ee.data.subarray(Oe*se/ee.data.BYTES_PER_ELEMENT,(Oe+1)*se/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Oe,ee.width,ee.height,1,fe,F,qe)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,fe,F,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,te,ee.width,ee.height,ee.depth,0,fe,F,ee.data);else if(y.isData3DTexture)oe?(ue&&t.texStorage3D(i.TEXTURE_3D,Ye,te,ee.width,ee.height,ee.depth),Ue&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,fe,F,ee.data)):t.texImage3D(i.TEXTURE_3D,0,te,ee.width,ee.height,ee.depth,0,fe,F,ee.data);else if(y.isFramebufferTexture){if(ue)if(oe)t.texStorage2D(i.TEXTURE_2D,Ye,te,ee.width,ee.height);else{let se=ee.width,Oe=ee.height;for(let qe=0;qe<Ye;qe++)t.texImage2D(i.TEXTURE_2D,qe,te,se,Oe,0,fe,F,null),se>>=1,Oe>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){const se=i.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),ee.parentNode!==se){se.appendChild(ee),h.add(y),se.onpaint=Oe=>{const qe=Oe.changedElements;for(const ye of h)qe.includes(ye.image)&&(ye.needsUpdate=!0)},se.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ee);else{const qe=i.RGBA,ye=i.RGBA,ct=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,qe,ye,ct,ee)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(pe.length>0){if(oe&&ue){const se=ke(pe[0]);t.texStorage2D(i.TEXTURE_2D,Ye,te,se.width,se.height)}for(let se=0,Oe=pe.length;se<Oe;se++)Z=pe[se],oe?Ue&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,fe,F,Z):t.texImage2D(i.TEXTURE_2D,se,te,fe,F,Z);y.generateMipmaps=!1}else if(oe){if(ue){const se=ke(ee);t.texStorage2D(i.TEXTURE_2D,Ye,te,se.width,se.height)}Ue&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,F,ee)}else t.texImage2D(i.TEXTURE_2D,0,te,fe,F,ee);T(y)&&y.mipmapsAutoUpdate===!0&&_(re),ve.__version=de.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Re(P,y,W){if(y.image.length!==6)return;const re=Ke(P,y),ne=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,P.__webglTexture,i.TEXTURE0+W);const de=n.get(ne);if(ne.version!==de.__version||re===!0){t.activeTexture(i.TEXTURE0+W);const ve=it.getPrimaries(it.workingColorSpace),K=y.colorSpace===Fn?null:it.getPrimaries(y.colorSpace),ee=y.colorSpace===Fn||ve===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const fe=y.isCompressedTexture||y.image[0].isCompressedTexture,F=y.image[0]&&y.image[0].isDataTexture,te=[];for(let ye=0;ye<6;ye++)!fe&&!F?te[ye]=E(y.image[ye],!0,r.maxCubemapSize):te[ye]=F?y.image[ye].image:y.image[ye],te[ye]=Be(y,te[ye]);const Z=te[0],pe=s.convert(y.format,y.colorSpace),oe=s.convert(y.type);let ue=A(y.internalFormat,pe,oe,y.normalized,y.colorSpace);const Ue=y.isVideoTexture!==!0,Ye=de.__version===void 0||re===!0,se=ne.dataReady;let Oe=S(y,Z);Xe(i.TEXTURE_CUBE_MAP,y);let qe;if(y.isDepthTexture){if(ue=x(y.format===Bn,y.type),Ye)if(Ue)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,ue,Z.width,Z.height);else for(let ye=0;ye<6;ye++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,ue,Z.width,Z.height,0,pe,oe,null)}else if(fe){Ue&&Ye&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Oe,ue,Z.width,Z.height);for(let ye=0;ye<6;ye++){qe=te[ye].mipmaps;for(let ct=0;ct<qe.length;ct++){const At=qe[ct];y.format!==un?pe!==null?Ue?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,0,0,At.width,At.height,pe,At.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,ue,At.width,At.height,0,At.data):Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,0,0,At.width,At.height,pe,oe,At.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,ue,At.width,At.height,0,pe,oe,At.data)}}}else{if(qe=y.mipmaps,Ue&&Ye){qe.length>0&&Oe++;const ye=ke(te[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Oe,ue,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(F){Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,te[ye].width,te[ye].height,pe,oe,te[ye].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,ue,te[ye].width,te[ye].height,0,pe,oe,te[ye].data);for(let ct=0;ct<qe.length;ct++){const An=qe[ct].image[ye].image;Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,0,0,An.width,An.height,pe,oe,An.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,ue,An.width,An.height,0,pe,oe,An.data)}}else{Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,pe,oe,te[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,ue,pe,oe,te[ye]);for(let ct=0;ct<qe.length;ct++){const At=qe[ct];Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,0,0,pe,oe,At.image[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,ue,pe,oe,At.image[ye])}}}T(y)&&y.mipmapsAutoUpdate===!0&&_(i.TEXTURE_CUBE_MAP),de.__version=ne.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Se(P,y,W,re,ne,de){const ve=s.convert(W.format,W.colorSpace),K=s.convert(W.type),ee=A(W.internalFormat,ve,K,W.normalized,W.colorSpace),fe=n.get(y),F=n.get(W);if(F.__renderTarget=y,!fe.__hasExternalTextures){const te=Math.max(1,y.width>>de),Z=Math.max(1,y.height>>de);ne===i.TEXTURE_3D||ne===i.TEXTURE_2D_ARRAY?t.texImage3D(ne,de,ee,te,Z,y.depth,0,ve,K,null):t.texImage2D(ne,de,ee,te,Z,0,ve,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,P),xe(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,re,ne,F.__webglTexture,0,ht(y)):(ne===i.TEXTURE_2D||ne>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,re,ne,F.__webglTexture,de),t.bindFramebuffer(i.FRAMEBUFFER,null)}function je(P,y,W){if(i.bindRenderbuffer(i.RENDERBUFFER,P),y.depthBuffer){const re=y.depthTexture,ne=re&&re.isDepthTexture?re.type:null,de=x(y.stencilBuffer,ne),ve=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;xe(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(y),de,y.width,y.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(y),de,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,de,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,P)}else{const re=y.textures;for(let ne=0;ne<re.length;ne++){const de=re[ne],ve=s.convert(de.format,de.colorSpace),K=s.convert(de.type),ee=A(de.internalFormat,ve,K,de.normalized,de.colorSpace);xe(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(y),ee,y.width,y.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(y),ee,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ee,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ne(P,y,W){const re=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,P),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ne=n.get(y.depthTexture);ne.__renderTarget=y;const de=re?y.depthTexture.image[0]:y.depthTexture.image;(!ne.__webglTexture||de.width!==y.width||de.height!==y.height)&&(de.width=y.width,de.height=y.height,y.depthTexture.needsUpdate=!0),re?me(y.depthTexture,0):le(y.depthTexture,0);const ve=ne.__webglTexture,K=ht(y),ee=re?i.TEXTURE_CUBE_MAP_POSITIVE_X+W:i.TEXTURE_2D,fe=y.depthTexture.format===Bn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===kn)xe(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,ee,ve,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,fe,ee,ve,0);else if(y.depthTexture.format===Bn)xe(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,ee,ve,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,fe,ee,ve,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Qe(P){const y=n.get(P),W=P.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==P.depthTexture){const re=P.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),re){const ne=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,re.removeEventListener("dispose",ne)};re.addEventListener("dispose",ne),y.__depthDisposeCallback=ne}y.__boundDepthTexture=re}if(P.depthTexture&&!y.__autoAllocateDepthBuffer)if(W)for(let re=0;re<6;re++)Ne(y.__webglFramebuffer[re],P,re);else P.texture.mipmaps.length>0?Ne(y.__webglFramebuffer[0],P,0):Ne(y.__webglFramebuffer,P,0);else if(W){y.__webglDepthbuffer=[];for(let re=0;re<6;re++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[re]),y.__webglDepthbuffer[re]===void 0)y.__webglDepthbuffer[re]=i.createRenderbuffer(),je(y.__webglDepthbuffer[re],P,!1);else{const ne=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=y.__webglDepthbuffer[re];i.bindRenderbuffer(i.RENDERBUFFER,de),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,de)}}else if(P.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),je(y.__webglDepthbuffer,P,!1);else{const ne=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,de),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,de)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function et(P,y,W){const re=n.get(P);y!==void 0&&Se(re.__webglFramebuffer,P,P.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),W!==void 0&&Qe(P)}function st(P){const y=P.texture,W=n.get(P),re=n.get(y);P.addEventListener("dispose",I),O(P);const ne=P.textures,de=P.isWebGLCubeRenderTarget===!0,ve=ne.length>1;if(ve||(re.__webglTexture===void 0&&(re.__webglTexture=i.createTexture()),re.__version=y.version,a.memory.textures++),de){W.__webglFramebuffer=[];for(let K=0;K<6;K++)if(y.mipmaps.length>0){W.__webglFramebuffer[K]=[];for(let ee=0;ee<y.mipmaps.length;ee++)W.__webglFramebuffer[K][ee]=i.createFramebuffer()}else W.__webglFramebuffer[K]=i.createFramebuffer()}else{if(y.mipmaps.length>0){W.__webglFramebuffer=[];for(let K=0;K<y.mipmaps.length;K++)W.__webglFramebuffer[K]=i.createFramebuffer()}else W.__webglFramebuffer=i.createFramebuffer();if(ve)for(let K=0,ee=ne.length;K<ee;K++){const fe=n.get(ne[K]);fe.__webglTexture===void 0&&(fe.__webglTexture=i.createTexture(),a.memory.textures++)}if(P.samples>0&&xe(P)===!1){W.__webglMultisampledFramebuffer=i.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let K=0;K<ne.length;K++){const ee=ne[K];W.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,W.__webglColorRenderbuffer[K]);const fe=s.convert(ee.format,ee.colorSpace),F=s.convert(ee.type),te=A(ee.internalFormat,fe,F,ee.normalized,ee.colorSpace,P.isXRRenderTarget===!0),Z=ht(P);i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,te,P.width,P.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,W.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),P.depthBuffer&&(W.__webglDepthRenderbuffer=i.createRenderbuffer(),je(W.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(de){t.bindTexture(i.TEXTURE_CUBE_MAP,re.__webglTexture),Xe(i.TEXTURE_CUBE_MAP,y);for(let K=0;K<6;K++)if(y.mipmaps.length>0)for(let ee=0;ee<y.mipmaps.length;ee++)Se(W.__webglFramebuffer[K][ee],P,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ee);else Se(W.__webglFramebuffer[K],P,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);T(y)?_(i.TEXTURE_CUBE_MAP):y.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}else if(ve){for(let K=0,ee=ne.length;K<ee;K++){const fe=ne[K],F=n.get(fe);let te=i.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(te=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(te,F.__webglTexture),Xe(te,fe),Se(W.__webglFramebuffer,P,fe,i.COLOR_ATTACHMENT0+K,te,0),T(fe)&&_(te)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(K=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,re.__webglTexture),Xe(K,y),y.mipmaps.length>0)for(let ee=0;ee<y.mipmaps.length;ee++)Se(W.__webglFramebuffer[ee],P,y,i.COLOR_ATTACHMENT0,K,ee);else Se(W.__webglFramebuffer,P,y,i.COLOR_ATTACHMENT0,K,0);T(y)?_(K):y.mipmaps.length>0&&i.texParameteri(K,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}P.depthBuffer&&Qe(P)}function z(P){const y=P.textures;for(let W=0,re=y.length;W<re;W++){const ne=y[W];if(T(ne)&&ne.mipmapsAutoUpdate===!0){const de=C(P),ve=n.get(ne).__webglTexture;t.bindTexture(de,ve),_(de),t.unbindTexture()}}}const yt=[];function $e(P){if(P.samples>0){if(xe(P)===!1){const y=P.textures,W=P.width,re=P.height;let ne=i.COLOR_BUFFER_BIT;const de=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=n.get(P),K=y.length>1;if(K)for(let fe=0;fe<y.length;fe++)t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),P.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let fe=0;fe<y.length;fe++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(ne|=i.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(ne|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const F=n.get(y[fe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,F,0)}i.blitFramebuffer(0,0,W,re,0,0,W,re,ne,i.NEAREST),l===!0&&(yt.length=0,yt.push(i.COLOR_ATTACHMENT0+fe),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&yt.push(de),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,yt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let fe=0;fe<y.length;fe++){t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const F=n.get(y[fe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,F,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){const y=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function ht(P){return Math.min(r.maxSamples,P.samples)}function xe(P){const y=n.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function St(P){const y=a.render.frame;d.get(P)!==y&&(d.set(P,y),P.update())}function Be(P,y){const W=P.colorSpace,re=P.format,ne=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||W!==Ur&&W!==Fn&&(it.getTransfer(W)===dt?(re!==un||ne!==qt)&&Ge("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):at("WebGLTextures: Unsupported texture color space:",W)),y}function ke(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=we,this.resetTextureUnits=J,this.getTextureUnits=$,this.setTextureUnits=ae,this.setTexture2D=le,this.setTexture2DArray=Ee,this.setTexture3D=Ie,this.setTextureCube=me,this.rebindTextures=et,this.setupRenderTarget=st,this.updateRenderTargetMipmap=z,this.updateMultisampleRenderTarget=$e,this.setupDepthRenderbuffer=Qe,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=xe,this.dispose=D}function M0(i,e){function t(n,r=Fn){let s;const a=it.getTransfer(r);if(n===qt)return i.UNSIGNED_BYTE;if(n===Sa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ya)return i.UNSIGNED_SHORT_5_5_5_1;if(n===pl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===ml)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===hl)return i.BYTE;if(n===fl)return i.SHORT;if(n===Xi)return i.UNSIGNED_SHORT;if(n===_a)return i.INT;if(n===fn)return i.UNSIGNED_INT;if(n===dn)return i.FLOAT;if(n===pn)return i.HALF_FLOAT;if(n===gl)return i.ALPHA;if(n===xl)return i.RGB;if(n===un)return i.RGBA;if(n===kn)return i.DEPTH_COMPONENT;if(n===Bn)return i.DEPTH_STENCIL;if(n===vl)return i.RED;if(n===Ma)return i.RED_INTEGER;if(n===ei)return i.RG;if(n===ba)return i.RG_INTEGER;if(n===Ea)return i.RGBA_INTEGER;if(n===Rr||n===Cr||n===Pr||n===Lr)if(a===dt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Rr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Cr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Pr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Lr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Rr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Cr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Pr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Lr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ns||n===Us||n===Fs||n===Os)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Ns)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Us)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Fs)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Os)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Bs||n===zs||n===ks||n===Gs||n===Hs||n===Ir||n===Vs)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Bs||n===zs)return a===dt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===ks)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===Gs)return s.COMPRESSED_R11_EAC;if(n===Hs)return s.COMPRESSED_SIGNED_R11_EAC;if(n===Ir)return s.COMPRESSED_RG11_EAC;if(n===Vs)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ws||n===Xs||n===js||n===qs||n===Ys||n===Zs||n===Js||n===$s||n===Ks||n===Qs||n===ea||n===ta||n===na||n===ia)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Ws)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Xs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===js)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===qs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ys)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Zs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Js)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===$s)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ks)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Qs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ea)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ta)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===na)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ia)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ra||n===sa||n===aa)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===ra)return a===dt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===sa)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===aa)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===oa||n===la||n===Nr||n===ca)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===oa)return s.COMPRESSED_RED_RGTC1_EXT;if(n===la)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Nr)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ca)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===bi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const b0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,E0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class T0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Ll(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new ni({vertexShader:b0,fragmentShader:E0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new be(new bn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class w0 extends ii{constructor(e,t){super();const n=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,d=null,h=null,u=null,f=null,v=null;const M=typeof XRWebGLBinding<"u",g=new T0,m={},E=t.getContextAttributes();let T=null,_=null;const C=[],A=[],x=new G;let S=null,O=null;const R=new rn;R.viewport=new vt;const w=new rn;w.viewport=new vt;const I=[R,w],U=new Ou;let L=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let le=C[q];return le===void 0&&(le=new is,C[q]=le),le.getTargetRaySpace()},this.getControllerGrip=function(q){let le=C[q];return le===void 0&&(le=new is,C[q]=le),le.getGripSpace()},this.getHand=function(q){let le=C[q];return le===void 0&&(le=new is,C[q]=le),le.getHandSpace()};function H(q){const le=A.indexOf(q.inputSource);if(le===-1)return;const Ee=C[le];Ee!==void 0&&(Ee.update(q.inputSource,q.frame,c||a),Ee.dispatchEvent({type:q.type,data:q.inputSource}))}function k(){r.removeEventListener("select",H),r.removeEventListener("selectstart",H),r.removeEventListener("selectend",H),r.removeEventListener("squeeze",H),r.removeEventListener("squeezestart",H),r.removeEventListener("squeezeend",H),r.removeEventListener("end",k),r.removeEventListener("inputsourceschange",Q);for(let q=0;q<C.length;q++){const le=A[q];le!==null&&(A[q]=null,C[q].disconnect(le))}L=null,D=null,g.reset();for(const q in m)delete m[q];if(e.setRenderTarget(T),f=null,u=null,h=null,r=null,_=null,we.stop(),n.isPresenting=!1,e.setPixelRatio(S),e.setSize(x.width,x.height,!1),O!==null){const q=O.camera;q.fov=O.fov,q.zoom=O.zoom,q.updateProjectionMatrix(),O=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,n.isPresenting===!0&&Ge("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&Ge("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return h===null&&M&&(h=new XRWebGLBinding(r,t)),h},this.getFrame=function(){return v},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(T=e.getRenderTarget(),r.addEventListener("select",H),r.addEventListener("selectstart",H),r.addEventListener("selectend",H),r.addEventListener("squeeze",H),r.addEventListener("squeezestart",H),r.addEventListener("squeezeend",H),r.addEventListener("end",k),r.addEventListener("inputsourceschange",Q),E.xrCompatible!==!0&&await t.makeXRCompatible(),S=e.getPixelRatio(),e.getSize(x),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ee=null,Ie=null,me=null;E.depth&&(me=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ee=E.stencil?Bn:kn,Ie=E.stencil?bi:fn);const Ae={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:s};h=this.getBinding(),u=h.createProjectionLayer(Ae),r.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),_=new hn(u.textureWidth,u.textureHeight,{format:un,type:qt,depthTexture:new Ei(u.textureWidth,u.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,Ee),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{const Ee={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,Ee),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new hn(f.framebufferWidth,f.framebufferHeight,{format:un,type:qt,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),we.setContext(r),we.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function Q(q){for(let le=0;le<q.removed.length;le++){const Ee=q.removed[le],Ie=A.indexOf(Ee);Ie>=0&&(A[Ie]=null,C[Ie].disconnect(Ee))}for(let le=0;le<q.added.length;le++){const Ee=q.added[le];let Ie=A.indexOf(Ee);if(Ie===-1){for(let Ae=0;Ae<C.length;Ae++)if(Ae>=A.length){A.push(Ee),Ie=Ae;break}else if(A[Ae]===null){A[Ae]=Ee,Ie=Ae;break}if(Ie===-1)break}const me=C[Ie];me&&me.connect(Ee)}}function j(q,le){le===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(le.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let le=q.near,Ee=q.far;g.texture!==null&&(g.depthNear>0&&(le=g.depthNear),g.depthFar>0&&(Ee=g.depthFar)),U.near=w.near=R.near=le,U.far=w.far=R.far=Ee,(L!==U.near||D!==U.far)&&(r.updateRenderState({depthNear:U.near,depthFar:U.far}),L=U.near,D=U.far),U.layers.mask=q.layers.mask|6,R.layers.mask=U.layers.mask&-5,w.layers.mask=U.layers.mask&-3;const Ie=q.parent,me=U.cameras;j(U,Ie);for(let Ae=0;Ae<me.length;Ae++)j(me[Ae],Ie);U.projectionMatrix.copy(R.projectionMatrix),U.projectionMatrixInverse.copy(R.projectionMatrixInverse),O===null&&q.isPerspectiveCamera&&(O={camera:q,fov:q.fov,zoom:q.zoom}),J(q,U,Ie)};function J(q,le,Ee){Ee===null?q.matrix.copy(le.matrixWorld):(q.matrix.copy(Ee.matrixWorld),q.matrix.invert(),q.matrix.multiply(le.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(le.projectionMatrix),q.projectionMatrixInverse.copy(le.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=ua*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(q){l=q,u!==null&&(u.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(U)},this.getCameraTexture=function(q){return m[q]};let $=null;function ae(q,le){if(d=le.getViewerPose(c||a),v=le,d!==null){const Ee=d.views;f!==null&&(e.setRenderTargetFramebuffer(_,f.framebuffer),e.setRenderTarget(_));let Ie=!1;Ee.length!==U.cameras.length&&(U.cameras.length=0,Ie=!0);for(let Fe=0;Fe<Ee.length;Fe++){const Xe=Ee[Fe];let Ke=null;if(f!==null)Ke=f.getViewport(Xe);else{const he=h.getViewSubImage(u,Xe);Ke=he.viewport,Fe===0&&(e.setRenderTargetTextures(_,he.colorTexture,he.depthStencilTexture),e.setRenderTarget(_))}let ie=I[Fe];ie===void 0&&(ie=new rn,ie.layers.enable(Fe),ie.viewport=new vt,I[Fe]=ie),ie.matrix.fromArray(Xe.transform.matrix),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.projectionMatrix.fromArray(Xe.projectionMatrix),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert(),ie.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),Fe===0&&(U.matrix.copy(ie.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),Ie===!0&&U.cameras.push(ie)}const me=r.enabledFeatures;if(me&&me.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&M){h=n.getBinding();const Fe=h.getDepthInformation(Ee[0]);Fe&&Fe.isValid&&Fe.texture&&g.init(Fe,r.renderState)}if(me&&me.includes("camera-access")&&M){e.state.unbindTexture(),h=n.getBinding();for(let Fe=0;Fe<Ee.length;Fe++){const Xe=Ee[Fe].camera;if(Xe){let Ke=m[Xe];Ke||(Ke=new Ll,m[Xe]=Ke);const ie=h.getCameraImage(Xe);Ke.sourceTexture=ie}}}}for(let Ee=0;Ee<C.length;Ee++){const Ie=A[Ee],me=C[Ee];Ie!==null&&me!==void 0&&me.update(Ie,le,c||a)}$&&$(q,le),le.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:le}),v=null}const we=new Xl;we.setAnimationLoop(ae),this.setAnimationLoop=function(q){$=q},this.dispose=function(){}}}const A0=new gt,tc=new Ve;tc.set(-1,0,0,0,1,0,0,0,1);function R0(i,e){function t(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Hl(i)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function r(g,m,E,T,_){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?s(g,m):m.isMeshLambertMaterial?(s(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(s(g,m),h(g,m)):m.isMeshPhongMaterial?(s(g,m),d(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(s(g,m),u(g,m),m.isMeshPhysicalMaterial&&f(g,m,_)):m.isMeshMatcapMaterial?(s(g,m),v(g,m)):m.isMeshDepthMaterial?s(g,m):m.isMeshDistanceMaterial?(s(g,m),M(g,m)):m.isMeshNormalMaterial?s(g,m):m.isLineBasicMaterial?(a(g,m),m.isLineDashedMaterial&&o(g,m)):m.isPointsMaterial?l(g,m,E,T):m.isSpriteMaterial?c(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,t(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===Vt&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,t(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===Vt&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,t(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,t(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);const E=e.get(m),T=E.envMap,_=E.envMapRotation;T&&(g.envMap.value=T,g.envMapRotation.value.setFromMatrix4(A0.makeRotationFromEuler(_)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(tc),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,g.aoMapTransform))}function a(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform))}function o(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function l(g,m,E,T){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*E,g.scale.value=T*.5,m.map&&(g.map.value=m.map,t(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function c(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function d(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function h(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function u(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function f(g,m,E){g.ior.value=m.ior,m.diffuseRoughness>0&&(g.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(g.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,g.diffuseRoughnessMapTransform))),m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Vt&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,g.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=E.texture,g.transmissionSamplerSize.value.set(E.width,E.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,g.specularIntensityMapTransform))}function v(g,m){m.matcap&&(g.matcap.value=m.matcap)}function M(g,m){const E=e.get(m).light;g.referencePosition.value.setFromMatrixPosition(E.matrixWorld),g.nearDistance.value=E.shadow.camera.near,g.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function C0(i,e,t,n){let r={},s={};function a(E,T){const _=T.program;n.uniformBlockBinding(E,_,r[E.id])}function o(E,T){let _=r[E.id];_===void 0&&(v(E),_=l(E),r[E.id]=_,E.addEventListener("dispose",g));const C=T.program;n.updateUBOMapping(E,C);const A=e.render.frame;s[E.id]!==A&&(c(E),s[E.id]=A)}function l(E){const T=i.createBuffer(),_=E.__size,C=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,_,C),i.bindBuffer(i.UNIFORM_BUFFER,null),T}function c(E){const T=r[E.id],_=E.uniforms,C=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let A=0,x=_.length;A<x;A++){const S=_[A];if(Array.isArray(S))for(let O=0,R=S.length;O<R;O++)d(S[O],A,O,C);else d(S,A,0,C)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(E,T,_,C){if(u(E,T,_,C)===!0){const A=E.__offset,x=E.value;if(Array.isArray(x)){let S=0;for(let O=0;O<x.length;O++){const R=x[O],w=M(R,!0);h(R,E.__data,S),S+=w.storage/Float32Array.BYTES_PER_ELEMENT}}else h(x,E.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,A,E.__data)}}function h(E,T,_){typeof E=="number"||typeof E=="boolean"?T[_]=E:E.isMatrix3?(T[_]=E.elements[0],T[_+1]=E.elements[1],T[_+2]=E.elements[2],T[_+3]=0,T[_+4]=E.elements[3],T[_+5]=E.elements[4],T[_+6]=E.elements[5],T[_+7]=0,T[_+8]=E.elements[6],T[_+9]=E.elements[7],T[_+10]=E.elements[8],T[_+11]=0):ArrayBuffer.isView(E)?T.set(E.subarray(0,T.length-_),_):E.toArray(T,_)}function u(E,T,_,C){const A=E.value,x=T+"_"+_;if(Array.isArray(A)){C[x]===void 0&&(C[x]=[]);const S=C[x];let O=!1;for(let R=0;R<A.length;R++)f(A[R],S,R)===!0&&(O=!0);return O}return f(A,C,x)}function f(E,T,_){if(T[_]===void 0)return typeof E=="number"||typeof E=="boolean"?T[_]=E:ArrayBuffer.isView(E)?T[_]=E.slice():T[_]=E.clone(),!0;{const C=T[_];if(typeof E=="number"||typeof E=="boolean"){if(C!==E)return T[_]=E,!0}else{if(ArrayBuffer.isView(E))return!0;if(C.equals(E)===!1)return C.copy(E),!0}}return!1}function v(E){const T=E.uniforms;let _=0;const C=16;for(let x=0,S=T.length;x<S;x++){const O=Array.isArray(T[x])?T[x]:[T[x]];for(let R=0,w=O.length;R<w;R++){const I=O[R],U=Array.isArray(I.value)?I.value:[I.value],L=Array.isArray(T[x])||Array.isArray(I.value);let D=_;for(let k=0,Q=U.length;k<Q;k++){const j=U[k],J=M(j,L),$=_%C,ae=$%J.boundary,we=$+ae;_+=ae,we!==0&&C-we<J.storage&&(_+=C-we),k===0&&(D=_),_+=J.storage}const H=I.type==="int"?Int32Array:I.type==="uint"?Uint32Array:Float32Array;I.__data=new H((_-D)/Float32Array.BYTES_PER_ELEMENT),I.__offset=D}}const A=_%C;return A>0&&(_+=C-A),E.__size=_,E.__cache={},this}function M(E,T){const _={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(_.boundary=4,_.storage=4):E.isVector2?(_.boundary=8,_.storage=8):E.isVector3||E.isColor?(_.boundary=16,_.storage=12):E.isVector4?(_.boundary=16,_.storage=16):E.isMatrix3?(_.boundary=16,_.storage=48):E.isMatrix4?(_.boundary=16,_.storage=64):E.isTexture?Ge("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(E)?(_.boundary=16,_.storage=E.byteLength):Ge("WebGLRenderer: Unsupported uniform value type.",E),T===!0&&(_.boundary=16,_.storage=Math.ceil(_.storage/16)*16),_}function g(E){const T=E.target;T.removeEventListener("dispose",g),i.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function m(){for(const E in r)i.deleteBuffer(r[E]);r={},s={}}return{bind:a,update:o,dispose:m}}const P0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let ln=null;function L0(){return ln===null&&(ln=new qd(P0,16,16,ei,pn),ln.name="DFG_LUT",ln.minFilter=Ht,ln.magFilter=Ht,ln.wrapS=Mn,ln.wrapT=Mn,ln.generateMipmaps=!1,ln.needsUpdate=!0),ln}class D0{constructor(e={}){const{canvas:t=_d(),context:n=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1,outputBufferType:f=qt}=e;this.isWebGLRenderer=!0;let v;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=n.getContextAttributes().alpha}else v=a;const M=f,g=new Set([Ea,ba,Ma]),m=new Set([qt,fn,Xi,bi,Sa,ya]),E=new Uint32Array(4),T=new Int32Array(4),_={textures:[],min:[],max:[],resolution:[]};let C=null,A=null;const x=[],S=[];let O=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=En,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let w=!1,I=null,U=null,L=null,D=null;this._outputColorSpace=Gt;let H=0,k=0,Q=null,j=-1,J=null;const $=new vt,ae=new vt;let we=null;const q=new ze(0);let le=0,Ee=t.width,Ie=t.height,me=1,Ae=null,lt=null;const Fe=new vt(0,0,Ee,Ie),Xe=new vt(0,0,Ee,Ie);let Ke=!1;const ie=new qi,he=new Ra;let ce=!1,Re=!1;const Se=new gt,je=new N,Ne=new vt,Qe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let et=!1;function st(){return Q===null?me:1}let z=n;function yt(b,B){return t.getContext(b,B)}let $e,ht,xe,St,Be,ke,P,y,W,re,ne,de,ve,K,ee,fe,F,te,Z,pe,oe,ue,Ue;try{const b={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${xa}`),t.addEventListener("webglcontextlost",Oe,!1),t.addEventListener("webglcontextrestored",qe,!1),t.addEventListener("webglcontextcreationerror",ye,!1),z===null){const B="webgl2";if(z=yt(B,b),z===null)throw yt(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ye()}catch(b){throw t.removeEventListener("webglcontextlost",Oe,!1),t.removeEventListener("webglcontextrestored",qe,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),at("WebGLRenderer: "+b.message),b}function Ye(){$e=new Up(z),$e.init(),oe=new M0(z,$e),ht=new Ep(z,$e,e,oe),xe=new S0(z,$e),ht.reversedDepthBuffer&&u&&xe.buffers.depth.setReversed(!0),U=z.createFramebuffer(),L=z.createFramebuffer(),D=z.createFramebuffer(),St=new Bp(z),Be=new a0,ke=new y0(z,$e,xe,Be,ht,oe,St),P=new Np(R),y=new zu(z),ue=new Mp(z,y),W=new Fp(z,y,St,ue),re=new kp(z,W,y,ue,St),te=new zp(z,ht,ke),ee=new Tp(Be),ne=new s0(R,P,$e,ht,ue,ee),de=new R0(R,Be),ve=new l0,K=new p0($e),F=new yp(R,P,xe,re,v,l),fe=new _0(R,re,ht),Ue=new C0(z,St,ht,xe),Z=new bp(z,$e,St),pe=new Op(z,$e,St),St.programs=ne.programs,R.capabilities=ht,R.extensions=$e,R.properties=Be,R.renderLists=ve,R.shadowMap=fe,R.state=xe,R.info=St}M!==qt&&(O=new Hp(M,t.width,t.height,o,r,s));const se=new w0(R,z);this.xr=se,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const b=$e.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=$e.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return me},this.setPixelRatio=function(b){b!==void 0&&(me=b,this.setSize(Ee,Ie,!1))},this.getSize=function(b){return b.set(Ee,Ie)},this.setSize=function(b,B,Y=!0){if(se.isPresenting){Ge("WebGLRenderer: Can't change size while VR device is presenting.");return}Ee=b,Ie=B,t.width=Math.floor(b*me),t.height=Math.floor(B*me),Y===!0&&(t.style.width=b+"px",t.style.height=B+"px"),O!==null&&O.setSize(t.width,t.height),this.setViewport(0,0,b,B)},this.getDrawingBufferSize=function(b){return b.set(Ee*me,Ie*me).floor()},this.setDrawingBufferSize=function(b,B,Y){Ee=b,Ie=B,me=Y,t.width=Math.floor(b*Y),t.height=Math.floor(B*Y),this.setViewport(0,0,b,B)},this.setEffects=function(b){if(M===qt){at("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let B=0;B<b.length;B++)if(b[B].isOutputPass===!0){Ge("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}O.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy($)},this.getViewport=function(b){return b.copy(Fe)},this.setViewport=function(b,B,Y,V){b.isVector4?Fe.set(b.x,b.y,b.z,b.w):Fe.set(b,B,Y,V),xe.viewport($.copy(Fe).multiplyScalar(st()).round())},this.getScissor=function(b){return b.copy(Xe)},this.setScissor=function(b,B,Y,V){b.isVector4?Xe.set(b.x,b.y,b.z,b.w):Xe.set(b,B,Y,V),xe.scissor(ae.copy(Xe).multiplyScalar(st()).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(b){xe.setScissorTest(Ke=b)},this.setOpaqueSort=function(b){Ae=b},this.setTransparentSort=function(b){lt=b},this.getClearColor=function(b){return b.copy(F.getClearColor())},this.setClearColor=function(){F.setClearColor(...arguments)},this.getClearAlpha=function(){return F.getClearAlpha()},this.setClearAlpha=function(){F.setClearAlpha(...arguments)},this.clear=function(b=!0,B=!0,Y=!0){let V=0;if(b){let X=!1;if(Q!==null){const _e=Q.texture.format;X=g.has(_e)}if(X){const _e=Q.texture.type,Ce=m.has(_e),ge=F.getClearColor(),Te=F.getClearAlpha(),De=ge.r,We=ge.g,tt=ge.b;Ce?(E[0]=De,E[1]=We,E[2]=tt,E[3]=Te,z.clearBufferuiv(z.COLOR,0,E)):(T[0]=De,T[1]=We,T[2]=tt,T[3]=Te,z.clearBufferiv(z.COLOR,0,T))}else V|=z.COLOR_BUFFER_BIT}B&&(V|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(V|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&z.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),I=b},this.dispose=function(){t.removeEventListener("webglcontextlost",Oe,!1),t.removeEventListener("webglcontextrestored",qe,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),F.dispose(),ve.dispose(),K.dispose(),ke.dispose(),Be.dispose(),P.dispose(),re.dispose(),W.dispose(),ue.dispose(),Ue.dispose(),ne.dispose(),se.dispose(),se.removeEventListener("sessionstart",ka),se.removeEventListener("sessionend",Ga),Vn.stop()};function Oe(b){b.preventDefault(),no("WebGLRenderer: Context Lost."),w=!0}function qe(){no("WebGLRenderer: Context Restored."),w=!1;const b=St.autoReset,B=fe.enabled,Y=fe.autoUpdate,V=fe.needsUpdate,X=fe.type;Ye(),St.autoReset=b,fe.enabled=B,fe.autoUpdate=Y,fe.needsUpdate=V,fe.type=X}function ye(b){at("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function ct(b){const B=b.target;B.removeEventListener("dispose",ct),At(B)}function At(b){An(b),Be.remove(b)}function An(b){const B=Be.get(b).programs;B!==void 0&&(B.forEach(function(Y){ne.releaseProgram(Y)}),b.isShaderMaterial&&ne.releaseShaderCache(b))}this.renderBufferDirect=function(b,B,Y,V,X,_e){B===null&&(B=Qe);const Ce=X.isMesh&&X.matrixWorld.determinantAffine()<0,ge=ac(b,B,Y,V,X);xe.setMaterial(V,Ce);let Te=Y.index,De=1;if(V.wireframe===!0){if(Te=W.getWireframeAttribute(Y),Te===void 0)return;De=2}const We=Y.drawRange,tt=Y.attributes.position;let Pe=We.start*De,nt=(We.start+We.count)*De;_e!==null&&(Pe=Math.max(Pe,_e.start*De),nt=Math.min(nt,(_e.start+_e.count)*De)),Te!==null?(Pe=Math.max(Pe,0),nt=Math.min(nt,Te.count)):tt!=null&&(Pe=Math.max(Pe,0),nt=Math.min(nt,tt.count));const Mt=nt-Pe;if(Mt<0||Mt===1/0)return;ue.setup(X,V,ge,Y,Te);let pt,ft=Z;if(Te!==null&&(pt=y.get(Te),ft=pe,ft.setIndex(pt)),X.isMesh)V.wireframe===!0?(xe.setLineWidth(V.wireframeLinewidth*st()),ft.setMode(z.LINES)):ft.setMode(z.TRIANGLES);else if(X.isLine){let Dt=V.linewidth;Dt===void 0&&(Dt=1),xe.setLineWidth(Dt*st()),X.isLineSegments?ft.setMode(z.LINES):X.isLineLoop?ft.setMode(z.LINE_LOOP):ft.setMode(z.LINE_STRIP)}else X.isPoints?ft.setMode(z.POINTS):X.isSprite&&ft.setMode(z.TRIANGLES);if(X.isBatchedMesh)if($e.get("WEBGL_multi_draw"))ft.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const Dt=X._multiDrawStarts,Le=X._multiDrawCounts,zt=X._multiDrawCount,ot=Te?y.get(Te).bytesPerElement:1,Wn=Be.get(V).currentProgram.getUniforms();for(let It=0;It<zt;It++)Wn.setValue(z,"_gl_DrawID",It),ft.render(Dt[It]/ot,Le[It])}else if(X.isInstancedMesh)ft.renderInstances(Pe,Mt,X.count);else if(Y.isInstancedBufferGeometry){const Dt=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Le=Math.min(Y.instanceCount,Dt);ft.renderInstances(Pe,Mt,Le)}else ft.render(Pe,Mt)};function za(b,B,Y,V){I!==null&&b.isNodeMaterial&&I.setObject(V,b),ce===!0&&ee.setState(b,Y,!1),b.transparent===!0&&b.side===Ft&&b.forceSinglePass===!1?(b.side=Vt,b.needsUpdate=!0,Li(b,B,V),b.side=Kn,b.needsUpdate=!0,Li(b,B,V),b.side=Ft):Li(b,B,V)}this.compile=function(b,B,Y=null){Y===null&&(Y=b),I!==null&&I.renderStart(b,B,Y),A=K.get(Y),A.init(B),S.push(A),Y.traverseVisible(function(X){X.isLight&&X.layers.test(B.layers)&&(A.pushLight(X),X.castShadow&&A.pushShadow(X))}),b!==Y&&b.traverseVisible(function(X){X.isLight&&X.layers.test(B.layers)&&(A.pushLight(X),X.castShadow&&A.pushShadow(X))}),A.setupLights(),I!==null&&I.updateLights(A.state.lightsArray),Re=this.localClippingEnabled,ce=ee.init(this.clippingPlanes,Re),ce===!0&&ee.setGlobalState(this.clippingPlanes,B),I!==null&&fe.render(A.state.shadowsArray,Y,B);const V=new Set;return b.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const _e=X.material;if(_e)if(Array.isArray(_e))for(let Ce=0;Ce<_e.length;Ce++){const ge=_e[Ce];za(ge,Y,B,X),V.add(ge)}else za(_e,Y,B,X),V.add(_e)}),A=S.pop(),I!==null&&I.renderEnd(),V},this.compileAsync=function(b,B,Y=null){const V=this.compile(b,B,Y);return new Promise(X=>{function _e(){if(V.forEach(function(Ce){const Te=Be.get(Ce).currentProgram;(Te===void 0||Te.isReady())&&V.delete(Ce)}),V.size===0){X(b);return}setTimeout(_e,10)}$e.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let Vr=null;function rc(b){Vr&&Vr(b)}function ka(){Vn.stop()}function Ga(){Vn.start()}const Vn=new Xl;Vn.setAnimationLoop(rc),typeof self<"u"&&Vn.setContext(self),this.setAnimationLoop=function(b){Vr=b,se.setAnimationLoop(b),b===null?Vn.stop():Vn.start()},se.addEventListener("sessionstart",ka),se.addEventListener("sessionend",Ga),this.render=function(b,B){if(B!==void 0&&B.isCamera!==!0){at("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;I!==null&&I.renderStart(b,B);const Y=se.enabled===!0&&se.isPresenting===!0,V=O!==null&&(Q===null||Y)&&O.begin(R,Q);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),se.enabled===!0&&se.isPresenting===!0&&(O===null||O.isCompositing()===!1)&&(se.cameraAutoUpdate===!0&&se.updateCamera(B),B=se.getCamera()),b.isScene===!0&&b.onBeforeRender(R,b,B,Q),A=K.get(b,S.length),A.init(B),A.state.textureUnits=ke.getTextureUnits(),S.push(A),Se.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),B.isArrayCamera?he.setFromArrayCamera(B):ie.setFromProjectionMatrix(Se,an,B.reversedDepth),Re=this.localClippingEnabled,ce=ee.init(this.clippingPlanes,Re),C=ve.get(b,x.length),C.init(),x.push(C),this.info.render.frame++,se.enabled===!0&&se.isPresenting===!0){const Ce=R.xr.getDepthSensingMesh();Ce!==null&&Wr(Ce,B,-1/0,R.sortObjects)}Wr(b,B,0,R.sortObjects),C.finish(),I!==null&&I.updateLights(A.state.lightsArray),R.sortObjects===!0&&C.sort(Ae,lt),et=se.enabled===!1||se.isPresenting===!1||se.hasDepthSensing()===!1,et&&F.addToRenderList(C,b),this.info.autoReset===!0&&this.info.reset(),ce===!0&&ee.beginShadows();const X=A.state.shadowsArray;if(fe.render(X,b,B),ce===!0&&ee.endShadows(),(V&&O.hasRenderPass())===!1){const Ce=C.opaque,ge=C.transmissive;if(A.setupLights(),B.isArrayCamera){const Te=B.cameras;if(ge.length>0)for(let De=0,We=Te.length;De<We;De++){const tt=Te[De];Va(Ce,ge,b,tt)}et&&F.render(b);for(let De=0,We=Te.length;De<We;De++){const tt=Te[De];Ha(C,b,tt,tt.viewport)}}else ge.length>0&&Va(Ce,ge,b,B),et&&F.render(b),Ha(C,b,B)}Q!==null&&k===0&&(ke.updateMultisampleRenderTarget(Q),ke.updateRenderTargetMipmap(Q)),V&&O.end(R),b.isScene===!0&&b.onAfterRender(R,b,B),ue.resetDefaultState(),j=-1,J=null,S.pop(),S.length>0?(A=S[S.length-1],ke.setTextureUnits(A.state.textureUnits),ce===!0&&ee.setGlobalState(R.clippingPlanes,A.state.camera)):A=null,x.pop(),x.length>0?C=x[x.length-1]:C=null,I!==null&&I.renderEnd()};function Wr(b,B,Y,V){if(b.visible===!1)return;if(b.layers.test(B.layers)){if(b.isGroup)Y=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(B);else if(b.isLight)A.pushLight(b),b.castShadow&&A.pushShadow(b);else if(b.isSprite){const Ce=B.isArrayCamera?he:ie;if(!b.frustumCulled||b.intersectsFrustum(Ce)){V&&Ne.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Se);const ge=re.update(b),Te=b.material;Te.visible&&C.push(b,ge,Te,Y,Ne.z,null,B)}}else if(b.isMesh||b.isLine||b.isPoints){const Ce=B.isArrayCamera?he:ie;if(!b.frustumCulled||b.intersectsFrustum(Ce)){const ge=re.update(b),Te=b.material;if(V&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ne.copy(b.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),Ne.copy(ge.boundingSphere.center)),Ne.applyMatrix4(b.matrixWorld).applyMatrix4(Se)),Array.isArray(Te)){const De=ge.groups;for(let We=0,tt=De.length;We<tt;We++){const Pe=De[We],nt=Te[Pe.materialIndex];nt&&nt.visible&&C.push(b,ge,nt,Y,Ne.z,Pe,B)}}else Te.visible&&C.push(b,ge,Te,Y,Ne.z,null,B)}}}const _e=b.children;for(let Ce=0,ge=_e.length;Ce<ge;Ce++)Wr(_e[Ce],B,Y,V)}function Ha(b,B,Y,V){const{opaque:X,transmissive:_e,transparent:Ce}=b;A.setupLightsView(Y),ce===!0&&ee.setGlobalState(R.clippingPlanes,Y),V&&xe.viewport($.copy(V)),X.length>0&&tr(X,B,Y),_e.length>0&&tr(_e,B,Y),Ce.length>0&&tr(Ce,B,Y),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function Va(b,B,Y,V){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[V.id]===void 0){const Pe=$e.has("EXT_color_buffer_half_float")||$e.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[V.id]=new hn(1,1,{generateMipmaps:!0,type:Pe?pn:qt,minFilter:On,samples:Math.max(4,ht.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:it.workingColorSpace})}const _e=A.state.transmissionRenderTarget[V.id],Ce=V.viewport||$;_e.setSize(Ce.z*R.transmissionResolutionScale,Ce.w*R.transmissionResolutionScale);const ge=R.getRenderTarget(),Te=R.getActiveCubeFace(),De=R.getActiveMipmapLevel();R.setRenderTarget(_e),R.getClearColor(q),le=R.getClearAlpha(),le<1&&R.setClearColor(16777215,.5),R.clear(),et&&F.render(Y);const We=R.toneMapping;R.toneMapping=En;const tt=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),A.setupLightsView(V),ce===!0&&ee.setGlobalState(R.clippingPlanes,V),tr(b,Y,V),ke.updateMultisampleRenderTarget(_e),ke.updateRenderTargetMipmap(_e),$e.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let nt=0,Mt=B.length;nt<Mt;nt++){const pt=B[nt],{object:ft,geometry:Dt,material:Le,group:zt}=pt;if(Le.side===Ft&&ft.layers.test(V.layers)){const ot=Le.side;Le.side=Vt,Le.needsUpdate=!0,Wa(ft,Y,V,Dt,Le,zt),Le.side=ot,Le.needsUpdate=!0,Pe=!0}}Pe===!0&&(ke.updateMultisampleRenderTarget(_e),ke.updateRenderTargetMipmap(_e))}R.setRenderTarget(ge,Te,De),R.setClearColor(q,le),tt!==void 0&&(V.viewport=tt),R.toneMapping=We}function tr(b,B,Y){const V=B.isScene===!0?B.overrideMaterial:null;for(let X=0,_e=b.length;X<_e;X++){const Ce=b[X],{object:ge,geometry:Te,group:De}=Ce;let We=Ce.material;We.allowOverride===!0&&V!==null&&(We=V),ge.layers.test(Y.layers)&&Wa(ge,B,Y,Te,We,De)}}function Wa(b,B,Y,V,X,_e){I!==null&&X.isNodeMaterial&&I.setObject(b,X),b.onBeforeRender(R,B,Y,V,X,_e),b.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),X.onBeforeRender(R,B,Y,V,b,_e),X.transparent===!0&&X.side===Ft&&X.forceSinglePass===!1?(X.side=Vt,X.needsUpdate=!0,R.renderBufferDirect(Y,B,V,X,b,_e),X.side=Kn,X.needsUpdate=!0,R.renderBufferDirect(Y,B,V,X,b,_e),X.side=Ft):R.renderBufferDirect(Y,B,V,X,b,_e),b.onAfterRender(R,B,Y,V,X,_e)}function Xa(b){let B=0;for(const Y of b)Y.texture!==null&&B++;return B}function Li(b,B,Y){B.isScene!==!0&&(B=Qe);const V=Be.get(b),X=A.state.lights,_e=A.state.shadowsArray,Ce=X.state.version,ge=ne.getParameters(b,X.state,_e,B,Y,A.state.lightProbeGridArray),Te=ne.getProgramCacheKey(ge);let De=V.programs;V.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?B.environment:null,V.fog=B.fog;const We=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;V.envMap=P.get(b.envMap||V.environment,We),V.envMapRotation=V.environment!==null&&b.envMap===null?B.environmentRotation:b.envMapRotation,De===void 0&&(b.addEventListener("dispose",ct),De=new Map,V.programs=De,V.programVariants=new Map);let tt=De.get(Te);if(tt!==void 0){if(V.currentProgram===tt&&V.lightsStateVersion===Ce)return qa(b,ge),tt}else ge.uniforms=ne.getUniforms(b),I!==null&&b.isNodeMaterial&&I.build(b,Y,ge),b.onBeforeCompile(ge,R),tt=ne.acquireProgram(ge,Te),De.set(Te,tt),V.uniforms=ge.uniforms;const Pe=V.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Pe.clippingPlanes=ee.uniform),qa(b,ge),V.needsLights=lc(b),V.lightsStateVersion=Ce,V.needsLights&&(Pe.ambientLightColor.value=X.state.ambient,Pe.lightProbe.value=X.state.probe,Pe.sunLights.value=X.state.sun,Pe.sunLightShadows.value=X.state.sunShadow,Pe.directionalLights.value=X.state.directional,Pe.directionalLightShadows.value=X.state.directionalShadow,Pe.spotLights.value=X.state.spot,Pe.spotLightShadows.value=X.state.spotShadow,Pe.rectAreaLights.value=X.state.rectArea,Pe.ltc_1.value=X.state.rectAreaLTC1,Pe.ltc_2.value=X.state.rectAreaLTC2,Pe.pointLights.value=X.state.point,Pe.pointLightShadows.value=X.state.pointShadow,Pe.hemisphereLights.value=X.state.hemi,Pe.sunShadowMatrix.value=X.state.sunShadowMatrix,Pe.sunShadowCascade.value=X.state.sunShadowCascade,Pe.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Pe.spotLightMatrix.value=X.state.spotLightMatrix,Pe.spotLightMap.value=X.state.spotLightMap,Pe.pointShadowMatrix.value=X.state.pointShadowMatrix),V.numLightProbeGrids=Xa(A.state.lightProbeGridArray),V.currentProgram=tt,V.uniformsList=null,tt}function sc(b,B,Y,V,X){const _e=Be.get(b),Ce=_e.currentProgram.id+","+V+","+X;let ge=_e.programVariants.get(Ce);return ge===void 0?(ge=Li(b,B,Y),_e.programVariants.set(Ce,ge)):(_e.currentProgram=ge,_e.uniformsList=null,_e.outputColorSpace=V,_e.toneMapping=X),ge}function ja(b){if(b.uniformsList===null){const B=b.currentProgram.getUniforms();b.uniformsList=Dr.seqWithValue(B.seq,b.uniforms)}return b.uniformsList}function qa(b,B){const Y=Be.get(b);Y.outputColorSpace=B.outputColorSpace,Y.batching=B.batching,Y.batchingColor=B.batchingColor,Y.instancing=B.instancing,Y.instancingColor=B.instancingColor,Y.instancingMorph=B.instancingMorph,Y.skinning=B.skinning,Y.morphTargets=B.morphTargets,Y.morphNormals=B.morphNormals,Y.morphColors=B.morphColors,Y.morphTargetsCount=B.morphTargetsCount,Y.numClippingPlanes=B.numClippingPlanes,Y.numIntersection=B.numClipIntersection,Y.vertexAlphas=B.vertexAlphas,Y.vertexTangents=B.vertexTangents,Y.toneMapping=B.toneMapping}function ac(b,B,Y,V,X){B.isScene!==!0&&(B=Qe),ke.resetTextureUnits();const _e=B.fog,Ce=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?B.environment:null,ge=Q===null?R.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:it.workingColorSpace,Te=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,De=P.get(V.envMap||Ce,Te),We=V.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,tt=!!Y.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Pe=!!Y.morphAttributes.position,nt=!!Y.morphAttributes.normal,Mt=!!Y.morphAttributes.color;let pt=En;V.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(pt=R.toneMapping);const ft=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Dt=ft!==void 0?ft.length:0,Le=Be.get(V),zt=A.state.lights;if(ce===!0&&(Re===!0||b!==J)){const xt=b===J&&V.id===j;ee.setState(V,b,xt)}let ot=!1,Wn=!1;V.version===Le.__version?Le.needsLights&&Le.lightsStateVersion!==zt.state.version||X.isBatchedMesh&&Le.batching===!1||!X.isBatchedMesh&&Le.batching===!0||X.isBatchedMesh&&Le.batchingColor===!0&&X._colorsTexture===null||X.isBatchedMesh&&Le.batchingColor===!1&&X._colorsTexture!==null||X.isInstancedMesh&&Le.instancing===!1||!X.isInstancedMesh&&Le.instancing===!0||X.isSkinnedMesh&&Le.skinning===!1||!X.isSkinnedMesh&&Le.skinning===!0||X.isInstancedMesh&&Le.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Le.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Le.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Le.instancingMorph===!1&&X.morphTexture!==null||Le.envMap!==De||V.fog===!0&&Le.fog!==_e||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==ee.numPlanes||Le.numIntersection!==ee.numIntersection)||Le.vertexAlphas!==We||Le.vertexTangents!==tt||Le.morphTargets!==Pe||Le.morphNormals!==nt||Le.morphColors!==Mt||Le.morphTargetsCount!==Dt||Le.numLightProbeGrids!==Xa(A.state.lightProbeGridArray)?ot=!0:(Le.outputColorSpace!==ge||Le.toneMapping!==pt)&&(Wn=!0):(ot=!0,Le.__version=V.version);let It=Le.currentProgram;(ot===!0||Wn===!0)&&(It=Wn===!0?sc(V,B,X,ge,pt):Li(V,B,X),I&&V.isNodeMaterial&&I.onUpdateProgram(V,It,Le));let nr=!1,Rn=!1,Xn=!1;const rt=It.getUniforms(),Pt=Le.uniforms;if(xe.useProgram(It.program)&&(nr=!0,Rn=!0,Xn=!0),V.id!==j&&(j=V.id,Rn=!0),nr||J!==b){xe.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),rt.setValue(z,"projectionMatrix",b.projectionMatrix),rt.setValue(z,"viewMatrix",b.matrixWorldInverse);const Rt=rt.map.cameraPosition;Rt!==void 0&&Rt.setValue(z,je.setFromMatrixPosition(b.matrixWorld)),ht.logarithmicDepthBuffer&&rt.setValue(z,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&rt.setValue(z,"isOrthographic",b.isOrthographicCamera===!0),J!==b&&(J=b,Rn=!0,Xn=!0)}if(Le.needsLights&&(zt.state.sunShadowMap.length>0&&rt.setValue(z,"sunShadowMap",zt.state.sunShadowMap,ke),zt.state.directionalShadowMap.length>0&&rt.setValue(z,"directionalShadowMap",zt.state.directionalShadowMap,ke),zt.state.spotShadowMap.length>0&&rt.setValue(z,"spotShadowMap",zt.state.spotShadowMap,ke),zt.state.pointShadowMap.length>0&&rt.setValue(z,"pointShadowMap",zt.state.pointShadowMap,ke)),X.isSkinnedMesh){rt.setOptional(z,X,"bindMatrix"),rt.setOptional(z,X,"bindMatrixInverse");const xt=X.skeleton;xt&&(xt.boneTexture===null&&xt.computeBoneTexture(),rt.setValue(z,"boneTexture",xt.boneTexture,ke))}X.isBatchedMesh&&(rt.setOptional(z,X,"batchingTexture"),rt.setValue(z,"batchingTexture",X._matricesTexture,ke),rt.setOptional(z,X,"batchingIdTexture"),rt.setValue(z,"batchingIdTexture",X._indirectTexture,ke),rt.setOptional(z,X,"batchingColorTexture"),X._colorsTexture!==null&&rt.setValue(z,"batchingColorTexture",X._colorsTexture,ke));const Qt=Y.morphAttributes;if((Qt.position!==void 0||Qt.normal!==void 0||Qt.color!==void 0)&&te.update(X,Y,It),(Rn||Le.receiveShadow!==X.receiveShadow)&&(Le.receiveShadow=X.receiveShadow,rt.setValue(z,"receiveShadow",X.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&B.environment!==null&&(Pt.envMapIntensity.value=B.environmentIntensity),Pt.dfgLUT!==void 0&&(Pt.dfgLUT.value=L0()),Rn){if(rt.setValue(z,"toneMappingExposure",R.toneMappingExposure),Le.needsLights&&oc(Pt,Xn),_e&&V.fog===!0&&de.refreshFogUniforms(Pt,_e),de.refreshMaterialUniforms(Pt,V,me,Ie,A.state.transmissionRenderTarget[b.id]),Le.needsLights&&Le.numLightProbeGrids>0){const xt=_;let Rt=0;for(const gn of A.state.lightProbeGridArray)gn.texture!==null&&(xt.textures[Rt]=gn.texture,xt.min[Rt]=gn.boundingBox.min,xt.max[Rt]=gn.boundingBox.max,xt.resolution[Rt]=gn.resolution,Rt++);for(const gn in xt)xt[gn].length=Rt;Pt.probesSH.value=xt.textures,Pt.probesMin.value=xt.min,Pt.probesMax.value=xt.max,Pt.probesResolution.value=xt.resolution}Dr.upload(z,ja(Le),Pt,ke)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Dr.upload(z,ja(Le),Pt,ke),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&rt.setValue(z,"center",X.center),rt.setValue(z,"modelViewMatrix",X.modelViewMatrix),rt.setValue(z,"normalMatrix",X.normalMatrix),rt.setValue(z,"modelMatrix",X.matrixWorld),V.uniformsGroups!==void 0){const xt=V.uniformsGroups;for(let Rt=0,gn=xt.length;Rt<gn;Rt++){const Za=xt[Rt];Ue.update(Za,It),Ue.bind(Za,It)}}return It}function oc(b,B){b.ambientLightColor.needsUpdate=B,b.lightProbe.needsUpdate=B,b.sunLights.needsUpdate=B,b.sunLightShadows.needsUpdate=B,b.directionalLights.needsUpdate=B,b.directionalLightShadows.needsUpdate=B,b.pointLights.needsUpdate=B,b.pointLightShadows.needsUpdate=B,b.spotLights.needsUpdate=B,b.spotLightShadows.needsUpdate=B,b.rectAreaLights.needsUpdate=B,b.hemisphereLights.needsUpdate=B}function lc(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return Q},this.setRenderTargetTextures=function(b,B,Y){const V=Be.get(b);V.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),Be.get(b.texture).__webglTexture=B,Be.get(b.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:Y,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,B){const Y=Be.get(b);Y.__webglFramebuffer=B,Y.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(b,B=0,Y=0){Q=b,H=B,k=Y;let V=null,X=!1,_e=!1;if(b){const ge=Be.get(b);if(ge.__useDefaultFramebuffer!==void 0){xe.bindFramebuffer(z.FRAMEBUFFER,ge.__webglFramebuffer),$.copy(b.viewport),ae.copy(b.scissor),we=b.scissorTest,xe.viewport($),xe.scissor(ae),xe.setScissorTest(we),j=-1;return}else if(ge.__webglFramebuffer===void 0)ke.setupRenderTarget(b);else if(ge.__hasExternalTextures)ke.rebindTextures(b,Be.get(b.texture).__webglTexture,Be.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const We=b.depthTexture;if(ge.__boundDepthTexture!==We){if(We!==null&&Be.has(We)&&(b.width!==We.image.width||b.height!==We.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ke.setupDepthRenderbuffer(b)}}const Te=b.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(_e=!0);const De=Be.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(De[B])?V=De[B][Y]:V=De[B],X=!0):b.samples>0&&ke.useMultisampledRTT(b)===!1?V=Be.get(b).__webglMultisampledFramebuffer:Array.isArray(De)?V=De[Y]:V=De,$.copy(b.viewport),ae.copy(b.scissor),we=b.scissorTest}else $.copy(Fe).multiplyScalar(me).floor(),ae.copy(Xe).multiplyScalar(me).floor(),we=Ke;if(Y!==0&&(V=U),xe.bindFramebuffer(z.FRAMEBUFFER,V)&&xe.drawBuffers(b,V),xe.viewport($),xe.scissor(ae),xe.setScissorTest(we),X){const ge=Be.get(b.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+B,ge.__webglTexture,Y)}else if(_e){const ge=B;for(let Te=0;Te<b.textures.length;Te++){const De=Be.get(b.textures[Te]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+Te,De.__webglTexture,Y,ge)}}else if(b!==null&&Y!==0){const ge=Be.get(b.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,ge.__webglTexture,Y)}j=-1};function Ya(b){const B=Be.get(b);return(B.__readFormat!==b.format||B.__readType!==b.type)&&(B.__readFormat=b.format,B.__readType=b.type,B.__formatReadable=ht.textureFormatReadable(b.format),B.__typeReadable=ht.textureTypeReadable(b.type)),B}this.readRenderTargetPixels=function(b,B,Y,V,X,_e,Ce,ge=0){if(!(b&&b.isWebGLRenderTarget)){at("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=Be.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ce!==void 0&&(Te=Te[Ce],Array.isArray(Te)&&(Te=Te[0])),Te){xe.bindFramebuffer(z.FRAMEBUFFER,Te);try{const De=b.textures[ge],We=De.format,tt=De.type;b.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+ge);const Pe=Ya(De);if(Pe.__formatReadable===!1){at("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pe.__typeReadable===!1){at("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=b.width-V&&Y>=0&&Y<=b.height-X&&z.readPixels(B,Y,V,X,oe.convert(We),oe.convert(tt),_e)}finally{const De=Q!==null?Be.get(Q).__webglFramebuffer:null;xe.bindFramebuffer(z.FRAMEBUFFER,De)}}},this.readRenderTargetPixelsAsync=async function(b,B,Y,V,X,_e,Ce,ge=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=Be.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ce!==void 0&&(Te=Te[Ce],Array.isArray(Te)&&(Te=Te[0])),Te)if(B>=0&&B<=b.width-V&&Y>=0&&Y<=b.height-X){xe.bindFramebuffer(z.FRAMEBUFFER,Te);const De=b.textures[ge],We=De.format,tt=De.type;b.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+ge);const Pe=Ya(De);if(Pe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const nt=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,nt),z.bufferData(z.PIXEL_PACK_BUFFER,_e.byteLength,z.STREAM_READ),z.readPixels(B,Y,V,X,oe.convert(We),oe.convert(tt),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);const Mt=Q!==null?Be.get(Q).__webglFramebuffer:null;xe.bindFramebuffer(z.FRAMEBUFFER,Mt);const pt=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await Sd(z,pt,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,nt),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,_e),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(nt),z.deleteSync(pt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,B=null,Y=0){const V=Math.pow(2,-Y),X=Math.floor(b.image.width*V),_e=Math.floor(b.image.height*V),Ce=B!==null?B.x:0,ge=B!==null?B.y:0;ke.setTexture2D(b,0),z.copyTexSubImage2D(z.TEXTURE_2D,Y,0,0,Ce,ge,X,_e),xe.unbindTexture()},this.copyTextureToTexture=function(b,B,Y=null,V=null,X=0,_e=0){let Ce,ge,Te,De,We,tt,Pe,nt,Mt;const pt=b.isCompressedTexture?b.mipmaps[_e]:b.image;if(Y!==null)Ce=Y.max.x-Y.min.x,ge=Y.max.y-Y.min.y,Te=Y.isBox3?Y.max.z-Y.min.z:1,De=Y.min.x,We=Y.min.y,tt=Y.isBox3?Y.min.z:0;else{const rt=Math.pow(2,-X);Ce=Math.floor(pt.width*rt),ge=Math.floor(pt.height*rt),b.isDataArrayTexture?Te=pt.depth:b.isData3DTexture?Te=Math.floor(pt.depth*rt):Te=1,De=0,We=0,tt=0}V!==null?(Pe=V.x,nt=V.y,Mt=V.z):(Pe=0,nt=0,Mt=0);const ft=oe.convert(B.format),Dt=oe.convert(B.type);let Le;B.isData3DTexture?(ke.setTexture3D(B,0),Le=z.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(ke.setTexture2DArray(B,0),Le=z.TEXTURE_2D_ARRAY):(ke.setTexture2D(B,0),Le=z.TEXTURE_2D),xe.activeTexture(z.TEXTURE0),xe.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,B.flipY),xe.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),xe.pixelStorei(z.UNPACK_ALIGNMENT,B.unpackAlignment);const zt=xe.getParameter(z.UNPACK_ROW_LENGTH),ot=xe.getParameter(z.UNPACK_IMAGE_HEIGHT),Wn=xe.getParameter(z.UNPACK_SKIP_PIXELS),It=xe.getParameter(z.UNPACK_SKIP_ROWS),nr=xe.getParameter(z.UNPACK_SKIP_IMAGES);xe.pixelStorei(z.UNPACK_ROW_LENGTH,pt.width),xe.pixelStorei(z.UNPACK_IMAGE_HEIGHT,pt.height),xe.pixelStorei(z.UNPACK_SKIP_PIXELS,De),xe.pixelStorei(z.UNPACK_SKIP_ROWS,We),xe.pixelStorei(z.UNPACK_SKIP_IMAGES,tt);const Rn=b.isDataArrayTexture||b.isData3DTexture,Xn=B.isDataArrayTexture||B.isData3DTexture;if(b.isDepthTexture){const rt=Be.get(b),Pt=Be.get(B),Qt=Be.get(rt.__renderTarget),xt=Be.get(Pt.__renderTarget);xe.bindFramebuffer(z.READ_FRAMEBUFFER,Qt.__webglFramebuffer),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,xt.__webglFramebuffer);for(let Rt=0;Rt<Te;Rt++)Rn&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Be.get(b).__webglTexture,X,tt+Rt),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Be.get(B).__webglTexture,_e,Mt+Rt)),z.blitFramebuffer(De,We,De+Ce,We+ge,Pe,nt,Pe+Ce,nt+ge,z.DEPTH_BUFFER_BIT,z.NEAREST);xe.bindFramebuffer(z.READ_FRAMEBUFFER,null),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(X!==0||b.isRenderTargetTexture||Be.has(b)){const rt=Be.get(b),Pt=Be.get(B);xe.bindFramebuffer(z.READ_FRAMEBUFFER,L),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,D);for(let Qt=0;Qt<Te;Qt++)Rn?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,rt.__webglTexture,X,tt+Qt):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,rt.__webglTexture,X),Xn?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Pt.__webglTexture,_e,Mt+Qt):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,Pt.__webglTexture,_e),X!==0?z.blitFramebuffer(De,We,De+Ce,We+ge,Pe,nt,Pe+Ce,nt+ge,z.COLOR_BUFFER_BIT,z.NEAREST):Xn?z.copyTexSubImage3D(Le,_e,Pe,nt,Mt+Qt,De,We,Ce,ge):z.copyTexSubImage2D(Le,_e,Pe,nt,De,We,Ce,ge);xe.bindFramebuffer(z.READ_FRAMEBUFFER,null),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else Xn?b.isDataTexture||b.isData3DTexture?z.texSubImage3D(Le,_e,Pe,nt,Mt,Ce,ge,Te,ft,Dt,pt.data):B.isCompressedArrayTexture?z.compressedTexSubImage3D(Le,_e,Pe,nt,Mt,Ce,ge,Te,ft,pt.data):z.texSubImage3D(Le,_e,Pe,nt,Mt,Ce,ge,Te,ft,Dt,pt):b.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,_e,Pe,nt,Ce,ge,ft,Dt,pt.data):b.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,_e,Pe,nt,pt.width,pt.height,ft,pt.data):z.texSubImage2D(z.TEXTURE_2D,_e,Pe,nt,Ce,ge,ft,Dt,pt);xe.pixelStorei(z.UNPACK_ROW_LENGTH,zt),xe.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ot),xe.pixelStorei(z.UNPACK_SKIP_PIXELS,Wn),xe.pixelStorei(z.UNPACK_SKIP_ROWS,It),xe.pixelStorei(z.UNPACK_SKIP_IMAGES,nr),_e===0&&B.generateMipmaps===!0&&B.mipmapsAutoUpdate===!0&&z.generateMipmap(Le),xe.unbindTexture()},this.initRenderTarget=function(b){Be.get(b).__webglFramebuffer===void 0&&ke.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?ke.setTextureCube(b,0):b.isData3DTexture?ke.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?ke.setTexture2DArray(b,0):ke.setTexture2D(b,0),xe.unbindTexture()},this.resetState=function(){H=0,k=0,Q=null,xe.reset(),ue.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return an}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=it._getDrawingBufferColorSpace(e),t.unpackColorSpace=it._getUnpackColorSpace()}}function I0(i,e="warm"){const t=new $i(i);t.compileEquirectangularShader();const n=new wl,r={warm:{bg:1709844,topLight:16775399,keyLight:16768926,rimLight:16777215,fillLight:10405375,groundBounce:6048056},stadium:{bg:725790,topLight:15135487,keyLight:16777215,rimLight:7386623,fillLight:3731325,groundBounce:1981476},dramatic:{bg:394760,topLight:16765565,keyLight:16756276,rimLight:16777215,fillLight:4473941,groundBounce:2759694}},s=r[e]||r.warm;n.background=new ze(s.bg);const a=new bn(10,10),o=new be(a,new Jn({color:s.topLight,side:Ft}));o.position.set(0,9,0),o.rotation.x=Math.PI/2,n.add(o);const l=new be(new bn(4,14),new Jn({color:s.keyLight,side:Ft}));l.position.set(7,2,7),l.lookAt(0,0,0),n.add(l);const c=new be(new bn(3.5,14),new Jn({color:s.rimLight,side:Ft}));c.position.set(-8,3,4),c.lookAt(0,0,0),n.add(c);const d=new be(new bn(8,10),new Jn({color:s.fillLight,side:Ft}));d.position.set(0,4,-9),d.lookAt(0,0,0),n.add(d);const h=new be(new Ca(14,32),new Jn({color:s.groundBounce,side:Ft}));h.position.set(0,-7,0),h.rotation.x=-Math.PI/2,n.add(h);const u=t.fromScene(n,.035).texture;return t.dispose(),u}function N0(){const i=document.createElement("canvas");i.width=512,i.height=256;const e=i.getContext("2d");e.fillStyle="#d8d8d8",e.fillRect(0,0,512,256),e.strokeStyle="#2a2a2a",e.lineWidth=4.5;const t=64,n=48;for(let s=-n;s<256+n;s+=n)for(let a=-t;a<512+t;a+=t){const o=Math.floor(s/n)%2*(t/2),l=a+o,c=s;e.beginPath();for(let d=0;d<6;d++){const h=d*Math.PI/3,u=l+Math.cos(h)*26,f=c+Math.sin(h)*22;d===0?e.moveTo(u,f):e.lineTo(u,f)}e.closePath(),e.stroke()}const r=new Ci(i);return r.wrapS=Qn,r.wrapT=Qn,r}function U0(){const i=document.createElement("canvas");i.width=512,i.height=256;const e=i.getContext("2d");e.fillStyle="#555555",e.fillRect(0,0,512,256),e.fillStyle="#ffffff",e.beginPath(),e.moveTo(165,115),e.bezierCurveTo(195,115,215,145,200,175),e.bezierCurveTo(188,205,175,230,168,242),e.bezierCurveTo(160,220,152,185,150,150),e.closePath(),e.fill(),e.beginPath(),e.moveTo(95,35),e.bezierCurveTo(155,35,170,75,155,108),e.bezierCurveTo(130,100,105,75,95,35),e.fill(),e.beginPath(),e.arc(285,75,28,0,Math.PI*2),e.arc(290,150,38,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(380,85,52,0,Math.PI*2),e.arc(430,195,22,0,Math.PI*2),e.fill(),e.strokeStyle="#777777",e.lineWidth=1.5;for(let t=32;t<512;t+=48)e.beginPath(),e.moveTo(t,0),e.lineTo(t,256),e.stroke();for(let t=32;t<256;t+=32)e.beginPath(),e.moveTo(0,t),e.lineTo(512,t),e.stroke();return new Ci(i)}function F0(){const i=document.createElement("canvas");i.width=1024,i.height=512;const e=i.getContext("2d");e.fillStyle="#240f08",e.fillRect(0,0,1024,512);const t=12,n=8,r=6,s=5,a=1024/t,o=512*.84/n;for(let c=0;c<n;c++)for(let d=0;d<t;d++){const h=d*a+r,u=c*o+s+12,f=a-r*2,v=o-s*2,M=e.createLinearGradient(h,u,h+f,u+v);M.addColorStop(0,"#e8ecf2"),M.addColorStop(.5,"#b8bec7"),M.addColorStop(1,"#d8dde6"),e.fillStyle=M,e.fillRect(h,u,f,v),e.strokeStyle="#5c4332",e.lineWidth=2,e.strokeRect(h,u,f,v);const g=["#c8102e","#004b87","#115e38","#1a1a1a","#d4af37"];e.fillStyle=g[(c*3+d)%g.length],e.beginPath(),e.arc(h+f*.22,u+v*.5,v*.28,0,Math.PI*2),e.fill(),e.fillStyle="#2b2b2b",e.fillRect(h+f*.42,u+v*.28,f*.46,3),e.fillRect(h+f*.42,u+v*.56,f*.34,2.5)}const l=new Ci(i);return l.wrapS=Qn,l}function nc(i,e="#d8dee6",t="#c59216",n=!1){const r=document.createElement("canvas");r.width=1024,r.height=160;const s=r.getContext("2d");s.fillStyle=e,s.fillRect(0,0,1024,160),n&&(s.fillStyle="#009c3b",s.fillRect(0,126,1024,18),s.fillStyle="#ffdf00",s.fillRect(0,144,1024,16)),s.font='900 68px "Arial Black", Impact, sans-serif',s.textAlign="center",s.textBaseline="middle",s.fillStyle="#3a2b05",s.fillText(i,515,72),s.fillStyle=t,s.fillText(i,512,68);const a=new Ci(r);return a.wrapS=Qn,a}function Ko(i=!0){const e=document.createElement("canvas");e.width=256,e.height=320;const t=e.getContext("2d"),n=t.createLinearGradient(0,0,256,320);return n.addColorStop(0,"#fcfcfc"),n.addColorStop(.5,"#eef0f3"),n.addColorStop(1,"#dcdfe4"),t.fillStyle=n,t.fillRect(0,0,256,320),t.strokeStyle="#c5a03f",t.lineWidth=6,t.strokeRect(6,6,244,308),t.fillStyle="#181818",t.beginPath(),t.arc(62,66,18,0,Math.PI*2),t.fill(),t.font="italic 900 34px Arial, sans-serif",t.fillStyle="#141414",t.fillText("FERJ",88,78),t.fillStyle="#c8102e",t.fillRect(88,84,112,5),i?(t.font="bold 16px Arial, sans-serif",t.fillStyle="#555555",t.textAlign="center",t.fillText("CAMPEÃO ESTADUAL",128,138),t.font="bold 22px Arial, sans-serif",t.fillStyle="#b08b2e",t.fillText("SÉRIE A",128,170),t.strokeStyle="#222",t.lineWidth=2,t.strokeRect(72,200,112,66),t.font="900 26px Arial, sans-serif",t.fillStyle="#1a1a1a",t.fillText("RIO",128,242)):(t.font="900 28px Arial, sans-serif",t.fillStyle="#a6192e",t.textAlign="center",t.fillText("RIO",128,165),t.font="bold 18px Arial, sans-serif",t.fillStyle="#1f2937",t.fillText("ESTADUAL",128,210)),new Ci(e)}function O0(i=!1,e=null,t=null){return{goldPolished:new Et({color:new ze(16763202),metalness:.96,roughness:.11,clearcoat:.65,clearcoatRoughness:.08,reflectivity:1,wireframe:i}),goldBrushed:new Et({color:new ze(14854699),metalness:.91,roughness:.26,clearcoat:.35,wireframe:i}),copperRose:new Et({color:new ze(14253932),metalness:.88,roughness:.22,clearcoat:.5,wireframe:i}),silverPolished:new Et({color:new ze(16185595),metalness:.98,roughness:.08,clearcoat:.78,clearcoatRoughness:.06,wireframe:i}),silverBrushed:new Et({color:new ze(14475753),metalness:.93,roughness:.22,clearcoat:.38,wireframe:i}),silverAntique:new Et({color:new ze(13620703),metalness:.92,roughness:.28,bumpMap:e,bumpScale:.015,clearcoat:.3,wireframe:i}),silverBall:new Et({color:new ze(15922682),metalness:.95,roughness:.15,bumpMap:e,bumpScale:.024,clearcoat:.55,wireframe:i}),goldBall:new Et({color:new ze(16763461),metalness:.97,roughness:.12,bumpMap:e,bumpScale:.032,clearcoat:.7,wireframe:i}),whiteCeramicGlobe:new Et({color:new ze(16316144),metalness:.15,roughness:.2,clearcoat:.85,wireframe:i}),mahoganyWood:new Et({color:new ze(3544329),metalness:.06,roughness:.32,clearcoat:.85,clearcoatRoughness:.14,wireframe:i}),blackMarble:new Et({color:new ze(1316120),metalness:.15,roughness:.16,clearcoat:.92,clearcoatRoughness:.08,wireframe:i}),emeraldAccent:new Et({color:new ze(817726),metalness:.35,roughness:.2,clearcoat:.8,wireframe:i}),orangeRibbon:new Et({color:new ze(15094556),metalness:.1,roughness:.4,side:Ft,wireframe:i}),greenRibbon:new Et({color:new ze(1212987),metalness:.1,roughness:.4,side:Ft,wireframe:i})}}function Qo(i){const e=new $t,t=new be(new mt(.76,.79,.24,64),i.mahoganyWood);t.position.y=-2.18,e.add(t);const n=new be(new mt(.8,.81,.03,64),i.silverPolished);n.position.y=-2.3,e.add(n);const r=F0(),s=new Et({map:r,metalness:.75,roughness:.22,clearcoat:.6,wireframe:i.goldPolished.wireframe}),a=new be(new mt(.74,.76,1.55,64),s);a.position.y=-1.28,e.add(a);const o=new Yt(.16,.11,.018),l=8,c=12;for(let R=0;R<l;R++){const w=-1.86+R*.175,I=.752-R*.002;for(let U=0;U<c;U++){const L=U/c*Math.PI*2,D=new be(o,(R+U)%5===0?i.goldBrushed:i.silverBrushed);D.position.set(Math.sin(L)*I,w,Math.cos(L)*I),D.rotation.y=L,e.add(D)}}const d=[new G(.75,-.5),new G(.75,-.42),new G(.68,-.32),new G(.62,-.22),new G(.48,-.15),new G(.32,.02),new G(.22,.35),new G(.18,.72),new G(.16,.92),new G(.26,.98),new G(.18,1.05)],h=new be(new Hn(d,64),i.silverPolished);e.add(h);for(let R=0;R<16;R++){const w=R/16*Math.PI*2,I=new Kt([new N(Math.sin(w)*.42,-.12,Math.cos(w)*.42),new N(Math.sin(w)*.23,.35,Math.cos(w)*.23),new N(Math.sin(w)*.17,.88,Math.cos(w)*.17)]),U=new be(new Zt(I,20,.016,8,!1),i.silverBrushed);e.add(U)}const u=.62,f=1.56,v=new be(new wn(u,64,64),i.silverPolished);v.position.y=f,e.add(v);const M=new be(new mt(u+.018,u+.018,.18,64),i.silverBrushed);M.position.y=f,e.add(M),[-.09,.09].forEach(R=>{const w=new be(new zn(u+.02,.014,16,64),i.silverPolished);w.rotation.x=Math.PI/2,w.position.y=f+R,e.add(w)});const g=new be(new mt(.16,.16,.035,32),i.copperRose);g.rotation.x=Math.PI/2,g.position.set(0,f+.01,u+.015),e.add(g);const m=new Kt([new N(-.38,f-.08,.49),new N(-.22,f-.28,.52),new N(0,f-.35,.53),new N(.22,f-.28,.52),new N(.38,f-.08,.49)]),E=new be(new Zt(m,32,.012,8,!1),i.silverBrushed);e.add(E),[-1,1].forEach(R=>{const w=new be(new zn(.11,.02,12,24),i.silverPolished);w.position.set(R*(u+.01),f,0),w.scale.set(.6,1.2,.5),e.add(w)});const T=new be(new mt(.06,.11,.12,24),i.silverPolished);T.position.y=f+u+.04,e.add(T);const _=new $t;_.position.y=f+u+.1;const C=new be(new mt(.018,.014,.24,12),i.silverPolished);C.position.set(.02,.11,0),C.rotation.z=-.15,_.add(C);const A=new be(new mt(.017,.013,.22,12),i.silverPolished);A.position.set(-.06,.13,.03),A.rotation.z=.65,_.add(A);const x=new be(new mt(.042,.026,.18,14),i.silverPolished);x.position.set(-.01,.28,0),x.rotation.z=.18,_.add(x);const S=new be(new mt(.013,.013,.28,10),i.silverPolished);S.position.set(-.01,.32,0),S.rotation.z=1.1,_.add(S);const O=new be(new wn(.038,16,16),i.silverPolished);return O.position.set(-.03,.41,0),_.add(O),e.add(_),e}function B0(i){const e=new $t,t=nc("BRASILEIRÃO","#e5e9f0","#b88917",!1),n=new Et({map:t,metalness:.94,roughness:.12,clearcoat:.7,wireframe:i.silverPolished.wireframe}),r=new be(new mt(.68,.96,.72,64),n);r.position.y=-1.88,e.add(r);const s=new be(new zn(.68,.028,16,64),i.emeraldAccent);s.rotation.x=Math.PI/2,s.position.y=-1.51,e.add(s);const a=[new G(.67,-1.5),new G(.54,-.75),new G(.52,-.1),new G(.68,.65),new G(.95,1.45),new G(1.18,2.08),new G(1.1,2.08),new G(.84,1.35),new G(.45,.2),new G(0,-1.4)],o=new be(new Hn(a,64),i.silverPolished);o.scale.set(1.08,1,.52),e.add(o),[-1,1].forEach(u=>{const f=new Kt([new N(u*.66,-1.48,0),new N(u*.52,-.35,0),new N(u*.76,.85,0),new N(u*1.18,2.1,0)]),v=new be(new Zt(f,40,.085,4,!1),i.silverBrushed);v.scale.set(.9,1,.45),e.add(v)});const l=new Ol;l.moveTo(-.28,-1.5),l.lineTo(.28,-1.5),l.quadraticCurveTo(.24,-.8,.48,-.05),l.lineTo(0,1.28),l.lineTo(-.48,-.05),l.quadraticCurveTo(-.24,-.8,-.28,-1.5),l.closePath();const c=new ha;c.absarc(0,-.02,.36,0,Math.PI*2,!1),l.holes.push(c);const d=new be(new Ia(l,{depth:.32,bevelEnabled:!0,bevelThickness:.04,bevelSize:.03,bevelSegments:4}),i.goldPolished);d.position.set(0,0,-.16),e.add(d);const h=new be(new wn(.41,64,64),i.goldBall);return h.position.set(0,-.02,.08),e.add(h),e}function z0(i){const e=new $t,t=[new G(0,-2.28),new G(1.06,-2.28),new G(1.02,-1.78),new G(.92,-1.72),new G(.82,-1.68),new G(.8,-1.42),new G(.52,-1.32),new G(.46,-1.18),new G(.82,-.62),new G(.98,-.15),new G(1.08,.65),new G(1.02,1.25),new G(.82,1.42),new G(.54,1.44),new G(.54,1.66),new G(.48,1.66),new G(.48,1.35),new G(0,1.25)],n=new be(new Hn(t,64),i.silverPolished);e.add(n),[-1.68,-1.42,1.65].forEach((f,v)=>{const M=v===0?.84:v===1?.78:.54,g=new be(new zn(M,.018,16,64),i.goldPolished);g.rotation.x=Math.PI/2,g.position.y=f,e.add(g)});const r=nc("COPA DO BRASIL","#cfd6df","#d4a017",!0),s=new Et({map:r,metalness:.9,roughness:.15,clearcoat:.6,wireframe:i.silverPolished.wireframe}),a=new be(new mt(1.12,1.12,.34,64,1,!0),s);a.position.y=-.32,e.add(a);const o=new be(new zn(1.1,.025,16,64),i.silverPolished);o.rotation.x=Math.PI/2,o.position.y=-.15,e.add(o);const l=new be(new zn(1.1,.025,16,64),i.goldPolished);l.rotation.x=Math.PI/2,l.position.y=-.49,e.add(l);const c=new be(new Yt(.68,.72,.08),i.silverPolished);c.position.set(0,.76,1.02),c.rotation.x=.08,e.add(c);const d=new be(new Yt(.22,.56,.11),i.silverBrushed);d.position.set(0,.76,1.03),d.rotation.x=.08,e.add(d);const h=new be(new Yt(.54,.22,.11),i.silverBrushed);h.position.set(0,.76,1.03),h.rotation.x=.08,e.add(h);const u=new be(new Yt(.28,.12,.13),i.goldPolished);return u.position.set(0,.76,1.04),u.rotation.x=.08,e.add(u),[-1,1].forEach(f=>{const v=new Kt([new N(f*.92,1.32,0),new N(f*1.42,1.36,0),new N(f*1.34,.55,0),new N(f*1.08,-.18,0)]),M=new be(new Zt(v,32,.065,16,!1),i.silverPolished);M.scale.z=.45,e.add(M);const g=new Kt([new N(f*1.18,1.36,.12),new N(f*1.24,.35,.18),new N(f*1.32,-.75,.22),new N(f*1.42,-1.75,.26)]),m=new be(new Zt(g,32,.08,8,!1),i.orangeRibbon);m.scale.set(1.1,1,.15),e.add(m);const E=new Kt([new N(f*1.15,1.32,-.05),new N(f*1.2,.25,-.08),new N(f*1.26,-.85,-.1),new N(f*1.34,-1.65,-.12)]),T=new be(new Zt(E,32,.07,8,!1),i.greenRibbon);T.scale.set(1.1,1,.15),e.add(T)}),e}function k0(i){const e=new $t,t=new be(new mt(1.06,1.1,.08,64),i.emeraldAccent);t.position.y=-2.24,e.add(t);const n=new be(new mt(.68,1.06,.62,64),i.silverPolished);n.position.y=-1.9,e.add(n);const r=[new G(.56,-1.6),new G(.52,-.7),new G(.66,.45),new G(.86,1.65),new G(.92,2.15),new G(.85,2.15),new G(.76,1.5),new G(0,1.3)],s=new be(new Hn(r,64),i.silverPolished);e.add(s);const a=new be(new Yt(.11,1.65,.06),i.silverBrushed);a.position.set(-.04,1.32,.78),a.rotation.x=-.11,e.add(a);const o=new be(new mt(.28,.28,.06,6),i.silverPolished);o.rotation.x=Math.PI/2-.11,o.position.set(.22,1.52,.78),e.add(o);const l=9;for(let h=0;h<l;h++){const u=h/(l-1),f=new Kt([new N(.45-u*.12,-1.55+u*.12,.48),new N(.15-u*.18,-.75+u*.24,.65),new N(-.32-u*.14,.15+u*.32,.68),new N(-.72-u*.08,.95+u*.28,.42)]),v=new be(new Zt(f,36,.062-u*.015,12,!1),h%2===0?i.goldPolished:i.goldBrushed);v.scale.set(1.15,1,.42),e.add(v)}const c=new Kt([new N(.48,-1.4,.35),new N(.62,.2,.52),new N(.78,2.15,.48)]),d=new be(new Zt(c,32,.035,12,!1),i.goldPolished);return e.add(d),e}function G0(i){const e=new $t,t=new be(new mt(.76,.78,.14,64),i.silverPolished);t.position.y=-2.24,e.add(t);const n=[new G(.58,-2.16),new G(.52,-2.02),new G(.24,-1.72),new G(.18,-1.42),new G(.36,-1.32),new G(.34,-1.2),new G(.22,-1.12),new G(.62,-.78),new G(.82,-.25),new G(.92,.55),new G(.98,.62),new G(.98,.92),new G(.88,.96),new G(.76,1.18),new G(.32,1.32),new G(.16,1.48),new G(.32,1.62),new G(.1,1.85),new G(0,1.92)],r=new be(new Hn(n,64),i.silverPolished);e.add(r);const s=14;for(let l=0;l<s;l++){const c=l/s*Math.PI*2,d=new be(new Pa(.12,.68,5),i.silverAntique);d.position.set(Math.sin(c)*.72,-.58,Math.cos(c)*.72),d.rotation.y=c,d.rotation.x=.35,d.scale.set(1,1,.35),e.add(d)}const a=new be(new mt(.99,.99,.26,48),i.silverAntique);a.position.y=.77,e.add(a);const o=new be(new wn(.16,16,16),i.silverAntique);return o.position.y=2.08,o.scale.set(.85,1.35,.85),e.add(o),[-1,1].forEach(l=>{const c=new Kt([new N(l*.95,.82,0),new N(l*.98,1.18,0),new N(l*1.42,1.12,0),new N(l*1.38,.32,0),new N(l*1.12,-.38,0),new N(l*.56,-.88,0)],!1,"catmullrom",.15),d=new be(new Zt(c,48,.042,12,!1),i.silverPolished);d.scale.z=.55,e.add(d)}),e}function H0(i){const e=new $t,t=new be(new mt(.72,.74,.1,64),i.goldPolished);t.position.y=-2.26,e.add(t);const n=new be(new mt(.48,.7,.72,64),i.goldPolished);n.position.y=-1.86,e.add(n);const r=new be(new mt(.5,.5,.08,64),i.goldBrushed);r.position.y=-1.48,e.add(r);const s=6;for(let c=0;c<s;c++){const d=c/s*Math.PI*2,h=.58,u=new Kt([new N(Math.sin(d)*.42,-1.45,Math.cos(d)*.42),new N(Math.sin(d+h*.35)*.22,-.45,Math.cos(d+h*.35)*.22),new N(Math.sin(d+h*.7)*.19,.55,Math.cos(d+h*.7)*.19),new N(Math.sin(d+h)*.52,1.78,Math.cos(d+h)*.52)]),f=new be(new Zt(u,48,.052,8,!1),c%2===0?i.goldPolished:i.goldBrushed);f.scale.set(1.15,1,.65),e.add(f)}const a=1.82,o=new be(new wn(.49,64,64),i.whiteCeramicGlobe);o.position.y=a,e.add(o);const l=new be(new wn(.498,48,48,0,Math.PI*2,0,Math.PI*.55),i.goldPolished);return l.position.y=a,l.rotation.z=.22,e.add(l),e}function V0(i){const e=new $t,t=new be(new mt(.92,.92,.76,8),i.mahoganyWood);t.position.y=-1.92,t.rotation.y=Math.PI/8,e.add(t);const n=new Et({map:Ko(!0),roughness:.2,metalness:.1,clearcoat:.5}),r=new Et({map:Ko(!1),roughness:.2,metalness:.1,clearcoat:.5}),s=new be(new Yt(.58,.66,.03),n);s.position.set(0,-1.92,.855),e.add(s),[-1,1].forEach(c=>{const d=new be(new Yt(.42,.66,.03),r),h=c*(Math.PI/4);d.position.set(Math.sin(h)*.855,-1.92,Math.cos(h)*.855),d.rotation.y=h,e.add(d)});const a=[new G(.56,-1.54),new G(.52,-1.42),new G(.38,-1.25),new G(.18,-.95),new G(.28,-.82),new G(.18,-.72),new G(.32,-.58),new G(.68,-.22),new G(.84,.45),new G(.92,1.15),new G(.98,1.22),new G(.98,1.48),new G(.9,1.48),new G(.78,.5),new G(0,-.45)],o=new be(new Hn(a,64),i.goldPolished);e.add(o);const l=new be(new mt(.99,.97,.26,48),i.goldBrushed);l.position.y=1.34,e.add(l);for(let c=0;c<24;c++){const d=c/24*Math.PI*2,h=new be(new wn(.055,12,12),i.goldPolished);h.position.set(Math.sin(d)*.98,1.34,Math.cos(d)*.98),h.scale.set(1,1.4,.5),e.add(h)}return[-1,1].forEach(c=>{const d=new Kt([new N(c*.94,1.32,0),new N(c*.98,1.72,0),new N(c*1.42,1.7,0),new N(c*1.36,.85,0),new N(c*1.05,.05,0),new N(c*.52,-.52,0)],!1,"catmullrom",.12),h=new be(new Zt(d,48,.038,12,!1),i.goldPolished);h.scale.z=.55,e.add(h)}),e}function W0(i,e,t="intercontinental"){const n=(i||"").toLowerCase().replace(/[-_]/g,"");return n.includes("mundial")||n.includes("intercontinental")||n.includes("copario")?t==="copario51"?G0(e):H0(e):n.includes("libertadores")?Qo(e):n.includes("brasil")&&!n.includes("copa")?B0(e):n.includes("copa")&&n.includes("brasil")?z0(e):n.includes("estadual")||n.includes("paulist")||n.includes("carioca")?t==="paulista"?k0(e):V0(e):Qo(e)}function el({trophyId:i,variant:e="intercontinental",lightingPreset:t="warm",autoRotate:n=!0,wireframe:r=!1,height:s=200,cameraDistance:a=6.2}){const o=He.useRef(null),l=He.useRef(null),c=He.useRef(null),d=He.useRef(null),h=He.useRef(!1),u=He.useRef({x:0,y:0}),f=He.useRef({x:0,y:.006});return He.useEffect(()=>{const v=o.current;if(!v)return;const M=v.clientWidth||280,g=s,m=new wl;d.current=m;const E=new rn(36,M/g,.1,100);E.position.set(0,.35,a),E.lookAt(0,.1,0);const T=new D0({antialias:!0,alpha:!0,powerPreference:"high-performance"});T.setSize(M,g),T.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),T.toneMapping=va,T.toneMappingExposure=1.25,"outputColorSpace"in T&&Gt&&(T.outputColorSpace=Gt),c.current=T,v.innerHTML="",v.appendChild(T.domElement);const _=I0(T,t);m.environment=_;const C=new Ms(16774358,2.2);C.position.set(5,8,6),m.add(C);const A=new Ms(14412542,1.5);A.position.set(-6,5,-5),m.add(A);const x=new Ms(16765568,.7);x.position.set(0,-6,3),m.add(x);const S=document.createElement("canvas");S.width=128,S.height=128;const O=S.getContext("2d"),R=O.createRadialGradient(64,64,8,64,64,60);R.addColorStop(0,"rgba(35, 25, 15, 0.42)"),R.addColorStop(.6,"rgba(35, 25, 15, 0.14)"),R.addColorStop(1,"rgba(35, 25, 15, 0)"),O.fillStyle=R,O.fillRect(0,0,128,128);const w=new Ci(S),I=new be(new bn(3.2,3.2),new Jn({map:w,transparent:!0,depthWrite:!1}));I.rotation.x=-Math.PI/2,I.position.y=-2.38,m.add(I);const U=N0(),L=U0(),D=O0(r,U,L),H=W0(i,D,e);H.rotation.y=-.35,H.rotation.x=.06,l.current=H,m.add(H);const k=q=>{h.current=!0;const le=q.touches?q.touches[0].clientX:q.clientX,Ee=q.touches?q.touches[0].clientY:q.clientY;u.current={x:le,y:Ee}},Q=q=>{if(!h.current||!l.current)return;const le=q.touches?q.touches[0].clientX:q.clientX,Ee=q.touches?q.touches[0].clientY:q.clientY,Ie=le-u.current.x,me=Ee-u.current.y;l.current.rotation.y+=Ie*.013,l.current.rotation.x=Math.max(-.45,Math.min(.55,l.current.rotation.x+me*.009)),f.current={x:me*5e-4,y:Ie*.002},u.current={x:le,y:Ee}},j=()=>{h.current=!1},J=T.domElement;J.addEventListener("mousedown",k),window.addEventListener("mousemove",Q),window.addEventListener("mouseup",j),J.addEventListener("touchstart",k,{passive:!0}),window.addEventListener("touchmove",Q,{passive:!0}),window.addEventListener("touchend",j);const $=()=>{if(!v||!T)return;const q=v.clientWidth;q!==0&&(E.aspect=q/g,E.updateProjectionMatrix(),T.setSize(q,g))};window.addEventListener("resize",$);let ae;const we=()=>{ae=requestAnimationFrame(we),l.current&&!h.current&&(n?l.current.rotation.y+=.0065:(l.current.rotation.y+=f.current.y,f.current.y*=.94)),T.render(m,E)};return we(),()=>{cancelAnimationFrame(ae),J.removeEventListener("mousedown",k),window.removeEventListener("mousemove",Q),window.removeEventListener("mouseup",j),J.removeEventListener("touchstart",k),window.removeEventListener("touchmove",Q),window.removeEventListener("touchend",j),window.removeEventListener("resize",$),v.contains(J)&&v.removeChild(J),T.dispose(),_.dispose(),U.dispose(),L.dispose(),w.dispose()}},[i,e,t,n,r,s,a]),p.jsx("div",{ref:o,style:{width:"100%",height:`${s}px`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"grab"},title:"Arraste para girar em 360°"})}function ic({clube:i}){const[e,t]=He.useState([]),[n,r]=He.useState(!0),[s,a]=He.useState("todos"),[o,l]=He.useState(null),[c,d]=He.useState("warm"),[h,u]=He.useState(!0),[f,v]=He.useState(!1),[M,g]=He.useState({});He.useEffect(()=>{if(!i)return;let _=!0;return r(!0),fetch(`/api/clubes/trofeus?clube=${encodeURIComponent(i)}`).then(C=>C.json()).then(C=>{if(_){const A=C.trofeus||[];t(A);const x={},S=(i||"").toLowerCase().includes("palmeiras"),O=["palmeiras","corinthians","santos","são paulo","bragantino","ponte preta"].some(R=>(i||"").toLowerCase().includes(R));A.forEach(R=>{const w=(R.modelo_3d_tipo||R.tipo_trofeu||"").toLowerCase();w.includes("mundial")?x[R.id||"mundial"]=S?"copario51":"intercontinental":w.includes("estadual")&&(x[R.id||"estadual"]=O?"paulista":"carioca")}),g(x),r(!1)}}).catch(C=>{console.error("Erro ao carregar troféus:",C),_&&r(!1)}),()=>{_=!1}},[i]);const m=(_,C)=>{g(A=>({...A,[_]:C}))},E=e.filter(_=>s==="todos"?!0:(_.tipo_trofeu||"").toLowerCase()===s.toLowerCase()),T=e.reduce((_,C)=>_+(C.quantidade||0),0);return p.jsxs("div",{className:"editorial-panel",style:{padding:"24px",backgroundColor:"var(--surface-panel)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",display:"flex",flexDirection:"column",gap:"20px",width:"100%",boxSizing:"border-box"},children:[p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px",borderBottom:"1px solid var(--border-subtle)",paddingBottom:"18px"},children:[p.jsxs("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"12px"},children:[p.jsxs("div",{children:[p.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",color:"var(--accent)",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"6px"},children:[p.jsx(kr,{size:13}),p.jsxs("span",{children:["Sala de Troféus & Museu 3D • ",i]})]}),p.jsxs("h2",{className:"font-editorial",style:{fontSize:"1.5rem",fontWeight:700,color:"var(--text-primary)",margin:0,display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"},children:[p.jsx("span",{children:"Réplicas 3D Oficiais de Conquistas"}),p.jsxs("span",{className:"font-mono",style:{fontSize:"0.78rem",fontWeight:700,padding:"3px 9px",borderRadius:"12px",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)",border:"1px solid var(--border-subtle)"},children:[T," títulos registrados"]})]}),p.jsx("p",{style:{margin:"4px 0 0 0",fontSize:"0.84rem",color:"var(--text-secondary)"},children:"Modelos procedurais com acabamento PBR, reflexos de estúdio em tempo real e controle orbital 360°. Arraste com o mouse ou toque para inspecionar."})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",backgroundColor:"var(--surface-card)",padding:"6px 10px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)",flexWrap:"wrap"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px"},children:[p.jsx(uc,{size:13,style:{color:"var(--accent)"}}),p.jsx("span",{style:{fontSize:"0.7rem",fontWeight:600,color:"var(--text-secondary)",marginRight:"2px"},children:"Luz:"}),[{id:"warm",label:"Estúdio Ouro"},{id:"stadium",label:"Estádio"},{id:"dramatic",label:"Dramático"}].map(_=>p.jsx("button",{onClick:()=>d(_.id),style:{padding:"3px 8px",fontSize:"0.68rem",fontWeight:c===_.id?700:500,borderRadius:"4px",border:"none",cursor:"pointer",backgroundColor:c===_.id?"var(--accent)":"transparent",color:c===_.id?"#FFFFFF":"var(--text-secondary)",transition:"all 0.15s ease"},children:_.label},_.id))]}),p.jsx("div",{style:{width:"1px",height:"16px",backgroundColor:"var(--border-subtle)"}}),p.jsxs("button",{onClick:()=>u(_=>!_),title:h?"Pausar rotação contínua":"Ativar rotação contínua",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.68rem",fontWeight:600,borderRadius:"4px",border:"1px solid var(--border-subtle)",backgroundColor:h?"var(--surface-raised)":"transparent",color:h?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:[h?p.jsx(hc,{size:12}):p.jsx(fc,{size:12}),p.jsx("span",{children:h?"Giro Ativo":"Giro Pausado"})]}),p.jsxs("button",{onClick:()=>v(_=>!_),title:"Visualizar geometria e malha 3D",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.68rem",fontWeight:600,borderRadius:"4px",border:"1px solid var(--border-subtle)",backgroundColor:f?"var(--accent)":"transparent",color:f?"#FFFFFF":"var(--text-secondary)",cursor:"pointer"},children:[p.jsx(pc,{size:12}),p.jsx("span",{children:"Wireframe"})]})]})]}),p.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"6px",paddingTop:"4px"},children:[{id:"todos",label:"Todos os Troféus"},{id:"mundial",label:"Mundiais"},{id:"libertadores",label:"Libertadores"},{id:"brasileirao",label:"Brasileirão"},{id:"copa_brasil",label:"Copa do Brasil"},{id:"estadual",label:"Estaduais"}].map(_=>p.jsx("button",{onClick:()=>a(_.id),style:{padding:"5px 12px",fontSize:"0.74rem",fontWeight:s===_.id?700:500,borderRadius:"var(--radius-control)",border:"1px solid",borderColor:s===_.id?"var(--accent)":"var(--border-subtle)",backgroundColor:s===_.id?"var(--accent)":"var(--surface-card)",color:s===_.id?"#FFFFFF":"var(--text-secondary)",cursor:"pointer",transition:"all 0.15s ease"},children:_.label},_.id))})]}),n?p.jsxs("div",{style:{padding:"60px",textAlign:"center",color:"var(--text-secondary)"},children:[p.jsx(mc,{size:24,style:{animation:"spin 2s linear infinite",marginBottom:"8px"}}),p.jsx("p",{style:{margin:0,fontSize:"0.88rem"},children:"Renderizando vitrine e calibrando texturas 3D..."})]}):E.length===0?p.jsx("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:p.jsx("p",{style:{margin:0,fontSize:"0.88rem"},children:"Nenhum troféu encontrado para o filtro selecionado."})}):p.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"18px",alignItems:"stretch"},children:E.map((_,C)=>{const A=_.id||`${_.modelo_3d_tipo}_${C}`,x=(_.modelo_3d_tipo||_.tipo_trofeu||"").toLowerCase(),S=M[A]||(x.includes("mundial")?"intercontinental":"paulista"),O=x.includes("mundial")||x.includes("copario"),R=x.includes("estadual");return p.jsxs("div",{style:{position:"relative",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",padding:"16px",display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:"var(--shadow-editorial)",overflow:"hidden",transition:"transform 0.18s ease, border-color 0.18s ease"},onMouseEnter:w=>{w.currentTarget.style.transform="translateY(-2px)",w.currentTarget.style.borderColor="var(--accent)"},onMouseLeave:w=>{w.currentTarget.style.transform="translateY(0)",w.currentTarget.style.borderColor="var(--border-subtle)"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[p.jsx("span",{className:"font-editorial",style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"190px"},title:_.torneio,children:_.torneio}),p.jsxs("span",{className:"font-mono",style:{padding:"3px 8px",fontSize:"0.72rem",fontWeight:700,borderRadius:"10px",backgroundColor:"var(--accent)",color:"#FFFFFF",boxShadow:"0 2px 5px rgba(0,0,0,0.18)"},children:[_.quantidade,"x"]})]}),O&&p.jsxs("div",{style:{display:"flex",gap:"4px",marginBottom:"6px"},children:[p.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"intercontinental")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="intercontinental"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="intercontinental"?"var(--surface-raised)":"transparent",color:S==="intercontinental"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"FIFA Intercontinental"}),p.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"copario51")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="copario51"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="copario51"?"var(--surface-raised)":"transparent",color:S==="copario51"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"Copa Rio 1951"})]}),R&&p.jsxs("div",{style:{display:"flex",gap:"4px",marginBottom:"6px"},children:[p.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"paulista")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="paulista"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="paulista"?"var(--surface-raised)":"transparent",color:S==="paulista"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"Paulistão FPF"}),p.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"carioca")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="carioca"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="carioca"?"var(--surface-raised)":"transparent",color:S==="carioca"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"Carioca FERJ"})]}),p.jsx(el,{trophyId:_.modelo_3d_tipo||_.tipo_trofeu,variant:S,lightingPreset:c,autoRotate:h,wireframe:f,height:190,cameraDistance:6.2}),p.jsxs("div",{style:{borderTop:"1px solid var(--border-subtle)",paddingTop:"10px",display:"flex",flexDirection:"column",gap:"8px"},children:[p.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:[(_.anos_conquistados||"").split(",").slice(0,5).map((w,I)=>p.jsx("span",{className:"font-mono",style:{fontSize:"0.68rem",padding:"2px 6px",borderRadius:"4px",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)"},children:w.trim()},I)),(_.anos_conquistados||"").split(",").length>5&&p.jsxs("span",{className:"font-mono",style:{fontSize:"0.68rem",padding:"2px 5px",borderRadius:"4px",backgroundColor:"var(--surface-raised)",color:"var(--accent)",fontWeight:600},children:["+",(_.anos_conquistados||"").split(",").length-5]})]}),p.jsxs("button",{onClick:()=>l({..._,variant:S}),style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",padding:"7px 12px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)",fontSize:"0.74rem",fontWeight:600,cursor:"pointer",transition:"background-color 0.15s ease"},onMouseEnter:w=>{w.currentTarget.style.backgroundColor="var(--border-subtle)"},onMouseLeave:w=>{w.currentTarget.style.backgroundColor="var(--surface-raised)"},children:[p.jsx(gc,{size:13,style:{color:"var(--accent)"}}),p.jsx("span",{children:"Inspecionar Réplica (Museu)"})]})]})]},A)})}),o&&p.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(10, 9, 8, 0.78)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"},onClick:()=>l(null),children:p.jsxs("div",{style:{width:"100%",maxWidth:"720px",backgroundColor:"var(--surface-panel)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",padding:"24px",display:"flex",flexDirection:"column",gap:"18px",boxShadow:"0 20px 50px rgba(0,0,0,0.4)",boxSizing:"border-box"},onClick:_=>_.stopPropagation(),children:[p.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px"},children:[p.jsxs("div",{children:[p.jsxs("span",{style:{fontSize:"0.7rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:"0.04em"},children:["Museu Histórico de Troféus • ",i]}),p.jsx("h3",{className:"font-editorial",style:{margin:"4px 0 0 0",fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:o.torneio})]}),p.jsx("button",{onClick:()=>l(null),style:{padding:"6px",borderRadius:"50%",border:"none",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)",cursor:"pointer"},children:p.jsx(xc,{size:18})})]}),p.jsxs("div",{style:{borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",overflow:"hidden",position:"relative"},children:[p.jsx(el,{trophyId:o.modelo_3d_tipo||o.tipo_trofeu,variant:o.variant||"intercontinental",lightingPreset:c,autoRotate:h,wireframe:f,height:380,cameraDistance:5.8}),p.jsxs("div",{style:{position:"absolute",bottom:"10px",left:"12px",padding:"3px 8px",borderRadius:"4px",backgroundColor:"rgba(0,0,0,0.6)",color:"#FFFFFF",fontSize:"0.68rem",display:"flex",alignItems:"center",gap:"5px"},children:[p.jsx(vc,{size:11}),p.jsx("span",{children:"Arraste para girar em 360° • Zoom com roda do mouse"})]})]}),p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[p.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:p.jsxs("span",{className:"font-mono",style:{fontSize:"0.82rem",fontWeight:700,color:"var(--accent)"},children:["Total: ",o.quantidade,"x títulos conquistados"]})}),p.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"5px"},children:(o.anos_conquistados||"").split(",").map((_,C)=>p.jsx("span",{className:"font-mono",style:{padding:"3px 8px",fontSize:"0.74rem",fontWeight:600,borderRadius:"4px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)"},children:_.trim()},C))}),p.jsx("p",{style:{margin:"6px 0 0 0",fontSize:"0.82rem",color:"var(--text-secondary)",lineHeight:1.5},children:"Réplica digital tridimensional renderizada proceduramente em WebGL com sombreamento físico ACES Filmic Tone Mapping, reflexos em softboxes de estúdio e simulação de metais polidos e escovados."})]})]})})]})}function X0({clube:i,onVoltar:e,onSelectJogador:t}){var T,_,C,A,x,S,O,R,w,I;const[n,r]=He.useState(null),[s,a]=He.useState(!0),[o,l]=He.useState("elenco"),[c,d]=He.useState("tabela");if(He.useEffect(()=>{if(!i)return;let U=!0;return a(!0),fetch(`/api/clubes/perfil-completo?clube=${encodeURIComponent(i)}`).then(L=>L.json()).then(L=>{U&&(r(L),a(!1))}).catch(L=>{console.error("Erro ao carregar perfil do clube:",L),U&&a(!1)}),()=>{U=!1}},[i]),s)return p.jsxs("div",{className:"editorial-panel",style:{padding:"60px",textAlign:"center",backgroundColor:"var(--surface-panel)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",color:"var(--text-secondary)"},children:[p.jsx("div",{style:{display:"inline-block",width:"28px",height:"28px",border:"3px solid var(--border-subtle)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:"12px"}}),p.jsxs("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.2rem",color:"var(--text-primary)"},children:["Consultando dossiê oficial do ",i,"..."]}),p.jsx("p",{style:{margin:"6px 0 0 0",fontSize:"0.84rem"},children:"Recuperando dados cadastrais, elenco 2026, comissão técnica e histórico de partidas."})]});if(!n||!n.info)return p.jsxs("div",{className:"editorial-panel",style:{padding:"30px",textAlign:"center"},children:[p.jsx("p",{style:{color:"var(--text-secondary)"},children:"Não foi possível carregar as informações do clube."}),p.jsx("button",{onClick:e,className:"btn-touch",style:{padding:"8px 16px",borderRadius:"var(--radius-control)",backgroundColor:"var(--accent)",color:"#FFF"},children:"Voltar à Lista Geral"})]});const{info:h,ranking:u,comissao_tecnica:f,elenco:v,lideres:M,ultimos_jogos:g,historico_campeonatos:m}=n,E=[...v.goleiros||[],...v.defensores||[],...v.meio_campistas||[],...v.atacantes||[]];return p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"22px",width:"100%"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"},children:[p.jsxs("button",{onClick:e,className:"touch-tactile",style:{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",transition:"background-color 0.15s ease"},children:[p.jsx(_c,{size:15,style:{color:"var(--accent)"}}),p.jsx("span",{children:"Voltar à Lista Geral de Clubes"})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[p.jsxs("span",{className:"font-mono",style:{padding:"4px 10px",borderRadius:"12px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--accent)",color:"var(--accent)",fontSize:"0.74rem",fontWeight:700},children:["#",u.posicao||"—"," Power Ranking FutStats"]}),p.jsxs("span",{className:"font-mono",style:{padding:"4px 8px",borderRadius:"12px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-secondary)",fontSize:"0.72rem"},children:[u.pontos||0," pts ponderados"]})]})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"26px",backgroundColor:"var(--surface-panel)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-editorial)",display:"flex",flexDirection:"column",gap:"20px"},children:[p.jsxs("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"20px"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"20px",flexWrap:"wrap"},children:[p.jsx("div",{style:{width:"74px",height:"74px",borderRadius:"14px",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:p.jsx(vi,{team:h.nome,size:58})}),p.jsxs("div",{children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px",flexWrap:"wrap"},children:[p.jsxs("span",{style:{fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",color:"var(--accent)"},children:["Perfil Oficial do Clube • ",h.estado]}),h.alcunhas&&p.jsxs("span",{style:{fontSize:"0.74rem",color:"var(--text-muted)"},children:["• ",h.alcunhas]})]}),p.jsx("h1",{className:"font-editorial",style:{margin:0,fontSize:"2.1rem",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)"},children:h.nome}),p.jsx("div",{style:{fontSize:"0.88rem",color:"var(--text-secondary)",marginTop:"2px"},children:h.nome_oficial})]})]}),p.jsxs("div",{style:{padding:"12px 18px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",textAlign:"right",minWidth:"170px"},children:[p.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.03em",fontWeight:600},children:"Valor Estimado do Elenco"}),p.jsxs("div",{className:"font-mono",style:{fontSize:"1.45rem",fontWeight:700,color:"var(--accent)",marginTop:"2px"},children:["€ ",h.valor_elenco_milhoes_eur?h.valor_elenco_milhoes_eur.toFixed(1):"—"," M"]}),p.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:["~ R$ ",((h.valor_elenco_milhoes_eur||0)*6.1).toFixed(0)," milhões"]})]})]}),p.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))",gap:"12px",borderTop:"1px solid var(--border-subtle)",paddingTop:"16px"},children:[p.jsxs("div",{children:[p.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Fundação"}),p.jsx("span",{className:"font-mono",style:{fontSize:"0.85rem",fontWeight:600,color:"var(--text-primary)"},children:h.fundacao||"—"})]}),p.jsxs("div",{children:[p.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Estádio Oficial"}),p.jsx("span",{style:{fontSize:"0.85rem",fontWeight:600,color:"var(--text-primary)"},children:h.estadio_nome||"—"}),h.estadio_capacidade&&p.jsxs("span",{className:"font-mono",style:{fontSize:"0.72rem",color:"var(--text-secondary)",marginLeft:"4px"},children:["(",h.estadio_capacidade.toLocaleString("pt-BR")," lug.)"]})]}),p.jsxs("div",{children:[p.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Presidente"}),p.jsx("span",{style:{fontSize:"0.85rem",fontWeight:600,color:"var(--text-primary)"},children:h.presidente||"—"})]}),p.jsxs("div",{children:[p.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Comandante Técnico"}),p.jsx("span",{style:{fontSize:"0.85rem",fontWeight:600,color:"var(--accent)"},children:f.nome||h.treinador_atual||"—"}),f.esquema_preferido&&p.jsxs("span",{style:{fontSize:"0.72rem",color:"var(--text-secondary)",display:"block"},children:[f.esquema_preferido," • ",f.aproveitamento_pct,"% aprov."]})]})]})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border-subtle)",paddingBottom:"8px",flexWrap:"wrap",gap:"10px"},children:[p.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:[{id:"elenco",label:"Elenco 2026 & Líderes",icon:Sc,count:E.length},{id:"torneios",label:"Desempenho por Torneios",icon:tl,count:m.length},{id:"trofeus",label:"Sala de Troféus (Réplicas 3D)",icon:kr,count:((T=n.trofeus)==null?void 0:T.length)||0},{id:"idolos",label:"Grandes Ídolos & Lendas",icon:Xr,count:((_=h.idolos_historicos)==null?void 0:_.length)||0}].map(U=>{const L=U.icon,D=o===U.id;return p.jsxs("button",{onClick:()=>l(U.id),className:"touch-tactile",style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"var(--radius-control)",border:"1px solid",borderColor:D?"var(--accent)":"var(--border-subtle)",backgroundColor:D?"var(--accent)":"var(--surface-raised)",color:D?"#FFFFFF":"var(--text-secondary)",fontSize:"0.8rem",fontWeight:D?700:500,cursor:"pointer",transition:"all 0.15s ease"},children:[p.jsx(L,{size:14}),p.jsx("span",{children:U.label}),U.count>0&&p.jsx("span",{className:"font-mono",style:{fontSize:"0.68rem",padding:"1px 5px",borderRadius:"8px",backgroundColor:D?"rgba(255,255,255,0.25)":"var(--border-subtle)",color:D?"#FFFFFF":"var(--text-primary)"},children:U.count})]},U.id)})}),o==="elenco"&&p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px",backgroundColor:"var(--surface-card)",padding:"3px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)"},children:[p.jsxs("button",{onClick:()=>d("tabela"),title:"Visualização em Tabela Técnica",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.72rem",fontWeight:c==="tabela"?700:500,borderRadius:"4px",border:"none",backgroundColor:c==="tabela"?"var(--accent)":"transparent",color:c==="tabela"?"#FFFFFF":"var(--text-secondary)",cursor:"pointer"},children:[p.jsx(yc,{size:13}),p.jsx("span",{children:"Tabela"})]}),p.jsxs("button",{onClick:()=>d("cards"),title:"Visualização em Cards por Posição",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.72rem",fontWeight:c==="cards"?700:500,borderRadius:"4px",border:"none",backgroundColor:c==="cards"?"var(--accent)":"transparent",color:c==="cards"?"#FFFFFF":"var(--text-secondary)",cursor:"pointer"},children:[p.jsx(Mc,{size:13}),p.jsx("span",{children:"Cards"})]})]})]}),o==="elenco"&&p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"22px"},children:[p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[p.jsx(bc,{size:15,style:{color:"var(--accent)"}}),p.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.15rem",color:"var(--text-primary)"},children:"Destaques Individuais na Temporada 2026"})]}),p.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(210px, 1fr))",gap:"12px"},children:[p.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:M.artilheiro?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>M.artilheiro&&t&&t(M.artilheiro.atleta,M.artilheiro.id_jogador),children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[p.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Artilheiro"}),p.jsx(Xr,{size:14,style:{color:"var(--accent)"}})]}),p.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((C=M.artilheiro)==null?void 0:C.atleta)||"—"}),p.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[p.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:((A=M.artilheiro)==null?void 0:A.gols)??0}),p.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"gols marcados"})]})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:M.assistencias?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>M.assistencias&&t&&t(M.assistencias.atleta,M.assistencias.id_jogador),children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[p.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Líder em Assistências"}),p.jsx(Ec,{size:14,style:{color:"var(--accent)"}})]}),p.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((x=M.assistencias)==null?void 0:x.atleta)||"—"}),p.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[p.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:((S=M.assistencias)==null?void 0:S.assistencias)??0}),p.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"passes p/ gol"})]})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:M.melhor_nota?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>M.melhor_nota&&t&&t(M.melhor_nota.atleta,M.melhor_nota.id_jogador),children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[p.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Maior Nota Média"}),p.jsx(Tc,{size:14,style:{color:"var(--accent)"}})]}),p.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((O=M.melhor_nota)==null?void 0:O.atleta)||"—"}),p.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[p.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:(R=M.melhor_nota)!=null&&R.nota_media?Number(M.melhor_nota.nota_media).toFixed(2):"—"}),p.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"avaliação SofaScore"})]})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:M.desarmes?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>M.desarmes&&t&&t(M.desarmes.atleta,M.desarmes.id_jogador),children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[p.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Líder em Desarmes"}),p.jsx(wc,{size:14,style:{color:"var(--accent)"}})]}),p.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((w=M.desarmes)==null?void 0:w.atleta)||"—"}),p.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[p.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:((I=M.desarmes)==null?void 0:I.desarmes_ganhos)??0}),p.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"recuperações de bola"})]})]})]})]}),g&&g.length>0&&p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[p.jsxs("span",{style:{fontSize:"0.74rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-secondary)",letterSpacing:"0.04em"},children:["Forma Recente (Últimos ",g.length," confrontos oficiais)"]}),p.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:g.map((U,L)=>{const D=U.resultado==="V"?"#2e7d32":U.resultado==="E"?"#ed6c02":"#d32f2f";return p.jsxs("div",{style:{padding:"6px 12px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",display:"flex",alignItems:"center",gap:"8px"},title:`${U.data} • ${U.campeonato} • ${U.mando}: ${U.placar} vs ${U.adversario}`,children:[p.jsx("span",{style:{width:"20px",height:"20px",borderRadius:"4px",backgroundColor:D,color:"#FFFFFF",fontSize:"0.68rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"},children:U.resultado}),p.jsxs("div",{style:{display:"flex",flexDirection:"column",fontSize:"0.74rem"},children:[p.jsx("span",{style:{fontWeight:600,color:"var(--text-primary)"},children:U.placar}),p.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:U.adversario})]})]},L)})})]}),p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[p.jsxs("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.25rem",color:"var(--text-primary)"},children:["Plantel de Atletas (",E.length," jogadores registrados)"]}),p.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"Clique no jogador para abrir sua página e dossiê completo"})]}),c==="tabela"?p.jsx("div",{style:{width:"100%",overflowX:"auto",backgroundColor:"var(--surface-card)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-editorial)"},children:p.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",textAlign:"left",fontSize:"0.8rem"},children:[p.jsx("thead",{children:p.jsxs("tr",{style:{borderBottom:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)"},children:[p.jsx("th",{style:{padding:"10px 14px",fontWeight:600},children:"Atleta"}),p.jsx("th",{style:{padding:"10px 12px",fontWeight:600},children:"Posição"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Jogos"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Minutos"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Gols"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Assist."}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Nota"}),p.jsx("th",{style:{padding:"10px 14px",textAlign:"right",fontWeight:600},children:"Valor de Mercado"})]})}),p.jsx("tbody",{children:E.map((U,L)=>p.jsxs("tr",{onClick:()=>t&&t(U.atleta,U.id_jogador),style:{borderBottom:"1px solid var(--border-subtle)",cursor:"pointer",transition:"background-color 0.12s ease"},onMouseEnter:D=>{D.currentTarget.style.backgroundColor="var(--surface-raised)"},onMouseLeave:D=>{D.currentTarget.style.backgroundColor="transparent"},children:[p.jsxs("td",{style:{padding:"10px 14px",display:"flex",alignItems:"center",gap:"8px"},children:[p.jsx("span",{style:{fontWeight:700,color:"var(--text-primary)"},children:U.atleta}),p.jsx(Ts,{size:13,style:{color:"var(--text-muted)"}})]}),p.jsx("td",{style:{padding:"10px 12px",color:"var(--text-secondary)"},children:p.jsx("span",{style:{padding:"2px 6px",borderRadius:"4px",backgroundColor:"var(--surface-raised)",fontSize:"0.72rem",fontWeight:600},children:U.posicao||"—"})}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:U.jogos||0}),p.jsxs("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"var(--text-secondary)"},children:[U.minutos||0,"'"]}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",fontWeight:700,color:U.gols>0?"var(--accent)":"inherit"},children:U.gols||0}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:U.assistencias||0}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:U.nota_media?Number(U.nota_media).toFixed(2):"—"}),p.jsxs("td",{className:"font-mono",style:{padding:"10px 14px",textAlign:"right",fontWeight:700,color:"var(--text-primary)"},children:["€ ",U.valor_eur?(U.valor_eur/1e6).toFixed(1):"1.2"," M"]})]},L))})]})}):p.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"18px"},children:[{titulo:"Goleiros",lista:v.goleiros},{titulo:"Defensores (Zagueiros & Laterais)",lista:v.defensores},{titulo:"Meio-Campistas & Volantes",lista:v.meio_campistas},{titulo:"Atacantes & Pontas",lista:v.atacantes}].map((U,L)=>!U.lista||U.lista.length===0?null:p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[p.jsxs("span",{style:{fontSize:"0.74rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:"0.04em"},children:[U.titulo," (",U.lista.length,")"]}),p.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))",gap:"10px"},children:U.lista.map((D,H)=>p.jsxs("div",{onClick:()=>t&&t(D.atleta,D.id_jogador),className:"touch-tactile",style:{padding:"12px",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"space-between",gap:"8px",transition:"transform 0.15s ease, border-color 0.15s ease"},onMouseEnter:k=>{k.currentTarget.style.transform="translateY(-2px)",k.currentTarget.style.borderColor="var(--accent)"},onMouseLeave:k=>{k.currentTarget.style.transform="translateY(0)",k.currentTarget.style.borderColor="var(--border-subtle)"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[p.jsx("span",{style:{fontWeight:700,fontSize:"0.88rem",color:"var(--text-primary)"},children:D.atleta}),p.jsx(Ts,{size:14,style:{color:"var(--text-muted)"}})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"0.74rem",color:"var(--text-secondary)"},children:[p.jsx("span",{children:D.posicao}),p.jsxs("span",{className:"font-mono",children:["€ ",D.valor_eur?(D.valor_eur/1e6).toFixed(1):"1.2"," M"]})]}),p.jsxs("div",{style:{borderTop:"1px solid var(--border-subtle)",paddingTop:"6px",display:"flex",justifyContent:"space-between",fontSize:"0.72rem"},children:[p.jsxs("span",{children:[D.jogos||0," jogos (",D.minutos||0,"')"]}),p.jsxs("span",{style:{fontWeight:700,color:"var(--accent)"},children:[D.gols||0,"G • ",D.assistencias||0,"A"]})]})]},H))})]},L))})]})]}),o==="torneios"&&p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[p.jsxs("div",{children:[p.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.25rem",color:"var(--text-primary)"},children:"Campanhas em Torneios (Atuais & Passados)"}),p.jsxs("p",{style:{margin:"4px 0 0 0",fontSize:"0.82rem",color:"var(--text-secondary)"},children:["Retrospecto consolidado extraído de 115.000+ partidas oficiais disputadas pelo ",h.nome,"."]})]}),p.jsx("div",{style:{width:"100%",overflowX:"auto",backgroundColor:"var(--surface-card)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-editorial)"},children:p.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",textAlign:"left",fontSize:"0.8rem"},children:[p.jsx("thead",{children:p.jsxs("tr",{style:{borderBottom:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)"},children:[p.jsx("th",{style:{padding:"10px 14px",fontWeight:600},children:"Ano"}),p.jsx("th",{style:{padding:"10px 12px",fontWeight:600},children:"Competição"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Jogos"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Vitórias"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Empates"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Derrotas"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"GP"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"GC"}),p.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"SG"}),p.jsx("th",{style:{padding:"10px 14px",textAlign:"right",fontWeight:600},children:"Aprov. %"})]})}),p.jsx("tbody",{children:m.map((U,L)=>p.jsxs("tr",{style:{borderBottom:"1px solid var(--border-subtle)"},children:[p.jsx("td",{className:"font-mono",style:{padding:"10px 14px",fontWeight:700},children:U.ano}),p.jsx("td",{style:{padding:"10px 12px",fontWeight:600,color:"var(--text-primary)"},children:U.campeonato}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:U.jogos}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"#2e7d32",fontWeight:600},children:U.vitorias}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"#ed6c02"},children:U.empates}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"#d32f2f"},children:U.derrotas}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:U.gols_pro}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:U.gols_contra}),p.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",fontWeight:700,color:U.saldo>0?"#2e7d32":U.saldo<0?"#d32f2f":"inherit"},children:U.saldo>0?`+${U.saldo}`:U.saldo}),p.jsxs("td",{className:"font-mono",style:{padding:"10px 14px",textAlign:"right",fontWeight:700,color:"var(--accent)"},children:[U.aproveitamento,"%"]})]},L))})]})})]}),o==="trofeus"&&p.jsx("div",{style:{width:"100%"},children:p.jsx(ic,{clube:h.nome})}),o==="idolos"&&p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[p.jsxs("div",{children:[p.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.25rem",color:"var(--text-primary)"},children:"Galeria de Grandes Ídolos & Lendas Eternas"}),p.jsxs("p",{style:{margin:"4px 0 0 0",fontSize:"0.82rem",color:"var(--text-secondary)"},children:["Jogadores históricos que marcaram época e conquistaram as maiores glórias pelo ",h.nome,"."]})]}),p.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:"14px"},children:(h.idolos_historicos||[]).map((U,L)=>p.jsxs("div",{className:"editorial-panel",style:{padding:"16px",backgroundColor:"var(--surface-card)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",display:"flex",flexDirection:"column",gap:"8px"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[p.jsx("span",{style:{fontSize:"0.7rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:U.posicao}),p.jsx(Xr,{size:15,style:{color:"var(--accent)"}})]}),p.jsx("div",{style:{fontSize:"1.05rem",fontWeight:700,color:"var(--text-primary)"},children:U.nome}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:"0.78rem",color:"var(--text-secondary)"},children:[p.jsx(Ac,{size:13,style:{color:"var(--text-muted)"}}),p.jsx("span",{children:U.periodo})]}),p.jsxs("div",{style:{borderTop:"1px solid var(--border-subtle)",paddingTop:"8px",display:"flex",justifyContent:"space-between",fontSize:"0.74rem"},children:[p.jsxs("span",{children:[U.jogos," partidas"]}),p.jsxs("span",{className:"font-mono",style:{fontWeight:700,color:"var(--text-primary)"},children:[U.gols," gols"]})]})]},L))})]})]})}function Z0({timesAnalise:i,timesLoading:e,timesRecorte:t,setTimesRecorte:n,timesCampeonato:r,setTimesCampeonato:s,timesSearch:a,setTimesSearch:o,onRecarregar:l,onSelectJogador:c}){var U,L;const[d,h]=He.useState("aproveitamento"),[u,f]=He.useState(!1),[v,M]=He.useState(null),[g,m]=He.useState("Flamengo"),[E,T]=He.useState("campanhas"),[_,C]=He.useState(null),[A,x]=He.useState(!1),S=useRef(null);useEffect(()=>{function D(H){S.current&&!S.current.contains(H.target)&&x(!1)}return document.addEventListener("mousedown",D),_?p.jsx(X0,{clube:_,onVoltar:()=>C(null),onSelectJogador:c}):()=>document.removeEventListener("mousedown",D)},[]);const O=He.useMemo(()=>{if(!a||a.trim().length<1)return[];const D=a.toLowerCase(),H=new Set,k=[];return(i||[]).forEach(Q=>{const j=Q.clube||Q.nome||"";j&&j.toLowerCase().includes(D)&&!H.has(j)&&(H.add(j),k.push(j))}),k.slice(0,6)},[i,a]),R=He.useMemo(()=>{let D=(i||[]).filter(H=>a?(H.clube||H.nome||"").toLowerCase().includes(a.toLowerCase()):!0);return D.sort((H,k)=>{const Q=($,ae)=>ae==="nome"||ae==="clube"?$.clube||$.nome||"":ae==="gols_marcados"||ae==="gols_pro"?$.gols_pro??$.gols_marcados??0:ae==="gols_sofridos"||ae==="gols_contra"?$.gols_contra??$.gols_sofridos??0:ae==="saldo_gols"?$.saldo_gols??($.gols_pro??$.gols_marcados??0)-($.gols_contra??$.gols_sofridos??0):$[ae]??0;let j=Q(H,d),J=Q(k,d);return typeof j=="string"?u?j.localeCompare(J):J.localeCompare(j):u?j-J:J-j}),D},[i,a,d,u]),w=He.useMemo(()=>{if(!i||i.length===0)return null;const D=i.length,H=i.reduce((ae,we)=>ae+(we.aproveitamento||0),0)/D,k=i.reduce((ae,we)=>ae+(we.gols_pro??we.gols_marcados??0),0),Q=i.reduce((ae,we)=>ae+(we.jogos||0),0),j=Q>0?k/Q:0,J=i.reduce((ae,we)=>ae+(we.btts_pct||0),0)/D,$=i.reduce((ae,we)=>ae+(we.clean_sheets_pct||0),0)/D;return{totalClubes:D,mediaAprov:H.toFixed(1),mediaGolsJogo:j.toFixed(2),mediaBtts:J.toFixed(1),mediaCleanSheets:$.toFixed(1)}},[i]),I=D=>{d===D?f(!u):(h(D),f(!1))};return p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[p.jsxs("div",{children:[p.jsx("div",{style:{fontSize:"0.78rem",color:"var(--text-secondary)",marginBottom:"8px",letterSpacing:"0.04em",textTransform:"uppercase"},children:"Futebol Brasileiro • Módulo Analítico de Clubes"}),p.jsx("h1",{className:"font-editorial",style:{fontSize:"2.2rem",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",marginBottom:"6px"},children:"Forma Recente, Produção e Defesa dos Clubes"}),p.jsx("p",{style:{fontSize:"0.92rem",color:"var(--text-secondary)",maxWidth:"780px",lineHeight:1.55},children:"Recorte analítico oficial medindo aproveitamento de pontos, frequência de baliza inviolada (clean sheets) e probabilidade de ambas marcam (BTTS) com separação de mando de campo."})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"14px"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[p.jsx("span",{style:{fontSize:"0.76rem",fontWeight:600,color:"var(--text-secondary)"},children:"Amostra:"}),["5","10","20"].map(D=>p.jsxs("button",{onClick:()=>n(D),style:{padding:"7px 14px",minHeight:"38px",borderRadius:"var(--radius-control)",fontSize:"0.8rem",fontWeight:600,border:"1px solid var(--border-subtle)",backgroundColor:t===D?"var(--accent)":"var(--surface-raised)",color:t===D?"var(--accent-foreground)":"var(--text-primary)",cursor:"pointer"},"aria-label":`Filtrar pelos últimos ${D} jogos`,children:["Últimos ",D]},D))]}),p.jsx("div",{style:{height:"20px",width:"1px",backgroundColor:"var(--border-subtle)"}}),p.jsxs("select",{value:r,onChange:D=>s(D.target.value),style:{padding:"8px 12px",minHeight:"38px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-primary)",fontSize:"0.82rem",fontWeight:600,cursor:"pointer"},"aria-label":"Selecionar campeonato para análise de clubes",children:[p.jsx("option",{value:"",children:"Geral Recente (Todas Competições)"}),p.jsx("option",{value:"Campeonato Brasileiro",children:"Brasileirão Série A"}),p.jsx("option",{value:"Copa do Brasil",children:"Copa do Brasil"}),p.jsx("option",{value:"Campeonato Paulista",children:"Paulistão"}),p.jsx("option",{value:"Campeonato Carioca",children:"Carioca"}),p.jsx("option",{value:"Campeonato Gaúcho",children:"Gauchão"}),p.jsx("option",{value:"Campeonato Mineiro",children:"Mineiro"})]})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",flex:"1 1 auto",justifyContent:"flex-end",minWidth:"220px"},children:[p.jsxs("div",{ref:S,style:{position:"relative",flex:"1 1 180px",maxWidth:"300px"},children:[p.jsx(Rc,{size:14,style:{position:"absolute",left:"10px",top:"12px",color:"var(--text-muted)",zIndex:2}}),p.jsx("input",{type:"text",value:a,onChange:D=>{o(D.target.value),x(!0)},onFocus:()=>x(!0),onKeyDown:D=>{D.key==="Enter"&&(O.length>0?(C(O[0]),x(!1)):a.trim().length>0&&(C(a.trim()),x(!1)))},placeholder:"Buscar clube (ex: Palmeiras, Flamengo)...",style:{width:"100%",padding:"8px 10px 8px 30px",minHeight:"38px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-primary)",fontSize:"0.82rem",boxSizing:"border-box"},"aria-label":"Buscar clube na tabela ou ver perfil completo"}),A&&O.length>0&&p.jsxs("div",{style:{position:"absolute",top:"100%",left:0,right:0,marginTop:"4px",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",boxShadow:"0 8px 24px rgba(0,0,0,0.18)",zIndex:99,overflow:"hidden"},children:[p.jsx("div",{style:{padding:"6px 10px",fontSize:"0.68rem",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",borderBottom:"1px solid var(--border-subtle)"},children:"Abrir Perfil Oficial do Clube"}),O.map((D,H)=>p.jsxs("div",{onClick:()=>{C(D),x(!1)},style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",cursor:"pointer",borderBottom:H<O.length-1?"1px solid var(--border-subtle)":"none",transition:"background-color 0.12s ease"},onMouseEnter:k=>{k.currentTarget.style.backgroundColor="var(--surface-raised)"},onMouseLeave:k=>{k.currentTarget.style.backgroundColor="transparent"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[p.jsx(vi,{team:D,size:20}),p.jsx("span",{style:{fontWeight:600,fontSize:"0.82rem",color:"var(--text-primary)"},children:D})]}),p.jsx("span",{style:{fontSize:"0.72rem",color:"var(--accent)",fontWeight:600},children:"Ver Perfil →"})]},H))]})]}),p.jsxs("button",{onClick:()=>l(t,r),disabled:e,style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",minHeight:"38px",borderRadius:"var(--radius-control)",backgroundColor:"var(--accent)",color:"var(--accent-foreground)",border:"none",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"},"aria-label":"Atualizar dados de rendimento dos clubes",children:[p.jsx(Cc,{size:14,className:e?"animate-spin":""}),p.jsx("span",{children:e?"Carregando...":"Atualizar"})]})]})]}),w&&p.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(210px, 1fr))",gap:"12px"},children:[p.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[p.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Aproveitamento Médio"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaAprov,"%"]}),p.jsxs("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:["Base: ",w.totalClubes," clubes na amostra"]})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[p.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Média de Gols Marcados"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaGolsJogo," ",p.jsx("span",{style:{fontSize:"0.85rem",fontWeight:500,color:"var(--text-muted)"},children:"/ jogo"})]}),p.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:"Produção ofensiva consolidada"})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[p.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Ambas Marcam (BTTS)"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaBtts,"%"]}),p.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:"Partidas com gols mútuos"})]}),p.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[p.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Baliza Inviolada (Clean Sheets)"}),p.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaCleanSheets,"%"]}),p.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:"Jogos sem sofrer gols"})]})]}),p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",borderBottom:"1px solid var(--border-subtle)",paddingBottom:"8px"},children:[p.jsxs("button",{onClick:()=>T("campanhas"),style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"var(--radius-control)",fontSize:"0.82rem",fontWeight:E==="campanhas"?700:500,backgroundColor:E==="campanhas"?"var(--accent)":"transparent",color:E==="campanhas"?"var(--accent-foreground)":"var(--text-secondary)",border:"none",cursor:"pointer",transition:"all 0.15s ease"},children:[p.jsx(Pc,{size:14}),p.jsx("span",{children:"Grandes Campanhas (Rodada a Rodada)"})]}),p.jsxs("button",{onClick:()=>T("trofeus"),style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"var(--radius-control)",fontSize:"0.82rem",fontWeight:E==="trofeus"?700:500,backgroundColor:E==="trofeus"?"var(--accent)":"transparent",color:E==="trofeus"?"var(--accent-foreground)":"var(--text-secondary)",border:"none",cursor:"pointer",transition:"all 0.15s ease"},children:[p.jsx(kr,{size:14}),p.jsx("span",{children:"Sala de Troféus (Réplicas 3D)"})]}),p.jsxs("button",{onClick:()=>T("decadas"),style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"var(--radius-control)",fontSize:"0.82rem",fontWeight:E==="decadas"?700:500,backgroundColor:E==="decadas"?"var(--accent)":"transparent",color:E==="decadas"?"var(--accent-foreground)":"var(--text-secondary)",border:"none",cursor:"pointer",transition:"all 0.15s ease"},children:[p.jsx(Lc,{size:14}),p.jsx("span",{children:"Panorama Histórico por Décadas"})]})]}),E==="campanhas"?p.jsx(Bc,{clubeInicial:v||g||"Flamengo",anoInicial:2019}):E==="trofeus"?p.jsx(ic,{clube:v||g||((U=R[0])==null?void 0:U.clube)||"Flamengo",darkMode:!1}):p.jsx(Fc,{clubeNome:v||g||((L=R[0])==null?void 0:L.clube)||"Flamengo",partidas:[],altura:230})]}),p.jsxs("div",{className:"editorial-panel",style:{overflow:"hidden"},children:[p.jsxs("div",{style:{padding:"16px 20px",borderBottom:"1px solid var(--border-subtle)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[p.jsxs("div",{children:[p.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.15rem",fontWeight:700,color:"var(--text-primary)"},children:"Classificação por Desempenho e Eficiência"}),p.jsx("span",{style:{fontSize:"0.76rem",color:"var(--text-secondary)"},children:"Clique em qualquer coluna para reordenar a classificação."})]}),p.jsxs("div",{style:{fontSize:"0.76rem",color:"var(--text-muted)"},children:["Exibindo ",p.jsx("strong",{children:R.length})," clubes"]})]}),p.jsx("div",{style:{overflowX:"auto"},children:p.jsxs("table",{className:"editorial-table",children:[p.jsx("thead",{children:p.jsxs("tr",{children:[p.jsx("th",{style:{width:"44px",textAlign:"center",position:"sticky",left:0,zIndex:3,backgroundColor:"var(--surface-raised)"},children:"#"}),p.jsx("th",{onClick:()=>I("nome"),style:{cursor:"pointer",position:"sticky",left:"44px",zIndex:3,backgroundColor:"var(--surface-raised)",boxShadow:"2px 0 6px -2px rgba(0,0,0,0.1)"},children:p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px"},children:["Clube ",d==="nome"&&p.jsx(Cn,{size:12,color:"var(--accent)"})]})}),p.jsxs("th",{onClick:()=>I("jogos"),style:{cursor:"pointer",textAlign:"center"},children:["J ",d==="jogos"&&p.jsx(Cn,{size:12})]}),p.jsx("th",{style:{textAlign:"center"},children:"V - E - D"}),p.jsx("th",{style:{textAlign:"center"},children:"Forma Recente"}),p.jsxs("th",{onClick:()=>I("gols_marcados"),style:{cursor:"pointer",textAlign:"center"},children:["GP ",d==="gols_marcados"&&p.jsx(Cn,{size:12})]}),p.jsxs("th",{onClick:()=>I("gols_sofridos"),style:{cursor:"pointer",textAlign:"center"},children:["GC ",d==="gols_sofridos"&&p.jsx(Cn,{size:12})]}),p.jsxs("th",{onClick:()=>I("saldo_gols"),style:{cursor:"pointer",textAlign:"center"},children:["SG ",d==="saldo_gols"&&p.jsx(Cn,{size:12})]}),p.jsx("th",{onClick:()=>I("aproveitamento"),style:{cursor:"pointer"},children:p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px"},children:["Aprov. % ",d==="aproveitamento"&&p.jsx(Cn,{size:12,color:"var(--accent)"})]})}),p.jsxs("th",{className:"hide-tablet-col",onClick:()=>I("btts_pct"),style:{cursor:"pointer",textAlign:"center"},children:["BTTS % ",d==="btts_pct"&&p.jsx(Cn,{size:12})]}),p.jsxs("th",{className:"hide-tablet-col",onClick:()=>I("clean_sheets_pct"),style:{cursor:"pointer",textAlign:"center"},children:["CS % ",d==="clean_sheets_pct"&&p.jsx(Cn,{size:12})]}),p.jsx("th",{style:{width:"40px"}})]})}),p.jsx("tbody",{children:R.map((D,H)=>{var le,Ee,Ie,me;const k=D.clube||D.nome||"Clube",Q=v===k,j=(D.aproveitamento||0).toFixed(1),J=D.sequencia||D.forma_recente||[],$=D.gols_pro??D.gols_marcados??0,ae=D.gols_contra??D.gols_sofridos??0,we=D.saldo_gols??$-ae,q=D.partidas_recentes||D.ultimos_jogos||[];return p.jsxs(Dc.Fragment,{children:[p.jsxs("tr",{onClick:()=>{M(Q?null:k),m(k)},style:{cursor:"pointer",backgroundColor:Q?"var(--surface-raised)":"transparent"},role:"button",tabIndex:0,onKeyDown:Ae=>{Ae.key==="Enter"&&M(Q?null:k)},"aria-expanded":Q,"aria-label":`Detalhes de ${k}`,children:[p.jsx("td",{style:{textAlign:"center",color:"var(--text-secondary)",fontWeight:600,position:"sticky",left:0,zIndex:2,backgroundColor:Q?"var(--surface-raised)":"var(--surface-panel)"},children:H+1}),p.jsx("td",{style:{fontWeight:600,color:"var(--text-primary)",position:"sticky",left:"44px",zIndex:2,backgroundColor:Q?"var(--surface-raised)":"var(--surface-panel)",boxShadow:"2px 0 6px -2px rgba(0,0,0,0.1)"},children:p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[p.jsx(vi,{nome:k,size:22}),p.jsx("span",{children:k})]})}),p.jsx("td",{style:{textAlign:"center"},children:D.jogos}),p.jsxs("td",{style:{textAlign:"center",color:"var(--text-secondary)"},children:[D.vitorias,"-",D.empates,"-",D.derrotas]}),p.jsx("td",{style:{textAlign:"center"},children:p.jsx("div",{style:{display:"flex",gap:"3px",justifyContent:"center"},children:J.slice(-5).map((Ae,lt)=>{let Fe="var(--surface-raised)",Xe="var(--text-secondary)";return Ae==="V"?(Fe="var(--positive-bg)",Xe="var(--positive)"):Ae==="D"&&(Fe="var(--negative-bg)",Xe="var(--negative)"),p.jsx("span",{style:{display:"inline-block",width:"20px",height:"20px",borderRadius:"3px",backgroundColor:Fe,color:Xe,fontSize:"0.7rem",fontWeight:700,lineHeight:"20px",textAlign:"center"},children:Ae},lt)})})}),p.jsx("td",{style:{textAlign:"center"},children:$}),p.jsx("td",{style:{textAlign:"center"},children:ae}),p.jsx("td",{style:{textAlign:"center",fontWeight:600,color:we>=0?"var(--positive)":"var(--negative)"},children:we>0?`+${we}`:we}),p.jsx("td",{children:p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[p.jsxs("span",{style:{fontWeight:700,minWidth:"42px"},children:[j,"%"]}),p.jsx("div",{style:{flex:1,height:"4px",backgroundColor:"var(--border-subtle)",borderRadius:"2px",overflow:"hidden"},children:p.jsx("div",{style:{width:`${Math.min(D.aproveitamento||0,100)}%`,height:"100%",backgroundColor:"var(--accent)"}})})]})}),p.jsxs("td",{className:"hide-tablet-col",style:{textAlign:"center"},children:[(D.btts_pct||0).toFixed(0),"%"]}),p.jsxs("td",{className:"hide-tablet-col",style:{textAlign:"center"},children:[(D.clean_sheets_pct||0).toFixed(0),"%"]}),p.jsx("td",{style:{textAlign:"center",color:"var(--text-muted)"},children:Q?p.jsx(Ic,{size:14}):p.jsx(Nc,{size:14})})]}),Q&&p.jsx("tr",{children:p.jsx("td",{colSpan:12,style:{backgroundColor:"var(--surface-panel)",padding:"16px 20px",borderBottom:"1px solid var(--border-subtle)"},children:p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"6px"},children:[p.jsxs("span",{style:{fontSize:"0.82rem",fontWeight:700,color:"var(--text-primary)"},children:["Histórico recente dos jogos de ",k," na amostra:"]}),p.jsxs("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:["Casa: ",((le=D.casa)==null?void 0:le.aproveitamento)||0,"% (",((Ee=D.casa)==null?void 0:Ee.vitorias)||0,"V em ",((Ie=D.casa)==null?void 0:Ie.jogos)||0,"J) • Fora: ",((me=D.fora)==null?void 0:me.aproveitamento)||0,"%"]})]}),p.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",gap:"8px"},children:q.map((Ae,lt)=>p.jsxs("div",{style:{backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",padding:"8px 12px",fontSize:"0.78rem"},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",color:"var(--text-secondary)",fontSize:"0.7rem"},children:[p.jsx("span",{children:Ae.data||"Data N/I"}),p.jsx("span",{children:Ae.mando==="Casa"||Ae.mando==="C"?"Em Casa":"Fora"})]}),p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"6px",fontWeight:600},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[p.jsx(vi,{nome:Ae.adversario,size:16}),p.jsx("span",{children:Ae.adversario})]}),p.jsxs("span",{className:"tabular-nums",style:{color:Ae.resultado==="V"?"var(--positive)":Ae.resultado==="D"?"var(--negative)":"var(--text-secondary)",fontWeight:700},children:[Ae.placar," (",Ae.resultado,")"]})]})]},lt))})]})})})]},k)})})]})})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",fontSize:"0.78rem",color:"var(--text-muted)"},children:[p.jsx(Uc,{size:14}),p.jsx("span",{children:"Fonte: Base de dados relacional oficial FutStats. Amostras ordenadas cronologicamente pelas partidas mais recentes com placares auditados."})]})]})}export{Z0 as default};
