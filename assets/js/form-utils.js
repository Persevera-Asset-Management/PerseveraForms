/**
 * form-utils.js
 * -------------
 * Funções utilitárias para manipulação de formulários
 */

// Criar o namespace FormUtils
const FormUtils = window.FormUtils || {};

/**
 * Mostra mensagens de erro para um campo
 * @param {HTMLElement} input - O elemento com problema
 * @param {string} message - A mensagem de erro a ser exibida
 * @param {string} errorId - ID para o elemento de erro (opcional)
 */
FormUtils.showError = function(input, message, errorId) {
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
};

/**
 * Remove mensagens de erro de um campo
 * @param {HTMLElement} input - O elemento de input
 * @param {string} errorClass - Classe CSS de erro a ser removida
 */
FormUtils.clearError = function(input, errorClass = 'validation-error') {
    input.classList.remove(errorClass);
    
    // Remover mensagem de erro se existir
    const errorElements = input.parentNode.querySelectorAll('.error-message');
    errorElements.forEach(element => element.remove());
};

/**
 * Adiciona limpeza automática de erros em tempo real
 */
FormUtils.addRealTimeErrorClearing = function() {
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
};

/**
 * Valida um formulário completo
 * @param {HTMLFormElement} form - O formulário a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
FormUtils.validateForm = function(form) {
    if (!form) return false;
    
    let isValid = true;
    
    // 1. Validar campos obrigatórios
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            // Em vez de mostrar uma mensagem, apenas destaque o campo
            field.classList.add('is-invalid', 'required-empty-field');
            FormUtils.highlightInvalidField(field);
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
            this.showError(cpfField, 'CPF inválido', 'cpf-error-msg');
            isValid = false;
        }
    }
    
    // 3. Validar datas
    const birthDateField = document.getElementById('input_104');
    if (birthDateField && birthDateField.value) {
        if (!Validators.validateAge(birthDateField.value)) {
            this.showError(birthDateField, 'Data de nascimento inválida ou menor de 18 anos', 'birthdate-error-msg');
            isValid = false;
        }
    }
    
    const issuanceDateField = document.getElementById('input_106');
    if (issuanceDateField && issuanceDateField.value) {
        if (!Validators.validateIssuanceDate(issuanceDateField.value)) {
            this.showError(issuanceDateField, 'Data de expedição inválida ou posterior à data atual', 'issuance-error-msg');
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
                this.showError(input, 'Arquivo inválido ou muito grande (máx. 10MB)', 'file-error-msg');
                isValid = false;
            }
        }
    });
    
    return isValid;
};

/**
 * Impede a digitação de caracteres inválidos em campos de nome
 * @param {HTMLElement} inputField - Campo de entrada a ser monitorado
 */
FormUtils.preventInvalidNameChars = function(inputField) {
    if (!inputField) return;
    
    inputField.addEventListener('input', function(e) {
        // Guarda a posição atual do cursor
        const cursorPos = this.selectionStart;
        
        // O valor atual do campo
        const currentValue = this.value;
        
        // Remove caracteres inválidos: números e caracteres especiais não permitidos
        // Permitidos: letras, espaços, apóstrofo ('), hífen (-) e ponto (.)
        const newValue = currentValue.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s()']/g, '');
        
        // Se o valor mudou, atualiza o campo e restaura a posição do cursor
        if (newValue !== currentValue) {
            // Calcula quantos caracteres foram removidos
            const removedCount = currentValue.length - newValue.length;
            
            // Atualiza o valor
            this.value = newValue;
            
            // Restaura a posição do cursor, ajustando pelos caracteres removidos
            this.setSelectionRange(cursorPos - removedCount, cursorPos - removedCount);
            
            // Exibe mensagem temporária de feedback ao usuário
            this.classList.add('flash-invalid');
            
            // Exibe a mensagem de erro associada
            const errorMessageElement = this.parentNode.querySelector('.name-error-message');
            if (errorMessageElement) {
                errorMessageElement.style.display = 'block';
                errorMessageElement.classList.add('flash-message');
                
                // Oculta a mensagem após 2 segundos
                setTimeout(() => {
                    errorMessageElement.style.display = 'none';
                    errorMessageElement.classList.remove('flash-message');
                }, 2000);
            }
            
            // Remove a classe após 500ms
            setTimeout(() => {
                this.classList.remove('flash-invalid');
            }, 500);
        }
    });
};

/**
 * Aplica prevenção de caracteres inválidos para campos de nome
 */
FormUtils.setupNameFieldsRestrictions = function() {
    // Lista de campos que devem ter restrição de caracteres
    const nameFields = [
        document.getElementById('input_94'),  // Nome Completo
        document.getElementById('input_96'),  // Nacionalidade
        document.getElementById('input_97'),  // Naturalidade
        document.getElementById('input_99'),  // Órgão Emissor
        document.getElementById('input_100'), // Nome da Mãe
        document.getElementById('input_101'), // Nome do Pai
        document.getElementById('input_225'), // Nome do Cônjuge
        document.getElementById('input_229'), // Nacionalidade do Cônjuge
        document.getElementById('input_230'), // Naturalidade do Cônjuge
        document.getElementById('input_235'), // Órgão Emissor do Cônjuge
        document.getElementById('input_236'), // Nome da Mãe do Cônjuge
        document.getElementById('input_237')  // Nome do Pai do Cônjuge
    ];
    
    // Aplicar restrição a cada campo
    nameFields.forEach(field => {
        if (field) {
            this.preventInvalidNameChars(field);
        }
    });
};

/**
 * Impede a digitação de caracteres inválidos em campos de CPF
 * @param {HTMLElement} inputField - Campo de entrada a ser monitorado
 */
FormUtils.preventInvalidCpfChars = function(inputField) {
    if (!inputField) return;
    
    inputField.addEventListener('input', function(e) {
        // Guarda a posição atual do cursor
        const cursorPos = this.selectionStart;
        
        // O valor atual do campo
        const currentValue = this.value;
        
        // Remove caracteres inválidos: apenas dígitos, pontos e hífen são permitidos
        const newValue = currentValue.replace(/[^0-9.-]/g, '');
        
        // Se o valor mudou, atualiza o campo e restaura a posição do cursor
        if (newValue !== currentValue) {
            // Calcula quantos caracteres foram removidos
            const removedCount = currentValue.length - newValue.length;
            
            // Atualiza o valor
            this.value = newValue;
            
            // Restaura a posição do cursor, ajustando pelos caracteres removidos
            this.setSelectionRange(cursorPos - removedCount, cursorPos - removedCount);
            
            // Exibe mensagem temporária de feedback ao usuário
            this.classList.add('flash-invalid');
            
            // Exibe a mensagem de erro associada
            const errorMessageElement = this.parentNode.querySelector('.cpf-error-message');
            if (errorMessageElement) {
                errorMessageElement.style.display = 'block';
                errorMessageElement.classList.add('flash-message');
                
                // Oculta a mensagem após 2 segundos
                setTimeout(() => {
                    errorMessageElement.style.display = 'none';
                    errorMessageElement.classList.remove('flash-message');
                }, 2000);
            }
            
            // Remove a classe após 500ms
            setTimeout(() => {
                this.classList.remove('flash-invalid');
            }, 500);
        }
    });
};

/**
 * Aplica prevenção de caracteres inválidos para campos de CPF
 */
FormUtils.setupCpfFieldsRestrictions = function() {
    // Lista de campos de CPF
    const cpfFields = [
        document.getElementById('input_95'),   // CPF
        document.getElementById('input_228')   // CPF do cônjuge
    ];
    
    // Aplicar restrição a cada campo
    cpfFields.forEach(field => {
        if (field) {
            this.preventInvalidCpfChars(field);
        }
    });
};

/**
 * Inicializa todas as utilidades de formulário
 */
FormUtils.initFormUtils = function() {
    // Inicializa as features existentes
    this.addRealTimeErrorClearing();
    
    // Adicionar validação ao enviar o formulário
    const form = document.getElementById('cadastro-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            if (!FormUtils.validateForm(form)) {
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
    
    // Inicializa a nova feature de restrição de caracteres em campos de nome
    this.setupNameFieldsRestrictions();
    
    // Inicializa a nova feature de restrição de caracteres em campos de CPF
    this.setupCpfFieldsRestrictions();
};

/**
 * Destaca visualmente campos inválidos com uma animação sutil
 * @param {HTMLElement} field - Campo a ser destacado
 */
FormUtils.highlightInvalidField = function(field) {
    if (!field) return;
    
    // Adiciona uma animação sutil ao campo
    field.classList.add('animate-invalid');
    
    // Remove a animação após ela ser concluída para permitir que seja aplicada novamente
    setTimeout(() => {
        field.classList.remove('animate-invalid');
    }, 400);
};

// Exportar o objeto FormUtils para uso global
window.FormUtils = FormUtils; 