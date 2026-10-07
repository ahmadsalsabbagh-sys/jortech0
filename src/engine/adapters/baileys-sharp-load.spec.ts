import { InternalServerErrorException } from '@nestjs/common';

// Force the deferred `sharp` binary to fail to load, the way an older CPU or a stripped/musl image
// does at runtime. The dynamic import inside loadSharp then rejects.
jest.mock('sharp', () => {
  throw new Error('ERR_DLOPEN_FAILED: sharp native binary could not be loaded');
});

import { loadSharp } from './baileys-messaging';

describe('loadSharp', () => {
  it('maps a sharp native-load failure to a 500, not the decode path 400', async () => {
    // A valid PNG would hit this same path, so a 400 would wrongly blame the caller's image.
    await expect(loadSharp()).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
