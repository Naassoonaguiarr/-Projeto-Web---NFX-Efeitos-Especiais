class DataManager {
    constructor() {
        this.originalData = [];
        this.currentData = [];
        this.columns = [];
        this.changes = new Set();
    }

    async loadData(csvData) {
        return new Promise((resolve, reject) => {
            try {
                Papa.parse(csvData, {
                    complete: (results) => {
                        if (results.data && results.data.length > 0) {
                            // Remove linhas vazias
                            const filteredData = results.data.filter(row => 
                                row.some(cell => cell && cell.trim() !== '')
                            );

                            if (filteredData.length > 0) {
                                this.columns = filteredData[0];
                                this.originalData = filteredData.slice(1);
                                this.currentData = JSON.parse(JSON.stringify(this.originalData));
                                this.changes.clear();
                                resolve();
                            } else {
                                reject(new Error('O arquivo CSV está vazio'));
                            }
                        } else {
                            reject(new Error('Formato de arquivo inválido'));
                        }
                    },
                    error: (error) => reject(new Error(`Erro ao processar CSV: ${error.message}`)),
                    skipEmptyLines: true
                });
            } catch (error) {
                reject(new Error(`Erro ao carregar dados: ${error.message}`));
            }
        });
    }

    updateCell(rowIndex, colIndex, value) {
        if (rowIndex >= 0 && rowIndex < this.currentData.length &&
            colIndex >= 0 && colIndex < this.columns.length) {
            
            const oldValue = this.currentData[rowIndex][colIndex];
            if (oldValue !== value) {
                this.currentData[rowIndex][colIndex] = value;
                this.changes.add(rowIndex);
                return true;
            }
        }
        return false;
    }

    addRow(newRow) {
        if (newRow.length !== this.columns.length) {
            newRow = Array(this.columns.length).fill('');
        }
        this.currentData.push(newRow);
        this.changes.add(this.currentData.length - 1);
        return this.currentData.length - 1;
    }

    deleteRow(index) {
        if (index >= 0 && index < this.currentData.length) {
            this.currentData.splice(index, 1);
            
            // Atualizar conjunto de mudanças
            const newChanges = new Set();
            this.changes.forEach(changedIndex => {
                if (changedIndex < index) {
                    newChanges.add(changedIndex);
                } else if (changedIndex > index) {
                    newChanges.add(changedIndex - 1);
                }
            });
            this.changes = newChanges;
            return true;
        }
        return false;
    }

    undoChanges() {
        this.currentData = JSON.parse(JSON.stringify(this.originalData));
        this.changes.clear();
        return true;
    }

    async saveChanges() {
        try {
            this.originalData = JSON.parse(JSON.stringify(this.currentData));
            this.changes.clear();
            
            // Salvar no localStorage
            localStorage.setItem('csvData', this.exportToCSV());
            return true;
        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
            throw new Error('Não foi possível salvar as alterações');
        }
    }

    exportToCSV() {
        try {
            return Papa.unparse({
                fields: this.columns,
                data: this.currentData
            });
        } catch (error) {
            console.error('Erro ao exportar para CSV:', error);
            throw new Error('Não foi possível exportar os dados');
        }
    }

    getFilteredData(searchTerm = '', moduleFilter = '') {
        return this.currentData.filter(row => {
            const matchesSearch = !searchTerm || row.some(cell => 
                String(cell).toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            const matchesModule = !moduleFilter || row[0] === moduleFilter;
            
            return matchesSearch && matchesModule;
        });
    }

    getSortedData(data, column, direction) {
        if (!column) return data;

        const columnIndex = this.columns.indexOf(column);
        if (columnIndex === -1) return data;

        return [...data].sort((a, b) => {
            const valueA = this.parseValue(a[columnIndex]);
            const valueB = this.parseValue(b[columnIndex]);
            
            return direction === 'asc' 
                ? this.compare(valueA, valueB)
                : this.compare(valueB, valueA);
        });
    }

    parseValue(value) {
        if (value === null || value === undefined) return '';
        
        // Tenta converter para número
        const num = Number(value);
        if (!isNaN(num)) return num;
        
        // Tenta converter para data
        const date = new Date(value);
        if (date instanceof Date && !isNaN(date)) return date;
        
        // Retorna como string
        return String(value).toLowerCase();
    }

    compare(a, b) {
        if (a === b) return 0;
        return a < b ? -1 : 1;
    }

    getStatistics() {
        return {
            totalRows: this.currentData.length,
            modifiedRows: this.changes.size,
            columns: this.columns.length
        };
    }
}