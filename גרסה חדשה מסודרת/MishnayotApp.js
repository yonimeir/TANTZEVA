/**
 * אפליקציית המשניות הראשית
 * מחברת את כל המודולים ומנהלת את הלוגיקה הכללית
 */

class MishnayotApp {
    constructor() {
        this.core = new MishnahCore();
        this.dataManager = new DataManager();
        this.stateManager = new StateManager();
        this.uiManager = new UIManager();
        
        this.currentCandidates = [];
        this.currentLetter = null;
        this.initialized = false;
    }

    /**
     * אתחול האפליקציה
     */
    async initialize() {
        try {
            this.uiManager.showLoading('טוען נתוני משניות...');
            
            // טעינת הנתונים
            const data = await this.dataManager.loadAllData();
            
            // אתחול המודול הליבה
            this.core.initialize(
                data.mishnahIndex,
                data.masechetIdToDisplayName,
                data.masechetIdToApiName,
                data.mishnah_structure
            );

            // בדיקת תקינות הנתונים
            const validation = this.core.validateData();
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // אתחול מאזיני אירועים
            this.uiManager.initializeEventListeners();

            // עדכון הממשק עם הנתונים השמורים
            this.updateUI();

            this.initialized = true;
            this.uiManager.hideLoading();
            this.uiManager.showSuccess('האפליקציה נטענה בהצלחה!');

            console.log('אפליקציית המשניות אותחלה בהצלחה');
            
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(`שגיאה באתחול האפליקציה: ${error.message}`);
            console.error('שגיאה באתחול:', error);
        }
    }

    /**
     * עדכון שם הנפטר
     */
    updateNiftarName(name) {
        this.stateManager.setNiftarName(name);
        this.updateUI();
    }

    /**
     * עיבוד שם הנפטר והצגת האותיות
     */
    processNiftarName() {
        const name = this.stateManager.getNiftarName();
        if (!name || !name.trim()) {
            this.uiManager.showError('אנא הכנס שם נפטר');
            return;
        }

        try {
            const letters = this.core.getUniqueLettersFromNameOrdered(name);
            this.uiManager.updateLettersDisplay(letters);
            this.uiManager.showSuccess(`נמצאו ${letters.length} אותיות ייחודיות בשם`);
        } catch (error) {
            this.uiManager.showError(`שגיאה בעיבוד השם: ${error.message}`);
        }
    }

    /**
     * חיפוש משניות לפי אות
     */
    searchByLetter(letter) {
        if (!this.initialized) {
            this.uiManager.showError('האפליקציה עדיין לא אותחלה');
            return;
        }

        try {
            this.uiManager.showLoading(`מחפש משניות לאות "${letter}"...`);
            
            const candidates = this.core.findMishnayotByLetter(letter);
            this.currentCandidates = candidates;
            this.currentLetter = letter;

            this.uiManager.hideLoading();

            if (candidates.length === 0) {
                this.uiManager.showError(`לא נמצאו משניות המתחילות באות "${letter}"`);
                return;
            }

            // הצגת דיאלוג בחירה
            this.uiManager.showMishnahSelectionDialog(candidates, letter);

        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(`שגיאה בחיפוש: ${error.message}`);
        }
    }

    /**
     * בחירת משנה ספציפית
     */
    selectMishnah(index, letter) {
        if (!this.currentCandidates || index < 0 || index >= this.currentCandidates.length) {
            this.uiManager.showError('בחירה לא תקינה');
            return;
        }

        const selectedMishnah = this.currentCandidates[index];
        this.addMishnahToList(selectedMishnah);
        this.uiManager.hideDialog();
    }

    /**
     * בחירה אקראית של משנה
     */
    selectRandomMishnah(letter) {
        if (!this.currentCandidates || this.currentCandidates.length === 0) {
            this.uiManager.showError('אין משניות זמינות לבחירה אקראית');
            return;
        }

        const randomMishnah = this.core.selectRandomMishnah(this.currentCandidates);
        this.addMishnahToList(randomMishnah);
        this.uiManager.hideDialog();
    }

    /**
     * הוספת משנה לרשימה
     */
    addMishnahToList(mishnah) {
        try {
            const added = this.stateManager.addMishnah(mishnah);
            if (added) {
                this.updateUI();
                this.uiManager.showSuccess(`נוספה משנה: ${this.core.formatMishnahForDisplay(mishnah).title}`);
            } else {
                this.uiManager.showInfo('המשנה כבר קיימת ברשימה');
            }
        } catch (error) {
            this.uiManager.showError(`שגיאה בהוספת המשנה: ${error.message}`);
        }
    }

    /**
     * הסרת משנה מהרשימה
     */
    removeMishnah(index) {
        try {
            const mishnayot = this.stateManager.getAllMishnayot();
            if (index >= 0 && index < mishnayot.length) {
                const mishnah = mishnayot[index];
                const formatted = this.core.formatMishnahForDisplay(mishnah);
                
                this.stateManager.removeMishnah(index);
                this.updateUI();
                this.uiManager.showSuccess(`הוסרה משנה: ${formatted.title}`);
            }
        } catch (error) {
            this.uiManager.showError(`שגיאה בהסרת המשנה: ${error.message}`);
        }
    }

    /**
     * ניקוי כל המשניות
     */
    clearAllMishnayot() {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל המשניות?')) {
            this.stateManager.clearAllMishnayot();
            this.updateUI();
            this.uiManager.showSuccess('כל המשניות נמחקו');
        }
    }

    /**
     * צפייה במשנה
     */
    async viewMishnah(index) {
        try {
            const mishnayot = this.stateManager.getAllMishnayot();
            if (index < 0 || index >= mishnayot.length) {
                this.uiManager.showError('משנה לא נמצאה');
                return;
            }

            const mishnah = mishnayot[index];
            this.uiManager.showMishnahInfo(mishnah);

            // ניסיון לטעון תוכן מספריא (אופציונלי)
            this.loadMishnahContent(mishnah);

        } catch (error) {
            this.uiManager.showError(`שגיאה בצפייה במשנה: ${error.message}`);
        }
    }

    /**
     * טעינת תוכן משנה מספריא
     */
    async loadMishnahContent(mishnah) {
        if (!mishnah.apiName) {
            return;
        }

        try {
            const url = `https://www.sefaria.org/api/texts/${mishnah.apiName}.${mishnah.perekNum}.${mishnah.mishnahNum}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                if (data.he && data.he.length > 0) {
                    // עדכון התוכן בדיאלוג הפתוח
                    const modalBody = document.querySelector('.modal-content .modal-body');
                    if (modalBody) {
                        modalBody.innerHTML = `<div class="mishnah-content">${data.he[0]}</div>`;
                    }
                }
            }
        } catch (error) {
            console.warn('לא ניתן לטעון תוכן מספריא:', error);
        }
    }

    /**
     * יצוא נתונים
     */
    exportData() {
        try {
            const data = this.stateManager.exportData();
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `mishnayot_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.uiManager.showSuccess('הנתונים יוצאו בהצלחה');
        } catch (error) {
            this.uiManager.showError(`שגיאה ביצוא הנתונים: ${error.message}`);
        }
    }

    /**
     * יבוא נתונים
     */
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.stateManager.importData(data);
                this.updateUI();
                this.uiManager.showSuccess('הנתונים יובאו בהצלחה');
            } catch (error) {
                this.uiManager.showError(`שגיאה ביבוא הנתונים: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }

    /**
     * עדכון כללי של הממשק
     */
    updateUI() {
        const state = {
            niftarName: this.stateManager.getNiftarName(),
            selectedMishnayot: this.stateManager.getAllMishnayot(),
            stats: this.stateManager.getStats()
        };

        this.uiManager.updateUI(state);

        // עדכון שדה הקלט
        const nameInput = document.getElementById('niftar-name');
        if (nameInput && nameInput.value !== state.niftarName) {
            nameInput.value = state.niftarName;
        }

        // עדכון האותיות אם יש שם
        if (state.niftarName) {
            try {
                const letters = this.core.getUniqueLettersFromNameOrdered(state.niftarName);
                this.uiManager.updateLettersDisplay(letters);
            } catch (error) {
                console.warn('שגיאה בעדכון האותיות:', error);
            }
        }
    }

    /**
     * קבלת מידע על מצב האפליקציה
     */
    getAppInfo() {
        return {
            initialized: this.initialized,
            dataStats: this.dataManager.getDataStats(),
            stateInfo: this.stateManager.getLastUpdateInfo(),
            coreStats: this.core.getIndexStats()
        };
    }

    /**
     * איפוס האפליקציה
     */
    reset() {
        if (confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים?')) {
            this.stateManager.reset();
            this.updateUI();
            this.uiManager.showSuccess('האפליקציה אופסה');
        }
    }
}

// יצירת מופע גלובלי של האפליקציה
window.app = new MishnayotApp();
window.uiManager = window.app.uiManager;

// אתחול האפליקציה כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    window.app.initialize();
}); 