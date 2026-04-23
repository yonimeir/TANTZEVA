/**
 * מודול ליבה למערכת המשניות
 * מכיל את הלוגיקה המרכזית לשליפת משניות לפי אות
 */

class MishnahCore {
    constructor() {
        this.mishnahIndex = null;
        this.masechetIdToDisplayName = null;
        this.masechetIdToApiName = null;
        this.mishnah_structure = null;
    }

    /**
     * אתחול המודול עם נתוני המשניות
     */
    initialize(mishnahIndex, masechetIdToDisplayName, masechetIdToApiName, mishnah_structure) {
        this.mishnahIndex = mishnahIndex;
        this.masechetIdToDisplayName = masechetIdToDisplayName;
        this.masechetIdToApiName = masechetIdToApiName;
        this.mishnah_structure = mishnah_structure;
    }

    /**
     * פונקציה לעיבוד שם נפטר לאותיות ייחודיות
     */
    getUniqueLettersFromNameOrdered(name) {
        const finalToRegularMap = {'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ'};
        const hebrewLettersRegex = /[א-ת]/g;
        const nameLettersRaw = name.match(hebrewLettersRegex) || [];
        
        const uniqueLettersSet = new Set();

        // מעבר על אותיות השם
        for (let letter of nameLettersRaw) {
            // המרה של אותיות סופיות לרגילות
            const regularLetter = finalToRegularMap[letter] || letter;
            uniqueLettersSet.add(regularLetter);
        }

        // המרה ל-array ושמירה על סדר הופעה ראשונה
        const uniqueLetters = [];
        for (let letter of nameLettersRaw) {
            const regularLetter = finalToRegularMap[letter] || letter;
            if (!uniqueLetters.includes(regularLetter)) {
                uniqueLetters.push(regularLetter);
            }
        }

        return uniqueLetters;
    }

    /**
     * הלוגיקה המרכזית - שליפת משניות לפי אות
     */
    findMishnayotByLetter(targetLetter) {
        if (!this.mishnahIndex) {
            throw new Error('המודול לא אותחל - חסרים נתוני האינדקס');
        }

        const candidates = [];
        
        // מעבר על כל האינדקס
        for (const entry of this.mishnahIndex) {
            if (Array.isArray(entry) && entry.length === 4) {
                const [masechetId, perekNum, mishnahNum, firstLetter] = entry;
                
                // בדיקה אם האות תואמת
                if (firstLetter === targetLetter) {
                    candidates.push({
                        masechetId: masechetId,
                        perekNum: perekNum,
                        mishnahNum: mishnahNum,
                        firstLetter: firstLetter,
                        displayName: this.masechetIdToDisplayName[masechetId] || `מסכת ${masechetId}`,
                        apiName: this.masechetIdToApiName[masechetId] || null
                    });
                }
            }
        }

        return candidates;
    }

    /**
     * בחירה אקראית ממערך משניות
     */
    selectRandomMishnah(candidates) {
        if (!candidates || candidates.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * candidates.length);
        return candidates[randomIndex];
    }

    /**
     * המרת מספר לאות עברית
     */
    numberToHebrewLetter(num) {
        const hebrewLetters = [
            'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
            'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
            'ש', 'ת'
        ];
        
        if (num >= 1 && num <= hebrewLetters.length) {
            return hebrewLetters[num - 1];
        }
        
        return num.toString(); // אם מחוץ לטווח, החזר מספר
    }

    /**
     * המרת אות עברית למספר
     */
    hebrewLetterToNumber(letter) {
        const hebrewLetters = [
            'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
            'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
            'ש', 'ת'
        ];
        
        const index = hebrewLetters.indexOf(letter);
        return index !== -1 ? index + 1 : null;
    }

    /**
     * פורמט משנה לתצוגה
     */
    formatMishnahForDisplay(mishnah) {
        if (!mishnah) return null;
        
        return {
            title: `${mishnah.displayName} פרק ${this.numberToHebrewLetter(mishnah.perekNum)} משנה ${this.numberToHebrewLetter(mishnah.mishnahNum)}`,
            masechet: mishnah.displayName,
            perek: mishnah.perekNum,
            mishnah: mishnah.mishnahNum,
            letter: mishnah.firstLetter,
            apiName: mishnah.apiName
        };
    }

    /**
     * בדיקת תקינות נתונים
     */
    validateData() {
        if (!this.mishnahIndex || !Array.isArray(this.mishnahIndex)) {
            return { valid: false, error: 'חסר אינדקס משניות' };
        }
        
        if (!this.masechetIdToDisplayName || typeof this.masechetIdToDisplayName !== 'object') {
            return { valid: false, error: 'חסרים שמות מסכתות לתצוגה' };
        }
        
        if (!this.masechetIdToApiName || typeof this.masechetIdToApiName !== 'object') {
            return { valid: false, error: 'חסרים שמות מסכתות ל-API' };
        }
        
        return { valid: true };
    }

    /**
     * קבלת סטטיסטיקות על האינדקס
     */
    getIndexStats() {
        if (!this.mishnahIndex) {
            return null;
        }

        const stats = {
            totalMishnayot: this.mishnahIndex.length,
            letterCounts: {},
            masechetCounts: {}
        };

        // ספירת משניות לפי אות
        for (const entry of this.mishnahIndex) {
            if (Array.isArray(entry) && entry.length === 4) {
                const [masechetId, perekNum, mishnahNum, firstLetter] = entry;
                
                // ספירה לפי אות
                stats.letterCounts[firstLetter] = (stats.letterCounts[firstLetter] || 0) + 1;
                
                // ספירה לפי מסכת
                stats.masechetCounts[masechetId] = (stats.masechetCounts[masechetId] || 0) + 1;
            }
        }

        return stats;
    }
}

// יצוא המודול
window.MishnahCore = MishnahCore; 