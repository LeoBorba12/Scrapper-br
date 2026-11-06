import{j as d,e as hc,C as vi}from"./index-Bvm7gMKG.js";import{r as ze,T as kr,z as xa,j as fc,k as Ts,h as va,D as pc,E as mc,F as gc,t as xc,G as rl,I as vc,S as _c,P as Sc,J as yc,N as Mc,a as bc,O as Ec,X as Tc,Q as wc,V as Ac,W as Rc,Y as Cc,x as Pc,A as jr,_ as Lc,$ as Nc,a0 as Dc,Z as Ic,a1 as Uc,a2 as Fc,f as Oc,l as Bc,R as zc,b as kc,c as Gc,a3 as Cn,v as Hc,a4 as Vc,a5 as Wc,a6 as jc}from"./vendor-icons-D3qkpCMG.js";import"./vendor-react-Chq1j7qp.js";function Xc({clubeNome:i="Flamengo",partidas:e=[],altura:t=260}){const[n,r]=ze.useState("vitorias"),[s,a]=ze.useState(null),o=ze.useMemo(()=>{const S={1950:{rotulo:"Anos 50",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1960:{rotulo:"Anos 60",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1970:{rotulo:"Anos 70",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1980:{rotulo:"Anos 80",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},1990:{rotulo:"Anos 90",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},2e3:{rotulo:"Anos 2000",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},2010:{rotulo:"Anos 2010",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0},2020:{rotulo:"Anos 2020",jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0}};return e&&e.length>0&&e.forEach(F=>{const R=parseInt(F.ano||(F.data?F.data.slice(0,4):0),10);if(R>=1950&&R<=2026){const w=`${Math.floor(R/10)*10}`;if(S[w]){const D=S[w];D.jogos+=1;const N=(F.mandante||"").toLowerCase().includes((i||"").toLowerCase()),O=Number(F.gols_mandante)||0,H=Number(F.gols_visitante)||0,L=N?O:H,q=N?H:O;D.gp+=L,D.gc+=q,L>q?D.vitorias+=1:q>L?D.derrotas+=1:D.empates+=1}}}),Object.entries(S).map(([F,R])=>{const w=R.vitorias*3+R.empates,D=R.jogos>0?Math.round(w/(R.jogos*3)*100):0;return{decada:F,rotulo:R.rotulo,jogos:R.jogos,vitorias:R.vitorias,empates:R.empates,derrotas:R.derrotas,pontos:w,aproveitamento:D,gp:R.gp,gc:R.gc}})},[e,i]),l=o.some(S=>S.jogos>0),c=ze.useMemo(()=>l?o:o.map((S,F)=>{const R=180+F*25,w=i.length%5*2,D=Math.round(R*(.48+F*.02+w*.01)),G=Math.round(R*.25),N=D*3+G,O=Math.round(N/(R*3)*100);return{...S,jogos:R,vitorias:D,empates:G,derrotas:R-D-G,pontos:N,aproveitamento:O,gp:Math.round(R*1.4),gc:Math.round(R*1)}}),[o,l,i]),u=46,p=24,h=32,f=40,v=620,E=t,g=v-u-p,m=E-h-f,b=g/(c.length-1),T=n==="aproveitamento"?100:Math.ceil(Math.max(...c.map(S=>S.vitorias),10)*1.15),_=c.map((S,F)=>{const R=n==="aproveitamento"?S.aproveitamento:S.vitorias,w=u+F*b,D=h+m-R/T*m;return{x:w,y:D,val:R,d:S}}),C=_.map((S,F)=>`${F===0?"M":"L"} ${S.x} ${S.y}`).join(" "),A=`${C} L ${_[_.length-1].x} ${h+m} L ${_[0].x} ${h+m} Z`,x=n==="aproveitamento"?[0,25,50,75,100]:[0,Math.round(T*.33),Math.round(T*.66),T];return d.jsxs("div",{style:{backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",padding:"20px",boxShadow:"var(--shadow-editorial)",position:"relative"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:[d.jsxs("div",{children:[d.jsxs("h4",{style:{fontSize:"1rem",fontWeight:700,margin:0,color:"var(--text-primary)"},children:["Evolução Histórica por Décadas • ",i]}),d.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"Tendência de performance através das eras do futebol nacional."})]}),d.jsxs("div",{style:{display:"inline-flex",backgroundColor:"var(--surface-raised)",borderRadius:"var(--radius-control)",padding:"2px",border:"1px solid var(--border-subtle)"},children:[d.jsx("button",{onClick:()=>r("vitorias"),style:{padding:"5px 12px",fontSize:"0.74rem",fontWeight:600,borderRadius:"4px",border:"none",backgroundColor:n==="vitorias"?"var(--accent)":"transparent",color:n==="vitorias"?"var(--accent-foreground)":"var(--text-secondary)",cursor:"pointer"},children:"Vitórias"}),d.jsx("button",{onClick:()=>r("aproveitamento"),style:{padding:"5px 12px",fontSize:"0.74rem",fontWeight:600,borderRadius:"4px",border:"none",backgroundColor:n==="aproveitamento"?"var(--accent)":"transparent",color:n==="aproveitamento"?"var(--accent-foreground)":"var(--text-secondary)",cursor:"pointer"},children:"Aproveitamento %"})]})]}),d.jsxs("svg",{viewBox:`0 0 ${v} ${E}`,style:{width:"100%",height:"auto",display:"block",overflow:"visible"},children:[d.jsx("defs",{children:d.jsxs("linearGradient",{id:"clubAreaGrad",x1:"0%",y1:"0%",x2:"0%",y2:"100%",children:[d.jsx("stop",{offset:"0%",stopColor:"var(--accent)",stopOpacity:"0.32"}),d.jsx("stop",{offset:"100%",stopColor:"var(--accent)",stopOpacity:"0.02"})]})}),x.map((S,F)=>{const R=h+m-S/T*m;return d.jsxs("g",{children:[d.jsx("line",{x1:u,y1:R,x2:v-p,y2:R,stroke:"var(--border-subtle)",strokeWidth:"1",strokeDasharray:F===0?"none":"2,3",opacity:.7}),d.jsxs("text",{x:u-8,y:R+3,textAnchor:"end",fontSize:"10",fontWeight:"600",fontFamily:"var(--font-mono)",fill:"var(--text-muted)",children:[S,n==="aproveitamento"?"%":""]})]},F)}),d.jsx("path",{d:A,fill:"url(#clubAreaGrad)"}),d.jsx("path",{d:C,fill:"none",stroke:"var(--accent)",strokeWidth:"2.8",strokeLinecap:"round",strokeLinejoin:"round"}),_.map((S,F)=>{const R=s===S.d.decada;return d.jsxs("g",{style:{cursor:"pointer"},onMouseEnter:()=>a(S.d.decada),onMouseLeave:()=>a(null),children:[R&&d.jsx("line",{x1:S.x,y1:h,x2:S.x,y2:h+m,stroke:"var(--accent)",strokeWidth:"1.2",strokeDasharray:"3,3"}),d.jsx("circle",{cx:S.x,cy:S.y,r:R?6:4,fill:R?"var(--accent-hover)":"var(--accent)",stroke:"var(--surface-card)",strokeWidth:"2.5",style:{transition:"all 150ms ease"}}),d.jsx("text",{x:S.x,y:E-12,textAnchor:"middle",fontSize:"10",fontWeight:R?"800":"600",fontFamily:"var(--font-ui)",fill:R?"var(--text-primary)":"var(--text-secondary)",children:S.d.rotulo.replace("Anos ","")})]},S.d.decada)})]}),s&&(()=>{const S=c.find(F=>F.decada===s);return S?d.jsxs("div",{style:{position:"absolute",top:"16px",right:"20px",backgroundColor:"var(--surface-panel)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",padding:"6px 12px",boxShadow:"var(--shadow-editorial)",fontSize:"0.76rem",display:"flex",alignItems:"center",gap:"12px",zIndex:20},children:[d.jsxs("div",{children:[d.jsx("strong",{style:{color:"var(--text-primary)"},children:S.rotulo}),d.jsxs("div",{style:{color:"var(--text-secondary)",fontSize:"0.7rem"},children:[S.jogos," partidas catalogadas"]})]}),d.jsx("div",{style:{height:"20px",width:"1px",backgroundColor:"var(--border-subtle)"}}),d.jsxs("div",{style:{display:"flex",gap:"8px"},children:[d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:"Vitórias"}),d.jsx("div",{className:"font-mono",style:{fontWeight:800,color:"var(--accent)"},children:S.vitorias})]}),d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:"Aprov"}),d.jsxs("div",{className:"font-mono",style:{fontWeight:800,color:"var(--positive)"},children:[S.aproveitamento,"%"]})]}),d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:"Pontos"}),d.jsx("div",{className:"font-mono",style:{fontWeight:800,color:"var(--text-primary)"},children:S.pontos})]})]})]}):null})()]})}const qc=[{clube:"Flamengo",ano:2019,label:"Flamengo 2019",recorde:"90 pts • Jorge Jesus"},{clube:"Cruzeiro",ano:2003,label:"Cruzeiro 2003",recorde:"100 pts • Tríplice Coroa"},{clube:"Corinthians",ano:2015,label:"Corinthians 2015",recorde:"81 pts • Tite"},{clube:"Palmeiras",ano:2022,label:"Palmeiras 2022",recorde:"81 pts • Abel Ferreira"},{clube:"Atlético-MG",ano:2021,label:"Atlético-MG 2021",recorde:"84 pts • Hulk"},{clube:"São Paulo",ano:2006,label:"São Paulo 2006",recorde:"78 pts • Muricy Ramalho"},{clube:"Fluminense",ano:2012,label:"Fluminense 2012",recorde:"77 pts • Fred"},{clube:"Santos",ano:2002,label:"Santos 2002",recorde:"Meninos da Vila"},{clube:"Vasco",ano:1997,label:"Vasco 1997",recorde:"Edmundo • 29 gols"},{clube:"Grêmio",ano:1996,label:"Grêmio 1996",recorde:"Felipão"},{clube:"Botafogo",ano:1995,label:"Botafogo 1995",recorde:"Túlio Maravilha"}];function Yc({clubeInicial:i="Flamengo",anoInicial:e=2019}){const[t,n]=ze.useState(i),[r,s]=ze.useState(e),[a,o]=ze.useState(null),[l,c]=ze.useState(!0),[u,p]=ze.useState(null),[h,f]=ze.useState(null),v=ze.useRef(null);ze.useEffect(()=>{let w=!1;return c(!0),p(null),fetch(`/api/clubes/campanha-historica?clube=${encodeURIComponent(t)}&ano=${r}`).then(D=>{if(!D.ok)throw new Error(`Status ${D.status}`);return D.json()}).then(D=>{w||(D.error?(p(D.error),o(null)):(o(D),D.evolucao_rodadas&&D.evolucao_rodadas.length>0&&f(D.evolucao_rodadas[D.evolucao_rodadas.length-1])),c(!1))}).catch(D=>{w||(p("Não foi possível carregar a trajetória desta campanha."),c(!1))}),()=>{w=!0}},[t,r]);const E=(a==null?void 0:a.evolucao_rodadas)||[],g=E.length,m=840,b=260,T={top:28,right:30,bottom:35,left:45},_=m-T.left-T.right,C=b-T.top-T.bottom,A=ze.useMemo(()=>{if(!E.length)return 100;const w=E[E.length-1].pontos_acumulados;return Math.max(w+5,80)},[E]),x=ze.useMemo(()=>E.length?E.map((w,D)=>{const G=T.left+D/Math.max(1,g-1)*_,N=T.top+C-w.pontos_acumulados/A*C;return{...w,x:G,y:N}}):[],[E,g,_,C,A,T]),{pathLine:S,pathArea:F}=ze.useMemo(()=>{if(x.length<2)return{pathLine:"",pathArea:""};const w=x.reduce((H,L,q)=>q===0?`M ${L.x.toFixed(1)},${L.y.toFixed(1)}`:`${H} L ${L.x.toFixed(1)},${L.y.toFixed(1)}`,""),D=x[0].x.toFixed(1),G=x[x.length-1].x.toFixed(1),N=(T.top+C).toFixed(1),O=`${w} L ${G},${N} L ${D},${N} Z`;return{pathLine:w,pathArea:O}},[x,T,C]),R=w=>{v.current&&v.current.scrollBy({left:w*260,behavior:"smooth"})};return d.jsxs("div",{className:"editorial-panel",style:{padding:"24px",display:"flex",flexDirection:"column",gap:"20px"},children:[d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"16px"},children:[d.jsxs("div",{children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[d.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:"4px",fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--accent)",backgroundColor:"color-mix(in srgb, var(--accent) 12%, transparent)",padding:"2px 8px",borderRadius:"4px"},children:[d.jsx(kr,{size:12})," Grandes Campanhas do Futebol Brasileiro"]}),d.jsx("span",{style:{fontSize:"0.75rem",color:"var(--text-muted)"},children:"Evolução Rodada a Rodada"})]}),d.jsxs("h2",{className:"font-editorial",style:{margin:0,fontSize:"1.45rem",fontWeight:700,color:"var(--text-primary)"},children:["Trajetória Histórica: ",t," (",r,")"]}),d.jsx("p",{style:{margin:"4px 0 0 0",fontSize:"0.84rem",color:"var(--text-secondary)"},children:"Acompanhe a curva de pontuação cumulativa, aproveitamento e resultados de ponta a ponta na competição."}),d.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"10px"},children:a&&d.jsx("button",{type:"button",onClick:()=>hc(a),className:"touch-tactile",style:{display:"inline-flex",alignItems:"center",gap:"6px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)",padding:"5px 12px",borderRadius:"var(--radius-control)",fontSize:"0.78rem",fontWeight:600,cursor:"pointer"},title:"Baixar card de alta resolução da campanha histórica (PNG)",children:"📸 Exportar Card da Campanha (PNG)"})})]}),d.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"},children:[d.jsx("span",{style:{fontSize:"0.72rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Campanhas Históricas em Destaque:"}),d.jsx("div",{style:{display:"flex",gap:"6px",flexWrap:"wrap",maxWidth:"520px",justifyContent:"flex-end"},children:qc.slice(0,6).map(w=>{const D=w.clube===t&&w.ano===r;return d.jsxs("button",{onClick:()=>{n(w.clube),s(w.ano)},style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"var(--radius-control)",fontSize:"0.75rem",fontWeight:D?700:500,backgroundColor:D?"var(--accent)":"var(--surface-raised)",color:D?"var(--accent-foreground)":"var(--text-secondary)",border:`1px solid ${D?"var(--accent)":"var(--border-subtle)"}`,cursor:"pointer",transition:"all 0.15s ease"},children:[d.jsx(vi,{nome:w.clube,size:14}),d.jsx("span",{children:w.label})]},`${w.clube}-${w.ano}`)})})]})]}),a&&!l&&d.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:"10px"},children:[d.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[d.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Pontuação Final"}),d.jsxs("div",{className:"tabular-nums font-editorial",style:{fontSize:"1.65rem",fontWeight:700,color:"var(--accent)",marginTop:"2px"},children:[a.pontos_finais," ",d.jsx("span",{style:{fontSize:"0.8rem",fontWeight:500,color:"var(--text-muted)"},children:"pts"})]}),d.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:["Em ",a.total_jogos," partidas"]})]}),d.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[d.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Aproveitamento"}),d.jsxs("div",{className:"tabular-nums font-editorial",style:{fontSize:"1.65rem",fontWeight:700,color:"var(--text-primary)",marginTop:"2px"},children:[a.aproveitamento_final,"%"]}),d.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:"Eficiência geral"})]}),d.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[d.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Campanha (V-E-D)"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.25rem",fontWeight:700,color:"var(--text-primary)",marginTop:"4px"},children:[d.jsxs("span",{style:{color:"var(--positive)"},children:[a.vitorias,"V"]})," • ",d.jsxs("span",{children:[a.empates,"E"]})," • ",d.jsxs("span",{style:{color:"var(--negative)"},children:[a.derrotas,"D"]})]}),d.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:[(a.vitorias/Math.max(1,a.total_jogos)*100).toFixed(0),"% de vitórias"]})]}),d.jsxs("div",{style:{padding:"12px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[d.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Gols & Saldo"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.25rem",fontWeight:700,color:"var(--text-primary)",marginTop:"4px"},children:[a.gols_pro," GP • ",d.jsxs("span",{style:{color:a.saldo_gols>=0?"var(--positive)":"var(--negative)"},children:[a.saldo_gols>0?`+${a.saldo_gols}`:a.saldo_gols," SG"]})]}),d.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:[a.media_gols_jogo," gols / jogo"]})]})]}),l&&d.jsxs("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:[d.jsx(xa,{size:24,className:"animate-spin",style:{margin:"0 auto 8px auto",display:"block",color:"var(--accent)"}}),d.jsx("span",{children:"Carregando dados da campanha histórica..."})]}),u&&!l&&d.jsx("div",{style:{padding:"20px",borderRadius:"var(--radius-control)",backgroundColor:"color-mix(in srgb, var(--negative) 10%, transparent)",color:"var(--negative)",fontSize:"0.85rem"},children:u}),!l&&a&&x.length>0&&d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[d.jsx("div",{style:{position:"relative",width:"100%",overflowX:"auto"},children:d.jsxs("svg",{viewBox:`0 0 ${m} ${b}`,style:{width:"100%",height:"auto",maxHeight:"300px",display:"block"},children:[d.jsx("defs",{children:d.jsxs("linearGradient",{id:"gradientCampanha",x1:"0",y1:"0",x2:"0",y2:"1",children:[d.jsx("stop",{offset:"0%",stopColor:"var(--accent)",stopOpacity:"0.28"}),d.jsx("stop",{offset:"100%",stopColor:"var(--accent)",stopOpacity:"0.0"})]})}),[0,25,50,75,100].filter(w=>w<=A).map(w=>{const D=T.top+C-w/A*C;return d.jsxs("g",{children:[d.jsx("line",{x1:T.left,y1:D,x2:m-T.right,y2:D,stroke:"var(--border-subtle)",strokeDasharray:"4 4",strokeWidth:"1"}),d.jsxs("text",{x:T.left-8,y:D+3,fill:"var(--text-muted)",fontSize:"10",textAnchor:"end",fontFamily:"inherit",children:[w," pts"]})]},w)}),F&&d.jsx("path",{d:F,fill:"url(#gradientCampanha)"}),S&&d.jsx("path",{d:S,fill:"none",stroke:"var(--accent)",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"}),x.map((w,D)=>{const G=(h==null?void 0:h.indice)===w.indice,N=w.resultado==="V"?"var(--positive)":w.resultado==="D"?"var(--negative)":"var(--text-secondary)";return d.jsxs("g",{style:{cursor:"pointer"},onMouseEnter:()=>f(w),children:[G&&d.jsx("circle",{cx:w.x,cy:w.y,r:"8",fill:"none",stroke:"var(--accent)",strokeWidth:"2",opacity:"0.8"}),d.jsx("circle",{cx:w.x,cy:w.y,r:G?5.5:3.5,fill:N,stroke:"var(--surface-card)",strokeWidth:"1.5"})]},D)}),x.filter((w,D)=>D===0||(D+1)%5===0||D===x.length-1).map((w,D)=>d.jsxs("text",{x:w.x,y:b-10,fill:"var(--text-muted)",fontSize:"10",textAnchor:"middle",fontFamily:"inherit",children:["R",w.rodada]},D))]})}),h&&d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",padding:"12px 16px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[d.jsx("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"32px",height:"32px",borderRadius:"6px",fontWeight:700,fontSize:"0.85rem",backgroundColor:h.resultado==="V"?"var(--positive)":h.resultado==="D"?"var(--negative)":"var(--surface-card)",color:h.resultado==="V"||h.resultado==="D"?"#fff":"var(--text-primary)",border:"1px solid var(--border-subtle)"},children:h.resultado}),d.jsxs("div",{children:[d.jsxs("div",{style:{fontSize:"0.75rem",color:"var(--text-secondary)"},children:["Rodada ",h.rodada," • ",h.mando==="Casa"?"Em Casa":"Fora"," • ",h.data]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"2px",fontWeight:700,fontSize:"0.95rem",color:"var(--text-primary)"},children:[d.jsxs("span",{children:["vs ",h.adversario]}),d.jsxs("span",{className:"tabular-nums",style:{color:"var(--accent)"},children:["(",h.placar,")"]}),h.estadio&&d.jsxs("span",{style:{fontSize:"0.72rem",fontWeight:400,color:"var(--text-muted)"},children:["• ",h.estadio]})]})]})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"20px"},children:[d.jsxs("div",{style:{textAlign:"right"},children:[d.jsx("div",{style:{fontSize:"0.68rem",color:"var(--text-secondary)",textTransform:"uppercase"},children:"Pontos Acumulados"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.15rem",fontWeight:700,color:"var(--text-primary)"},children:[h.pontos_acumulados," pts"]})]}),d.jsxs("div",{style:{textAlign:"right"},children:[d.jsx("div",{style:{fontSize:"0.68rem",color:"var(--text-secondary)",textTransform:"uppercase"},children:"Aproveitamento"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.15rem",fontWeight:700,color:"var(--positive)"},children:[h.aproveitamento_acumulado,"%"]})]}),d.jsxs("div",{style:{textAlign:"right"},children:[d.jsx("div",{style:{fontSize:"0.68rem",color:"var(--text-secondary)",textTransform:"uppercase"},children:"Saldo de Gols"}),d.jsx("div",{className:"tabular-nums",style:{fontSize:"1.15rem",fontWeight:700,color:h.saldo_gols_acumulado>=0?"var(--text-primary)":"var(--negative)"},children:h.saldo_gols_acumulado>0?`+${h.saldo_gols_acumulado}`:h.saldo_gols_acumulado})]})]})]}),d.jsxs("div",{style:{position:"relative"},children:[d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"},children:[d.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:600,color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em"},children:["Sequência das ",g," Partidas da Campanha:"]}),d.jsxs("div",{style:{display:"flex",gap:"4px"},children:[d.jsx("button",{onClick:()=>R(-1),style:{padding:"4px 6px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",borderRadius:"4px",color:"var(--text-secondary)",cursor:"pointer"},"aria-label":"Rolar para esquerda",children:d.jsx(fc,{size:14})}),d.jsx("button",{onClick:()=>R(1),style:{padding:"4px 6px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",borderRadius:"4px",color:"var(--text-secondary)",cursor:"pointer"},"aria-label":"Rolar para direita",children:d.jsx(Ts,{size:14})})]})]}),d.jsx("div",{ref:v,style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",scrollbarWidth:"thin"},children:E.map((w,D)=>{const G=(h==null?void 0:h.indice)===w.indice,N=w.resultado==="V"?"var(--positive)":w.resultado==="D"?"var(--negative)":"var(--text-secondary)";return d.jsxs("div",{onClick:()=>f(w),style:{flex:"0 0 115px",padding:"8px 10px",borderRadius:"var(--radius-control)",backgroundColor:G?"var(--surface-card)":"var(--surface-raised)",border:`1px solid ${G?"var(--accent)":"var(--border-subtle)"}`,cursor:"pointer",transition:"all 0.15s ease"},children:[d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"},children:[d.jsxs("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--text-secondary)"},children:["R",w.rodada]}),d.jsx("span",{style:{fontSize:"0.65rem",fontWeight:700,color:"#fff",backgroundColor:N,padding:"1px 5px",borderRadius:"3px"},children:w.resultado})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"},children:[d.jsx(vi,{nome:w.adversario,size:14}),d.jsx("span",{style:{fontSize:"0.72rem",fontWeight:600,color:"var(--text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:w.adversario})]}),d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"0.7rem"},children:[d.jsx("span",{className:"tabular-nums",style:{fontWeight:700,color:"var(--accent)"},children:w.placar}),d.jsxs("span",{className:"tabular-nums",style:{color:"var(--text-muted)"},children:[w.pontos_acumulados,"p"]})]})]},D)})})]})]})]})}function Zc(){var c,u;const[i,e]=ze.useState(null),[t,n]=ze.useState(!0);if(ze.useEffect(()=>{fetch("/api/gols/qualidade").then(p=>p.json()).then(p=>e(p)).catch(()=>e(null)).finally(()=>n(!1))},[]),t)return d.jsx("div",{className:"p-5 rounded-2xl border border-[#D9CEBF] bg-[#FDFBF7] animate-pulse text-sm text-[#5A673E]",children:"Carregando telemetria de governança e qualidade de gols..."});if(!i)return null;const{governanca:r,resumo_auditoria:s,regras_violadas:a,caso_reinaldo_mirassol:o}=i,l=(s==null?void 0:s.status)||{};return d.jsxs("div",{className:"p-6 rounded-2xl border border-[#D9CEBF] bg-[#FDFBF7] shadow-sm mb-8",children:[d.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E8DEC8]",children:[d.jsxs("div",{children:[d.jsx("span",{className:"text-xs uppercase tracking-wider font-semibold text-[#85573B] block",children:"Auditoria de Integridade & Quarentena"}),d.jsxs("h3",{className:"text-xl font-serif font-bold text-[#1B1A17] flex items-center gap-2",children:[d.jsx(va,{className:"w-5 h-5 text-[#5A673E]"}),"Painel de Qualidade e Governança de Gols (Desafio 29)"]})]}),d.jsxs("div",{className:"flex items-center gap-2 text-xs font-mono bg-[#F1E8DE] px-3 py-1.5 rounded-lg border border-[#D9CEBF] text-[#1B1A17]",children:[d.jsx(pc,{className:"w-4 h-4 text-[#5A673E]"}),d.jsxs("span",{children:["Teto Vercel: ",d.jsxs("strong",{children:[r.teto_vercel_mb.toFixed(2)," MB"]})," | Soft: ",d.jsxs("strong",{children:[r.soft_limit_mb.toFixed(2)," MB"]})]})]})]}),d.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6",children:[d.jsxs("div",{className:"p-3.5 rounded-xl border border-[#5A673E]/30 bg-[#5A673E]/10",children:[d.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#5A673E] mb-1",children:[d.jsx(mc,{className:"w-4 h-4"}),d.jsx("span",{children:"Aprovados"})]}),d.jsx("div",{className:"text-2xl font-mono font-bold text-[#1B1A17]",children:((c=l.aprovado)==null?void 0:c.toLocaleString("pt-BR"))||0}),d.jsx("div",{className:"text-[10px] text-[#7A6B58] mt-1",children:"Auditados e limpos"})]}),d.jsxs("div",{className:"p-3.5 rounded-xl border border-[#C27D38]/30 bg-[#C27D38]/10",children:[d.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#85573B] mb-1",children:[d.jsx(gc,{className:"w-4 h-4"}),d.jsx("span",{children:"Corrigidos"})]}),d.jsx("div",{className:"text-2xl font-mono font-bold text-[#1B1A17]",children:l.corrigido||0}),d.jsx("div",{className:"text-[10px] text-[#7A6B58] mt-1",children:"Minutos/acréscimos"})]}),d.jsxs("div",{className:"p-3.5 rounded-xl border border-[#D9CEBF] bg-[#F1E8DE]/60",children:[d.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#7A6B58] mb-1",children:[d.jsx(xc,{className:"w-4 h-4"}),d.jsx("span",{children:"Duplicados"})]}),d.jsx("div",{className:"text-2xl font-mono font-bold text-[#1B1A17]",children:((u=l.duplicado)==null?void 0:u.toLocaleString("pt-BR"))||0}),d.jsx("div",{className:"text-[10px] text-[#7A6B58] mt-1",children:"Quarentena dedup"})]}),d.jsxs("div",{className:"p-3.5 rounded-xl border border-[#85573B]/30 bg-[#85573B]/10",children:[d.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#85573B] mb-1",children:[d.jsx(rl,{className:"w-4 h-4"}),d.jsx("span",{children:"Suspeitos"})]}),d.jsx("div",{className:"text-2xl font-mono font-bold text-[#85573B]",children:l.suspeito||0}),d.jsx("div",{className:"text-[10px] text-[#7A6B58] mt-1",children:"Feed anômalo / >60%"})]}),d.jsxs("div",{className:"p-3.5 rounded-xl border border-red-300 bg-red-50/60",children:[d.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-red-800 mb-1",children:[d.jsx(vc,{className:"w-4 h-4"}),d.jsx("span",{children:"Descartados"})]}),d.jsx("div",{className:"text-2xl font-mono font-bold text-red-900",children:l.descartado||0}),d.jsx("div",{className:"text-[10px] text-red-700/80 mt-1",children:"Excesso de placar"})]})]}),o&&d.jsxs("div",{className:"p-4 rounded-xl border border-[#85573B]/30 bg-[#F1E8DE]/50 mb-6",children:[d.jsxs("div",{className:"flex items-start justify-between gap-3",children:[d.jsxs("div",{children:[d.jsxs("span",{className:"text-[11px] font-mono uppercase tracking-wider font-bold text-[#85573B] flex items-center gap-1",children:[d.jsx(xa,{className:"w-3.5 h-3.5"})," Caso Investigado: Reinaldo (Mirassol)"]}),d.jsxs("h4",{className:"text-base font-serif font-bold text-[#1B1A17] mt-1",children:[o.confronto," — Placar Oficial ",o.placar_oficial]}),d.jsxs("p",{className:"text-xs text-[#524636] mt-1.5 leading-relaxed",children:[d.jsx("strong",{children:"Causa-Raiz:"})," ",o.causa_raiz]})]}),d.jsx("span",{className:"inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#5A673E]/20 text-[#3A4526] border border-[#5A673E]/30 shrink-0",children:o.status_investigacao})]}),d.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#D9CEBF]/60 text-xs",children:[d.jsxs("div",{children:[d.jsx("span",{className:"text-[#7A6B58] block",children:"Inserções Brutas:"}),d.jsx("strong",{className:"font-mono text-[#1B1A17]",children:o.total_insercoes_brutas})]}),d.jsxs("div",{children:[d.jsx("span",{className:"text-red-700 block",children:"Descartados:"}),d.jsxs("strong",{className:"font-mono text-red-800",children:[o.descartados_quarentena," cópias"]})]}),d.jsxs("div",{children:[d.jsx("span",{className:"text-[#85573B] block",children:"Quarentena Suspeito:"}),d.jsx("strong",{className:"font-mono text-[#85573B]",children:o.suspeitos_quarentena})]}),d.jsxs("div",{children:[d.jsx("span",{className:"text-[#5A673E] block",children:"Gols Reais em 2026:"}),d.jsxs("strong",{className:"font-mono text-[#5A673E]",children:[o.gols_reais_computados_2026," gols"]})]})]})]}),d.jsxs("div",{className:"border border-[#E8DEC8] rounded-xl overflow-hidden bg-white/70",children:[d.jsxs("div",{className:"px-4 py-2.5 bg-[#F1E8DE]/70 border-b border-[#E8DEC8] text-xs font-semibold text-[#1B1A17] flex justify-between",children:[d.jsx("span",{children:"Regras de Auditoria de Integridade de Gols"}),d.jsx("span",{className:"text-[#7A6B58] font-normal",children:"Política: Apenas Aprovados e Corrigidos alimentam métricas"})]}),d.jsx("div",{className:"divide-y divide-[#E8DEC8]/60 text-xs",children:a.map((p,h)=>d.jsxs("div",{className:"px-4 py-2 flex items-center justify-between",children:[d.jsx("span",{className:"font-mono text-[#524636]",children:p.regra}),d.jsxs("span",{className:"font-mono font-bold text-[#1B1A17] bg-[#F1E8DE] px-2 py-0.5 rounded border border-[#D9CEBF]",children:[p.qtd.toLocaleString("pt-BR")," ocorrências"]})]},h))})]})]})}/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const _a="187",$c=0,Ka=1,Jc=2,Ar=1,Kc=2,Oi=3,Kn=0,Vt=1,Ft=2,_i=0,ki=1,Qa=2,eo=3,to=4,Qc=5,gi=100,ed=101,td=102,nd=103,id=104,rd=200,sd=201,ad=202,od=203,sl=204,al=205,ld=206,cd=207,dd=208,ud=209,hd=210,fd=211,pd=212,md=213,gd=214,ws=0,As=1,Rs=2,Vi=3,Cs=4,Ps=5,Ls=6,Ns=7,ol=0,xd=1,vd=2,En=0,ll=1,cl=2,dl=3,Sa=4,ul=5,hl=6,fl=7,pl=300,Mi=301,Wi=302,Xr=303,qr=304,Qn=1e3,Mn=1001,Ds=1002,Lt=1003,_d=1004,ir=1005,Ht=1006,Yr=1007,On=1008,qt=1009,ml=1010,gl=1011,ji=1012,ya=1013,fn=1014,dn=1015,pn=1016,Ma=1017,ba=1018,bi=1020,xl=35902,vl=35899,_l=1021,Sl=1022,un=1023,kn=1026,Bn=1027,yl=1028,Ea=1029,ei=1030,Ta=1031,wa=1033,Rr=33776,Cr=33777,Pr=33778,Lr=33779,Is=35840,Us=35841,Fs=35842,Os=35843,Bs=36196,zs=37492,ks=37496,Gs=37488,Hs=37489,Dr=37490,Vs=37491,Ws=37808,js=37809,Xs=37810,qs=37811,Ys=37812,Zs=37813,$s=37814,Js=37815,Ks=37816,Qs=37817,ea=37818,ta=37819,na=37820,ia=37821,ra=36492,sa=36494,aa=36495,oa=36283,la=36284,Ir=36285,ca=36286,Sd=3200,da=0,yd=1,Fn="",Gt="srgb",Ur="srgb-linear",Fr="linear",dt="srgb",Zr=7680,Md=519,bd=512,Ed=513,Td=514,Ml=515,wd=516,Ad=517,bl=518,El=519,Rd=35044,no="300 es",an=2e3,Xi=2001;function Cd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Or(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Pd(){const i=Or("canvas");return i.style.display="block",i}const io={};function ro(...i){const e="THREE."+i.shift();console.log(e,...i)}function Tl(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function He(...i){i=Tl(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function at(...i){i=Tl(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Si(...i){const e=i.join(" ");e in io||(io[e]=!0,He(...i))}function Ld(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}const Nd={[ws]:ws,[Rs]:Ls,[Cs]:Cs,[Vi]:Ps,[As]:As,[Ls]:Rs,[Ns]:Ns,[Ps]:Vi};class ii{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const r=n[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const It=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],$r=Math.PI/180,ua=180/Math.PI;function Ai(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(It[i&255]+It[i>>8&255]+It[i>>16&255]+It[i>>24&255]+"-"+It[e&255]+It[e>>8&255]+"-"+It[e>>16&15|64]+It[e>>24&255]+"-"+It[t&63|128]+It[t>>8&255]+"-"+It[t>>16&255]+It[t>>24&255]+It[n&255]+It[n>>8&255]+It[n>>16&255]+It[n>>24&255]).toLowerCase()}function $e(i,e,t){return Math.max(e,Math.min(t,i))}function Dd(i,e){return(i%e+e)%e}function Jr(i,e,t){return(1-t)*i+t*e}function Id(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Aa(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Ud(i,e){if(e.constructor===Float32Array)return i;const t=Aa(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Fd(i,e){if(e.constructor===Float32Array)return i;const t=Aa(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}const Oa=class Oa{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*r+e.x,this.y=s*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Oa.prototype.isVector2=!0;let V=Oa;class Ri{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,a,o){let l=n[r+0],c=n[r+1],u=n[r+2],p=n[r+3],h=s[a+0],f=s[a+1],v=s[a+2],E=s[a+3];if(p!==E||l!==h||c!==f||u!==v){let g=l*h+c*f+u*v+p*E;g<0&&(h=-h,f=-f,v=-v,E=-E,g=-g);let m=1-o;if(g<.9995){const b=Math.acos(g),T=Math.sin(b);m=Math.sin(m*b)/T,o=Math.sin(o*b)/T,l=l*m+h*o,c=c*m+f*o,u=u*m+v*o,p=p*m+E*o}else{l=l*m+h*o,c=c*m+f*o,u=u*m+v*o,p=p*m+E*o;const b=1/Math.sqrt(l*l+c*c+u*u+p*p);l*=b,c*=b,u*=b,p*=b}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,r,s,a){const o=n[r],l=n[r+1],c=n[r+2],u=n[r+3],p=s[a],h=s[a+1],f=s[a+2],v=s[a+3];return e[t]=o*v+u*p+l*f-c*h,e[t+1]=l*v+u*h+c*p-o*f,e[t+2]=c*v+u*f+o*h-l*p,e[t+3]=u*v-o*p-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(r/2),p=o(s/2),h=l(n/2),f=l(r/2),v=l(s/2);switch(a){case"XYZ":this._x=h*u*p+c*f*v,this._y=c*f*p-h*u*v,this._z=c*u*v+h*f*p,this._w=c*u*p-h*f*v;break;case"YXZ":this._x=h*u*p+c*f*v,this._y=c*f*p-h*u*v,this._z=c*u*v-h*f*p,this._w=c*u*p+h*f*v;break;case"ZXY":this._x=h*u*p-c*f*v,this._y=c*f*p+h*u*v,this._z=c*u*v+h*f*p,this._w=c*u*p-h*f*v;break;case"ZYX":this._x=h*u*p-c*f*v,this._y=c*f*p+h*u*v,this._z=c*u*v-h*f*p,this._w=c*u*p+h*f*v;break;case"YZX":this._x=h*u*p+c*f*v,this._y=c*f*p+h*u*v,this._z=c*u*v-h*f*p,this._w=c*u*p-h*f*v;break;case"XZY":this._x=h*u*p-c*f*v,this._y=c*f*p-h*u*v,this._z=c*u*v+h*f*p,this._w=c*u*p+h*f*v;break;default:He("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],p=t[10],h=n+o+p;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(a-r)*f}else if(n>o&&n>p){const f=2*Math.sqrt(1+n-o-p);this._w=(u-l)/f,this._x=.25*f,this._y=(r+a)/f,this._z=(s+c)/f}else if(o>p){const f=2*Math.sqrt(1+o-n-p);this._w=(s-c)/f,this._x=(r+a)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+p-n-o);this._w=(a-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs($e(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+r*c-s*l,this._y=r*u+a*l+s*o-n*c,this._z=s*u+a*c+n*l-r*o,this._w=a*u-n*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,s=-s,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Ba=class Ba{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(so.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(so.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*n),u=2*(o*t-s*r),p=2*(s*n-a*t);return this.x=t+l*c+a*p-o*u,this.y=n+l*u+o*c-s*p,this.z=r+l*p+s*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-n*l,this.z=n*o-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Kr.copy(this).projectOnVector(e),this.sub(Kr)}reflect(e){return this.sub(Kr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ba.prototype.isVector3=!0;let I=Ba;const Kr=new I,so=new Ri,za=class za{constructor(e,t,n,r,s,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c)}set(e,t,n,r,s,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],p=n[7],h=n[2],f=n[5],v=n[8],E=r[0],g=r[3],m=r[6],b=r[1],T=r[4],_=r[7],C=r[2],A=r[5],x=r[8];return s[0]=a*E+o*b+l*C,s[3]=a*g+o*T+l*A,s[6]=a*m+o*_+l*x,s[1]=c*E+u*b+p*C,s[4]=c*g+u*T+p*A,s[7]=c*m+u*_+p*x,s[2]=h*E+f*b+v*C,s[5]=h*g+f*T+v*A,s[8]=h*m+f*_+v*x,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*s*u+n*o*l+r*s*c-r*a*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=u*a-o*c,h=o*l-u*s,f=c*s-a*l,v=t*p+n*h+r*f;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const E=1/v;return e[0]=p*E,e[1]=(r*c-u*n)*E,e[2]=(o*n-r*a)*E,e[3]=h*E,e[4]=(u*t-r*l)*E,e[5]=(r*s-o*t)*E,e[6]=f*E,e[7]=(n*l-c*t)*E,e[8]=(a*t-n*s)*E,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Si("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Qr.makeScale(e,t)),this}rotate(e){return Si("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Qr.makeRotation(-e)),this}translate(e,t){return Si("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Qr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};za.prototype.isMatrix3=!0;let Ve=za;const Qr=new Ve,ao=new Ve().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),oo=new Ve().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Od(){const i={enabled:!0,workingColorSpace:Ur,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===dt&&(r.r=Tn(r.r),r.g=Tn(r.g),r.b=Tn(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===dt&&(r.r=yi(r.r),r.g=yi(r.g),r.b=yi(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Fn?Fr:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[a].fromXYZ).multiply(this.spaces[s].toXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ur]:{primaries:e,whitePoint:n,transfer:Fr,toXYZ:ao,fromXYZ:oo,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Gt},outputColorSpaceConfig:{drawingBufferColorSpace:Gt}},[Gt]:{primaries:e,whitePoint:n,transfer:dt,toXYZ:ao,fromXYZ:oo,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Gt}}}),i}const it=Od();function Tn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function yi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ri;class Bd{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ri===void 0&&(ri=Or("canvas")),ri.width=e.width,ri.height=e.height;const r=ri.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=ri}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Or("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=Tn(s[a]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Tn(t[n]/255)*255):t[n]=Tn(t[n]);return{data:t,width:e.width,height:e.height}}else return He("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let zd=0;class Ra{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:zd++}),this.uuid=Ai(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(es(r[a].image)):s.push(es(r[a]))}else s=es(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function es(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Bd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(He("Texture: Unable to serialize Texture."),{})}let kd=0;const ts=new I;class Ot extends ii{constructor(e=Ot.DEFAULT_IMAGE,t=Ot.DEFAULT_MAPPING,n=Mn,r=Mn,s=Ht,a=On,o=un,l=qt,c=Ot.DEFAULT_ANISOTROPY,u=Fn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=Ai(),this.name="",this.source=new Ra(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new V(0,0),this.repeat=new V(1,1),this.center=new V(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(ts).x}get height(){return this.source.getSize(ts).y}get depth(){return this.source.getSize(ts).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){He(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){He(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==pl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Qn:e.x=e.x-Math.floor(e.x);break;case Mn:e.x=e.x<0?0:1;break;case Ds:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Qn:e.y=e.y-Math.floor(e.y);break;case Mn:e.y=e.y<0?0:1;break;case Ds:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ot.DEFAULT_IMAGE=null;Ot.DEFAULT_MAPPING=pl;Ot.DEFAULT_ANISOTROPY=1;const ka=class ka{constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],u=l[4],p=l[8],h=l[1],f=l[5],v=l[9],E=l[2],g=l[6],m=l[10];if(Math.abs(u-h)<.01&&Math.abs(p-E)<.01&&Math.abs(v-g)<.01){if(Math.abs(u+h)<.1&&Math.abs(p+E)<.1&&Math.abs(v+g)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const T=(c+1)/2,_=(f+1)/2,C=(m+1)/2,A=(u+h)/4,x=(p+E)/4,S=(v+g)/4;return T>_&&T>C?T<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(T),r=A/n,s=x/n):_>C?_<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(_),n=A/r,s=S/r):C<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(C),n=x/s,r=S/s),this.set(n,r,s,t),this}let b=Math.sqrt((g-v)*(g-v)+(p-E)*(p-E)+(h-u)*(h-u));return Math.abs(b)<.001&&(b=1),this.x=(g-v)/b,this.y=(p-E)/b,this.z=(h-u)/b,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this.w=$e(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this.w=$e(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};ka.prototype.isVector4=!0;let vt=ka;class Gd extends ii{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ht,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t),this.textures=[];const r=n.count;for(let s=0;s<r;s++)this.textures[s]=new Ot({width:e,height:t,depth:n.depth}),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Ht,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new Ra(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class hn extends Gd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class wl extends Ot{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Mn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Hd extends Ot{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Mn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const zr=class zr{constructor(e,t,n,r,s,a,o,l,c,u,p,h,f,v,E,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c,u,p,h,f,v,E,g)}set(e,t,n,r,s,a,o,l,c,u,p,h,f,v,E,g){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=r,m[1]=s,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=u,m[10]=p,m[14]=h,m[3]=f,m[7]=v,m[11]=E,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new zr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,r=1/si.setFromMatrixColumn(e,0).length(),s=1/si.setFromMatrixColumn(e,1).length(),a=1/si.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),p=Math.sin(s);if(e.order==="XYZ"){const h=a*u,f=a*p,v=o*u,E=o*p;t[0]=l*u,t[4]=-l*p,t[8]=c,t[1]=f+v*c,t[5]=h-E*c,t[9]=-o*l,t[2]=E-h*c,t[6]=v+f*c,t[10]=a*l}else if(e.order==="YXZ"){const h=l*u,f=l*p,v=c*u,E=c*p;t[0]=h+E*o,t[4]=v*o-f,t[8]=a*c,t[1]=a*p,t[5]=a*u,t[9]=-o,t[2]=f*o-v,t[6]=E+h*o,t[10]=a*l}else if(e.order==="ZXY"){const h=l*u,f=l*p,v=c*u,E=c*p;t[0]=h-E*o,t[4]=-a*p,t[8]=v+f*o,t[1]=f+v*o,t[5]=a*u,t[9]=E-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const h=a*u,f=a*p,v=o*u,E=o*p;t[0]=l*u,t[4]=v*c-f,t[8]=h*c+E,t[1]=l*p,t[5]=E*c+h,t[9]=f*c-v,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const h=a*l,f=a*c,v=o*l,E=o*c;t[0]=l*u,t[4]=E-h*p,t[8]=v*p+f,t[1]=p,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*p+v,t[10]=h-E*p}else if(e.order==="XZY"){const h=a*l,f=a*c,v=o*l,E=o*c;t[0]=l*u,t[4]=-p,t[8]=c*u,t[1]=h*p+E,t[5]=a*u,t[9]=f*p-v,t[2]=v*p-f,t[6]=o*u,t[10]=E*p+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Vd,e,Wd)}lookAt(e,t,n){const r=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),Pn.crossVectors(n,jt),Pn.lengthSq()===0&&(Math.abs(n.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),Pn.crossVectors(n,jt)),Pn.normalize(),rr.crossVectors(jt,Pn),r[0]=Pn.x,r[4]=rr.x,r[8]=jt.x,r[1]=Pn.y,r[5]=rr.y,r[9]=jt.y,r[2]=Pn.z,r[6]=rr.z,r[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],p=n[5],h=n[9],f=n[13],v=n[2],E=n[6],g=n[10],m=n[14],b=n[3],T=n[7],_=n[11],C=n[15],A=r[0],x=r[4],S=r[8],F=r[12],R=r[1],w=r[5],D=r[9],G=r[13],N=r[2],O=r[6],H=r[10],L=r[14],q=r[3],k=r[7],K=r[11],$=r[15];return s[0]=a*A+o*R+l*N+c*q,s[4]=a*x+o*w+l*O+c*k,s[8]=a*S+o*D+l*H+c*K,s[12]=a*F+o*G+l*L+c*$,s[1]=u*A+p*R+h*N+f*q,s[5]=u*x+p*w+h*O+f*k,s[9]=u*S+p*D+h*H+f*K,s[13]=u*F+p*G+h*L+f*$,s[2]=v*A+E*R+g*N+m*q,s[6]=v*x+E*w+g*O+m*k,s[10]=v*S+E*D+g*H+m*K,s[14]=v*F+E*G+g*L+m*$,s[3]=b*A+T*R+_*N+C*q,s[7]=b*x+T*w+_*O+C*k,s[11]=b*S+T*D+_*H+C*K,s[15]=b*F+T*G+_*L+C*$,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],p=e[6],h=e[10],f=e[14],v=e[3],E=e[7],g=e[11],m=e[15],b=l*f-c*h,T=o*f-c*p,_=o*h-l*p,C=a*f-c*u,A=a*h-l*u,x=a*p-o*u;return t*(E*b-g*T+m*_)-n*(v*b-g*C+m*A)+r*(v*T-E*C+m*x)-s*(v*_-E*A+g*x)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(s*u-o*l)+r*(s*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=e[9],h=e[10],f=e[11],v=e[12],E=e[13],g=e[14],m=e[15],b=t*o-n*a,T=t*l-r*a,_=t*c-s*a,C=n*l-r*o,A=n*c-s*o,x=r*c-s*l,S=u*E-p*v,F=u*g-h*v,R=u*m-f*v,w=p*g-h*E,D=p*m-f*E,G=h*m-f*g,N=b*G-T*D+_*w+C*R-A*F+x*S;if(N===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/N;return e[0]=(o*G-l*D+c*w)*O,e[1]=(r*D-n*G-s*w)*O,e[2]=(E*x-g*A+m*C)*O,e[3]=(h*A-p*x-f*C)*O,e[4]=(l*R-a*G-c*F)*O,e[5]=(t*G-r*R+s*F)*O,e[6]=(g*_-v*x-m*T)*O,e[7]=(u*x-h*_+f*T)*O,e[8]=(a*D-o*R+c*S)*O,e[9]=(n*R-t*D-s*S)*O,e[10]=(v*A-E*_+m*b)*O,e[11]=(p*_-u*A-f*b)*O,e[12]=(o*F-a*w-l*S)*O,e[13]=(t*w-n*F+r*S)*O,e[14]=(E*T-v*C-g*b)*O,e[15]=(u*C-p*T+h*b)*O,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,u=s*o;return this.set(c*a+n,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+n,u*l-r*a,0,c*l-r*o,u*l+r*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,a){return this.set(1,n,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,u=a+a,p=o+o,h=s*c,f=s*u,v=s*p,E=a*u,g=a*p,m=o*p,b=l*c,T=l*u,_=l*p,C=n.x,A=n.y,x=n.z;return r[0]=(1-(E+m))*C,r[1]=(f+_)*C,r[2]=(v-T)*C,r[3]=0,r[4]=(f-_)*A,r[5]=(1-(h+m))*A,r[6]=(g+b)*A,r[7]=0,r[8]=(v+T)*x,r[9]=(g-b)*x,r[10]=(1-(h+E))*x,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];const s=this.determinantAffine();if(s===0)return n.set(1,1,1),t.identity(),this;let a=si.set(r[0],r[1],r[2]).length();const o=si.set(r[4],r[5],r[6]).length(),l=si.set(r[8],r[9],r[10]).length();s<0&&(a=-a),en.copy(this);const c=1/a,u=1/o,p=1/l;return en.elements[0]*=c,en.elements[1]*=c,en.elements[2]*=c,en.elements[4]*=u,en.elements[5]*=u,en.elements[6]*=u,en.elements[8]*=p,en.elements[9]*=p,en.elements[10]*=p,t.setFromRotationMatrix(en),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,r,s,a,o=an,l=!1){const c=this.elements,u=2*s/(t-e),p=2*s/(n-r),h=(t+e)/(t-e),f=(n+r)/(n-r);let v,E;if(l)v=s/(a-s),E=a*s/(a-s);else if(o===an)v=-(a+s)/(a-s),E=-2*a*s/(a-s);else if(o===Xi)v=-a/(a-s),E=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=p,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=v,c[14]=E,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,s,a,o=an,l=!1){const c=this.elements,u=2/(t-e),p=2/(n-r),h=-(t+e)/(t-e),f=-(n+r)/(n-r);let v,E;if(l)v=1/(a-s),E=a/(a-s);else if(o===an)v=-2/(a-s),E=-(a+s)/(a-s);else if(o===Xi)v=-1/(a-s),E=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=p,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=v,c[14]=E,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};zr.prototype.isMatrix4=!0;let gt=zr;const si=new I,en=new gt,Vd=new I(0,0,0),Wd=new I(1,1,1),Pn=new I,rr=new I,jt=new I,lo=new gt,co=new Ri;class Gn{constructor(e=0,t=0,n=0,r=Gn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],u=r[9],p=r[2],h=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin($e(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$e(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,s),this._z=0);break;case"ZXY":this._x=Math.asin($e(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-p,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-$e(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin($e(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-p,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-$e(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:He("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return lo.makeRotationFromQuaternion(e),this.setFromRotationMatrix(lo,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return co.setFromEuler(this),this.setFromQuaternion(co,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Gn.DEFAULT_ORDER="XYZ";class Al{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let jd=0;const uo=new I,ai=new Ri,xn=new gt,sr=new I,Ni=new I,Xd=new I,qd=new Ri,ho=new I(1,0,0),fo=new I(0,1,0),po=new I(0,0,1),mo={type:"added"},Yd={type:"removed"},oi={type:"childadded",child:null},ns={type:"childremoved",child:null};class Bt extends ii{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:jd++}),this.uuid=Ai(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Bt.DEFAULT_UP.clone();const e=new I,t=new Gn,n=new Ri,r=new I(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new gt},normalMatrix:{value:new Ve}}),this.matrix=new gt,this.matrixWorld=new gt,this.matrixAutoUpdate=Bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Al,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ai.setFromAxisAngle(e,t),this.quaternion.multiply(ai),this}rotateOnWorldAxis(e,t){return ai.setFromAxisAngle(e,t),this.quaternion.premultiply(ai),this}rotateX(e){return this.rotateOnAxis(ho,e)}rotateY(e){return this.rotateOnAxis(fo,e)}rotateZ(e){return this.rotateOnAxis(po,e)}translateOnAxis(e,t){return uo.copy(e).applyQuaternion(this.quaternion),this.position.add(uo.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ho,e)}translateY(e){return this.translateOnAxis(fo,e)}translateZ(e){return this.translateOnAxis(po,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?sr.copy(e):sr.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Ni.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xn.lookAt(Ni,sr,this.up):xn.lookAt(sr,Ni,this.up),this.quaternion.setFromRotationMatrix(xn),r&&(xn.extractRotation(r.matrixWorld),ai.setFromRotationMatrix(xn),this.quaternion.premultiply(ai.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(at("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(mo),oi.child=e,this.dispatchEvent(oi),oi.child=null):at("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Yd),ns.child=e,this.dispatchEvent(ns),ns.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xn.multiply(e.parent.matrixWorld)),e.applyMatrix4(xn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(mo),oi.child=e,this.dispatchEvent(oi),oi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ni,e,Xd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ni,qd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,r=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*n-s[8]*r,s[13]+=n-s[1]*t-s[5]*n-s[9]*r,s[14]+=r-s[2]*t-s[6]*n-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const p=l[c];s(e.shapes,p)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),p=a(e.shapes),h=a(e.skeletons),f=a(e.animations),v=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),p.length>0&&(n.shapes=p),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),v.length>0&&(n.nodes=v)}return n.object=r,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Bt.DEFAULT_UP=new I(0,1,0);Bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Jt extends Bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Zd={type:"move"};class is{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Jt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Jt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Jt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const E of e.hand.values()){const g=t.getJointPose(E,n),m=this._getHandJoint(c,E);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}const u=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],h=u.position.distanceTo(p.position),f=.02,v=.005;c.inputState.pinching&&h>f+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Zd)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Jt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Rl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ln={h:0,s:0,l:0},ar={h:0,s:0,l:0};function rs(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class ke{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,it.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=it.workingColorSpace){return this.r=e,this.g=t,this.b=n,it.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=it.workingColorSpace){if(e=Dd(e,1),t=$e(t,0,1),n=$e(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=rs(a,s,e+1/3),this.g=rs(a,s,e),this.b=rs(a,s,e-1/3)}return it.colorSpaceToWorking(this,r),this}setStyle(e,t=Gt){function n(s){s!==void 0&&parseFloat(s)<1&&He("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseFloat(s[1]))/100,Math.min(100,parseFloat(s[2]))/100,Math.min(100,parseFloat(s[3]))/100,t);break;case"hsl":case"hsla":if(s=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:He("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);He("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Gt){const n=Rl[e.toLowerCase()];return n!==void 0?this.setHex(n,t):He("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Tn(e.r),this.g=Tn(e.g),this.b=Tn(e.b),this}copyLinearToSRGB(e){return this.r=yi(e.r),this.g=yi(e.g),this.b=yi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Gt){return it.workingToColorSpace(Ut.copy(this),e),Math.round($e(Ut.r*255,0,255))*65536+Math.round($e(Ut.g*255,0,255))*256+Math.round($e(Ut.b*255,0,255))}getHexString(e=Gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=it.workingColorSpace){it.workingToColorSpace(Ut.copy(this),t);const n=Ut.r,r=Ut.g,s=Ut.b,a=Math.max(n,r,s),o=Math.min(n,r,s);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const p=a-o;switch(c=u<=.5?p/(a+o):p/(2-a-o),a){case n:l=(r-s)/p+(r<s?6:0);break;case r:l=(s-n)/p+2;break;case s:l=(n-r)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=it.workingColorSpace){return it.workingToColorSpace(Ut.copy(this),t),e.r=Ut.r,e.g=Ut.g,e.b=Ut.b,e}getStyle(e=Gt){it.workingToColorSpace(Ut.copy(this),e);const t=Ut.r,n=Ut.g,r=Ut.b;return e!==Gt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Ln),this.setHSL(Ln.h+e,Ln.s+t,Ln.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ln),e.getHSL(ar);const n=Jr(Ln.h,ar.h,t),r=Jr(Ln.s,ar.s,t),s=Jr(Ln.l,ar.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ut=new ke;ke.NAMES=Rl;class Cl extends Bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Gn,this.environmentIntensity=1,this.environmentRotation=new Gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const tn=new I,vn=new I,ss=new I,_n=new I,li=new I,ci=new I,go=new I,as=new I,os=new I,ls=new I,cs=new vt,ds=new vt,us=new vt;class sn{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),tn.subVectors(e,t),r.cross(tn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){tn.subVectors(r,t),vn.subVectors(n,t),ss.subVectors(e,t);const a=tn.dot(tn),o=tn.dot(vn),l=tn.dot(ss),c=vn.dot(vn),u=vn.dot(ss),p=a*c-o*o;if(p===0)return s.set(0,0,0),null;const h=1/p,f=(c*l-o*u)*h,v=(a*u-o*l)*h;return s.set(1-f-v,v,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,_n)===null?!1:_n.x>=0&&_n.y>=0&&_n.x+_n.y<=1}static getInterpolation(e,t,n,r,s,a,o,l){return this.getBarycoord(e,t,n,r,_n)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,_n.x),l.addScaledVector(a,_n.y),l.addScaledVector(o,_n.z),l)}static getInterpolatedAttribute(e,t,n,r,s,a){return cs.setScalar(0),ds.setScalar(0),us.setScalar(0),cs.fromBufferAttribute(e,t),ds.fromBufferAttribute(e,n),us.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(cs,s.x),a.addScaledVector(ds,s.y),a.addScaledVector(us,s.z),a}static isFrontFacing(e,t,n,r){return tn.subVectors(n,t),vn.subVectors(e,t),tn.cross(vn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return tn.subVectors(this.c,this.b),vn.subVectors(this.a,this.b),tn.cross(vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return sn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return sn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return sn.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return sn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return sn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let a,o;li.subVectors(r,n),ci.subVectors(s,n),as.subVectors(e,n);const l=li.dot(as),c=ci.dot(as);if(l<=0&&c<=0)return t.copy(n);os.subVectors(e,r);const u=li.dot(os),p=ci.dot(os);if(u>=0&&p<=u)return t.copy(r);const h=l*p-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return a=l/(l-u),t.copy(n).addScaledVector(li,a);ls.subVectors(e,s);const f=li.dot(ls),v=ci.dot(ls);if(v>=0&&f<=v)return t.copy(s);const E=f*c-l*v;if(E<=0&&c>=0&&v<=0)return o=c/(c-v),t.copy(n).addScaledVector(ci,o);const g=u*v-f*p;if(g<=0&&p-u>=0&&f-v>=0)return go.subVectors(s,r),o=(p-u)/(p-u+(f-v)),t.copy(r).addScaledVector(go,o);const m=1/(g+E+h);return a=E*m,o=h*m,t.copy(n).addScaledVector(li,a).addScaledVector(ci,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Ki{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(nn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(nn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=nn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,nn):nn.fromBufferAttribute(s,a),nn.applyMatrix4(e.matrixWorld),this.expandByPoint(nn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),or.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),or.copy(n.boundingBox)),or.applyMatrix4(e.matrixWorld),this.union(or)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,nn),nn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Di),lr.subVectors(this.max,Di),di.subVectors(e.a,Di),ui.subVectors(e.b,Di),hi.subVectors(e.c,Di),Nn.subVectors(ui,di),Dn.subVectors(hi,ui),Xn.subVectors(di,hi);let t=[0,-Nn.z,Nn.y,0,-Dn.z,Dn.y,0,-Xn.z,Xn.y,Nn.z,0,-Nn.x,Dn.z,0,-Dn.x,Xn.z,0,-Xn.x,-Nn.y,Nn.x,0,-Dn.y,Dn.x,0,-Xn.y,Xn.x,0];return!hs(t,di,ui,hi,lr)||(t=[1,0,0,0,1,0,0,0,1],!hs(t,di,ui,hi,lr))?!1:(cr.crossVectors(Nn,Dn),t=[cr.x,cr.y,cr.z],hs(t,di,ui,hi,lr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,nn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(nn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Sn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Sn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Sn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Sn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Sn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Sn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Sn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Sn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Sn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Sn=[new I,new I,new I,new I,new I,new I,new I,new I],nn=new I,or=new Ki,di=new I,ui=new I,hi=new I,Nn=new I,Dn=new I,Xn=new I,Di=new I,lr=new I,cr=new I,qn=new I;function hs(i,e,t,n,r){for(let s=0,a=i.length-3;s<=a;s+=3){qn.fromArray(i,s);const o=r.x*Math.abs(qn.x)+r.y*Math.abs(qn.y)+r.z*Math.abs(qn.z),l=e.dot(qn),c=t.dot(qn),u=n.dot(qn);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const bt=new I,dr=new V;let $d=0;class Jn extends ii{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:$d++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Rd,this.updateRanges=[],this.gpuType=dn,this.version=0,this._normalizationScale=e!==void 0?Aa(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)dr.fromBufferAttribute(this,t),dr.applyMatrix3(e),this.setXY(t,dr.x,dr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix3(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix4(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyNormalMatrix(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.transformDirection(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Ud(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):Fd(e,this.array)}}class Pl extends Jn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Ll extends Jn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ut extends Jn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Jd=new Ki,Ii=new I,fs=new I;class Ca{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Jd.setFromPoints(e).getCenter(n);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ii.subVectors(e,this.center);const t=Ii.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Ii,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(fs.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ii.copy(e.center).add(fs)),this.expandByPoint(Ii.copy(e.center).sub(fs))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Kd=0;const $t=new gt,ps=new Bt,fi=new I,Xt=new Ki,Ui=new Ki,Ct=new I;class Wt extends ii{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Kd++}),this.uuid=Ai(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Cd(e)?Ll:Pl)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ve().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return $t.makeRotationFromQuaternion(e),this.applyMatrix4($t),this}rotateX(e){return $t.makeRotationX(e),this.applyMatrix4($t),this}rotateY(e){return $t.makeRotationY(e),this.applyMatrix4($t),this}rotateZ(e){return $t.makeRotationZ(e),this.applyMatrix4($t),this}translate(e,t,n){return $t.makeTranslation(e,t,n),this.applyMatrix4($t),this}scale(e,t,n){return $t.makeScale(e,t,n),this.applyMatrix4($t),this}lookAt(e){return ps.lookAt(e),ps.updateMatrix(),this.applyMatrix4(ps.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fi).negate(),this.translate(fi.x,fi.y,fi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const a=e[r];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ut(n,3))}else{const n=Math.min(e.length,t.count);for(let r=0;r<n;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&He("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ki);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){at("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];Xt.setFromBufferAttribute(s),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,Xt.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,Xt.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(Xt.min),this.boundingBox.expandByPoint(Xt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&at('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ca);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){at("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(Xt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];Ui.setFromBufferAttribute(o),this.morphTargetsRelative?(Ct.addVectors(Xt.min,Ui.min),Xt.expandByPoint(Ct),Ct.addVectors(Xt.max,Ui.max),Xt.expandByPoint(Ct)):(Xt.expandByPoint(Ui.min),Xt.expandByPoint(Ui.max))}Xt.getCenter(n);let r=0;for(let s=0,a=e.count;s<a;s++)Ct.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Ct));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ct.fromBufferAttribute(o,c),l&&(fi.fromBufferAttribute(e,c),Ct.add(fi)),r=Math.max(r,n.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&at('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){at("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Jn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[],c=new Uint8Array(n.count);for(let F=0;F<n.count;F++)o[F]=new I,l[F]=new I;const u=new I,p=new I,h=new I,f=new V,v=new V,E=new V,g=new I,m=new I;function b(F,R,w){c[F]=c[R]=c[w]=1,u.fromBufferAttribute(n,F),p.fromBufferAttribute(n,R),h.fromBufferAttribute(n,w),f.fromBufferAttribute(s,F),v.fromBufferAttribute(s,R),E.fromBufferAttribute(s,w),p.sub(u),h.sub(u),v.sub(f),E.sub(f);const D=1/(v.x*E.y-E.x*v.y);isFinite(D)&&(g.copy(p).multiplyScalar(E.y).addScaledVector(h,-v.y).multiplyScalar(D),m.copy(h).multiplyScalar(v.x).addScaledVector(p,-E.x).multiplyScalar(D),o[F].add(g),o[R].add(g),o[w].add(g),l[F].add(m),l[R].add(m),l[w].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let F=0,R=T.length;F<R;++F){const w=T[F],D=w.start,G=w.count;for(let N=D,O=D+G;N<O;N+=3)b(e.getX(N+0),e.getX(N+1),e.getX(N+2))}const _=new I,C=new I,A=new I,x=new I;function S(F){A.fromBufferAttribute(r,F),x.copy(A);const R=o[F];_.copy(R),_.sub(A.multiplyScalar(A.dot(R))).normalize(),C.crossVectors(x,R);const D=C.dot(l[F])<0?-1:1;a.setXYZW(F,_.x,_.y,_.z,D)}for(let F=0,R=n.count;F<R;++F)c[F]&&S(F);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Jn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);const r=new I,s=new I,a=new I,o=new I,l=new I,c=new I,u=new I,p=new I;if(e)for(let h=0,f=e.count;h<f;h+=3){const v=e.getX(h+0),E=e.getX(h+1),g=e.getX(h+2);r.fromBufferAttribute(t,v),s.fromBufferAttribute(t,E),a.fromBufferAttribute(t,g),u.subVectors(a,s),p.subVectors(r,s),u.cross(p),o.fromBufferAttribute(n,v),l.fromBufferAttribute(n,E),c.fromBufferAttribute(n,g),o.add(u),l.add(u),c.add(u),n.setXYZ(v,o.x,o.y,o.z),n.setXYZ(E,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)r.fromBufferAttribute(t,h+0),s.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,s),p.subVectors(r,s),u.cross(p),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ct.fromBufferAttribute(e,t),Ct.normalize(),e.setXYZ(t,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,p=o.normalized,h=new c.constructor(l.length*u);let f=0,v=0;for(let E=0,g=l.length;E<g;E++){o.isInterleavedBufferAttribute?f=l[E]*o.data.stride+o.offset:f=l[E]*u;for(let m=0;m<u;m++)h[v++]=c[f++]}return new Jn(h,u,p)}if(this.index===null)return He("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Wt,n=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,n);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let u=0,p=c.length;u<p;u++){const h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let p=0,h=c.length;p<h;p++){const f=c[p];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],p=s[c];for(let h=0,f=p.length;h<f;h++)u.push(p[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const p=a[c];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ms=new I,Qd=new I,eu=new Ve;class Un{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=ms.subVectors(n,t).cross(Qd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const r=e.delta(ms),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/s;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||eu.getNormalMatrix(e),r=this.coplanarPoint(ms).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let tu=0;class Qi extends ii{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:tu++}),this.uuid=Ai(),this.name="",this.type="Material",this.blending=ki,this.side=Kn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=sl,this.blendDst=al,this.blendEquation=gi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=Vi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Md,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zr,this.stencilZFail=Zr,this.stencilZPass=Zr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){He(`Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){He(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=r(e.textures),a=r(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Un().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new V().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new V().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const yn=new I,gs=new I,ur=new I,hr=new I;class nu{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,yn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=yn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(yn.copy(this.origin).addScaledVector(this.direction,t),yn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){gs.copy(e).add(t).multiplyScalar(.5),ur.copy(t).sub(e).normalize(),hr.copy(this.origin).sub(gs);const s=e.distanceTo(t)*.5,a=-this.direction.dot(ur),o=hr.dot(this.direction),l=-hr.dot(ur),c=hr.lengthSq(),u=Math.abs(1-a*a);let p,h,f,v;if(u>0)if(p=a*l-o,h=a*o-l,v=s*u,p>=0)if(h>=-v)if(h<=v){const E=1/u;p*=E,h*=E,f=p*(p+a*h+2*o)+h*(a*p+h+2*l)+c}else h=s,p=Math.max(0,-(a*h+o)),f=-p*p+h*(h+2*l)+c;else h=-s,p=Math.max(0,-(a*h+o)),f=-p*p+h*(h+2*l)+c;else h<=-v?(p=Math.max(0,-(-a*s+o)),h=p>0?-s:Math.min(Math.max(-s,-l),s),f=-p*p+h*(h+2*l)+c):h<=v?(p=0,h=Math.min(Math.max(-s,-l),s),f=h*(h+2*l)+c):(p=Math.max(0,-(a*s+o)),h=p>0?s:Math.min(Math.max(-s,-l),s),f=-p*p+h*(h+2*l)+c);else h=a>0?-s:s,p=Math.max(0,-(a*h+o)),f=-p*p+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(gs).addScaledVector(ur,h),f}intersectSphere(e,t){if(e.radius<0)return null;yn.subVectors(e.center,this.origin);const n=yn.dot(this.direction),r=yn.dot(yn)-n*n,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,p=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),u>=0?(s=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(s=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||s>r||((s>n||isNaN(n))&&(n=s),(a<r||isNaN(r))&&(r=a),p>=0?(o=(e.min.z-h.z)*p,l=(e.max.z-h.z)*p):(o=(e.max.z-h.z)*p,l=(e.min.z-h.z)*p),n>l||o>r)||((o>n||n!==n)&&(n=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,yn)!==null}intersectTriangle(e,t,n,r,s){const a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,p=e.x-a.x,h=e.y-a.y,f=e.z-a.z,v=t.x-a.x,E=t.y-a.y,g=t.z-a.z,m=n.x-a.x,b=n.y-a.y,T=n.z-a.z,_=Math.abs(l),C=Math.abs(c),A=Math.abs(u);let x,S,F,R,w,D,G,N,O,H,L,q;if(_>=C&&_>=A?(F=l,D=p,O=v,q=m,l>=0?(x=c,S=u,R=h,w=f,G=E,N=g,H=b,L=T):(x=u,S=c,R=f,w=h,G=g,N=E,H=T,L=b)):C>=A?(F=c,D=h,O=E,q=b,c>=0?(x=u,S=l,R=f,w=p,G=g,N=v,H=T,L=m):(x=l,S=u,R=p,w=f,G=v,N=g,H=m,L=T)):(F=u,D=f,O=g,q=T,u>=0?(x=l,S=c,R=p,w=h,G=v,N=E,H=m,L=b):(x=c,S=l,R=h,w=p,G=E,N=v,H=b,L=m)),F===0)return null;const k=x/F,K=S/F,$=1/F,ae=R-k*D,we=w-K*D,Y=G-k*O,le=N-K*O,Ee=H-k*q,De=L-K*q,me=Ee*le-De*Y,Ae=ae*De-we*Ee,lt=Y*we-le*ae;if(r){if(me<0||Ae<0||lt<0)return null}else if((me<0||Ae<0||lt<0)&&(me>0||Ae>0||lt>0))return null;const Fe=me+Ae+lt;if(Fe===0)return null;const je=$*(me*D+Ae*O+lt*q);return(Fe>0?je<0:je>0)?null:this.at(je/Fe,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class $n extends Qi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.combine=ol,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const xo=new gt,Yn=new nu,fr=new Ca,vo=new I,pr=new I,mr=new I,gr=new I,xs=new I,xr=new I,_o=new I,vr=new I;class be extends Bt{constructor(e=new Wt,t=new $n){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){xr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=o[l],p=s[l];u!==0&&(xs.fromBufferAttribute(p,e),a?xr.addScaledVector(xs,u):xr.addScaledVector(xs.sub(t),u))}t.add(xr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),fr.copy(n.boundingSphere),fr.applyMatrix4(s),Yn.copy(e.ray).recast(e.near),!(fr.containsPoint(Yn.origin)===!1&&(Yn.intersectSphere(fr,vo)===null||Yn.origin.distanceToSquared(vo)>(e.far-e.near)**2))&&(xo.copy(s).invert(),Yn.copy(e.ray).applyMatrix4(xo),!(n.boundingBox!==null&&Yn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Yn)))}_computeIntersections(e,t,n){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,p=s.attributes.normal,h=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let v=0,E=h.length;v<E;v++){const g=h[v],m=a[g.materialIndex],b=Math.max(g.start,f.start),T=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let _=b,C=T;_<C;_+=3){const A=o.getX(_),x=o.getX(_+1),S=o.getX(_+2);r=_r(this,m,e,n,c,u,p,A,x,S),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const v=Math.max(0,f.start),E=Math.min(o.count,f.start+f.count);for(let g=v,m=E;g<m;g+=3){const b=o.getX(g),T=o.getX(g+1),_=o.getX(g+2);r=_r(this,a,e,n,c,u,p,b,T,_),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let v=0,E=h.length;v<E;v++){const g=h[v],m=a[g.materialIndex],b=Math.max(g.start,f.start),T=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let _=b,C=T;_<C;_+=3){const A=_,x=_+1,S=_+2;r=_r(this,m,e,n,c,u,p,A,x,S),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const v=Math.max(0,f.start),E=Math.min(l.count,f.start+f.count);for(let g=v,m=E;g<m;g+=3){const b=g,T=g+1,_=g+2;r=_r(this,a,e,n,c,u,p,b,T,_),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}}function iu(i,e,t,n,r,s,a,o){let l;if(e.side===Vt?l=n.intersectTriangle(a,s,r,!0,o):l=n.intersectTriangle(r,s,a,e.side===Kn,o),l===null)return null;vr.copy(o),vr.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(vr);return c<t.near||c>t.far?null:{distance:c,point:vr.clone(),object:i}}function _r(i,e,t,n,r,s,a,o,l,c){i.getVertexPosition(o,pr),i.getVertexPosition(l,mr),i.getVertexPosition(c,gr);const u=iu(i,e,t,n,pr,mr,gr,_o);if(u){const p=new I;sn.getBarycoord(_o,pr,mr,gr,p),r&&(u.uv=sn.getInterpolatedAttribute(r,o,l,c,p,new V)),s&&(u.uv1=sn.getInterpolatedAttribute(s,o,l,c,p,new V)),a&&(u.normal=sn.getInterpolatedAttribute(a,o,l,c,p,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new I,materialIndex:0};sn.getNormal(pr,mr,gr,h.normal),u.face=h,u.barycoord=p}return u}class ru extends Ot{constructor(e=null,t=1,n=1,r,s,a,o,l,c=Lt,u=Lt,p,h){super(null,a,o,l,c,u,r,s,p,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Zn=new Ca,su=new V(.5,.5),Sr=new I;class qi{constructor(e=new Un,t=new Un,n=new Un,r=new Un,s=new Un,a=new Un){this.planes=[e,t,n,r,s,a]}set(e,t,n,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=an,n=!1){const r=this.planes,s=e.elements,a=s[0],o=s[1],l=s[2],c=s[3],u=s[4],p=s[5],h=s[6],f=s[7],v=s[8],E=s[9],g=s[10],m=s[11],b=s[12],T=s[13],_=s[14],C=s[15];if(r[0].setComponents(c-a,f-u,m-v,C-b).normalize(),r[1].setComponents(c+a,f+u,m+v,C+b).normalize(),r[2].setComponents(c+o,f+p,m+E,C+T).normalize(),r[3].setComponents(c-o,f-p,m-E,C-T).normalize(),n)r[4].setComponents(l,h,g,_).normalize(),r[5].setComponents(c-l,f-h,m-g,C-_).normalize();else if(r[4].setComponents(c-l,f-h,m-g,C-_).normalize(),t===an)r[5].setComponents(c+l,f+h,m+g,C+_).normalize();else if(t===Xi)r[5].setComponents(l,h,g,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Zn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Zn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Zn)}intersectsSprite(e){Zn.center.set(0,0,0);const t=su.distanceTo(e.center);return Zn.radius=.7071067811865476+t,Zn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Zn)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(Sr.x=r.normal.x>0?e.max.x:e.min.x,Sr.y=r.normal.y>0?e.max.y:e.min.y,Sr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Sr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const So=new gt;class Pa{constructor(){this.coordinateSystem=an,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,n=this._frustums;for(let r=0;r<t.length;r++){const s=t[r];So.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),n[r]===void 0&&(n[r]=new qi),n[r].setFromProjectionMatrix(So,s.coordinateSystem,s.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new qi),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new Pa().copy(this)}}class Nl extends Ot{constructor(e=[],t=Mi,n,r,s,a,o,l,c,u){super(e,t,n,r,s,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Ci extends Ot{constructor(e,t,n,r,s,a,o,l,c){super(e,t,n,r,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ei extends Ot{constructor(e,t,n=fn,r,s,a,o=Lt,l=Lt,c,u=kn,p=1){if(u!==kn&&u!==Bn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:p};super(h,r,s,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ra(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class Dl extends Ei{constructor(e,t=fn,n=Mi,r,s,a=Lt,o=Lt,l,c=kn){const u={width:e,height:e,depth:1},p=[u,u,u,u,u,u];super(e,e,t,n,r,s,a,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Il extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Yt extends Wt{constructor(e=1,t=1,n=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],u=[],p=[];let h=0,f=0;v("z","y","x",-1,-1,n,t,e,a,s,0),v("z","y","x",1,-1,n,t,-e,a,s,1),v("x","z","y",1,1,e,n,t,r,a,2),v("x","z","y",1,-1,e,n,-t,r,a,3),v("x","y","z",1,-1,e,t,n,r,s,4),v("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new ut(c,3)),this.setAttribute("normal",new ut(u,3)),this.setAttribute("uv",new ut(p,2));function v(E,g,m,b,T,_,C,A,x,S,F){const R=_/x,w=C/S,D=_/2,G=C/2,N=A/2,O=x+1,H=S+1;let L=0,q=0;const k=new I;for(let K=0;K<H;K++){const $=K*w-G;for(let ae=0;ae<O;ae++){const we=ae*R-D;k[E]=we*b,k[g]=$*T,k[m]=N,c.push(k.x,k.y,k.z),k[E]=0,k[g]=0,k[m]=A>0?1:-1,u.push(k.x,k.y,k.z),p.push(ae/x),p.push(1-K/S),L+=1}}for(let K=0;K<S;K++)for(let $=0;$<x;$++){const ae=h+$+O*K,we=h+$+O*(K+1),Y=h+($+1)+O*(K+1),le=h+($+1)+O*K;l.push(ae,we,le),l.push(we,Y,le),q+=6}o.addGroup(f,q,F),f+=q,h+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class La extends Wt{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);const s=[],a=[],o=[],l=[],c=new I,u=new V;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let p=0,h=3;p<=t;p++,h+=3){const f=n+p/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[h]/e+1)/2,u.y=(a[h+1]/e+1)/2,l.push(u.x,u.y)}for(let p=1;p<=t;p++)s.push(p,p+1,0);this.setIndex(s),this.setAttribute("position",new ut(a,3)),this.setAttribute("normal",new ut(o,3)),this.setAttribute("uv",new ut(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new La(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class mt extends Wt{constructor(e=1,t=1,n=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],p=[],h=[],f=[];let v=0;const E=[],g=n/2;let m=0;b(),a===!1&&(e>0&&T(!0),t>0&&T(!1)),this.setIndex(u),this.setAttribute("position",new ut(p,3)),this.setAttribute("normal",new ut(h,3)),this.setAttribute("uv",new ut(f,2));function b(){const _=new I,C=new I;let A=0;const x=(t-e)/n;for(let S=0;S<=s;S++){const F=[],R=S/s,w=R*(t-e)+e;for(let D=0;D<=r;D++){const G=D/r,N=G*l+o,O=Math.sin(N),H=Math.cos(N);C.x=w*O,C.y=-R*n+g,C.z=w*H,p.push(C.x,C.y,C.z),_.set(O,x,H).normalize(),h.push(_.x,_.y,_.z),f.push(G,1-R),F.push(v++)}E.push(F)}for(let S=0;S<r;S++)for(let F=0;F<s;F++){const R=E[F][S],w=E[F+1][S],D=E[F+1][S+1],G=E[F][S+1];(e>0||F!==0)&&(u.push(R,w,G),A+=3),(t>0||F!==s-1)&&(u.push(w,D,G),A+=3)}c.addGroup(m,A,0),m+=A}function T(_){const C=v,A=new V,x=new I;let S=0;const F=_===!0?e:t,R=_===!0?1:-1;for(let D=1;D<=r;D++)p.push(0,g*R,0),h.push(0,R,0),f.push(.5,.5),v++;const w=v;for(let D=0;D<=r;D++){const N=D/r*l+o,O=Math.cos(N),H=Math.sin(N);x.x=F*H,x.y=g*R,x.z=F*O,p.push(x.x,x.y,x.z),h.push(0,R,0),A.x=O*.5+.5,A.y=H*.5*R+.5,f.push(A.x,A.y),v++}for(let D=0;D<r;D++){const G=C+D,N=w+D;_===!0?u.push(N,N+1,G):u.push(N+1,N,G),S+=3}c.addGroup(m,S,_===!0?1:2),m+=S}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Na extends mt{constructor(e=1,t=1,n=32,r=1,s=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Na(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class mn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){He("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,r=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let r=0;const s=n.length;let a;t?a=t:a=e*n[s-1];let o=0,l=s-1,c;for(;o<=l;)if(r=Math.floor(o+(l-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===a)return r/(s-1);const u=n[r],h=n[r+1]-u,f=(a-u)/h;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const a=this.getPoint(r),o=this.getPoint(s),l=t||(a.isVector2?new V:new I);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new I,r=[],s=[],a=[],o=new I,l=new gt;for(let f=0;f<=e;f++){const v=f/e;r[f]=this.getTangentAt(v,new I)}s[0]=new I,a[0]=new I;let c=Number.MAX_VALUE;const u=Math.abs(r[0].x),p=Math.abs(r[0].y),h=Math.abs(r[0].z);u<=c&&(c=u,n.set(1,0,0)),p<=c&&(c=p,n.set(0,1,0)),h<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],o),a[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(r[f-1],r[f]),o.length()>Number.EPSILON){o.normalize();const v=Math.acos($e(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(o,v))}a[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos($e(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(o.crossVectors(s[0],s[e]))>0&&(f=-f);for(let v=1;v<=e;v++)s[v].applyMatrix4(l.makeRotationAxis(r[v],f*v)),a[v].crossVectors(r[v],s[v])}return{tangents:r,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}}class Da extends mn{constructor(e=0,t=0,n=1,r=1,s=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new V){const n=t,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(a?s=0:s=r),this.aClockwise===!0&&!a&&(s===r?s=-r:s=s-r);const o=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const u=Math.cos(this.aRotation),p=Math.sin(this.aRotation),h=l-this.aX,f=c-this.aY;l=h*u-f*p+this.aX,c=h*p+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class au extends Da{constructor(e,t,n,r,s,a){super(e,t,n,n,r,s,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Ia(){let i=0,e=0,t=0,n=0;function r(s,a,o,l){i=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){r(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,u,p){let h=(a-s)/c-(o-s)/(c+u)+(o-a)/u,f=(o-a)/u-(l-a)/(u+p)+(l-o)/p;h*=u,f*=u,r(a,o,h,f)},calc:function(s){const a=s*s,o=a*s;return i+e*s+t*a+n*o}}}const yo=new I,Mo=new I,vs=new Ia,_s=new Ia,Ss=new Ia;class Kt extends mn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new I){const n=t,r=this.points,s=r.length,a=(s-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:l===0&&o===s-1&&(o=s-2,l=1);let c,u;this.closed||o>0?c=r[(o-1)%s]:(Mo.subVectors(r[0],r[1]).add(r[0]),c=Mo);const p=r[o%s],h=r[(o+1)%s];if(this.closed||o+2<s?u=r[(o+2)%s]:(yo.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=yo),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let v=Math.pow(c.distanceToSquared(p),f),E=Math.pow(p.distanceToSquared(h),f),g=Math.pow(h.distanceToSquared(u),f);E<1e-4&&(E=1),v<1e-4&&(v=E),g<1e-4&&(g=E),vs.initNonuniformCatmullRom(c.x,p.x,h.x,u.x,v,E,g),_s.initNonuniformCatmullRom(c.y,p.y,h.y,u.y,v,E,g),Ss.initNonuniformCatmullRom(c.z,p.z,h.z,u.z,v,E,g)}else this.curveType==="catmullrom"&&(vs.initCatmullRom(c.x,p.x,h.x,u.x,this.tension),_s.initCatmullRom(c.y,p.y,h.y,u.y,this.tension),Ss.initCatmullRom(c.z,p.z,h.z,u.z,this.tension));return n.set(vs.calc(l),_s.calc(l),Ss.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new I().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function bo(i,e,t,n,r){const s=(n-e)*.5,a=(r-t)*.5,o=i*i,l=i*o;return(2*t-2*n+s+a)*l+(-3*t+3*n-2*s-a)*o+s*i+t}function ou(i,e){const t=1-i;return t*t*e}function lu(i,e){return 2*(1-i)*i*e}function cu(i,e){return i*i*e}function Gi(i,e,t,n){return ou(i,e)+lu(i,t)+cu(i,n)}function du(i,e){const t=1-i;return t*t*t*e}function uu(i,e){const t=1-i;return 3*t*t*i*e}function hu(i,e){return 3*(1-i)*i*i*e}function fu(i,e){return i*i*i*e}function Hi(i,e,t,n,r){return du(i,e)+uu(i,t)+hu(i,n)+fu(i,r)}class Ul extends mn{constructor(e=new V,t=new V,n=new V,r=new V){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new V){const n=t,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Hi(e,r.x,s.x,a.x,o.x),Hi(e,r.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class pu extends mn{constructor(e=new I,t=new I,n=new I,r=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new I){const n=t,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Hi(e,r.x,s.x,a.x,o.x),Hi(e,r.y,s.y,a.y,o.y),Hi(e,r.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Fl extends mn{constructor(e=new V,t=new V){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new V){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new V){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class mu extends mn{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Ol extends mn{constructor(e=new V,t=new V,n=new V){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new V){const n=t,r=this.v0,s=this.v1,a=this.v2;return n.set(Gi(e,r.x,s.x,a.x),Gi(e,r.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Bl extends mn{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){const n=t,r=this.v0,s=this.v1,a=this.v2;return n.set(Gi(e,r.x,s.x,a.x),Gi(e,r.y,s.y,a.y),Gi(e,r.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class zl extends mn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new V){const n=t,r=this.points,s=(r.length-1)*e,a=Math.floor(s),o=s-a,l=r[a===0?a:a-1],c=r[a],u=r[a>r.length-2?r.length-1:a+1],p=r[a>r.length-3?r.length-1:a+2];return n.set(bo(o,l.x,c.x,u.x,p.x),bo(o,l.y,c.y,u.y,p.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new V().fromArray(r))}return this}}var Br=Object.freeze({__proto__:null,ArcCurve:au,CatmullRomCurve3:Kt,CubicBezierCurve:Ul,CubicBezierCurve3:pu,EllipseCurve:Da,LineCurve:Fl,LineCurve3:mu,QuadraticBezierCurve:Ol,QuadraticBezierCurve3:Bl,SplineCurve:zl});class gu extends mn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Br[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=n){const a=r[s]-n,o=this.curves[s],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let r=0,s=this.curves;r<s.length;r++){const a=s[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(new Br[r.type]().fromJSON(r))}return this.cacheLengths=null,this}}class ha extends gu{constructor(e){super(),this.type="Path",this.currentPoint=new V,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Fl(this.currentPoint.clone(),new V(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){const s=new Ol(this.currentPoint.clone(),new V(e,t),new V(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,a){const o=new Ul(this.currentPoint.clone(),new V(e,t),new V(n,r),new V(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new zl(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,r,s,a),this}absarc(e,t,n,r,s,a){return this.absellipse(e,t,n,n,r,s,a),this}ellipse(e,t,n,r,s,a,o,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,r,s,a,o,l),this}absellipse(e,t,n,r,s,a,o,l){const c=new Da(e,t,n,r,s,a,o,l);if(this.curves.length>0){const p=c.getPoint(0);p.equals(this.currentPoint)||this.lineTo(p.x,p.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class kl extends ha{constructor(e){super(e),this.uuid=Ai(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const r=e.holes[t];this.holes.push(new ha().fromJSON(r))}return this}}function xu(i,e,t=2){const n=e&&e.length,r=n?e[0]*t:i.length;let s=Gl(i,0,r,t,!0);const a=[];if(!s||s.next===s.prev)return a;let o,l,c;if(n&&(s=Mu(i,e,s,t)),i.length>80*t){o=i[0],l=i[1];let u=o,p=l;for(let h=t;h<r;h+=t){const f=i[h],v=i[h+1];f<o&&(o=f),v<l&&(l=v),f>u&&(u=f),v>p&&(p=v)}c=Math.max(u-o,p-l),c=c!==0?32767/c:0}return Yi(s,a,t,o,l,c,0),a}function Gl(i,e,t,n,r){let s;if(r===Du(i,e,t,n)>0)for(let a=e;a<t;a+=n)s=Eo(a/n|0,i[a],i[a+1],s);else for(let a=t-n;a>=e;a-=n)s=Eo(a/n|0,i[a],i[a+1],s);return s&&Ti(s,s.next)&&($i(s),s=s.next),s}function ti(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Ti(t,t.next)||_t(t.prev,t,t.next)===0)){if($i(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Yi(i,e,t,n,r,s,a){if(!i)return;!a&&s&&Au(i,n,r,s);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(s?_u(i,n,r,s):vu(i)){e.push(l.i,i.i,c.i),$i(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Su(ti(i),e),Yi(i,e,t,n,r,s,2)):a===2&&yu(i,e,t,n,r,s):Yi(ti(i),e,t,n,r,s,1);break}}}function vu(i){const e=i.prev,t=i,n=i.next;if(_t(e,t,n)>=0)return!1;const r=e.x,s=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(r,s,a),p=Math.min(o,l,c),h=Math.max(r,s,a),f=Math.max(o,l,c);let v=n.next;for(;v!==e;){if(v.x>=u&&v.x<=h&&v.y>=p&&v.y<=f&&Bi(r,o,s,l,a,c,v.x,v.y)&&_t(v.prev,v,v.next)>=0)return!1;v=v.next}return!0}function _u(i,e,t,n){const r=i.prev,s=i,a=i.next;if(_t(r,s,a)>=0)return!1;const o=r.x,l=s.x,c=a.x,u=r.y,p=s.y,h=a.y,f=Math.min(o,l,c),v=Math.min(u,p,h),E=Math.max(o,l,c),g=Math.max(u,p,h),m=fa(f,v,e,t,n),b=fa(E,g,e,t,n);let T=i.prevZ,_=i.nextZ;for(;T&&T.z>=m&&_&&_.z<=b;){if(T.x>=f&&T.x<=E&&T.y>=v&&T.y<=g&&T!==r&&T!==a&&Bi(o,u,l,p,c,h,T.x,T.y)&&_t(T.prev,T,T.next)>=0||(T=T.prevZ,_.x>=f&&_.x<=E&&_.y>=v&&_.y<=g&&_!==r&&_!==a&&Bi(o,u,l,p,c,h,_.x,_.y)&&_t(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;T&&T.z>=m;){if(T.x>=f&&T.x<=E&&T.y>=v&&T.y<=g&&T!==r&&T!==a&&Bi(o,u,l,p,c,h,T.x,T.y)&&_t(T.prev,T,T.next)>=0)return!1;T=T.prevZ}for(;_&&_.z<=b;){if(_.x>=f&&_.x<=E&&_.y>=v&&_.y<=g&&_!==r&&_!==a&&Bi(o,u,l,p,c,h,_.x,_.y)&&_t(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function Su(i,e){let t=i;do{const n=t.prev,r=t.next.next;!Ti(n,r)&&Vl(n,t,t.next,r)&&Zi(n,r)&&Zi(r,n)&&(e.push(n.i,t.i,r.i),$i(t),$i(t.next),t=i=r),t=t.next}while(t!==i);return ti(t)}function yu(i,e,t,n,r,s){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Pu(a,o)){let l=Wl(a,o);a=ti(a,a.next),l=ti(l,l.next),Yi(a,e,t,n,r,s,0),Yi(l,e,t,n,r,s,0);return}o=o.next}a=a.next}while(a!==i)}function Mu(i,e,t,n){const r=[];for(let s=0,a=e.length;s<a;s++){const o=e[s]*n,l=s<a-1?e[s+1]*n:i.length,c=Gl(i,o,l,n,!1);c===c.next&&(c.steiner=!0),r.push(Cu(c))}r.sort(bu);for(let s=0;s<r.length;s++)t=Eu(r[s],t);return t}function bu(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=n-r}return t}function Eu(i,e){const t=Tu(i,e);if(!t)return e;const n=Wl(t,i);return ti(n,n.next),ti(t,t.next)}function Tu(i,e){let t=e;const n=i.x,r=i.y;let s=-1/0,a;if(Ti(i,t))return t;do{if(Ti(i,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){const p=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=n&&p>s&&(s=p,a=t.x<t.next.x?t:t.next,p===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Hl(r<c?n:s,r,l,c,r<c?s:n,r,t.x,t.y)){const p=Math.abs(r-t.y)/(n-t.x);Zi(t,i)&&(p<u||p===u&&(t.x>a.x||t.x===a.x&&wu(a,t)))&&(a=t,u=p)}t=t.next}while(t!==o);return a}function wu(i,e){return _t(i.prev,i,e.prev)<0&&_t(e.next,i,i.next)<0}function Au(i,e,t,n){let r=i;do r.z===0&&(r.z=fa(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,Ru(r)}function Ru(i){let e,t=1;do{let n=i,r;i=null;let s=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(r=n,n=n.nextZ,o--):(r=a,a=a.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;n=a}s.nextZ=null,t*=2}while(e>1);return i}function fa(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Cu(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Hl(i,e,t,n,r,s,a,o){return(r-a)*(e-o)>=(i-a)*(s-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(r-a)*(n-o)}function Bi(i,e,t,n,r,s,a,o){return!(i===a&&e===o)&&Hl(i,e,t,n,r,s,a,o)}function Pu(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Lu(i,e)&&(Zi(i,e)&&Zi(e,i)&&Nu(i,e)&&(_t(i.prev,i,e.prev)||_t(i,e.prev,e))||Ti(i,e)&&_t(i.prev,i,i.next)>0&&_t(e.prev,e,e.next)>0)}function _t(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Ti(i,e){return i.x===e.x&&i.y===e.y}function Vl(i,e,t,n){const r=Mr(_t(i,e,t)),s=Mr(_t(i,e,n)),a=Mr(_t(t,n,i)),o=Mr(_t(t,n,e));return!!(r!==s&&a!==o||r===0&&yr(i,t,e)||s===0&&yr(i,n,e)||a===0&&yr(t,i,n)||o===0&&yr(t,e,n))}function yr(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Mr(i){return i>0?1:i<0?-1:0}function Lu(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Vl(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Zi(i,e){return _t(i.prev,i,i.next)<0?_t(i,e,i.next)>=0&&_t(i,i.prev,e)>=0:_t(i,e,i.prev)<0||_t(i,i.next,e)<0}function Nu(i,e){let t=i,n=!1;const r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Wl(i,e){const t=pa(i.i,i.x,i.y),n=pa(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function Eo(i,e,t,n){const r=pa(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function $i(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function pa(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Du(i,e,t,n){let r=0;for(let s=e,a=t-n;s<t;s+=n)r+=(i[a]-i[s])*(i[s+1]+i[a+1]),a=s;return r}class Iu{static triangulate(e,t,n=2){return xu(e,t,n)}}class xi{static area(e){const t=e.length;let n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return xi.area(e)<0}static triangulateShape(e,t){const n=[],r=[],s=[];To(e),wo(n,e);let a=e.length;t.forEach(To);for(let l=0;l<t.length;l++)r.push(a),a+=t[l].length,wo(n,t[l]);const o=Iu.triangulate(n,r);for(let l=0;l<o.length;l+=3)s.push(o.slice(l,l+3));return s}}function To(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function wo(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Ua extends Wt{constructor(e=new kl([new V(.5,.5),new V(-.5,.5),new V(-.5,-.5),new V(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,r=[],s=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];a(c)}this.setAttribute("position",new ut(r,3)),this.setAttribute("uv",new ut(s,2)),this.computeVertexNormals();function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,p=t.depth!==void 0?t.depth:1;let h=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,v=t.bevelSize!==void 0?t.bevelSize:f-.1,E=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const m=t.extrudePath,b=t.UVGenerator!==void 0?t.UVGenerator:Uu;let T,_=!1,C,A,x,S;if(m){T=m.getSpacedPoints(u),_=!0,h=!1;const ie=m.isCatmullRomCurve3?m.closed:!1;C=m.computeFrenetFrames(u,ie),A=new I,x=new I,S=new I}h||(g=0,f=0,v=0,E=0);const F=o.extractPoints(c);let R=F.shape;const w=F.holes;if(!xi.isClockWise(R)){R=R.reverse();for(let ie=0,he=w.length;ie<he;ie++){const ce=w[ie];xi.isClockWise(ce)&&(w[ie]=ce.reverse())}}function G(ie){const ce=10000000000000001e-36;let Re=ie[0];for(let Se=1;Se<=ie.length;Se++){const Xe=Se%ie.length,Ie=ie[Xe],Qe=Ie.x-Re.x,et=Ie.y-Re.y,st=Qe*Qe+et*et,z=Math.max(Math.abs(Ie.x),Math.abs(Ie.y),Math.abs(Re.x),Math.abs(Re.y)),yt=ce*z*z;if(st<=yt){ie.splice(Xe,1),Se--;continue}Re=Ie}}G(R),w.forEach(G);const N=w.length,O=R;for(let ie=0;ie<N;ie++){const he=w[ie];R=R.concat(he)}function H(ie,he,ce){return he||at("ExtrudeGeometry: vec does not exist"),ie.clone().addScaledVector(he,ce)}const L=R.length;function q(ie,he,ce){let Re,Se,Xe;const Ie=ie.x-he.x,Qe=ie.y-he.y,et=ce.x-ie.x,st=ce.y-ie.y,z=Ie*Ie+Qe*Qe,yt=Ie*st-Qe*et;if(Math.abs(yt)>Number.EPSILON){const Je=Math.sqrt(z),ht=Math.sqrt(et*et+st*st),xe=he.x-Qe/Je,St=he.y+Ie/Je,Be=ce.x-st/ht,Ge=ce.y+et/ht,P=((Be-xe)*st-(Ge-St)*et)/(Ie*st-Qe*et);Re=xe+Ie*P-ie.x,Se=St+Qe*P-ie.y;const y=Re*Re+Se*Se;if(y<=2)return new V(Re,Se);Xe=Math.sqrt(y/2)}else{let Je=!1;Ie>Number.EPSILON?et>Number.EPSILON&&(Je=!0):Ie<-Number.EPSILON?et<-Number.EPSILON&&(Je=!0):Math.sign(Qe)===Math.sign(st)&&(Je=!0),Je?(Re=-Qe,Se=Ie,Xe=Math.sqrt(z)):(Re=Ie,Se=Qe,Xe=Math.sqrt(z/2))}return new V(Re/Xe,Se/Xe)}const k=[];for(let ie=0,he=O.length,ce=he-1,Re=ie+1;ie<he;ie++,ce++,Re++)ce===he&&(ce=0),Re===he&&(Re=0),k[ie]=q(O[ie],O[ce],O[Re]);const K=[];let $,ae=k.concat();for(let ie=0,he=N;ie<he;ie++){const ce=w[ie];$=[];for(let Re=0,Se=ce.length,Xe=Se-1,Ie=Re+1;Re<Se;Re++,Xe++,Ie++)Xe===Se&&(Xe=0),Ie===Se&&(Ie=0),$[Re]=q(ce[Re],ce[Xe],ce[Ie]);K.push($),ae=ae.concat($)}let we;if(g===0)we=xi.triangulateShape(O,w);else{const ie=[],he=[];for(let ce=0;ce<g;ce++){const Re=ce/g,Se=f*Math.cos(Re*Math.PI/2),Xe=v*Math.sin(Re*Math.PI/2)+E;for(let Ie=0,Qe=O.length;Ie<Qe;Ie++){const et=H(O[Ie],k[Ie],Xe);Ae(et.x,et.y,-Se),Re===0&&ie.push(et)}for(let Ie=0,Qe=N;Ie<Qe;Ie++){const et=w[Ie];$=K[Ie];const st=[];for(let z=0,yt=et.length;z<yt;z++){const Je=H(et[z],$[z],Xe);Ae(Je.x,Je.y,-Se),Re===0&&st.push(Je)}Re===0&&he.push(st)}}we=xi.triangulateShape(ie,he)}const Y=we.length,le=v+E;for(let ie=0;ie<L;ie++){const he=h?H(R[ie],ae[ie],le):R[ie];_?(x.copy(C.normals[0]).multiplyScalar(he.x),A.copy(C.binormals[0]).multiplyScalar(he.y),S.copy(T[0]).add(x).add(A),Ae(S.x,S.y,S.z)):Ae(he.x,he.y,0)}for(let ie=1;ie<=u;ie++)for(let he=0;he<L;he++){const ce=h?H(R[he],ae[he],le):R[he];_?(x.copy(C.normals[ie]).multiplyScalar(ce.x),A.copy(C.binormals[ie]).multiplyScalar(ce.y),S.copy(T[ie]).add(x).add(A),Ae(S.x,S.y,S.z)):Ae(ce.x,ce.y,p/u*ie)}for(let ie=g-1;ie>=0;ie--){const he=ie/g,ce=f*Math.cos(he*Math.PI/2),Re=v*Math.sin(he*Math.PI/2)+E;for(let Se=0,Xe=O.length;Se<Xe;Se++){const Ie=H(O[Se],k[Se],Re);Ae(Ie.x,Ie.y,p+ce)}for(let Se=0,Xe=w.length;Se<Xe;Se++){const Ie=w[Se];$=K[Se];for(let Qe=0,et=Ie.length;Qe<et;Qe++){const st=H(Ie[Qe],$[Qe],Re);_?Ae(st.x,st.y+T[u-1].y,T[u-1].x+ce):Ae(st.x,st.y,p+ce)}}}Ee(),De();function Ee(){const ie=r.length/3;if(h){let he=0,ce=L*he;for(let Re=0;Re<Y;Re++){const Se=we[Re];lt(Se[2]+ce,Se[1]+ce,Se[0]+ce)}he=u+g*2,ce=L*he;for(let Re=0;Re<Y;Re++){const Se=we[Re];lt(Se[0]+ce,Se[1]+ce,Se[2]+ce)}}else{for(let he=0;he<Y;he++){const ce=we[he];lt(ce[2],ce[1],ce[0])}for(let he=0;he<Y;he++){const ce=we[he];lt(ce[0]+L*u,ce[1]+L*u,ce[2]+L*u)}}n.addGroup(ie,r.length/3-ie,0)}function De(){const ie=r.length/3;let he=0;me(O,he),he+=O.length;for(let ce=0,Re=w.length;ce<Re;ce++){const Se=w[ce];me(Se,he),he+=Se.length}n.addGroup(ie,r.length/3-ie,1)}function me(ie,he){let ce=ie.length;for(;--ce>=0;){const Re=ce;let Se=ce-1;Se<0&&(Se=ie.length-1);for(let Xe=0,Ie=u+g*2;Xe<Ie;Xe++){const Qe=L*Xe,et=L*(Xe+1),st=he+Re+Qe,z=he+Se+Qe,yt=he+Se+et,Je=he+Re+et;Fe(st,z,yt,Je)}}}function Ae(ie,he,ce){l.push(ie),l.push(he),l.push(ce)}function lt(ie,he,ce){je(ie),je(he),je(ce);const Re=r.length/3,Se=b.generateTopUV(n,r,Re-3,Re-2,Re-1);Ke(Se[0]),Ke(Se[1]),Ke(Se[2])}function Fe(ie,he,ce,Re){je(ie),je(he),je(Re),je(he),je(ce),je(Re);const Se=r.length/3,Xe=b.generateSideWallUV(n,r,Se-6,Se-3,Se-2,Se-1);Ke(Xe[0]),Ke(Xe[1]),Ke(Xe[3]),Ke(Xe[1]),Ke(Xe[2]),Ke(Xe[3])}function je(ie){r.push(l[ie*3+0]),r.push(l[ie*3+1]),r.push(l[ie*3+2])}function Ke(ie){s.push(ie.x),s.push(ie.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Fu(t,n,e)}static fromJSON(e,t){const n=[];for(let s=0,a=e.shapes.length;s<a;s++){const o=t[e.shapes[s]];n.push(o)}const r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new Br[r.type]().fromJSON(r)),new Ua(n,e.options)}}const Uu={generateTopUV:function(i,e,t,n,r){const s=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[r*3],u=e[r*3+1];return[new V(s,a),new V(o,l),new V(c,u)]},generateSideWallUV:function(i,e,t,n,r,s){const a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],p=e[n*3+2],h=e[r*3],f=e[r*3+1],v=e[r*3+2],E=e[s*3],g=e[s*3+1],m=e[s*3+2];return Math.abs(o-u)<Math.abs(a-c)?[new V(a,1-l),new V(c,1-p),new V(h,1-v),new V(E,1-m)]:[new V(o,1-l),new V(u,1-p),new V(f,1-v),new V(g,1-m)]}};function Fu(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){const s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Hn extends Wt{constructor(e=[new V(0,-.5),new V(.5,0),new V(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=$e(r,0,Math.PI*2);const s=[],a=[],o=[],l=[],c=[],u=1/t,p=new I,h=new V,f=new I,v=new I,E=new I;let g=0,m=0;for(let b=0;b<=e.length-1;b++)switch(b){case 0:g=e[b+1].x-e[b].x,m=e[b+1].y-e[b].y,f.x=m*1,f.y=-g,f.z=m*0,E.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:E.normalize(),l.push(E.x,E.y,E.z);break;default:g=e[b+1].x-e[b].x,m=e[b+1].y-e[b].y,f.x=m*1,f.y=-g,f.z=m*0,v.copy(f),f.x+=E.x,f.y+=E.y,f.z+=E.z,f.normalize(),l.push(f.x,f.y,f.z),E.copy(v)}for(let b=0;b<=t;b++){const T=n+b*u*r,_=Math.sin(T),C=Math.cos(T);for(let A=0;A<=e.length-1;A++){p.x=e[A].x*_,p.y=e[A].y,p.z=e[A].x*C,a.push(p.x,p.y,p.z),h.x=b/t,h.y=A/(e.length-1),o.push(h.x,h.y);const x=l[3*A+0]*_,S=l[3*A+1],F=l[3*A+0]*C;c.push(x,S,F)}}for(let b=0;b<t;b++)for(let T=0;T<e.length-1;T++){const _=T+b*e.length,C=_,A=_+e.length,x=_+e.length+1,S=_+1;s.push(C,A,S),s.push(x,S,A)}this.setIndex(s),this.setAttribute("position",new ut(a,3)),this.setAttribute("uv",new ut(o,2)),this.setAttribute("normal",new ut(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Hn(e.points,e.segments,e.phiStart,e.phiLength)}}class bn extends Wt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(r),c=o+1,u=l+1,p=e/o,h=t/l,f=[],v=[],E=[],g=[];for(let m=0;m<u;m++){const b=m*h-a;for(let T=0;T<c;T++){const _=T*p-s;v.push(_,-b,0),E.push(0,0,1),g.push(T/o),g.push(1-m/l)}}for(let m=0;m<l;m++)for(let b=0;b<o;b++){const T=b+c*m,_=b+c*(m+1),C=b+1+c*(m+1),A=b+1+c*m;f.push(T,_,A),f.push(_,C,A)}this.setIndex(f),this.setAttribute("position",new ut(v,3)),this.setAttribute("normal",new ut(E,3)),this.setAttribute("uv",new ut(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bn(e.width,e.height,e.widthSegments,e.heightSegments)}}class wn extends Wt{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const u=[],p=new I,h=new I,f=[],v=[],E=[],g=[];for(let m=0;m<=n;m++){const b=[],T=m/n,_=a+T*o,C=e*Math.cos(_),A=Math.sqrt(e*e-C*C);let x=0;m===0&&a===0?x=.5/t:m===n&&l===Math.PI&&(x=-.5/t);for(let S=0;S<=t;S++){const F=S/t,R=r+F*s;p.x=-A*Math.cos(R),p.y=C,p.z=A*Math.sin(R),v.push(p.x,p.y,p.z),h.copy(p).normalize(),E.push(h.x,h.y,h.z),g.push(F+x,1-T),b.push(c++)}u.push(b)}for(let m=0;m<n;m++)for(let b=0;b<t;b++){const T=u[m][b+1],_=u[m][b],C=u[m+1][b],A=u[m+1][b+1];(m!==0||a>0)&&f.push(T,_,A),(m!==n-1||l<Math.PI)&&f.push(_,C,A)}this.setIndex(f),this.setAttribute("position",new ut(v,3)),this.setAttribute("normal",new ut(E,3)),this.setAttribute("uv",new ut(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wn(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class zn extends Wt{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);const l=[],c=[],u=[],p=[],h=new I,f=new I,v=new I;for(let E=0;E<=n;E++){const g=a+E/n*o;for(let m=0;m<=r;m++){const b=m/r*s;f.x=(e+t*Math.cos(g))*Math.cos(b),f.y=(e+t*Math.cos(g))*Math.sin(b),f.z=t*Math.sin(g),c.push(f.x,f.y,f.z),h.x=e*Math.cos(b),h.y=e*Math.sin(b),v.subVectors(f,h).normalize(),u.push(v.x,v.y,v.z),p.push(m/r),p.push(E/n)}}for(let E=1;E<=n;E++)for(let g=1;g<=r;g++){const m=(r+1)*E+g-1,b=(r+1)*(E-1)+g-1,T=(r+1)*(E-1)+g,_=(r+1)*E+g;l.push(m,b,_),l.push(b,T,_)}this.setIndex(l),this.setAttribute("position",new ut(c,3)),this.setAttribute("normal",new ut(u,3)),this.setAttribute("uv",new ut(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}}class Zt extends Wt{constructor(e=new Bl(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,n=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:s};const a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new I,l=new I,c=new V;let u=new I;const p=[],h=[],f=[],v=[];E(),this.setIndex(v),this.setAttribute("position",new ut(p,3)),this.setAttribute("normal",new ut(h,3)),this.setAttribute("uv",new ut(f,2));function E(){for(let T=0;T<t;T++)g(T);g(s===!1?t:0),b(),m()}function g(T){u=e.getPointAt(T/t,u);const _=a.normals[T],C=a.binormals[T];for(let A=0;A<=r;A++){const x=A/r*Math.PI*2,S=Math.sin(x),F=-Math.cos(x);l.x=F*_.x+S*C.x,l.y=F*_.y+S*C.y,l.z=F*_.z+S*C.z,l.normalize(),h.push(l.x,l.y,l.z),o.x=u.x+n*l.x,o.y=u.y+n*l.y,o.z=u.z+n*l.z,p.push(o.x,o.y,o.z)}}function m(){for(let T=1;T<=t;T++)for(let _=1;_<=r;_++){const C=(r+1)*(T-1)+(_-1),A=(r+1)*T+(_-1),x=(r+1)*T+_,S=(r+1)*(T-1)+_;v.push(C,A,S),v.push(A,x,S)}}function b(){for(let T=0;T<=t;T++)for(let _=0;_<=r;_++)c.x=T/t,c.y=_/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Zt(new Br[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}function wi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];if(Ao(r))r.isRenderTargetTexture?(He("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone();else if(Array.isArray(r))if(Ao(r[0])){const s=[];for(let a=0,o=r.length;a<o;a++)s[a]=r[a].clone();e[t][n]=s}else e[t][n]=r.slice();else e[t][n]=r}}return e}function kt(i){const e={};for(let t=0;t<i.length;t++){const n=wi(i[t]);for(const r in n)e[r]=n[r]}return e}function Ao(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Ou(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function jl(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:it.workingColorSpace}const Bu={clone:wi,merge:kt};var zu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ku=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ni extends Qi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zu,this.fragmentShader=ku,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=wi(e.uniforms),this.uniformsGroups=Ou(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case"t":this.uniforms[n].value=t[r.value]||null;break;case"c":this.uniforms[n].value=new ke().setHex(r.value);break;case"v2":this.uniforms[n].value=new V().fromArray(r.value);break;case"v3":this.uniforms[n].value=new I().fromArray(r.value);break;case"v4":this.uniforms[n].value=new vt().fromArray(r.value);break;case"m3":this.uniforms[n].value=new Ve().fromArray(r.value);break;case"m4":this.uniforms[n].value=new gt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Gu extends ni{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Hu extends Qi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=da,this.normalScale=new V(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Et extends Hu{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new V(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return $e(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new ke(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ke(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ke(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return Si('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){Si('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Vu extends Qi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Sd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Wu extends Qi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class ju extends Bt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const ys=new gt,Ro=new I,Co=new I;class Xu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new V(512,512),this.mapType=qt,this.map=null,this.mapPass=null,this.matrix=new gt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new qi,this._frameExtents=new V(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;Ro.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ro),Co.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Co),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){ys.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(ys,e.coordinateSystem,e.reversedDepth);const s=this._frameExtents,a=r?r.z/s.x:1,o=r?r.w/s.y:1,l=r?r.x/s.x:0,c=r?r.y/s.y:0;e.coordinateSystem===Xi||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(ys)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const br=new I,Er=new Ri,on=new I;class Xl extends Bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new gt,this.projectionMatrix=new gt,this.projectionMatrixInverse=new gt,this.coordinateSystem=an,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(br,Er,on),on.x===1&&on.y===1&&on.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(br,Er,on.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(br,Er,on),on.x===1&&on.y===1&&on.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(br,Er,on.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const In=new I,Po=new V,Lo=new V;class rn extends Xl{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ua*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan($r*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ua*2*Math.atan(Math.tan($r*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){In.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(In.x,In.y).multiplyScalar(-e/In.z),In.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(In.x,In.y).multiplyScalar(-e/In.z)}getViewSize(e,t){return this.getViewBounds(e,Po,Lo),t.subVectors(Lo,Po)}setViewOffset(e,t,n,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan($r*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*n/c,r*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class ql extends Xl{constructor(e=-1,t=1,n=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class qu extends Xu{constructor(){super(new ql(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ms extends ju{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.shadow=new qu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const pi=-90,mi=1;class ma extends Bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new rn(pi,mi,e,t);r.layers=this.layers,this.add(r);const s=new rn(pi,mi,e,t);s.layers=this.layers,this.add(s);const a=new rn(pi,mi,e,t);a.layers=this.layers,this.add(a);const o=new rn(pi,mi,e,t);o.layers=this.layers,this.add(o);const l=new rn(pi,mi,e,t);l.layers=this.layers,this.add(l);const c=new rn(pi,mi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===an)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Xi)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,u]=this.children,p=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),v=e.xr.enabled;e.xr.enabled=!1;const E=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(n,0,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,1,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=E,e.setRenderTarget(n,5,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(p,h,f),e.xr.enabled=v,n.texture.needsPMREMUpdate=!0}}class Yu extends rn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}function No(i,e,t,n){const r=Zu(n);switch(t){case _l:return i*e;case yl:return i*e/r.components*r.byteLength;case Ea:return i*e/r.components*r.byteLength;case ei:return i*e*2/r.components*r.byteLength;case Ta:return i*e*2/r.components*r.byteLength;case Sl:return i*e*3/r.components*r.byteLength;case un:return i*e*4/r.components*r.byteLength;case wa:return i*e*4/r.components*r.byteLength;case Rr:case Cr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Pr:case Lr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Us:case Os:return Math.max(i,16)*Math.max(e,8)/4;case Is:case Fs:return Math.max(i,8)*Math.max(e,8)/2;case Bs:case zs:case Gs:case Hs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ks:case Dr:case Vs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ws:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case js:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Xs:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case qs:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ys:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Zs:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case $s:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Js:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ks:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Qs:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ea:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ta:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case na:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case ia:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ra:case sa:case aa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case oa:case la:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Ir:case ca:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Zu(i){switch(i){case qt:case ml:return{byteLength:1,components:1};case ji:case gl:case pn:return{byteLength:2,components:1};case Ma:case ba:return{byteLength:2,components:4};case fn:case ya:case dn:return{byteLength:4,components:1};case xl:case vl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:_a}}));typeof window<"u"&&(window.__THREE__?He("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=_a);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Yl(){let i=null,e=!1,t=null,n=null;function r(s,a){n=i.requestAnimationFrame(r),t(s,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function $u(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,p=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function n(o,l,c){const u=l.array,p=l.updateRanges;if(i.bindBuffer(c,o),p.length===0)i.bufferSubData(c,0,u);else{p.sort((f,v)=>f.start-v.start);let h=0;for(let f=1;f<p.length;f++){const v=p[h],E=p[f];E.start<=v.start+v.count+1?v.count=Math.max(v.count,E.start+E.count-v.start):(++h,p[h]=E)}p.length=h+1;for(let f=0,v=p.length;f<v;f++){const E=p[f];i.bufferSubData(c,E.start*u.BYTES_PER_ELEMENT,u,E.start,E.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}var Ju=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ku=`#ifdef USE_ALPHAHASH
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
#endif`,Qu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,eh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,th=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ih=`#ifdef USE_AOMAP
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
#endif`,rh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,sh=`#ifdef USE_BATCHING
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
#endif`,ah=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,oh=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,lh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ch=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,dh=`#ifdef USE_IRIDESCENCE
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
#endif`,uh=`#ifdef USE_BUMPMAP
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
#endif`,hh=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,fh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ph=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,mh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,gh=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,xh=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,vh=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,_h=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Sh=`#define PI 3.141592653589793
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
} // validated`,yh=`vec3 transformedNormal = objectNormal;
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
#endif`,Mh=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,bh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Eh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Th=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,wh="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ah=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Rh=`#ifdef USE_ENVMAP
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
#endif`,Ch=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Ph=`#ifdef USE_ENVMAP
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
#endif`,Lh=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Nh=`#ifdef USE_ENVMAP
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
#endif`,Dh=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ih=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Uh=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Fh=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Oh=`#ifdef USE_GRADIENTMAP
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
}`,Bh=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,zh=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,kh=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Gh=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Hh=`#ifdef USE_ENVMAP
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
#endif`,Vh=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Wh=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,jh=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Xh=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,qh=`PhysicalMaterial material;
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
#endif`,Yh=`uniform sampler2D dfgLUT;
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
}`,Zh=`
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
#endif`,$h=`#if defined( RE_IndirectDiffuse )
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
#endif`,Jh=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Kh=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,Qh=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ef=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,nf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,rf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,sf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,af=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,of=`#if defined( USE_POINTS_UV )
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
#endif`,lf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,cf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,df=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,uf=`#if defined( USE_MORPHCOLORS )
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
#endif`,hf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ff=`#ifdef USE_MORPHTARGETS
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
#endif`,pf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,gf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,xf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_f=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Sf=`#ifdef USE_NORMALMAP
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
#endif`,yf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Mf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,bf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ef=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Tf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,wf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Af=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Rf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Cf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Pf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Lf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Nf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Df=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,If=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Uf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Ff=`float getShadowMask() {
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
}`,Of=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Bf=`#ifdef USE_SKINNING
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
#endif`,zf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,kf=`#ifdef USE_SKINNING
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
#endif`,Gf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Hf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Vf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Wf=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,jf=`#ifdef USE_TRANSMISSION
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
#endif`,Xf=`#ifdef USE_TRANSMISSION
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
#endif`,qf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Zf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,$f=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Jf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Kf=`uniform sampler2D t2D;
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
}`,Qf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ep=`uniform float backgroundBlurriness;
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
}`,tp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,np=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ip=`#include <common>
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
}`,rp=`#if DEPTH_PACKING == 3200
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
}`,sp=`#define DISTANCE
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
}`,ap=`#define DISTANCE
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
}`,op=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cp=`uniform float scale;
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
}`,dp=`uniform vec3 diffuse;
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
}`,up=`#include <common>
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
}`,hp=`uniform vec3 diffuse;
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
}`,fp=`#define LAMBERT
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
}`,pp=`#define LAMBERT
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
}`,mp=`#define MATCAP
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
}`,gp=`#define MATCAP
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
}`,xp=`#define NORMAL
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
}`,vp=`#define NORMAL
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
}`,_p=`#define PHONG
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
}`,Sp=`#define PHONG
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
}`,yp=`#define STANDARD
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
}`,Mp=`#define STANDARD
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
}`,bp=`#define TOON
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
}`,Ep=`#define TOON
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
}`,Tp=`uniform float size;
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
}`,wp=`uniform vec3 diffuse;
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
}`,Ap=`#include <common>
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
}`,Rp=`uniform vec3 color;
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
}`,Cp=`uniform float rotation;
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
}`,Pp=`uniform vec3 diffuse;
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
}`,Ze={alphahash_fragment:Ju,alphahash_pars_fragment:Ku,alphamap_fragment:Qu,alphamap_pars_fragment:eh,alphatest_fragment:th,alphatest_pars_fragment:nh,aomap_fragment:ih,aomap_pars_fragment:rh,batching_pars_vertex:sh,batching_vertex:ah,begin_vertex:oh,beginnormal_vertex:lh,bsdfs:ch,iridescence_fragment:dh,bumpmap_pars_fragment:uh,clipping_planes_fragment:hh,clipping_planes_pars_fragment:fh,clipping_planes_pars_vertex:ph,clipping_planes_vertex:mh,color_fragment:gh,color_pars_fragment:xh,color_pars_vertex:vh,color_vertex:_h,common:Sh,defaultnormal_vertex:yh,displacementmap_pars_vertex:Mh,displacementmap_vertex:bh,emissivemap_fragment:Eh,emissivemap_pars_fragment:Th,colorspace_fragment:wh,colorspace_pars_fragment:Ah,envmap_fragment:Rh,envmap_common_pars_fragment:Ch,envmap_pars_fragment:Ph,envmap_pars_vertex:Lh,envmap_physical_pars_fragment:Hh,envmap_vertex:Nh,fog_vertex:Dh,fog_pars_vertex:Ih,fog_fragment:Uh,fog_pars_fragment:Fh,gradientmap_pars_fragment:Oh,lightmap_pars_fragment:Bh,lights_lambert_fragment:zh,lights_lambert_pars_fragment:kh,lights_pars_begin:Gh,lights_toon_fragment:Vh,lights_toon_pars_fragment:Wh,lights_phong_fragment:jh,lights_phong_pars_fragment:Xh,lights_physical_fragment:qh,lights_physical_pars_fragment:Yh,lights_fragment_begin:Zh,lights_fragment_maps:$h,lights_fragment_end:Jh,lightprobes_pars_fragment:Kh,logdepthbuf_fragment:Qh,logdepthbuf_pars_fragment:ef,logdepthbuf_pars_vertex:tf,logdepthbuf_vertex:nf,map_fragment:rf,map_pars_fragment:sf,map_particle_fragment:af,map_particle_pars_fragment:of,metalnessmap_fragment:lf,metalnessmap_pars_fragment:cf,morphinstance_vertex:df,morphcolor_vertex:uf,morphnormal_vertex:hf,morphtarget_pars_vertex:ff,morphtarget_vertex:pf,normal_fragment_begin:mf,normal_fragment_maps:gf,normal_pars_fragment:xf,normal_pars_vertex:vf,normal_vertex:_f,normalmap_pars_fragment:Sf,clearcoat_normal_fragment_begin:yf,clearcoat_normal_fragment_maps:Mf,clearcoat_pars_fragment:bf,iridescence_pars_fragment:Ef,opaque_fragment:Tf,packing:wf,premultiplied_alpha_fragment:Af,project_vertex:Rf,dithering_fragment:Cf,dithering_pars_fragment:Pf,roughnessmap_fragment:Lf,roughnessmap_pars_fragment:Nf,shadowmap_pars_fragment:Df,shadowmap_pars_vertex:If,shadowmap_vertex:Uf,shadowmask_pars_fragment:Ff,skinbase_vertex:Of,skinning_pars_vertex:Bf,skinning_vertex:zf,skinnormal_vertex:kf,specularmap_fragment:Gf,specularmap_pars_fragment:Hf,tonemapping_fragment:Vf,tonemapping_pars_fragment:Wf,transmission_fragment:jf,transmission_pars_fragment:Xf,uv_pars_fragment:qf,uv_pars_vertex:Yf,uv_vertex:Zf,worldpos_vertex:$f,background_vert:Jf,background_frag:Kf,backgroundCube_vert:Qf,backgroundCube_frag:ep,cube_vert:tp,cube_frag:np,depth_vert:ip,depth_frag:rp,distance_vert:sp,distance_frag:ap,equirect_vert:op,equirect_frag:lp,linedashed_vert:cp,linedashed_frag:dp,meshbasic_vert:up,meshbasic_frag:hp,meshlambert_vert:fp,meshlambert_frag:pp,meshmatcap_vert:mp,meshmatcap_frag:gp,meshnormal_vert:xp,meshnormal_frag:vp,meshphong_vert:_p,meshphong_frag:Sp,meshphysical_vert:yp,meshphysical_frag:Mp,meshtoon_vert:bp,meshtoon_frag:Ep,points_vert:Tp,points_frag:wp,shadow_vert:Ap,shadow_frag:Rp,sprite_vert:Cp,sprite_frag:Pp},Me={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new V(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new V(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},cn={basic:{uniforms:kt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.fog]),vertexShader:Ze.meshbasic_vert,fragmentShader:Ze.meshbasic_frag},lambert:{uniforms:kt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new ke(0)},envMapIntensity:{value:1}}]),vertexShader:Ze.meshlambert_vert,fragmentShader:Ze.meshlambert_frag},phong:{uniforms:kt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphong_vert,fragmentShader:Ze.meshphong_frag},standard:{uniforms:kt([Me.common,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.roughnessmap,Me.metalnessmap,Me.fog,Me.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag},toon:{uniforms:kt([Me.common,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.gradientmap,Me.fog,Me.lights,{emissive:{value:new ke(0)}}]),vertexShader:Ze.meshtoon_vert,fragmentShader:Ze.meshtoon_frag},matcap:{uniforms:kt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,{matcap:{value:null}}]),vertexShader:Ze.meshmatcap_vert,fragmentShader:Ze.meshmatcap_frag},points:{uniforms:kt([Me.points,Me.fog]),vertexShader:Ze.points_vert,fragmentShader:Ze.points_frag},dashed:{uniforms:kt([Me.common,Me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ze.linedashed_vert,fragmentShader:Ze.linedashed_frag},depth:{uniforms:kt([Me.common,Me.displacementmap]),vertexShader:Ze.depth_vert,fragmentShader:Ze.depth_frag},normal:{uniforms:kt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,{opacity:{value:1}}]),vertexShader:Ze.meshnormal_vert,fragmentShader:Ze.meshnormal_frag},sprite:{uniforms:kt([Me.sprite,Me.fog]),vertexShader:Ze.sprite_vert,fragmentShader:Ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ze.background_vert,fragmentShader:Ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:Ze.backgroundCube_vert,fragmentShader:Ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ze.cube_vert,fragmentShader:Ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ze.equirect_vert,fragmentShader:Ze.equirect_frag},distance:{uniforms:kt([Me.common,Me.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ze.distance_vert,fragmentShader:Ze.distance_frag},shadow:{uniforms:kt([Me.lights,Me.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:Ze.shadow_vert,fragmentShader:Ze.shadow_frag}};cn.physical={uniforms:kt([cn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new V(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ve},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new V},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new V},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag};const Tr={r:0,b:0,g:0},Lp=new gt,Zl=new Ve;Zl.set(-1,0,0,0,1,0,0,0,1);function Np(i,e,t,n,r,s){const a=new ke(0);let o=r===!0?0:1,l,c,u=null,p=0,h=null;function f(b){let T=b.isScene===!0?b.background:null;if(T&&T.isTexture){const _=b.backgroundBlurriness>0;T=e.get(T,_)}return T}function v(b){let T=!1;const _=f(b);_===null?g(a,o):_&&_.isColor&&(g(_,1),T=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?t.buffers.color.setClear(0,0,0,1,s):C==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(i.autoClear||T)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function E(b,T){const _=f(T);_&&_.isCubeTexture?(c===void 0&&(c=new be(new Yt(1,1,1),new ni({name:"BackgroundCubeMaterial",uniforms:wi(cn.backgroundCube.uniforms),vertexShader:cn.backgroundCube.vertexShader,fragmentShader:cn.backgroundCube.fragmentShader,side:Vt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(C,A,x){this.matrixWorld.copyPosition(x.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Lp.makeRotationFromEuler(T.backgroundRotation)).transpose(),_.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Zl),c.material.toneMapped=it.getTransfer(_.colorSpace)!==dt,(u!==_||p!==_.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=_,p=_.version,h=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new be(new bn(2,2),new ni({name:"BackgroundMaterial",uniforms:wi(cn.background.uniforms),vertexShader:cn.background.vertexShader,fragmentShader:cn.background.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=it.getTransfer(_.colorSpace)!==dt,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||p!==_.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=_,p=_.version,h=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function g(b,T){b.getRGB(Tr,jl(i)),t.buffers.color.setClear(Tr.r,Tr.g,Tr.b,T,s)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(b,T=1){a.set(b),o=T,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(b){o=b,g(a,o)},render:v,addToRenderList:E,dispose:m}}function Dp(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=h(null);let s=r,a=!1;function o(w,D,G,N,O){let H=!1;const L=p(w,N,G,D);s!==L&&(s=L,c(s.object)),H=f(w,N,G,O),H&&v(w,N,G,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,_(w,D,G,N),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function c(w){return i.bindVertexArray(w)}function u(w){return i.deleteVertexArray(w)}function p(w,D,G,N){const O=N.wireframe===!0;let H=n[D.id];H===void 0&&(H={},n[D.id]=H);const L=w.isInstancedMesh===!0?w.id:0;let q=H[L];q===void 0&&(q={},H[L]=q);let k=q[G.id];k===void 0&&(k={},q[G.id]=k);let K=k[O];return K===void 0&&(K=h(l()),k[O]=K),K}function h(w){const D=[],G=[],N=[];for(let O=0;O<t;O++)D[O]=0,G[O]=0,N[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:G,attributeDivisors:N,object:w,attributes:{},index:null}}function f(w,D,G,N){const O=s.attributes,H=D.attributes;let L=0;const q=G.getAttributes();for(const k in q)if(q[k].location>=0){const $=O[k];let ae=H[k];if(ae===void 0&&(k==="instanceMatrix"&&w.instanceMatrix&&(ae=w.instanceMatrix),k==="instanceColor"&&w.instanceColor&&(ae=w.instanceColor)),$===void 0||$.attribute!==ae||ae&&$.data!==ae.data)return!0;L++}return s.attributesNum!==L||s.index!==N}function v(w,D,G,N){const O={},H=D.attributes;let L=0;const q=G.getAttributes();for(const k in q)if(q[k].location>=0){let $=H[k];$===void 0&&(k==="instanceMatrix"&&w.instanceMatrix&&($=w.instanceMatrix),k==="instanceColor"&&w.instanceColor&&($=w.instanceColor));const ae={};ae.attribute=$,$&&$.data&&(ae.data=$.data),O[k]=ae,L++}s.attributes=O,s.attributesNum=L,s.index=N}function E(){const w=s.newAttributes;for(let D=0,G=w.length;D<G;D++)w[D]=0}function g(w){m(w,0)}function m(w,D){const G=s.newAttributes,N=s.enabledAttributes,O=s.attributeDivisors;G[w]=1,N[w]===0&&(i.enableVertexAttribArray(w),N[w]=1),O[w]!==D&&(i.vertexAttribDivisor(w,D),O[w]=D)}function b(){const w=s.newAttributes,D=s.enabledAttributes;for(let G=0,N=D.length;G<N;G++)D[G]!==w[G]&&(i.disableVertexAttribArray(G),D[G]=0)}function T(w,D,G,N,O,H,L){L===!0?i.vertexAttribIPointer(w,D,G,O,H):i.vertexAttribPointer(w,D,G,N,O,H)}function _(w,D,G,N){E();const O=N.attributes,H=G.getAttributes(),L=D.defaultAttributeValues;for(const q in H){const k=H[q];if(k.location>=0){let K=O[q];if(K===void 0&&(q==="instanceMatrix"&&w.instanceMatrix&&(K=w.instanceMatrix),q==="instanceColor"&&w.instanceColor&&(K=w.instanceColor)),K!==void 0){const $=K.normalized,ae=K.itemSize,we=e.get(K);if(we===void 0)continue;const Y=we.buffer,le=we.type,Ee=we.bytesPerElement,De=le===i.INT||le===i.UNSIGNED_INT||K.gpuType===ya;if(K.isInterleavedBufferAttribute){const me=K.data,Ae=me.isInterleavedBuffer===!0?me.stride:me.itemSize,lt=K.offset;if(me.isInstancedInterleavedBuffer||me.isInstancedBufferAttribute){for(let Fe=0;Fe<k.locationSize;Fe++)m(k.location+Fe,me.meshPerAttribute);w.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let Fe=0;Fe<k.locationSize;Fe++)g(k.location+Fe);i.bindBuffer(i.ARRAY_BUFFER,Y);for(let Fe=0;Fe<k.locationSize;Fe++)T(k.location+Fe,ae/k.locationSize,le,$,Ae*Ee,(lt+ae/k.locationSize*Fe)*Ee,De)}else{if(K.isInstancedBufferAttribute){for(let me=0;me<k.locationSize;me++)m(k.location+me,K.meshPerAttribute);w.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let me=0;me<k.locationSize;me++)g(k.location+me);i.bindBuffer(i.ARRAY_BUFFER,Y);for(let me=0;me<k.locationSize;me++)T(k.location+me,ae/k.locationSize,le,$,ae*Ee,ae/k.locationSize*me*Ee,De)}}else if(L!==void 0){const $=L[q];if($!==void 0)switch($.length){case 2:i.vertexAttrib2fv(k.location,$);break;case 3:i.vertexAttrib3fv(k.location,$);break;case 4:i.vertexAttrib4fv(k.location,$);break;default:i.vertexAttrib1fv(k.location,$)}}}}b()}function C(){F();for(const w in n){const D=n[w];for(const G in D){const N=D[G];for(const O in N){const H=N[O];for(const L in H)u(H[L].object),delete H[L];delete N[O]}}delete n[w]}}function A(w){if(n[w.id]===void 0)return;const D=n[w.id];for(const G in D){const N=D[G];for(const O in N){const H=N[O];for(const L in H)u(H[L].object),delete H[L];delete N[O]}}delete n[w.id]}function x(w){for(const D in n){const G=n[D];for(const N in G){const O=G[N];if(O[w.id]===void 0)continue;const H=O[w.id];for(const L in H)u(H[L].object),delete H[L];delete O[w.id]}}}function S(w){for(const D in n){const G=n[D],N=w.isInstancedMesh===!0?w.id:0,O=G[N];if(O!==void 0){for(const H in O){const L=O[H];for(const q in L)u(L[q].object),delete L[q];delete O[H]}delete G[N],Object.keys(G).length===0&&delete n[D]}}}function F(){R(),a=!0,s!==r&&(s=r,c(s.object))}function R(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:F,resetDefaultState:R,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfObject:S,releaseStatesOfProgram:x,initAttributes:E,enableAttribute:g,disableUnusedAttributes:b}}function Ip(i,e,t){let n;function r(l){n=l}function s(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let f=0;f<u;f++)h+=c[f];t.update(h,n,1)}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o}function Up(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const x=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(x.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(x){return!(x!==un&&n.convert(x)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(x){const S=x===pn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(x!==qt&&x!==dn&&!S&&n.convert(x)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(x){if(x==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";x="mediump"}return x==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(He("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const p=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&p===!1;t.reversedDepthBuffer===!0&&p===!1&&He("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&p===!0&&He("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=i.getParameter(i.MAX_SAMPLES),A=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:p,maxTextures:f,maxVertexTextures:v,maxTextureSize:E,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:b,maxVaryings:T,maxFragmentUniforms:_,maxSamples:C,samples:A}}function Fp(i){const e=this;let t=null,n=0,r=!1,s=!1;const a=new Un,o=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,h){const f=p.length!==0||h||n!==0||r;return r=h,n=p.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(p,h){t=u(p,h,0)},this.setState=function(p,h,f){const v=p.clippingPlanes,E=p.clipIntersection,g=p.clipShadows,m=i.get(p);if(!r||v===null||v.length===0||s&&!g)s?u(null):c();else{const b=s?0:n,T=b*4;let _=m.clippingState||null;l.value=_,_=u(v,h,T,f);for(let C=0;C!==T;++C)_[C]=t[C];m.clippingState=_,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(p,h,f,v){const E=p!==null?p.length:0;let g=null;if(E!==0){if(g=l.value,v!==!0||g===null){const m=f+E*4,b=h.matrixWorldInverse;o.getNormalMatrix(b),(g===null||g.length<m)&&(g=new Float32Array(m));for(let T=0,_=f;T!==E;++T,_+=4)a.copy(p[T]).applyMatrix4(b,o),a.normal.toArray(g,_),g[_+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=E,e.numIntersection=0,g}}class Fa extends hn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Nl(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Yt(5,5,5),s=new ni({name:"CubemapFromEquirect",uniforms:wi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Vt,blending:_i});s.uniforms.tEquirect.value=t;const a=new be(r,s),o=t.minFilter;return t.minFilter===On&&(t.minFilter=Ht),new ma(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,r);e.setRenderTarget(s)}}const Do=256,Op=3,Bp=20,$l=256,Jl=16,zp=3,kp=new I,Gp=new ke;class Ji{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new ma(1,10,null),this._boxMesh=new be(new Yt(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,s={}){const{size:a=256,position:o=kp}=s,l=this._renderer;this._setSize(a);const c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);const p=l.autoClear,h=l.autoClearColor,f=l.autoClearDepth,v=l.autoClearStencil,E=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,E===null&&(e.background=l.getClearColor(Gp));const g=new ma(n,r,u);return g.position.copy(o),g.update(l,e),l.autoClear=p,l.autoClearColor=h,l.autoClearDepth=f,l.autoClearStencil=v,e.background=E,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Fo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Uo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Do,Id(e))}_fromTexture(e,t){e.mapping===Mi||e.mapping===Wi?this._setSize(e.image.length===0?Do:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){const e=this._cubeSize,t=Io(e,!1,!1),n=Math.log2(e)-Op;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Io(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){const r=this._boxMesh,s=this._cubeCamera;r.material=n,s.renderTarget=e,s.activeMipmapLevel=t;const a=e.width>>t;e.viewport.set(0,0,a,a),s.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Mi||e.mapping===Wi?(this._cubemapMaterial===null&&(this._cubemapMaterial=Fo()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Uo()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=Hp(),this._integrationMaterial=Vp());const t=this._cubeSize,n=e.texture.mipmaps.length-1,r=this._ggxMaterial.uniforms;r.envMap.value=this._sourceTarget.texture;const s=this._integrationMaterial.uniforms;s.envMap.value=this._sourceTarget.texture,s.sourceLod.value=Math.log2(t/Jl);for(let a=0;a<=n;a++){const o=Ji.lodToRoughness(a,n);if(a>n-zp)s.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{const l=o>0?Math.log2(t)+.5*Math.log2(6/($l*Math.pow(o,4)))+.5:0;r.roughness.value=o,r.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Wp());const n=this._blurMaterial,r=n.uniforms,s=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=s.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(s,0,n)}}function Io(i,e,t){return new Fa(i,{minFilter:On,generateMipmaps:e,type:pn,colorSpace:Ur,depthBuffer:t})}function er(i,e,t){return new ni({name:i,uniforms:e,vertexShader:Ze.cube_vert,fragmentShader:t,side:Vt,blending:_i,depthTest:!1,depthWrite:!1})}function Hp(){return er("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${$l}u

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
	`)}function Vp(){return er("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Jl}},`

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
	`)}function Wp(){return er("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Bp}
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
	`)}function Uo(){return er("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Fo(){return er("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function jp(i){let e=new WeakMap,t=new WeakMap,n=null;function r(h,f=!1){return h==null?null:f?a(h):s(h)}function s(h){if(h&&h.isTexture){const f=h.mapping;if(f===Xr||f===qr)if(e.has(h)){const v=e.get(h).texture;return o(v,h.mapping)}else{const v=h.image;if(v&&v.height>0){const E=new Fa(v.height);return E.fromEquirectangularTexture(i,h),e.set(h,E),h.addEventListener("dispose",c),o(E.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){const f=h.mapping,v=f===Xr||f===qr,E=f===Mi||f===Wi;if(v||E){let g=t.get(h);const m=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==m)return n===null&&(n=new Ji(i)),g=v?n.fromEquirectangular(h,g):n.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,t.set(h,g),g.texture;if(g!==void 0)return g.texture;{const b=h.image;return v&&b&&b.height>0||E&&b&&l(b)?(n===null&&(n=new Ji(i)),g=v?n.fromEquirectangular(h):n.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,t.set(h,g),h.addEventListener("dispose",u),g.texture):null}}}return h}function o(h,f){return f===Xr?h.mapping=Mi:f===qr&&(h.mapping=Wi),h}function l(h){let f=0;const v=6;for(let E=0;E<v;E++)h[E]!==void 0&&f++;return f===v}function c(h){const f=h.target;f.removeEventListener("dispose",c);const v=e.get(f);v!==void 0&&(e.delete(f),v.dispose())}function u(h){const f=h.target;f.removeEventListener("dispose",u);const v=t.get(f);v!==void 0&&(t.delete(f),v.dispose())}function p(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:p}}function Xp(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const r=i.getExtension(n);return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&Si("WebGLRenderer: "+n+" extension not supported."),r}}}function qp(i,e,t,n){const r={},s=new WeakMap,a=new FinalizationRegistry(v=>delete r[v]);function o(v){l(v.target)}function l(v){v.index!==null&&e.remove(v.index);for(const g in v.attributes)e.remove(v.attributes[g]);v.removeEventListener("dispose",o),delete r[v.id],a.unregister(v);const E=s.get(v);E&&(e.remove(E),s.delete(v)),n.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,t.memory.geometries--}function c(v,E){return r[E.id]!==void 0||(E.addEventListener("dispose",o),r[E.id]=new WeakRef(E),a.register(E,E.id,E),t.memory.geometries++),E}function u(v){const E=v.attributes;for(const g in E)e.update(E[g],i.ARRAY_BUFFER)}function p(v){const E=v.index,g=v.attributes.position;let m=0;if(g===void 0)return;const b=E!==null?E.array.length:g.array.length/3-1,T=g.count>=65535?Ll:Pl,_=new T(Math.ceil(b/3)*6,1),C=_.array;if(E!==null){const x=E.array;m=E.version;for(let S=0,F=0;S<b;S+=3){const R=x[S+0],w=x[S+1],D=x[S+2];C[F++]=R,C[F++]=w,C[F++]=w,C[F++]=D,C[F++]=D,C[F++]=R}}else{m=g.version;for(let x=0,S=0;x<b;x+=3){const F=x+0,R=x+1,w=x+2;C[S++]=F,C[S++]=R,C[S++]=R,C[S++]=w,C[S++]=w,C[S++]=F}}_.version=m;const A=s.get(v);A&&e.remove(A),s.set(v,_)}function h(v){const E=s.get(v);if(E){const g=v.index;g!==null&&E.version<g.version&&p(v)}else p(v);return s.get(v)}function f(){for(const v in r){const E=r[v].deref();E!==void 0&&l(E)}}return{get:c,update:u,getWireframeAttribute:h,dispose:f}}function Yp(i,e,t){let n;function r(p){n=p}let s,a;function o(p){s=p.type,a=p.bytesPerElement}function l(p,h){i.drawElements(n,h,s,p*a),t.update(h,n,1)}function c(p,h,f){f!==0&&(i.drawElementsInstanced(n,h,s,p*a,f),t.update(h,n,f))}function u(p,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,s,p,0,f);let E=0;for(let g=0;g<f;g++)E+=h[g];t.update(E,n,1)}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Zp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(s/3);break;case i.LINES:t.lines+=o*(s/2);break;case i.LINE_STRIP:t.lines+=o*(s-1);break;case i.LINE_LOOP:t.lines+=o*s;break;case i.POINTS:t.points+=o*s;break;default:at("WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function $p(i,e,t){const n=new WeakMap,r=new vt;function s(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=u!==void 0?u.length:0;let h=n.get(o);if(h===void 0||h.count!==p){let F=function(){x.dispose(),n.delete(o),o.removeEventListener("dispose",F)};h!==void 0&&h.texture.dispose();const f=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,E=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],b=o.morphAttributes.color||[];let T=0;f===!0&&(T=1),v===!0&&(T=2),E===!0&&(T=3);let _=o.attributes.position.count*T,C=1;_>e.maxTextureSize&&(C=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);const A=new Float32Array(_*C*4*p),x=new wl(A,_,C,p);x.type=dn,x.needsUpdate=!0;const S=T*4;for(let R=0;R<p;R++){const w=g[R],D=m[R],G=b[R],N=_*C*4*R;for(let O=0;O<w.count;O++){const H=O*S;f===!0&&(r.fromBufferAttribute(w,O),A[N+H+0]=r.x,A[N+H+1]=r.y,A[N+H+2]=r.z,A[N+H+3]=0),v===!0&&(r.fromBufferAttribute(D,O),A[N+H+4]=r.x,A[N+H+5]=r.y,A[N+H+6]=r.z,A[N+H+7]=0),E===!0&&(r.fromBufferAttribute(G,O),A[N+H+8]=r.x,A[N+H+9]=r.y,A[N+H+10]=r.z,A[N+H+11]=G.itemSize===4?r.w:1)}}h={count:p,texture:x,size:new V(_,C)},n.set(o,h),o.addEventListener("dispose",F)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let E=0;E<c.length;E++)f+=c[E];const v=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:s}}function Jp(i,e,t,n,r){let s=new WeakMap;function a(c){const u=r.render.frame,p=c.geometry,h=e.get(c,p);if(s.get(h)!==u&&(e.update(h),s.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,u))),c.isSkinnedMesh){const f=c.skeleton;s.get(f)!==u&&(f.update(),s.set(f,u))}return h}function o(){s=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const Kp={[ll]:"LINEAR_TONE_MAPPING",[cl]:"REINHARD_TONE_MAPPING",[dl]:"CINEON_TONE_MAPPING",[Sa]:"ACES_FILMIC_TONE_MAPPING",[hl]:"AGX_TONE_MAPPING",[fl]:"NEUTRAL_TONE_MAPPING",[ul]:"CUSTOM_TONE_MAPPING"};function Qp(i,e,t,n,r,s){const a=new hn(e,t,{type:i,depthBuffer:r,stencilBuffer:s,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null,c=null;const u=new Wt;u.setAttribute("position",new ut([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new ut([0,2,0,0,2,0],2));const p=new Gu({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new be(u,p),f=new ql(-1,1,1,-1,0,1);let v=null,E=null,g=!1,m,b=null,T=[],_=!1;this.setSize=function(C,A){a.setSize(C,A),o!==null&&o.setSize(C,A),l!==null&&l.setSize(C,A);for(let x=0;x<T.length;x++){const S=T[x];S.setSize&&S.setSize(C,A)}},this.setEffects=function(C){T=C,_=T.length>0&&T[0].isRenderPass===!0;const A=a.width,x=a.height;T.length>0&&o===null&&(o=new hn(A,x,{type:pn,depthBuffer:!1,stencilBuffer:!1}),l=new hn(A,x,{type:pn,depthBuffer:!1,stencilBuffer:!1}));const S=r===!0&&T.some(F=>F.needsDepthTexture===!0);S!==(a.depthTexture!==null)&&(S===!0&&c===null&&(c=new Ei(A,x),s===!0&&(c.format=Bn,c.type=bi)),a.dispose(),a.depthTexture=S?c:null,a.resolveDepthBuffer=S,a.storeMultisampledDepthBuffer=S);for(let F=0;F<T.length;F++){const R=T[F];R.setSize&&R.setSize(A,x),S&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(C,A){if(g||C.toneMapping===En&&T.length===0)return!1;if(b=A,A!==null){const x=A.width,S=A.height;(a.width!==x||a.height!==S)&&this.setSize(x,S)}return _===!1&&C.setRenderTarget(a),m=C.toneMapping,C.toneMapping=En,!0},this.hasRenderPass=function(){return _},this.end=function(C,A){C.toneMapping=m,g=!0;let x=a,S=o;for(let F=0;F<T.length;F++){const R=T[F];R.enabled!==!1&&(R.render(C,S,x,A),R.needsSwap!==!1&&(x=S,S=S===o?l:o))}if(v!==C.outputColorSpace||E!==C.toneMapping){v=C.outputColorSpace,E=C.toneMapping,p.defines={},it.getTransfer(v)===dt&&(p.defines.SRGB_TRANSFER="");const F=Kp[E];F&&(p.defines[F]=""),p.needsUpdate=!0}p.uniforms.tDiffuse.value=x.texture,C.setRenderTarget(b),C.render(h,f),b=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),p.dispose()}}const Kl=new Ot,Ql=new Ei(1,1),ec=new Dl(1),tc=new wl,nc=new Hd,ic=new Nl,Oo=[],Bo=[],zo=new Float32Array(16),ko=new Float32Array(9),Go=new Float32Array(4);function Pi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=Oo[r];if(s===void 0&&(s=new Float32Array(r),Oo[r]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(s,o)}return s}function Tt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function wt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Gr(i,e){let t=Bo[e];t===void 0&&(t=new Int32Array(e),Bo[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function em(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function tm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2fv(this.addr,e),wt(t,e)}}function nm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Tt(t,e))return;i.uniform3fv(this.addr,e),wt(t,e)}}function im(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4fv(this.addr,e),wt(t,e)}}function rm(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;Go.set(n),i.uniformMatrix2fv(this.addr,!1,Go),wt(t,n)}}function sm(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;ko.set(n),i.uniformMatrix3fv(this.addr,!1,ko),wt(t,n)}}function am(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;zo.set(n),i.uniformMatrix4fv(this.addr,!1,zo),wt(t,n)}}function om(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function lm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2iv(this.addr,e),wt(t,e)}}function cm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3iv(this.addr,e),wt(t,e)}}function dm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4iv(this.addr,e),wt(t,e)}}function um(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function hm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2uiv(this.addr,e),wt(t,e)}}function fm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3uiv(this.addr,e),wt(t,e)}}function pm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4uiv(this.addr,e),wt(t,e)}}function Hr(i){return i.version===0&&(i.compareFunction=El,i.needsUpdate=!0),i}function mm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?s=Hr(Ql):s=Kl,t.setTexture2D(e||s,r)}function gm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||nc,r)}function xm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_CUBE_SHADOW?s=Hr(ec):s=ic,t.setTextureCube(e||s,r)}function vm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||tc,r)}function _m(i){switch(i){case 5126:return em;case 35664:return tm;case 35665:return nm;case 35666:return im;case 35674:return rm;case 35675:return sm;case 35676:return am;case 5124:case 35670:return om;case 35667:case 35671:return lm;case 35668:case 35672:return cm;case 35669:case 35673:return dm;case 5125:return um;case 36294:return hm;case 36295:return fm;case 36296:return pm;case 35678:case 36198:case 36298:case 36306:case 35682:return mm;case 35679:case 36299:case 36307:return gm;case 35680:case 36300:case 36308:case 36293:return xm;case 36289:case 36303:case 36311:case 36292:return vm}}function Sm(i,e){i.uniform1fv(this.addr,e)}function ym(i,e){const t=Pi(e,this.size,2);i.uniform2fv(this.addr,t)}function Mm(i,e){const t=Pi(e,this.size,3);i.uniform3fv(this.addr,t)}function bm(i,e){const t=Pi(e,this.size,4);i.uniform4fv(this.addr,t)}function Em(i,e){const t=Pi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Tm(i,e){const t=Pi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function wm(i,e){const t=Pi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Am(i,e){i.uniform1iv(this.addr,e)}function Rm(i,e){i.uniform2iv(this.addr,e)}function Cm(i,e){i.uniform3iv(this.addr,e)}function Pm(i,e){i.uniform4iv(this.addr,e)}function Lm(i,e){i.uniform1uiv(this.addr,e)}function Nm(i,e){i.uniform2uiv(this.addr,e)}function Dm(i,e){i.uniform3uiv(this.addr,e)}function Im(i,e){i.uniform4uiv(this.addr,e)}function Um(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));let a;this.type===i.SAMPLER_2D_SHADOW?a=Hr(Ql):a=Kl;for(let o=0;o!==r;++o)t.setTexture2D(e[o]||a,s[o])}function Fm(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||nc,s[a])}function Om(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=Hr(ec):a=ic;for(let o=0;o!==r;++o)t.setTextureCube(e[o]||a,s[o])}function Bm(i,e,t){const n=this.cache,r=e.length,s=Gr(t,r);Tt(n,s)||(i.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||tc,s[a])}function zm(i){switch(i){case 5126:return Sm;case 35664:return ym;case 35665:return Mm;case 35666:return bm;case 35674:return Em;case 35675:return Tm;case 35676:return wm;case 5124:case 35670:return Am;case 35667:case 35671:return Rm;case 35668:case 35672:return Cm;case 35669:case 35673:return Pm;case 5125:return Lm;case 36294:return Nm;case 36295:return Dm;case 36296:return Im;case 35678:case 36198:case 36298:case 36306:case 35682:return Um;case 35679:case 36299:case 36307:return Fm;case 35680:case 36300:case 36308:case 36293:return Om;case 36289:case 36303:case 36311:case 36292:return Bm}}class km{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=_m(t.type)}}class Gm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=zm(t.type)}}class Hm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,t[o.id],n)}}}const bs=/(\w+)(\])?(\[|\.)?/g;function Ho(i,e){i.seq.push(e),i.map[e.id]=e}function Vm(i,e,t){const n=i.name,r=n.length;for(bs.lastIndex=0;;){const s=bs.exec(n),a=bs.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){Ho(t,c===void 0?new km(o,i,e):new Gm(o,i,e));break}else{let p=t.map[o];p===void 0&&(p=new Hm(o),Ho(t,p)),t=p}}}class Nr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Vm(o,l,this)}const r=[],s=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(a):s.push(a);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in t&&n.push(a)}return n}}function Vo(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Wm=37297;let jm=0;function Xm(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Wo=new Ve;function qm(i){it._getMatrix(Wo,it.workingColorSpace,i);const e=`mat3( ${Wo.elements.map(t=>t.toFixed(4))} )`;switch(it.getTransfer(i)){case Fr:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return He("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function jo(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+Xm(i.getShaderSource(e),o)}else return s}function Ym(i,e){const t=qm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const Zm={[ll]:"Linear",[cl]:"Reinhard",[dl]:"Cineon",[Sa]:"ACESFilmic",[hl]:"AgX",[fl]:"Neutral",[ul]:"Custom"};function $m(i,e){const t=Zm[e];return t===void 0?(He("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const wr=new I;function Jm(){it.getLuminanceCoefficients(wr);const i=wr.x.toFixed(4),e=wr.y.toFixed(4),t=wr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Km(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(zi).join(`
`)}function Qm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function e0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),a=s.name;let o=1;s.type===i.FLOAT_MAT2&&(o=2),s.type===i.FLOAT_MAT3&&(o=3),s.type===i.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function zi(i){return i!==""}function Xo(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function qo(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const t0=/^[ \t]*#include +<([\w\d./]+)>/gm;function ga(i){return i.replace(t0,n0)}function n0(i,e){const t=Ze[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return ga(t)}const i0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Yo(i){return i.replace(i0,r0)}function r0(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Zo(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}const s0={[Ar]:"SHADOWMAP_TYPE_PCF",[Oi]:"SHADOWMAP_TYPE_VSM"};function a0(i){return s0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const o0={[Wi]:"ENVMAP_MODE_REFRACTION"};function l0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":o0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const c0={[ol]:"ENVMAP_BLENDING_MULTIPLY",[xd]:"ENVMAP_BLENDING_MIX",[vd]:"ENVMAP_BLENDING_ADD"};function d0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":c0[i.combine]||"ENVMAP_BLENDING_NONE"}function u0(i,e,t,n){const r=i.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=a0(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=l0(t),p=d0(t),h=Km(t),f=Qm(s),v=r.createProgram();let E,g,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(E=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(zi).join(`
`),E.length>0&&(E+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(zi).join(`
`),g.length>0&&(g+=`
`)):(E=[Zo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(zi).join(`
`),g=[Zo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+p:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==En?"#define TONE_MAPPING":"",t.toneMapping!==En?Ze.tonemapping_pars_fragment:"",t.toneMapping!==En?$m("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ze.colorspace_pars_fragment,Ym("linearToOutputTexel",t.outputColorSpace),Jm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(zi).join(`
`)),a=ga(a),a=Xo(a,t),a=qo(a,t),o=ga(o),o=Xo(o,t),o=qo(o,t),a=Yo(a),o=Yo(o),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,E=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+E,g=["#define varying in",t.glslVersion===no?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===no?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const b=m+E+a,T=m+g+o,_=Vo(r,r.VERTEX_SHADER,b),C=Vo(r,r.FRAGMENT_SHADER,T);r.attachShader(v,_),r.attachShader(v,C),t.index0AttributeName!==void 0?r.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function A(R){if(i.debug.checkShaderErrors){const w=r.getProgramInfoLog(v)||"",D=r.getShaderInfoLog(_)||"",G=r.getShaderInfoLog(C)||"",N=w.trim(),O=D.trim(),H=G.trim();let L=!0,q=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(L=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,v,_,C);else{const k=jo(r,_,"vertex"),K=jo(r,C,"fragment");at("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+N+`
`+k+`
`+K)}else N!==""?He("WebGLProgram: Program Info Log:",N):(O===""||H==="")&&(q=!1);q&&(R.diagnostics={runnable:L,programLog:N,vertexShader:{log:O,prefix:E},fragmentShader:{log:H,prefix:g}})}r.deleteShader(_),r.deleteShader(C),x=new Nr(r,v),S=e0(r,v)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let F=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=r.getProgramParameter(v,Wm)),F},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=jm++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=_,this.fragmentShader=C,this}let h0=0;class f0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new p0(e),t.set(e,n)),n}}class p0{constructor(e){this.id=h0++,this.code=e,this.usedTimes=0}}function m0(i){return i===ei||i===Dr||i===Ir}function g0(i,e,t,n,r,s){const a=new Al,o=new f0,l=new Set,c=[],u=new Map,p=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(x){return l.add(x),x===0?"uv":`uv${x}`}function v(x,S,F,R,w,D){const G=R.fog,N=w.geometry,O=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,H=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,L=e.get(x.envMap||O,H),q=h[x.type];let k=n.precision;x.precision!==null&&(k=n.getMaxPrecision(x.precision),k!==x.precision&&He("WebGLProgram.getParameters:",x.precision,"not supported, using",k,"instead."));const K=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,$=K!==void 0?K.length:0;let ae=0;N.morphAttributes.position!==void 0&&(ae=1),N.morphAttributes.normal!==void 0&&(ae=2),N.morphAttributes.color!==void 0&&(ae=3);let we,Y,le,Ee;if(q){const ye=cn[q];we=ye.vertexShader,Y=ye.fragmentShader}else{we=x.vertexShader,Y=x.fragmentShader;const ye=o.getVertexShaderStage(x),ct=o.getFragmentShaderStage(x);o.update(x,ye,ct),le=ye.id,Ee=ct.id}const De=i.getRenderTarget(),me=i.state.buffers.depth.getReversed(),Ae=w.isInstancedMesh===!0,lt=w.isBatchedMesh===!0,Fe=!!x.map,je=!!x.matcap,Ke=!!L,ie=Ke&&L.isPMREMTexture===!0,he=!!x.aoMap,ce=!!x.lightMap,Re=!!x.bumpMap&&x.wireframe===!1,Se=!!x.normalMap,Xe=!!x.displacementMap,Ie=!!x.emissiveMap,Qe=!!x.metalnessMap,et=!!x.roughnessMap,st=x.anisotropy>0,z=x.clearcoat>0,yt=x.diffuseRoughness>0,Je=x.dispersion>0,ht=x.retroreflectivity>0,xe=x.iridescence>0,St=x.sheen>0,Be=x.transmission>0,Ge=st&&!!x.anisotropyMap,P=z&&!!x.clearcoatMap,y=z&&!!x.clearcoatNormalMap,j=z&&!!x.clearcoatRoughnessMap,re=yt&&!!x.diffuseRoughnessMap,ne=xe&&!!x.iridescenceMap,de=xe&&!!x.iridescenceThicknessMap,ve=St&&!!x.sheenColorMap,Q=St&&!!x.sheenRoughnessMap,ee=!!x.specularMap,fe=!!x.specularColorMap,U=!!x.specularIntensityMap,te=Be&&!!x.transmissionMap,J=Be&&!!x.thicknessMap,pe=!!x.gradientMap,oe=!!x.alphaMap,ue=x.alphaTest>0,Ue=!!x.alphaHash,Ye=!!x.extensions;let se=En;x.toneMapped&&(De===null||De.isXRRenderTarget===!0)&&(se=i.toneMapping);const Oe=ie?L.isCompressedCubeTexture?L.image[0].mipmaps:L.mipmaps:null,qe={shaderID:q,shaderType:x.type,shaderName:x.name,vertexShader:we,fragmentShader:Y,defines:x.defines,customVertexShaderID:le,customFragmentShaderID:Ee,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:k,batching:lt,batchingColor:lt&&w._colorsTexture!==null,instancing:Ae,instancingColor:Ae&&w.instanceColor!==null,instancingMorph:Ae&&w.morphTexture!==null,outputColorSpace:De===null?i.outputColorSpace:De.isXRRenderTarget===!0?De.texture.colorSpace:it.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Fe,matcap:je,envMap:Ke,envMapMode:Ke&&L.mapping,envMapPMREM:ie,envMapMaxLod:ie?Oe.length-1:null,envMapSize:ie?Oe[0].width:null,aoMap:he,lightMap:ce,bumpMap:Re,normalMap:Se,displacementMap:Xe,emissiveMap:Ie,normalMapObjectSpace:Se&&x.normalMapType===yd,normalMapTangentSpace:Se&&x.normalMapType===da,packedNormalMap:Se&&x.normalMapType===da&&m0(x.normalMap.format),metalnessMap:Qe,roughnessMap:et,anisotropy:st,anisotropyMap:Ge,clearcoat:z,clearcoatMap:P,clearcoatNormalMap:y,clearcoatRoughnessMap:j,diffuseRoughness:yt,diffuseRoughnessMap:re,dispersion:Je,retroreflection:ht,iridescence:xe,iridescenceMap:ne,iridescenceThicknessMap:de,sheen:St,sheenColorMap:ve,sheenRoughnessMap:Q,specularMap:ee,specularColorMap:fe,specularIntensityMap:U,transmission:Be,transmissionMap:te,thicknessMap:J,gradientMap:pe,opaque:x.transparent===!1&&x.blending===ki&&x.alphaToCoverage===!1,alphaMap:oe,alphaTest:ue,alphaHash:Ue,combine:x.combine,mapUv:Fe&&f(x.map.channel),aoMapUv:he&&f(x.aoMap.channel),lightMapUv:ce&&f(x.lightMap.channel),bumpMapUv:Re&&f(x.bumpMap.channel),normalMapUv:Se&&f(x.normalMap.channel),displacementMapUv:Xe&&f(x.displacementMap.channel),emissiveMapUv:Ie&&f(x.emissiveMap.channel),metalnessMapUv:Qe&&f(x.metalnessMap.channel),roughnessMapUv:et&&f(x.roughnessMap.channel),anisotropyMapUv:Ge&&f(x.anisotropyMap.channel),clearcoatMapUv:P&&f(x.clearcoatMap.channel),clearcoatNormalMapUv:y&&f(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:j&&f(x.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:re&&f(x.diffuseRoughnessMap.channel),iridescenceMapUv:ne&&f(x.iridescenceMap.channel),iridescenceThicknessMapUv:de&&f(x.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&f(x.sheenColorMap.channel),sheenRoughnessMapUv:Q&&f(x.sheenRoughnessMap.channel),specularMapUv:ee&&f(x.specularMap.channel),specularColorMapUv:fe&&f(x.specularColorMap.channel),specularIntensityMapUv:U&&f(x.specularIntensityMap.channel),transmissionMapUv:te&&f(x.transmissionMap.channel),thicknessMapUv:J&&f(x.thicknessMap.channel),alphaMapUv:oe&&f(x.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(Se||st),vertexNormals:!!N.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:w.isPoints===!0&&!!N.attributes.uv&&(Fe||oe),fog:!!G,useFog:x.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||N.attributes.normal===void 0&&Se===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:me,skinning:w.isSkinnedMesh===!0,hasPositionAttribute:N.attributes.position!==void 0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:$,morphTextureStride:ae,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:D.filter(ye=>ye.texture!==null).length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&F.length>0,shadowMapType:i.shadowMap.type,toneMapping:se,decodeVideoTexture:Fe&&x.map.isVideoTexture===!0&&it.getTransfer(x.map.colorSpace)===dt,decodeVideoTextureEmissive:Ie&&x.emissiveMap.isVideoTexture===!0&&it.getTransfer(x.emissiveMap.colorSpace)===dt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ft,flipSided:x.side===Vt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Ye&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ye&&x.extensions.multiDraw===!0||lt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return qe.vertexUv1s=l.has(1),qe.vertexUv2s=l.has(2),qe.vertexUv3s=l.has(3),l.clear(),qe}function E(x){const S=[];if(x.shaderID?S.push(x.shaderID):(S.push(x.customVertexShaderID),S.push(x.customFragmentShaderID)),x.defines!==void 0)for(const F in x.defines)S.push(F),S.push(x.defines[F]);return x.isRawShaderMaterial===!1&&(g(S,x),m(S,x),S.push(i.outputColorSpace)),S.push(x.customProgramCacheKey),S.join()}function g(x,S){x.push(S.precision),x.push(S.outputColorSpace),x.push(S.envMapMode),x.push(S.envMapPMREM),x.push(S.envMapMaxLod),x.push(S.envMapSize),x.push(S.mapUv),x.push(S.alphaMapUv),x.push(S.lightMapUv),x.push(S.aoMapUv),x.push(S.bumpMapUv),x.push(S.normalMapUv),x.push(S.displacementMapUv),x.push(S.emissiveMapUv),x.push(S.metalnessMapUv),x.push(S.roughnessMapUv),x.push(S.anisotropyMapUv),x.push(S.clearcoatMapUv),x.push(S.clearcoatNormalMapUv),x.push(S.clearcoatRoughnessMapUv),x.push(S.diffuseRoughnessMapUv),x.push(S.iridescenceMapUv),x.push(S.iridescenceThicknessMapUv),x.push(S.sheenColorMapUv),x.push(S.sheenRoughnessMapUv),x.push(S.specularMapUv),x.push(S.specularColorMapUv),x.push(S.specularIntensityMapUv),x.push(S.transmissionMapUv),x.push(S.thicknessMapUv),x.push(S.combine),x.push(S.fogExp2),x.push(S.sizeAttenuation),x.push(S.morphTargetsCount),x.push(S.numSunLights),x.push(S.numDirLights),x.push(S.numPointLights),x.push(S.numSpotLights),x.push(S.numSpotLightMaps),x.push(S.numHemiLights),x.push(S.numRectAreaLights),x.push(S.numSunLightShadows),x.push(S.numDirLightShadows),x.push(S.numPointLightShadows),x.push(S.numSpotLightShadows),x.push(S.numSpotLightShadowsWithMaps),x.push(S.numLightProbes),x.push(S.numLightProbeGrids),x.push(S.shadowMapType),x.push(S.toneMapping),x.push(S.numClippingPlanes),x.push(S.numClipIntersection),x.push(S.depthPacking)}function m(x,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.retroreflection&&a.enable(24),S.diffuseRoughness&&a.enable(25),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function b(x){const S=h[x.type];let F;if(S){const R=cn[S];F=Bu.clone(R.uniforms)}else F=x.uniforms;return F}function T(x,S){let F=u.get(S);return F!==void 0?++F.usedTimes:(F=new u0(i,S,x,r),c.push(F),u.set(S,F)),F}function _(x){if(--x.usedTimes===0){const S=c.indexOf(x);c[S]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function C(x){o.remove(x)}function A(){o.dispose()}return{getParameters:v,getProgramCacheKey:E,getUniforms:b,acquireProgram:T,releaseProgram:_,releaseShaderCache:C,programs:c,dispose:A}}function x0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function r(a,o,l){i.get(a)[o]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function v0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function $o(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Jo(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function a(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function o(h,f,v,E,g,m){let b=i[e];return b===void 0?(b={id:h.id,object:h,geometry:f,material:v,materialVariant:a(h),groupOrder:E,renderOrder:h.renderOrder,z:g,group:m},i[e]=b):(b.id=h.id,b.object=h,b.geometry=f,b.material=v,b.materialVariant=a(h),b.groupOrder=E,b.renderOrder=h.renderOrder,b.z=g,b.group=m),e++,b}function l(h,f,v,E,g,m,b){b.reversedDepth===!0&&(g=-g);const T=o(h,f,v,E,g,m);v.transmission>0?n.push(T):v.transparent===!0?r.push(T):t.push(T)}function c(h,f,v,E,g,m){const b=o(h,f,v,E,g,m);v.transmission>0?n.unshift(b):v.transparent===!0?r.unshift(b):t.unshift(b)}function u(h,f){t.length>1&&t.sort(h||v0),n.length>1&&n.sort(f||$o),r.length>1&&r.sort(f||$o)}function p(){for(let h=e,f=i.length;h<f;h++){const v=i[h];if(v.id===null)break;v.id=null,v.object=null,v.geometry=null,v.material=null,v.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:l,unshift:c,finish:p,sort:u}}function _0(){let i=new WeakMap;function e(n,r){const s=i.get(n);let a;return s===void 0?(a=new Jo,i.set(n,[a])):r>=s.length?(a=new Jo,s.push(a)):a=s[r],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function S0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new I,color:new ke};break;case"SpotLight":t={position:new I,direction:new I,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function y0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let M0=0;function b0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function E0(i){const e=new S0,t=y0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const r=new I,s=new gt,a=new gt;function o(c){let u=0,p=0,h=0;for(let D=0;D<9;D++)n.probe[D].set(0,0,0);let f=0,v=0,E=0,g=0,m=0,b=0,T=0,_=0,C=0,A=0,x=0,S=0,F=0,R=0;c.sort(b0);for(let D=0,G=c.length;D<G;D++){const N=c[D],O=N.color,H=N.intensity,L=N.distance;let q=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===ei?q=N.shadow.map.texture:q=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)u+=O.r*H,p+=O.g*H,h+=O.b*H;else if(N.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(N.sh.coefficients[k],H);R++}else if(N.isSunLight){const k=e.get(N);if(k.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){const K=N.shadow,$=t.get(N);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize.copy(K.mapSize).multiply(K.getFrameExtents()),n.sunShadow[v]=$,n.sunShadowMap[v]=q;const ae=K.getViewportCount();for(let we=0;we<ae;we++)n.sunShadowMatrix[E+we]=K.getMatrix(we),n.sunShadowCascade[E+we]=K._cascadeData[we];E+=ae,v++}n.sun[f]=k,f++}else if(N.isDirectionalLight){const k=e.get(N);if(k.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){const K=N.shadow,$=t.get(N);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,n.directionalShadow[g]=$,n.directionalShadowMap[g]=q,n.directionalShadowMatrix[g]=N.shadow.matrix,C++}n.directional[g]=k,g++}else if(N.isSpotLight){const k=e.get(N);k.position.setFromMatrixPosition(N.matrixWorld),k.color.copy(O).multiplyScalar(H),k.distance=L,k.coneCos=Math.cos(N.angle),k.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),k.decay=N.decay,n.spot[b]=k;const K=N.shadow;if(N.map&&(n.spotLightMap[S]=N.map,S++,K.updateMatrices(N),N.castShadow&&F++),n.spotLightMatrix[b]=K.matrix,N.castShadow){const $=t.get(N);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,n.spotShadow[b]=$,n.spotShadowMap[b]=q,x++}b++}else if(N.isRectAreaLight){const k=e.get(N);k.color.copy(O).multiplyScalar(H),k.halfWidth.set(N.width*.5,0,0),k.halfHeight.set(0,N.height*.5,0),n.rectArea[T]=k,T++}else if(N.isPointLight){const k=e.get(N);if(k.color.copy(N.color).multiplyScalar(N.intensity),k.distance=N.distance,k.decay=N.decay,N.castShadow){const K=N.shadow,$=t.get(N);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,$.shadowCameraNear=K.camera.near,$.shadowCameraFar=K.camera.far,n.pointShadow[m]=$,n.pointShadowMap[m]=q,n.pointShadowMatrix[m]=N.shadow.matrix,A++}n.point[m]=k,m++}else if(N.isHemisphereLight){const k=e.get(N);k.skyColor.copy(N.color).multiplyScalar(H),k.groundColor.copy(N.groundColor).multiplyScalar(H),n.hemi[_]=k,_++}}T>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Me.LTC_FLOAT_1,n.rectAreaLTC2=Me.LTC_FLOAT_2):(n.rectAreaLTC1=Me.LTC_HALF_1,n.rectAreaLTC2=Me.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=p,n.ambient[2]=h;const w=n.hash;(w.sunLength!==f||w.directionalLength!==g||w.pointLength!==m||w.spotLength!==b||w.rectAreaLength!==T||w.hemiLength!==_||w.numSunShadows!==v||w.numDirectionalShadows!==C||w.numPointShadows!==A||w.numSpotShadows!==x||w.numSpotMaps!==S||w.numLightProbes!==R)&&(n.sun.length=f,n.directional.length=g,n.spot.length=b,n.rectArea.length=T,n.point.length=m,n.hemi.length=_,n.sunShadow.length=v,n.sunShadowMap.length=v,n.sunShadowMatrix.length=E,n.sunShadowCascade.length=E,n.directionalShadow.length=C,n.directionalShadowMap.length=C,n.directionalShadowMatrix.length=C,n.pointShadow.length=A,n.pointShadowMap.length=A,n.pointShadowMatrix.length=A,n.spotShadow.length=x,n.spotShadowMap.length=x,n.spotLightMatrix.length=x+S-F,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=F,n.numLightProbes=R,w.sunLength=f,w.directionalLength=g,w.pointLength=m,w.spotLength=b,w.rectAreaLength=T,w.hemiLength=_,w.numSunShadows=v,w.numDirectionalShadows=C,w.numPointShadows=A,w.numSpotShadows=x,w.numSpotMaps=S,w.numLightProbes=R,n.version=M0++)}function l(c,u){let p=0,h=0,f=0,v=0,E=0,g=0;const m=u.matrixWorldInverse;for(let b=0,T=c.length;b<T;b++){const _=c[b];if(_.isSunLight){const C=n.sun[p];C.direction.setFromMatrixPosition(_.matrixWorld),C.direction.transformDirection(m),p++}else if(_.isDirectionalLight){const C=n.directional[h];C.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(m),h++}else if(_.isSpotLight){const C=n.spot[v];C.position.setFromMatrixPosition(_.matrixWorld),C.position.applyMatrix4(m),C.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(m),v++}else if(_.isRectAreaLight){const C=n.rectArea[E];C.position.setFromMatrixPosition(_.matrixWorld),C.position.applyMatrix4(m),a.identity(),s.copy(_.matrixWorld),s.premultiply(m),a.extractRotation(s),C.halfWidth.set(_.width*.5,0,0),C.halfHeight.set(0,_.height*.5,0),C.halfWidth.applyMatrix4(a),C.halfHeight.applyMatrix4(a),E++}else if(_.isPointLight){const C=n.point[f];C.position.setFromMatrixPosition(_.matrixWorld),C.position.applyMatrix4(m),f++}else if(_.isHemisphereLight){const C=n.hemi[g];C.direction.setFromMatrixPosition(_.matrixWorld),C.direction.transformDirection(m),g++}}}return{setup:o,setupView:l,state:n}}function Ko(i){const e=new E0(i),t=[],n=[],r=[];function s(p){u.camera=p,t.length=0,n.length=0,r.length=0}function a(p){p.isLightProbeGrid?r.push(p):t.push(p)}function o(p){n.push(p)}function l(){e.setup(t),r.sort((p,h)=>p.priority-h.priority||p.id-h.id)}function c(p){e.setupView(t,p)}const u={lightsArray:t,shadowsArray:n,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:u,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function T0(i){let e=new WeakMap;function t(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new Ko(i),e.set(r,[o])):s>=a.length?(o=new Ko(i),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const w0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,A0=`uniform sampler2D shadow_pass;
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
}`,R0=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],C0=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Qo=new gt,Fi=new I,Es=new I;function P0(i,e,t){let n=new qi;const r=new V,s=new V,a=new vt,o=new Vu,l=new Wu,c={},u=t.maxTextureSize,p={[Kn]:Vt,[Vt]:Kn,[Ft]:Ft},h=new ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new V},radius:{value:4}},vertexShader:w0,fragmentShader:A0}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const v=new Wt;v.setAttribute("position",new Jn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const E=new be(v,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ar;let m=this.type;this.render=function(A,x,S){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||A.length===0)return;this.type===Kc&&(He("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ar);const F=i.getRenderTarget(),R=i.getActiveCubeFace(),w=i.getActiveMipmapLevel(),D=i.state;D.setBlending(_i),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);const G=m!==this.type;G&&x.traverse(function(N){N.material&&(Array.isArray(N.material)?N.material.forEach(O=>O.needsUpdate=!0):N.material.needsUpdate=!0)});for(let N=0,O=A.length;N<O;N++){const H=A[N],L=H.shadow;if(L===void 0){He("WebGLShadowMap:",H,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;r.copy(L.mapSize);const q=L.getFrameExtents();r.multiply(q),s.copy(L.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/q.x),r.x=s.x*q.x,L.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/q.y),r.y=s.y*q.y,L.mapSize.y=s.y));const k=i.state.buffers.depth.getReversed();if(L.camera._reversedDepth=k,L.map===null||G===!0){if(L.map!==null&&(L.map.depthTexture!==null&&(L.map.depthTexture.dispose(),L.map.depthTexture=null),L.map.dispose()),this.type===Oi){if(H.isPointLight){He("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}L.map=new hn(r.x,r.y,{format:ei,type:pn,minFilter:Ht,magFilter:Ht,generateMipmaps:!1}),L.map.texture.name=H.name+".shadowMap",L.map.depthTexture=new Ei(r.x,r.y,dn),L.map.depthTexture.name=H.name+".shadowMapDepth",L.map.depthTexture.format=kn,L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=Lt,L.map.depthTexture.magFilter=Lt}else H.isPointLight?(L.map=new Fa(r.x),L.map.depthTexture=new Dl(r.x,fn)):(L.map=new hn(r.x,r.y),L.map.depthTexture=new Ei(r.x,r.y,fn)),L.map.depthTexture.name=H.name+".shadowMap",L.map.depthTexture.format=kn,this.type===Ar?(L.map.depthTexture.compareFunction=k?bl:Ml,L.map.depthTexture.minFilter=Ht,L.map.depthTexture.magFilter=Ht):(L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=Lt,L.map.depthTexture.magFilter=Lt);L.camera.updateProjectionMatrix()}L.map.isWebGLCubeRenderTarget!==!0&&(L.map.width!==r.x||L.map.height!==r.y)&&L.map.setSize(r.x,r.y);const K=L.map.isWebGLCubeRenderTarget?6:L.getViewportCount();H.isPointLight!==!0&&L.updateMatrices(H,S);const $=L.camera.layers.mask&4294967294?L.camera.layers:S.layers;for(let ae=0;ae<K;ae++){const we=L.getCamera(ae);if(H.isPointLight){const Y=L.camera,le=L.matrix,Ee=H.distance||Y.far;Ee!==Y.far&&(Y.far=Ee,Y.updateProjectionMatrix()),Fi.setFromMatrixPosition(H.matrixWorld),Y.position.copy(Fi),Es.copy(Y.position),Es.add(R0[ae]),Y.up.copy(C0[ae]),Y.lookAt(Es),Y.updateMatrixWorld(),le.makeTranslation(-Fi.x,-Fi.y,-Fi.z),Qo.multiplyMatrices(Y.projectionMatrix,Y.matrixWorldInverse),L._frustum.setFromProjectionMatrix(Qo,Y.coordinateSystem,Y.reversedDepth)}if(L.map.isWebGLCubeRenderTarget)i.setRenderTarget(L.map,ae),i.clear();else{ae===0&&(i.setRenderTarget(L.map),i.clear());const Y=L.getViewport(ae);a.set(s.x*Y.x,s.y*Y.y,s.x*Y.z,s.y*Y.w),D.viewport(a)}n=L.getFrustum(ae),_(x,S,we,H,$,this.type)}L.isPointLightShadow!==!0&&this.type===Oi&&b(L,S),L.needsUpdate=!1}m=this.type,g.needsUpdate=!1,i.setRenderTarget(F,R,w)};function b(A,x){const S=e.update(E);h.defines.VSM_SAMPLES!==A.blurSamples&&(h.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null?A.mapPass=new hn(r.x,r.y,{format:ei,type:pn}):(A.mapPass.width!==A.map.width||A.mapPass.height!==A.map.height)&&A.mapPass.setSize(A.map.width,A.map.height),h.uniforms.shadow_pass.value=A.map.depthTexture,h.uniforms.resolution.value.set(A.map.width,A.map.height),h.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(x,null,S,h,E,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value.set(A.map.width,A.map.height),f.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(x,null,S,f,E,null)}function T(A,x,S,F){let R=null;const w=S.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(w!==void 0)R=w;else if(R=S.isPointLight===!0?l:o,i.localClippingEnabled&&x.clipShadows===!0&&Array.isArray(x.clippingPlanes)&&x.clippingPlanes.length!==0||x.displacementMap&&x.displacementScale!==0||x.alphaMap&&x.alphaTest>0||x.map&&x.alphaTest>0||x.alphaToCoverage===!0){const D=R.uuid,G=x.uuid;let N=c[D];N===void 0&&(N={},c[D]=N);let O=N[G];O===void 0&&(O=R.clone(),N[G]=O,x.addEventListener("dispose",C)),R=O}if(R.visible=x.visible,R.wireframe=x.wireframe,F===Oi?R.side=x.shadowSide!==null?x.shadowSide:x.side:R.side=x.shadowSide!==null?x.shadowSide:p[x.side],R.alphaMap=x.alphaMap,R.alphaTest=x.alphaToCoverage===!0?.5:x.alphaTest,R.map=x.map,R.clipShadows=x.clipShadows,R.clippingPlanes=x.clippingPlanes,R.clipIntersection=x.clipIntersection,R.displacementMap=x.displacementMap,R.displacementScale=x.displacementScale,R.displacementBias=x.displacementBias,R.wireframeLinewidth=x.wireframeLinewidth,R.linewidth=x.linewidth,S.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const D=i.properties.get(R);D.light=S}return R}function _(A,x,S,F,R,w){if(A.visible===!1)return;if(A.layers.test(R)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&w===Oi)&&(!A.frustumCulled||A.intersectsFrustum(n))){A.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,A.matrixWorld);const N=e.update(A),O=A.material;if(Array.isArray(O)){const H=N.groups;for(let L=0,q=H.length;L<q;L++){const k=H[L],K=O[k.materialIndex];if(K&&K.visible){const $=T(A,K,F,w);A.onBeforeShadow(i,A,x,S,N,$,k),i.renderBufferDirect(S,null,N,$,A,k),A.onAfterShadow(i,A,x,S,N,$,k)}}}else if(O.visible){const H=T(A,O,F,w);A.onBeforeShadow(i,A,x,S,N,H,null),i.renderBufferDirect(S,null,N,H,A,null),A.onAfterShadow(i,A,x,S,N,H,null)}}const G=A.children;for(let N=0,O=G.length;N<O;N++)_(G[N],x,S,F,R,w)}function C(A){A.target.removeEventListener("dispose",C);for(const S in c){const F=c[S],R=A.target.uuid;R in F&&(F[R].dispose(),delete F[R])}}}function L0(i,e){function t(){let U=!1;const te=new vt;let J=null;const pe=new vt(0,0,0,0);return{setMask:function(oe){J!==oe&&!U&&(i.colorMask(oe,oe,oe,oe),J=oe)},setLocked:function(oe){U=oe},setClear:function(oe,ue,Ue,Ye,se){se===!0&&(oe*=Ye,ue*=Ye,Ue*=Ye),te.set(oe,ue,Ue,Ye),pe.equals(te)===!1&&(i.clearColor(oe,ue,Ue,Ye),pe.copy(te))},reset:function(){U=!1,J=null,pe.set(-1,0,0,0)}}}function n(){let U=!1,te=!1,J=null,pe=null,oe=null;return{setReversed:function(ue){if(te!==ue){const Ue=e.get("EXT_clip_control");ue?Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.ZERO_TO_ONE_EXT):Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.NEGATIVE_ONE_TO_ONE_EXT),te=ue;const Ye=oe;oe=null,this.setClear(Ye)}},getReversed:function(){return te},setTest:function(ue){ue?me(i.DEPTH_TEST):Ae(i.DEPTH_TEST)},setMask:function(ue){J!==ue&&!U&&(i.depthMask(ue),J=ue)},setFunc:function(ue){if(te&&(ue=Nd[ue]),pe!==ue){switch(ue){case ws:i.depthFunc(i.NEVER);break;case As:i.depthFunc(i.ALWAYS);break;case Rs:i.depthFunc(i.LESS);break;case Vi:i.depthFunc(i.LEQUAL);break;case Cs:i.depthFunc(i.EQUAL);break;case Ps:i.depthFunc(i.GEQUAL);break;case Ls:i.depthFunc(i.GREATER);break;case Ns:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=ue}},setLocked:function(ue){U=ue},setClear:function(ue){oe!==ue&&(oe=ue,te&&(ue=1-ue),i.clearDepth(ue))},reset:function(){U=!1,J=null,pe=null,oe=null,te=!1}}}function r(){let U=!1,te=null,J=null,pe=null,oe=null,ue=null,Ue=null,Ye=null,se=null;return{setTest:function(Oe){U||(Oe?me(i.STENCIL_TEST):Ae(i.STENCIL_TEST))},setMask:function(Oe){te!==Oe&&!U&&(i.stencilMask(Oe),te=Oe)},setFunc:function(Oe,qe,ye){(J!==Oe||pe!==qe||oe!==ye)&&(i.stencilFunc(Oe,qe,ye),J=Oe,pe=qe,oe=ye)},setOp:function(Oe,qe,ye){(ue!==Oe||Ue!==qe||Ye!==ye)&&(i.stencilOp(Oe,qe,ye),ue=Oe,Ue=qe,Ye=ye)},setLocked:function(Oe){U=Oe},setClear:function(Oe){se!==Oe&&(i.clearStencil(Oe),se=Oe)},reset:function(){U=!1,te=null,J=null,pe=null,oe=null,ue=null,Ue=null,Ye=null,se=null}}}const s=new t,a=new n,o=new r;let l={};const c=new WeakMap;let u={},p={},h={},f=new WeakMap,v=[],E=null,g=!1,m=null,b=null,T=null,_=null,C=null,A=null,x=null,S=new ke(0,0,0),F=0,R=!1,w=null,D=null,G=null,N=null,O=null;const H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let L=!1,q=0;const k=i.getParameter(i.VERSION);k.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(k)[1]),L=q>=1):k.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),L=q>=2);let K=null,$={};const ae=i.getParameter(i.SCISSOR_BOX),we=i.getParameter(i.VIEWPORT),Y=new vt().fromArray(ae),le=new vt().fromArray(we);function Ee(U,te,J,pe){const oe=new Uint8Array(4),ue=i.createTexture();i.bindTexture(U,ue),i.texParameteri(U,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(U,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ue=0;Ue<J;Ue++)U===i.TEXTURE_3D||U===i.TEXTURE_2D_ARRAY?i.texImage3D(te,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,oe):i.texImage2D(te+Ue,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,oe);return ue}const De={};De[i.TEXTURE_2D]=Ee(i.TEXTURE_2D,i.TEXTURE_2D,1),De[i.TEXTURE_CUBE_MAP]=Ee(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),De[i.TEXTURE_2D_ARRAY]=Ee(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),De[i.TEXTURE_3D]=Ee(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),me(i.DEPTH_TEST),a.setFunc(Vi),Re(!1),Se(Ka),me(i.CULL_FACE),he(_i);function me(U){u[U]!==!0&&(i.enable(U),u[U]=!0)}function Ae(U){u[U]!==!1&&(i.disable(U),u[U]=!1)}function lt(U,te){return h[U]!==te?(i.bindFramebuffer(U,te),h[U]=te,U===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=te),U===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=te),!0):!1}function Fe(U,te){let J=v,pe=!1;if(U){J=f.get(te),J===void 0&&(J=[],f.set(te,J));const oe=U.textures;if(J.length!==oe.length||J[0]!==i.COLOR_ATTACHMENT0){for(let ue=0,Ue=oe.length;ue<Ue;ue++)J[ue]=i.COLOR_ATTACHMENT0+ue;J.length=oe.length,pe=!0}}else J[0]!==i.BACK&&(J[0]=i.BACK,pe=!0);pe&&i.drawBuffers(J)}function je(U){return E!==U?(i.useProgram(U),E=U,!0):!1}const Ke={[gi]:i.FUNC_ADD,[ed]:i.FUNC_SUBTRACT,[td]:i.FUNC_REVERSE_SUBTRACT};Ke[nd]=i.MIN,Ke[id]=i.MAX;const ie={[rd]:i.ZERO,[sd]:i.ONE,[ad]:i.SRC_COLOR,[sl]:i.SRC_ALPHA,[hd]:i.SRC_ALPHA_SATURATE,[dd]:i.DST_COLOR,[ld]:i.DST_ALPHA,[od]:i.ONE_MINUS_SRC_COLOR,[al]:i.ONE_MINUS_SRC_ALPHA,[ud]:i.ONE_MINUS_DST_COLOR,[cd]:i.ONE_MINUS_DST_ALPHA,[fd]:i.CONSTANT_COLOR,[pd]:i.ONE_MINUS_CONSTANT_COLOR,[md]:i.CONSTANT_ALPHA,[gd]:i.ONE_MINUS_CONSTANT_ALPHA};function he(U,te,J,pe,oe,ue,Ue,Ye,se,Oe){if(U===_i){g===!0&&(Ae(i.BLEND),g=!1);return}if(g===!1&&(me(i.BLEND),g=!0),U!==Qc){if(U!==m||Oe!==R){if((b!==gi||C!==gi)&&(i.blendEquation(i.FUNC_ADD),b=gi,C=gi),Oe)switch(U){case ki:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Qa:i.blendFunc(i.ONE,i.ONE);break;case eo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case to:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:at("WebGLState: Invalid blending: ",U);break}else switch(U){case ki:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Qa:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case eo:at("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case to:at("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:at("WebGLState: Invalid blending: ",U);break}T=null,_=null,A=null,x=null,S.set(0,0,0),F=0,m=U,R=Oe}return}oe=oe||te,ue=ue||J,Ue=Ue||pe,(te!==b||oe!==C)&&(i.blendEquationSeparate(Ke[te],Ke[oe]),b=te,C=oe),(J!==T||pe!==_||ue!==A||Ue!==x)&&(i.blendFuncSeparate(ie[J],ie[pe],ie[ue],ie[Ue]),T=J,_=pe,A=ue,x=Ue),(Ye.equals(S)===!1||se!==F)&&(i.blendColor(Ye.r,Ye.g,Ye.b,se),S.copy(Ye),F=se),m=U,R=!1}function ce(U,te){U.side===Ft?Ae(i.CULL_FACE):me(i.CULL_FACE);let J=U.side===Vt;te&&(J=!J),Re(J),U.blending===ki&&U.transparent===!1?he(_i):he(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),s.setMask(U.colorWrite);const pe=U.stencilWrite;o.setTest(pe),pe&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Ie(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?me(i.SAMPLE_ALPHA_TO_COVERAGE):Ae(i.SAMPLE_ALPHA_TO_COVERAGE)}function Re(U){w!==U&&(U?i.frontFace(i.CW):i.frontFace(i.CCW),w=U)}function Se(U){U!==$c?(me(i.CULL_FACE),U!==D&&(U===Ka?i.cullFace(i.BACK):U===Jc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ae(i.CULL_FACE),D=U}function Xe(U){U!==G&&(L&&i.lineWidth(U),G=U)}function Ie(U,te,J){U?(me(i.POLYGON_OFFSET_FILL),(N!==te||O!==J)&&(N=te,O=J,a.getReversed()&&(te=-te,J=-J),i.polygonOffset(te,J))):Ae(i.POLYGON_OFFSET_FILL)}function Qe(U){U?me(i.SCISSOR_TEST):Ae(i.SCISSOR_TEST)}function et(U){U===void 0&&(U=i.TEXTURE0+H-1),K!==U&&(i.activeTexture(U),K=U)}function st(U,te,J){J===void 0&&(K===null?J=i.TEXTURE0+H-1:J=K);let pe=$[J];pe===void 0&&(pe={type:void 0,texture:void 0},$[J]=pe),(pe.type!==U||pe.texture!==te)&&(K!==J&&(i.activeTexture(J),K=J),i.bindTexture(U,te||De[U]),pe.type=U,pe.texture=te)}function z(){const U=$[K];U!==void 0&&U.type!==void 0&&(i.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function yt(){try{i.compressedTexImage2D(...arguments)}catch(U){at("WebGLState:",U)}}function Je(){try{i.compressedTexImage3D(...arguments)}catch(U){at("WebGLState:",U)}}function ht(){try{i.texSubImage2D(...arguments)}catch(U){at("WebGLState:",U)}}function xe(){try{i.texSubImage3D(...arguments)}catch(U){at("WebGLState:",U)}}function St(){try{i.compressedTexSubImage2D(...arguments)}catch(U){at("WebGLState:",U)}}function Be(){try{i.compressedTexSubImage3D(...arguments)}catch(U){at("WebGLState:",U)}}function Ge(){try{i.texStorage2D(...arguments)}catch(U){at("WebGLState:",U)}}function P(){try{i.texStorage3D(...arguments)}catch(U){at("WebGLState:",U)}}function y(){try{i.texImage2D(...arguments)}catch(U){at("WebGLState:",U)}}function j(){try{i.texImage3D(...arguments)}catch(U){at("WebGLState:",U)}}function re(U){return p[U]!==void 0?p[U]:i.getParameter(U)}function ne(U,te){p[U]!==te&&(i.pixelStorei(U,te),p[U]=te)}function de(U){Y.equals(U)===!1&&(i.scissor(U.x,U.y,U.z,U.w),Y.copy(U))}function ve(U){le.equals(U)===!1&&(i.viewport(U.x,U.y,U.z,U.w),le.copy(U))}function Q(U,te){let J=c.get(te);J===void 0&&(J=new WeakMap,c.set(te,J));let pe=J.get(U);pe===void 0&&(pe=i.getUniformBlockIndex(te,U.name),i.uniformBlockBinding(te,pe,pe),J.set(U,pe))}function ee(U,te,J){const oe=c.get(te).get(U);l[oe]!==J&&(i.bindBufferBase(i.UNIFORM_BUFFER,oe,J),l[oe]=J)}function fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},p={},K=null,$={},h={},l={},f=new WeakMap,v=[],E=null,g=!1,m=null,b=null,T=null,_=null,C=null,A=null,x=null,S=new ke(0,0,0),F=0,R=!1,w=null,D=null,G=null,N=null,O=null,Y.set(0,0,i.canvas.width,i.canvas.height),le.set(0,0,i.canvas.width,i.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:me,disable:Ae,bindFramebuffer:lt,drawBuffers:Fe,useProgram:je,setBlending:he,setMaterial:ce,setFlipSided:Re,setCullFace:Se,setLineWidth:Xe,setPolygonOffset:Ie,setScissorTest:Qe,activeTexture:et,bindTexture:st,unbindTexture:z,compressedTexImage2D:yt,compressedTexImage3D:Je,texImage2D:y,texImage3D:j,pixelStorei:ne,getParameter:re,updateUBOMapping:Q,uniformBlockBinding:ee,texStorage2D:Ge,texStorage3D:P,texSubImage2D:ht,texSubImage3D:xe,compressedTexSubImage2D:St,compressedTexSubImage3D:Be,scissor:de,viewport:ve,reset:fe}}function N0(i,e,t,n,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new V,u=new WeakMap,p=new Set;let h;const f=new WeakMap,v=new Set,E=new FinalizationRegistry(P=>v.delete(P));let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(P,y){return g?new OffscreenCanvas(P,y):Or("canvas")}function b(P,y,j){let re=1;const ne=Ge(P);if((ne.width>j||ne.height>j)&&(re=j/Math.max(ne.width,ne.height)),re<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const de=Math.floor(re*ne.width),ve=Math.floor(re*ne.height);h===void 0&&(h=m(de,ve));const Q=y?m(de,ve):h;return Q.width=de,Q.height=ve,Q.getContext("2d").drawImage(P,0,0,de,ve),He("WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+de+"x"+ve+")."),Q}else return"data"in P&&He("WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),P;return P}function T(P){return P.generateMipmaps}function _(P){i.generateMipmap(P)}function C(P){return P.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?i.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function A(P,y,j,re,ne,de=!1){if(P!==null){if(i[P]!==void 0)return i[P];He("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let ve;re&&(ve=e.get("EXT_texture_norm16"),ve||He("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=y;if(y===i.RED&&(j===i.FLOAT&&(Q=i.R32F),j===i.HALF_FLOAT&&(Q=i.R16F),j===i.UNSIGNED_BYTE&&(Q=i.R8),j===i.UNSIGNED_SHORT&&ve&&(Q=ve.R16_EXT),j===i.SHORT&&ve&&(Q=ve.R16_SNORM_EXT)),y===i.RED_INTEGER&&(j===i.UNSIGNED_BYTE&&(Q=i.R8UI),j===i.UNSIGNED_SHORT&&(Q=i.R16UI),j===i.UNSIGNED_INT&&(Q=i.R32UI),j===i.BYTE&&(Q=i.R8I),j===i.SHORT&&(Q=i.R16I),j===i.INT&&(Q=i.R32I)),y===i.RG&&(j===i.FLOAT&&(Q=i.RG32F),j===i.HALF_FLOAT&&(Q=i.RG16F),j===i.UNSIGNED_BYTE&&(Q=i.RG8),j===i.UNSIGNED_SHORT&&ve&&(Q=ve.RG16_EXT),j===i.SHORT&&ve&&(Q=ve.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(j===i.UNSIGNED_BYTE&&(Q=i.RG8UI),j===i.UNSIGNED_SHORT&&(Q=i.RG16UI),j===i.UNSIGNED_INT&&(Q=i.RG32UI),j===i.BYTE&&(Q=i.RG8I),j===i.SHORT&&(Q=i.RG16I),j===i.INT&&(Q=i.RG32I)),y===i.RGB_INTEGER&&(j===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),j===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),j===i.UNSIGNED_INT&&(Q=i.RGB32UI),j===i.BYTE&&(Q=i.RGB8I),j===i.SHORT&&(Q=i.RGB16I),j===i.INT&&(Q=i.RGB32I)),y===i.RGBA_INTEGER&&(j===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),j===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),j===i.UNSIGNED_INT&&(Q=i.RGBA32UI),j===i.BYTE&&(Q=i.RGBA8I),j===i.SHORT&&(Q=i.RGBA16I),j===i.INT&&(Q=i.RGBA32I)),y===i.RGB&&(j===i.UNSIGNED_SHORT&&ve&&(Q=ve.RGB16_EXT),j===i.SHORT&&ve&&(Q=ve.RGB16_SNORM_EXT),j===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),j===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),y===i.RGBA){const ee=de?Fr:it.getTransfer(ne);j===i.FLOAT&&(Q=i.RGBA32F),j===i.HALF_FLOAT&&(Q=i.RGBA16F),j===i.UNSIGNED_BYTE&&(Q=ee===dt?i.SRGB8_ALPHA8:i.RGBA8),j===i.UNSIGNED_SHORT&&ve&&(Q=ve.RGBA16_EXT),j===i.SHORT&&ve&&(Q=ve.RGBA16_SNORM_EXT),j===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),j===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function x(P,y){let j;return P?y===null||y===fn||y===bi?j=i.DEPTH24_STENCIL8:y===dn?j=i.DEPTH32F_STENCIL8:y===ji&&(j=i.DEPTH24_STENCIL8,He("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===fn||y===bi?j=i.DEPTH_COMPONENT24:y===dn?j=i.DEPTH_COMPONENT32F:y===ji&&(j=i.DEPTH_COMPONENT16),j}function S(P,y){return T(P)===!0||P.isFramebufferTexture&&P.minFilter!==Lt&&P.minFilter!==Ht?Math.log2(Math.max(y.width,y.height))+1:P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?y.mipmaps.length:1}function F(P){const y=new WeakRef(P);n.get(P).__ref=y,v.add(y),E.register(P,y,y)}function R(P){const y=n.get(P).__ref;y!==void 0&&(v.delete(y),E.unregister(y))}function w(P){G(P.target)}function D(P){N(P.target)}function G(P){P.removeEventListener("dispose",w),R(P),H(P),P.isVideoTexture&&u.delete(P),P.isHTMLTexture&&p.delete(P)}function N(P){P.removeEventListener("dispose",D),R(P),q(P)}function O(){for(const P of v){const y=P.deref();y!==void 0&&(y.isRenderTarget===!0?N(y):G(y))}v.clear(),p.clear()}function H(P){const y=n.get(P);if(y.__webglInit===void 0)return;const j=P.source,re=f.get(j);if(re){const ne=re[y.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&L(P),Object.keys(re).length===0&&f.delete(j)}n.remove(P)}function L(P){const y=n.get(P);i.deleteTexture(y.__webglTexture);const j=P.source,re=f.get(j);delete re[y.__cacheKey],a.memory.textures--}function q(P){const y=n.get(P);y.__depthDisposeCallback&&y.__depthDisposeCallback();const j=P.depthTexture;if(j&&j.renderTarget===P&&G(j),P.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(y.__webglFramebuffer[ne]))for(let de=0;de<y.__webglFramebuffer[ne].length;de++)i.deleteFramebuffer(y.__webglFramebuffer[ne][de]);else i.deleteFramebuffer(y.__webglFramebuffer[ne]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[ne])}else{if(Array.isArray(y.__webglFramebuffer))for(let ne=0;ne<y.__webglFramebuffer.length;ne++)i.deleteFramebuffer(y.__webglFramebuffer[ne]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let ne=0;ne<y.__webglColorRenderbuffer.length;ne++)y.__webglColorRenderbuffer[ne]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[ne]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const re=P.textures;for(let ne=0,de=re.length;ne<de;ne++){const ve=n.get(re[ne]);ve.__webglTexture&&(i.deleteTexture(ve.__webglTexture),a.memory.textures--),n.remove(re[ne])}n.remove(P)}let k=0;function K(){k=0}function $(){return k}function ae(P){k=P}function we(){const P=k;return P>=r.maxTextures&&He("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+r.maxTextures),k+=1,P}function Y(P){const y=[];return y.push(P.wrapS),y.push(P.wrapT),y.push(P.wrapR||0),y.push(P.magFilter),y.push(P.minFilter),y.push(P.anisotropy),y.push(P.internalFormat),y.push(P.format),y.push(P.type),y.push(P.generateMipmaps),y.push(P.mipmapsAutoUpdate),y.push(P.premultiplyAlpha),y.push(P.flipY),y.push(P.unpackAlignment),y.push(P.colorSpace),y.join()}function le(P,y){const j=n.get(P);if(P.isVideoTexture&&St(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&j.__version!==P.version){const re=P.image;if(re===null)He("WebGLRenderer: Texture marked for update but no image data found.");else if(re.complete===!1)He("WebGLRenderer: Texture marked for update but image is incomplete");else{ce(j,P,y);return}}else P.isExternalTexture&&(j.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,j.__webglTexture,i.TEXTURE0+y)}function Ee(P,y){const j=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&j.__version!==P.version){ce(j,P,y);return}else P.isExternalTexture&&(j.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,j.__webglTexture,i.TEXTURE0+y)}function De(P,y){const j=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&j.__version!==P.version){ce(j,P,y);return}t.bindTexture(i.TEXTURE_3D,j.__webglTexture,i.TEXTURE0+y)}function me(P,y){const j=n.get(P);if(P.version>0&&j.__version!==P.version){Re(j,P,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture,i.TEXTURE0+y)}const Ae={[Qn]:i.REPEAT,[Mn]:i.CLAMP_TO_EDGE,[Ds]:i.MIRRORED_REPEAT},lt={[Lt]:i.NEAREST,[_d]:i.NEAREST_MIPMAP_NEAREST,[ir]:i.NEAREST_MIPMAP_LINEAR,[Ht]:i.LINEAR,[Yr]:i.LINEAR_MIPMAP_NEAREST,[On]:i.LINEAR_MIPMAP_LINEAR},Fe={[bd]:i.NEVER,[El]:i.ALWAYS,[Ed]:i.LESS,[Ml]:i.LEQUAL,[Td]:i.EQUAL,[bl]:i.GEQUAL,[wd]:i.GREATER,[Ad]:i.NOTEQUAL};function je(P,y){if(y.type===dn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Ht||y.magFilter===Yr||y.magFilter===ir||y.magFilter===On||y.minFilter===Ht||y.minFilter===Yr||y.minFilter===ir||y.minFilter===On)&&He("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(P,i.TEXTURE_WRAP_S,Ae[y.wrapS]),i.texParameteri(P,i.TEXTURE_WRAP_T,Ae[y.wrapT]),(P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY)&&i.texParameteri(P,i.TEXTURE_WRAP_R,Ae[y.wrapR]),i.texParameteri(P,i.TEXTURE_MAG_FILTER,lt[y.magFilter]),i.texParameteri(P,i.TEXTURE_MIN_FILTER,lt[y.minFilter]),y.compareFunction&&(i.texParameteri(P,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(P,i.TEXTURE_COMPARE_FUNC,Fe[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Lt||y.minFilter!==ir&&y.minFilter!==On||y.type===dn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const j=e.get("EXT_texture_filter_anisotropic");i.texParameterf(P,j.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,r.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Ke(P,y){let j=!1;P.__webglInit===void 0&&(P.__webglInit=!0,y.addEventListener("dispose",w),F(y));const re=y.source;let ne=f.get(re);ne===void 0&&(ne={},f.set(re,ne));const de=Y(y);if(de!==P.__cacheKey){ne[de]===void 0&&(ne[de]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,j=!0),ne[de].usedTimes++;const ve=ne[P.__cacheKey];ve!==void 0&&(ne[P.__cacheKey].usedTimes--,ve.usedTimes===0&&L(y)),P.__cacheKey=de,P.__webglTexture=ne[de].texture}return j}function ie(P,y,j){return Math.floor(Math.floor(P/j)/y)}function he(P,y,j,re){const de=P.updateRanges;if(de.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,j,re,y.data);else{de.sort((U,te)=>U.start-te.start);let ve=0;for(let U=1;U<de.length;U++){const te=de[ve],J=de[U],pe=te.start+te.count,oe=ie(J.start,y.width,4),ue=ie(te.start,y.width,4);J.start<=pe+1&&oe===ue&&ie(J.start+J.count-1,y.width,4)===oe?te.count=Math.max(te.count,J.start+J.count-te.start):(++ve,de[ve]=J)}de.length=ve+1;const Q=t.getParameter(i.UNPACK_ROW_LENGTH),ee=t.getParameter(i.UNPACK_SKIP_PIXELS),fe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let U=0,te=de.length;U<te;U++){const J=de[U],pe=Math.floor(J.start/4),oe=Math.ceil(J.count/4),ue=pe%y.width,Ue=Math.floor(pe/y.width),Ye=oe,se=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ue),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ue),t.texSubImage2D(i.TEXTURE_2D,0,ue,Ue,Ye,se,j,re,y.data)}P.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Q),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(i.UNPACK_SKIP_ROWS,fe)}}function ce(P,y,j){let re=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(re=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(re=i.TEXTURE_3D);const ne=Ke(P,y),de=y.source;t.bindTexture(re,P.__webglTexture,i.TEXTURE0+j);const ve=n.get(de);if(de.version!==ve.__version||ne===!0){if(t.activeTexture(i.TEXTURE0+j),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){const se=it.getPrimaries(it.workingColorSpace),Oe=y.colorSpace===Fn?null:it.getPrimaries(y.colorSpace),qe=y.colorSpace===Fn||se===Oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,qe)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let ee=b(y.image,!1,r.maxTextureSize);ee=Be(y,ee);const fe=s.convert(y.format,y.colorSpace),U=s.convert(y.type);let te=A(y.internalFormat,fe,U,y.normalized,y.colorSpace,y.isVideoTexture);je(re,y);let J;const pe=y.mipmaps,oe=y.isVideoTexture!==!0,ue=ve.__version===void 0||ne===!0,Ue=de.dataReady,Ye=S(y,ee);if(y.isDepthTexture)te=x(y.format===Bn,y.type),ue&&(oe?t.texStorage2D(i.TEXTURE_2D,1,te,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,te,ee.width,ee.height,0,fe,U,null));else if(y.isDataTexture)if(pe.length>0){oe&&ue&&t.texStorage2D(i.TEXTURE_2D,Ye,te,pe[0].width,pe[0].height);for(let se=0,Oe=pe.length;se<Oe;se++)J=pe[se],oe?Ue&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,J.width,J.height,fe,U,J.data):t.texImage2D(i.TEXTURE_2D,se,te,J.width,J.height,0,fe,U,J.data);y.generateMipmaps=!1}else oe?(ue&&t.texStorage2D(i.TEXTURE_2D,Ye,te,ee.width,ee.height),Ue&&he(y,ee,fe,U)):t.texImage2D(i.TEXTURE_2D,0,te,ee.width,ee.height,0,fe,U,ee.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){oe&&ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ye,te,pe[0].width,pe[0].height,ee.depth);for(let se=0,Oe=pe.length;se<Oe;se++)if(J=pe[se],y.format!==un)if(fe!==null)if(oe){if(Ue)if(y.layerUpdates.size>0){const qe=No(J.width,J.height,y.format,y.type);for(const ye of y.layerUpdates){const ct=J.data.subarray(ye*qe/J.data.BYTES_PER_ELEMENT,(ye+1)*qe/J.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,ye,J.width,J.height,1,fe,ct)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,J.width,J.height,ee.depth,fe,J.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,se,te,J.width,J.height,ee.depth,0,J.data,0,0);else He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else oe?Ue&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,J.width,J.height,ee.depth,fe,U,J.data):t.texImage3D(i.TEXTURE_2D_ARRAY,se,te,J.width,J.height,ee.depth,0,fe,U,J.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{oe&&ue&&t.texStorage2D(i.TEXTURE_2D,Ye,te,pe[0].width,pe[0].height);for(let se=0,Oe=pe.length;se<Oe;se++)J=pe[se],y.format!==un?fe!==null?oe?Ue&&t.compressedTexSubImage2D(i.TEXTURE_2D,se,0,0,J.width,J.height,fe,J.data):t.compressedTexImage2D(i.TEXTURE_2D,se,te,J.width,J.height,0,J.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):oe?Ue&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,J.width,J.height,fe,U,J.data):t.texImage2D(i.TEXTURE_2D,se,te,J.width,J.height,0,fe,U,J.data)}else if(y.isDataArrayTexture)if(oe){if(ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ye,te,ee.width,ee.height,ee.depth),Ue)if(y.layerUpdates.size>0){const se=No(ee.width,ee.height,y.format,y.type);for(const Oe of y.layerUpdates){const qe=ee.data.subarray(Oe*se/ee.data.BYTES_PER_ELEMENT,(Oe+1)*se/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Oe,ee.width,ee.height,1,fe,U,qe)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,fe,U,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,te,ee.width,ee.height,ee.depth,0,fe,U,ee.data);else if(y.isData3DTexture)oe?(ue&&t.texStorage3D(i.TEXTURE_3D,Ye,te,ee.width,ee.height,ee.depth),Ue&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,fe,U,ee.data)):t.texImage3D(i.TEXTURE_3D,0,te,ee.width,ee.height,ee.depth,0,fe,U,ee.data);else if(y.isFramebufferTexture){if(ue)if(oe)t.texStorage2D(i.TEXTURE_2D,Ye,te,ee.width,ee.height);else{let se=ee.width,Oe=ee.height;for(let qe=0;qe<Ye;qe++)t.texImage2D(i.TEXTURE_2D,qe,te,se,Oe,0,fe,U,null),se>>=1,Oe>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){const se=i.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),ee.parentNode!==se){se.appendChild(ee),p.add(y),se.onpaint=Oe=>{const qe=Oe.changedElements;for(const ye of p)qe.includes(ye.image)&&(ye.needsUpdate=!0)},se.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ee);else{const qe=i.RGBA,ye=i.RGBA,ct=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,qe,ye,ct,ee)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(pe.length>0){if(oe&&ue){const se=Ge(pe[0]);t.texStorage2D(i.TEXTURE_2D,Ye,te,se.width,se.height)}for(let se=0,Oe=pe.length;se<Oe;se++)J=pe[se],oe?Ue&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,fe,U,J):t.texImage2D(i.TEXTURE_2D,se,te,fe,U,J);y.generateMipmaps=!1}else if(oe){if(ue){const se=Ge(ee);t.texStorage2D(i.TEXTURE_2D,Ye,te,se.width,se.height)}Ue&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,U,ee)}else t.texImage2D(i.TEXTURE_2D,0,te,fe,U,ee);T(y)&&y.mipmapsAutoUpdate===!0&&_(re),ve.__version=de.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Re(P,y,j){if(y.image.length!==6)return;const re=Ke(P,y),ne=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,P.__webglTexture,i.TEXTURE0+j);const de=n.get(ne);if(ne.version!==de.__version||re===!0){t.activeTexture(i.TEXTURE0+j);const ve=it.getPrimaries(it.workingColorSpace),Q=y.colorSpace===Fn?null:it.getPrimaries(y.colorSpace),ee=y.colorSpace===Fn||ve===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const fe=y.isCompressedTexture||y.image[0].isCompressedTexture,U=y.image[0]&&y.image[0].isDataTexture,te=[];for(let ye=0;ye<6;ye++)!fe&&!U?te[ye]=b(y.image[ye],!0,r.maxCubemapSize):te[ye]=U?y.image[ye].image:y.image[ye],te[ye]=Be(y,te[ye]);const J=te[0],pe=s.convert(y.format,y.colorSpace),oe=s.convert(y.type);let ue=A(y.internalFormat,pe,oe,y.normalized,y.colorSpace);const Ue=y.isVideoTexture!==!0,Ye=de.__version===void 0||re===!0,se=ne.dataReady;let Oe=S(y,J);je(i.TEXTURE_CUBE_MAP,y);let qe;if(y.isDepthTexture){if(ue=x(y.format===Bn,y.type),Ye)if(Ue)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,ue,J.width,J.height);else for(let ye=0;ye<6;ye++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,ue,J.width,J.height,0,pe,oe,null)}else if(fe){Ue&&Ye&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Oe,ue,J.width,J.height);for(let ye=0;ye<6;ye++){qe=te[ye].mipmaps;for(let ct=0;ct<qe.length;ct++){const At=qe[ct];y.format!==un?pe!==null?Ue?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,0,0,At.width,At.height,pe,At.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,ue,At.width,At.height,0,At.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,0,0,At.width,At.height,pe,oe,At.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct,ue,At.width,At.height,0,pe,oe,At.data)}}}else{if(qe=y.mipmaps,Ue&&Ye){qe.length>0&&Oe++;const ye=Ge(te[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Oe,ue,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(U){Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,te[ye].width,te[ye].height,pe,oe,te[ye].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,ue,te[ye].width,te[ye].height,0,pe,oe,te[ye].data);for(let ct=0;ct<qe.length;ct++){const An=qe[ct].image[ye].image;Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,0,0,An.width,An.height,pe,oe,An.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,ue,An.width,An.height,0,pe,oe,An.data)}}else{Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,pe,oe,te[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,ue,pe,oe,te[ye]);for(let ct=0;ct<qe.length;ct++){const At=qe[ct];Ue?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,0,0,pe,oe,At.image[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ct+1,ue,pe,oe,At.image[ye])}}}T(y)&&y.mipmapsAutoUpdate===!0&&_(i.TEXTURE_CUBE_MAP),de.__version=ne.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Se(P,y,j,re,ne,de){const ve=s.convert(j.format,j.colorSpace),Q=s.convert(j.type),ee=A(j.internalFormat,ve,Q,j.normalized,j.colorSpace),fe=n.get(y),U=n.get(j);if(U.__renderTarget=y,!fe.__hasExternalTextures){const te=Math.max(1,y.width>>de),J=Math.max(1,y.height>>de);ne===i.TEXTURE_3D||ne===i.TEXTURE_2D_ARRAY?t.texImage3D(ne,de,ee,te,J,y.depth,0,ve,Q,null):t.texImage2D(ne,de,ee,te,J,0,ve,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,P),xe(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,re,ne,U.__webglTexture,0,ht(y)):(ne===i.TEXTURE_2D||ne>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,re,ne,U.__webglTexture,de),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Xe(P,y,j){if(i.bindRenderbuffer(i.RENDERBUFFER,P),y.depthBuffer){const re=y.depthTexture,ne=re&&re.isDepthTexture?re.type:null,de=x(y.stencilBuffer,ne),ve=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;xe(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(y),de,y.width,y.height):j?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(y),de,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,de,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,P)}else{const re=y.textures;for(let ne=0;ne<re.length;ne++){const de=re[ne],ve=s.convert(de.format,de.colorSpace),Q=s.convert(de.type),ee=A(de.internalFormat,ve,Q,de.normalized,de.colorSpace);xe(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(y),ee,y.width,y.height):j?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(y),ee,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ee,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ie(P,y,j){const re=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,P),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ne=n.get(y.depthTexture);ne.__renderTarget=y;const de=re?y.depthTexture.image[0]:y.depthTexture.image;(!ne.__webglTexture||de.width!==y.width||de.height!==y.height)&&(de.width=y.width,de.height=y.height,y.depthTexture.needsUpdate=!0),re?me(y.depthTexture,0):le(y.depthTexture,0);const ve=ne.__webglTexture,Q=ht(y),ee=re?i.TEXTURE_CUBE_MAP_POSITIVE_X+j:i.TEXTURE_2D,fe=y.depthTexture.format===Bn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===kn)xe(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,ee,ve,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,fe,ee,ve,0);else if(y.depthTexture.format===Bn)xe(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,ee,ve,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,fe,ee,ve,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Qe(P){const y=n.get(P),j=P.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==P.depthTexture){const re=P.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),re){const ne=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,re.removeEventListener("dispose",ne)};re.addEventListener("dispose",ne),y.__depthDisposeCallback=ne}y.__boundDepthTexture=re}if(P.depthTexture&&!y.__autoAllocateDepthBuffer)if(j)for(let re=0;re<6;re++)Ie(y.__webglFramebuffer[re],P,re);else P.texture.mipmaps.length>0?Ie(y.__webglFramebuffer[0],P,0):Ie(y.__webglFramebuffer,P,0);else if(j){y.__webglDepthbuffer=[];for(let re=0;re<6;re++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[re]),y.__webglDepthbuffer[re]===void 0)y.__webglDepthbuffer[re]=i.createRenderbuffer(),Xe(y.__webglDepthbuffer[re],P,!1);else{const ne=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=y.__webglDepthbuffer[re];i.bindRenderbuffer(i.RENDERBUFFER,de),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,de)}}else if(P.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),Xe(y.__webglDepthbuffer,P,!1);else{const ne=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,de),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,de)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function et(P,y,j){const re=n.get(P);y!==void 0&&Se(re.__webglFramebuffer,P,P.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),j!==void 0&&Qe(P)}function st(P){const y=P.texture,j=n.get(P),re=n.get(y);P.addEventListener("dispose",D),F(P);const ne=P.textures,de=P.isWebGLCubeRenderTarget===!0,ve=ne.length>1;if(ve||(re.__webglTexture===void 0&&(re.__webglTexture=i.createTexture()),re.__version=y.version,a.memory.textures++),de){j.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(y.mipmaps.length>0){j.__webglFramebuffer[Q]=[];for(let ee=0;ee<y.mipmaps.length;ee++)j.__webglFramebuffer[Q][ee]=i.createFramebuffer()}else j.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(y.mipmaps.length>0){j.__webglFramebuffer=[];for(let Q=0;Q<y.mipmaps.length;Q++)j.__webglFramebuffer[Q]=i.createFramebuffer()}else j.__webglFramebuffer=i.createFramebuffer();if(ve)for(let Q=0,ee=ne.length;Q<ee;Q++){const fe=n.get(ne[Q]);fe.__webglTexture===void 0&&(fe.__webglTexture=i.createTexture(),a.memory.textures++)}if(P.samples>0&&xe(P)===!1){j.__webglMultisampledFramebuffer=i.createFramebuffer(),j.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,j.__webglMultisampledFramebuffer);for(let Q=0;Q<ne.length;Q++){const ee=ne[Q];j.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,j.__webglColorRenderbuffer[Q]);const fe=s.convert(ee.format,ee.colorSpace),U=s.convert(ee.type),te=A(ee.internalFormat,fe,U,ee.normalized,ee.colorSpace,P.isXRRenderTarget===!0),J=ht(P);i.renderbufferStorageMultisample(i.RENDERBUFFER,J,te,P.width,P.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,j.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),P.depthBuffer&&(j.__webglDepthRenderbuffer=i.createRenderbuffer(),Xe(j.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(de){t.bindTexture(i.TEXTURE_CUBE_MAP,re.__webglTexture),je(i.TEXTURE_CUBE_MAP,y);for(let Q=0;Q<6;Q++)if(y.mipmaps.length>0)for(let ee=0;ee<y.mipmaps.length;ee++)Se(j.__webglFramebuffer[Q][ee],P,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ee);else Se(j.__webglFramebuffer[Q],P,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);T(y)?_(i.TEXTURE_CUBE_MAP):y.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}else if(ve){for(let Q=0,ee=ne.length;Q<ee;Q++){const fe=ne[Q],U=n.get(fe);let te=i.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(te=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(te,U.__webglTexture),je(te,fe),Se(j.__webglFramebuffer,P,fe,i.COLOR_ATTACHMENT0+Q,te,0),T(fe)&&_(te)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(Q=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,re.__webglTexture),je(Q,y),y.mipmaps.length>0)for(let ee=0;ee<y.mipmaps.length;ee++)Se(j.__webglFramebuffer[ee],P,y,i.COLOR_ATTACHMENT0,Q,ee);else Se(j.__webglFramebuffer,P,y,i.COLOR_ATTACHMENT0,Q,0);T(y)?_(Q):y.mipmaps.length>0&&i.texParameteri(Q,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}P.depthBuffer&&Qe(P)}function z(P){const y=P.textures;for(let j=0,re=y.length;j<re;j++){const ne=y[j];if(T(ne)&&ne.mipmapsAutoUpdate===!0){const de=C(P),ve=n.get(ne).__webglTexture;t.bindTexture(de,ve),_(de),t.unbindTexture()}}}const yt=[];function Je(P){if(P.samples>0){if(xe(P)===!1){const y=P.textures,j=P.width,re=P.height;let ne=i.COLOR_BUFFER_BIT;const de=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=n.get(P),Q=y.length>1;if(Q)for(let fe=0;fe<y.length;fe++)t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),P.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let fe=0;fe<y.length;fe++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(ne|=i.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(ne|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const U=n.get(y[fe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,U,0)}i.blitFramebuffer(0,0,j,re,0,0,j,re,ne,i.NEAREST),l===!0&&(yt.length=0,yt.push(i.COLOR_ATTACHMENT0+fe),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&yt.push(de),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,yt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let fe=0;fe<y.length;fe++){t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const U=n.get(y[fe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,U,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){const y=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function ht(P){return Math.min(r.maxSamples,P.samples)}function xe(P){const y=n.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function St(P){const y=a.render.frame;u.get(P)!==y&&(u.set(P,y),P.update())}function Be(P,y){const j=P.colorSpace,re=P.format,ne=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||j!==Ur&&j!==Fn&&(it.getTransfer(j)===dt?(re!==un||ne!==qt)&&He("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):at("WebGLTextures: Unsupported texture color space:",j)),y}function Ge(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=we,this.resetTextureUnits=K,this.getTextureUnits=$,this.setTextureUnits=ae,this.setTexture2D=le,this.setTexture2DArray=Ee,this.setTexture3D=De,this.setTextureCube=me,this.rebindTextures=et,this.setupRenderTarget=st,this.updateRenderTargetMipmap=z,this.updateMultisampleRenderTarget=Je,this.setupDepthRenderbuffer=Qe,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=xe,this.dispose=O}function D0(i,e){function t(n,r=Fn){let s;const a=it.getTransfer(r);if(n===qt)return i.UNSIGNED_BYTE;if(n===Ma)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ba)return i.UNSIGNED_SHORT_5_5_5_1;if(n===xl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===vl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===ml)return i.BYTE;if(n===gl)return i.SHORT;if(n===ji)return i.UNSIGNED_SHORT;if(n===ya)return i.INT;if(n===fn)return i.UNSIGNED_INT;if(n===dn)return i.FLOAT;if(n===pn)return i.HALF_FLOAT;if(n===_l)return i.ALPHA;if(n===Sl)return i.RGB;if(n===un)return i.RGBA;if(n===kn)return i.DEPTH_COMPONENT;if(n===Bn)return i.DEPTH_STENCIL;if(n===yl)return i.RED;if(n===Ea)return i.RED_INTEGER;if(n===ei)return i.RG;if(n===Ta)return i.RG_INTEGER;if(n===wa)return i.RGBA_INTEGER;if(n===Rr||n===Cr||n===Pr||n===Lr)if(a===dt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Rr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Cr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Pr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Lr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Rr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Cr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Pr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Lr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Is||n===Us||n===Fs||n===Os)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Is)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Us)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Fs)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Os)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Bs||n===zs||n===ks||n===Gs||n===Hs||n===Dr||n===Vs)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Bs||n===zs)return a===dt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===ks)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===Gs)return s.COMPRESSED_R11_EAC;if(n===Hs)return s.COMPRESSED_SIGNED_R11_EAC;if(n===Dr)return s.COMPRESSED_RG11_EAC;if(n===Vs)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ws||n===js||n===Xs||n===qs||n===Ys||n===Zs||n===$s||n===Js||n===Ks||n===Qs||n===ea||n===ta||n===na||n===ia)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Ws)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===js)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Xs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===qs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ys)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Zs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===$s)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Js)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ks)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Qs)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ea)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ta)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===na)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ia)return a===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ra||n===sa||n===aa)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===ra)return a===dt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===sa)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===aa)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===oa||n===la||n===Ir||n===ca)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===oa)return s.COMPRESSED_RED_RGTC1_EXT;if(n===la)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ir)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ca)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===bi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const I0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,U0=`
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

}`;class F0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Il(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new ni({vertexShader:I0,fragmentShader:U0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new be(new bn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class O0 extends ii{constructor(e,t){super();const n=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,u=null,p=null,h=null,f=null,v=null;const E=typeof XRWebGLBinding<"u",g=new F0,m={},b=t.getContextAttributes();let T=null,_=null;const C=[],A=[],x=new V;let S=null,F=null;const R=new rn;R.viewport=new vt;const w=new rn;w.viewport=new vt;const D=[R,w],G=new Yu;let N=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let le=C[Y];return le===void 0&&(le=new is,C[Y]=le),le.getTargetRaySpace()},this.getControllerGrip=function(Y){let le=C[Y];return le===void 0&&(le=new is,C[Y]=le),le.getGripSpace()},this.getHand=function(Y){let le=C[Y];return le===void 0&&(le=new is,C[Y]=le),le.getHandSpace()};function H(Y){const le=A.indexOf(Y.inputSource);if(le===-1)return;const Ee=C[le];Ee!==void 0&&(Ee.update(Y.inputSource,Y.frame,c||a),Ee.dispatchEvent({type:Y.type,data:Y.inputSource}))}function L(){r.removeEventListener("select",H),r.removeEventListener("selectstart",H),r.removeEventListener("selectend",H),r.removeEventListener("squeeze",H),r.removeEventListener("squeezestart",H),r.removeEventListener("squeezeend",H),r.removeEventListener("end",L),r.removeEventListener("inputsourceschange",q);for(let Y=0;Y<C.length;Y++){const le=A[Y];le!==null&&(A[Y]=null,C[Y].disconnect(le))}N=null,O=null,g.reset();for(const Y in m)delete m[Y];if(e.setRenderTarget(T),f=null,h=null,p=null,r=null,_=null,we.stop(),n.isPresenting=!1,e.setPixelRatio(S),e.setSize(x.width,x.height,!1),F!==null){const Y=F.camera;Y.fov=F.fov,Y.zoom=F.zoom,Y.updateProjectionMatrix(),F=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){s=Y,n.isPresenting===!0&&He("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&He("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return p===null&&E&&(p=new XRWebGLBinding(r,t)),p},this.getFrame=function(){return v},this.getSession=function(){return r},this.setSession=async function(Y){if(r=Y,r!==null){if(T=e.getRenderTarget(),r.addEventListener("select",H),r.addEventListener("selectstart",H),r.addEventListener("selectend",H),r.addEventListener("squeeze",H),r.addEventListener("squeezestart",H),r.addEventListener("squeezeend",H),r.addEventListener("end",L),r.addEventListener("inputsourceschange",q),b.xrCompatible!==!0&&await t.makeXRCompatible(),S=e.getPixelRatio(),e.getSize(x),E&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ee=null,De=null,me=null;b.depth&&(me=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ee=b.stencil?Bn:kn,De=b.stencil?bi:fn);const Ae={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:s};p=this.getBinding(),h=p.createProjectionLayer(Ae),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),_=new hn(h.textureWidth,h.textureHeight,{format:un,type:qt,depthTexture:new Ei(h.textureWidth,h.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,Ee),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{const Ee={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,Ee),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new hn(f.framebufferWidth,f.framebufferHeight,{format:un,type:qt,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),we.setContext(r),we.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function q(Y){for(let le=0;le<Y.removed.length;le++){const Ee=Y.removed[le],De=A.indexOf(Ee);De>=0&&(A[De]=null,C[De].disconnect(Ee))}for(let le=0;le<Y.added.length;le++){const Ee=Y.added[le];let De=A.indexOf(Ee);if(De===-1){for(let Ae=0;Ae<C.length;Ae++)if(Ae>=A.length){A.push(Ee),De=Ae;break}else if(A[Ae]===null){A[Ae]=Ee,De=Ae;break}if(De===-1)break}const me=C[De];me&&me.connect(Ee)}}function k(Y,le){le===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(le.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(r===null)return;let le=Y.near,Ee=Y.far;g.texture!==null&&(g.depthNear>0&&(le=g.depthNear),g.depthFar>0&&(Ee=g.depthFar)),G.near=w.near=R.near=le,G.far=w.far=R.far=Ee,(N!==G.near||O!==G.far)&&(r.updateRenderState({depthNear:G.near,depthFar:G.far}),N=G.near,O=G.far),G.layers.mask=Y.layers.mask|6,R.layers.mask=G.layers.mask&-5,w.layers.mask=G.layers.mask&-3;const De=Y.parent,me=G.cameras;k(G,De);for(let Ae=0;Ae<me.length;Ae++)k(me[Ae],De);G.projectionMatrix.copy(R.projectionMatrix),G.projectionMatrixInverse.copy(R.projectionMatrixInverse),F===null&&Y.isPerspectiveCamera&&(F={camera:Y,fov:Y.fov,zoom:Y.zoom}),K(Y,G,De)};function K(Y,le,Ee){Ee===null?Y.matrix.copy(le.matrixWorld):(Y.matrix.copy(Ee.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(le.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(le.projectionMatrix),Y.projectionMatrixInverse.copy(le.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=ua*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Y){l=Y,h!==null&&(h.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(G)},this.getCameraTexture=function(Y){return m[Y]};let $=null;function ae(Y,le){if(u=le.getViewerPose(c||a),v=le,u!==null){const Ee=u.views;f!==null&&(e.setRenderTargetFramebuffer(_,f.framebuffer),e.setRenderTarget(_));let De=!1;Ee.length!==G.cameras.length&&(G.cameras.length=0,De=!0);for(let Fe=0;Fe<Ee.length;Fe++){const je=Ee[Fe];let Ke=null;if(f!==null)Ke=f.getViewport(je);else{const he=p.getViewSubImage(h,je);Ke=he.viewport,Fe===0&&(e.setRenderTargetTextures(_,he.colorTexture,he.depthStencilTexture),e.setRenderTarget(_))}let ie=D[Fe];ie===void 0&&(ie=new rn,ie.layers.enable(Fe),ie.viewport=new vt,D[Fe]=ie),ie.matrix.fromArray(je.transform.matrix),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.projectionMatrix.fromArray(je.projectionMatrix),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert(),ie.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),Fe===0&&(G.matrix.copy(ie.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),De===!0&&G.cameras.push(ie)}const me=r.enabledFeatures;if(me&&me.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&E){p=n.getBinding();const Fe=p.getDepthInformation(Ee[0]);Fe&&Fe.isValid&&Fe.texture&&g.init(Fe,r.renderState)}if(me&&me.includes("camera-access")&&E){e.state.unbindTexture(),p=n.getBinding();for(let Fe=0;Fe<Ee.length;Fe++){const je=Ee[Fe].camera;if(je){let Ke=m[je];Ke||(Ke=new Il,m[je]=Ke);const ie=p.getCameraImage(je);Ke.sourceTexture=ie}}}}for(let Ee=0;Ee<C.length;Ee++){const De=A[Ee],me=C[Ee];De!==null&&me!==void 0&&me.update(De,le,c||a)}$&&$(Y,le),le.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:le}),v=null}const we=new Yl;we.setAnimationLoop(ae),this.setAnimationLoop=function(Y){$=Y},this.dispose=function(){}}}const B0=new gt,rc=new Ve;rc.set(-1,0,0,0,1,0,0,0,1);function z0(i,e){function t(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,jl(i)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function r(g,m,b,T,_){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?s(g,m):m.isMeshLambertMaterial?(s(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(s(g,m),p(g,m)):m.isMeshPhongMaterial?(s(g,m),u(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(s(g,m),h(g,m),m.isMeshPhysicalMaterial&&f(g,m,_)):m.isMeshMatcapMaterial?(s(g,m),v(g,m)):m.isMeshDepthMaterial?s(g,m):m.isMeshDistanceMaterial?(s(g,m),E(g,m)):m.isMeshNormalMaterial?s(g,m):m.isLineBasicMaterial?(a(g,m),m.isLineDashedMaterial&&o(g,m)):m.isPointsMaterial?l(g,m,b,T):m.isSpriteMaterial?c(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,t(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===Vt&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,t(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===Vt&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,t(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,t(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);const b=e.get(m),T=b.envMap,_=b.envMapRotation;T&&(g.envMap.value=T,g.envMapRotation.value.setFromMatrix4(B0.makeRotationFromEuler(_)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(rc),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,g.aoMapTransform))}function a(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform))}function o(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function l(g,m,b,T){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*b,g.scale.value=T*.5,m.map&&(g.map.value=m.map,t(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function c(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function u(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function p(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function h(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function f(g,m,b){g.ior.value=m.ior,m.diffuseRoughness>0&&(g.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(g.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,g.diffuseRoughnessMapTransform))),m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Vt&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,g.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,g.specularIntensityMapTransform))}function v(g,m){m.matcap&&(g.matcap.value=m.matcap)}function E(g,m){const b=e.get(m).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function k0(i,e,t,n){let r={},s={};function a(b,T){const _=T.program;n.uniformBlockBinding(b,_,r[b.id])}function o(b,T){let _=r[b.id];_===void 0&&(v(b),_=l(b),r[b.id]=_,b.addEventListener("dispose",g));const C=T.program;n.updateUBOMapping(b,C);const A=e.render.frame;s[b.id]!==A&&(c(b),s[b.id]=A)}function l(b){const T=i.createBuffer(),_=b.__size,C=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,_,C),i.bindBuffer(i.UNIFORM_BUFFER,null),T}function c(b){const T=r[b.id],_=b.uniforms,C=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let A=0,x=_.length;A<x;A++){const S=_[A];if(Array.isArray(S))for(let F=0,R=S.length;F<R;F++)u(S[F],A,F,C);else u(S,A,0,C)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(b,T,_,C){if(h(b,T,_,C)===!0){const A=b.__offset,x=b.value;if(Array.isArray(x)){let S=0;for(let F=0;F<x.length;F++){const R=x[F],w=E(R,!0);p(R,b.__data,S),S+=w.storage/Float32Array.BYTES_PER_ELEMENT}}else p(x,b.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,A,b.__data)}}function p(b,T,_){typeof b=="number"||typeof b=="boolean"?T[_]=b:b.isMatrix3?(T[_]=b.elements[0],T[_+1]=b.elements[1],T[_+2]=b.elements[2],T[_+3]=0,T[_+4]=b.elements[3],T[_+5]=b.elements[4],T[_+6]=b.elements[5],T[_+7]=0,T[_+8]=b.elements[6],T[_+9]=b.elements[7],T[_+10]=b.elements[8],T[_+11]=0):ArrayBuffer.isView(b)?T.set(b.subarray(0,T.length-_),_):b.toArray(T,_)}function h(b,T,_,C){const A=b.value,x=T+"_"+_;if(Array.isArray(A)){C[x]===void 0&&(C[x]=[]);const S=C[x];let F=!1;for(let R=0;R<A.length;R++)f(A[R],S,R)===!0&&(F=!0);return F}return f(A,C,x)}function f(b,T,_){if(T[_]===void 0)return typeof b=="number"||typeof b=="boolean"?T[_]=b:ArrayBuffer.isView(b)?T[_]=b.slice():T[_]=b.clone(),!0;{const C=T[_];if(typeof b=="number"||typeof b=="boolean"){if(C!==b)return T[_]=b,!0}else{if(ArrayBuffer.isView(b))return!0;if(C.equals(b)===!1)return C.copy(b),!0}}return!1}function v(b){const T=b.uniforms;let _=0;const C=16;for(let x=0,S=T.length;x<S;x++){const F=Array.isArray(T[x])?T[x]:[T[x]];for(let R=0,w=F.length;R<w;R++){const D=F[R],G=Array.isArray(D.value)?D.value:[D.value],N=Array.isArray(T[x])||Array.isArray(D.value);let O=_;for(let L=0,q=G.length;L<q;L++){const k=G[L],K=E(k,N),$=_%C,ae=$%K.boundary,we=$+ae;_+=ae,we!==0&&C-we<K.storage&&(_+=C-we),L===0&&(O=_),_+=K.storage}const H=D.type==="int"?Int32Array:D.type==="uint"?Uint32Array:Float32Array;D.__data=new H((_-O)/Float32Array.BYTES_PER_ELEMENT),D.__offset=O}}const A=_%C;return A>0&&(_+=C-A),b.__size=_,b.__cache={},this}function E(b,T){const _={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(_.boundary=4,_.storage=4):b.isVector2?(_.boundary=8,_.storage=8):b.isVector3||b.isColor?(_.boundary=16,_.storage=12):b.isVector4?(_.boundary=16,_.storage=16):b.isMatrix3?(_.boundary=16,_.storage=48):b.isMatrix4?(_.boundary=16,_.storage=64):b.isTexture?He("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(_.boundary=16,_.storage=b.byteLength):He("WebGLRenderer: Unsupported uniform value type.",b),T===!0&&(_.boundary=16,_.storage=Math.ceil(_.storage/16)*16),_}function g(b){const T=b.target;T.removeEventListener("dispose",g),i.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function m(){for(const b in r)i.deleteBuffer(r[b]);r={},s={}}return{bind:a,update:o,dispose:m}}const G0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let ln=null;function H0(){return ln===null&&(ln=new ru(G0,16,16,ei,pn),ln.name="DFG_LUT",ln.minFilter=Ht,ln.magFilter=Ht,ln.wrapS=Mn,ln.wrapT=Mn,ln.generateMipmaps=!1,ln.needsUpdate=!0),ln}class V0{constructor(e={}){const{canvas:t=Pd(),context:n=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:f=qt}=e;this.isWebGLRenderer=!0;let v;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=n.getContextAttributes().alpha}else v=a;const E=f,g=new Set([wa,Ta,Ea]),m=new Set([qt,fn,ji,bi,Ma,ba]),b=new Uint32Array(4),T=new Int32Array(4),_={textures:[],min:[],max:[],resolution:[]};let C=null,A=null;const x=[],S=[];let F=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=En,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let w=!1,D=null,G=null,N=null,O=null;this._outputColorSpace=Gt;let H=0,L=0,q=null,k=-1,K=null;const $=new vt,ae=new vt;let we=null;const Y=new ke(0);let le=0,Ee=t.width,De=t.height,me=1,Ae=null,lt=null;const Fe=new vt(0,0,Ee,De),je=new vt(0,0,Ee,De);let Ke=!1;const ie=new qi,he=new Pa;let ce=!1,Re=!1;const Se=new gt,Xe=new I,Ie=new vt,Qe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let et=!1;function st(){return q===null?me:1}let z=n;function yt(M,B){return t.getContext(M,B)}let Je,ht,xe,St,Be,Ge,P,y,j,re,ne,de,ve,Q,ee,fe,U,te,J,pe,oe,ue,Ue;try{const M={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${_a}`),t.addEventListener("webglcontextlost",Oe,!1),t.addEventListener("webglcontextrestored",qe,!1),t.addEventListener("webglcontextcreationerror",ye,!1),z===null){const B="webgl2";if(z=yt(B,M),z===null)throw yt(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ye()}catch(M){throw t.removeEventListener("webglcontextlost",Oe,!1),t.removeEventListener("webglcontextrestored",qe,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),at("WebGLRenderer: "+M.message),M}function Ye(){Je=new Xp(z),Je.init(),oe=new D0(z,Je),ht=new Up(z,Je,e,oe),xe=new L0(z,Je),ht.reversedDepthBuffer&&h&&xe.buffers.depth.setReversed(!0),G=z.createFramebuffer(),N=z.createFramebuffer(),O=z.createFramebuffer(),St=new Zp(z),Be=new x0,Ge=new N0(z,Je,xe,Be,ht,oe,St),P=new jp(R),y=new $u(z),ue=new Dp(z,y),j=new qp(z,y,St,ue),re=new Jp(z,j,y,ue,St),te=new $p(z,ht,Ge),ee=new Fp(Be),ne=new g0(R,P,Je,ht,ue,ee),de=new z0(R,Be),ve=new _0,Q=new T0(Je),U=new Np(R,P,xe,re,v,l),fe=new P0(R,re,ht),Ue=new k0(z,St,ht,xe),J=new Ip(z,Je,St),pe=new Yp(z,Je,St),St.programs=ne.programs,R.capabilities=ht,R.extensions=Je,R.properties=Be,R.renderLists=ve,R.shadowMap=fe,R.state=xe,R.info=St}E!==qt&&(F=new Qp(E,t.width,t.height,o,r,s));const se=new O0(R,z);this.xr=se,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const M=Je.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=Je.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return me},this.setPixelRatio=function(M){M!==void 0&&(me=M,this.setSize(Ee,De,!1))},this.getSize=function(M){return M.set(Ee,De)},this.setSize=function(M,B,Z=!0){if(se.isPresenting){He("WebGLRenderer: Can't change size while VR device is presenting.");return}Ee=M,De=B,t.width=Math.floor(M*me),t.height=Math.floor(B*me),Z===!0&&(t.style.width=M+"px",t.style.height=B+"px"),F!==null&&F.setSize(t.width,t.height),this.setViewport(0,0,M,B)},this.getDrawingBufferSize=function(M){return M.set(Ee*me,De*me).floor()},this.setDrawingBufferSize=function(M,B,Z){Ee=M,De=B,me=Z,t.width=Math.floor(M*Z),t.height=Math.floor(B*Z),this.setViewport(0,0,M,B)},this.setEffects=function(M){if(E===qt){at("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let B=0;B<M.length;B++)if(M[B].isOutputPass===!0){He("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}F.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy($)},this.getViewport=function(M){return M.copy(Fe)},this.setViewport=function(M,B,Z,W){M.isVector4?Fe.set(M.x,M.y,M.z,M.w):Fe.set(M,B,Z,W),xe.viewport($.copy(Fe).multiplyScalar(st()).round())},this.getScissor=function(M){return M.copy(je)},this.setScissor=function(M,B,Z,W){M.isVector4?je.set(M.x,M.y,M.z,M.w):je.set(M,B,Z,W),xe.scissor(ae.copy(je).multiplyScalar(st()).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(M){xe.setScissorTest(Ke=M)},this.setOpaqueSort=function(M){Ae=M},this.setTransparentSort=function(M){lt=M},this.getClearColor=function(M){return M.copy(U.getClearColor())},this.setClearColor=function(){U.setClearColor(...arguments)},this.getClearAlpha=function(){return U.getClearAlpha()},this.setClearAlpha=function(){U.setClearAlpha(...arguments)},this.clear=function(M=!0,B=!0,Z=!0){let W=0;if(M){let X=!1;if(q!==null){const _e=q.texture.format;X=g.has(_e)}if(X){const _e=q.texture.type,Ce=m.has(_e),ge=U.getClearColor(),Te=U.getClearAlpha(),Ne=ge.r,We=ge.g,tt=ge.b;Ce?(b[0]=Ne,b[1]=We,b[2]=tt,b[3]=Te,z.clearBufferuiv(z.COLOR,0,b)):(T[0]=Ne,T[1]=We,T[2]=tt,T[3]=Te,z.clearBufferiv(z.COLOR,0,T))}else W|=z.COLOR_BUFFER_BIT}B&&(W|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(W|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&z.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),D=M},this.dispose=function(){t.removeEventListener("webglcontextlost",Oe,!1),t.removeEventListener("webglcontextrestored",qe,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),U.dispose(),ve.dispose(),Q.dispose(),Ge.dispose(),Be.dispose(),P.dispose(),re.dispose(),j.dispose(),ue.dispose(),Ue.dispose(),ne.dispose(),se.dispose(),se.removeEventListener("sessionstart",Ha),se.removeEventListener("sessionend",Va),Vn.stop()};function Oe(M){M.preventDefault(),ro("WebGLRenderer: Context Lost."),w=!0}function qe(){ro("WebGLRenderer: Context Restored."),w=!1;const M=St.autoReset,B=fe.enabled,Z=fe.autoUpdate,W=fe.needsUpdate,X=fe.type;Ye(),St.autoReset=M,fe.enabled=B,fe.autoUpdate=Z,fe.needsUpdate=W,fe.type=X}function ye(M){at("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function ct(M){const B=M.target;B.removeEventListener("dispose",ct),At(B)}function At(M){An(M),Be.remove(M)}function An(M){const B=Be.get(M).programs;B!==void 0&&(B.forEach(function(Z){ne.releaseProgram(Z)}),M.isShaderMaterial&&ne.releaseShaderCache(M))}this.renderBufferDirect=function(M,B,Z,W,X,_e){B===null&&(B=Qe);const Ce=X.isMesh&&X.matrixWorld.determinantAffine()<0,ge=cc(M,B,Z,W,X);xe.setMaterial(W,Ce);let Te=Z.index,Ne=1;if(W.wireframe===!0){if(Te=j.getWireframeAttribute(Z),Te===void 0)return;Ne=2}const We=Z.drawRange,tt=Z.attributes.position;let Pe=We.start*Ne,nt=(We.start+We.count)*Ne;_e!==null&&(Pe=Math.max(Pe,_e.start*Ne),nt=Math.min(nt,(_e.start+_e.count)*Ne)),Te!==null?(Pe=Math.max(Pe,0),nt=Math.min(nt,Te.count)):tt!=null&&(Pe=Math.max(Pe,0),nt=Math.min(nt,tt.count));const Mt=nt-Pe;if(Mt<0||Mt===1/0)return;ue.setup(X,W,ge,Z,Te);let pt,ft=J;if(Te!==null&&(pt=y.get(Te),ft=pe,ft.setIndex(pt)),X.isMesh)W.wireframe===!0?(xe.setLineWidth(W.wireframeLinewidth*st()),ft.setMode(z.LINES)):ft.setMode(z.TRIANGLES);else if(X.isLine){let Nt=W.linewidth;Nt===void 0&&(Nt=1),xe.setLineWidth(Nt*st()),X.isLineSegments?ft.setMode(z.LINES):X.isLineLoop?ft.setMode(z.LINE_LOOP):ft.setMode(z.LINE_STRIP)}else X.isPoints?ft.setMode(z.POINTS):X.isSprite&&ft.setMode(z.TRIANGLES);if(X.isBatchedMesh)if(Je.get("WEBGL_multi_draw"))ft.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const Nt=X._multiDrawStarts,Le=X._multiDrawCounts,zt=X._multiDrawCount,ot=Te?y.get(Te).bytesPerElement:1,Wn=Be.get(W).currentProgram.getUniforms();for(let Dt=0;Dt<zt;Dt++)Wn.setValue(z,"_gl_DrawID",Dt),ft.render(Nt[Dt]/ot,Le[Dt])}else if(X.isInstancedMesh)ft.renderInstances(Pe,Mt,X.count);else if(Z.isInstancedBufferGeometry){const Nt=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Le=Math.min(Z.instanceCount,Nt);ft.renderInstances(Pe,Mt,Le)}else ft.render(Pe,Mt)};function Ga(M,B,Z,W){D!==null&&M.isNodeMaterial&&D.setObject(W,M),ce===!0&&ee.setState(M,Z,!1),M.transparent===!0&&M.side===Ft&&M.forceSinglePass===!1?(M.side=Vt,M.needsUpdate=!0,Li(M,B,W),M.side=Kn,M.needsUpdate=!0,Li(M,B,W),M.side=Ft):Li(M,B,W)}this.compile=function(M,B,Z=null){Z===null&&(Z=M),D!==null&&D.renderStart(M,B,Z),A=Q.get(Z),A.init(B),S.push(A),Z.traverseVisible(function(X){X.isLight&&X.layers.test(B.layers)&&(A.pushLight(X),X.castShadow&&A.pushShadow(X))}),M!==Z&&M.traverseVisible(function(X){X.isLight&&X.layers.test(B.layers)&&(A.pushLight(X),X.castShadow&&A.pushShadow(X))}),A.setupLights(),D!==null&&D.updateLights(A.state.lightsArray),Re=this.localClippingEnabled,ce=ee.init(this.clippingPlanes,Re),ce===!0&&ee.setGlobalState(this.clippingPlanes,B),D!==null&&fe.render(A.state.shadowsArray,Z,B);const W=new Set;return M.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const _e=X.material;if(_e)if(Array.isArray(_e))for(let Ce=0;Ce<_e.length;Ce++){const ge=_e[Ce];Ga(ge,Z,B,X),W.add(ge)}else Ga(_e,Z,B,X),W.add(_e)}),A=S.pop(),D!==null&&D.renderEnd(),W},this.compileAsync=function(M,B,Z=null){const W=this.compile(M,B,Z);return new Promise(X=>{function _e(){if(W.forEach(function(Ce){const Te=Be.get(Ce).currentProgram;(Te===void 0||Te.isReady())&&W.delete(Ce)}),W.size===0){X(M);return}setTimeout(_e,10)}Je.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let Vr=null;function oc(M){Vr&&Vr(M)}function Ha(){Vn.stop()}function Va(){Vn.start()}const Vn=new Yl;Vn.setAnimationLoop(oc),typeof self<"u"&&Vn.setContext(self),this.setAnimationLoop=function(M){Vr=M,se.setAnimationLoop(M),M===null?Vn.stop():Vn.start()},se.addEventListener("sessionstart",Ha),se.addEventListener("sessionend",Va),this.render=function(M,B){if(B!==void 0&&B.isCamera!==!0){at("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;D!==null&&D.renderStart(M,B);const Z=se.enabled===!0&&se.isPresenting===!0,W=F!==null&&(q===null||Z)&&F.begin(R,q);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),se.enabled===!0&&se.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(se.cameraAutoUpdate===!0&&se.updateCamera(B),B=se.getCamera()),M.isScene===!0&&M.onBeforeRender(R,M,B,q),A=Q.get(M,S.length),A.init(B),A.state.textureUnits=Ge.getTextureUnits(),S.push(A),Se.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),B.isArrayCamera?he.setFromArrayCamera(B):ie.setFromProjectionMatrix(Se,an,B.reversedDepth),Re=this.localClippingEnabled,ce=ee.init(this.clippingPlanes,Re),C=ve.get(M,x.length),C.init(),x.push(C),this.info.render.frame++,se.enabled===!0&&se.isPresenting===!0){const Ce=R.xr.getDepthSensingMesh();Ce!==null&&Wr(Ce,B,-1/0,R.sortObjects)}Wr(M,B,0,R.sortObjects),C.finish(),D!==null&&D.updateLights(A.state.lightsArray),R.sortObjects===!0&&C.sort(Ae,lt),et=se.enabled===!1||se.isPresenting===!1||se.hasDepthSensing()===!1,et&&U.addToRenderList(C,M),this.info.autoReset===!0&&this.info.reset(),ce===!0&&ee.beginShadows();const X=A.state.shadowsArray;if(fe.render(X,M,B),ce===!0&&ee.endShadows(),(W&&F.hasRenderPass())===!1){const Ce=C.opaque,ge=C.transmissive;if(A.setupLights(),B.isArrayCamera){const Te=B.cameras;if(ge.length>0)for(let Ne=0,We=Te.length;Ne<We;Ne++){const tt=Te[Ne];ja(Ce,ge,M,tt)}et&&U.render(M);for(let Ne=0,We=Te.length;Ne<We;Ne++){const tt=Te[Ne];Wa(C,M,tt,tt.viewport)}}else ge.length>0&&ja(Ce,ge,M,B),et&&U.render(M),Wa(C,M,B)}q!==null&&L===0&&(Ge.updateMultisampleRenderTarget(q),Ge.updateRenderTargetMipmap(q)),W&&F.end(R),M.isScene===!0&&M.onAfterRender(R,M,B),ue.resetDefaultState(),k=-1,K=null,S.pop(),S.length>0?(A=S[S.length-1],Ge.setTextureUnits(A.state.textureUnits),ce===!0&&ee.setGlobalState(R.clippingPlanes,A.state.camera)):A=null,x.pop(),x.length>0?C=x[x.length-1]:C=null,D!==null&&D.renderEnd()};function Wr(M,B,Z,W){if(M.visible===!1)return;if(M.layers.test(B.layers)){if(M.isGroup)Z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(B);else if(M.isLight)A.pushLight(M),M.castShadow&&A.pushShadow(M);else if(M.isSprite){const Ce=B.isArrayCamera?he:ie;if(!M.frustumCulled||M.intersectsFrustum(Ce)){W&&Ie.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Se);const ge=re.update(M),Te=M.material;Te.visible&&C.push(M,ge,Te,Z,Ie.z,null,B)}}else if(M.isMesh||M.isLine||M.isPoints){const Ce=B.isArrayCamera?he:ie;if(!M.frustumCulled||M.intersectsFrustum(Ce)){const ge=re.update(M),Te=M.material;if(W&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ie.copy(M.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),Ie.copy(ge.boundingSphere.center)),Ie.applyMatrix4(M.matrixWorld).applyMatrix4(Se)),Array.isArray(Te)){const Ne=ge.groups;for(let We=0,tt=Ne.length;We<tt;We++){const Pe=Ne[We],nt=Te[Pe.materialIndex];nt&&nt.visible&&C.push(M,ge,nt,Z,Ie.z,Pe,B)}}else Te.visible&&C.push(M,ge,Te,Z,Ie.z,null,B)}}}const _e=M.children;for(let Ce=0,ge=_e.length;Ce<ge;Ce++)Wr(_e[Ce],B,Z,W)}function Wa(M,B,Z,W){const{opaque:X,transmissive:_e,transparent:Ce}=M;A.setupLightsView(Z),ce===!0&&ee.setGlobalState(R.clippingPlanes,Z),W&&xe.viewport($.copy(W)),X.length>0&&tr(X,B,Z),_e.length>0&&tr(_e,B,Z),Ce.length>0&&tr(Ce,B,Z),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function ja(M,B,Z,W){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[W.id]===void 0){const Pe=Je.has("EXT_color_buffer_half_float")||Je.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[W.id]=new hn(1,1,{generateMipmaps:!0,type:Pe?pn:qt,minFilter:On,samples:Math.max(4,ht.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:it.workingColorSpace})}const _e=A.state.transmissionRenderTarget[W.id],Ce=W.viewport||$;_e.setSize(Ce.z*R.transmissionResolutionScale,Ce.w*R.transmissionResolutionScale);const ge=R.getRenderTarget(),Te=R.getActiveCubeFace(),Ne=R.getActiveMipmapLevel();R.setRenderTarget(_e),R.getClearColor(Y),le=R.getClearAlpha(),le<1&&R.setClearColor(16777215,.5),R.clear(),et&&U.render(Z);const We=R.toneMapping;R.toneMapping=En;const tt=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),A.setupLightsView(W),ce===!0&&ee.setGlobalState(R.clippingPlanes,W),tr(M,Z,W),Ge.updateMultisampleRenderTarget(_e),Ge.updateRenderTargetMipmap(_e),Je.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let nt=0,Mt=B.length;nt<Mt;nt++){const pt=B[nt],{object:ft,geometry:Nt,material:Le,group:zt}=pt;if(Le.side===Ft&&ft.layers.test(W.layers)){const ot=Le.side;Le.side=Vt,Le.needsUpdate=!0,Xa(ft,Z,W,Nt,Le,zt),Le.side=ot,Le.needsUpdate=!0,Pe=!0}}Pe===!0&&(Ge.updateMultisampleRenderTarget(_e),Ge.updateRenderTargetMipmap(_e))}R.setRenderTarget(ge,Te,Ne),R.setClearColor(Y,le),tt!==void 0&&(W.viewport=tt),R.toneMapping=We}function tr(M,B,Z){const W=B.isScene===!0?B.overrideMaterial:null;for(let X=0,_e=M.length;X<_e;X++){const Ce=M[X],{object:ge,geometry:Te,group:Ne}=Ce;let We=Ce.material;We.allowOverride===!0&&W!==null&&(We=W),ge.layers.test(Z.layers)&&Xa(ge,B,Z,Te,We,Ne)}}function Xa(M,B,Z,W,X,_e){D!==null&&X.isNodeMaterial&&D.setObject(M,X),M.onBeforeRender(R,B,Z,W,X,_e),M.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),X.onBeforeRender(R,B,Z,W,M,_e),X.transparent===!0&&X.side===Ft&&X.forceSinglePass===!1?(X.side=Vt,X.needsUpdate=!0,R.renderBufferDirect(Z,B,W,X,M,_e),X.side=Kn,X.needsUpdate=!0,R.renderBufferDirect(Z,B,W,X,M,_e),X.side=Ft):R.renderBufferDirect(Z,B,W,X,M,_e),M.onAfterRender(R,B,Z,W,X,_e)}function qa(M){let B=0;for(const Z of M)Z.texture!==null&&B++;return B}function Li(M,B,Z){B.isScene!==!0&&(B=Qe);const W=Be.get(M),X=A.state.lights,_e=A.state.shadowsArray,Ce=X.state.version,ge=ne.getParameters(M,X.state,_e,B,Z,A.state.lightProbeGridArray),Te=ne.getProgramCacheKey(ge);let Ne=W.programs;W.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?B.environment:null,W.fog=B.fog;const We=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;W.envMap=P.get(M.envMap||W.environment,We),W.envMapRotation=W.environment!==null&&M.envMap===null?B.environmentRotation:M.envMapRotation,Ne===void 0&&(M.addEventListener("dispose",ct),Ne=new Map,W.programs=Ne,W.programVariants=new Map);let tt=Ne.get(Te);if(tt!==void 0){if(W.currentProgram===tt&&W.lightsStateVersion===Ce)return Za(M,ge),tt}else ge.uniforms=ne.getUniforms(M),D!==null&&M.isNodeMaterial&&D.build(M,Z,ge),M.onBeforeCompile(ge,R),tt=ne.acquireProgram(ge,Te),Ne.set(Te,tt),W.uniforms=ge.uniforms;const Pe=W.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Pe.clippingPlanes=ee.uniform),Za(M,ge),W.needsLights=uc(M),W.lightsStateVersion=Ce,W.needsLights&&(Pe.ambientLightColor.value=X.state.ambient,Pe.lightProbe.value=X.state.probe,Pe.sunLights.value=X.state.sun,Pe.sunLightShadows.value=X.state.sunShadow,Pe.directionalLights.value=X.state.directional,Pe.directionalLightShadows.value=X.state.directionalShadow,Pe.spotLights.value=X.state.spot,Pe.spotLightShadows.value=X.state.spotShadow,Pe.rectAreaLights.value=X.state.rectArea,Pe.ltc_1.value=X.state.rectAreaLTC1,Pe.ltc_2.value=X.state.rectAreaLTC2,Pe.pointLights.value=X.state.point,Pe.pointLightShadows.value=X.state.pointShadow,Pe.hemisphereLights.value=X.state.hemi,Pe.sunShadowMatrix.value=X.state.sunShadowMatrix,Pe.sunShadowCascade.value=X.state.sunShadowCascade,Pe.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Pe.spotLightMatrix.value=X.state.spotLightMatrix,Pe.spotLightMap.value=X.state.spotLightMap,Pe.pointShadowMatrix.value=X.state.pointShadowMatrix),W.numLightProbeGrids=qa(A.state.lightProbeGridArray),W.currentProgram=tt,W.uniformsList=null,tt}function lc(M,B,Z,W,X){const _e=Be.get(M),Ce=_e.currentProgram.id+","+W+","+X;let ge=_e.programVariants.get(Ce);return ge===void 0?(ge=Li(M,B,Z),_e.programVariants.set(Ce,ge)):(_e.currentProgram=ge,_e.uniformsList=null,_e.outputColorSpace=W,_e.toneMapping=X),ge}function Ya(M){if(M.uniformsList===null){const B=M.currentProgram.getUniforms();M.uniformsList=Nr.seqWithValue(B.seq,M.uniforms)}return M.uniformsList}function Za(M,B){const Z=Be.get(M);Z.outputColorSpace=B.outputColorSpace,Z.batching=B.batching,Z.batchingColor=B.batchingColor,Z.instancing=B.instancing,Z.instancingColor=B.instancingColor,Z.instancingMorph=B.instancingMorph,Z.skinning=B.skinning,Z.morphTargets=B.morphTargets,Z.morphNormals=B.morphNormals,Z.morphColors=B.morphColors,Z.morphTargetsCount=B.morphTargetsCount,Z.numClippingPlanes=B.numClippingPlanes,Z.numIntersection=B.numClipIntersection,Z.vertexAlphas=B.vertexAlphas,Z.vertexTangents=B.vertexTangents,Z.toneMapping=B.toneMapping}function cc(M,B,Z,W,X){B.isScene!==!0&&(B=Qe),Ge.resetTextureUnits();const _e=B.fog,Ce=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?B.environment:null,ge=q===null?R.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:it.workingColorSpace,Te=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Ne=P.get(W.envMap||Ce,Te),We=W.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,tt=!!Z.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Pe=!!Z.morphAttributes.position,nt=!!Z.morphAttributes.normal,Mt=!!Z.morphAttributes.color;let pt=En;W.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(pt=R.toneMapping);const ft=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Nt=ft!==void 0?ft.length:0,Le=Be.get(W),zt=A.state.lights;if(ce===!0&&(Re===!0||M!==K)){const xt=M===K&&W.id===k;ee.setState(W,M,xt)}let ot=!1,Wn=!1;W.version===Le.__version?Le.needsLights&&Le.lightsStateVersion!==zt.state.version||X.isBatchedMesh&&Le.batching===!1||!X.isBatchedMesh&&Le.batching===!0||X.isBatchedMesh&&Le.batchingColor===!0&&X._colorsTexture===null||X.isBatchedMesh&&Le.batchingColor===!1&&X._colorsTexture!==null||X.isInstancedMesh&&Le.instancing===!1||!X.isInstancedMesh&&Le.instancing===!0||X.isSkinnedMesh&&Le.skinning===!1||!X.isSkinnedMesh&&Le.skinning===!0||X.isInstancedMesh&&Le.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Le.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Le.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Le.instancingMorph===!1&&X.morphTexture!==null||Le.envMap!==Ne||W.fog===!0&&Le.fog!==_e||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==ee.numPlanes||Le.numIntersection!==ee.numIntersection)||Le.vertexAlphas!==We||Le.vertexTangents!==tt||Le.morphTargets!==Pe||Le.morphNormals!==nt||Le.morphColors!==Mt||Le.morphTargetsCount!==Nt||Le.numLightProbeGrids!==qa(A.state.lightProbeGridArray)?ot=!0:(Le.outputColorSpace!==ge||Le.toneMapping!==pt)&&(Wn=!0):(ot=!0,Le.__version=W.version);let Dt=Le.currentProgram;(ot===!0||Wn===!0)&&(Dt=Wn===!0?lc(W,B,X,ge,pt):Li(W,B,X),D&&W.isNodeMaterial&&D.onUpdateProgram(W,Dt,Le));let nr=!1,Rn=!1,jn=!1;const rt=Dt.getUniforms(),Pt=Le.uniforms;if(xe.useProgram(Dt.program)&&(nr=!0,Rn=!0,jn=!0),W.id!==k&&(k=W.id,Rn=!0),nr||K!==M){xe.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),rt.setValue(z,"projectionMatrix",M.projectionMatrix),rt.setValue(z,"viewMatrix",M.matrixWorldInverse);const Rt=rt.map.cameraPosition;Rt!==void 0&&Rt.setValue(z,Xe.setFromMatrixPosition(M.matrixWorld)),ht.logarithmicDepthBuffer&&rt.setValue(z,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&rt.setValue(z,"isOrthographic",M.isOrthographicCamera===!0),K!==M&&(K=M,Rn=!0,jn=!0)}if(Le.needsLights&&(zt.state.sunShadowMap.length>0&&rt.setValue(z,"sunShadowMap",zt.state.sunShadowMap,Ge),zt.state.directionalShadowMap.length>0&&rt.setValue(z,"directionalShadowMap",zt.state.directionalShadowMap,Ge),zt.state.spotShadowMap.length>0&&rt.setValue(z,"spotShadowMap",zt.state.spotShadowMap,Ge),zt.state.pointShadowMap.length>0&&rt.setValue(z,"pointShadowMap",zt.state.pointShadowMap,Ge)),X.isSkinnedMesh){rt.setOptional(z,X,"bindMatrix"),rt.setOptional(z,X,"bindMatrixInverse");const xt=X.skeleton;xt&&(xt.boneTexture===null&&xt.computeBoneTexture(),rt.setValue(z,"boneTexture",xt.boneTexture,Ge))}X.isBatchedMesh&&(rt.setOptional(z,X,"batchingTexture"),rt.setValue(z,"batchingTexture",X._matricesTexture,Ge),rt.setOptional(z,X,"batchingIdTexture"),rt.setValue(z,"batchingIdTexture",X._indirectTexture,Ge),rt.setOptional(z,X,"batchingColorTexture"),X._colorsTexture!==null&&rt.setValue(z,"batchingColorTexture",X._colorsTexture,Ge));const Qt=Z.morphAttributes;if((Qt.position!==void 0||Qt.normal!==void 0||Qt.color!==void 0)&&te.update(X,Z,Dt),(Rn||Le.receiveShadow!==X.receiveShadow)&&(Le.receiveShadow=X.receiveShadow,rt.setValue(z,"receiveShadow",X.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&B.environment!==null&&(Pt.envMapIntensity.value=B.environmentIntensity),Pt.dfgLUT!==void 0&&(Pt.dfgLUT.value=H0()),Rn){if(rt.setValue(z,"toneMappingExposure",R.toneMappingExposure),Le.needsLights&&dc(Pt,jn),_e&&W.fog===!0&&de.refreshFogUniforms(Pt,_e),de.refreshMaterialUniforms(Pt,W,me,De,A.state.transmissionRenderTarget[M.id]),Le.needsLights&&Le.numLightProbeGrids>0){const xt=_;let Rt=0;for(const gn of A.state.lightProbeGridArray)gn.texture!==null&&(xt.textures[Rt]=gn.texture,xt.min[Rt]=gn.boundingBox.min,xt.max[Rt]=gn.boundingBox.max,xt.resolution[Rt]=gn.resolution,Rt++);for(const gn in xt)xt[gn].length=Rt;Pt.probesSH.value=xt.textures,Pt.probesMin.value=xt.min,Pt.probesMax.value=xt.max,Pt.probesResolution.value=xt.resolution}Nr.upload(z,Ya(Le),Pt,Ge)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Nr.upload(z,Ya(Le),Pt,Ge),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&rt.setValue(z,"center",X.center),rt.setValue(z,"modelViewMatrix",X.modelViewMatrix),rt.setValue(z,"normalMatrix",X.normalMatrix),rt.setValue(z,"modelMatrix",X.matrixWorld),W.uniformsGroups!==void 0){const xt=W.uniformsGroups;for(let Rt=0,gn=xt.length;Rt<gn;Rt++){const Ja=xt[Rt];Ue.update(Ja,Dt),Ue.bind(Ja,Dt)}}return Dt}function dc(M,B){M.ambientLightColor.needsUpdate=B,M.lightProbe.needsUpdate=B,M.sunLights.needsUpdate=B,M.sunLightShadows.needsUpdate=B,M.directionalLights.needsUpdate=B,M.directionalLightShadows.needsUpdate=B,M.pointLights.needsUpdate=B,M.pointLightShadows.needsUpdate=B,M.spotLights.needsUpdate=B,M.spotLightShadows.needsUpdate=B,M.rectAreaLights.needsUpdate=B,M.hemisphereLights.needsUpdate=B}function uc(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(M,B,Z){const W=Be.get(M);W.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),Be.get(M.texture).__webglTexture=B,Be.get(M.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:Z,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,B){const Z=Be.get(M);Z.__webglFramebuffer=B,Z.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(M,B=0,Z=0){q=M,H=B,L=Z;let W=null,X=!1,_e=!1;if(M){const ge=Be.get(M);if(ge.__useDefaultFramebuffer!==void 0){xe.bindFramebuffer(z.FRAMEBUFFER,ge.__webglFramebuffer),$.copy(M.viewport),ae.copy(M.scissor),we=M.scissorTest,xe.viewport($),xe.scissor(ae),xe.setScissorTest(we),k=-1;return}else if(ge.__webglFramebuffer===void 0)Ge.setupRenderTarget(M);else if(ge.__hasExternalTextures)Ge.rebindTextures(M,Be.get(M.texture).__webglTexture,Be.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const We=M.depthTexture;if(ge.__boundDepthTexture!==We){if(We!==null&&Be.has(We)&&(M.width!==We.image.width||M.height!==We.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Ge.setupDepthRenderbuffer(M)}}const Te=M.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(_e=!0);const Ne=Be.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ne[B])?W=Ne[B][Z]:W=Ne[B],X=!0):M.samples>0&&Ge.useMultisampledRTT(M)===!1?W=Be.get(M).__webglMultisampledFramebuffer:Array.isArray(Ne)?W=Ne[Z]:W=Ne,$.copy(M.viewport),ae.copy(M.scissor),we=M.scissorTest}else $.copy(Fe).multiplyScalar(me).floor(),ae.copy(je).multiplyScalar(me).floor(),we=Ke;if(Z!==0&&(W=G),xe.bindFramebuffer(z.FRAMEBUFFER,W)&&xe.drawBuffers(M,W),xe.viewport($),xe.scissor(ae),xe.setScissorTest(we),X){const ge=Be.get(M.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+B,ge.__webglTexture,Z)}else if(_e){const ge=B;for(let Te=0;Te<M.textures.length;Te++){const Ne=Be.get(M.textures[Te]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+Te,Ne.__webglTexture,Z,ge)}}else if(M!==null&&Z!==0){const ge=Be.get(M.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,ge.__webglTexture,Z)}k=-1};function $a(M){const B=Be.get(M);return(B.__readFormat!==M.format||B.__readType!==M.type)&&(B.__readFormat=M.format,B.__readType=M.type,B.__formatReadable=ht.textureFormatReadable(M.format),B.__typeReadable=ht.textureTypeReadable(M.type)),B}this.readRenderTargetPixels=function(M,B,Z,W,X,_e,Ce,ge=0){if(!(M&&M.isWebGLRenderTarget)){at("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=Be.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ce!==void 0&&(Te=Te[Ce],Array.isArray(Te)&&(Te=Te[0])),Te){xe.bindFramebuffer(z.FRAMEBUFFER,Te);try{const Ne=M.textures[ge],We=Ne.format,tt=Ne.type;M.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+ge);const Pe=$a(Ne);if(Pe.__formatReadable===!1){at("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pe.__typeReadable===!1){at("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=M.width-W&&Z>=0&&Z<=M.height-X&&z.readPixels(B,Z,W,X,oe.convert(We),oe.convert(tt),_e)}finally{const Ne=q!==null?Be.get(q).__webglFramebuffer:null;xe.bindFramebuffer(z.FRAMEBUFFER,Ne)}}},this.readRenderTargetPixelsAsync=async function(M,B,Z,W,X,_e,Ce,ge=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=Be.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ce!==void 0&&(Te=Te[Ce],Array.isArray(Te)&&(Te=Te[0])),Te)if(B>=0&&B<=M.width-W&&Z>=0&&Z<=M.height-X){xe.bindFramebuffer(z.FRAMEBUFFER,Te);const Ne=M.textures[ge],We=Ne.format,tt=Ne.type;M.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+ge);const Pe=$a(Ne);if(Pe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const nt=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,nt),z.bufferData(z.PIXEL_PACK_BUFFER,_e.byteLength,z.STREAM_READ),z.readPixels(B,Z,W,X,oe.convert(We),oe.convert(tt),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);const Mt=q!==null?Be.get(q).__webglFramebuffer:null;xe.bindFramebuffer(z.FRAMEBUFFER,Mt);const pt=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await Ld(z,pt,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,nt),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,_e),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(nt),z.deleteSync(pt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,B=null,Z=0){const W=Math.pow(2,-Z),X=Math.floor(M.image.width*W),_e=Math.floor(M.image.height*W),Ce=B!==null?B.x:0,ge=B!==null?B.y:0;Ge.setTexture2D(M,0),z.copyTexSubImage2D(z.TEXTURE_2D,Z,0,0,Ce,ge,X,_e),xe.unbindTexture()},this.copyTextureToTexture=function(M,B,Z=null,W=null,X=0,_e=0){let Ce,ge,Te,Ne,We,tt,Pe,nt,Mt;const pt=M.isCompressedTexture?M.mipmaps[_e]:M.image;if(Z!==null)Ce=Z.max.x-Z.min.x,ge=Z.max.y-Z.min.y,Te=Z.isBox3?Z.max.z-Z.min.z:1,Ne=Z.min.x,We=Z.min.y,tt=Z.isBox3?Z.min.z:0;else{const rt=Math.pow(2,-X);Ce=Math.floor(pt.width*rt),ge=Math.floor(pt.height*rt),M.isDataArrayTexture?Te=pt.depth:M.isData3DTexture?Te=Math.floor(pt.depth*rt):Te=1,Ne=0,We=0,tt=0}W!==null?(Pe=W.x,nt=W.y,Mt=W.z):(Pe=0,nt=0,Mt=0);const ft=oe.convert(B.format),Nt=oe.convert(B.type);let Le;B.isData3DTexture?(Ge.setTexture3D(B,0),Le=z.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(Ge.setTexture2DArray(B,0),Le=z.TEXTURE_2D_ARRAY):(Ge.setTexture2D(B,0),Le=z.TEXTURE_2D),xe.activeTexture(z.TEXTURE0),xe.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,B.flipY),xe.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),xe.pixelStorei(z.UNPACK_ALIGNMENT,B.unpackAlignment);const zt=xe.getParameter(z.UNPACK_ROW_LENGTH),ot=xe.getParameter(z.UNPACK_IMAGE_HEIGHT),Wn=xe.getParameter(z.UNPACK_SKIP_PIXELS),Dt=xe.getParameter(z.UNPACK_SKIP_ROWS),nr=xe.getParameter(z.UNPACK_SKIP_IMAGES);xe.pixelStorei(z.UNPACK_ROW_LENGTH,pt.width),xe.pixelStorei(z.UNPACK_IMAGE_HEIGHT,pt.height),xe.pixelStorei(z.UNPACK_SKIP_PIXELS,Ne),xe.pixelStorei(z.UNPACK_SKIP_ROWS,We),xe.pixelStorei(z.UNPACK_SKIP_IMAGES,tt);const Rn=M.isDataArrayTexture||M.isData3DTexture,jn=B.isDataArrayTexture||B.isData3DTexture;if(M.isDepthTexture){const rt=Be.get(M),Pt=Be.get(B),Qt=Be.get(rt.__renderTarget),xt=Be.get(Pt.__renderTarget);xe.bindFramebuffer(z.READ_FRAMEBUFFER,Qt.__webglFramebuffer),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,xt.__webglFramebuffer);for(let Rt=0;Rt<Te;Rt++)Rn&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Be.get(M).__webglTexture,X,tt+Rt),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Be.get(B).__webglTexture,_e,Mt+Rt)),z.blitFramebuffer(Ne,We,Ne+Ce,We+ge,Pe,nt,Pe+Ce,nt+ge,z.DEPTH_BUFFER_BIT,z.NEAREST);xe.bindFramebuffer(z.READ_FRAMEBUFFER,null),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(X!==0||M.isRenderTargetTexture||Be.has(M)){const rt=Be.get(M),Pt=Be.get(B);xe.bindFramebuffer(z.READ_FRAMEBUFFER,N),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,O);for(let Qt=0;Qt<Te;Qt++)Rn?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,rt.__webglTexture,X,tt+Qt):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,rt.__webglTexture,X),jn?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Pt.__webglTexture,_e,Mt+Qt):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,Pt.__webglTexture,_e),X!==0?z.blitFramebuffer(Ne,We,Ne+Ce,We+ge,Pe,nt,Pe+Ce,nt+ge,z.COLOR_BUFFER_BIT,z.NEAREST):jn?z.copyTexSubImage3D(Le,_e,Pe,nt,Mt+Qt,Ne,We,Ce,ge):z.copyTexSubImage2D(Le,_e,Pe,nt,Ne,We,Ce,ge);xe.bindFramebuffer(z.READ_FRAMEBUFFER,null),xe.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else jn?M.isDataTexture||M.isData3DTexture?z.texSubImage3D(Le,_e,Pe,nt,Mt,Ce,ge,Te,ft,Nt,pt.data):B.isCompressedArrayTexture?z.compressedTexSubImage3D(Le,_e,Pe,nt,Mt,Ce,ge,Te,ft,pt.data):z.texSubImage3D(Le,_e,Pe,nt,Mt,Ce,ge,Te,ft,Nt,pt):M.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,_e,Pe,nt,Ce,ge,ft,Nt,pt.data):M.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,_e,Pe,nt,pt.width,pt.height,ft,pt.data):z.texSubImage2D(z.TEXTURE_2D,_e,Pe,nt,Ce,ge,ft,Nt,pt);xe.pixelStorei(z.UNPACK_ROW_LENGTH,zt),xe.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ot),xe.pixelStorei(z.UNPACK_SKIP_PIXELS,Wn),xe.pixelStorei(z.UNPACK_SKIP_ROWS,Dt),xe.pixelStorei(z.UNPACK_SKIP_IMAGES,nr),_e===0&&B.generateMipmaps===!0&&B.mipmapsAutoUpdate===!0&&z.generateMipmap(Le),xe.unbindTexture()},this.initRenderTarget=function(M){Be.get(M).__webglFramebuffer===void 0&&Ge.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Ge.setTextureCube(M,0):M.isData3DTexture?Ge.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Ge.setTexture2DArray(M,0):Ge.setTexture2D(M,0),xe.unbindTexture()},this.resetState=function(){H=0,L=0,q=null,xe.reset(),ue.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return an}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=it._getDrawingBufferColorSpace(e),t.unpackColorSpace=it._getUnpackColorSpace()}}function W0(i,e="warm"){const t=new Ji(i);t.compileEquirectangularShader();const n=new Cl,r={warm:{bg:1709844,topLight:16775399,keyLight:16768926,rimLight:16777215,fillLight:10405375,groundBounce:6048056},stadium:{bg:725790,topLight:15135487,keyLight:16777215,rimLight:7386623,fillLight:3731325,groundBounce:1981476},dramatic:{bg:394760,topLight:16765565,keyLight:16756276,rimLight:16777215,fillLight:4473941,groundBounce:2759694}},s=r[e]||r.warm;n.background=new ke(s.bg);const a=new bn(10,10),o=new be(a,new $n({color:s.topLight,side:Ft}));o.position.set(0,9,0),o.rotation.x=Math.PI/2,n.add(o);const l=new be(new bn(4,14),new $n({color:s.keyLight,side:Ft}));l.position.set(7,2,7),l.lookAt(0,0,0),n.add(l);const c=new be(new bn(3.5,14),new $n({color:s.rimLight,side:Ft}));c.position.set(-8,3,4),c.lookAt(0,0,0),n.add(c);const u=new be(new bn(8,10),new $n({color:s.fillLight,side:Ft}));u.position.set(0,4,-9),u.lookAt(0,0,0),n.add(u);const p=new be(new La(14,32),new $n({color:s.groundBounce,side:Ft}));p.position.set(0,-7,0),p.rotation.x=-Math.PI/2,n.add(p);const h=t.fromScene(n,.035).texture;return t.dispose(),h}function j0(){const i=document.createElement("canvas");i.width=512,i.height=256;const e=i.getContext("2d");e.fillStyle="#d8d8d8",e.fillRect(0,0,512,256),e.strokeStyle="#2a2a2a",e.lineWidth=4.5;const t=64,n=48;for(let s=-n;s<256+n;s+=n)for(let a=-t;a<512+t;a+=t){const o=Math.floor(s/n)%2*(t/2),l=a+o,c=s;e.beginPath();for(let u=0;u<6;u++){const p=u*Math.PI/3,h=l+Math.cos(p)*26,f=c+Math.sin(p)*22;u===0?e.moveTo(h,f):e.lineTo(h,f)}e.closePath(),e.stroke()}const r=new Ci(i);return r.wrapS=Qn,r.wrapT=Qn,r}function X0(){const i=document.createElement("canvas");i.width=512,i.height=256;const e=i.getContext("2d");e.fillStyle="#555555",e.fillRect(0,0,512,256),e.fillStyle="#ffffff",e.beginPath(),e.moveTo(165,115),e.bezierCurveTo(195,115,215,145,200,175),e.bezierCurveTo(188,205,175,230,168,242),e.bezierCurveTo(160,220,152,185,150,150),e.closePath(),e.fill(),e.beginPath(),e.moveTo(95,35),e.bezierCurveTo(155,35,170,75,155,108),e.bezierCurveTo(130,100,105,75,95,35),e.fill(),e.beginPath(),e.arc(285,75,28,0,Math.PI*2),e.arc(290,150,38,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(380,85,52,0,Math.PI*2),e.arc(430,195,22,0,Math.PI*2),e.fill(),e.strokeStyle="#777777",e.lineWidth=1.5;for(let t=32;t<512;t+=48)e.beginPath(),e.moveTo(t,0),e.lineTo(t,256),e.stroke();for(let t=32;t<256;t+=32)e.beginPath(),e.moveTo(0,t),e.lineTo(512,t),e.stroke();return new Ci(i)}function q0(){const i=document.createElement("canvas");i.width=1024,i.height=512;const e=i.getContext("2d");e.fillStyle="#240f08",e.fillRect(0,0,1024,512);const t=12,n=8,r=6,s=5,a=1024/t,o=512*.84/n;for(let c=0;c<n;c++)for(let u=0;u<t;u++){const p=u*a+r,h=c*o+s+12,f=a-r*2,v=o-s*2,E=e.createLinearGradient(p,h,p+f,h+v);E.addColorStop(0,"#e8ecf2"),E.addColorStop(.5,"#b8bec7"),E.addColorStop(1,"#d8dde6"),e.fillStyle=E,e.fillRect(p,h,f,v),e.strokeStyle="#5c4332",e.lineWidth=2,e.strokeRect(p,h,f,v);const g=["#c8102e","#004b87","#115e38","#1a1a1a","#d4af37"];e.fillStyle=g[(c*3+u)%g.length],e.beginPath(),e.arc(p+f*.22,h+v*.5,v*.28,0,Math.PI*2),e.fill(),e.fillStyle="#2b2b2b",e.fillRect(p+f*.42,h+v*.28,f*.46,3),e.fillRect(p+f*.42,h+v*.56,f*.34,2.5)}const l=new Ci(i);return l.wrapS=Qn,l}function sc(i,e="#d8dee6",t="#c59216",n=!1){const r=document.createElement("canvas");r.width=1024,r.height=160;const s=r.getContext("2d");s.fillStyle=e,s.fillRect(0,0,1024,160),n&&(s.fillStyle="#009c3b",s.fillRect(0,126,1024,18),s.fillStyle="#ffdf00",s.fillRect(0,144,1024,16)),s.font='900 68px "Arial Black", Impact, sans-serif',s.textAlign="center",s.textBaseline="middle",s.fillStyle="#3a2b05",s.fillText(i,515,72),s.fillStyle=t,s.fillText(i,512,68);const a=new Ci(r);return a.wrapS=Qn,a}function el(i=!0){const e=document.createElement("canvas");e.width=256,e.height=320;const t=e.getContext("2d"),n=t.createLinearGradient(0,0,256,320);return n.addColorStop(0,"#fcfcfc"),n.addColorStop(.5,"#eef0f3"),n.addColorStop(1,"#dcdfe4"),t.fillStyle=n,t.fillRect(0,0,256,320),t.strokeStyle="#c5a03f",t.lineWidth=6,t.strokeRect(6,6,244,308),t.fillStyle="#181818",t.beginPath(),t.arc(62,66,18,0,Math.PI*2),t.fill(),t.font="italic 900 34px Arial, sans-serif",t.fillStyle="#141414",t.fillText("FERJ",88,78),t.fillStyle="#c8102e",t.fillRect(88,84,112,5),i?(t.font="bold 16px Arial, sans-serif",t.fillStyle="#555555",t.textAlign="center",t.fillText("CAMPEÃO ESTADUAL",128,138),t.font="bold 22px Arial, sans-serif",t.fillStyle="#b08b2e",t.fillText("SÉRIE A",128,170),t.strokeStyle="#222",t.lineWidth=2,t.strokeRect(72,200,112,66),t.font="900 26px Arial, sans-serif",t.fillStyle="#1a1a1a",t.fillText("RIO",128,242)):(t.font="900 28px Arial, sans-serif",t.fillStyle="#a6192e",t.textAlign="center",t.fillText("RIO",128,165),t.font="bold 18px Arial, sans-serif",t.fillStyle="#1f2937",t.fillText("ESTADUAL",128,210)),new Ci(e)}function Y0(i=!1,e=null,t=null){return{goldPolished:new Et({color:new ke(16763202),metalness:.96,roughness:.11,clearcoat:.65,clearcoatRoughness:.08,reflectivity:1,wireframe:i}),goldBrushed:new Et({color:new ke(14854699),metalness:.91,roughness:.26,clearcoat:.35,wireframe:i}),copperRose:new Et({color:new ke(14253932),metalness:.88,roughness:.22,clearcoat:.5,wireframe:i}),silverPolished:new Et({color:new ke(16185595),metalness:.98,roughness:.08,clearcoat:.78,clearcoatRoughness:.06,wireframe:i}),silverBrushed:new Et({color:new ke(14475753),metalness:.93,roughness:.22,clearcoat:.38,wireframe:i}),silverAntique:new Et({color:new ke(13620703),metalness:.92,roughness:.28,bumpMap:e,bumpScale:.015,clearcoat:.3,wireframe:i}),silverBall:new Et({color:new ke(15922682),metalness:.95,roughness:.15,bumpMap:e,bumpScale:.024,clearcoat:.55,wireframe:i}),goldBall:new Et({color:new ke(16763461),metalness:.97,roughness:.12,bumpMap:e,bumpScale:.032,clearcoat:.7,wireframe:i}),whiteCeramicGlobe:new Et({color:new ke(16316144),metalness:.15,roughness:.2,clearcoat:.85,wireframe:i}),mahoganyWood:new Et({color:new ke(3544329),metalness:.06,roughness:.32,clearcoat:.85,clearcoatRoughness:.14,wireframe:i}),blackMarble:new Et({color:new ke(1316120),metalness:.15,roughness:.16,clearcoat:.92,clearcoatRoughness:.08,wireframe:i}),emeraldAccent:new Et({color:new ke(817726),metalness:.35,roughness:.2,clearcoat:.8,wireframe:i}),orangeRibbon:new Et({color:new ke(15094556),metalness:.1,roughness:.4,side:Ft,wireframe:i}),greenRibbon:new Et({color:new ke(1212987),metalness:.1,roughness:.4,side:Ft,wireframe:i})}}function tl(i){const e=new Jt,t=new be(new mt(.76,.79,.24,64),i.mahoganyWood);t.position.y=-2.18,e.add(t);const n=new be(new mt(.8,.81,.03,64),i.silverPolished);n.position.y=-2.3,e.add(n);const r=q0(),s=new Et({map:r,metalness:.75,roughness:.22,clearcoat:.6,wireframe:i.goldPolished.wireframe}),a=new be(new mt(.74,.76,1.55,64),s);a.position.y=-1.28,e.add(a);const o=new Yt(.16,.11,.018),l=8,c=12;for(let R=0;R<l;R++){const w=-1.86+R*.175,D=.752-R*.002;for(let G=0;G<c;G++){const N=G/c*Math.PI*2,O=new be(o,(R+G)%5===0?i.goldBrushed:i.silverBrushed);O.position.set(Math.sin(N)*D,w,Math.cos(N)*D),O.rotation.y=N,e.add(O)}}const u=[new V(.75,-.5),new V(.75,-.42),new V(.68,-.32),new V(.62,-.22),new V(.48,-.15),new V(.32,.02),new V(.22,.35),new V(.18,.72),new V(.16,.92),new V(.26,.98),new V(.18,1.05)],p=new be(new Hn(u,64),i.silverPolished);e.add(p);for(let R=0;R<16;R++){const w=R/16*Math.PI*2,D=new Kt([new I(Math.sin(w)*.42,-.12,Math.cos(w)*.42),new I(Math.sin(w)*.23,.35,Math.cos(w)*.23),new I(Math.sin(w)*.17,.88,Math.cos(w)*.17)]),G=new be(new Zt(D,20,.016,8,!1),i.silverBrushed);e.add(G)}const h=.62,f=1.56,v=new be(new wn(h,64,64),i.silverPolished);v.position.y=f,e.add(v);const E=new be(new mt(h+.018,h+.018,.18,64),i.silverBrushed);E.position.y=f,e.add(E),[-.09,.09].forEach(R=>{const w=new be(new zn(h+.02,.014,16,64),i.silverPolished);w.rotation.x=Math.PI/2,w.position.y=f+R,e.add(w)});const g=new be(new mt(.16,.16,.035,32),i.copperRose);g.rotation.x=Math.PI/2,g.position.set(0,f+.01,h+.015),e.add(g);const m=new Kt([new I(-.38,f-.08,.49),new I(-.22,f-.28,.52),new I(0,f-.35,.53),new I(.22,f-.28,.52),new I(.38,f-.08,.49)]),b=new be(new Zt(m,32,.012,8,!1),i.silverBrushed);e.add(b),[-1,1].forEach(R=>{const w=new be(new zn(.11,.02,12,24),i.silverPolished);w.position.set(R*(h+.01),f,0),w.scale.set(.6,1.2,.5),e.add(w)});const T=new be(new mt(.06,.11,.12,24),i.silverPolished);T.position.y=f+h+.04,e.add(T);const _=new Jt;_.position.y=f+h+.1;const C=new be(new mt(.018,.014,.24,12),i.silverPolished);C.position.set(.02,.11,0),C.rotation.z=-.15,_.add(C);const A=new be(new mt(.017,.013,.22,12),i.silverPolished);A.position.set(-.06,.13,.03),A.rotation.z=.65,_.add(A);const x=new be(new mt(.042,.026,.18,14),i.silverPolished);x.position.set(-.01,.28,0),x.rotation.z=.18,_.add(x);const S=new be(new mt(.013,.013,.28,10),i.silverPolished);S.position.set(-.01,.32,0),S.rotation.z=1.1,_.add(S);const F=new be(new wn(.038,16,16),i.silverPolished);return F.position.set(-.03,.41,0),_.add(F),e.add(_),e}function Z0(i){const e=new Jt,t=sc("BRASILEIRÃO","#e5e9f0","#b88917",!1),n=new Et({map:t,metalness:.94,roughness:.12,clearcoat:.7,wireframe:i.silverPolished.wireframe}),r=new be(new mt(.68,.96,.72,64),n);r.position.y=-1.88,e.add(r);const s=new be(new zn(.68,.028,16,64),i.emeraldAccent);s.rotation.x=Math.PI/2,s.position.y=-1.51,e.add(s);const a=[new V(.67,-1.5),new V(.54,-.75),new V(.52,-.1),new V(.68,.65),new V(.95,1.45),new V(1.18,2.08),new V(1.1,2.08),new V(.84,1.35),new V(.45,.2),new V(0,-1.4)],o=new be(new Hn(a,64),i.silverPolished);o.scale.set(1.08,1,.52),e.add(o),[-1,1].forEach(h=>{const f=new Kt([new I(h*.66,-1.48,0),new I(h*.52,-.35,0),new I(h*.76,.85,0),new I(h*1.18,2.1,0)]),v=new be(new Zt(f,40,.085,4,!1),i.silverBrushed);v.scale.set(.9,1,.45),e.add(v)});const l=new kl;l.moveTo(-.28,-1.5),l.lineTo(.28,-1.5),l.quadraticCurveTo(.24,-.8,.48,-.05),l.lineTo(0,1.28),l.lineTo(-.48,-.05),l.quadraticCurveTo(-.24,-.8,-.28,-1.5),l.closePath();const c=new ha;c.absarc(0,-.02,.36,0,Math.PI*2,!1),l.holes.push(c);const u=new be(new Ua(l,{depth:.32,bevelEnabled:!0,bevelThickness:.04,bevelSize:.03,bevelSegments:4}),i.goldPolished);u.position.set(0,0,-.16),e.add(u);const p=new be(new wn(.41,64,64),i.goldBall);return p.position.set(0,-.02,.08),e.add(p),e}function $0(i){const e=new Jt,t=[new V(0,-2.28),new V(1.06,-2.28),new V(1.02,-1.78),new V(.92,-1.72),new V(.82,-1.68),new V(.8,-1.42),new V(.52,-1.32),new V(.46,-1.18),new V(.82,-.62),new V(.98,-.15),new V(1.08,.65),new V(1.02,1.25),new V(.82,1.42),new V(.54,1.44),new V(.54,1.66),new V(.48,1.66),new V(.48,1.35),new V(0,1.25)],n=new be(new Hn(t,64),i.silverPolished);e.add(n),[-1.68,-1.42,1.65].forEach((f,v)=>{const E=v===0?.84:v===1?.78:.54,g=new be(new zn(E,.018,16,64),i.goldPolished);g.rotation.x=Math.PI/2,g.position.y=f,e.add(g)});const r=sc("COPA DO BRASIL","#cfd6df","#d4a017",!0),s=new Et({map:r,metalness:.9,roughness:.15,clearcoat:.6,wireframe:i.silverPolished.wireframe}),a=new be(new mt(1.12,1.12,.34,64,1,!0),s);a.position.y=-.32,e.add(a);const o=new be(new zn(1.1,.025,16,64),i.silverPolished);o.rotation.x=Math.PI/2,o.position.y=-.15,e.add(o);const l=new be(new zn(1.1,.025,16,64),i.goldPolished);l.rotation.x=Math.PI/2,l.position.y=-.49,e.add(l);const c=new be(new Yt(.68,.72,.08),i.silverPolished);c.position.set(0,.76,1.02),c.rotation.x=.08,e.add(c);const u=new be(new Yt(.22,.56,.11),i.silverBrushed);u.position.set(0,.76,1.03),u.rotation.x=.08,e.add(u);const p=new be(new Yt(.54,.22,.11),i.silverBrushed);p.position.set(0,.76,1.03),p.rotation.x=.08,e.add(p);const h=new be(new Yt(.28,.12,.13),i.goldPolished);return h.position.set(0,.76,1.04),h.rotation.x=.08,e.add(h),[-1,1].forEach(f=>{const v=new Kt([new I(f*.92,1.32,0),new I(f*1.42,1.36,0),new I(f*1.34,.55,0),new I(f*1.08,-.18,0)]),E=new be(new Zt(v,32,.065,16,!1),i.silverPolished);E.scale.z=.45,e.add(E);const g=new Kt([new I(f*1.18,1.36,.12),new I(f*1.24,.35,.18),new I(f*1.32,-.75,.22),new I(f*1.42,-1.75,.26)]),m=new be(new Zt(g,32,.08,8,!1),i.orangeRibbon);m.scale.set(1.1,1,.15),e.add(m);const b=new Kt([new I(f*1.15,1.32,-.05),new I(f*1.2,.25,-.08),new I(f*1.26,-.85,-.1),new I(f*1.34,-1.65,-.12)]),T=new be(new Zt(b,32,.07,8,!1),i.greenRibbon);T.scale.set(1.1,1,.15),e.add(T)}),e}function J0(i){const e=new Jt,t=new be(new mt(1.06,1.1,.08,64),i.emeraldAccent);t.position.y=-2.24,e.add(t);const n=new be(new mt(.68,1.06,.62,64),i.silverPolished);n.position.y=-1.9,e.add(n);const r=[new V(.56,-1.6),new V(.52,-.7),new V(.66,.45),new V(.86,1.65),new V(.92,2.15),new V(.85,2.15),new V(.76,1.5),new V(0,1.3)],s=new be(new Hn(r,64),i.silverPolished);e.add(s);const a=new be(new Yt(.11,1.65,.06),i.silverBrushed);a.position.set(-.04,1.32,.78),a.rotation.x=-.11,e.add(a);const o=new be(new mt(.28,.28,.06,6),i.silverPolished);o.rotation.x=Math.PI/2-.11,o.position.set(.22,1.52,.78),e.add(o);const l=9;for(let p=0;p<l;p++){const h=p/(l-1),f=new Kt([new I(.45-h*.12,-1.55+h*.12,.48),new I(.15-h*.18,-.75+h*.24,.65),new I(-.32-h*.14,.15+h*.32,.68),new I(-.72-h*.08,.95+h*.28,.42)]),v=new be(new Zt(f,36,.062-h*.015,12,!1),p%2===0?i.goldPolished:i.goldBrushed);v.scale.set(1.15,1,.42),e.add(v)}const c=new Kt([new I(.48,-1.4,.35),new I(.62,.2,.52),new I(.78,2.15,.48)]),u=new be(new Zt(c,32,.035,12,!1),i.goldPolished);return e.add(u),e}function K0(i){const e=new Jt,t=new be(new mt(.76,.78,.14,64),i.silverPolished);t.position.y=-2.24,e.add(t);const n=[new V(.58,-2.16),new V(.52,-2.02),new V(.24,-1.72),new V(.18,-1.42),new V(.36,-1.32),new V(.34,-1.2),new V(.22,-1.12),new V(.62,-.78),new V(.82,-.25),new V(.92,.55),new V(.98,.62),new V(.98,.92),new V(.88,.96),new V(.76,1.18),new V(.32,1.32),new V(.16,1.48),new V(.32,1.62),new V(.1,1.85),new V(0,1.92)],r=new be(new Hn(n,64),i.silverPolished);e.add(r);const s=14;for(let l=0;l<s;l++){const c=l/s*Math.PI*2,u=new be(new Na(.12,.68,5),i.silverAntique);u.position.set(Math.sin(c)*.72,-.58,Math.cos(c)*.72),u.rotation.y=c,u.rotation.x=.35,u.scale.set(1,1,.35),e.add(u)}const a=new be(new mt(.99,.99,.26,48),i.silverAntique);a.position.y=.77,e.add(a);const o=new be(new wn(.16,16,16),i.silverAntique);return o.position.y=2.08,o.scale.set(.85,1.35,.85),e.add(o),[-1,1].forEach(l=>{const c=new Kt([new I(l*.95,.82,0),new I(l*.98,1.18,0),new I(l*1.42,1.12,0),new I(l*1.38,.32,0),new I(l*1.12,-.38,0),new I(l*.56,-.88,0)],!1,"catmullrom",.15),u=new be(new Zt(c,48,.042,12,!1),i.silverPolished);u.scale.z=.55,e.add(u)}),e}function Q0(i){const e=new Jt,t=new be(new mt(.72,.74,.1,64),i.goldPolished);t.position.y=-2.26,e.add(t);const n=new be(new mt(.48,.7,.72,64),i.goldPolished);n.position.y=-1.86,e.add(n);const r=new be(new mt(.5,.5,.08,64),i.goldBrushed);r.position.y=-1.48,e.add(r);const s=6;for(let c=0;c<s;c++){const u=c/s*Math.PI*2,p=.58,h=new Kt([new I(Math.sin(u)*.42,-1.45,Math.cos(u)*.42),new I(Math.sin(u+p*.35)*.22,-.45,Math.cos(u+p*.35)*.22),new I(Math.sin(u+p*.7)*.19,.55,Math.cos(u+p*.7)*.19),new I(Math.sin(u+p)*.52,1.78,Math.cos(u+p)*.52)]),f=new be(new Zt(h,48,.052,8,!1),c%2===0?i.goldPolished:i.goldBrushed);f.scale.set(1.15,1,.65),e.add(f)}const a=1.82,o=new be(new wn(.49,64,64),i.whiteCeramicGlobe);o.position.y=a,e.add(o);const l=new be(new wn(.498,48,48,0,Math.PI*2,0,Math.PI*.55),i.goldPolished);return l.position.y=a,l.rotation.z=.22,e.add(l),e}function eg(i){const e=new Jt,t=new be(new mt(.92,.92,.76,8),i.mahoganyWood);t.position.y=-1.92,t.rotation.y=Math.PI/8,e.add(t);const n=new Et({map:el(!0),roughness:.2,metalness:.1,clearcoat:.5}),r=new Et({map:el(!1),roughness:.2,metalness:.1,clearcoat:.5}),s=new be(new Yt(.58,.66,.03),n);s.position.set(0,-1.92,.855),e.add(s),[-1,1].forEach(c=>{const u=new be(new Yt(.42,.66,.03),r),p=c*(Math.PI/4);u.position.set(Math.sin(p)*.855,-1.92,Math.cos(p)*.855),u.rotation.y=p,e.add(u)});const a=[new V(.56,-1.54),new V(.52,-1.42),new V(.38,-1.25),new V(.18,-.95),new V(.28,-.82),new V(.18,-.72),new V(.32,-.58),new V(.68,-.22),new V(.84,.45),new V(.92,1.15),new V(.98,1.22),new V(.98,1.48),new V(.9,1.48),new V(.78,.5),new V(0,-.45)],o=new be(new Hn(a,64),i.goldPolished);e.add(o);const l=new be(new mt(.99,.97,.26,48),i.goldBrushed);l.position.y=1.34,e.add(l);for(let c=0;c<24;c++){const u=c/24*Math.PI*2,p=new be(new wn(.055,12,12),i.goldPolished);p.position.set(Math.sin(u)*.98,1.34,Math.cos(u)*.98),p.scale.set(1,1.4,.5),e.add(p)}return[-1,1].forEach(c=>{const u=new Kt([new I(c*.94,1.32,0),new I(c*.98,1.72,0),new I(c*1.42,1.7,0),new I(c*1.36,.85,0),new I(c*1.05,.05,0),new I(c*.52,-.52,0)],!1,"catmullrom",.12),p=new be(new Zt(u,48,.038,12,!1),i.goldPolished);p.scale.z=.55,e.add(p)}),e}function tg(i,e,t="intercontinental"){const n=(i||"").toLowerCase().replace(/[-_]/g,"");return n.includes("mundial")||n.includes("intercontinental")||n.includes("copario")?t==="copario51"?K0(e):Q0(e):n.includes("libertadores")?tl(e):n.includes("brasil")&&!n.includes("copa")?Z0(e):n.includes("copa")&&n.includes("brasil")?$0(e):n.includes("estadual")||n.includes("paulist")||n.includes("carioca")?t==="paulista"?J0(e):eg(e):tl(e)}function nl({trophyId:i,variant:e="intercontinental",lightingPreset:t="warm",autoRotate:n=!0,wireframe:r=!1,height:s=200,cameraDistance:a=6.2}){const o=ze.useRef(null),l=ze.useRef(null),c=ze.useRef(null),u=ze.useRef(null),p=ze.useRef(!1),h=ze.useRef({x:0,y:0}),f=ze.useRef({x:0,y:.006});return ze.useEffect(()=>{const v=o.current;if(!v)return;const E=v.clientWidth||280,g=s,m=new Cl;u.current=m;const b=new rn(36,E/g,.1,100);b.position.set(0,.35,a),b.lookAt(0,.1,0);const T=new V0({antialias:!0,alpha:!0,powerPreference:"high-performance"});T.setSize(E,g),T.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),T.toneMapping=Sa,T.toneMappingExposure=1.25,"outputColorSpace"in T&&Gt&&(T.outputColorSpace=Gt),c.current=T,v.innerHTML="",v.appendChild(T.domElement);const _=W0(T,t);m.environment=_;const C=new Ms(16774358,2.2);C.position.set(5,8,6),m.add(C);const A=new Ms(14412542,1.5);A.position.set(-6,5,-5),m.add(A);const x=new Ms(16765568,.7);x.position.set(0,-6,3),m.add(x);const S=document.createElement("canvas");S.width=128,S.height=128;const F=S.getContext("2d"),R=F.createRadialGradient(64,64,8,64,64,60);R.addColorStop(0,"rgba(35, 25, 15, 0.42)"),R.addColorStop(.6,"rgba(35, 25, 15, 0.14)"),R.addColorStop(1,"rgba(35, 25, 15, 0)"),F.fillStyle=R,F.fillRect(0,0,128,128);const w=new Ci(S),D=new be(new bn(3.2,3.2),new $n({map:w,transparent:!0,depthWrite:!1}));D.rotation.x=-Math.PI/2,D.position.y=-2.38,m.add(D);const G=j0(),N=X0(),O=Y0(r,G,N),H=tg(i,O,e);H.rotation.y=-.35,H.rotation.x=.06,l.current=H,m.add(H);const L=Y=>{p.current=!0;const le=Y.touches?Y.touches[0].clientX:Y.clientX,Ee=Y.touches?Y.touches[0].clientY:Y.clientY;h.current={x:le,y:Ee}},q=Y=>{if(!p.current||!l.current)return;const le=Y.touches?Y.touches[0].clientX:Y.clientX,Ee=Y.touches?Y.touches[0].clientY:Y.clientY,De=le-h.current.x,me=Ee-h.current.y;l.current.rotation.y+=De*.013,l.current.rotation.x=Math.max(-.45,Math.min(.55,l.current.rotation.x+me*.009)),f.current={x:me*5e-4,y:De*.002},h.current={x:le,y:Ee}},k=()=>{p.current=!1},K=T.domElement;K.addEventListener("mousedown",L),window.addEventListener("mousemove",q),window.addEventListener("mouseup",k),K.addEventListener("touchstart",L,{passive:!0}),window.addEventListener("touchmove",q,{passive:!0}),window.addEventListener("touchend",k);const $=()=>{if(!v||!T)return;const Y=v.clientWidth;Y!==0&&(b.aspect=Y/g,b.updateProjectionMatrix(),T.setSize(Y,g))};window.addEventListener("resize",$);let ae;const we=()=>{ae=requestAnimationFrame(we),l.current&&!p.current&&(n?l.current.rotation.y+=.0065:(l.current.rotation.y+=f.current.y,f.current.y*=.94)),T.render(m,b)};return we(),()=>{cancelAnimationFrame(ae),K.removeEventListener("mousedown",L),window.removeEventListener("mousemove",q),window.removeEventListener("mouseup",k),K.removeEventListener("touchstart",L),window.removeEventListener("touchmove",q),window.removeEventListener("touchend",k),window.removeEventListener("resize",$),v.contains(K)&&v.removeChild(K),T.dispose(),_.dispose(),G.dispose(),N.dispose(),w.dispose()}},[i,e,t,n,r,s,a]),d.jsx("div",{ref:o,style:{width:"100%",height:`${s}px`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"grab"},title:"Arraste para girar em 360°"})}function ac({clube:i}){const[e,t]=ze.useState([]),[n,r]=ze.useState(!0),[s,a]=ze.useState("todos"),[o,l]=ze.useState(null),[c,u]=ze.useState("warm"),[p,h]=ze.useState(!0),[f,v]=ze.useState(!1),[E,g]=ze.useState({});ze.useEffect(()=>{if(!i)return;let _=!0;return r(!0),fetch(`/api/clubes/trofeus?clube=${encodeURIComponent(i)}`).then(C=>C.json()).then(C=>{if(_){const A=C.trofeus||[];t(A);const x={},S=(i||"").toLowerCase().includes("palmeiras"),F=["palmeiras","corinthians","santos","são paulo","bragantino","ponte preta"].some(R=>(i||"").toLowerCase().includes(R));A.forEach(R=>{const w=(R.modelo_3d_tipo||R.tipo_trofeu||"").toLowerCase();w.includes("mundial")?x[R.id||"mundial"]=S?"copario51":"intercontinental":w.includes("estadual")&&(x[R.id||"estadual"]=F?"paulista":"carioca")}),g(x),r(!1)}}).catch(C=>{console.error("Erro ao carregar troféus:",C),_&&r(!1)}),()=>{_=!1}},[i]);const m=(_,C)=>{g(A=>({...A,[_]:C}))},b=e.filter(_=>s==="todos"?!0:(_.tipo_trofeu||"").toLowerCase()===s.toLowerCase()),T=e.reduce((_,C)=>_+(C.quantidade||0),0);return d.jsxs("div",{className:"editorial-panel",style:{padding:"24px",backgroundColor:"var(--surface-panel)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",display:"flex",flexDirection:"column",gap:"20px",width:"100%",boxSizing:"border-box"},children:[d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px",borderBottom:"1px solid var(--border-subtle)",paddingBottom:"18px"},children:[d.jsxs("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"12px"},children:[d.jsxs("div",{children:[d.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",color:"var(--accent)",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"6px"},children:[d.jsx(kr,{size:13}),d.jsxs("span",{children:["Sala de Troféus & Museu 3D • ",i]})]}),d.jsxs("h2",{className:"font-editorial",style:{fontSize:"1.5rem",fontWeight:700,color:"var(--text-primary)",margin:0,display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"},children:[d.jsx("span",{children:"Réplicas 3D Oficiais de Conquistas"}),d.jsxs("span",{className:"font-mono",style:{fontSize:"0.78rem",fontWeight:700,padding:"3px 9px",borderRadius:"12px",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)",border:"1px solid var(--border-subtle)"},children:[T," títulos registrados"]})]}),d.jsx("p",{style:{margin:"4px 0 0 0",fontSize:"0.84rem",color:"var(--text-secondary)"},children:"Modelos procedurais com acabamento PBR, reflexos de estúdio em tempo real e controle orbital 360°. Arraste com o mouse ou toque para inspecionar."})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",backgroundColor:"var(--surface-card)",padding:"6px 10px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)",flexWrap:"wrap"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px"},children:[d.jsx(_c,{size:13,style:{color:"var(--accent)"}}),d.jsx("span",{style:{fontSize:"0.7rem",fontWeight:600,color:"var(--text-secondary)",marginRight:"2px"},children:"Luz:"}),[{id:"warm",label:"Estúdio Ouro"},{id:"stadium",label:"Estádio"},{id:"dramatic",label:"Dramático"}].map(_=>d.jsx("button",{onClick:()=>u(_.id),style:{padding:"3px 8px",fontSize:"0.68rem",fontWeight:c===_.id?700:500,borderRadius:"4px",border:"none",cursor:"pointer",backgroundColor:c===_.id?"var(--accent)":"transparent",color:c===_.id?"#FFFFFF":"var(--text-secondary)",transition:"all 0.15s ease"},children:_.label},_.id))]}),d.jsx("div",{style:{width:"1px",height:"16px",backgroundColor:"var(--border-subtle)"}}),d.jsxs("button",{onClick:()=>h(_=>!_),title:p?"Pausar rotação contínua":"Ativar rotação contínua",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.68rem",fontWeight:600,borderRadius:"4px",border:"1px solid var(--border-subtle)",backgroundColor:p?"var(--surface-raised)":"transparent",color:p?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:[p?d.jsx(Sc,{size:12}):d.jsx(yc,{size:12}),d.jsx("span",{children:p?"Giro Ativo":"Giro Pausado"})]}),d.jsxs("button",{onClick:()=>v(_=>!_),title:"Visualizar geometria e malha 3D",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.68rem",fontWeight:600,borderRadius:"4px",border:"1px solid var(--border-subtle)",backgroundColor:f?"var(--accent)":"transparent",color:f?"#FFFFFF":"var(--text-secondary)",cursor:"pointer"},children:[d.jsx(Mc,{size:12}),d.jsx("span",{children:"Wireframe"})]})]})]}),d.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"6px",paddingTop:"4px"},children:[{id:"todos",label:"Todos os Troféus"},{id:"mundial",label:"Mundiais"},{id:"libertadores",label:"Libertadores"},{id:"brasileirao",label:"Brasileirão"},{id:"copa_brasil",label:"Copa do Brasil"},{id:"estadual",label:"Estaduais"}].map(_=>d.jsx("button",{onClick:()=>a(_.id),style:{padding:"5px 12px",fontSize:"0.74rem",fontWeight:s===_.id?700:500,borderRadius:"var(--radius-control)",border:"1px solid",borderColor:s===_.id?"var(--accent)":"var(--border-subtle)",backgroundColor:s===_.id?"var(--accent)":"var(--surface-card)",color:s===_.id?"#FFFFFF":"var(--text-secondary)",cursor:"pointer",transition:"all 0.15s ease"},children:_.label},_.id))})]}),n?d.jsxs("div",{style:{padding:"60px",textAlign:"center",color:"var(--text-secondary)"},children:[d.jsx(bc,{size:24,style:{animation:"spin 2s linear infinite",marginBottom:"8px"}}),d.jsx("p",{style:{margin:0,fontSize:"0.88rem"},children:"Renderizando vitrine e calibrando texturas 3D..."})]}):b.length===0?d.jsx("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:d.jsx("p",{style:{margin:0,fontSize:"0.88rem"},children:"Nenhum troféu encontrado para o filtro selecionado."})}):d.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"18px",alignItems:"stretch"},children:b.map((_,C)=>{const A=_.id||`${_.modelo_3d_tipo}_${C}`,x=(_.modelo_3d_tipo||_.tipo_trofeu||"").toLowerCase(),S=E[A]||(x.includes("mundial")?"intercontinental":"paulista"),F=x.includes("mundial")||x.includes("copario"),R=x.includes("estadual");return d.jsxs("div",{style:{position:"relative",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",padding:"16px",display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:"var(--shadow-editorial)",overflow:"hidden",transition:"transform 0.18s ease, border-color 0.18s ease"},onMouseEnter:w=>{w.currentTarget.style.transform="translateY(-2px)",w.currentTarget.style.borderColor="var(--accent)"},onMouseLeave:w=>{w.currentTarget.style.transform="translateY(0)",w.currentTarget.style.borderColor="var(--border-subtle)"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[d.jsx("span",{className:"font-editorial",style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"190px"},title:_.torneio,children:_.torneio}),d.jsxs("span",{className:"font-mono",style:{padding:"3px 8px",fontSize:"0.72rem",fontWeight:700,borderRadius:"10px",backgroundColor:"var(--accent)",color:"#FFFFFF",boxShadow:"0 2px 5px rgba(0,0,0,0.18)"},children:[_.quantidade,"x"]})]}),F&&d.jsxs("div",{style:{display:"flex",gap:"4px",marginBottom:"6px"},children:[d.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"intercontinental")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="intercontinental"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="intercontinental"?"var(--surface-raised)":"transparent",color:S==="intercontinental"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"FIFA Intercontinental"}),d.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"copario51")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="copario51"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="copario51"?"var(--surface-raised)":"transparent",color:S==="copario51"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"Copa Rio 1951"})]}),R&&d.jsxs("div",{style:{display:"flex",gap:"4px",marginBottom:"6px"},children:[d.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"paulista")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="paulista"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="paulista"?"var(--surface-raised)":"transparent",color:S==="paulista"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"Paulistão FPF"}),d.jsx("button",{onClick:w=>{w.stopPropagation(),m(A,"carioca")},style:{padding:"2px 6px",fontSize:"0.62rem",fontWeight:S==="carioca"?700:500,borderRadius:"3px",border:"1px solid var(--border-subtle)",backgroundColor:S==="carioca"?"var(--surface-raised)":"transparent",color:S==="carioca"?"var(--accent)":"var(--text-secondary)",cursor:"pointer"},children:"Carioca FERJ"})]}),d.jsx(nl,{trophyId:_.modelo_3d_tipo||_.tipo_trofeu,variant:S,lightingPreset:c,autoRotate:p,wireframe:f,height:190,cameraDistance:6.2}),d.jsxs("div",{style:{borderTop:"1px solid var(--border-subtle)",paddingTop:"10px",display:"flex",flexDirection:"column",gap:"8px"},children:[d.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:[(_.anos_conquistados||"").split(",").slice(0,5).map((w,D)=>d.jsx("span",{className:"font-mono",style:{fontSize:"0.68rem",padding:"2px 6px",borderRadius:"4px",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)"},children:w.trim()},D)),(_.anos_conquistados||"").split(",").length>5&&d.jsxs("span",{className:"font-mono",style:{fontSize:"0.68rem",padding:"2px 5px",borderRadius:"4px",backgroundColor:"var(--surface-raised)",color:"var(--accent)",fontWeight:600},children:["+",(_.anos_conquistados||"").split(",").length-5]})]}),d.jsxs("button",{onClick:()=>l({..._,variant:S}),style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",padding:"7px 12px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)",fontSize:"0.74rem",fontWeight:600,cursor:"pointer",transition:"background-color 0.15s ease"},onMouseEnter:w=>{w.currentTarget.style.backgroundColor="var(--border-subtle)"},onMouseLeave:w=>{w.currentTarget.style.backgroundColor="var(--surface-raised)"},children:[d.jsx(Ec,{size:13,style:{color:"var(--accent)"}}),d.jsx("span",{children:"Inspecionar Réplica (Museu)"})]})]})]},A)})}),o&&d.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(10, 9, 8, 0.78)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"},onClick:()=>l(null),children:d.jsxs("div",{style:{width:"100%",maxWidth:"720px",backgroundColor:"var(--surface-panel)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-panel)",padding:"24px",display:"flex",flexDirection:"column",gap:"18px",boxShadow:"0 20px 50px rgba(0,0,0,0.4)",boxSizing:"border-box"},onClick:_=>_.stopPropagation(),children:[d.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px"},children:[d.jsxs("div",{children:[d.jsxs("span",{style:{fontSize:"0.7rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:"0.04em"},children:["Museu Histórico de Troféus • ",i]}),d.jsx("h3",{className:"font-editorial",style:{margin:"4px 0 0 0",fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:o.torneio})]}),d.jsx("button",{onClick:()=>l(null),style:{padding:"6px",borderRadius:"50%",border:"none",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)",cursor:"pointer"},children:d.jsx(Tc,{size:18})})]}),d.jsxs("div",{style:{borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",overflow:"hidden",position:"relative"},children:[d.jsx(nl,{trophyId:o.modelo_3d_tipo||o.tipo_trofeu,variant:o.variant||"intercontinental",lightingPreset:c,autoRotate:p,wireframe:f,height:380,cameraDistance:5.8}),d.jsxs("div",{style:{position:"absolute",bottom:"10px",left:"12px",padding:"3px 8px",borderRadius:"4px",backgroundColor:"rgba(0,0,0,0.6)",color:"#FFFFFF",fontSize:"0.68rem",display:"flex",alignItems:"center",gap:"5px"},children:[d.jsx(wc,{size:11}),d.jsx("span",{children:"Arraste para girar em 360° • Zoom com roda do mouse"})]})]}),d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[d.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:d.jsxs("span",{className:"font-mono",style:{fontSize:"0.82rem",fontWeight:700,color:"var(--accent)"},children:["Total: ",o.quantidade,"x títulos conquistados"]})}),d.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"5px"},children:(o.anos_conquistados||"").split(",").map((_,C)=>d.jsx("span",{className:"font-mono",style:{padding:"3px 8px",fontSize:"0.74rem",fontWeight:600,borderRadius:"4px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)"},children:_.trim()},C))}),d.jsx("p",{style:{margin:"6px 0 0 0",fontSize:"0.82rem",color:"var(--text-secondary)",lineHeight:1.5},children:"Réplica digital tridimensional renderizada proceduramente em WebGL com sombreamento físico ACES Filmic Tone Mapping, reflexos em softboxes de estúdio e simulação de metais polidos e escovados."})]})]})})]})}function il({coberturaPct:i=100,className:e=""}){return i>=100?d.jsxs("div",{className:`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#5A673E]/15 text-[#3A4526] border border-[#5A673E]/30 ${e}`,children:[d.jsx(va,{className:"w-3.5 h-3.5 text-[#5A673E]"}),d.jsx("span",{children:"Dossiê Completo (100% Cobertura)"})]}):i>=80?d.jsxs("div",{className:`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C27D38]/15 text-[#85573B] border border-[#C27D38]/30 ${e}`,children:[d.jsx(rl,{className:"w-3.5 h-3.5 text-[#C27D38]"}),d.jsxs("span",{children:["Dossiê com Aviso (",i.toFixed(0),"% Cobertura)"]})]}):i>=50?d.jsxs("div",{className:`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1E8DE] text-[#7A6B58] border border-[#D9CEBF] ${e}`,children:[d.jsx(Ac,{className:"w-3.5 h-3.5 text-[#7A6B58]"}),d.jsxs("span",{children:["Retrospecto Básico (",i.toFixed(0),"% Cobertura)"]})]}):d.jsxs("div",{className:`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#85573B]/15 text-[#6B2F1A] border border-[#85573B]/30 ${e}`,children:[d.jsx(Rc,{className:"w-3.5 h-3.5 text-[#85573B]"}),d.jsx("span",{children:"Página Restrita (< 50% Cobertura)"})]})}function ng({clube:i,onVoltar:e,onSelectJogador:t}){var C,A,x,S,F,R,w,D,G,N,O,H;const[n,r]=ze.useState(null),[s,a]=ze.useState(!0),[o,l]=ze.useState("elenco"),[c,u]=ze.useState(null),[p,h]=ze.useState("tabela");if(ze.useEffect(()=>{if(!i)return;let L=!0;return a(!0),fetch(`/api/clubes/perfil-completo?clube=${encodeURIComponent(i)}`).then(q=>q.json()).then(q=>{L&&(r(q),a(!1))}).catch(q=>{console.error("Erro ao carregar perfil do clube:",q),L&&a(!1)}),fetch(`/api/clubes/dossie-ofensivo?clube=${encodeURIComponent(i)}`).then(q=>q.json()).then(q=>{L&&u(q)}).catch(()=>{}),()=>{L=!1}},[i]),s)return d.jsxs("div",{className:"editorial-panel",style:{padding:"60px",textAlign:"center",backgroundColor:"var(--surface-panel)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",color:"var(--text-secondary)"},children:[d.jsx("div",{style:{display:"inline-block",width:"28px",height:"28px",border:"3px solid var(--border-subtle)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:"12px"}}),d.jsxs("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.2rem",color:"var(--text-primary)"},children:["Consultando dossiê oficial do ",i,"..."]}),d.jsx("p",{style:{margin:"6px 0 0 0",fontSize:"0.84rem"},children:"Recuperando dados cadastrais, elenco 2026, comissão técnica e histórico de partidas."})]});if(!n||!n.info)return d.jsxs("div",{className:"editorial-panel",style:{padding:"30px",textAlign:"center"},children:[d.jsx("p",{style:{color:"var(--text-secondary)"},children:"Não foi possível carregar as informações do clube."}),d.jsx("button",{onClick:e,className:"btn-touch",style:{padding:"8px 16px",borderRadius:"var(--radius-control)",backgroundColor:"var(--accent)",color:"#FFF"},children:"Voltar à Lista Geral"})]});const{info:f,ranking:v,comissao_tecnica:E,elenco:g,lideres:m,ultimos_jogos:b,historico_campeonatos:T}=n,_=[...g.goleiros||[],...g.defensores||[],...g.meio_campistas||[],...g.atacantes||[]];return d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"22px",width:"100%"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"},children:[d.jsxs("button",{onClick:e,className:"touch-tactile",style:{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-primary)",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",transition:"background-color 0.15s ease"},children:[d.jsx(Cc,{size:15,style:{color:"var(--accent)"}}),d.jsx("span",{children:"Voltar à Lista Geral de Clubes"})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[d.jsxs("span",{className:"font-mono",style:{padding:"4px 10px",borderRadius:"12px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--accent)",color:"var(--accent)",fontSize:"0.74rem",fontWeight:700},children:["#",v.posicao||"—"," Power Ranking FutStats"]}),d.jsxs("span",{className:"font-mono",style:{padding:"4px 8px",borderRadius:"12px",backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",color:"var(--text-secondary)",fontSize:"0.72rem"},children:[v.pontos||0," pts ponderados"]})]})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"26px",backgroundColor:"var(--surface-panel)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-editorial)",display:"flex",flexDirection:"column",gap:"20px"},children:[d.jsxs("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"20px"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"20px",flexWrap:"wrap"},children:[d.jsx("div",{style:{width:"74px",height:"74px",borderRadius:"14px",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:d.jsx(vi,{team:f.nome,size:58})}),d.jsxs("div",{children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px",flexWrap:"wrap"},children:[d.jsxs("span",{style:{fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",color:"var(--accent)"},children:["Perfil Oficial do Clube • ",f.estado]}),f.alcunhas&&d.jsxs("span",{style:{fontSize:"0.74rem",color:"var(--text-muted)"},children:["• ",f.alcunhas]})]}),d.jsx("h1",{className:"font-editorial",style:{margin:0,fontSize:"2.1rem",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)"},children:f.nome}),d.jsx("div",{style:{fontSize:"0.88rem",color:"var(--text-secondary)",marginTop:"2px"},children:f.nome_oficial}),d.jsx("div",{style:{marginTop:"8px"},children:d.jsx(il,{coberturaPct:f.cobertura_pct||(f.fundacao?100:70)})})]})]}),d.jsxs("div",{style:{padding:"12px 18px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",textAlign:"right",minWidth:"170px"},children:[d.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.03em",fontWeight:600},children:"Valor Estimado do Elenco"}),d.jsxs("div",{className:"font-mono",style:{fontSize:"1.45rem",fontWeight:700,color:"var(--accent)",marginTop:"2px"},children:["€ ",f.valor_elenco_milhoes_eur?f.valor_elenco_milhoes_eur.toFixed(1):"—"," M"]}),d.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:["~ R$ ",((f.valor_elenco_milhoes_eur||0)*6.1).toFixed(0)," milhões"]})]})]}),d.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))",gap:"12px",borderTop:"1px solid var(--border-subtle)",paddingTop:"16px"},children:[d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Fundação"}),d.jsx("span",{className:"font-mono",style:{fontSize:"0.85rem",fontWeight:600,color:"var(--text-primary)"},children:f.fundacao||"—"})]}),d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Estádio Oficial"}),d.jsx("span",{style:{fontSize:"0.85rem",fontWeight:600,color:"var(--text-primary)"},children:f.estadio_nome||"—"}),f.estadio_capacidade&&d.jsxs("span",{className:"font-mono",style:{fontSize:"0.72rem",color:"var(--text-secondary)",marginLeft:"4px"},children:["(",f.estadio_capacidade.toLocaleString("pt-BR")," lug.)"]})]}),d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Presidente"}),d.jsx("span",{style:{fontSize:"0.85rem",fontWeight:600,color:"var(--text-primary)"},children:f.presidente||"—"})]}),d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-muted)",textTransform:"uppercase",display:"block"},children:"Comandante Técnico"}),d.jsx("span",{style:{fontSize:"0.85rem",fontWeight:600,color:"var(--accent)"},children:E.nome||f.treinador_atual||"—"}),E.esquema_preferido&&d.jsxs("span",{style:{fontSize:"0.72rem",color:"var(--text-secondary)",display:"block"},children:[E.esquema_preferido," • ",E.aproveitamento_pct,"% aprov."]})]})]})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border-subtle)",paddingBottom:"8px",flexWrap:"wrap",gap:"10px"},children:[d.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:[{id:"elenco",label:"Elenco 2026 & Líderes",icon:Pc,count:_.length},{id:"producao_ofensiva",label:"Produção Ofensiva por 90",icon:Target,count:((C=c==null?void 0:c.elenco_producao_ofensiva)==null?void 0:C.length)||0},{id:"torneios",label:"Desempenho por Torneios",icon:xa,count:T.length},{id:"trofeus",label:"Sala de Troféus (Réplicas 3D)",icon:kr,count:((A=n.trofeus)==null?void 0:A.length)||0},{id:"idolos",label:"Grandes Ídolos & Lendas",icon:jr,count:((x=f.idolos_historicos)==null?void 0:x.length)||0}].map(L=>{const q=L.icon,k=o===L.id;return d.jsxs("button",{onClick:()=>l(L.id),className:"touch-tactile",style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"var(--radius-control)",border:"1px solid",borderColor:k?"var(--accent)":"var(--border-subtle)",backgroundColor:k?"var(--accent)":"var(--surface-raised)",color:k?"#FFFFFF":"var(--text-secondary)",fontSize:"0.8rem",fontWeight:k?700:500,cursor:"pointer",transition:"all 0.15s ease"},children:[d.jsx(q,{size:14}),d.jsx("span",{children:L.label}),L.count>0&&d.jsx("span",{className:"font-mono",style:{fontSize:"0.68rem",padding:"1px 5px",borderRadius:"8px",backgroundColor:k?"rgba(255,255,255,0.25)":"var(--border-subtle)",color:k?"#FFFFFF":"var(--text-primary)"},children:L.count})]},L.id)})}),o==="elenco"&&d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px",backgroundColor:"var(--surface-card)",padding:"3px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)"},children:[d.jsxs("button",{onClick:()=>h("tabela"),title:"Visualização em Tabela Técnica",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.72rem",fontWeight:p==="tabela"?700:500,borderRadius:"4px",border:"none",backgroundColor:p==="tabela"?"var(--accent)":"transparent",color:p==="tabela"?"#FFFFFF":"var(--text-secondary)",cursor:"pointer"},children:[d.jsx(Lc,{size:13}),d.jsx("span",{children:"Tabela"})]}),d.jsxs("button",{onClick:()=>h("cards"),title:"Visualização em Cards por Posição",style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",fontSize:"0.72rem",fontWeight:p==="cards"?700:500,borderRadius:"4px",border:"none",backgroundColor:p==="cards"?"var(--accent)":"transparent",color:p==="cards"?"#FFFFFF":"var(--text-secondary)",cursor:"pointer"},children:[d.jsx(Nc,{size:13}),d.jsx("span",{children:"Cards"})]})]})]}),o==="elenco"&&d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"22px"},children:[d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[d.jsx(Dc,{size:15,style:{color:"var(--accent)"}}),d.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.15rem",color:"var(--text-primary)"},children:"Destaques Individuais na Temporada 2026"})]}),d.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(210px, 1fr))",gap:"12px"},children:[d.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:m.artilheiro?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>m.artilheiro&&t&&t(m.artilheiro.atleta,m.artilheiro.id_jogador),children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[d.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Artilheiro"}),d.jsx(jr,{size:14,style:{color:"var(--accent)"}})]}),d.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((S=m.artilheiro)==null?void 0:S.atleta)||"—"}),d.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[d.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:((F=m.artilheiro)==null?void 0:F.gols)??0}),d.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"gols marcados"})]})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:m.assistencias?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>m.assistencias&&t&&t(m.assistencias.atleta,m.assistencias.id_jogador),children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[d.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Líder em Assistências"}),d.jsx(Ic,{size:14,style:{color:"var(--accent)"}})]}),d.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((R=m.assistencias)==null?void 0:R.atleta)||"—"}),d.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[d.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:((w=m.assistencias)==null?void 0:w.assistencias)??0}),d.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"passes p/ gol"})]})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:m.melhor_nota?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>m.melhor_nota&&t&&t(m.melhor_nota.atleta,m.melhor_nota.id_jogador),children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[d.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Maior Nota Média"}),d.jsx(Uc,{size:14,style:{color:"var(--accent)"}})]}),d.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((D=m.melhor_nota)==null?void 0:D.atleta)||"—"}),d.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[d.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:(G=m.melhor_nota)!=null&&G.nota_media?Number(m.melhor_nota.nota_media).toFixed(2):"—"}),d.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"avaliação SofaScore"})]})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"14px",backgroundColor:"var(--surface-card)",cursor:m.desarmes?"pointer":"default",border:"1px solid var(--border-subtle)"},onClick:()=>m.desarmes&&t&&t(m.desarmes.atleta,m.desarmes.id_jogador),children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"},children:[d.jsx("span",{style:{fontSize:"0.68rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:"Líder em Desarmes"}),d.jsx(Fc,{size:14,style:{color:"var(--accent)"}})]}),d.jsx("div",{style:{fontSize:"0.96rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:((N=m.desarmes)==null?void 0:N.atleta)||"—"}),d.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"4px",marginTop:"4px"},children:[d.jsx("span",{className:"font-mono",style:{fontSize:"1.4rem",fontWeight:700,color:"var(--text-primary)"},children:((O=m.desarmes)==null?void 0:O.desarmes_ganhos)??0}),d.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"recuperações de bola"})]})]})]})]}),b&&b.length>0&&d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[d.jsxs("span",{style:{fontSize:"0.74rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-secondary)",letterSpacing:"0.04em"},children:["Forma Recente (Últimos ",b.length," confrontos oficiais)"]}),d.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:b.map((L,q)=>{const k=L.resultado==="V"?"#2e7d32":L.resultado==="E"?"#ed6c02":"#d32f2f";return d.jsxs("div",{style:{padding:"6px 12px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",display:"flex",alignItems:"center",gap:"8px"},title:`${L.data} • ${L.campeonato} • ${L.mando}: ${L.placar} vs ${L.adversario}`,children:[d.jsx("span",{style:{width:"20px",height:"20px",borderRadius:"4px",backgroundColor:k,color:"#FFFFFF",fontSize:"0.68rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"},children:L.resultado}),d.jsxs("div",{style:{display:"flex",flexDirection:"column",fontSize:"0.74rem"},children:[d.jsx("span",{style:{fontWeight:600,color:"var(--text-primary)"},children:L.placar}),d.jsx("span",{style:{fontSize:"0.66rem",color:"var(--text-muted)"},children:L.adversario})]})]},q)})})]}),d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[d.jsxs("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.25rem",color:"var(--text-primary)"},children:["Plantel de Atletas (",_.length," jogadores registrados)"]}),d.jsx("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:"Clique no jogador para abrir sua página e dossiê completo"})]}),p==="tabela"?d.jsx("div",{style:{width:"100%",overflowX:"auto",backgroundColor:"var(--surface-card)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-editorial)"},children:d.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",textAlign:"left",fontSize:"0.8rem"},children:[d.jsx("thead",{children:d.jsxs("tr",{style:{borderBottom:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)"},children:[d.jsx("th",{style:{padding:"10px 14px",fontWeight:600},children:"Atleta"}),d.jsx("th",{style:{padding:"10px 12px",fontWeight:600},children:"Posição"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Jogos"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Minutos"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Gols"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Assist."}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Nota"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"right",fontWeight:600},children:"Valor de Mercado"})]})}),d.jsx("tbody",{children:_.map((L,q)=>d.jsxs("tr",{onClick:()=>t&&t(L.atleta,L.id_jogador),style:{borderBottom:"1px solid var(--border-subtle)",cursor:"pointer",transition:"background-color 0.12s ease"},onMouseEnter:k=>{k.currentTarget.style.backgroundColor="var(--surface-raised)"},onMouseLeave:k=>{k.currentTarget.style.backgroundColor="transparent"},children:[d.jsxs("td",{style:{padding:"10px 14px",display:"flex",alignItems:"center",gap:"8px"},children:[d.jsx("span",{style:{fontWeight:700,color:"var(--text-primary)"},children:L.atleta}),d.jsx(Ts,{size:13,style:{color:"var(--text-muted)"}})]}),d.jsx("td",{style:{padding:"10px 12px",color:"var(--text-secondary)"},children:d.jsx("span",{style:{padding:"2px 6px",borderRadius:"4px",backgroundColor:"var(--surface-raised)",fontSize:"0.72rem",fontWeight:600},children:L.posicao||"—"})}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:L.jogos||0}),d.jsxs("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"var(--text-secondary)"},children:[L.minutos||0,"'"]}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",fontWeight:700,color:L.gols>0?"var(--accent)":"inherit"},children:L.gols||0}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:L.assistencias||0}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:L.nota_media?Number(L.nota_media).toFixed(2):"—"}),d.jsxs("td",{className:"font-mono",style:{padding:"10px 14px",textAlign:"right",fontWeight:700,color:"var(--text-primary)"},children:["€ ",L.valor_eur?(L.valor_eur/1e6).toFixed(1):"1.2"," M"]})]},q))})]})}):d.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"18px"},children:[{titulo:"Goleiros",lista:g.goleiros},{titulo:"Defensores (Zagueiros & Laterais)",lista:g.defensores},{titulo:"Meio-Campistas & Volantes",lista:g.meio_campistas},{titulo:"Atacantes & Pontas",lista:g.atacantes}].map((L,q)=>!L.lista||L.lista.length===0?null:d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[d.jsxs("span",{style:{fontSize:"0.74rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:"0.04em"},children:[L.titulo," (",L.lista.length,")"]}),d.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))",gap:"10px"},children:L.lista.map((k,K)=>d.jsxs("div",{onClick:()=>t&&t(k.atleta,k.id_jogador),className:"touch-tactile",style:{padding:"12px",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"space-between",gap:"8px",transition:"transform 0.15s ease, border-color 0.15s ease"},onMouseEnter:$=>{$.currentTarget.style.transform="translateY(-2px)",$.currentTarget.style.borderColor="var(--accent)"},onMouseLeave:$=>{$.currentTarget.style.transform="translateY(0)",$.currentTarget.style.borderColor="var(--border-subtle)"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[d.jsx("span",{style:{fontWeight:700,fontSize:"0.88rem",color:"var(--text-primary)"},children:k.atleta}),d.jsx(Ts,{size:14,style:{color:"var(--text-muted)"}})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"0.74rem",color:"var(--text-secondary)"},children:[d.jsx("span",{children:k.posicao}),d.jsxs("span",{className:"font-mono",children:["€ ",k.valor_eur?(k.valor_eur/1e6).toFixed(1):"1.2"," M"]})]}),d.jsxs("div",{style:{borderTop:"1px solid var(--border-subtle)",paddingTop:"6px",display:"flex",justifyContent:"space-between",fontSize:"0.72rem"},children:[d.jsxs("span",{children:[k.jogos||0," jogos (",k.minutos||0,"')"]}),d.jsxs("span",{style:{fontWeight:700,color:"var(--accent)"},children:[k.gols||0,"G • ",k.assistencias||0,"A"]})]})]},K))})]},q))})]})]}),o==="producao_ofensiva"&&d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"20px"},children:[d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"},children:[d.jsxs("div",{children:[d.jsx("span",{style:{fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.05em",color:"#85573B",fontWeight:700},children:"Fase 2 • Inteligência Analítica Golden Dataset"}),d.jsx("h3",{className:"font-editorial",style:{margin:"4px 0 0 0",fontSize:"1.35rem",color:"var(--text-primary)"},children:"Produção Ofensiva Decomposta do Elenco"}),d.jsxs("p",{style:{margin:"4px 0 0 0",fontSize:"0.84rem",color:"var(--text-secondary)"},children:["Métricas de Gols/90 (bola rolando vs pênalti), titularidade e dependência ofensiva para a temporada ",(c==null?void 0:c.periodo_analitico)||"2026","."]})]}),d.jsx("div",{children:d.jsx(il,{coberturaPct:100})})]}),((H=c==null?void 0:c.principais_dependentes_ofensivos)==null?void 0:H.length)>0&&d.jsxs("div",{children:[d.jsx("h4",{style:{fontSize:"0.9rem",fontWeight:700,margin:"0 0 10px 0",color:"var(--text-primary)"},children:"Concentração Ofensiva (Principais Dependentes)"}),d.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:"12px"},children:c.principais_dependentes_ofensivos.map((L,q)=>d.jsxs("div",{style:{padding:"14px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-subtle)"},children:[d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"},children:[d.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:700,color:"#85573B"},children:["#",q+1," Artilheiro Tático"]}),d.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:700,padding:"2px 8px",borderRadius:"12px",backgroundColor:"#5A673E20",color:"#5A673E"},children:[L.gols_por_90.toFixed(2)," / 90min"]})]}),d.jsx("div",{style:{fontSize:"1.05rem",fontWeight:800,color:"var(--text-primary)"},children:L.atleta}),d.jsxs("div",{style:{fontSize:"0.78rem",color:"var(--text-secondary)",marginTop:"2px"},children:[L.posicao," • ",L.gols," gols (",L.gols_abertos," abertos, ",L.gols_penalti," pen)"]}),d.jsxs("div",{style:{marginTop:"10px",paddingTop:"8px",borderTop:"1px solid var(--border-subtle)",display:"flex",justifyContent:"space-between",fontSize:"0.8rem"},children:[d.jsx("span",{style:{color:"var(--text-secondary)"},children:"Dependência Geral:"}),d.jsxs("strong",{style:{color:"#85573B"},children:[L.dependencia_ofensiva_geral,"% dos gols"]})]}),d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"0.76rem",color:"var(--text-tertiary)",marginTop:"2px"},children:[d.jsx("span",{children:"Em campo:"}),d.jsxs("span",{children:[L.dependencia_ofensiva_em_campo,"%"]})]})]},L.atleta_id||q))})]}),d.jsx("div",{style:{width:"100%",overflowX:"auto",backgroundColor:"var(--surface-card)",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)"},children:d.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",textAlign:"left",fontSize:"0.82rem"},children:[d.jsx("thead",{children:d.jsxs("tr",{style:{backgroundColor:"var(--surface-panel)",borderBottom:"1px solid var(--border-subtle)",color:"var(--text-secondary)"},children:[d.jsx("th",{style:{padding:"10px 14px"},children:"Atleta"}),d.jsx("th",{style:{padding:"10px 14px"},children:"Posição"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"center"},children:"Minutos"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"center"},children:"Gols (Abertos + Pen)"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"center"},children:"Gols/90"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"center"},children:"Gols/90 Titular"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"center"},children:"Titularidade"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"center"},children:"Dep. Geral"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"center"},children:"Dep. Em Campo"})]})}),d.jsx("tbody",{children:((c==null?void 0:c.elenco_producao_ofensiva)||[]).map((L,q)=>d.jsxs("tr",{style:{borderBottom:"1px solid var(--border-subtle)",backgroundColor:q%2===0?"transparent":"var(--surface-panel)"},children:[d.jsx("td",{style:{padding:"10px 14px",fontWeight:700,color:"var(--text-primary)"},children:L.atleta}),d.jsx("td",{style:{padding:"10px 14px",color:"var(--text-secondary)"},children:L.posicao}),d.jsx("td",{style:{padding:"10px 14px",textAlign:"center",fontFamily:"monospace"},children:L.minutos}),d.jsxs("td",{style:{padding:"10px 14px",textAlign:"center",fontWeight:700},children:[L.gols," ",d.jsxs("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",fontWeight:400},children:["(",L.gols_abertos," + ",L.gols_penalti,")"]})]}),d.jsx("td",{style:{padding:"10px 14px",textAlign:"center",fontFamily:"monospace",fontWeight:800,color:"#5A673E"},children:L.gols_por_90.toFixed(2)}),d.jsx("td",{style:{padding:"10px 14px",textAlign:"center",fontFamily:"monospace",color:"var(--text-secondary)"},children:L.gols_por_90_titular.toFixed(2)}),d.jsxs("td",{style:{padding:"10px 14px",textAlign:"center",fontFamily:"monospace"},children:[L.titularidade_pct.toFixed(1),"%"]}),d.jsxs("td",{style:{padding:"10px 14px",textAlign:"center",fontWeight:700,color:"#85573B"},children:[L.dependencia_ofensiva_geral,"%"]}),d.jsxs("td",{style:{padding:"10px 14px",textAlign:"center",color:"var(--text-secondary)"},children:[L.dependencia_ofensiva_em_campo,"%"]})]},L.atleta_id||q))})]})}),d.jsxs("div",{style:{padding:"12px 16px",borderRadius:"var(--radius-control)",backgroundColor:"var(--surface-panel)",border:"1px solid var(--border-subtle)",fontSize:"0.78rem",color:"var(--text-secondary)"},children:[d.jsx("strong",{children:"Nota de Governança Analítica:"}),d.jsxs("p",{style:{margin:"4px 0 0 0",lineHeight:1.5},children:["A ",d.jsx("strong",{children:"Dependência Geral"})," mede a participação direta do atleta sobre todos os gols marcados pelo clube no torneio. A ",d.jsx("strong",{children:"Dependência Em Campo"})," isola apenas as partidas em que o atleta participou, neutralizando desfalques e convocações."]})]})]}),o==="torneios"&&d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[d.jsxs("div",{children:[d.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.25rem",color:"var(--text-primary)"},children:"Campanhas em Torneios (Atuais & Passados)"}),d.jsxs("p",{style:{margin:"4px 0 0 0",fontSize:"0.82rem",color:"var(--text-secondary)"},children:["Retrospecto consolidado extraído de 115.000+ partidas oficiais disputadas pelo ",f.nome,"."]})]}),d.jsx("div",{style:{width:"100%",overflowX:"auto",backgroundColor:"var(--surface-card)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-editorial)"},children:d.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",textAlign:"left",fontSize:"0.8rem"},children:[d.jsx("thead",{children:d.jsxs("tr",{style:{borderBottom:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-secondary)"},children:[d.jsx("th",{style:{padding:"10px 14px",fontWeight:600},children:"Ano"}),d.jsx("th",{style:{padding:"10px 12px",fontWeight:600},children:"Competição"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Jogos"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Vitórias"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Empates"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"Derrotas"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"GP"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"GC"}),d.jsx("th",{style:{padding:"10px 10px",textAlign:"center",fontWeight:600},children:"SG"}),d.jsx("th",{style:{padding:"10px 14px",textAlign:"right",fontWeight:600},children:"Aprov. %"})]})}),d.jsx("tbody",{children:T.map((L,q)=>d.jsxs("tr",{style:{borderBottom:"1px solid var(--border-subtle)"},children:[d.jsx("td",{className:"font-mono",style:{padding:"10px 14px",fontWeight:700},children:L.ano}),d.jsx("td",{style:{padding:"10px 12px",fontWeight:600,color:"var(--text-primary)"},children:L.campeonato}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:L.jogos}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"#2e7d32",fontWeight:600},children:L.vitorias}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"#ed6c02"},children:L.empates}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",color:"#d32f2f"},children:L.derrotas}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:L.gols_pro}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center"},children:L.gols_contra}),d.jsx("td",{className:"font-mono",style:{padding:"10px 10px",textAlign:"center",fontWeight:700,color:L.saldo>0?"#2e7d32":L.saldo<0?"#d32f2f":"inherit"},children:L.saldo>0?`+${L.saldo}`:L.saldo}),d.jsxs("td",{className:"font-mono",style:{padding:"10px 14px",textAlign:"right",fontWeight:700,color:"var(--accent)"},children:[L.aproveitamento,"%"]})]},q))})]})})]}),o==="trofeus"&&d.jsx("div",{style:{width:"100%"},children:d.jsx(ac,{clube:f.nome})}),o==="idolos"&&d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[d.jsxs("div",{children:[d.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.25rem",color:"var(--text-primary)"},children:"Galeria de Grandes Ídolos & Lendas Eternas"}),d.jsxs("p",{style:{margin:"4px 0 0 0",fontSize:"0.82rem",color:"var(--text-secondary)"},children:["Jogadores históricos que marcaram época e conquistaram as maiores glórias pelo ",f.nome,"."]})]}),d.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:"14px"},children:(f.idolos_historicos||[]).map((L,q)=>d.jsxs("div",{className:"editorial-panel",style:{padding:"16px",backgroundColor:"var(--surface-card)",borderRadius:"var(--radius-panel)",border:"1px solid var(--border-subtle)",display:"flex",flexDirection:"column",gap:"8px"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[d.jsx("span",{style:{fontSize:"0.7rem",fontWeight:700,color:"var(--accent)",textTransform:"uppercase"},children:L.posicao}),d.jsx(jr,{size:15,style:{color:"var(--accent)"}})]}),d.jsx("div",{style:{fontSize:"1.05rem",fontWeight:700,color:"var(--text-primary)"},children:L.nome}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:"0.78rem",color:"var(--text-secondary)"},children:[d.jsx(Oc,{size:13,style:{color:"var(--text-muted)"}}),d.jsx("span",{children:L.periodo})]}),d.jsxs("div",{style:{borderTop:"1px solid var(--border-subtle)",paddingTop:"8px",display:"flex",justifyContent:"space-between",fontSize:"0.74rem"},children:[d.jsxs("span",{children:[L.jogos," partidas"]}),d.jsxs("span",{className:"font-mono",style:{fontWeight:700,color:"var(--text-primary)"},children:[L.gols," gols"]})]})]},q))})]})]})}function ag({timesAnalise:i,timesLoading:e,timesRecorte:t,setTimesRecorte:n,timesCampeonato:r,setTimesCampeonato:s,timesSearch:a,setTimesSearch:o,onRecarregar:l,onSelectJogador:c}){var G,N;const[u,p]=ze.useState("aproveitamento"),[h,f]=ze.useState(!1),[v,E]=ze.useState(null),[g,m]=ze.useState("Flamengo"),[b,T]=ze.useState("campanhas"),[_,C]=ze.useState(null),[A,x]=ze.useState(!1),S=ze.useRef(null);ze.useEffect(()=>{function O(H){S.current&&!S.current.contains(H.target)&&x(!1)}return document.addEventListener("mousedown",O),()=>document.removeEventListener("mousedown",O)},[]);const F=ze.useMemo(()=>{if(!a||a.trim().length<1)return[];const O=a.toLowerCase(),H=new Set,L=[];return(i||[]).forEach(q=>{const k=q.clube||q.nome||"";k&&k.toLowerCase().includes(O)&&!H.has(k)&&(H.add(k),L.push(k))}),L.slice(0,6)},[i,a]),R=ze.useMemo(()=>{let O=(i||[]).filter(H=>a?(H.clube||H.nome||"").toLowerCase().includes(a.toLowerCase()):!0);return O.sort((H,L)=>{const q=($,ae)=>ae==="nome"||ae==="clube"?$.clube||$.nome||"":ae==="gols_marcados"||ae==="gols_pro"?$.gols_pro??$.gols_marcados??0:ae==="gols_sofridos"||ae==="gols_contra"?$.gols_contra??$.gols_sofridos??0:ae==="saldo_gols"?$.saldo_gols??($.gols_pro??$.gols_marcados??0)-($.gols_contra??$.gols_sofridos??0):$[ae]??0;let k=q(H,u),K=q(L,u);return typeof k=="string"?h?k.localeCompare(K):K.localeCompare(k):h?k-K:K-k}),O},[i,a,u,h]),w=ze.useMemo(()=>{if(!i||i.length===0)return null;const O=i.length,H=i.reduce((ae,we)=>ae+(we.aproveitamento||0),0)/O,L=i.reduce((ae,we)=>ae+(we.gols_pro??we.gols_marcados??0),0),q=i.reduce((ae,we)=>ae+(we.jogos||0),0),k=q>0?L/q:0,K=i.reduce((ae,we)=>ae+(we.btts_pct||0),0)/O,$=i.reduce((ae,we)=>ae+(we.clean_sheets_pct||0),0)/O;return{totalClubes:O,mediaAprov:H.toFixed(1),mediaGolsJogo:k.toFixed(2),mediaBtts:K.toFixed(1),mediaCleanSheets:$.toFixed(1)}},[i]),D=O=>{u===O?f(!h):(p(O),f(!1))};return _?d.jsx(ng,{clube:_,onVoltar:()=>C(null),onSelectJogador:c}):d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[d.jsxs("div",{children:[d.jsx("div",{style:{fontSize:"0.78rem",color:"var(--text-secondary)",marginBottom:"8px",letterSpacing:"0.04em",textTransform:"uppercase"},children:"Futebol Brasileiro • Módulo Analítico de Clubes"}),d.jsx("h1",{className:"font-editorial",style:{fontSize:"2.2rem",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",marginBottom:"6px"},children:"Forma Recente, Produção e Defesa dos Clubes"}),d.jsx("p",{style:{fontSize:"0.92rem",color:"var(--text-secondary)",maxWidth:"780px",lineHeight:1.55},children:"Recorte analítico oficial medindo aproveitamento de pontos, frequência de baliza inviolada (clean sheets) e probabilidade de ambas marcam (BTTS) com separação de mando de campo."})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"14px"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[d.jsx("span",{style:{fontSize:"0.76rem",fontWeight:600,color:"var(--text-secondary)"},children:"Amostra:"}),["5","10","20"].map(O=>d.jsxs("button",{onClick:()=>n(O),style:{padding:"7px 14px",minHeight:"38px",borderRadius:"var(--radius-control)",fontSize:"0.8rem",fontWeight:600,border:"1px solid var(--border-subtle)",backgroundColor:t===O?"var(--accent)":"var(--surface-raised)",color:t===O?"var(--accent-foreground)":"var(--text-primary)",cursor:"pointer"},"aria-label":`Filtrar pelos últimos ${O} jogos`,children:["Últimos ",O]},O))]}),d.jsx("div",{style:{height:"20px",width:"1px",backgroundColor:"var(--border-subtle)"}}),d.jsxs("select",{value:r,onChange:O=>s(O.target.value),style:{padding:"8px 12px",minHeight:"38px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-primary)",fontSize:"0.82rem",fontWeight:600,cursor:"pointer"},"aria-label":"Selecionar campeonato para análise de clubes",children:[d.jsx("option",{value:"",children:"Geral Recente (Todas Competições)"}),d.jsx("option",{value:"Campeonato Brasileiro",children:"Brasileirão Série A"}),d.jsx("option",{value:"Copa do Brasil",children:"Copa do Brasil"}),d.jsx("option",{value:"Campeonato Paulista",children:"Paulistão"}),d.jsx("option",{value:"Campeonato Carioca",children:"Carioca"}),d.jsx("option",{value:"Campeonato Gaúcho",children:"Gauchão"}),d.jsx("option",{value:"Campeonato Mineiro",children:"Mineiro"})]})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",flex:"1 1 auto",justifyContent:"flex-end",minWidth:"220px"},children:[d.jsxs("div",{ref:S,style:{position:"relative",flex:"1 1 180px",maxWidth:"300px"},children:[d.jsx(Bc,{size:14,style:{position:"absolute",left:"10px",top:"12px",color:"var(--text-muted)",zIndex:2}}),d.jsx("input",{type:"text",value:a,onChange:O=>{o(O.target.value),x(!0)},onFocus:()=>x(!0),onKeyDown:O=>{O.key==="Enter"&&(F.length>0?(C(F[0]),x(!1)):a.trim().length>0&&(C(a.trim()),x(!1)))},placeholder:"Buscar clube (ex: Palmeiras, Flamengo)...",style:{width:"100%",padding:"8px 10px 8px 30px",minHeight:"38px",borderRadius:"var(--radius-control)",border:"1px solid var(--border-subtle)",backgroundColor:"var(--surface-raised)",color:"var(--text-primary)",fontSize:"0.82rem",boxSizing:"border-box"},"aria-label":"Buscar clube na tabela ou ver perfil completo"}),A&&F.length>0&&d.jsxs("div",{style:{position:"absolute",top:"100%",left:0,right:0,marginTop:"4px",backgroundColor:"var(--surface-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",boxShadow:"0 8px 24px rgba(0,0,0,0.18)",zIndex:99,overflow:"hidden"},children:[d.jsx("div",{style:{padding:"6px 10px",fontSize:"0.68rem",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",borderBottom:"1px solid var(--border-subtle)"},children:"Abrir Perfil Oficial do Clube"}),F.map((O,H)=>d.jsxs("div",{onClick:()=>{C(O),x(!1)},style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",cursor:"pointer",borderBottom:H<F.length-1?"1px solid var(--border-subtle)":"none",transition:"background-color 0.12s ease"},onMouseEnter:L=>{L.currentTarget.style.backgroundColor="var(--surface-raised)"},onMouseLeave:L=>{L.currentTarget.style.backgroundColor="transparent"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[d.jsx(vi,{team:O,size:20}),d.jsx("span",{style:{fontWeight:600,fontSize:"0.82rem",color:"var(--text-primary)"},children:O})]}),d.jsx("span",{style:{fontSize:"0.72rem",color:"var(--accent)",fontWeight:600},children:"Ver Perfil →"})]},H))]})]}),d.jsxs("button",{onClick:()=>l(t,r),disabled:e,style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",minHeight:"38px",borderRadius:"var(--radius-control)",backgroundColor:"var(--accent)",color:"var(--accent-foreground)",border:"none",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"},"aria-label":"Atualizar dados de rendimento dos clubes",children:[d.jsx(zc,{size:14,className:e?"animate-spin":""}),d.jsx("span",{children:e?"Carregando...":"Atualizar"})]})]})]}),w&&d.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(210px, 1fr))",gap:"12px"},children:[d.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[d.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Aproveitamento Médio"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaAprov,"%"]}),d.jsxs("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:["Base: ",w.totalClubes," clubes na amostra"]})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[d.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Média de Gols Marcados"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaGolsJogo," ",d.jsx("span",{style:{fontSize:"0.85rem",fontWeight:500,color:"var(--text-muted)"},children:"/ jogo"})]}),d.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:"Produção ofensiva consolidada"})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[d.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Ambas Marcam (BTTS)"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaBtts,"%"]}),d.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:"Partidas com gols mútuos"})]}),d.jsxs("div",{className:"editorial-panel",style:{padding:"16px 18px"},children:[d.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px"},children:"Baliza Inviolada (Clean Sheets)"}),d.jsxs("div",{className:"tabular-nums",style:{fontSize:"1.75rem",fontWeight:700,color:"var(--text-primary)"},children:[w.mediaCleanSheets,"%"]}),d.jsx("div",{style:{fontSize:"0.74rem",color:"var(--text-muted)",marginTop:"2px"},children:"Jogos sem sofrer gols"})]})]}),d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",borderBottom:"1px solid var(--border-subtle)",paddingBottom:"8px"},children:[d.jsxs("button",{onClick:()=>T("campanhas"),style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"var(--radius-control)",fontSize:"0.82rem",fontWeight:b==="campanhas"?700:500,backgroundColor:b==="campanhas"?"var(--accent)":"transparent",color:b==="campanhas"?"var(--accent-foreground)":"var(--text-secondary)",border:"none",cursor:"pointer",transition:"all 0.15s ease"},children:[d.jsx(kc,{size:14}),d.jsx("span",{children:"Grandes Campanhas (Rodada a Rodada)"})]}),d.jsxs("button",{onClick:()=>T("trofeus"),style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"var(--radius-control)",fontSize:"0.82rem",fontWeight:b==="trofeus"?700:500,backgroundColor:b==="trofeus"?"var(--accent)":"transparent",color:b==="trofeus"?"var(--accent-foreground)":"var(--text-secondary)",border:"none",cursor:"pointer",transition:"all 0.15s ease"},children:[d.jsx(kr,{size:14}),d.jsx("span",{children:"Sala de Troféus (Réplicas 3D)"})]}),d.jsxs("button",{onClick:()=>T("auditoria"),style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"var(--radius-control)",fontSize:"0.82rem",fontWeight:b==="auditoria"?700:500,backgroundColor:b==="auditoria"?"var(--accent)":"transparent",color:b==="auditoria"?"var(--accent-foreground)":"var(--text-secondary)",border:"none",cursor:"pointer",transition:"all 0.15s ease"},children:[d.jsx(va,{size:14}),d.jsx("span",{children:"Auditoria & Qualidade de Gols"})]}),d.jsxs("button",{onClick:()=>T("decadas"),style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"var(--radius-control)",fontSize:"0.82rem",fontWeight:b==="decadas"?700:500,backgroundColor:b==="decadas"?"var(--accent)":"transparent",color:b==="decadas"?"var(--accent-foreground)":"var(--text-secondary)",border:"none",cursor:"pointer",transition:"all 0.15s ease"},children:[d.jsx(Gc,{size:14}),d.jsx("span",{children:"Panorama Histórico por Décadas"})]})]}),b==="campanhas"?d.jsx(Yc,{clubeInicial:v||g||"Flamengo",anoInicial:2019}):b==="trofeus"?d.jsx(ac,{clube:v||g||((G=R[0])==null?void 0:G.clube)||"Flamengo",darkMode:!1}):b==="auditoria"?d.jsx(Zc,{}):d.jsx(Xc,{clubeNome:v||g||((N=R[0])==null?void 0:N.clube)||"Flamengo",partidas:[],altura:230})]}),d.jsxs("div",{className:"editorial-panel",style:{overflow:"hidden"},children:[d.jsxs("div",{style:{padding:"16px 20px",borderBottom:"1px solid var(--border-subtle)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[d.jsxs("div",{children:[d.jsx("h3",{className:"font-editorial",style:{margin:0,fontSize:"1.15rem",fontWeight:700,color:"var(--text-primary)"},children:"Classificação por Desempenho e Eficiência"}),d.jsx("span",{style:{fontSize:"0.76rem",color:"var(--text-secondary)"},children:"Clique em qualquer coluna para reordenar a classificação."})]}),d.jsxs("div",{style:{fontSize:"0.76rem",color:"var(--text-muted)"},children:["Exibindo ",d.jsx("strong",{children:R.length})," clubes"]})]}),d.jsx("div",{style:{overflowX:"auto"},children:d.jsxs("table",{className:"editorial-table",children:[d.jsx("thead",{children:d.jsxs("tr",{children:[d.jsx("th",{style:{width:"44px",textAlign:"center",position:"sticky",left:0,zIndex:3,backgroundColor:"var(--surface-raised)"},children:"#"}),d.jsx("th",{onClick:()=>D("nome"),style:{cursor:"pointer",position:"sticky",left:"44px",zIndex:3,backgroundColor:"var(--surface-raised)",boxShadow:"2px 0 6px -2px rgba(0,0,0,0.1)"},children:d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px"},children:["Clube ",u==="nome"&&d.jsx(Cn,{size:12,color:"var(--accent)"})]})}),d.jsxs("th",{onClick:()=>D("jogos"),style:{cursor:"pointer",textAlign:"center"},children:["J ",u==="jogos"&&d.jsx(Cn,{size:12})]}),d.jsx("th",{style:{textAlign:"center"},children:"V - E - D"}),d.jsx("th",{style:{textAlign:"center"},children:"Forma Recente"}),d.jsxs("th",{onClick:()=>D("gols_marcados"),style:{cursor:"pointer",textAlign:"center"},children:["GP ",u==="gols_marcados"&&d.jsx(Cn,{size:12})]}),d.jsxs("th",{onClick:()=>D("gols_sofridos"),style:{cursor:"pointer",textAlign:"center"},children:["GC ",u==="gols_sofridos"&&d.jsx(Cn,{size:12})]}),d.jsxs("th",{onClick:()=>D("saldo_gols"),style:{cursor:"pointer",textAlign:"center"},children:["SG ",u==="saldo_gols"&&d.jsx(Cn,{size:12})]}),d.jsx("th",{onClick:()=>D("aproveitamento"),style:{cursor:"pointer"},children:d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px"},children:["Aprov. % ",u==="aproveitamento"&&d.jsx(Cn,{size:12,color:"var(--accent)"})]})}),d.jsxs("th",{className:"hide-tablet-col",onClick:()=>D("btts_pct"),style:{cursor:"pointer",textAlign:"center"},children:["BTTS % ",u==="btts_pct"&&d.jsx(Cn,{size:12})]}),d.jsxs("th",{className:"hide-tablet-col",onClick:()=>D("clean_sheets_pct"),style:{cursor:"pointer",textAlign:"center"},children:["CS % ",u==="clean_sheets_pct"&&d.jsx(Cn,{size:12})]}),d.jsx("th",{style:{width:"40px"}})]})}),d.jsx("tbody",{children:R.map((O,H)=>{var le,Ee,De,me;const L=O.clube||O.nome||"Clube",q=v===L,k=(O.aproveitamento||0).toFixed(1),K=O.sequencia||O.forma_recente||[],$=O.gols_pro??O.gols_marcados??0,ae=O.gols_contra??O.gols_sofridos??0,we=O.saldo_gols??$-ae,Y=O.partidas_recentes||O.ultimos_jogos||[];return d.jsxs(Hc.Fragment,{children:[d.jsxs("tr",{onClick:()=>{E(q?null:L),m(L)},style:{cursor:"pointer",backgroundColor:q?"var(--surface-raised)":"transparent"},role:"button",tabIndex:0,onKeyDown:Ae=>{Ae.key==="Enter"&&E(q?null:L)},"aria-expanded":q,"aria-label":`Detalhes de ${L}`,children:[d.jsx("td",{style:{textAlign:"center",color:"var(--text-secondary)",fontWeight:600,position:"sticky",left:0,zIndex:2,backgroundColor:q?"var(--surface-raised)":"var(--surface-panel)"},children:H+1}),d.jsx("td",{style:{fontWeight:600,color:"var(--text-primary)",position:"sticky",left:"44px",zIndex:2,backgroundColor:q?"var(--surface-raised)":"var(--surface-panel)",boxShadow:"2px 0 6px -2px rgba(0,0,0,0.1)"},children:d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[d.jsx(vi,{nome:L,size:22}),d.jsx("span",{children:L})]})}),d.jsx("td",{style:{textAlign:"center"},children:O.jogos}),d.jsxs("td",{style:{textAlign:"center",color:"var(--text-secondary)"},children:[O.vitorias,"-",O.empates,"-",O.derrotas]}),d.jsx("td",{style:{textAlign:"center"},children:d.jsx("div",{style:{display:"flex",gap:"3px",justifyContent:"center"},children:K.slice(-5).map((Ae,lt)=>{let Fe="var(--surface-raised)",je="var(--text-secondary)";return Ae==="V"?(Fe="var(--positive-bg)",je="var(--positive)"):Ae==="D"&&(Fe="var(--negative-bg)",je="var(--negative)"),d.jsx("span",{style:{display:"inline-block",width:"20px",height:"20px",borderRadius:"3px",backgroundColor:Fe,color:je,fontSize:"0.7rem",fontWeight:700,lineHeight:"20px",textAlign:"center"},children:Ae},lt)})})}),d.jsx("td",{style:{textAlign:"center"},children:$}),d.jsx("td",{style:{textAlign:"center"},children:ae}),d.jsx("td",{style:{textAlign:"center",fontWeight:600,color:we>=0?"var(--positive)":"var(--negative)"},children:we>0?`+${we}`:we}),d.jsx("td",{children:d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[d.jsxs("span",{style:{fontWeight:700,minWidth:"42px"},children:[k,"%"]}),d.jsx("div",{style:{flex:1,height:"4px",backgroundColor:"var(--border-subtle)",borderRadius:"2px",overflow:"hidden"},children:d.jsx("div",{style:{width:`${Math.min(O.aproveitamento||0,100)}%`,height:"100%",backgroundColor:"var(--accent)"}})})]})}),d.jsxs("td",{className:"hide-tablet-col",style:{textAlign:"center"},children:[(O.btts_pct||0).toFixed(0),"%"]}),d.jsxs("td",{className:"hide-tablet-col",style:{textAlign:"center"},children:[(O.clean_sheets_pct||0).toFixed(0),"%"]}),d.jsx("td",{style:{textAlign:"center",color:"var(--text-muted)"},children:q?d.jsx(Vc,{size:14}):d.jsx(Wc,{size:14})})]}),q&&d.jsx("tr",{children:d.jsx("td",{colSpan:12,style:{backgroundColor:"var(--surface-panel)",padding:"16px 20px",borderBottom:"1px solid var(--border-subtle)"},children:d.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"6px"},children:[d.jsxs("span",{style:{fontSize:"0.82rem",fontWeight:700,color:"var(--text-primary)"},children:["Histórico recente dos jogos de ",L," na amostra:"]}),d.jsxs("span",{style:{fontSize:"0.74rem",color:"var(--text-secondary)"},children:["Casa: ",((le=O.casa)==null?void 0:le.aproveitamento)||0,"% (",((Ee=O.casa)==null?void 0:Ee.vitorias)||0,"V em ",((De=O.casa)==null?void 0:De.jogos)||0,"J) • Fora: ",((me=O.fora)==null?void 0:me.aproveitamento)||0,"%"]})]}),d.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",gap:"8px"},children:Y.map((Ae,lt)=>d.jsxs("div",{style:{backgroundColor:"var(--surface-raised)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-control)",padding:"8px 12px",fontSize:"0.78rem"},children:[d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",color:"var(--text-secondary)",fontSize:"0.7rem"},children:[d.jsx("span",{children:Ae.data||"Data N/I"}),d.jsx("span",{children:Ae.mando==="Casa"||Ae.mando==="C"?"Em Casa":"Fora"})]}),d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"6px",fontWeight:600},children:[d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[d.jsx(vi,{nome:Ae.adversario,size:16}),d.jsx("span",{children:Ae.adversario})]}),d.jsxs("span",{className:"tabular-nums",style:{color:Ae.resultado==="V"?"var(--positive)":Ae.resultado==="D"?"var(--negative)":"var(--text-secondary)",fontWeight:700},children:[Ae.placar," (",Ae.resultado,")"]})]})]},lt))})]})})})]},L)})})]})})]}),d.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",fontSize:"0.78rem",color:"var(--text-muted)"},children:[d.jsx(jc,{size:14}),d.jsx("span",{children:"Fonte: Base de dados relacional oficial FutStats. Amostras ordenadas cronologicamente pelas partidas mais recentes com placares auditados."})]})]})}export{ag as default};
