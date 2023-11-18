<h1>Remix Sitemap</h1>
<p>
  <a href="https://www.npmjs.com/package/remix-sitemap" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/remix-sitemap.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://github.com/fedeya/remix-sitemap/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/fedeya/remix-sitemap/actions/workflows/ci.yml/badge.svg">    
  </a>
</p>

> Sitemap generator for Remix applications

## ✨ Features

- Runtime & Build time Generation
- Generate `robots.txt`
- v2 Route Convention Support
- Splitting Sitemaps

## 📚 Table Of Contents

- [✨ Features](#-features)
- [📚 Table Of Contents](#-table-of-contents)
- [🚀 Getting Started](#-getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Runtime Generation](#runtime-generation)
    - [Build time Generation](#build-time-generation)
- [📝 Guides](#-guides)
  - [Generate Sitemap for Dynamic Routes](#generate-sitemap-for-dynamic-routes)
  - [Exclude Route](#exclude-route)
  - [Google: News, Image and Video](#google-news-image-and-video)
  - [Splitting Sitemaps](#splitting-sitemaps)
  - [Caching](#caching)
- [📖 API Reference](#-api-reference)
  - [Config](#config)
    - [RobotsTxtOptions](#robotstxtoptions)
- [👤 Author](#-author)
- [🤝 Contributing](#-contributing)
- [Show your support](#show-your-support)
- [Acknowledgements](#acknowledgements)


## 🚀 Getting Started

### Installation

```sh
npm i remix-sitemap
```

### Usage

#### Runtime Generation
```ts
// entry.server.tsx
import { createSitemapGenerator } from 'remix-sitemap';

// Step 1. setup the generator
const { isSitemapUrl, sitemap } = createSitemapGenerator({
  siteUrl: 'https://example.com',
  generateRobotsTxt: true
  // configure other things here
})

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // Step 2. add the sitemap response
  if (isSitemapUrl(request)) 
    return await sitemap(request, remixContext);

  let markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}

```

<details>
    <summary>Usage with sitemap[.]xml route <strong>(experimental)</strong></summary>

<br>

1. Create a `lib/sitemap.ts` file
```ts
// lib/sitemap.ts
export const { experimental_sitemap, robots } = createSitemapGenerator({
  siteUrl: 'https://example.com',
  // configure other things here
})
```

2. Create a `sitemap[.]xml` route
```ts
// app/routes/sitemap[.]xml.tsx
import { routes } from '@remix-run/dev/server-build';
import { experimental_sitemap } from '~/lib/sitemap';

export const loader: LoaderFunction = async ({ request }) => {
    return await experimental_sitemap(request, routes);
}
```


3. Create a `robots[.]txt` route
```ts
// app/routes/robots[.]txt.tsx
import { robots } from '~/lib/sitemap';

export const loader: LoaderFunction = ({ request }) => {
    return robots();
}
```
</details>

#### Build time Generation 

Create a `remix-sitemap.config.js` file at the project root
```ts
/** @type {import('remix-sitemap').Config} */
module.exports = {
  siteUrl: 'https://example.com',
  generateRobotsTxt: true
  // configure other things here
}
```
Add a script using `remix-sitemap` to `package.json` to run after build.

For example if you are using `npm-run-all`
```json
{
  "scripts": {
    "build": "npm-run-all build:*",
    "build:remix": "remix build",
    "build:sitemap": "remix-sitemap" 
  }
}
```

## 📝 Guides

### Generate Sitemap for Dynamic Routes
> If you are using build time generation, the request will be empty
```ts
// app/routes/posts.$slug.tsx
import type { SitemapFunction } from 'remix-sitemap';

export const sitemap: SitemapFunction = ({ config, request }) => {
  const posts = await getPosts();
  
  return posts.map(post => ({
    loc: `/posts/${post.slug}`, 
    lastmod: post.updatedAt,
    exclude: post.isDraft, // exclude this entry
    // acts only in this loc
    alternateRefs: [
      {
        href: `${config.siteUrl}/en/posts/${post.slug}`,
        absolute: true,
        hreflang: 'en'
      },
      {
        href: `${config.siteUrl}/es`,
        hreflang: 'es'
      }
    ]
  }));
};
```

### Exclude Route
```ts
// app/routes/private.tsx
import type { SitemapFunction } from 'remix-sitemap';

export const sitemap: SitemapFunction = () => ({
  exclude: true
})
```

### Google: News, Image and Video
Url set can contain additional sitemaps defined by google. These are Google [news](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap), [image](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps) or [video](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps).
You can add these sitemaps in `sitemap function` by adding the `news`, `images` or `videos` property.
```ts
export const sitemap: SitemapFunction = () => ({
  images: [{ loc: 'https://example.com/example.jpg' }],
  news: [{
    title: 'Random News',
    date: '2023-03-15',
    publication: {
      name: 'The Example Times',
      language: 'en'
    }
  }]
});
```

### Splitting Sitemaps
If you have a lot of urls, you can split the sitemap in multiple files. You can do this by setting the `size` property in the config.
> This is only available in build time generation
```ts
/** @type {import('remix-sitemap').Config} */
module.exports = {
  siteUrl: 'https://example.com',
  size: 10000
}
```

### Caching
you have two ways to cache the sitemap, the first one is using the `Cache-Control` header
> This is only available in runtime generation
```ts
createSitemapGenerator({
  siteUrl: 'https://example.com',
  headers: {
    'Cache-Control': 'max-age=3600'
  }
})
```
and the second one is using the `cache` property in the config
```ts
createSitemapGenerator({
  siteUrl: 'https://example.com',
  cache: {
    get: async () => {
      return await redis.get('sitemap') || null;
    },
    set: async (sitemap) => {
      await redis.set('sitemap', sitemap, 'EX', 3600);
    }
  }
})
```

## 📖 API Reference

### Config

- `siteUrl`: the website base url
- `autoLastmod = true`: (*optional*) Add `<lastmod />` property with the current date.
- `priority = 0.7`: (*optional*) default priority for all entries.
- `changefreq = 'daily'`: (*optional*) default changefreq for all entries.
- `format = false`: (*optional*) format the sitemap for a better view.
- `alternateRefs = []`: (*optional*) default multi language support by unique url for all entries.
- `generateRobotsTxt = false`: (*optional*) generate `robots.txt` file.
- `robotsTxtOptions`: (*optional*) options for generating `robots.txt` [details](#RobotsTxtOptions).
- `rateLimit`: (*optional*) limits the number of `sitemap` functions that can execute at once.

**Runtime only**
- `headers = {}`: (*optional*) headers for the sitemap and robots.txt response.
- `cache`: (*optional*) cache the sitemap [details](#Caching).

**Build Time only**
- `generateIndexSitemap = true`: (*optional*) generate index sitemap.
- `sitemapBaseFileName = 'sitemap'`: (*optional*) the name of the generated sitemap file before the file extension.
- `outDir = 'public'`: (*optional*) the directory to create the sitemaps files.
- `size = 50000`: (*optional*) max size of the sitemap.

#### RobotsTxtOptions
- `policies = []`: (*optional*) policies for generating `robots.txt`.
- `additionalSitemaps = []`: (*optional*) add additionals sitemaps to `robots.txt`.


## 👤 Author

 **Fedeya <hello@fedeminaya.com>**

- Website: [fedeminaya.com](https://fedeminaya.com)
- Twitter: [@fedeminaya](https://twitter.com/fedeminaya)
- Github: [@fedeya](https://github.com/fedeya)
- LinkedIn: [@federico-minaya](https://linkedin.com/in/federico-minaya)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Fedeya/next-sanity-client/issues).

## Show your support

Give a ⭐️ if this project helped you!

## Acknowledgements

- [nasa-gcn/remix-seo](https://github.com/nasa-gcn/remix-seo) for finding the posibility to use the server build at runtime.
