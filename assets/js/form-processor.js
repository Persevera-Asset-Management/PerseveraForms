/**
 * form-processor.js
 * -----------------
 * Funções para processamento de formulários
 */

/**
 * Serializa os dados de um formulário para envio
 * @param {HTMLFormElement} form - O formulário a ser serializado
 * @returns {Object} - Os dados do formulário em formato de objeto
 */
function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData) {
        // Se o campo já existe e é um array, adiciona o valor
        if (data[key] && Array.isArray(data[key])) {
            data[key].push(value);
        }
        // Se o campo já existe mas não é um array, converte para array
        else if (data[key]) {
            data[key] = [data[key], value];
        }
        // Caso contrário, simplesmente define o valor
        else {
            data[key] = value;
        }
    }
    
    return data;
}

/**
 * Valida um formulário usando as regras padrão e personalizadas
 * @param {HTMLFormElement} form - O formulário a ser validado
 * @returns {boolean} - Verdadeiro se o formulário é válido
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    // Limpar mensagens de erro anteriores
    form.querySelectorAll('.error-message').forEach(error => error.remove());
    form.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
    
    // Validar cada campo
    inputs.forEach(input => {
        // Pular campos desabilitados ou ocultos
        if (input.disabled || input.type === 'hidden') return;
        
        let fieldIsValid = true;
        let errorMessage = '';
        
        // Validar campo obrigatório
        if (input.hasAttribute('required') && !input.value.trim()) {
            fieldIsValid = false;
            errorMessage = 'Este campo é obrigatório';
        }
        // Validar campo de email
        else if (input.type === 'email' && input.value.trim() && !validateEmail(input.value)) {
            fieldIsValid = false;
            errorMessage = 'Por favor, insira um email válido';
        }
        // Validar campo de CPF
        else if (input.dataset.type === 'cpf' && input.value.trim() && !window.DocumentValidator?.validateCPF(input.value)) {
            fieldIsValid = false;
            errorMessage = 'Por favor, insira um CPF válido';
        }
        // Validar campo de CNPJ
        else if (input.dataset.type === 'cnpj' && input.value.trim() && !window.DocumentValidator?.validateCNPJ(input.value)) {
            fieldIsValid = false;
            errorMessage = 'Por favor, insira um CNPJ válido';
        }
        // Validar campo de data
        else if (input.dataset.type === 'date' && input.value.trim() && !window.DocumentValidator?.validateDate(input.value)) {
            fieldIsValid = false;
            errorMessage = 'Por favor, insira uma data válida (DD/MM/AAAA)';
        }
        // Validar campo de telefone
        else if (input.dataset.type === 'phone' && input.value.trim() && !window.DocumentValidator?.validatePhone(input.value)) {
            fieldIsValid = false;
            errorMessage = 'Por favor, insira um telefone válido';
        }
        // Validar campo numérico
        else if (input.type === 'number') {
            const min = parseFloat(input.min);
            const max = parseFloat(input.max);
            const value = parseFloat(input.value) || 0;
            
            if (!isNaN(min) && value < min) {
                fieldIsValid = false;
                errorMessage = `O valor mínimo é ${min}`;
            }
            else if (!isNaN(max) && value > max) {
                fieldIsValid = false;
                errorMessage = `O valor máximo é ${max}`;
            }
        }
        
        // Verificar validações personalizadas
        if (fieldIsValid && input.dataset.validate) {
            const validatorName = input.dataset.validate;
            if (customValidators[validatorName]) {
                const result = customValidators[validatorName](input.value, input);
                if (result !== true) {
                    fieldIsValid = false;
                    errorMessage = result || 'Valor inválido';
                }
            }
        }
        
        // Marcar campo como erro e mostrar mensagem
        if (!fieldIsValid) {
            isValid = false;
            input.classList.add('input-error');
            
            // Adicionar mensagem de erro após o campo
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.textContent = errorMessage;
            
            // Encontrar o contêiner de campo correto para adicionar o erro
            const fieldContainer = input.closest('.form-group') || input.parentNode;
            fieldContainer.appendChild(errorSpan);
        }
    });
    
    return isValid;
}

/**
 * Validadores personalizados para campos específicos
 */
const customValidators = {
    // Validar senhas iguais
    confirmPassword: function(value, input) {
        const passwordField = document.querySelector('#password, input[name="password"]');
        if (passwordField && value !== passwordField.value) {
            return 'As senhas não coincidem';
        }
        return true;
    },
    
    // Validar CEP brasileiro
    zipCode: function(value) {
        const zipRegex = /^\d{5}-?\d{3}$/;
        if (!zipRegex.test(value)) {
            return 'Por favor, insira um CEP válido';
        }
        return true;
    },
    
    // Validar percentual entre 0 e 100
    percentage: function(value) {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 100) {
            return 'O valor deve estar entre 0 e 100';
        }
        return true;
    }
    
    // Adicionar outros validadores personalizados conforme necessário
};

/**
 * Valida se um email tem formato válido
 * @param {string} email - O email a ser validado
 * @returns {boolean} - Verdadeiro se o email é válido
 */
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Envia dados de formulário via AJAX
 * @param {string} url - URL para envio do formulário
 * @param {Object} data - Dados a serem enviados
 * @param {Function} successCallback - Função de callback para sucesso
 * @param {Function} errorCallback - Função de callback para erro
 */
function submitFormData(url, data, successCallback, errorCallback) {
    // Criar o objeto de requisição
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    
    // Configurar handlers de resposta
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            let response;
            try {
                response = JSON.parse(xhr.responseText);
            } catch (e) {
                response = xhr.responseText;
            }
            if (successCallback) successCallback(response);
        } else {
            let error;
            try {
                error = JSON.parse(xhr.responseText);
            } catch (e) {
                error = xhr.responseText || 'Erro ao processar a requisição';
            }
            if (errorCallback) errorCallback(error);
        }
    };
    
    xhr.onerror = function() {
        if (errorCallback) errorCallback('Ocorreu um erro de conexão');
    };
    
    // Enviar os dados
    xhr.send(JSON.stringify(data));
}

/**
 * Configura um formulário para validação e envio AJAX
 * @param {string} formSelector - Seletor CSS para o formulário
 * @param {Object} options - Opções de configuração
 */
function setupFormProcessor(formSelector, options = {}) {
    const form = document.querySelector(formSelector);
    if (!form) return;
    
    const defaultOptions = {
        submitUrl: form.action,
        method: form.method || 'POST',
        validate: true,
        resetOnSuccess: true,
        scrollToErrors: true,
        showSuccessMessage: true,
        successMessage: 'Formulário enviado com sucesso!',
        errorMessage: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
        onSuccess: null,
        onError: null
    };
    
    // Mesclar opções
    const settings = { ...defaultOptions, ...options };
    
    // Adicionar evento de submit
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validar formulário se necessário
        if (settings.validate && !validateForm(form)) {
            // Rolar até o primeiro erro
            if (settings.scrollToErrors) {
                const firstError = form.querySelector('.input-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
            return;
        }
        
        // Mostrar indicador de carregamento
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerHTML : '';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loading-spinner"></span> Enviando...';
        }
        
        // Serializar e enviar dados
        const formData = serializeForm(form);
        
        submitFormData(
            settings.submitUrl,
            formData,
            function(response) {
                // Reset do botão
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                
                // Reset do formulário se necessário
                if (settings.resetOnSuccess) {
                    form.reset();
                }
                
                // Mostrar mensagem de sucesso
                if (settings.showSuccessMessage) {
                    const messageContainer = document.createElement('div');
                    messageContainer.className = 'alert alert-success';
                    messageContainer.textContent = settings.successMessage;
                    
                    form.prepend(messageContainer);
                    
                    // Remover mensagem após 5 segundos
                    setTimeout(function() {
                        messageContainer.remove();
                    }, 5000);
                }
                
                // Chamar callback de sucesso
                if (settings.onSuccess) settings.onSuccess(response);
            },
            function(error) {
                // Reset do botão
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                
                // Mostrar mensagem de erro
                const errorContainer = document.createElement('div');
                errorContainer.className = 'alert alert-error';
                errorContainer.textContent = typeof error === 'string' ? error : settings.errorMessage;
                
                form.prepend(errorContainer);
                
                // Remover mensagem após 5 segundos
                setTimeout(function() {
                    errorContainer.remove();
                }, 5000);
                
                // Chamar callback de erro
                if (settings.onError) settings.onError(error);
            }
        );
    });
}

/**
 * Configura formulários multi-etapa
 * @param {string} formSelector - Seletor CSS para o formulário
 */
function setupMultiStepForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;
    
    const steps = form.querySelectorAll('.form-step');
    if (steps.length <= 1) return;
    
    let currentStep = 0;
    
    // Ocultar todos os passos exceto o primeiro
    steps.forEach((step, index) => {
        if (index !== 0) {
            step.style.display = 'none';
        }
    });
    
    // Adicionar botões de navegação a cada passo
    steps.forEach((step, index) => {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'form-navigation';
        
        // Botão para voltar (exceto no primeiro passo)
        if (index > 0) {
            const prevButton = document.createElement('button');
            prevButton.type = 'button';
            prevButton.className = 'btn btn-secondary';
            prevButton.textContent = 'Voltar';
            prevButton.addEventListener('click', function() {
                goToStep(index - 1);
            });
            buttonsContainer.appendChild(prevButton);
        }
        
        // Botão para avançar (exceto no último passo)
        if (index < steps.length - 1) {
            const nextButton = document.createElement('button');
            nextButton.type = 'button';
            nextButton.className = 'btn btn-primary';
            nextButton.textContent = 'Próximo';
            nextButton.addEventListener('click', function() {
                if (validateStep(step)) {
                    goToStep(index + 1);
                }
            });
            buttonsContainer.appendChild(nextButton);
        }
        
        // Botão de enviar (apenas no último passo)
        if (index === steps.length - 1) {
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.className = 'btn btn-success';
            submitButton.textContent = 'Enviar';
            buttonsContainer.appendChild(submitButton);
        }
        
        step.appendChild(buttonsContainer);
    });
    
    // Função para validar um passo específico
    function validateStep(step) {
        const inputs = step.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        // Limpar mensagens de erro anteriores
        step.querySelectorAll('.error-message').forEach(error => error.remove());
        step.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
        
        // Validar cada campo dentro do passo
        inputs.forEach(input => {
            // Pular campos desabilitados ou ocultos
            if (input.disabled || input.type === 'hidden') return;
            
            // Se o campo é obrigatório e está vazio
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('input-error');
                
                // Adicionar mensagem de erro
                const errorSpan = document.createElement('span');
                errorSpan.className = 'error-message';
                errorSpan.textContent = 'Este campo é obrigatório';
                
                // Adicionar ao contêiner de campo
                const fieldContainer = input.closest('.form-group') || input.parentNode;
                fieldContainer.appendChild(errorSpan);
            }
            // Realizar outras validações conforme necessário
        });
        
        return isValid;
    }
    
    // Função para navegar entre os passos
    function goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            steps[currentStep].style.display = 'none';
            steps[stepIndex].style.display = 'block';
            currentStep = stepIndex;
            
            // Rolar para o topo do formulário
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

/**
 * Inicializa o processador de formulários
 */
function initFormProcessor() {
    // Configura os processadores de formulário em toda a página
    const forms = document.querySelectorAll('form[data-process="true"]');
    forms.forEach(form => {
        const options = {
            submitUrl: form.dataset.submitUrl || form.action,
            method: form.dataset.method || form.method || 'POST',
            resetOnSuccess: form.dataset.resetOnSuccess !== 'false',
            scrollToErrors: form.dataset.scrollToErrors !== 'false',
            showSuccessMessage: form.dataset.showSuccessMessage !== 'false',
            successMessage: form.dataset.successMessage || 'Formulário enviado com sucesso!',
            errorMessage: form.dataset.errorMessage || 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.'
        };
        
        setupFormProcessor(`#${form.id}`, options);
    });
    
    // Configura formulários multi-etapa
    const multiStepForms = document.querySelectorAll('form[data-multi-step="true"]');
    multiStepForms.forEach(form => {
        setupMultiStepForm(`#${form.id}`);
    });
}

// Exportar as funções para uso global
window.FormProcessor = {
    serializeForm,
    validateForm,
    validateEmail,
    submitFormData,
    setupFormProcessor,
    setupMultiStepForm,
    initFormProcessor
}; 