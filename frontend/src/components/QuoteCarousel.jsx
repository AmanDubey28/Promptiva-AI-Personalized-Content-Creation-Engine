import { useState, useEffect } from "react";

const indianQuotes = [
  { quote: "Dream is not that which you see while sleeping, it is something that does not let you sleep.", author: "Dr. APJ Abdul Kalam", role: "Missile Man of India · 11th President", initial: "K" },
  { quote: "You have to dream before your dreams can come true.", author: "Dr. APJ Abdul Kalam", role: "Missile Man of India · 11th President", initial: "K" },
  { quote: "Excellence is a continuous process and not an accident.", author: "Dr. APJ Abdul Kalam", role: "Missile Man of India · 11th President", initial: "K" },
  { quote: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda", role: "Philosopher · Spiritual Leader", initial: "V" },
  { quote: "Take up one idea. Make that one idea your life — think of it, dream of it, live on that idea.", author: "Swami Vivekananda", role: "Philosopher · Spiritual Leader", initial: "V" },
  { quote: "The greatest religion is to be true to your own nature. Have faith in yourselves.", author: "Swami Vivekananda", role: "Philosopher · Spiritual Leader", initial: "V" },
  { quote: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi", role: "Father of the Nation", initial: "G" },
  { quote: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", role: "Father of the Nation", initial: "G" },
  { quote: "Education is the most powerful weapon which you can use to change the world.", author: "B.R. Ambedkar", role: "Architect of Indian Constitution", initial: "A" },
  { quote: "You can't cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore", role: "Nobel Laureate · Poet", initial: "T" },
  { quote: "Do not be afraid of anything. You will do marvelous work. The moment you fear, you are nobody.", author: "Swami Vivekananda", role: "Philosopher · Spiritual Leader", initial: "V" },
  { quote: "First they ignore you, then they laugh at you, then they fight you, then you win.", author: "Mahatma Gandhi", role: "Father of the Nation", initial: "G" },
];

const authorColors = {
  "K": { bg: "rgba(255, 149, 0, 0.15)", border: "#FF9500", text: "#FF9500" },
  "V": { bg: "rgba(255, 69, 58, 0.15)", border: "#FF453A", text: "#FF453A" },
  "G": { bg: "rgba(48, 209, 88, 0.15)", border: "#30D158", text: "#30D158" },
  "A": { bg: "rgba(10, 132, 255, 0.15)", border: "#0A84FF", text: "#0A84FF" },
  "T": { bg: "rgba(191, 90, 242, 0.15)", border: "#BF5AF2", text: "#BF5AF2" },
};

export default function QuoteCarousel() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % indianQuotes.length);
        setFade(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const q = indianQuotes[current];
  const color = authorColors[q.initial] || authorColors["K"];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      minHeight: "280px",
    }}>
      {/* Animated dots */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "36px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#FF9500",
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <div style={{
        maxWidth: "600px",
        width: "100%",
        opacity: fade ? 1 : 0,
        transform: fade ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}>
        {/* Quote mark */}
        <div style={{
          fontSize: "72px",
          lineHeight: "0.5",
          color: color.text,
          opacity: 0.4,
          fontFamily: "Georgia, serif",
          marginBottom: "16px",
        }}>"</div>

        <p style={{
          fontSize: "20px",
          lineHeight: "1.7",
          color: "#F0EBE1",
          fontFamily: "'Georgia', serif",
          fontStyle: "italic",
          margin: "0 0 28px 0",
          textAlign: "center",
        }}>
          {q.quote}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: color.bg,
            border: `2px solid ${color.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: "700", color: color.text,
            fontFamily: "serif",
            flexShrink: 0,
          }}>{q.initial}</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff", letterSpacing: "0.3px" }}>{q.author}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px", letterSpacing: "0.5px" }}>{q.role}</div>
          </div>
        </div>
      </div>

      {/* Dots progress */}
      <div style={{ display: "flex", gap: "6px", marginTop: "32px" }}>
        {indianQuotes.map((_, i) => (
          <div key={i} style={{
            width: i === current ? "20px" : "6px",
            height: "6px",
            borderRadius: "3px",
            background: i === current ? color.text : "#333",
            transition: "all 0.4s ease",
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
