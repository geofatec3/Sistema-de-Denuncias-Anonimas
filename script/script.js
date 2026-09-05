/**
 * SisDenúncia - Lógica Principal do Sistema Web
 */

// ESTADO GLOBAL DA APLICAÇÃO
let denuncias = [];
let selectedFiles = [];
let currentPoliceReportId = null;
let isPoliceLoggedIn = false;

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    loadDenunciasFromStorage();
    if (denuncias.length === 0) {
        seedInitialData();
    }
    renderPoliceTable();
    updatePoliceStats();
});

// SIMULAÇÃO DE DADOS INICIAIS DE TESTE
function seedInitialData() {
    const demoList = [
        {
            id: "DEN-2026-8942",
            crimeType: "Tráfico de Drogas",
            date: "2026-03-01T14:30",
            location: "Rua das Palmeiras, próximo ao nº 400",
            city: "Bairro Alto - São Paulo/SP",
            description: "Movimentação suspeita constante de veículos em uma residência nos fins de tarde.",
            status: "Em Investigação",
            policeNotes: "Equipe de inteligência realizou monitoramento no local. Inquérito aberto para identificação dos envolvidos.",
            policeUpdateDate: "03/03/2026 10:15",
            createdAt: "01/03/2026 14:35",
            evidenceFiles: []
        },
        {
            id: "DEN-2026-3109",
            crimeType: "Violência Doméstica",
            date: "2026-03-02T22:00",
            location: "Av. Central, Bloco B, Apt 302",
            city: "Centro - Rio de Janeiro/RJ",
            description: "Gritos e pedidos de socorro ouvidos frequentemente no apartamento durante a noite.",
            status: "Em Análise",
            policeNotes: "Denúncia registrada e aguardando encaminhamento para a equipe de acolhimento.",
            policeUpdateDate: "02/03/2026 22:10",
            createdAt: "02/03/2026 22:05",
            evidenceFiles: []
        }
    ];
    denuncias = demoList;
    saveDenunciasToStorage();
}

// PERSISTÊNCIA EM STORAGE LOCAL (BROWSER)
function saveDenunciasToStorage() {
    try {
        localStorage.setItem('sis_denuncias_db', JSON.stringify(denuncias));
    } catch (e) {
        console.log("Storage local indisponível, mantendo em memória.");
    }
}

function loadDenunciasFromStorage() {
    try {
        const stored = localStorage.getItem('sis_denuncias_db');
        if (stored) {
            denuncias = JSON.parse(stored);
        }
    } catch (e) {
        denuncias = [];
    }
}

// NAVEGAÇÃO ENTRE PORTAIS (CIDADÃO E DELEGACIA)
function switchPortal(portal) {
    const citizenPortal = document.getElementById('portal-citizen');
    const policePortal = document.getElementById('portal-police');
    const bannerAnonimato = document.getElementById('banner-anonimato');

    const btnCitizen = document.getElementById('btn-portal-citizen');
    const btnPolice = document.getElementById('btn-portal-police');

    if (portal === 'citizen') {
        citizenPortal.classList.remove('hidden');
        policePortal.classList.add('hidden');
        bannerAnonimato.classList.remove('hidden');

        btnCitizen.className = "px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center space-x-2 bg-amber-500 text-police-900 shadow";
        btnPolice.className = "px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center space-x-2";
    } else {
        citizenPortal.classList.add('hidden');
        policePortal.classList.remove('hidden');
        bannerAnonimato.classList.add('hidden');

        btnPolice.className = "px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center space-x-2 bg-amber-500 text-police-900 shadow";
        btnCitizen.className = "px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center space-x-2";

        if (isPoliceLoggedIn) {
            document.getElementById('police-login-card').classList.add('hidden');
            document.getElementById('police-dashboard').classList.remove('hidden');
            renderPoliceTable();
            updatePoliceStats();
        } else {
            document.getElementById('police-login-card').classList.remove('hidden');
            document.getElementById('police-dashboard').classList.add('hidden');
        }
    }
}

// ALTERNÂNCIA DE ABAS NA ÁREA DO CIDADÃO
function switchCitizenTab(tab) {
    const viewNew = document.getElementById('view-citizen-new');
    const viewTrack = document.getElementById('view-citizen-track');
    const tabNew = document.getElementById('tab-citizen-new');
    const tabTrack = document.getElementById('tab-citizen-track');

    if (tab === 'new') {
        viewNew.classList.remove('hidden');
        viewTrack.classList.add('hidden');
        tabNew.className = "py-3 px-6 text-sm font-bold border-b-2 border-police-600 text-police-600 flex items-center space-x-2 focus:outline-none";
        tabTrack.className = "py-3 px-6 text-sm font-bold text-gray-500 hover:text-police-600 border-b-2 border-transparent flex items-center space-x-2 focus:outline-none";
    } else {
        viewNew.classList.add('hidden');
        viewTrack.classList.remove('hidden');
        tabTrack.className = "py-3 px-6 text-sm font-bold border-b-2 border-police-600 text-police-600 flex items-center space-x-2 focus:outline-none";
        tabNew.className = "py-3 px-6 text-sm font-bold text-gray-500 hover:text-police-600 border-b-2 border-transparent flex items-center space-x-2 focus:outline-none";
    }
}

// UPLOAD E SELEÇÃO DE ARQUIVOS DE PROVA
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    selectedFiles = files;
    const container = document.getElementById('file-preview-container');
    container.innerHTML = '';

    if (files.length > 0) {
        container.classList.remove('hidden');
        files.forEach((file) => {
            const fileCard = document.createElement('div');
            fileCard.className = "bg-white p-2 border border-gray-200 rounded-lg text-left text-xs flex items-center space-x-2 truncate";
            fileCard.innerHTML = `
                <i class="fa-solid fa-file text-police-600 text-lg"></i>
                <span class="truncate flex-1 font-medium">${file.name}</span>
            `;
            container.appendChild(fileCard);
        });
    } else {
        container.classList.add('hidden');
    }
}

// GERAR CÓDIGO DE PROTOCOLO ÚNICO
function generateProtocolCode() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `DEN-2026-${randomNum}`;
}

// ENVIAR DENÚNCIA
function handleDenunciaSubmit(event) {
    event.preventDefault();

    const crimeType = document.getElementById('crime-type').value;
    const date = document.getElementById('crime-date').value;
    const location = document.getElementById('crime-location').value;
    const city = document.getElementById('crime-city').value;
    const description = document.getElementById('crime-description').value;

    const protocol = generateProtocolCode();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    const fileNames = selectedFiles.map(f => f.name);

    const newReport = {
        id: protocol,
        crimeType: crimeType,
        date: date,
        location: location,
        city: city,
        description: description,
        status: "Em Análise",
        policeNotes: "Denúncia enviada e armazenada no diretório da delegacia. Aguardando triagem.",
        policeUpdateDate: dateFormatted,
        createdAt: dateFormatted,
        evidenceFiles: fileNames
    };

    denuncias.unshift(newReport);
    saveDenunciasToStorage();

    document.getElementById('created-protocol-code').innerText = protocol;
    document.getElementById('modal-success').classList.remove('hidden');

    document.getElementById('form-denuncia').reset();
    selectedFiles = [];
    document.getElementById('file-preview-container').innerHTML = '';
    document.getElementById('file-preview-container').classList.add('hidden');
}

// COPIAR PROTOCOLO
function copyProtocol() {
    const code = document.getElementById('created-protocol-code').innerText;
    navigator.clipboard.writeText(code);
    alert(`Protocolo ${code} copiado com sucesso!`);
}

function closeModalSuccess() {
    document.getElementById('modal-success').classList.add('hidden');
}

function goToTrackWithProtocol() {
    const code = document.getElementById('created-protocol-code').innerText;
    closeModalSuccess();
    switchCitizenTab('track');
    document.getElementById('input-protocol-search').value = code;
    performProtocolSearch(code);
}

// CONSULTA DE STATUS POR PROTOCOLO
function searchProtocol(event) {
    event.preventDefault();
    const code = document.getElementById('input-protocol-search').value.trim().toUpperCase();
    performProtocolSearch(code);
}

function performProtocolSearch(code) {
    const resultBox = document.getElementById('protocol-result-box');
    const notFoundBox = document.getElementById('protocol-not-found');

    const item = denuncias.find(d => d.id.toUpperCase() === code);

    if (item) {
        notFoundBox.classList.add('hidden');
        resultBox.classList.remove('hidden');

        document.getElementById('res-protocol-number').innerText = item.id;
        document.getElementById('res-protocol-date').innerText = `Enviado em ${item.createdAt}`;
        document.getElementById('res-crime-type').innerText = item.crimeType;
        document.getElementById('res-crime-location').innerText = `${item.location} - ${item.city}`;
        document.getElementById('res-police-text').innerText = item.policeNotes || "Sem parecer adicional.";
        document.getElementById('res-police-update-time').innerText = `Última atualização: ${item.policeUpdateDate || item.createdAt}`;

        const badge = document.getElementById('res-status-badge');
        badge.innerText = item.status;
        badge.className = `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(item.status)}`;
    } else {
        resultBox.classList.add('hidden');
        notFoundBox.classList.remove('hidden');
    }
}

// RETORNA AS CLASSES DE COR DO STATUS
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Em Análise':
            return 'bg-amber-500 text-police-900';
        case 'Em Investigação':
            return 'bg-indigo-600 text-white';
        case 'Encaminhado à Justiça':
            return 'bg-blue-600 text-white';
        case 'Concluída':
            return 'bg-emerald-500 text-white';
        case 'Arquivada':
            return 'bg-gray-500 text-white';
        default:
            return 'bg-gray-400 text-white';
    }
}

// AUTENTICAÇÃO DA DELEGACIA
function handlePoliceLogin(event) {
    event.preventDefault();
    isPoliceLoggedIn = true;
    document.getElementById('police-login-card').classList.add('hidden');
    document.getElementById('police-dashboard').classList.remove('hidden');
    renderPoliceTable();
    updatePoliceStats();
}

function policeLogout() {
    isPoliceLoggedIn = false;
    document.getElementById('police-dashboard').classList.add('hidden');
    document.getElementById('police-login-card').classList.remove('hidden');
}

// RENDERIZAR TABELA DA DELEGACIA
function renderPoliceTable() {
    const tbody = document.getElementById('police-table-body');
    tbody.innerHTML = '';

    const searchTerm = document.getElementById('filter-search')?.value.toLowerCase() || '';
    const filterStatus = document.getElementById('filter-status')?.value || '';

    const filtered = denuncias.filter(item => {
        const matchesSearch = item.id.toLowerCase().includes(searchTerm) ||
                              item.crimeType.toLowerCase().includes(searchTerm) ||
                              item.location.toLowerCase().includes(searchTerm) ||
                              item.description.toLowerCase().includes(searchTerm);
        const matchesStatus = filterStatus === '' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-gray-500 text-sm">
                    Nenhuma denúncia encontrada no diretório.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
            <td class="p-4 font-mono font-bold text-police-900">${item.id}</td>
            <td class="p-4 text-xs text-gray-600">${item.createdAt}</td>
            <td class="p-4 font-semibold text-gray-800">${item.crimeType}</td>
            <td class="p-4 text-xs text-gray-600 max-w-xs truncate">${item.location} (${item.city})</td>
            <td class="p-4">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadgeClass(item.status)}">
                    ${item.status}
                </span>
            </td>
            <td class="p-4 text-center">
                <button onclick="openPoliceDetailModal('${item.id}')" class="px-3 py-1.5 bg-police-600 text-white text-xs font-bold rounded-lg hover:bg-police-900 transition-colors flex items-center space-x-1 mx-auto">
                    <i class="fa-solid fa-folder-open"></i>
                    <span>Tratar / Ver</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ATUALIZAR MÉTRICAS DA DELEGACIA
function updatePoliceStats() {
    document.getElementById('stat-total').innerText = denuncias.length;
    document.getElementById('stat-analise').innerText = denuncias.filter(d => d.status === 'Em Análise').length;
    document.getElementById('stat-investigacao').innerText = denuncias.filter(d => d.status === 'Em Investigação').length;
    document.getElementById('stat-concluidas').innerText = denuncias.filter(d => d.status === 'Concluída').length;
}

// MODAL DE TRATAMENTO POLICIAL
function openPoliceDetailModal(id) {
    currentPoliceReportId = id;
    const item = denuncias.find(d => d.id === id);
    if (!item) return;

    document.getElementById('modal-det-protocol').innerText = item.id;
    document.getElementById('modal-det-date').innerText = `Recebido em ${item.createdAt}`;
    document.getElementById('modal-det-type').innerText = item.crimeType;
    document.getElementById('modal-det-crimedate').innerText = item.date ? new Date(item.date).toLocaleString('pt-BR') : 'Não especificado';
    document.getElementById('modal-det-location').innerText = `${item.location} - ${item.city}`;
    document.getElementById('modal-det-desc').innerText = item.description;

    const evidenceBox = document.getElementById('modal-det-evidence-list');
    evidenceBox.innerHTML = '';
    if (item.evidenceFiles && item.evidenceFiles.length > 0) {
        item.evidenceFiles.forEach(file => {
            const tag = document.createElement('span');
            tag.className = "px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-xs font-medium flex items-center space-x-1";
            tag.innerHTML = `<i class="fa-solid fa-paperclip text-police-600"></i> <span>${file}</span>`;
            evidenceBox.appendChild(tag);
        });
    } else {
        evidenceBox.innerHTML = '<span class="text-xs text-gray-400 italic">Nenhum anexo enviado.</span>';
    }

    document.getElementById('modal-edit-status').value = item.status;
    document.getElementById('modal-edit-notes').value = item.policeNotes || '';

    document.getElementById('modal-police-detail').classList.remove('hidden');
}

function closePoliceModal() {
    document.getElementById('modal-police-detail').classList.add('hidden');
    currentPoliceReportId = null;
}

// SALVAR ATUALIZAÇÃO DA DELEGACIA
function savePoliceUpdate(event) {
    event.preventDefault();
    if (!currentPoliceReportId) return;

    const newStatus = document.getElementById('modal-edit-status').value;
    const newNotes = document.getElementById('modal-edit-notes').value;

    const index = denuncias.findIndex(d => d.id === currentPoliceReportId);
    if (index !== -1) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

        denuncias[index].status = newStatus;
        denuncias[index].policeNotes = newNotes;
        denuncias[index].policeUpdateDate = formattedDate;

        saveDenunciasToStorage();
        renderPoliceTable();
        updatePoliceStats();

        closePoliceModal();
        alert(`Denúncia ${currentPoliceReportId} atualizada com sucesso!`);
    }
}
