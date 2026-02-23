/**
 * CONTACT_SYSTEM_MODULE
 * Handles real-time clock, reveal animations, and EmailJS transmission logic.
 */

// --- CONFIGURATION ---
const EMAILJS_PUBLIC_KEY = "umFqhqeXgU9oMA0FY"; 
const EMAILJS_SERVICE_ID = "service_0zlrd1s";
const EMAILJS_TEMPLATE_ID = "template_v5zlws9"; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE UI COMPONENTS
    if (typeof lucide !== 'undefined') lucide.createIcons();
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // 2. START CLOCK SYNC
    updateClock();
    setInterval(updateClock, 1000);

    // 3. REVEAL ANIMATIONS (Intersection Observer)
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up').forEach(el => {
        observer.observe(el);
    });

    // 4. FORM HANDLING
    const contactForm = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const progressLine = document.getElementById('progress-line'); 
    const heroStatus = document.querySelector('.status-chip');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // --- UI STATE: START TRANSMISSION ---
        statusMsg.style.color = "var(--accent-iris)";
        statusMsg.innerText = "UPLINK_SEQUENCING...";
        if (progressLine) {
            progressLine.style.background = "var(--accent-iris)";
            progressLine.style.width = "40%"; 
        }
        
        submitBtn.style.opacity = "0.5";
        submitBtn.disabled = true;

        // --- DATA BUNDLING ---
        const formData = {
            user_name: contactForm.user_name.value,
            user_email: contactForm.user_email.value,
            subject: contactForm.subject.value, 
            message: contactForm.message.value
        };

        try {
            // --- API HANDSHAKE ---
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData);
            
            // --- UI STATE: SUCCESS ---
            if (progressLine) progressLine.style.width = "100%";
            statusMsg.style.color = "#00ff95"; 
            statusMsg.innerText = "TRANSMISSION_COMPLETE";
            
            // TRIGGER TOAST NOTIFICATION
            showToast();

            if (heroStatus) {
                heroStatus.innerHTML = `<span class="pulse-dot" style="background:#00ff95; box-shadow: 0 0 10px #00ff95;"></span> UPLINK_STABLE`;
            }

            contactForm.reset();

            // Reset UI after success
            setTimeout(() => {
                if (progressLine) progressLine.style.width = "0%";
                statusMsg.innerText = "SYSTEM_READY";
                statusMsg.style.color = "var(--text-silver)";
            }, 5000);

        } catch (error) {
            // --- UI STATE: ERROR ---
            if (progressLine) {
                progressLine.style.width = "100%";
                progressLine.style.background = "#ff4d4d"; 
            }
            statusMsg.style.color = "#ff4d4d"; 
            statusMsg.innerText = "CRITICAL_ERROR: UPLINK_FAILED";
            
            if (heroStatus) {
                heroStatus.innerHTML = `<span class="pulse-dot" style="background:#ff4d4d;"></span> UPLINK_OFFLINE`;
            }

            // Reset UI after error so user can try again
            setTimeout(() => {
                if (progressLine) {
                    progressLine.style.width = "0%";
                    progressLine.style.background = "var(--accent-iris)";
                }
                statusMsg.innerText = "SYSTEM_READY";
                statusMsg.style.color = "var(--text-silver)";
            }, 5000);

            console.error("TRANSMISSION_ERROR:", error);
        } finally {
            submitBtn.style.opacity = "1";
            submitBtn.disabled = false;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    });
});

/**
 * Syncs the terminal clock to Bicol, PH (UTC+8)
 */
function updateClock() {
    const clockElement = document.getElementById('local-clock');
    if (!clockElement) return;

    const now = new Date();
    const options = { 
        timeZone: 'Asia/Manila', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    
    const timeString = now.toLocaleTimeString('en-US', options);
    clockElement.innerText = `${timeString} PHT`;
}

/**
 * Triggers the Toast Notification
 */
function showToast() {
    const toast = document.getElementById('toast-container');
    if (!toast) return;
    
    toast.classList.add('active');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}