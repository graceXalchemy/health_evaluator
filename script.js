const questions = [
  { id: "visual", text: "Are there 'stars,' blurriness, or light sensitivity?", section: "neurological" },
  { id: "aphasia", text: "Am I struggling to find basic words or finish a sentence?", section: "neurological" },
  { id: "sound", text: "Does the hum of the fridge or computer fan feel 'loud'?", section: "neurological" }, 
  { id: "coordination", text: "Did I stumble or drop something in the last hour?", section: "neurological" }, 
  { id: "tension", text: "Are my teeth touching or clenched?", section: "physical" },
  { id: "edema", text: "Does my footwear/skin feel tighter than it did an hour ago?", section: "physical" }, 
  { id: "posture", text: "Is my chin 'reaching' toward the screen?", section: "physical" }, 
  { id: "pain", text: "Is there a sharp 'ice-pick' or 'throbbing' sensation present?", section: "physical" }, 
  { id: "irritability", text: "Did a minor software lag or notification make me angry?", section: "psychological" },
  { id: "dread", text: "Do I feel a 'pit' in my stomach about the next task?", section: "psychological" },
  { id: "urgency", text: "Do I feel a 'false' sense of rushing when there is no deadline?" }, 
  // ... add the rest here
];

let currentIdx = 0;
let answers = {};

function handleAnswer(val) {
  const q = questions[currentIdx];
  answers[q.id] = val;

  if (currentIdx < questions.length - 1) {
    currentIdx++;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById('question-container').style.display = 'none';
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'block';

  // Count Neurological "Yes" answers
  const neuroCount = questions
    .filter(q => q.section === 'neurological' && answers[q.id])
    .length;

  // Rule: 2 Neuro OR (Irritability AND Jaw Tension)
  if (neuroCount >= 2 || (answers.irritability && answers.jawTension)) {
    resultDiv.innerHTML = "<h2>Mandatory Break: Stop all screen work for 60 mins.</h2>";
  } else {
    resultDiv.innerHTML = "<h2>You are cleared to continue. Stay hydrated!</h2>";
  }
}