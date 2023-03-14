"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSitemapGenerator = void 0;
const utils_1 = require("./utils");
const createSitemapGenerator = (config) => {
    var _a, _b, _c, _d;
    const defaultConfig = {
        ...config,
        autoLastmod: (_a = config.autoLastmod) !== null && _a !== void 0 ? _a : true,
        changefreq: (_b = config.changefreq) !== null && _b !== void 0 ? _b : 'daily',
        priority: (_c = config.priority) !== null && _c !== void 0 ? _c : 0.7,
        sitemapBaseFileName: (_d = config.sitemapBaseFileName) !== null && _d !== void 0 ? _d : 'sitemap'
    };
    return {
        sitemap: (request, context) => sitemapGenerator(defaultConfig, request, context),
        isSitemapUrl(request) {
            const url = new URL(request.url);
            return url.pathname === `/${defaultConfig.sitemapBaseFileName}.xml`;
        }
    };
};
exports.createSitemapGenerator = createSitemapGenerator;
const sitemapGenerator = async (config, request, context) => {
    const modules = context.routeModules;
    const urls = await Promise.all(Object.keys(modules).map(key => {
        var _a, _b, _c;
        return (0, utils_1.getEntry)({
            ...config,
            autoLastmod: (_a = config.autoLastmod) !== null && _a !== void 0 ? _a : true,
            changefreq: (_b = config.changefreq) !== null && _b !== void 0 ? _b : 'daily',
            priority: (_c = config.priority) !== null && _c !== void 0 ? _c : 0.7
        }, key, modules, context.manifest);
    }));
    const set = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    ${urls.join('\n')}
    </urlset>
  `;
    return new Response(set, {
        headers: {
            'Content-Type': 'application/xml'
        }
    });
};
