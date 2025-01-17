/* =========================================================
   1) VARIÁVEIS GLOBAIS
   ========================================================= */
   let shots = [];                   
   let startTime = 0;               
   let intervalId = null;           
   let hasStarted = false;          
   let maxTimeSec = 0;              
   
   /* =========================================================
      2) HOOKS (PODEM FICAR VAZIOS)
      ========================================================= */
   function _hookExtraBeforeStart() {}
   function _hookExtraOnUpdate(currentTimeSec) {}
   function _hookExtraOnComplete() {}
   
   /* =========================================================
      3) FUNÇÕES: PARSE E FORMATAÇÃO DE TEMPOS
      ========================================================= */
   /**
    * "0005450" => 5.450 (em segundos)
    */
   function parseShotTime(str) {
     // Se o formato já for HH:MM:SS:FF
     if (str.includes(':')) {
       const [hh, mm, ss, ff] = str.split(':').map(Number);
       return (hh * 3600) + (mm * 60) + ss + (ff / 100);
     }
     
     // Se for o formato numérico antigo
     let n = parseInt(str.trim(), 10);
     if (isNaN(n)) n = 0;
     const seg = Math.floor(n / 1000);
     const ms = n % 1000;
     return seg + ms / 1000;
   }
   
   /**
    * Converte de segundos => "HH:MM:SS:FF"
    * (2 dígitos no final, p.ex. centésimos)
    */
   function formatTime_HHMMSSFF(totalSeconds) {
     if (totalSeconds < 0) totalSeconds = 0;
   
     const hours = Math.floor(totalSeconds / 3600);
     let remainder = totalSeconds % 3600;
     const minutes = Math.floor(remainder / 60);
     remainder = remainder % 60;
     const secs = Math.floor(remainder);
     const ff = Math.round((remainder - secs) * 100);
   
     return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
   }
   
   /* =========================================================
      4) CRIA A TABELA
      ========================================================= */
   function createShotTable() {
     const tbody = document.querySelector('#shotTable tbody');
     tbody.innerHTML = '';
   
     shots.forEach((shot, index) => {
       const tr = document.createElement('tr');
       tr.id = `shot-${index}`;
   
       // Cue
       const tdCue = document.createElement('td');
       tdCue.textContent = shot.cue;
       tr.appendChild(tdCue);
   
       // Shot Time
       const tdShotTime = document.createElement('td');
       tdShotTime.textContent = shot.shotTimeStr; 
       tr.appendChild(tdShotTime);
   
       // Burst
       const tdBurst = document.createElement('td');
       tdBurst.textContent = shot.burstTimeStr; 
       tr.appendChild(tdBurst);
   
       // Module
       const tdModule = document.createElement('td');
       tdModule.textContent = shot.module;
       tr.appendChild(tdModule);
   
       // Chanel
       const tdChanel = document.createElement('td');
       tdChanel.textContent = shot.chanel;
       tr.appendChild(tdChanel);
   
       // Comment
       const tdComment = document.createElement('td');
       tdComment.textContent = shot.comment;
       tr.appendChild(tdComment);
   
       tbody.appendChild(tr);
     });
   }
   
   /* =========================================================
      5) FUNÇÃO: MANTER SOMENTE OS 6 ÚLTIMOS DISPAROS PASSADOS
      ========================================================= */
   function keepOnly6PastShots(currentTimeSec) {
     const alreadyFired = [];
   
     shots.forEach((shot, index) => {
       if (currentTimeSec >= shot.launchTimeSec) {
         alreadyd.push({ rowIndex: index, time: shot.launchTimeSec });
       }
     });
   
     // ordena do mais antigo p/ mais recente
     alreadyFired.sort((a,b) => a.time - b.time);
   
     // Primeiro exibe todos
     alreadyFired.forEach((info) => {
       const row = document.getElementById(`shot-${info.rowIndex}`);
       if (row) row.style.display = '';
     });
   
     // Se houver mais que 6, esconde os mais antigos
     if (alreadyFired.length > 6) {
       const excedente = alreadyFired.length - 6;
       const toHide = alreadyFired.slice(0, excedente);
       toHide.forEach((oldShot) => {
         const row = document.getElementById(`shot-${oldShot.rowIndex}`);
         if (row) row.style.display = 'none';
       });
     }
   }
   
   /* =========================================================
      6) UPDATE RELOJOS (Principal Loop)
      ========================================================= */
   function updateClocks() {
     const currentTimeSec = (Date.now() - startTime) / 1000;
     _hookExtraOnUpdate(currentTimeSec);
   
     // Master Clock
     document.getElementById('masterShotClock').textContent = 
       formatTime_HHMMSSFF(currentTimeSec);
   
     // Tempo até último disparo
     const remaining = maxTimeSec - currentTimeSec;
     document.getElementById('timeToLastShot').textContent =
       formatTime_HHMMSSFF(remaining);
   
     // Próximo disparo => acha o primeiro disparo com launchTimeSec > tempo atual
     let nextIndex = shots.findIndex(shot => shot.launchTimeSec > currentTimeSec);
     let nextTime = null;
     if (nextIndex === -1) {
       // não há próximo (todos passaram)
       document.getElementById('timeToNextShot').textContent = '00:00:00:00';
       nextIndex = shots.length; 
     } else {
       // define o tempo do próximo
       nextTime = shots[nextIndex].launchTimeSec;
       const diff = nextTime - currentTimeSec;
       document.getElementById('timeToNextShot').textContent =
         formatTime_HHMMSSFF(diff);
     }
   
     // Marca .past / .next
     shots.forEach((shot, i) => {
       const row = document.getElementById(`shot-${i}`);
       if (!row) return;
   
       // primeiro garante que apareça
       row.style.display = '';
   
       row.classList.remove('past','next');
       // passados
       if (currentTimeSec >= shot.launchTimeSec) {
         row.classList.add('past');
       }
       // se este disparo tem exactly nextTime (==), então é .next
       if (nextTime !== null && shot.launchTimeSec === nextTime) {
         row.classList.add('next');
       }
     });
   
     // Mantém só 6 passados
     keepOnly6PastShots(currentTimeSec);
   
     // Se já passamos do último disparo
     if (currentTimeSec >= maxTimeSec && intervalId) {
       clearInterval(intervalId);
       intervalId = null;
       hasStarted = false;
       _hookExtraOnComplete();
       document.getElementById('completeMessage').style.display = 'flex';
     }
   }
   
   /* =========================================================
      7) START E DISARM
      ========================================================= */
   function startFiring() {
     if (hasStarted) return;
     if (shots.length === 0) {
       alert("Carregue o CSV primeiro!");
       return;
     }
     hasStarted = true;
     _hookExtraBeforeStart();
   
     startTime = Date.now();
     intervalId = setInterval(updateClocks, 100);
   }
   
   function disarm() {
     if (intervalId) {
       clearInterval(intervalId);
       intervalId = null;
     }
     hasStarted = false;
   
     document.getElementById('masterShotClock').textContent = '00:00:00:00';
     document.getElementById('timeToNextShot').textContent = '00:00:00:00';
     document.getElementById('timeToLastShot').textContent = '00:00:00:00';
   
     shots.forEach((_, i) => {
       const row = document.getElementById(`shot-${i}`);
       if (row) {
         row.classList.remove('past','next');
         row.style.display = '';
       }
     });
   
     document.getElementById('completeMessage').style.display = 'none';
   }
   
   /* =========================================================
      8) LEITURA DO CSV
      ========================================================= */
   const csvInputForCue = document.getElementById('csvInputForCue');
   csvInputForCue.addEventListener('change', handleCueFile);
   
   function handleCueFile(e) {
     const file = e.target.files[0];
     if (!file) return;
   
     const reader = new FileReader();
     reader.onload = function(ev) {
       const csvText = ev.target.result;
       localStorage.setItem('csvData', csvText); // Salva no localStorage
       processCueCSV(csvText);
     };
     reader.readAsText(file, 'utf-8');
   }
   
   /** 
    * processCueCSV: Lê CSV com colunas
    *   Cue,Shot Time,Burst,Module,Chanel,Comment
    */
   function processCueCSV(csvText) {
     disarm();
     shots = [];
   
     const lines = csvText.trim().split('\n');
     let startIndex = 0;
   
     // Se a 1ª linha tiver "cue" e "shot time", pulamos como cabeçalho
     const firstLine = lines[0].toLowerCase();
     if (firstLine.includes('cue') && firstLine.includes('shot time')) {
       startIndex = 1;
     }
   
     for (let i = startIndex; i < lines.length; i++) {
       const line = lines[i].trim();
       if (!line) continue;
       const cols = line.split(',');
       if (cols.length < 6) {
         console.warn("Linha inválida (esperado 6 colunas):", line);
         continue;
       }
   
       const cue    = cols[0].trim();
       const shot   = cols[1].trim(); // ex. "0005450"
       const burst  = cols[2].trim(); // ex. "0005450"
       const module = cols[3].trim();
       const chanel = cols[4].trim();
       const comment= cols[5].trim();
   
       // Converte p/ seg
       const shotSec  = parseShotTime(shot);
       const burstSec = parseShotTime(burst);
   
       // Formata no estilo HH:MM:SS:FF
       const shotTimeStr  = formatTime_HHMMSSFF(shotSec);
       const burstTimeStr = formatTime_HHMMSSFF(burstSec);
   
       shots.push({
         cue,
         shotTimeStr,
         burstTimeStr,
         module,
         chanel,
         comment,
         // tempo numérico p/ contagem
         launchTimeSec: shotSec
       });
     }
   
     // Ordena por tempo
     shots.sort((a,b) => a.launchTimeSec - b.launchTimeSec);
   
     maxTimeSec = (shots.length > 0)
       ? shots[shots.length - 1].launchTimeSec
       : 0;
   
     createShotTable();
   }
   
   /* =========================================================
      9) EVENTOS
      ========================================================= */
   window.onload = function() {
     // Carrega dados do localStorage se existirem
     const csvData = localStorage.getItem('csvData');
     if (csvData) {
         processCueCSV(csvData);
     }
   
     document.getElementById('fireBtn').addEventListener('click', startFiring);
     document.getElementById('disarmBtn').addEventListener('click', disarm);
   
     // Clique no overlay "FIRING COMPLETE"
     document.getElementById('completeMessageText').addEventListener('click', () => {
       document.getElementById('completeMessage').style.display = 'none';
       disarm();
     });
   };

document.addEventListener('DOMContentLoaded', function() {
    // Handler para o botão Open CSV
    const openMenuItem = document.getElementById('openMenuItem');
    const csvInput = document.getElementById('csvInputForCue');

    if (openMenuItem) {
        openMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            csvInput.click();
        });
    }

    // Carrega dados do localStorage se existirem
    const csvData = localStorage.getItem('csvData');
    if (csvData) {
        processCueCSV(csvData);
    }
});

// Função para gerar tabela por módulo
function generateModuleTable() {
    // Abre nova janela
    const win = window.open('', '_blank');
    
    // Escreve o HTML inicial
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Tabela por Módulos</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h2 { color: #333; }
            </style>
        </head>
        <body>
    `);

    // Agrupa os disparos por módulo
    const moduleGroups = {};
    shots.forEach(shot => {
        if (!moduleGroups[shot.module]) {
            moduleGroups[shot.module] = [];
        }
        moduleGroups[shot.module].push(shot);
    });

    // Gera uma tabela para cada módulo
    Object.keys(moduleGroups).sort((a, b) => a - b).forEach(moduleNumber => {
        win.document.write(`
            <h2>Módulo ${moduleNumber}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Cue</th>
                        <th>Tempo</th>
                        <th>Canal</th>
                        <th>Comentário</th>
                    </tr>
                </thead>
                <tbody>
        `);

        moduleGroups[moduleNumber].forEach(shot => {
            win.document.write(`
                <tr>
                    <td>${shot.cue}</td>
                    <td>${shot.shotTimeStr}</td>
                    <td>${shot.chanel}</td>
                    <td>${shot.comment || ''}</td>
                </tr>
            `);
        });

        win.document.write(`
                </tbody>
            </table>
        `);
    });

    win.document.write('</body></html>');
    win.document.close();
}

// Função para gerar e baixar o PDF em modo paisagem
function generateModulePDF() {
    // Verifica se o jsPDF está disponível
    if (typeof window.jspdf === "undefined") {
        window.jspdf = window.jsPDF;
    }

    // Cria novo documento PDF em modo paisagem (A4)
    const doc = new jspdf.jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    // Agrupa os disparos por módulo
    const moduleGroups = {};
    shots.forEach(shot => {
        if (!moduleGroups[shot.module]) {
            moduleGroups[shot.module] = [];
        }
        moduleGroups[shot.module].push(shot);
    });

    // Para cada módulo
    Object.keys(moduleGroups).sort((a, b) => a - b).forEach((moduleNumber, index) => {
        // Adiciona nova página para cada módulo (exceto o primeiro)
        if (index > 0) {
            doc.addPage();
        }

        // Título do módulo
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`Módulo ${moduleNumber}`, 15, 20);

        // Adiciona data e hora
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        doc.text(`Data: ${dateStr} - Hora: ${timeStr}`, 15, 30);

        // Prepara dados para a tabela
        const tableData = moduleGroups[moduleNumber].map(shot => [
            shot.cue,
            shot.shotTimeStr,
            shot.chanel,
            shot.comment || ''
        ]);

        // Configuração da tabela
        doc.autoTable({
            head: [['Cue', 'Tempo', 'Canal', 'Comentário']],
            body: tableData,
            startY: 35,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak',
                font: 'helvetica'
            },
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 40 },    // Cue - mais largo no modo paisagem
                1: { cellWidth: 60 },    // Tempo - mais largo no modo paisagem
                2: { cellWidth: 40 },    // Canal - mais largo no modo paisagem
                3: { cellWidth: 'auto' } // Comentário - usa o espaço restante
            },
            margin: { top: 35, right: 15, left: 15 }
        });

        // Adiciona rodapé
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
            `Página ${index + 1} de ${Object.keys(moduleGroups).length}`, 
            doc.internal.pageSize.width / 2, 
            doc.internal.pageSize.height - 10, 
            { align: 'center' }
        );
    });

    // Salva o PDF
    try {
        doc.save('montagem_modulos.pdf');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    }
}