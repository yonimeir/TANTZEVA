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

function getPrintContent() {
    return document.getElementById('print-content');
}

function setToggleButtonState(buttonId, isOn, onText, offText) {
    var btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    btn.classList.toggle('toggle-active', !!isOn);
    if (onText && offText) {
        btn.textContent = isOn ? onText : offText;
    }
}

function printSaveFatherName(value) {
    localStorage.setItem('niftarFatherName', (value || '').trim());
    refreshElMalehYizkorIfActive();
}

window.printSaveFatherName = printSaveFatherName;

/** פרקי תהילים נפוצים לביקור בקבר (כמו ברשימת «על הקבר» בדף התהילים) */
var PRINT_CEMETERY_PSALM_CHAPTERS = [16, 17, 23, 25, 33, 49, 91, 104, 130, 142, 150];

/**
 * סדר נהוג להקריאה על הקבר: תהילים לפי פרקים → קיט קי״ט לפי שם → קיט מלא → אל מלא ויזכור.
 * ברטנורא (משנה) לא כלול — זה רק הצגה/הסתרה של פירוש קיים.
 */
var PRINT_EXTRA_ORDER = {
    cemetery: 10,
    kit119name: 20,
    kit119full: 30,
    elmalehyizkor: 40
};

function removeOrderedPrintExtra(kind) {
    var canvas = getPrintContent();
    if (!canvas) return false;
    var existing = canvas.querySelector('.print-extra-insert[data-extra-kind="' + kind + '"]');
    if (!existing) return false;
    existing.remove();
    setExtraToggleState(kind, false);
    return true;
}

function setExtraToggleState(kind, isOn) {
    var ids = {
        cemetery: 'toggle-cemetery-btn',
        kit119name: 'toggle-kit119name-btn',
        kit119full: 'toggle-kit119full-btn',
        elmalehyizkor: 'toggle-elmalehyizkor-btn'
    };
    if (ids[kind]) setToggleButtonState(ids[kind], isOn);
}

function insertOrderedPrintExtra(innerHtml, kind) {
    var order = PRINT_EXTRA_ORDER[kind];
    if (order == null) order = 99;
    var canvas = getPrintContent();
    if (!canvas) return;
    removeOrderedPrintExtra(kind);
    var wrap = document.createElement('div');
    wrap.className = 'print-extra-insert';
    wrap.setAttribute('data-extra-order', String(order));
    wrap.setAttribute('data-extra-kind', kind);
    wrap.innerHTML = innerHtml.trim();

    var inserts = canvas.querySelectorAll('.print-extra-insert');
    var insertBeforeNode = null;
    for (var i = 0; i < inserts.length; i++) {
        var o = parseInt(inserts[i].getAttribute('data-extra-order'), 10);
        if (o > order) {
            insertBeforeNode = inserts[i];
            break;
        }
    }
    if (insertBeforeNode) {
        canvas.insertBefore(wrap, insertBeforeNode);
    } else {
        canvas.appendChild(wrap);
    }
    setExtraToggleState(kind, true);
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
        inner += '<p><span class="verse-num">' + numberToHebrew(i + 1) + '.</span> ' + line + '</p>';
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

window.printAppendTehillimCemetery = async function() {
    if (removeOrderedPrintExtra('cemetery')) return;
    var loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
    try {
        var chapters = PRINT_CEMETERY_PSALM_CHAPTERS;
        var batches = await Promise.all(chapters.map(function(ch) {
            return fetchPsalmsVerses(ch).then(function(verses) {
                return htmlPsalmsChapterBlock('תהילים פרק ' + formatHebrewNumeral(ch), verses);
            });
        }));
        insertOrderedPrintExtra(batches.join(''), 'cemetery');
    } catch (e) {
        console.error(e);
        alert('שגיאה בטעינת פרקי תהילים מהרשת: ' + (e.message || e));
    } finally {
        if (loading) loading.style.display = 'none';
    }
};

window.printAppendKit119ByName = function() {
    if (removeOrderedPrintExtra('kit119name')) return;
    var name = localStorage.getItem('niftarName') || '';
    var sections = buildKit119SectionsFromName(name);
    if (sections.length === 0) {
        insertOrderedPrintExtra(
            '<hr class="print-extra-sep"><div class="print-extra-block"><p class="print-extra-body">' +
                'לא נמצאו אותיות לקיט (הזינו שם נפטר בעמוד המשניות ושמרו, או הוסיפו ידנית שם בזיכרון הדפדפן).' +
                '</p></div>',
            'kit119name'
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
            html += '<p><span class="verse-num">' + numberToHebrew(v + 1) + '.</span> ' + s.verses[v] + '</p>';
        }
        html += '</div>';
    }
    insertOrderedPrintExtra(
        '<hr class="print-extra-sep"><div class="print-extra-block kit119-by-name">' + html + '</div>',
        'kit119name'
    );
};

window.printAppendKit119Full = async function() {
    if (removeOrderedPrintExtra('kit119full')) return;
    var loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
    try {
        var verses = await fetchPsalmsVerses(119);
        insertOrderedPrintExtra(
            htmlPsalmsChapterBlock('תהילים פרק קי״ט (מלא)', verses),
            'kit119full'
        );
    } catch (e) {
        console.error(e);
        alert('שגיאה בטעינת פרק קי״ט: ' + (e.message || e));
    } finally {
        if (loading) loading.style.display = 'none';
    }
};

function buildElMalehYizkorBlock() {
    var name = localStorage.getItem('niftarName') || '';
    var fatherName = localStorage.getItem('niftarFatherName') || '';
    var safe = escapeHtml(name || 'פלוני');
    var safeFather = escapeHtml(fatherName || '______');
    var fullName = safe + ' בן/בת ' + safeFather;
    return (
        '<hr class="print-extra-sep">' +
        '<div class="print-extra-block">' +
        '<h3 class="print-extra-title">נוסח מורחב — אל מלא רחמים</h3>' +
        '<div class="print-extra-body" style="text-align:center;line-height:2">' +
        '<p>אֵל מָלֵא רַחֲמִים, שׁוֹכֵן בַּמְּרוֹמִים, הַמְצֵא מְנוּחָה נְכוֹנָה עַל כַּנְפֵי הַשְּׁכִינָה בְּמַעֲלוֹת קְדוֹשִׁים וּטְהוֹרִים כְּזֹהַר הָרָקִיעַ מַזְהִירִים, לְנִשְׁמַת <strong>' +
        fullName +
        '</strong> שֶׁהָלַךְ/הָלְכָה לְעוֹלָמוֹ/לְעוֹלָמָהּ, בְּגַן עֵדֶן תְּהֵא מְנוּחָתוֹ/מְנוּחָתָהּ. לָכֵן בַּעַל הָרַחֲמִים יַסְתִּירֵהוּ/יַסְתִּירֶהָ בְּסֵתֶר כְּנָפָיו לְעוֹלָמִים, וְיִצְרֹר בִּצְרוֹר הַחַיִּים אֶת נִשְׁמָתוֹ/נִשְׁמָתָהּ, ה\' הוּא נַחֲלָתוֹ/נַחֲלָתָהּ, וְיָנוּחַ/וְתָנוּחַ בְּשָׁלוֹם עַל מִשְׁכָּבוֹ/מִשְׁכָּבָהּ, וְנֹאמַר אָמֵן.</p>' +
        '</div>' +
        '<h3 class="print-extra-title" style="margin-top:1em">יזכור</h3>' +
        '<div class="print-extra-body" style="text-align:center;line-height:2">' +
        '<p>יזכור אֱלֹהִים את נשמת <strong>' +
        fullName +
        '</strong> שעלתה למרום; בשכר הצדקה והתפילה הנאמרים להלן לעילוי נשמתה, תהא נשמה צרורה בצרור החיים עם נשמות אברהם יצחק ויעקב ושאר הצדיקים והצדקניות בגן עדן, ונאמר אמן.</p>' +
        '</div>' +
        '</div>'
    );
}

function refreshElMalehYizkorIfActive() {
    var canvas = getPrintContent();
    if (!canvas) return;
    var existing = canvas.querySelector('.print-extra-insert[data-extra-kind="elmalehyizkor"]');
    if (!existing) return;
    existing.remove();
    insertOrderedPrintExtra(buildElMalehYizkorBlock(), 'elmalehyizkor');
}

window.printAppendElMalehYizkor = function() {
    if (removeOrderedPrintExtra('elmalehyizkor')) return;
    insertOrderedPrintExtra(buildElMalehYizkorBlock(), 'elmalehyizkor');
};

window.printApplyFontFamily = function(fontFamily) {
    var canvas = getPrintContent();
    if (!canvas || !fontFamily) return;
    canvas.style.setProperty('--print-font-family', fontFamily);
    canvas.style.fontFamily = fontFamily;
    localStorage.setItem('printFontFamily', fontFamily);
    var fontSelect = document.getElementById('print-font-family');
    if (fontSelect) {
        fontSelect.value = fontFamily;
        fontSelect.style.fontFamily = fontFamily;
    }
};

window.printApplyFontSize = function(sizeValue) {
    var size = parseInt(sizeValue, 10);
    if (isNaN(size)) return;
    size = Math.max(10, Math.min(32, size));
    var canvas = getPrintContent();
    if (!canvas) return;
    canvas.style.setProperty('--print-base-size', size + 'pt');
    canvas.style.fontSize = size + 'pt';
    localStorage.setItem('printFontSize', String(size));
    var input = document.getElementById('print-font-size');
    if (input) input.value = String(size);
};

window.printDownloadWord = function() {
    var canvas = getPrintContent();
    if (!canvas) return;
    var niftarName = localStorage.getItem('niftarName') || 'דף-לימוד';
    var safeFileName = niftarName.replace(/[\\/:*?"<>|]+/g, '').trim() || 'דף-לימוד';
    var html =
        '<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8">' +
        '<style>' +
        'body{direction:rtl;text-align:right;font-family:' +
        (localStorage.getItem('printFontFamily') || "'David', 'Frank Ruhl Libre', serif") +
        ';font-size:' +
        (localStorage.getItem('printFontSize') || '16') +
        'pt;line-height:1.6;color:#000;}' +
        'h1,h2,h3{text-align:center}.mishnah-title{font-weight:bold;text-decoration:underline;margin-top:1em}' +
        '.bartenura-block{font-size:.82em;color:#444;margin-top:10px;padding-right:15px;border-right:3px solid #ccc}' +
        '.print-extra-body{font-size:.92em}.verse-num{font-weight:bold;margin-left:.25em}' +
        '</style></head><body>' +
        canvas.innerHTML +
        '</body></html>';
    var blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = safeFileName + '.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 1000);
};

window.printToggleCommand = function(command) {
    document.execCommand(command, false, null);
    updatePrintCommandButtons(command);
};

window.toggleBartenura = function() {
    var canvas = getPrintContent();
    if (!canvas) return;
    var isHidden = canvas.classList.toggle('hide-bartenura');
    localStorage.setItem('printHideBartenura', isHidden ? '1' : '0');
    setToggleButtonState('toggle-bart-btn', !isHidden, 'ברטנורא: דלוק', 'ברטנורא: כבוי');
};

function updatePrintCommandButtons(lastCommand) {
    var buttons = document.querySelectorAll('.command-toggle[data-command]');
    buttons.forEach(function(btn) {
        var command = btn.getAttribute('data-command');
        var isOn = false;
        try {
            isOn = document.queryCommandState(command);
        } catch (e) {
            isOn = false;
        }
        if (!isOn && lastCommand && command === lastCommand) {
            // יישורים לא תמיד מדווחים עקבית בדפדפנים; לפחות הלחיצה האחרונה תסומן.
            isOn = command.indexOf('justify') === 0;
        }
        if (isOn && command.indexOf('justify') === 0) {
            buttons.forEach(function(other) {
                if (other !== btn && (other.getAttribute('data-command') || '').indexOf('justify') === 0) {
                    other.setAttribute('aria-pressed', 'false');
                    other.classList.remove('toggle-active');
                }
            });
        }
        btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        btn.classList.toggle('toggle-active', !!isOn);
    });
}

function setupPrintControls() {
    var savedFont = localStorage.getItem('printFontFamily');
    var savedSize = localStorage.getItem('printFontSize');
    var savedFather = localStorage.getItem('niftarFatherName') || '';
    var fontSelect = document.getElementById('print-font-family');
    var sizeInput = document.getElementById('print-font-size');
    var fatherInput = document.getElementById('niftar-father-name');

    if (savedFont) {
        if (fontSelect) fontSelect.value = savedFont;
        window.printApplyFontFamily(savedFont);
    } else if (fontSelect) {
        fontSelect.style.fontFamily = fontSelect.value;
    }
    if (savedSize) {
        if (sizeInput) sizeInput.value = savedSize;
        window.printApplyFontSize(savedSize);
    }
    if (fatherInput) {
        fatherInput.value = savedFather;
        fatherInput.addEventListener('input', function() {
            printSaveFatherName(this.value);
        });
    }

    var isBartenuraVisible = localStorage.getItem('printHideBartenura') !== '1';
    setToggleButtonState('toggle-bart-btn', isBartenuraVisible, 'ברטנורא: דלוק', 'ברטנורא: כבוי');
    document.addEventListener('selectionchange', function() {
        if (document.activeElement && document.activeElement.id === 'print-content') {
            updatePrintCommandButtons();
        }
    });
}

// טעינת מידע בטעינת העמוד
document.addEventListener('DOMContentLoaded', async function() {
    var printContent = document.getElementById('print-content');
    var loadingOverlay = document.getElementById('loading');
    setupPrintControls();

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
                setToggleButtonState('toggle-bart-btn', false, 'ברטנורא: דלוק', 'ברטנורא: כבוי');
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

        printContent.innerHTML = htmlContent;

        if (localStorage.getItem('printHideBartenura') === '1') {
            printContent.classList.add('hide-bartenura');
            setToggleButtonState('toggle-bart-btn', false, 'ברטנורא: דלוק', 'ברטנורא: כבוי');
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

function formatHebrewNumeral(num) {
    var text = numberToHebrew(num);
    if (!text || text === String(num)) return text;
    if (text.length === 1) return text + '׳';
    return text.slice(0, -1) + '״' + text.slice(-1);
}
