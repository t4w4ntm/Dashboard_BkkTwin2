/* ========================================
   TempCard - Temperature Card Component
   Light Theme with SVG Icons
   ======================================== */

export class TempCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._temp = null;
    }

    static get observedAttributes() {
        return ['temp', 'district'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateView();
        }
    }

    // SVG Icon for Thermometer
    getThermometerIcon(color) {
        return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
        </svg>`;
    }

    // Get temperature color based on value
    getTempColor(temp) {
        if (temp === null || isNaN(temp)) return { color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.2)', label: '--' };

        if (temp <= 20) {
            return { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)', label: 'เย็น' };
        } else if (temp <= 25) {
            return { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.25)', label: 'สบาย' };
        } else if (temp <= 30) {
            return { color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', label: 'ปกติ' };
        } else if (temp <= 35) {
            return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', label: 'อุ่น' };
        } else {
            return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.25)', label: 'ร้อน' };
        }
    }

    // Calculate fill percentage (0-50°C range)
    getFillPercentage(temp) {
        if (temp === null || isNaN(temp)) return 0;
        const min = 0;
        const max = 50;
        const percentage = ((temp - min) / (max - min)) * 100;
        return Math.max(0, Math.min(100, percentage));
    }

    updateView() {
        const temp = parseFloat(this.getAttribute('temp'));
        const district = this.getAttribute('district') || 'Unknown';
        const { color, glow, label } = this.getTempColor(temp);
        const fillPercent = this.getFillPercentage(temp);

        // Update CSS custom properties
        this.style.setProperty('--temp-color', color);
        this.style.setProperty('--temp-glow', glow);
        this.style.setProperty('--fill-percent', `${fillPercent}%`);

        const root = this.shadowRoot;
        if (root.querySelector('.temp-value')) {
            root.querySelector('.temp-value').textContent = isNaN(temp) ? '--' : temp.toFixed(1);
            root.querySelector('.temp-status').textContent = label || '--';

            // Update icon color
            const iconContainer = root.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.innerHTML = this.getThermometerIcon(color);
            }

            // Update fill height with animation
            const fill = root.querySelector('.thermometer-fill');
            if (fill) {
                fill.style.height = `${fillPercent}%`;
            }

            // Update ARIA
            const meter = root.querySelector('[role="meter"]');
            if (meter) {
                meter.setAttribute('aria-valuenow', temp || 0);
                meter.setAttribute('aria-valuetext', `${temp}°C - ${label || ''}`);
            }
        }
    }

    render() {
        const district = this.getAttribute('district') || 'Unknown';

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                --temp-color: #94a3b8;
                --temp-glow: rgba(148, 163, 184, 0.2);
                --fill-percent: 0%;
            }

            .card {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(37, 99, 235, 0.12);
                border-radius: 16px;
                padding: 1.5rem;
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08);
            }

            .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, transparent, var(--temp-color), transparent);
                opacity: 0.8;
            }

            .card:hover {
                transform: translateY(-4px);
                border-color: rgba(37, 99, 235, 0.2);
                box-shadow: 0 20px 40px rgba(37, 99, 235, 0.12), 0 0 30px var(--temp-glow);
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .district {
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #64748b;
            }

            .icon-container {
                width: 28px;
                height: 28px;
            }

            .icon {
                width: 100%;
                height: 100%;
            }

            .content {
                display: flex;
                align-items: center;
                gap: 1.5rem;
            }

            /* Thermometer */
            .thermometer {
                width: 30px;
                height: 100px;
                background: rgba(37, 99, 235, 0.08);
                border-radius: 15px 15px 25px 25px;
                position: relative;
                overflow: hidden;
                border: 2px solid rgba(37, 99, 235, 0.12);
            }

            .thermometer-fill {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: var(--fill-percent, 0%);
                background: linear-gradient(to top, var(--temp-color), rgba(255, 255, 255, 0.5));
                border-radius: 0 0 23px 23px;
                transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .thermometer-bulb {
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 36px;
                height: 36px;
                background: var(--temp-color);
                border-radius: 50%;
                box-shadow: 0 0 15px var(--temp-glow);
                transition: all 0.5s ease;
            }

            /* Scale markers */
            .scale {
                position: absolute;
                right: -25px;
                top: 0;
                bottom: 0;
                width: 20px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 5px 0;
            }

            .scale-mark {
                font-size: 0.5rem;
                color: #94a3b8;
                text-align: left;
            }

            /* Data display */
            .data {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .temp-display {
                display: flex;
                align-items: baseline;
                gap: 0.25rem;
            }

            .temp-value {
                font-size: 2.5rem;
                font-weight: 700;
                color: var(--temp-color);
                line-height: 1;
                transition: color 0.5s ease;
            }

            .temp-unit {
                font-size: 1rem;
                color: #94a3b8;
            }

            .temp-status {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--temp-color);
                padding: 0.25rem 0.75rem;
                background: rgba(37, 99, 235, 0.06);
                border-radius: 9999px;
                display: inline-block;
                width: fit-content;
                transition: color 0.5s ease;
            }

            .label {
                font-size: 0.75rem;
                color: #94a3b8;
                margin-top: 0.5rem;
            }

            /* Hover glow effect */
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 10px var(--temp-glow); }
                50% { box-shadow: 0 0 20px var(--temp-glow); }
            }

            .thermometer-bulb {
                animation: glow 2s ease-in-out infinite;
            }
        </style>

        <article class="card" role="meter" aria-labelledby="district-label" aria-valuemin="0" aria-valuemax="50" aria-valuenow="0">
            <div class="header">
                <span class="district" id="district-label">${district}</span>
                <span class="icon-container">
                    ${this.getThermometerIcon('#94a3b8')}
                </span>
            </div>
            
            <div class="content">
                <div class="thermometer">
                    <div class="thermometer-fill"></div>
                    <div class="thermometer-bulb"></div>
                    <div class="scale">
                        <span class="scale-mark">50°</span>
                        <span class="scale-mark">25°</span>
                        <span class="scale-mark">0°</span>
                    </div>
                </div>
                
                <div class="data">
                    <div class="temp-display">
                        <span class="temp-value">--</span>
                        <span class="temp-unit">°C</span>
                    </div>
                    <span class="temp-status">รอข้อมูล...</span>
                    <span class="label">อุณหภูมิปัจจุบัน</span>
                </div>
            </div>
        </article>
        `;
    }
}

// Register Web Component
customElements.define('temp-card', TempCard);
