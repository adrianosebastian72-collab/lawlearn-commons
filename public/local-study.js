export function cleanText(input) {
  return String(input || "")
    .replace(/\r/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitSentences(input) {
  return cleanText(input)
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'(])/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 25);
}

export function makeExtractiveSummary(input, limit = 5) {
  const text = cleanText(input);
  const sentences = splitSentences(text);
  if (!sentences.length) return text.slice(0, 700);

  const stopWords = new Set(("about after again against all also am an and any are as at be because been before being between both but by can could did do does each either for from further had has have he her here hers him his how i if in into is it its itself just may might more most must my no nor not of off on once only or other our out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your").split(" "));
  const frequency = new Map();
  for (const word of text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []) {
    if (!stopWords.has(word)) frequency.set(word, (frequency.get(word) || 0) + 1);
  }
  const scored = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
    const score = words.reduce((sum, word) => sum + (frequency.get(word) || 0), 0) / Math.max(words.length, 1);
    return { sentence, index, score };
  });
  const chosen = scored.sort((a, b) => b.score - a.score).slice(0, Math.max(1, limit));
  return chosen.sort((a, b) => a.index - b.index).map(item => `• ${item.sentence}`).join("\n\n");
}

export function makeFlashcards(input, limit = 10) {
  const sentences = splitSentences(input);
  return sentences.slice(0, limit).map((sentence, index) => {
    const words = sentence.match(/[A-Za-z][A-Za-z'-]{4,}/g) || [];
    const answer = words.sort((a, b) => b.length - a.length)[0];
    if (!answer) return null;
    const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const question = sentence.replace(new RegExp(`\\b${escaped}\\b`, "i"), "________");
    return { question: `Complete the statement: ${question}`, answer, source: `Local card ${index + 1}` };
  }).filter(Boolean);
}

export function makeQuiz(input, limit = 6) {
  return makeFlashcards(input, limit).map((card, index) => ({
    question: card.question,
    answer: card.answer,
    explanation: "This is a locally generated recall question. Check the original notes to confirm the full context.",
    id: index + 1
  }));
}
