# Task Manager Web App

A lightweight, offline-ready to-do app with due dates and a calendar view, built with vanilla HTML, CSS, and JavaScript.

## Features

- ✅ Add tasks with required title and due date; include optional notes
- ✅ Month calendar highlights days with tasks; click a date to filter tasks for that day and clear the filter anytime
- ✅ Task list shows due dates, supports complete/incomplete toggle, delete, and clear completed
- ✅ Games section with Pong (two-player) and Snake (single-player) plus scoring and reset controls
- ✅ Persistent storage in browser `localStorage` (including due dates and notes)
- ✅ Responsive layout for desktop and mobile

## How to Run Locally

1. Option 1: Double-click `index.html` (or open it in your browser) — everything runs locally with no backend.
2. Option 2: Serve the folder with a simple local server, e.g.:
   ```bash
   python3 -m http.server 8000
   ```
   then visit `http://localhost:8000`.

## Using the App

1. Enter a task title and choose a due date (both required); add notes if you like.
2. Click **Add Task** (or press Enter while focused on a field).
3. Use the calendar to spot dates with tasks. Click a date to filter the list to that day, and use **Clear date filter** to show everything again.
4. Toggle completion with the checkbox, delete individual tasks, or use **Clear Completed** to remove all finished tasks.
5. Switch to the **Games** view to play Pong (W/S and arrow keys) or Snake (arrow keys). Use the reset/start buttons to restart rounds and return to the Tasks view anytime via the toggle at the top.

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `script.js` - Application logic and interactivity
- `README.md` - Project overview and instructions
