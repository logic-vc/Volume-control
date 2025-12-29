/**
 * Vocal Volume Monitor - Time Domain RMS Measurement
 *
 * Measurement Method:
 * - Time Domain RMS (Root Mean Square): Measures actual sound pressure
 *   - Analyzes the audio waveform directly (not frequency spectrum)
 *   - Consistent measurement across all vocal ranges (low to high notes)
 *   - No frequency distribution bias
 *
 * - Dynamic range compression for vocal practice
 *   - Emphasizes mid-range volumes for better sensitivity
 *   - Clear feedback for consistent volume control
 *
 * Benefits:
 * - Equal sensitivity for low notes and high notes
 * - Measures actual vocal power, not frequency distribution
 * - Simple, reliable, and accurate for vocal practice
 */

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const volumeCircle = document.getElementById('volumeCircle');
const thresholdCircle = document.getElementById('thresholdCircle');
const volumeValue = document.getElementById('volumeValue');
const volumeLabel = document.querySelector('.volume-label');
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
const maxHistoryLength = 150; // 30초 (0.2초마다 1개 = 150개)
let lastHistoryUpdate = 0;
const historyUpdateInterval = 200; // 0.2초마다 히스토리 업데이트

// Chart Setup
const ctx = volumeChart.getContext('2d');
let chartWidth = volumeChart.width;
let chartHeight = volumeChart.height;

// Resize chart canvas
function resizeChart() {
    const container = volumeChart.parentElement;
    chartWidth = container.clientWidth - 60;
    chartHeight = 150;
    volumeChart.width = chartWidth;
    volumeChart.height = chartHeight;
}

resizeChart();
window.addEventListener('resize', resizeChart);

// Update threshold circle size
function updateThresholdCircle() {
    // threshold 0 -> 50px, threshold 50 -> 150px, threshold 100 -> 250px
    const minSize = 50;
    const maxSize = 250;
    const size = minSize + (threshold / 100) * (maxSize - minSize);
    thresholdCircle.style.width = size + 'px';
    thresholdCircle.style.height = size + 'px';
}

// Initialize Threshold from Slider
thresholdSlider.addEventListener('input', (e) => {
    threshold = parseInt(e.target.value);
    thresholdDisplay.textContent = threshold;
    updateThresholdCircle();
});

// Initialize threshold circle
updateThresholdCircle();

// Start Microphone
startBtn.addEventListener('click', async () => {
    try {
        // Disable browser auto-adjustments for accurate vocal measurement
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,  // No echo cancellation
                noiseSuppression: false,  // No noise suppression
                autoGainControl: false    // CRITICAL: Disable AGC to prevent volume auto-adjustment
            }
        });
        initAudio(stream);
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.style.display = 'none';
        volumeLabel.classList.remove('stopped');
        volumeLabel.classList.add('active');
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
    statusText.style.display = 'none';
    volumeLabel.classList.remove('active');
    volumeLabel.classList.add('stopped');
    volumeValue.textContent = '0';
    meterBar.style.width = '0%';
    volumeCircle.classList.remove('safe', 'warning');
    volumeCircle.style.transform = 'scale(1)';
    meterBar.classList.remove('warning');
});

// Initialize Audio Context
function initAudio(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    // Optimized settings for vocal volume measurement
    analyser.smoothingTimeConstant = 0.3; // Lower smoothing for more responsive time domain measurement
    analyser.fftSize = 2048; // Sample size for time domain analysis

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    javascriptNode.onaudioprocess = function() {
        const array = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(array);
        const volume = getRMSVolume(array);
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

// Calculate RMS (Root Mean Square) Volume from Time Domain Data
function getRMSVolume(array) {
    let sumSquares = 0;

    // Calculate RMS: square each sample, average, then square root
    for (let i = 0; i < array.length; i++) {
        sumSquares += array[i] * array[i];
    }

    const rms = Math.sqrt(sumSquares / array.length);

    // Segmented scaling optimized for vocal practice feedback
    // Three distinct ranges for better control:
    //
    // 작은 소리 (Soft):   10-30  (RMS 0.01-0.08)
    // 중간 소리 (Medium): 40-60  (RMS 0.08-0.15)
    // 큰 소리 (Loud):     80-90  (RMS 0.15-0.3+)
    //
    let volume;

    if (rms < 0.002) {
        // Noise floor - ignore very quiet signals
        volume = 0;
    } else if (rms < 0.08) {
        // 작은 소리: 0.01~0.08 RMS → 10~30
        volume = 10 + ((rms - 0.01) / (0.08 - 0.01)) * 20;
    } else if (rms < 0.15) {
        // 중간 소리: 0.08~0.15 RMS → 40~60
        volume = 40 + ((rms - 0.08) / (0.15 - 0.08)) * 20;
    } else if (rms < 0.3) {
        // 큰 소리: 0.15~0.3 RMS → 80~90
        volume = 80 + ((rms - 0.15) / (0.3 - 0.15)) * 10;
    } else {
        // 매우 큰 소리: 0.3+ RMS → 90~100
        volume = 90 + Math.min(10, (rms - 0.3) * 50);
    }

    // Round and clamp to 0-100 range
    return Math.min(100, Math.max(0, Math.round(volume)));
}

// Update UI with Volume Data
function updateUI(volume) {
    // Update volume display
    volumeValue.textContent = volume;

    // Update meter bar
    meterBar.style.width = volume + '%';

    // Check against threshold
    const isOverThreshold = volume > threshold;

    // Update circle size based on volume (1 to 5 scale)
    // volume 0 -> 50px (scale 1), volume 50 -> 150px (scale 3), volume 100 -> 250px (scale 5)
    const minScale = 1;
    const maxScale = 5;
    const scale = minScale + (volume / 100) * (maxScale - minScale);
    volumeCircle.style.transform = `scale(${scale})`;

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

    // Update volume history (throttled to once every 200ms)
    const now = Date.now();
    if (now - lastHistoryUpdate >= historyUpdateInterval) {
        volumeHistory.push(volume);
        if (volumeHistory.length > maxHistoryLength) {
            volumeHistory.shift();
        }
        lastHistoryUpdate = now;

        // Draw chart
        drawChart();
    }
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
