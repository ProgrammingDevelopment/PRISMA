export default {
  output: 'export',
  images: {
    unoptimized: true,
  },

  /* Rewrites
  rewrites: async () => {
    return [
      {
        source: '/api/chat',
        destination: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000/chat' : '/api/chat',
      },
    ];
  },
  */
};
