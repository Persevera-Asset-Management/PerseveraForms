/**
 * AddressProcessor - Módulo para processamento de endereços brasileiros
 * Fornece funcionalidades para busca de CEP e preenchimento de campos de endereço
 */
(function(window) {
    'use strict';

    // Namespace para o processador de endereços
    const AddressProcessor = {};

    /**
     * Busca um endereço pelo CEP usando a API do ViaCEP
     * @param {string} cep - CEP a ser buscado (apenas números)
     * @param {Function} successCallback - Função chamada em caso de sucesso
     * @param {Function} errorCallback - Função chamada em caso de erro
     */
    AddressProcessor.searchAddressByCEP = function(cep, successCallback, errorCallback) {
        // Remove caracteres não numéricos
        cep = cep.replace(/\D/g, '');
        
        // Valida o CEP
        if (cep.length !== 8) {
            if (errorCallback) {
                errorCallback('CEP inválido. Um CEP válido deve conter 8 dígitos.');
            }
            return;
        }
        
        // Formato da URL do ViaCEP
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        
        // Faz a requisição
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar CEP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Verifica se o CEP foi encontrado
                if (data.erro) {
                    if (errorCallback) {
                        errorCallback('CEP não encontrado');
                    }
                    return;
                }
                
                // Chama o callback de sucesso com os dados do endereço
                if (successCallback) {
                    successCallback(data);
                }
            })
            .catch(error => {
                if (errorCallback) {
                    errorCallback(error.message || 'Erro desconhecido ao buscar o CEP');
                }
            });
    };

    /**
     * Preenche os campos de endereço com os dados retornados pela API
     * @param {Object} addressData - Dados do endereço retornados pela API
     * @param {Object} fieldMapping - Mapeamento dos campos da API para os IDs dos campos no formulário
     */
    AddressProcessor.fillAddressFields = function(addressData, fieldMapping) {
        for (const apiField in fieldMapping) {
            if (Object.prototype.hasOwnProperty.call(fieldMapping, apiField) && 
                Object.prototype.hasOwnProperty.call(addressData, apiField)) {
                
                const targetField = fieldMapping[apiField];
                
                // Verifica se é um objeto com configurações avançadas
                if (typeof targetField === 'object') {
                    const fieldId = targetField.fieldId;
                    const isSelect = targetField.isSelect || false;
                    const element = document.getElementById(fieldId);
                    
                    if (element) {
                        // Se for um campo select, selecionar a opção
                        if (isSelect) {
                            for (let i = 0; i < element.options.length; i++) {
                                if (element.options[i].value === addressData[apiField]) {
                                    element.selectedIndex = i;
                                    break;
                                }
                            }
                            
                            // Dispara evento de change para atualizar dependências
                            const event = new Event('change');
                            element.dispatchEvent(event);
                        } else {
                            // Atribui valor normalmente
                            element.value = addressData[apiField];
                        }
                        
                        // Executa callback se existir
                        if (targetField.callback && typeof targetField.callback === 'function') {
                            targetField.callback(addressData[apiField]);
                        }
                    }
                } else {
                    // Formato simples: apenas ID do campo
                    const element = document.getElementById(targetField);
                    if (element) {
                        element.value = addressData[apiField];
                    }
                }
            }
        }
    };

    /**
     * Inicializa o processador de endereços com auto-preenchimento baseado no CEP
     * @param {Object} options - Opções de configuração
     * @param {string} options.cepField - Seletor do campo de CEP
     * @param {Object} options.fieldMapping - Mapeamento dos campos da API para os IDs dos campos no formulário
     */
    AddressProcessor.initAddressProcessor = function(options) {
        const cepField = document.querySelector(options.cepField);
        
        if (!cepField) {
            console.error('Campo de CEP não encontrado');
            return;
        }
        
        // Aplica máscara de formatação do CEP (opcional)
        cepField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5);
            }
            
            e.target.value = value;
        });
        
        // Busca endereço quando o campo perder o foco
        cepField.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                // Adiciona classe de carregamento ao elemento pai
                this.parentElement.classList.add('loading');
                
                // Busca o endereço
                AddressProcessor.searchAddressByCEP(
                    cep,
                    function(data) {
                        // Preenche os campos
                        AddressProcessor.fillAddressFields(data, options.fieldMapping);
                        
                        // Remove classe de carregamento
                        cepField.parentElement.classList.remove('loading');
                    },
                    function(error) {
                        console.error('Erro ao buscar CEP:', error);
                        
                        // Remove classe de carregamento
                        cepField.parentElement.classList.remove('loading');
                    }
                );
            }
        });
    };

    // Exporta o módulo para o escopo global
    window.AddressProcessor = AddressProcessor;

})(window); 