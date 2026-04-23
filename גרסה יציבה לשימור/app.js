// =============================================
// app.js - אפליקציית לימוד משניות ותהילים לע"נ
// גרסה 7 - הגרסה היציבה האחרונה לפני השינויים לאותיות כפולות וללא החלפה אקראית
// =============================================

// --- משתנים גלובליים / מצב ---
let selectedMishnayot = []; // מערך לאחסון המשניות שנבחרו/הוגרלו לע"נ [{display, api, letter}]
let currentNiftarLetters = []; // אותיות השם (ייחודיות + נשמה, סדר א"ב)
let currentDisplayRef = null; 
let mishnahStructureBuilt = false; 
const mishnahCommentaryRef = "Bartenura"; 
const commentaryTitle = "ברטנורא (רע\"ב)"; 

// --- פונקציות עזר ---

function numberToHebrewLetter(num) {
    if (typeof num !== 'number' || num < 1) return num.toString();
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת';
    const tavValue = letters.length; 
    if (num <= tavValue) return letters[num - 1];
    if (num >= 21 && num <= 29) return 'כ' + letters[num - 20 - 1]; 
    if (num === 30) return 'ל';
    return num.toString(); 
}

function hebrewLetterToNumber(letter) {
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת';
    const index = letters.indexOf(letter);
    if (index !== -1) return index + 1;
    if (letter === 'ך') return 20; 
    if (letter === 'ם') return 40;
    if (letter === 'ן') return 50;
    if (letter === 'ף') return 80;
    if (letter === 'ץ') return 90;
    return 0; 
}

// *** פונקציה מקורית: קבלת אותיות ייחודיות וממוינות + נשמה ***
function getUniqueLettersFromNameOrdered(name) {
    const finalToRegularMap = {'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ'};
    const hebrewLettersRegex = /[א-ת]/g;
    const nameLettersRaw = name.match(hebrewLettersRegex) || [];
    
    const uniqueLettersSet = new Set();

    // מעבר על אותיות השם
    for (const rawLetter of nameLettersRaw) {
        const letter = finalToRegularMap[rawLetter] || rawLetter; 
        uniqueLettersSet.add(letter);
    }

    // הוספת אותיות "נשמה"
    const neshamahLetters = "נשמה";
    for (const letter of neshamahLetters) {
        uniqueLettersSet.add(letter);
    }
    
    // המרת ה-Set למערך ומיון לפי א"ב
    const uniqueLettersArray = Array.from(uniqueLettersSet);
    uniqueLettersArray.sort((a, b) => hebrewLetterToNumber(a) - hebrewLetterToNumber(b));

    console.log("Generated unique sorted letters + Neshamah:", uniqueLettersArray);
    return uniqueLettersArray;
}

// --- פונקציות הקשורות לשמירת בחירות (localStorage) ---

function loadSelectedMishnayot() {
    const stored = localStorage.getItem('selectedMishnayotForNiftar');
    if (stored) {
        try {
            selectedMishnayot = JSON.parse(stored);
            selectedMishnayot = selectedMishnayot.filter(item => item && item.api !== undefined && item.display && item.letter);
        } catch (e) {
            console.error("Error parsing selected Mishnayot:", e);
            selectedMishnayot = [];
            localStorage.removeItem('selectedMishnayotForNiftar'); 
        }
    } else {
        selectedMishnayot = [];
    }
    displaySelectedMishnayot(); 
}

function saveSelectedMishnayot() {
    try {
        localStorage.setItem('selectedMishnayotForNiftar', JSON.stringify(selectedMishnayot));
    } catch (e) {
        console.error("Error saving selected Mishnayot:", e);
        alert("שגיאה בשמירת הבחירה.");
    }
}

// *** תצוגת הרשימה הנבחרת - עם כפתור החלפה ***
function displaySelectedMishnayot() {
    const listElement = document.getElementById('selected-mishnayot-list');
    if (!listElement) return;
    listElement.innerHTML = ''; 

    if (selectedMishnayot.length === 0) {
        listElement.innerHTML = '<li>(עדיין לא הוגרלו משניות)</li>';
        return;
    }

    selectedMishnayot.forEach((mishnah, index) => {
        const listItem = document.createElement('li');
        
        // כפתור החלפה/הגרלה מחדש
        const replaceButton = document.createElement('button');
        replaceButton.textContent = 'החלף';
        replaceButton.title = `הגרל משנה אחרת לאות ${mishnah.letter}`;
        replaceButton.className = 'replace-mishnah-button'; // עיצוב שונה מכפתור הסרה
        replaceButton.onclick = () => replaceRandomMishnah(mishnah.letter, index); // קורא לפונקציית ההחלפה
        listItem.appendChild(replaceButton);

        // טקסט המשנה (קישור להצגה)
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = `[${mishnah.letter || '?'}] ${mishnah.display}`; 
        link.onclick = (e) => {
            e.preventDefault();
            if(mishnah.api) { fetchAndDisplayMishnah(mishnah.api); } 
            else { alert("אין הפניה תקינה למשנה זו."); }
        };
        listItem.appendChild(link);

        listElement.appendChild(listItem);
    });
}

// פונקציה שמופעלת מכפתור "+ בחר לע"נ" (בחירה ידנית) - מוסיפה לרשימה הנבחרת
function selectMishnah(apiRef, displayRef) {
    let firstLetter = '?';
    // ... (לוגיקה לניחוש האות נשארת זהה) ...
    if (displayRef) { const parts = displayRef.split(':'); if (parts.length > 1) { const lastPartLetters = parts[parts.length - 1].match(/[א-ת]/); if (lastPartLetters) firstLetter = lastPartLetters[0]; } else { const first = displayRef.trim().match(/[א-ת]/); if(first) firstLetter = first[0]; } }

    const exists = selectedMishnayot.some(item => item.api === apiRef);
    if (!exists) {
        // הוספה לרשימה הקיימת (שיכולה להכיל גם בחירות אקראיות)
        selectedMishnayot.push({ display: displayRef, api: apiRef, letter: firstLetter }); 
        saveSelectedMishnayot();
        displaySelectedMishnayot(); // עדכן את התצוגה כדי לכלול את הבחירה הידנית
        console.log("Added to selection manually:", displayRef);
    } else {
        console.log("Already selected:", displayRef);
        alert("משנה זו כבר נבחרה.");
    }
}


// פונקציה להסרת משנה מהבחירה (נקראת מכפתור X אם נוסיף אותו בעתיד, כרגע אין)
function removeMishnahSelection(indexToRemove) {
     if (indexToRemove >= 0 && indexToRemove < selectedMishnayot.length) {
         const removed = selectedMishnayot.splice(indexToRemove, 1);
         console.log("Removed from selection:", removed[0]?.display);
         saveSelectedMishnayot();
         displaySelectedMishnayot();
     }
}


// פונקציה לניקוי כל הבחירה
function clearNiftarSelection() {
    if (selectedMishnayot.length > 0 && confirm("האם אתה בטוח שברצונך לנקות את כל המשניות שנבחרו/הוגרלו?")) {
        selectedMishnayot = [];
        saveSelectedMishnayot();
        displaySelectedMishnayot();
    } else if (selectedMishnayot.length === 0) {
        const nameInput = document.getElementById('niftar-name');
         const lettersDisplay = document.getElementById('letters-to-learn');
         if(nameInput) nameInput.value = '';
         if(lettersDisplay) lettersDisplay.textContent = '';
         currentNiftarLetters = [];
         const randomButton = document.getElementById('random-select-button');
         if (randomButton) randomButton.style.display = 'none'; 
    }
}

// --- פונקציות הקשורות לשם הנפטר ובחירה אקראית (עם החלפה) ---

// עדכון: קורא לפונקציית האותיות המקורית (ייחודיות וממוינות)
function processNameAndSuggestLetters() {
    const nameInput = document.getElementById('niftar-name');
    const lettersDisplay = document.getElementById('letters-to-learn');
    const randomButton = document.getElementById('random-select-button');
    if (!nameInput || !lettersDisplay || !randomButton) return;

    const name = nameInput.value.trim();
    if (!name) {
        lettersDisplay.textContent = '';
        currentNiftarLetters = [];
        randomButton.style.display = 'none'; 
        return;
    }

    // שימוש בפונקציה המקורית
    currentNiftarLetters = getUniqueLettersFromNameOrdered(name); 
    lettersDisplay.textContent = currentNiftarLetters.join(', ');
    randomButton.style.display = 'inline-block'; 
}

// הפעלת בחירה אקראית ראשונית מהכפתור
function randomlySelectMishnayotForNiftar() {
    if (currentNiftarLetters.length === 0) {
        alert("אנא הכנס שם נפטר ולחץ על 'הצג אותיות' תחילה.");
        return;
    }
    if (selectedMishnayot.length > 0 && !confirm("פעולה זו תמחק את המשניות שנבחרו כעת ותגריל חדשות. להמשיך?")) {
        return;
    }
    randomlySelectMishnayot(currentNiftarLetters);
}

// הפונקציה שמבצעת את הבחירה האקראית (עם שמירת האות)
function randomlySelectMishnayot(lettersToSelect) {
     console.log("Starting random selection for letters:", lettersToSelect);
     if (typeof mishnahIndex === 'undefined' || typeof masechetIdToDisplayName === 'undefined' || typeof masechetIdToApiName === 'undefined') {
        alert("שגיאה: נתוני האינדקס לא נטענו כראוי.");
        return;
    }

    const newSelection = [];
    let notFoundLetters = [];

    for (const letter of lettersToSelect) {
        const candidates = [];
        for (const entry of mishnahIndex) {
             if (Array.isArray(entry) && entry.length === 4 && entry[3] === letter) {
                 const masechetIdStr = String(entry[0]);
                 const displayName = masechetIdToDisplayName[masechetIdStr];
                 const apiName = masechetIdToApiName[masechetIdStr];
                 if (displayName && apiName) {
                    const shortDisplayName = displayName.startsWith("משנה ") ? displayName.substring(4) : (displayName === 'משנה אבות' ? 'אבות' : displayName);
                    const displayRef = `${shortDisplayName} ${numberToHebrewLetter(entry[1])}:${numberToHebrewLetter(entry[2])}`; 
                    const apiRef = `${apiName.replace(/ /g, '_')}.${entry[1]}.${entry[2]}`; 
                    candidates.push({ display: displayRef, api: apiRef, letter: letter }); // שמור את האות
                }
            }
        }

        if (candidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            newSelection.push(candidates[randomIndex]);
        } else {
            console.warn(`No Mishnayot found starting with letter: ${letter}`);
            notFoundLetters.push(letter);
            newSelection.push({ display: `(לא נמצאה משנה לאות ${letter})`, api: null, letter: letter }); 
        }
    }

    selectedMishnayot = newSelection;
    saveSelectedMishnayot();
    displaySelectedMishnayot();
    console.log("Random selection complete. New list:", selectedMishnayot);
    if (notFoundLetters.length > 0) {
         alert(`שיב לב: לא נמצאו משניות עבור האותיות: ${notFoundLetters.join(', ')}`);
    }
    const displayArea = document.querySelector('.content-display-area');
    if (displayArea) displayArea.style.display = 'none'; 
    currentDisplayRef = null;
}


// *** הפונקציה להחלפה אקראית חוזרת! ***
function replaceRandomMishnah(letterToReplace, indexInSelection) {
    console.log(`Replacing mishnah for letter: ${letterToReplace} at index ${indexInSelection}`);
     if (typeof mishnahIndex === 'undefined') return;

    const candidates = [];
    for (const entry of mishnahIndex) {
        if (entry[3] === letterToReplace) {
            const masechetIdStr = String(entry[0]);
            const displayName = masechetIdToDisplayName[masechetIdStr];
            const apiName = masechetIdToApiName[masechetIdStr];
            if (displayName && apiName) {
                const shortDisplayName = displayName.startsWith("משנה ") ? displayName.substring(4) : (displayName === 'משנה אבות' ? 'אבות' : displayName);
                const displayRef = `${shortDisplayName} ${numberToHebrewLetter(entry[1])}:${numberToHebrewLetter(entry[2])}`; 
                const apiRef = `${apiName.replace(/ /g, '_')}.${entry[1]}.${entry[2]}`; 
                candidates.push({ display: displayRef, api: apiRef, letter: letterToReplace });
            }
        }
    }

    const currentApiRef = selectedMishnayot[indexInSelection]?.api;
    const possibleReplacements = candidates.filter(c => c.api !== currentApiRef);

    if (possibleReplacements.length > 0) {
        const randomIndex = Math.floor(Math.random() * possibleReplacements.length);
        const newMishnah = possibleReplacements[randomIndex];
        selectedMishnayot[indexInSelection] = newMishnah;
        saveSelectedMishnayot();
        displaySelectedMishnayot(); 
        fetchAndDisplayMishnah(newMishnah.api); 
        console.log(`Replaced with: ${newMishnah.display}`);
    } else if (candidates.length > 0) {
        alert(`יש רק משנה אחת (${candidates[0].display}) המתחילה באות ${letterToReplace} באינדקס.`);
        if (currentApiRef) fetchAndDisplayMishnah(currentApiRef);
    } else {
        alert(`לא נמצאו משניות חלופיות לאות ${letterToReplace}.`);
    }
}



// --- פונקציות תהילים, חיפוש, הצגה, ניווט וטעינה ---
// (כל שאר הפונקציות נשארות כפי שהיו בגרסה הקודמת שהייתה יציבה)

function displayTehillimByLetters(letters) {
    // ... (אותה פונקציה כמו קודם) ...
    const tehillimDisplayElement = document.getElementById('tehillim-display');
    const mishnahDisplayElement = document.getElementById('mishnah-display');
    const displayArea = document.querySelector('.content-display-area'); 
    if (!tehillimDisplayElement || !mishnahDisplayElement || !displayArea) return;
    displayArea.style.display = 'block'; 
    if (typeof tehillim119 === 'undefined' || Object.keys(tehillim119).length === 0) {
        tehillimDisplayElement.innerHTML = "שגיאה: נתוני תהילים קי\"ט לא נטענו או שהקובץ ריק...";
        mishnahDisplayElement.style.display = 'none';
        tehillimDisplayElement.style.display = 'block';
        currentDisplayRef = 'tehillim'; 
        return;
    }
    let htmlOutput = `<h3>תהילים קי"ט לאותיות: ${letters.join(', ')}</h3>`;
    let foundVerses = false;
    letters.forEach(letter => {
        if (tehillim119[letter] && Array.isArray(tehillim119[letter])) {
            foundVerses = true;
            htmlOutput += `<h4 class="tehillim-letter">אות ${letter}</h4>`;
            const startVerseNum = (hebrewLetterToNumber(letter) - 1) * 8 + 1;
            tehillim119[letter].forEach((verse, index) => {
                 htmlOutput += `<p><span class="verse-num">(${startVerseNum + index})</span> ${verse}</p>`;
            });
        } else { console.warn(`No Tehillim data found for letter: ${letter}`); }
    });
    if (!foundVerses) { htmlOutput += "<p>לא נמצאו פסוקים לאותיות שנבחרו.</p>"; }
    tehillimDisplayElement.innerHTML = htmlOutput;
    mishnahDisplayElement.style.display = 'none'; 
    tehillimDisplayElement.style.display = 'block'; 
    currentDisplayRef = 'tehillim'; 
}

function searchByLetter(selectedLetter) {
    // ... (אותה פונקציה כמו קודם) ...
    console.log(`Searching for letter: ${selectedLetter}`); 
    const selectedLetterDisplay = document.getElementById('selected-letter-display');
    if(selectedLetterDisplay) selectedLetterDisplay.textContent = selectedLetter;
    const displayArea = document.querySelector('.content-display-area');
    if (displayArea) displayArea.style.display = 'none'; 
    currentDisplayRef = null; 
    const resultsByMasechet = {}; 
    if (typeof mishnahIndex === 'undefined' || typeof masechetIdToDisplayName === 'undefined' || typeof masechetIdToApiName === 'undefined') {
        console.error("Data files not loaded correctly."); displayGroupedResults({}); return;
    }
    for (const entry of mishnahIndex) {
        if (!Array.isArray(entry) || entry.length !== 4) continue;
        const [masechetId, perekNum, mishnahNum, firstLetter] = entry; 
        if (firstLetter === selectedLetter && firstLetter !== '?') {
            const masechetIdStr = String(masechetId);
            const displayName = masechetIdToDisplayName[masechetIdStr];
            const apiName = masechetIdToApiName[masechetIdStr];
            if (displayName && apiName) {
                const shortDisplayName = displayName.startsWith("משנה ") ? displayName.substring(4) : (displayName === 'משנה אבות' ? 'אבות' : displayName);
                const displayRef = `${shortDisplayName} ${numberToHebrewLetter(perekNum)}:${numberToHebrewLetter(mishnahNum)}`; 
                const apiRef = `${apiName.replace(/ /g, '_')}.${perekNum}.${mishnahNum}`; 
                if (!resultsByMasechet[masechetIdStr]) { resultsByMasechet[masechetIdStr] = { id: masechetId, name: shortDisplayName, mishnayot: [] }; }
                resultsByMasechet[masechetIdStr].mishnayot.push({ display: displayRef, api: apiRef });
            }
        }
    }
    displayGroupedResults(resultsByMasechet);
    const tehillimDisplayElement = document.getElementById('tehillim-display');
    if (tehillimDisplayElement) tehillimDisplayElement.style.display = 'none';
}


function displayGroupedResults(resultsByMasechet) {
    // ... (אותה פונקציה, כולל כפתור + לבחירה ידנית) ...
    const resultsListElement = document.getElementById('results-list');
    if (!resultsListElement) return;
    resultsListElement.innerHTML = ''; 
    const masechetIds = Object.keys(resultsByMasechet).map(id => parseInt(id, 10));
    if (masechetIds.length === 0) { resultsListElement.innerHTML = '<li>לא נמצאו משניות המתחילות באות זו.</li>'; return; }
    masechetIds.sort((a, b) => a - b); 
    masechetIds.forEach(masechetId => {
        const masechetIdStr = String(masechetId); 
        const group = resultsByMasechet[masechetIdStr];
        const groupContainer = document.createElement('div'); groupContainer.className = 'masechet-group';
        const heading = document.createElement('h3'); heading.textContent = `${group.name} (${group.mishnayot.length})`;
        const toggleIcon = document.createElement('span'); toggleIcon.textContent = ' [+]'; toggleIcon.style.cursor = 'pointer'; heading.appendChild(toggleIcon);
        const ul = document.createElement('ul'); ul.className = 'mishnayot-in-group'; ul.style.display = 'none'; 
        heading.onclick = () => { const isHidden = ul.style.display === 'none'; ul.style.display = isHidden ? 'block' : 'none'; toggleIcon.textContent = isHidden ? ' [-]' : ' [+]'; };
        groupContainer.appendChild(heading); 
        group.mishnayot.forEach(mishnah => {
            const listItem = document.createElement('li');
            const selectButton = document.createElement('button'); selectButton.textContent = '+'; selectButton.title = 'בחר לע"נ (ידני)'; selectButton.className = 'select-mishnah-button'; selectButton.onclick = () => selectMishnah(mishnah.api, mishnah.display); listItem.appendChild(selectButton); // בחירה ידנית עדיין אפשרית
            const link = document.createElement('a'); link.href = '#'; link.textContent = mishnah.display; link.onclick = (e) => { e.preventDefault(); fetchAndDisplayMishnah(mishnah.api); }; listItem.appendChild(link);
            ul.appendChild(listItem);
        });
        groupContainer.appendChild(ul); 
        resultsListElement.appendChild(groupContainer); 
    });
}

function displayNeshamahMishnayot() {
    // ... (אותה פונקציה כמו קודם) ...
     console.log("Displaying Neshamah Mishnayot (Mikvaot 7:3-6)");
     const refs = [ "Mishnah_Mikvaot.7.3", "Mishnah_Mikvaot.7.4", "Mishnah_Mikvaot.7.5", "Mishnah_Mikvaot.7.6" ];
     const resultsListElement = document.getElementById('results-list');
     if (resultsListElement) resultsListElement.innerHTML = `מוצגות משניות נשמה (מקואות ז':ג'-ו') - לחץ להצגת הטקסט: <a href="#" onclick="event.preventDefault(); fetchAndDisplayMishnah('${refs[0]}');">ג' (נ')</a> | <a href="#" onclick="event.preventDefault(); fetchAndDisplayMishnah('${refs[1]}');">ד' (ש')</a> | <a href="#" onclick="event.preventDefault(); fetchAndDisplayMishnah('${refs[2]}');">ה' (מ')</a> | <a href="#" onclick="event.preventDefault(); fetchAndDisplayMishnah('${refs[3]}');">ו' (ה')</a> `;
     const selectedLetterDisplay = document.getElementById('selected-letter-display');
     if(selectedLetterDisplay) selectedLetterDisplay.textContent = 'נשמה';
     const displayArea = document.querySelector('.content-display-area');
     if (displayArea) displayArea.style.display = 'none'; 
     currentDisplayRef = null;
}

async function fetchAndDisplayMishnah(apiRef) {
     // ... (אותה פונקציה בדיוק כמו בתשובה הקודמת, עם התיקון לברטנורא) ...
    currentDisplayRef = apiRef; 
    const displayElement = document.getElementById('mishnah-display');
    const tehillimElement = document.getElementById('tehillim-display');
    const displayArea = document.querySelector('.content-display-area'); 
    if (!displayElement || !tehillimElement || !displayArea) { console.error("Display elements not found!"); return; }
    displayArea.style.display = 'block'; displayElement.style.display = 'block'; tehillimElement.style.display = 'none'; 
    displayElement.innerHTML = 'טוען משנה...'; 
    const showCommentary = document.getElementById('show-bartenura-checkbox')?.checked;
    const apiRefFormatted = apiRef.replace(/ /g, '_');
    const mainTextUrl = `https://www.sefaria.org/api/texts/${apiRefFormatted}?context=0&commentary=0`;
    console.log(`Workspaceing Mishnah: ${mainTextUrl}`); 
    try {
        let dataMishnah; const responseMishnah = await fetch(mainTextUrl);
        if (!responseMishnah.ok) {
             const fallbackRef = apiRef.replace('Mishnah_', '').replace(/ /g, '_'); const fallbackUrl = `https://www.sefaria.org/api/texts/${fallbackRef}?context=0&commentary=0`; console.log(`Retrying fetch for: ${fallbackUrl}`); const responseFallback = await fetch(fallbackUrl); if (!responseFallback.ok) throw new Error(`שגיאה ${responseMishnah.status}/${responseFallback.status} מספריה עבור ${apiRefFormatted}`); dataMishnah = await responseFallback.json();
        } else { dataMishnah = await responseMishnah.json(); }
        console.log("Sefaria Mishnah response:", dataMishnah);
        let mishnahHtml = '';
        if (dataMishnah && dataMishnah.he) { if (Array.isArray(dataMishnah.he)) { if (dataMishnah.he.length > 0) mishnahHtml = dataMishnah.he.join('<br>'); } else if (typeof dataMishnah.he === 'string') { mishnahHtml = dataMishnah.he; } }
        if (!mishnahHtml) mishnahHtml = `<p><i>לא נמצא טקסט משנה עבור ${apiRefFormatted} בספריה.</i></p>`
        let commentaryHtml = '';
        if (showCommentary) {
            const commentaryRef = `${mishnahCommentaryRef}_on_${apiRefFormatted}`; const commentaryUrl = `https://www.sefaria.org/api/texts/${commentaryRef}?context=0&commentary=0`; console.log(`Workspaceing ${mishnahCommentaryRef}: ${commentaryUrl}`);
            try {
                const responseCommentary = await fetch(commentaryUrl);
                if (responseCommentary.ok) {
                    const dataCommentary = await responseCommentary.json(); console.log(`Sefaria ${mishnahCommentaryRef} response:`, dataCommentary);
                    if (dataCommentary && dataCommentary.he) { let commentaryText = ''; if (Array.isArray(dataCommentary.he)) { if (dataCommentary.he.length > 0) commentaryText = dataCommentary.he.join('<br>'); } else if (typeof dataCommentary.he === 'string') { commentaryText = dataCommentary.he; } if(commentaryText) commentaryHtml = `<div class="commentary-text"><strong>${commentaryTitle}:</strong><br>${commentaryText}</div>`; else commentaryHtml = `<div class="commentary-text"><strong>${commentaryTitle}:</strong> (טקסט ריק התקבל)</div>`; } else commentaryHtml = `<div class="commentary-text"><strong>${commentaryTitle}:</strong> (לא זמין בספריה)</div>`;
                } else { console.log(`${mishnahCommentaryRef} fetch failed: ${responseCommentary.status}`); commentaryHtml = `<div class="commentary-text"><strong>${commentaryTitle}:</strong> (לא זמין - ${responseCommentary.status})</div>`; }
            } catch (commentaryError) { console.error(`Error fetching ${mishnahCommentaryRef}:`, commentaryError); commentaryHtml = `<div class="commentary-text"><strong>${commentaryTitle}:</strong> (שגיאה בטעינה)</div>`; }
             await new Promise(resolve => setTimeout(resolve, 50)); 
        }
        displayElement.innerHTML = mishnahHtml + commentaryHtml;
    } catch (error) { console.error("Error fetching Mishnah:", error); displayElement.innerHTML = `שגיאה בטעינת המשנה: ${error.message}.`; }
}

function refreshCurrentMishnah() {
     // ... (אותה פונקציה) ...
     if (currentDisplayRef && currentDisplayRef !== 'tehillim') { fetchAndDisplayMishnah(currentDisplayRef); }
}

// --- פונקציות ניווט לפי סדר/מסכת/פרק ---
let mishnah_structure_by_seder = {}; 

function buildSederStructure() {
    // ... (אותה פונקציה) ...
     if (mishnahStructureBuilt) return; 
    if (typeof masechetIdToDisplayName === 'undefined' || typeof masechetIdToApiName === 'undefined' || typeof mishnah_structure === 'undefined') { console.error("Cannot build Seder structure..."); mishnahStructureBuilt = false; return; }
    const sedarim = { "סדר זרעים": { start: 1, end: 11 }, "סדר מועד": { start: 12, end: 23 }, "סדר נשים": { start: 24, end: 30 }, "סדר נזיקין": { start: 31, end: 40 }, "סדר קדשים": { start: 41, end: 51 }, "סדר טהרות": { start: 52, end: 63 } };
    for (const [sederName, range] of Object.entries(sedarim)) {
        mishnah_structure_by_seder[sederName] = [];
        for (let id = range.start; id <= range.end; id++) {
            const idStr = String(id); const heName = masechetIdToDisplayName[idStr]; const apiName = masechetIdToApiName[idStr]; const lengths = mishnah_structure[apiName] || (apiName === "Pirkei Avot" ? mishnah_structure["Pirkei Avot"] : null); 
            if (heName && apiName && lengths) { const shortHeName = heName.startsWith("משנה ") ? heName.substring(4) : (heName === 'משנה אבות' ? 'אבות' : heName); mishnah_structure_by_seder[sederName].push({ id: id, heName: shortHeName, apiName: apiName, lengths: lengths }); } 
            else { console.warn(`Missing data for Masechet ID ${idStr} while building structure.`); }
        }
    }
    mishnahStructureBuilt = true; console.log("Seder structure built.");
}

function populateSedarim() {
    // ... (אותה פונקציה) ...
    const sederSelect = document.getElementById('seder-select'); if (!sederSelect || !mishnahStructureBuilt) return; sederSelect.innerHTML = '<option value="">בחר סדר...</option>'; Object.keys(mishnah_structure_by_seder).forEach(sederName => { const option = document.createElement('option'); option.value = sederName; option.textContent = sederName; sederSelect.appendChild(option); });
}

function populateMasechtot() {
    // ... (אותה פונקציה) ...
    const sederSelect = document.getElementById('seder-select'); const masechetSelect = document.getElementById('masechet-select'); const perekSelect = document.getElementById('perek-select'); const perekMishnayotList = document.getElementById('perek-mishnayot-list'); if (!sederSelect || !masechetSelect || !perekSelect || !perekMishnayotList || !mishnahStructureBuilt) return; const selectedSeder = sederSelect.value; masechetSelect.innerHTML = '<option value="">בחר מסכת...</option>'; perekSelect.innerHTML = '<option value="">בחר פרק...</option>'; perekMishnayotList.innerHTML = ''; if (selectedSeder && mishnah_structure_by_seder[selectedSeder]) { mishnah_structure_by_seder[selectedSeder].forEach(masechet => { const option = document.createElement('option'); option.value = masechet.apiName; option.textContent = masechet.heName; masechetSelect.appendChild(option); }); }
}

function populatePerakim() {
    // ... (אותה פונקציה) ...
    const sederSelect = document.getElementById('seder-select'); const masechetSelect = document.getElementById('masechet-select'); const perekSelect = document.getElementById('perek-select'); const perekMishnayotList = document.getElementById('perek-mishnayot-list'); if (!sederSelect || !masechetSelect || !perekSelect || !perekMishnayotList || !mishnahStructureBuilt) return; const selectedSeder = sederSelect.value; const selectedMasechetApiName = masechetSelect.value; perekSelect.innerHTML = '<option value="">בחר פרק...</option>'; perekMishnayotList.innerHTML = ''; if (selectedSeder && selectedMasechetApiName && mishnah_structure_by_seder[selectedSeder]) { const masechetData = mishnah_structure_by_seder[selectedSeder].find(m => m.apiName === selectedMasechetApiName); if (masechetData && masechetData.lengths) { masechetData.lengths.forEach((numMishnayot, index) => { const perekNum = index + 1; const option = document.createElement('option'); option.value = perekNum; option.textContent = `פרק ${numberToHebrewLetter(perekNum)}`; perekSelect.appendChild(option); }); } }
}

function displayMishnayotForPerek() {
     // ... (אותה פונקציה) ...
    const masechetSelect = document.getElementById('masechet-select'); const perekSelect = document.getElementById('perek-select'); const perekMishnayotList = document.getElementById('perek-mishnayot-list'); if (!masechetSelect || !perekSelect || !perekMishnayotList || !mishnahStructureBuilt) return; const selectedMasechetApiName = masechetSelect.value; const selectedPerekNum = parseInt(perekSelect.value); perekMishnayotList.innerHTML = ''; if (!selectedMasechetApiName || !selectedPerekNum || isNaN(selectedPerekNum)) return; const sederName = document.getElementById('seder-select').value; let numMishnayot = 0; let masechetData = null; if (sederName && mishnah_structure_by_seder[sederName]){ masechetData = mishnah_structure_by_seder[sederName].find(m => m.apiName === selectedMasechetApiName); if (masechetData && masechetData.lengths && selectedPerekNum > 0 && selectedPerekNum <= masechetData.lengths.length) { numMishnayot = masechetData.lengths[selectedPerekNum - 1]; } } if (masechetData && numMishnayot > 0) { perekMishnayotList.innerHTML = `משניות בפרק ${numberToHebrewLetter(selectedPerekNum)} (לחץ על אות המשנה להצגה): `; for (let i = 1; i <= numMishnayot; i++) { const mishnahLink = document.createElement('span'); const apiRef = `${masechetData.apiName.replace(/ /g, '_')}.${selectedPerekNum}.${i}`; mishnahLink.textContent = numberToHebrewLetter(i); mishnahLink.title = `הצג ${masechetData.heName} ${numberToHebrewLetter(selectedPerekNum)}:${numberToHebrewLetter(i)}`; mishnahLink.style.cursor = 'pointer'; mishnahLink.onclick = () => fetchAndDisplayMishnah(apiRef); perekMishnayotList.appendChild(mishnahLink); } const displayArea = document.querySelector('.content-display-area'); if (displayArea) displayArea.style.display = 'none'; currentDisplayRef = null; } else if (masechetData) { perekMishnayotList.innerHTML = `לא נמצא מידע על מספר המשניות בפרק ${numberToHebrewLetter(selectedPerekNum)}.`; console.warn("Could not get mishnayot count for", selectedMasechetApiName, selectedPerekNum); }
}


// --- הרצת קוד ראשוני כשהדף נטען ---
window.onload = () => {
    // ... (אותה פונקציה כמו קודם, כולל הסתרת כפתור אקראי) ...
    console.log("App loaded.");
    if (typeof mishnah_structure !== 'undefined' && typeof masechetIdToDisplayName !== 'undefined' && typeof masechetIdToApiName !== 'undefined') {
         buildSederStructure(); 
         if (mishnahStructureBuilt) { populateSedarim(); } 
         else { console.error("Failed to build Seder structure, navigation disabled."); }
         loadSelectedMishnayot(); 
    } else { console.error("Critical error: Base data files missing!"); alert("שגיאה קריטית: חסר מידע חיוני."); }
    const displayArea = document.querySelector('.content-display-area'); if (displayArea) displayArea.style.display = 'none';
    const randomButton = document.getElementById('random-select-button'); if (randomButton) randomButton.style.display = 'none';
};