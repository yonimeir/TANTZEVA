// מיפוי של שמות מסכתות להצגה
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

// מיפוי מסכתות לשם API עבור ספריא
const masechetIdToApiName = {
    "1": "Berakhot",
    "2": "Peah",
    "3": "Demai",
    "4": "Kilayim",
    "5": "Sheviit",
    "6": "Terumot",
    "7": "Maasrot",
    "8": "Maaser_Sheni",
    "9": "Challah",
    "10": "Orlah",
    "11": "Bikkurim",
    "12": "Shabbat",
    "13": "Eruvin",
    "14": "Pesachim",
    "15": "Shekalim",
    "16": "Yoma",
    "17": "Sukkah",
    "18": "Beitzah",
    "19": "Rosh_Hashanah",
    "20": "Taanit",
    "21": "Megillah",
    "22": "Moed_Katan",
    "23": "Chagigah",
    "24": "Yevamot",
    "25": "Ketubot",
    "26": "Nedarim",
    "27": "Nazir",
    "28": "Sotah",
    "29": "Gittin",
    "30": "Kiddushin",
    "31": "Bava_Kamma",
    "32": "Bava_Metzia",
    "33": "Bava_Batra",
    "34": "Sanhedrin",
    "35": "Makkot",
    "36": "Shevuot",
    "37": "Eduyot",
    "38": "Avodah_Zarah",
    "39": "Avot",
    "40": "Horayot",
    "41": "Zevachim",
    "42": "Menachot",
    "43": "Chullin",
    "44": "Bekhorot",
    "45": "Arakhin",
    "46": "Temurah",
    "47": "Keritot",
    "48": "Meilah",
    "49": "Tamid",
    "50": "Middot",
    "51": "Kinnim",
    "52": "Kelim",
    "53": "Oholot",
    "54": "Negaim",
    "55": "Parah",
    "56": "Tahorot",
    "57": "Mikvaot",
    "58": "Niddah",
    "59": "Makhshirin",
    "60": "Zavim",
    "61": "Tevul_Yom",
    "62": "Yadayim",
    "63": "Oktzin"
};

// הוספת מיפוי גלובלי
window.masechetIdToDisplayName = masechetIdToDisplayName;
window.masechetIdToApiName = masechetIdToApiName;

// שלד JS לדף הדפסה
// כאן תוכל להעתיק פונקציות קיימות מהקוד הישן (app.js) להצגת המשניות שנבחרו.

document.addEventListener('DOMContentLoaded', function() {
    // לקיחת אלמנטים מה-DOM
    const formatA4 = document.getElementById('format-a4');
    const formatBooklet = document.getElementById('format-booklet');
    const generatePreviewButton = document.getElementById('generate-preview');
    const printPreview = document.getElementById('print-preview');
    const printContent = document.getElementById('print-content');
    const printButton = document.getElementById('print-button');
    const closePreviewButton = document.getElementById('close-preview');
    const includeCommentary = document.getElementById('include-commentary');
    const includeNeshamahNote = document.getElementById('include-neshamah-note');
    const errorMessage = document.getElementById('error-message');
    const niftarNameDisplay = document.getElementById('niftar-name-display');
    const selectedMishnayotDisplay = document.getElementById('selected-mishnayot-display');
    const selectedTehillimDisplay = document.getElementById('selected-tehillim-display');
    const customLettersInput = document.getElementById('custom-letters-input');
    const useCustomLettersCheckbox = document.getElementById('use-custom-letters');

    // ------------------- טעינת נתונים מ-URL או מלוקל סטורג' -------------------
    function loadSharedDataFromURL() {
        const params = new URLSearchParams(window.location.search);
        const sharedData = params.get('share');
        if (sharedData) {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
                if (decoded.name) localStorage.setItem('niftarName', decoded.name);
                if (decoded.letters) localStorage.setItem('niftarLettersOrdered', decoded.letters);
                if (decoded.mishnayot) localStorage.setItem('selectedMishnayot', JSON.stringify(decoded.mishnayot));
                if (decoded.tehillim) localStorage.setItem('selectedTehillimVerses', JSON.stringify(decoded.tehillim));
                console.log('נטענו נתונים משותפים מ-URL');
                window.history.replaceState({}, '', window.location.pathname);
            } catch (e) {
                console.error('שגיאה בטעינת נתונים משותפים:', e);
            }
        }
    }
    loadSharedDataFromURL();
    
    const niftarName = localStorage.getItem('niftarName') || '';
    let niftarLettersOriginal = localStorage.getItem('niftarLettersOrdered') || localStorage.getItem('niftarLetters') || '';
    let selectedMishnayot = [];
    let selectedTehillimVerses = [];
    
    try {
        selectedMishnayot = JSON.parse(localStorage.getItem('selectedMishnayot') || '[]');
        selectedTehillimVerses = JSON.parse(localStorage.getItem('selectedTehillimVerses') || '[]');
    } catch (e) {
        console.error('שגיאה בטעינת נתונים מהזיכרון המקומי:', e);
    }
    
    // אתחול שדה אותיות מותאם אישית אם קיים
    if (customLettersInput) {
        customLettersInput.value = localStorage.getItem('customLetters') || 'א, ב, ה, י, מ, נ, ר, ש';
    }

    // אתחול תיבת הסימון להשתמש באותיות מותאמות אישית
    if (useCustomLettersCheckbox) {
        useCustomLettersCheckbox.checked = localStorage.getItem('useCustomLetters') === 'true';
        
        // אם משתמשים באותיות מותאמות אישית, עדכן את רשימת האותיות
        if (useCustomLettersCheckbox.checked && customLettersInput) {
            niftarLettersOriginal = parseCustomLetters(customLettersInput.value);
        }
        
        // אירוע שינוי לתיבת הסימון
        useCustomLettersCheckbox.addEventListener('change', function() {
            localStorage.setItem('useCustomLetters', this.checked);
            
            if (this.checked && customLettersInput) {
                niftarLettersOriginal = parseCustomLetters(customLettersInput.value);
                localStorage.setItem('customLetters', customLettersInput.value);
            } else {
                niftarLettersOriginal = localStorage.getItem('niftarLettersOrdered') || localStorage.getItem('niftarLetters') || '';
            }
            
            // עדכון התצוגה
            displaySelectedMishnayot();
            displaySelectedTehillim();
        });
    }
    
    // אירוע לשינוי טקסט האותיות המותאמות אישית
    if (customLettersInput) {
        customLettersInput.addEventListener('change', function() {
            localStorage.setItem('customLetters', this.value);
            
            if (useCustomLettersCheckbox && useCustomLettersCheckbox.checked) {
                niftarLettersOriginal = parseCustomLetters(this.value);
                
                // עדכון התצוגה
                displaySelectedMishnayot();
                displaySelectedTehillim();
            }
        });
    }
    
    // פונקציה לניתוח האותיות המותאמות אישית
    function parseCustomLetters(input) {
        if (!input) return '';
        
        // הסר רווחים ופסיקים ואחד את כל האותיות
        return input.replace(/\s+/g, '').replace(/,/g, '');
    }
    
    // הצגת שם הנפטר אם האלמנט קיים
    if (niftarNameDisplay) {
        niftarNameDisplay.textContent = niftarName || '';
    }
    
    // הצגת המשניות ופרקי התהילים שנבחרו
    displaySelectedMishnayot();
    displaySelectedTehillim();
    
    // פונקציה להצגת המשניות שנבחרו
    function displaySelectedMishnayot() {
        if (!selectedMishnayotDisplay) return;
        
        // אם אין משניות שנבחרו
        if (!selectedMishnayot || selectedMishnayot.length === 0) {
            selectedMishnayotDisplay.innerHTML = '<p>לא נבחרו משניות</p>';
            return;
        }
        
        // קביעת האותיות לפי בחירת המשתמש
        let lettersToUse = niftarLettersOriginal;
        if (useCustomLettersCheckbox && useCustomLettersCheckbox.checked && customLettersInput) {
            lettersToUse = parseCustomLetters(customLettersInput.value);
            console.log("משתמש באותיות מותאמות בתצוגת מקדימה:", lettersToUse);
        }
        
        // בנייה מחדש של התצוגה
        let html = '';
        
        // אם יש אותיות מוגדרות, ארגן לפיהן
        if (lettersToUse) {
            const lettersArray = lettersToUse.split('');
            console.log("סדר אותיות בתצוגה מקדימה:", lettersArray);
            
            html = '<ul class="selected-content-list">';
            
            for (let i = 0; i < lettersArray.length; i++) {
                const letter = lettersArray[i];
                // מציאת משניות לאות זו
                const letterMishnayot = selectedMishnayot.filter(m => m.letter === letter);
                
                console.log(`אות ${letter} בתצוגה מקדימה: נמצאו ${letterMishnayot.length} משניות`);
                
                if (letterMishnayot.length > 0) {
                    html += `<li class="selected-content-letter">האות ${letter} (${i+1}/${lettersArray.length}):</li>`;
                    
                    for (const mishnah of letterMishnayot) {
                        // שם מסכת לתצוגה
                        let masechetDisplayName = mishnah.masechetName || '';
                        if (!masechetDisplayName && window.masechetIdToDisplayName && mishnah.masechetId) {
                            masechetDisplayName = window.masechetIdToDisplayName[mishnah.masechetId] || '';
                        }
                        
                        html += `<li class="selected-content-item">${masechetDisplayName} פרק ${mishnah.perek || mishnah.perekNum || '?'} משנה ${mishnah.mishnah || mishnah.mishnahNum || '?'}</li>`;
                    }
                }
            }
            
            html += '</ul>';
        } else {
            // אם אין אותיות מוגדרות, הצג את כל המשניות לפי סדר האינדקס
            const sortedMishnayot = [...selectedMishnayot].sort((a, b) => {
                // אם יש letterIndex, השתמש בו
                if (a.letterIndex !== undefined && b.letterIndex !== undefined) {
                    return a.letterIndex - b.letterIndex;
                } 
                // אחרת סדר לפי מסכת
                return (a.masechetId || 0) - (b.masechetId || 0);
            });
            
            html = '<ul class="selected-content-list">';
            
            for (const mishnah of sortedMishnayot) {
                // שם מסכת לתצוגה
                let masechetDisplayName = mishnah.masechetName || '';
                if (!masechetDisplayName && window.masechetIdToDisplayName && mishnah.masechetId) {
                    masechetDisplayName = window.masechetIdToDisplayName[mishnah.masechetId] || '';
                }
                
                html += `<li class="selected-content-item">${masechetDisplayName} פרק ${mishnah.perek || mishnah.perekNum || '?'} משנה ${mishnah.mishnah || mishnah.mishnahNum || '?'}</li>`;
            }
            
            html += '</ul>';
        }
        
        selectedMishnayotDisplay.innerHTML = html;
    }

    // פונקציה להצגת פרקי התהילים שנבחרו
    function displaySelectedTehillim() {
        if (!selectedTehillimDisplay) return;
        
        // אם אין פרקי תהילים שנבחרו
        if (!selectedTehillimVerses || selectedTehillimVerses.length === 0) {
            selectedTehillimDisplay.innerHTML = '<p>לא נבחרו פרקי תהילים</p>';
            return;
        }
        
        // קביעת האותיות לפי בחירת המשתמש
        let lettersToUse = niftarLettersOriginal;
        if (useCustomLettersCheckbox && useCustomLettersCheckbox.checked && customLettersInput) {
            lettersToUse = parseCustomLetters(customLettersInput.value);
        }
        
        // בנייה מחדש של התצוגה
        let html = '';
        
        // אם יש אותיות מוגדרות, ארגן לפיהן
        if (lettersToUse) {
            const lettersArray = lettersToUse.split('');
            console.log("סדר אותיות בתצוגת תהילים:", lettersArray);
            
            html = '<ul class="selected-content-list">';
            
            for (let i = 0; i < lettersArray.length; i++) {
                const letter = lettersArray[i];
                // מציאת פסוקים לאות זו
                const letterVerses = selectedTehillimVerses.filter(v => v.letter === letter);
                
                console.log(`אות ${letter} בתצוגת תהילים: נמצאו ${letterVerses.length} פסוקים`);
                
                if (letterVerses.length > 0) {
                    html += `<li class="selected-content-letter">האות ${letter} (${i+1}/${lettersArray.length}):</li>`;
                    
                    for (const verse of letterVerses) {
                        html += `<li class="selected-content-item">תהילים ${verse.chapter}:${verse.verse}</li>`;
                    }
                }
            }
            
            html += '</ul>';
        } else {
            // אם אין אותיות מוגדרות, הצג את כל פסוקי התהילים לפי סדר האינדקס
            const sortedVerses = [...selectedTehillimVerses].sort((a, b) => {
                // אם יש letterIndex, השתמש בו
                if (a.letterIndex !== undefined && b.letterIndex !== undefined) {
                    return a.letterIndex - b.letterIndex;
                } 
                // אחרת סדר לפי פרק ופסוק
                return (a.chapter - b.chapter) || (a.verse - b.verse);
            });
            
            html = '<ul class="selected-content-list">';
            
            for (const verse of sortedVerses) {
                html += `<li class="selected-content-item">תהילים ${verse.chapter}:${verse.verse}</li>`;
            }
            
            html += '</ul>';
        }
        
        selectedTehillimDisplay.innerHTML = html;
    }

    // ------------------- בקרת גופנים -------------------
    const fontFamilySelect = document.getElementById('font-family-select');
    const fontSizeRange = document.getElementById('font-size-range');
    const fontSizeDisplay = document.getElementById('font-size-display');
    
    function applyFontSettings() {
        if (!printContent) return;
        const fontFamily = fontFamilySelect ? fontFamilySelect.value : "'Alef', sans-serif";
        const fontSize = fontSizeRange ? fontSizeRange.value + 'px' : '16px';
        printContent.style.fontFamily = fontFamily;
        printContent.style.fontSize = fontSize;
        if (fontSizeDisplay && fontSizeRange) {
            fontSizeDisplay.textContent = fontSizeRange.value;
        }
        localStorage.setItem('printFontFamily', fontFamily);
        localStorage.setItem('printFontSize', fontSizeRange ? fontSizeRange.value : '16');
    }
    
    // טעינת הגדרות שמורות
    const savedFontFamily = localStorage.getItem('printFontFamily');
    const savedFontSize = localStorage.getItem('printFontSize');
    if (savedFontFamily && fontFamilySelect) {
        for (let i = 0; i < fontFamilySelect.options.length; i++) {
            if (fontFamilySelect.options[i].value === savedFontFamily) {
                fontFamilySelect.selectedIndex = i;
                break;
            }
        }
    }
    if (savedFontSize && fontSizeRange) {
        fontSizeRange.value = savedFontSize;
        if (fontSizeDisplay) fontSizeDisplay.textContent = savedFontSize;
    }
    
    if (fontFamilySelect) fontFamilySelect.addEventListener('change', applyFontSettings);
    if (fontSizeRange) fontSizeRange.addEventListener('input', applyFontSettings);

    // הגדרת פורמט ברירת מחדל
    let currentFormat = 'a4';
    
    // פונקציה לעדכון פורמט הדפסה
    function updatePrintFormat() {
        if (formatA4 && formatBooklet) {
            if (formatA4.checked) {
                currentFormat = 'a4';
            } else if (formatBooklet.checked) {
                currentFormat = 'booklet';
            }
            
            if (printContent) {
                printContent.classList.remove('a4', 'booklet');
                printContent.classList.add(currentFormat);
            }
        }
    }
    
    // אירועי שינוי פורמט
    if (formatA4) formatA4.addEventListener('change', updatePrintFormat);
    if (formatBooklet) formatBooklet.addEventListener('change', updatePrintFormat);
    
    // הגדרת פורמט ברירת מחדל
    if (formatA4) formatA4.checked = true;
    updatePrintFormat();
    
    // אירוע סגירת תצוגה מקדימה
    if (closePreviewButton) {
        closePreviewButton.addEventListener('click', function() {
            if (printPreview) printPreview.style.display = 'none';
        });
    }
    
    // אירוע הדפסה
    if (printButton) {
        printButton.addEventListener('click', function() {
            // הסתרת כפתורים שלא צריכים להופיע בהדפסה
            if (printButton) printButton.style.display = 'none';
            if (closePreviewButton) closePreviewButton.style.display = 'none';
            
            // שינוי כותרת הדף להדפסה
            const originalTitle = document.title;
            document.title = `דף לימוד לעילוי נשמת ${localStorage.getItem('niftarName') || ''}`;
            
            window.print();
            
            // החזרת הכפתורים והכותרת לאחר ההדפסה
            setTimeout(function() {
                if (printButton) printButton.style.display = 'inline-block';
                if (closePreviewButton) closePreviewButton.style.display = 'inline-block';
                document.title = originalTitle;
            }, 1000);
        });
    }

    // פונקציה לטעינת תוכן המשנה מזיכרון מקומי או מהאינטרנט
    function loadMishnahContent(mishnah) {
        return new Promise(async (resolve, reject) => {
            try {
                // בדיקה אם המשנה כבר כוללת טקסט
                if (mishnah.text) {
                    console.log("משנה כבר כוללת טקסט:", mishnah);
                    resolve(mishnah);
                    return;
                }
                
                const masechetId = mishnah.masechetId;
                const perekNum = mishnah.perek || mishnah.perekNum;
                const mishnahNum = mishnah.mishnah || mishnah.mishnahNum;
                
                if (!masechetId || !perekNum || !mishnahNum) {
                    console.error('נתוני משנה חסרים:', mishnah);
                    resolve({...mishnah, text: 'שגיאה בטעינת המשנה - נתונים חסרים'});
                    return;
                }
                
                console.log(`טוען משנה: מסכת ${masechetId}, פרק ${perekNum}, משנה ${mishnahNum}`);
                
                // בדיקה אם המשנה שמורה בלוקל סטורג'
                const localStorageKey = `mishnah_${masechetId}_${perekNum}_${mishnahNum}`;
                const savedMishnah = localStorage.getItem(localStorageKey);
                
                if (savedMishnah) {
                    try {
                        // נסיון לטעון את המשנה מלוקל סטורג'
                        const parsedData = JSON.parse(savedMishnah);
                        console.log("נמצאה משנה בזיכרון מקומי:", parsedData);
                        
                        if (parsedData.text) {
                            resolve({
                                ...mishnah,
                                text: parsedData.text,
                                commentary: parsedData.commentary || ''
                            });
                            return;
                        }
                    } catch (e) {
                        console.error("שגיאה בניתוח נתוני זיכרון מקומי:", e);
                    }
                }
                
                // קבלת שם המסכת בפורמט של API ספריא
                const masechetApiName = window.masechetIdToApiName[masechetId] || '';
                
                if (!masechetApiName) {
                    console.error('שם מסכת לא נמצא עבור API:', masechetId);
                    resolve({...mishnah, text: 'שגיאה בטעינת המשנה - מסכת לא מזוהה'});
                    return;
                }
                
                console.log(`פונה ל-API עבור מסכת ${masechetApiName} פרק ${perekNum} משנה ${mishnahNum}`);
                
                // פניה ל-API של ספריא
                try {
                    const response = await fetch(`https://www.sefaria.org/api/texts/Mishnah_${masechetApiName}.${perekNum}.${mishnahNum}?context=0`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data && data.he) {
                        const mishnahText = Array.isArray(data.he) ? data.he.join('<br><br>') : data.he;
                        
                        // טעינת פירוש ברטנורא
                        let commentaryText = '';
                        try {
                            const commentaryResponse = await fetch(`https://www.sefaria.org/api/texts/Bartenura_on_Mishnah_${masechetApiName}.${perekNum}.${mishnahNum}?context=0`);
                            
                            if (commentaryResponse.ok) {
                                const bartenuraData = await commentaryResponse.json();
                                if (bartenuraData && bartenuraData.he) {
                                    commentaryText = Array.isArray(bartenuraData.he) ? 
                                        bartenuraData.he.join('<br><br>') : bartenuraData.he;
                                }
                            }
                        } catch (commentaryError) {
                            console.warn('לא ניתן לטעון פירוש ברטנורא:', commentaryError);
                        }
                        
                        // שמירה בלוקל סטורג'
                        const mishnahData = {
                            text: mishnahText,
                            commentary: commentaryText
                        };
                        
                        localStorage.setItem(localStorageKey, JSON.stringify(mishnahData));
                        
                        resolve({
                            ...mishnah,
                            text: mishnahText,
                            commentary: commentaryText
                        });
                    } else {
                        console.error('הנתונים שהתקבלו מהשרת אינם בפורמט המצופה:', data);
                        resolve({...mishnah, text: 'לא נמצא תוכן למשנה זו'});
                    }
                } catch (apiError) {
                    console.error('שגיאה בטעינה מ-API:', apiError);
                    resolve({...mishnah, text: 'שגיאה בטעינת המשנה - בעיה בתקשורת עם השרת'});
                }
            } catch (generalError) {
                console.error('שגיאה כללית בטעינת משנה:', generalError);
                resolve({...mishnah, text: 'שגיאה כללית בטעינת המשנה'});
            }
        });
    }

    // פונקציה ליצירת תצוגה מקדימה
    if (generatePreviewButton) {
        generatePreviewButton.addEventListener('click', async function() {
            if (!printContent) return;
            
            // הצגת הודעת טעינה
            printContent.innerHTML = '<div class="loading-message" style="text-align: center; padding: 20px; font-size: 18px;">טוען משניות... אנא המתן</div>';
            
            // קבלת הנתונים הנדרשים
            const niftarName = localStorage.getItem('niftarName') || '';
            
            // הגדרת סדר האותיות להצגה
            let lettersToUse = '';
            
            // אם משתמשים באותיות מותאמות אישית, השתמש בהן
            if (useCustomLettersCheckbox && useCustomLettersCheckbox.checked && customLettersInput) {
                lettersToUse = parseCustomLetters(customLettersInput.value);
                console.log("משתמש באותיות מותאמות אישית:", lettersToUse);
            } else {
                // אחרת, השתמש באותיות המסודרות מהנפטר
                lettersToUse = localStorage.getItem('niftarLettersOrdered') || localStorage.getItem('niftarLetters') || '';
                console.log("משתמש באותיות מאחסון מקומי:", lettersToUse);
            }
            
            let selectedMishnayot = [];
            let selectedTehillimVerses = [];
            
            try {
                const mishnayotData = localStorage.getItem('selectedMishnayot');
                console.log("נתוני משניות מהלוקל סטורג':", mishnayotData);
                
                if (mishnayotData) {
                    selectedMishnayot = JSON.parse(mishnayotData);
                }
                
                const tehillimData = localStorage.getItem('selectedTehillimVerses');
                if (tehillimData) {
                    selectedTehillimVerses = JSON.parse(tehillimData);
                }
                
                console.log("משניות שנטענו:", selectedMishnayot.length);
                console.log("פרקי תהילים שנטענו:", selectedTehillimVerses.length);
            } catch (e) {
                console.error('שגיאה בטעינת נתונים מהזיכרון המקומי:', e);
            }
            
            // בדיקה שיש תוכן להצגה
            if (!niftarName || (selectedMishnayot.length === 0 && selectedTehillimVerses.length === 0)) {
                if (errorMessage) {
                    errorMessage.textContent = 'יש להזין שם המנוח ולבחור לפחות פריט אחד להצגה.';
                    errorMessage.style.display = 'block';
                }
                return;
            }
            
            if (errorMessage) errorMessage.style.display = 'none';
            
            try {
                // טעינת תוכן המשניות
                console.log("מתחיל טעינת תוכן משניות...");
                
                for (let i = 0; i < selectedMishnayot.length; i++) {
                    console.log(`טוען משנה ${i+1}/${selectedMishnayot.length}:`, selectedMishnayot[i]);
                    // עדכון המשנה עם התוכן שלה
                    selectedMishnayot[i] = await loadMishnahContent(selectedMishnayot[i]);
                }
                
                console.log("סיום טעינת תוכן משניות");
                console.log("משניות לאחר טעינה:", selectedMishnayot);
                
                // ניקוי תוכן קודם
                printContent.innerHTML = '';
                
                // יצירת כותרת ראשית
                const mainHeader = document.createElement('div');
                mainHeader.className = 'main-header';
                printContent.appendChild(mainHeader);
                
                // הוספת הערת "לעילוי נשמת" אם מסומן
                const includeNote = includeNeshamahNote && includeNeshamahNote.checked;
                if (includeNote) {
                    const neshamahNote = document.createElement('div');
                    neshamahNote.className = 'neshamah-note';
                    neshamahNote.innerHTML = '<h2>לעילוי נשמת</h2>';
                    mainHeader.appendChild(neshamahNote);
                }
                
                // הוספת שם הנפטר
                const nameHeader = document.createElement('div');
                nameHeader.className = 'name-header';
                nameHeader.innerHTML = `<h1>${niftarName}</h1>`;
                mainHeader.appendChild(nameHeader);
                
                // יצירת מקטע למשניות אם יש
                if (selectedMishnayot.length > 0) {
                    const mishnayotSection = document.createElement('div');
                    mishnayotSection.className = 'mishnayot-section';
                    mishnayotSection.innerHTML = '<h3>משניות</h3>';
                    
                    // מיון המשניות לפי סדר האותיות בתצוגה
                    let sortedMishnayot = [...selectedMishnayot];
                    
                    // אם יש אותיות מוגדרות, סדר לפיהן
                    if (lettersToUse) {
                        const letters = lettersToUse.split('');
                        console.log("סדר אותיות להצגה:", letters);
                        
                        // עבור כל אות בסדר שהוגדר
                        for (let i = 0; i < letters.length; i++) {
                            const letter = letters[i];
                            // מציאת משניות שמתאימות לאות זו
                            const letterMishnayot = selectedMishnayot.filter(m => m.letter === letter);
                            
                            console.log(`אות ${letter}: נמצאו ${letterMishnayot.length} משניות`);
                            
                            if (letterMishnayot.length > 0) {
                                const letterSection = document.createElement('div');
                                letterSection.className = 'letter-section';
                                letterSection.innerHTML = `<div class="letter-heading">האות ${letter} (${i+1}/${letters.length})</div>`;
                                
                                // הוספת כל המשניות לאות זו
                                for (const mishnah of letterMishnayot) {
                                    const mishnayotItem = document.createElement('div');
                                    mishnayotItem.className = 'mishnayot-item';
                                    
                                    // שם מסכת לתצוגה
                                    let masechetDisplayName = mishnah.masechetName || '';
                                    if (!masechetDisplayName && window.masechetIdToDisplayName && mishnah.masechetId) {
                                        masechetDisplayName = window.masechetIdToDisplayName[mishnah.masechetId] || '';
                                    }
                                    
                                    // המרה למספרים עבריים
                                    const perekHebrew = numberToHebrew(mishnah.perek || mishnah.perekNum || 0);
                                    const mishnahHebrew = numberToHebrew(mishnah.mishnah || mishnah.mishnahNum || 0);
                                    
                                    // יצירת כותרת המשנה
                                    mishnayotItem.innerHTML = `
                                        <div class="mishnah-title">${masechetDisplayName} פרק ${perekHebrew} משנה ${mishnahHebrew}</div>
                                        <div class="mishnah-content">${mishnah.text || 'לא נמצא תוכן למשנה זו'}</div>
                                    `;
                                    
                                    // הוספת פירוש ברטנורא אם יש ומסומן
                                    if (includeCommentary && includeCommentary.checked) {
                                        const commentary = mishnah.commentary || mishnah.bartenura;
                                        if (commentary) {
                                            const commentaryDiv = document.createElement('div');
                                            commentaryDiv.className = 'commentary-content';
                                            commentaryDiv.innerHTML = `<div class="commentary-title">ברטנורא:</div><div class="commentary-text">${commentary}</div>`;
                                            mishnayotItem.appendChild(commentaryDiv);
                                        }
                                    }
                                    
                                    letterSection.appendChild(mishnayotItem);
                                }
                                
                                mishnayotSection.appendChild(letterSection);
                            }
                        }
                    } else {
                        // אם אין אותיות מוגדרות, הצג את כל המשניות לפי סדר האינדקס
                        sortedMishnayot.sort((a, b) => {
                            // אם יש letterIndex, השתמש בו
                            if (a.letterIndex !== undefined && b.letterIndex !== undefined) {
                                return a.letterIndex - b.letterIndex;
                            } 
                            // אחרת סדר לפי מסכת
                            return (a.masechetId || 0) - (b.masechetId || 0);
                        });
                        
                        for (const mishnah of sortedMishnayot) {
                            const mishnayotItem = document.createElement('div');
                            mishnayotItem.className = 'mishnayot-item';
                            
                            // שם מסכת לתצוגה
                            let masechetDisplayName = mishnah.masechetName || '';
                            if (!masechetDisplayName && window.masechetIdToDisplayName && mishnah.masechetId) {
                                masechetDisplayName = window.masechetIdToDisplayName[mishnah.masechetId] || '';
                            }
                            
                            mishnayotItem.innerHTML = `
                                <div class="mishnah-title">${masechetDisplayName} פרק ${mishnah.perek || mishnah.perekNum || '?'} משנה ${mishnah.mishnah || mishnah.mishnahNum || '?'}</div>
                                <div class="mishnah-content">${mishnah.text || 'טוען...'}</div>
                            `;
                            
                            // הוספת פירוש ברטנורא אם יש ומסומן
                            if (includeCommentary && includeCommentary.checked) {
                                const commentary = mishnah.commentary || mishnah.bartenura;
                                if (commentary) {
                                    const commentaryDiv = document.createElement('div');
                                    commentaryDiv.className = 'commentary-content';
                                    commentaryDiv.innerHTML = `<div class="commentary-title">ברטנורא:</div><div class="commentary-text">${commentary}</div>`;
                                    mishnayotItem.appendChild(commentaryDiv);
                                }
                            }
                            
                            mishnayotSection.appendChild(mishnayotItem);
                        }
                    }
                    
                    printContent.appendChild(mishnayotSection);
                }
                
                // יצירת מקטע לתהילים אם יש
                if (selectedTehillimVerses && selectedTehillimVerses.length > 0) {
                    // הוספת מעבר עמוד לפני קטע התהילים
                    if (selectedMishnayot && selectedMishnayot.length > 0) {
                        const pageBreak = document.createElement('div');
                        pageBreak.className = 'page-break';
                        printContent.appendChild(pageBreak);
                    }
                    
                    const tehillimSection = document.createElement('div');
                    tehillimSection.className = 'tehillim-section';
                    tehillimSection.innerHTML = '<h3>פרקי תהילים</h3>';
                    
                    // מיון פסוקי התהילים לפי סדר האותיות בתצוגה
                    let sortedVerses = [...selectedTehillimVerses];
                    
                    // אם יש אותיות מוגדרות, סדר לפיהן
                    if (lettersToUse) {
                        const letters = lettersToUse.split('');
                        
                        // עבור כל אות בסדר שהוגדר
                        for (let i = 0; i < letters.length; i++) {
                            const letter = letters[i];
                            // מציאת פסוקים שמתאימים לאות זו
                            const letterVerses = selectedTehillimVerses.filter(v => v.letter === letter);
                            
                            console.log(`אות ${letter}: נמצאו ${letterVerses.length} פסוקי תהילים`);
                            
                            if (letterVerses.length > 0) {
                                const letterSection = document.createElement('div');
                                letterSection.className = 'letter-section';
                                letterSection.innerHTML = `<div class="letter-heading">האות ${letter} (${i+1}/${letters.length})</div>`;
                                
                                // הוספת כל פסוקי התהילים לאות זו
                                for (const verse of letterVerses) {
                                    const tehillimItem = document.createElement('div');
                                    tehillimItem.className = 'tehillim-item';
                                    tehillimItem.innerHTML = `
                                        <div class="tehillim-title">תהילים ${verse.chapter}:${verse.verse}</div>
                                        <div class="tehillim-content">${verse.text || 'טוען...'}</div>
                                    `;
                                    letterSection.appendChild(tehillimItem);
                                }
                                
                                tehillimSection.appendChild(letterSection);
                            }
                        }
                    } else {
                        // אם אין אותיות מוגדרות, הצג את כל פסוקי התהילים לפי סדר האינדקס
                        sortedVerses.sort((a, b) => {
                            // אם יש letterIndex, השתמש בו
                            if (a.letterIndex !== undefined && b.letterIndex !== undefined) {
                                return a.letterIndex - b.letterIndex;
                            } 
                            // אחרת סדר לפי פרק ופסוק
                            return (a.chapter - b.chapter) || (a.verse - b.verse);
                        });
                        
                        for (const verse of sortedVerses) {
                            const tehillimItem = document.createElement('div');
                            tehillimItem.className = 'tehillim-item';
                            tehillimItem.innerHTML = `
                                <div class="tehillim-title">תהילים ${verse.chapter}:${verse.verse}</div>
                                <div class="tehillim-content">${verse.text || 'טוען...'}</div>
                            `;
                            tehillimSection.appendChild(tehillimItem);
                        }
                    }
                    
                    printContent.appendChild(tehillimSection);
                }
                
                // הוספת תפילות סטנדרטיות (אנא / אל מלא רחמים וכד')
                if (niftarName) {
                    const prayersSection = document.createElement('div');
                    prayersSection.className = 'prayers-section';
                    prayersSection.innerHTML = `
                        <h3>תפילות</h3>
                        <div class="prayer-item">
                            <div class="prayer-title">א-ל מלא רחמים</div>
                            <div class="prayer-content">
                                אֵל מָלֵא רַחֲמִים שׁוֹכֵן בַּמְּרוֹמִים, הַמְצֵא מְנוּחָה נְכוֹנָה עַל כַּנְפֵי הַשְּׁכִינָה, בְּמַעֲלוֹת קְדוֹשִׁים וּטְהוֹרִים כְּזֹהַר הָרָקִיעַ מַזְהִירִים,
                                אֶת נִשְׁמַת ${niftarName} שֶׁהָלַךְ לְעוֹלָמוֹ, בַּעֲבוּר שֶׁנָּדְבוּ צְדָקָה בְּעַד הַזְכָּרַת נִשְׁמָתוֹ,
                                בְּגַן עֵדֶן תְּהֵא מְנוּחָתוֹ, לָכֵן בַּעַל הָרַחֲמִים יַסְתִּירֵהוּ בְּסֵתֶר כְּנָפָיו לְעוֹלָמִים, וְיִצְרוֹר בִּצְרוֹר הַחַיִּים אֶת נִשְׁמָתוֹ,
                                ה' הוּא נַחֲלָתוֹ, וְיָנוּחַ בְּשָׁלוֹם עַל מִשְׁכָּבוֹ, וְנֹאמַר אָמֵן.
                            </div>
                        </div>
                    `;
                    printContent.appendChild(prayersSection);
                }
                
                // הוספת הפניה למקור
                const sourceNote = document.createElement('div');
                sourceNote.className = 'source-note';
                sourceNote.innerHTML = '<p>דף זה הופק באמצעות אתר משניות לעילוי נשמת - כל הזכויות שמורות</p>';
                printContent.appendChild(sourceNote);
                
                // החלת הגדרות גופן
                applyFontSettings();
                
                // הצגת התצוגה המקדימה
                if (printPreview) printPreview.style.display = 'block';
            } catch (error) {
                console.error("שגיאה בטעינת תוכן משניות:", error);
                printContent.innerHTML = '<div class="error-message" style="color: red; text-align: center; padding: 20px;">אירעה שגיאה בטעינת המשניות. אנא נסה שוב מאוחר יותר.</div>';
            }
        });
    }
    // ------------------- שיתוף -------------------
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            const shareData = {
                name: localStorage.getItem('niftarName') || '',
                letters: localStorage.getItem('niftarLettersOrdered') || '',
                mishnayot: JSON.parse(localStorage.getItem('selectedMishnayot') || '[]').map(m => ({
                    masechetId: m.masechetId,
                    perekNum: m.perekNum,
                    mishnahNum: m.mishnahNum,
                    letterIndex: m.letterIndex,
                    letter: m.letter
                })),
                tehillim: JSON.parse(localStorage.getItem('selectedTehillimVerses') || '[]').map(v => ({
                    letter: v.letter,
                    chapter: v.chapter,
                    verse: v.verse
                }))
            };
            
            const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
            const shareURL = window.location.origin + window.location.pathname + '?share=' + encoded;
            
            if (navigator.share) {
                navigator.share({
                    title: `משניות לעילוי נשמת ${shareData.name}`,
                    text: `דף משניות לעילוי נשמת ${shareData.name}`,
                    url: shareURL
                }).catch(err => console.log('שיתוף בוטל:', err));
            } else {
                navigator.clipboard.writeText(shareURL).then(() => {
                    const msg = document.createElement('div');
                    msg.textContent = 'הקישור הועתק ללוח!';
                    msg.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#4caf50;color:white;padding:12px 24px;border-radius:8px;z-index:9999;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
                    document.body.appendChild(msg);
                    setTimeout(() => msg.remove(), 3000);
                }).catch(err => {
                    prompt('העתק את הקישור:', shareURL);
                });
            }
        });
    }

    // ------------------- ייצוא לקובץ Word / Google Docs -------------------
    const exportDocButton = document.getElementById('export-doc');
    if (exportDocButton) {
        exportDocButton.addEventListener('click', function() {
            if (!printContent || !printContent.innerHTML.trim()) {
                alert('יש להכין תצוגה מקדימה לפני הייצוא');
                return;
            }
            
            const fontFamily = fontFamilySelect ? fontFamilySelect.value : "'Alef', sans-serif";
            const fontSize = fontSizeRange ? fontSizeRange.value + 'px' : '16px';
            
            const htmlContent = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>משניות לעילוי נשמת ${localStorage.getItem('niftarName') || ''}</title>
<style>
body { font-family: ${fontFamily}; font-size: ${fontSize}; direction: rtl; line-height: 1.8; padding: 40px; }
h1, h2, h3 { color: #333; text-align: center; }
.letter-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 8px; }
.letter-heading { font-size: 1.2em; font-weight: bold; color: #3f51b5; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
.mishnayot-item, .tehillim-item { margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px; }
.mishnah-title, .tehillim-title { font-weight: bold; color: #3f51b5; margin-bottom: 5px; }
.mishnah-content, .tehillim-content { line-height: 1.8; }
.commentary-content { margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 5px; }
.commentary-title { font-weight: bold; color: #666; }
.neshamah-note, .name-header { text-align: center; }
.prayer-content { line-height: 1.8; }
.source-note { text-align: center; margin-top: 30px; color: #999; font-size: 0.8em; }
</style>
</head>
<body>
${printContent.innerHTML}
</body>
</html>`;
            
            const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `משניות_לעילוי_נשמת_${(localStorage.getItem('niftarName') || 'דף_לימוד').replace(/\s+/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            const msg = document.createElement('div');
            msg.textContent = 'הקובץ הורד! ניתן לפתוח אותו ב-Word או להעלות ל-Google Drive';
            msg.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#4caf50;color:white;padding:12px 24px;border-radius:8px;z-index:9999;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 4000);
        });
    }

});

// פונקציה להמרת מספרים לאותיות עבריות
function numberToHebrew(num) {
    if (!num || isNaN(num) || num < 1) {
        return 'א';
    }
    
    const letters = [
        '', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט',
        'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט',
        'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט',
        'ל', 'לא', 'לב', 'לג', 'לד', 'לה', 'לו', 'לז', 'לח', 'לט',
        'מ', 'מא', 'מב', 'מג', 'מד', 'מה', 'מו', 'מז', 'מח', 'מט',
        'נ', 'נא', 'נב', 'נג', 'נד', 'נה', 'נו', 'נז', 'נח', 'נט',
        'ס', 'סא', 'סב', 'סג', 'סד', 'סה', 'סו', 'סז', 'סח', 'סט',
        'ע', 'עא', 'עב', 'עג', 'עד', 'עה', 'עו', 'עז', 'עח', 'עט',
        'פ', 'פא', 'פב', 'פג', 'פד', 'פה', 'פו', 'פז', 'פח', 'פט',
        'צ', 'צא', 'צב', 'צג', 'צד', 'צה', 'צו', 'צז', 'צח', 'צט', 'ק'
    ];
    
    // הגבלה ל-100
    if (num <= 100) {
        return letters[num];
    }
    
    return num.toString();
}
