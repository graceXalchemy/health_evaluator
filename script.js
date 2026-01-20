// Add this to the top of your script.js
const lastData = JSON.parse(localStorage.getItem('lastCheckup'));

if (lastData) {
    console.log(`Your last status was: ${lastData.status} on ${lastData.date}`);
};

const questionData = [
    {
        section: "Section A: Neurological",
        questions: [
            { id: "visual", text: "Are there 'stars,' blurriness, or light sensitivity?" },
            { id: "aphasia", text: "Am I struggling to find basic words or finish a sentence?" },
            { id: "sound", text: "Does the hum of the fridge or computer fan feel 'loud'?" },
            { id: "coord", text: "Did I stumble or drop something in the last hour?" }
        ]
    },
    {
        section: "Section B: Physical",
        questions: [
            { id: "jaw", text: "Are my teeth touching or clenched?" },
            { id: "edema", text: "Does my footwear or skin feel tighter than an hour ago?" },
            { id: "posture", text: "Is my chin reaching toward the screen?" },
            { id: "pain", text: "Is there a sharp or throbbing sensation present?" },
            { id: "soreness", text: "Do I have muscle soreness or aching?" },
            { id: "weakness", text: "Do I have weakness in moving and lifting?" }
        ]
    },
    {
        section: "Section C: Psychological",
        questions: [
            { id: "irritability", text: "Did a minor software lag or notification make me angry?" },
            { id: "dread", text: "Do I feel a 'pit' in my stomach about the next task?" },
            { id: "urgency", text: "Do I feel a 'false' sense of rushing when there is no deadline?" }
        ]
    }
];

// Shuffle function to prevent "zoning out"
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Flatten the questions into one list for the app to cycle through
let questions = [];
questionData.forEach(sec => {
    let sectionQuestions = [...sec.questions];
    shuffleArray(sectionQuestions); // Shuffle within the section
    sectionQuestions.forEach(q => {
        q.sectionTitle = sec.section;
        questions.push(q);
    });
});

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
    // 1. Hide the quiz and progress bar, show the result box
    document.getElementById("quiz-box").classList.add("hidden");
    document.getElementById("progress-container").classList.add("hidden");
    const resultBox = document.getElementById("result-box");
    const recText = document.getElementById("recommendation-text");
    resultBox.classList.remove("hidden");

    // 2. Calculate scores for specific categories
    const neuroIds = ["visual", "aphasia", "sound", "coord"];
    const neuroScore = neuroIds.reduce((count, id) => count + (answers[id] ? 1 : 0), 0);

    // 3. Define the status and recommendation based on your rules
    let status = "";
    let message = "";

    // RULE 1: High Alert (Weakness + any Neuro symptom)
    if (answers.weakness && neuroScore >= 1) {
        status = "Critical Rest";
        message = "<strong>Immediate Stop:</strong> Muscle weakness paired with neurological 'warning lights' indicates high central nervous system fatigue. Stop all activity.";
    } 
    // RULE 2: Your Original Rule (2 Neuro OR Irritability + Jaw)
    else if (neuroScore >= 2 || (answers.irritability && answers.jaw)) {
        status = "Break Needed";
        message = "<strong>Mandatory Break:</strong> Your current metrics exceed safe limits. Stop all screen and audio work for 60 minutes.";
    } 
    // RULE 3: Physical Load (Soreness, Posture, or Pain)
    else if (answers.soreness || answers.pain || answers.posture) {
        status = "Caution";
        message = "<strong>Recovery Focus:</strong> Physical strain detected. Perform gentle stretching, hydrate, and check your posture before continuing.";
    } 
    // RULE 4: All Clear
    else {
        status = "Clear";
        message = "<strong>Systems Nominal:</strong> You are within safe operating limits. Continue monitoring every 3 hours.";
    }

    // 4. Update the UI
    recText.innerHTML = message;

    // 5. Save this result to the history list
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

// --- Notification Logic ---

function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            alert("Notifications enabled! We will check in with you daily.");
            scheduleNextReminder();
        }
    });
}

function scheduleNextReminder() {
    // Check every minute if it's time for a reminder
    setInterval(checkReminderLogic, 60000);
}

function checkReminderLogic() {
    const now = new Date();
    const reminderData = JSON.parse(localStorage.getItem('reminderData')) || {
        lastShownDate: null,
        nextScheduledTime: new Date().getTime(),
        snoozeCount: 0
    };

    // If it's time to show the notification
    if (now.getTime() >= reminderData.nextScheduledTime) {
        const todayStr = now.toDateString();
        
        // Don't show if we already finished today's cycle
        if (reminderData.lastShownDate === todayStr && reminderData.snoozeCount === 0) return;

        showReminderNotification(reminderData);
    }
}

function showReminderNotification(data) {
    const notification = new Notification("Health Check-in", {
        body: data.snoozeCount < 2 
            ? "Time for your health evaluation. Tap to start or snooze for 3 hours." 
            : "Final reminder for today. Tap to start.",
        requireInteraction: true
    });

    notification.onclick = () => {
        window.focus();
        // Reset for tomorrow once the user opens the app
        data.lastShownDate = new Date().toDateString();
        data.snoozeCount = 0;
        data.nextScheduledTime = calculateNextDay();
        localStorage.setItem('reminderData', JSON.stringify(data));
    };

    // Add a way to snooze (Postpone)
    if (data.snoozeCount < 2) {
        // In a real app, we'd use 'actions', but for web compatibility, 
        // we will handle the snooze if they DON'T click the notification within 5 mins
        setTimeout(() => {
            postponeReminder(data);
        }, 300000); 
    } else {
        // If 2nd postponement is missed, roll to next day
        data.lastShownDate = new Date().toDateString();
        data.snoozeCount = 0;
        data.nextScheduledTime = calculateNextDay();
        localStorage.setItem('reminderData', JSON.stringify(data));
    }
}

function postponeReminder(data) {
    data.snoozeCount++;
    // Add 3 hours (3 * 60 * 60 * 1000 milliseconds)
    data.nextScheduledTime = new Date().getTime() + (3 * 60 * 60 * 1000);
    localStorage.setItem('reminderData', JSON.stringify(data));
}

function calculateNextDay() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0); // Set to 9 AM tomorrow
    return tomorrow.getTime();
            }

updateUI(); // Initialize first question
