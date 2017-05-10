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
    domain: 'brandonb.io',
    s3: {
      region: 'us-east-1',
      bucketImages: 'brandonb-io-images',
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
        "ie 9",
        "opera 12.1",
        "ios 6",
        "android 4",
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
    `${baseConfig.src.base}/_data/*.{json,yml}`,
    `${baseConfig.src.base}/{archive,index,404}.html`,
    `${baseConfig.src.base}/_pages/*.{md,html}`,
    `${baseConfig.src.base}/{_layouts,_posts}/*.{md,html}`,
    `${baseConfig.src.base}/_includes/**/*.{md,html}`
  ],
  styles: `${baseConfig.src.assets}/styles/**/*.less`,
  scripts: `${baseConfig.src.assets}/scripts/*.js`,
  images: `${baseConfig.src.assets}/images/*`,
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
