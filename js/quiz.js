/**
 * quiz.js — Client-side scoring for AI Risk Knowledge Quiz.
 * Scores locally, displays results, then saves to Airtable in background.
 */

const ANSWERS = {
  q1: 'B',
  q2: 'D',
  q3: 'C',
  q4: 'A',
  q5: 'C'
};

const QUESTIONS = {
  q1: 'What does "alignment" mean in AI safety?',
  q2: 'Which is an example of an "existential risk" from advanced AI?',
  q3: 'What is "the control problem" in AI safety?',
  q4: 'Why do researchers worry about "instrumental convergence"?',
  q5: 'What role does public awareness play in AI safety?'
};

const TIERS = [
  { min: 0, max: 1, name: 'AI Novice',       message: "You're just getting started. Check out our resources to learn more about AI risk." },
  { min: 2, max: 3, name: 'Informed Citizen', message: 'You have a solid foundation. Keep learning and sharing with your community.' },
  { min: 4, max: 5, name: 'AI Safety Pro',    message: 'You really know your stuff! Consider becoming a City Lead.' }
];

function getTier(score) {
  return TIERS.find(t => score >= t.min && score <= t.max);
}

document.getElementById('quiz-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value.trim();
  if (!email) { form.email.focus(); return; }

  // Check all questions answered
  const names = Object.keys(ANSWERS);
  for (const name of names) {
    const picked = form.querySelector(`input[name="${name}"]:checked`);
    if (!picked) {
      picked || form.querySelector(`input[name="${name}"]`).focus();
      return;
    }
  }

  // Score
  let score = 0;
  const answers = [];
  for (const name of names) {
    const picked = form.querySelector(`input[name="${name}"]:checked`).value;
    const correct = picked === ANSWERS[name];
    if (correct) score++;
    // Get the label text for the picked answer
    const pickedLabel = form.querySelector(`input[name="${name}"][value="${picked}"]`).nextElementSibling.textContent.trim();
    answers.push({
      question: QUESTIONS[name],
      picked: picked,
      answer: pickedLabel,
      correct: correct
    });
  }

  const tier = getTier(score);
  const total = names.length;

  // Show results
  form.style.display = 'none';
  const resultEl = document.getElementById('quiz-result');
  resultEl.style.display = 'block';
  document.getElementById('result-tier').textContent = tier.name;
  document.getElementById('result-score').textContent = `You scored ${score} out of ${total}`;
  document.getElementById('result-message').textContent = tier.message;

  if (score === total) {
    document.getElementById('tshirt-congrats').style.display = 'block';
  }

  // Scroll to results
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Background save to Airtable
  const payload = {
    email: email,
    score: score,
    totalQuestions: total,
    tier: tier.name,
    answers: JSON.stringify(answers),
    tshirtQualified: score === total
  };

  fetch('/.netlify/functions/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function () {
    // Silent fail — user already has their results
  });
});
