/* ============================================================
   slide_engine.js — Enhanced navigation + interactive features
   Replaces slide_controls.js in examples_interactive/
   ============================================================ */

// ── Slide identity ───────────────────────────────────────────
const current_page_url      = window.location.pathname;
const current_filename      = current_page_url.substring(current_page_url.lastIndexOf('/') + 1);
const slide_number_match    = current_filename.match(/presentation_slide_(\d+)\.html/);
const current_slide_number  = parseInt(slide_number_match[1]);
const previous_slide_number = current_slide_number - 1;
const next_slide_number     = current_slide_number + 1;

const previous_slide_filename = "presentation_slide_" + previous_slide_number + ".html";
const next_slide_filename     = "presentation_slide_" + next_slide_number + ".html";

// ── Fragment state ───────────────────────────────────────────
let fragments       = [];
let fragment_index  = -1;   // -1 = none revealed yet

function collect_fragments() {
    fragments = Array.from(document.querySelectorAll('.fragment'));
    fragment_index = -1;
}

function advance_fragment() {
    // Returns true if a fragment was advanced, false if all done
    if (fragment_index >= fragments.length - 1) return false;
    fragment_index++;
    const f = fragments[fragment_index];
    if (f.classList.contains('fade-in-then-out') && f.classList.contains('visible')) {
        f.classList.remove('visible');
        f.classList.add('gone');
    } else {
        f.classList.add('visible');
    }
    return true;
}

function retreat_fragment() {
    if (fragment_index < 0) return false;
    const f = fragments[fragment_index];
    f.classList.remove('visible', 'gone');
    fragment_index--;
    return true;
}

// ── Navigation ───────────────────────────────────────────────
function go_prev() {
    if (retreat_fragment()) return;
    if (current_slide_number > 1) {
        window.location.href = previous_slide_filename;
    }
}

function go_next() {
    if (advance_fragment()) return;
    if (current_slide_number < DECK_TOTAL_SLIDES) {
        window.location.href = next_slide_filename;
    }
}

// ── Prev/Next buttons ────────────────────────────────────────
const prev_button = document.getElementById("prevBtn");
const next_button = document.getElementById("nextBtn");

if (current_slide_number === 1) {
    prev_button.disabled = true;
    prev_button.style.display = "none";
} else {
    prev_button.addEventListener("click", go_prev);
}

if (current_slide_number === DECK_TOTAL_SLIDES) {
    next_button.disabled = true;
    next_button.style.display = "none";
} else {
    next_button.addEventListener("click", go_next);
}

// ── Keyboard navigation ──────────────────────────────────────
document.addEventListener('keydown', function(e) {
    if (overview_active) {
        if (e.key === 'Escape') toggle_overview();
        return;
    }
    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            if (e.shiftKey) { go_prev(); } else { go_next(); }
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            go_prev();
            e.preventDefault();
            break;
        case 'Escape':
            toggle_overview();
            break;
        case 'b':
        case 'B':
        case '.':
            toggle_blank();
            break;
    }
});

// ── Touch / swipe (touch screens) ────────────────────────────
let touch_start_x = null;

document.addEventListener('touchstart', function(e) {
    touch_start_x = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (touch_start_x === null) return;
    const delta = touch_start_x - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
        delta > 0 ? go_next() : go_prev();
    }
    touch_start_x = null;
}, { passive: true });

// ── Trackpad horizontal swipe (wheel deltaX) ─────────────────
let wheel_timer = null;
let wheel_accum = 0;

document.addEventListener('wheel', function(e) {
    // Only act on predominantly horizontal movement
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    wheel_accum += e.deltaX;
    clearTimeout(wheel_timer);
    wheel_timer = setTimeout(function() {
        if (Math.abs(wheel_accum) > 60) {
            wheel_accum > 0 ? go_next() : go_prev();
        }
        wheel_accum = 0;
    }, 80);
}, { passive: true });

// ── Progress bar ─────────────────────────────────────────────
const progress_bar = document.createElement('div');
progress_bar.id = 'slide-progress';
progress_bar.style.cssText = `
    position: fixed; bottom: 0; left: 0; height: 6px; z-index: 500;
    background-color: var(--color-accent-main);
    width: ${(current_slide_number / DECK_TOTAL_SLIDES * 100)}%;
    transition: width 0.3s ease;
`;
document.body.appendChild(progress_bar);

// ── Slide counter ────────────────────────────────────────────
const slide_counter = document.createElement('div');
slide_counter.id = 'slide-counter';
slide_counter.textContent = current_slide_number + ' / ' + DECK_TOTAL_SLIDES;
slide_counter.style.cssText = `
    position: fixed; top: 1.5rem; right: 2rem; z-index: 200;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--color-divider); font-family: 'Inter', sans-serif;
`;
document.body.appendChild(slide_counter);

// ── Blank / pause screen ─────────────────────────────────────
let blank_active = false;
const blank_overlay = document.createElement('div');
blank_overlay.style.cssText = `
    display: none; position: fixed; inset: 0; background: #000;
    z-index: 1000; cursor: pointer;
`;
blank_overlay.addEventListener('click', toggle_blank);
document.body.appendChild(blank_overlay);

function toggle_blank() {
    blank_active = !blank_active;
    blank_overlay.style.display = blank_active ? 'block' : 'none';
}

// ── Overview mode ────────────────────────────────────────────
let overview_active = false;
const overview_overlay = document.createElement('div');
overview_overlay.style.cssText = `
    display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85);
    z-index: 900; padding: 2rem; overflow-y: auto;
    font-family: 'Inter', sans-serif;
`;

const overview_grid = document.createElement('div');
overview_grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem; max-width: 1200px; margin: 0 auto;
`;

// Build slide cards
for (let i = 1; i <= DECK_TOTAL_SLIDES; i++) {
    const card = document.createElement('a');
    card.href = 'presentation_slide_' + i + '.html';
    card.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; padding: 1rem; border-radius: 6px;
        text-decoration: none; gap: 0.5rem;
        background: ${i === current_slide_number ? 'var(--color-accent-main)' : 'rgba(255,255,255,0.08)'};
        border: 2px solid ${i === current_slide_number ? 'var(--color-accent-main)' : 'transparent'};
        transition: background 0.15s;
    `;
    card.innerHTML = `
        <span style="font-size: 1.5rem; font-weight: 800; color: #fff;">${i}</span>
        <span style="font-size: 0.7rem; color: rgba(255,255,255,0.5); text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">slide ${i}</span>
    `;
    card.addEventListener('mouseenter', function() {
        if (i !== current_slide_number) this.style.background = 'rgba(255,255,255,0.15)';
    });
    card.addEventListener('mouseleave', function() {
        if (i !== current_slide_number) this.style.background = 'rgba(255,255,255,0.08)';
    });
    overview_grid.appendChild(card);
}

const overview_hint = document.createElement('p');
overview_hint.textContent = 'ESC or click outside to close';
overview_hint.style.cssText = `
    text-align: center; color: rgba(255,255,255,0.3);
    font-size: 0.8rem; margin: 1.5rem 0 0; letter-spacing: 0.05em;
`;

overview_overlay.appendChild(overview_grid);
overview_overlay.appendChild(overview_hint);
overview_overlay.addEventListener('click', function(e) {
    if (e.target === overview_overlay) toggle_overview();
});
document.body.appendChild(overview_overlay);

function toggle_overview() {
    overview_active = !overview_active;
    overview_overlay.style.display = overview_active ? 'block' : 'none';
}

// ── State events ─────────────────────────────────────────────
const active_slide = document.querySelector('.slide.active');
if (active_slide && active_slide.dataset.state) {
    document.body.classList.add(active_slide.dataset.state);
}

// ── Auto-fit text ────────────────────────────────────────────
// Targets any element with class .autofit-text
function autofit_text() {
    const targets = document.querySelectorAll('.autofit-text');
    targets.forEach(function(el) {
        const parent_width = el.parentElement.offsetWidth;
        let size = 10;
        el.style.fontSize = size + 'px';
        while (el.scrollWidth < parent_width && size < 300) {
            size++;
            el.style.fontSize = size + 'px';
        }
        el.style.fontSize = (size - 1) + 'px';
    });
}

// Run immediately — script is at bottom of body so DOM is ready
collect_fragments();
autofit_text();
