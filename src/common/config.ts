export default {
  header: {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
  api: {
    // base: 'http://rap2api.taobao.org/app/mock/83318',
    base: 'http://localhost:3001',
    favo: '/api/favo',
    comments: '/api/comments',
    signup: '/api/user/signup',
    verify: '/api/user/verify',
    update: '/api/user/update',
    signature: '/api/signature',
    video: '/api/videos',
    audio: '/api/audios',
    media: '/api/medias',
  } as any,
};
