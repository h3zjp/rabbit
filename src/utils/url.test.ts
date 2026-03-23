import assert from 'assert';

import { describe, it } from 'vitest';

import { isSafeUrl, thumbnailUrl } from '@/utils/url';

describe('isSafeUrl', () => {
  describe('URLs likely safe', () => {
    it.each([
      'https://example.com/',
      'https://example.com/path/to/page',
      'https://example.com:8443/',
      'https://sub.example.com/',
      'https://example.com/?q=test',
      'https://example.com/#hash',
      'https://xn--ber-goa.example.com/', // IDN (Punycode)
      'https://192.0.2.1/', // TEST-NET
      'https://198.51.100.1/', // TEST-NET-2
      'https://203.0.113.1/', // TEST-NET-3
      'https://8.8.8.8/',
      'https://1.1.1.1/',
      'https://172.15.255.255/', // before 172.16/12
      'https://172.32.0.0/', // after 172.16/12
    ])('should return true: %s', (url) => {
      assert.equal(isSafeUrl(url), true);
    });
  });
  describe('URLs likely unsafe', () => {
    it.each(['https://user:pass@example.com/'])('should return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('Other protocol schemes', () => {
    it.each([
      'ftp://example.com/',
      'file:///etc/passwd',
      'file://localhost/etc/passwd',
      'gopher://example.com/',
      'dict://example.com/',
      'sftp://example.com/',
      'ldap://example.com/',
      'jar://example.com/',
      'javascript:alert(1)',
      'data:text/html,<h1>hi</h1>',
      'blob:https://example.com/uuid',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('Invalid URLs', () => {
    it.each([
      '',
      ' ',
      'not-a-url',
      '//example.com/',
      '/path/only',
      'example.com',
      'https://',
      'https://:8080/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('loopback (127.0.0.0/8) addresses', () => {
    it.each([
      'https://127.0.0.1/',
      'https://127.0.0.2/',
      'https://127.1.2.3/',
      'https://127.255.255.255/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('obfuscated loop-back address', () => {
    it.each([
      ['https://0x7f000001/', 'Hexadecimal'],
      ['https://2130706433/', 'Decimal'],
      ['https://0177.0.0.1/', 'Octal'],
      ['https://127.1/', 'Shorten (2 octets)'],
      ['https://127.0.1/', 'Shorten (3 octets)'],
    ])('return false: %s (%s)', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('Private addresses 10.0.0.0/8', () => {
    it.each([
      'https://10.0.0.0/',
      'https://10.0.0.1/',
      'https://10.255.255.255/',
      'https://10.1.2.3/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('Private addresses 172.16.0.0/12', () => {
    it.each([
      'https://172.16.0.0/',
      'https://172.16.0.1/',
      'https://172.31.255.255/',
      'https://172.20.0.1/',
      'https://172.24.0.1/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('Private addresses 192.168.0.0/16', () => {
    it.each([
      'https://192.168.0.0/',
      'https://192.168.0.1/',
      'https://192.168.1.1/',
      'https://192.168.255.255/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('Link-local 169.254.0.0/16', () => {
    it.each([
      'https://169.254.0.0/',
      'https://169.254.0.1/',
      'https://169.254.169.254/',
      'https://169.254.255.255/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('0.0.0.0/8', () => {
    it.each(['https://0.0.0.0/', 'https://0.0.0.1/', 'https://0.255.255.255/'])(
      'return false: %s',
      (url) => {
        assert.equal(isSafeUrl(url), false);
      },
    );
  });

  describe('IPv6 loopback / private addresses', () => {
    it.each([
      'https://[::1]/',
      'https://[0:0:0:0:0:0:0:1]',
      'https://[::1]:8080/',
      'https://[fc00::1]/',
      'https://[fc00::]/',
      'https://[fd00::1]/',
      'https://[fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff]/',
      'https://[fd12:3456:789a::1]/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('IPv4-mapped (IPv6) address', () => {
    it.each(['https://::ffff:127.0.0.1/', 'https://::ffff:7f00:1/'])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('localhost', () => {
    it.each([
      'https://localhost/',
      'https://localhost:3000/',
      'https://localhost:8080/api',
      'https://LOCALHOST/',
      'https://Localhost/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('*.localhost', () => {
    it.each(['https://app.localhost/', 'https://sub.localhost:3000/', 'https://a.b.localhost/'])(
      'return false: %s',
      (url) => {
        assert.equal(isSafeUrl(url), false);
      },
    );
  });

  describe('*.local (mDNS)', () => {
    it.each([
      'https://router.local/',
      'https://nas.local/',
      'https://printer.local:631/',
      'https://my-device.local/',
      'https://ROUTER.LOCAL/',
    ])('return false: %s', (url) => {
      assert.equal(isSafeUrl(url), false);
    });
  });

  describe('*.internal', () => {
    it.each(['https://service.internal/', 'https://api.internal:8080/', 'https://db.internal/'])(
      'return false: %s',
      (url) => {
        assert.equal(isSafeUrl(url), false);
      },
    );
  });
});

describe('thumbnailUrl', () => {
  it('should return thumbnail url for imgur.com', () => {
    const actual = thumbnailUrl('https://i.imgur.com/p05kUim.gif');
    const expected = 'https://i.imgur.com/p05kUiml.gif';
    assert.deepStrictEqual(actual, expected);
  });

  it('should return thumbnail url for imgur.com', () => {
    const actual = thumbnailUrl('https://i.imgur.com/p05kUim.gif', 'icon');
    const expected = 'https://i.imgur.com/p05kUims.gif';
    assert.deepStrictEqual(actual, expected);
  });

  it('should return url for nostr.build', () => {
    const actual = thumbnailUrl(
      'https://nostr.build/i/2489ee648a4fef6943f4a7c88349477e78a91e28232246b801fe8ce86e64624e.png',
    );
    const expected =
      'https://image.nostr.build/resp/240p/2489ee648a4fef6943f4a7c88349477e78a91e28232246b801fe8ce86e64624e.png';
    assert.deepStrictEqual(actual, expected);
  });

  it('should return url for image.nostr.build', () => {
    const actual = thumbnailUrl(
      'https://image.nostr.build/78fc3c02f0488e2f3efb818adf1421bcee8c1612189e217c5ced1c2785eee1a8.jpg',
    );
    const expected =
      'https://image.nostr.build/resp/240p/78fc3c02f0488e2f3efb818adf1421bcee8c1612189e217c5ced1c2785eee1a8.jpg';
    assert.deepStrictEqual(actual, expected);
  });

  it('should return url for cdn.nostr.build', () => {
    const actual = thumbnailUrl(
      'https://cdn.nostr.build/i/78fc3c02f0488e2f3efb818adf1421bcee8c1612189e217c5ced1c2785eee1a8.jpg',
    );
    const expected =
      'https://image.nostr.build/resp/240p/78fc3c02f0488e2f3efb818adf1421bcee8c1612189e217c5ced1c2785eee1a8.jpg';
    assert.deepStrictEqual(actual, expected);
  });

  it('should return url for pbs.twimg.com/profile_images/', () => {
    const actual = thumbnailUrl(
      'https://pbs.twimg.com/profile_images/1713367977725509632/iLgoXgtx_400x400.jpg',
    );
    const expected = 'https://pbs.twimg.com/profile_images/1713367977725509632/iLgoXgtx_normal.jpg';
    assert.deepStrictEqual(actual, expected);
  });

  it('should return url for pbs.twimg.com/media/', () => {
    const actual = thumbnailUrl(
      'https://pbs.twimg.com/media/FPUltrpaAAQQdIO?format=png&name=900x900',
    );
    const expected = 'https://pbs.twimg.com/media/FPUltrpaAAQQdIO?format=jpg&name=small';
    assert.deepStrictEqual(actual, expected);
  });
});
