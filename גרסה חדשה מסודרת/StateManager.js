/**
 * מודול ניהול מצב
 * אחראי על ניהול המשניות הנבחרות ושמירה ב-localStorage
 */

class StateManager {
    constructor() {
        this.storageKey = 'mishnayot_app_state';
        this.state = {
            selectedMishnayot: [],
            niftarName: '',
            lastUpdated: null
        };
        this.loadFromStorage();
    }

    /**
     * הוספת משנה לרשימה
     */
    addMishnah(mishnah) {
        if (!mishnah) {
            throw new Error('לא ניתן להוסיף משנה ריקה');
        }

        // בדיקה שהמשנה לא קיימת כבר
        const exists = this.state.selectedMishnayot.some(m => 
            m.masechetId === mishnah.masechetId && 
            m.perekNum === mishnah.perekNum && 
            m.mishnahNum === mishnah.mishnahNum
        );

        if (exists) {
            console.warn('המשנה כבר קיימת ברשימה');
            return false;
        }

        // הוספת timestamp
        const mishnahWithTimestamp = {
            ...mishnah,
            addedAt: new Date().toISOString()
        };

        this.state.selectedMishnayot.push(mishnahWithTimestamp);
        this.state.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        
        return true;
    }

    /**
     * הסרת משנה מהרשימה
     */
    removeMishnah(index) {
        if (index < 0 || index >= this.state.selectedMishnayot.length) {
            throw new Error('אינדקס לא תקין');
        }

        this.state.selectedMishnayot.splice(index, 1);
        this.state.lastUpdated = new Date().toISOString();
        this.saveToStorage();
    }

    /**
     * ניקוי כל המשניות
     */
    clearAllMishnayot() {
        this.state.selectedMishnayot = [];
        this.state.lastUpdated = new Date().toISOString();
        this.saveToStorage();
    }

    /**
     * קבלת כל המשניות
     */
    getAllMishnayot() {
        return [...this.state.selectedMishnayot];
    }

    /**
     * קבלת מספר המשניות
     */
    getMishnayotCount() {
        return this.state.selectedMishnayot.length;
    }

    /**
     * עדכון שם הנפטר
     */
    setNiftarName(name) {
        this.state.niftarName = name || '';
        this.state.lastUpdated = new Date().toISOString();
        this.saveToStorage();
    }

    /**
     * קבלת שם הנפטר
     */
    getNiftarName() {
        return this.state.niftarName;
    }

    /**
     * שמירה ב-localStorage
     */
    saveToStorage() {
        try {
            const dataToSave = {
                ...this.state,
                version: '2.0' // גרסה חדשה
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('שגיאה בשמירה ל-localStorage:', error);
        }
    }

    /**
     * טעינה מ-localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsedData = JSON.parse(saved);
                
                // בדיקת תאימות גרסה
                if (parsedData.version === '2.0') {
                    this.state = {
                        selectedMishnayot: parsedData.selectedMishnayot || [],
                        niftarName: parsedData.niftarName || '',
                        lastUpdated: parsedData.lastUpdated || null
                    };
                } else {
                    // מיגרציה מגרסה ישנה
                    this.migrateFromOldVersion(parsedData);
                }
            }
        } catch (error) {
            console.error('שגיאה בטעינה מ-localStorage:', error);
            this.state = {
                selectedMishnayot: [],
                niftarName: '',
                lastUpdated: null
            };
        }
    }

    /**
     * מיגרציה מגרסה ישנה
     */
    migrateFromOldVersion(oldData) {
        console.log('מבצע מיגרציה מגרסה ישנה');
        
        this.state = {
            selectedMishnayot: oldData.selectedMishnayot || [],
            niftarName: oldData.niftarName || '',
            lastUpdated: new Date().toISOString()
        };
        
        // שמירה בפורמט החדש
        this.saveToStorage();
    }

    /**
     * יצוא הנתונים
     */
    exportData() {
        return {
            ...this.state,
            exportedAt: new Date().toISOString(),
            version: '2.0'
        };
    }

    /**
     * יבוא נתונים
     */
    importData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('נתונים לא תקינים ליבוא');
        }

        this.state = {
            selectedMishnayot: data.selectedMishnayot || [],
            niftarName: data.niftarName || '',
            lastUpdated: new Date().toISOString()
        };

        this.saveToStorage();
    }

    /**
     * קבלת סטטיסטיקות
     */
    getStats() {
        const mishnayot = this.state.selectedMishnayot;
        
        if (mishnayot.length === 0) {
            return {
                totalMishnayot: 0,
                masechetCounts: {},
                letterCounts: {},
                oldestEntry: null,
                newestEntry: null
            };
        }

        const stats = {
            totalMishnayot: mishnayot.length,
            masechetCounts: {},
            letterCounts: {},
            oldestEntry: null,
            newestEntry: null
        };

        // ספירה לפי מסכת ואות
        mishnayot.forEach(mishnah => {
            // ספירה לפי מסכת
            const masechet = mishnah.displayName || `מסכת ${mishnah.masechetId}`;
            stats.masechetCounts[masechet] = (stats.masechetCounts[masechet] || 0) + 1;
            
            // ספירה לפי אות
            if (mishnah.firstLetter) {
                stats.letterCounts[mishnah.firstLetter] = (stats.letterCounts[mishnah.firstLetter] || 0) + 1;
            }
        });

        // מציאת הכניסות הישנה והחדשה ביותר
        const withTimestamps = mishnayot.filter(m => m.addedAt);
        if (withTimestamps.length > 0) {
            const sorted = withTimestamps.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
            stats.oldestEntry = sorted[0].addedAt;
            stats.newestEntry = sorted[sorted.length - 1].addedAt;
        }

        return stats;
    }

    /**
     * בדיקה האם יש נתונים שמורים
     */
    hasStoredData() {
        return this.state.selectedMishnayot.length > 0 || this.state.niftarName.length > 0;
    }

    /**
     * איפוס מלא
     */
    reset() {
        this.state = {
            selectedMishnayot: [],
            niftarName: '',
            lastUpdated: null
        };
        this.saveToStorage();
    }

    /**
     * קבלת מידע על עדכון אחרון
     */
    getLastUpdateInfo() {
        return {
            lastUpdated: this.state.lastUpdated,
            hasData: this.hasStoredData(),
            mishnayotCount: this.state.selectedMishnayot.length
        };
    }
}

// יצוא המודול
window.StateManager = StateManager; 