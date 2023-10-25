const canvas1a = document.getElementById('chart1a');
const ctx1a = canvas1a.getContext('2d');

const canvas1b = document.getElementById('chart1b');
const ctx1b = canvas1b.getContext('2d');

const canvas1c = document.getElementById('chart1c');
const ctx1c = canvas1c.getContext('2d');

const canvas1d = document.getElementById('chart1d');
const ctx1d = canvas1d.getContext('2d');

function validateInputs(M, N, p) {
    if (p < 0 || p > 1) {
        alert('The penetration probability (p) should be in the range [0, 1].');
        return false;
    }

    if (M <= 0) {
        alert('The number of systems (M) should be a positive value.');
        return false;
    }

    if (N <= 0) {
        alert('The number of attacks (N) should be a positive value.');
        return false;
    }

    return true;
}


function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${(i * 360) / count}, 100%, 50%)`);
    }
    return colors;
}

function countScoreIntervals(scores) {
    const intervals = {};
    for (let score of scores) {
        const intervalBase = Math.floor(score / 2) * 2;
        const intervalKey = `${intervalBase},${intervalBase + 2}`; // Use template literals
        intervals[intervalKey] = (intervals[intervalKey] || 0) + 1;
    }
    return intervals;
}

// use a list containing M lists each having N values 
//function simulateScores(M, N, p);

// Simulate the score for a system based on given N and p
function simulateScore(N, p, type="1a") {
    let score = 0;
    const scores = [];
    for (let i = 0; i < N; i++) {
        const random_value = Math.random();
        switch (type) {
            case "1a":
                if (random_value < p) {
                    score = score - 1;
                }
                else {
                    score = score + 1;
                }
                break;
            case "1b":
                if (random_value < p) {
                    score = score + 0;
                }
                else {
                    score = score + 1;
                }
                break;
            case "1c":
                if (random_value < p) {
                    score = score + 0;
                }
                else {
                    score = score + 1;
                }
                score = score / (i+1);
                break;
            case "1d":
                if (random_value < p) {
                    score = score + 0;
                }
                else {
                    score = score + 1;
                }
                score = score / Math.sqrt(i + 1);
                break;
        }
        scores.push(score);
    }
    return scores;
}

// Draw the chart based on given M, N, and p
function drawChart1a(M, N, p, ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xOffset = 50;
    const yOffset = canvas.height / 2;
    const xScale = (canvas.width - xOffset) / N;
    const yScale = yOffset / N;

    const colors = generateColors(M);

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

    for (let i = -N; i <= N; i += 2) {
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset - i * yScale);
        ctx.lineTo(canvas.width, yOffset - i * yScale);
        ctx.stroke();
    }

    // Label the Y axis
    ctx.textAlign = "right";
    ctx.fillStyle = "black";
    for (let i = -N; i <= N; i += 2) {
        if (i === N) {
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
    for (let i = 1; i <= N; i++) {
        let horizontalAdjustment = 0;
        if (i === N) {
            horizontalAdjustment = -15; // Adjust left for max value; change the value as needed
        }
        ctx.fillText(i, xOffset + i * xScale + horizontalAdjustment, yOffset + 10);
    }
    
    // ciclo che disegna le linee del grafico
    // Simulare i punteggi per tutti i sistemi M e tracciarli con colori distinti
    for (let system = 0; system < M; system++) {
        const scores = simulateScore(N, p, "1a");
        const systemColor = colors[system];

        // Disegna la linea
        ctx.strokeStyle = systemColor;
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset);
        
        for (let attack = 0; attack < N; attack++) {
            ctx.lineTo(xOffset + (attack + 1) * xScale, yOffset - scores[attack] * yScale);
        }
        ctx.stroke();

        // Disegna i pallini
        for (let attack = 0; attack < N; attack++) {
            const radius = 3;
            ctx.fillStyle = systemColor;
            ctx.beginPath();
            ctx.arc(xOffset + (attack + 1) * xScale, yOffset - scores[attack] * yScale, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Count the final scores for the histogram
    const allScores = [];
    const endScores = allScores.map(scores => scores[N-1]);
    const intervals = countScoreIntervals(endScores);

    // Draw the histogram bars for each interval for the final scores
    const maxBarWidth = canvas.width - (xOffset + N * xScale);
    for (let intervalKey in intervals) {
        const [start, end] = intervalKey.split(',').map(Number);
        const midpoint = (start + end) / 2;
        const count = intervals[intervalKey];

        const barLength = (count / M) * maxBarWidth; 
        const barStartY = yOffset - midpoint * yScale;
        const barStartX = xOffset + N * xScale;  // Start at the last abscissa

        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(barStartX, barStartY, barLength, yScale);
    }

}

function drawChart1b(M, N, p, ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xOffset = 50;
    const yOffset = canvas.height / 2;
    const xScale = (canvas.width - xOffset) / N;
    const yScale = yOffset / N;

    const colors = generateColors(M);

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

    for (let i = -N; i <= N; i += 2) {
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset - i * yScale);
        ctx.lineTo(canvas.width, yOffset - i * yScale);
        ctx.stroke();
    }

    // Label the Y axis
    ctx.textAlign = "right";
    ctx.fillStyle = "black";
    for (let i = -N; i <= N; i += 2) {
        if (i === N) {
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
    for (let i = 1; i <= N; i++) {
        let horizontalAdjustment = 0;
        if (i === N) {
            horizontalAdjustment = -15; // Adjust left for max value; change the value as needed
        }
        ctx.fillText(i, xOffset + i * xScale + horizontalAdjustment, yOffset + 10);
    }
    
    // ciclo che disegna le linee del grafico
    // Simulare i punteggi per tutti i sistemi M e tracciarli con colori distinti
    for (let system = 0; system < M; system++) {
        const scores = simulateScore(N, p, "1b");
        const systemColor = colors[system];

        // Disegna la linea
        ctx.strokeStyle = systemColor;
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset);

        let currentY = yOffset;
        
        for (let attack = 0; attack < N; attack++) {
            // if score == 1 (successful attack) then we add +1
            if (scores[attack] == 1) {
                currentY = currentY - scores[attack] * yScale;
                ctx.lineTo(xOffset + (attack + 1) * xScale, currentY);
                // Add the circle for each point
                ctx.arc(xOffset + (attack + 1) * xScale, currentY, 3, 0, 2 * Math.PI);
            } else {
                // if score == -1 (unsuccessful attack) then we add 0 (y coordinate is not updated)
                ctx.lineTo(xOffset + (attack + 1) * xScale, currentY);
            }
        }
        ctx.stroke();

    }
}

function drawChart1cd(M, N, p, type, ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xOffset = 50;
    const yOffset = canvas.height / 2;
    const xScale = (canvas.width - xOffset) / N;
    const yScale = yOffset / N;

    const colors = generateColors(M);

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

    for (let i = -N; i <= N; i += 2) {
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset - i * yScale);
        ctx.lineTo(canvas.width, yOffset - i * yScale);
        ctx.stroke();
    }

    // Label the Y axis
    ctx.textAlign = "right";
    ctx.fillStyle = "black";
    for (let i = -N; i <= N; i += 2) {
        if (i === N) {
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
    for (let i = 1; i <= N; i++) {
        let horizontalAdjustment = 0;
        if (i === N) {
            horizontalAdjustment = -15; // Adjust left for max value; change the value as needed
        }
        ctx.fillText(i, xOffset + i * xScale + horizontalAdjustment, yOffset + 10);
    }
    
    // Simulate scores for all M systems and plot them
    for (let system = 0; system < M; system++) {
        const scores = simulateScore(N, p, type);
        ctx.strokeStyle = colors[system];
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset);

        for (let attack = 0; attack < N; attack++) {
            ctx.lineTo(xOffset + (attack + 1) * xScale, yOffset - scores[attack] * yScale);

            // Save the current context state
            ctx.save();
            // Drawing a circle for each point
            ctx.arc(xOffset + (attack + 1) * xScale, yOffset - scores[attack] * yScale, 1, 0, 2 * Math.PI);
            ctx.fillStyle = colors[system];
            ctx.fill();
            // Restore the context state to continue the line
            ctx.restore();

            // Move to the next point for line continuation
            ctx.moveTo(xOffset + (attack + 1) * xScale, yOffset - scores[attack] * yScale);
        }

        ctx.stroke();
    }

    
}



// Update the charts based on the input values
function updateCharts(ctx_1a, canvas_1a, ctx_1b, canvas_1b, ctx_1c, canvas_1c, ctx_1d, canvas_1d) {
    const M = parseInt(document.getElementById('M').value);
    const N = parseInt(document.getElementById('N').value);
    const p = parseFloat(document.getElementById('p').value);

    if (!validateInputs(M, N, p)) {
        return; // Exit the function if inputs are not valid
    }

    drawChart1a(M, N, p, ctx_1a, canvas_1a);
    drawChart1b(M, N, p, ctx_1b, canvas_1b);
    drawChart1cd(M, N, p, "1c", ctx_1c, canvas_1c);
    drawChart1cd(M, N, p, "1d", ctx_1d, canvas_1d);

}

function update() {
    updateCharts(ctx1a, canvas1a, ctx1b, canvas1b, ctx1c, canvas1c, ctx1d, canvas1d);
}

// Initial drawing of the chart
window.onload = function() {
    updateCharts(ctx1a, canvas1a, ctx1b, canvas1b, ctx1c, canvas1c, ctx1d, canvas1d);
};