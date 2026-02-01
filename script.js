// --- 1. BURGER MENU LOGIK ---
const burgerBtn = document.getElementById('burger-btn');
const mainNav = document.getElementById('main-nav');

if (burgerBtn && mainNav) {
    burgerBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        burgerBtn.classList.toggle('is-open');
    });
    
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
        
        const timerDesk = document.getElementById("timer-desk");
        if(timerDesk) {
            timerDesk.innerText = `${d} Tage ${h}h ${m}m`;
        }
        
        const daysCount = document.getElementById("days-count");
        if(daysCount) {
            daysCount.innerText = d;
        }
    }, 1000);
}

updateTimer();

// === ERGEBNISSE AUS JSON LADEN ===
async function loadResults() {
    try {
        const response = await fetch('ergebnisse.json');
        const data = await response.json();
        
        renderResultsTable('bambinis', data.bambinis);
        renderResultsTable('schueler', data.schueler);
        renderResultsTable('mixed', data.mixed);
        
    } catch (error) {
        console.error('Fehler beim Laden der Ergebnisse:', error);
    }
}

function renderResultsTable(category, results) {
    const table = document.getElementById(`table-${category}`);
    if (!table) return;
    
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

loadResults();

// === TAB SWITCHING ===
const resultsTabButtons = document.querySelectorAll('.results-tabs .tab-btn');
const resultsTabPanels = document.querySelectorAll('.results-wrap .tab-panel');

resultsTabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        resultsTabButtons.forEach(btn => btn.classList.remove('active'));
        resultsTabPanels.forEach(panel => {
            panel.classList.add('is-hidden');
            panel.classList.remove('active');
        });
        
        button.classList.add('active');
        const targetPanel = document.getElementById(targetTab);
        if (targetPanel) {
            targetPanel.classList.remove('is-hidden');
            targetPanel.classList.add('active');
        }
    });
});

// === POPUP FUNKTIONEN ===
function showPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closePopup() {
    const popup = document.getElementById('successPopup');
    if (popup) {
        popup.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// === FORMULAR HANDLING ===
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM geladen');
    
    const form = document.getElementById('anmeldeForm');
    if (!form) {
        console.log('Formular nicht gefunden');
        return;
    }
    
    console.log('Formular gefunden!');
    
    // Datums-Validierung Setup
    const dateInputs = form.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split("T")[0];
    dateInputs.forEach(input => {
        input.setAttribute('max', today);
    });
    
    // Popup Overlay Click
    const popup = document.getElementById('successPopup');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                closePopup();
            }
        });
    }
    
    // Form Submit Handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Formular wird abgeschickt');
        
        // Fehler zurücksetzen
        document.querySelectorAll('.error-msg').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        
        let hasError = false;
        
        // E-Mail validieren
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput && !emailRegex.test(emailInput.value)) {
            showError(emailInput, "Bitte gültige E-Mail eingeben.");
            hasError = true;
        }
        
        // Datum validieren
        dateInputs.forEach(input => {
            if (input.value) {
                const selectedDate = new Date(input.value);
                const now = new Date();
                if (selectedDate > now) {
                    showError(input, "Datum darf nicht in Zukunft liegen.");
                    hasError = true;
                }
            }
        });
        
        if (hasError) {
            const firstError = document.querySelector('.input-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Formular absenden
        const formData = new FormData(form);
        const button = form.querySelector('button[type="submit"]');
        const buttonText = button.textContent;
        
        button.disabled = true;
        button.textContent = 'Wird gesendet...';
        button.style.opacity = '0.6';
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log('Response:', data);
            
            if (data.success) {
                console.log('Erfolg!');
                showPopup();
                form.reset();
            } else {
                alert('❌ Fehler beim Senden. Bitte erneut versuchen.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            alert('❌ Netzwerkfehler. Bitte Verbindung prüfen.');
        }
        
        button.disabled = false;
        button.textContent = buttonText;
        button.style.opacity = '1';
    });
    
    function showError(input, message) {
        input.classList.add('input-error');
        const msg = document.createElement('span');
        msg.className = 'error-msg';
        msg.innerText = message;
        input.parentNode.appendChild(msg);
    }
});
// Marquee Bilder verdoppeln für Endlos-Effekt
const marqueeContent = document.getElementById('marquee-content');
if (marqueeContent) {
    marqueeContent.innerHTML += marqueeContent.innerHTML;
}

// Lightbox Funktionen
function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = src;
    lb.classList.add('active');
}
window.closeLightbox = function() {
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.classList.remove('active'); // Das hier nimmt das "display: flex" wieder weg
        document.body.style.overflow = 'auto'; // Erlaubt das Scrollen wieder
    }
};