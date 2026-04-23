// שלד JS לדף תהילים לע"נ
// כאן תוכל להעתיק פונקציות קיימות מהקוד הישן (app.js) הקשורות להצגת תהילים, חישוב אותיות וכו'.

document.addEventListener('DOMContentLoaded', function() {
    // אלמנטי DOM
    const niftarNameInput = document.getElementById('niftar-name');
    const processNameButton = document.getElementById('process-name-button');
    const nameLettersDisplay = document.getElementById('name-letters-display');
    const processedNameElement = document.getElementById('processed-name');
    const nameLettersContainer = document.getElementById('name-letters-container');
    const tehillimTabs = document.getElementById('tehillim-tabs');
    const tehillim119Content = document.getElementById('tehillim119-content');
    const selectedChapterContent = document.getElementById('selected-chapter-content');
    const printSection = document.getElementById('print-section');
    const preparePrintButton = document.getElementById('prepare-print-button');
    const errorMessage = document.getElementById('error-message');
    
    // קיבוע אלמנטים שאולי לא קיימים בדף
    const chapterButtons = document.querySelectorAll('.chapter-button');

    // משתני מצב
    let currentNiftarName = '';
    let currentNiftarLetters = [];
    let selectedTehillimVerses = [];

    // טעינת נתונים שמורים
    function loadSavedData() {
        const savedName = localStorage.getItem('niftarName');
        const savedLetters = localStorage.getItem('niftarLetters');
        const savedVerses = localStorage.getItem('selectedTehillimVerses');

        if (savedName) {
            niftarNameInput.value = savedName;
            currentNiftarName = savedName;
        }

        if (savedLetters) {
            currentNiftarLetters = savedLetters.split('');
        }

        if (savedVerses) {
            try {
                selectedTehillimVerses = JSON.parse(savedVerses);
            } catch (e) {
                console.error('Error parsing saved tehillim verses:', e);
                selectedTehillimVerses = [];
            }
        }

        // אם יש נתונים שמורים, הצג אותם
        if (savedName && savedLetters) {
            processNameAndShow();
        }
    }

    // המרת אותיות סופיות לרגילות
    function convertFinalLetters(letter) {
        const finalToRegular = {
            'ך': 'כ',
            'ם': 'מ',
            'ן': 'נ',
            'ף': 'פ',
            'ץ': 'צ'
        };
        
        return finalToRegular[letter] || letter;
    }

    // עיבוד שם הנפטר והצגת האותיות
    function processNameAndShow() {
        const name = niftarNameInput.value.trim();
        
        if (!name) {
            showError('אנא הכנס שם נפטר');
            return;
        }
        
        currentNiftarName = name;
        
        // חילוץ אותיות השם
        const letters = [];
        for (let i = 0; i < name.length; i++) {
            const letter = name[i];
            // בדיקה שזו אות עברית
            if (/[\u0590-\u05FF]/.test(letter) && letter !== ' ' && letter !== '"' && letter !== "'") {
                // המרת אותיות סופיות
                const normalizedLetter = convertFinalLetters(letter);
                letters.push(normalizedLetter);
            }
        }
        
        currentNiftarLetters = letters;
        
        // שמירה בלוקל סטורג'
        localStorage.setItem('niftarName', name);
        localStorage.setItem('niftarLetters', letters.join(''));
        
        // הצגת השם והאותיות
        processedNameElement.textContent = name;
        nameLettersDisplay.style.display = 'block';
        
        // יצירת תגיות האותיות
        renderLetterBadges();
        
        // הצגת תהילים קי"ט לפי האותיות
        renderTehillim119ByLetters();
        
        // הצגת סקשן ההדפסה
        printSection.style.display = 'block';
    }

    // יצירת תגיות לאותיות
    function renderLetterBadges() {
        nameLettersContainer.innerHTML = '';
        
        for (let i = 0; i < currentNiftarLetters.length; i++) {
            const letter = currentNiftarLetters[i];
            const letterBadge = document.createElement('span');
            letterBadge.className = 'letter-badge';
            letterBadge.textContent = letter;
            letterBadge.dataset.letterIndex = i;
            letterBadge.dataset.letter = letter;
            
            // אירוע לחיצה לגלילה לאות בתהילים
            letterBadge.addEventListener('click', function() {
                scrollToLetter(letter);
            });
            
            nameLettersContainer.appendChild(letterBadge);
        }
    }

    // גלילה לאות בתהילים
    function scrollToLetter(letter) {
        const letterSection = document.getElementById(`letter-section-${letter}`);
        if (letterSection) {
            letterSection.scrollIntoView({ behavior: 'smooth' });
            letterSection.style.backgroundColor = '#e8f5e9';
            setTimeout(() => {
                letterSection.style.backgroundColor = '';
            }, 2000);
        }
    }

    // הצגת תהילים קי"ט לפי אותיות
    function renderTehillim119ByLetters() {
        tehillim119Content.innerHTML = '';
        
        if (currentNiftarLetters.length === 0) {
            tehillim119Content.innerHTML = '<p>אין אותיות להצגה</p>';
            return;
        }
        
        // הוספת כל אותיות שם הנפטר
        const addedLetters = new Set();
        for (const letter of currentNiftarLetters) {
            if (!addedLetters.has(letter) && tehillim119[letter]) {
                addedLetters.add(letter);
                addTehillimLetterSection(letter);
            }
        }
        
        // הוספת אותיות "נשמה"
        const neshamahLetters = ['נ', 'ש', 'מ', 'ה'];
        for (const letter of neshamahLetters) {
            if (!addedLetters.has(letter) && tehillim119[letter]) {
                addedLetters.add(letter);
                addTehillimLetterSection(letter, true);
            }
        }
    }

    // הוספת סקשן לאות בתהילים
    function addTehillimLetterSection(letter, isNeshamah = false) {
        if (!tehillim119[letter]) return;
        
        const letterSection = document.createElement('div');
        letterSection.className = 'letter-section';
        letterSection.id = `letter-section-${letter}`;
        
        const titleClass = isNeshamah ? 'letter-heading neshamah-letter' : 'letter-heading';
        const titlePrefix = isNeshamah ? 'אות מהמילה "נשמה"' : 'אות מהשם';
        
        letterSection.innerHTML = `
            <div class="${titleClass}">
                ${titlePrefix}: ${letter} - פרק קי"ט תהילים
            </div>
        `;
        
        // הוספת הפסוקים
        const versesContainer = document.createElement('div');
        versesContainer.className = 'verses-container';
        
        tehillim119[letter].forEach((verse, index) => {
            const verseNum = index + 1;
            const verseElement = document.createElement('div');
            verseElement.className = 'tehillim-verse';
            verseElement.innerHTML = `
                <span class="verse-number">${verseNum}.</span> ${verse}
            `;
            
            versesContainer.appendChild(verseElement);
        });
        
        letterSection.appendChild(versesContainer);
        
        // הוספת כפתור הוספה אחד בסוף הסקשן שיוסיף את כל הפסוקים של האות
        const addAllButton = document.createElement('button');
        addAllButton.textContent = `הוסף את כל פסוקי האות ${letter} לדף הלימוד`;
        addAllButton.className = 'add-all-verses-button';
        
        // בדיקה אם כל הפסוקים כבר נבחרו
        const allVersesSelected = tehillim119[letter].every((verse, index) => {
            const verseNum = index + 1;
            return selectedTehillimVerses.some(v => 
                v.letter === letter && 
                v.chapter === 119 && 
                v.verse === verseNum
            );
        });
        
        if (allVersesSelected) {
            addAllButton.textContent = `כל פסוקי האות ${letter} כבר נבחרו`;
            addAllButton.disabled = true;
        }
        
        addAllButton.addEventListener('click', function() {
            // הוספת כל הפסוקים של האות
            let addedCount = 0;
            tehillim119[letter].forEach((verse, index) => {
                const verseNum = index + 1;
                // בדיקה אם הפסוק כבר נבחר
                const isSelected = selectedTehillimVerses.some(v => 
                    v.letter === letter && 
                    v.chapter === 119 && 
                    v.verse === verseNum
                );
                
                if (!isSelected) {
                    selectTehillimVerse(letter, 119, verseNum, verse);
                    addedCount++;
                }
            });
            
            // עדכון הכפתור
            addAllButton.textContent = `כל פסוקי האות ${letter} נוספו (${addedCount} פסוקים)`;
            addAllButton.disabled = true;
            
            // הצגת הודעה
            showTemporaryMessage(`נוספו ${addedCount} פסוקים מהאות ${letter}`);
        });
        
        letterSection.appendChild(addAllButton);
        tehillim119Content.appendChild(letterSection);
    }

    // בחירת פסוק תהילים
    function selectTehillimVerse(letter, chapter, verse, text) {
        // בדיקה אם הפסוק כבר נבחר
        const existingIndex = selectedTehillimVerses.findIndex(v => 
            v.letter === letter && 
            v.chapter === chapter && 
            v.verse === verse
        );
        
        if (existingIndex === -1) {
            // הוספת פסוק חדש
            selectedTehillimVerses.push({
                letter,
                chapter,
                verse,
                text,
                // להוסיף אינדקס אות בשם - אופציונלי
                letterIndex: currentNiftarLetters.findIndex(l => l === letter)
            });
            
            // שמירה בלוקל סטורג'
            saveTehillimVersesToLocalStorage();
            
            // הצגת הודעה
            showTemporaryMessage(`פסוק תהילים ${chapter}:${verse} התווסף בהצלחה לדף הלימוד`);
        }
    }

    // שמירת פסוקי תהילים בלוקל סטורג'
    function saveTehillimVersesToLocalStorage() {
        localStorage.setItem('selectedTehillimVerses', JSON.stringify(selectedTehillimVerses));
    }

    // טעינת פרק תהילים מה-API
    function fetchTehillimChapter(chapterNum) {
        selectedChapterContent.style.display = 'block';
        selectedChapterContent.innerHTML = 'טוען פרק תהילים...';
        
        const apiUrl = `https://www.sefaria.org/api/texts/Psalms.${chapterNum}?context=0`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (!data || !data.he || data.he.length === 0) {
                    selectedChapterContent.innerHTML = 'לא נמצא תוכן לפרק זה';
                    return;
                }
                
                let content = `<h3>תהילים פרק ${chapterNum}</h3><div class="chapter-text">`;
                
                data.he.forEach((verse, index) => {
                    content += `<p><span class="verse-number">${index + 1}.</span> ${verse}</p>`;
                });
                
                content += '</div>';
                selectedChapterContent.innerHTML = content;
            })
            .catch(error => {
                console.error('Error fetching Tehillim chapter:', error);
                selectedChapterContent.innerHTML = 'שגיאה בטעינת הפרק. נסה שוב מאוחר יותר.';
            });
    }

    // הצגת הודעת שגיאה
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // הסתרת ההודעה אחרי 3 שניות
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    // הצגת הודעה זמנית
    function showTemporaryMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'temp-message';
        messageElement.textContent = message;
        messageElement.style.position = 'fixed';
        messageElement.style.bottom = '20px';
        messageElement.style.right = '20px';
        messageElement.style.backgroundColor = '#4caf50';
        messageElement.style.color = 'white';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        messageElement.style.zIndex = '1000';
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transition = 'opacity 0.5s';
            
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 500);
        }, 3000);
    }

    // הכנה להדפסה - מעבר לדף ההדפסה
    function preparePrint() {
        window.location.href = 'print.html';
    }

    // אירועים
    processNameButton.addEventListener('click', processNameAndShow);
    preparePrintButton.addEventListener('click', preparePrint);
    
    // אירועי לשוניות
    const tabs = tehillimTabs.querySelectorAll('.tehillim-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // הסרת הקלאס 'active' מכל הלשוניות
            tabs.forEach(t => t.classList.remove('active'));
            
            // הוספת הקלאס 'active' ללשונית הנוכחית
            this.classList.add('active');
            
            // הסתרת כל התוכן
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // הצגת התוכן המתאים
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // אירועי כפתורי פרקים
    chapterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const chapterNum = this.dataset.chapter;
            fetchTehillimChapter(chapterNum);
        });
    });
    
    // Enter לחיצה על מקש
    niftarNameInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            processNameAndShow();
        }
    });

    // טעינת נתונים שמורים בטעינת הדף
    loadSavedData();
});
