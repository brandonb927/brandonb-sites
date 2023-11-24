import { normalize, resolve } from 'path'

const basePath = normalize('node:../..')

// Export the base config
export default {
  homeFolder: process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'],
  src: {
    base: basePath,
    assets: resolve(basePath, '_assets'),
  },
  deploy: {
    domain: 've7tzb.ca',
    secureDomain: true,
    s3: {
      region: 'us-east-1',
      bucketMedia: 'brandonb-web-media',
    },
  },
  jekyll: {
    baseConfig: resolve(basePath, '_config.yml'),
  },
  styles: {
    autoprefixer: {
      cascade: true,
    },
  },
  scripts: {
    options: {
      debug: true,
    },
    vendor: {
      src: [],
    },
  },
  size: {
    showFiles: true,
  },
  get watch() {
    return {
      jekyll: [
        `${this.src.base}/*.yml`,
        `${this.src.base}/_data/*`,
        `${this.src.base}/{index,404}.html`,
        `${this.src.base}/_includes/**/*`,
        `${this.src.base}/_layouts/*`,
        `${this.src.base}/_pages/**/*`,
        `${this.src.base}/_posts/**/*`,
        `${this.src.base}/_plugins/*`,
        `${this.src.base}/_qso/*`,
      ],
      styles: `${this.src.assets}/styles/**/*.less`,
      scripts: `${this.src.assets}/scripts/*.js`,
      media: `${this.src.assets}/media/*`,
    }
  },
}
