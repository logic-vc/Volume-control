// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const volumeCircle = document.getElementById('volumeCircle');
const volumeValue = document.getElementById('volumeValue');
const statusText = document.getElementById('statusText');
const meterBar = document.getElementById('meterBar');
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdDisplay = document.getElementById('thresholdDisplay');
const volumeChart = document.getElementById('volumeChart');

// Audio Context and Variables
let audioContext;
let analyser;
let microphone;
let javascriptNode;
let animationId;
let threshold = 50;
let volumeHistory = [];
const maxHistoryLength = 50;

// Chart Setup
const ctx = volumeChart.getContext('2d');
let chartWidth = volumeChart.width;
let chartHeight = volumeChart.height;

// Resize chart canvas
function resizeChart() {
    const container = volumeChart.parentElement;
    chartWidth = container.clientWidth - 60;
    chartHeight = 200;
    volumeChart.width = chartWidth;
    volumeChart.height = chartHeight;
}

resizeChart();
window.addEventListener('resize', resizeChart);

// Initialize Threshold from Slider
thresholdSlider.addEventListener('input', (e) => {
    threshold = parseInt(e.target.value);
    thresholdDisplay.textContent = threshold;
});

// Start Microphone
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        initAudio(stream);
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.textContent = '마이크 활성화됨';
        statusText.classList.remove('safe', 'warning');
    } catch (err) {
        console.error('마이크 접근 오류:', err);
        alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
    }
});

// Stop Microphone
stopBtn.addEventListener('click', () => {
    stopAudio();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = '마이크 정지됨';
    statusText.classList.remove('safe', 'warning');
    volumeValue.textContent = '0';
    meterBar.style.width = '0%';
    volumeCircle.classList.remove('safe', 'warning');
    meterBar.classList.remove('warning');
});

// Initialize Audio Context
function initAudio(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    javascriptNode.onaudioprocess = function() {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        const volume = getAverageVolume(array);
        updateUI(volume);
    };
}

// Stop Audio
function stopAudio() {
    if (javascriptNode) {
        javascriptNode.disconnect();
    }
    if (analyser) {
        analyser.disconnect();
    }
    if (microphone) {
        microphone.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Calculate Average Volume
function getAverageVolume(array) {
    const values = array.reduce((sum, value) => sum + value, 0);
    const average = values / array.length;
    return Math.round(average);
}

// Update UI with Volume Data
function updateUI(volume) {
    // Update volume display
    volumeValue.textContent = volume;

    // Update meter bar
    meterBar.style.width = volume + '%';

    // Check against threshold
    const isOverThreshold = volume > threshold;

    // Update circle styling
    volumeCircle.classList.remove('safe', 'warning');
    if (volume > 0) {
        if (isOverThreshold) {
            volumeCircle.classList.add('warning');
        } else {
            volumeCircle.classList.add('safe');
        }
    }

    // Update meter bar styling
    meterBar.classList.remove('warning');
    if (isOverThreshold) {
        meterBar.classList.add('warning');
    }

    // Update status text
    statusText.classList.remove('safe', 'warning');
    if (volume > 0) {
        if (isOverThreshold) {
            statusText.textContent = '⚠️ 너무 시끄러워요!';
            statusText.classList.add('warning');
        } else {
            statusText.textContent = '✓ 좋아요! 계속하세요';
            statusText.classList.add('safe');
        }
    } else {
        statusText.textContent = '마이크 활성화됨';
    }

    // Update volume history
    volumeHistory.push(volume);
    if (volumeHistory.length > maxHistoryLength) {
        volumeHistory.shift();
    }

    // Draw chart
    drawChart();
}

// Draw Volume History Chart
function drawChart() {
    ctx.clearRect(0, 0, chartWidth, chartHeight);

    if (volumeHistory.length === 0) return;

    // Draw threshold line
    const thresholdY = chartHeight - (threshold / 100) * chartHeight;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(chartWidth, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw threshold label
    ctx.fillStyle = '#ef4444';
    ctx.font = '12px sans-serif';
    ctx.fillText('기준: ' + threshold, 10, thresholdY - 5);

    // Draw volume line
    const step = chartWidth / (maxHistoryLength - 1);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();

    volumeHistory.forEach((vol, index) => {
        const x = index * step;
        const y = chartHeight - (vol / 100) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw points
    volumeHistory.forEach((vol, index) => {
        const x = index * step;
        const y = chartHeight - (vol / 100) * chartHeight;

        ctx.fillStyle = vol > threshold ? '#ef4444' : '#10b981';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.1)';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
        const y = (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText((100 - (i * 25)), chartWidth - 25, y - 2);
    }
}

// Initial chart draw
drawChart();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !startBtn.disabled) {
        e.preventDefault();
        startBtn.click();
    } else if (e.code === 'Escape' && !stopBtn.disabled) {
        e.preventDefault();
        stopBtn.click();
    }
});

// Add visual feedback for buttons
startBtn.addEventListener('mousedown', () => {
    startBtn.style.transform = 'scale(0.95)';
});

startBtn.addEventListener('mouseup', () => {
    startBtn.style.transform = 'scale(1)';
});

stopBtn.addEventListener('mousedown', () => {
    stopBtn.style.transform = 'scale(0.95)';
});

stopBtn.addEventListener('mouseup', () => {
    stopBtn.style.transform = 'scale(1)';
});

// Add smooth transitions for volume changes
let smoothVolume = 0;
const smoothingFactor = 0.3;

function smoothVolumeTransition(targetVolume) {
    smoothVolume = smoothVolume + (targetVolume - smoothVolume) * smoothingFactor;
    return Math.round(smoothVolume);
}

// Welcome message
console.log(`
╔═══════════════════════════════════════╗
║   Vocal Volume Monitor v1.0           ║
║   Made by VOCAL LOGIC                 ║
║                                       ║
║   Keyboard Shortcuts:                 ║
║   - Space: Start microphone           ║
║   - Escape: Stop microphone           ║
╚═══════════════════════════════════════╝
`);
