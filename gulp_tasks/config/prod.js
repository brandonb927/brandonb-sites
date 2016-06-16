// Production config
import { resolve } from 'path'
import { merge }  from 'lodash'

import baseConfig from './base'

// Paths
const src = baseConfig.src.base
const srcAssets = baseConfig.src.assets
const build = resolve(src, 'build_prod')
const buildAssets = resolve(build, 'assets')

const prodBuildConfigFilename = resolve(src, '_config_prod.yml')
const buildConfigFilename = `${baseConfig.jekyll.baseConfig},${prodBuildConfigFilename}`

// Config
const baseProdConfig = {
  deploy: {
    src: build,
    dest: build
  },
  delete: {
    src: build
  },
  styles: {
    src: `${srcAssets}/styles/site.less`,
    dest: `${buildAssets}/styles`
  },
  scripts: {
    src: `${srcAssets}/scripts/*.js`,
    dest: `${buildAssets}/scripts`
  },
  copy: {
    images: {
      src: `${srcAssets}/images/*`,
      dest: `${buildAssets}/images`
    },
    surgeignore: {
      src: `${src}/.surgeignore`,
      dest: build
    },
    minecraft: {
      src: `${baseConfig.homeFolder}/minecraft_render/**`,
      dest: `${build}/minecraft_render`
    }
  },
  jekyll: {
    src: src,
    dest: build,
    config: buildConfigFilename
  },
  optimize: {
    styles:{
      src: [
        `${buildAssets}/styles/*.css`
      ],
      dest: `${buildAssets}/styles`,
      options: {
        keepSpecialComments: 0
      }
    },
    scripts: {
      src: [
        `${buildAssets}/scripts/*.js`
      ],
      dest: `${buildAssets}/scripts`,
      options: {}
    },
    images: {
      src: `${srcAssets}/images/*`,
      dest: `${srcAssets}/images`,
      options:{
        optimizationLevel: 3,
        progessive: true,
        interlaced: true
      }
    },
    html: {
      src: `${build}/**/*.html`,
      dest: build,
      options: {
        collapseWhitespace: true,
        conservativeCollapse: true
      }
    }
  }
}

const prodConfig = merge(baseProdConfig, baseConfig)

export default prodConfig
