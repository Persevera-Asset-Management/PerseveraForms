/**
 * MaskManager - Gerenciador de máscaras para campos de formulário
 * 
 * Fornece funcionalidades para aplicar máscaras em campos de entrada,
 * como CPF, CNPJ, telefone, data, CEP, valores monetários, etc.
 */
const MaskManager = (function() {
    'use strict';

    // Mapeamento de tipos de máscara para suas funções de formatação
    const maskTypes = {
        cpf: maskCPF,
        cnpj: maskCNPJ,
        phone: maskPhone,
        date: maskDate,
        zipcode: maskZipCode,
        currency: maskCurrency,
        percent: maskPercent,
        number: maskNumber
    };

    /**
     * Inicializa máscaras para todos os campos dentro de um formulário
     * @param {HTMLFormElement} form - O formulário a ser processado
     */
    function initMasks(form) {
        const fields = form.querySelectorAll('[data-mask-type]');
        fields.forEach(field => {
            const maskType = field.getAttribute('data-mask-type');
            if (maskType && maskTypes[maskType]) {
                applyMask(field, maskType);
            }
        });
    }

    /**
     * Aplica uma máscara específica a um campo
     * @param {HTMLInputElement} field - O campo para aplicar a máscara
     * @param {string} maskType - O tipo de máscara a ser aplicada
     */
    function applyMask(field, maskType) {
        if (!maskTypes[maskType]) return;

        field.addEventListener('input', function(e) {
            const value = e.target.value;
            const cursorPos = e.target.selectionStart;
            const oldLength = value.length;
            
            // Aplicar a formatação correspondente ao tipo de máscara
            const formattedValue = maskTypes[maskType](value);
            
            // Evitar loop infinito ao definir o mesmo valor
            if (formattedValue !== value) {
                e.target.value = formattedValue;
                
                // Ajustar a posição do cursor após aplicar a máscara
                if (formattedValue.length > oldLength) {
                    e.target.setSelectionRange(cursorPos + 1, cursorPos + 1);
                } else {
                    e.target.setSelectionRange(cursorPos, cursorPos);
                }
            }
        });

        // Também aplicar a máscara no evento blur para garantir formato correto
        field.addEventListener('blur', function(e) {
            e.target.value = maskTypes[maskType](e.target.value);
        });
    }

    /**
     * Remove a máscara de um valor formatado
     * @param {string} value - O valor formatado
     * @param {string} maskType - O tipo de máscara a ser removida
     * @returns {string|number} O valor sem máscara
     */
    function unmask(value, maskType) {
        if (!value) return '';
        
        switch (maskType) {
            case 'cpf':
            case 'cnpj':
            case 'phone':
            case 'zipcode':
            case 'date':
                return value.replace(/\D/g, '');
            case 'currency':
                return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
            case 'percent':
                return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
            case 'number':
                return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
            default:
                return value;
        }
    }

    /**
     * Função para formatar CPF (ex: 123.456.789-09)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskCPF(value) {
        if (!value) return '';
        
        // Remover tudo que não for dígito
        const cleaned = value.replace(/\D/g, '');
        
        // Limitar a 11 dígitos
        const cpf = cleaned.substring(0, 11);
        
        // Aplicar a máscara
        let formatted = cpf;
        if (cpf.length > 3) {
            formatted = cpf.substring(0, 3) + '.' + cpf.substring(3);
        }
        if (cpf.length > 6) {
            formatted = formatted.substring(0, 7) + '.' + cpf.substring(6, 9);
        }
        if (cpf.length > 9) {
            formatted = formatted.substring(0, 11) + '-' + cpf.substring(9, 11);
        }
        
        return formatted;
    }

    /**
     * Função para formatar CNPJ (ex: 12.345.678/0001-90)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskCNPJ(value) {
        if (!value) return '';
        
        // Remover tudo que não for dígito
        const cleaned = value.replace(/\D/g, '');
        
        // Limitar a 14 dígitos
        const cnpj = cleaned.substring(0, 14);
        
        // Aplicar a máscara
        let formatted = cnpj;
        if (cnpj.length > 2) {
            formatted = cnpj.substring(0, 2) + '.' + cnpj.substring(2);
        }
        if (cnpj.length > 5) {
            formatted = formatted.substring(0, 6) + '.' + cnpj.substring(5, 8);
        }
        if (cnpj.length > 8) {
            formatted = formatted.substring(0, 10) + '/' + cnpj.substring(8, 12);
        }
        if (cnpj.length > 12) {
            formatted = formatted.substring(0, 15) + '-' + cnpj.substring(12, 14);
        }
        
        return formatted;
    }

    /**
     * Função para formatar telefone (ex: (11) 98765-4321)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskPhone(value) {
        if (!value) return '';
        
        // Remover tudo que não for dígito
        const cleaned = value.replace(/\D/g, '');
        
        // Limitar a 11 dígitos
        const phone = cleaned.substring(0, 11);
        
        // Aplicar a máscara
        let formatted = phone;
        if (phone.length > 0) {
            formatted = '(' + phone.substring(0, 2);
        }
        if (phone.length > 2) {
            formatted += ') ' + phone.substring(2);
        }
        if (phone.length > 6) {
            // Verifica se é celular (11 dígitos) ou fixo (10 dígitos)
            const isCell = phone.length > 10;
            const hyphenPos = isCell ? 7 : 6;
            formatted = formatted.substring(0, hyphenPos + 3) + '-' + phone.substring(hyphenPos - 1);
        }
        
        return formatted;
    }

    /**
     * Função para formatar data (ex: 01/01/2023)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskDate(value) {
        if (!value) return '';
        
        // Remover tudo que não for dígito
        const cleaned = value.replace(/\D/g, '');
        
        // Limitar a 8 dígitos
        const date = cleaned.substring(0, 8);
        
        // Aplicar a máscara
        let formatted = date;
        if (date.length > 2) {
            formatted = date.substring(0, 2) + '/' + date.substring(2);
        }
        if (date.length > 4) {
            formatted = formatted.substring(0, 5) + '/' + date.substring(4);
        }
        
        return formatted;
    }

    /**
     * Função para formatar CEP (ex: 12345-678)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskZipCode(value) {
        if (!value) return '';
        
        // Remover tudo que não for dígito
        const cleaned = value.replace(/\D/g, '');
        
        // Limitar a 8 dígitos
        const zipcode = cleaned.substring(0, 8);
        
        // Aplicar a máscara
        let formatted = zipcode;
        if (zipcode.length > 5) {
            formatted = zipcode.substring(0, 5) + '-' + zipcode.substring(5);
        }
        
        return formatted;
    }

    /**
     * Função para formatar valores monetários (ex: R$ 1.234,56)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskCurrency(value) {
        if (!value) return '';
        
        // Remover caracteres não numéricos, exceto vírgula e ponto
        let cleaned = value.replace(/[^\d,.]/g, '');
        
        // Converter para número
        let number = cleaned;
        if (cleaned.includes(',')) {
            number = cleaned.replace(/\./g, '').replace(',', '.');
        }
        
        // Converter para float e formatar
        const float = parseFloat(number) || 0;
        
        return float.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Função para formatar valores percentuais (ex: 12,34%)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskPercent(value) {
        if (!value) return '';
        
        // Remover caracteres não numéricos, exceto vírgula e ponto
        let cleaned = value.replace(/[^\d,.]/g, '');
        
        // Converter para número
        let number = cleaned;
        if (cleaned.includes(',')) {
            number = cleaned.replace(/\./g, '').replace(',', '.');
        }
        
        // Converter para float e formatar
        const float = parseFloat(number) || 0;
        
        return float.toLocaleString('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Função para formatar números (ex: 1.234,56)
     * @param {string} value - O valor a ser formatado
     * @returns {string} O valor formatado
     */
    function maskNumber(value) {
        if (!value) return '';
        
        // Remover caracteres não numéricos, exceto vírgula e ponto
        let cleaned = value.replace(/[^\d,.]/g, '');
        
        // Converter para número
        let number = cleaned;
        if (cleaned.includes(',')) {
            number = cleaned.replace(/\./g, '').replace(',', '.');
        }
        
        // Converter para float e formatar
        const float = parseFloat(number) || 0;
        
        return float.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Registra um novo tipo de máscara personalizada
     * @param {string} maskType - Nome da máscara
     * @param {Function} maskFunction - Função de formatação
     */
    function registerMask(maskType, maskFunction) {
        if (typeof maskFunction !== 'function') {
            console.error('A função de máscara deve ser uma função válida');
            return;
        }
        
        maskTypes[maskType] = maskFunction;
    }

    // API pública
    return {
        initMasks,
        applyMask,
        unmask,
        registerMask,
        maskTypes
    };
})();

// Exportar para uso com módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaskManager;
} 