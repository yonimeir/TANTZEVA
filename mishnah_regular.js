window.numberToHebrewLetter = function(num) {
    const letters = [
        '', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט',
        'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט',
        'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט',
        'ל', 'לא', 'לב', 'לג', 'לד', 'לה', 'לו', 'לז', 'לח', 'לט',
        'מ', 'מא', 'מב', 'מג', 'מד', 'מה', 'מו', 'מז', 'מח', 'מט',
        'נ', 'נא', 'נב', 'נג', 'נד', 'נה', 'נו', 'נז', 'נח', 'נט'
    ];
    return letters[num] || num;
};

// בחירת משנה לפי מיקום בש"ס, עם טעינה מ-API של ספריא

document.addEventListener('DOMContentLoaded', function() {
    // ניגש לאלמנטים בדף
    const sederSelect = document.getElementById('seder-select');
    const masechetSelect = document.getElementById('masechet-select');
    const perekSelect = document.getElementById('perek-select');
    const mishnahSelect = document.getElementById('mishnah-select');
    const perekMishnayotList = document.getElementById('perek-mishnayot-list');
    const mishnayotDisplay = document.getElementById('mishnah-display');
    const showBartenuraCheckbox = document.getElementById('show-bartenura-checkbox');
    const contentDisplayArea = document.querySelector('.content-display-area');
    const errorMessage = document.getElementById('error-message');
    const addToPrintButton = document.getElementById('add-to-print-button');

    // אובייקט מצב עבור מידע על ה-UI
    const state = {
        mishnah_structure_by_seder: {}, // מבנה שמאכלס את מספר המשניות בכל פרק/מסכת
        selectedSeder: null,
        selectedMasechet: null,
        selectedPerek: null,
        selectedMishnah: null,
        currentDisplayRef: null,
        currentMishnahData: null // אחסון המשנה הנוכחית להוספה לדף לימוד
    };

    // מידע על סדרים וקריאות API
    const sederApiNames = ["Zeraim", "Moed", "Nashim", "Nezikin", "Kodashim", "Tahorot"];
    const sederDisplayNames = ["זרעים", "מועד", "נשים", "נזיקין", "קדשים", "טהרות"];
    const commentaryRef = "Bartenura";
    const commentaryTitle = "ברטנורא (רע\"ב)";

    // יצירת פונקציית שגיאה
    function showError(message, autoHide = true) {
        errorMessage.innerText = message;
        errorMessage.style.display = 'block';
        errorMessage.classList.add('show');
        
        if (autoHide) {
            setTimeout(() => {
                errorMessage.classList.remove('show');
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 300);
            }, 5000);
        }
    }

    // פונקציית עזר להכנת שם מסכת לקריאה מה-API
    function normalizeApiName(masechetName) {
        // הסרת תחילית "Mishnah" או "Mishnah " אם קיימת כדי למנוע כפילות
        let normalizedName = masechetName;
        if (normalizedName.startsWith('Mishnah ')) {
            normalizedName = normalizedName.substring(8);
        } else if (normalizedName.startsWith('Mishnah_')) {
            normalizedName = normalizedName.substring(8);
        }
        
        // החלפת רווחים ב-underscores כפי שנדרש ע"י API
        normalizedName = normalizedName.replace(/ /g, '_');
        
        return normalizedName;
    }

    // פונקציה לטעינת המסכתות הזמינות בסדר שנבחר
    function populateMasechtot() {
        // מרוקן את הבוחרים הקודמים ומאפס את המצב
        masechetSelect.innerHTML = '<option value="">בחר מסכת...</option>';
        perekSelect.innerHTML = '<option value="">בחר פרק...</option>';
        mishnahSelect.innerHTML = '<option value="">בחר משנה...</option>';
        perekMishnayotList.style.display = 'none';
        mishnayotDisplay.innerText = '(בחר משנה מהניווט למעלה כדי להציג כאן)';

        const sederId = sederSelect.value;
        if (!sederId) {
            masechetSelect.disabled = true;
            perekSelect.disabled = true;
            mishnahSelect.disabled = true;
            return;
        }

        // עדכון המצב
        state.selectedSeder = parseInt(sederId);
        state.selectedMasechet = null;
        state.selectedPerek = null;
        state.selectedMishnah = null;

        // כאן נטען את המסכתות לפי הסדר שנבחר
        const sederData = window.mishnah_structure[sederId];
        if (!sederData) {
            showError(`שגיאה: לא נמצא סדר עם מזהה ${sederId}`);
            return;
        }

        // טעינת המסכתות מהמבנה הסטטי
        const masechtot = sederData.masechtot;
        for (const masechetId in masechtot) {
            const masechet = masechtot[masechetId];
            const option = document.createElement('option');
            option.value = masechetId;
            option.textContent = masechet.name;
            masechetSelect.appendChild(option);
        }
        
        masechetSelect.disabled = false;
    }

    // פונקציה לטעינת המבנה של המסכת
    function loadMasechetStructure(masechetId) {
        // מציאת הסדר והמסכת במבנה הסטטי
        const sederId = state.selectedSeder;
        const seder = window.mishnah_structure[sederId];
        
        if (!seder) {
            showError(`שגיאה: לא נמצא סדר עם מזהה ${sederId}`);
            return;
        }
        
        const masechet = seder.masechtot[masechetId];
        if (!masechet) {
            showError(`שגיאה: לא נמצאה מסכת עם מזהה ${masechetId} בסדר ${sederId}`);
            return;
        }
        
        console.log(`טוען מסכת ${masechet.name} (${masechet.apiName}) מהמבנה הסטטי`);
        
        // חילוץ מספר הפרקים
        const chapters = masechet.chapters;
        const numPerakim = Object.keys(chapters).length;
        
        if (numPerakim <= 0) {
            showError(`שגיאה: לא נמצאו פרקים למסכת ${masechet.name}`);
            return;
        }
        
        // אחסון המידע במבנה המצב
        if (!state.mishnah_structure_by_seder[state.selectedSeder]) {
            state.mishnah_structure_by_seder[state.selectedSeder] = {};
        }
        
        state.mishnah_structure_by_seder[state.selectedSeder][masechetId] = {
            numPerakim: numPerakim,
            perakim: {}
        };
        
        // מילוי בוחר הפרקים
        for (let i = 1; i <= numPerakim; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `פרק ${window.numberToHebrewLetter(i)}`;
            perekSelect.appendChild(option);
        }
        
        perekSelect.disabled = false;
    }

    // פונקציה לטעינת המבנה של המסכת כאשר המשתמש בוחר מסכת
    function populatePerakim() {
        // מרוקן את הבוחרים הקודמים ומאפס את המצב
        perekSelect.innerHTML = '<option value="">בחר פרק...</option>';
        mishnahSelect.innerHTML = '<option value="">בחר משנה...</option>';
        perekMishnayotList.style.display = 'none';
        mishnayotDisplay.innerText = '(בחר פרק ומשנה מהניווט למעלה כדי להציג כאן)';

        const masechetId = masechetSelect.value;
        if (!masechetId) {
            perekSelect.disabled = true;
            mishnahSelect.disabled = true;
            return;
        }

        // עדכון המצב
        state.selectedMasechet = parseInt(masechetId);
        state.selectedPerek = null;
        state.selectedMishnah = null;

        // טעינת המבנה של המסכת
        loadMasechetStructure(state.selectedMasechet);
    }

    // פונקציה לטעינת משניות בפרק שנבחר
    function populateMishnayot() {
        mishnahSelect.innerHTML = '<option value="">בחר משנה...</option>';
        perekMishnayotList.innerHTML = '';
        perekMishnayotList.style.display = 'none';
        mishnayotDisplay.innerText = '(בחר משנה מהניווט למעלה כדי להציג כאן)';

        const perekNum = perekSelect.value;
        if (!perekNum) {
            mishnahSelect.disabled = true;
            return;
        }

        // עדכון המצב
        state.selectedPerek = parseInt(perekNum);
        state.selectedMishnah = null;

        // טעינת המבנה של הפרק אם עדיין לא נטען
        loadPerekStructure(state.selectedMasechet, state.selectedPerek);
    }

    // פונקציה לטעינת המבנה של הפרק
    function loadPerekStructure(masechetId, perekNum) {
        // מציאת הסדר, המסכת והפרק במבנה הסטטי
        const sederId = state.selectedSeder;
        const seder = window.mishnah_structure[sederId];
        
        if (!seder) {
            showError(`שגיאה: לא נמצא סדר עם מזהה ${sederId}`);
            return;
        }

        const masechet = seder.masechtot[masechetId];
        if (!masechet) {
            showError(`שגיאה: לא נמצאה מסכת עם מזהה ${masechetId} בסדר ${sederId}`);
            return;
        }

        const chapters = masechet.chapters;
        if (!chapters[perekNum]) {
            showError(`שגיאה: לא נמצא פרק ${perekNum} במסכת ${masechet.name}`);
            return;
        }

        // מספר המשניות בפרק
        const numMishnayot = chapters[perekNum];
        
        console.log(`טוען פרק ${perekNum} ממסכת ${masechet.name}: ${numMishnayot} משניות`);
        
        // אחסון המידע במבנה המצב
        state.mishnah_structure_by_seder[state.selectedSeder][masechetId].perakim[perekNum] = {
            numMishnayot: numMishnayot
        };
        
        // מילוי בוחר המשניות וכן הצגת הרשימה הויזואלית
        fillMishnayotSelectAndList(numMishnayot);
        
        mishnahSelect.disabled = false;
    }

    // פונקציה למילוי בוחר המשניות וכן הצגת הרשימה הויזואלית
    function fillMishnayotSelectAndList(numMishnayot) {
        // מילוי הבוחר
        for (let i = 1; i <= numMishnayot; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `משנה ${window.numberToHebrewLetter(i)}`;
            mishnahSelect.appendChild(option);
        }
        
        // מילוי הרשימה הויזואלית
        perekMishnayotList.innerHTML = '';
        for (let i = 1; i <= numMishnayot; i++) {
            const mishnahSpan = document.createElement('span');
            mishnahSpan.textContent = window.numberToHebrewLetter(i);
            mishnahSpan.className = 'mishnah-link';
            mishnahSpan.dataset.mishnah = i;
            mishnahSpan.addEventListener('click', function() {
                mishnahSelect.value = i;
                loadMishnah();
            });
            perekMishnayotList.appendChild(mishnahSpan);
        }
        
        perekMishnayotList.style.display = 'block';
    }

    // פונקציה לטעינת משנה
    function loadMishnah() {
        mishnayotDisplay.innerHTML = '';
        
        const mishnah = mishnahSelect.value;
        if (!mishnah) return;
        
        // עדכון המצב
        state.selectedMishnah = parseInt(mishnah);
        
        // בניית הרפרנס המלא
        const masechetApiName = getMasechetApiName();
        
        if (!masechetApiName) {
            showError('שגיאה: לא ניתן לקבוע את שם המסכת לקריאה מה-API');
            return;
        }
        
        // הצגת המשנה
        fetchAndDisplayMishnah(masechetApiName, state.selectedPerek, state.selectedMishnah);
        
        // הצגת כפתור ההוספה לדף הלימוד
        if (addToPrintButton) {
            addToPrintButton.style.display = 'inline-block';
        }
    }

    // פונקציה לטעינת והצגת תוכן המשנה
    function fetchAndDisplayMishnah(masechetApiName, perekNum, mishnah) {
        // כאן נשתמש בשם ה-API מהמבנה הסטטי אם אפשר
        let apiName = masechetApiName;
        
        // אם קיבלנו מזהה מסכת במקום שם API, נחפש את שם ה-API במבנה
        if (!isNaN(parseInt(masechetApiName))) {
            const masechetId = parseInt(masechetApiName);
            // חיפוש בכל הסדרים
            for (const sederId in window.mishnah_structure) {
                const seder = window.mishnah_structure[sederId];
                if (seder.masechtot[masechetId]) {
                    apiName = seder.masechtot[masechetId].apiName;
                    break;
                }
            }
        }
        
        const mishnahRef = `Mishnah_${apiName}.${perekNum}.${mishnah}`;
        state.currentDisplayRef = mishnahRef;

        // הצגת טעינה
        mishnayotDisplay.innerHTML = 'טוען משנה...';
        contentDisplayArea.style.display = 'block';

        // רישום מידע לדיבאג
        console.log(`מנסה לטעון משנה: ${mishnahRef}`);

        // טעינת המשנה מה-API
        fetch(`https://www.sefaria.org/api/texts/${mishnahRef}?context=0&multiple=0`)
            .then(response => {
                if (!response.ok) throw new Error(`שגיאה בטעינת המשנה: ${response.status}`);
                return response.json();
            })
            .then(data => {
                // רישום מידע לדיבאג
                console.log('נתוני משנה התקבלו מה-API:', data);
                
                // הצגת המשנה
                displayMishnah(data);
                
                // טעינת הפירוש אם מסומן
                if (showBartenuraCheckbox.checked) {
                    fetchAndDisplayCommentary(mishnahRef);
                }
            })
            .catch(error => {
                showError(`שגיאה בטעינת המשנה: ${error.message}`);
                console.error('שגיאה מפורטת בטעינת משנה:', error);
                mishnayotDisplay.innerHTML = 'אירעה שגיאה בטעינת המשנה. נסה שוב מאוחר יותר.';
            });
    }

    // פונקציה להצגת המשנה
    function displayMishnah(data) {
        mishnayotDisplay.innerHTML = '';
        
        if (!data || !data.he || data.he.length === 0) {
            const errorText = document.createElement('p');
            errorText.className = 'error-message';
            errorText.textContent = 'לא נמצא תוכן למשנה זו';
            mishnayotDisplay.appendChild(errorText);
            return;
        }
        
        // שמור את נתוני המשנה לשימוש עתידי
        state.currentMishnahData = {
            masechetId: getMasechetId(),
            masechetName: getMasechetDisplayName(),
            perekNum: state.selectedPerek,
            mishnahNum: state.selectedMishnah,
            text: Array.isArray(data.he) ? data.he.join('<br>') : data.he
        };
        
        // הצגת המשנה
        const mishnahTitle = document.createElement('h3');
        mishnahTitle.className = 'mishnah-title';
        mishnahTitle.textContent = `${getMasechetDisplayName()}, פרק ${state.selectedPerek}, משנה ${state.selectedMishnah}`;
        mishnayotDisplay.appendChild(mishnahTitle);
        
        const mishnahText = document.createElement('div');
        mishnahText.className = 'mishnah-text';
        mishnahText.innerHTML = Array.isArray(data.he) ? data.he.join('<br><br>') : data.he;
        mishnayotDisplay.appendChild(mishnahText);
        
        // שמירת הרפרנס למשנה הנוכחית
        state.currentDisplayRef = `Mishnah_${getMasechetApiName()}.${state.selectedPerek}.${state.selectedMishnah}`;
        
        // טעינת פירוש אם נדרש
        if (showBartenuraCheckbox.checked) {
            fetchAndDisplayCommentary(state.currentDisplayRef);
        }
        
        // הצגת כפתור ההוספה לדף הלימוד
        if (addToPrintButton) {
            addToPrintButton.style.display = 'inline-block';
        }
    }

    // פונקציה לטעינת והצגת הפירוש
    function fetchAndDisplayCommentary(mishnahRef) {
        const commentaryFullRef = `${commentaryRef}_on_${mishnahRef}`;
        
        // רישום מידע לדיבאג
        console.log(`מנסה לטעון פירוש: ${commentaryFullRef}`);
        
        fetch(`https://www.sefaria.org/api/texts/${commentaryFullRef}?context=0&multiple=0`)
            .then(response => {
                if (!response.ok) throw new Error(`שגיאה בטעינת הפירוש: ${response.status}`);
                return response.json();
            })
            .then(data => {
                // רישום מידע לדיבאג
                console.log('נתוני פירוש התקבלו מה-API:', data);
                
                // הצגת הפירוש
                displayCommentary(data);
            })
            .catch(error => {
                // ייתכן שאין פירוש, לא נציג שגיאה
                console.log(`הערה: לא נמצא פירוש - ${error.message}`);
                console.error('שגיאה מפורטת בטעינת פירוש:', error);
                
                // הצגת הודעה במקום הפירוש
                const commentaryDiv = document.createElement('div');
                commentaryDiv.className = 'commentary-text';
                commentaryDiv.innerHTML = `<strong>${commentaryTitle}:</strong><br>פירוש אינו זמין למשנה זו.`;
                mishnayotDisplay.appendChild(commentaryDiv);
            });
    }

    // פונקציה להצגת הפירוש
    function displayCommentary(data) {
        // הכנת התוכן להצגה
        let heText = 'תוכן הפירוש לא נמצא';
        
        // בדיקת המבנה של התשובה
        if (data.he) {
            if (Array.isArray(data.he)) {
                // אם זה מערך, אנחנו לוקחים את הטקסט הראשון (או את כולם מחוברים)
                heText = data.he.join("<br><br>");
            } else if (typeof data.he === 'string') {
                // אם זה מחרוזת, אנחנו לוקחים אותה כמו שהיא
                heText = data.he;
            }
        }
        
        // רישום מידע לדיבאג
        console.log('מציג תוכן פירוש:', { heText });
        
        // הוספת הפירוש לדף
        const commentaryDiv = document.createElement('div');
        commentaryDiv.className = 'commentary-text';
        commentaryDiv.innerHTML = `<strong>${commentaryTitle}:</strong><br>${heText}`;
        mishnayotDisplay.appendChild(commentaryDiv);
    }

    // פונקציית עזר לקבלת מזהה המסכת
    function getMasechetId() {
        return state.selectedMasechet;
    }
    
    // פונקציית עזר לקבלת שם התצוגה של המסכת
    function getMasechetDisplayName() {
        if (!state.selectedSeder || !state.selectedMasechet) return '';
        
        const seder = window.mishnah_structure[state.selectedSeder];
        if (!seder) return '';
        
        const masechet = seder.masechtot[state.selectedMasechet];
        return masechet ? masechet.name : '';
    }
    
    // פונקציית עזר לקבלת שם ה-API של המסכת
    function getMasechetApiName() {
        if (!state.selectedSeder || !state.selectedMasechet) return null;
        
        const sederId = state.selectedSeder;
        const masechetId = state.selectedMasechet;
        
        // נסיון להשיג את שם ה-API של המסכת מתוך המבנה הסטטי
        if (window.mishnah_structure[sederId] && 
            window.mishnah_structure[sederId].masechtot && 
            window.mishnah_structure[sederId].masechtot[masechetId]) {
            return window.mishnah_structure[sederId].masechtot[masechetId].apiName;
        }
        
        // במקרה של כישלון, ננסה להשתמש במיפוי הישן (אם זמין)
        if (typeof masechetIdToApiName !== 'undefined' && masechetIdToApiName[masechetId]) {
            return masechetIdToApiName[masechetId];
        }
        
        return null;
    }
    
    // פונקציה להוספת המשנה הנוכחית לדף הלימוד להדפסה
    function addCurrentMishnahToPrint() {
        if (!state.currentMishnahData) {
            showError('אין משנה זמינה להוספה לדף הלימוד');
            return;
        }
        
        // טעינת הנתונים השמורים למשניות
        let selectedMishnayot = [];
        try {
            const savedMishnayot = localStorage.getItem('selectedMishnayot');
            if (savedMishnayot) {
                selectedMishnayot = JSON.parse(savedMishnayot);
            }
        } catch (e) {
            console.error('שגיאה בטעינת משניות שמורות:', e);
        }
        
        // הוספת המשנה הנוכחית
        const newMishnah = {
            masechetId: state.currentMishnahData.masechetId,
            masechetName: state.currentMishnahData.masechetName,
            perekNum: state.currentMishnahData.perekNum,
            mishnahNum: state.currentMishnahData.mishnahNum,
            text: state.currentMishnahData.text
        };
        
        // בדיקה אם המשנה כבר קיימת
        const existingIndex = selectedMishnayot.findIndex(m => 
            m.masechetId === newMishnah.masechetId && 
            m.perekNum === newMishnah.perekNum && 
            m.mishnahNum === newMishnah.mishnahNum
        );
        
        if (existingIndex !== -1) {
            showError('משנה זו כבר קיימת בדף הלימוד שלך', true);
            return;
        }
        
        // הוספת המשנה לרשימה
        selectedMishnayot.push(newMishnah);
        
        // שמירה בלוקל סטורג'
        try {
            localStorage.setItem('selectedMishnayot', JSON.stringify(selectedMishnayot));
            showSuccess('המשנה נוספה בהצלחה לדף הלימוד להדפסה!');
        } catch (e) {
            console.error('שגיאה בשמירת משניות:', e);
            showError('שגיאה בשמירת המשנה, נסה שוב מאוחר יותר');
        }
    }
    
    // פונקציית הצגת הודעת הצלחה
    function showSuccess(message, autoHide = true) {
        errorMessage.innerText = message;
        errorMessage.style.display = 'block';
        errorMessage.classList.add('show');
        errorMessage.classList.add('success-message');
        errorMessage.classList.remove('error-message');
        
        if (autoHide) {
            setTimeout(() => {
                errorMessage.classList.remove('show');
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                    errorMessage.classList.remove('success-message');
                    errorMessage.classList.add('error-message');
                }, 300);
            }, 5000);
        }
    }
    
    // הוספת האזנה לאירוע לחיצה על כפתור ההוספה לדף הלימוד
    if (addToPrintButton) {
        addToPrintButton.addEventListener('click', addCurrentMishnahToPrint);
    }
    
    // האירועים הקיימים...
    
    // אירועים לשינוי בוחרים
    sederSelect.addEventListener('change', populateMasechtot);
    masechetSelect.addEventListener('change', populatePerakim);
    perekSelect.addEventListener('change', populateMishnayot);
    mishnahSelect.addEventListener('change', loadMishnah);
    
    // אירוע שינוי לתיבת הסימון של ברטנורא
    showBartenuraCheckbox.addEventListener('change', function() {
        if (state.currentDisplayRef) {
            if (this.checked) {
                fetchAndDisplayCommentary(state.currentDisplayRef);
            } else {
                // הסרת הפירוש אם קיים
                const commentary = document.querySelector('.commentary-container');
                if (commentary) commentary.remove();
            }
        }
    });

    // בדיקה שה-JS נטען
    console.log('mishnah_regular.js loaded correctly after fixes');
});
