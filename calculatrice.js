function calculerToutesSurfaces() {
    let L = parseFloat(document.getElementById('calc-long').value) || 0;
    let l = parseFloat(document.getElementById('calc-larg').value) || 0;
    let res = L * l;
    document.getElementById('resultat-surface').innerText = res.toFixed(2);
    document.getElementById('calc-surf-carr').value = res.toFixed(2);
    document.getElementById('calc-surf-peint').value = res.toFixed(2);
    calculerCarrelage();
    calculerPeinture();
}

function calculerCarrelage() {
    let surf = parseFloat(document.getElementById('calc-surf-carr').value) || 0;
    let carton = parseFloat(document.getElementById('calc-carton').value) || 1;
    let surfTotale = surf * 1.10; // Marge pour les coupes
    document.getElementById('res-cartons').innerText = Math.ceil(surfTotale / carton);
    document.getElementById('res-colle').innerText = (surfTotale * 5).toFixed(1); // 5kg/m2
    document.getElementById('res-joint').innerText = (surfTotale * 0.5).toFixed(1); // 0.5kg/m2
}

function calculerPeinture() {
    let surf = parseFloat(document.getElementById('calc-surf-peint').value) || 0;
    let rend = parseFloat(document.getElementById('calc-rendement').value) || 10;
    document.getElementById('res-litres').innerText = ((surf * 2) / rend).toFixed(2); // 2 couches
}
