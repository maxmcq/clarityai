import { useState, useRef, useEffect } from "react";

const TRANSLATIONS = {
  en: {
    name: "English", flag: "🇬🇧", tagline: "FREE AI ACCOUNTING — FOR EVERYONE",
    online: "ONLINE", chatTab: "💬 AI Assistant", trackerTab: "📊 Expense Tracker",
    chatPlaceholder: "Ask about taxes, budgeting, expenses, accounting...", send: "SEND →",
    totalSpent: "TOTAL SPENT", topCategory: "TOP CATEGORY", transactions: "TRANSACTIONS",
    addExpense: "ADD EXPENSE", description: "DESCRIPTION", descPlaceholder: "e.g. Office supplies",
    amount: "AMOUNT ($)", category: "CATEGORY", date: "DATE", add: "+ ADD",
    aiInsight: "✨ AI FINANCIAL INSIGHT", analyzeBtn: "ANALYZE MY SPENDING", analyzing: "ANALYZING...",
    history: "TRANSACTION HISTORY", noExpenses: "No expenses yet. Add one above.",
    apiKeyLabel: "Anthropic API Key", apiKeyPlaceholder: "Paste your API key here (sk-ant-...)",
    apiKeyHint: "Your key is never stored — it lives only in this browser session.",
    saveKey: "Save Key", keyMissing: "⚠️ Please enter your Anthropic API key above to use the AI features.",
    disclaimer: "⚠️ For informational purposes only. Always consult a licensed accountant for official advice.",
  },
  es: {
    name: "Español", flag: "🇪🇸", tagline: "CONTABILIDAD IA GRATUITA — PARA TODOS",
    online: "EN LÍNEA", chatTab: "💬 Asistente IA", trackerTab: "📊 Gastos",
    chatPlaceholder: "Pregunta sobre impuestos, presupuesto, gastos...", send: "ENVIAR →",
    totalSpent: "TOTAL GASTADO", topCategory: "CATEGORÍA PRINCIPAL", transactions: "TRANSACCIONES",
    addExpense: "AGREGAR GASTO", description: "DESCRIPCIÓN", descPlaceholder: "ej. Material de oficina",
    amount: "CANTIDAD ($)", category: "CATEGORÍA", date: "FECHA", add: "+ AGREGAR",
    aiInsight: "✨ ANÁLISIS FINANCIERO IA", analyzeBtn: "ANALIZAR MIS GASTOS", analyzing: "ANALIZANDO...",
    history: "HISTORIAL DE TRANSACCIONES", noExpenses: "Sin gastos aún. Agrega uno arriba.",
    apiKeyLabel: "Clave API de Anthropic", apiKeyPlaceholder: "Pega tu clave aquí (sk-ant-...)",
    apiKeyHint: "Tu clave nunca se guarda — solo existe en esta sesión.",
    saveKey: "Guardar Clave", keyMissing: "⚠️ Ingresa tu clave API de Anthropic para usar las funciones de IA.",
    disclaimer: "⚠️ Solo para fines informativos. Consulta siempre a un contador certificado.",
  },
  fr: {
    name: "Français", flag: "🇫🇷", tagline: "COMPTABILITÉ IA GRATUITE — POUR TOUS",
    online: "EN LIGNE", chatTab: "💬 Assistant IA", trackerTab: "📊 Dépenses",
    chatPlaceholder: "Posez des questions sur les impôts, le budget...", send: "ENVOYER →",
    totalSpent: "TOTAL DÉPENSÉ", topCategory: "CATÉGORIE PRINCIPALE", transactions: "TRANSACTIONS",
    addExpense: "AJOUTER UNE DÉPENSE", description: "DESCRIPTION", descPlaceholder: "ex. Fournitures de bureau",
    amount: "MONTANT ($)", category: "CATÉGORIE", date: "DATE", add: "+ AJOUTER",
    aiInsight: "✨ ANALYSE FINANCIÈRE IA", analyzeBtn: "ANALYSER MES DÉPENSES", analyzing: "ANALYSE...",
    history: "HISTORIQUE DES TRANSACTIONS", noExpenses: "Aucune dépense. Ajoutez-en une ci-dessus.",
    apiKeyLabel: "Clé API Anthropic", apiKeyPlaceholder: "Collez votre clé ici (sk-ant-...)",
    apiKeyHint: "Votre clé n'est jamais stockée — elle vit uniquement dans cette session.",
    saveKey: "Enregistrer", keyMissing: "⚠️ Veuillez entrer votre clé API Anthropic pour utiliser les fonctions IA.",
    disclaimer: "⚠️ À titre informatif uniquement. Consultez toujours un comptable agréé.",
  },
  ar: {
    name: "العربية", flag: "🇸🇦", tagline: "محاسبة ذكاء اصطناعي مجانية — للجميع",
    online: "متصل", chatTab: "💬 مساعد الذكاء الاصطناعي", trackerTab: "📊 تتبع المصروفات",
    chatPlaceholder: "اسأل عن الضرائب، الميزانية، المصروفات...", send: "إرسال →",
    totalSpent: "إجمالي الإنفاق", topCategory: "الفئة الأعلى", transactions: "المعاملات",
    addExpense: "إضافة مصروف", description: "الوصف", descPlaceholder: "مثال: لوازم مكتبية",
    amount: "المبلغ ($)", category: "الفئة", date: "التاريخ", add: "+ إضافة",
    aiInsight: "✨ تحليل مالي بالذكاء الاصطناعي", analyzeBtn: "تحليل إنفاقي", analyzing: "جارٍ التحليل...",
    history: "سجل المعاملات", noExpenses: "لا توجد مصروفات بعد. أضف واحدة أعلاه.",
    apiKeyLabel: "مفتاح API من Anthropic", apiKeyPlaceholder: "الصق مفتاحك هنا (sk-ant-...)",
    apiKeyHint: "مفتاحك لا يُحفظ أبداً — يعيش فقط في هذه الجلسة.",
    saveKey: "حفظ المفتاح", keyMissing: "⚠️ أدخل مفتاح API من Anthropic لاستخدام ميزات الذكاء الاصطناعي.",
    disclaimer: "⚠️ للأغراض المعلوماتية فقط. استشر دائماً محاسباً معتمداً.",
  },
  hi: {
    name: "हिन्दी", flag: "🇮🇳", tagline: "सभी के लिए मुफ्त AI अकाउंटिंग",
    online: "ऑनलाइन", chatTab: "💬 AI सहायक", trackerTab: "📊 खर्च ट्रैकर",
    chatPlaceholder: "टैक्स, बजट, खर्च के बारे में पूछें...", send: "भेजें →",
    totalSpent: "कुल खर्च", topCategory: "मुख्य श्रेणी", transactions: "लेनदेन",
    addExpense: "खर्च जोड़ें", description: "विवरण", descPlaceholder: "जैसे: कार्यालय आपूर्ति",
    amount: "राशि ($)", category: "श्रेणी", date: "तारीख", add: "+ जोड़ें",
    aiInsight: "✨ AI वित्तीय विश्लेषण", analyzeBtn: "मेरे खर्च का विश्लेषण करें", analyzing: "विश्लेषण हो रहा है...",
    history: "लेनदेन इतिहास", noExpenses: "अभी कोई खर्च नहीं। ऊपर जोड़ें।",
    apiKeyLabel: "Anthropic API Key", apiKeyPlaceholder: "अपनी API key यहाँ पेस्ट करें (sk-ant-...)",
    apiKeyHint: "आपकी key कभी सेव नहीं होती — केवल इस सेशन में रहती है।",
    saveKey: "Key सेव करें", keyMissing: "⚠️ AI सुविधाओं के लिए Anthropic API key दर्ज करें।",
    disclaimer: "⚠️ केवल सूचनात्मक उद्देश्यों के लिए। हमेशा एक लाइसेंस प्राप्त अकाउंटेंट से परामर्श करें।",
  },
  zh: {
    name: "中文", flag: "🇨🇳", tagline: "免费AI会计 — 人人可用",
    online: "在线", chatTab: "💬 AI助手", trackerTab: "📊 费用追踪",
    chatPlaceholder: "询问税务、预算、费用、会计问题...", send: "发送 →",
    totalSpent: "总支出", topCategory: "最高类别", transactions: "交易数",
    addExpense: "添加费用", description: "描述", descPlaceholder: "例如：办公用品",
    amount: "金额 ($)", category: "类别", date: "日期", add: "+ 添加",
    aiInsight: "✨ AI财务分析", analyzeBtn: "分析我的支出", analyzing: "分析中...",
    history: "交易记录", noExpenses: "暂无费用。请在上方添加。",
    apiKeyLabel: "Anthropic API密钥", apiKeyPlaceholder: "粘贴您的API密钥 (sk-ant-...)",
    apiKeyHint: "您的密钥不会被存储 — 仅在此会话中有效。",
    saveKey: "保存密钥", keyMissing: "⚠️ 请输入您的Anthropic API密钥以使用AI功能。",
    disclaimer: "⚠️ 仅供参考。请始终咨询持牌会计师以获取正式建议。",
  },
};

const SYSTEM_PROMPT = `You are ClarityAI, a free AI-powered accounting assistant built to help anyone understand their finances. You are friendly, clear, and professional. You respond in whatever language the user writes in. You can help with accounting, bookkeeping, tax concepts, budgeting, financial statements, expense categorization, profit and loss, invoices, cash flow, and financial literacy. Always be honest. If something requires a licensed accountant say so kindly. Never make up specific tax rates. Keep responses concise. Use bullet points when listing. Be warm and encouraging especially to young or first-time entrepreneurs.`;

const CATEGORIES = ["Food","Transport","Housing","Utilities","Entertainment","Healthcare","Business","Education","Shopping","Other"];

const COLORS = {
  Food:"#f97316", Transport:"#3b82f6", Housing:"#8b5cf6",
  Utilities:"#06b6d4", Entertainment:"#ec4899", Healthcare:"#10b981",
  Business:"#f59e0b", Education:"#6366f1", Shopping:"#ef4444", Other:"#6b7280",
};

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);
}

function TypingDots() {
  return (
    <div role="status" aria-label="ClarityAI is typing" style={{display:"flex",gap:4,alignItems:"center",padding:"12px 16px"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#10b981",animation:"bounce 1.2s infinite",animationDelay:`${i*0.2}s`}}/>
      ))}
    </div>
  );
}

export default function App() {
  const [lang,setLang]=useState("en");
  const t=TRANSLATIONS[lang];
  const isRTL=lang==="ar";
  const [tab,setTab]=useState("chat");
  const [apiKey,setApiKey]=useState("");
  const [savedKey,setSavedKey]=useState("");
  const [messages,setMessages]=useState([
    {role:"assistant",content:"Hi! I'm **ClarityAI** — your free AI accounting assistant. Ask me anything about taxes, budgeting, expenses, or accounting. I'm here to help! 💼"}
  ]);
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

  async function callAPI(msgs) {
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":savedKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:msgs}),
    });
    const data=await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.content?.map(b=>b.text||"").join("")||"No response.";
  }

  async function sendMessage() {
    if(!input.trim()||loading) return;
    const userMsg={role:"user",content:input.trim()};
    const newMessages=[...messages,userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply=await callAPI(newMessages.map(m=>({role:m.role,content:m.content})));
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch(e) {
      setMessages(prev=>[...prev,{role:"assistant",content:`Error: ${e.message}`}]);
    }
    setLoading(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  }

  function addExpense() {
    if(!form.desc||!form.amount) return;
    setExpenses(prev=>[...prev,{id:Date.now(),...form,amount:parseFloat(form.amount)}]);
    setForm({desc:"",amount:"",category:"Business",date:new Date().toISOString().split("T")[0]});
    setAiInsight("");
  }

  function deleteExpense(id){setExpenses(prev=>prev.filter(e=>e.id!==id));setAiInsight("");}

  async function getAiInsight() {
    setInsightLoading(true);setAiInsight("");
    const summary=expenses.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
    const total=expenses.reduce((s,e)=>s+e.amount,0);
    const prompt=`My expenses total $${total.toFixed(2)}. By category: ${Object.entries(summary).map(([k,v])=>`${k}: $${v.toFixed(2)}`).join(", ")}. Give me 3 short practical financial insights and tips. Be concise and actionable.`;
    try {
      const reply=await callAPI([{role:"user",content:prompt}]);
      setAiInsight(reply);
    } catch(e){setAiInsight(`Error: ${e.message}`);}
    setInsightLoading(false);
  }

  const total=expenses.reduce((s,e)=>s+e.amount,0);
  const byCategory=expenses.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
  const topCategory=Object.entries(byCategory).sort((a,b)=>b[1]-a[1])[0];

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
      .replace(/\*(.*?)\*/g,"<em>$1</em>")
      .replace(/^- (.+)/gm,"<li>$1</li>")
      .replace(/(​​​​​​​​​​​​​​​​
