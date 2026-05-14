// ===== STATE MANAGEMENT =====
let state = {
    bankroll: {
        "winamax": 500,
        "betclic": 300,
        "bwin": 200,
        "unibet": 150
    },
    bets: [],
    units: [
        { name: "OL", level: 2, bets: 8, wins: 6 },
        { name: "Boca", level: 1, bets: 5, wins: 3 },
        { name: "Real", level: 3, bets: 12, wins: 9 }
    ],
    charts: {}
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ FENOTTE45 Dashboard Loaded');
    refreshDashboard();
    setInterval(refreshDashboard, 30000);
});

// ===== MAIN RENDER FUNCTION =====
function refreshDashboard() {
    updateStats();
    updateRiskIndicator();
    renderCharts();
    renderUnitsTable();
    renderBookmakers();
    updateFooter();
}

// ===== STATS CALCULATION =====
function calculateStats() {
    const totalCapital = Object.values(state.bankroll).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    const startCapital = 1150;
    
    const profit = totalCapital - startCapital;
    const roi = startCapital > 0 ? (profit / startCapital * 100).toFixed(2) : 0;
    
    let totalBets = 0;
    let totalWins = 0;
    state.units.forEach(unit => {
        totalBets += unit.bets;
        totalWins += unit.wins;
    });
    
    const winrate = totalBets > 0 ? (totalWins / totalBets * 100).toFixed(0) : 0;
    
    return {
        totalCapital: totalCapital.toFixed(2),
        profit: profit.toFixed(2),
        roi: roi,
        winrate: winrate,
        totalBets: totalBets,
        totalWins: totalWins
    };
}

// ===== UPDATE STATS =====
function updateStats() {
    const stats = calculateStats();
    
    document.getElementById('stat-capital').textContent = stats.totalCapital + '€';
    document.getElementById('stat-capital-detail').textContent = `${Object.keys(state.bankroll).length} bookmakers`;
    
    const profitColor = parseFloat(stats.profit) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('stat-profit').textContent = (parseFloat(stats.profit) >= 0 ? '+' : '') + stats.profit + '€';
    document.getElementById('stat-profit').style.color = profitColor;
    
    const pctChange = ((parseFloat(stats.profit) / 1150) * 100).toFixed(1);
    document.getElementById('stat-profit-pct').textContent = `${pctChange}% du capital initial`;
    
    document.getElementById('stat-winrate').textContent = stats.winrate + '%';
    document.getElementById('stat-wins-total').textContent = `${stats.totalWins}/${stats.totalBets} paris`;
    
    document.getElementById('stat-roi').textContent = (parseFloat(stats.roi) >= 0 ? '+' : '') + stats.roi + '%';
    document.getElementById('stat-roi-detail').textContent = `ROI global`;
}

// ===== RISK INDICATOR =====
function updateRiskIndicator() {
    const stats = calculateStats();
    const totalCapital = parseFloat(stats.totalCapital);
    const riskPercentage = (totalCapital / 1150) * 100;
    
    const riskBar = document.getElementById('risk-bar');
    let riskStatus = 'OPTIMAL';
    let riskMessage = 'Bankroll en bonne santé';
    
    if (riskPercentage > 150) {
        riskStatus = 'EXCELLENT';
        riskMessage = 'Performance exceptionnelle! +50% de gains';
    } else if (riskPercentage >= 100) {
        riskStatus = 'OPTIMAL';
        riskMessage = 'Position stable et profitable';
    } else if (riskPercentage >= 80) {
        riskStatus = 'PRUDENT';
        riskMessage = 'Attention: Reduire les risques';
    } else {
        riskStatus = 'CRITIQUE';
        riskMessage = 'DANGER: Bankroll en danger';
    }
    
    riskBar.style.width = Math.min(riskPercentage, 100) + '%';
    document.getElementById('risk-label').textContent = riskStatus;
    document.getElementById('risk-info').textContent = riskMessage;
}

// ===== RENDER CHARTS =====
function renderCharts() {
    destroyAllCharts();
    
    setTimeout(() => {
        renderProfitChart();
        renderBookmakersChart();
        renderUnitsChart();
        renderTypesChart();
    }, 100);
}

// ===== CHART 1: PROFIT EVOLUTION =====
function renderProfitChart() {
    const ctx = document.getElementById('chartProfit')?.getContext('2d');
    if (!ctx) return;
    
    const data = [0, 50, 120, 100, 180, 150, 220, 280];
    const labels = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
    
    state.charts.profit = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Profit Cumulé',
                data: data,
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#22d3ee',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#22d3ee',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => v + '€' }
                }
            }
        }
    });
}

// ===== CHART 2: BOOKMAKERS =====
function renderBookmakersChart() {
    const ctx = document.getElementById('chartBookmakers')?.getContext('2d');
    if (!ctx) return;
    
    const labels = Object.keys(state.bankroll);
    const data = Object.values(state.bankroll);
    const colors = ['#1e40af', '#22c55e', '#eab308', '#06b6d4'];
    
    state.charts.bookmakers = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(15, 23, 42, 1)',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 }, padding: 15 }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + 'EUR' }
                }
            }
        }
    });
}

// ===== CHART 3: UNITS PERFORMANCE =====
function renderUnitsChart() {
    const ctx = document.getElementById('chartUnites')?.getContext('2d');
    if (!ctx) return;
    
    const labels = state.units.map(u => u.name);
    const winrates = state.units.map(u => (u.wins / u.bets * 100).toFixed(0));
    
    const colors = winrates.map(wr => {
        const w = parseFloat(wr);
        if (w >= 55) return '#22c55e';
        if (w >= 45) return '#eab308';
        return '#da0812';
    });
    
    state.charts.units = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Winrate %',
                data: winrates,
                backgroundColor: colors,
                borderRadius: 8,
                hoverBackgroundColor: ['#16a34a', '#ca8a04', '#b91c1c']
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ctx.parsed.x + '%' } }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', callback: v => v + '%' }
                },
                y: { ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// ===== CHART 4: ROI BY TYPE =====
function renderTypesChart() {
    const ctx = document.getElementById('chartTypes')?.getContext('2d');
    if (!ctx) return;
    
    const types = ['1x2', 'Over/Under', 'Combine', 'Boost', 'Live'];
    const rois = [12.5, 8.3, 15.2, 20.1, -5.4];
    
    state.charts.types = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: types,
            datasets: [{
                label: 'ROI %',
                data: rois,
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#22d3ee',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } },
                tooltip: { callbacks: { label: ctx => ctx.parsed.r.toFixed(1) + '%' } }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', callback: v => v + '%' }
                }
            }
        }
    });
}

// ===== DESTROY CHARTS =====
function destroyAllCharts() {
    Object.values(state.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    state.charts = {};
}

// ===== RENDER UNITS TABLE =====
function renderUnitsTable() {
    const tbody = document.getElementById('units-tbody');
    const rows = state.units.map(unit => `
        <tr>
            <td><strong>${unit.name}</strong></td>
            <td>P${unit.level}</td>
            <td>${unit.bets}</td>
            <td>
                <span style="font-weight:bold; color:${
                    (unit.wins/unit.bets*100) >= 55 ? '#22c55e' : 
                    (unit.wins/unit.bets*100) >= 45 ? '#eab308' : 
                    '#da0812'
                }">
                    ${(unit.wins / unit.bets * 100).toFixed(0)}%
                </span>
            </td>
            <td style="color:#22c55e">+${(unit.bets * 25).toFixed(2)}EUR</td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows || '<tr><td colspan="5" style="text-align:center">Aucune unite</td></tr>';
}

// ===== RENDER BOOKMAKERS =====
function renderBookmakers() {
    const grid = document.getElementById('bookmakers-grid');
    const cards = Object.entries(state.bankroll).map(([name, balance]) => `
        <div class="bookmaker-card">
            <div class="bookmaker-name">${name}</div>
            <div class="bookmaker-balance">${parseFloat(balance).toFixed(2)}EUR</div>
            <div class="bookmaker-status">Actif</div>
        </div>
    `).join('');
    
    grid.innerHTML = cards;
}

// ===== UPDATE FOOTER =====
function updateFooter() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('last-update').textContent = `Mise a jour: ${timeString}`;
}

// ===== ACTIONS =====
function loadDemoData() {
    alert('Donnees demo chargees!');
    refreshDashboard();
}

function exportData() {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fenotte45_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Donnees exportees!');
}
