// Add this to the top of your script.js
const lastData = JSON.parse(localStorage.getItem('lastCheckup'));

if (lastData) {
    console.log(`Your last status was: ${lastData.status} on ${lastData.date}`);
};


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

// Replace your evaluateHealth function with this one
function evaluateHealth() {
    document.getElementById("quiz-box").classList.add("hidden");
    const resultBox = document.getElementById("result-box");
    const recText = document.getElementById("recommendation-text");
    resultBox.classList.remove("hidden");

    // Neurological count
    const neuroIds = ["visual", "aphasia", "sound", "coord"];
    const neuroScore = neuroIds.reduce((count, id) => count + (answers[id] ? 1 : 0), 0);

    // Rule Checking 
    let status = "";
    if (neuroScore >= 2 || (answers.irritability && answers.jaw)) {
        status = "Break Needed";
        recText.innerHTML = "<strong>Mandatory Break:</strong> Stop all screen work.";
    } else {
        status = "Clear";
        recText.innerHTML = "<strong>Clear:</strong> You are within safe limits.";
    }

    saveToHistory(status);
}

function downloadCSV() {
    const history = JSON.parse(localStorage.getItem('healthHistory')) || [];
    if (history.length === 0) return alert("No data to download");

    // Create CSV header and rows
    let csvContent = "Date,Status\n";
    history.forEach(item => {
        csvContent += `"${item.date}","${item.status}"\n`;
    });

    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'health_history.csv');
    a.click();
}

function saveToHistory(status) {
    const history = JSON.parse(localStorage.getItem('healthHistory')) || [];
    const newEntry = {
        date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: status
    };
    history.unshift(newEntry); // Adds latest to the top
    localStorage.setItem('healthHistory', JSON.stringify(history.slice(0, 10))); // Keeps last 10
}

function showHistory() {
    // Hide everything else
    document.getElementById("quiz-box").style.display = "none";
    document.getElementById("result-box").style.display = "none";
    document.getElementById("progress-container").style.display = "none"; // Hide progress bar too
    
    // Show the history box
    const historyBox = document.getElementById("history-box");
    historyBox.classList.remove("hidden");
    historyBox.style.display = "block"; // Force display
    
    const list = document.getElementById("history-list");
    const history = JSON.parse(localStorage.getItem('healthHistory')) || [];
    
    if (history.length === 0) {
        list.innerHTML = "<li>No history found yet.</li>";
    } else {
        list.innerHTML = history.map(item => `
            <li class="history-item">
                <span class="history-status">${item.status}</span>
                <small>${item.date}</small>
            </li>
        `).join('');
    }
}

function clearHistory() {
    if(confirm("Delete all history?")) {
        localStorage.removeItem('healthHistory');
        location.reload();
    }
        } 

updateUI(); // Initialize first question
