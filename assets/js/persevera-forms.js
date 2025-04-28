/**
 * PerseveraForms - Biblioteca JavaScript para manipulação de formulários
 * Integra os módulos MaskManager, ValidationManager e IntegrationManager
 * em uma API simplificada para o desenvolvedor.
 * 
 * @version 1.0.0
 */
(function(window, document) {
    'use strict';

    // Verifica se as dependências existem
    if (!window.MaskManager) {
        console.error('PerseveraForms: MaskManager não encontrado. Por favor, carregue o MaskManager antes deste módulo.');
        return;
    }

    if (!window.ValidationManager) {
        console.error('PerseveraForms: ValidationManager não encontrado. Por favor, carregue o ValidationManager antes deste módulo.');
        return;
    }

    if (!window.IntegrationManager) {
        console.error('PerseveraForms: IntegrationManager não encontrado. Por favor, carregue o IntegrationManager antes deste módulo.');
        return;
    }

    // Armazena referências para os gerenciadores
    const MaskManager = window.MaskManager;
    const ValidationManager = window.ValidationManager;
    const IntegrationManager = window.IntegrationManager;

    // Cria o namespace
    const PerseveraForms = {};

    /**
     * Inicializa todos os formulários na página com atributos data-persevera-form
     * @param {Object} options - Opções globais para todos os formulários
     */
    PerseveraForms.init = function(options = {}) {
        const forms = document.querySelectorAll('[data-persevera-form]');
        const formInstances = [];
        
        forms.forEach(form => {
            const formOptions = {
                ...options,
                validateOnSubmit: form.getAttribute('data-validate-on-submit') !== 'false',
                resetFormOnLoad: form.getAttribute('data-reset-on-load') === 'true'
            };
            
            // Inicializa o formulário
            const instance = IntegrationManager.autoSetup(form, formOptions);
            formInstances.push(instance);
            
            // Armazena a instância no elemento do formulário para referência futura
            form._perseveraInstance = instance;
        });
        
        return formInstances;
    };

    /**
     * Inicializa um único formulário
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {Object} options - Opções para o formulário
     */
    PerseveraForms.initForm = function(form, options = {}) {
        const instance = IntegrationManager.autoSetup(form, options);
        
        if (instance && instance.form) {
            instance.form._perseveraInstance = instance;
        }
        
        return instance;
    };

    /**
     * Configura um formulário com configurações explícitas de campos
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {Object} fieldsConfig - Configuração para cada campo
     * @param {Object} options - Opções para o formulário
     */
    PerseveraForms.setupForm = function(form, fieldsConfig, options = {}) {
        const instance = IntegrationManager.setupForm(form, fieldsConfig, options);
        
        if (instance && instance.form) {
            instance.form._perseveraInstance = instance;
        }
        
        return instance;
    };

    /**
     * Configura um campo individual
     * @param {HTMLElement|string} input - Campo de entrada ou seletor
     * @param {string} maskType - Tipo de máscara
     * @param {Object} validationRules - Regras de validação
     * @param {Object} options - Opções adicionais
     */
    PerseveraForms.setupField = function(input, maskType, validationRules = {}, options = {}) {
        return IntegrationManager.setupField(input, maskType, validationRules, options);
    };

    /**
     * Valida um formulário completo
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {Object} rules - Regras de validação (opcional, usa regras configuradas se não fornecido)
     * @return {boolean} - Resultado da validação
     */
    PerseveraForms.validateForm = function(form, rules) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return false;
        }
        
        // Se não foram fornecidas regras, tenta usar as regras da instância
        if (!rules && form._perseveraInstance && form._perseveraInstance.rules) {
            rules = form._perseveraInstance.rules;
        }
        
        return ValidationManager.validateForm(form, rules);
    };

    /**
     * Valida um campo individual
     * @param {HTMLElement|string} input - Campo de entrada ou seletor
     * @param {Object} rules - Regras de validação
     * @return {boolean} - Resultado da validação
     */
    PerseveraForms.validateField = function(input, rules) {
        if (typeof input === 'string') {
            input = document.querySelector(input);
        }
        
        if (!input) {
            console.error('Campo não encontrado');
            return false;
        }
        
        return ValidationManager.validateField(input, rules);
    };

    /**
     * Limpa a validação de um formulário
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     */
    PerseveraForms.resetForm = function(form) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        ValidationManager.resetForm(form);
    };

    /**
     * Limpa a validação de um campo individual
     * @param {HTMLElement|string} input - Campo de entrada ou seletor
     */
    PerseveraForms.resetField = function(input) {
        if (typeof input === 'string') {
            input = document.querySelector(input);
        }
        
        if (!input) {
            console.error('Campo não encontrado');
            return;
        }
        
        ValidationManager.resetField(input);
    };

    /**
     * Adiciona um validador personalizado
     * @param {string} name - Nome do validador
     * @param {Function} validatorFn - Função de validação
     */
    PerseveraForms.addValidator = function(name, validatorFn) {
        ValidationManager.addValidator(name, validatorFn);
    };

    /**
     * Adiciona um tipo de máscara personalizado
     * @param {string} name - Nome da máscara
     * @param {string|Function} pattern - Padrão da máscara ou função
     */
    PerseveraForms.addMask = function(name, pattern) {
        MaskManager.addMask(name, pattern);
    };

    /**
     * Processa um valor com máscara e validação sem vinculá-lo a um campo
     * @param {string} value - Valor a ser processado
     * @param {string} maskType - Tipo de máscara
     * @param {Object} validationRules - Regras de validação
     * @param {Object} options - Opções adicionais
     * @return {Object} - Resultado do processamento
     */
    PerseveraForms.processValue = function(value, maskType, validationRules = {}, options = {}) {
        return IntegrationManager.processValue(value, maskType, validationRules, options);
    };

    /**
     * Obtém dados do formulário como objeto
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {boolean} unmasked - Se deve retornar valores sem máscara
     * @return {Object} - Dados do formulário
     */
    PerseveraForms.getFormData = function(form, unmasked = false) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return {};
        }
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (unmasked) {
                data[key] = MaskManager.unmask(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    };

    /**
     * Preenche um formulário com dados
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {Object} data - Dados para preencher o formulário
     * @param {boolean} triggerEvents - Se deve disparar eventos de validação
     */
    PerseveraForms.fillForm = function(form, data, triggerEvents = true) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        // Limpa validação anterior
        ValidationManager.resetForm(form);
        
        // Preenche os campos
        for (const key in data) {
            const input = form.querySelector(`[name="${key}"]`) || form.querySelector(`#${key}`);
            
            if (input) {
                // Aplica valor com máscara apropriada, se configurada
                if (input.hasAttribute('data-mask-type')) {
                    const maskType = input.getAttribute('data-mask-type');
                    const processed = IntegrationManager.processValue(data[key], maskType);
                    input.value = processed.maskedValue;
                } else {
                    input.value = data[key];
                }
                
                // Dispara eventos
                if (triggerEvents) {
                    // Dispara evento de mudança
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
                }
            }
        }
    };

    /**
     * Limpa todos os campos de um formulário
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     */
    PerseveraForms.clearForm = function(form) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        // Limpa validação anterior
        ValidationManager.resetForm(form);
        
        // Limpa o formulário
        form.reset();
    };

    /**
     * Habilita ou desabilita todos os campos de um formulário
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {boolean} disabled - Estado de desabilitação
     */
    PerseveraForms.setFormDisabled = function(form, disabled = true) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        // Obtém todos os campos interativos
        const fields = form.querySelectorAll('input, select, textarea, button');
        
        // Define o estado de desabilitação
        fields.forEach(field => {
            field.disabled = disabled;
        });
    };

    /**
     * Acesso direto aos gerenciadores subjacentes
     */
    PerseveraForms.managers = {
        mask: MaskManager,
        validation: ValidationManager,
        integration: IntegrationManager,
    };

    /**
     * Utilitários
     */
    PerseveraForms.utils = {
        /**
         * Formata um número como moeda
         * @param {number} value - Valor a ser formatado
         * @param {string} locale - Localidade (padrão: 'pt-BR')
         * @param {string} currency - Moeda (padrão: 'BRL')
         * @return {string} - Valor formatado
         */
        formatCurrency: function(value, locale = 'pt-BR', currency = 'BRL') {
            return MaskManager.formatCurrency(value, locale, currency);
        },
        
        /**
         * Formata uma data
         * @param {Date|string} date - Data a ser formatada
         * @param {string} format - Formato da data (padrão: 'dd/MM/yyyy')
         * @return {string} - Data formatada
         */
        formatDate: function(date, format = 'dd/MM/yyyy') {
            return MaskManager.formatDate(date, format);
        },
        
        /**
         * Remove todas as máscaras de um valor
         * @param {string} value - Valor a ser processado
         * @return {string} - Valor sem máscara
         */
        unmask: function(value) {
            return MaskManager.unmask(value);
        }
    };

    // Exporta o módulo para o escopo global
    window.PerseveraForms = PerseveraForms;

    // Inicializa automaticamente quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Verifica se a inicialização automática está habilitada
        if (typeof window.PERSEVERA_FORMS_AUTO_INIT === 'undefined' || window.PERSEVERA_FORMS_AUTO_INIT !== false) {
            PerseveraForms.init();
        }
    });

})(window, document); 