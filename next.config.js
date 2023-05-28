/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

//module.exports = nextConfig;
module.exports = {
  webpack: (cfg) => {
    cfg.module.rules.push({
      test: /\.md$/,
      loader: 'frontmatter-markdown-loader',
      options: { mode: ['react-component'] },
    });
    return cfg;
  },
  reactStrictMode: false,
};
