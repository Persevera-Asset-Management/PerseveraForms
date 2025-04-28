/**
 * cep-handler.js
 * --------------
 * Funções para gerenciar a busca e validação de CEPs brasileiros
 */

/**
 * Busca endereço a partir do CEP
 * @param {string} cep - CEP a ser buscado (apenas números)
 * @param {string} prefix - ID do campo de CEP que originou a busca
 */
function buscarCep(cep, prefix) {
    const cepInput = document.getElementById(prefix);
    const logradouroId = prefix === 'input_108' ? 'input_109' : 'input_216';
    const bairroId = prefix === 'input_108' ? 'input_111' : 'input_220';
    const cidadeId = prefix === 'input_108' ? 'input_110' : 'input_221';
    const estadoId = prefix === 'input_108' ? 'input_114' : 'input_222';
    const numeroId = prefix === 'input_108' ? 'input_112' : 'input_217';
    
    // Remove classes anteriores
    cepInput.classList.remove('cep-valido');
    cepInput.classList.remove('validation-error');
    
    // Remove mensagem de erro anterior se existir
    const errorEl = document.getElementById(`cep-error-msg-${prefix}`);
    if (errorEl) errorEl.remove();
    
    // Remove mensagem de sucesso anterior se existir
    const successEl = document.getElementById(`cep-success-msg-${prefix}`);
    if (successEl) successEl.remove();
    
    // Mostra indicador de carregamento
    cepInput.classList.add('loading');
    
    // Adiciona mensagem de busca
    const statusMsg = document.createElement('div');
    statusMsg.id = `cep-status-msg-${prefix}`;
    statusMsg.className = 'cep-status-msg';
    statusMsg.textContent = 'Buscando endereço...';
    cepInput.parentNode.appendChild(statusMsg);
    
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar o CEP');
            }
            return response.json();
        })
        .then(data => {
            // Remove indicador de carregamento
            cepInput.classList.remove('loading');
            
            // Remove mensagem de status
            const statusEl = document.getElementById(`cep-status-msg-${prefix}`);
            if (statusEl) statusEl.remove();
            
            // Verifica se a API retornou erro
            if (data.erro) {
                FormUtils.showError(cepInput, 'CEP não encontrado', `cep-error-msg-${prefix}`);
                return;
            }
            
            // Preenche os campos com os dados retornados
            document.getElementById(logradouroId).value = data.logradouro || '';
            document.getElementById(bairroId).value = data.bairro || '';
            document.getElementById(cidadeId).value = data.localidade || '';
            
            // Seleciona o estado no dropdown
            const estadoSelect = document.getElementById(estadoId);
            for (let i = 0; i < estadoSelect.options.length; i++) {
                if (estadoSelect.options[i].value === data.uf) {
                    estadoSelect.selectedIndex = i;
                    break;
                }
            }
            
            // Adiciona estilo visual de CEP válido
            cepInput.classList.add('cep-valido');
            
            // Adiciona mensagem de sucesso
            const successMsg = document.createElement('div');
            successMsg.id = `cep-success-msg-${prefix}`;
            successMsg.className = 'cep-success-msg';
            successMsg.textContent = 'CEP válido! Endereço encontrado.';
            cepInput.parentNode.appendChild(successMsg);
            
            // Foca no campo de número após preencher o endereço
            document.getElementById(numeroId).focus();
        })
        .catch(error => {
            // Remove indicador de carregamento
            cepInput.classList.remove('loading');
            
            // Remove mensagem de status
            const statusEl = document.getElementById(`cep-status-msg-${prefix}`);
            if (statusEl) statusEl.remove();
            
            // Mostra mensagem de erro
            FormUtils.showError(cepInput, 'Erro ao buscar o CEP', `cep-error-msg-${prefix}`);
            console.error('Erro:', error);
        });
}

/**
 * Configura um campo de CEP com formatação e busca automática
 * @param {HTMLElement} cepField - O elemento de input do CEP
 */
function setupCepField(cepField) {
    if (cepField) {
        cepField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
            }
            
            e.target.value = value;
            
            // Se o CEP tiver 8 dígitos, busca o endereço
            if (value.length === 8) {
                buscarCep(value, this.id);
            } else if (value.length > 0 && value.length < 8) {
                // Se o CEP estiver incompleto, mostrar feedback visual
                this.classList.remove('cep-valido');
                this.classList.remove('validation-error');
                
                // Remover mensagem de erro se existir
                const errorEl = document.getElementById(`cep-error-msg-${this.id}`);
                if (errorEl) errorEl.remove();
                
                // Remover mensagem de sucesso se existir
                const successEl = document.getElementById(`cep-success-msg-${this.id}`);
                if (successEl) successEl.remove();
            }
        });
        
        // Busca também quando o campo perde o foco
        cepField.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                buscarCep(cep, this.id);
            }
        });
    }
}

/**
 * Inicializa os campos de CEP na página
 */
function initCepFields() {
    const cepResidencia = document.getElementById('input_108');
    const cepCorrespondencia = document.getElementById('input_215');
    
    if (cepResidencia) {
        setupCepField(cepResidencia);
    }
    
    if (cepCorrespondencia) {
        setupCepField(cepCorrespondencia);
    }
}

// Exportar as funções para uso global
window.CepHandler = {
    buscarCep,
    setupCepField,
    initCepFields
}; 