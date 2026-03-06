/**
 * XV Aranza Sthefanya - Invitation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initSparkles();
    initCountdown();
    setupEventListeners();
});

// Hide loader when page is fully loaded
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.classList.add('hidden'), 1200);
        }, 500); // Small extra beat for the "heartbeat" to be seen
    }
});

// 1. Sparkles Generation
function initSparkles() {
    const container = document.getElementById('sparkles-container');
    const sparkleCount = 80;

    for (let i = 0; i < sparkleCount; i++) {
        createSparkle(container);
    }
}

function createSparkle(container) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';

    // Random position and timing
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const size = Math.random() * 4 + 1;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 5;

    sparkle.style.left = `${left}%`;
    sparkle.style.top = `${top}%`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.animationDuration = `${duration}s`;
    sparkle.style.animationDelay = `${delay}s`;

    container.appendChild(sparkle);

    // Remove and recreate after animation
    setTimeout(() => {
        sparkle.remove();
        createSparkle(container);
    }, (duration + delay) * 1000);
}

// 2. Countdown Logic
function initCountdown() {
    const targetDate = new Date('March 21, 2026 00:00:00').getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById('countdown-timer').innerHTML = "¡LLEGÓ EL DÍA!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

// 3. Audio Logic
const audio = document.getElementById('bg-audio');
let isPlaying = false;

function setupEventListeners() {
    const entryBtn = document.getElementById('entry-btn');
    const initialPopup = document.getElementById('initial-popup');
    const videoOverlay = document.getElementById('video-overlay');
    const introVideo = document.getElementById('intro-video');
    const invitationContainer = document.getElementById('invitation-container');
    const musicBtn = document.getElementById('music-toggle');
    const musicStatus = document.getElementById('music-status');

    // Music Toggle
    musicBtn.addEventListener('click', () => {
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            musicStatus.innerText = 'Escuchar una linda melodía';
            isPlaying = false;
        } else {
            audio.play();
            musicStatus.innerText = 'Pausar melodía';
            isPlaying = true;
        }
    });

    // Start Sequence
    entryBtn.addEventListener('click', () => {
        initialPopup.classList.add('hidden');
        videoOverlay.classList.remove('hidden');

        // Start playing the local audio (walz.mpeg)
        if (audio) {
            audio.play().then(() => {
                isPlaying = true;
                musicStatus.innerText = 'Pausar melodía';
            }).catch(e => console.warn("Audio autoplay blocked:", e));
        }

        // Reset video to start and play
        introVideo.currentTime = 0;
        introVideo.play().then(() => {
            console.log("Video playing...");
        }).catch(e => {
            console.warn("Video blocked, skipping to magazine.", e);
            finishTransition();
        });
    });

    // Video End Logic
    introVideo.addEventListener('ended', () => {
        // Adding a slight delay or checking if we should transition slightly before end
        // For now, on 'ended' is the most standard for these templates
        finishTransition();
    });

    // If the video is long, we might want to transition when it gets near the end
    introVideo.addEventListener('timeupdate', () => {
        // If there's 0.5 seconds left, start fading out early for a smoother transition
        if (introVideo.duration - introVideo.currentTime < 0.5) {
            // No action needed here if we rely on 'ended', but can be used for smoother sync
        }
    });

    function finishTransition() {
        // More subtle transition: longer fade
        videoOverlay.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        videoOverlay.classList.add('hidden');

        // Appear magazine
        invitationContainer.classList.remove('hidden');

        // Show WhatsApp float
        const waBtn = document.getElementById('whatsapp-float');
        if (waBtn) waBtn.classList.remove('hidden');

        // Delay flipbook init to allow fade-in animation to breathe
        setTimeout(initFlipbook, 800);
    }
}

// 4. Flipbook Logic
function initFlipbook() {
    const flipContainer = document.getElementById('magazine-flipbook');

    // Check if instance already exists to avoid re-init
    if (window.pageFlipInstance) {
        return;
    }

    const pageFlip = new St.PageFlip(flipContainer, {
        width: 400,
        height: 600,
        size: "stretch",
        minWidth: 300,
        maxWidth: 1000,
        minHeight: 450,
        maxHeight: 1500,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: true,
        useMouseEvents: true,
        flippingTime: 1000, // Elegant slow flip
        showPageCorners: true
    });

    window.pageFlipInstance = pageFlip;

    // Pages are the direct children of the flipbook container
    const pages = document.querySelectorAll('.page');
    pageFlip.loadFromHTML(pages);

    // Explicitly set order check
    console.log("Pages loaded in order:", Array.from(pages).map(p => p.querySelector('img').src.split('/').pop()));

    // Navigation Buttons
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    prevBtn.addEventListener('click', () => {
        pageFlip.flipPrev();
    });

    nextBtn.addEventListener('click', () => {
        pageFlip.flipNext();
    });

    // Update button state on flip
    pageFlip.on('flip', (e) => {
        console.log('Current page: ' + e.data);
    });
}
