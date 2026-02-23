/**
 * ABOUT PAGE LOGIC - FIREBASE CLOUD VERSION
 */

// 1. Import Firebase Firestore functions
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    lucide.createIcons();

    // 2. Map Initialization
    const mapCenter = [14.1500, 122.9167];
    const map = L.map('map', { 
        zoomControl: false,
        attributionControl: false 
    }).setView(mapCenter, 13);

    setTimeout(() => {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
            maxZoom: 19 
        }).addTo(map);
        map.invalidateSize();
    }, 100);

    const irisIcon = L.divIcon({
        className: 'custom-iris-marker',
        html: `<div class="marker-pulse"><div class="ring"></div><div class="dot"></div></div>`,
        iconSize: [20, 20]
    });

    L.marker(mapCenter, { icon: irisIcon })
        .addTo(map)
        .bindTooltip("ITOMANG, TALISAY", { 
            permanent: true, 
            direction: 'right',
            className: 'map-label-style' 
        });

    // 3. Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.classList.contains('map-base')) {
                    setTimeout(() => { map.invalidateSize(); }, 200);
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.snap-section').forEach(section => observer.observe(section));

    // 4. Initial Load
    loadReviews();
});

// --- HELPER: NOTIFICATION SYSTEM ---
function showNotification(message, type = "success") {
    const toast = document.getElementById('toast-notification');
    const body = document.getElementById('toast-body');
    const icon = document.getElementById('toast-icon');
    
    if (!toast || !body) return;

    body.innerText = message;
    
    // UI Styling based on type
    if (type === "error") {
        toast.style.borderLeftColor = "#ff4d4d";
        icon.setAttribute('data-lucide', 'alert-triangle');
    } else {
        toast.style.borderLeftColor = "var(--accent-iris)";
        icon.setAttribute('data-lucide', 'shield-check');
    }
    
    lucide.createIcons(); // Refresh icons inside toast
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// --- FUNCTION 1: LOAD REVIEWS ---
async function loadReviews() {
    const list = document.getElementById('feedback-list');
    if (!list) return;
    
    try {
        const q = query(collection(window.db, "reviews"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        list.innerHTML = ''; 

        if (querySnapshot.empty) {
            list.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-dim);'>No peer logs found. Be the first to transmit.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const item = doc.data();
            list.innerHTML += `
                <div class="review-card">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <div style="width: 35px; height: 35px; border-radius: 50%; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="user" style="width: 18px; color: #8b5cf6;"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; color: #fff; font-size: 0.9rem;">${item.name}</h4>
                            <p style="margin: 0; font-size: 0.7rem; color: #8b5cf6;">${item.role}</p>
                        </div>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; font-style: italic; flex-grow: 1;">
                        "${item.comment}"
                    </p>
                    <div class="log-ts">
                        LOG_TS: ${item.date}
                    </div>
                </div>
            `;
        });
        
        lucide.createIcons(); 
        
    } catch (err) {
        console.error("Firebase Error:", err);
        list.innerHTML = "<p class='t-silver'>UPLINK_FAILURE: Cloud logs offline.</p>";
    }
}

// --- FUNCTION 2: SUBMIT FEEDBACK (FIREBASE VERSION WITH TOAST) ---
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const name = document.getElementById('fb-name').value;
        const role = document.getElementById('fb-role').value;
        const comment = document.getElementById('fb-comment').value;

        // Validation
        if (!name || !role || comment.length < 5) {
            showNotification("VALIDATION_ERROR: All fields required.", "error");
            submitBtn.classList.add('error-shake');
            setTimeout(() => submitBtn.classList.remove('error-shake'), 400);
            return;
        }

        // 1. Loading State
        submitBtn.disabled = true;
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> <span>UPLINKING...</span>`;
        lucide.createIcons();

        try {
            // 2. Firebase Action
            await addDoc(collection(window.db, "reviews"), {
                name: name,
                role: role,
                comment: comment,
                date: new Date().toLocaleDateString()
            });

            // 3. Success Notification
            showNotification("Feedback posted successfully!");
            
            this.reset();
            loadReviews(); 

            // 4. Reset Button
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                lucide.createIcons();
            }, 1000);

        } catch (error) {
            console.error("Submission Error:", error);
            showNotification("CONNECTION_ERROR: Uplink failed.", "error");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            lucide.createIcons();
        }
    });
}

// --- FUNCTION 3: 3D TILT EFFECT ---
document.querySelectorAll('.glass-panel').forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 12; 
        const rotateY = (centerX - x) / 12;
        panel.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    panel.addEventListener('mouseleave', () => {
        panel.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
});