// --- 1. BURGER MENU LOGIK ---
const burgerBtn = document.getElementById('burger-btn');
const mainNav = document.getElementById('main-nav');

if (burgerBtn && mainNav) {
    burgerBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        burgerBtn.classList.toggle('is-open');
    });
    
    // Schließe das Menü, wenn man auf einen Link klickt
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            burgerBtn.classList.remove('is-open');
        });
    });
}

// --- 2. TIMER LOGIC ---
function updateTimer() {
    const eventDate = new Date("June 19, 2026 16:00:00").getTime();
    
    setInterval(() => {
        const now = new Date().getTime();
        const diff = eventDate - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        // Desktop Anzeige
        if(document.getElementById("timer-desk")) {
            document.getElementById("timer-desk").innerText = `${d} Tage ${h}h ${m}m`;
        }
        
        // Mobile Anzeige (Nur Tage)
        if(document.getElementById("days-count")) {
            document.getElementById("days-count").innerText = d;
        }
    }, 1000);
}

updateTimer();

// === ERGEBNISSE AUS JSON LADEN ===
async function loadResults() {
    try {
        const response = await fetch('ergebnisse.json');
        const data = await response.json();
        
        // Lade jede Kategorie
        renderResultsTable('bambinis', data.bambinis);
        renderResultsTable('schueler', data.schueler);
        renderResultsTable('mixed', data.mixed);
        
    } catch (error) {
        console.error('Fehler beim Laden der Ergebnisse:', error);
    }
}

function renderResultsTable(category, results) {
    const table = document.getElementById(`table-${category}`);
    
    // Header
    let html = `
        <thead>
            <tr>
                <th>Nr.</th>
                <th>Teamname</th>
                <th>Teamzeit</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // Rows
    results.forEach(result => {
        html += `
            <tr>
                <td>${result.rank}</td>
                <td>${result.name}</td>
                <td>${result.time}</td>
            </tr>
        `;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

// Lade Ergebnisse beim Seitenstart
loadResults();

// === TAB SWITCHING FÜR ERGEBNISSE ===
const resultsTabButtons = document.querySelectorAll('.results-tabs .tab-btn');
const resultsTabPanels = document.querySelectorAll('.results-wrap .tab-panel');

resultsTabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active from all
        resultsTabButtons.forEach(btn => btn.classList.remove('active'));
        resultsTabPanels.forEach(panel => {
            panel.classList.add('is-hidden');
            panel.classList.remove('active');
        });
        
        // Add active to clicked
        button.classList.add('active');
        const targetPanel = document.getElementById(targetTab);
        if (targetPanel) {
            targetPanel.classList.remove('is-hidden');
            targetPanel.classList.add('active');
        }
    });
});
// === ANMELDEFORMULAR ===
const anmeldeForm = document.getElementById('anmeldeForm');

if (anmeldeForm) {
    anmeldeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Sammle alle Daten
        const formData = new FormData(anmeldeForm);
        const data = Object.fromEntries(formData);
        
        console.log('Anmeldedaten:', data);
        
        // Hier kannst du die Daten per AJAX an einen Server senden
        // oder per E-Mail verschicken (benötigt Backend)
        
        alert('Vielen Dank für deine Anmeldung! Wir melden uns in Kürze bei dir.');
        anmeldeForm.reset();
    });
}

// Formular Logik 
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('anmeldeForm');
    const dateInputs = form.querySelectorAll('input[type="date"]');
    
    // 1. ZUKUNFTS-DATEN IM KALENDER SPERREN
    // Wir setzen das "max" Attribut auf das heutige Datum
    const today = new Date().toISOString().split("T")[0];
    dateInputs.forEach(input => {
        input.setAttribute('max', today);
    });

    // 2. VALIDIERUNGS-LOGIK BEIM ABSENDEN
    form.addEventListener('submit', function(e) {
        let hasError = false;
        
        // Alle bisherigen Fehlermeldungen entfernen
        document.querySelectorAll('.error-msg').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        // E-Mail Validierung
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showError(emailInput, "Bitte eine gültige E-Mail-Adresse eingeben.");
            hasError = true;
        }

        // Geburtsdatum Validierung (Darf nicht in der Zukunft liegen)
        dateInputs.forEach(input => {
            const selectedDate = new Date(input.value);
            const now = new Date();
            
            if (selectedDate > now) {
                showError(input, "Datum darf nicht in der Zukunft liegen.");
                hasError = true;
            }
        });

        // Wenn Fehler da sind: Absenden stoppen
        if (hasError) {
            e.preventDefault();
            // Zum ersten Fehler scrollen
            document.querySelector('.input-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    function showError(input, message) {
        input.classList.add('input-error');
        const msg = document.createElement('span');
        msg.className = 'error-msg';
        msg.innerText = message;
        input.parentNode.appendChild(msg);
    }
});