// שלד JS לדף לע"נ
// יצירת גרסה נקייה ללא כפילויות

window.runNiftarApp = function(passedIndexData) {
    console.log('runNiftarApp called. Type of passedIndexData:', typeof passedIndexData);

    let mishnahIndex; // משתנה מקומי שיחזיק את נתוני האינדקס

    // בדיקה אם הנתונים שהועברו תקינים
    if (passedIndexData && Array.isArray(passedIndexData)) {
        mishnahIndex = passedIndexData;
        console.log(`runNiftarApp: Successfully received mishnah index. Length: ${mishnahIndex.length}`);
    } else {
        console.error("runNiftarApp: CRITICAL ERROR: Invalid or null index data received.");
        // ננסה להציג שגיאה למשתמש, גם אם ה-DOM לא מוכן לגמרי
        // נגדיר פונקציית שגיאה מינימלית למקרה שshowError לא זמין עדיין
        const basicShowError = (msg) => {
            try {
                const errorEl = document.getElementById('error-message');
                if (errorEl) {
                    errorEl.textContent = msg;
                    errorEl.style.display = 'block';
                    errorEl.className = 'error-message';
                } else {
                    alert(msg); // Fallback to alert
                    console.error("Cannot find error element, fallback alert:", msg);
                }
            } catch (e) {
                 alert(msg); // Ultimate fallback
                 console.error("Error in basicShowError:", e, "Original message:", msg);
            }
        };
        // נפעיל את הודעת השגיאה ב-DOMContentLoaded כדי לוודא שהאלמנט קיים
        document.addEventListener('DOMContentLoaded', function() {
             basicShowError("שגיאה קריטית: נתוני אינדקס המשניות לא הועברו כראוי לאפליקציה.");
        });
        return; // עצירת המשך האתחול
    }

    function runWhenDomReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    runWhenDomReady(function() {
        console.log("runNiftarApp - DOM ready.");

        // ------------------- DOM Element References -------------------
        const niftarNameInput = document.getElementById('niftar-name');
        const submitNameButton = document.getElementById('submit-name') || document.getElementById('process-name-button');
        const selectRandomButton = document.getElementById('select-random') || document.getElementById('random-select-button');
        const copySelectedButton = document.getElementById('copy-selected');
        const clearSelectionButton = document.getElementById('clear-selection') || document.getElementById('clear-selections-button');
        const letterBoxesContainer = document.getElementById('letter-boxes');
        const mishnayotDisplay = document.getElementById('mishnayot-display') || document.getElementById('mishnah-display');
        const selectedMishnayotList = document.getElementById('selected-mishnayot-list');
        const errorMessage = document.getElementById('error-message'); // חשוב להגדיר לפני showError
        const modal = document.getElementById('mishnah-modal');
        const modalLetterSpan = document.getElementById('modal-letter');
        const modalMishnahList = document.getElementById('modal-mishnah-list');
        const modalPreviewTitle = document.getElementById('modal-preview-title');
        const modalPreviewText = document.getElementById('modal-preview-text');
        const modalPreviewCommentary = document.getElementById('modal-preview-commentary');
        const closeModalButton = modal ? modal.querySelector('.close-modal') : null;
        const modalConfirmButton = document.getElementById('modal-confirm-selection') || document.getElementById('select-mishna-button');
        const nameLettersDisplay = document.getElementById('name-letters-display');
        const processedNameElement = document.getElementById('processed-name');
        const alphabetButtonsContainer = document.getElementById('alphabet-buttons');
        //const randomSelectButton = document.getElementById('random-select-button'); // Already defined
        const addNeshamahButton = document.getElementById('add-neshamah-button');
        const preparePrintButton = document.getElementById('prepare-print-button');
        const contentDisplayArea = document.querySelector('.mishnah-preview');
        const mishnayotModal = document.getElementById('mishnah-modal');
        // const modalMishnayotList = document.getElementById('modal-mishnah-list'); // Already defined
        const modalLetter = document.getElementById('modal-letter');
        const closeModal = modal ? modal.querySelector('.close-modal') : null;
        const showBartenuraCheckbox = document.getElementById('show-bartenura-checkbox');
        const modalPreview = document.getElementById('modal-preview');
        const modalPreviewContent = document.getElementById('modal-preview-content');


        // ------------------- Utility Functions (like showError) -------------------
        function showError(message) {
             if (errorMessage) {
                 errorMessage.textContent = message;
                 errorMessage.style.display = 'block';
                 errorMessage.className = 'error-message'; // ודא שהסגנון נכון
                 setTimeout(() => {
                     errorMessage.style.display = 'none';
                 }, 5000);
             } else {
                 console.error("Error display element not found, message:", message);
             }
         }
        // Function showSuccess needs to be defined here as well if used
        function showSuccess(message) {
            if (errorMessage) { // Reusing error message element for success
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
                errorMessage.className = 'success-message'; // Apply success style
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000);
            } else {
                console.log("Success message:", message);
            }
        }


        // אין צורך בבלוק בדיקת טעינת אינדקס כאן - הוא טופל למעלה

        // ------------------- Global State Variables (within this scope) ---------
        let currentNiftarName = '';
        let currentNiftarLetters = [];
        let currentNiftarLettersOrdered = [];
        let currentSelectedMishnayot = [];
        let currentModalLetterForReplacement = '';
        let currentModalLetterIndex = -1;
        let currentSelectedMishnahInModal = null;

        // ------------------- Mappings (can stay here) ------------------------
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

        // ------------------- All Other Functions -------------------------
        // (initPage, loadSavedData, convertFinalLetters, processNameAndShow, 
        // renderLetterBoxes, renderAlphabetButtons, openMishnayotModal, 
        // selectMishnahFromModal, selectRandomMishnayot, addNeshamahMishnayot,
        // clearSelections, navigateToPrintPage, renderSelectedMishnayotList,
        // removeMishnah, saveMishnayotToLocalStorage, closeModalFunc, 
        // convertToHebrewLetter, fetchAndDisplayMishnah, displayMishnah, 
        // fetchAndDisplayMishnahInModal, displayMishnahInModal, saveToLocalStorage)
        // יש להעביר את כל הפונקציות הללו לכאן, הן ישתמשו במשתנה mishnahIndex מהסקופ החיצוני

        function initPage() {
            console.log(`initPage: Using mishnahIndex with ${mishnahIndex.length} entries.`);
            loadSavedData();
        }

        function loadSavedData() {
            const savedName = localStorage.getItem('niftarName');
            const savedLetters = localStorage.getItem('niftarLetters');
            const savedLettersOrdered = localStorage.getItem('niftarLettersOrdered');
            
            if (savedName) {
                currentNiftarName = savedName;
                niftarNameInput.value = savedName;
            }
            
            if (savedLetters) {
                currentNiftarLetters = savedLetters.split('');
            }
            
            if (savedLettersOrdered) {
                currentNiftarLettersOrdered = savedLettersOrdered.split('');
            }
            
            try {
                const savedMishnayot = localStorage.getItem('selectedMishnayot');
                if (savedMishnayot) {
                    currentSelectedMishnayot = JSON.parse(savedMishnayot);
                }
            } catch (e) {
                console.error('שגיאה בטעינת משניות שמורות:', e);
            }
            
            if (savedName && savedLettersOrdered) { // Check ordered letters for rendering boxes
                processedNameElement.textContent = savedName;
                nameLettersDisplay.style.display = 'block';
                renderLetterBoxes();
                renderSelectedMishnayotList();
            }
        }

        function convertFinalLetters(letter) {
             switch (letter) {
                 case 'ך': return 'כ';
                 case 'ם': return 'מ';
                 case 'ן': return 'נ';
                 case 'ף': return 'פ';
                 case 'ץ': return 'צ';
                 default: return letter;
             }
        }

        function processNameAndShow() {
            const name = niftarNameInput.value.trim();

            if (!name) {
                showError('אנא הכנס שם נפטר');
                return;
            }

            const isNewName = name !== currentNiftarName;
            console.log(`Processing name: "${name}". Is new name? ${isNewName}`);

            if (isNewName) {
                console.log("New name detected. Resetting selected Mishnayot.");
                currentSelectedMishnayot = [];
                saveMishnayotToLocalStorage();
                console.log("Selected Mishnayot reset. Current value:", JSON.stringify(currentSelectedMishnayot));
                mishnayotDisplay.innerHTML = '';
                contentDisplayArea.style.display = 'none';
            }

            currentNiftarName = name;

            const uniqueLetters = [];
            const orderedLetters = [];
            
            for (let i = 0; i < name.length; i++) {
                const letter = name[i];
                if (/^[\u0590-\u05FF]$/.test(letter)) { // Test for Hebrew letters only
                    const normalizedLetter = convertFinalLetters(letter);
                    orderedLetters.push(normalizedLetter);
                    if (!uniqueLetters.includes(normalizedLetter)) {
                        uniqueLetters.push(normalizedLetter);
                    }
                }
            }
            
            uniqueLetters.sort();
            
            currentNiftarLetters = uniqueLetters;
            currentNiftarLettersOrdered = orderedLetters;
            
            localStorage.setItem('niftarName', name);
            localStorage.setItem('niftarLetters', uniqueLetters.join(''));
            localStorage.setItem('niftarLettersOrdered', orderedLetters.join(''));
            
            processedNameElement.textContent = name;
            nameLettersDisplay.style.display = 'block';
            
            renderLetterBoxes();
            renderSelectedMishnayotList();
        }

        function renderLetterBoxes() {
            letterBoxesContainer.innerHTML = '';
            if (currentNiftarLettersOrdered.length === 0) return;
            console.log("Rendering letter boxes. Ordered:", JSON.stringify(currentNiftarLettersOrdered), "Selected:", JSON.stringify(currentSelectedMishnayot));

            for (let i = 0; i < currentNiftarLettersOrdered.length; i++) {
                const letter = currentNiftarLettersOrdered[i];
                const letterBox = document.createElement('div');
                letterBox.className = 'letter-box';
                letterBox.dataset.letterIndex = i;
                letterBox.dataset.letter = letter;
                const selectedMishnah = currentSelectedMishnayot.find(m => m.letterIndex === i);
                console.log(`Box ${i}, letter '${letter}'. Found:`, selectedMishnah ? JSON.stringify(selectedMishnah) : 'None');

                const removeButtonHTML = `<button class="remove-letter" title="הסר אות">&times;</button>`;
                if (selectedMishnah) {
                    letterBox.classList.add('selected');
                    let masechetName = masechetIdToDisplayName[selectedMishnah.masechetId] || `מסכת ${selectedMishnah.masechetId}`;
                    if (masechetName.length > 12) masechetName = masechetName.substring(0, 12) + '...';
                    const hebrewPerek = convertToHebrewLetter(selectedMishnah.perekNum);
                    const hebrewMishnah = convertToHebrewLetter(selectedMishnah.mishnahNum);
                    letterBox.innerHTML = `
                        <div class="letter">${letter}</div>
                        <div class="mishnah-info">
                            ${masechetName}
                            <div>פרק ${hebrewPerek}, משנה ${hebrewMishnah}</div>
                        </div>
                        <div class="letter-box-actions" aria-label="פעולות למשנה שנבחרה">
                            <button type="button" class="letter-action-button view-button" title="הצג משנה">הצג</button>
                            <button type="button" class="letter-action-button replace-button" title="החלף משנה">החלף</button>
                            <button type="button" class="letter-action-button remove-button" title="הסר משנה">הסר</button>
                        </div>
                        ${removeButtonHTML}
                    `;
                } else {
                    letterBox.innerHTML = `
                        <div class="letter">${letter}</div>
                        <div class="mishnah-info">לחץ לבחירת משנה</div>
                        ${removeButtonHTML}
                    `;
                }

                const removeButton = letterBox.querySelector('.remove-letter');
                if (removeButton) {
                    removeButton.addEventListener('click', function(event) {
                        event.stopPropagation();
                        removeMishnah(i);
                        currentNiftarLettersOrdered.splice(i, 1);
                        localStorage.setItem('niftarLettersOrdered', currentNiftarLettersOrdered.join(''));
                        const letterStillExists = currentNiftarLettersOrdered.includes(letter);
                        if (!letterStillExists) {
                            const indexInUnique = currentNiftarLetters.indexOf(letter);
                            if (indexInUnique !== -1) {
                                currentNiftarLetters.splice(indexInUnique, 1);
                                localStorage.setItem('niftarLetters', currentNiftarLetters.join(''));
                            }
                        }
                        renderLetterBoxes(); 
                        renderSelectedMishnayotList();
                    });
                }

                const viewActionButton = letterBox.querySelector('.letter-action-button.view-button');
                const replaceActionButton = letterBox.querySelector('.letter-action-button.replace-button');
                const removeActionButton = letterBox.querySelector('.letter-action-button.remove-button');
                if (selectedMishnah && viewActionButton) {
                    viewActionButton.addEventListener('click', function(event) {
                        event.stopPropagation();
                        fetchAndDisplayMishnah(selectedMishnah.masechetId, selectedMishnah.perekNum, selectedMishnah.mishnahNum);
                        contentDisplayArea.style.display = 'block';
                        contentDisplayArea.scrollIntoView({ behavior: 'smooth' });
                    });
                }
                if (selectedMishnah && replaceActionButton) {
                    replaceActionButton.addEventListener('click', function(event) {
                        event.stopPropagation();
                        openMishnayotModal(letter, i);
                    });
                }
                if (selectedMishnah && removeActionButton) {
                    removeActionButton.addEventListener('click', function(event) {
                        event.stopPropagation();
                        removeMishnah(i);
                        renderLetterBoxes();
                        renderSelectedMishnayotList();
                    });
                }

                letterBox.addEventListener('click', function() {
                    const letterIndex = parseInt(this.dataset.letterIndex);
                    const currentMishnah = currentSelectedMishnayot.find(m => m.letterIndex === letterIndex);
                    if (currentMishnah) {
                        fetchAndDisplayMishnah(currentMishnah.masechetId, currentMishnah.perekNum, currentMishnah.mishnahNum);
                        contentDisplayArea.style.display = 'block';
                    } else {
                        openMishnayotModal(letter, letterIndex);
                    }
                });
                letterBoxesContainer.appendChild(letterBox);
            }

            if (currentSelectedMishnayot.length > 0) {
                const lastMishnah = currentSelectedMishnayot.sort((a,b)=>a.letterIndex - b.letterIndex)[currentSelectedMishnayot.length - 1];
                 if(lastMishnah) fetchAndDisplayMishnah(lastMishnah.masechetId, lastMishnah.perekNum, lastMishnah.mishnahNum);
                contentDisplayArea.style.display = 'block';
            } else {
                contentDisplayArea.style.display = 'none';
            }
            renderAlphabetButtons();
        }

        function renderAlphabetButtons() {
            alphabetButtonsContainer.innerHTML = '';
            const hebrewAlphabet = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
            for (const letter of hebrewAlphabet) {
                const button = document.createElement('button');
                button.className = 'alphabet-button';
                button.textContent = letter;
                // if (currentNiftarLetters.includes(letter)) { // Maybe highlight based on ordered letters?
                //     button.classList.add('active');
                // }
                button.addEventListener('click', function() {
                    // Simplified: just add the letter to the end
                     if (!currentNiftarName) {
                        showError("יש להזין שם נפטר תחילה");
                        return;
                    }
                    currentNiftarLettersOrdered.push(letter);
                     if (!currentNiftarLetters.includes(letter)) {
                        currentNiftarLetters.push(letter);
                        currentNiftarLetters.sort();
                        localStorage.setItem('niftarLetters', currentNiftarLetters.join(''));
                    }
                    localStorage.setItem('niftarLettersOrdered', currentNiftarLettersOrdered.join(''));
                    renderLetterBoxes();
                });
                alphabetButtonsContainer.appendChild(button);
            }
        }

       function openMishnayotModal(letter, letterIndex) {
            console.log(`Opening modal for letter '${letter}' at index ${letterIndex}`);
            if (!modal || !modalLetterSpan || !modalMishnahList || !modalPreviewTitle || !modalPreviewText) {
                console.error('Missing modal elements:', {
                    modal,
                    modalLetterSpan,
                    modalMishnahList,
                    modalPreviewTitle,
                    modalPreviewText,
                    modalPreviewCommentary
                });
                showError('שגיאה בפתיחת חלון בחירת המשנה. נסה לרענן את הדף.');
                return;
            }
            currentModalLetterForReplacement = letter;
            currentModalLetterIndex = letterIndex;
            modalLetterSpan.textContent = letter;
            modalMishnahList.innerHTML = '';
            modalPreviewTitle.textContent = 'בחרו משנה מהרשימה';
            modalPreviewText.innerHTML = '';
            if (modalPreviewCommentary) {
                modalPreviewCommentary.innerHTML = '';
            }
            currentSelectedMishnahInModal = null;
            if (modalConfirmButton) modalConfirmButton.disabled = true;

            const mishnayotForLetter = mishnahIndex.filter(m => m[3] === letter);
            if(mishnayotForLetter.length === 0) {
                 modalMishnahList.innerHTML = '<div class="no-results">לא נמצאו משניות לאות זו</div>';
                 return;
            }

            // Group by Masechet for better display
            const grouped = mishnayotForLetter.reduce((acc, m) => {
                const masechetId = m[0];
                if (!acc[masechetId]) {
                    acc[masechetId] = [];
                }
                acc[masechetId].push(m);
                return acc;
            }, {});

            for (const masechetId in grouped) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'masechet-group';

                const header = document.createElement('div');
                header.className = 'masechet-header';
                const masechetName = masechetIdToDisplayName[masechetId] || `מסכת ${masechetId}`;
                header.innerHTML = `
                    <span class="expand-icon">+</span>
                    <span class="masechet-name">${masechetName}</span>
                    <span class="masechet-count">(${grouped[masechetId].length})</span>
                `;
                
                const content = document.createElement('div');
                content.className = 'masechet-content';
                content.style.display = 'none'; // Start collapsed

                header.addEventListener('click', () => {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    header.querySelector('.expand-icon').textContent = isHidden ? '−' : '+';
                });

                grouped[masechetId].forEach(mishnah => {
                    const [ , perekNum, mishnahNum] = mishnah;
                    const mishnayaElement = document.createElement('div');
                    mishnayaElement.className = 'mishnah-list-item'; // Changed class name
                    mishnayaElement.dataset.masechetId = masechetId;
                    mishnayaElement.dataset.perekNum = perekNum;
                    mishnayaElement.dataset.mishnahNum = mishnahNum;
                    const hebrewPerek = convertToHebrewLetter(perekNum);
                    const hebrewMishnah = convertToHebrewLetter(mishnahNum);
                    mishnayaElement.innerHTML = `<strong>פרק ${hebrewPerek} משנה ${hebrewMishnah}</strong>`;

                    mishnayaElement.addEventListener('click', function() {
                        document.querySelectorAll('.mishnah-list-item').forEach(item => item.classList.remove('selected'));
                        this.classList.add('selected');
                        currentSelectedMishnahInModal = {
                            masechetId: masechetId,
                            perekNum: perekNum,
                            mishnahNum: mishnahNum,
                            letterIndex: letterIndex // Keep original letter index
                        };
                        fetchAndDisplayMishnahInModal(masechetId, perekNum, mishnahNum);
                        if (modalConfirmButton) modalConfirmButton.disabled = false;
                    });
                    content.appendChild(mishnayaElement);
                });
                groupDiv.appendChild(header);
                groupDiv.appendChild(content);
                modalMishnahList.appendChild(groupDiv);
            }
            modal.style.display = 'block';
        }


        function selectMishnahFromModal() {
            if (!currentSelectedMishnahInModal) {
                showError('לא נבחרה משנה');
                return;
            }
            const existingIndex = currentSelectedMishnayot.findIndex(m => m.letterIndex === currentModalLetterIndex);
            if (existingIndex !== -1) {
                currentSelectedMishnayot[existingIndex] = currentSelectedMishnahInModal;
            } else {
                currentSelectedMishnayot.push(currentSelectedMishnahInModal);
            }
            saveMishnayotToLocalStorage();
            renderLetterBoxes();
            renderSelectedMishnayotList();
            closeModalFunc();
            const { masechetId, perekNum, mishnahNum } = currentSelectedMishnahInModal;
            fetchAndDisplayMishnah(masechetId, perekNum, mishnahNum);
            contentDisplayArea.style.display = 'block';
        }

       function selectRandomMishnayot() {
            if (currentNiftarLettersOrdered.length === 0) {
                showError('לא נבחרו אותיות');
                return;
            }
            console.log("Starting random selection...");
            let newSelectedMishnayot = [];
            for (let i = 0; i < currentNiftarLettersOrdered.length; i++) {
                const letter = currentNiftarLettersOrdered[i];
                const mishnayotForLetter = mishnahIndex.filter(m => m[3] === letter);
                if (mishnayotForLetter.length > 0) {
                    const randomIndex = Math.floor(Math.random() * mishnayotForLetter.length);
                    const selectedMishnahData = mishnayotForLetter[randomIndex];
                    const mishnahObject = {
                        masechetId: selectedMishnahData[0],
                        perekNum: selectedMishnahData[1],
                        mishnahNum: selectedMishnahData[2],
                        letterIndex: i
                    };
                    newSelectedMishnayot.push(mishnahObject);
                } else {
                     console.warn(`[Random Select] No mishnayot found for letter '${letter}' (index ${i})`);
                     // Keep placeholder if no mishnah found?
                     // Or remove the letter? For now, just skip.
                }
            }
            currentSelectedMishnayot = newSelectedMishnayot;
            console.log("[Random Select] Final selected mishnayot array:", JSON.stringify(currentSelectedMishnayot));
            saveMishnayotToLocalStorage();
            renderLetterBoxes();
            renderSelectedMishnayotList();
            showSuccess('נבחרו משניות אקראיות');
            console.log("Finished random selection.");
        }

        function addNeshamahMishnayot() {
            const neshamahLetters = ['נ', 'ש', 'מ', 'ה'];
            const masechetIdNeshamah = "57"; // מקוואות
            const perekNumNeshamah = 7;
            const startMishnahNumNeshamah = 4;

             if (!currentNiftarName) {
                showError("יש להזין שם נפטר תחילה");
                return;
            }

            // Find mishnayot for נשמה
            const neshamahMishnayotData = [];
            for (let i = 0; i < neshamahLetters.length; i++) {
                const mishnahNum = startMishnahNumNeshamah + i;
                const mishnahData = mishnahIndex.find(m => 
                    m[0] === masechetIdNeshamah && 
                    m[1] === perekNumNeshamah && 
                    m[2] === mishnahNum &&
                    m[3] === neshamahLetters[i] // Ensure letter matches
                );
                if(mishnahData) {
                    neshamahMishnayotData.push(mishnahData);
                } else {
                    console.warn(`Could not find Neshamah mishnah data for letter ${neshamahLetters[i]}`);
                     showError(`לא נמצאה משנה מתאימה במאגר לאות ${neshamahLetters[i]} של נשמה.`);
                     return; // Stop if any mishnah is missing
                }
            }

            // Add letters and mishnayot
             let currentLength = currentNiftarLettersOrdered.length;
             neshamahLetters.forEach((letter, index) => {
                 currentNiftarLettersOrdered.push(letter);
                 const newLetterIndex = currentLength + index;
                 const mishnahToAdd = {
                     masechetId: neshamahMishnayotData[index][0],
                     perekNum: neshamahMishnayotData[index][1],
                     mishnahNum: neshamahMishnayotData[index][2],
                     letterIndex: newLetterIndex
                 };
                  // Avoid duplicates for the same letter index
                  const existingIndex = currentSelectedMishnayot.findIndex(m => m.letterIndex === newLetterIndex);
                  if (existingIndex === -1) {
                     currentSelectedMishnayot.push(mishnahToAdd);
                  }
                 // Add to unique letters if needed
                 if (!currentNiftarLetters.includes(letter)) {
                     currentNiftarLetters.push(letter);
                 }
             });

            currentNiftarLetters.sort();
            localStorage.setItem('niftarLetters', currentNiftarLetters.join(''));
            localStorage.setItem('niftarLettersOrdered', currentNiftarLettersOrdered.join(''));
            saveMishnayotToLocalStorage();
            renderLetterBoxes();
            renderSelectedMishnayotList();
            showSuccess("נוספו משניות נשמ\"ה ממסכת מקוואות (פ\"ז מ\"ד-ז')");
        }

        function clearSelections() {
            currentSelectedMishnayot = [];
            saveMishnayotToLocalStorage();
            renderLetterBoxes();
            renderSelectedMishnayotList();
            contentDisplayArea.style.display = 'none';
            mishnayotDisplay.innerHTML = ''; // Clear preview too
            showSuccess('נוקו כל הבחירות');
        }

        function navigateToPrintPage() {
            if (currentSelectedMishnayot.length === 0) {
                showError('לא נבחרו משניות להדפסה');
                return;
            }
            // Data is already in localStorage, print.html will read it
            window.location.href = 'print.html';
        }

        function renderSelectedMishnayotList() {
            if (!selectedMishnayotList) {
                if (copySelectedButton) {
                    copySelectedButton.style.display = currentSelectedMishnayot.length > 0 ? 'inline-block' : 'none';
                }
                return;
            }
            selectedMishnayotList.innerHTML = ''; // Clear previous list/table
            if (currentSelectedMishnayot.length === 0) {
                selectedMishnayotList.innerHTML = '<div class="empty-message">טרם נבחרו משניות</div>';
                if (copySelectedButton) copySelectedButton.style.display = 'none'; // Hide copy button
                return;
            }
             if (copySelectedButton) copySelectedButton.style.display = 'inline-block'; // Show copy button

            console.log("Rendering list. Selected:", JSON.stringify(currentSelectedMishnayot), "Ordered Letters:", JSON.stringify(currentNiftarLettersOrdered));

            // Create table structure
            const table = document.createElement('table');
            table.className = 'selected-mishnayot-table';
            const thead = table.createTHead();
            const tbody = table.createTBody();
            const headerRow = thead.insertRow();
            headerRow.innerHTML = '<th>אות</th><th>מסכת</th><th>פרק</th><th>משנה</th><th>פעולות</th>';

            const sortedMishnayot = [...currentSelectedMishnayot].sort((a, b) => a.letterIndex - b.letterIndex);

            for (const mishnah of sortedMishnayot) {
                const row = tbody.insertRow();
                const letter = currentNiftarLettersOrdered[mishnah.letterIndex];
                 if (!letter) {
                    console.error(`Could not find letter for index ${mishnah.letterIndex} in currentNiftarLettersOrdered!`);
                     // Skip rendering this row if letter is missing?
                     continue; 
                }
                console.log(`List item ${mishnah.letterIndex}, letter '${letter}'. Details:`, JSON.stringify(mishnah));

                const hebrewPerek = convertToHebrewLetter(mishnah.perekNum);
                const hebrewMishnah = convertToHebrewLetter(mishnah.mishnahNum);
                const masechetName = masechetIdToDisplayName[mishnah.masechetId] || `מסכת ${mishnah.masechetId}`;

                row.innerHTML = `
                    <td>${letter}</td>
                    <td>${masechetName}</td>
                    <td>${hebrewPerek}</td>
                    <td>${hebrewMishnah}</td>
                    <td>
                        <button class="action-button view-button" title="הצג משנה">הצג</button>
                        <button class="action-button replace-button" title="החלף משנה">החלף</button>
                        <button class="action-button remove-button" title="הסר משנה">הסר</button>
                    </td>
                `;

                const viewButton = row.querySelector('.view-button');
                const replaceButton = row.querySelector('.replace-button');
                const removeButton = row.querySelector('.remove-button');

                viewButton.addEventListener('click', () => {
                    fetchAndDisplayMishnah(mishnah.masechetId, mishnah.perekNum, mishnah.mishnahNum);
                    contentDisplayArea.style.display = 'block';
                    contentDisplayArea.scrollIntoView({ behavior: 'smooth' });
                });

                replaceButton.addEventListener('click', () => {
                    openMishnayotModal(letter, mishnah.letterIndex);
                });

                removeButton.addEventListener('click', () => {
                    removeMishnah(mishnah.letterIndex);
                    renderLetterBoxes();
                    renderSelectedMishnayotList();
                });
            }
             selectedMishnayotList.appendChild(table);
        }

        function removeMishnah(letterIndex) {
            const index = currentSelectedMishnayot.findIndex(m => m.letterIndex === letterIndex);
            if (index !== -1) {
                currentSelectedMishnayot.splice(index, 1);
                saveMishnayotToLocalStorage();
                // Refresh the main display if the removed mishnah was the last one shown?
                 if (currentSelectedMishnayot.length === 0) {
                     contentDisplayArea.style.display = 'none';
                     mishnayotDisplay.innerHTML = '';
                 }
            }
        }

        function saveMishnayotToLocalStorage() {
            try {
                localStorage.setItem('selectedMishnayot', JSON.stringify(currentSelectedMishnayot));
            } catch (e) {
                console.error('שגיאה בשמירת משניות ללוקל סטורג\':', e);
                showError('שגיאה בשמירת הבחירות');
            }
        }

        function closeModalFunc() {
            if(modal) modal.style.display = 'none';
            currentSelectedMishnahInModal = null;
            if (modalPreviewContent) modalPreviewContent.style.display = 'none';
            if (modalPreviewTitle) modalPreviewTitle.textContent = 'בחרו משנה מהרשימה';
            if (modalPreviewText) modalPreviewText.innerHTML = '';
        }

         function convertToHebrewLetter(num) {
            if (num <= 0) return num.toString(); // Handle non-positive or zero
            if (num > 100) return num.toString(); // Use regular numbers for > 100

            const hebrewNumerals = {
                1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
                10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ',
                100: 'ק' // Only handle up to 100 for simplicity here
            };
             // Handle exceptions for 15 and 16
            if (num === 15) return 'טו';
            if (num === 16) return 'טז';

            let hebrew = '';
            let tempNum = num;

             if (tempNum >= 100) {
                 hebrew += hebrewNumerals[100];
                 tempNum -= 100;
             }
            if (tempNum >= 10) {
                const tens = Math.floor(tempNum / 10) * 10;
                if(tens > 0) hebrew += hebrewNumerals[tens];
                tempNum %= 10;
            }
            if (tempNum > 0) {
                hebrew += hebrewNumerals[tempNum];
            }

             // Add gershayim for single letters > 9 unless it's 10, 20 etc.
            if (hebrew.length === 1 && num > 9) {
                 //hebrew += '\''; // Single geresh
            } else if (hebrew.length > 1 && num !== 15 && num !== 16) {
                 hebrew = hebrew.slice(0, -1) + '\"' + hebrew.slice(-1); // Gershayim
            }

            return hebrew || num.toString(); // Fallback to number if conversion fails
        }

       function fetchAndDisplayMishnah(masechetId, perekNum, mishnahNum) {
            console.log(`Fetching mishnah: ${masechetId}, ${perekNum}, ${mishnahNum}`);
            mishnayotDisplay.innerHTML = ''; // Clear previous display
            contentDisplayArea.style.display = 'block'; // Ensure preview area is visible

            const masechetName = masechetIdToDisplayName[masechetId] || `מסכת ${masechetId}`;
            const hebrewPerek = convertToHebrewLetter(perekNum);
            const hebrewMishnah = convertToHebrewLetter(mishnahNum);
            const titleElement = document.createElement('h3');
            titleElement.textContent = `${masechetName}, פרק ${hebrewPerek} משנה ${hebrewMishnah}`;
            mishnayotDisplay.appendChild(titleElement);

            let mishnayaData = { text: '', commentary: '' };
            const localStorageKey = `mishnah_${masechetId}_${perekNum}_${mishnahNum}`;
            const savedMishnah = localStorage.getItem(localStorageKey);

            if (savedMishnah) {
                try {
                    const parsedData = JSON.parse(savedMishnah);
                    console.log("Found mishnah in localStorage.");
                    displayMishnah(parsedData); // Display from local storage
                    return;
                } catch (e) {
                    console.error("Error parsing localStorage data:", e);
                     localStorage.removeItem(localStorageKey); // Remove invalid data
                }
            }

            // Fetch from Sefaria API (אבות: ספריא — Mishnah_Avot לא Mishnah_Pirkei_Avot)
            let apiSlug = masechetIdToApiName[masechetId] || masechetName.replace('מסכת ', '');
            if (apiSlug === 'Pirkei_Avot') apiSlug = 'Avot';
             const mishnahUrl = `https://www.sefaria.org/api/texts/Mishnah_${apiSlug}.${perekNum}.${mishnahNum}?context=0`;
             const bartenuraUrl = `https://www.sefaria.org/api/texts/Bartenura_on_Mishnah_${apiSlug}.${perekNum}.${mishnahNum}?context=0`;

            console.log("Fetching from Sefaria API:", mishnahUrl);
            fetch(mishnahUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`Mishnah fetch failed: ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                     if (data && data.he) {
                         mishnayaData.text = Array.isArray(data.he) ? data.he.join('<br>') : data.he;
                         console.log("Mishnah text fetched successfully.");
                         if (showBartenuraCheckbox.checked) {
                              console.log("Fetching Bartenura:", bartenuraUrl);
                              return fetch(bartenuraUrl);
                         } else {
                             displayMishnah(mishnayaData);
                             saveToLocalStorage(masechetId, perekNum, mishnahNum, mishnayaData);
                             return null; // Skip Bartenura fetch
                         }
                     } else {
                         throw new Error('Invalid Sefaria API response for Mishnah');
                     }
                 })
                 .then(bartenuraResponse => {
                     if (!bartenuraResponse) return; // Bartenura wasn't fetched
                     if (!bartenuraResponse.ok) {
                          console.warn(`Bartenura fetch failed: ${bartenuraResponse.statusText}. Displaying Mishnah text only.`);
                           mishnayaData.commentary = ''; // Ensure commentary is empty
                           // Still display mishnah text and save
                           displayMishnah(mishnayaData);
                           saveToLocalStorage(masechetId, perekNum, mishnahNum, mishnayaData);
                           return; // Don't proceed with invalid Bartenura response
                     }
                     return bartenuraResponse.json();
                 })
                 .then(bartenuraData => {
                     if (!bartenuraData) return; // Came from a failed Bartenura fetch or checkbox unchecked
                     if (bartenuraData && bartenuraData.he) {
                         mishnayaData.commentary = Array.isArray(bartenuraData.he) ? bartenuraData.he.join('<br>') : bartenuraData.he;
                         console.log("Bartenura commentary fetched successfully.");
                     } else {
                         console.warn("No Bartenura commentary found or invalid format.");
                         mishnayaData.commentary = '';
                     }
                     displayMishnah(mishnayaData);
                     saveToLocalStorage(masechetId, perekNum, mishnahNum, mishnayaData);
                 })
                 .catch(error => {
                     console.error('Error in fetchAndDisplayMishnah process:', error);
                     const errorElement = document.createElement('div');
                     errorElement.className = 'error-text';
                     errorElement.textContent = `שגיאה בטעינת המשנה (${error.message}). אנא בדוק את חיבור האינטרנט ונסה שוב.`;
                     // Ensure title is still there before appending error
                     if (!mishnayotDisplay.querySelector('h3')) {
                          mishnayotDisplay.prepend(titleElement);
                     }
                     mishnayotDisplay.appendChild(errorElement);
                 });
        }

       function displayMishnah(mishnayaData) {
            // Clear previous content except title if it exists
            const existingTitle = mishnayotDisplay.querySelector('h3');
            const textElement = mishnayotDisplay.querySelector('.mishnah-text');
            const commentaryElement = mishnayotDisplay.querySelector('.bartenura-text');
            const errorElement = mishnayotDisplay.querySelector('.error-text');
            if (textElement) textElement.remove();
            if (commentaryElement) commentaryElement.remove();
            if (errorElement) errorElement.remove();

            // Display Mishnah text
            if (mishnayaData && mishnayaData.text) {
                const newTextElement = document.createElement('div');
                newTextElement.className = 'mishnah-text';
                newTextElement.innerHTML = mishnayaData.text;
                 if(existingTitle) existingTitle.after(newTextElement);
                 else mishnayotDisplay.prepend(newTextElement); // Add after title or at start
            } else {
                const noTextElement = document.createElement('div');
                noTextElement.className = 'error-text';
                noTextElement.textContent = 'לא נמצא טקסט למשנה זו.';
                 if(existingTitle) existingTitle.after(noTextElement);
                 else mishnayotDisplay.prepend(noTextElement);
            }

            // Display Bartenura if needed and available
            if (mishnayaData && mishnayaData.commentary && showBartenuraCheckbox.checked) {
                 const newCommentaryElement = document.createElement('div');
                 newCommentaryElement.className = 'bartenura-text';
                 newCommentaryElement.innerHTML = `<strong>פירוש ברטנורא:</strong><br>${mishnayaData.commentary}`;
                 mishnayotDisplay.appendChild(newCommentaryElement); // Append commentary at the end
            } else if (showBartenuraCheckbox.checked && !(mishnayaData && mishnayaData.commentary)) {
                 const noCommentaryElement = document.createElement('div');
                 noCommentaryElement.className = 'info-text';
                 noCommentaryElement.textContent = 'פירוש ברטנורא אינו זמין למשנה זו.';
                 mishnayotDisplay.appendChild(noCommentaryElement);
            }
        }

        function fetchAndDisplayMishnahInModal(masechetId, perekNum, mishnahNum) {
             modalPreviewContent.style.display = 'block';
             modalPreviewTitle.textContent = 'טוען...';
             modalPreviewText.innerHTML = '';
             if (modalConfirmButton) modalConfirmButton.disabled = true;

            const masechetName = masechetIdToDisplayName[masechetId] || `מסכת ${masechetId}`;
            const hebrewPerek = convertToHebrewLetter(perekNum);
            const hebrewMishnah = convertToHebrewLetter(mishnahNum);
            modalPreviewTitle.textContent = `${masechetName}, פ ${hebrewPerek} מ ${hebrewMishnah}`;

             const localStorageKey = `mishnah_${masechetId}_${perekNum}_${mishnahNum}`;
             const savedMishnah = localStorage.getItem(localStorageKey);
             if (savedMishnah) {
                 try {
                     const parsedData = JSON.parse(savedMishnah);
                      if (parsedData.text) { // Only display if text exists
                         displayMishnahInModal(parsedData);
                         if (modalConfirmButton) modalConfirmButton.disabled = false;
                         return;
                     } else {
                         localStorage.removeItem(localStorageKey); // Remove if no text
                     }
                 } catch (e) {
                     console.error("Error parsing localStorage data for modal:", e);
                     localStorage.removeItem(localStorageKey);
                 }
             }

            let apiSlugModal = masechetIdToApiName[masechetId] || masechetName.replace('מסכת ', '');
            if (apiSlugModal === 'Pirkei_Avot') apiSlugModal = 'Avot';
             const mishnahUrl = `https://www.sefaria.org/api/texts/Mishnah_${apiSlugModal}.${perekNum}.${mishnahNum}?context=0`;
             console.log("Fetching for modal:", mishnahUrl);
             fetch(mishnahUrl)
                 .then(response => {
                     if (!response.ok) throw new Error(`Modal fetch failed: ${response.statusText}`);
                     return response.json();
                 })
                 .then(data => {
                     let textContent = '';
                     if (data && data.he) {
                         textContent = Array.isArray(data.he) ? data.he.join('<br>') : data.he;
                     }
                     if (textContent) {
                         const mishnayaData = { text: textContent, commentary: '' };
                         displayMishnahInModal(mishnayaData);
                         saveToLocalStorage(masechetId, perekNum, mishnahNum, mishnayaData); // Save fetched text
                         if (modalConfirmButton) modalConfirmButton.disabled = false;
                     } else {
                         throw new Error('Invalid or empty Mishnah text in API response');
                     }
                 })
                 .catch(error => {
                     console.error('Error fetching from Sefaria API for modal:', error);
                     modalPreviewText.innerHTML = `<span class="error-text">שגיאה בטעינת תצוגה מקדימה (${error.message}).</span>`;
                     if (modalConfirmButton) modalConfirmButton.disabled = true;
                 });
         }

       function displayMishnahInModal(mishnayaData) {
            if (mishnayaData && mishnayaData.text) {
                modalPreviewText.innerHTML = mishnayaData.text;
            } else {
                modalPreviewText.innerHTML = '<span class="info-text">לא נמצא תוכן למשנה זו.</span>';
            }
        }

        function saveToLocalStorage(masechetId, perekNum, mishnahNum, data) {
             try {
                 const dataToStore = { text: data.text || '', commentary: data.commentary || '' };
                 const jsonData = JSON.stringify(dataToStore);
                 localStorage.setItem(`mishnah_${masechetId}_${perekNum}_${mishnahNum}`, jsonData);
             } catch (error) {
                 console.error('Error saving mishnah to local storage:', error);
                  showError('שגיאה בשמירת נתוני המשנה לדפדפן.');
             }
         }

        // ------------------- Initialization and Event Listeners -------------------
        // Add event listeners to buttons etc.
        if (submitNameButton) submitNameButton.addEventListener('click', processNameAndShow);
        if (selectRandomButton) selectRandomButton.addEventListener('click', selectRandomMishnayot);
        if (addNeshamahButton) addNeshamahButton.addEventListener('click', addNeshamahMishnayot);
        if (clearSelectionButton) clearSelectionButton.addEventListener('click', clearSelections);
        if (preparePrintButton) preparePrintButton.addEventListener('click', navigateToPrintPage);
        if (niftarNameInput) niftarNameInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') processNameAndShow();
        });
        if (closeModalButton) closeModalButton.addEventListener('click', closeModalFunc);
        if (modalConfirmButton) modalConfirmButton.addEventListener('click', selectMishnahFromModal);
        if (showBartenuraCheckbox) showBartenuraCheckbox.addEventListener('change', () => {
            // Re-render the currently displayed mishnah if one is selected
             const currentTitle = mishnayotDisplay.querySelector('h3');
             if (currentTitle && currentSelectedMishnayot.length > 0) {
                 // Find the mishnah corresponding to the title (needs parsing or better state)
                 // Simple approach: re-fetch the last selected mishnah from the list
                  const sorted = [...currentSelectedMishnayot].sort((a, b) => a.letterIndex - b.letterIndex);
                  if(sorted.length > 0) {
                      const lastMishnah = sorted[sorted.length - 1];
                      fetchAndDisplayMishnah(lastMishnah.masechetId, lastMishnah.perekNum, lastMishnah.mishnahNum);
                  }
             }
        });
        window.addEventListener('click', function(event) { // Close modal on outside click
            if (modal && event.target === modal) {
                closeModalFunc();
            }
        });
         if (copySelectedButton) {
             copySelectedButton.addEventListener('click', copySelectedMishnayotToClipboard);
         }

         const shareSelectionButton = document.getElementById('share-selection-button');
         if (shareSelectionButton) {
             shareSelectionButton.addEventListener('click', shareSelection);
         }

         function copySelectedMishnayotToClipboard() {
             if (currentSelectedMishnayot.length === 0) {
                 showError("אין משניות נבחרות להעתקה.");
                 return;
             }

             let textToCopy = `משניות לעילוי נשמת ${currentNiftarName}:

`;
             const sortedMishnayot = [...currentSelectedMishnayot].sort((a, b) => a.letterIndex - b.letterIndex);

             sortedMishnayot.forEach(mishnah => {
                 const letter = currentNiftarLettersOrdered[mishnah.letterIndex] || '?';
                 const masechetName = masechetIdToDisplayName[mishnah.masechetId] || `מסכת ${mishnah.masechetId}`;
                 const hebrewPerek = convertToHebrewLetter(mishnah.perekNum);
                 const hebrewMishnah = convertToHebrewLetter(mishnah.mishnahNum);
                 textToCopy += `${letter}) ${masechetName}, פרק ${hebrewPerek}, משנה ${hebrewMishnah}\n`;
             });

             navigator.clipboard.writeText(textToCopy)
                 .then(() => {
                     showSuccess("רשימת המשניות הועתקה ללוח.");
                 })
                 .catch(err => {
                     console.error('שגיאה בהעתקה ללוח:', err);
                     showError("שגיאה בהעתקה ללוח.");
                 });
         }


         function shareSelection() {
             if (currentSelectedMishnayot.length === 0) {
                 showError("אין משניות נבחרות לשיתוף.");
                 return;
             }
             const shareData = {
                 name: currentNiftarName,
                 letters: currentNiftarLettersOrdered.join(''),
                 mishnayot: currentSelectedMishnayot.map(m => ({
                     masechetId: m.masechetId,
                     perekNum: m.perekNum,
                     mishnahNum: m.mishnahNum,
                     letterIndex: m.letterIndex
                 }))
             };
             const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
             const shareURL = window.location.origin + window.location.pathname + '?share=' + encoded;
             
             if (navigator.share) {
                 navigator.share({
                     title: `משניות לעילוי נשמת ${currentNiftarName}`,
                     text: `דף משניות לעילוי נשמת ${currentNiftarName}`,
                     url: shareURL
                 }).catch(err => console.log('שיתוף בוטל:', err));
             } else {
                 navigator.clipboard.writeText(shareURL).then(() => {
                     showSuccess("קישור השיתוף הועתק ללוח!");
                 }).catch(() => {
                     prompt('העתק את הקישור:', shareURL);
                 });
             }
         }
         
         function loadSharedDataFromURL() {
             const params = new URLSearchParams(window.location.search);
             const sharedData = params.get('share');
             if (sharedData) {
                 try {
                     const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
                     if (decoded.name) {
                         localStorage.setItem('niftarName', decoded.name);
                         currentNiftarName = decoded.name;
                         niftarNameInput.value = decoded.name;
                     }
                     if (decoded.letters) {
                         localStorage.setItem('niftarLettersOrdered', decoded.letters);
                         currentNiftarLettersOrdered = decoded.letters.split('');
                         const uniqueArr = [...new Set(currentNiftarLettersOrdered)].sort();
                         currentNiftarLetters = uniqueArr;
                         localStorage.setItem('niftarLetters', uniqueArr.join(''));
                     }
                     if (decoded.mishnayot && Array.isArray(decoded.mishnayot)) {
                         currentSelectedMishnayot = decoded.mishnayot;
                         saveMishnayotToLocalStorage();
                     }
                     window.history.replaceState({}, '', window.location.pathname);
                     processedNameElement.textContent = currentNiftarName;
                     nameLettersDisplay.style.display = 'block';
                     renderLetterBoxes();
                     renderSelectedMishnayotList();
                     showSuccess("נטענו נתונים משותפים בהצלחה!");
                 } catch (e) {
                     console.error('שגיאה בטעינת נתונים משותפים:', e);
                 }
             }
         }

        // איתחול האפליקציה
        initPage();
        loadSharedDataFromURL();

    }); // End runWhenDomReady

}; // End of window.runNiftarApp definition