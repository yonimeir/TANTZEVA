/** במסכת אבות ספריא משתמשים ב-Mishnah_Avot; במיפוי שלנו לעיתים Pirkei_Avot — זה לא קיים ב-API */
function sefariaMishnahBookSlug(slug) {
    return slug === 'Pirkei_Avot' ? 'Avot' : slug;
}

function escapeHtml(str) {
    if (str == null || str === '') return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

/** פרקי תהילים נפוצים לביקור בקבר (כמו ברשימת «על הקבר» בדף התהילים) */
var PRINT_CEMETERY_PSALM_CHAPTERS = [16, 17, 23, 25, 33, 49, 91, 104, 130, 142, 150];

function appendHtmlToPrint(html) {
    const printContent = document.getElementById('print-content');
    if (!printContent) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    printContent.appendChild(tpl.content.cloneNode(true));
}

async function fetchPsalmsVerses(chapterNum) {
    const res = await fetch(`https://www.sefaria.org/api/texts/Psalms.${chapterNum}?context=0`);
    if (!res.ok) throw new Error('פרק ' + chapterNum);
    const data = await res.json();
    if (!data || !data.he) return [];
    return Array.isArray(data.he) ? data.he : [data.he];
}

function htmlPsalmsChapterBlock(heading, versesLines) {
    let inner = `<h3 class="print-extra-title">${heading}</h3><div class="print-extra-body mishnah-text-flow">`;
    versesLines.forEach(function(line, i) {
        inner += '<p><span class="verse-num">' + (i + 1) + '.</span> ' + line + '</p>';
    });
    inner += '</div>';
    return '<hr class="print-extra-sep"><div class="print-extra-block">' + inner + '</div>';
}

function normalizeHebrewLetter(ch) {
    var map = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
    return map[ch] || ch;
}

function lettersOrderedFromName(name) {
    var ordered = [];
    if (!name) return ordered;
    for (var i = 0; i < name.length; i++) {
        var c = name[i];
        if (/[\u0590-\u05FF]/.test(c)) ordered.push(normalizeHebrewLetter(c));
    }
    return ordered;
}

function buildKit119SectionsFromName(name) {
    var tbl = typeof window.tehillim119 !== 'undefined' ? window.tehillim119 : null;
    if (!tbl) return [];
    var ordered = lettersOrderedFromName(name);
    var seen = {};
    var sections = [];
    for (var i = 0; i < ordered.length; i++) {
        var L = ordered[i];
        if (!seen[L] && tbl[L]) {
            seen[L] = true;
            sections.push({ letter: L, verses: tbl[L], neshamah: false });
        }
    }
    var nesh = ['נ', 'ש', 'מ', 'ה'];
    for (var j = 0; j < nesh.length; j++) {
        var LL = nesh[j];
        if (!seen[LL] && tbl[LL]) {
            seen[LL] = true;
            sections.push({ letter: LL, verses: tbl[LL], neshamah: true });
        }
    }
    return sections;
}

window.printExtrasToggleBartenura = function() {
    var b = document.getElementById('toggle-bart-btn');
    if (b) b.click();
};

window.printAppendTehillimCemetery = async function() {
    var loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
    try {
        var chapters = PRINT_CEMETERY_PSALM_CHAPTERS;
        var batches = await Promise.all(chapters.map(function(ch) {
            return fetchPsalmsVerses(ch).then(function(verses) {
                return htmlPsalmsChapterBlock('תהילים פרק ' + ch, verses);
            });
        }));
        batches.forEach(function(html) { appendHtmlToPrint(html); });
    } catch (e) {
        console.error(e);
        alert('שגיאה בטעינת פרקי תהילים מהרשת: ' + (e.message || e));
    } finally {
        if (loading) loading.style.display = 'none';
    }
};

window.printAppendKit119ByName = function() {
    var name = localStorage.getItem('niftarName') || '';
    var sections = buildKit119SectionsFromName(name);
    if (sections.length === 0) {
        appendHtmlToPrint(
            '<hr class="print-extra-sep"><div class="print-extra-block"><p class="print-extra-body">' +
            'לא נמצאו אותיות לקיט (הזינו שם נפטר בעמוד המשניות ושמרו, או הוסיפו ידנית שם בזיכרון הדפדפן).' +
            '</p></div>'
        );
        return;
    }
    var html = '';
    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        var title = s.neshamah
            ? ('אות מהמילה «נשמה»: ' + s.letter + ' — פרק קי״ט')
            : ('אות מהשם: ' + s.letter + ' — פרק קי״ט');
        html += '<h3 class="print-extra-title">' + title + '</h3><div class="print-extra-body mishnah-text-flow">';
        for (var v = 0; v < s.verses.length; v++) {
            html += '<p><span class="verse-num">' + (v + 1) + '.</span> ' + s.verses[v] + '</p>';
        }
        html += '</div>';
    }
    appendHtmlToPrint('<hr class="print-extra-sep"><div class="print-extra-block kit119-by-name">' + html + '</div>');
};

window.printAppendKit119Full = async function() {
    var loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
    try {
        var verses = await fetchPsalmsVerses(119);
        appendHtmlToPrint(htmlPsalmsChapterBlock('תהילים פרק קי״ט (מלא)', verses));
    } catch (e) {
        console.error(e);
        alert('שגיאה בטעינת פרק קי״ט: ' + (e.message || e));
    } finally {
        if (loading) loading.style.display = 'none';
    }
};

window.printAppendElMalehYizkor = function() {
    var name = localStorage.getItem('niftarName') || '';
    var safe = escapeHtml(name || 'פלוני');
    var block =
        '<hr class="print-extra-sep">' +
        '<div class="print-extra-block">' +
        '<h3 class="print-extra-title">נוסח מורחב — אל מלא רחמים</h3>' +
        '<div class="print-extra-body" style="text-align:center;line-height:2">' +
        '<p>אֵל מָלֵא רַחֲמִים, שׁוֹכֵן בַּמְּרוֹמִים, הַמְצֵא מְנוּחָה נְכוֹנָה עַל כַּנְפֵי הַשְּׁכִינָה בְּמַעֲלוֹת קְדוֹשִׁים וּטְהוֹרִים כְּזֹהַר הָרָקִיעַ מַזְהִירִים, לְנִשְׁמַת <strong>' +
        safe +
        '</strong> שֶׁהָלַךְ/הָלְכָה לְעוֹלָמוֹ/לְעוֹלָמָהּ, בְּגַן עֵדֶן תְּהֵא מְנוּחָתוֹ/מְנוּחָתָהּ. לָכֵן בַּעַל הָרַחֲמִים יַסְתִּירֵהוּ/יַסְתִּירֶהָ בְּסֵתֶר כְּנָפָיו לְעוֹלָמִים, וְיִצְרֹר בִּצְרוֹר הַחַיִּים אֶת נִשְׁמָתוֹ/נִשְׁמָתָהּ, ה\' הוּא נַחֲלָתוֹ/נַחֲלָתָהּ, וְיָנוּחַ/וְתָנוּחַ בְּשָׁלוֹם עַל מִשְׁכָּבוֹ/מִשְׁכָּבָהּ, וְנֹאמַר אָמֵן.</p>' +
        '</div>' +
        '<h3 class="print-extra-title" style="margin-top:1em">יזכור</h3>' +
        '<div class="print-extra-body" style="text-align:center;line-height:2">' +
        '<p>יזכור אֱלֹהִים את נשמת <strong>' +
        safe +
        '</strong> שעלתה למרום; בשכר הצדקה והתפילה הנאמרים להלן לעילוי נשמתה, תהא נשמה צרורה בצרור החיים עם נשמות אברהם יצחק ויעקב ושאר הצדיקים והצדקניות בגן עדן, ונאמר אמן.</p>' +
        '</div>' +
        '</div>';
    appendHtmlToPrint(block);
};

// טעינת מידע בטעינת העמוד
document.addEventListener('DOMContentLoaded', async function() {
    var printContent = document.getElementById('print-content');
    var loadingOverlay = document.getElementById('loading');

    try {
        var niftarName = localStorage.getItem('niftarName') || '';
        var savedMishnayotRaw = localStorage.getItem('selectedMishnayot');

        var selectedMishnayot = [];
        if (savedMishnayotRaw) {
            selectedMishnayot = JSON.parse(savedMishnayotRaw);
        }

        var htmlContent = '';

        if (selectedMishnayot.length === 0) {
            htmlContent =
                (niftarName
                    ? '<h1>לעילוי נשמת</h1><h2>' + escapeHtml(niftarName) + '</h2>'
                    : '<h1>דף הדפסה</h1>') +
                '<p style="color:#444;text-align:center;margin:14px 0 18px;">לא נבחרו משניות. ניתן להוסיף תהילים ותפילות מ«תוספות להדפסה» בסרגל למעלה.</p>' +
                '<hr style="margin-bottom: 20px;">';
            printContent.innerHTML = htmlContent;
            if (localStorage.getItem('printHideBartenura') === '1') {
                printContent.classList.add('hide-bartenura');
                var bartBtn0 = document.getElementById('toggle-bart-btn');
                if (bartBtn0) bartBtn0.innerHTML = '📖 הצג ברטנורא';
            }
            return;
        }

        selectedMishnayot.sort(function(a, b) {
            return (a.letterIndex || 0) - (b.letterIndex || 0);
        });

        htmlContent =
            (niftarName
                ? '<h1>לעילוי נשמת</h1><h2>' + escapeHtml(niftarName) + '</h2>'
                : '<h1>משניות ללימוד</h1>') +
            '<hr style="margin-bottom: 20px;">';

        for (var mi = 0; mi < selectedMishnayot.length; mi++) {
            var mishnah = selectedMishnayot[mi];
            var mid = mishnah.masechetId != null ? String(mishnah.masechetId) : '';
            var apiName = window.masechetIdToApiName ? window.masechetIdToApiName[mid] : '';
            if (!apiName) continue;

            var perekNum = mishnah.perekNum || mishnah.perek || 1;
            var mishnahNum = mishnah.mishnahNum || mishnah.mishnah || 1;

            var masechetDisplay =
                (window.masechetIdToDisplayName && window.masechetIdToDisplayName[mid]) ||
                'מסכת ' + mid;

            var bookSlug = apiName.replace(/ /g, '_');
            if (bookSlug.indexOf('Mishnah_') === 0) {
                bookSlug = bookSlug.slice('Mishnah_'.length);
            }
            bookSlug = sefariaMishnahBookSlug(bookSlug);

            var textUrl =
                'https://www.sefaria.org/api/texts/Mishnah_' +
                bookSlug +
                '.' +
                perekNum +
                '.' +
                mishnahNum +
                '?context=0';
            var bartenuraUrl =
                'https://www.sefaria.org/api/texts/Bartenura_on_Mishnah_' +
                bookSlug +
                '.' +
                perekNum +
                '.' +
                mishnahNum +
                '?context=0';

            var cacheKey = 'mishnah_' + mid + '_' + perekNum + '_' + mishnahNum;
            var mishnahText = '';
            var bartenuraText = '';
            try {
                var cached = localStorage.getItem(cacheKey);
                if (cached) {
                    var parsed = JSON.parse(cached);
                    if (parsed.text) mishnahText = parsed.text;
                    if (parsed.commentary) bartenuraText = parsed.commentary;
                }
            } catch (e) {}

            if (!mishnahText) {
                var textRes = await fetch(textUrl).catch(function() {
                    return null;
                });
                var bartRes = await fetch(bartenuraUrl).catch(function() {
                    return null;
                });

                mishnahText = 'לא ניתן היה לטעון את תוכן המשנה.';

                if (textRes && textRes.ok) {
                    var textData = await textRes.json();
                    if (textData && textData.he) {
                        mishnahText = Array.isArray(textData.he) ? textData.he.join('<br>') : textData.he;
                    }
                }

                if (bartRes && bartRes.ok) {
                    var bartData = await bartRes.json();
                    if (bartData && bartData.he) {
                        bartenuraText = Array.isArray(bartData.he) ? bartData.he.join('<br>') : bartData.he;
                    }
                }
            } else if (!bartenuraText) {
                var bartRes2 = await fetch(bartenuraUrl).catch(function() {
                    return null;
                });
                if (bartRes2 && bartRes2.ok) {
                    var bartData2 = await bartRes2.json();
                    if (bartData2 && bartData2.he) {
                        bartenuraText = Array.isArray(bartData2.he)
                            ? bartData2.he.join('<br>')
                            : bartData2.he;
                    }
                }
            }

            htmlContent +=
                '<div class="mishnah-block">' +
                '<div class="mishnah-title">' +
                masechetDisplay +
                ' פרק ' +
                numberToHebrew(perekNum) +
                ' משנה ' +
                numberToHebrew(mishnahNum) +
                '</div>' +
                '<div class="mishnah-content">' +
                mishnahText +
                '</div>' +
                (bartenuraText
                    ? '<div class="bartenura-block"><strong>ברטנורא: </strong>' + bartenuraText + '</div>'
                    : '') +
                '</div>';
        }

        if (niftarName) {
            htmlContent +=
                '<hr style="margin-top: 30px; margin-bottom: 20px;">' +
                '<h3 style="text-align:center;">תפילת א־ל מלא רחמים</h3>' +
                '<div style="text-align: center; line-height: 2;">' +
                'אֵל מָלֵא רַחֲמִים שׁוֹכֵן בַּמְּרוֹמִים, הַמְצֵא מְנוּחָה נְכוֹנָה עַל כַּנְפֵי הַשְּׁכִינָה, בְּמַעֲלוֹת קְדוֹשִׁים וּטְהוֹרִים כְּזֹהַר הָרָקִיעַ מַזְהִירִים, אֶת נִשְׁמַת ' +
                escapeHtml(niftarName) +
                ' שֶׁהָלַךְ לְעוֹלָמוֹ, בַּעֲבוּר שֶׁנָּדְבוּ צְדָקָה בְּעַד הַזְכָּרַת נִשְׁמָתוֹ, בְּגַן עֵדֶן תְּהֵא מְנוּחָתוֹ, לָכֵן בַּעַל הָרַחֲמִים יַסְתִּירֵהוּ בְּסֵתֶר כְּנָפָיו לְעוֹלָמִים, וְיִצְרוֹר בִּצְרוֹר הַחַיִּים אֶת נִשְׁמָתוֹ, ה\' הוּא נַחֲלָתוֹ, וְיָנוּחַ בְּשָׁלוֹם עַל מִשְׁכָּבוֹ, וְנֹאמַר אָמֵן.' +
                '</div>';
        }

        printContent.innerHTML = htmlContent;

        if (localStorage.getItem('printHideBartenura') === '1') {
            printContent.classList.add('hide-bartenura');
            var bartBtn = document.getElementById('toggle-bart-btn');
            if (bartBtn) bartBtn.innerHTML = '📖 הצג ברטנורא';
        }
    } catch (e) {
        console.error('שגיאה בהכנת עמוד ההדפסה:', e);
        printContent.innerHTML =
            '<h2 style="color:red;text-align:center;">אירעה שגיאה בטעינת הנתונים: ' +
            escapeHtml(e.message) +
            '</h2>';
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
});

function numberToHebrew(num) {
    if (!num || isNaN(num) || num < 1) return String(num);

    var hebrewLetters = [
        '',
        'א',
        'ב',
        'ג',
        'ד',
        'ה',
        'ו',
        'ז',
        'ח',
        'ט',
        'י',
        'יא',
        'יב',
        'יג',
        'יד',
        'טו',
        'טז',
        'יז',
        'יח',
        'יט',
        'כ',
        'כא',
        'כב',
        'כג',
        'כד',
        'כה',
        'כו',
        'כז',
        'כח',
        'כט',
        'ל',
        'לא',
        'לב',
        'לג',
        'לד',
        'לה',
        'לו',
        'לז',
        'לח',
        'לט',
        'מ',
        'מא',
        'מב',
        'מג',
        'מד',
        'מה',
        'מו',
        'מז',
        'מח',
        'מט',
        'נ',
        'נא',
        'נב',
        'נג',
        'נד',
        'נה',
        'נו',
        'נז',
        'נח',
        'נט',
        'ס',
        'סא',
        'סב',
        'סג',
        'סד',
        'סה',
        'סו',
        'סז',
        'סח',
        'סט',
        'ע',
        'עא',
        'עב',
        'עג',
        'עד',
        'עה',
        'עו',
        'עז',
        'עח',
        'עט',
        'פ',
        'פא',
        'פב',
        'פג',
        'פד',
        'פה',
        'פו',
        'פז',
        'פח',
        'פט',
        'צ',
        'צא',
        'צב',
        'צג',
        'צד',
        'צה',
        'צו',
        'צז',
        'צח',
        'צט',
        'ק'
    ];

    return num <= 100 ? hebrewLetters[num] : String(num);
}
