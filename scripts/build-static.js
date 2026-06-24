/**
 * 帽子云静态部署构建脚本
 * 将 HTML、CSS、JS、图片复制到 build/ 目录
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'build');

const files = ['index.html'];
const dirs = ['images', 'scripts', 'styles', 'partials'];

if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
    const src = path.join(root, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(outDir, file));
    } else {
        console.warn(`⚠️ 跳过缺失文件: ${file}`);
    }
}

for (const dir of dirs) {
    const src = path.join(root, dir);
    if (fs.existsSync(src)) {
        fs.cpSync(src, path.join(outDir, dir), { recursive: true });
    } else {
        console.warn(`⚠️ 跳过缺失目录: ${dir}`);
    }
}

console.log('✅ 静态资源已输出到 build/');
