const canvas = document.getElementById('simulationChart');
const ctx = canvas.getContext('2d');

const scaleFactor = 0.9; // Adjust this value as needed, where 1 is full size and 0.5 is half size, etc.

let isDragging = false;
let startX, startY;

function startDrag(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
}

function drag(e) {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const style = e.target.parentElement.style;
    style.left = (parseInt(style.left || 0) + dx) + 'px';
    style.top = (parseInt(style.top || 0) + dy) + 'px';

    startX = e.clientX;
    startY = e.clientY;
}

function stopDrag() {
    isDragging = false;
}

const canvasContainers = document.querySelectorAll('.canvas-container');
canvasContainers.forEach(container => {
    
    container.addEventListener('resize', function() {
        scaleCanvasContent(container.querySelector('canvas'));
    });
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('mousemove', drag);
    container.addEventListener('mouseup', stopDrag);
    container.addEventListener('mouseleave', stopDrag);
});

function scaleCanvasContent(canvas) {
    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
}

// if the random number is less than p we add +1 (the system is penetrated)
function simulateScore(N, p) {
    let score = 0;
    const scores = [];
    for (let i = 0; i < N; i++) {
        const probability = Math.random();
        score += (probability < p) ? 1 : -1;
        scores.push(score);
    }
    return scores;
}

function countFirstThresholds(scores, S, P_values) {
    const counts = {};
    for (const scoreArr of scores) {
        let hasReachedS = false;
        let hasReachedP = {};

        for (const score of scoreArr) {
            if (!hasReachedS && score <= S) {
                counts[S] = (counts[S] || 0) + 1;
                hasReachedS = true;
            }

            for (const P of P_values) {
                if (score >= P) {
                    if (!hasReachedP[P]) {
                        hasReachedP[P] = true;
                        counts[P] = (counts[P] || 0) + 1;
                    }
                }
            }
        }
    }
    return counts;
}

function drawChart(M, N, p, S, ctx, canvas, P_values) {
    const chartWidth = canvas.width * scaleFactor;  
    const chartHeight = canvas.height * scaleFactor;

    const xOffset = 50;
    const yOffset = chartHeight / 2;
    const xScale = (chartWidth - xOffset) / N;
    const yScale = yOffset / N;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const allScores = [];
    const colors = generateColors(M);

    // Drawing the chart axis, labels, and simulation paths
    // Axis and labels
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(xOffset, 0);
    ctx.lineTo(xOffset, canvas.height);
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(xOffset + chartWidth, yOffset);
    ctx.stroke();

    // Drawing horizontal lines for every y-value
    for (let i = -N; i <= N; i += 2) {
        if (i == S) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
        } else if (i == 20 || i == 30 || i == 40 || i == 50 || i == 60 || i == 70 || i == 80 || i == 90 || i == 100) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        } else {
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';  // Light gray color for lines
        }
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset - i * yScale);
        ctx.lineTo(xOffset + chartWidth, yOffset - i * yScale);
        ctx.stroke();
    }

    // Label the Y axis
    ctx.textAlign = "right";
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
    for (let i = 1; i <= N; i++) {
        let horizontalAdjustment = 0;
        if (i === N) {
            horizontalAdjustment = -15; // Adjust left for max value; change the value as needed
        }
        ctx.fillText(i, xOffset + i * xScale + horizontalAdjustment, yOffset + 10); //AAAA
    }


    // Simulate scores for all M systems and plot them
    for (let system = 0; system < M; system++) {
        const scores = simulateScore(N, p);
        allScores.push(scores);
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
    // Instead of counting the final scores for the histogram, count first thresholds
    const counts = countFirstThresholds(allScores, S, P_values);

    // Draw the histogram bars for each threshold value
    const maxBarWidth = canvas.width - (xOffset + N * xScale);
    for (let threshold in counts) {
        console.log(threshold);
        const count = counts[threshold];
        const barLength = (count / M) * maxBarWidth;
        const barWidth = yScale * 10; // Assuming an interval of 10
        const barStartY = threshold < 0 ? yOffset - threshold * yScale : yOffset - threshold * yScale - 18;
        const barStartX = xOffset + N * xScale;

        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.fillRect(barStartX, barStartY, barLength, barWidth);
    }
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${(i * 360) / count}, 100%, 50%)`);
    }
    return colors;
}

function updateChart() {
    const M = parseInt(document.getElementById('M').value);
    const N = parseInt(document.getElementById('N').value);
    const p = parseFloat(document.getElementById('p').value);
    const S = -parseInt(document.getElementById('S').value);
    const P_values = [20, 30, 40, 50, 60, 70, 80, 90, 100];
    drawChart(M, N, p, S, ctx, canvas, P_values);
}

updateChart();
