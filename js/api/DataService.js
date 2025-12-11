// Configs (คุณสามารถแยกไฟล์ config.js ได้)
const API_CONFIG = {
    klong: {
        pm_channel: "3027679", pm_key: "4M306YRQZ87072KV", pm_field: 1,
        temp_channel: "3027679", temp_key: "4M306YRQZ87072KV", temp_field: 4
    },
    thon: {
        pm_channel: "3192372", pm_key: "ZWT3K5EV765AJITU", pm_field: 1,
        temp_channel: "3192372", temp_key: "ZWT3K5EV765AJITU", temp_field: 2
    },
    bang: {
        pm_channel: "3192391", pm_key: "862VYY6T19BO3KLK", pm_field: 1,
        temp_channel: "3192391", temp_key: "862VYY6T19BO3KLK", temp_field: 2
    }
};

export class DataService {
    constructor() {
        this.cache = {};
    }

    // Helper: Fetch with Timeout
    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } finally {
            clearTimeout(id);
        }
    }

    async getThingSpeakField(channelId, apiKey, fieldId) {
        const url = `https://api.thingspeak.com/channels/${channelId}/fields/${fieldId}/last.json?api_key=${apiKey}`;
        try {
            const data = await this.fetchWithTimeout(url);
            const val = parseFloat(data[`field${fieldId}`]);
            return isNaN(val) ? null : val;
        } catch (error) {
            console.warn(`Failed to fetch TS Channel ${channelId}:`, error);
            return null;
        }
    }

    // Main Public Method
    async getDistrictData(districtKey) {
        // ตัวอย่างการดึง PM2.5 แบบใหม่
        const conf = API_CONFIG[districtKey];
        if (!conf) return null;

        const [pm25, temp] = await Promise.all([
            this.getThingSpeakField(conf.pm_channel, conf.pm_key, conf.pm_field),
            this.getThingSpeakField(conf.temp_channel, conf.temp_key, conf.temp_field)
        ]);

        return {
            id: districtKey,
            pm25: pm25,
            temp: temp,
            timestamp: new Date()
        };
    }
}