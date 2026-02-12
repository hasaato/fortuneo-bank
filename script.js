// ============================================================
// 1. CONFIGURATION INITIALE
// ============================================================

// Cette fonction s'exécute toute seule pour brancher EmailJS
(function() {
    // REMPLACE "TA_PUBLIC_KEY" PAR TA CLÉ (onglet Account sur EmailJS)
    emailjs.init("qxKUMUEPAPu1tGGdW"); 
})();

// ============================================================
// 2. NAVIGATION ENTRE LES PAGES (Comptes / Paiements)
// ============================================================

function showPage(pageId, navId) {
    // On cache toutes les pages en retirant la classe 'active'
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // On affiche la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // On gère l'apparence des icônes dans la barre du bas
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const targetNav = document.getElementById(navId);
    if (targetNav) {
        targetNav.classList.add('active');
    }
}

// ============================================================
// 3. GESTION DES ONGLETS (Historique / À Venir)
// ============================================================

function switchTab(type) {
    const isHist = (type === 'historique');
    
    // Affichage des contenus
    document.getElementById('view-historique').style.display = isHist ? 'block' : 'none';
    document.getElementById('view-avenir').style.display = isHist ? 'none' : 'block';
    
    // Style des boutons d'onglets (la ligne verte)
    document.getElementById('tab-hist').classList.toggle('active', isHist);
    document.getElementById('tab-aven').classList.toggle('active', !isHist);
}

// ============================================================
// 4. LOGIQUE DE VIREMENT ET ENVOI D'E-MAIL
// ============================================================

function confirmPayment() {
    // On récupère les valeurs saisies
    const name = document.getElementById('pay-name').value.trim();
    const iban = document.getElementById('pay-iban').value.trim();
    const amount = document.getElementById('pay-amount').value;
    
    // Vérification : il faut un nom et un montant supérieur à 0
    if (name !== "" && amount > 0) {
        
        // On prépare l'objet avec les données pour EmailJS
        // Les noms à gauche (ex: beneficiary_name) doivent être identiques à tes {{mots}} dans le template
        const templateParams = {
            beneficiary_name: name,
            iban: iban,
            amount: amount,
            date: new Date().toLocaleDateString('fr-FR', { 
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })
        };

        // ENVOI DU MAIL
        // Remplace 'SERVICE_ID' et 'TEMPLATE_ID' par tes propres codes
        emailjs.send('service_hhzg4pg', 'template_q5mibvf', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert("✅ Virement confirmé !\n\nUn e-mail de notification a été envoyé à votre adresse.");
                
                // On vide les champs du formulaire
                document.getElementById('pay-name').value = "";
                document.getElementById('pay-iban').value = "";
                document.getElementById('pay-amount').value = "";
                
                // On redirige l'utilisateur vers la page d'accueil
                showPage('page-comptes', 'btn-nav-comptes');
            }, function(error) {
                console.log('FAILED...', error);
                alert("❌ Erreur lors de l'envoi du mail. Vérifiez votre configuration EmailJS.");
            });
            
    } else {
        alert("⚠️ Attention :\nVeuillez saisir au moins un nom de bénéficiaire et un montant valide.");
    }
}