/**
 * AddressForm - Módulo para gerenciamento de formulários de endereço
 * Fornece funcionalidades para preenchimento automático de endereços via CEP
 */
(function(window) {
    'use strict';

    // Namespace para o gerenciador de formulários de endereço
    const AddressForm = {};

    // Cache de CEPs consultados para evitar requisições redundantes
    const cepCache = {};

    // Estado do carregamento de CEP
    let isLoading = false;

    /**
     * Formata um CEP removendo caracteres não numéricos
     * @param {string} cep - CEP a ser formatado
     * @returns {string} - CEP formatado
     */
    function formatCEP(cep) {
        return cep.replace(/\D/g, '');
    }

    /**
     * Valida se o CEP possui o formato correto
     * @param {string} cep - CEP a ser validado
     * @returns {boolean} - Verdadeiro se válido, falso caso contrário
     */
    function validateCEP(cep) {
        cep = formatCEP(cep);
        return cep.length === 8;
    }

    /**
     * Consulta um CEP na API ViaCEP
     * @param {string} cep - CEP a ser consultado
     * @returns {Promise} - Promessa com os dados do endereço
     */
    function fetchAddressByCEP(cep) {
        cep = formatCEP(cep);
        
        // Retorna do cache se já tiver sido consultado
        if (cepCache[cep]) {
            return Promise.resolve(cepCache[cep]);
        }
        
        // Consulta a API
        return fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao consultar o CEP');
                }
                return response.json();
            })
            .then(data => {
                // Verifica se o CEP foi encontrado
                if (data.erro) {
                    throw new Error('CEP não encontrado');
                }
                
                // Salva no cache
                cepCache[cep] = data;
                
                return data;
            });
    }

    /**
     * Exibe uma mensagem de feedback para o usuário
     * @param {HTMLElement} element - Elemento de referência
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de mensagem (success, error)
     */
    function showFeedback(element, message, type = 'error') {
        // Remove feedback anterior
        removeFeedback(element);
        
        // Cria elemento de feedback
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `cep-feedback ${type === 'error' ? 'text-danger' : 'text-success'}`;
        feedbackElement.textContent = message;
        
        // Insere após o elemento de referência
        if (element.parentNode) {
            element.parentNode.insertBefore(feedbackElement, element.nextSibling);
        }
        
        // Remove feedback após alguns segundos
        setTimeout(() => {
            if (feedbackElement.parentNode) {
                feedbackElement.parentNode.removeChild(feedbackElement);
            }
        }, 5000);
    }

    /**
     * Remove mensagens de feedback existentes
     * @param {HTMLElement} element - Elemento de referência
     */
    function removeFeedback(element) {
        if (element.parentNode) {
            const feedbacks = element.parentNode.querySelectorAll('.cep-feedback');
            feedbacks.forEach(el => el.parentNode.removeChild(el));
        }
    }

    /**
     * Controla o estado de carregamento dos campos
     * @param {HTMLElement} cepField - Campo de CEP
     * @param {HTMLFormElement} form - Formulário
     * @param {boolean} loading - Estado de carregamento
     */
    function setLoadingState(cepField, form, loading) {
        isLoading = loading;
        
        // Toggle classe de loading no campo de CEP
        if (loading) {
            cepField.classList.add('cep-loading');
        } else {
            cepField.classList.remove('cep-loading');
        }
        
        // Adiciona estilo CSS para mostrar spinner se ainda não existir
        if (loading && !document.getElementById('address-form-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'address-form-spinner-style';
            style.textContent = `
                .cep-loading {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23007bff' d='M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z' opacity='.25'/%3E%3Cpath fill='%23007bff' d='M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z'%3E%3CanimateTransform attributeName='transform' dur='0.75s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    background-size: 20px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Desabilita campos durante o carregamento
        if (form) {
            const addressFields = Array.from(form.querySelectorAll('[data-address-field]'));
            addressFields.forEach(field => {
                field.disabled = loading;
            });
        }
    }

    /**
     * Atualiza os campos de endereço com os dados retornados da API
     * @param {HTMLFormElement} form - Formulário
     * @param {Object} addressData - Dados do endereço
     */
    function fillAddressFields(form, addressData) {
        // Mapeamento de campos da API para os campos do formulário
        const fieldMapping = {
            logradouro: ['street', 'logradouro', 'endereco', 'rua'],
            complemento: ['complement', 'complemento'],
            bairro: ['neighborhood', 'bairro'],
            localidade: ['city', 'cidade', 'localidade'],
            uf: ['state', 'estado', 'uf']
        };
        
        // Preenche os campos com base no mapeamento
        for (const apiField in fieldMapping) {
            if (addressData[apiField]) {
                // Procura pelos possíveis nomes de campo no formulário
                const possibleFields = fieldMapping[apiField];
                
                for (const fieldName of possibleFields) {
                    // Tenta encontrar o campo por name, id ou atributo data-address-field
                    const field = form.querySelector(`[name="${fieldName}"], #${fieldName}, [data-address-field="${fieldName}"]`);
                    
                    if (field) {
                        field.value = addressData[apiField];
                        
                        // Dispara evento de change para acionar possíveis listeners
                        const event = new Event('change', { bubbles: true });
                        field.dispatchEvent(event);
                        
                        break;
                    }
                }
            }
        }
    }

    /**
     * Inicializa um formulário de endereço com preenchimento automático por CEP
     * @param {HTMLFormElement|string} form - Formulário ou seu ID
     * @param {Object} options - Opções de configuração
     */
    AddressForm.init = function(form, options = {}) {
        // Obtém o elemento do formulário
        if (typeof form === 'string') {
            form = document.getElementById(form);
        }
        
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        // Mescla opções com valores padrão
        const config = {
            cepSelector: '[data-address-cep], #cep, [name="cep"]',
            onAddressFound: null,
            onAddressError: null,
            autoFocus: true
        };
        Object.assign(config, options);
        
        // Obtém o campo de CEP
        const cepField = form.querySelector(config.cepSelector);
        if (!cepField) {
            console.error('Campo de CEP não encontrado');
            return;
        }
        
        // Formata o CEP durante a digitação
        cepField.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length > 5) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            if (value.length > 9) {
                value = value.substring(0, 9);
            }
            
            this.value = value;
        });
        
        // Consulta o CEP quando o campo perder o foco
        cepField.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            
            if (cep.length === 8 && !isLoading) {
                // Define estado de carregamento
                setLoadingState(cepField, form, true);
                
                // Realiza a consulta
                fetchAddressByCEP(cep)
                    .then(addressData => {
                        // Preenche os campos com os dados retornados
                        fillAddressFields(form, addressData);
                        
                        // Callback de sucesso
                        if (typeof config.onAddressFound === 'function') {
                            config.onAddressFound(addressData);
                        }
                        
                        // Foca no próximo campo após o preenchimento
                        if (config.autoFocus) {
                            // Encontra o campo de número ou complemento para focar
                            const numberField = form.querySelector('[data-address-field="number"], #number, [name="number"]');
                            const complementField = form.querySelector('[data-address-field="complement"], #complement, [name="complemento"]');
                            
                            if (numberField) {
                                numberField.focus();
                            } else if (complementField) {
                                complementField.focus();
                            }
                        }
                        
                        // Exibe mensagem de sucesso
                        showFeedback(cepField, 'Endereço encontrado!', 'success');
                    })
                    .catch(error => {
                        // Callback de erro
                        if (typeof config.onAddressError === 'function') {
                            config.onAddressError(error);
                        }
                        
                        // Exibe mensagem de erro
                        showFeedback(cepField, error.message || 'Erro ao consultar o CEP', 'error');
                    })
                    .finally(() => {
                        // Remove estado de carregamento
                        setLoadingState(cepField, form, false);
                    });
            }
        });
        
        // Limpa os campos de endereço se o CEP for apagado
        cepField.addEventListener('input', function() {
            if (this.value.replace(/\D/g, '').length === 0) {
                const addressFields = form.querySelectorAll('[data-address-field]');
                addressFields.forEach(field => {
                    field.value = '';
                });
            }
        });
    };

    /**
     * Limpa o cache de CEPs consultados
     */
    AddressForm.clearCache = function() {
        for (const key in cepCache) {
            delete cepCache[key];
        }
    };

    /**
     * Consulta um CEP manualmente
     * @param {string} cep - CEP a ser consultado
     * @returns {Promise} - Promessa com os dados do endereço
     */
    AddressForm.lookup = function(cep) {
        if (!validateCEP(cep)) {
            return Promise.reject(new Error('CEP inválido'));
        }
        
        return fetchAddressByCEP(cep);
    };

    // Exporta o módulo para o escopo global
    window.AddressForm = AddressForm;

})(window); 