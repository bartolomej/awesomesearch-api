const Website = require('../models/website');
const service = require('../services/website');
const repo = require('../web/repositories/website');
const fetchMock = require('fetch-mock');
const data = require('./mock-data');


describe('Website repository tests', function () {

  beforeEach(async () => await repo.removeAll());

  it('should initialize website from object', function () {
    const website = new Website();
    const obj = {
      "uid": "https://www.google.com",
      "url": "https://google.com",
      "title": "Google",
      "type": null,
      "name": null,
      "author": null,
      "description": null,
      "image": "https://google.com/favicon.ico",
      "keywords": [],
      "source": null,
      "updated": null
    };
    website.assign(obj);
    expect(website instanceof Website).toBeTruthy();
    expect(website).toEqual(obj);
  });

  function getExampleWebsite () {
    const website = new Website('https://example.com');
    website.title = 'Title';
    website.keywords = ['tech', 'money', 'example'];
    website.image = 'https://example-image.com';
    website.description = 'Some description ...';
    website.updated = new Date();
    return website;
  }

  it('should save website given website object', async function () {
    const website = getExampleWebsite();
    const saved = await repo.saveWebsite(website);
    expect(saved).toEqual(saved);
  });

  it('should update website given modified website object', async function () {
    const website = getExampleWebsite();
    const saved = await repo.saveWebsite(website);
    website.title = 'Some title...';
    const updated = await repo.saveWebsite(website);
    expect(updated).toEqual(website);
  });

  it('should fetch website by url given url string', async function () {
    const website = await repo.saveWebsite(getExampleWebsite());
    const fetched = await repo.getWebsiteByUrl('https://example.com');
    expect(fetched).toEqual(website);
  });

  it('should fetch websites by any attribute given regex', async function () {
    await repo.saveWebsite(getExampleWebsite());
    await repo.saveWebsite(getExampleWebsite());
    const fetched = await repo.getMatched(/te/);

    expect(fetched.length).toBe(2);
  });

});


describe('Website metadata parsing tests', function () {

  it('should parse flutter website html', async function () {
    const metadata = await service.getMetadata(data.flutterHtml, 'https://flutter.dev/');
    expect(metadata).toEqual({
      author: null,
      description: "Flutter is Google's UI toolkit for crafting beautiful, natively compiled applications for mobile, web, and desktop from a single codebase.  Flutter works with existing code, is used by developers and organizations around the world, and is free and open source.",
      image: "https://flutter.dev/images/flutter-logo-sharing.png",
      keywords: [],
      name: null,
      title: "Flutter - Beautiful native apps in record time",
      type: null,
      url: "https://flutter.dev"
    })
  });

  it('should parse node-js website html', async function () {
    const metadata = await service.getMetadata(data.nodejsHtml);
    expect(metadata).toEqual({
      author: null,
      name: null,
      type: 'website',
      url: 'https://glitch.com',
      title: 'Glitch',
      image: 'https://glitch.com/edit/images/logos/glitch/social-card@2x.png',
      keywords: ['developer', 'javascript', 'nodejs', 'editor', 'ide', 'development', 'online', 'web', 'code editor', 'html', 'css'],
      description: 'Combining automated deployment, instant hosting & collaborative editing, Glitch gets you straight to coding so you can build full-stack web apps, fast',
    })
  });

  it('should parse react-native website html', async function () {
    const metadata = await service.getMetadata(data.reactNativeHtml);
    expect(metadata).toEqual({
      author: null,
      name: null,
      type: 'website',
      url: 'https://reactnative.dev',
      title: 'React Native · A framework for building native apps using React',
      image: 'https://reactnative.dev/img/favicon.ico',
      keywords: [],
      description: 'A framework for building native apps using React',
    })
  });

});


describe('Website service tests', function () {

  beforeEach(fetchMock.reset);

  it('should scrape website given url', async function () {
    fetchMock.get(
      'https://reactnative.dev',
      data.reactNativeHtml
    );

    const html = await service.getHtml('https://reactnative.dev/');
    const website = await service.getMetadata(html);

    expect(website).toEqual({
      author: null,
      name: null,
      type: 'website',
      url: 'https://reactnative.dev',
      title: 'React Native · A framework for building native apps using React',
      image: 'https://reactnative.dev/img/logo-og.png',
      keywords: [],
      description: 'A framework for building native apps using React',
    });
  });

  it('should throw error given invalid url', async function () {
    fetchMock.get(
      'https://some-website-1.com', {
        throws: new Error('request to https://some-website.com failed, reason: getaddrinfo ENOTFOUND some-website.com')
      }
    );

    try {
      await service.getHtml('https://some-website-1.com');
      expect(1).toBe(2);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });

});
