/**
 * investment-handler.js
 * ---------------------
 * Funções para manipulação de campos de investimento
 */

/**
 * Calcula o perfil de risco baseado nas respostas do questionário
 * @param {Array} answers - Array com as respostas do questionário
 * @returns {Object} - Perfil de risco e pontuação
 */
function calculateRiskProfile(answers) {
    // Pesos das perguntas
    const weights = [1, 2, 3, 2, 3, 2, 3, 2, 2, 3];
    
    // Calcular pontuação total
    let totalScore = 0;
    for (let i = 0; i < answers.length; i++) {
        totalScore += answers[i] * weights[i];
    }
    
    // Determinar perfil baseado na pontuação
    let profile = '';
    if (totalScore <= 12) {
        profile = 'Conservador';
    } else if (totalScore <= 29) {
        profile = 'Moderado';
    } else if (totalScore <= 49) {
        profile = 'Balanceado';
    } else if (totalScore <= 69) {
        profile = 'Arrojado';
    } else {
        profile = 'Agressivo';
    }
    
    return {
        profile,
        score: totalScore
    };
}

/**
 * Configura a exibição das carteiras recomendadas com base no perfil
 * @param {string} profile - Perfil de investimento
 */
function showRecommendedPortfolios(profile) {
    // Ocultar todas as carteiras
    const portfolios = document.querySelectorAll('.portfolio-container');
    portfolios.forEach(portfolio => {
        portfolio.style.display = 'none';
    });
    
    // Mostrar apenas a carteira correspondente ao perfil
    const targetPortfolio = document.querySelector(`.portfolio-${profile.toLowerCase()}`);
    if (targetPortfolio) {
        targetPortfolio.style.display = 'block';
    }
    
    // Atualizar campo de perfil (se existir)
    const profileInput = document.querySelector('#input_risk_profile');
    if (profileInput) {
        profileInput.value = profile;
    }
}

/**
 * Processa o questionário de perfil de investidor
 */
function setupRiskProfileQuestionnaire() {
    const form = document.querySelector('#risk_profile_form');
    if (!form) return;
    
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Coletar respostas
            const answers = [];
            for (let i = 1; i <= 10; i++) {
                const questionInputs = form.querySelectorAll(`input[name="question_${i}"]:checked`);
                if (questionInputs.length > 0) {
                    answers.push(parseInt(questionInputs[0].value));
                } else {
                    // Se alguma pergunta não foi respondida
                    alert('Por favor, responda todas as perguntas do questionário.');
                    return;
                }
            }
            
            // Calcular perfil
            const result = calculateRiskProfile(answers);
            
            // Exibir resultado
            const resultContainer = document.querySelector('#risk_profile_result');
            if (resultContainer) {
                resultContainer.innerHTML = `
                    <div class="result-card">
                        <h3>Seu perfil de investidor é:</h3>
                        <h2 class="profile-name">${result.profile}</h2>
                        <p class="profile-score">Pontuação: ${result.score}</p>
                    </div>
                `;
                resultContainer.style.display = 'block';
                
                // Mostrar carteiras recomendadas
                showRecommendedPortfolios(result.profile);
                
                // Rolar página até o resultado
                resultContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/**
 * Configura os sliders de alocação de investimento
 */
function setupAllocationSliders() {
    const sliders = document.querySelectorAll('.allocation-slider');
    if (sliders.length === 0) return;
    
    sliders.forEach(slider => {
        const valueDisplay = document.createElement('span');
        valueDisplay.classList.add('slider-value');
        valueDisplay.textContent = `${slider.value}%`;
        slider.parentNode.appendChild(valueDisplay);
        
        slider.addEventListener('input', function() {
            // Atualizar o valor exibido
            valueDisplay.textContent = `${this.value}%`;
            
            // Recalcular para garantir que a soma seja 100%
            const allSliders = document.querySelectorAll('.allocation-slider');
            let totalAllocation = 0;
            
            allSliders.forEach(s => {
                if (s !== this) {
                    totalAllocation += parseInt(s.value);
                }
            });
            
            // Verificar se excede 100%
            if (parseInt(this.value) + totalAllocation > 100) {
                this.value = 100 - totalAllocation;
                valueDisplay.textContent = `${this.value}%`;
            }
            
            // Atualizar o gráfico de alocação, se existir
            updateAllocationChart();
        });
    });
}

/**
 * Atualiza o gráfico de alocação com base nos valores dos sliders
 */
function updateAllocationChart() {
    const chartContainer = document.querySelector('#allocation_chart');
    if (!chartContainer) return;
    
    const sliders = document.querySelectorAll('.allocation-slider');
    const labels = [];
    const data = [];
    const backgroundColors = [
        '#4CAF50', // Verde
        '#2196F3', // Azul
        '#FFC107', // Amarelo
        '#9C27B0', // Roxo
        '#FF5722', // Laranja
        '#795548'  // Marrom
    ];
    
    sliders.forEach((slider, index) => {
        const label = slider.getAttribute('data-asset-class') || `Classe ${index + 1}`;
        labels.push(label);
        data.push(parseInt(slider.value));
    });
    
    // Usar Chart.js se estiver disponível
    if (window.Chart) {
        // Verificar se já existe um gráfico
        if (window.allocationChart) {
            window.allocationChart.data.labels = labels;
            window.allocationChart.data.datasets[0].data = data;
            window.allocationChart.update();
        } else {
            const ctx = chartContainer.getContext('2d');
            window.allocationChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors.slice(0, data.length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
    } else {
        // Fallback simples se Chart.js não estiver disponível
        let htmlContent = '<div class="allocation-bars">';
        
        data.forEach((value, index) => {
            const label = labels[index];
            const color = backgroundColors[index % backgroundColors.length];
            htmlContent += `
                <div class="allocation-bar-container">
                    <span class="allocation-label">${label}: ${value}%</span>
                    <div class="allocation-bar" style="width: ${value}%; background-color: ${color};"></div>
                </div>
            `;
        });
        
        htmlContent += '</div>';
        chartContainer.innerHTML = htmlContent;
    }
}

/**
 * Configura o seletor de objetivos financeiros
 */
function setupFinancialGoals() {
    const goalSelect = document.querySelector('#financial_goal_select');
    if (!goalSelect) return;
    
    const goalDetails = document.querySelector('#financial_goal_details');
    if (!goalDetails) return;
    
    goalSelect.addEventListener('change', function() {
        const selectedGoal = this.value;
        
        // Ocultar todos os detalhes de objetivos
        const allDetails = goalDetails.querySelectorAll('.goal-detail');
        allDetails.forEach(detail => {
            detail.style.display = 'none';
        });
        
        // Mostrar apenas o detalhe do objetivo selecionado
        const selectedDetail = goalDetails.querySelector(`.goal-detail[data-goal="${selectedGoal}"]`);
        if (selectedDetail) {
            selectedDetail.style.display = 'block';
        }
    });
    
    // Trigger para o valor inicial
    if (goalSelect.value) {
        const event = new Event('change');
        goalSelect.dispatchEvent(event);
    }
}

/**
 * Calcula projeções de investimento com juros compostos
 * @param {number} initialAmount - Valor inicial
 * @param {number} monthlyAmount - Aporte mensal
 * @param {number} interestRate - Taxa de juros anual
 * @param {number} years - Período em anos
 * @returns {Object} - Resultado da projeção
 */
function calculateInvestmentProjection(initialAmount, monthlyAmount, interestRate, years) {
    const monthlyRate = (interestRate / 100) / 12;
    const totalMonths = years * 12;
    
    let balance = initialAmount;
    let totalInvested = initialAmount;
    const projectionData = [];
    
    for (let month = 1; month <= totalMonths; month++) {
        balance = balance * (1 + monthlyRate) + monthlyAmount;
        totalInvested += monthlyAmount;
        
        if (month % 12 === 0) { // Guardar dados anuais
            const year = month / 12;
            projectionData.push({
                year,
                balance: Math.round(balance * 100) / 100,
                totalInvested: Math.round(totalInvested * 100) / 100,
                earnings: Math.round((balance - totalInvested) * 100) / 100
            });
        }
    }
    
    return {
        finalBalance: Math.round(balance * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalEarnings: Math.round((balance - totalInvested) * 100) / 100,
        projectionData
    };
}

/**
 * Configura o simulador de investimentos
 */
function setupInvestmentSimulator() {
    const simulatorForm = document.querySelector('#investment_simulator_form');
    if (!simulatorForm) return;
    
    const resultContainer = document.querySelector('#investment_simulator_result');
    if (!resultContainer) return;
    
    simulatorForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const initialAmount = parseFloat(document.querySelector('#initial_amount').value) || 0;
        const monthlyAmount = parseFloat(document.querySelector('#monthly_amount').value) || 0;
        const interestRate = parseFloat(document.querySelector('#interest_rate').value) || 0;
        const years = parseInt(document.querySelector('#investment_period').value) || 0;
        
        // Validar entradas
        if (initialAmount < 0 || monthlyAmount < 0 || interestRate <= 0 || years <= 0) {
            alert('Por favor, preencha todos os campos com valores válidos.');
            return;
        }
        
        // Calcular projeção
        const projection = calculateInvestmentProjection(initialAmount, monthlyAmount, interestRate, years);
        
        // Exibir resultados
        resultContainer.innerHTML = `
            <div class="result-card">
                <h3>Resultado da simulação</h3>
                <div class="result-summary">
                    <div class="result-item">
                        <span class="result-label">Valor final:</span>
                        <span class="result-value">R$ ${projection.finalBalance.toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Total investido:</span>
                        <span class="result-value">R$ ${projection.totalInvested.toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Rendimento:</span>
                        <span class="result-value">R$ ${projection.totalEarnings.toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Criar tabela de projeção anual
        let tableHtml = `
            <table class="projection-table">
                <thead>
                    <tr>
                        <th>Ano</th>
                        <th>Saldo</th>
                        <th>Total investido</th>
                        <th>Rendimento</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        projection.projectionData.forEach(data => {
            tableHtml += `
                <tr>
                    <td>${data.year}</td>
                    <td>R$ ${data.balance.toLocaleString('pt-BR')}</td>
                    <td>R$ ${data.totalInvested.toLocaleString('pt-BR')}</td>
                    <td>R$ ${data.earnings.toLocaleString('pt-BR')}</td>
                </tr>
            `;
        });
        
        tableHtml += `
                </tbody>
            </table>
        `;
        
        resultContainer.innerHTML += tableHtml;
        resultContainer.style.display = 'block';
        
        // Criar gráfico de projeção
        if (window.Chart) {
            const chartContainer = document.createElement('div');
            chartContainer.style.height = '300px';
            chartContainer.style.marginTop = '20px';
            resultContainer.appendChild(chartContainer);
            
            const canvas = document.createElement('canvas');
            canvas.id = 'projection_chart';
            chartContainer.appendChild(canvas);
            
            const labels = projection.projectionData.map(data => `Ano ${data.year}`);
            const balanceData = projection.projectionData.map(data => data.balance);
            const investedData = projection.projectionData.map(data => data.totalInvested);
            
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Saldo Total',
                        data: balanceData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true
                    }, {
                        label: 'Total Investido',
                        data: investedData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': R$ ' + 
                                           parseFloat(context.raw).toLocaleString('pt-BR');
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Rolar para os resultados
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    });
}

/**
 * Inicializa todas as funções de investimento
 */
function initInvestmentHandler() {
    setupRiskProfileQuestionnaire();
    setupAllocationSliders();
    setupFinancialGoals();
    setupInvestmentSimulator();
}

// Exportar as funções para uso global
window.InvestmentHandler = {
    calculateRiskProfile,
    showRecommendedPortfolios,
    setupRiskProfileQuestionnaire,
    setupAllocationSliders,
    updateAllocationChart,
    setupFinancialGoals,
    calculateInvestmentProjection,
    setupInvestmentSimulator,
    initInvestmentHandler
}; 