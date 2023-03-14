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
</p>

> Sitemap generator for Remix applications

## Overview

### Features

- Generate Sitemap in Runtime
- Handle Static Optional Paths

## Installation

```sh
npm i remix-sitemap
```

## Usage
```ts
// entry.server.tsx
import { createSitemapGenerator } from 'remix-sitemap';

// setup the generator
const { isSitemapUrl, sitemap } = createSitemapGenerator({
  siteUrl: 'https://example.com'
})

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  //  
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

## Config
This library is a little inspired in [next-sitemap](https://www.npmjs.com/package/next-sitemap) so the config is pretty much the same

| Property                       | Description                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| siteUrl                        | Base url of your website                                                              |
| changefreq (optional)          | Change frequency. Default `daily`                                                     |
| priority (optional)            | Priority. Default `0.7`                                                               |
| autoLastmod (optional)         | Add `<lastmod/>` property. Default `true`                                             |
| sitemapBaseFileName (optional) | The name of the generated sitemap file before the file extension. Default `"sitemap"` |
| optionalSegments (optional)    | possible values of optional segments                                                  |
| alternateRefs (optional)       | multi language support by unique url. Default `[]`                                    |


---

## Generate Sitemap for Dynamic Routes
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

## Usage with Optional Segments
with optional segments layouts to has a static data like the languages you can add `values` to sitemap config
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
