// Mishnayot App v2 - Main JavaScript File

console.log('app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Stage 1: Verify access to global data from mishnah_index.js and mishnah_mappings.js
    if (typeof window.mishnahIndex !== 'undefined' && Array.isArray(window.mishnahIndex)) {
        console.log(`SUCCESS: window.mishnahIndex is available. Length: ${window.mishnahIndex.length}`);
    } else {
        console.error('CRITICAL FAILURE: window.mishnahIndex is NOT available or not an array.');
        alert('שגיאה קריטית: קובץ האינדקס של המשניות (mishnah_index.js) לא נטען כראוי או שהמשתנה window.mishnahIndex אינו תקין.');
        return; // Stop further execution if critical data is missing
    }

    // Check for masechetIdToApiName from mishnah_mappings.js (assuming it defines it globally)
    if (typeof window.masechetIdToApiName === 'object' && window.masechetIdToApiName !== null) {
        console.log('SUCCESS: window.masechetIdToApiName is available.');
        // Example: console.log('Mapping for Masechet 1 (Berakhot):', window.masechetIdToApiName["1"]);
    } else {
        console.error('CRITICAL FAILURE: window.masechetIdToApiName is NOT available or not an object.');
        alert('שגיאה קריטית: קובץ המיפוי של המסכתות (mishnah_mappings.js) לא נטען כראוי או שהמשתנה window.masechetIdToApiName אינו תקין.');
        return; // Stop further execution
    }

    // Add further application logic here in stages
    alert("שלב א' הושלם בהצלחה! נתוני האינדקס והמיפויים זמינים.");

}); 