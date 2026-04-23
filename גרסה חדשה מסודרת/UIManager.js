/**
 * מודול ניהול ממשק משתמש
 * אחראי על עדכון התצוגה והודעות למשתמש
 */

class UIManager {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    /**
     * אתחול אלמנטי DOM
     */
    initializeElements() {
        this.elements = {
            niftarNameInput: document.getElementById('niftar-name'),
            niftarNameDisplay: document.getElementById('niftar-name-display'),
            lettersContainer: document.getElementById('letters-container'),
            selectedMishnayotList: document.getElementById('selected-mishnayot-list'),
            errorContainer: document.getElementById('error-container'),
            loadingIndicator: document.getElementById('loading-indicator'),
            statsContainer: document.getElementById('stats-container')
        };
    }

    /**
     * הצגת הודעת שגיאה
     */
    showError(message, type = 'error') {
        if (!this.elements.errorContainer) {
            console.error('Error container not found:', message);
            return;
        }

        this.elements.errorContainer.innerHTML = `
            <div class="alert alert-${type}">
                <strong>${type === 'error' ? 'שגיאה:' : 'הודעה:'}</strong> ${message}
                <button type="button" class="close-btn" onclick="uiManager.hideError()">×</button>
            </div>
        `;
        this.elements.errorContainer.style.display = 'block';

        // הסתרה אוטומטית אחרי 5 שניות
        setTimeout(() => this.hideError(), 5000);
    }

    /**
     * הסתרת הודעת שגיאה
     */
    hideError() {
        if (this.elements.errorContainer) {
            this.elements.errorContainer.style.display = 'none';
            this.elements.errorContainer.innerHTML = '';
        }
    }

    /**
     * הצגת אינדיקטור טעינה
     */
    showLoading(message = 'טוען...') {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <span>${message}</span>
                </div>
            `;
            this.elements.loadingIndicator.style.display = 'block';
        }
    }

    /**
     * הסתרת אינדיקטור טעינה
     */
    hideLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
            this.elements.loadingIndicator.innerHTML = '';
        }
    }

    /**
     * עדכון תצוגת שם הנפטר
     */
    updateNiftarNameDisplay(name) {
        if (this.elements.niftarNameDisplay) {
            if (name && name.trim()) {
                this.elements.niftarNameDisplay.textContent = `לעילוי נשמת: ${name}`;
                this.elements.niftarNameDisplay.style.display = 'block';
            } else {
                this.elements.niftarNameDisplay.style.display = 'none';
            }
        }
    }

    /**
     * עדכון תצוגת האותיות
     */
    updateLettersDisplay(letters) {
        if (!this.elements.lettersContainer) return;

        if (!letters || letters.length === 0) {
            this.elements.lettersContainer.innerHTML = '<p>הכנס שם נפטר כדי לראות את האותיות</p>';
            return;
        }

        const lettersHtml = letters.map(letter => `
            <button class="letter-btn" data-letter="${letter}" onclick="app.searchByLetter('${letter}')">
                ${letter}
            </button>
        `).join('');

        this.elements.lettersContainer.innerHTML = `
            <h3>אותיות השם:</h3>
            <div class="letters-grid">${lettersHtml}</div>
        `;
    }

    /**
     * עדכון רשימת המשניות הנבחרות
     */
    updateSelectedMishnayotDisplay(mishnayot) {
        if (!this.elements.selectedMishnayotList) return;

        if (!mishnayot || mishnayot.length === 0) {
            this.elements.selectedMishnayotList.innerHTML = '<p>עדיין לא נבחרו משניות</p>';
            return;
        }

        const mishnayotHtml = mishnayot.map((mishnah, index) => {
            const formatted = this.formatMishnahForDisplay(mishnah);
            return `
                <div class="mishnah-item">
                    <div class="mishnah-info">
                        <strong>${formatted.title}</strong>
                        <span class="letter-badge">אות: ${mishnah.firstLetter}</span>
                    </div>
                    <div class="mishnah-actions">
                        <button class="btn-secondary" onclick="app.viewMishnah(${index})">צפה</button>
                        <button class="btn-danger" onclick="app.removeMishnah(${index})">הסר</button>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.selectedMishnayotList.innerHTML = `
            <h3>משניות נבחרות (${mishnayot.length}):</h3>
            <div class="mishnayot-list">${mishnayotHtml}</div>
            <div class="list-actions">
                <button class="btn-danger" onclick="app.clearAllMishnayot()">נקה הכל</button>
                <button class="btn-secondary" onclick="app.exportData()">יצא נתונים</button>
            </div>
        `;
    }

    /**
     * פורמט משנה לתצוגה
     */
    formatMishnahForDisplay(mishnah) {
        const hebrewNumbers = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
        
        const perekHebrew = mishnah.perekNum <= hebrewNumbers.length ? 
            hebrewNumbers[mishnah.perekNum - 1] : mishnah.perekNum.toString();
        const mishnahHebrew = mishnah.mishnahNum <= hebrewNumbers.length ? 
            hebrewNumbers[mishnah.mishnahNum - 1] : mishnah.mishnahNum.toString();

        return {
            title: `${mishnah.displayName} פרק ${perekHebrew} משנה ${mishnahHebrew}`,
            masechet: mishnah.displayName,
            perek: perekHebrew,
            mishnah: mishnahHebrew
        };
    }

    /**
     * הצגת דיאלוג בחירת משנה
     */
    showMishnahSelectionDialog(candidates, letter) {
        if (!candidates || candidates.length === 0) {
            this.showError(`לא נמצאו משניות המתחילות באות "${letter}"`);
            return;
        }

        const candidatesHtml = candidates.map((candidate, index) => {
            const formatted = this.formatMishnahForDisplay(candidate);
            return `
                <div class="candidate-item">
                    <div class="candidate-info">
                        <strong>${formatted.title}</strong>
                    </div>
                    <button class="btn-primary" onclick="app.selectMishnah(${index}, '${letter}')">בחר</button>
                </div>
            `;
        }).join('');

        const dialogHtml = `
            <div class="modal-overlay" onclick="uiManager.hideDialog()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>בחר משנה לאות "${letter}"</h3>
                        <button class="close-btn" onclick="uiManager.hideDialog()">×</button>
                    </div>
                    <div class="modal-body">
                        <p>נמצאו ${candidates.length} משניות המתחילות באות "${letter}":</p>
                        <div class="candidates-list">${candidatesHtml}</div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-primary" onclick="app.selectRandomMishnah('${letter}')">בחר אקראי</button>
                        <button class="btn-secondary" onclick="uiManager.hideDialog()">ביטול</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHtml);
    }

    /**
     * הסתרת דיאלוג
     */
    hideDialog() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * עדכון סטטיסטיקות
     */
    updateStats(stats) {
        if (!this.elements.statsContainer || !stats) return;

        const statsHtml = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">${stats.totalMishnayot}</span>
                    <span class="stat-label">משניות נבחרות</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Object.keys(stats.masechetCounts).length}</span>
                    <span class="stat-label">מסכתות שונות</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Object.keys(stats.letterCounts).length}</span>
                    <span class="stat-label">אותיות שונות</span>
                </div>
            </div>
        `;

        this.elements.statsContainer.innerHTML = statsHtml;
    }

    /**
     * הצגת הודעת הצלחה
     */
    showSuccess(message) {
        this.showError(message, 'success');
    }

    /**
     * הצגת הודעת מידע
     */
    showInfo(message) {
        this.showError(message, 'info');
    }

    /**
     * עדכון כללי של הממשק
     */
    updateUI(state) {
        this.updateNiftarNameDisplay(state.niftarName);
        this.updateSelectedMishnayotDisplay(state.selectedMishnayot);
        
        if (state.stats) {
            this.updateStats(state.stats);
        }
    }

    /**
     * אתחול מאזיני אירועים
     */
    initializeEventListeners() {
        // מאזין לשדה שם הנפטר
        if (this.elements.niftarNameInput) {
            this.elements.niftarNameInput.addEventListener('input', (e) => {
                if (window.app && typeof window.app.updateNiftarName === 'function') {
                    window.app.updateNiftarName(e.target.value);
                }
            });
        }

        // מאזין למקש Enter בשדה שם הנפטר
        if (this.elements.niftarNameInput) {
            this.elements.niftarNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (window.app && typeof window.app.processNiftarName === 'function') {
                        window.app.processNiftarName();
                    }
                }
            });
        }
    }

    /**
     * הצגת מידע על משנה
     */
    showMishnahInfo(mishnah, content = null) {
        const formatted = this.formatMishnahForDisplay(mishnah);
        
        const dialogHtml = `
            <div class="modal-overlay" onclick="uiManager.hideDialog()">
                <div class="modal-content large" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${formatted.title}</h3>
                        <button class="close-btn" onclick="uiManager.hideDialog()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content ? `<div class="mishnah-content">${content}</div>` : '<p>טוען תוכן...</p>'}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="uiManager.hideDialog()">סגור</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHtml);
    }
}

// יצוא המודול
window.UIManager = UIManager; 