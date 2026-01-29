class PomodoroTimer {
    constructor() {
        this.timerDisplay = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.presetSelect = document.getElementById('preset');
        this.statusIndicator = document.getElementById('status');
        
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.interval = null;
        this.currentMode = 'focus'; // 'focus' or 'break'
        
        // Parse initial preset
        this.updateSettingsFromPreset();
        this.resetTimer(); // Ensure consistent initial state
        
        this.addEventListeners();
    }
    
    addEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.presetSelect.addEventListener('change', () => {
            this.updateSettingsFromPreset();
            this.resetTimer();
        });
    }
    
    updateSettingsFromPreset() {
        const [focus, breakTime] = this.presetSelect.value.split('-').map(Number);
        this.focusTime = focus * 60;
        this.breakTime = breakTime * 60;
        
        // If we are reset, update the current time left immediately
        if (!this.isRunning && this.currentMode === 'focus') {
            this.timeLeft = this.focusTime;
        } else if (!this.isRunning && this.currentMode === 'break') {
            this.timeLeft = this.breakTime;
        }
        
        this.updateDisplay();
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.textContent = 'PAUSE';
        this.startBtn.style.background = '#E6B89C'; // Sand color for pause
        this.startBtn.style.color = '#2D2A2E';
        this.startBtn.style.boxShadow = '0 4px 0 #C49A80';
        
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    }
    
    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
        this.startBtn.textContent = 'RESUME';
        this.startBtn.style.background = ''; // Revert to CSS default
        this.startBtn.style.color = '';
        this.startBtn.style.boxShadow = '';
    }
    
    resetTimer() {
        this.pauseTimer();
        this.currentMode = 'focus';
        this.timeLeft = this.focusTime;
        this.updateDisplay();
        this.updateStatus();
        this.startBtn.textContent = 'START';
    }
    
    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
        } else {
            this.switchMode();
        }
    }
    
    switchMode() {
        // Play a notification sound here if desired
        
        if (this.currentMode === 'focus') {
            this.currentMode = 'break';
            this.timeLeft = this.breakTime;
            // Visual feedback for break
            document.documentElement.style.setProperty('--terracotta', '#7D9C8B'); // Sage for break
        } else {
            this.currentMode = 'focus';
            this.timeLeft = this.focusTime;
            // Visual feedback for focus
            document.documentElement.style.setProperty('--terracotta', '#D35D47'); // Original red
        }
        
        this.pauseTimer(); 
        this.startBtn.textContent = 'START ' + this.currentMode.toUpperCase();
        this.updateDisplay();
        this.updateStatus();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update tab title
        document.title = `${this.timerDisplay.textContent} - ${this.currentMode === 'focus' ? 'Focus' : 'Break'}`;
    }
    
    updateStatus() {
        this.statusIndicator.textContent = this.currentMode.toUpperCase();
        // Color is handled by the --terracotta variable change, but we can enforce it if needed.
        // Since --terracotta changes based on mode, we can just use that.
        this.statusIndicator.style.color = 'var(--terracotta)';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const pomodoro = new PomodoroTimer();
});