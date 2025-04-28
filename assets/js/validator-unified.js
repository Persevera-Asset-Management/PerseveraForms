/**
 * validator-unified.js
 * -------------------
 * Sistema unificado de validação para formulários web
 * 
 * Combina as funcionalidades de:
 * - form-validator.js
 * - form-validators.js
 * - validation-manager.js
 */
(function(window) {
    'use strict';

    /**
     * FormValidator - Namespace principal para o sistema de validação
     */
    const FormValidator = {
        // Submodules
        Validators: {},
        UI: {},
        Config: {
            defaultMessages: {
                required: 'Este campo é obrigatório',
                email: 'Por favor, insira um email válido',
                cpf: 'CPF inválido',
                cnpj: 'CNPJ inválido',
                cep: 'CEP inválido',
                phone: 'Telefone inválido',
                minLength: 'Este campo deve ter no mínimo {0} caracteres',
                maxLength: 'Este campo deve ter no máximo {0} caracteres',
                pattern: 'Formato inválido',
                match: 'Os campos não coincidem',
                date: 'Data inválida',
                age: 'Idade mínima de 18 anos requerida',
                issuanceDate: 'Data de expedição inválida ou futura',
                documentNumber: 'Número de documento inválido',
                fileSize: 'Arquivo excede o tamanho máximo permitido',
                fileType: 'Tipo de arquivo não permitido',
                name: 'Nome inválido'
            }
        }
    };

    // Tipos de validações disponíveis
    FormValidator.TYPES = {
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
        DATE: 'date',
        AGE: 'age',
        ISSUANCE_DATE: 'issuanceDate',
        DOCUMENT: 'documentNumber',
        FILE_SIZE: 'fileSize',
        FILE_TYPE: 'fileType',
        NAME: 'name',
        CUSTOM: 'custom'
    };

    //========================================================================
    // FUNÇÕES UTILITÁRIAS
    //========================================================================

    /**
     * Formata uma mensagem substituindo os placeholders {0}, {1}, etc.
     * @param {string} message - Mensagem de erro com placeholders
     * @param {Array} params - Parâmetros para substituir nos placeholders
     * @returns {string} - Mensagem formatada
     */
    FormValidator.formatMessage = function(message, params) {
        if (!params || !params.length) return message;
        
        return message.replace(/\{(\d+)\}/g, function(match, index) {
            return typeof params[parseInt(index)] !== 'undefined' 
                ? params[parseInt(index)] 
                : match;
        });
    };

    //========================================================================
    // FUNÇÕES DE VALIDAÇÃO
    //========================================================================

    /**
     * Verifica se um CPF é válido
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} - Verdadeiro se válido, falso caso contrário
     */
    FormValidator.Validators.cpf = function(cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = 11 - (sum % 11);
        let dv1 = remainder === 10 || remainder === 11 ? 0 : remainder;
        
        if (dv1 !== parseInt(cpf.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = 11 - (sum % 11);
        let dv2 = remainder === 10 || remainder === 11 ? 0 : remainder;
        
        return dv2 === parseInt(cpf.charAt(10));
    };

    /**
     * Verifica se um CNPJ é válido
     * @param {string} cnpj - CNPJ a ser validado
     * @returns {boolean} - Verdadeiro se válido, falso caso contrário
     */
    FormValidator.Validators.cnpj = function(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        
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
    };

    /**
     * Valida um número de telefone brasileiro
     * @param {string} phone - Telefone a ser validado
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.phone = function(phone) {
        if (!phone.trim()) return true;
        
        // Remover todos os caracteres não numéricos
        const numericValue = phone.replace(/\D/g, '');
        
        // Validar o comprimento (10 para fixo, 11 para celular no Brasil)
        return numericValue.length === 10 || numericValue.length === 11;
    };

    /**
     * Valida se uma data está no formato correto
     * @param {string} dateString - Data no formato DD/MM/AAAA
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.date = function(dateString) {
        if (!dateString.trim()) return true;
        
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(regex);
        
        if (!match) return false;
        
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        
        // Verificar se a data é válida
        const date = new Date(year, month, day);
        
        return (
            date.getDate() === day &&
            date.getMonth() === month &&
            date.getFullYear() === year
        );
    };

    /**
     * Valida se uma data é maior que 18 anos
     * @param {string} dateString - Data no formato DD/MM/AAAA
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.age = function(dateString) {
        if (!FormValidator.Validators.date(dateString)) return false;
        
        const parts = dateString.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        // Verificar idade mínima (18 anos)
        const birthDate = new Date(year, month, day);
        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() - month;
        
        if (m < 0 || (m === 0 && today.getDate() < day)) {
            age--;
        }
        
        return age >= 18;
    };

    /**
     * Valida data de expedição (não pode ser futura)
     * @param {string} dateString - Data no formato DD/MM/AAAA
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.issuanceDate = function(dateString) {
        if (!FormValidator.Validators.date(dateString)) return false;
        
        const parts = dateString.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        // Verificar se não é futura
        const expeditionDate = new Date(year, month, day);
        return expeditionDate <= new Date();
    };

    /**
     * Valida número de documento de acordo com o tipo
     * @param {string} value - Valor do documento
     * @param {string} docType - Tipo de documento (RG, CNH, Passaporte)
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.documentNumber = function(value, docType) {
        if (!value.trim() || !docType) return true;
        
        if (docType === 'RG') {
            // Para RG, aceitar o formato com pontos e traço, mas validar o comprimento dos números
            const rgValue = value.replace(/\D/g, '');
            return rgValue.length >= 8 && rgValue.length <= 10;
        } else if (docType === 'CNH') {
            // Para CNH, aceitar o formato com pontos e traços, mas validar o comprimento dos números
            const cnhValue = value.replace(/\D/g, '');
            return cnhValue.length === 11;
        } else if (docType === 'Passaporte') {
            // Para Passaporte, aceitar o formato XX.000000 ou XX-000000 além do padrão XX000000
            const cleanValue = value.replace(/[.-]/g, '');
            const regex = /^[A-Z]{2}[0-9]{6}$/;
            return regex.test(cleanValue);
        }
        
        return true;
    };

    /**
     * Valida CEP (Código de Endereçamento Postal) brasileiro
     * @param {string} cep - CEP a ser validado
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.cep = function(cep) {
        if (!cep.trim()) return true;
        
        // Regex para validar o formato do CEP (00000-000 ou 00000000)
        return /^\d{5}-?\d{3}$/.test(cep);
    };

    /**
     * Valida tamanho de arquivo
     * @param {File} file - Arquivo a ser validado
     * @param {number} maxSizeMB - Tamanho máximo em MB
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.fileSize = function(file, maxSizeMB = 10) {
        if (!file) return true;
        
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    };

    /**
     * Valida tipo de arquivo
     * @param {File} file - Arquivo a ser validado
     * @param {Array} validTypes - Array de tipos MIME válidos
     * @param {Array} validExtensions - Array de extensões válidas
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.fileType = function(file, validTypes, validExtensions) {
        if (!file) return true;
        
        // Verificar tipo MIME
        if (validTypes && validTypes.length > 0) {
            const fileType = file.type.toLowerCase();
            if (validTypes.includes(fileType)) return true;
        }
        
        // Se o tipo MIME não for válido, verificar a extensão do arquivo
        if (validExtensions && validExtensions.length > 0) {
            const fileName = file.name.toLowerCase();
            for (const ext of validExtensions) {
                if (fileName.endsWith(ext.toLowerCase())) {
                    return true;
                }
            }
            return false;
        }
        
        // Se não houver tipos ou extensões para validar, considerar válido
        return true;
    };

    /**
     * Valida um email
     * @param {string} email - Email a ser validado
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.email = function(email) {
        if (!email.trim()) return true;
        
        // Regex para validar o formato do email
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    /**
     * Valida um nome (nome completo)
     * @param {string} name - Nome a ser validado
     * @returns {boolean} - true se válido, false se inválido
     */
    FormValidator.Validators.name = function(name) {
        if (!name.trim()) return true;
        
        // Verifica se contém algum número - rejeita imediatamente
        if (/\d/.test(name)) {
            console.log('Nome com números: ' + name);
            return false;
        }
        
        // Lista de caracteres permitidos: letras (incluindo acentuadas), espaços, apóstrofo, hífen e ponto
        // Esta regex garante que o texto contém APENAS esses caracteres
        const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s.''-]+$/;
        
        // Verifica se o nome contém apenas os caracteres permitidos
        if (!regex.test(name)) {
            console.log('Nome com caracteres não permitidos: ' + name);
            return false;
        }
        
        // Verifica se há espaços no início ou final (trim já deve ter resolvido, mas por segurança)
        if (name !== name.trim()) {
            return false;
        }
        
        // Verifica se há múltiplos espaços seguidos
        if (/\s\s+/.test(name)) {
            return false;
        }
        
        // Verifica se há múltiplos caracteres especiais seguidos (por exemplo, '--' ou '..')
        if (/[-]{2,}|[.]{2,}|[']{2,}/.test(name)) {
            return false;
        }
        
        return true;
    };

    //========================================================================
    // FUNÇÕES DE UI E MANIPULAÇÃO DE ERROS
    //========================================================================

    /**
     * Exibe mensagem de erro para um campo
     * @param {HTMLElement} field - Campo com erro
     * @param {string} message - Mensagem de erro
     */
    FormValidator.UI.showError = function(field, message) {
        // Remove mensagens de erro existentes
        FormValidator.UI.removeError(field);
        
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
    };

    /**
     * Remove mensagem de erro de um campo
     * @param {HTMLElement} field - Campo a ter o erro removido
     */
    FormValidator.UI.removeError = function(field) {
        // Remove classe de erro
        field.classList.remove('is-invalid');
        
        // Remove elementos de feedback
        if (field.parentNode) {
            const feedbacks = field.parentNode.querySelectorAll('.invalid-feedback');
            feedbacks.forEach(element => element.remove());
        }
    };

    /**
     * Limpa todos os erros em um formulário
     * @param {HTMLFormElement} form - Formulário a ter os erros removidos
     */
    FormValidator.UI.clearErrors = function(form) {
        const invalidFields = form.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => FormValidator.UI.removeError(field));
    };

    //========================================================================
    // VALIDAÇÃO DE CAMPOS E FORMULÁRIOS
    //========================================================================

    /**
     * Valida um campo individual
     * @param {HTMLElement} field - Campo a ser validado
     * @param {Object} options - Opções adicionais
     * @returns {boolean} - Verdadeiro se válido, falso caso contrário
     */
    FormValidator.validateField = function(field, options = {}) {
        // Se o campo não existir, retorna verdadeiro
        if (!field) return true;
        
        // Mescla opções com valores padrão
        const config = {
            showErrors: true,
            customMessages: {}
        };
        Object.assign(config, options);
        
        // Obtém o valor do campo
        let value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Processa cada validação com base nos atributos data-*
        const validations = this.getFieldValidations(field);
        
        // Validar campo obrigatório
        if (validations.required && value === '') {
            isValid = false;
            errorMessage = validations.required.message || FormValidator.Config.defaultMessages.required;
        }
        // Validar outros tipos apenas se o campo não estiver vazio ou for obrigatório
        else if (value !== '' || validations.required) {
            // Validação de nome (prioridade)
            if (isValid && validations.name) {
                if (!FormValidator.Validators.name(value)) {
                    isValid = false;
                    errorMessage = validations.name.message || FormValidator.Config.defaultMessages.name;
                }
            }
            
            // Se a validação de nome falhar, não precisamos verificar as outras regras
            if (isValid) {
                // Validação de CPF
                if (validations.cpf) {
                    if (!FormValidator.Validators.cpf(value)) {
                        isValid = false;
                        errorMessage = validations.cpf.message || FormValidator.Config.defaultMessages.cpf;
                    }
                }
                
                // Validação de CNPJ
                if (isValid && validations.cnpj) {
                    if (!FormValidator.Validators.cnpj(value)) {
                        isValid = false;
                        errorMessage = validations.cnpj.message || FormValidator.Config.defaultMessages.cnpj;
                    }
                }
                
                // Validação de email
                if (isValid && validations.email) {
                    if (!FormValidator.Validators.email(value)) {
                        isValid = false;
                        errorMessage = validations.email.message || FormValidator.Config.defaultMessages.email;
                    }
                }
                
                // Validação de telefone
                if (isValid && validations.phone) {
                    if (!FormValidator.Validators.phone(value)) {
                        isValid = false;
                        errorMessage = validations.phone.message || FormValidator.Config.defaultMessages.phone;
                    }
                }
                
                // Validação de CEP
                if (isValid && validations.cep) {
                    if (!FormValidator.Validators.cep(value)) {
                        isValid = false;
                        errorMessage = validations.cep.message || FormValidator.Config.defaultMessages.cep;
                    }
                }
                
                // Validação de data
                if (isValid && validations.date) {
                    if (!FormValidator.Validators.date(value)) {
                        isValid = false;
                        errorMessage = validations.date.message || FormValidator.Config.defaultMessages.date;
                    }
                }
                
                // Validação de idade
                if (isValid && validations.age) {
                    if (!FormValidator.Validators.age(value)) {
                        isValid = false;
                        errorMessage = validations.age.message || FormValidator.Config.defaultMessages.age;
                    }
                }
                
                // Validação de data de expedição
                if (isValid && validations.issuanceDate) {
                    if (!FormValidator.Validators.issuanceDate(value)) {
                        isValid = false;
                        errorMessage = validations.issuanceDate.message || FormValidator.Config.defaultMessages.issuanceDate;
                    }
                }
                
                // Validação de comprimento mínimo
                if (isValid && validations.minLength) {
                    const minLength = parseInt(validations.minLength.value);
                    if (value.length < minLength) {
                        isValid = false;
                        errorMessage = validations.minLength.message || 
                            FormValidator.formatMessage(FormValidator.Config.defaultMessages.minLength, [minLength]);
                    }
                }
                
                // Validação de comprimento máximo
                if (isValid && validations.maxLength) {
                    const maxLength = parseInt(validations.maxLength.value);
                    if (value.length > maxLength) {
                        isValid = false;
                        errorMessage = validations.maxLength.message || 
                            FormValidator.formatMessage(FormValidator.Config.defaultMessages.maxLength, [maxLength]);
                    }
                }
                
                // Validação de padrão (regex)
                if (isValid && validations.pattern) {
                    const pattern = new RegExp(validations.pattern.value);
                    if (!pattern.test(value)) {
                        isValid = false;
                        errorMessage = validations.pattern.message || FormValidator.Config.defaultMessages.pattern;
                    }
                }
                
                // Validação personalizada
                if (isValid && validations.custom && typeof validations.custom.value === 'function') {
                    const result = validations.custom.value(value, field);
                    if (result !== true) {
                        isValid = false;
                        errorMessage = typeof result === 'string' ? result : 
                            (validations.custom.message || 'Validação personalizada falhou');
                    }
                }
            }
        }
        
        // Atualiza a UI com o resultado da validação se necessário
        if (config.showErrors) {
            if (isValid) {
                FormValidator.UI.removeError(field);
                field.classList.add('is-valid');
            } else {
                FormValidator.UI.showError(field, errorMessage);
            }
        }
        
        return isValid;
    };

    /**
     * Valida um formulário inteiro
     * @param {HTMLFormElement|string} form - Formulário ou seu ID
     * @param {Object} options - Opções adicionais
     * @returns {boolean} - Verdadeiro se todos os campos são válidos
     */
    FormValidator.validateForm = function(form, options = {}) {
        // Obtém o elemento do formulário
        if (typeof form === 'string') {
            form = document.getElementById(form);
        }
        
        if (!form) {
            console.error('Formulário inválido');
            return false;
        }
        
        // Mescla opções com valores padrão
        const config = {
            showErrors: true,
            scrollToError: true,
            validateHidden: false
        };
        Object.assign(config, options);
        
        let isValid = true;
        let firstError = null;
        
        // Limpar erros existentes
        FormValidator.UI.clearErrors(form);
        
        // Obter todos os campos do formulário
        const fields = Array.from(form.elements).filter(field => {
            return field.nodeName !== 'BUTTON' && !field.disabled && 
                  (config.validateHidden || field.style.display !== 'none') &&
                  field.getAttribute('data-validate') !== 'false';
        });
        
        // Validar cada campo
        fields.forEach(field => {
            const fieldValid = this.validateField(field, {
                showErrors: config.showErrors
            });
            
            if (!fieldValid) {
                isValid = false;
                
                // Guarda referência ao primeiro campo com erro
                if (!firstError) {
                    firstError = field;
                }
            }
        });
        
        // Scroll para o primeiro erro
        if (!isValid && config.scrollToError && firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        
        return isValid;
    };

    /**
     * Obtém as validações configuradas para um campo com base em atributos data-*
     * @param {HTMLElement} field - Campo a ser analisado
     * @returns {Object} - Objeto contendo as validações configuradas
     */
    FormValidator.getFieldValidations = function(field) {
        const validations = {};
        
        // Verificar atributo required padrão
        if (field.hasAttribute('required')) {
            validations.required = {
                message: field.getAttribute('data-error-required')
            };
        }
        
        // Verificar tipo de input para validações implícitas
        if (field.type === 'email') {
            validations.email = {
                message: field.getAttribute('data-error-email')
            };
        }
        
        // Verificar atributos data-validate-*
        for (const attr of field.attributes) {
            const match = attr.name.match(/^data-validate-([a-z-]+)$/);
            if (match) {
                const validationType = match[1].replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                validations[validationType] = {
                    value: attr.value === 'true' ? true : attr.value,
                    message: field.getAttribute(`data-error-${match[1]}`)
                };
            }
        }
        
        return validations;
    };

    /**
     * Inicializa validação para um formulário
     * @param {HTMLFormElement|string} form - Formulário ou seu ID
     * @param {Object} options - Opções de configuração
     */
    FormValidator.init = function(form, options = {}) {
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
            validateOnSubmit: true
        };
        Object.assign(config, options);
        
        // Adicionar validação no submit do formulário
        if (config.validateOnSubmit) {
            form.addEventListener('submit', function(event) {
                const isValid = FormValidator.validateForm(form);
                
                if (!isValid) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            });
        }
        
        // Obter todos os campos do formulário
        const fields = Array.from(form.elements).filter(field => {
            return field.nodeName !== 'BUTTON' && field.getAttribute('data-validate') !== 'false';
        });
        
        // Configurar validação para cada campo
        fields.forEach(field => {
            // Validação ao perder o foco
            if (config.validateOnBlur) {
                field.addEventListener('blur', function() {
                    FormValidator.validateField(field);
                });
            }
            
            // Validação ao digitar
            if (config.validateOnInput) {
                field.addEventListener('input', function() {
                    FormValidator.validateField(field);
                });
            }
        });
    };

    /**
     * Registra uma validação personalizada
     * @param {string} name - Nome da validação
     * @param {Function} validationFunction - Função de validação
     * @param {string} defaultMessage - Mensagem de erro padrão
     */
    FormValidator.registerValidator = function(name, validationFunction, defaultMessage) {
        if (typeof validationFunction !== 'function') {
            console.error(`A validação "${name}" deve ser uma função`);
            return;
        }
        
        // Adicionar a função de validação
        FormValidator.Validators[name] = validationFunction;
        
        // Adicionar mensagem padrão
        if (defaultMessage) {
            FormValidator.Config.defaultMessages[name] = defaultMessage;
        }
    };

    // Exporta o módulo para o escopo global
    window.FormValidator = FormValidator;

})(window); 