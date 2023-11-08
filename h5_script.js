const my_canvas = document.getElementById('chart');
const my_ctx = my_canvas.getContext('2d');

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${(i * 360) / count}, 100%, 50%)`);
    }
    return colors;
}

// n = # of subintervals --> # of attacks
// the probability is p = t/n
function simulateScores(n, t) {
    let score = 0;
    const scores = [];
    const p = t/n;
    for (let i = 0; i < n; i++) {
        // returns a random number in [0; 1)
        const random_value = Math.random();
        if (random_value < p) {
            score = score - 1;
        }
        else {
            score = score + 1;
        }
        scores.push(score);
    }
    return scores;
}

function drawChart(ctx, canvas, m, t, n) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xOffset = 50;
    const yOffset = canvas.height / 2;
    const xScale = (canvas.width - xOffset) / n;
    const yScale = yOffset / n;

    const colors = generateColors(m);

    // Draw the axis
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(xOffset, 0);
    ctx.lineTo(xOffset, canvas.height);
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(canvas.width, yOffset);
    ctx.stroke();

    // Aggiungi una griglia orizzontale grigio chiaro
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 0.5;

    for (let i = -n; i <= n; i += 2) {
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset - i * yScale);
        ctx.lineTo(canvas.width, yOffset - i * yScale);
        ctx.stroke();
    }

    // Label the Y axis
    ctx.textAlign = "right";
    ctx.fillStyle = "black";
    for (let i = -n; i <= n; i += 2) {
        if (i === n) {
            ctx.textBaseline = "top";  // Adjust for max value
        } else if (i === -N) {
            ctx.textBaseline = "bottom";   // Adjust for min value
        } else {
            ctx.textBaseline = "middle";
        }
        ctx.fillText(i, xOffset - 10, yOffset - i * yScale);
    }
    
    // Label the X axis
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    for (let i = 1; i <= n; i++) {
        let horizontalAdjustment = 0;
        if (i === n) {
            horizontalAdjustment = -15; // Adjust left for max value; change the value as needed
        }
        ctx.fillText(i, xOffset + i * xScale + horizontalAdjustment, yOffset + 10);
    }

    // ciclo che disegna le linee del grafico
    // Simulare i punteggi per tutti i sistemi M e tracciarli con colori distinti
    for (let system = 0; system < m; system++) {
        const scores = simulateScores(n, t);
        const systemColor = colors[system];

        // Disegna la linea
        ctx.strokeStyle = systemColor;
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset);
        
        for (let attack = 0; attack < n; attack++) {
            ctx.lineTo(xOffset + (attack + 1) * xScale, yOffset - scores[attack] * yScale);
        }
        ctx.stroke();

        // Disegna i pallini
        for (let attack = 0; attack < n; attack++) {
            const radius = 3;
            ctx.fillStyle = systemColor;
            ctx.beginPath();
            ctx.arc(xOffset + (attack + 1) * xScale, yOffset - scores[attack] * yScale, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function updateChart(ctx, canvas) {
    const M = parseInt(document.getElementById('M').value);
    const T = parseInt(document.getElementById('T').value);
    const N = parseFloat(document.getElementById('N').value);

    drawChart(ctx, canvas, M, T, N);
}

function update() {
    updateChart(my_ctx, my_canvas);
}

// Initial drawing of the chart
window.onload = function() {
    updateChart(my_ctx, my_canvas);
};