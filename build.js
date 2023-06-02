const esbuild = require('esbuild')
const StylePlugin = require('esbuild-style-plugin')

const fs = require('fs')

const outdir = 'build/debug'

fs.mkdirSync(outdir, { recursive: true })
fs.copyFileSync('./playground/index.html', `${outdir}/index.html`)

esbuild.context({
  bundle: true,
  sourcemap: true,
  entryPoints: ["./playground/index.tsx"],
  outdir,
  plugins: [
    StylePlugin({
      sourceMap: true,
    })
  ]
}).then((ctx) => ctx.serve({
  servedir: outdir
})).then((result) => {
  console.log('开发服务器已经启动', result)
})
