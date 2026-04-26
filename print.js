// טעינת מידע בטעינת העמוד
document.addEventListener('DOMContentLoaded', async () => {
    const printContent = document.getElementById('print-content');
    const loadingOverlay = document.getElementById('loading');

    try {
        // קריאת נתונים מ-localStorage
        const niftarName = localStorage.getItem('niftarName') || '';
        const savedMishnayotRaw = localStorage.getItem('selectedMishnayot');
        
        let selectedMishnayot = [];
        if (savedMishnayotRaw) {
            selectedMishnayot = JSON.parse(savedMishnayotRaw);
        }

        // אם אין משניות, להציג הודעה פשוטה ולסיים
        if (selectedMishnayot.length === 0) {
            printContent.innerHTML = '<h1 style="text-align:center; margin-top:50px;">לא נבחרו משניות להדפסה</h1>';
            loadingOverlay.style.display = 'none';
            return;
        }

        // מיון המשניות לפי סדר הבחירה (letterIndex)
        selectedMishnayot.sort((a, b) => (a.letterIndex || 0) - (b.letterIndex || 0));

        // בניית מבנה ה-HTML הראשוני לדף
        let htmlContent = `
            ${niftarName ? `<h1>לעילוי נשמת</h1><h2>${niftarName}</h2>` : `<h1>משניות ללימוד</h1>`}
            <hr style="margin-bottom: 20px;">
        `;

        // מעבר על כל המשניות ושאיבתן מ-API ספריא
        for (const mishnah of selectedMishnayot) {
            const apiName = window.masechetIdToApiName ? window.masechetIdToApiName[mishnah.masechetId] : '';
            if (!apiName) continue;

            const perekNum = mishnah.perekNum || mishnah.perek || 1;
            const mishnahNum = mishnah.mishnahNum || mishnah.mishnah || 1;
            
            // תרגום לשם המסכת קריא
            const masechetDisplay = (window.masechetIdToDisplayName && window.masechetIdToDisplayName[mishnah.masechetId]) 
                                    || ('מסכת ' + mishnah.masechetId);

            // קריאות ל-API של ספריא (טקסט משנה + פירוש ברטנורא)
            const formattedApiName = apiName.replace(/ /g, '_');
            const textUrl = `https://www.sefaria.org/api/texts/${formattedApiName}.${perekNum}.${mishnahNum}?context=0`;
            const bartenuraUrl = `https://www.sefaria.org/api/texts/Bartenura_on_${formattedApiName}.${perekNum}.${mishnahNum}?context=0`;

            const [textRes, bartRes] = await Promise.all([
                fetch(textUrl).catch(e => null),
                fetch(bartenuraUrl).catch(e => null)
            ]);

            let mishnahText = 'לא ניתן היה לטעון את תוכן המשנה.';
            let bartenuraText = '';

            // חלץ טקסט משנה
            if (textRes && textRes.ok) {
                const textData = await textRes.json();
                if (textData && textData.he) {
                    mishnahText = Array.isArray(textData.he) ? textData.he.join('<br>') : textData.he;
                }
            }

            // חלץ טקסט ברטנורא במקרה שיש
            if (bartRes && bartRes.ok) {
                const bartData = await bartRes.json();
                if (bartData && bartData.he) {
                    bartenuraText = Array.isArray(bartData.he) ? bartData.he.join('<br>') : bartData.he;
                }
            }

            // הוספת הבלוק של המשנה הנוכחית לתוך ה-HTML
            htmlContent += `
                <div class="mishnah-block">
                    <div class="mishnah-title">${masechetDisplay} פרק ${numberToHebrew(perekNum)} משנה ${numberToHebrew(mishnahNum)}</div>
                    <div class="mishnah-content">${mishnahText}</div>
                    ${bartenuraText ? `
                        <div class="bartenura-block">
                            <strong>ברטנורא: </strong>${bartenuraText}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // הוספת אזכרה / אל מלא רחמים בסוף אם יש שם
        if (niftarName) {
            htmlContent += `
                <hr style="margin-top: 30px; margin-bottom: 20px;">
                <h3 style="text-align:center;">תפילת א-ל מלא רחמים</h3>
                <div style="text-align: center; line-height: 2;">
                    אֵל מָלֵא רַחֲמִים שׁוֹכֵן בַּמְּרוֹמִים, הַמְצֵא מְנוּחָה נְכוֹנָה עַל כַּנְפֵי הַשְּׁכִינָה, בְּמַעֲלוֹת קְדוֹשִׁים וּטְהוֹרִים כְּזֹהַר הָרָקִיעַ מַזְהִירִים, אֶת נִשְׁמַת ${niftarName} שֶׁהָלַךְ לְעוֹלָמוֹ, בַּעֲבוּר שֶׁנָּדְבוּ צְדָקָה בְּעַד הַזְכָּרַת נִשְׁמָתוֹ, בְּגַן עֵדֶן תְּהֵא מְנוּחָתוֹ, לָכֵן בַּעַל הָרַחֲמִים יַסְתִּירֵהוּ בְּסֵתֶר כְּנָפָיו לְעוֹלָמִים, וְיִצְרוֹר בִּצְרוֹר הַחַיִּים אֶת נִשְׁמָתוֹ, ה' הוּא נַחֲלָתוֹ, וְיָנוּחַ בְּשָׁלוֹם עַל מִשְׁכָּבוֹ, וְנֹאמַר אָמֵן.
                </div>
            `;
        }

        // הצגת הנתונים על הקנבס והעלמת מסך הטעינה
        printContent.innerHTML = htmlContent;

    } catch (e) {
        console.error("שגיאה בהכנת עמוד ההדפסה:", e);
        printContent.innerHTML = `<h2 style="color:red;text-align:center;">אירעה שגיאה בטעינת הנתונים: ${e.message}</h2>`;
    } finally {
        // עלמת אנימציית הטעינה תמיד בסוף
        loadingOverlay.style.display = 'none';
    }
});

// פונקציית עזר להמרת מספר רגיל למספר עברי (א, ב, ג...)
function numberToHebrew(num) {
    if (!num || isNaN(num) || num < 1) return String(num);
    
    // מיפוי פשוט למספרים נפוצים בפרקים ומשניות (עד ק')
    const hebrewLetters = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 
        'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 
        'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט', 'ל', 
        'לא', 'לב', 'לג', 'לד', 'לה', 'לו', 'לז', 'לח', 'לט', 'מ', 
        'מא', 'מב', 'מג', 'מד', 'מה', 'מו', 'מז', 'מח', 'מט', 'נ', 
        'נא', 'נב', 'נג', 'נד', 'נה', 'נו', 'נז', 'נח', 'נט', 'ס', 
        'סא', 'סב', 'סג', 'סד', 'סה', 'סו', 'סז', 'סח', 'סט', 'ע', 
        'עא', 'עב', 'עג', 'עד', 'עה', 'עו', 'עז', 'עח', 'עט', 'פ', 
        'פא', 'פב', 'פג', 'פד', 'פה', 'פו', 'פז', 'פח', 'פט', 'צ', 
        'צא', 'צב', 'צג', 'צד', 'צה', 'צו', 'צז', 'צח', 'צט', 'ק'];
        
    return num <= 100 ? hebrewLetters[num] : String(num);
}
