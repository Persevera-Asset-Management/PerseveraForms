/**
 * IntegrationManager - Módulo para integração entre MaskManager e ValidationManager
 * Fornece funcionalidades para conectar máscaras e validações em formulários
 */
(function(window) {
    'use strict';

    // Verifica se as dependências existem
    if (!window.MaskManager) {
        console.error('IntegrationManager: MaskManager não encontrado. Por favor, carregue o MaskManager antes deste módulo.');
        return;
    }

    if (!window.ValidationManager) {
        console.error('IntegrationManager: ValidationManager não encontrado. Por favor, carregue o ValidationManager antes deste módulo.');
        return;
    }

    // Cria o namespace
    const IntegrationManager = {};
    
    // Mapeia tipos de máscaras para tipos de validação correspondentes
    const MASK_TO_VALIDATOR_MAP = {
        'cpf': 'cpf',
        'cnpj': 'cnpj',
        'cpf-cnpj': null, // Requer validador personalizado
        'phone': 'phone',
        'celphone': 'phone',
        'cep': 'cep',
        'date': 'date',
        'time': null,
        'datetime': null,
        'currency': null,
        'number': null,
        'credit-card': null,
        'custom': null
    };

    /**
     * Integra máscara e validação para um campo específico
     * @param {HTMLElement|string} input - Campo de entrada ou seletor
     * @param {string} maskType - Tipo de máscara a ser aplicada
     * @param {Object} validationRules - Regras de validação adicionais
     * @param {Object} options - Opções adicionais
     */
    IntegrationManager.setupField = function(input, maskType, validationRules = {}, options = {}) {
        // Obtém o elemento do input
        if (typeof input === 'string') {
            input = document.querySelector(input);
        }
        
        if (!input) {
            console.error('Input não encontrado');
            return;
        }
        
        // Configurações padrão
        const settings = {
            validateOnChange: true,
            validateOnBlur: true,
            applyMask: true,
            customMaskPattern: null,
            customValidation: null,
            ...options
        };
        
        // Aplica a máscara, se solicitado
        if (settings.applyMask) {
            if (maskType === 'custom' && settings.customMaskPattern) {
                window.MaskManager.applyMask(input, settings.customMaskPattern);
            } else {
                window.MaskManager.applyMaskByType(input, maskType);
            }
        }
        
        // Determina o validador padrão para este tipo de máscara
        const defaultValidator = MASK_TO_VALIDATOR_MAP[maskType];
        
        // Combina regras padrão com regras adicionais
        const combinedRules = {...validationRules};
        
        // Adiciona validador padrão se existir e não estiver explicitamente substituído
        if (defaultValidator && !validationRules[defaultValidator]) {
            combinedRules[defaultValidator] = true;
        }
        
        // Adiciona validador personalizado, se fornecido
        if (settings.customValidation) {
            const customValidatorName = `custom_${input.id || input.name || Date.now()}`;
            window.ValidationManager.addValidator(customValidatorName, settings.customValidation);
            combinedRules[customValidatorName] = true;
        }
        
        // Configura validador para CPF/CNPJ
        if (maskType === 'cpf-cnpj' && !settings.customValidation) {
            const customValidatorName = `cpf_cnpj_${input.id || input.name || Date.now()}`;
            
            window.ValidationManager.addValidator(customValidatorName, function(value) {
                const unmasked = window.MaskManager.unmask(value);
                if (unmasked.length <= 11) {
                    return window.ValidationManager.validators.cpf(value);
                } else {
                    return window.ValidationManager.validators.cnpj(value);
                }
            });
            
            combinedRules[customValidatorName] = true;
        }
        
        // Adiciona eventos de validação
        if (settings.validateOnChange) {
            input.addEventListener('change', function() {
                window.ValidationManager.validateField(input, combinedRules);
            });
        }
        
        if (settings.validateOnBlur) {
            input.addEventListener('blur', function() {
                window.ValidationManager.validateField(input, combinedRules);
            });
        }
        
        return {
            input: input,
            rules: combinedRules
        };
    };

    /**
     * Configura um formulário inteiro com máscaras e validações
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {Object} fieldsConfig - Configuração de campos (máscaras e validações)
     * @param {Object} options - Opções adicionais
     */
    IntegrationManager.setupForm = function(form, fieldsConfig, options = {}) {
        // Obtém o elemento do formulário
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        // Configurações padrão
        const settings = {
            validateOnSubmit: true,
            resetFormOnLoad: false,
            ...options
        };
        
        // Mapeia campos para validação
        const allValidationRules = {};
        const allInputs = [];
        
        // Configura cada campo
        for (const fieldName in fieldsConfig) {
            const config = fieldsConfig[fieldName];
            const field = form.querySelector(`[name="${fieldName}"]`) || form.querySelector(`#${fieldName}`);
            
            if (field) {
                const { rules } = this.setupField(
                    field, 
                    config.maskType, 
                    config.validationRules || {}, 
                    config.options || {}
                );
                
                // Armazena informações para validação de formulário
                allValidationRules[fieldName] = rules;
                allInputs.push(field);
            } else {
                console.warn(`Campo ${fieldName} não encontrado no formulário`);
            }
        }
        
        // Adiciona validação no envio do formulário
        if (settings.validateOnSubmit) {
            form.addEventListener('submit', function(e) {
                const isValid = window.ValidationManager.validateForm(form, allValidationRules);
                
                if (!isValid) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Foca no primeiro campo inválido
                    const firstInvalidField = form.querySelector('.is-invalid');
                    if (firstInvalidField) {
                        firstInvalidField.focus();
                    }
                    
                    // Callback para formulário inválido
                    if (typeof options.onInvalid === 'function') {
                        options.onInvalid(form);
                    }
                } else if (typeof options.onValid === 'function') {
                    // Callback para formulário válido
                    if (options.onValid(form) === false) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
        }
        
        // Limpa o formulário na carga, se solicitado
        if (settings.resetFormOnLoad) {
            window.ValidationManager.resetForm(form);
            form.reset();
        }
        
        return {
            form: form,
            fields: allInputs,
            rules: allValidationRules
        };
    };

    /**
     * Configura tipo de campo automático baseado em atributos data-*
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {Object} options - Opções adicionais
     */
    IntegrationManager.autoSetup = function(form, options = {}) {
        // Obtém o elemento do formulário
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        // Busca todos os campos com atributo data-mask-type
        const fields = form.querySelectorAll('[data-mask-type]');
        const fieldsConfig = {};
        
        fields.forEach(field => {
            const name = field.name || field.id;
            if (!name) return;
            
            const maskType = field.getAttribute('data-mask-type');
            const required = field.hasAttribute('required') || field.getAttribute('data-required') === 'true';
            const minLength = field.getAttribute('data-min-length');
            const maxLength = field.getAttribute('data-max-length');
            const pattern = field.getAttribute('data-pattern');
            const customMask = field.getAttribute('data-custom-mask');
            
            // Prepara regras de validação
            const validationRules = {};
            
            if (required) {
                validationRules.required = field.getAttribute('data-msg-required') || true;
            }
            
            if (minLength) {
                validationRules.minLength = {
                    param: parseInt(minLength, 10),
                    message: field.getAttribute('data-msg-min-length') || `Mínimo de ${minLength} caracteres`
                };
            }
            
            if (maxLength) {
                validationRules.maxLength = {
                    param: parseInt(maxLength, 10),
                    message: field.getAttribute('data-msg-max-length') || `Máximo de ${maxLength} caracteres`
                };
            }
            
            if (pattern) {
                validationRules.pattern = {
                    param: pattern,
                    message: field.getAttribute('data-msg-pattern') || 'Formato inválido'
                };
            }
            
            // Configura o campo
            fieldsConfig[name] = {
                maskType: maskType,
                validationRules: validationRules,
                options: {
                    customMaskPattern: customMask
                }
            };
        });
        
        // Configura o formulário completo
        return this.setupForm(form, fieldsConfig, options);
    };
    
    /**
     * Exporta um valor imediatamente com máscara e valida-o
     * @param {string} value - Valor a ser mascarado e validado
     * @param {string} maskType - Tipo de máscara a aplicar
     * @param {Object} validationRules - Regras de validação específicas
     * @param {Object} options - Opções adicionais
     * @return {Object} - Objeto com resultado da validação e valor formatado
     */
    IntegrationManager.processValue = function(value, maskType, validationRules = {}, options = {}) {
        // Aplica máscara ao valor
        let maskedValue = value;
        
        if (maskType === 'custom' && options.customMaskPattern) {
            maskedValue = window.MaskManager.mask(value, options.customMaskPattern);
        } else {
            // Usa o método de máscara específico para este tipo
            switch (maskType) {
                case 'cpf':
                    maskedValue = window.MaskManager.maskCPF(value);
                    break;
                case 'cnpj':
                    maskedValue = window.MaskManager.maskCNPJ(value);
                    break;
                case 'cpf-cnpj':
                    maskedValue = window.MaskManager.maskCPFOrCNPJ(value);
                    break;
                case 'phone':
                case 'celphone':
                    maskedValue = window.MaskManager.maskPhone(value);
                    break;
                case 'cep':
                    maskedValue = window.MaskManager.maskCEP(value);
                    break;
                case 'date':
                    maskedValue = window.MaskManager.maskDate(value);
                    break;
                case 'time':
                    maskedValue = window.MaskManager.maskTime(value);
                    break;
                case 'datetime':
                    maskedValue = window.MaskManager.maskDateTime(value);
                    break;
                case 'currency':
                    maskedValue = window.MaskManager.formatCurrency(value);
                    break;
                default:
                    console.warn(`Tipo de máscara "${maskType}" não reconhecido`);
            }
        }
        
        // Determina o validador padrão para este tipo de máscara
        const defaultValidator = MASK_TO_VALIDATOR_MAP[maskType];
        
        // Combina regras padrão com regras adicionais
        const combinedRules = {...validationRules};
        
        // Adiciona validador padrão se existir e não estiver explicitamente substituído
        if (defaultValidator && !validationRules[defaultValidator]) {
            combinedRules[defaultValidator] = true;
        }
        
        // Valida o valor
        let isValid = true;
        
        for (const rule in combinedRules) {
            // Verifica se a regra existe no ValidationManager
            if (typeof window.ValidationManager.validators[rule] !== 'function') {
                console.warn(`Validador "${rule}" não disponível`);
                continue;
            }
            
            const ruleValue = combinedRules[rule];
            let param = null;
            
            // Extrai parâmetro se existir
            if (typeof ruleValue === 'object' && ruleValue !== null) {
                param = ruleValue.param;
            }
            
            // Executa validação
            const result = window.ValidationManager.validators[rule](value, param);
            
            if (!result) {
                isValid = false;
                break;
            }
        }
        
        return {
            value: value,                 // Valor original
            maskedValue: maskedValue,     // Valor com máscara
            unmaskedValue: window.MaskManager.unmask(value), // Valor sem máscara
            isValid: isValid              // Resultado da validação
        };
    };

    /**
     * Retorna um objeto com todas as funções disponíveis nos gerenciadores
     * @return {Object} - Objeto com referências às funções do MaskManager e ValidationManager
     */
    IntegrationManager.getHelpers = function() {
        return {
            mask: window.MaskManager,
            validation: window.ValidationManager,
            // Funções de conveniência
            maskValue: function(value, type) {
                return window.MaskManager.maskByType(value, type);
            },
            unmask: function(value) {
                return window.MaskManager.unmask(value);
            },
            validate: function(value, validationType, param) {
                return window.ValidationManager.validators[validationType](value, param);
            }
        };
    };

    // Exporta o módulo para o escopo global
    window.IntegrationManager = IntegrationManager;

})(window); 