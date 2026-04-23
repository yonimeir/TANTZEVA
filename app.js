// העתקת משתנים מקומיים למשתנים גלובליים לצורך התאמה
window.mishnahIndex = typeof mishnahIndex !== 'undefined' ? mishnahIndex : window.mishnahIndex;

console.log("app.js loaded!");

// יצירת מודול מרכזי לאפליקציה
const MishnayotApp = (function() {
    // משתנים פנימיים במקום גלובליים
    const state = {
        mishnah_structure_by_seder: {},
        selectedMishnayot: [], // [{display, api, letter, isRandom?}]
        currentNiftarLetters: [], // אותיות השם לפי הסדר כולל כפילויות
        currentRequiredLettersForDisplay: [], // אותיות ייחודיות + נשמה לתצוגה בלבד
        currentDisplayRef: null, 
        mishnahStructureBuilt: false, 
        mishnahCommentaryRef: "Bartenura", 
        commentaryTitle: "ברטנורא (רע\"ב)",
        neshamahRefs: [ 
    { display: "מקואות ז:ג", api: "Mishnah_Mikvaot.7.3", letter: "נ", isRandom: true },
    { display: "מקואות ז:ד", api: "Mishnah_Mikvaot.7.4", letter: "ש", isRandom: true },
    { display: "מקואות ז:ה", api: "Mishnah_Mikvaot.7.5", letter: "מ", isRandom: true },
    { display: "מקואות ז:ו", api: "Mishnah_Mikvaot.7.6", letter: "ה", isRandom: true }
        ]
    };

// --- פונקציות עזר ---
    const numberToHebrewLetter = function(num) { 
    if (typeof num !== 'number' || num < 1) return num.toString(); 
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת'; 
    const tavValue = letters.length; 
    if (num <= tavValue) return letters[num - 1]; 
    if (num >= 21 && num <= 29) return 'כ' + letters[num - 20 - 1]; 
    if (num === 30) return 'ל'; 
    return num.toString(); 
};

    const hebrewLetterToNumber = function(letter) { 
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת'; 
    const index = letters.indexOf(letter); 
    if (index !== -1) return index + 1; 
    if (letter === 'ך') return 20; 
    if (letter === 'ם') return 40; 
    if (letter === 'ן') return 50; 
    if (letter === 'ף') return 80; 
    if (letter === 'ץ') return 90; 
    return 0; 
};

// פונקציה לקבלת אותיות לפי סדר הופעה בשם (כולל כפילויות)
    const getLettersFromNameInOrder = function(name) {
    const finalToRegularMap = {'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ'};
    const hebrewLettersRegex = /[א-ת]/g;
    const nameLettersRaw = name.match(hebrewLettersRegex) || [];
    const resultLetters = [];
    for (const rawLetter of nameLettersRaw) { 
        const letter = finalToRegularMap[rawLetter] || rawLetter; 
        resultLetters.push(letter); 
    }
    console.log("Generated letters from name in order:", resultLetters);
    return resultLetters;
};

// פונקציה לקבלת אותיות ייחודיות וממוינות + נשמה (רק לתצוגה)
    const getUniqueLettersFromNameForDisplay = function(name) {
    const finalToRegularMap = {'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ'};
    const hebrewLettersRegex = /[א-ת]/g;
    const nameLettersRaw = name.match(hebrewLettersRegex) || [];
    const uniqueLettersSet = new Set();
    for (const rawLetter of nameLettersRaw) { 
        const letter = finalToRegularMap[rawLetter] || rawLetter; 
        uniqueLettersSet.add(letter); 
    }
    const neshamahLetters = "נשמה";
    for (const letter of neshamahLetters) { 
        uniqueLettersSet.add(letter); 
    }
    const uniqueLettersArray = Array.from(uniqueLettersSet);
        uniqueLettersArray.sort((a, b) => hebrewLetterToNumber(a) - hebrewLetterToNumber(b));
    console.log("Generated unique sorted letters + Neshamah (for display):", uniqueLettersArray);
    return uniqueLettersArray;
};

// --- פונקציות הצגת משנה ---
    const fetchAndDisplayMishnah = async function(apiRef) {
        // בדיקת תקינות הפרמטר
        if (!apiRef) {
            if (UIManager) UIManager.showError("לא ניתן להציג משנה: חסר מזהה API");
            return;
        }
        
        state.currentDisplayRef = apiRef;
    const displayElement = document.getElementById('mishnah-display');
    const tehillimElement = document.getElementById('tehillim-display');
    const displayArea = document.querySelector('.content-display-area');
        
        if (!displayElement || !tehillimElement) {
            console.error("חסרים אלמנטי תצוגה בדף");
            if (UIManager) UIManager.showError("חסרים אלמנטי תצוגה בדף");
            return;
        }
        
        if (displayArea) {
    displayArea.style.display = 'block';
        }
        
    displayElement.style.display = 'block';
    tehillimElement.style.display = 'none';
        displayElement.innerHTML = '<div class="loading">טוען משנה...</div>';
        
    const showCommentary = document.getElementById('show-bartenura-checkbox')?.checked;
    const apiRefFormatted = apiRef.replace(/ /g, '_');
    const mainTextUrl = `https://www.sefaria.org/api/texts/${apiRefFormatted}?context=0&commentary=0`;
        console.log(`Fetching Mishnah: ${mainTextUrl}`);
        
    try {
            let dataMishnah = null;
            let fetchError = null;
            
            try {
        const responseMishnah = await fetch(mainTextUrl);
                
                if (responseMishnah.ok) {
                    dataMishnah = await responseMishnah.json();
                } else {
                    // ניסיון לחפש בכתובת חלופית (ללא תחילית Mishnah_)
            const fallbackRef = apiRef.replace('Mishnah_', '').replace(/ /g, '_');
            const fallbackUrl = `https://www.sefaria.org/api/texts/${fallbackRef}?context=0&commentary=0`;
            console.log(`Retrying fetch for: ${fallbackUrl}`);
                    
            const responseFallback = await fetch(fallbackUrl);
                    
                    if (responseFallback.ok) {
            dataMishnah = await responseFallback.json();
        } else {
                        fetchError = `שגיאה ${responseMishnah.status}/${responseFallback.status} בקבלת מידע מספריא`;
                    }
                }
            } catch (networkError) {
                fetchError = `שגיאת רשת: ${networkError.message}`;
                console.error(fetchError, networkError);
            }
            
            if (fetchError) {
                displayElement.innerHTML = `<div class="error">${fetchError}</div>`;
                if (UIManager) UIManager.showError(fetchError);
                return;
            }
            
            // עיבוד התוכן
        let mishnahHtml = '';
            
        if (dataMishnah && dataMishnah.he) {
            if (Array.isArray(dataMishnah.he)) {
                if (dataMishnah.he.length > 0) mishnahHtml = dataMishnah.he.join('<br>');
            } else if (typeof dataMishnah.he === 'string') {
                mishnahHtml = dataMishnah.he;
            }
        }
            
            if (!mishnahHtml) {
                mishnahHtml = `<p><i>לא נמצא טקסט משנה עבור ${apiRefFormatted} בספריה.</i></p>`;
            }
            
        let commentaryHtml = '';
            
        if (showCommentary) {
                const commentaryRef = `${state.mishnahCommentaryRef}_on_${apiRefFormatted}`;
            const commentaryUrl = `https://www.sefaria.org/api/texts/${commentaryRef}?context=0&commentary=0`;
                console.log(`Fetching ${state.mishnahCommentaryRef}: ${commentaryUrl}`);
                
            try {
                const responseCommentary = await fetch(commentaryUrl);
                    
                if (responseCommentary.ok) {
                    const dataCommentary = await responseCommentary.json();
                        console.log(`Sefaria ${state.mishnahCommentaryRef} response:`, dataCommentary);
                        
                    if (dataCommentary && dataCommentary.he) {
                        let commentaryText = '';
                            
                        if (Array.isArray(dataCommentary.he)) {
                            if (dataCommentary.he.length > 0) commentaryText = dataCommentary.he.join('<br>');
                        } else if (typeof dataCommentary.he === 'string') {
                            commentaryText = dataCommentary.he;
                        }
                            
                            if(commentaryText) {
                                commentaryHtml = `<div class="commentary-text"><strong>${state.commentaryTitle}:</strong><br>${commentaryText}</div>`;
                } else {
                                commentaryHtml = `<div class="commentary-text"><strong>${state.commentaryTitle}:</strong> (טקסט ריק התקבל)</div>`;
                            }
                        } else {
                            commentaryHtml = `<div class="commentary-text"><strong>${state.commentaryTitle}:</strong> (לא זמין בספריה)</div>`;
                        }
                    } else {
                        console.log(`${state.mishnahCommentaryRef} fetch failed: ${responseCommentary.status}`);
                        commentaryHtml = `<div class="commentary-text"><strong>${state.commentaryTitle}:</strong> (לא זמין - ${responseCommentary.status})</div>`;
                }
            } catch (commentaryError) {
                    console.error(`Error fetching ${state.mishnahCommentaryRef}:`, commentaryError);
                    commentaryHtml = `<div class="commentary-text"><strong>${state.commentaryTitle}:</strong> (שגיאה בטעינה)</div>`;
            }
        }
            
            // הצגת התוצאות בממשק
            displayElement.innerHTML = `<div class="mishnah-content">${mishnahHtml}</div>${commentaryHtml}`;
            
    } catch (error) {
            console.error("Error in fetchAndDisplayMishnah:", error);
            displayElement.innerHTML = `<div class="error">שגיאה כללית בטעינת המשנה: ${error.message}</div>`;
            if (UIManager) UIManager.showError(`שגיאה בטעינת המשנה: ${error.message}`);
    }
};

// --- פונקציות הקשורות לשמירת בחירות (localStorage) ---
    const loadSelectedMishnayot = function() {
        const data = StorageManager.load('selectedMishnayotForNiftar', []);
        
        // וידוא תקינות הנתונים שנטענו
        state.selectedMishnayot = Array.isArray(data) ? 
            data.filter(item => item && item.api !== undefined && item.display && item.letter !== undefined) : 
            [];
        
        displaySelectedMishnayot();
        return state.selectedMishnayot;
    };

    const saveSelectedMishnayot = function() {
        const success = StorageManager.save('selectedMishnayotForNiftar', state.selectedMishnayot);
        
        if (!success && UIManager) {
            UIManager.showError("אירעה שגיאה בשמירת הבחירות. ייתכן שנפח האחסון המקומי מלא.");
        }
        
        return success;
    };

    const displaySelectedMishnayot = function() {
    const listElement = document.getElementById('selected-mishnayot-list');
    if (!listElement) return;

        if (!state.selectedMishnayot || state.selectedMishnayot.length === 0) {
        listElement.innerHTML = '<li>(עדיין לא נבחרו/הוגרלו משניות)</li>';
        return;
    }

    listElement.innerHTML = '';
        state.selectedMishnayot.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="selected-mishnah-letter">${item.letter}</span>
                <a href="#" onclick="event.preventDefault(); MishnayotApp.fetchAndDisplayMishnah('${item.api}');">${item.display}</a>
            ${item.isRandom ? 
                    `<button onclick="MishnayotApp.replaceRandomMishnah('${item.letter}', ${index})" title="החלף משנה זו">החלף</button>` : 
                    `<button onclick="MishnayotApp.removeMishnahSelection(${index})" title="הסר משנה זו">X</button>`}
        `;
        listElement.appendChild(li);
    });
    };

    // --- פונקציות חיפוש וניווט ---
    const searchByLetter = function(selectedLetter) {
        console.log(`Searching for letter: ${selectedLetter}`);
        const selectedLetterDisplay = document.getElementById('selected-letter-display');
        if(selectedLetterDisplay) selectedLetterDisplay.textContent = selectedLetter;
        
        const displayArea = document.querySelector('.content-display-area');
        if (displayArea) displayArea.style.display = 'none';
        
        state.currentDisplayRef = null;
        
        // בדיקה האם המידע זמין
        if (typeof window.mishnahIndex === 'undefined' || 
            typeof window.masechetIdToDisplayName === 'undefined' || 
            typeof window.masechetIdToApiName === 'undefined') {
            
            if (UIManager) UIManager.showError("לא נטענו נתוני מבנה המשניות");
            document.getElementById('results-list').innerHTML = '<li>לא נטענו נתוני מבנה המשניות.</li>';
            return;
        }
        
        const resultsByMasechet = {};
        
        // חיפוש לפי mishnahIndex (שיטת חיפוש חדשה)
        for (const entry of window.mishnahIndex) {
            if (Array.isArray(entry) && entry.length === 4 && entry[3] === selectedLetter) {
                const masechetId = String(entry[0]);
                const perekNum = entry[1];
                const mishnahNum = entry[2];
                
                const displayName = window.masechetIdToDisplayName[masechetId];
                const apiName = window.masechetIdToApiName[masechetId];
                
                if (displayName && apiName) {
                    const shortDisplayName = displayName.startsWith("משנה ") ? 
                        displayName.substring(4) : 
                        (displayName === 'משנה אבות' ? 'אבות' : displayName);
                    
                    const displayRef = `${shortDisplayName} ${numberToHebrewLetter(perekNum)}:${numberToHebrewLetter(mishnahNum)}`;
                    const apiRef = `${apiName.replace(/ /g, '_')}.${perekNum}.${mishnahNum}`;
                    
                    if (!resultsByMasechet[masechetId]) {
                        resultsByMasechet[masechetId] = { 
                            id: masechetId, 
                            name: shortDisplayName, 
                            mishnayot: [] 
                        };
                    }
                    
                    resultsByMasechet[masechetId].mishnayot.push({ 
                        display: displayRef, 
                        api: apiRef 
                    });
                }
            }
        }
        
        displayGroupedResults(resultsByMasechet);
    };
    
    // פונקציה להצגת תוצאות מקובצות
    const displayGroupedResults = function(resultsByMasechet) {
        const resultsListElement = document.getElementById('results-list');
        if (!resultsListElement) return;
        
        resultsListElement.innerHTML = '';
        
        const masechetIds = Object.keys(resultsByMasechet).map(id => parseInt(id, 10));
        
        if (masechetIds.length === 0) {
            resultsListElement.innerHTML = '<li>לא נמצאו משניות המתחילות באות זו.</li>';
            return;
        }
        
        masechetIds.sort((a, b) => a - b);
        
        masechetIds.forEach(masechetId => {
            const masechetIdStr = String(masechetId);
            const group = resultsByMasechet[masechetIdStr];
            
            const groupContainer = document.createElement('div');
            groupContainer.className = 'masechet-group';
            
            const heading = document.createElement('h3');
            heading.textContent = `${group.name} (${group.mishnayot.length})`;
            
            const toggleIcon = document.createElement('span');
            toggleIcon.textContent = ' [+]';
            toggleIcon.style.cursor = 'pointer';
            heading.appendChild(toggleIcon);
            
            const ul = document.createElement('ul');
            ul.className = 'mishnayot-in-group';
            ul.style.display = 'none';
            
            heading.onclick = () => {
                const isHidden = ul.style.display === 'none';
                ul.style.display = isHidden ? 'block' : 'none';
                toggleIcon.textContent = isHidden ? ' [-]' : ' [+]';
            };
            
            groupContainer.appendChild(heading);
            
            group.mishnayot.forEach(mishnah => {
                const listItem = document.createElement('li');
                
                const selectButton = document.createElement('button');
                selectButton.textContent = '+';
                selectButton.title = 'בחר לע"נ (ידני)';
                selectButton.className = 'select-mishnah-button';
                selectButton.onclick = () => selectMishnah(mishnah.api, mishnah.display);
                
                listItem.appendChild(selectButton);
                
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = mishnah.display;
                link.onclick = (e) => {
                    e.preventDefault();
                    fetchAndDisplayMishnah(mishnah.api);
                };
                
                listItem.appendChild(link);
                ul.appendChild(listItem);
            });
            
            groupContainer.appendChild(ul);
            resultsListElement.appendChild(groupContainer);
        });
    };
    
    // בחירת משנה לרשימה
    const selectMishnah = function(apiRef, displayRef) { 
        let firstLetter = '?'; 
        
        if (displayRef) { 
            const parts = displayRef.split(':'); 
            
            if (parts.length > 1) { 
                const lastPartLetters = parts[parts.length - 1].match(/[א-ת]/); 
                if (lastPartLetters) firstLetter = lastPartLetters[0]; 
            } else { 
                const first = displayRef.trim().match(/[א-ת]/); 
                if(first) firstLetter = first[0]; 
            } 
        }
        
        const exists = state.selectedMishnayot.some(item => item.api === apiRef);
        
        if (!exists) {
            state.selectedMishnayot.push({ 
                display: displayRef, 
                api: apiRef, 
                letter: firstLetter, 
                isRandom: false 
            }); 
            
            saveSelectedMishnayot();
            displaySelectedMishnayot(); 
            console.log("Added to selection manually:", displayRef);
        } else { 
            console.log("Already selected:", displayRef); 
            if (UIManager) UIManager.showError("משנה זו כבר נבחרה");
            else alert("משנה זו כבר נבחרה."); 
        }
    };
    
    // הסרת משנה מהרשימה
    const removeMishnahSelection = function(indexToRemove) { 
        if (indexToRemove >= 0 && indexToRemove < state.selectedMishnayot.length) { 
            const removed = state.selectedMishnayot.splice(indexToRemove, 1); 
            console.log("Removed from selection:", removed[0]?.display); 
            saveSelectedMishnayot(); 
            displaySelectedMishnayot(); 
        } 
    };

    // --- פונקציות הקשורות לשם הנפטר ומשניות רנדומליות ---
    const processNameAndSuggestLetters = function() {
    const nameInput = document.getElementById('niftar-name');
    const lettersDisplay = document.getElementById('letters-to-learn');
    const randomButton = document.getElementById('random-select-button');
        
    if (!nameInput || !lettersDisplay || !randomButton) return;

    const name = nameInput.value.trim();
    if (!name) {
        lettersDisplay.textContent = '';
            state.currentNiftarLetters = [];
            state.currentRequiredLettersForDisplay = [];
        randomButton.style.display = 'none';
        return;
    }

        state.currentNiftarLetters = getLettersFromNameInOrder(name);
        state.currentRequiredLettersForDisplay = getUniqueLettersFromNameForDisplay(name);

        lettersDisplay.textContent = state.currentRequiredLettersForDisplay.join(', ');
    randomButton.style.display = 'inline-block';
    };
    
    // הגרלת משניות לפי שם נפטר
    const randomlySelectMishnayotForNiftar = function() {
        if (state.currentNiftarLetters.length === 0) {
            if (UIManager) UIManager.showError("אנא הכנס שם נפטר ולחץ 'הצג אותיות' תחילה.");
            else alert("אנא הכנס שם נפטר ולחץ 'הצג אותיות' תחילה.");
        return;
    }
        
        if (state.selectedMishnayot.length > 0) {
            const confirmReplace = UIManager ? 
                confirm("פעולה זו תמחק את המשניות שנבחרו כעת ותגריל חדשות לפי אותיות השם + נשמה. להמשיך?") :
                confirm("פעולה זו תמחק את המשניות שנבחרו כעת ותגריל חדשות לפי אותיות השם + נשמה. להמשיך?");
                
            if (!confirmReplace) return;
        }
        
        randomlySelectMishnayot(state.currentNiftarLetters);
    };
    
    // הפעלת בחירה אקראית של משניות
    const randomlySelectMishnayot = function(lettersFromName) {
     console.log("Starting random selection for letters from name:", lettersFromName);
        
        if (typeof window.mishnahIndex === 'undefined' || 
            typeof window.masechetIdToDisplayName === 'undefined' || 
            typeof window.masechetIdToApiName === 'undefined') {
            
            if (UIManager) UIManager.showError("לא נטענו נתוני מבנה המשניות");
            return;
        }
        
        // איפוס רשימה קודמת
        const newSelection = [];
        const usedApiRefs = new Set();
        const notFoundLetters = [];
        
    // שלב 1: בחר משנה לכל אות מהשם (כולל כפילויות)
    for (const letter of lettersFromName) {
        const candidates = [];
            
            for (const entry of window.mishnahIndex) {
             if (Array.isArray(entry) && entry.length === 4 && entry[3] === letter) {
                    const apiRef = `${window.masechetIdToApiName[String(entry[0])].replace(/ /g, '_')}.${entry[1]}.${entry[2]}`;
                    
                 if (!usedApiRefs.has(apiRef)) { 
                     const masechetIdStr = String(entry[0]);
                        const displayName = window.masechetIdToDisplayName[masechetIdStr];
                        const apiName = window.masechetIdToApiName[masechetIdStr];
                        
                     if (displayName && apiName) {
                            const shortDisplayName = displayName.startsWith("משנה ") ? 
                                displayName.substring(4) : 
                                (displayName === 'משנה אבות' ? 'אבות' : displayName);
                                
                            const displayRef = `${shortDisplayName} ${numberToHebrewLetter(entry[1])}:${numberToHebrewLetter(entry[2])}`;
                            candidates.push({ 
                                display: displayRef, 
                                api: apiRef, 
                                letter: letter, 
                                isRandom: true 
                            });
                    }
                 }
             }
        }

        if (candidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const chosen = candidates[randomIndex];
            newSelection.push(chosen);
            usedApiRefs.add(chosen.api); 
        } else {
            console.warn(`No available/unused Mishnayot found starting with letter: ${letter}`);
            notFoundLetters.push(letter);
                newSelection.push({ 
                    display: `(לא נמצאה משנה לאות ${letter})`, 
                    api: null, 
                    letter: letter, 
                    isRandom: true 
                });
        }
    }

     // שלב 2: הוסף את משניות נשמה ממקואות
     console.log("Adding Neshamah Mishnayot (Mikvaot 7:3-6)");
        
        state.neshamahRefs.forEach(refInfo => {
         if (!usedApiRefs.has(refInfo.api)) { 
                newSelection.push({...refInfo}); // העתקת האובייקט
             usedApiRefs.add(refInfo.api);
            } else { 
                console.log(`Neshamah mishnah ${refInfo.display} already selected.`); 
            }
        });
        
        // שמירת התוצאות
        state.selectedMishnayot = newSelection;
        saveSelectedMishnayot();
        displaySelectedMishnayot();
        
        console.log("Random selection complete. Final list:", state.selectedMishnayot);
        
        if (notFoundLetters.length > 0) {
            if (UIManager) UIManager.showError(`שים לב: לא נמצאו משניות עבור האותיות הבאות מהשם: ${notFoundLetters.join(', ')}`);
            else alert(`שים לב: לא נמצאו משניות עבור האותיות הבאות מהשם: ${notFoundLetters.join(', ')}`);
        }
        
        // עדכון הממשק
        const displayArea = document.querySelector('.content-display-area'); 
        if (displayArea) displayArea.style.display = 'none'; 
        state.currentDisplayRef = null;
    };
    
    // החלפת משנה אקראית ברשימה
    const replaceRandomMishnah = function(letterToReplace, indexInSelection) {
     console.log(`Replacing mishnah for letter: ${letterToReplace} at index ${indexInSelection}`);
        
        if (typeof window.mishnahIndex === 'undefined') {
            if (UIManager) UIManager.showError("לא נטענו נתוני מבנה המשניות");
            return;
        }
        
        const currentSelection = state.selectedMishnayot[indexInSelection];
        
     // צור רשימה של ה-apiRef של המשניות שכבר נבחרו כרגע, למעט זו שמוחלפת
        const currentlySelectedApiRefs = new Set(
            state.selectedMishnayot
                .map(m => m.api)
                .filter((api, i) => i !== indexInSelection)
        );
        
        const isSpecificNeshamah = state.neshamahRefs.some(ref => ref.api === currentSelection.api);

    const candidates = [];
        
    // חפש מועמדים חלופיים לאותה אות
        for (const entry of window.mishnahIndex) {
        if (Array.isArray(entry) && entry.length === 4 && entry[3] === letterToReplace) {
                const apiRef = `${window.masechetIdToApiName[String(entry[0])].replace(/ /g, '_')}.${entry[1]}.${entry[2]}`;
                
            // ודא שהמועמד אינו המשנה הנוכחית וגם לא אחת אחרת שכבר נבחרה
            if (apiRef !== currentSelection.api && !currentlySelectedApiRefs.has(apiRef)) {
                 // אם זו משנת נשמה, אל תציע משנות נשמה אחרות כהחלפה אקראית
                    if (!isSpecificNeshamah || !state.neshamahRefs.some(ref => ref.api === apiRef)) {
                     const masechetIdStr = String(entry[0]);
                        const displayName = window.masechetIdToDisplayName[masechetIdStr];
                        
                     if (displayName) {
                            const shortDisplayName = displayName.startsWith("משנה ") ? 
                                displayName.substring(4) : 
                                (displayName === 'משנה אבות' ? 'אבות' : displayName);
                                
                            const displayRef = `${shortDisplayName} ${numberToHebrewLetter(entry[1])}:${numberToHebrewLetter(entry[2])}`;
                            candidates.push({ 
                                display: displayRef, 
                                api: apiRef, 
                                letter: letterToReplace, 
                                isRandom: true 
                            });
                     }
                 }
            }
        }
    }
    
    if (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const newMishnah = candidates[randomIndex];
            state.selectedMishnayot[indexInSelection] = newMishnah;
            saveSelectedMishnayot();
            displaySelectedMishnayot();
            
            // הצג שוב את המשנה שנבחרה
            fetchAndDisplayMishnah(newMishnah.api);
    } else {
            if (UIManager) UIManager.showError(`לא נמצאו משניות *נוספות וזמינות* המתחילות באות ${letterToReplace} להחלפה.`);
            else alert(`לא נמצאו משניות *נוספות וזמינות* המתחילות באות ${letterToReplace} להחלפה.`);
            
            if (currentSelection && currentSelection.api) fetchAndDisplayMishnah(currentSelection.api);
        }
    };
    
    // הצגת משניות נשמה
    const displayNeshamahMishnayot = function() {
        console.log("Displaying Neshamah Mishnayot");
        const resultsListElement = document.getElementById('results-list');
        if (!resultsListElement) return;
        
        resultsListElement.innerHTML = '<h3>משניות נשמה (מקואות פרק ז, משניות ג-ו):</h3><ul class="neshamah-list"></ul>';
        const neshamahList = resultsListElement.querySelector('.neshamah-list');
        
        if (!neshamahList) return;
        
        state.neshamahRefs.forEach(refInfo => {
            const listItem = document.createElement('li');
            
            const selectButton = document.createElement('button');
            selectButton.textContent = '+';
            selectButton.title = 'בחר לע"נ';
            selectButton.className = 'select-mishnah-button';
            selectButton.onclick = () => selectMishnah(refInfo.api, refInfo.display);
            
            listItem.appendChild(selectButton);
            
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = `${refInfo.display} (אות ${refInfo.letter})`;
            link.onclick = (e) => {
                e.preventDefault();
                fetchAndDisplayMishnah(refInfo.api);
            };
            
            listItem.appendChild(link);
            neshamahList.appendChild(listItem);
        });
        
        const selectedLetterDisplay = document.getElementById('selected-letter-display');
        if (selectedLetterDisplay) selectedLetterDisplay.textContent = 'נשמה';
    };
    
    // הצגת תהילים לפי אותיות
    const displayTehillimByLetters = function(letters) {
        if (!Array.isArray(letters) || letters.length === 0) {
            if (UIManager) UIManager.showError("לא התקבלו אותיות להצגת תהילים");
            return;
        }
        
        console.log("Displaying Tehillim for letters:", letters);
        
        if (typeof window.tehillim119 === 'undefined') {
            if (UIManager) UIManager.showError("לא נטענו נתוני תהילים 119");
            return;
        }
        
        const displayElement = document.getElementById('mishnah-display');
        const tehillimElement = document.getElementById('tehillim-display');
        const displayArea = document.querySelector('.content-display-area');
        
        if (!displayElement || !tehillimElement) {
            console.error("חסרים אלמנטי תצוגה בדף");
            if (UIManager) UIManager.showError("חסרים אלמנטי תצוגה בדף");
            return;
        }
        
        if (displayArea) {
            displayArea.style.display = 'block';
        }
        
        displayElement.style.display = 'none';
        tehillimElement.style.display = 'block';
        
        let tehillimContent = '';
        const uniqueLetters = [...new Set(letters)];
        
        uniqueLetters.forEach(letter => {
            const verses = window.tehillim119[letter];
            
            if (verses && verses.length > 0) {
                tehillimContent += `<h4 class="tehillim-letter">אות ${letter}</h4>\n`;
                
                verses.forEach(verse => {
                    const verseNum = parseInt(verse.verse.split(':')[1], 10);
                    tehillimContent += `<p><span class="verse-num">${verseNum}</span> ${verse.text}</p>\n`;
                });
            }
        });
        
        if (tehillimContent) {
            tehillimElement.innerHTML = tehillimContent;
    } else {
            tehillimElement.innerHTML = '<p>לא נמצאו פסוקי תהילים מתאימים לאותיות שהוזנו.</p>';
        }
    };
    
    // הצגת כל המשניות בש"ס
    const displayAllShasMishnayot = function() {
        console.log("Displaying all Shas Mishnayot");
        
        // בדיקת זמינות נתונים
        if (!state.mishnahStructureBuilt) {
            buildSederStructure();
        }
        
        if (!state.mishnahStructureBuilt) {
            if (UIManager) UIManager.showError("לא נטענו נתוני מבנה המשניות");
        return;
        }
        
        const resultsListElement = document.getElementById('results-list');
        if (!resultsListElement) return;
        
        resultsListElement.innerHTML = '';
        
    // סדרים לפי סדר קלאסי
    const sederOrder = [
        "סדר זרעים", "סדר מועד", "סדר נשים", "סדר נזיקין", "סדר קדשים", "סדר טהרות"
    ];
        
    sederOrder.forEach(sederName => {
            const sederData = state.mishnah_structure_by_seder[sederName];
        if (!sederData || sederData.length === 0) return;
            
        // כותרת סדר
        const sederDiv = document.createElement('div');
        sederDiv.className = 'seder-group';
            
        const sederHeading = document.createElement('h2');
        sederHeading.textContent = sederName;
        sederDiv.appendChild(sederHeading);
            
        // עבור כל מסכת בסדר
        sederData.forEach(masechetData => {
            const masechetDiv = document.createElement('div');
            masechetDiv.className = 'masechet-group';
                
            const masechetHeading = document.createElement('h3');
            masechetHeading.textContent = masechetData.heName;
            masechetDiv.appendChild(masechetHeading);
                
            if (!masechetData.lengths) return;
                
            // עבור כל פרק
            masechetData.lengths.forEach((numMishnayot, perekIdx) => {
                const perekNum = perekIdx + 1;
                const perekDiv = document.createElement('div');
                perekDiv.className = 'perek-group';
                    
                const perekTitle = document.createElement('h4');
                    perekTitle.textContent = `פרק ${numberToHebrewLetter(perekNum)}`;
                perekDiv.appendChild(perekTitle);
                    
                const ul = document.createElement('ul');
                    
                for (let mishnahNum = 1; mishnahNum <= numMishnayot; mishnahNum++) {
                    const li = document.createElement('li');
                    const apiRef = `${masechetData.apiName.replace(/ /g, '_')}.${perekNum}.${mishnahNum}`;
                        
                    const link = document.createElement('a');
                    link.href = '#';
                        link.textContent = `משנה ${numberToHebrewLetter(mishnahNum)}`;
                    link.onclick = (e) => {
                        e.preventDefault();
                            fetchAndDisplayMishnah(apiRef);
                    };
                        
                    li.appendChild(link);
                    ul.appendChild(li);
                }
                    
                perekDiv.appendChild(ul);
                masechetDiv.appendChild(perekDiv);
            });
                
            sederDiv.appendChild(masechetDiv);
        });
            
        resultsListElement.appendChild(sederDiv);
    });
};
    
    // בניית מבנה הסדרים
    const buildSederStructure = function() {
        if (typeof window.masechetIdToDisplayName === 'undefined' || 
            typeof window.masechetIdToApiName === 'undefined' || 
            typeof window.mishnah_structure === 'undefined') {
            
            console.error("Missing data files required for building structure");
            return false;
        }
        
    const sedarim = {
        "סדר זרעים": { start: 1, end: 11 },
        "סדר מועד": { start: 12, end: 23 },
        "סדר נשים": { start: 24, end: 30 },
        "סדר נזיקין": { start: 31, end: 40 },
        "סדר קדשים": { start: 41, end: 51 },
        "סדר טהרות": { start: 52, end: 63 }
    };
        
        state.mishnah_structure_by_seder = {};
        
    for (const [sederName, range] of Object.entries(sedarim)) {
            state.mishnah_structure_by_seder[sederName] = [];
            
        for (let id = range.start; id <= range.end; id++) {
            const idStr = String(id);
                const heName = window.masechetIdToDisplayName[idStr];
                const apiName = window.masechetIdToApiName[idStr];
                const lengths = window.mishnah_structure[apiName];
                
            if (heName && apiName && lengths) {
                    const shortHeName = heName.startsWith("משנה ") ? 
                        heName.substring(4) : 
                        (heName === 'משנה אבות' ? 'אבות' : heName);
                        
                    state.mishnah_structure_by_seder[sederName].push({
                    id: id,
                    heName: shortHeName,
                    apiName: apiName,
                    lengths: lengths
                });
            } else {
                console.warn(`Missing data for Masechet ID ${idStr} while building structure.`);
            }
        }
    }
        
        state.mishnahStructureBuilt = true;
    console.log("Seder structure built.");
        return true;
    };
    
    // הרענון משנה נוכחית (כאשר משנים את הגדרות התצוגה)
    const refreshCurrentMishnah = function() {
        if (state.currentDisplayRef) {
            fetchAndDisplayMishnah(state.currentDisplayRef);
        }
    };

    // חושף את הפונקציות הנדרשות לשימוש גלובלי
    return {
        // מצב
        getState: function() {
            return state;
        },
        
        // פונקציות עזר
        numberToHebrewLetter,
        hebrewLetterToNumber,
        getLettersFromNameInOrder,
        getUniqueLettersFromNameForDisplay,
        
        // פונקציות תצוגה
        fetchAndDisplayMishnah,
        refreshCurrentMishnah,
        
        // פונקציות localStorage
        loadSelectedMishnayot,
        saveSelectedMishnayot,
        displaySelectedMishnayot,
        
        // פונקציות חיפוש וניווט
        searchByLetter,
        displayGroupedResults,
        displayAllShasMishnayot,
        
        // פונקציות לטיפול ברשימת משניות
        selectMishnah,
        removeMishnahSelection,
        
        // פונקציות הקשורות לשם הנפטר
        processNameAndSuggestLetters,
        randomlySelectMishnayotForNiftar,
        replaceRandomMishnah,
        
        // פונקציות תהילים ומשניות נשמה
        displayTehillimByLetters,
        displayNeshamahMishnayot,
        
        // אתחול
        init: function() {
            // בניית מבנה הסדרים
            buildSederStructure();
            
            // טעינת משניות שנבחרו בעבר
            this.loadSelectedMishnayot();
            
            console.log("MishnayotApp initialized");
        }
    };
})();

// הוספת מודול לטיפול בשגיאות והודעות
const UIManager = (function() {
    // פונקציה להצגת שגיאות בממשק
    const showError = function(message, duration = 5000) {
        const errorElement = document.getElementById('error-message');
        if (!errorElement) return false;
        
        errorElement.textContent = message;
        errorElement.classList.add('show');
        errorElement.style.display = 'block';
        
        // הסתרת ההודעה אחרי זמן מוגדר
        if (duration > 0) {
            setTimeout(() => {
                errorElement.classList.remove('show');
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 300);
            }, duration);
        }
        
        return true;
    };
    
    // פונקציה להסרת הודעת שגיאה
    const clearError = function() {
        const errorElement = document.getElementById('error-message');
        if (!errorElement) return false;
        
        errorElement.classList.remove('show');
        errorElement.style.display = 'none';
        
        return true;
    };
    
    // התקנת מאזיני אירועים
    const setupEventListeners = function() {
        // התקנת מאזיני אירועים לכפתורי אותיות
        const letterButtons = document.querySelectorAll('.letter-button');
        letterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const letter = this.getAttribute('data-letter');
                if (letter) MishnayotApp.searchByLetter(letter);
            });
        });
        
        // התקנת מאזין אירועים לכפתור עיבוד שם
        const processNameButton = document.getElementById('process-name-button');
        if (processNameButton) {
            processNameButton.addEventListener('click', function() {
                MishnayotApp.processNameAndSuggestLetters();
            });
        }
        
        // התקנת מאזין אירועים לכפתור הגרלה
        const randomSelectButton = document.getElementById('random-select-button');
        if (randomSelectButton) {
            randomSelectButton.addEventListener('click', function() {
                MishnayotApp.randomlySelectMishnayotForNiftar();
            });
        }
        
        // התקנת מאזין אירועים לכפתור הצגת תהילים
        const showTehillimButton = document.getElementById('show-tehillim-button');
        if (showTehillimButton) {
            showTehillimButton.addEventListener('click', function() {
                if (MishnayotApp.getState().currentNiftarLetters.length > 0) {
                    MishnayotApp.displayTehillimByLetters(MishnayotApp.getState().currentNiftarLetters);
                } else {
                    showError('אנא הזן שם נפטר ולחץ על \'הצג אותיות\' תחילה');
                }
            });
        }
        
        // התקנת מאזין אירועים לכפתור הצגת משניות נשמה
        const neshamahButton = document.getElementById('neshamah-button');
        if (neshamahButton) {
            neshamahButton.addEventListener('click', function() {
                MishnayotApp.displayNeshamahMishnayot();
            });
        }
        
        // התקנת מאזין אירועים לכפתור הצגת כל המשניות בש"ס
        const allShasButton = document.getElementById('all-shas-button');
        if (allShasButton) {
            allShasButton.addEventListener('click', function() {
                MishnayotApp.displayAllShasMishnayot();
            });
        }
        
        // התקנת מאזין אירועים לכפתור אישור החלפה
        const confirmReplacementButton = document.getElementById('confirm-replacement-button');
        if (confirmReplacementButton) {
            confirmReplacementButton.addEventListener('click', function() {
                MishnayotApp.performActiveReplacement();
            });
        }
        
        // התקנת מאזין אירועים לתיבת הסימון של פירוש רע"ב
        const showBartenuraCheckbox = document.getElementById('show-bartenura-checkbox');
        if (showBartenuraCheckbox) {
            showBartenuraCheckbox.addEventListener('change', function() {
                MishnayotApp.refreshCurrentMishnah();
            });
        }
    };
    
    // חשיפת הפונקציות הציבוריות
    return {
        showError,
        clearError,
        setupEventListeners,
        
        // אתחול המודול
        init: function() {
            this.setupEventListeners();
        }
    };
})();

// עדכון קוד האתחול הראשי
document.addEventListener('DOMContentLoaded', () => {
    // אתחול מנהל הממשק
    UIManager.init();
    
    // אתחול האפליקציה
    MishnayotApp.init();
    
    console.log("Application initialized");
});

// מודול לטיפול באחסון מקומי
const StorageManager = (function() {
    // בדיקה האם localStorage זמין
    const isLocalStorageAvailable = function() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    };
    
    // פונקציה לשמירת נתונים ב-localStorage
    const saveData = function(key, data) {
        if (!isLocalStorageAvailable()) {
            console.error("localStorage אינו זמין במכשיר זה");
            return false;
        }
        
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (e) {
            console.error(`שגיאה בשמירת נתונים ב-localStorage`, e);
            return false;
        }
    };
    
    // פונקציה לטעינת נתונים מ-localStorage
    const loadData = function(key, defaultValue = null) {
        if (!isLocalStorageAvailable()) {
            console.error("localStorage אינו זמין במכשיר זה");
            return defaultValue;
        }
        
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            
            return JSON.parse(serializedData);
        } catch (e) {
            console.error(`שגיאה בטעינת נתונים מ-localStorage`, e);
            return defaultValue;
        }
    };
    
    // פונקציה למחיקת נתונים מ-localStorage
    const removeData = function(key) {
        if (!isLocalStorageAvailable()) {
            console.error("localStorage אינו זמין במכשיר זה");
            return false;
        }
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`שגיאה במחיקת נתונים מ-localStorage`, e);
            return false;
        }
    };
    
    // חשיפת הפונקציות הציבוריות
    return {
        isAvailable: isLocalStorageAvailable,
        save: saveData,
        load: loadData,
        remove: removeData
    };
})();

// הוספת המשתנים למרחב הגלובלי
window.masechetIdToDisplayName = masechetIdToDisplayName;
window.masechetIdToApiName = masechetIdToApiName;
window.mishnah_structure = mishnah_structure;