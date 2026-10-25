# Somna Sleep Story

Create a high-fidelity, interactive mobile web app called "Somna " — an AI-powered sleep tracker designed as a bridge between insomnia patients and their physicians.

### Visual Aesthetic & Theme:
- Deep night mode color palette: dark slate/indigo background (#0F0C20, #161233), card surfaces (#1F1A42), glowing amber accents (#F59E0B), and crisp white/lavender typography.
- Intro Animation: When the page loads, simulate two vertical elevator doors that smoothly slide open to reveal the app floor interface.
- Navigation: A sleek elevator floor panel (docked on the side for desktop, bottom bar for mobile) with glowing floor buttons: [5], [4], [3], [2], [1]. Show the current active floor clearly.

### 5 Interactive Floors:

1. Floor 1: "Sleep Chronology & Recovery"
   - Collect clinical sleep data:
     * Time Got into Bed & Time Actually Fell Asleep (Time pickers / sliders)
     * "Number of Middle-of-Night Awakenings" counter (+/- buttons)
     * Final Wake-up Time
     * Sliders for "Morning Energy Level" (1-10) and "Daytime Brain Fog / Fatigue" (None to Severe)
     * Checkbox: "Did you experience morning headaches or dry mouth?"
   - Pre-populate with realistic 7-day average metrics.

2. Floor 2: "Caffeine & Lifestyle Factors"
   - Habit trigger inputs:
     * Caffeine: Cups counter and a dropdown for "Cut-off Time of Last Cup"
     * Alcohol consumption toggle (Yes/No, and timing)
     * Pre-bed screen time slider (0 to 120+ minutes)
     * "Racing Mind / Bedtime Anxiety" slider (1 to 10)
     * Apnea risk indicator checkbox: "Loud snoring or waking up gasping"

3. Floor 3: "Diet & Habit Journal (Voice-First)"
   - A prominent microphone button labeled "Record Daily Habit Note" with a simulated pulsing audio wave animation when toggled.
   - A text area showing transcribed notes (e.g., "Had a double espresso at 2 PM, pasta with chicken at 7:30 PM, took 5mg melatonin at 10 PM").
   - Smart AI tag pills generated underneath: Automatically highlights and categorizes extracted items: [Food: Pasta & Chicken], [Caffeine: Double Espresso @ 2 PM], [Sleep Aid Detected: 5mg Melatonin].

4. Floor 4: "Care Summary (Doctor's Pass)"
   - Date range selector dropdown: [Today, Past 7 Days, Bi-Weekly (14 Days), Past Month (30 Days), Past 3 Months].
   - A clean, professional clinical intake summary card styled like an official medical report:
     * Section A: Sleep Chronology Averages (Average sleep latency: 48 mins, Average awakenings: 2.4/night)
     * Section B: Key Identified Lifestyle Correlations (e.g., "Screen time > 60m correlates with +35m to fall asleep")
     * Section C: Daytime Functioning & Sleep Aid History
     * Section D: Apnea Screening Note for Physician
   - A prominent amber button: "Export PDF / Print for Physician" that triggers window.print().

5. Floor 5: "Midnight Companion"
   - A dark, comforting chat interface for people awake during the night.
   - Prominent disclaimer badge: "Compassionate AI companion — Non-medical support only."
   - 3 Quick-start buttons: "My mind is racing", "Play a calming trivia quiz", "Tell me a sleepy story".
   - Functional chat box where users can type a message and receive an instant, calming, supportive simulated AI response.

Make the app responsive, fully interactive, and pre-load realistic sample entries so all graphs, metrics, and cards look populated and functional immediately.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://somna-sleep-story.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/567f07d6-828b-4715-aa84-658717f26362).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
