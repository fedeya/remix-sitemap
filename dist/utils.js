"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntry = exports.getEntryXml = void 0;
const ufo_1 = require("ufo");
const getEntryXml = (config, entry) => {
    var _a, _b, _c;
    return `
  <url>
    <loc>${(0, ufo_1.cleanDoubleSlashes)(`${config.siteUrl}/${entry === null || entry === void 0 ? void 0 : entry.route}`)}</loc>
    ${config.autoLastmod || (entry === null || entry === void 0 ? void 0 : entry.lastmod)
        ? `<lastmod>${(_a = entry === null || entry === void 0 ? void 0 : entry.lastmod) !== null && _a !== void 0 ? _a : new Date().toISOString()}</lastmod>`
        : ''}
    <changefreq>${(_b = entry === null || entry === void 0 ? void 0 : entry.changefreq) !== null && _b !== void 0 ? _b : config.changefreq}</changefreq>
    <priority>${(_c = entry === null || entry === void 0 ? void 0 : entry.priority) !== null && _c !== void 0 ? _c : config.priority}</priority>
  </url>
`;
};
exports.getEntryXml = getEntryXml;
const getEntry = async (config, key, modules, manifest) => {
    var _a, _b;
    const routeManifest = manifest.routes[key];
    if (routeManifest.id === 'root')
        return '';
    const entry = modules[key];
    const handle = ((_a = entry.handle) === null || _a === void 0 ? void 0 : _a.sitemap) || {};
    if (handle.exclude)
        return '';
    const parents = (_b = routeManifest.parentId) === null || _b === void 0 ? void 0 : _b.split('/');
    const path = routeManifest.index ? '' : routeManifest.path;
    if ((path === null || path === void 0 ? void 0 : path.includes(':')) && !handle.generateEntries)
        return '';
    const optionalPathValues = {};
    if (parents && parents.length > 1) {
        parents === null || parents === void 0 ? void 0 : parents.forEach((partialId, index) => {
            var _a;
            if (index === 0)
                return [];
            const parentId = new Array(index)
                .fill(1)
                .map((_, i) => parents[i])
                .concat(partialId)
                .join('/');
            const module = modules[parentId];
            const handle = ((_a = module === null || module === void 0 ? void 0 : module.handle) === null || _a === void 0 ? void 0 : _a.sitemap) || {};
            if (handle.values) {
                optionalPathValues[partialId] = handle.values;
            }
        });
    }
    const optionalPaths = Object.keys(optionalPathValues);
    const entries = handle.generateEntries
        ? await handle.generateEntries()
        : null;
    if (optionalPaths.length === 0) {
        if (!entries)
            return (0, exports.getEntryXml)(config, { route: path });
        return entries.map(entry => (0, exports.getEntryXml)(config, entry)).join(`\n`);
    }
    const xml = optionalPaths.map(optionalPath => {
        var _a;
        const pathValues = optionalPathValues[optionalPath];
        const finalEntry = pathValues.map(value => {
            var _a;
            const parentPath = (_a = routeManifest.parentId) === null || _a === void 0 ? void 0 : _a.replace(optionalPath, value).split('/');
            parentPath === null || parentPath === void 0 ? void 0 : parentPath.shift();
            const joinedPath = parentPath === null || parentPath === void 0 ? void 0 : parentPath.join('/');
            if (!entries) {
                return (0, exports.getEntryXml)(config, {
                    route: `${joinedPath}/${path}`
                });
            }
            else {
                return entries
                    .map(entry => (0, exports.getEntryXml)(config, {
                    ...entry,
                    route: `${joinedPath}/${entry.route}`
                }))
                    .join('\n');
            }
        });
        const pathWithoutOptional = (_a = routeManifest.parentId) === null || _a === void 0 ? void 0 : _a.replace(optionalPath, '').split('/');
        pathWithoutOptional === null || pathWithoutOptional === void 0 ? void 0 : pathWithoutOptional.shift();
        const joinedPathWithoutOptional = pathWithoutOptional === null || pathWithoutOptional === void 0 ? void 0 : pathWithoutOptional.join('/');
        const fullPath = `${joinedPathWithoutOptional}/${path}`;
        if (fullPath && !fullPath.includes(':')) {
            finalEntry.push((0, exports.getEntryXml)(config, {
                route: `${joinedPathWithoutOptional}/${path}`
            }));
        }
        return finalEntry.join(`\n`);
    });
    return xml.join('\n');
};
exports.getEntry = getEntry;
