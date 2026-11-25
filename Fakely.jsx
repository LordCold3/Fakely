import { useState, useEffect, useRef, useCallback } from "react";

/* ================= DADOS ================= */
const TRUST = ["gov.br","ibge.gov.br","who.int","reuters.com","bbc.com","agenciabrasil.ebc.com.br","g1.globo.com","folha.uol.com.br","estadao.com.br","nature.com","scielo.br"];
const BAD = ["noticiafalsa","verdadeoculta","urgentenews","clickbait"];
const CHK = [
  ["Agência Lupa","lupa.news","Checagem de fatos e desinformação"],
  ["Aos Fatos","aosfatos.org","Checagem e monitoramento do discurso público"],
  ["Estadão Verifica","estadao.com.br","Checagem do jornal Estadão"],
  ["Fato ou Fake (g1)","g1.globo.com","Checagem do grupo Globo"],
  ["Projeto Comprova","projetocomprova.com.br","Rede de veículos que checa conteúdo viral"],
  ["Boatos.org","boatos.org","Banco de boatos já desmentidos"],
];
const BOOKS = [
  { t:"Apologia de Sócrates", a:"Platão", s:"Acusado de corromper a juventude, Sócrates se defende diante de Atenas e explica que sua sabedoria consiste em reconhecer a própria ignorância. Um convite a questionar certezas, inclusive as nossas.", tip:"Duvide primeiro de si mesmo." },
  { t:"Discurso do Método", a:"René Descartes", s:"Descartes propõe regras simples para buscar a verdade: aceitar só o que é evidente, dividir problemas em partes e avançar com ordem. A dúvida metódica vira ferramenta de clareza.", tip:"Divida a notícia em afirmações menores." },
  { t:"A República (Alegoria da Caverna)", a:"Platão", s:"Prisioneiros acorrentados tomam sombras na parede por realidade. Ao sair da caverna, um deles percebe o quanto a aparência pode enganar e o custo de buscar a verdade.", tip:"Pergunte o que está além da sombra." },
  { t:"Verdade e Política", a:"Hannah Arendt", s:"Arendt analisa a relação frágil entre fatos e poder, mostrando como a mentira organizada corrói o espaço público e por que verdades factuais precisam ser defendidas.", tip:"Fatos não são opinião." },
  { t:"Ensaio sobre o Entendimento Humano", a:"John Locke", s:"Locke investiga como formamos ideias a partir da experiência e alerta para os limites do conhecimento, lembrando que opiniões devem ter força proporcional às evidências.", tip:"Crença na medida da evidência." },
];
const CAT = [
  { id:"ap", t:"Apologia de Sócrates", a:"Platão", c:"Dúvida e método", s:"Acusado de corromper a juventude, Sócrates se defende diante de Atenas e explica que sua sabedoria está em reconhecer o que não sabe. Um convite a examinar as próprias certezas.", w:"Você tem certeza do que acabou de compartilhar? Como saberia?" },
  { id:"dm", t:"Discurso do Método", a:"René Descartes", c:"Dúvida e método", s:"Descartes propõe regras simples para buscar a verdade: aceitar só o que é evidente, dividir os problemas e avançar com ordem. A dúvida vira ferramenta, não fim.", w:"Divida uma notícia em afirmações menores e teste uma por vez." },
  { id:"hu", t:"Investigação sobre o Entendimento Humano", a:"David Hume", c:"Dúvida e método", s:"Hume examina de onde vêm nossas crenças e mostra como o hábito nos leva a ver causas onde talvez haja apenas coincidência. Um treino de ceticismo moderado.", w:"Correlação não é causa: o que liga de fato os dois fatos da manchete?" },
  { id:"po", t:"Conjecturas e Refutações", a:"Karl Popper", c:"Dúvida e método", s:"Popper defende que o conhecimento avança quando tentamos refutar nossas ideias, e não apenas confirmá-las. Uma teoria que nada pode contradizer pouco nos ensina.", w:"Que evidência faria você mudar de opinião sobre isso?" },
  { id:"re", t:"A República (Alegoria da Caverna)", a:"Platão", c:"Verdade e política", s:"Prisioneiros acorrentados tomam sombras na parede por realidade. Ao sair da caverna, um deles descobre o quanto a aparência engana e o quanto custa buscar a verdade.", w:"Quais sombras chegam até você todos os dias pelo celular?" },
  { id:"vp", t:"Verdade e Política", a:"Hannah Arendt", c:"Verdade e política", s:"Arendt analisa a relação frágil entre fatos e poder, mostrando como a mentira organizada corrói o espaço público e por que verdades factuais precisam ser defendidas.", w:"Distinga o que é fato, o que é opinião e o que é conveniência." },
  { id:"ot", t:"Origens do Totalitarismo", a:"Hannah Arendt", c:"Verdade e política", s:"Estudo sobre como propaganda, isolamento e medo foram usados por regimes totalitários para fazer as pessoas duvidarem até da própria experiência.", w:"Repetição constante torna algo verdadeiro? Observe seus feeds." },
  { id:"sl", t:"Sobre a Liberdade", a:"John Stuart Mill", c:"Ética e sociedade", s:"Mill defende que ideias, mesmo as erradas, devem circular livremente, pois só o confronto com opiniões contrárias mantém uma verdade viva e bem compreendida.", w:"Você lê com frequência quem discorda de você?" },
  { id:"ce", t:"Ensaio sobre a Cegueira", a:"José Saramago", c:"Ética e sociedade", s:"Uma epidemia súbita de cegueira branca derruba as regras de uma cidade e expõe o pior e o melhor das pessoas. Romance sobre responsabilidade e o ato de enxergar de verdade.", w:"Em que situações você olha, mas não enxerga?" },
  { id:"19", t:"1984", a:"George Orwell", c:"Mídia e sociedade", s:"Em um Estado que reescreve o passado e controla a linguagem, Winston tenta preservar a memória e o pensamento próprio. Clássico sobre manipulação da informação.", w:"Quem controla o que você considera fato?" },
  { id:"am", t:"Admirável Mundo Novo", a:"Aldous Huxley", c:"Mídia e sociedade", s:"Numa sociedade que troca a verdade pelo entretenimento e pelo prazer constante, poucos têm interesse em questionar. Uma visão de controle por distração.", w:"O excesso de informação também pode nos deixar passivos?" },
  { id:"f4", t:"Fahrenheit 451", a:"Ray Bradbury", c:"Mídia e sociedade", s:"Bombeiros queimam livros em um futuro de telas e respostas rápidas. Quando um deles começa a ler, passa a questionar o mundo ao redor.", w:"Quanto tempo você dedica a leituras longas e profundas?" },
  { id:"se", t:"A Sociedade do Espetáculo", a:"Guy Debord", c:"Mídia e sociedade", s:"Debord sustenta que a vida social passou a ser mediada por imagens e que representações acabam substituindo a experiência direta.", w:"Aquilo que viraliza é importante ou apenas visível?" },
];
const ACH = [
  { id:"a1", ic:"🌱", t:"Primeiro passo", d:"Faça sua 1ª pesquisa", f:s=>s.n, g:1, xp:30 },
  { id:"a3", ic:"🔎", t:"Curioso", d:"Pesquise 3 notícias", f:s=>s.n, g:3, xp:40 },
  { id:"a5", ic:"🕵️", t:"Investigador", d:"Pesquise 5 notícias", f:s=>s.n, g:5, xp:60 },
  { id:"a10", ic:"🧭", t:"Detetive", d:"Pesquise 10 notícias", f:s=>s.n, g:10, xp:100 },
  { id:"a25", ic:"📊", t:"Analista", d:"Pesquise 25 notícias", f:s=>s.n, g:25, xp:200 },
  { id:"a50", ic:"👑", t:"Mestre da Verdade", d:"Pesquise 50 notícias", f:s=>s.n, g:50, xp:400 },
  { id:"u3", ic:"🔗", t:"Caçador de links", d:"Analise 3 links", f:s=>s.url, g:3, xp:50 },
  { id:"t5", ic:"📝", t:"Leitor atento", d:"Analise 5 textos", f:s=>s.text, g:5, xp:50 },
  { id:"b3", ic:"🚩", t:"Faro afiado", d:"Encontre 3 conteúdos possivelmente falsos", f:s=>s.bad, g:3, xp:80 },
  { id:"o3", ic:"✅", t:"Fonte segura", d:"Encontre 3 conteúdos possivelmente verdadeiros", f:s=>s.ok, g:3, xp:80 },
  { id:"s3", ic:"🔥", t:"Constância", d:"Pesquise 3 dias seguidos", f:s=>s.streak, g:3, xp:120 },
  { id:"r3", ic:"📖", t:"Rato de biblioteca", d:"Marque 3 leituras como lidas", f:s=>s.reads.length, g:3, xp:100 },
];
const TITLES = ["Iniciante","Curioso","Investigador","Detetive","Analista","Cético Mestre","Guardião da Verdade"];
const STEPS = ["Lendo o conteúdo","Verificando a fonte","Buscando sinais de manipulação","Gerando resultado"];
const FAQ = [
  ["O resultado é uma certeza?","Não. É uma indicação baseada em sinais do texto. Sempre confirme em agências de checagem e veículos confiáveis."],
  ["Meus textos ficam guardados?","Ficam apenas no histórico do seu navegador, e você pode apagá-lo quando quiser."],
  ["O que significa “inconclusivo”?","Que não há sinais suficientes para um lado ou outro. Vale buscar fontes primárias."],
];
const LABEL = { ok:"Possivelmente verdadeira", mid:"Inconclusiva", bad:"Possivelmente falsa" };
const DESC = {
  ok:"Há indícios de que a informação é confiável, mas confirme em outras fontes.",
  mid:"Não há sinais suficientes para um veredito. Busque fontes primárias.",
  bad:"Foram encontrados vários sinais comuns em desinformação. Desconfie e verifique.",
};
const S0 = { n:0, ok:0, mid:0, bad:0, url:0, text:0, xp:0, ach:[], last:"", streak:0, reads:[] };

/* ================= LÓGICA ================= */
function lv(xp) {
  let l = 1, need = 100, rem = xp;
  while (rem >= need) { rem -= need; l++; need = 100 + (l - 1) * 50; }
  return { l, rem, need };
}
const day = o => { const t = new Date(); t.setDate(t.getDate() + o); return t.toLocaleDateString("sv"); };
function wkInfo() {
  const t = new Date(), u = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()), base = Date.UTC(1970, 0, 5);
  const ds = Math.floor((u - base) / 864e5), wk = Math.floor(ds / 7);
  return { wk, left: 7 - (ds % 7), mon: new Date(base + wk * 7 * 864e5) };
}
function analyze(input, isUrl) {
  let score = 55; const sig = []; const low = input.toLowerCase();
  const add = (d, ic, m) => { score += d; sig.push([ic, m]); };
  if (isUrl) {
    let h = ""; try { h = new URL(input).hostname.replace(/^www\./, ""); } catch {}
    if (TRUST.some(d => h.endsWith(d))) add(25, "✅", `O domínio “${h}” é de uma fonte reconhecida.`);
    else if (BAD.some(w => h.includes(w))) add(-30, "⚠️", "O domínio tem nome típico de sites de desinformação.");
    else add(-5, "❔", `Não há histórico conhecido do domínio “${h}”; confirme a fonte.`);
    if (!input.startsWith("https")) add(-5, "⚠️", "O link não usa conexão segura (HTTPS).");
  } else {
    const w = input.split(/\s+/).filter(Boolean);
    const caps = w.filter(x => x.length > 3 && x === x.toUpperCase() && /[A-ZÁÉÍÓÚÃÕÇ]/.test(x)).length;
    if (caps >= 2) add(-12, "⚠️", `Uso excessivo de palavras em CAIXA ALTA (${caps}).`);
    const ex = (input.match(/!/g) || []).length;
    if (ex >= 2) add(-10, "⚠️", `Muitos pontos de exclamação (${ex}).`);
    const sens = ["urgente","compartilhe","antes que apaguem","escondem","cura","milagre","bomba","chocante","a mídia não quer","você não vai acreditar","conspiração","chip","segredo"];
    const f = sens.filter(s => low.includes(s));
    if (f.length) add(-8 * Math.min(f.length, 3), "🚩", `Linguagem sensacionalista: “${f.slice(0, 3).join("”, “")}”.`);
    const anon = ["médico anônimo","fonte anônima","dizem que","todo mundo sabe","li em um grupo","especialistas afirmam"];
    if (anon.some(s => low.includes(s))) add(-12, "🚩", "Fonte vaga ou anônima citada.");
    const good = ["segundo","de acordo com","nota oficial","pesquisa","estudo","dados","divulgou","publicado","instituto","órgão"];
    const g = good.filter(s => low.includes(s));
    if (g.length) add(Math.min(g.length * 6, 20), "✅", "Menciona fonte, dados ou estudo verificável.");
    if (/\d/.test(input)) add(4, "✅", "Contém números ou datas que podem ser conferidos.");
    if (w.length < 12) add(-6, "❔", "Texto muito curto para uma análise segura.");
    if (!sig.length) sig.push(["❔", "Nenhum sinal forte encontrado."]);
  }
  score = Math.max(5, Math.min(95, Math.round(score)));
  const k = score >= 68 ? "ok" : score >= 42 ? "mid" : "bad";
  const books = [...BOOKS.keys()].sort(() => Math.random() - 0.5).slice(0, 3);
  return { k, score, sig, input, isUrl, books, at: Date.now() };
}
function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch {}
    return typeof init === "function" ? init() : init;
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

/* ================= COMPONENTE ================= */
export default function Fakely() {
  const [theme, setTheme] = useLS("fk_theme", () => (window.matchMedia?.("(prefers-color-scheme:dark)").matches ? "dark" : "light"));
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [step, setStep] = useState(0);
  const [cur, setCur] = useState(null);
  const [hist, setHist] = useLS("fk_hist", []);
  const [gs, setGs] = useLS("fk_game", S0);
  const [saved, setSaved] = useLS("fk_saved", []);
  const [filt, setFilt] = useState("Todas");
  const [toasts, setToasts] = useState([]);
  const [copied, setCopied] = useState(false);
  const [tips, setTips] = useState({});
  const pending = useRef(null);
  const finishRef = useRef(null);
  const g = { ...S0, ...gs };

  const go = s => { setScreen(s); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goSection = id => { setScreen("home"); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60); };
  const toast = useCallback((m, delay = 0) => {
    setTimeout(() => {
      const id = Math.random();
      setToasts(t => [...t, { id, m }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600);
    }, delay);
  }, []);

  /* gamificação */
  function unlock(s, msgs) {
    ACH.forEach(a => {
      if (!s.ach.includes(a.id) && a.f(s) >= a.g) { s.ach = [...s.ach, a.id]; s.xp += a.xp; msgs.push(`🏆 Conquista: ${a.t} (+${a.xp} XP)`); }
    });
  }
  function award(r) {
    const s = { ...g, ach: [...g.ach], reads: [...g.reads] }, msgs = [], before = lv(s.xp).l;
    let gain = 20;
    s.n++; s[r.k]++; r.isUrl ? s.url++ : s.text++;
    if (r.isUrl) gain += 10;
    const d = day(0);
    if (s.last !== d) { s.streak = s.last === day(-1) ? s.streak + 1 : 1; s.last = d; gain += 10; }
    s.xp += gain; msgs.push(`+${gain} XP pela análise`);
    unlock(s, msgs);
    const after = lv(s.xp).l; if (after > before) msgs.push(`⬆️ Subiu para o nível ${after}!`);
    setGs(s); msgs.forEach((m, i) => toast(m, i * 700));
  }
  function markRead(id) {
    if (g.reads.includes(id)) return;
    const s = { ...g, ach: [...g.ach], reads: [...g.reads, id] }, msgs = ["+15 XP pela leitura"], before = lv(g.xp).l;
    s.xp += 15; unlock(s, msgs);
    const after = lv(s.xp).l; if (after > before) msgs.push(`⬆️ Subiu para o nível ${after}!`);
    setGs(s); msgs.forEach((m, i) => toast(m, i * 700));
  }
  const toggleSave = id => setSaved(sv => (sv.includes(id) ? sv.filter(x => x !== id) : [...sv, id]));

  /* fluxo de análise */
  function start() {
    const inp = (mode === "text" ? text : url).trim();
    if (mode === "text" && inp.length < 10) return setErr("Digite ao menos 10 caracteres para analisar.");
    if (mode === "url") { try { new URL(inp); } catch { return setErr("Informe um link válido, começando com http:// ou https://"); } }
    setErr(""); pending.current = { inp, isUrl: mode === "url" }; setStep(0); go("load");
  }
  finishRef.current = () => {
    const { inp, isUrl } = pending.current;
    const r = analyze(inp, isUrl);
    setCur(r); setHist(h => [r, ...h].slice(0, 8)); award(r); go("res");
  };
  useEffect(() => {
    if (screen !== "load") return;
    let i = 0, dead = false;
    const id = setInterval(() => {
      i++; setStep(i);
      if (i >= STEPS.length) { clearInterval(id); setTimeout(() => { if (!dead) finishRef.current(); }, 350); }
    }, 900);
    return () => { dead = true; clearInterval(id); };
  }, [screen]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(`Fakely: ${LABEL[cur.k]} (${cur.score}% de confiabilidade)`); setCopied(true); } catch {}
    setTimeout(() => setCopied(false), 1800);
  };

  /* helpers de UI */
  const L = lv(g.xp);
  const btns = b => (
    <div className="bbs">
      <button className="bbtn" type="button" onClick={() => toggleSave(b.id)}>{saved.includes(b.id) ? "⭐ Salva" : "☆ Salvar"}</button>
      <button className="bbtn" type="button" onClick={() => markRead(b.id)}>{g.reads.includes(b.id) ? "✔ Lida" : "Marcar como lida (+15 XP)"}</button>
    </div>
  );
  const W = wkInfo(), WB = CAT[W.wk % CAT.length];
  const cats = ["Todas", ...new Set(CAT.map(b => b.c)), "⭐ Salvas"];
  const libList = CAT.filter(b => filt === "Todas" || (filt === "⭐ Salvas" ? saved.includes(b.id) : b.c === filt));
  const isU = cur?.isUrl; let host = "";
  if (isU) { try { host = new URL(cur.input).hostname.replace(/^www\./, ""); } catch {} }
  const q = cur ? (isU ? host : cur.input.slice(0, 80)) : "";

  return (
    <div className="fk" data-theme={theme}>
      <style>{CSS}</style>

      <header>
        <button className="logo" onClick={() => go("home")} aria-label="Fakely — Início">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: "var(--brand)" }} /><stop offset="1" stopColor="#8b6bff" /></linearGradient></defs>
            <rect width="36" height="36" rx="11" fill="url(#lg)" />
            <path d="M12.5 27V10h12M12.5 18h8" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="26" cy="26" r="3.2" fill="#ffd166" />
          </svg>
          <b>Fake<span>ly</span></b>
        </button>
        <nav>
          <a href="#como" onClick={e => { e.preventDefault(); goSection("como"); }}>Como funciona</a>
          <a href="#faq" onClick={e => { e.preventDefault(); goSection("faq"); }}>Perguntas</a>
          <a href="#historico" onClick={e => { e.preventDefault(); goSection("historico"); }}>Histórico</a>
          <a href="#" onClick={e => { e.preventDefault(); go("game"); }}>🏆 Conquistas</a>
          <a href="#" onClick={e => { e.preventDefault(); go("lib"); }}>📚 Leituras</a>
          <button className="xp" type="button" onClick={() => go("game")}>Nv {L.l} · {g.xp} XP</button>
          <button className="tgl" type="button" role="switch" aria-checked={theme === "dark"} aria-label="Alternar entre modo claro e escuro" title="Alternar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <span className="k">☀️</span><span className="k">🌙</span><i />
          </button>
        </nav>
      </header>

      <main>
        {/* INÍCIO */}
        {screen === "home" && (
          <section className="screen">
            <div className="hero">
              <h1>Será que isso é <b>verdade</b>?</h1>
              <p>Cole um texto, manchete ou link e receba uma análise indicando se a informação é possivelmente verdadeira, inconclusiva ou possivelmente falsa.</p>
              <div className="box">
                <div className="tabs">
                  {[["text","Texto"],["url","Link"]].map(([m, l]) => (
                    <button key={m} className={"tab" + (mode === m ? " on" : "")} onClick={() => { setMode(m); setErr(""); }}>{l}</button>
                  ))}
                </div>
                {mode === "text"
                  ? <textarea value={text} maxLength={2000} placeholder="Cole aqui a notícia ou mensagem que você recebeu…" onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) start(); }} />
                  : <input type="url" value={url} placeholder="https://exemplo.com/noticia" onChange={e => setUrl(e.target.value)} onKeyDown={e => { if (e.key === "Enter") start(); }} />}
                <div className="err" role="alert">{err}</div>
                <div className="row">
                  <span className="count" style={{ visibility: mode === "text" ? "visible" : "hidden" }}>{text.length} / 2000</span>
                  <span>
                    <button className="btn ghost" type="button" onClick={() => { setText(""); setUrl(""); setErr(""); }}>Limpar</button>{" "}
                    <button className="btn" type="button" onClick={start}>Analisar</button>
                  </span>
                </div>
              </div>
            </div>

            <h2 id="como">Como funciona</h2>
            <div className="grid">
              {[["Envie o conteúdo","Cole o texto ou o link da informação que deseja verificar."],["Análise","Procuramos sinais de linguagem sensacionalista, fonte e estrutura do texto."],["Resultado","Você recebe um veredito, os sinais encontrados e leituras para pensar melhor."]].map(([t, d], i) => (
                <div className="card" key={t}><div className="n">{i + 1}</div><h3>{t}</h3><p>{d}</p></div>
              ))}
            </div>

            <h2 id="faq">Perguntas frequentes</h2>
            {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}

            <h2 id="historico">Histórico</h2>
            <div>
              {hist.length === 0 && <p style={{ color: "var(--muted)" }}>Nenhuma análise ainda.</p>}
              {hist.map((h, i) => (
                <div className="item" key={h.at + "-" + i} onClick={() => { setCur(h); go("res"); }}>
                  <span>{h.input.length > 70 ? h.input.slice(0, 70) + "…" : h.input}</span>
                  <span className="tag" style={{ background: `var(--${h.k}bg)`, color: `var(--${h.k})` }}>{LABEL[h.k]}</span>
                </div>
              ))}
            </div>
            {hist.length > 0 && <button className="btn ghost" type="button" onClick={() => setHist([])}>Apagar histórico</button>}
          </section>
        )}

        {/* CARREGAMENTO */}
        {screen === "load" && (
          <section className="screen">
            <div className="load">
              <div className="spin" />
              <h2 style={{ margin: 0 }}>Analisando informação…</h2>
              <div className="bar"><i style={{ width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%` }} /></div>
              <ul className="steps">
                {STEPS.map((s, j) => <li key={s} className={j < step ? "done" : j === step ? "cur" : ""}>{s}</li>)}
              </ul>
            </div>
          </section>
        )}

        {/* RESULTADO */}
        {screen === "res" && cur && (
          <section className="screen">
            <div className={"verdict " + cur.k}>
              <div className="ring" style={{ "--p": cur.score, "--c": `var(--${cur.k})` }} data-t={cur.score + "%"} />
              <div><h2>{LABEL[cur.k]}</h2><p>{DESC[cur.k]}</p></div>
            </div>
            <div className="quote">{cur.input}</div>

            <h2 className="h20">Sinais encontrados</h2>
            <div className="card">
              {cur.sig.map(([ic, m], i) => <div className="sig" key={i}><em>{ic}</em><span>{m}</span></div>)}
            </div>

            <h2 className="h20">Fontes de pesquisa</h2>
            <p className="sub">Agências de checagem para confrontar a informação. Cada botão abre uma busca sobre o tema no site da agência.</p>
            <div className="srcs">
              {CHK.map(([n, d, desc]) => (
                <a className="src" key={d} target="_blank" rel="noopener noreferrer" href={"https://www.google.com/search?q=" + encodeURIComponent(`site:${d} ${q}`)}>
                  <b>{n}</b><small>{desc} · {d}</small><span>Pesquisar este tema ↗</span>
                </a>
              ))}
            </div>
            <p className="sub" style={{ marginTop: 18 }}>Domínios de referência usados pelo algoritmo para avaliar links (em verde, o que coincidiu com o seu):</p>
            <div className="refs">
              {TRUST.map(d => { const hit = host && host.endsWith(d); return <span key={d} className={"ref" + (hit ? " hit" : "")}>{hit ? "✓ " : ""}{d}</span>; })}
            </div>

            <h2 className="h20">Para pensar com mais criticidade</h2>
            <p className="sub">Leituras filosóficas que ajudam a duvidar com método e distinguir fato de opinião.</p>
            <div className="books">
              {cur.books.map(i => { const b = BOOKS[i]; return (
                <div className="book" key={i}>
                  <div className="cover" /><h3>{b.t}</h3><small>{b.a}</small><p>{b.s}</p>
                  <button type="button" onClick={() => setTips(t => ({ ...t, [i]: true }))}>{tips[i] ? "💡 " + b.tip : "Ver dica de leitura"}</button>
                </div>
              ); })}
            </div>

            <div className="actions">
              <button className="btn" onClick={() => { setText(""); setUrl(""); go("home"); }}>Nova análise</button>
              <button className="btn ghost" onClick={copy}>{copied ? "Copiado ✓" : "Copiar resultado"}</button>
            </div>
            <p className="note">Esta análise é automática e indicativa, não substitui a checagem por jornalistas e agências especializadas.</p>
          </section>
        )}

        {/* CONQUISTAS */}
        {screen === "game" && (
          <section className="screen">
            <div className="lvl">
              <div className="badge">{L.l}</div>
              <div className="info">
                <h2>{TITLES[Math.min(L.l - 1, TITLES.length - 1)]}</h2>
                <p>{g.xp} XP no total · faltam {L.need - L.rem} XP para o nível {L.l + 1}</p>
                <div className="xbar"><i style={{ width: `${Math.round((L.rem / L.need) * 100)}%` }} /></div>
              </div>
            </div>
            <h2>Estatísticas</h2>
            <div className="grid">
              {[[g.n,"Pesquisas"],[g.ok,"Verdadeiras"],[g.mid,"Inconclusivas"],[g.bad,"Falsas"],[g.url,"Links"],[g.streak,"Dias seguidos"]].map(([v, l]) => (
                <div className="card stat" key={l}><b>{v}</b><span>{l}</span></div>
              ))}
            </div>
            <h2>Conquistas <small style={{ color: "var(--muted)", fontSize: 15 }}>({g.ach.length}/{ACH.length})</small></h2>
            <div className="achs">
              {ACH.map(a => { const v = Math.min(a.f(g), a.g), on = g.ach.includes(a.id); return (
                <div className={"ach" + (on ? " on" : "")} key={a.id}>
                  <div className="ic">{a.ic}</div>
                  <div style={{ flex: 1 }}>
                    <h3>{a.t}</h3><p>{a.d}</p>
                    <div className="pb"><i style={{ width: `${(v / a.g) * 100}%` }} /></div>
                    <small>{on ? "Concluída · " : ""}{v}/{a.g} · +{a.xp} XP</small>
                  </div>
                </div>
              ); })}
            </div>
            <div className="actions">
              <button className="btn" onClick={() => go("home")}>Fazer uma análise</button>
              <button className="btn ghost" onClick={() => { if (window.confirm("Zerar todo o seu progresso?")) setGs({ ...S0, ach: [], reads: [] }); }}>Zerar progresso</button>
            </div>
          </section>
        )}

        {/* LEITURAS */}
        {screen === "lib" && (
          <section className="screen">
            <div className="week">
              <div className="lab">📅 Leitura da semana · desde {W.mon.toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" })}</div>
              <h2>{WB.t}</h2>
              <div>{WB.a} · {WB.c}</div>
              <p>{WB.s}</p>
              <p><b>Para refletir:</b> {WB.w}</p>
              {btns(WB)}
              <div className="next">Nas próximas semanas: {[1, 2, 3].map(k => <span key={k}>{CAT[(W.wk + k) % CAT.length].t}</span>)}</div>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 0 }}>Nova recomendação em {W.left} {W.left > 1 ? "dias" : "dia"}.</p>
            </div>
            <h2>Acervo de leituras</h2>
            <p className="sub">Obras literárias e filosóficas para treinar o pensamento crítico. Salve as que quiser ler e marque as concluídas para ganhar XP.</p>
            <div className="filters">
              {cats.map(c => <button key={c} type="button" className={"fl" + (c === filt ? " on" : "")} onClick={() => setFilt(c)}>{c}</button>)}
            </div>
            <div className="books">
              {libList.length === 0 && <p style={{ color: "var(--muted)" }}>Nenhuma obra salva ainda.</p>}
              {libList.map(b => (
                <div className="book" key={b.id}>
                  <div className="cover" /><span className="tagc">{b.c}</span><h3>{b.t}</h3><small>{b.a}</small>
                  <p>{b.s}</p><p><b>Para refletir:</b> {b.w}</p>{btns(b)}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="toasts">{toasts.map(t => <div className="toast" key={t.id}>{t.m}</div>)}</div>
      <footer>© 2026 Fakely — pense antes de compartilhar.</footer>
    </div>
  );
}

/* ================= ESTILOS ================= */
const CSS = `
.fk{--bg:#d9dce2;--surface:#eceef1;--text:#13151a;--muted:#3d424b;--line:#a9afbb;--brand:#3f7bf5;--brand2:#6f9eff;--ok:#16895d;--okbg:#d5f3e5;--mid:#a86f00;--midbg:#ffeab8;--bad:#c9283f;--badbg:#fcd9de;
min-height:100vh;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55;transition:background .3s,color .3s}
.fk[data-theme="dark"]{--bg:#0d1424;--surface:#18223a;--text:#f3f6ff;--muted:#b4c0dd;--line:#3b4c75;--brand:#6b9dff;--brand2:#4a7ae0;--okbg:#17352b;--midbg:#3a3017;--badbg:#3d1d26;--ok:#4fd6a0;--mid:#f4bd3c;--bad:#ff8294}
.fk *{box-sizing:border-box}.fk button{font:inherit;cursor:pointer}
.fk header{position:sticky;top:0;z-index:5;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:16px;padding:12px 20px;flex-wrap:wrap}
.fk .logo{font-weight:800;font-size:22px;letter-spacing:-.5px;display:flex;gap:8px;align-items:center;background:none;border:0;color:var(--text)}
.fk .logo span{color:var(--brand)}.fk .logo svg{width:36px;height:36px;flex:none;transition:transform .3s}.fk .logo:hover svg{transform:rotate(-8deg) scale(1.06)}
.fk nav{margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.fk nav a{color:var(--muted);text-decoration:none;padding:8px 12px;border-radius:10px;font-size:14px}.fk nav a:hover{background:var(--bg);color:var(--text)}
.fk .xp{background:linear-gradient(135deg,var(--brand),#8b6bff);color:#fff;border:0;border-radius:99px;padding:8px 14px;font-weight:700;font-size:13px}.fk .xp:hover{filter:brightness(1.1)}
.fk .tgl{position:relative;display:flex;align-items:center;justify-content:space-between;width:68px;height:36px;padding:0 9px;border-radius:99px;border:1.5px solid var(--line);background:var(--bg)}
.fk .tgl i{position:absolute;top:3px;left:3px;width:27px;height:27px;border-radius:50%;background:var(--brand);transition:transform .3s;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.fk .tgl[aria-checked="true"] i{transform:translateX(32px)}.fk .tgl .k{position:relative;z-index:1;font-size:14px;line-height:1}.fk .tgl:hover{border-color:var(--brand)}
.fk main{max-width:920px;margin:0 auto;padding:0 20px 60px}
.fk .screen{animation:fk-in .4s}@keyframes fk-in{from{opacity:0;transform:translateY(8px)}to{opacity:1}}
.fk .hero{position:relative;text-align:center;padding:56px 0 28px}
.fk .hero::before{content:"";position:absolute;inset:-10px -8%;z-index:-1;background:radial-gradient(circle at 18% 30%,rgba(63,123,245,.3),transparent 42%),radial-gradient(circle at 82% 20%,rgba(139,107,255,.26),transparent 42%);filter:blur(10px);animation:fk-float 9s ease-in-out infinite alternate}
.fk .hero h1{font-size:clamp(28px,6vw,46px);margin:0 0 12px;line-height:1.15}
.fk .hero h1 b{background:linear-gradient(90deg,var(--brand),#8b6bff,var(--brand));background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fk-shine 4s linear infinite}
.fk .hero p{color:var(--muted);max-width:560px;margin:0 auto 28px}
.fk .box{background:var(--surface);border:1.5px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 8px 30px rgba(63,123,245,.12);text-align:left;transition:box-shadow .25s}
.fk .box:focus-within{box-shadow:0 0 0 3px rgba(63,123,245,.35),0 8px 30px rgba(63,123,245,.2)}
.fk .tabs{display:flex;gap:6px;margin-bottom:10px}.fk .tab{background:none;border:0;padding:6px 12px;border-radius:8px;color:var(--muted);font-size:14px}.fk .tab.on{background:var(--bg);color:var(--brand);font-weight:600}
.fk textarea,.fk input[type=url]{width:100%;border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:12px;padding:12px;font:inherit;resize:vertical}
.fk textarea{min-height:120px}.fk textarea:focus,.fk input:focus{outline:2px solid var(--brand);border-color:transparent}
.fk .row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap}.fk .count{font-size:13px;color:var(--muted)}
.fk .btn{background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;border:0;padding:12px 24px;border-radius:12px;font-weight:700;box-shadow:0 6px 16px rgba(63,123,245,.35);transition:transform .15s,box-shadow .25s,filter .2s}
.fk .btn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(63,123,245,.45);filter:brightness(1.06)}.fk .btn:active{transform:scale(.96)}
.fk .btn.ghost{background:var(--surface);color:var(--text);border:1.5px solid var(--line);box-shadow:none}
.fk .err{color:var(--bad);font-size:14px;margin-top:8px;min-height:20px}
.fk h2{font-size:26px;margin:48px 0 16px}.fk h2.h20{font-size:20px}.fk .sub{color:var(--muted);margin:-8px 0 14px;font-size:14px}
.fk .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.fk .card,.fk .book,.fk .src,.fk details{background:var(--surface);border:1.5px solid var(--line);border-radius:16px;transition:transform .25s,box-shadow .25s,border-color .25s}
.fk .card{padding:18px}.fk .card:hover,.fk .book:hover,.fk details:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(63,123,245,.2);border-color:var(--brand)}
.fk .card .n{width:34px;height:34px;border-radius:10px;background:var(--bg);color:var(--brand);display:grid;place-items:center;font-weight:800;margin-bottom:8px}
.fk .card h3{margin:0 0 6px;font-size:16px}.fk .card p{margin:0;color:var(--muted);font-size:14px}
.fk details{padding:12px 16px;margin-bottom:8px;border-radius:12px}.fk summary{cursor:pointer;font-weight:600}.fk details p{color:var(--muted);margin:8px 0 0}
.fk .item{display:flex;justify-content:space-between;gap:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--line);border-radius:12px;margin-bottom:8px;font-size:14px;cursor:pointer}
.fk .tag{font-size:12px;padding:2px 10px;border-radius:99px;font-weight:700;white-space:nowrap;align-self:center}
.fk .load{text-align:center;padding:90px 0}
.fk .spin{width:72px;height:72px;border-radius:50%;border:6px solid var(--line);border-top-color:var(--brand);margin:0 auto 24px;animation:fk-sp 1s linear infinite}@keyframes fk-sp{to{transform:rotate(360deg)}}
.fk .bar{height:8px;background:var(--line);border-radius:9px;max-width:360px;margin:18px auto;overflow:hidden}.fk .bar i{display:block;height:100%;background:var(--brand);transition:width .4s}
.fk .steps{list-style:none;padding:0;margin:20px auto 0;max-width:320px;text-align:left;color:var(--muted);font-size:14px}.fk .steps li{padding:4px 0}
.fk .steps li.done{color:var(--ok)}.fk .steps li.done::before{content:"✓ "}.fk .steps li.cur{color:var(--text);font-weight:600}
.fk .verdict{border-radius:20px;padding:28px;margin:36px 0 20px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;animation:fk-pop .5s both}
.fk .verdict.ok{background:var(--okbg)}.fk .verdict.mid{background:var(--midbg)}.fk .verdict.bad{background:var(--badbg)}
.fk .verdict h2{margin:0 0 4px}.fk .verdict p{margin:0;color:var(--muted)}
.fk .ring{width:92px;height:92px;border-radius:50%;background:conic-gradient(var(--c) calc(var(--p)*1%),var(--line) 0);position:relative;flex:none}
.fk .ring::after{content:attr(data-t);position:absolute;inset:8px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-weight:800;font-size:22px}
.fk .quote{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--brand);padding:12px 16px;border-radius:10px;color:var(--muted);font-size:14px;max-height:110px;overflow:auto;word-break:break-word}
.fk .sig{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px}.fk .sig:last-child{border:0}.fk .sig em{font-style:normal;flex:none}
.fk .srcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.fk .src{display:flex;flex-direction:column;gap:4px;padding:14px 16px;text-decoration:none;color:var(--text);border-radius:14px;animation:fk-pop .5s both}
.fk .src:hover{border-color:var(--brand);transform:translateY(-2px)}.fk .src small{color:var(--muted)}.fk .src span{color:var(--brand);font-weight:700;font-size:13px;margin-top:4px}
.fk .refs{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.fk .ref{font-size:12px;padding:4px 12px;border-radius:99px;background:var(--surface);border:1px solid var(--line);color:var(--muted)}
.fk .ref.hit{background:var(--okbg);color:var(--ok);border-color:var(--ok);font-weight:700}
.fk .books{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.fk .book{padding:18px;display:flex;flex-direction:column;gap:8px;animation:fk-pop .5s both}
.fk .book .cover{height:8px;border-radius:9px;background:linear-gradient(90deg,var(--brand),var(--brand2))}
.fk .book h3{margin:4px 0 0;font-size:17px}.fk .book small{color:var(--muted)}.fk .book p{margin:0;font-size:14px;color:var(--muted)}
.fk .book>button{margin-top:auto;align-self:flex-start;background:none;border:0;color:var(--brand);font-weight:700;padding:4px 0}
.fk .tagc{font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:.05em}
.fk .bbs{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.fk .book .bbs{margin-top:auto}
.fk .bbtn{border:1.5px solid var(--line);background:var(--bg);color:var(--text);border-radius:10px;padding:6px 12px;font-size:13px;font-weight:600;transition:transform .15s,border-color .2s}.fk .bbtn:hover{transform:translateY(-1px);border-color:var(--brand)}
.fk .actions{display:flex;gap:10px;margin-top:28px;flex-wrap:wrap}.fk .note{font-size:12px;color:var(--muted);margin-top:24px}
.fk .lvl,.fk .week{margin-top:36px;border-radius:22px;padding:26px;color:#fff;box-shadow:0 14px 34px rgba(63,123,245,.35)}
.fk .lvl{background:linear-gradient(135deg,var(--brand),#8b6bff);display:flex;gap:22px;align-items:center;flex-wrap:wrap}
.fk .badge{width:84px;height:84px;border-radius:24px;background:rgba(255,255,255,.22);display:grid;place-items:center;font-size:34px;font-weight:800;flex:none}
.fk .lvl .info{flex:1;min-width:220px}.fk .lvl h2{margin:0;font-size:24px;color:#fff}.fk .lvl p{margin:2px 0 10px;opacity:.92}
.fk .xbar{height:12px;border-radius:9px;background:rgba(255,255,255,.28);overflow:hidden}.fk .xbar i{display:block;height:100%;background:#ffd166;border-radius:9px;transition:width .8s}
.fk .stat{text-align:center}.fk .stat b{display:block;font-size:30px;color:var(--brand)}.fk .stat span{color:var(--muted);font-size:13px}
.fk .achs{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.fk .ach{background:var(--surface);border:1.5px solid var(--line);border-radius:16px;padding:16px;display:flex;gap:14px;animation:fk-pop .5s both}
.fk .ach .ic{width:52px;height:52px;border-radius:14px;background:var(--bg);display:grid;place-items:center;font-size:26px;flex:none;filter:grayscale(1);opacity:.55}
.fk .ach.on{border-color:var(--ok);box-shadow:0 0 0 3px var(--okbg)}.fk .ach.on .ic{filter:none;opacity:1;background:var(--okbg)}
.fk .ach h3{margin:0;font-size:15px}.fk .ach p{margin:2px 0 8px;font-size:13px;color:var(--muted)}.fk .ach small{font-size:12px;color:var(--muted)}
.fk .pb{height:7px;background:var(--line);border-radius:9px;overflow:hidden}.fk .pb i{display:block;height:100%;background:var(--brand)}.fk .ach.on .pb i{background:var(--ok)}
.fk .week{background:linear-gradient(135deg,#283560,var(--brand));animation:fk-pop .5s both}.fk .week h2{margin:6px 0 2px;color:#fff;font-size:28px}.fk .week p{margin:8px 0;max-width:720px}
.fk .week .lab{font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;font-weight:700}
.fk .week .bbtn{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.55);color:#fff}.fk .week .bbtn:hover{background:rgba(255,255,255,.3)}
.fk .next{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:16px;font-size:13px}.fk .next span{background:rgba(255,255,255,.18);padding:4px 12px;border-radius:99px}
.fk .filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.fk .fl{background:var(--surface);border:1.5px solid var(--line);color:var(--text);border-radius:99px;padding:6px 14px;font-size:13px;font-weight:600}.fk .fl:hover{border-color:var(--brand)}.fk .fl.on{background:var(--brand);border-color:var(--brand);color:#fff}
.fk .toasts{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:20;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:max-content;max-width:92vw}
.fk .toast{background:var(--text);color:var(--bg);padding:10px 18px;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 10px 26px rgba(0,0,0,.3);animation:fk-pop .3s both}
.fk footer{text-align:center;color:var(--muted);font-size:13px;padding:24px}
@keyframes fk-pop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
@keyframes fk-shine{to{background-position:200% 0}}
@keyframes fk-float{to{transform:translate(2%,6%) scale(1.06)}}
@media(max-width:560px){.fk header{padding:10px 14px}.fk nav a{padding:6px 8px}.fk .verdict{padding:20px}}
@media(prefers-reduced-motion:reduce){.fk *{animation:none!important;transition:none!important}}
`;
