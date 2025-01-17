class UIController {
    constructor() {
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.currentData = [];
        this.filteredData = [];
        this.editingCell = null;
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    initializeTable(columns, data) {
        this.currentData = data;
        this.filteredData = [...data];
        
        // Configurar cabeçalho
        const headerRow = document.getElementById('headerRow');
        if (headerRow) {
            headerRow.innerHTML = columns.map(col => `
                <th class="sortable" data-column="${col}">
                    ${col}
                    <i class="fas fa-sort"></i>
                </th>
            `).join('') + '<th>Ações</th>';

            // Adicionar eventos de ordenação
            headerRow.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', () => this.handleSort(th));
            });
        }

        this.refreshTable(data, new Set());
        this.updateModuleFilter(columns, data);
    }

    refreshTable(data, modifiedRows = new Set()) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const start = (this.currentPage - 1) * this.rowsPerPage;
        const paginatedData = data.slice(start, start + this.rowsPerPage);

        tableBody.innerHTML = paginatedData.map((row, index) => `
            <tr class="${modifiedRows.has(start + index) ? 'table-warning' : ''}">
                ${row.map((cell, cellIndex) => `
                    <td class="editable" 
                        data-row="${start + index}" 
                        data-col="${cellIndex}"
                        data-original="${this.escapeHtml(cell)}">
                        ${this.formatCell(cell)}
                    </td>
                `).join('')}
                <td class="actions">
                    <button class="btn btn-sm btn-danger delete-row" data-row="${start + index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.setupTableEventListeners(tableBody);
        this.updatePagination(data.length);
    }

    setupTableEventListeners(tableBody) {
        // Edição de células
        tableBody.querySelectorAll('.editable').forEach(cell => {
            cell.addEventListener('dblclick', () => this.startEditing(cell));
        });

        // Botões de exclusão
        tableBody.querySelectorAll('.delete-row').forEach(button => {
            button.addEventListener('click', (e) => {
                const rowIndex = parseInt(button.dataset.row);
                this.handleDeleteRow(rowIndex);
            });
        });
    }

    startEditing(cell) {
        if (this.editingCell) this.finishEditing();

        const value = cell.dataset.original;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control edit-input';
        input.value = value;
        input.dataset.original = value;

        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();

        input.addEventListener('blur', () => this.finishEditing());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.finishEditing();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelEditing();
            }
        });

        this.editingCell = cell;
    }

    finishEditing() {
        if (!this.editingCell) return;

        const input = this.editingCell.querySelector('.edit-input');
        if (!input) return;

        const newValue = input.value;
        const originalValue = input.dataset.original;
        const rowIndex = parseInt(this.editingCell.dataset.row);
        const colIndex = parseInt(this.editingCell.dataset.col);

        if (newValue !== originalValue) {
            // Atualizar dados
            this.currentData[rowIndex][colIndex] = newValue;
            this.editingCell.dataset.original = newValue;
            this.editingCell.classList.add('modified');
        }

        this.editingCell.innerHTML = this.formatCell(newValue);
        this.editingCell = null;
    }

    cancelEditing() {
        if (!this.editingCell) return;

        const originalValue = this.editingCell.dataset.original;
        this.editingCell.innerHTML = this.formatCell(originalValue);
        this.editingCell = null;
    }

    filterTable(searchTerm) {
        this.currentPage = 1;
        const term = searchTerm.toLowerCase();
        
        this.filteredData = this.currentData.filter(row =>
            row.some(cell => 
                String(cell).toLowerCase().includes(term)
            )
        );

        this.refreshTable(this.filteredData);
    }

    filterByModule(moduleValue) {
        this.currentPage = 1;
        
        this.filteredData = moduleValue 
            ? this.currentData.filter(row => row[0] === moduleValue)
            : [...this.currentData];

        this.refreshTable(this.filteredData);
    }

    updateModuleFilter(columns, data) {
        const moduleFilter = document.getElementById('moduleFilter');
        if (!moduleFilter) return;

        const modules = new Set(data.map(row => row[0]));
        moduleFilter.innerHTML = `
            <option value="">Todos os Módulos</option>
            ${[...modules].map(module => `
                <option value="${module}">${module}</option>
            `).join('')}
        `;
    }

    updatePagination(totalRows) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(totalRows / this.rowsPerPage);
        let html = '';

        // Primeira página
        html += `
            <button class="btn btn-outline-primary ${this.currentPage === 1 ? 'disabled' : ''}"
                    data-page="1">
                <i class="fas fa-angle-double-left"></i>
            </button>
        `;

        // Páginas
        for (let i = Math.max(1, this.currentPage - 2); 
             i <= Math.min(totalPages, this.currentPage + 2); i++) {
            html += `
                <button class="btn btn-outline-primary ${i === this.currentPage ? 'active' : ''}"
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }

        // Última página
        html += `
            <button class="btn btn-outline-primary ${this.currentPage === totalPages ? 'disabled' : ''}"
                    data-page="${totalPages}">
                <i class="fas fa-angle-double-right"></i>
            </button>
        `;

        pagination.innerHTML = html;

        // Adicionar eventos
        pagination.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                if (!button.classList.contains('disabled')) {
                    this.currentPage = parseInt(button.dataset.page);
                    this.refreshTable(this.filteredData);
                }
            });
        });
    }

    changeRowsPerPage(value) {
        this.rowsPerPage = value;
        this.currentPage = 1;
        this.refreshTable(this.filteredData);
    }

    showSuccessMessage(message) {
        Swal.fire({
            icon: 'success',
            title: 'Sucesso',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    }

    showErrorMessage(message, error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: `${message} ${error.message || error}`,
            confirmButtonText: 'OK'
        });
    }

    handleDeleteRow(rowIndex) {
        Swal.fire({
            title: 'Confirmar exclusão',
            text: 'Deseja realmente excluir esta linha?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.currentData.splice(rowIndex, 1);
                this.filteredData = [...this.currentData];
                this.refreshTable(this.filteredData);
                this.showSuccessMessage('Linha excluída com sucesso!');
            }
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatCell(value) {
        if (value === null || value === undefined) return '';
        return this.escapeHtml(value);
    }
}