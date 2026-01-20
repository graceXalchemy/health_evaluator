Created through the Gemini (3) web interface

## Project Overview

This app is a **Health Evaluation Tool** designed to monitor central nervous system fatigue and physical strain. It uses a structured check-in every three hours to provide objective guidance on whether to continue working or take a break.

### Feature Map

* **Sequential Delivery:** Questions appear one at a time to reduce cognitive load.
* **Section Shuffling:** Randomizes question order within categories to prevent "autopilot" answering.
* **Direct Language:** Concrete, actionable instructions.
* **Rules Engine:** Uses a hierarchy of symptoms to prioritize neurological safety.
* **Persistent History:** Saves the last 10 entries to your device to track health trends.

--- 

### The Logical Flow of the Evaluation

The app categorizes your health into three distinct "levels" of concern. This hierarchy ensures that a serious brain or muscle issue takes priority over a simple posture check.

Level 1: Neuromuscular (Stop Now) – Addresses the risk of serious physical or neurological "crashes."

Level 2: Neurological & Stress (Take a Break) – Addresses over-stimulation and the beginning of a "fight or flight" response.

Level 3: Physical (Adjust) – Addresses ergonomics and minor strain to prevent them from becoming Level 1 or 2 issues later. 

---

### The Code

## 1. The HTML (`index.html`)

This file creates the structure. It includes placeholders for the questions, the progress bar, and the history list.

---

## 2. The CSS (`style.css`)

This handles the visual layout, ensuring it is easy to read on both desktop and Android devices.

---

## 3. The JavaScript (`script.js`)

This contains the questions, the shuffle logic, and the rules for your evaluation.
