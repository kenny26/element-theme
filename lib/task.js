var path = require('path')
var fs = require('fs')
var gulp = require('gulp')
var ora = require('ora')
var noop = require("gulp-noop");
var sass = require('gulp-sass')
var autoprefixer = require('autoprefixer')
var postcss = require('gulp-postcss')
var cleanCSS = require('gulp-clean-css');
var config = require('./config')

exports.fonts = function (opts) {
  var spin = ora(opts.message).start()
  var stream = gulp.src(path.resolve(config.themePath, './src/fonts/**'))
    .pipe((opts.minimize || config.minimize) ? cleanCSS() : noop())
    .pipe(gulp.dest(path.resolve(opts.out || config.out, './fonts')))
    .on('end', function () {
      spin.succeed()
    })

  return stream
}

exports.build = function (opts) {
  var spin = ora(opts.message).start()
  var stream
  var components
  var cssFiles = '*'
  var configContent
  var themeVarsContent

  if (config.components) {
    components = config.components.concat(['base'])
    cssFiles = '{' + components.join(',') + '}'
  }

  var varsPath = path.resolve(config.themePath, './src/common/var.scss')

  configContent = fs.readFileSync(path.resolve(process.cwd(), opts.config || config.config), 'utf-8')
  themeVarsContent = fs.readFileSync(path.resolve(process.cwd(), varsPath), 'utf-8')

  fs.writeFileSync(varsPath, Buffer.from(configContent.concat(themeVarsContent), 'utf-8'), 'utf-8')

  stream = gulp.src([opts.config || config.config, path.resolve(config.themePath, './src/' + cssFiles + '.scss')])
    .pipe(sass.sync())
    .pipe(postcss([autoprefixer({
      overrideBrowserslist: config.browsers,
      cascade: false
    })]))
    .pipe((opts.minimize || config.minimize) ? cleanCSS() : noop())
    .pipe(gulp.dest(opts.out || config.out))
    .on('end', function () {
      spin.succeed()
    })

  return stream
}
