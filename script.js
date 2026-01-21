// 1. Data Structure with Shuffle Logic
const questionData = [
    {
        section: "Neurological",
        questions: [
            { id: "visual", text: "Are there 'stars,' blurriness, or light sensitivity?" },
            { id: "aphasia", text: "Am I struggling to find basic words or finish a sentence?" },
            { id: "sound", text: "Does the hum of the fridge or computer fan feel 'loud'?" },
            { id: "coord", text: "Did I stumble or drop something in the last hour?" }
        ]
    },
    {
        section: "Physical",
        questions: [
            { id: "jaw", text: "Are my teeth touching or clenched?" },
            { id: "edema", text: "Does my footwear or skin feel tighter than an hour ago?" },
            { id: "posture", text: "Is my chin reaching toward the screen?" },
            { id: "pain", text: "Is there a sharp or throbbing sensation present in my face or head?" },
            { id: "soreness", text: "Do I have muscle soreness or aching?" },
            { id: "weakness", text: "Do I experience weakness in moving or lifting?" }
        ]
    },
    {
        section: "Psychological",
        questions: [
            { id: "irritability", text: "Did a minor software lag or notification make me angry?" },
            { id: "dread", text: "Do I feel a 'pit' in my stomach about the next task?" },
            { id: "urgency", text: "Do I feel a 'false' sense of rushing when there is no deadline?" }
        ]
    }
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

let questions = [];
questionData.forEach(sec => {
    let sectionQuestions = [...sec.questions];
    shuffleArray(sectionQuestions); 
    sectionQuestions.forEach(q => {
        q.sectionTitle = sec.section; // This fixes the "undefined" error
        questions.push(q);
    });
});

let currentIdx = 0;
let answers = {};

// 2. Initialize App and Show Last Data
function updateUI() {
    const q = questions[currentIdx];
    
    // Fix: Using 'sectionTitle' which matches the property assigned above
    document.getElementById("section-title").innerText = q.sectionTitle;
    document.getElementById("question-text").innerText = q.text;
    
    const progress = (currentIdx / questions.length) * 100;
    document.getElementById("progress-bar").style.width = `${progress}%`;

    // Show Last Data if on first question
    if (currentIdx === 0) {
        displayLastCheckin();
    }
}

function displayLastCheckin() {
    const history = JSON.parse(localStorage.getItem('healthHistory')) || [];
    if (history.length > 0) {
        const last = history[0];
        // Ensure you have a div with id="last-checkin" in your HTML
        const lastDiv = document.getElementById("last-checkin");
        if (lastDiv) {
            lastDiv.innerHTML = `<small>Last check-in: ${last.status} (${last.date})</small>`;
        }
    }
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

// 3. Evaluation Logic with Direct Language
function evaluateHealth() {
    document.getElementById("quiz-box").classList.add("hidden");
    document.getElementById("progress-container").classList.add("hidden");
    const resultBox = document.getElementById("result-box");
    const recText = document.getElementById("recommendation-text");
    resultBox.classList.remove("hidden");

    const neuroIds = ["visual", "aphasia", "sound", "coord"];
    const neuroScore = neuroIds.reduce((count, id) => count + (answers[id] ? 1 : 0), 0);

    let status = "";
    let message = "";

    if (answers.weakness && neuroScore >= 1) {
        status = "Stop Now";
        message = "<strong>You must stop.</strong> You have muscle weakness and brain warning signs. Sit or lie down in a quiet place.";
    } else if (neuroScore >= 2 || (answers.irritability && answers.jaw)) {
        status = "60 Minute Break";
        message = "<strong>Take a break.</strong> Stop all screen work and turn off audio for 60 minutes. Your body needs to rest.";
    } else if (answers.soreness || answers.pain || answers.posture || answers.edema) {
        status = "Physical Adjustment";
        message = "<strong>Check your body.</strong> Stretch, drink water, and fix your posture before you keep working.";
    } else {
        status = "Ready to Work";
        message = "<strong>You can keep working.</strong> You do not have signs of over-taxing right now. Check again in 3 hours.";
    }

    recText.innerHTML = message;
    saveToHistory(status, neuroScore);
}

function saveToHistory(status) {
    const history = JSON.parse(localStorage.getItem('healthHistory')) || [];
    const newEntry = {
        date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: status
    };
    history.unshift(newEntry);
    localStorage.setItem('healthHistory', JSON.stringify(history.slice(0, 10)));
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

function saveToHistory(status, neuroScore) { // Add neuroScore parameter
    const history = JSON.parse(localStorage.getItem('healthHistory')) || [];
    const newEntry = {
        date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: status,
        score: neuroScore // Save the raw score here
    };
    history.unshift(newEntry); // Adds latest to the top
    localStorage.setItem('healthHistory', JSON.stringify(history.slice(0, 10)));
}

function showHistory() {
    // Hide everything else
    document.getElementById("quiz-box").classList.add("hidden");
    document.getElementById("result-box").classList.add("hidden");
    document.getElementById("progress-container").classList.add("hidden");
    
    // Show history
    document.getElementById("history-box").classList.remove("hidden");
    renderGraph();
    
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

// --- Theme Change Logic --- 
function changeTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('preferredTheme', themeName);

// On Page load check for saved theme
const savedTheme = localStorage.getItem('preferredTheme') || 'dark';
    changeTheme(savedTheme);
    document.getElementById('theme-select').value = savedTheme;

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

// --- Updated Graph with Days ---
function renderGraph() {
    const history = JSON.parse(localStorage.getItem('healthHistory')) || [];
    const graphBars = document.getElementById("graph-bars");
    const graphLabels = document.getElementById("graph-labels");
    // We reverse it so the oldest is on the left, newest on the right
    const trendData = [...history].reverse();

    // 1. Render the Bars
    graphBars.innerHTML = trendData.map(item => {
        // We calculate height based on 4 being the max score
        // 0 becomes 5px (from CSS), 1=25px, 2=50px, 3=75px, 4=100px
        const height = (item.score / 4) * 100;
        let color = "#2196F3"; // Default Blue
        if (item.score === 0) color = "#e0e0e0";
        if (item.score >= 2) color = "#f44336"; // Danger Red
        return `<div class="bar" style="height: ${height}px; background-color: ${color};" data-score="${item.score}"></div>`;
    }).join('');

    graphLabels.innerHTML = trendData.map(item => {
        // Extracting Day and Date (e.g., "Mon, Jan 20")
        const dateObj = new Date(item.date);
        const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
        const datePart = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return `<div class="date-label"><strong>${dayName}</strong><br>${datePart}</div>`;
    }).join('');
}

// On Page Load: Check for saved theme
const savedTheme = localStorage.getItem('preferredTheme') || 'light';
changeTheme(savedTheme);
document.getElementById('theme-select').value = savedTheme; 

updateUI(); // Initialize first questione(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0); // Set to 9 AM tomorrow
    return tomorrow.getTime();
            }
