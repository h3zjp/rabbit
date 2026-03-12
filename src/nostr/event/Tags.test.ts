import assert from 'assert';

import { describe, it } from 'vitest';

import Tags from '@/nostr/event/Tags';

describe('Tags', () => {
  describe('#emojiTags', () => {
    it('should return emoji tags', () => {
      const emojiTags = [
        ['emoji', 'foo', 'https://example.com/emoji_foo.png'],
        ['emoji', 'bar', 'https://example.com/emoji_bar.png'],
      ];
      const tags = new Tags([
        // Extra tags
        ['p', '6e62e578bdf608e250e93c25dc0cbadbda8db17e6fc3a28cdce8a2f56db7d106'],
        ['e', '005c079e4c7c103168e0cb359270ac96a6a46e5ff4ce8f4643e0831f6d1c2450', '', 'reply'],
        ...emojiTags,
      ]);
      const actual = tags.emojiTags();
      assert.deepStrictEqual(actual, emojiTags);
    });

    it('should return emoji tags with optional emoji set address', () => {
      const emojiTags = [
        [
          'emoji',
          'foo',
          'https://example.com/emoji_foo.png',
          '30030:fbcc9e7d6182a9d24ab622123f640d700298c43ccc30dc73aaf2a26d485543b8:foo',
        ],
        [
          'emoji',
          'bar',
          'https://example.com/emoji_bar.png',
          '30030:fbcc9e7d6182a9d24ab622123f640d700298c43ccc30dc73aaf2a26d485543b8:bar',
        ],
      ];
      const tags = new Tags([
        // Extra tags
        ['p', '6e62e578bdf608e250e93c25dc0cbadbda8db17e6fc3a28cdce8a2f56db7d106'],
        ['e', '005c079e4c7c103168e0cb359270ac96a6a46e5ff4ce8f4643e0831f6d1c2450', '', 'reply'],
        ...emojiTags,
      ]);
      const actual = tags.emojiTags();
      assert.deepStrictEqual(actual, emojiTags);
    });
  });
});
