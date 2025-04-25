document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const tabs = document.querySelectorAll('.tab');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('perseveraForm');
    const successMessage = document.querySelector('.success-message');

    // Índice da aba atual
    let currentTab = 0;

    // Inicializar o formulário
    function initForm() {
        showTab(currentTab);
        prevBtn.style.display = 'none';
        
        // Configurar handlers de eventos
        prevBtn.addEventListener('click', goToPrevTab);
        nextBtn.addEventListener('click', goToNextTab);
        form.addEventListener('submit', submitForm);
        
        // Adicionar event listeners para os botões de abas
        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                goToTab(index);
            });
        });
    }

    // Mostrar a aba específica
    function showTab(index) {
        // Esconder todas as abas
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Mostrar a aba atual
        tabs[index].classList.add('active');
        
        // Atualizar botões de navegação
        updateNavButtons();
        
        // Atualizar classes dos botões de aba
        updateTabButtons();
    }

    // Atualizar os botões de navegação (anterior/próximo/enviar)
    function updateNavButtons() {
        prevBtn.style.display = currentTab === 0 ? 'none' : 'block';
        
        if (currentTab === tabs.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    // Atualizar a aparência dos botões de abas
    function updateTabButtons() {
        tabButtons.forEach((button, index) => {
            // Remover todas as classes
            button.classList.remove('active', 'completed');
            
            // Aplicar classe para aba atual
            if (index === currentTab) {
                button.classList.add('active');
            }
            
            // Marcar abas anteriores como concluídas
            if (index < currentTab) {
                button.classList.add('completed');
            }
        });
    }

    // Ir para a próxima aba
    function goToNextTab() {
        // Validar a aba atual antes de avançar
        if (!validateTab(currentTab)) return;
        
        if (currentTab < tabs.length - 1) {
            currentTab++;
            showTab(currentTab);
        }
    }

    // Ir para a aba anterior
    function goToPrevTab() {
        if (currentTab > 0) {
            currentTab--;
            showTab(currentTab);
        }
    }

    // Ir para uma aba específica
    function goToTab(index) {
        // Só permite ir para uma aba se todas as anteriores estiverem válidas
        for (let i = 0; i < index; i++) {
            if (!validateTab(i, false)) {
                // Mostrar a primeira aba inválida
                currentTab = i;
                showTab(i);
                return;
            }
        }
        
        currentTab = index;
        showTab(currentTab);
    }

    // Validar campos da aba atual
    function validateTab(tabIndex, showErrors = true) {
        const currentTabElement = tabs[tabIndex];
        const inputs = currentTabElement.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            // Resetar mensagens de erro
            if (showErrors) {
                input.classList.remove('input-error');
                const errorEl = input.nextElementSibling;
                if (errorEl && errorEl.classList.contains('error-text')) {
                    errorEl.style.display = 'none';
                }
            }
            
            // Validar campos obrigatórios
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                if (showErrors) {
                    input.classList.add('input-error');
                    const errorEl = input.nextElementSibling;
                    if (errorEl && errorEl.classList.contains('error-text')) {
                        errorEl.style.display = 'block';
                    }
                }
            }
            
            // Validar e-mail
            if (input.type === 'email' && input.value && !validateEmail(input.value)) {
                isValid = false;
                if (showErrors) {
                    input.classList.add('input-error');
                    const errorEl = input.nextElementSibling;
                    if (errorEl && errorEl.classList.contains('error-text')) {
                        errorEl.style.display = 'block';
                    }
                }
            }
        });
        
        return isValid;
    }

    // Validar formato de e-mail
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Enviar o formulário
    function submitForm(e) {
        e.preventDefault();
        
        // Validar todas as abas antes de enviar
        for (let i = 0; i < tabs.length; i++) {
            if (!validateTab(i)) {
                currentTab = i;
                showTab(i);
                return;
            }
        }
        
        // Coletar todos os dados do formulário
        const formData = new FormData(form);
        
        // Aqui você pode implementar o envio dos dados para o servidor
        // Por exemplo, usando fetch API
        
        // Simular envio bem-sucedido
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Opcional: redirecionar após alguns segundos
        // setTimeout(() => {
        //     window.location.href = 'obrigado.html';
        // }, 3000);
    }

    // Inicializar o formulário quando a página carregar
    initForm();
}); 