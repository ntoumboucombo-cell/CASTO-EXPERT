function switchTab(tabId) {
    // Cache tous les contenus
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Affiche le bon onglet
    document.getElementById('tab-' + tabId).classList.add('active');
    
    // Réinitialise le style de tous les boutons
    ['chat', 'calc', '3d'].forEach(id => {
        document.getElementById('tab-btn-' + id).className = 'px-6 py-2 rounded-full font-bold text-sm text-gray-500 hover:text-gray-700 transition-all';
    });
    
    // Met en surbrillance le bouton actif
    document.getElementById('tab-btn-' + tabId).className = 'px-6 py-2 rounded-full font-bold text-sm transition-all text-castoblue bg-white shadow-sm';
    
    // Si on clique sur 3D et que la scène n'est pas chargée, on la lance
    if (tabId === '3d' && typeof init3D === "function") {
        setTimeout(init3D, 100);
    }
}
