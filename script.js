const questions = [
    { id: "visual", text: "Are there 'stars,' blurriness, or light sensitivity?", section: "Neurological" },
    { id: "aphasia", text: "Am I struggling to find basic words or finish a sentence?", section: "Neurological" },
    { id: "sound", text: "Does the hum of the fridge or computer fan feel 'loud'?", section: "Neurological" },
    { id: "coord", text: "Did I stumble or drop something in the last hour?", section: "Neurological" },
    { id: "jaw", text: "Are my teeth touching or clenched?", section: "Physical" },
    { id: "edema", text: "Does my footwear/skin feel tighter than an hour ago?", section: "Physical" },
    { id: "posture", text: "Is my chin 'reaching' toward the screen?", section: "Physical" },
    { id: "pain", text: "Is there a sharp 'ice-pick' or 'throbbing' sensation?", section: "Physical" },
    { id: "irritability", text: "Did a minor software lag make me angry?", section: "Psychological" },
    { id: "dread", text: "Do I feel a 'pit' in my stomach about the next task?", section: "Psychological" },
    { id: "urgency", text: "Do I feel a 'false' sense of rushing?", section: "Psychological" }
];

let currentIdx = 0;
let answers = {};

function updateUI() {
    const q = questions[currentIdx];
    document.getElementById("section-title").innerText = q.section;
    document.getElementById("question-text").innerText = q.text;
    document.getElementById("progress-bar").style.width = `${(currentIdx / questions.length) * 100}%`;
}

function handleAnswer(val) {
    answers[questions[currentIdx].id] = val;
    if (currentIdx < questions.length - 1) {
        currentIdx++;
        updateUI();
    } else {
        evaluateHealth();
    }
}

function evaluateHealth() {
    document.getElementById("quiz-box").classList.add("hidden");
    const resultBox = document.getElementById("result-box");
    const recText = document.getElementById("recommendation-text");
    resultBox.classList.remove("hidden");

    // Neurological count
    const neuroIds = ["visual", "aphasia", "sound", "coord"];
    const neuroScore = neuroIds.reduce((count, id) => count + (answers[id] ? 1 : 0), 0);

    // Rule Checking
    if (neuroScore >= 2 || (answers.irritability && answers.jaw)) {
        recText.innerHTML = "<strong>Mandatory Break:</strong> Stop all screen and audio work for 60 minutes. Your nervous system is overtaxed.";
    } else if (answers.pain || answers.posture) {
        recText.innerHTML = "<strong>Physical Adjustment:</strong> Stretch your neck and check your workstation ergonomics.";
    } else {
        recText.innerHTML = "<strong>Clear:</strong> You are within safe operating limits. Remember to blink and hydrate.";
    }
}

updateUI(); // Initialize first question
