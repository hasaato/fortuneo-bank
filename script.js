// ============================================================
// 1. CONFIGURATION INITIALE
// ============================================================

// Ton solde de départ (C'est ici que l'argent est stocké en mémoire)
let solde = 42000;

(function() {
    // Initialisation EmailJS
    emailjs.init("qxKUMUEPAPu1tGGdW"); 
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
// 4. LOGIQUE DE VIREMENT (C'est ici que la magie opère !)
// ============================================================

function confirmPayment() {
    // 1. On récupère les valeurs
    const name = document.getElementById('pay-name').value.trim();
    const iban = document.getElementById('pay-iban').value.trim();
    const amountInput = document.getElementById('pay-amount').value;
    const amount = parseFloat(amountInput); // On transforme le texte en vrai nombre

    // 2. Vérifications de sécurité
    if (name === "" || isNaN(amount) || amount <= 0) {
        alert("⚠️ Erreur : Veuillez entrer un nom et un montant valide.");
        return;
    }

    if (amount > solde) {
        alert("⛔ Fonds insuffisants ! Vous ne pouvez pas virer plus que votre solde.");
        return;
    }

    // 3. LE CALCUL (On retire l'argent)
    solde = solde - amount;

    // 4. Mise à jour de l'affichage (On remplace le texte sur l'écran)
    updateSoldeDisplay();

    // 5. On ajoute la ligne dans l'historique (Bonus visuel)
    addTransactionToHistory(name, amount);

    // 6. Envoi de l'email (EmailJS)
    const templateParams = {
        beneficiary_name: name,
        iban: iban,
        amount: amount.toFixed(2), // Force 2 chiffres après la virgule
        date: new Date().toLocaleDateString('fr-FR')
    };

    emailjs.send('service_hhzg4pg', 'template_q5mibvf', templateParams)
        .then(function() {
            alert(`✅ Virement de ${amount}€ effectué !\nNouveau solde : ${formatMoney(solde)}`);
            
            // Nettoyage du formulaire et retour à l'accueil
            document.getElementById('pay-name').value = "";
            document.getElementById('pay-iban').value = "";
            document.getElementById('pay-amount').value = "";
            showPage('page-comptes', 'btn-nav-comptes');

        }, function(error) {
            alert("Virement effectué sur l'appli, mais erreur d'envoi mail.");
            showPage('page-comptes', 'btn-nav-comptes');
        });
}

// ============================================================
// 5. FONCTIONS UTILES (Affichage et Historique)
// ============================================================

// Met à jour le gros chiffre du solde en haut
function updateSoldeDisplay() {
    const soldeElement = document.getElementById('solde-text');
    // Cette ligne formate le nombre en français (ex: 1 500,00 €)
    soldeElement.innerText = formatMoney(solde);
}

// Fonction pour écrire joliment les euros
function formatMoney(amount) {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// Ajoute la transaction dans la liste "Historique"
function addTransactionToHistory(name, amount) {
    const historyContainer = document.getElementById('view-historique');
    
    // On crée le bloc HTML de la transaction
    const newTransactionHTML = `
        <div class="transaction">
            <div class="icon-circle" style="background-color: #eee;">📤</div>
            <div class="details">Virement vers ${name}</div>
            <div class="amount negative">-${formatMoney(amount)}</div>
        </div>
    `;

    // On l'insère juste après la date (en 2ème position)
    // insertAdjacentHTML permet d'ajouter du code sans effacer le reste
    const dateLabel = historyContainer.querySelector('.date-label');
    dateLabel.insertAdjacentHTML('afterend', newTransactionHTML);
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

    // Simulation de succès
    alert("✅ Sécurité mise à jour !\nVotre mot de passe a bien été modifié.");

    // On vide les champs
    document.getElementById('old-pass').value = "";
    document.getElementById('new-pass').value = "";

    // Retour à la page d'accueil
    showPage('page-comptes', 'btn-nav-comptes');
}
