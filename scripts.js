// Referências aos elementos
const csvInput = document.getElementById('csvInputForCue');
const autoFireBtn = document.getElementById('autoFireBtn');
const loadCsvBtn = document.getElementById('loadCsvBtn');


// Função para converter tempo
function convertTime(timeStr) {
    if (!timeStr || timeStr.trim() === '') return "00:00:00:00";
    
    try {
        const parts = timeStr.trim().split(':');
        if (parts.length === 4) {
            const hours = parts[0];
            const minutes = parts[1];
            const seconds = parts[2];
            const frames = parseInt(parts[3]);
            const ms = Math.round((frames / 30) * 1000);
            const formattedMS = Math.floor(ms / 10).toString().padStart(2, '0');

            return `${hours}:${minutes}:${seconds}:${formattedMS}`;
        }
    } catch (error) {
        console.error('Erro ao converter tempo:', error);
    }

    return timeStr;
}

// Função para converter o tempo do formato CSV para horário
function standardizeTime(timeStr) {
    if (!timeStr || timeStr.trim() === '') return "00:00:00";
    
    try {
        // Converte o valor numérico para frames (assumindo 30fps)
        const totalFrames = parseInt(timeStr);
        if (isNaN(totalFrames)) return timeStr;
        
        // Converte frames para segundos
        let totalSeconds = Math.floor(totalFrames / 30);
        
        // Calcula horas, minutos e segundos
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        // Formata com zeros à esquerda
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } catch (error) {
        console.error('Erro ao converter tempo:', error);
        return timeStr;
    }
}

// Função para mostrar alertas usando SweetAlert2
function showAlert(message, type) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    Toast.fire({
        icon: type,
        title: message
    });
}

// Função para atualizar o relógio
function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('clockTime');
    const dateElement = document.getElementById('clockDate');
    
    if (timeElement && dateElement) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        timeElement.innerHTML = `${hours}<span class="time-separator">:</span>${minutes}<span class="time-separator">:</span>${seconds}`;
        
        const options = { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            weekday: 'long'
        };
        dateElement.textContent = now.toLocaleDateString('pt-BR', options);
    }
}

// Função para criar e inicializar o relógio
function initializeClock() {
    const clockHTML = `
        <div class="digital-clock">
            <div class="time" id="clockTime">00:00:00</div>
            <div class="date" id="clockDate"></div>
        </div>
    `;
    
    // Remove relógio existente se houver
    const existingClock = document.querySelector('.clock-container');
    if (existingClock) {
        existingClock.remove();
    }
    
    // Cria novo relógio
    const clockContainer = document.createElement('div');
    clockContainer.className = 'clock-container centered';
    clockContainer.innerHTML = clockHTML;
    document.body.appendChild(clockContainer);
    
    // Inicia a atualização
    updateClock();
    setInterval(updateClock, 1000);
}

// Estilos atualizados com novas regras
const appStyles = `
    * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        cursor: default !important;
    }

    input, textarea, [contenteditable] {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        cursor: text !important;
    }

    button, .btn, a {
        cursor: pointer !important;
    }

    .clock-container {
        position: fixed;
        z-index: 1000;
        transition: all 0.5s ease;
        background: rgba(245, 245, 245, 0.9);
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .clock-container.centered {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: transparent;
        padding: 0;
        box-shadow: none;
    }

    .clock-container.bottom-left {
        bottom: 20px;
        left: 20px;
        transform: none;
    }

    .digital-clock {
        text-align: center;
        transition: all 0.5s ease;
    }

    .clock-container.centered .time {
        font-size: 7em;
        background: linear-gradient(45deg, #2D3436, #636E72);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
        letter-spacing: 5px;
    }

    .clock-container.bottom-left .time {
        font-size: 1.8em;
        color: #2D3436;
        font-weight: 500;
        letter-spacing: 2px;
        font-family: 'Inter', sans-serif;
    }

    .clock-container.bottom-left .date {
        font-size: 0.9em;
        color: #636E72;
        font-weight: 400;
    }

    .table-responsive {
        margin-bottom: 100px !important;
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    .table th, .table td {
        pointer-events: none;
    }

    body {
        overflow-x: hidden;
    }
`;

// Função para inicializar os estilos da aplicação
function initializeAppStyles() {
    const style = document.createElement('style');
    style.textContent = appStyles;
    document.head.appendChild(style);

    // Previne comportamentos padrão indesejados
    document.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
}

// Sistema de verificação e persistência
class SystemCheck {
    constructor() {
        this.intervalId = null;
        this.lastState = null;
    }

    // Inicia o sistema de verificação
    start() {
        this.checkSystem();
        this.intervalId = setInterval(() => this.checkSystem(), 1000);
    }

    // Para o sistema de verificação
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    // Verifica o estado do sistema
    checkSystem() {
        try {
            const csvData = localStorage.getItem('originalCsvData');
            const csvInput = document.getElementById('csvInputForCue');
            
            // Reseta input se necessário
            if (csvInput && !csvData) {
                csvInput.value = '';
            }

            if (csvData && !document.getElementById('tableContainer').innerHTML) {
                displayCSVTable(csvData);
            }

            const clockContainer = document.querySelector('.clock-container');
            if (csvData && clockContainer && !clockContainer.classList.contains('bottom-left')) {
                moveClockToCorner();
            }

            const currentState = {
                csvData: csvData,
                tableContent: document.getElementById('tableContainer').innerHTML
            };

            if (JSON.stringify(this.lastState) !== JSON.stringify(currentState)) {
                this.lastState = currentState;
                this.saveState();
            }
        } catch (error) {
            console.error('Erro na verificação do sistema:', error);
        }
    }

    // Salva o estado atual
    saveState() {
        try {
            if (this.lastState) {
                sessionStorage.setItem('systemState', JSON.stringify(this.lastState));
            }
        } catch (error) {
            console.error('Erro ao salvar estado:', error);
        }
    }

    // Restaura o último estado
    restoreState() {
        try {
            const savedState = sessionStorage.getItem('systemState');
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.csvData) {
                    localStorage.setItem('originalCsvData', state.csvData);
                    displayCSVTable(state.csvData);
                }
            }
        } catch (error) {
            console.error('Erro ao restaurar estado:', error);
        }
    }
}

// Inicialização do sistema
const systemCheck = new SystemCheck();

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os estilos da aplicação
    initializeAppStyles();
    
    // Restaura estado anterior se existir
    systemCheck.restoreState();
    
    // Inicia verificação do sistema
    systemCheck.start();

    // Inicializa o relógio
    initializeClock();

    // Event listeners com tratamento de erros
    setupEventListeners();
});

// Função separada para configurar os event listeners
function setupEventListeners() {
    try {
        // Botão de carregar CSV
        const csvInput = document.getElementById('csvInputForCue');
        const loadCsvBtn = document.getElementById('loadCsvBtn');
        
        if (csvInput) {
            csvInput.value = ''; // Limpa o input
            csvInput.addEventListener('change', handleFileInput);
        }
        
        if (loadCsvBtn) {
            loadCsvBtn.addEventListener('click', () => {
                if (csvInput) csvInput.click();
            });
        }

        // Outros botões
        const resetBtn = document.getElementById('resetBtn');
        const exitBtn = document.getElementById('exitBtn');
        const exportBtn = document.getElementById('exportPdfBtn');

        if (resetBtn) {
            resetBtn.addEventListener('click', handleReset);
            resetBtn.style.cursor = 'pointer';
        }

        if (exitBtn) {
            exitBtn.addEventListener('click', handleExit);
            exitBtn.style.cursor = 'pointer';
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', exportToPDF);
            exportBtn.style.cursor = 'pointer';
        }

    } catch (error) {
        console.error('Erro ao configurar event listeners:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao inicializar os controles. Por favor, recarregue a página.'
        });
    }
}

// Função atualizada para manipular arquivo
function handleFileInput(e) {
    try {
        const file = e.target.files[0];
        if (!file) {
            console.log('Nenhum arquivo selecionado');
            return;
        }

        // Verifica se é um arquivo CSV
        if (!file.name.toLowerCase().endsWith('.csv')) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Por favor, selecione um arquivo CSV válido.'
            });
            e.target.value = ''; // Limpa o input
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const csvData = event.target.result;
                
                // Verifica se o CSV tem conteúdo
                if (!csvData || csvData.trim().length === 0) {
                    throw new Error('Arquivo CSV vazio');
                }

                // Salva os dados originais
                localStorage.setItem('originalCsvData', csvData);
                
                // Exibe a tabela
                displayCSVTable(csvData);
                
                // Move o relógio
                moveClockToCorner();

                // Feedback para o usuário
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso',
                    text: 'Arquivo CSV carregado com sucesso!',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });

            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro ao processar o arquivo CSV. Verifique o formato e tente novamente.'
                });
                e.target.value = ''; // Limpa o input
            }
        };

        reader.onerror = function(error) {
            console.error('Erro ao ler arquivo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao ler o arquivo. Por favor, tente novamente.'
            });
            e.target.value = ''; // Limpa o input
        };

        // Lê o arquivo como texto
        reader.readAsText(file);

    } catch (error) {
        console.error('Erro ao manipular arquivo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao processar o arquivo. Por favor, tente novamente.'
        });
        if (e.target) e.target.value = ''; // Limpa o input
    }
}

// Atualiza os estilos para garantir que os botões sejam clicáveis
const updatedStyles = `
    ${appStyles}
    
    button, .btn, a, input[type="file"] {
        cursor: pointer !important;
        pointer-events: auto !important;
    }

    .btn:hover {
        opacity: 0.9;
        transition: opacity 0.2s ease;
    }

    .table-responsive {
        pointer-events: auto !important;
    }
`;

// Função atualizada para inicializar estilos
function initializeAppStyles() {
    const style = document.createElement('style');
    style.textContent = updatedStyles;
    document.head.appendChild(style);

    // Mantém apenas os eventos realmente necessários
    document.addEventListener('contextmenu', e => e.preventDefault());
}

// Função atualizada para processar o ângulo
function processAngle(angleStr) {
    if (!angleStr) return '0';
    
    try {
        // Remove caracteres especiais e divide em número e direção
        const cleanAngle = angleStr.replace('°', '').trim();
        const number = parseFloat(cleanAngle.match(/\d+/)[0]);
        const direction = cleanAngle.toLowerCase();

        // Adiciona sinal negativo se for Left
        if (direction.includes('left')) {
            return `-${number}`;
        }
        // Retorna apenas o número se for Right
        else if (direction.includes('right')) {
            return `${number}`;
        }
        // Caso não especifique direção, retorna o número original
        return `${number}`;
    } catch (error) {
        console.error('Erro ao processar ângulo:', error);
        return angleStr;
    }
}

// Atualiza o processamento do CSV
function processCSVData(csvText) {
    try {
        const lines = csvText.trim().split('\n');
        let processedData = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const [
                slaveId,
                outputChannel,
                ignitionTime,
                duration,
                delay,
                description,
                position,
                angle,
                shots
            ] = line.split(',').map(item => item.trim());

            // Processa o ângulo com a nova função
            const processedAngle = processAngle(angle);

            processedData.push({
                slaveId,
                outputChannel,
                ignitionTime: formatTime(ignitionTime),
                duration: formatTime(duration),
                delay: formatTime(delay),
                description,
                position,
                angle: processedAngle, // Ângulo processado
                shots
            });
        }

        return processedData;
    } catch (error) {
        console.error('Erro ao processar CSV:', error);
        return [];
    }
}

// Função para formatar tempos
function formatTime(timeStr) {
    if (!timeStr || timeStr === '00:00.000') return '-';
    return timeStr;
}

// Função para converter o tempo de ignição (00:03.925 para formato do sistema)
function convertIgnitionTime(timeStr) {
    if (!timeStr || timeStr.trim() === '') return "00:00:00";
    
    try {
        // Divide minutos e segundos
        const [minutes, secondsPart] = timeStr.split(':');
        // Divide segundos e milissegundos
        const [seconds, milliseconds] = secondsPart.split('.');
        
        // Converte para o formato necessário
        return `00:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    } catch (error) {
        console.error('Erro ao converter tempo:', error);
        return timeStr;
    }
}

// Função atualizada para exibir a tabela no index
function displayCSVTable(csvData) {
    const container = document.getElementById('tableContainer');
    if (!container) return;

    const processedData = processCSVData(csvData);
    
    let tableHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th scope="col" class="text-center">Módulo</th>
                        <th scope="col" class="text-center">Output Channel</th>
                        <th scope="col" class="text-center">Ignition Time</th>
                        <th scope="col" class="text-center">Duration</th>
                        <th scope="col" class="text-center">Delay</th>
                        <th scope="col">Description</th>
                        <th scope="col" class="text-center">Position</th>
                        <th scope="col" class="text-center">Angle (°)</th>
                        <th scope="col" class="text-center">Shots</th>
                    </tr>
                </thead>
                <tbody>
    `;

    processedData.forEach((row, index) => {
        tableHTML += `
            <tr>
                <td class="text-center">${row.slaveId}</td>
                <td class="text-center">${row.outputChannel}</td>
                <td class="text-center">${row.ignitionTime}</td>
                <td class="text-center">${row.duration}</td>
                <td class="text-center">${row.delay}</td>
                <td>${row.description}</td>
                <td class="text-center">${row.position}</td>
                <td class="text-center">${row.angle}</td>
                <td class="text-center">${row.shots}</td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
    moveClockToCorner();

    // Adiciona estilos específicos para a tabela
    const style = document.createElement('style');
    style.textContent = `
        .table-responsive {
            margin-top: 20px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 100px; /* Espaço para o relógio */
        }
        
        .table {
            margin-bottom: 0;
        }
        
        .table thead th {
            background-color: #1a1a1a;
            color: white;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.9rem;
            padding: 15px;
            vertical-align: middle;
            border: none;
        }
        
        .table tbody td {
            padding: 12px;
            vertical-align: middle;
            border-color: #eee;
            font-size: 0.9rem;
        }
        
        .table-striped tbody tr:nth-of-type(odd) {
            background-color: rgba(0,0,0,0.02);
        }
        
        .table-hover tbody tr:hover {
            background-color: rgba(0,0,0,0.05);
            transition: background-color 0.2s ease;
        }
    `;
    document.head.appendChild(style);
}

// Função para validar o CSV
function validateCSV(csvData) {
    const lines = csvData.trim().split('\n');
    
    if (lines.length <= 1) {
        return { valid: false, message: 'O arquivo CSV está vazio!' };
    }

    const hasInvalidData = lines.slice(1).some(line => {
        const cols = line.split(',');
        return cols.length < 6 || !cols[1].trim() || !cols[2].trim();
    });

    if (hasInvalidData) {
        return { valid: false, message: 'O arquivo CSV contém dados inválidos!' };
    }

    return { valid: true };
}

// Event Listeners
document.getElementById('exportPdfBtn')?.addEventListener('click', exportToPDF);

// Função para mostrar alertas
function showAlert(message, type) {
    Swal.fire({
        title: message,
        icon: type,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

// Verifica se as dependências estão carregadas
function checkDependencies() {
    if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF não está carregado');
    }
    if (typeof window.jspdf.jsPDF === 'undefined') {
        throw new Error('jsPDF não está inicializado corretamente');
    }
}

// Função atualizada para exportar PDF com novo formato
function exportToPDF() {
    try {
        const csvData = localStorage.getItem('originalCsvData');
        if (!csvData) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'Nenhum dado para exportar! Carregue um arquivo CSV primeiro.'
            });
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');

        // Agrupa dados por Slave ID
        const moduleData = {};
        const processedData = processCSVData(csvData);
        
        processedData.forEach(item => {
            const slaveId = item.slaveId || 'Sem ID';
            if (!moduleData[slaveId]) {
                moduleData[slaveId] = [];
            }
            moduleData[slaveId].push(item);
        });

        // Configurações do documento
        doc.setFillColor(51, 51, 51);
        doc.rect(0, 0, 297, 40, 'F');

        // Título e Data
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('SISTEMA DE DISPARO', 150, 20, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Relatório de Montagem por Módulo', 150, 30, { align: 'center' });

        let yPos = 50;

        // Para cada Slave ID
        Object.entries(moduleData).forEach(([slaveId, data]) => {
            if (yPos > 180) {
                doc.addPage();
                yPos = 20;
            }

            // Título do Slave ID
            doc.setFillColor(0, 102, 204);
            doc.rect(14, yPos, 269, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.text(`SLAVE ID: ${slaveId}`, 20, yPos + 7);

            // Tabela de dados
            doc.autoTable({
                startY: yPos + 15,
                head: [['Channel', 'Ignition Time', 'Duration', 'Delay', 'Description', 'Position', 'Angle', 'Shots']],
                body: data.map(row => [
                    row.outputChannel,
                    row.ignitionTime,
                    row.duration,
                    row.delay,
                    row.description,
                    row.position,
                    row.angle + '°', // Adiciona o símbolo de grau
                    row.shots
                ]),
                theme: 'grid',
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                headStyles: {
                    fillColor: [51, 51, 51],
                    textColor: [255, 255, 255],
                    fontSize: 11,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 60 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 30 },
                    7: { cellWidth: 20 }
                },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 20;
        });

        // Adiciona rodapé em todas as páginas
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFillColor(51, 51, 51);
            doc.rect(0, doc.internal.pageSize.height - 20, 297, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${pageCount}`, 150, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        // Salva o PDF
        doc.save(`relatorio_montagem_${new Date().toISOString().slice(0,10)}.pdf`);
        
        Swal.fire({
            icon: 'success',
            title: 'Sucesso',
            text: 'PDF gerado com sucesso!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.'
        });
    }
}

// Função para mover o relógio quando carregar arquivo
function moveClockOnLoad() {
    const clockWidget = document.querySelector('.clock-widget');
    clockWidget.classList.add('top-right');
}

// Função atualizada para Reset
function handleReset() {
    Swal.fire({
        title: 'Confirmar Reset',
        text: 'Deseja realmente resetar o sistema?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, resetar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            // Para o sistema de verificação
            systemCheck.stop();
            
            // Limpa os dados
            localStorage.clear();
            sessionStorage.clear();
            document.getElementById('tableContainer').innerHTML = '';
            document.getElementById('csvInputForCue').value = '';
            
            // Reseta o relógio
            const clockContainer = document.querySelector('.clock-container');
            if (clockContainer) {
                clockContainer.classList.remove('bottom-left');
                clockContainer.classList.add('centered');
            }

            // Reinicia o sistema de verificação
            systemCheck.start();

            Swal.fire(
                'Resetado!',
                'O sistema foi resetado com sucesso.',
                'success'
            );
        }
    });
}

// Função atualizada para Exit
function handleExit() {
    Swal.fire({
        title: 'Deseja realmente sair?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
    }).then((result) => {
        if (result.isConfirmed) {
            systemCheck.stop();
            localStorage.clear();
            sessionStorage.clear();
            window.close();
        }
    });
}

// Atualiza o HTML necessário
const requiredHTML = `
    <!-- Adicione isso ao seu HTML se ainda não existir -->
    <input type="file" id="csvInputForCue" accept=".csv" style="display: none;">
    <button id="loadCsvBtn" class="btn btn-primary">
        <i class="fas fa-file-upload"></i> Carregar CSV
    </button>
`;

// Função para verificar se o arquivo é válido
function isValidCSV(content) {
    try {
        const lines = content.trim().split('\n');
        if (lines.length < 2) return false; // Precisa ter pelo menos cabeçalho e uma linha

        // Verifica o cabeçalho
        const header = lines[0].toLowerCase();
        return header.includes('slave id') || 
               header.includes('output channel') || 
               header.includes('ignitiontime');
    } catch (error) {
        console.error('Erro ao validar CSV:', error);
        return false;
    }
}

// Função atualizada para mover o relógio
function moveClockToCorner() {
    const clockContainer = document.querySelector('.clock-container');
    if (clockContainer) {
        clockContainer.classList.remove('centered');
        clockContainer.classList.add('bottom-left');
    }
}

// Adiciona meta tag para prevenir zoom
const metaTag = document.createElement('meta');
metaTag.name = 'viewport';
metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.head.appendChild(metaTag);
