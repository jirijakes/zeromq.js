import {spawnSync} from "child_process"

main().catch(e => {
  throw e
})

async function main() {
  console.log("Building distribution binary...")

  const prebuildArch = getNodearch(process.env.ARCH ?? process.arch)

  if (typeof process.env.TRIPLE === "string") {
    const TRIPLE = process.env.TRIPLE

    const GCC = process.env.GCC
    process.env.CC = `${TRIPLE}-gcc-${GCC}`
    process.env.CXX = `${TRIPLE}-g++-${GCC}`

    const STRIP = `${TRIPLE}-strip`
    process.env.PREBUILD_STRIP_BIN = STRIP

    process.env.npm_config_arch = prebuildArch
    process.env.npm_config_target_arch = prebuildArch
    process.env.PREBUILD_arch = prebuildArch

    process.env.ZMQ_BUILD_OPTIONS = `--host=${TRIPLE}`
  }

  let prebuildScript = `prebuildify --napi --arch=${prebuildArch} --strip --tag-libc`

  if (typeof process.env.ALPINE_CHROOT === "string") {
    prebuildScript = `/alpine/enter-chroot ${prebuildScript}`
  }

  spawnSync(prebuildScript, {
    shell: true,
    stdio: "inherit",
    encoding: "utf8",
  })
}

function getNodearch(arch: string): string {
  if (arch === "x86") {
    return "ia32"
  }
  return arch
}
