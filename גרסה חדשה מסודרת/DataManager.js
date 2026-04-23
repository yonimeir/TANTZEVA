/**
 * מודול ניהול נתונים
 * אחראי על טעינה ואימות של קבצי הנתונים
 */

class DataManager {
    constructor() {
        this.dataLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * טעינת כל קבצי הנתונים
     */
    async loadAllData() {
        if (this.dataLoaded) {
            return this.getAllData();
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._performDataLoad();
        return this.loadingPromise;
    }

    /**
     * ביצוע הטעינה בפועל
     */
    async _performDataLoad() {
        try {
            // בדיקה שהמשתנים הגלובליים קיימים
            if (typeof mishnahIndex === 'undefined') {
                throw new Error('לא נמצא משתנה mishnahIndex - יש לוודא שהקובץ mishnah_index.js נטען');
            }

            if (typeof masechetIdToDisplayName === 'undefined') {
                throw new Error('לא נמצא משתנה masechetIdToDisplayName - יש לוודא שהקובץ mishnah_mappings.js נטען');
            }

            if (typeof masechetIdToApiName === 'undefined') {
                throw new Error('לא נמצא משתנה masechetIdToApiName - יש לוודא שהקובץ mishnah_mappings.js נטען');
            }

            // אימות הנתונים
            this._validateMishnahIndex(mishnahIndex);
            this._validateMappings(masechetIdToDisplayName, masechetIdToApiName);

            this.dataLoaded = true;

            return {
                mishnahIndex: mishnahIndex,
                masechetIdToDisplayName: masechetIdToDisplayName,
                masechetIdToApiName: masechetIdToApiName,
                mishnah_structure: typeof mishnah_structure !== 'undefined' ? mishnah_structure : null
            };

        } catch (error) {
            console.error('שגיאה בטעינת הנתונים:', error);
            throw error;
        }
    }

    /**
     * אימות נתוני האינדקס
     */
    _validateMishnahIndex(index) {
        if (!Array.isArray(index)) {
            throw new Error('משתנה mishnahIndex אינו מערך');
        }

        if (index.length === 0) {
            throw new Error('משתנה mishnahIndex ריק');
        }

        // בדיקת דוגמה ראשונה
        const firstEntry = index[0];
        if (!Array.isArray(firstEntry) || firstEntry.length !== 4) {
            throw new Error('פורמט שגוי באינדקס המשניות - צפוי מערך של 4 איברים');
        }

        const [masechetId, perekNum, mishnahNum, firstLetter] = firstEntry;
        if (typeof masechetId !== 'number' || typeof perekNum !== 'number' || 
            typeof mishnahNum !== 'number' || typeof firstLetter !== 'string') {
            throw new Error('טיפוסי נתונים שגויים באינדקס המשניות');
        }

        console.log(`נטען אינדקס משניות עם ${index.length} רשומות`);
    }

    /**
     * אימות נתוני המיפויים
     */
    _validateMappings(displayNames, apiNames) {
        if (typeof displayNames !== 'object' || displayNames === null) {
            throw new Error('משתנה masechetIdToDisplayName אינו אובייקט תקין');
        }

        if (typeof apiNames !== 'object' || apiNames === null) {
            throw new Error('משתנה masechetIdToApiName אינו אובייקט תקין');
        }

        const displayCount = Object.keys(displayNames).length;
        const apiCount = Object.keys(apiNames).length;

        if (displayCount === 0) {
            throw new Error('אין שמות תצוגה למסכתות');
        }

        if (apiCount === 0) {
            throw new Error('אין שמות API למסכתות');
        }

        console.log(`נטענו מיפויי מסכתות: ${displayCount} שמות תצוגה, ${apiCount} שמות API`);
    }

    /**
     * קבלת כל הנתונים
     */
    getAllData() {
        if (!this.dataLoaded) {
            throw new Error('הנתונים לא נטענו עדיין');
        }

        return {
            mishnahIndex: mishnahIndex,
            masechetIdToDisplayName: masechetIdToDisplayName,
            masechetIdToApiName: masechetIdToApiName,
            mishnah_structure: typeof mishnah_structure !== 'undefined' ? mishnah_structure : null
        };
    }

    /**
     * בדיקה האם הנתונים נטענו
     */
    isDataLoaded() {
        return this.dataLoaded;
    }

    /**
     * קבלת סטטיסטיקות על הנתונים
     */
    getDataStats() {
        if (!this.dataLoaded) {
            return null;
        }

        const data = this.getAllData();
        
        return {
            mishnahCount: data.mishnahIndex ? data.mishnahIndex.length : 0,
            masechetDisplayCount: data.masechetIdToDisplayName ? Object.keys(data.masechetIdToDisplayName).length : 0,
            masechetApiCount: data.masechetIdToApiName ? Object.keys(data.masechetIdToApiName).length : 0,
            hasStructure: data.mishnah_structure !== null
        };
    }

    /**
     * איפוס הנתונים (לצורך בדיקות)
     */
    reset() {
        this.dataLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * בדיקת זמינות קבצי הנתונים
     */
    checkDataAvailability() {
        const availability = {
            mishnahIndex: typeof mishnahIndex !== 'undefined',
            masechetIdToDisplayName: typeof masechetIdToDisplayName !== 'undefined',
            masechetIdToApiName: typeof masechetIdToApiName !== 'undefined',
            mishnah_structure: typeof mishnah_structure !== 'undefined'
        };

        const missing = Object.keys(availability).filter(key => !availability[key]);
        
        return {
            allAvailable: missing.length === 0,
            availability: availability,
            missing: missing
        };
    }
}

// יצוא המודול
window.DataManager = DataManager; 