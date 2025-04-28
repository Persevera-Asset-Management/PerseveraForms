/**
 * field-formatters.js
 * ------------------
 * Funções para formatação de campos de entrada
 */

/**
 * Formata o campo de telefone 
 * @param {HTMLElement} phoneField - O elemento de input do telefone
 */
function formatPhoneField(phoneField) {
    if (!phoneField) return;
    
    phoneField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        // Formato (XX) XXXXX-XXXX para celular ou (XX) XXXX-XXXX para fixo
        if (value.length > 10) {
            // Celular: (XX) 9XXXX-XXXX
            value = value.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
        } else if (value.length > 6) {
            // Fixo: (XX) XXXX-XXXX
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (value.length > 2) {
            // Apenas DDD
            value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        }
        
        e.target.value = value;
        
        // Validar o telefone
        Validators.validatePhone(this);
    });
    
    phoneField.addEventListener('blur', function() {
        Validators.validatePhone(this);
    });
}

/**
 * Formata o campo de CPF
 * @param {HTMLElement} cpfField - O elemento de input do CPF
 */
function formatCpfField(cpfField) {
    if (!cpfField) return;
    
    cpfField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        // Formato: 000.000.000-00
        if (value.length > 9) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
        }
        
        e.target.value = value;
    });
    
    cpfField.addEventListener('blur', function() {
        const cleanCPF = this.value.replace(/\D/g, '');
        if (cleanCPF && (cleanCPF.length !== 11 || !Validators.validateCPF(cleanCPF))) {
            this.classList.add('cpf-error');
        } else {
            this.classList.remove('cpf-error');
        }
    });
}

/**
 * Formata o campo de data
 * @param {HTMLElement} dateField - O elemento de input da data
 * @param {Function} validationFunction - Função de validação específica para o tipo de data
 */
function formatDateField(dateField, validationFunction) {
    if (!dateField) return;
    
    dateField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        
        // Formato: DD/MM/AAAA
        if (value.length > 4) {
            value = value.replace(/^(\d{2})(\d{2})(\d{0,4})$/, '$1/$2/$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,2})$/, '$1/$2');
        }
        
        e.target.value = value;
    });
    
    dateField.addEventListener('blur', function() {
        const isValid = validationFunction ? validationFunction(this.value) : true;
        if (this.value && !isValid) {
            this.classList.add('date-error');
        } else {
            this.classList.remove('date-error');
        }
    });
}

/**
 * Formata o campo de documento de acordo com o tipo selecionado
 * @param {HTMLElement} docTypeSelect - O elemento select do tipo de documento
 * @param {HTMLElement} docNumberInput - O elemento de input do número do documento
 */
function setupDocumentFormatter(docTypeSelect, docNumberInput) {
    if (!docTypeSelect || !docNumberInput) return;
    
    docTypeSelect.addEventListener('change', function() {
        const tipoDoc = this.value;
        // Limpar o campo de número de documento quando o tipo mudar
        docNumberInput.value = '';
        docNumberInput.classList.remove('name-error');
        
        // Atualizar o placeholder conforme o tipo de documento
        if (tipoDoc === 'RG') {
            docNumberInput.placeholder = "00.000.000-0";
        } else if (tipoDoc === 'CNH') {
            docNumberInput.placeholder = "00000000000";
        } else if (tipoDoc === 'Passaporte') {
            docNumberInput.placeholder = "AA000000";
        } else {
            docNumberInput.placeholder = "";
        }
    });
    
    docNumberInput.addEventListener('input', function() {
        const tipoDoc = docTypeSelect.value;
        let cleanedValue = this.value;
        
        if (tipoDoc === 'RG') {
            // Permitir apenas números, pontos e hífen para RG
            cleanedValue = cleanedValue.replace(/[^0-9.-]/g, '');
            // Tentar formatar como XX.XXX.XXX-X
            if (cleanedValue.length > 0) {
                const numericValue = cleanedValue.replace(/\D/g, '');
                if (numericValue.length > 8) {
                    cleanedValue = numericValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{1}).*/, '$1.$2.$3-$4');
                }
            }
        } else if (tipoDoc === 'CNH') {
            // Para CNH, permitir números, pontos e hífen
            cleanedValue = cleanedValue.replace(/[^0-9.-]/g, '');
            // Limitar a 11 dígitos (considerando apenas os números)
            const numericValue = cleanedValue.replace(/\D/g, '');
            if (numericValue.length > 11) {
                // Manter a formatação, mas limitar os números a 11 dígitos
                const limitedNumeric = numericValue.substring(0, 11);
                cleanedValue = limitedNumeric;
            }
        } else if (tipoDoc === 'Passaporte') {
            // Formato de passaporte: 2 letras seguidas de 6 números
            cleanedValue = cleanedValue.toUpperCase();
            cleanedValue = cleanedValue.replace(/[^A-Z0-9.-]/g, '');
            
            // Limitar a 8 caracteres para as letras e números
            const alphanumericValue = cleanedValue.replace(/[^A-Z0-9]/g, '');
            if (alphanumericValue.length > 8) {
                const limitedAlphanumeric = alphanumericValue.substring(0, 8);
                cleanedValue = limitedAlphanumeric;
            }
        }
        
        // Atualizar o valor se foi modificado
        if (cleanedValue !== this.value) {
            const cursorPos = this.selectionStart;
            const lenDiff = this.value.length - cleanedValue.length;
            this.value = cleanedValue;
            if (cursorPos !== null) {
                this.setSelectionRange(Math.max(0, cursorPos - lenDiff), Math.max(0, cursorPos - lenDiff));
            }
        }
        
        // Validar formato específico para o tipo de documento
        Validators.validateDocumentNumber(this, tipoDoc);
    });
    
    docNumberInput.addEventListener('blur', function() {
        const tipoDoc = docTypeSelect.value;
        Validators.validateDocumentNumber(this, tipoDoc);
    });
}

/**
 * Inicializa todos os formatadores de campo em uma página
 */
function initFieldFormatters() {
    // Formatação de telefone
    const phoneField = document.getElementById('input_118_full');
    if (phoneField) {
        formatPhoneField(phoneField);
    }
    
    // Formatação de CPF
    const cpfField = document.getElementById('input_95');
    if (cpfField) {
        formatCpfField(cpfField);
    }
    
    const cpfConjugeField = document.getElementById('input_228');
    if (cpfConjugeField) {
        formatCpfField(cpfConjugeField);
    }
    
    // Formatação de datas
    const birthDateField = document.getElementById('input_104');
    if (birthDateField) {
        formatDateField(birthDateField, Validators.validateAge);
    }
    
    const issuanceDateField = document.getElementById('input_106');
    if (issuanceDateField) {
        formatDateField(issuanceDateField, Validators.validateIssuanceDate);
    }
    
    // Formatação do documento
    const tipoDocumentoSelect = document.getElementById('input_105');
    const numeroDocumentoInput = document.getElementById('input_98');
    if (tipoDocumentoSelect && numeroDocumentoInput) {
        setupDocumentFormatter(tipoDocumentoSelect, numeroDocumentoInput);
    }
    
    // Formatação do documento do cônjuge
    const tipoDocumentoConjugeSelect = document.getElementById('input_232');
    const numeroDocumentoConjugeInput = document.getElementById('input_233');
    if (tipoDocumentoConjugeSelect && numeroDocumentoConjugeInput) {
        setupDocumentFormatter(tipoDocumentoConjugeSelect, numeroDocumentoConjugeInput);
    }
}

// Exportar as funções para uso global
window.FieldFormatters = {
    formatPhoneField,
    formatCpfField,
    formatDateField,
    setupDocumentFormatter,
    initFieldFormatters
}; 