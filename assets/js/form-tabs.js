// Gerenciamento de abas no formulário
document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const formTabs = document.querySelectorAll('.form-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const nextButtons = document.querySelectorAll('.next-tab');
    const prevButtons = document.querySelectorAll('.prev-tab');
    const form = document.getElementById('multi-step-form');
    
    // Navegar entre abas quando clicar nas abas
    formTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remover classe active de todas as abas e conteúdos
            formTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active à aba e conteúdo selecionados
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Botões de próximo
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Encontrar a aba ativa atual
            const activeTab = document.querySelector('.form-tab.active');
            const activeContent = document.querySelector('.tab-content.active');
            
            // Verificar se os campos obrigatórios da aba atual foram preenchidos
            const requiredFields = activeContent.querySelectorAll('input[required], select[required], textarea[required]');
            let allValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('invalid');
                    field.nextElementSibling?.classList.add('show');
                    allValid = false;
                } else {
                    field.classList.remove('invalid');
                    field.nextElementSibling?.classList.remove('show');
                }
                
                // Verificação especial para email
                if (field.type === 'email' && field.value.trim()) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(field.value)) {
                        field.classList.add('invalid');
                        field.nextElementSibling?.classList.add('show');
                        allValid = false;
                    }
                }
            });
            
            if (allValid) {
                // Encontrar a próxima aba
                const nextTabIndex = Array.from(formTabs).indexOf(activeTab) + 1;
                
                if (nextTabIndex < formTabs.length) {
                    // Ir para a próxima aba
                    formTabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    formTabs[nextTabIndex].classList.add('active');
                    const nextTabId = formTabs[nextTabIndex].getAttribute('data-tab');
                    document.getElementById(nextTabId).classList.add('active');
                }
            }
        });
    });
    
    // Botões de anterior
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Encontrar a aba ativa atual
            const activeTab = document.querySelector('.form-tab.active');
            
            // Encontrar a aba anterior
            const prevTabIndex = Array.from(formTabs).indexOf(activeTab) - 1;
            
            if (prevTabIndex >= 0) {
                // Ir para a aba anterior
                formTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                formTabs[prevTabIndex].classList.add('active');
                const prevTabId = formTabs[prevTabIndex].getAttribute('data-tab');
                document.getElementById(prevTabId).classList.add('active');
            }
        });
    });
    
    // Validação dos campos ao perder o foco
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('invalid');
                this.nextElementSibling?.classList.add('show');
            } else {
                this.classList.remove('invalid');
                this.nextElementSibling?.classList.remove('show');
            }
            
            // Verificação especial para email
            if (this.type === 'email' && this.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(this.value)) {
                    this.classList.add('invalid');
                    this.nextElementSibling?.classList.add('show');
                }
            }
        });
    });
    
    // Envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Verificar todos os campos obrigatórios
        const allRequiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let formValid = true;
        
        allRequiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('invalid');
                formValid = false;
            }
            
            // Verificação especial para email
            if (field.type === 'email' && field.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    field.classList.add('invalid');
                    formValid = false;
                }
            }
        });
        
        if (formValid) {
            // Aqui você pode enviar o formulário por AJAX ou fazer outras ações
            alert('Formulário enviado com sucesso!');
            // form.submit(); // Descomente esta linha para enviar o formulário
        } else {
            // Encontrar a primeira aba com campos inválidos
            let foundInvalidTab = false;
            
            tabContents.forEach((content, index) => {
                if (!foundInvalidTab) {
                    const invalidFields = content.querySelectorAll('.invalid');
                    if (invalidFields.length > 0) {
                        // Ativar esta aba
                        formTabs.forEach(t => t.classList.remove('active'));
                        tabContents.forEach(c => c.classList.remove('active'));
                        
                        formTabs[index].classList.add('active');
                        content.classList.add('active');
                        
                        foundInvalidTab = true;
                    }
                }
            });
            
            alert('Por favor, preencha todos os campos obrigatórios antes de enviar.');
        }
    });
}); 