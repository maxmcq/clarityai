import { useState, useRef, useEffect } from "react";

const TRANSLATIONS = {
  en: { name:"English",flag:"🇬🇧",tagline:"FREE AI ACCOUNTING — FOR EVERYONE",online:"ONLINE",chatTab:"💬 AI Assistant",trackerTab:"📊 Expense Tracker",chatPlaceholder:"Ask about taxes, budgeting, expenses, accounting...",send:"SEND →",totalSpent:"TOTAL SPENT",topCategory:"TOP CATEGORY",transactions:"TRANSACTIONS",addExpense:"ADD EXPENSE",description:"DESCRIPTION",descPlaceholder:"e.g. Office supplies",amount:"AMOUNT ($)",category:"CATEGORY",date:"DATE",add:"+ ADD",aiInsight:"✨ AI FINANCIAL INSIGHT",analyzeBtn:"ANALYZE MY SPENDING",analyzing:"ANALYZING...",history:"TRANSACTION HISTORY",noExpenses:"No expenses yet. Add one above.",apiKeyLabel:"Anthropic API Key",apiKeyPlaceholder:"Paste your API key here (sk-ant-...)",apiKeyHint:"Your key is never stored — it lives only in this browser session.",saveKey:"Save Key",keyMissing:"⚠️ Please enter your Anthropic API key above to use the AI features.",disclaimer:"⚠️ For informational purposes only. Always consult a licensed accountant for official advice." },
  es: { name:"Español",flag:"🇪🇸",tagline:"CONTABILIDAD IA GRATUITA — PARA TODOS",online:"EN LÍNEA",chatTab:"💬 Asistente IA",trackerTab:"📊 Gastos",chatPlaceholder:"Pregunta sobre impuestos, presupuesto, gastos...",send:"ENVIAR →",totalSpent:"TOTAL GASTADO",topCategory:"CATEGORÍA PRINCIPAL",transactions:"TRANSACCIONES",addExpense:"AGREGAR GASTO",description:"DESCRIPCIÓN",descPlaceholder:"ej. Material de oficina",amount:"CANTIDAD ($)",category:"CATEGORÍA",date:"FECHA",add:"+ AGREGAR",aiInsight:"✨ ANÁLISIS FINANCIERO IA",analyzeBtn:"ANALIZAR MIS GASTOS",analyzing:"ANALIZANDO...",history:"HISTORIAL DE TRANSACCIONES",noExpenses:"Sin gastos aún. Agrega uno arriba.",apiKeyLabel:"Clave API de Anthropic",apiKeyPlaceholder:"Pega tu clave aquí (sk-ant-...)",apiKeyHint:"Tu clave nunca se guarda — solo existe en esta sesión.",saveKey:"Guardar Clave",keyMissing:"⚠️ Ingresa tu clave API de Anthropic para usar las funciones de IA.",disclaimer:"⚠️ Solo para fines informativos. Consulta siempre a un contador certificado." },
  fr: { name:"Français",flag:"🇫🇷",tagline:"COMPTABILITÉ IA GRATUITE — POUR TOUS",online:"EN LIGNE",chatTab:"💬 Assistant IA",trackerTab:"📊 Dépenses",chatPlaceholder:"Posez des questions sur les impôts, le budget...",send:"ENVOYER →",totalSpent:"TOTAL DÉPENSÉ",topCategory:"CATÉGORIE PRINCIPALE",transactions:"TRANSACTIONS",addExpense:"AJOUTER UNE DÉPENSE",description:"DESCRIPTION",descPlaceholder:"ex. Fournitures de bureau",amount:"MONTANT ($)",category:"CATÉGORIE",date:"DATE",add:"+ AJOUTER",aiInsight:"✨ ANALYSE FINANCIÈRE IA",analyzeBtn:"ANALYSER MES DÉPENSES",analyzing:"ANALYSE...",history:"HISTORIQUE DES TRANSACTIONS",noExpenses:"Aucune dépense. Ajoutez-en une ci-dessus.",apiKeyLabel:"Clé API Anthropic",apiKeyPlaceholder:"Collez votre clé ici (sk-ant-...)",apiKeyHint:"Votre clé n'est jamais stockée — elle vit uniquement dans cette session.",saveKey:"Enregistrer",keyMissing:"⚠️ Veuillez entrer votre clé API Anthropic pour utiliser les fonctions IA.",disclaimer:"⚠️ À titre informatif uniquement. Consultez toujours un comptable agréé." },
  ar: { name:"العربية",flag:"🇸🇦",tagline:"محاسبة ذكاء اصطناعي مجانية — للجميع",online:"متصل",chatTab:"💬 مساعد الذكاء الاصطناعي",trackerTab:"📊 تتبع المصروفات",chatPlaceholder:"اسأل عن الضرائب، الميزانية، المصروفات...",send:"إرسال →",totalSpent:"إجمالي الإنفاق",topCategory:"الفئة الأعلى",transactions:"المعاملات",addExpense:"إضافة مصروف",description:"الوصف",descPlaceholder:"مثال: لوازم مكتبية",amount:"المبلغ ($)",category:"الفئة",date:"التاريخ",add:"+ إضافة",aiInsight:"✨ تحليل مالي بالذكاء الاصطناعي",analyzeBtn:"تحليل إنفاقي",analyzing:"جارٍ التحليل...",history:"سجل المعاملات",noExpenses:"لا توجد مصروفات بعد. أضف واحدة أعلاه.",apiKeyLabel:"مفتاح API من Anthropic",apiKeyPlaceholder:"الصق مفتاحك هنا (sk-ant-...)",apiKeyHint:"مفتاحك لا يُحفظ أبداً — يعيش فقط في هذه الجلسة.",saveKey:"حفظ المفتاح",keyMissing:"⚠️ أدخل مفتاح API من Anthropic لاستخدام ميزات الذكاء الاصطناعي.",disclaimer:"⚠️ للأغراض المعلوماتية فقط. استشر دائماً محاسباً معتمداً." },
  hi: { name:"हिन्दी",flag:"🇮🇳",tagline:"सभी के लिए मुफ्त AI अकाउंटिंग",online:"ऑनलाइन",chatTab:"💬 AI सहायक",trackerTab:"📊 खर्च ट्रैकर",chatPlaceholder:"टैक्स, बजट, खर्च के बारे में पूछें...",send:"भेजें →",totalSpent:"कुल खर्च",topCategory:"मुख्य श्रेणी",transactions:"लेनदेन",addExpense:"खर्च जोड़ें",description:"विवरण",descPlaceholder:"जैसे: कार्यालय आपूर्ति",amount:"राशि ($)",category:"श्रेणी",date:"तारीख",add:"+ जोड़ें",aiInsight:"✨ AI वित्तीय विश्लेषण",analyzeBtn:"मेरे खर्च का विश्लेषण करें",analyzing:"विश्लेषण हो रहा है...",history:"लेनदेन इतिहास",noExpenses:"अभी कोई खर्च नहीं। ऊपर जोड़ें।",apiKeyLabel:"Anthropic API Key",apiKeyPlaceholder:"अपनी API key यहाँ पेस्ट करें (sk-ant-...)",apiKeyHint:"आपकी key कभी सेव नहीं होती — केवल इस सेशन में रहती है।",saveKey:"Key सेव करें",keyMissing:"⚠️ AI सुविधाओं के लिए Anthropic API key दर्ज करें।",disclaimer:"⚠️ केवल सूचनात्मक उद्देश्यों के लिए। हमेशा एक लाइसेंस प्राप्त अकाउंटेंट से परामर्श करें।" },
  zh: { name:"中文",flag:"🇨🇳",tagline:"免费AI会计 — 人人可用",online:"在线",chatTab:"💬 AI助手",trackerTab:"📊 费用追踪",chatPlaceholder:"询问税务、预算、费用、会计问题...",send:"发送 →",totalSpent:"总支出",topCategory:"最高类别",transactions:"交易数",addExpense:"添加费用",description:"描述",descPlaceholder:"例如：办公用品",amount:"金额 ($)",category:"类别",date:"日期",add:"+ 添加",aiInsight:"✨ AI财务分析",analyzeBtn:"分析我的支出",analyzing:"分析中...",history:"交易记录",noExpenses:"暂无费用。请在上方添加。",apiKeyLabel:"Anthropic API密钥",apiKeyPlaceholder:"粘贴您的API密钥 (sk-ant-...)",apiKeyHint:"您的密钥不会被存储 — 仅在此会话中有效。",saveKey:"保存密钥",keyMissing:"⚠️ 请输入您的Anthropic API密钥以使用AI功能。",disclaimer:"⚠️ 仅供参考。请始终咨询持牌会计师以获取正式建议。" },
};

const SYSTEM_PROMPT=`You are ClarityAI, a free AI-powered accounting assistant built to help anyone understand their finances. You are friendly, clear, and professional. You respond in whatever language the user writes in. You can help with accounting, bookkeeping, tax concepts, budgeting, financial statements, expense categorization, profit and loss, invoices, cash flow, and financial literacy. Always be honest. If something requires a licensed accountant say so kindly. Never make up specific tax rates. Keep responses concise. Use bullet points when listing. Be warm and encouraging especially to young or first-time entrepreneurs.`;

const CATEGORIES=["Food","Transport","Housing","Utilities","Entertainment","Healthcare","Business","Education","Shopping","Other"];
const COLORS={Food:"#f97316",Transport:"#3b82f6",Housing:"#8b5cf6",Utilities:"#06b6d4",Entertainment:"#ec4899",Healthcare:"#10b981",Business:"#f59e0b",Education:"#6366f1",Shopping:"#ef4444",Other:"#6b7280"};

function formatCurrency(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);}

function TypingDots(){
  return(
    <div role="status" aria-label="ClarityAI is typing" style={{display:"flex",gap:4,alignItems:"center",padding:"12px 16px"}}>
      {[0,1,2].map(i=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#10b981",animation:"bounce 1.2s infinite",animationDelay:`${i*0.2}s`}}/>))}
    </div>
  );
}

export default function App(){
  const [lang,setLang]=useState("en");
  const t=TRANSLATIONS[lang];
  const isRTL=lang==="ar";
  const [tab,setTab]=useState("chat");
  const [apiKey,setApiKey]=useState("");
  const [savedKey,setSavedKey]=useState("");
  const [messages,setMessages]=useState([{role:"assistant",content:"Hi! I'm **ClarityAI** — your free AI accounting assistant. Ask me anything about taxes, budgeting, expenses, or accounting. I'm here to help! 💼"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [expenses,setExpenses]=useState([
    {id:1,desc:"Office Supplies",amount:45.99,category:"Business",date:"2026-05-01"},
    {id:2,desc:"Lunch Meeting",amount:32.50,category:"Food",date:"2026-05-03"},
    {id:3,desc:"Monthly Internet",amount:79.99,category:"Utilities",date:"2026-05-05"},
    {id:4,desc:"Train Pass",amount:120.00,category:"Transport",date:"2026-05-07"},
    {id:5,desc:"Notion Subscription",amount:16.00,category:"Business",date:"2026-05-10"},
  ]);
  const [form,setForm]=useState({desc:"",amount:"",category:"Business",date:new Date().toISOString().split("T")[0]});
  const [aiInsight,setAiInsight]=useState("");
  const [insightLoading,setInsightLoading]=useState(false);
  const bottomRef=useRef(null);
  const inputRef=useRef(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  async function callAPI(msgs){
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":savedKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:msgs}),
    });
    const data=await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.content?.map(b=>b.text||"").join("")||"No response.";
  }

  async function sendMessage(){
    if(!input.trim()||loading) return;
    const userMsg={role:"user",content:input.trim()};
    const newMessages=[...messages,userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try{
      const reply=await callAPI(newMessages.map(m=>({role:m.role,content:m.content})));
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(prev=>[...prev,{role:"assistant",content:`Error: ${e.message}`}]);
    }
    setLoading(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  }

  function addExpense(){
    if(!form.desc||!form.amount) return;
    setExpenses(prev=>[...prev,{id:Date.now(),...form,amount:parseFloat(form.amount)}]);
    setForm({desc:"",amount:"",category:"Business",date:new Date().toISOString().split("T")[0]});
    setAiInsight("");
  }

  function deleteExpense(id){setExpenses(prev=>prev.filter(e=>e.id!==id));setAiInsight("");}

  async function getAiInsight(){
    setInsightLoading(true);setAiInsight("");
    const summary=expenses.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
    const total=expenses.reduce((s,e)=>s+e.amount,0);
    const prompt=`My expenses total $${total.toFixed(2)}. By category: ${Object.entries(summary).map(([k,v])=>`${k}: $${v.toFixed(2)}`).join(", ")}. Give me 3 short practical financial insights and tips. Be concise and actionable.`;
    try{
      const reply=await callAPI([{role:"user",content:prompt}]);
      setAiInsight(reply);
    }catch(e){setAiInsight(`Error: ${e.message}`);}
    setInsightLoading(false);
  }

  const total=expenses.reduce((s,e)=>s+e.amount,0);
  const byCategory=expenses.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
  const topCategory=Object.entries(byCategory).sort((a,b)=>b[1]-a[1])[0];

  function renderMarkdown(text){
    return text
      .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
      .replace(/\*(.*?)\*/g,"<em>$1</em>")
      .replace(/^- (.+)/gm,"<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs,"<ul>$1</ul>")
      .replace(/\n\n/g,"<br/><br/>")
      .replace(/\n/g,"<br/>");
  }

  const card={background:"#0f1f18",border:"1px solid #1e3a2a",borderRadius:12,padding:"20px 24px"};
  const lbl={fontSize:10,color:"#4b7a5e",letterSpacing:"0.15em",marginBottom:8};
  const inp={background:"#0a0f0d",border:"1px solid #1e3a2a",borderRadius:8,color:"#e2ffe8",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,padding:"12px 16px",outline:"none",width:"100%",transition:"border 0.2s"};

  return(
    <div style={{minHeight:"100vh",background:"#0a0f0d",fontFamily:"'IBM Plex Mono',monospace",color:"#e2ffe8",direction:isRTL?"rtl":"ltr"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .bp{background:#10b981;color:#0a0f0d;border:none;border-radius:8px;padding:12px 20px;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:13px;cursor:pointer;transition:all 0.2s;}
        .bp:hover:not(:disabled){background:#34d399;}
        .bp:disabled{background:#1a2e24;color:#4b7a5e;cursor:not-allowed;}
        .bo{background:none;border:1px solid #10b981;color:#10b981;border-radius:8px;padding:10px 20px;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .bo:hover:not(:disabled){background:#10b981;color:#0a0f0d;}
        .bo:disabled{opacity:0.4;cursor:not-allowed;}
        .bd{background:none;border:1px solid #1e3a2a;color:#6b7280;border-radius:6px;padding:4px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;cursor:pointer;transition:all 0.2s;}
        .bd:hover{border-color:#ef4444;color:#ef4444;}
        .tb{background:none;border:none;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;padding:10px 20px;border-radius:6px;transition:all 0.2s;color:#4b7a5e;}
        .tb:hover{background:#1a2e24;color:#e2ffe8;}
        .ta{background:#10b981!important;color:#0a0f0d!important;}
        .fi:focus{border-color:#10b981!important;}
        .lb{background:none;border:1px solid #1e3a2a;color:#4b7a5e;border-radius:6px;padding:4px 8px;font-family:'IBM Plex Mono',monospace;font-size:11px;cursor:pointer;transition:all 0.2s;}
        .lb:hover,.lb.active{border-color:#10b981;color:#10b981;}
        ul{padding-left:18px;margin:4px 0;}li{margin:3px 0;}
        @media(max-width:640px){.gf{grid-template-columns:1fr 1fr!important}.gs{grid-template-columns:1fr!important}.cb{max-width:90%!important}}
      `}</style>

      <header style={{borderBottom:"1px solid #1e3a2a",padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d1a14",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#10b981",letterSpacing:"-0.02em"}}>CLARITY<span style={{color:"#e2ffe8"}}>AI</span></div>
          <div style={{fontSize:10,color:"#4b7a5e",letterSpacing:"0.12em",marginTop:2}}>{t.tagline}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div role="group" aria-label="Language selector" style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {Object.entries(TRANSLATIONS).map(([code,tr])=>(
              <button key={code} className={`lb ${lang===code?"active":""}`} onClick={()=>setLang(code)} aria-label={`Switch to ${tr.name}`}>{tr.flag}</button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#10b981",animation:"pulse 2s infinite"}} aria-hidden="true"/>
            <span style={{fontSize:11,color:"#4b7a5e",letterSpacing:"0.1em"}}>{t.online}</span>
          </div>
        </div>
      </header>

      <div style={{background:"#0d1a14",borderBottom:"1px solid #1e3a2a",padding:"12px 32px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <label htmlFor="apikey" style={{fontSize:11,color:"#4b7a5e",whiteSpace:"nowrap"}}>{t.apiKeyLabel}:</label>
        <input id="apikey" type="password" className="fi" style={{...inp,maxWidth:340,padding:"8px 12px"}} placeholder={t.apiKeyPlaceholder} value={apiKey} onChange={e=>setApiKey(e.target.value)} autoComplete="off"/>
        <button className="bp" style={{padding:"8px 16px",fontSize:12}} onClick={()=>setSavedKey(apiKey)}>{t.saveKey}</button>
        <span style={{fontSize:10,color:"#4b7a5e"}}>{t.apiKeyHint}</span>
      </div>

      <div role="note" style={{background:"#1a1500",borderBottom:"1px solid #2a2000",padding:"8px 32px",fontSize:11,color:"#a88a00"}}>{t.disclaimer}</div>

      <nav role="tablist" style={{padding:"16px 32px 0",display:"flex",gap:8,borderBottom:"1px solid #1e3a2a"}}>
        {[["chat",t.chatTab],["tracker",t.trackerTab]].map(([id,label])=>(
          <button key={id} role="tab" aria-selected={tab===id} className={`tb ${tab===id?"ta":""}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </nav>

      {tab==="chat"&&(
        <section style={{display:"flex",flexDirection:"column",height:"calc(100vh - 230px)"}}>
          {!savedKey&&<div role="alert" style={{margin:"16px 32px",padding:"12px 16px",background:"#1a1000",border:"1px solid #3a2a00",borderRadius:8,fontSize:12,color:"#f59e0b"}}>{t.keyMissing}</div>}
          <div role="log" aria-live="polite" style={{flex:1,overflowY:"auto",padding:"24px 32px",display:"flex",flexDirection:"column",gap:16}}>
            {messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"fadeIn 0.3s ease"}}>
                {m.role==="assistant"&&<div aria-hidden="true" style={{width:28,height:28,borderRadius:"50%",background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:10,flexShrink:0,marginTop:4,fontWeight:700}}>C</div>}
                <div className="cb" style={{maxWidth:"70%",padding:"12px 16px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?"#10b981":"#0f1f18",color:m.role==="user"?"#0a0f0d":"#e2ffe8",border:m.role==="assistant"?"1px solid #1e3a2a":"none",fontSize:13,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:renderMarkdown(m.content)}}/>
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",alignItems:"center"}}>
                <div aria-hidden="true" style={{width:28,height:28,borderRadius:"50%",background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:10,fontWeight:700}}>C</div>
                <div style={{background:"#0f1f18",border:"1px solid #1e3a2a",borderRadius:"16px 16px 16px 4px"}}><TypingDots/></div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:"16px 32px",borderTop:"1px solid #1e3a2a",background:"#0d1a14",display:"flex",gap:12}}>
            <input ref={inputRef} className="fi" style={inp} placeholder={t.chatPlaceholder} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()} aria-label="Type your accounting question" disabled={loading}/>
            <button className="bp" onClick={sendMessage} disabled={loading||!input.trim()||!savedKey}>{t.send}</button>
          </div>
        </section>
      )}

      {tab==="tracker"&&(
        <section style={{padding:"24px 32px",overflowY:"auto",height:"calc(100vh - 230px)"}}>
          <div className="gs" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
            {[{label:t.totalSpent,value:formatCurrency(total),color:"#e2ffe8"},{label:t.topCategory,value:topCategory?topCategory[0]:"—",color:COLORS[topCategory?.[0]]||"#10b981"},{label:t.transactions,value:expenses.length,color:"#10b981"}].map((s,i)=>(
              <div key={i} style={card}><div style={lbl}>{s.label}</div><div style={{fontSize:24,fontWeight:600,color:s.color,fontFamily:"'Syne',sans-serif"}}>{s.value}</div></div>
            ))}
          </div>

          {Object.keys(byCategory).length>0&&(
            <div style={{...card,marginBottom:24}}>
              <div style={lbl}>CATEGORY BREAKDOWN</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
                {Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
                  <div key={cat}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                      <span style={{color:COLORS[cat]}}>● {cat}</span>
                      <span style={{color:"#e2ffe8"}}>{formatCurrency(amt)}</span>
                    </div>
                    <div style={{height:4,background:"#1e3a2a",borderRadius:2}} role="progressbar" aria-valuenow={Math.round((amt/total)*100)} aria-valuemin={0} aria-valuemax={100}>
                      <div style={{height:"100%",width:`${(amt/total)*100}%`,background:COLORS[cat],borderRadius:2,transition:"width 0.5s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{...card,marginBottom:24}}>
            <div style={lbl}>{t.addExpense}</div>
            <div className="gf" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:12,alignItems:"end",marginTop:8}}>
              {[
                {id:"exp-desc",label:t.description,el:<input id="exp-desc" className="fi" style={inp} placeholder={t.descPlaceholder} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/>},
                {id:"exp-amt",label:t.amount,el:<input id="exp-amt" type="number" className="fi" style={inp} placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} min="0" step="0.01"/>},
                {id:"exp-cat",label:t.category,el:<select id="exp-cat" className="fi" style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>},
                {id:"exp-date",label:t.date,el:<input id="exp-date" type="date" className="fi" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>},
              ].map(({id,label,el})=>(<div key={id}><label htmlFor={id} style={lbl}>{label}</label>{el}</div>))}
              <button className="bp" onClick={addExpense} style={{marginTop:18}}>{t.add}</button>
            </div>
          </div>

          <div style={{...card,marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:aiInsight?16:0}}>
              <div style={lbl}>{t.aiInsight}</div>
              <button className="bo" onClick={getAiInsight} disabled={insightLoading||expenses.length===0||!savedKey}>{insightLoading?t.analyzing:t.analyzeBtn}</button>
            </div>
            {!savedKey&&<div style={{fontSize:11,color:"#f59e0b",marginTop:8}}>{t.keyMissing}</div>}
            {aiInsight&&<div aria-live="polite" style={{fontSize:13,lineHeight:1.7,color:"#b8f5d0",borderTop:"1px solid #1e3a2a",paddingTop:16,animation:"fadeIn 0.4s ease"}} dangerouslySetInnerHTML={{__html:renderMarkdown(aiInsight)}}/>}
          </div>

          <div style={card}>
            <div style={lbl}>{t.history}</div>
            <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10,marginTop:8,padding:0}}>
              {expenses.length===0&&<li style={{color:"#4b7a5e",fontSize:13,textAlign:"center",padding:"20px 0"}}>{t.noExpenses}</li>}
              {[...expenses].reverse().map(e=>(
                <li key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#0a0f0d",borderRadius:8,border:"1px solid #1a2e22",animation:"fadeIn 0.3s ease"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div aria-hidden="true" style={{width:10,height:10,borderRadius:"50%",background:COLORS[e.category],flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:13,color:"#e2ffe8"}}>{e.desc}</div>
                      <div style={{fontSize:10,color:"#4b7a5e",marginTop:2}}>{e.category} · {e.date}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:14,fontWeight:600,color:"#10b981"}}>{formatCurrency(e.amount)}</div>
                    <button className="bd" onClick={()=>deleteExpense(e.id)} aria-label={`Delete ${e.desc}`}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
