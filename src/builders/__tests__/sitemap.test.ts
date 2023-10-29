import { getConfig } from '../../lib/config';
import { buildSitemapXml, buildSitemapUrl } from '../sitemap';

const getUrlSetXml = (urls: string) =>
  `<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><urlset xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\" xmlns:news=\\"http://www.google.com/schemas/sitemap-news/0.9\\" xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\" xmlns:image=\\"http://www.google.com/schemas/sitemap-image/1.1\\" xmlns:video=\\"http://www.google.com/schemas/sitemap-video/1.1\\">${urls}</urlset>`;

describe('sitemap builder', () => {
  const config = getConfig({
    siteUrl: 'https://example.com',
    autoLastmod: false
  });

  it('snapshot test for google images', () => {
    const url = buildSitemapUrl({
      config,
      entry: {
        loc: '/test',
        images: [
          {
            loc: 'https://example.com/image.jpg'
          }
        ]
      }
    });

    const sitemap = buildSitemapXml([url]);

    expect(sitemap).toMatchInlineSnapshot(`
      "${getUrlSetXml(
        '<url><loc>https://example.com/test</loc><changefreq>daily</changefreq><priority>0.7</priority><image:image><image:loc>https://example.com/image.jpg</image:loc></image:image></url>'
      )}"
    `);
  });

  it('snapshot test for google news', () => {
    const url = buildSitemapUrl({
      config,
      entry: {
        loc: '/test',
        news: [
          {
            date: '2021-01-01',
            publication: {
              name: 'Example',
              language: 'en'
            },
            title: 'Example title'
          }
        ]
      }
    });

    const sitemap = buildSitemapXml([url]);

    expect(sitemap).toMatchInlineSnapshot(`
      "${getUrlSetXml(
        '<url><loc>https://example.com/test</loc><changefreq>daily</changefreq><priority>0.7</priority><news:news><news:publication><news:name>Example</news:name><news:language>en</news:language></news:publication><news:publication_date>2021-01-01</news:publication_date><news:title>Example title</news:title></news:news></url>'
      )}"
    `);
  });

  it('snapshot test for google video', () => {
    const url = buildSitemapUrl({
      config,
      entry: {
        loc: '/test',
        videos: [
          {
            contentLoc: 'https://example.com/video.mp4',
            title: 'Example video',
            description: 'Example video description',
            thumbnailLoc: 'https://example.com/thumbnail.jpg',
            playerLoc: 'https://example.com/player',
            duration: 60,
            expirationDate: '2021-01-01',
            rating: 4.5,
            viewCount: 100,
            publicationDate: '2021-01-01',
            familyFriendly: false,
            restriction: {
              relationship: 'allow',
              countries: ['US', 'CA']
            },
            price: {
              currency: 'USD',
              value: 1.99
            },
            tags: ['example', 'video'],
            requiresSubscription: true,
            uploader: {
              name: 'Example',
              info: 'https://example.com/uploader'
            },
            live: true
          }
        ]
      }
    });

    const sitemap = buildSitemapXml([url]);

    expect(sitemap).toMatchInlineSnapshot(`
      "${getUrlSetXml(
        '<url><loc>https://example.com/test</loc><changefreq>daily</changefreq><priority>0.7</priority><video:video><video:thumbnail_loc>https://example.com/thumbnail.jpg</video:thumbnail_loc><video:title>Example video</video:title><video:description>Example video description</video:description><video:content_loc>https://example.com/video.mp4</video:content_loc><video:player_loc>https://example.com/player</video:player_loc><video:duration>60</video:duration><video:expiration_date>2021-01-01</video:expiration_date><video:rating>4.5</video:rating><video:view_count>100</video:view_count><video:publication_date>2021-01-01</video:publication_date><video:family_friendly>no</video:family_friendly><video:restriction relationship=\\"allow\\">US CA</video:restriction><video:price currency=\\"USD\\">1.99</video:price><video:requires_subscription>yes</video:requires_subscription><video:uploader info=\\"https://example.com/uploader\\">Example</video:uploader><video:live>yes</video:live><video:tag>example</video:tag><video:tag>video</video:tag></video:video></url>'
      )}"
    `);
  });

  it('snapshot test for alternateRefs', () => {
    const urlUsingAbsolute = buildSitemapUrl({
      config,
      entry: {
        loc: '/test',
        alternateRefs: [
          {
            href: 'https://example.com/en/test',
            absolute: true,
            hreflang: 'en'
          }
        ]
      }
    });

    let sitemap = buildSitemapXml([urlUsingAbsolute]);

    expect(sitemap).toMatchInlineSnapshot(`
      "${getUrlSetXml(
        '<url><loc>https://example.com/test</loc><changefreq>daily</changefreq><priority>0.7</priority><xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.com/en/test\\"/></url>'
      )}"
    `);

    const urlUsingRelative = buildSitemapUrl({
      config,
      entry: {
        loc: '/test',
        alternateRefs: [
          {
            href: 'https://example.com/en',
            hreflang: 'en'
          }
        ]
      }
    });

    sitemap = buildSitemapXml([urlUsingRelative]);

    expect(sitemap).toMatchInlineSnapshot(`
      "${getUrlSetXml(
        '<url><loc>https://example.com/test</loc><changefreq>daily</changefreq><priority>0.7</priority><xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.com/en/test\\"/></url>'
      )}"
    `);
  });

  it('should process html entities', () => {
    const url = buildSitemapUrl({
      config,
      entry: {
        loc: '/test',
        news: [
          {
            date: '2021-01-01',
            publication: {
              name: 'Example',
              language: 'en'
            },
            title: 'Example title &'
          }
        ]
      }
    });

    const sitemap = buildSitemapXml([url]);

    expect(sitemap).toMatchInlineSnapshot(`
      "${getUrlSetXml(
        '<url><loc>https://example.com/test</loc><changefreq>daily</changefreq><priority>0.7</priority><news:news><news:publication><news:name>Example</news:name><news:language>en</news:language></news:publication><news:publication_date>2021-01-01</news:publication_date><news:title>Example title &amp;</news:title></news:news></url>'
      )}"
    `);
  });
});
