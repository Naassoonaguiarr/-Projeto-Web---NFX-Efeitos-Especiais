class TableEditor {
    constructor() {
        this.dataManager = new DataManager();
        this.uiController = new UIController();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Upload de arquivo
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('csvFile');

        uploadBtn?.addEventListener('click', () => {
            fileInput?.click();
        });

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadFile(file);
            }
        });

        // Pesquisa
        document.getElementById('searchInput')?.addEventListener('input', 
            debounce((e) => {
                this.uiController.filterTable(e.target.value);
            }, 300)
        );

        // Botões de ação
        document.getElementById('saveChangesBtn')?.addEventListener('click', () => {
            this.saveChanges();
        });

        document.getElementById('undoBtn')?.addEventListener('click', () => {
            this.undoChanges();
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('addRowBtn')?.addEventListener('click', () => {
            this.addNewRow();
        });

        // Paginação
        document.getElementById('rowsPerPage')?.addEventListener('change', (e) => {
            this.uiController.changeRowsPerPage(parseInt(e.target.value));
        });

        // Filtro de módulo
        document.getElementById('moduleFilter')?.addEventListener('change', (e) => {
            this.uiController.filterByModule(e.target.value);
        });
    }

    setupDragAndDrop() {
        const uploadSection = document.getElementById('uploadSection');
        if (!uploadSection) return;

        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('drag-over');
        });

        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('drag-over');
        });

        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('drag-over');
            
            const file = e.dataTransfer?.files[0];
            if (file && file.type === 'text/csv') {
                this.loadFile(file);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Por favor, selecione um arquivo CSV válido.'
                });
            }
        });
    }

    async loadFile(file) {
        try {
            this.uiController.showLoading();
            const text = await file.text();
            await this.dataManager.loadData(text);
            this.uiController.initializeTable(
                this.dataManager.columns,
                this.dataManager.currentData
            );
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('editorSection').style.display = 'block';
            this.uiController.showSuccessMessage('Arquivo carregado com sucesso!');
        } catch (error) {
            this.uiController.showErrorMessage('Erro ao carregar arquivo:', error);
        } finally {
            this.uiController.hideLoading();
        }
    }

    addNewRow() {
        const newRow = Array(this.dataManager.columns.length).fill('');
        this.dataManager.addRow(newRow);
        this.uiController.refreshTable(
            this.dataManager.currentData,
            this.dataManager.changes
        );
        this.uiController.showSuccessMessage('Nova linha adicionada');
    }

    async saveChanges() {
        try {
            this.uiController.showLoading();
            await this.dataManager.saveChanges();
            this.uiController.showSuccessMessage('Alterações salvas com sucesso!');
        } catch (error) {
            this.uiController.showErrorMessage('Erro ao salvar:', error);
        } finally {
            this.uiController.hideLoading();
        }
    }

    undoChanges() {
        if (this.dataManager.changes.size > 0) {
            Swal.fire({
                title: 'Confirmar',
                text: 'Deseja desfazer todas as alterações?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.dataManager.undoChanges();
                    this.uiController.refreshTable(
                        this.dataManager.currentData,
                        this.dataManager.changes
                    );
                    this.uiController.showSuccessMessage('Alterações desfeitas!');
                }
            });
        }
    }

    exportData() {
        try {
            const csvString = this.dataManager.exportToCSV();
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dados_exportados_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.uiController.showSuccessMessage('Dados exportados com sucesso!');
        } catch (error) {
            this.uiController.showErrorMessage('Erro ao exportar:', error);
        }
    }
}

// Função auxiliar para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}