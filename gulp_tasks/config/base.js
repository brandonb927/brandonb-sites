import { normalize, resolve } from 'path'

const base = normalize(`${__dirname}/../..`)

const getHomeFolder = () => {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

// Export the base config
const baseConfig = {
  homeFolder: getHomeFolder(),
  src: {
    base: base,
    assets: resolve(base, "_assets")
  },
  deploy: {
    domain: 'brandonb.ca',
    s3: {
      region: 'us-east-1',
      bucketMedia: 'brandonb-web-media',
    }
  },
  jekyll: {
    baseConfig: resolve(base, "_config.yml")
  },
  styles: {
    autoprefixer: {
      cascade: true,
      browsers: [
        "last 2 versions",
        "ios 8",
        "android 4.4",
      ]
    }
  },
  size:{
    showFiles: true
  }
}

baseConfig.watch = {
  jekyll: [
    `${baseConfig.src.base}/*.yml`,
    `${baseConfig.src.base}/_data/*`,
    `${baseConfig.src.base}/{archive,index,404}.html`,
    `${baseConfig.src.base}/_includes/**/*`,
    `${baseConfig.src.base}/_layouts/*`,
    `${baseConfig.src.base}/_pages/*`,
    `${baseConfig.src.base}/_posts/**/*`,
    `${baseConfig.src.base}/_projects/*`
  ],
  styles: `${baseConfig.src.assets}/styles/**/*.less`,
  scripts: `${baseConfig.src.assets}/scripts/*.js`,
  media: `${baseConfig.src.assets}/media/*`,
}

baseConfig.scripts = {
  options: {
    debug: true
  },
  vendor: {
    src: []
  }
}

export default baseConfig
