import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { roommates } from '../data/roommates';

// ── Game Data ─────────────────────────────────────────────────────
const QUOTES = [
  { text: "If it's not at least 2 AM, is it even a creative breakthrough?", author: 'divine' },
  { text: "Give me a library card and a quiet Sunday, and I will outlast you all.", author: 'nova' },
  { text: "A room without plants is like a day without sunshine.", author: 'joy' },
  { text: "The best stories never start with 'and then I stayed home.'", author: 'esther' },
  { text: "Some of us are just trying to live slowly in a fast world.", author: 'ediomo' },
  { text: "Food is how I say everything I don't know how to put into words.", author: 'endiong' },
  { text: "I know exactly which pile my keys are in.", author: 'divine' },
  { text: "Stay green, roommate!", author: 'joy' },
  { text: "There will be a house-wide inventory audit.", author: 'nova' },
  { text: "We wouldn't have it any other way.", author: 'esther' },
];

const TRIVIA = [
  { q: "Who moved in with exactly 11 plants on day one?", options: ['Joy', 'Nova', 'Esther', 'Endiong'], answer: 'Joy' },
  { q: "Which roommate has read over 300 books?", options: ['Divine', 'Esther', 'Nova', 'Ediomo'], answer: 'Nova' },
  { q: "Who started exactly 47 art projects?", options: ['Endiong', 'Esther', 'Divine', 'Ediomo'], answer: 'Divine' },
  { q: "Who invented the Wednesday Pasta Ritual?", options: ['Joy', 'Endiong', 'Nova', 'Esther'], answer: 'Endiong' },
  { q: "Which roommate has taken 280+ Polaroid photos?", options: ['Esther', 'Ediomo', 'Joy', 'Divine'], answer: 'Ediomo' },
  { q: "Who once got the group lost for 3 hours on a road trip?", options: ['Ediomo', 'Nova', 'Esther', 'Endiong'], answer: 'Esther' },
  { q: "Who 'wins' with the lowest messiness score (5%)?", options: ['Joy', 'Nova', 'Ediomo', 'Endiong'], answer: 'Nova' },
  { q: "Which roommate has slept through 10 alarms?", options: ['Joy', 'Endiong', 'Esther', 'Divine'], answer: 'Divine' },
];

const CLASH_TRAITS = [
  { trait: 'Messiest', key: 'messiness' },
  { trait: 'Most Chaotic', key: 'chaosLevel' },
  { trait: 'Most Mysterious', key: null, fun: ['luna', 'sofia', 'aisha', 'maya', 'elena', 'chloe'] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Game: Who Said It? ────────────────────────────────────────────
function WhoSaidIt() {
  const [qi, setQi] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const q = QUOTES[qi];
  const choices = shuffle([
    q.author,
    ...roommates.filter(r => r.id !== q.author).slice(0, 3).map(r => r.id),
  ]);

  function pick(id) {
    if (selected) return;
    setSelected(id);
    if (id === q.author) setScore(s => s + 1);
  }

  function next() {
    let next = Math.floor(Math.random() * QUOTES.length);
    while (next === qi) next = Math.floor(Math.random() * QUOTES.length);
    setQi(next);
    setSelected(null);
    setRound(r => r + 1);
  }

  const rm = (id) => roommates.find(r => r.id === id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Round {round}</span>
        <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)' }}>Score: {score}</span>
      </div>

      <div style={{ background: 'var(--surface-container-low)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.25rem', position: 'relative', fontFamily: 'var(--font-handwritten)', fontSize: '1.35rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>
        <span style={{ position: 'absolute', top: '0.5rem', left: '1rem', fontSize: '2.5rem', color: 'var(--primary)', opacity: 0.15, fontFamily: 'Georgia', lineHeight: 1 }}>"</span>
        <span style={{ display: 'block', marginLeft: '1rem' }}>{q.text}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        {choices.map(id => {
          const r = rm(id);
          const correct = id === q.author;
          let bg = 'var(--surface-container)';
          let color = 'var(--on-surface)';
          if (selected) {
            if (id === selected && correct) { bg = '#b9eedb'; color = '#12473a'; }
            else if (id === selected && !correct) { bg = '#e2d1bc'; color = '#815a5b'; }
            else if (correct) { bg = '#b9eedb'; color = '#12473a'; }
          }
          return (
            <button key={id} onClick={() => pick(id)} style={{
              padding: '0.75rem', borderRadius: '0.5rem', background: bg, color, border: 'none', cursor: selected ? 'default' : 'pointer',
              fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.25rem' }}>{r?.emoji}</span> {r?.name}
            </button>
          );
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: selected === q.author ? 'var(--secondary)' : 'var(--error)', marginBottom: '0.75rem' }}>
            {selected === q.author ? `✅ Correct! That was ${rm(q.author)?.name}!` : `❌ Nope! That was ${rm(q.author)?.name}!`}
          </p>
          <button onClick={next} style={{ padding: '0.6rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, cursor: 'pointer' }}>
            Next Quote →
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Game: Roomie Roulette ─────────────────────────────────────────
function RoommieRoulette() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const spins = 1440 + Math.floor(Math.random() * 720);
    const stop = Math.floor(Math.random() * roommates.length);
    setAngle(a => a + spins + stop * (360 / roommates.length));
    setTimeout(() => {
      setResult(roommates[stop]);
      setSpinning(false);
    }, 2200);
  }

  const facts = result ? [
    `${result.emoji} ${result.name} is known for: ${result.knownFor}`,
    `Love language: ${result.loveLanguage}`,
    `Comfort food: ${result.comfortFood}`,
    `Messiness: ${result.messiness}% — ${result.messinessLabel}`,
    `MBTI: ${result.mbti} | Role: ${result.houseRole}`,
  ] : [];

  const randomFact = result ? facts[Math.floor(Math.random() * facts.length)] : '';

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Wheel */}
      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 1.5rem', flexShrink: 0 }}>
        <motion.div
          animate={{ rotate: angle }}
          transition={{ duration: 2.2, ease: [0.2, 1, 0.3, 1] }}
          style={{
            width: '100%', height: '100%', borderRadius: '50%',
            border: `6px solid var(--primary)`,
            background: `conic-gradient(${roommates.map((r, i) => {
              const t = roommateThemes[r.id];
              const pct = 100 / roommates.length;
              return `${t.accentContainer} ${i * pct}% ${(i + 1) * pct}%`;
            }).join(', ')})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(57,57,27,0.15)' }}>
            <span style={{ fontSize: '1.75rem' }}>{spinning ? '⏳' : '🎯'}</span>
          </div>
        </motion.div>
        {/* Arrow */}
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '1.5rem' }}>▼</div>
      </div>

      {/* Roommate labels */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {roommates.map(r => (
          <span key={r.id} style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)' }}>
            {r.emoji} {r.name}
          </span>
        ))}
      </div>

      <button onClick={spin} disabled={spinning} style={{
        padding: '0.75rem 2rem', background: spinning ? 'var(--outline-variant)' : 'var(--primary)',
        color: 'white', border: 'none', borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem', cursor: spinning ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 14px rgba(129,90,91,0.3)',
      }}>
        {spinning ? 'Spinning...' : '🎲 Spin the Wheel'}
      </button>

      {result && !spinning && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: '1.5rem', padding: '1.25rem', background: `${roommateThemes[result.id].accentContainer}55`, borderRadius: '0.75rem' }}>
          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: roommateThemes[result.id].accentColor, marginBottom: '0.5rem' }}>
            🎉 You got {result.name} {result.emoji}
          </p>
          <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.15rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>{randomFact}</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Game: The Clash ───────────────────────────────────────────────
function TheClash() {
  const [pair, setPair] = useState(() => shuffle(roommates).slice(0, 2));
  const [trait] = useState(() => CLASH_TRAITS[Math.floor(Math.random() * CLASH_TRAITS.length)]);
  const [voted, setVoted] = useState(null);

  function newRound() {
    setPair(shuffle(roommates).slice(0, 2));
    setVoted(null);
  }

  const winner = trait.key
    ? (pair[0][trait.key] > pair[1][trait.key] ? pair[0] : pair[1])
    : pair[Math.floor(Math.random() * 2)];

  return (
    <div>
      <h4 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--tertiary)', textAlign: 'center', marginBottom: '1.25rem' }}>
        Who is more: <span style={{ color: 'var(--primary)' }}>{trait.trait}?</span>
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        {pair.map((r, side) => (
          <div key={r.id} style={{ display: 'contents' }}>
            <button
              onClick={() => setVoted(r.id)}
              disabled={!!voted}
              style={{
                padding: '1rem 0.5rem',
                borderRadius: '0.75rem',
                background: voted === r.id ? `${roommateThemes[r.id].accentColor}22` : 'var(--surface-container)',
                border: `2px solid ${voted ? (r.id === winner.id ? roommateThemes[r.id].accentColor : 'rgba(189,187,146,0.3)') : 'rgba(189,187,146,0.3)'}`,
                cursor: voted ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{r.emoji}</span>
              <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: roommateThemes[r.id].accentColor }}>{r.name}</span>
              <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.tagline}</span>
            </button>
            {side === 0 && (
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--outline-variant)' }}>VS</div>
            )}
          </div>
        ))}
      </div>

      {voted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>
            {voted === winner.id ? '✅ You got it!' : '❌ The real winner is:'} <strong style={{ color: roommateThemes[winner.id].accentColor }}>{winner.name}</strong>!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={newRound} style={{ padding: '0.6rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, cursor: 'pointer' }}>
              Next Clash →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Game: Chaos Trivia ────────────────────────────────────────────
function ChaosTrivia() {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = TRIVIA[qi];

  function pick(ans) {
    if (selected) return;
    setSelected(ans);
    if (ans === q.answer) setScore(s => s + 1);
  }

  function next() {
    if (qi + 1 >= TRIVIA.length) { setDone(true); return; }
    setQi(qi + 1);
    setSelected(null);
  }

  function restart() { setQi(0); setSelected(null); setScore(0); setDone(false); }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{score >= 6 ? '🏆' : score >= 4 ? '🥈' : '📝'}</div>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          {score} / {TRIVIA.length}
        </h3>
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
          {score >= 7 ? 'You basically live here! 🏠' : score >= 5 ? 'Solid roomie knowledge! 👏' : 'Time to read the profiles! 📖'}
        </p>
        <button onClick={restart} style={{ padding: '0.65rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, cursor: 'pointer' }}>
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
          Q{qi + 1} of {TRIVIA.length}
        </span>
        <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)' }}>Score: {score}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
        {TRIVIA.map((_, i) => (
          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < qi ? 'var(--secondary)' : i === qi ? 'var(--primary)' : 'var(--outline-variant)' }} />
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)', marginBottom: '1.25rem', lineHeight: 1.4 }}>{q.q}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        {q.options.map(opt => {
          let bg = 'var(--surface-container)';
          let color = 'var(--on-surface)';
          if (selected) {
            if (opt === q.answer) { bg = '#b9eedb'; color = '#12473a'; }
            else if (opt === selected) { bg = '#e2d1bc'; color = '#815a5b'; }
          }
          return (
            <button key={opt} onClick={() => pick(opt)} style={{
              padding: '0.75rem', borderRadius: '0.5rem', background: bg, color, border: 'none',
              cursor: selected ? 'default' : 'pointer', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={next} style={{ padding: '0.6rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, cursor: 'pointer' }}>
            {qi + 1 >= TRIVIA.length ? 'See Results 🏆' : 'Next →'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Import themes for the wheel
import { roommateThemes } from '../data/roommates';

const GAMES = [
  {
    id: 'whosaidit',
    title: 'Who Said It?',
    icon: 'record_voice_over',
    description: 'A quote appears — can you guess which roomie said it?',
    color: 'var(--secondary)',
    bg: 'rgba(185,238,219,0.3)',
    Component: WhoSaidIt,
  },
  {
    id: 'roulette',
    title: 'Roomie Roulette',
    icon: 'casino',
    description: 'Spin the wheel and discover a random roomie fact!',
    color: 'var(--primary)',
    bg: 'rgba(226,209,188,0.3)',
    Component: RoommieRoulette,
  },
  {
    id: 'clash',
    title: 'The Clash',
    icon: 'sports_mma',
    description: 'Two roomies go head-to-head — who wins the trait?',
    color: 'var(--tertiary)',
    bg: 'rgba(250,211,253,0.3)',
    Component: TheClash,
  },
  {
    id: 'trivia',
    title: 'Chaos Trivia',
    icon: 'quiz',
    description: 'Test how well you know the girlies with 8 questions!',
    color: '#be7d2d',
    bg: 'rgba(248,246,195,0.8)',
    Component: ChaosTrivia,
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState(null);
  const game = GAMES.find(g => g.id === activeGame);

  return (
    <div style={{
      background: '#fffbff',
      backgroundImage: 'radial-gradient(rgba(189,187,146,0.4) 0.5px, transparent 0.5px)',
      backgroundSize: '24px 24px',
      minHeight: '100vh',
      padding: '3rem 1.5rem 5rem',
    }}>
      <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary)', fontVariationSettings: "'FILL' 1", display: 'block', marginBottom: '0.5rem' }}>sports_esports</span>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--primary)', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
            Game Night!
          </h1>
          <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.25rem', color: 'var(--on-surface-variant)', transform: 'rotate(-1deg)' }}>
            How well do you know the Room 3 Girlies? 🎮
          </p>
        </motion.div>

        {/* Game selector cards */}
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
        >
          {GAMES.map(g => (
            <motion.button
              key={g.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              onClick={() => setActiveGame(g.id === activeGame ? null : g.id)}
              style={{
                padding: '1.25rem',
                background: activeGame === g.id ? g.bg : 'var(--surface-container-lowest)',
                border: `2px solid ${activeGame === g.id ? g.color : 'rgba(189,187,146,0.3)'}`,
                borderRadius: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease',
                boxShadow: activeGame === g.id ? `0 6px 20px ${g.color}33` : '0 2px 8px rgba(57,57,27,0.05)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: g.color, fontVariationSettings: "'FILL' 1", display: 'block', marginBottom: '0.5rem' }}>{g.icon}</span>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: g.color, marginBottom: '0.25rem' }}>{g.title}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{g.description}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Active Game Panel */}
        <AnimatePresence mode="wait">
          {game && (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              style={{
                background: game.bg,
                border: `2px solid ${game.color}44`,
                borderRadius: '1rem',
                padding: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: game.color, fontVariationSettings: "'FILL' 1" }}>{game.icon}</span>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: game.color }}>{game.title}</h2>
              </div>
              <game.Component />
            </motion.div>
          )}
        </AnimatePresence>

        {!activeGame && (
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
            ↑ Pick a game to start! ↑
          </p>
        )}
      </div>
    </div>
  );
}
