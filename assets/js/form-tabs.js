/**
 * form-tabs.js
 * ------------
 * Gerenciador de abas para os formulários
 * Controla navegação, validação entre abas, e exibição de erros
 */

const FormTabs = {
    /**
     * Inicializa o gerenciador de abas
     */
    init: function() {
        this.setupTabHandlers();
        this.setupNextPrevButtons();
        this.setupFormSubmissionWithValidation();
    },

    /**
     * Configura os handlers de clique nas abas
     */
    setupTabHandlers: function() {
        const tabs = document.querySelectorAll('.form-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const targetTab = this.getAttribute('href');
                
                if (targetTab) {
                    FormTabs.switchTab(targetTab.replace('#', ''));
                }
            });
        });
    },

    /**
     * Configura os botões de próximo e anterior
     */
    setupNextPrevButtons: function() {
        // Botões Próximo
        const nextButtons = document.querySelectorAll('.next-tab');
        nextButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetTab = this.getAttribute('data-next');
                
                if (targetTab) {
                    // Validar campos da aba atual antes de prosseguir
                    const currentTab = this.closest('.tab-pane').id;
                    if (FormTabs.validateTabFields(currentTab)) {
                        FormTabs.switchTab(targetTab);
                        FormTabs.scrollToTop();
                    }
                }
            });
        });
        
        // Botões Anterior
        const prevButtons = document.querySelectorAll('.prev-tab');
        prevButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetTab = this.getAttribute('data-prev');
                
                if (targetTab) {
                    FormTabs.switchTab(targetTab);
                    FormTabs.scrollToTop();
                }
            });
        });
    },

    /**
     * Configura validação ao enviar o formulário
     */
    setupFormSubmissionWithValidation: function() {
        const form = document.getElementById('cadastro-form');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            // Validar todo o formulário
            if (!FormTabs.validateAllTabs()) {
                e.preventDefault();
                
                // Encontrar a primeira aba com erros
                const tabWithErrors = FormTabs.findFirstTabWithErrors();
                if (tabWithErrors) {
                    FormTabs.switchTab(tabWithErrors);
                    FormTabs.scrollToTop();
                }
            }
        });
    },

    /**
     * Valida os campos dentro de uma aba específica
     * @param {string} tabId - ID da aba a ser validada
     * @returns {boolean} - Verdadeiro se todos os campos forem válidos
     */
    validateTabFields: function(tabId) {
        if (typeof FormValidator === 'undefined') return true;
        
        const fieldsInTab = document.querySelectorAll(`#${tabId} [data-validate]`);
        let isValid = true;
        
        fieldsInTab.forEach(field => {
            // Valida apenas campos requeridos ou com valores
            if (field.hasAttribute('required') || field.value.trim() !== '') {
                const fieldValid = FormValidator.validateField(field);
                isValid = fieldValid && isValid;
            }
        });
        
        // Validação especial para o email, que é um caso frequente de erro
        const emailField = document.querySelector(`#${tabId} [data-validate-email]`);
        if (emailField && emailField.value.trim() !== '') {
            const emailValid = FormValidator.Validators.email(emailField.value);
            if (!emailValid) {
                emailField.classList.add('is-invalid');
                let errorMsg = emailField.parentNode.querySelector('.invalid-feedback');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'invalid-feedback';
                    errorMsg.textContent = emailField.getAttribute('data-error-email') || 'Email inválido';
                    emailField.parentNode.appendChild(errorMsg);
                }
                isValid = false;
            }
        }
        
        return isValid;
    },

    /**
     * Valida todas as abas do formulário
     * @returns {boolean} - Verdadeiro se todas as abas forem válidas
     */
    validateAllTabs: function() {
        const tabs = ['tab-1', 'tab-2', 'tab-3', 'tab-4'];
        let isValid = true;
        
        tabs.forEach(tabId => {
            const tabValid = this.validateTabFields(tabId);
            isValid = tabValid && isValid;
        });
        
        return isValid;
    },

    /**
     * Encontra a primeira aba com campos inválidos
     * @returns {string|null} - ID da primeira aba com erros ou null se não houver erros
     */
    findFirstTabWithErrors: function() {
        const tabs = ['tab-1', 'tab-2', 'tab-3', 'tab-4'];
        
        for (const tabId of tabs) {
            const fieldsWithErrors = document.querySelectorAll(`#${tabId} .is-invalid`);
            if (fieldsWithErrors.length > 0) {
                return tabId;
            }
        }
        
        return null;
    },

    /**
     * Alterna para a aba especificada
     * @param {string} tabId - ID da aba para exibir
     */
    switchTab: function(tabId) {
        // Oculta todas as abas
        const allTabs = document.querySelectorAll('.tab-pane');
        allTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.classList.remove('show');
        });
        
        // Exibe a aba selecionada
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.classList.add('show');
        }
        
        // Atualiza as classes nos botões das abas
        const allTabButtons = document.querySelectorAll('.form-tab');
        allTabButtons.forEach(button => {
            button.classList.remove('active');
            
            // Verifica se o href do botão corresponde à aba selecionada
            if (button.getAttribute('href') === `#${tabId}`) {
                button.classList.add('active');
            }
        });
    },

    /**
     * Avança para a próxima aba
     * @param {string} currentTabId - ID da aba atual
     * @returns {boolean} - Verdadeiro se conseguiu avançar
     */
    nextTab: function(currentTabId) {
        // Valida campos da aba atual antes de avançar
        if (!this.validateTabFields(currentTabId)) {
            return false;
        }
        
        const tabNumber = parseInt(currentTabId.replace('tab-', ''));
        const nextTabId = `tab-${tabNumber + 1}`;
        const nextTab = document.getElementById(nextTabId);
        
        if (nextTab) {
            this.switchTab(nextTabId);
            this.scrollToTop();
            return true;
        }
        
        return false;
    },

    /**
     * Volta para a aba anterior
     * @param {string} currentTabId - ID da aba atual
     * @returns {boolean} - Verdadeiro se conseguiu voltar
     */
    prevTab: function(currentTabId) {
        const tabNumber = parseInt(currentTabId.replace('tab-', ''));
        
        if (tabNumber <= 1) {
            return false;
        }
        
        const prevTabId = `tab-${tabNumber - 1}`;
        this.switchTab(prevTabId);
        this.scrollToTop();
        return true;
    },

    /**
     * Rola a página para o topo (útil para mobile)
     */
    scrollToTop: function() {
        // Apenas rola suavemente para o topo em dispositivos móveis
        if (window.innerWidth <= 768) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
};

// Inicializa as abas quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    FormTabs.init();
});

// Exporta o FormTabs para uso global
window.FormTabs = FormTabs; 