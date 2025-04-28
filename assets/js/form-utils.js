/**
 * form-utils.js
 * -------------
 * Funções utilitárias para manipulação de formulários
 */

/**
 * Mostra mensagens de erro para um campo
 * @param {HTMLElement} input - O elemento com problema
 * @param {string} message - A mensagem de erro a ser exibida
 * @param {string} errorId - ID para o elemento de erro (opcional)
 */
function showError(input, message, errorId) {
    // Remove mensagem de erro existente com o mesmo ID
    if (errorId) {
        const existingError = document.getElementById(errorId);
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Adiciona estilo de erro ao input
    input.classList.add('validation-error');
    
    // Cria e insere mensagem de erro
    const errorMsg = document.createElement('div');
    if (errorId) {
        errorMsg.id = errorId;
    }
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    input.parentNode.appendChild(errorMsg);
}

/**
 * Remove mensagens de erro de um campo
 * @param {HTMLElement} input - O elemento de input
 * @param {string} errorClass - Classe CSS de erro a ser removida
 */
function clearError(input, errorClass = 'validation-error') {
    input.classList.remove(errorClass);
    
    // Remover mensagem de erro se existir
    const errorElements = input.parentNode.querySelectorAll('.error-message');
    errorElements.forEach(element => element.remove());
}

/**
 * Adiciona limpeza automática de erros em tempo real
 */
function addRealTimeErrorClearing() {
    // Selecionar todos os campos do formulário
    const formFields = document.querySelectorAll('input, select, textarea');
    
    formFields.forEach(field => {
        field.addEventListener('input', function() {
            // Se o campo está com erro
            if (this.classList.contains('validation-error') ||
                this.classList.contains('phone-error') ||
                this.classList.contains('cpf-error') ||
                this.classList.contains('date-error') ||
                this.classList.contains('name-error')) {
                
                // Para campos obrigatórios, verificar se está preenchido
                if (this.required && !this.value.trim()) return;
                
                // Remover todas as classes de erro
                this.classList.remove('validation-error', 'phone-error', 'cpf-error', 'date-error', 'name-error');
                
                // Remover mensagem de erro se existir
                const errorElements = this.parentNode.querySelectorAll('.error-message, .phone-error-message');
                errorElements.forEach(element => element.remove());
            }
        });
    });
}

/**
 * Valida um formulário completo
 * @param {HTMLFormElement} form - O formulário a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validateForm(form) {
    if (!form) return false;
    
    let isValid = true;
    
    // 1. Validar campos obrigatórios
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showError(field, 'Este campo é obrigatório');
            isValid = false;
            
            // Destacar a primeira aba com erro
            if (isValid === false) {
                const tabContent = field.closest('.tab-content');
                if (tabContent) {
                    const tabId = tabContent.id;
                    const tab = document.querySelector(`[data-tab="${tabId}"]`);
                    if (tab) {
                        // Switch to this tab
                        const switchTabEvent = new Event('click');
                        tab.dispatchEvent(switchTabEvent);
                    }
                }
            }
        }
    });
    
    // 2. Validar CPF
    const cpfField = document.getElementById('input_95');
    if (cpfField && cpfField.value) {
        const cleanCPF = cpfField.value.replace(/\D/g, '');
        if (cleanCPF.length !== 11 || !Validators.validateCPF(cleanCPF)) {
            showError(cpfField, 'CPF inválido', 'cpf-error-msg');
            isValid = false;
        }
    }
    
    // 3. Validar datas
    const birthDateField = document.getElementById('input_104');
    if (birthDateField && birthDateField.value) {
        if (!Validators.validateAge(birthDateField.value)) {
            showError(birthDateField, 'Data de nascimento inválida ou menor de 18 anos', 'birthdate-error-msg');
            isValid = false;
        }
    }
    
    const issuanceDateField = document.getElementById('input_106');
    if (issuanceDateField && issuanceDateField.value) {
        if (!Validators.validateIssuanceDate(issuanceDateField.value)) {
            showError(issuanceDateField, 'Data de expedição inválida ou posterior à data atual', 'issuance-error-msg');
            isValid = false;
        }
    }
    
    // 4. Validar telefone
    const phoneField = document.getElementById('input_118_full');
    if (phoneField && phoneField.value) {
        if (!Validators.validatePhone(phoneField)) {
            isValid = false;
        }
    }
    
    // 5. Validar upload de arquivos
    const fileInputs = form.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        if (input.required || (input.files && input.files.length > 0)) {
            if (!Validators.validateFileUpload(input)) {
                showError(input, 'Arquivo inválido ou muito grande (máx. 10MB)', 'file-error-msg');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

/**
 * Inicializa as funcionalidades utilitárias do formulário
 */
function initFormUtils() {
    // Adicionar limpeza automática de erros
    addRealTimeErrorClearing();
    
    // Adicionar validação ao enviar o formulário
    const form = document.getElementById('cadastro-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                
                // Focar no primeiro campo com erro
                const firstErrorField = document.querySelector('.validation-error, .phone-error, .cpf-error, .date-error, .name-error');
                if (firstErrorField) {
                    firstErrorField.focus();
                }
                
                return false;
            }
        });
    }
}

// Exportar as funções para uso global
window.FormUtils = {
    showError,
    clearError,
    addRealTimeErrorClearing,
    validateForm,
    initFormUtils
}; 