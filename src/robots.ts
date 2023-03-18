import type { Policy, Config } from './lib/types';

function getPolicy(policy: Policy) {
  const { allow, disallow, userAgent } = policy;

  let policyStr = `# ${userAgent}\nUser-agent: ${userAgent}`;

  if (allow) {
    const allowStr = Array.isArray(allow) ? allow.join('\nAllow: ') : allow;

    policyStr += `\nAllow: ${allowStr}`;
  }

  if (disallow) {
    const disallowStr = Array.isArray(disallow)
      ? disallow.join('\nDisallow: ')
      : disallow;

    policyStr += `\nDisallow: ${disallowStr}`;
  }

  return policyStr;
}

function getSitemap(sitemap: string) {
  return `Sitemap: ${sitemap}`;
}

export function getRobots(config: Config) {
  const options = config.robotsTxtOptions;

  let str = '';

  const policies = options?.policies?.map(getPolicy);

  if (policies?.length) {
    str += policies.join('\n\n');

    str += '\n\n';
  }

  str += `# Host\nHost: ${config.siteUrl}\n\n`;

  const sitemaps = [`${config.siteUrl}/${config.sitemapBaseFileName}.xml`]
    .concat(options?.additionalSitemaps || [])
    .map(getSitemap);

  if (sitemaps?.length) {
    str += '# Sitemaps\n';
    str += sitemaps.join('\n');
  }

  return str;
}

export function robotsResponse(config: Config) {
  const robots = getRobots(config);

  if (!robots) return;

  const bytes = new TextEncoder().encode(robots).byteLength;

  return new Response(robots, {
    headers: {
      ...(config.headers || {}),
      'Content-Type': 'text/plain',
      'Content-Length': bytes.toString()
    }
  });
}
