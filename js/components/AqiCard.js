/* ========================================
   AqiCard - Air Quality Card Component
   Light Theme with SVG Icons
   ======================================== */

export class AqiCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._animationId = null;
    }

    static get observedAttributes() {
        return ['pm25', 'district'];
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateView();
        }
    }

    // SVG Icon for Air/Wind
    getWindIcon(color) {
        return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
        </svg>`;
    }

    // Calculate AQI from PM2.5 (US EPA formula simplified)
    calculateAQI(pm25) {
        if (pm25 === null || isNaN(pm25)) {
            return { aqi: 0, status: 'No Data', statusTh: 'ไม่มีข้อมูล', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.2)', level: 0 };
        }

        let aqi, status, statusTh, color, glow;

        if (pm25 <= 12) {
            aqi = Math.round((50 / 12) * pm25);
            status = 'Good';
            statusTh = 'ดีมาก';
            color = '#10b981';
            glow = 'rgba(16, 185, 129, 0.25)';
        } else if (pm25 <= 35.4) {
            aqi = Math.round(50 + ((100 - 50) / (35.4 - 12.1)) * (pm25 - 12.1));
            status = 'Moderate';
            statusTh = 'ปานกลาง';
            color = '#f59e0b';
            glow = 'rgba(245, 158, 11, 0.25)';
        } else if (pm25 <= 55.4) {
            aqi = Math.round(100 + ((150 - 100) / (55.4 - 35.5)) * (pm25 - 35.5));
            status = 'Unhealthy for Sensitive';
            statusTh = 'มีผลต่อกลุ่มเสี่ยง';
            color = '#f97316';
            glow = 'rgba(249, 115, 22, 0.25)';
        } else if (pm25 <= 150.4) {
            aqi = Math.round(150 + ((200 - 150) / (150.4 - 55.5)) * (pm25 - 55.5));
            status = 'Unhealthy';
            statusTh = 'ไม่ดีต่อสุขภาพ';
            color = '#ef4444';
            glow = 'rgba(239, 68, 68, 0.25)';
        } else if (pm25 <= 250.4) {
            aqi = Math.round(200 + ((300 - 200) / (250.4 - 150.5)) * (pm25 - 150.5));
            status = 'Very Unhealthy';
            statusTh = 'อันตราย';
            color = '#8b5cf6';
            glow = 'rgba(139, 92, 246, 0.25)';
        } else {
            aqi = Math.round(300 + ((500 - 300) / (500.4 - 250.5)) * (pm25 - 250.5));
            status = 'Hazardous';
            statusTh = 'อันตรายมาก';
            color = '#dc2626';
            glow = 'rgba(220, 38, 38, 0.25)';
        }

        const level = Math.min(100, (aqi / 300) * 100);
        return { aqi, status, statusTh, color, glow, level };
    }

    // Animate percentage change
    animateGauge(targetPercent) {
        const gauge = this.shadowRoot.querySelector('.gauge-fill');
        if (!gauge) return;

        gauge.style.setProperty('--gauge-percent', `${targetPercent}%`);
    }

    updateView() {
        const pm25 = parseFloat(this.getAttribute('pm25'));
        const { aqi, status, statusTh, color, glow, level } = this.calculateAQI(pm25);
        const district = this.getAttribute('district') || 'Unknown';

        // Update CSS Variables
        this.style.setProperty('--aqi-color', color);
        this.style.setProperty('--aqi-glow', glow);
        this.style.setProperty('--gauge-percent', `${level}%`);

        const root = this.shadowRoot;

        if (root.querySelector('.pm25-value')) {
            root.querySelector('.pm25-value').textContent = isNaN(pm25) ? '--' : pm25.toFixed(1);
            root.querySelector('.aqi-value').textContent = aqi || '--';
            root.querySelector('.status-en').textContent = status;
            root.querySelector('.status-th').textContent = statusTh;

            // Update icon color
            const iconContainer = root.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.innerHTML = this.getWindIcon(color);
            }

            // Update gauge
            this.animateGauge(level);

            // Update ARIA
            const meter = root.querySelector('[role="meter"]');
            if (meter) {
                meter.setAttribute('aria-valuenow', aqi);
                meter.setAttribute('aria-valuetext', `${statusTh}, AQI ${aqi}`);
            }
        }
    }

    render() {
        const district = this.getAttribute('district') || 'Unknown';

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                --aqi-color: #94a3b8;
                --aqi-glow: rgba(148, 163, 184, 0.2);
                --gauge-percent: 0%;
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
                background: linear-gradient(90deg, transparent, var(--aqi-color), transparent);
                opacity: 0.8;
            }

            .card:hover {
                transform: translateY(-4px);
                border-color: rgba(37, 99, 235, 0.2);
                box-shadow: 0 20px 40px rgba(37, 99, 235, 0.12), 0 0 30px var(--aqi-glow);
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1.25rem;
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

            /* Circular Gauge */
            .gauge-container {
                position: relative;
                width: 100px;
                height: 100px;
            }

            .gauge {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: conic-gradient(
                    var(--aqi-color) var(--gauge-percent),
                    rgba(37, 99, 235, 0.1) var(--gauge-percent)
                );
                display: grid;
                place-items: center;
                position: relative;
                transition: background 1s ease;
            }

            .gauge::before {
                content: '';
                position: absolute;
                inset: 8px;
                background: linear-gradient(145deg, #ffffff, #f8fafc);
                border-radius: 50%;
                box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .gauge-inner {
                position: relative;
                text-align: center;
                z-index: 1;
            }

            .aqi-value {
                font-size: 1.75rem;
                font-weight: 700;
                color: var(--aqi-color);
                line-height: 1;
                transition: color 0.5s ease;
            }

            .aqi-label {
                font-size: 0.6rem;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-top: 2px;
            }

            /* Data display */
            .data {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .pm25-display {
                display: flex;
                align-items: baseline;
                gap: 0.25rem;
            }

            .pm25-value {
                font-size: 2rem;
                font-weight: 700;
                color: #1e293b;
                line-height: 1;
            }

            .pm25-unit {
                font-size: 0.75rem;
                color: #94a3b8;
            }

            .status-badge {
                display: flex;
                flex-direction: column;
                gap: 0.125rem;
            }

            .status-th {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--aqi-color);
                transition: color 0.5s ease;
            }

            .status-en {
                font-size: 0.65rem;
                color: #94a3b8;
            }

            .label {
                font-size: 0.7rem;
                color: #94a3b8;
                margin-top: 0.25rem;
            }

            /* Pulse animation for gauge glow */
            @keyframes pulseGlow {
                0%, 100% {
                    box-shadow: 0 0 10px var(--aqi-glow);
                }
                50% {
                    box-shadow: 0 0 20px var(--aqi-glow);
                }
            }

            .gauge {
                animation: pulseGlow 3s ease-in-out infinite;
            }

            /* Responsive */
            @media (max-width: 400px) {
                .content {
                    flex-direction: column;
                    text-align: center;
                }

                .data {
                    align-items: center;
                }
            }
        </style>

        <article class="card" role="meter" aria-labelledby="district-label" aria-valuemin="0" aria-valuemax="500" aria-valuenow="0">
            <div class="header">
                <span class="district" id="district-label">${district}</span>
                <span class="icon-container">
                    ${this.getWindIcon('#94a3b8')}
                </span>
            </div>
            
            <div class="content">
                <div class="gauge-container">
                    <div class="gauge">
                        <div class="gauge-inner">
                            <div class="aqi-value">--</div>
                            <div class="aqi-label">AQI</div>
                        </div>
                    </div>
                </div>
                
                <div class="data">
                    <div class="pm25-display">
                        <span class="pm25-value">--</span>
                        <span class="pm25-unit">μg/m³</span>
                    </div>
                    <div class="status-badge">
                        <span class="status-th">รอข้อมูล...</span>
                        <span class="status-en">Loading...</span>
                    </div>
                    <span class="label">PM2.5</span>
                </div>
            </div>
        </article>
        `;
    }
}

// Register Web Component
customElements.define('aqi-card', AqiCard);