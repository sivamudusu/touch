const geoip = require('geoip-lite')
const getCurrentContextData = (req)=>{
    const ip = req.clientIp||"unknown";
    const geo = geoip.lookup(ip);
    const country = geo?.country || "unknown";
    const region = geo?.region || "unknown";
    const city = geo?.city || "unknown";
    const browser = req.useragent?.browser
    ?`${req.useragent.browser} ${req.useragent.version}`
    :`unknown`;
    const platform = req.useragent?.platform
    ?req.useragent.platform.toString()
    :`unknown`;
    const os = req.useragent?.os
    ?req.useragent.os.toString()
    :`unknown`;
    const device = req.useragent?.device
    ?req.useragent.device.toString()
    :`unknown`;
    const isMobile = req.useragent?.isMobile || false
    const isTablet = req.useragent?.isTablet || false
    const isDesktop = req.useragent?.isDesktop || false
    const referer = req.headers?.['referer'] || 'unknown';
    const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : isDesktop ? "Desktop" : "unknown";
    return {
        ip,
        country,
        region,
        city,
        referer,
        deviceType,
        browser,
        platform,
        os,
        device,
        timestamp: new Date().toISOString()
    };
}
module.exports = getCurrentContextData;