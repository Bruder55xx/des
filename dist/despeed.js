"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const speed_js_1 = __importDefault(require("./utils/speed.js"));
const logger_js_1 = __importDefault(require("./utils/logger.js"));
const helper_js_1 = require("./utils/helper.js");
const banner_js_1 = __importDefault(require("./utils/banner.js"));

const INTERVAL = 60 * 60 * 1000;
const BASEURL = "https://app.despeed.net";
async function getCurrentLocation(proxy) {
    const agent = helper_js_1.newAgent(proxy)
    try {
        const response = await (0, node_fetch_1.default)('https://ipinfo.io/json', {
            agent,
        });
        const data = await response.json();
        if (data.loc) {
            const [latitude, longitude] = data.loc.split(',').map(Number);
            return { latitude, longitude };
        }
        else {
            throw new Error('Unable to fetch location from IP');
        }
    }
    catch (error) {
        logger_js_1.default.error('❌ Error fetching location:', error.message);
        return { latitude: 0, longitude: 0 };
    }
}
function getHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'sec-ch-ua': '"Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        Origin: 'https://app.despeed.net',
        Referer: 'https://app.despeed.net/dashboard',
    };
}
async function reportResults(baseUrl, token, downloadSpeed, uploadSpeed, proxy) {
    const agent = helper_js_1.newAgent(proxy)
    const { latitude, longitude } = await getCurrentLocation(proxy);
    try {
        logger_js_1.default.info(`📡 Reporting results to backend...`);
        logger_js_1.default.info(`🌍 Location:`, { latitude, longitude });
        const body = JSON.stringify({
            download_speed: downloadSpeed,
            upload_speed: uploadSpeed.toFixed(2).toString(),
            latitude,
            longitude
        });
        const response = await (0, node_fetch_1.default)(`${baseUrl}/v1/api/points`, {
            method: 'POST',
            headers: {
                ...getHeaders(token),
                'Content-Type': 'application/json',
            },
            body,
            agent,
        });
        if (!response.ok) {
            const errorMsg = `Failed to report results. Status: ${response.status} ${response.statusText}`;
            throw new Error(errorMsg);
        }
        const data = await response.json();
        if (data.success) {
            logger_js_1.default.info('✅ Results reported successfully', `\n`);
            return data;
        }
        else {
            throw new Error(data.message || 'Failed to report results');
        }
    }
    catch (error) {
        logger_js_1.default.error('❌ Error while reporting results:', `${error.message}\n`);
        return null;
    }
}
async function displayAccountInfo(token, proxy) {
    const agent = helper_js_1.newAgent(proxy)
    try {
        const profileResponse = await (0, node_fetch_1.default)(`${BASEURL}/v1/api/auth/profile`, {
            headers: getHeaders(token),
            agent,
        });
        if (profileResponse.ok) {
            const profile = await profileResponse.json();
            const lastCheckIn = profile?.data?.last_claimed_at || null;
            logger_js_1.default.info(`🌀 Username:`, profile?.data?.username || 'Not Set');
            logger_js_1.default.info(`🌀 Points:`, profile?.data?.points || 0);
            logger_js_1.default.info(`🌀 Last Checkin:`, lastCheckIn);
            const now = new Date();
            const Lastdate = new Date(lastCheckIn);
            const Lastday = Lastdate.getDate();
            if (Lastday < now.getDate()) {
                logger_js_1.default.info(`🌀 Trying to Checkin Today...`);
                await dailyCheckin(token, proxy);
            }
            else {
                logger_js_1.default.info(`🌀 Already Checkin Today...`);
            }
        }
        else {
            logger_js_1.default.error(`❌ Failed to fetch profile. Status: ${profileResponse.status}`);
        }
    }
    catch (error) {
        logger_js_1.default.error('❌ Failed to fetch account information:', error.message);
    }
}
async function checkEligTest(token, proxy) {
    const agent = helper_js_1.newAgent(proxy)
    const body = JSON.stringify({});
    try {
        const eligResponse = await (0, node_fetch_1.default)(`${BASEURL}/v1/api/speedtest-eligibility`, {
            method: 'POST',
            headers: {
                ...getHeaders(token),
                'Content-Type': 'application/json',
            },
            body,
            agent,
        });
        if (eligResponse.ok) {
            const eligibility = await eligResponse.json();
            logger_js_1.default.info(`🌀 Eligibility Today:`, eligibility?.data?.today || { total: 0 });
            logger_js_1.default.info(`🌀 Is Eligible to Send Report speedtest:`, eligibility?.data?.isEligible || false);
            logger_js_1.default.info('=X= =============ZLKCYBER============= =X=');
            return eligibility?.data?.isEligible || false;
        }
        else {
            logger_js_1.default.error(`❌ Failed to fetch eligibility. Status: ${eligResponse.status}`);
        }
    }
    catch (error) {
        logger_js_1.default.error('❌ Failed to fetch fetch eligibility:', error.message);
        return false;
    }
}
async function dailyCheckin(token, proxy) {
    const agent = helper_js_1.newAgent(proxy)
    const body = JSON.stringify({});
    try {
        const dailyResponse = await (0, node_fetch_1.default)(`${BASEURL}/v1/api/daily-claim`, {
            method: 'POST',
            headers: {
                ...getHeaders(token),
                'Content-Type': 'application/json',
            },
            body,
            agent,
        });
        if (dailyResponse.ok) {
            const daily = await dailyResponse.json();
            logger_js_1.default.info(`✅ Daily CheckIn Result:`, daily?.message);
            return daily;
        }
        else {
            logger_js_1.default.error('❌ Failed to fetch daily checkin result:', dailyResponse.status);
        }
    }
    catch (error) {
        logger_js_1.default.error('❌ Failed to fetch account information:', error.message);
        return false;
    }
}
// Main loop
async function main() {
    const tokens = await (0, helper_js_1.readFile)('tokens.txt');
    if (tokens.length === 0) {
        logger_js_1.default.error('No tokens found in tokens.txt - Exiting...');
        return;
    }
    const proxies = await (0, helper_js_1.readFile)('proxy.txt');
    if (proxies.length === 0) {
        logger_js_1.default.warn('No proxy found in proxy.txt - Run Without Proxy...');
    }

    try {
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const proxy = proxies[i % proxies.length] || null;
            logger_js_1.default.info(`=X= ====== Procesing Account ${i + 1} ======= =X=`);
            logger_js_1.default.warn(proxy ? `🌀 Running with proxy: ${proxy}` : `🌀 running without proxy`);
            await displayAccountInfo(token, proxy);
            const isElig = await checkEligTest(token, proxy);
            if (!isElig) continue;

            const { downloadSpeed, uploadSpeed } = await (0, speed_js_1.default)();
            await reportResults(BASEURL, token, downloadSpeed, uploadSpeed, proxy);
        }
    }
    catch (error) {
        logger_js_1.default.error('❌ Error:', error.message);
        if (error.response) {
            try {
                if (error instanceof Error && error.response) {
                    const errorData = await error.response.json();
                    logger_js_1.default.error('❌ Server Response:', errorData);
                }
            }
            catch (error) {
                if (error instanceof Error && error.response) {
                    logger_js_1.default.error('❌ Status Code:', error.response.status);
                }
                else {
                    logger_js_1.default.error('❌ Unknown error:', error);
                }
            }
        }
    }
    finally {
        logger_js_1.default.info(`All accounts processed. waiting 1 hours before next run...`);
        setTimeout(main, INTERVAL);
    }
}
console.log(banner_js_1.default);
main().catch((e) => {
    logger_js_1.default.error(`❌ Error occurred: ${e.message}`);
});
//# sourceMappingURL=despeed.js.map