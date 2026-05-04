import { useState, useEffect } from "react";
import "../styles/QuoteDisplay.css";

export default function QuoteDisplay({ isLoading }) {
  const [currentQuote, setCurrentQuote] = useState(0);

  // Quotes from Indian philosophers and thought leaders
  const quotes = [
    {
      text: "Where can we go to find God if we cannot see Him in our own hearts and in every living being?",
      author: "Swami Vivekananda",
    },
    {
      text: "The great religions of the world are not competitive but complementary.",
      author: "Abdul Kalam",
    },
    {
      text: "Know that person in whom lust, anger, and greed have wholly disappeared, whom no sorrow can pierce, whose hatred is gone – he is a sage.",
      author: "Chanakya",
    },
    {
      text: "The moment I have realized the worth of my life, I have felt it necessary to die.",
      author: "Swami Vivekananda",
    },
    {
      text: "Dream is not that which you see while sleeping it is something that makes you sleepless.",
      author: "Abdul Kalam",
    },
    {
      text: "A person is great, not because of their physical appearance, but because of the depth of their character.",
      author: "Chanakya",
    },
    {
      text: "Help and not fight. Assimilation and not Dissociation. Harmony and Peace and not Discordance.",
      author: "Swami Vivekananda",
    },
    {
      text: "Excellence is a continuous process and not an accident.",
      author: "Abdul Kalam",
    },
    {
      text: "As long as a man does not give up his attachment to the body, he cannot attain the Eternal.",
      author: "Chanakya",
    },
    {
      text: "Where can we go to find God if we cannot see Him in our own hearts and in every living being?",
      author: "Swami Vivekananda",
    },
    {
      text: "Tell me and I forget, teach me and I may remember, involve me and I learn.",
      author: "Benjamin Franklin (via Indian wisdom tradition)",
    },
    {
      text: "The greatest religion is to be true to this life, to make the best of it.",
      author: "Swami Vivekananda",
    },
    {
      text: "Power is not something external to be acquired; only unfold what is within you.",
      author: "Swami Vivekananda",
    },
    {
      text: "The test of a first-rate intelligence is the ability to hold two opposed ideas in mind at the same time, and still retain the ability to function.",
      author: "Chanakya",
    },
    {
      text: "Desires and wants can never be fully satisfied. One man can earn a lot, but he always wants more.",
      author: "Chanakya",
    },
  ];

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const quote = quotes[currentQuote];

  return (
    <div className="quote-display">
      <div className="quote-content">
        <div className="loading-spinner"></div>
        <p className="quote-text">"{quote.text}"</p>
        <p className="quote-author">— {quote.author}</p>
        <p className="loading-text">Generating your content...</p>
      </div>
    </div>
  );
}
