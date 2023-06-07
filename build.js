const esbuild = require('esbuild')
const StylePlugin = require('esbuild-style-plugin')
const fs = require('fs')
const child_process = require('child_process')

const mode = process.argv[2] === 'serve' ? 'serve' : 'build'

const outdir = mode === 'serve' ? 'build/debug' : 'build/release'

if (mode === 'build') {
  fs.rmSync(outdir, { recursive: true })
}

fs.mkdirSync(outdir, { recursive: true })
if (mode === 'serve') fs.copyFileSync('./playground/index.html', `${outdir}/index.html`)

esbuild.context({
  bundle: true,
  sourcemap: true,
  sourcesContent: mode === 'serve',
  // minify: mode === 'build',
  entryPoints: mode === 'build' ? ["./src/index.tsx"] : ["./playground/index.tsx"],
  format: "esm",
  outdir,
  plugins: [
    StylePlugin({
      sourceMap: true,
    })
  ]
}).then((ctx) => {
  if (mode === 'serve') {
    ctx.serve({
      servedir: outdir
    }).then((result) => {
      console.log('开发服务器已经启动', result)
    })
  } else {
    ctx.rebuild().then((result) => {
      if (!result.errors || result.errors.length === 0) {
        console.log('构建完毕。输出目录：', outdir)
        ctx.dispose()
        const { stdout, stderr, error } = child_process.spawnSync("pnpm", ["tsc"], { windowsHide: true })

        if (!error) {
          console.log('类型声明文件已经生成')
        }

        if (stdout.length)
          console.log(stdout.toString())
        if (stderr.length)
          console.error(stderr.toString())

        process.exit(0)
      } else {
        console.error('构建错误')
        console.error(result.errors)
        process.exit(1)
      }


    })
  }
})
