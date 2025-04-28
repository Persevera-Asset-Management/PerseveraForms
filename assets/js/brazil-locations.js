/**
 * brazil-locations.js
 * -----------------
 * Funções para carregamento de estados e cidades brasileiras em formulários
 */

/**
 * Lista de estados brasileiros em formato adequado para select
 * @type {Array<{value: string, text: string}>}
 */
const BRAZILIAN_STATES = [
    { value: 'AC', text: 'Acre' },
    { value: 'AL', text: 'Alagoas' },
    { value: 'AP', text: 'Amapá' },
    { value: 'AM', text: 'Amazonas' },
    { value: 'BA', text: 'Bahia' },
    { value: 'CE', text: 'Ceará' },
    { value: 'DF', text: 'Distrito Federal' },
    { value: 'ES', text: 'Espírito Santo' },
    { value: 'GO', text: 'Goiás' },
    { value: 'MA', text: 'Maranhão' },
    { value: 'MT', text: 'Mato Grosso' },
    { value: 'MS', text: 'Mato Grosso do Sul' },
    { value: 'MG', text: 'Minas Gerais' },
    { value: 'PA', text: 'Pará' },
    { value: 'PB', text: 'Paraíba' },
    { value: 'PR', text: 'Paraná' },
    { value: 'PE', text: 'Pernambuco' },
    { value: 'PI', text: 'Piauí' },
    { value: 'RJ', text: 'Rio de Janeiro' },
    { value: 'RN', text: 'Rio Grande do Norte' },
    { value: 'RS', text: 'Rio Grande do Sul' },
    { value: 'RO', text: 'Rondônia' },
    { value: 'RR', text: 'Roraima' },
    { value: 'SC', text: 'Santa Catarina' },
    { value: 'SP', text: 'São Paulo' },
    { value: 'SE', text: 'Sergipe' },
    { value: 'TO', text: 'Tocantins' }
];

/**
 * API para buscar cidades por estado
 * @param {string} uf - Sigla do estado
 * @returns {Promise<Array>} - Lista de cidades
 */
function fetchCitiesByState(uf) {
    // API IBGE para cidades por estado
    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao buscar cidades do estado');
            }
            return response.json();
        })
        .then(cities => {
            // Ordena por nome
            return cities.sort((a, b) => a.nome.localeCompare(b.nome));
        });
}

/**
 * Preenche um elemento select com os estados brasileiros
 * @param {HTMLSelectElement|string} selectElement - Elemento select ou seu seletor
 * @param {Object} options - Opções adicionais
 * @param {string} options.emptyOption - Texto para opção vazia (padrão: "Selecione um estado")
 * @param {string} options.selectedState - Estado que deve ser pré-selecionado
 */
function populateStateSelect(selectElement, options = {}) {
    // Obtém o elemento select
    const select = typeof selectElement === 'string' 
        ? document.querySelector(selectElement) 
        : selectElement;
    
    if (!select) {
        console.error('Elemento select para estados não encontrado');
        return;
    }
    
    // Limpa opções existentes
    select.innerHTML = '';
    
    // Adiciona opção vazia se necessário
    if (options.emptyOption !== false) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = options.emptyOption || 'Selecione um estado';
        select.appendChild(emptyOption);
    }
    
    // Adiciona os estados
    BRAZILIAN_STATES.forEach(state => {
        const option = document.createElement('option');
        option.value = state.value;
        option.textContent = state.text;
        
        // Seleciona o estado se for o especificado
        if (options.selectedState && options.selectedState === state.value) {
            option.selected = true;
        }
        
        select.appendChild(option);
    });
}

/**
 * Preenche um elemento select com as cidades de um estado
 * @param {string} uf - Sigla do estado
 * @param {HTMLSelectElement|string} selectElement - Elemento select ou seu seletor
 * @param {Object} options - Opções adicionais
 * @param {string} options.emptyOption - Texto para opção vazia (padrão: "Selecione uma cidade")
 * @param {string} options.selectedCity - Cidade que deve ser pré-selecionada
 * @param {Function} options.onLoad - Callback executado após carregar as cidades
 */
function populateCitySelect(uf, selectElement, options = {}) {
    // Obtém o elemento select
    const select = typeof selectElement === 'string' 
        ? document.querySelector(selectElement) 
        : selectElement;
    
    if (!select) {
        console.error('Elemento select para cidades não encontrado');
        return;
    }
    
    // Desabilita o select durante o carregamento
    select.disabled = true;
    
    // Limpa opções existentes
    select.innerHTML = '';
    
    // Adiciona opção de carregamento
    const loadingOption = document.createElement('option');
    loadingOption.value = '';
    loadingOption.textContent = 'Carregando cidades...';
    select.appendChild(loadingOption);
    
    // Se não houver estado selecionado, mantém apenas a opção vazia
    if (!uf) {
        loadingOption.textContent = options.emptyOption || 'Selecione uma cidade';
        select.disabled = false;
        if (options.onLoad) options.onLoad([]);
        return;
    }
    
    // Busca as cidades do estado
    fetchCitiesByState(uf)
        .then(cities => {
            // Limpa o select
            select.innerHTML = '';
            
            // Adiciona opção vazia
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = options.emptyOption || 'Selecione uma cidade';
            select.appendChild(emptyOption);
            
            // Adiciona as cidades
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.nome;
                option.textContent = city.nome;
                
                // Seleciona a cidade se for a especificada
                if (options.selectedCity && options.selectedCity === city.nome) {
                    option.selected = true;
                }
                
                select.appendChild(option);
            });
            
            // Reativa o select
            select.disabled = false;
            
            // Executa callback se existir
            if (options.onLoad) options.onLoad(cities);
        })
        .catch(error => {
            console.error('Erro ao carregar cidades:', error);
            
            // Limpa o select e adiciona apenas a opção vazia
            select.innerHTML = '';
            const errorOption = document.createElement('option');
            errorOption.value = '';
            errorOption.textContent = 'Erro ao carregar cidades';
            select.appendChild(errorOption);
            
            // Reativa o select
            select.disabled = false;
        });
}

/**
 * Inicializa selects dependentes de estado e cidade
 * @param {Object} options - Opções de configuração
 * @param {string|HTMLElement} options.stateSelect - Seletor ou elemento do select de estados
 * @param {string|HTMLElement} options.citySelect - Seletor ou elemento do select de cidades
 * @param {string} options.initialState - Estado inicial a ser selecionado
 * @param {string} options.initialCity - Cidade inicial a ser selecionada
 */
function initLocationSelectors(options = {}) {
    // Valida opções obrigatórias
    if (!options.stateSelect || !options.citySelect) {
        console.error('Selectors para estado e cidade são obrigatórios');
        return;
    }
    
    // Obtém elementos
    const stateSelect = typeof options.stateSelect === 'string' 
        ? document.querySelector(options.stateSelect) 
        : options.stateSelect;
        
    const citySelect = typeof options.citySelect === 'string' 
        ? document.querySelector(options.citySelect) 
        : options.citySelect;
    
    if (!stateSelect || !citySelect) {
        console.error('Elementos select de estado ou cidade não encontrados');
        return;
    }
    
    // Preenche select de estados
    populateStateSelect(stateSelect, {
        selectedState: options.initialState
    });
    
    // Se houver estado inicial, carrega as cidades
    if (options.initialState) {
        populateCitySelect(options.initialState, citySelect, {
            selectedCity: options.initialCity
        });
    }
    
    // Configura evento de alteração do estado
    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        populateCitySelect(selectedState, citySelect);
    });
}

/**
 * Exporta as funções para uso global
 */
window.BrazilLocations = {
    BRAZILIAN_STATES,
    fetchCitiesByState,
    populateStateSelect,
    populateCitySelect,
    initLocationSelectors
}; 