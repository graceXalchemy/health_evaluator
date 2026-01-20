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
    { id: "weakness", text: "Are you experiencing weakness in moving or lifting?", section: "Physical" },
    { id: "pain", text: "Is there a sharp 'ice-pick' or 'throbbing' sensation?", section: "Physical" }, 
    { id: "aches", text: "Do you have general muscle aches?", section: "Physical" }, 
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
    let recommendation = "";
    // Rule: Weakness + any Neuro symptom is an automatic "Stop"
    if (answers.weakness && neuroScore >= 1) {
        status = "Immediate Rest";
        recommendation = "<strong>High Alert:</strong> Muscle weakness combined with neuro symptoms requires an immediate stop and rest.";
    } 
    // Your original Rule
    else if (neuroScore >= 2 || (answers.irritability && answers.jaw)) {
        status = "Break Needed";
        recommendation = "<strong>Mandatory Break:</strong> Stop all screen work for 60 minutes.";
    }
    // Rule: Soreness only
    else if (answers.soreness) {
        status = "Recovery Focus";
        recommendation = "<strong>Physical Note:</strong> Muscle soreness detected. Ensure you are hydrating and consider gentle stretching.";
    }
    else {
        status = "Clear";
        recommendation = "<strong>Clear:</strong> You are within safe limits.";
    }

    // Display and Save
    document.getElementById("recommendation-text").innerHTML = recommendation;
    saveToHistory(status);
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
