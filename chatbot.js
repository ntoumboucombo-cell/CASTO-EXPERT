// ==========================================
// METS TA CLÉ API GEMINI ICI ENTRE LES GUILLEMETS
const GEMINI_API_KEY = "TON_CODE_API_ICI"; 
// ==========================================

const sysPrompt = `Tu es Casto-Expert, l'assistant IA du conseiller de vente du rayon sol/peinture/déco à Castorama Quimper. 
Ton but est d'aider le conseiller à construire un argumentaire de vente béton et factuel.
RÈGLE ABSOLUE : Ne JAMAIS inventer de normes de sécurité. Si tu as un doute, réponds : "Je ne suis pas certain, vérifions la fiche technique."
Mets en évidence les dangers (comme l'eau dans le ragréage, le SPEC en salle d'eau) avec le mot DANGER.`;

function formatMessage(text) {
    let formatted = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (formatted.includes("DANGER") || formatted.includes("OBLIGATOIRE")) {
        formatted = `<div class="danger-tag"><i class="fa-solid fa-triangle-exclamation"></i> Point Technique Crucial :<br>${formatted}</div>`;
    }
    return formatted;
}

function appendMessage(sender, text) {
    const history = document.getElementById('chat-history');
    const div = document.createElement('div');
    div.className = "flex gap-4 " + (sender === 'user' ? "flex-row-reverse" : "");
    
    let icon = sender === 'user' ? '<i class="fa-solid fa-user text-castoblue"></i>' : '<i class="fa-solid fa-bolt text-castoyellow text-xl"></i>';
    let bgIcon = sender === 'user' ? 'bg-blue-100 border border-blue-200' : 'bg-castoblue shadow-md';
    let msgClass = sender === 'user' ? 'bg-castoblue text-white shadow-md rounded-2xl rounded-tr-none p-4' : 'bg-white border border-gray-100 shadow-soft rounded-2xl rounded-tl-none p-4';
    
    div.innerHTML = `
        <div class="${bgIcon} rounded-xl h-12 w-12 flex items-center justify-center shrink-0">
            ${icon}
        </div>
        <div class="${msgClass} max-w-[85%] text-sm leading-relaxed">
            ${sender === 'bot' ? formatMessage(text) : text}
        </div>
    `;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

function sendQuickPrompt(txt) {
    document.getElementById('chat-input').value = txt;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    if (GEMINI_API_KEY === "TON_CODE_API_ICI" || GEMINI_API_KEY === "") {
        appendMessage('bot', "DANGER : Clé API non configurée. Veuillez éditer le fichier chatbot.js à la ligne 3 pour y coller votre clé Gemini.");
        return;
    }

    appendMessage('user', message);
    input.value = '';

    const loadingId = 'loading-' + Date.now();
    const history = document.getElementById('chat-history');
    history.insertAdjacentHTML('beforeend', `<div id="${loadingId}" class="flex gap-4"><div class="bg-castoblue shadow-md rounded-xl h-12 w-12 flex items-center justify-center shrink-0"><i class="fa-solid fa-bolt fa-spin text-castoyellow"></i></div><div class="bg-white border shadow-soft rounded-2xl p-4 text-sm text-gray-500 italic">Réflexion de l'IA...</div></div>`);
    history.scrollTop = history.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
                systemInstruction: { parts: [{ text: sysPrompt }] },
                generationConfig: { temperature: 0.1 } // Très factuel, très peu d'imagination
            })
        });
        const data = await response.json();
        document.getElementById(loadingId).remove();
        if (data.error) appendMessage('bot', "Erreur : " + data.error.message);
        else appendMessage('bot', data.candidates[0].content.parts[0].text);
    } catch (err) {
        document.getElementById(loadingId).remove();
        appendMessage('bot', "Erreur réseau.");
    }
}

document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});
