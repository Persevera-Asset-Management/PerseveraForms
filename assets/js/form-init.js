/**
 * form-init.js
 * ------------
 * Inicialização do formulário de cadastro
 * Configura validadores, máscaras e comportamentos para o formulário
 */

const FormInit = {
    /**
     * Inicializa todas as funcionalidades do formulário
     */
    init: function() {
        const form = document.getElementById('cadastro-form');
        if (!form) return;

        this.initHandlers();
        this.initMasks();
        this.initValidations(form);
        this.setupFormSubmission(form);
        this.setupTabNavigation();
        
        // Garante que todas as validações sejam aplicadas corretamente
        this.ensureValidationsApplied(form);
    },

    /**
     * Inicializa os handlers de endereço e outros utilitários
     */
    initHandlers: function() {
        // Inicializar handlers de endereço
        if (typeof window.CepHandler !== 'undefined') {
            CepHandler.initCepFields();
        }
        
        if (typeof window.AddressHandler !== 'undefined') {
            // Configura a funcionalidade de copiar endereço
            AddressHandler.setupAddressCopy();
            
            // Configura os campos do cônjuge
            AddressHandler.setupSpouseFields();
            
            // Configura busca de endereço
            AddressHandler.setupAddressSearch();
        }
        
        // Inicializar utilitários de formulário
        if (typeof window.FormUtils !== 'undefined') {
            FormUtils.initFormUtils();
        }
    },

    /**
     * Aplica máscaras aos campos do formulário
     */
    initMasks: function() {
        // Configuração das máscaras
        if (typeof window.MaskManager !== 'undefined') {
            MaskManager.applyMask(document.getElementById('input_95'), 'cpf');
            MaskManager.applyMask(document.getElementById('input_228'), 'cpf');
            MaskManager.applyMask(document.getElementById('input_104'), 'date');
            MaskManager.applyMask(document.getElementById('input_106'), 'date');
            MaskManager.applyMask(document.getElementById('input_231'), 'date');
            MaskManager.applyMask(document.getElementById('input_234'), 'date');
            MaskManager.applyMask(document.getElementById('input_118_full'), 'phone');
            MaskManager.applyMask(document.getElementById('input_108'), 'cep');
            MaskManager.applyMask(document.getElementById('input_215'), 'cep');
        }
    },

    /**
     * Configura as validações dos campos do formulário
     * @param {HTMLElement} form - O formulário a ser validado
     */
    initValidations: function(form) {
        if (typeof window.FormValidator === 'undefined') return;

        FormValidator.init(form, {
            validateOnBlur: true,
            validateOnInput: false,
            validateOnSubmit: true
        });
        
        // CPF validations
        this.setupCpfValidation();
        
        // Name fields validation
        this.setupNameValidation();
        
        // Email validation
        this.setupEmailValidation();
        
        // Phone validation
        this.setupPhoneValidation();
        
        // Date validations
        this.setupDateValidation();
        
        // Document validations
        this.setupDocumentValidation();
        
        // CEP validations
        this.setupCepValidation();
    },

    /**
     * Garante que todas as validações sejam aplicadas, mesmo se os atributos data-* estiverem presentes no HTML
     * @param {HTMLFormElement} form - O formulário a validar
     */
    ensureValidationsApplied: function(form) {
        if (typeof FormValidator === 'undefined') return;
        
        // Aguarda um momento para garantir que todos os scripts foram carregados
        setTimeout(() => {
            console.log('Garantindo que as validações estão aplicadas corretamente...');
            
            // Configurações de validação em tempo real
            FormValidator.init(form, {
                validateOnBlur: true,
                validateOnInput: true,
                validateOnSubmit: true
            });
            
            // Força configuração de atributos de validação para campos de texto se ainda não tiverem sido configurados
            const textInputs = form.querySelectorAll('input[type="text"]');
            textInputs.forEach(input => {
                // Se é um campo que parece ser de nome (contém 'nome' ou 'name' no ID)
                if ((input.id.toLowerCase().includes('nome') || input.id.toLowerCase().includes('name')) 
                    && !input.hasAttribute('data-validate-name')) {
                    input.setAttribute('data-validate', 'true');
                    input.setAttribute('data-validate-name', 'true');
                    input.setAttribute('data-error-name', 'Apenas letras, espaços e caracteres simples como \' - . são permitidos');
                    this.setupRealtimeValidation(input);
                }
            });
            
            // Adiciona validação em tempo real para campos com atributos data-validate
            const validationFields = form.querySelectorAll('[data-validate="true"]');
            validationFields.forEach(field => {
                this.setupRealtimeValidation(field);
            });
            
            // Aplica validações manualmente em campos já preenchidos
            this.validatePrefilledFields(form);
            
            console.log('Validações reforçadas aplicadas com sucesso!');
        }, 500);
    },
    
    /**
     * Valida campos que já estão preenchidos na inicialização
     * @param {HTMLFormElement} form - O formulário a validar 
     */
    validatePrefilledFields: function(form) {
        const fieldsToCheck = form.querySelectorAll('input[data-validate="true"], select[data-validate="true"], textarea[data-validate="true"]');
        
        fieldsToCheck.forEach(field => {
            if (field.value && field.value.trim() !== '') {
                // Forçar validação imediata para campos preenchidos
                FormValidator.validateField(field);
            }
        });
    },

    /**
     * Configura validação de CPF
     */
    setupCpfValidation: function() {
        const cpfFields = [
            document.getElementById('input_95'),   // CPF
            document.getElementById('input_228')   // CPF do cônjuge
        ];
        
        cpfFields.forEach(field => {
            if (field) {
                field.setAttribute('data-validate', 'true');
                field.setAttribute('data-validate-cpf', 'true');
                field.setAttribute('data-error-cpf', 'CPF inválido. Verifique o número informado.');
                
                // Adiciona validação em tempo real
                this.setupRealtimeValidation(field);
            }
        });
    },

    /**
     * Configura validação de campos de nome
     */
    setupNameValidation: function() {
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
        
        nameFields.forEach(field => {
            if (field) {
                field.setAttribute('data-validate', 'true');
                field.setAttribute('data-validate-name', 'true');
                field.setAttribute('data-error-name', 'Apenas letras, espaços e caracteres simples como . \' - são permitidos');
            }
        });
        
        // Adiciona validações em tempo real para campos de nome
        nameFields.forEach(field => {
            if (field) {
                // Validação ao perder foco
                field.addEventListener('blur', function() {
                    if (typeof FormValidator !== 'undefined') {
                        FormValidator.validateField(this);
                    }
                });
                
                // Validação durante digitação com pequeno atraso
                let typingTimer;
                field.addEventListener('input', function() {
                    const that = this;
                    clearTimeout(typingTimer);
                    if (typeof FormValidator !== 'undefined') {
                        typingTimer = setTimeout(() => {
                            FormValidator.validateField(that);
                        }, 300);
                    }
                });
            }
        });
    },

    /**
     * Configura validação de email
     */
    setupEmailValidation: function() {
        const emailField = document.getElementById('input_117');
        if (emailField) {
            emailField.setAttribute('data-validate', 'true');
            emailField.setAttribute('data-validate-email', 'true');
            emailField.setAttribute('data-error-email', 'E-mail inválido. Por favor, verifique.');
            
            // Adiciona validação em tempo real
            this.setupRealtimeValidation(emailField);
        }
    },

    /**
     * Configura validação de telefone
     */
    setupPhoneValidation: function() {
        const phoneField = document.getElementById('input_118');
        if (phoneField) {
            phoneField.setAttribute('data-validate', 'true');
            phoneField.setAttribute('data-validate-phone', 'true');
            phoneField.setAttribute('data-error-phone', 'Telefone inválido. Use (XX) XXXX-XXXX para fixo ou (XX) XXXXX-XXXX para celular.');
            
            // Adiciona validação em tempo real
            this.setupRealtimeValidation(phoneField);
        }
    },

    /**
     * Configura validação de datas
     */
    setupDateValidation: function() {
        const dateFields = [
            document.getElementById('input_104'), // Data de nascimento
            document.getElementById('input_106'), // Data de expedição
            document.getElementById('input_231'), // Data de nascimento cônjuge
            document.getElementById('input_234')  // Data de expedição cônjuge
        ];
        
        dateFields.forEach(field => {
            if (field) {
                field.setAttribute('data-validate', 'true');
                field.setAttribute('data-validate-date', 'true');
                field.setAttribute('data-error-date', 'Data inválida. Use o formato DD/MM/AAAA.');
                
                // Adiciona validação em tempo real
                this.setupRealtimeValidation(field);
            }
        });
        
        // Validação específica para idade mínima (18 anos)
        const birthDateField = document.getElementById('input_104');
        if (birthDateField) {
            birthDateField.setAttribute('data-validate-age', 'true');
            birthDateField.setAttribute('data-error-age', 'É necessário ter pelo menos 18 anos.');
        }
        
        // Validação específica para data de expedição (não pode ser futura)
        const issuanceDateFields = [document.getElementById('input_106'), document.getElementById('input_234')];
        issuanceDateFields.forEach(field => {
            if (field) {
                field.setAttribute('data-validate-issuance-date', 'true');
                field.setAttribute('data-error-issuance-date', 'Data de expedição não pode ser futura.');
            }
        });
    },

    /**
     * Configura validação de documentos
     */
    setupDocumentValidation: function() {
        // Validação de documentos principal
        this.setupDocumentFieldValidation(
            document.getElementById('input_105'), 
            document.getElementById('input_98')
        );
        
        // Validação de documentos do cônjuge
        this.setupDocumentFieldValidation(
            document.getElementById('input_232'), 
            document.getElementById('input_233'),
            true
        );
    },

    /**
     * Configura validação para um par de campos de documento (tipo e número)
     * @param {HTMLElement} typeField - Campo de tipo de documento
     * @param {HTMLElement} numberField - Campo de número de documento
     * @param {boolean} isSpouse - Indica se é documento do cônjuge
     */
    setupDocumentFieldValidation: function(typeField, numberField, isSpouse = false) {
        if (!typeField || !numberField || typeof FormValidator === 'undefined') return;
        
        // Adiciona evento para validar o número do documento quando o tipo for alterado
        typeField.addEventListener('change', function() {
            validateDocNumber();
        });
        
        // Adiciona evento para validar o número do documento quando for alterado
        numberField.addEventListener('input', function() {
            validateDocNumber();
        });
        
        // Função para validar o número do documento conforme o tipo selecionado
        function validateDocNumber() {
            const docType = typeField.value;
            const docNumber = numberField.value;
            
            if (docType && docNumber) {
                const isValid = FormValidator.Validators.documentNumber(docNumber, docType);
                
                if (!isValid) {
                    numberField.classList.add('is-invalid');
                    // Procurar a mensagem de erro existente ou criar uma nova
                    let errorMsg = numberField.parentNode.querySelector('.invalid-feedback');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'invalid-feedback';
                        numberField.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = `Formato inválido para ${docType}`;
                } else {
                    numberField.classList.remove('is-invalid');
                    const errorMsg = numberField.parentNode.querySelector('.invalid-feedback');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            }
        }
        
        // Validação inicial
        if (typeField.value) {
            validateDocNumber();
        }
    },

    /**
     * Configura validação de CEP
     */
    setupCepValidation: function() {
        const cepFields = [
            document.getElementById('input_108'), // CEP correspondência
            document.getElementById('input_215')  // CEP residência
        ];
        
        cepFields.forEach(field => {
            if (field) {
                field.setAttribute('data-validate', 'true');
                field.setAttribute('data-validate-cep', 'true');
                field.setAttribute('data-error-cep', 'CEP inválido. Deve conter 8 dígitos.');
                
                // Adiciona validação em tempo real
                this.setupRealtimeValidation(field);
            }
        });
    },

    /**
     * Configura navegação entre abas com validação
     */
    setupTabNavigation: function() {
        const nextButtons = document.querySelectorAll('.next-tab');
        nextButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const currentTab = this.getAttribute('data-next').replace('tab-', '');
                const previousTab = parseInt(currentTab) - 1;
                
                // Valida campos da aba atual antes de prosseguir
                const fieldsInTab = document.querySelectorAll(`#tab-${previousTab} .form-control`);
                let isValid = true;
                
                fieldsInTab.forEach(field => {
                    if (field.hasAttribute('required') || field.value.trim() !== '') {
                        isValid = FormValidator.validateField(field) && isValid;
                    }
                });
                
                // Se não for válido, impede a navegação
                if (!isValid) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
        });
    },

    /**
     * Configura o envio do formulário com validação completa
     * @param {HTMLElement} form - O formulário a ser enviado
     */
    setupFormSubmission: function(form) {
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            // Preenche os campos ocultos para as datas
            const dateFields = [
                document.getElementById('input_104'), // Data de nascimento
                document.getElementById('input_106'), // Data de expedição
                document.getElementById('input_231'), // Data de nascimento cônjuge
                document.getElementById('input_234')  // Data de expedição cônjuge
            ];
            
            dateFields.forEach(function(field) {
                if (field && field.value) {
                    const fieldId = field.id;
                    const parts = field.value.split('/');
                    if (parts.length === 3) {
                        document.getElementById('day_' + fieldId.split('_')[1]).value = parts[0];
                        document.getElementById('month_' + fieldId.split('_')[1]).value = parts[1];
                        document.getElementById('year_' + fieldId.split('_')[1]).value = parts[2];
                    }
                }
            });
            
            // Valida o formulário inteiro
            const isValid = FormValidator.validateForm(form);
            if (!isValid) {
                e.preventDefault();
                e.stopPropagation();
                
                // Encontra a primeira aba com erros e a exibe
                const tabs = ['tab-1', 'tab-2', 'tab-3', 'tab-4'];
                for (const tabId of tabs) {
                    const fieldsWithErrors = document.querySelectorAll(`#${tabId} .is-invalid`);
                    if (fieldsWithErrors.length > 0) {
                        FormTabs.switchTab(tabId);
                        break;
                    }
                }
                
                return false;
            }
        });
    },

    /**
     * Configura validação em tempo real para um campo
     * @param {HTMLElement} field - Campo a receber validação em tempo real
     */
    setupRealtimeValidation: function(field) {
        if (!field) return;
        
        // Validação imediata se já houver valor no campo
        if (field.value && field.value.trim() !== '') {
            setTimeout(() => {
                if (typeof FormValidator !== 'undefined') {
                    FormValidator.validateField(field);
                }
            }, 100);
        }
        
        // Validação ao perder foco
        field.addEventListener('blur', function() {
            if (typeof FormValidator !== 'undefined') {
                FormValidator.validateField(this);
            }
        });
        
        // Validação durante digitação com pequeno atraso
        let typingTimer;
        field.addEventListener('input', function() {
            const that = this;
            clearTimeout(typingTimer);
            if (typeof FormValidator !== 'undefined') {
                typingTimer = setTimeout(() => {
                    FormValidator.validateField(that);
                }, 300);
            }
        });
        
        // Adiciona efeito visual de borda vermelha enquanto estiver em estado inválido
        field.addEventListener('invalid', function() {
            this.classList.add('is-invalid');
        });
    }
};

// Inicializa o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    FormInit.init();
});

// Exporta o FormInit para uso global se necessário
window.FormInit = FormInit; 