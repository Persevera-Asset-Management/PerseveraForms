/**
 * FormValidator - Módulo para validação de formulários
 * Fornece funcionalidades para validação de campos e exibição de erros
 */
(function(window) {
    'use strict';

    // Namespace para o validador de formulários
    const FormValidator = {};

    // Tipos de validações disponíveis
    const validationTypes = {
        REQUIRED: 'required',
        EMAIL: 'email',
        CPF: 'cpf',
        CNPJ: 'cnpj',
        CEP: 'cep',
        PHONE: 'phone',
        MIN_LENGTH: 'minLength',
        MAX_LENGTH: 'maxLength',
        PATTERN: 'pattern',
        MATCH: 'match',
        CUSTOM: 'custom'
    };

    // Mensagens de erro padrão
    const defaultMessages = {
        [validationTypes.REQUIRED]: 'Este campo é obrigatório',
        [validationTypes.EMAIL]: 'Por favor, insira um email válido',
        [validationTypes.CPF]: 'CPF inválido',
        [validationTypes.CNPJ]: 'CNPJ inválido',
        [validationTypes.CEP]: 'CEP inválido',
        [validationTypes.PHONE]: 'Telefone inválido',
        [validationTypes.MIN_LENGTH]: 'Este campo deve ter no mínimo {0} caracteres',
        [validationTypes.MAX_LENGTH]: 'Este campo deve ter no máximo {0} caracteres',
        [validationTypes.PATTERN]: 'Formato inválido',
        [validationTypes.MATCH]: 'Os campos não coincidem'
    };

    /**
     * Formata uma mensagem substituindo os placeholders {0}, {1}, etc.
     * @param {string} message - Mensagem de erro com placeholders
     * @param {Array} params - Parâmetros para substituir nos placeholders
     * @returns {string} - Mensagem formatada
     */
    function formatMessage(message, params) {
        if (!params || !params.length) return message;
        
        return message.replace(/\{(\d+)\}/g, function(match, index) {
            return typeof params[parseInt(index)] !== 'undefined' 
                ? params[parseInt(index)] 
                : match;
        });
    }

    /**
     * Verifica se um CPF é válido
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} - Verdadeiro se válido, falso caso contrário
     */
    function validateCPF(cpf) {
        cpf = cpf.replace(/[^0-9]/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) {
            remainder = 0;
        }
        
        if (remainder !== parseInt(cpf.substring(9, 10))) {
            return false;
        }
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) {
            remainder = 0;
        }
        
        return remainder === parseInt(cpf.substring(10, 11));
    }

    /**
     * Verifica se um CNPJ é válido
     * @param {string} cnpj - CNPJ a ser validado
     * @returns {boolean} - Verdadeiro se válido, falso caso contrário
     */
    function validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^0-9]/g, '');
        
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }
        
        let size = cnpj.length - 2;
        let numbers = cnpj.substring(0, size);
        const digits = cnpj.substring(size);
        let sum = 0;
        let pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) {
            return false;
        }
        
        size = size + 1;
        numbers = cnpj.substring(0, size);
        sum = 0;
        pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        
        return result === parseInt(digits.charAt(1));
    }

    /**
     * Exibe mensagem de erro para um campo
     * @param {HTMLElement} field - Campo com erro
     * @param {string} message - Mensagem de erro
     */
    function showError(field, message) {
        // Remove mensagens de erro existentes
        removeError(field);
        
        // Adiciona classe de erro
        field.classList.add('is-invalid');
        
        // Cria elemento de feedback
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        
        // Insere feedback após o campo
        if (field.parentNode) {
            field.parentNode.appendChild(feedback);
        }
    }

    /**
     * Remove mensagem de erro de um campo
     * @param {HTMLElement} field - Campo a ter o erro removido
     */
    function removeError(field) {
        // Remove classe de erro
        field.classList.remove('is-invalid');
        
        // Remove elementos de feedback
        if (field.parentNode) {
            const feedbacks = field.parentNode.querySelectorAll('.invalid-feedback');
            feedbacks.forEach(element => element.remove());
        }
    }

    /**
     * Valida um campo individual
     * @param {HTMLElement} field - Campo a ser validado
     * @param {Object} rules - Regras de validação
     * @param {Object} options - Opções adicionais
     * @returns {boolean} - Verdadeiro se válido, falso caso contrário
     */
    FormValidator.validateField = function(field, rules, options = {}) {
        // Se o campo não existir, retorna verdadeiro
        if (!field) return true;
        
        // Mescla opções com valores padrão
        const config = {
            showErrors: true,
            formRef: null,
            customMessages: {}
        };
        Object.assign(config, options);
        
        // Obtém o valor do campo
        let value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Verifica cada regra
        for (const rule in rules) {
            if (!rules.hasOwnProperty(rule)) continue;
            
            const ruleValue = rules[rule];
            let params = [];
            
            // Pula validação se o campo não for obrigatório e estiver vazio
            if (rule !== validationTypes.REQUIRED && value === '' && !rules[validationTypes.REQUIRED]) {
                continue;
            }
            
            switch (rule) {
                case validationTypes.REQUIRED:
                    if (ruleValue && value === '') {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.EMAIL:
                    if (ruleValue && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.CPF:
                    if (ruleValue && !validateCPF(value)) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.CNPJ:
                    if (ruleValue && !validateCNPJ(value)) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.CEP:
                    if (ruleValue && !/^\d{5}-?\d{3}$/.test(value)) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.PHONE:
                    if (ruleValue && !/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(value)) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.MIN_LENGTH:
                    params = [ruleValue];
                    if (value.length < ruleValue) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || formatMessage(defaultMessages[rule], params);
                    }
                    break;
                    
                case validationTypes.MAX_LENGTH:
                    params = [ruleValue];
                    if (value.length > ruleValue) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || formatMessage(defaultMessages[rule], params);
                    }
                    break;
                    
                case validationTypes.PATTERN:
                    if (!new RegExp(ruleValue).test(value)) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.MATCH:
                    const matchField = config.formRef ? config.formRef.querySelector(ruleValue) : document.querySelector(ruleValue);
                    if (matchField && value !== matchField.value.trim()) {
                        isValid = false;
                        errorMessage = config.customMessages[rule] || defaultMessages[rule];
                    }
                    break;
                    
                case validationTypes.CUSTOM:
                    if (typeof ruleValue === 'function') {
                        const result = ruleValue(value, field);
                        if (result !== true) {
                            isValid = false;
                            errorMessage = typeof result === 'string' ? result : (config.customMessages[rule] || 'Validação falhou');
                        }
                    }
                    break;
            }
            
            // Se encontrou um erro, interrompe a validação
            if (!isValid) break;
        }
        
        // Atualiza a UI com o resultado da validação
        if (config.showErrors) {
            if (isValid) {
                removeError(field);
                field.classList.add('is-valid');
            } else {
                showError(field, errorMessage);
            }
        }
        
        return isValid;
    };

    /**
     * Valida um formulário inteiro
     * @param {HTMLFormElement|string} form - Formulário ou seu ID
     * @param {Object} validationRules - Regras de validação para cada campo
     * @param {Object} options - Opções adicionais
     * @returns {boolean} - Verdadeiro se todos os campos são válidos
     */
    FormValidator.validateForm = function(form, validationRules, options = {}) {
        // Obtém o elemento do formulário
        if (typeof form === 'string') {
            form = document.getElementById(form);
        }
        
        if (!form || !validationRules) {
            console.error('Formulário ou regras de validação inválidos');
            return false;
        }
        
        // Mescla opções com valores padrão
        const config = {
            showErrors: true,
            scrollToError: true,
            customMessages: {}
        };
        Object.assign(config, options);
        
        let isValid = true;
        let firstError = null;
        
        // Valida cada campo definido nas regras
        for (const fieldName in validationRules) {
            if (!validationRules.hasOwnProperty(fieldName)) continue;
            
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) continue;
            
            const rules = validationRules[fieldName];
            const fieldOptions = {
                showErrors: config.showErrors,
                formRef: form,
                customMessages: config.customMessages[fieldName] || {}
            };
            
            const fieldValid = FormValidator.validateField(field, rules, fieldOptions);
            
            if (!fieldValid) {
                isValid = false;
                
                // Guarda referência ao primeiro campo com erro
                if (!firstError) {
                    firstError = field;
                }
            }
        }
        
        // Scroll para o primeiro erro
        if (!isValid && config.scrollToError && firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        
        return isValid;
    };

    /**
     * Define validações para campos baseado em atributos data-*
     * @param {HTMLFormElement|string} form - Formulário ou seu ID
     * @param {Object} options - Opções adicionais
     */
    FormValidator.initFormValidation = function(form, options = {}) {
        // Obtém o elemento do formulário
        if (typeof form === 'string') {
            form = document.getElementById(form);
        }
        
        if (!form) {
            console.error('Formulário inválido');
            return;
        }
        
        // Mescla opções com valores padrão
        const config = {
            validateOnBlur: true,
            validateOnInput: false,
            submitHandler: null,
            customMessages: {}
        };
        Object.assign(config, options);
        
        // Coleta campos com atributos de validação
        const fields = form.querySelectorAll('[data-validate]');
        
        // Configura validação para cada campo
        fields.forEach(field => {
            if (config.validateOnBlur) {
                field.addEventListener('blur', function() {
                    const rules = parseValidationRules(field);
                    FormValidator.validateField(field, rules, {
                        formRef: form,
                        customMessages: parseCustomMessages(field)
                    });
                });
            }
            
            if (config.validateOnInput) {
                field.addEventListener('input', function() {
                    const rules = parseValidationRules(field);
                    FormValidator.validateField(field, rules, {
                        formRef: form,
                        customMessages: parseCustomMessages(field)
                    });
                });
            }
        });
        
        // Configura envio do formulário
        form.addEventListener('submit', function(event) {
            const validationRules = {};
            const allCustomMessages = {};
            
            // Constrói regras de validação para todos os campos
            fields.forEach(field => {
                const fieldName = field.name;
                validationRules[fieldName] = parseValidationRules(field);
                allCustomMessages[fieldName] = parseCustomMessages(field);
            });
            
            // Valida o formulário
            const isValid = FormValidator.validateForm(form, validationRules, {
                customMessages: allCustomMessages
            });
            
            // Se inválido, impede o envio
            if (!isValid) {
                event.preventDefault();
                return false;
            }
            
            // Se tiver um handler personalizado, executa-o
            if (config.submitHandler && typeof config.submitHandler === 'function') {
                event.preventDefault();
                config.submitHandler.call(form, event);
                return false;
            }
            
            return true;
        });
        
        /**
         * Analisa atributos data-* para extrair regras de validação
         * @param {HTMLElement} field - Campo a analisar
         * @returns {Object} - Regras de validação
         */
        function parseValidationRules(field) {
            const rules = {};
            
            // Validação básica
            if (field.hasAttribute('data-validate-required')) {
                rules[validationTypes.REQUIRED] = true;
            }
            
            if (field.hasAttribute('data-validate-email')) {
                rules[validationTypes.EMAIL] = true;
            }
            
            if (field.hasAttribute('data-validate-cpf')) {
                rules[validationTypes.CPF] = true;
            }
            
            if (field.hasAttribute('data-validate-cnpj')) {
                rules[validationTypes.CNPJ] = true;
            }
            
            if (field.hasAttribute('data-validate-cep')) {
                rules[validationTypes.CEP] = true;
            }
            
            if (field.hasAttribute('data-validate-phone')) {
                rules[validationTypes.PHONE] = true;
            }
            
            // Validações com parâmetros
            if (field.hasAttribute('data-validate-minlength')) {
                rules[validationTypes.MIN_LENGTH] = parseInt(field.getAttribute('data-validate-minlength'));
            }
            
            if (field.hasAttribute('data-validate-maxlength')) {
                rules[validationTypes.MAX_LENGTH] = parseInt(field.getAttribute('data-validate-maxlength'));
            }
            
            if (field.hasAttribute('data-validate-pattern')) {
                rules[validationTypes.PATTERN] = field.getAttribute('data-validate-pattern');
            }
            
            if (field.hasAttribute('data-validate-match')) {
                rules[validationTypes.MATCH] = field.getAttribute('data-validate-match');
            }
            
            return rules;
        }
        
        /**
         * Analisa atributos data-* para extrair mensagens personalizadas
         * @param {HTMLElement} field - Campo a analisar
         * @returns {Object} - Mensagens personalizadas
         */
        function parseCustomMessages(field) {
            const messages = {};
            
            // Percorre todos os atributos do campo
            for (const attr of field.attributes) {
                // Procura por atributos de mensagem personalizada
                if (attr.name.startsWith('data-message-')) {
                    // Extrai o tipo de validação (ex: data-message-required => required)
                    const validationType = attr.name.replace('data-message-', '');
                    messages[validationType] = attr.value;
                }
            }
            
            return messages;
        }
    };

    // Exporta os tipos de validação
    FormValidator.VALIDATION_TYPES = validationTypes;

    // Exporta o módulo para o escopo global
    window.FormValidator = FormValidator;

})(window); 