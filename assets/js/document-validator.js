/**
 * document-validator.js
 * -----------------
 * Funções para validação de documentos brasileiros
 */

/**
 * Valida um CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - Verdadeiro se o CPF é válido
 */
function validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    return remainder === parseInt(cpf.charAt(10));
}

/**
 * Valida um CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - Verdadeiro se o CNPJ é válido
 */
function validateCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se o CNPJ tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Validação do segundo dígito verificador
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return result === parseInt(digits.charAt(1));
}

/**
 * Valida uma data no formato DD/MM/AAAA
 * @param {string} date - Data a ser validada
 * @returns {boolean} - Verdadeiro se a data é válida
 */
function validateDate(date) {
    // Remove caracteres não numéricos e barras
    if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) return false;
    
    // Divide a data em dia, mês e ano
    const [day, month, year] = date.split('/').map(num => parseInt(num, 10));
    
    // Verifica se o mês está entre 1 e 12
    if (month < 1 || month > 12) return false;
    
    // Verifica se o dia é válido para o mês
    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Ajusta para anos bissextos
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
        daysInMonth[2] = 29;
    }
    
    return day > 0 && day <= daysInMonth[month];
}

/**
 * Valida um telefone (formatos: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} - Verdadeiro se o telefone é válido
 */
function validatePhone(phone) {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se o telefone tem 10 ou 11 dígitos (com DDD)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
    
    // Verifica o formato específico
    return /^(\d{2})9?\d{8}$/.test(cleanPhone);
}

/**
 * Formata um CPF (XXX.XXX.XXX-XX)
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} - CPF formatado
 */
function formatCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    cpf = cpf.substring(0, 11);
    
    // Aplica a formatação
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata um CNPJ (XX.XXX.XXX/XXXX-XX)
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} - CNPJ formatado
 */
function formatCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    cnpj = cnpj.substring(0, 14);
    
    // Aplica a formatação
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata um telefone ((XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
function formatPhone(phone) {
    // Remove caracteres não numéricos
    phone = phone.replace(/\D/g, '');
    
    // Formata para celular ou fixo
    if (phone.length === 11) {
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

/**
 * Formata um CEP (XXXXX-XXX)
 * @param {string} cep - CEP a ser formatado
 * @returns {string} - CEP formatado
 */
function formatCEP(cep) {
    // Remove caracteres não numéricos
    cep = cep.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    cep = cep.substring(0, 8);
    
    // Aplica a formatação
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Aplica máscara em tempo real a um campo de formulário
 * @param {HTMLInputElement} input - O campo de entrada
 * @param {string} type - Tipo de formatação ('cpf', 'cnpj', 'phone', 'cep', 'date')
 */
function applyInputMask(input, type) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        switch (type) {
            case 'cpf':
                // Formata para CPF (XXX.XXX.XXX-XX)
                if (value.length <= 3) {
                    formattedValue = value;
                } else if (value.length <= 6) {
                    formattedValue = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
                } else if (value.length <= 9) {
                    formattedValue = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
                } else {
                    formattedValue = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
                }
                break;
                
            case 'cnpj':
                // Formata para CNPJ (XX.XXX.XXX/XXXX-XX)
                if (value.length <= 2) {
                    formattedValue = value;
                } else if (value.length <= 5) {
                    formattedValue = value.replace(/(\d{2})(\d{0,3})/, '$1.$2');
                } else if (value.length <= 8) {
                    formattedValue = value.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
                } else if (value.length <= 12) {
                    formattedValue = value.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
                } else {
                    formattedValue = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
                }
                break;
                
            case 'phone':
                // Formata para Telefone ((XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
                if (value.length <= 2) {
                    formattedValue = value.length === 0 ? '' : `(${value}`;
                } else if (value.length <= 6) {
                    formattedValue = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                } else if (value.length <= 10) {
                    formattedValue = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else {
                    formattedValue = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
                break;
                
            case 'cep':
                // Formata para CEP (XXXXX-XXX)
                if (value.length <= 5) {
                    formattedValue = value;
                } else {
                    formattedValue = value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
                }
                break;
                
            case 'date':
                // Formata para Data (DD/MM/AAAA)
                if (value.length <= 2) {
                    formattedValue = value;
                } else if (value.length <= 4) {
                    formattedValue = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
                } else {
                    formattedValue = value.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
                }
                break;
                
            default:
                formattedValue = value;
        }
        
        // Atualiza o valor do campo mantendo o cursor na posição correta
        const cursorPosition = e.target.selectionStart;
        const lengthDiff = formattedValue.length - e.target.value.length;
        
        e.target.value = formattedValue;
        
        // Ajusta a posição do cursor após a formatação
        if (cursorPosition + lengthDiff > 0) {
            e.target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
        }
    });
}

/**
 * Inicializa as máscaras em todos os campos marcados com atributos data-mask
 */
function initInputMasks() {
    // Aplica máscara em campos com atributo data-mask
    document.querySelectorAll('[data-mask]').forEach(input => {
        const maskType = input.getAttribute('data-mask');
        applyInputMask(input, maskType);
    });
}

/**
 * Inicializa o validador de documentos
 */
function initDocumentValidator() {
    // Inicializa as máscaras de entrada
    initInputMasks();
}

// Exportar as funções para uso global
window.DocumentValidator = {
    validateCPF,
    validateCNPJ,
    validateDate,
    validatePhone,
    formatCPF,
    formatCNPJ,
    formatPhone,
    formatCEP,
    applyInputMask,
    initInputMasks,
    initDocumentValidator
}; 