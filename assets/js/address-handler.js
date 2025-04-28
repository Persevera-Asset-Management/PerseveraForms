/**
 * address-handler.js
 * -----------------
 * Funções para gerenciar endereços em formulários
 */

/**
 * Configura a funcionalidade de copiar endereço de residência para correspondência
 */
function setupAddressCopy() {
    const sameAddressCheckbox = document.getElementById('same_address_checkbox');
    const correspondenceSection = document.getElementById('correspondence_address_section');
    
    // Campos de endereço de residência
    const residenciaFields = ['input_108', 'input_109', 'input_112', 'input_113', 'input_111', 'input_110', 'input_114'];
    // Campos de endereço de correspondência
    const correspondenciaFields = ['input_215', 'input_216', 'input_217', 'input_219', 'input_220', 'input_221', 'input_222'];
    
    // Inicializar o estado da seção de correspondência
    if (sameAddressCheckbox && correspondenceSection) {
        // Função para mostrar/esconder a seção de endereço de correspondência
        function toggleCorrespondenceSection() {
            if (sameAddressCheckbox.checked) {
                // Use class instead of style
                correspondenceSection.classList.add('hidden-section');
                
                // Copiar os valores dos campos de residência para os campos de correspondência
                residenciaFields.forEach((fieldId, index) => {
                    const field = document.getElementById(fieldId);
                    const corrField = document.getElementById(correspondenciaFields[index]);
                    
                    if (field && corrField) {
                        corrField.value = field.value;
                        
                        // Para select de estado, também atualizar o selectedIndex
                        if (fieldId === 'input_114' && corrField.tagName === 'SELECT') {
                            corrField.selectedIndex = field.selectedIndex;
                        }
                    }
                });
            } else {
                // Use class instead of style
                correspondenceSection.classList.remove('hidden-section');
            }
        }
        
        // Chamar a função ao mudar o estado do checkbox
        sameAddressCheckbox.addEventListener('change', toggleCorrespondenceSection);
        
        // Executar a função no carregamento da página
        toggleCorrespondenceSection();
        
        // Adicionar listeners para copiar os valores quando os campos de residência mudam
        function copyAddressValues() {
            residenciaFields.forEach((fieldId, index) => {
                const field = document.getElementById(fieldId);
                
                if (field) {
                    field.addEventListener('input', function() {
                        if (sameAddressCheckbox.checked) {
                            const corrField = document.getElementById(correspondenciaFields[index]);
                            if (corrField) {
                                corrField.value = this.value;
                            }
                        }
                    });
                    
                    // Para o caso do select de estado
                    if (fieldId === 'input_114') {
                        field.addEventListener('change', function() {
                            if (sameAddressCheckbox.checked) {
                                document.getElementById(correspondenciaFields[index]).value = this.value;
                            }
                        });
                    }
                }
            });
        }
        
        // Chamar a função após o DOM ser carregado
        copyAddressValues();
    }
}

/**
 * Configura a lógica para mostrar/ocultar campos do cônjuge com base no estado civil
 */
function setupSpouseFields() {
    const estadoCivilSelect = document.getElementById('input_103');
    
    // Selecionar a seção do cônjuge - começando pelo cabeçalho
    const conjugeSectionHeader = Array.from(document.querySelectorAll('.form-section-header h3.form-section-title')).find(el => 
        el.textContent.trim() === 'Dados do Cônjuge'
    );
    
    if (!estadoCivilSelect || !conjugeSectionHeader) {
        return;
    }
    
    // Função para mostrar/ocultar campos do cônjuge
    function toggleConjugeFields() {
        const estadoCivil = estadoCivilSelect.value;
        const requiresConjuge = estadoCivil === 'Casado(a)' || estadoCivil === 'União Estável';
        
        // Selecionar todos os campos do cônjuge diretamente pelo ID
        const conjugeInputs = [
            'input_225', // nome completo
            'input_226', // sexo
            'input_227', // estado civil
            'input_228', // cpf
            'input_229', // nacionalidade
            'input_230', // naturalidade
            'input_231', // data nascimento
            'input_232', // tipo documento
            'input_233', // numero documento
            'input_234', // data expedição
            'input_235', // órgão emissor
            'input_236', // nome da mãe
            'input_237'  // nome do pai
        ];
        
        // Primeiro, encontrar o título da seção de Cônjuge
        const headerContainer = conjugeSectionHeader.closest('.form-section-header');
        
        // Mostrar/ocultar o cabeçalho da seção usando classes
        if (headerContainer) {
            if (requiresConjuge) {
                headerContainer.classList.remove('hidden-section');
            } else {
                headerContainer.classList.add('hidden-section');
            }
        }
        
        // Agora, para cada campo do cônjuge
        conjugeInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                // Encontrar a linha do formulário que contém o campo
                const formRow = input.closest('.form-row');
                if (formRow) {
                    // Mostrar ou ocultar a linha inteira usando classes
                    if (requiresConjuge) {
                        formRow.classList.remove('hidden-section');
                        formRow.style.display = 'flex'; // Necessário para o layout
                    } else {
                        formRow.classList.add('hidden-section');
                        formRow.style.display = 'none'; // Necessário para o layout
                    }
                    
                    // Se não é para mostrar, limpar o valor
                    if (!requiresConjuge) {
                        input.value = '';
                    }
                    
                    // Gerenciar obrigatoriedade - nome do pai é opcional
                    const isOptional = (inputId === 'input_237');
                    input.required = requiresConjuge && !isOptional;
                    
                    // Atualizar o label
                    const label = formRow.querySelector(`label[for="${inputId}"]`);
                    if (label) {
                        if (requiresConjuge && !isOptional && !label.classList.contains('required')) {
                            label.classList.add('required');
                        } else if (!requiresConjuge || isOptional) {
                            label.classList.remove('required');
                        }
                    }
                }
            }
        });
    }
    
    // Executar inicialmente para configurar o estado correto
    toggleConjugeFields();
    
    // Adicionar listener para quando o estado civil mudar
    estadoCivilSelect.addEventListener('change', toggleConjugeFields);
}

/**
 * Configura a busca de endereço pela API de localidades do IBGE
 */
function setupAddressSearch() {
    // Implementação opcional da API do IBGE para busca de municípios
    const naturalidadeInput = document.getElementById('input_97');
    if (naturalidadeInput) {
        // Criar elemento de sugestões
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'autocomplete-suggestions';
        suggestionsContainer.classList.add('hidden-section');
        naturalidadeInput.parentNode.appendChild(suggestionsContainer);
        
        let estados = [];
        let municipios = {};
        let selectedIndex = -1;
        
        // Função para buscar UFs
        function buscarUFs() {
            fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
                .then(response => response.json())
                .then(data => {
                    estados = data;
                })
                .catch(error => console.error('Erro ao carregar estados:', error));
        }
        
        // Função para buscar municípios de um estado
        function buscarMunicipios(uf) {
            if (municipios[uf]) {
                return Promise.resolve(municipios[uf]);
            }
            
            return fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
                .then(response => response.json())
                .then(data => {
                    municipios[uf] = data;
                    return data;
                });
        }
        
        // Evento de input para mostrar sugestões
        naturalidadeInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            
            if (query.length < 3) {
                suggestionsContainer.classList.add('hidden-section');
                selectedIndex = -1;
                return;
            }
            
            // Buscar correspondências nos estados e municípios
            let matches = [];
            
            // Verificar correspondências nos estados
            estados.forEach(estado => {
                if (estado.nome.toLowerCase().includes(query)) {
                    matches.push({
                        id: estado.id,
                        text: estado.nome + ' (Estado)',
                        type: 'estado'
                    });
                }
            });
            
            // Buscar em municípios já carregados
            Object.values(municipios).forEach(municipioList => {
                municipioList.forEach(municipio => {
                    if (municipio.nome.toLowerCase().includes(query)) {
                        const estado = estados.find(e => e.id === municipio.microrregiao.mesorregiao.UF.id);
                        matches.push({
                            id: municipio.id,
                            text: municipio.nome + ', ' + estado.sigla,
                            type: 'municipio'
                        });
                    }
                });
            });
            
            // Limitar número de resultados
            matches = matches.slice(0, 10);
            
            if (matches.length > 0) {
                suggestionsContainer.innerHTML = '';
                
                matches.forEach((match, index) => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = match.text;
                    item.dataset.id = match.id;
                    item.dataset.type = match.type;
                    
                    item.addEventListener('click', function() {
                        naturalidadeInput.value = this.textContent;
                        suggestionsContainer.classList.add('hidden-section');
                        selectedIndex = -1;
                    });
                    
                    suggestionsContainer.appendChild(item);
                });
                
                suggestionsContainer.classList.remove('hidden-section');
            } else {
                suggestionsContainer.classList.add('hidden-section');
            }
            
            selectedIndex = -1;
        });
        
        // Navegação por teclado nas sugestões
        naturalidadeInput.addEventListener('keydown', function(e) {
            const items = suggestionsContainer.querySelectorAll('.autocomplete-item');
            
            if (suggestionsContainer.classList.contains('hidden-section')) {
                return;
            }
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
            } else if (e.key === 'Enter' && selectedIndex !== -1) {
                e.preventDefault();
                const selectedItem = items[selectedIndex];
                naturalidadeInput.value = selectedItem.textContent;
                suggestionsContainer.classList.add('hidden-section');
                selectedIndex = -1;
            } else if (e.key === 'Escape') {
                suggestionsContainer.classList.add('hidden-section');
                selectedIndex = -1;
            }
            
            function updateSelection() {
                items.forEach((item, i) => {
                    if (i === selectedIndex) {
                        item.classList.add('selected');
                    } else {
                        item.classList.remove('selected');
                    }
                });
            }
        });
        
        // Fechar sugestões ao clicar fora
        document.addEventListener('click', function(e) {
            if (e.target !== naturalidadeInput && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.add('hidden-section');
                selectedIndex = -1;
            }
        });
        
        // Pré-carregar os dados de UFs
        setTimeout(() => {
            buscarUFs();
        }, 1000);
    }
}

/**
 * Inicializa os manipuladores de endereço
 */
function initAddressHandlers() {
    setupAddressCopy();
    setupSpouseFields();
    setupAddressSearch();
}

// Exportar as funções para uso global
window.AddressHandler = {
    setupAddressCopy,
    setupSpouseFields,
    setupAddressSearch,
    initAddressHandlers
}; 