import path from 'path'
import fs from 'fs'
import JSZip from "jszip";
import dayjs from "dayjs";

export default function VitePluginPackageZip({name = 'dist', format = 'YYYY年MM月DD日HH时mm分ss秒', time = true}) {
    return {
        name: 'vite-plugin-package-zip',

        buildEnd(error) {
            if (error) return

            const jsZip = new JSZip()

            const projectRootPath = process.cwd() // 获取项目根目录
            const destination = `${name}${time ? '_' + dayjs().format(format) : ''}.zip`; // 输出压缩包文件名

            const stack = ['']
            while (stack.length) {
                const current = stack.pop()
                const absolutelyPath = path.join(projectRootPath, 'dist', current)
                const files = fs.readdirSync(absolutelyPath)
                for (const file of files) {
                    if (fs.statSync(path.join(absolutelyPath, file)).isDirectory()) {
                        stack.push(path.join(current, file))
                        jsZip.folder(path.join(current, file))
                        continue
                    }
                    const content = fs.readFileSync(path.join(absolutelyPath, file))
                    jsZip.file(path.join(current, file), content)
                }
            }
            jsZip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
                .pipe(fs.createWriteStream(destination))
        }
    }
}