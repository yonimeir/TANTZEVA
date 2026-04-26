// Removed duplicate masechetIdToDisplayName and masechetIdToApiName declarations
// They are sourced directly from mishnah_mappings.js

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

    // טעינת נתונים מהלוקל סטורג'
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
    
    // אירוע לחזרה לעמוד הראשי
    if (closePreviewButton) {
        closePreviewButton.addEventListener('click', function() {
            window.location.href = 'index.html';
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
                            // מציאת משניות שמתאימות לאות זו (תמיכה גם בגרסה ישנה של m.letter)
                            const letterMishnayot = selectedMishnayot.filter(m => m.letterIndex === i || m.letter === letter);
                            
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
                            const letterVerses = selectedTehillimVerses.filter(v => v.letterIndex === i || v.letter === letter);
                            
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
                
                // הצגת התצוגה המקדימה
                if (printPreview) printPreview.style.display = 'block';
            } catch (error) {
                console.error("שגיאה בטעינת תוכן משניות:", error);
                printContent.innerHTML = '<div class="error-message" style="color: red; text-align: center; padding: 20px;">אירעה שגיאה בטעינת המשניות. אנא נסה שוב מאוחר יותר.</div>';
            }
        });
    // הפעל אוטומטית בעליית העמוד
    setTimeout(() => {
        if (generatePreviewButton) {
            generatePreviewButton.click();
        }
    }, 100);
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
