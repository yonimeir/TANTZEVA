// שלד JS לדף לע"נ
// יצירת גרסה נקייה ללא כפילויות

document.addEventListener('DOMContentLoaded', function() {
    // אלמנטים מה-DOM
    const niftarNameInput = document.getElementById('niftar-name');
    const processNameButton = document.getElementById('process-name-button');
    const nameLettersDisplay = document.getElementById('name-letters-display');
    const processedNameElement = document.getElementById('processed-name');
    const letterBoxesContainer = document.getElementById('letter-boxes');
    const alphabetButtonsContainer = document.getElementById('alphabet-buttons');
    const randomSelectButton = document.getElementById('random-select-button');
    const addNeshamahButton = document.getElementById('add-neshamah-button');
    const clearSelectionsButton = document.getElementById('clear-selections-button');
    const preparePrintButton = document.getElementById('prepare-print-button');
    const mishnayotDisplay = document.getElementById('mishnah-display');
    const contentDisplayArea = document.querySelector('.mishnah-preview');
    const errorMessage = document.getElementById('error-message');
    const mishnayotModal = document.getElementById('mishnah-modal');
    const modalMishnayotList = document.getElementById('modal-mishnah-list');
    const modalLetter = document.getElementById('modal-letter');
    const closeModal = document.querySelector('.close-modal');
    const showBartenuraCheckbox = document.getElementById('show-bartenura-checkbox');
    const selectedMishnayotList = document.getElementById('selected-mishnayot-list');
    
    // אלמנטים לתצוגה מקדימה במודל
    const modalPreview = document.getElementById('modal-preview');
    const modalPreviewContent = document.getElementById('modal-preview-content');
    const modalPreviewTitle = document.getElementById('modal-preview-title');
    const modalPreviewText = document.getElementById('modal-preview-text');
    
    // מיפוי של מזהי מסכתות לשמות תצוגה בעברית
    const masechetIdToDisplayName = {
        "1": "מסכת ברכות",
        "2": "מסכת פאה",
        "3": "מסכת דמאי",
        "4": "מסכת כלאים",
        "5": "מסכת שביעית",
        "6": "מסכת תרומות",
        "7": "מסכת מעשרות",
        "8": "מסכת מעשר שני",
        "9": "מסכת חלה",
        "10": "מסכת ערלה",
        "11": "מסכת ביכורים",
        "12": "מסכת שבת",
        "13": "מסכת עירובין",
        "14": "מסכת פסחים",
        "15": "מסכת שקלים",
        "16": "מסכת יומא",
        "17": "מסכת סוכה",
        "18": "מסכת ביצה",
        "19": "מסכת ראש השנה",
        "20": "מסכת תענית",
        "21": "מסכת מגילה",
        "22": "מסכת מועד קטן",
        "23": "מסכת חגיגה",
        "24": "מסכת יבמות",
        "25": "מסכת כתובות",
        "26": "מסכת נדרים",
        "27": "מסכת נזיר",
        "28": "מסכת סוטה",
        "29": "מסכת גיטין",
        "30": "מסכת קידושין",
        "31": "מסכת בבא קמא",
        "32": "מסכת בבא מציעא",
        "33": "מסכת בבא בתרא",
        "34": "מסכת סנהדרין",
        "35": "מסכת מכות",
        "36": "מסכת שבועות",
        "37": "מסכת עדיות",
        "38": "מסכת עבודה זרה",
        "39": "מסכת אבות",
        "40": "מסכת הוריות",
        "41": "מסכת זבחים",
        "42": "מסכת מנחות",
        "43": "מסכת חולין",
        "44": "מסכת בכורות",
        "45": "מסכת ערכין",
        "46": "מסכת תמורה",
        "47": "מסכת כריתות",
        "48": "מסכת מעילה",
        "49": "מסכת תמיד",
        "50": "מסכת מידות",
        "51": "מסכת קינים",
        "52": "מסכת כלים",
        "53": "מסכת אהלות",
        "54": "מסכת נגעים",
        "55": "מסכת פרה",
        "56": "מסכת טהרות",
        "57": "מסכת מקוואות",
        "58": "מסכת נידה",
        "59": "מסכת מכשירין",
        "60": "מסכת זבים",
        "61": "מסכת טבול יום",
        "62": "מסכת ידיים",
        "63": "מסכת עוקצין"
    };

    // מיפוי של מזהי מסכתות לשמות המסכתות בפורמט של API ספריא
    const masechetIdToApiName = {
        "1": "Berakhot",  // ברכות
        "2": "Peah",  // פאה
        "3": "Demai",  // דמאי
        "4": "Kilayim",  // כלאים
        "5": "Sheviit",  // שביעית
        "6": "Terumot",  // תרומות
        "7": "Maasrot",  // מעשרות
        "8": "Maaser_Sheni",  // מעשר שני
        "9": "Challah",  // חלה
        "10": "Orlah",  // ערלה
        "11": "Bikkurim",  // ביכורים
        "12": "Shabbat",  // שבת
        "13": "Eruvin",  // עירובין
        "14": "Pesachim",  // פסחים
        "15": "Shekalim",  // שקלים
        "16": "Yoma",  // יומא
        "17": "Sukkah",  // סוכה
        "18": "Beitzah",  // ביצה
        "19": "Rosh_Hashanah",  // ראש השנה
        "20": "Taanit",  // תענית
        "21": "Megillah",  // מגילה
        "22": "Moed_Katan",  // מועד קטן
        "23": "Chagigah",  // חגיגה
        "24": "Yevamot",  // יבמות
        "25": "Ketubot",  // כתובות
        "26": "Nedarim",  // נדרים
        "27": "Nazir",  // נזיר
        "28": "Sotah",  // סוטה
        "29": "Gittin",  // גיטין
        "30": "Kiddushin",  // קידושין
        "31": "Bava_Kamma",  // בבא קמא
        "32": "Bava_Metzia",  // בבא מציעא
        "33": "Bava_Batra",  // בבא בתרא
        "34": "Sanhedrin",  // סנהדרין
        "35": "Makkot",  // מכות
        "36": "Shevuot",  // שבועות
        "37": "Eduyot",  // עדויות
        "38": "Avodah_Zarah",  // עבודה זרה
        "39": "Pirkei_Avot",  // אבות
        "40": "Horayot",  // הוריות
        "41": "Zevachim",  // זבחים
        "42": "Menachot",  // מנחות
        "43": "Chullin",  // חולין
        "44": "Bekhorot",  // בכורות
        "45": "Arakhin",  // ערכין
        "46": "Temurah",  // תמורה
        "47": "Keritot",  // כריתות
        "48": "Meilah",  // מעילה
        "49": "Tamid",  // תמיד
        "50": "Middot",  // מידות
        "51": "Kinnim",  // קינים
        "52": "Kelim",  // כלים
        "53": "Oholot",  // אהלות
        "54": "Negaim",  // נגעים
        "55": "Parah",  // פרה
        "56": "Tahorot",  // טהרות
        "57": "Mikvaot",  // מקוואות
        "58": "Niddah",  // נידה
        "59": "Makhshirin",  // מכשירין
        "60": "Zavim",  // זבים
        "61": "Tevul_Yom",  // טבול יום
        "62": "Yadayim",  // ידיים
        "63": "Uktzin"  // עוקצין
    };

    // מאגר נתוני המשניות - מוגדר ישירות בקוד במקום טעינה מקובץ חיצוני
    let mishnahIndex = [
      ["1", 1, 1, "א"],
      ["1", 1, 2, "א"],
      ["12", 3, 4, "א"],
      ["24", 2, 1, "א"],
      ["39", 1, 3, "א"],
      ["43", 5, 2, "א"],
      
      ["2", 1, 3, "ב"],
      ["13", 2, 1, "ב"],
      ["25", 3, 4, "ב"],
      ["31", 4, 2, "ב"],
      ["44", 2, 5, "ב"],
      
      ["3", 2, 1, "ג"],
      ["14", 3, 2, "ג"],
      ["26", 1, 5, "ג"],
      ["32", 2, 3, "ג"],
      ["45", 1, 1, "ג"],
      
      ["4", 3, 2, "ד"],
      ["15", 2, 3, "ד"],
      ["27", 2, 1, "ד"],
      ["33", 1, 4, "ד"],
      ["46", 3, 2, "ד"],
      
      ["5", 1, 3, "ה"],
      ["16", 3, 2, "ה"],
      ["28", 2, 3, "ה"],
      ["34", 4, 1, "ה"],
      ["47", 2, 4, "ה"],
      
      ["6", 2, 1, "ו"],
      ["17", 1, 4, "ו"],
      ["29", 3, 2, "ו"],
      ["35", 2, 5, "ו"],
      ["48", 1, 3, "ו"],
      
      ["7", 3, 2, "ז"],
      ["18", 2, 1, "ז"],
      ["30", 1, 3, "ז"],
      ["36", 3, 4, "ז"],
      ["49", 2, 1, "ז"],
      
      ["8", 1, 4, "ח"],
      ["19", 3, 2, "ח"],
      ["31", 2, 5, "ח"],
      ["37", 1, 3, "ח"],
      ["50", 2, 2, "ח"],
      
      ["9", 2, 3, "ט"],
      ["20", 1, 4, "ט"],
      ["32", 3, 1, "ט"],
      ["38", 2, 2, "ט"],
      ["51", 1, 5, "ט"],
      
      ["10", 1, 2, "י"],
      ["21", 2, 3, "י"],
      ["33", 3, 4, "י"],
      ["39", 1, 5, "י"],
      ["52", 2, 1, "י"],
      
      ["11", 2, 1, "כ"],
      ["22", 3, 2, "כ"],
      ["34", 1, 3, "כ"],
      ["40", 2, 4, "כ"],
      ["53", 3, 5, "כ"],
      
      ["12", 1, 5, "ל"],
      ["23", 2, 4, "ל"],
      ["35", 3, 3, "ל"],
      ["41", 1, 2, "ל"],
      ["54", 2, 1, "ל"],
      
      ["13", 3, 1, "מ"],
      ["24", 2, 2, "מ"],
      ["36", 1, 3, "מ"],
      ["42", 3, 4, "מ"],
      ["55", 2, 5, "מ"],
      
      ["14", 1, 1, "נ"],
      ["25", 2, 2, "נ"],
      ["37", 3, 3, "נ"],
      ["43", 1, 4, "נ"],
      ["56", 2, 5, "נ"],
      
      ["15", 3, 1, "ס"],
      ["26", 1, 2, "ס"],
      ["38", 2, 3, "ס"],
      ["44", 3, 4, "ס"],
      ["57", 1, 5, "ס"],
      
      ["16", 2, 1, "ע"],
      ["27", 3, 2, "ע"],
      ["39", 1, 3, "ע"],
      ["45", 2, 4, "ע"],
      ["58", 3, 5, "ע"],
      
      ["17", 1, 1, "פ"],
      ["28", 2, 2, "פ"],
      ["40", 3, 3, "פ"],
      ["46", 1, 4, "פ"],
      ["59", 2, 5, "פ"],
      
      ["18", 3, 1, "צ"],
      ["29", 1, 2, "צ"],
      ["41", 2, 3, "צ"],
      ["47", 3, 4, "צ"],
      ["60", 1, 5, "צ"],
      
      ["19", 2, 1, "ק"],
      ["30", 3, 2, "ק"],
      ["42", 1, 3, "ק"],
      ["48", 2, 4, "ק"],
      ["61", 3, 5, "ק"],
      
      ["20", 1, 1, "ר"],
      ["31", 2, 2, "ר"],
      ["43", 3, 3, "ר"],
      ["49", 1, 4, "ר"],
      ["62", 2, 5, "ר"],
      
      ["21", 3, 1, "ש"],
      ["32", 1, 2, "ש"],
      ["44", 2, 3, "ש"],
      ["50", 3, 4, "ש"],
      ["63", 1, 5, "ש"],
      
      ["22", 2, 1, "ת"],
      ["33", 3, 2, "ת"],
      ["45", 1, 3, "ת"],
      ["51", 2, 4, "ת"],
      ["54", 3, 5, "ת"],
      
      ["57", 7, 4, "נ"],
      ["57", 7, 5, "ש"],
      ["57", 7, 6, "מ"],
      ["57", 7, 7, "ה"]
    ];

    // משתנים גלובליים לנתונים
    let currentNiftarName = '';
    let currentNiftarLetters = [];
    let currentNiftarLettersOrdered = [];
    let currentSelectedMishnayot = [];
    let currentModalLetterForReplacement = '';
    let currentModalLetterIndex = -1;
    let currentSelectedMishnahInModal = null; // משנה שנבחרה בתוך המודל

    // יצירת כפתורי א"ב
    function renderAlphabetButtons() {
        alphabetButtonsContainer.innerHTML = '';
        
        // רשימת כל האותיות העבריות
        const hebrewAlphabet = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
        
        // יצירת כפתור לכל אות
        for (const letter of hebrewAlphabet) {
            const button = document.createElement('button');
            button.className = 'alphabet-button';
            button.textContent = letter;
            
            // בדיקה אם האות כבר נבחרה (מופיעה באותיות הייחודיות)
            if (currentNiftarLetters.includes(letter)) {
                button.classList.add('active');
            }
            
            // הוספת אירוע לחיצה
            button.addEventListener('click', function() {
                // בדיקה אם האות כבר קיימת ברשימה
                if (currentNiftarLetters.includes(letter)) {
                    // הסרת האות
                    const letterIndex = currentNiftarLetters.indexOf(letter);
                    if (letterIndex !== -1) {
                        currentNiftarLetters.splice(letterIndex, 1);
                    }
                    
                    // הסרת האות מהרשימה המסודרת
                    for (let i = currentNiftarLettersOrdered.length - 1; i >= 0; i--) {
                        if (currentNiftarLettersOrdered[i] === letter) {
                            // הסרת המשנה אם יש
                            const selectedMishnah = currentSelectedMishnayot.find(m => m.letterIndex === i);
                            if (selectedMishnah) {
                                removeMishnah(i);
                            }
                            
                            // הסרת האות
                            currentNiftarLettersOrdered.splice(i, 1);
                        }
                    }
                    
                    // הסרת הסגנון האקטיבי
                    button.classList.remove('active');
                } else {
                    // הוספת האות
                    currentNiftarLetters.push(letter);
                    currentNiftarLettersOrdered.push(letter);
                    
                    // הוספת הסגנון האקטיבי
                    button.classList.add('active');
                }
                
                // מיון האותיות הייחודיות
                currentNiftarLetters.sort();
                
                // שמירה בלוקל סטורג'
                localStorage.setItem('niftarLetters', currentNiftarLetters.join(''));
                localStorage.setItem('niftarLettersOrdered', currentNiftarLettersOrdered.join(''));
                
                // עדכון התצוגה
                renderLetterBoxes();
            });
            
            alphabetButtonsContainer.appendChild(button);
        }
    }

    // פתיחת חלון בחירת משנה
    function openMishnayotModal(letter, letterIndex) {
        // עדכון המשתנים הגלובליים לצורך טיפול בחלון
        currentModalLetterForReplacement = letter;
        currentModalLetterIndex = letterIndex;
        
        // עדכון כותרת החלון
        modalLetter.textContent = letter;
        
        // ניקוי רשימת המשניות
        modalMishnayotList.innerHTML = '';
        
        // איפוס המשנה הנבחרת כרגע
        currentSelectedMishnahInModal = null;
        
        // טעינת כל המשניות המתאימות לאות
        const mishnayotForLetter = mishnahIndex.filter(m => m[3] === letter);
        
        // הצגת המשניות בחלון
        for (const mishnah of mishnayotForLetter) {
            const masechetId = mishnah[0];
            const perekNum = mishnah[1];
            const mishnahNum = mishnah[2];
            
            // יצירת אלמנט לכל משנה
            const mishnayaElement = document.createElement('div');
            mishnayaElement.className = 'modal-mishnah-item';
            mishnayaElement.dataset.masechetId = masechetId;
            mishnayaElement.dataset.perekNum = perekNum;
            mishnayaElement.dataset.mishnahNum = mishnahNum;
            
            // שם המסכת
            const masechetName = masechetIdToDisplayName[masechetId] || `מסכת ${masechetId}`;
            
            // המרת מספרים לאותיות עבריות
            const hebrewPerek = convertToHebrewLetter(perekNum);
            const hebrewMishnah = convertToHebrewLetter(mishnahNum);
            
            mishnayaElement.innerHTML = `${masechetName} <strong>פרק ${hebrewPerek} משנה ${hebrewMishnah}</strong>`;
            
            // הוספת אירוע לחיצה להצגת תצוגה מקדימה
            mishnayaElement.addEventListener('click', function() {
                // הסרת הסגנון הנבחר מכל המשניות
                document.querySelectorAll('.modal-mishnah-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // הוספת סגנון למשנה הנבחרת
                this.classList.add('selected');
                
                // שמירת המשנה הנבחרת
                currentSelectedMishnahInModal = {
                    masechetId: masechetId,
                    perekNum: perekNum,
                    mishnahNum: mishnahNum,
                    letterIndex: letterIndex
                };
                
                // טעינת תצוגה מקדימה
                fetchAndDisplayMishnahInModal(masechetId, perekNum, mishnahNum);
            });
            
            // הוספה לרשימה
            modalMishnayotList.appendChild(mishnayaElement);
        }
        
        // הצגת החלון
        mishnayotModal.style.display = 'block';
        
        // סימון הכפתור כלא זמין בהתחלה (עד שנבחרת משנה)
        const selectButton = document.getElementById('select-mishna-button');
        if (selectButton) {
            selectButton.disabled = true;
            
            // אירוע בחירת משנה מהמודל
            selectButton.onclick = function() {
                selectMishnahFromModal();
            };
        }
    }

    // בחירת משנה מהמודל (אישור)
    function selectMishnahFromModal() {
        if (!currentSelectedMishnahInModal) {
            showError('לא נבחרה משנה');
            return;
        }
        
        // שמירת המשנה ברשימת המשניות שנבחרו
        const existingIndex = currentSelectedMishnayot.findIndex(m => m.letterIndex === currentModalLetterIndex);
        
        if (existingIndex !== -1) {
            // אם יש כבר משנה לאות זו, החלפה
            currentSelectedMishnayot[existingIndex] = currentSelectedMishnahInModal;
        } else {
            // אם אין, הוספה
            currentSelectedMishnayot.push(currentSelectedMishnahInModal);
        }
        
        // שמירה בלוקל סטורג'
        saveMishnayotToLocalStorage();
        
        // עדכון התצוגה
        renderLetterBoxes();
        renderSelectedMishnayotList();
        
        // סגירת המודל
        closeModalFunc();
        
        // הצגת המשנה במסך הראשי
        const { masechetId, perekNum, mishnahNum } = currentSelectedMishnahInModal;
        fetchAndDisplayMishnah(masechetId, perekNum, mishnahNum);
        contentDisplayArea.style.display = 'block';
    }

    // בחירת משניות אקראיות לכל האותיות
    function selectRandomMishnayot() {
        if (currentNiftarLettersOrdered.length === 0) {
            showError('לא נבחרו אותיות');
            return;
        }
        
        // עבור כל אות, בחר משנה אקראית
        for (let i = 0; i < currentNiftarLettersOrdered.length; i++) {
            const letter = currentNiftarLettersOrdered[i];
            
            // בדיקה אם כבר יש משנה לאות זו - אם כן, דלג
            // אפשר להסיר את השורה הזו אם רוצים לאפשר החלפת משניות קיימות
            // const existingMishnah = currentSelectedMishnayot.find(m => m.letterIndex === i);
            // if (existingMishnah) continue;
            
            // משניות מתאימות לאות
            const mishnayotForLetter = mishnahIndex.filter(m => m[3] === letter);
            
            if (mishnayotForLetter.length > 0) {
                // בחירה אקראית
                const randomIndex = Math.floor(Math.random() * mishnayotForLetter.length);
                const selectedMishnah = mishnayotForLetter[randomIndex];
                
                // הסרת משנה קיימת לאות זו אם יש
                const existingIndex = currentSelectedMishnayot.findIndex(m => m.letterIndex === i);
                if (existingIndex !== -1) {
                    currentSelectedMishnayot.splice(existingIndex, 1);
                }
                
                // הוספת המשנה החדשה
                currentSelectedMishnayot.push({
                    masechetId: selectedMishnah[0],
                    perekNum: selectedMishnah[1],
                    mishnahNum: selectedMishnah[2],
                    letterIndex: i
                });
            }
        }
        
        // שמירה בלוקל סטורג'
        saveMishnayotToLocalStorage();
        
        // עדכון התצוגה
        renderLetterBoxes();
        renderSelectedMishnayotList();
        
        // הצגת הודעת הצלחה
        showSuccess('נבחרו משניות אקראיות');
    }

    // הוספת משניות "נשמה"
    function addNeshamahMishnayot() {
        // בדיקה אם כבר יש את האותיות "נשמה" בסוף הרשימה
        const lastFourLetters = currentNiftarLettersOrdered.slice(-4).join('');
        if (lastFourLetters === 'נשמה') {
            showError('האותיות "נשמה" כבר קיימות בסוף הרשימה');
            return;
        }
        
        // בדיקה אם יש כבר את המשניות של "נשמה" ברשימה
        const neshamahLettersIndices = [];
        for (let i = 0; i < currentNiftarLettersOrdered.length; i++) {
            const letter = currentNiftarLettersOrdered[i];
            if (letter === 'נ' || letter === 'ש' || letter === 'מ' || letter === 'ה') {
                neshamahLettersIndices.push(i);
            }
        }
        
        // הוספת האותיות "נשמה" לסוף הרשימה
        const letters = ['נ', 'ש', 'מ', 'ה'];
        
        for (const letter of letters) {
            currentNiftarLettersOrdered.push(letter);
            
            // הוספה לרשימת האותיות הייחודיות אם עוד לא נמצאת
            if (!currentNiftarLetters.includes(letter)) {
                currentNiftarLetters.push(letter);
            }
        }
        
        // מיון הרשימה הייחודית
        currentNiftarLetters.sort();
        
        // שמירה בלוקל סטורג'
        localStorage.setItem('niftarLetters', currentNiftarLetters.join(''));
        localStorage.setItem('niftarLettersOrdered', currentNiftarLettersOrdered.join(''));
        
        // מציאת המשניות של אותיות "נשמה" במאגר
        const neshamahMishnayot = mishnahIndex.filter(m => m[0] === "57" && m[1] === 7 && m[2] >= 4 && m[2] <= 7);
        
        // הוספת המשניות של "נשמה" לרשימת המשניות שנבחרו
        for (let i = 0; i < neshamahMishnayot.length; i++) {
            const letterIndex = currentNiftarLettersOrdered.length - 4 + i;
            
            // הוספת המשנה
            currentSelectedMishnayot.push({
                masechetId: neshamahMishnayot[i][0],
                perekNum: neshamahMishnayot[i][1],
                mishnahNum: neshamahMishnayot[i][2],
                letterIndex: letterIndex
            });
        }
        
        // שמירה בלוקל סטורג'
        saveMishnayotToLocalStorage();
        
        // עדכון התצוגה
        renderLetterBoxes();
        renderSelectedMishnayotList();
        
        // הצג הודעת הצלחה
        showSuccess('נוספו משניות נשמ"ה ממסכת מקוואות (מקוואות פרק ז, משניות ד-ז)');
    }

    // ניקוי כל הבחירות
    function clearSelections() {
        currentSelectedMishnayot = [];
        saveMishnayotToLocalStorage();
        
        // עדכון התצוגה
        renderLetterBoxes();
        renderSelectedMishnayotList();
        contentDisplayArea.style.display = 'none';
        
        // הצג הודעת הצלחה
        showSuccess('נוקו כל הבחירות');
    }

    // הפניה לדף ההדפסה
    function navigateToPrintPage() {
        if (currentSelectedMishnayot.length === 0) {
            showError('לא נבחרו משניות להדפסה');
            return;
        }
        
        // מעבר לדף ההדפסה
        window.location.href = 'print.html';
    }

    // הצגת הודעות
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            errorMessage.className = 'error-message';
            
            // הסתרת ההודעה אחרי 3 שניות
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        } else {
            console.error(message);
        }
    }

    function showSuccess(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            errorMessage.className = 'success-message';
            
            // הסתרת ההודעה אחרי 3 שניות
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        } else {
            console.log(message);
        }
    }

    // הצגת רשימת המשניות שנבחרו
    function renderSelectedMishnayotList() {
        selectedMishnayotList.innerHTML = '';
        
        if (currentSelectedMishnayot.length === 0) {
            selectedMishnayotList.innerHTML = '<div class="empty-message">טרם נבחרו משניות</div>';
            return;
        }
        
        // מיון המשניות לפי אינדקס (סדר האותיות)
        const sortedMishnayot = [...currentSelectedMishnayot].sort((a, b) => a.letterIndex - b.letterIndex);
        
        // יצירת רשימת המשניות
        for (const mishnah of sortedMishnayot) {
            const mishnayaItem = document.createElement('div');
            mishnayaItem.className = 'selected-mishnah-item';
            
            // המרת מספרים לאותיות עבריות
            const hebrewPerek = convertToHebrewLetter(mishnah.perekNum);
            const hebrewMishnah = convertToHebrewLetter(mishnah.mishnahNum);
            
            // שם המסכת
            const masechetName = masechetIdToDisplayName[mishnah.masechetId] || `מסכת ${mishnah.masechetId}`;
            
            // אות רלוונטית
            const letter = currentNiftarLettersOrdered[mishnah.letterIndex];
            
            // יצירת תוכן האלמנט
            mishnayaItem.innerHTML = `
                <div class="mishnah-details">
                    <span class="letter-badge">${letter}</span>
                    ${masechetName}, פרק ${hebrewPerek} משנה ${hebrewMishnah}
                </div>
                <div class="item-actions">
                    <button class="action-button view-button" title="הצג משנה">הצג</button>
                    <button class="action-button replace-button" title="החלף משנה">החלף</button>
                    <button class="action-button remove-button" title="הסר משנה">הסר</button>
                </div>
            `;
            
            // הוספת אירועים לכפתורים
            const viewButton = mishnayaItem.querySelector('.view-button');
            const replaceButton = mishnayaItem.querySelector('.replace-button');
            const removeButton = mishnayaItem.querySelector('.remove-button');
            
            // אירוע הצגת משנה
            viewButton.addEventListener('click', function() {
                fetchAndDisplayMishnah(mishnah.masechetId, mishnah.perekNum, mishnah.mishnahNum);
                contentDisplayArea.style.display = 'block';
                
                // גלילה לאזור התצוגה
                contentDisplayArea.scrollIntoView({ behavior: 'smooth' });
            });
            
            // אירוע החלפת משנה
            replaceButton.addEventListener('click', function() {
                openMishnayotModal(letter, mishnah.letterIndex);
            });
            
            // אירוע הסרת משנה
            removeButton.addEventListener('click', function() {
                removeMishnah(mishnah.letterIndex);
                renderLetterBoxes();
                renderSelectedMishnayotList();
            });
            
            // הוספה לרשימה
            selectedMishnayotList.appendChild(mishnayaItem);
        }
    }

    // הסרת משנה מהרשימה
    function removeMishnah(letterIndex) {
        const index = currentSelectedMishnayot.findIndex(m => m.letterIndex === letterIndex);
        
        if (index !== -1) {
            currentSelectedMishnayot.splice(index, 1);
            saveMishnayotToLocalStorage();
        }
    }

    // שמירת המשניות שנבחרו בלוקל סטורג'
    function saveMishnayotToLocalStorage() {
        try {
            localStorage.setItem('selectedMishnayot', JSON.stringify(currentSelectedMishnayot));
        } catch (e) {
            console.error('שגיאה בשמירת משניות ללוקל סטורג\':', e);
            showError('שגיאה בשמירת הבחירות');
        }
    }

    // פונקציה לסגירת המודל
    function closeModalFunc() {
        mishnayotModal.style.display = 'none';
        currentSelectedMishnahInModal = null;
        // איפוס תצוגה מקדימה
        if (modalPreviewContent) {
            modalPreviewContent.style.display = 'none';
        }
    }

    // פונקציה להמרת מספרים לאותיות עבריות
    function convertToHebrewLetter(num) {
        if (num <= 0) return '';
        
        const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 
                              'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט',
                              'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט',
                              'ל', 'לא', 'לב', 'לג', 'לד', 'לה', 'לו', 'לז', 'לח', 'לט',
                              'מ', 'מא', 'מב', 'מג', 'מד', 'מה', 'מו', 'מז', 'מח', 'מט', 
                              'נ', 'נא', 'נב', 'נג', 'נד', 'נה', 'נו', 'נז', 'נח', 'נט',
                              'ס', 'סא', 'סב', 'סג', 'סד', 'סה', 'סו', 'סז', 'סח', 'סט',
                              'ע', 'עא', 'עב', 'עג', 'עד', 'עה', 'עו', 'עז', 'עח', 'עט',
                              'פ', 'פא', 'פב', 'פג', 'פד', 'פה', 'פו', 'פז', 'פח', 'פט',
                              'צ', 'צא', 'צב', 'צג', 'צד', 'צה', 'צו', 'צז', 'צח', 'צט', 'ק'];
        
        // אם המספר גדול מ-100, השתמש בספרות רגילות
        if (num > 100) {
            return num.toString();
        }
        
        return hebrewLetters[num - 1] || num.toString();
    }

    // טעינה והצגת משנה (במסך הראשי)
    function fetchAndDisplayMishnah(masechetId, perekNum, mishnahNum) {
        mishnayotDisplay.innerHTML = ''; // ניקוי תצוגה קודמת
        
        // יצירת כותרת המשנה
        const titleElement = document.createElement('h3');
        const masechetName = masechetIdToDisplayName[masechetId] || `מסכת ${masechetId}`;
        
        // המרת מספרים לאותיות עבריות
        const hebrewPerek = convertToHebrewLetter(perekNum);
        const hebrewMishnah = convertToHebrewLetter(mishnahNum);
        
        titleElement.textContent = `${masechetName}, פרק ${hebrewPerek} משנה ${hebrewMishnah}`;
        mishnayotDisplay.appendChild(titleElement);
        
        // משתנה לשמירת המידע של המשנה
        let mishnayaData = {
            text: '',
            commentary: ''
        };

        // בדיקה אם המשנה שמורה ב-localStorage
        const localStorageKey = `mishnah_${masechetId}_${perekNum}_${mishnahNum}`;
        const savedMishnah = localStorage.getItem(localStorageKey);
        
        if (savedMishnah) {
            try {
                // נסיון לטעון את המשנה מ-localStorage
                const parsedData = JSON.parse(savedMishnah);
                console.log("Found mishnah in localStorage:", parsedData);
                displayMishnah(parsedData);
                return;
            } catch (e) {
                console.error("Error parsing localStorage data:", e);
                // אם יש שגיאה, נמשיך לנסות לטעון מהקובץ או מה-API
            }
        }
        
        // נסיון לטעון את המשנה מקובץ מקומי
        fetch(`mishnayot_data/${masechetId}_${perekNum}_${mishnahNum}.json`)
            .then(response => {
                if (!response.ok) {
                    // אם אין קובץ מקומי, טען מה-API של ספריא
                    throw new Error('No local file');
                }
                return response.json();
            })
            .then(data => {
                // הצגת המשנה מהקובץ המקומי
                displayMishnah(data);
            })
            .catch(error => {
                console.log('Local file not found, using Sefaria API:', error);
                
                // קבלת שם המסכת בפורמט של API ספריא
                const masechetApiName = masechetIdToApiName[masechetId] || masechetName.replace('מסכת ', '');
                
                // פניה ל-API של ספריא לקבלת המשנה
                fetch(`https://www.sefaria.org/api/texts/Mishnah_${masechetApiName}.${perekNum}.${mishnahNum}?context=0`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.he) {
                            // שמירת טקסט המשנה
                            mishnayaData.text = data.he;
                            
                            // בדיקה אם צריך לטעון את הברטנורא
                            if (showBartenuraCheckbox.checked) {
                                // טעינת פירוש ברטנורא
                                return fetch(`https://www.sefaria.org/api/texts/Bartenura_on_Mishnah_${masechetApiName}.${perekNum}.${mishnahNum}?context=0`);
                            } else {
                                // אם לא צריך ברטנורא, הצג את המשנה עצמה
                                displayMishnah(mishnayaData);
                                return null;
                            }
                        } else {
                            throw new Error('Invalid Sefaria API response');
                        }
                    })
                    .then(response => {
                        if (response) {
                            return response.json();
                        }
                        return null;
                    })
                    .then(data => {
                        if (data && data.he) {
                            // שמירת פירוש הברטנורא
                            mishnayaData.commentary = data.he;
                        }
                        
                        // הצגת המשנה עם/בלי פירוש
                        displayMishnah(mishnayaData);
                        
                        // שמירה בלוקל סטורג'
                        saveToLocalFile(masechetId, perekNum, mishnahNum, mishnayaData);
                    })
                    .catch(error => {
                        console.error('Error fetching from Sefaria API:', error);
                        
                        // הצגת שגיאה
                        const errorElement = document.createElement('div');
                        errorElement.className = 'error-text';
                        errorElement.textContent = 'שגיאה בטעינת המשנה. אנא נסה שוב מאוחר יותר.';
                        mishnayotDisplay.appendChild(errorElement);
                    });
            });
    }

    // הצגת המשנה במסך הראשי
    function displayMishnah(mishnayaData) {
        // הצגת טקסט המשנה
        if (mishnayaData.text) {
            const textElement = document.createElement('div');
            textElement.className = 'mishnah-text';
            textElement.innerHTML = mishnayaData.text.replace(/\n/g, '<br>');
            mishnayotDisplay.appendChild(textElement);
        }
        
        // הצגת פירוש הברטנורא אם יש
        if (mishnayaData.commentary && showBartenuraCheckbox.checked) {
            const commentaryElement = document.createElement('div');
            commentaryElement.className = 'bartenura-text';
            commentaryElement.innerHTML = `<strong>פירוש ברטנורא:</strong><br>${mishnayaData.commentary.replace(/\n/g, '<br>')}`;
            mishnayotDisplay.appendChild(commentaryElement);
        }
    }

    // טעינה והצגת משנה בתוך המודל
    function fetchAndDisplayMishnahInModal(masechetId, perekNum, mishnahNum) {
        modalPreviewContent.style.display = 'block';
        modalPreviewTitle.textContent = 'טוען...';
        modalPreviewText.innerHTML = '';
        
        // שם המסכת
        const masechetName = masechetIdToDisplayName[masechetId] || `מסכת ${masechetId}`;
        
        // המרת מספרים לאותיות עבריות
        const hebrewPerek = convertToHebrewLetter(perekNum);
        const hebrewMishnah = convertToHebrewLetter(mishnahNum);
        
        // עדכון כותרת
        modalPreviewTitle.textContent = `${masechetName}, פרק ${hebrewPerek} משנה ${hebrewMishnah}`;
        
        // בדיקה אם המשנה שמורה ב-localStorage
        const localStorageKey = `mishnah_${masechetId}_${perekNum}_${mishnahNum}`;
        const savedMishnah = localStorage.getItem(localStorageKey);
        
        if (savedMishnah) {
            try {
                // נסיון לטעון את המשנה מ-localStorage
                const parsedData = JSON.parse(savedMishnah);
                displayMishnahInModal(parsedData);
                
                // הפעלת כפתור הבחירה
                const selectButton = document.getElementById('select-mishna-button');
                if (selectButton) {
                    selectButton.disabled = false;
                }
                
                return;
            } catch (e) {
                console.error("Error parsing localStorage data:", e);
                // אם יש שגיאה, נמשיך לנסות לטעון מהקובץ או מה-API
            }
        }
        
        // נסיון לטעון את המשנה מקובץ מקומי
        fetch(`mishnayot_data/${masechetId}_${perekNum}_${mishnahNum}.json`)
            .then(response => {
                if (!response.ok) {
                    // אם אין קובץ מקומי, טען מה-API של ספריא
                    throw new Error('No local file');
                }
                return response.json();
            })
            .then(data => {
                // הצגת המשנה מהקובץ המקומי
                displayMishnahInModal(data);
                
                // הפעלת כפתור הבחירה
                const selectButton = document.getElementById('select-mishna-button');
                if (selectButton) {
                    selectButton.disabled = false;
                }
            })
            .catch(error => {
                console.log('Local file not found, using Sefaria API:', error);
                
                // קבלת שם המסכת בפורמט של API ספריא
                const masechetApiName = masechetIdToApiName[masechetId] || masechetName.replace('מסכת ', '');
                
                // פניה ל-API של ספריא לקבלת המשנה
                fetch(`https://www.sefaria.org/api/texts/Mishnah_${masechetApiName}.${perekNum}.${mishnahNum}?context=0`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.he) {
                            // שמירת ותצוגת המשנה
                            const mishnayaData = {
                                text: data.he,
                                commentary: ''
                            };
                            
                            displayMishnahInModal(mishnayaData);
                            
                            // שמירה בלוקל סטורג'
                            saveToLocalFile(masechetId, perekNum, mishnahNum, mishnayaData);
                            
                            // הפעלת כפתור הבחירה
                            const selectButton = document.getElementById('select-mishna-button');
                            if (selectButton) {
                                selectButton.disabled = false;
                            }
                        } else {
                            throw new Error('Invalid Sefaria API response');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching from Sefaria API:', error);
                        modalPreviewText.innerHTML = 'שגיאה בטעינת המשנה. אנא נסה שוב מאוחר יותר.';
                    });
            });
    }

    // הצגת המשנה בתוך המודל
    function displayMishnahInModal(mishnayaData) {
        if (mishnayaData.text) {
            modalPreviewText.innerHTML = mishnayaData.text.replace(/\n/g, '<br>');
        } else {
            modalPreviewText.innerHTML = 'לא נמצא תוכן למשנה זו.';
        }
    }

    // שמירת משנה לקובץ מקומי
    function saveToLocalFile(masechetId, perekNum, mishnahNum, data) {
        try {
            const jsonData = JSON.stringify(data);
            
            // שמירה ב-LocalStorage בינתיים
            localStorage.setItem(`mishnah_${masechetId}_${perekNum}_${mishnahNum}`, jsonData);
            
            console.log(`Saved mishnah ${masechetId}_${perekNum}_${mishnahNum} to localStorage`);
        } catch (error) {
            console.error('Error saving mishnah to local storage:', error);
        }
    }

    // אירועי עמוד ואתחול

    // סגירת המודל משניות
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeModalFunc();
        });
        
        // גם סגירה בלחיצה מחוץ למודל
        window.addEventListener('click', function(event) {
            if (event.target === mishnayotModal) {
                closeModalFunc();
            }
        });
    }

    // אירועי כפתורים
    processNameButton.addEventListener('click', processNameAndShow);
    randomSelectButton.addEventListener('click', selectRandomMishnayot);
    addNeshamahButton.addEventListener('click', addNeshamahMishnayot);
    clearSelectionsButton.addEventListener('click', clearSelections);
    preparePrintButton.addEventListener('click', navigateToPrintPage);

    // אירוע הקשה על Enter בשדה שם הנפטר
    niftarNameInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            processNameAndShow();
        }
    });

    // אתחול הדף
    initPage();
}); 