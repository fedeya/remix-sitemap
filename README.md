<h1>Remix Sitemap</h1>
<p>
  <a href="https://www.npmjs.com/package/remix-sitemap" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/remix-sitemap.svg">
  </a>
  <a href="https://www.npmjs.com/package/remix-sitemap" target="_blank">
    <img alt="npm" src="https://img.shields.io/npm/dt/remix-sitemap">    
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://github.com/fedeya/remix-sitemap/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/fedeya/remix-sitemap/actions/workflows/ci.yml/badge.svg">    
  </a>
</p>

> Sitemap generator for Remix applications

## Overview

### Features

- Runtime Generation
- Build time Generation (Experimental)
- Handle Static Optional Paths

## Installation

```sh
npm i remix-sitemap
```

## Usage
For generate the sitemap we have 2 ways.
### 1. Runtime Generation
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
### 2. Build time Generation (Experimental)

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

## Config
This library is a little inspired in [next-sitemap](https://www.npmjs.com/package/next-sitemap) so the config is pretty much the same

| Property                                       | Description                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| siteUrl                                        | Base url of your website                                                              |
| changefreq (optional)                          | Change frequency. Default `daily`                                                     |
| priority (optional)                            | Priority. Default `0.7`                                                               |
| autoLastmod (optional)                         | Add `<lastmod/>` property. Default `true`                                             |
| sitemapBaseFileName (optional)                 | The name of the generated sitemap file before the file extension. Default `"sitemap"` |
| optionalSegments (optional)                    | possible values of optional segments                                                  |
| alternateRefs (optional)                       | multi language support by unique url. Default `[]`                                    |
| outDir (optional)                              | The directory to create the sitemaps files. Default `"public"`                        |
| generateRobotsTxt (optional)                   | Generate `robots.txt` file. Default `false`                                           |
| robotsTxtOptions.policies (optional)           | Policies for generating `robots.txt`                                                  |
| robotsTxtOptions.additionalSitemaps (optional) | Add additionals sitemaps to `robots.txt`                                              |


---

## Generate Sitemap for Dynamic Routes
> If you are using build time generation, the request in `generateEntries` will be empty
```ts
// app/routes/posts.$slug.tsx
import type { SitemapHandle } from 'remix-sitemap';

export const handle: SitemapHandle = {
  sitemap: { 
    async generateEntries(request) {
      const posts = await getPosts();
      
      return posts.map(post => {
        return { 
          loc: `/posts/${post.slug}`, 
          lastmod: post.updatedAt,
          // acts only in this loc
          alternateRefs: [
            {
              href: 'https://en.example.com',
              hreflang: 'en'
            },
            {
              href: 'https://es.example.com',
              hreflang: 'es'
            }
          ]
        }
      })
    }
  }
};
```

## Exclude Route
```ts
// app/routes/private.tsx
import type { SitemapHandle } from 'remix-sitemap';

export const handle: SitemapHandle = {
  sitemap: { 
    exclude: true 
  }
};
```

## Google: News, Image and Video
Url set can contain additional sitemaps defined by google. These are Google [news](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap), [image](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps) or [video](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps).
You can add these sitemaps in `generateEntries`
```ts
export const handle: SitemapHandle = {
  sitemap: {
    async generateEntries() {
      return [
        {
          loc: '/news/random-news',
          images: [{ loc: 'https://example.com/example.jpg' }],
          news: [{
            title: 'Random News',
            date: '2023-03-15',
            publication: {
              name: 'The Example Times',
              language: 'en'
            }
          }]
        }
      ]
    }
  }
}
```


## Usage with Optional Segments
with optional segments layouts to has a static data like the languages you can add `values` to sitemap config
> this is just an example for multiple language it is recommended to use the `alternateRefs` property
```ts
// app/routes/($lang).tsx
import type { SitemapHandle } from 'remix-sitemap';

export const handle: SitemapHandle = {
  sitemap: { 
    values: ['en', 'es']
  }
};
```
and the routes inside get the automapping with all of the defined `values`
for example
```
routes/($lang)/blog.tsx -> https://example.com/blog
                        -> https://example.com/en/blog
                        -> https://example.com/es/blog
```
this also works with dynamic routes within the optional segment, with the values defined in the optional segment route you can avoid to returning the repeated entries with the optional segments in your `generateEntries`

also if you don't have a layout for the optional segment, you can define it in the global config with the `optionalSegments` property
```ts
const { isSitemapUrl, sitemap } = createSitemapGenerator({
  siteUrl: 'https://example.com',
  optionalSegments: {
    '($lang)': ['en', 'es']
  }
}) 
```

### How to disable it
For avoid the default behaviour of the `optionalSegments` you can disable it with the `addOptionalSegments` property on the `handle`
```ts
// app/routes/($lang)/blog.$slug.tsx
export const handle: SitemapHandle = {
  sitemap: {
    addOptionalSegments: false
  }
}
```


## Author

👤 **Fedeya <hello@fedeminaya.com>**

- Website: [fedeminaya.com](https://fedeminaya.com)
- Twitter: [@fedeminaya](https://twitter.com/fedeminaya)
- Github: [@fedeya](https://github.com/fedeya)
- LinkedIn: [@federico-minaya](https://linkedin.com/in/federico-minaya)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Fedeya/next-sanity-client/issues).

## Show your support

Give a ⭐️ if this project helped you!
