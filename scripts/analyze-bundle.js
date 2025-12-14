#!/usr/bin/env node

/**
 * Bundle 分析脚本
 * 用于分析和优化项目的 JavaScript bundle 大小
 *
 * 使用方法：
 * 1. npm install --save-dev @next/bundle-analyzer
 * 2. npm run analyze
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 开始 Bundle 分析...\n');

// 检查是否安装了 bundle-analyzer
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

const hasBundleAnalyzer =
  packageJson.devDependencies?.['@next/bundle-analyzer'] ||
  packageJson.dependencies?.['@next/bundle-analyzer'];

if (!hasBundleAnalyzer) {
  console.log('📦 正在安装 @next/bundle-analyzer...');
  try {
    execSync('npm install --save-dev @next/bundle-analyzer', {
      stdio: 'inherit',
    });
    console.log('✅ 安装完成！\n');
  } catch (error) {
    console.error('❌ 安装失败：', error.message);
    process.exit(1);
  }
}

// 运行分析
console.log('🚀 正在构建并分析 bundle...');
console.log('这可能需要几分钟时间，请稍候...\n');

try {
  // Windows 和 Unix 兼容的方式设置环境变量
  const isWindows = process.platform === 'win32';
  const command = isWindows
    ? 'set ANALYZE=true&& npm run build'
    : 'ANALYZE=true npm run build';

  execSync(command, {
    stdio: 'inherit',
    shell: true,
  });

  console.log('\n✅ Bundle 分析完成！');
  console.log('📊 分析报告已在浏览器中打开');
  console.log('\n💡 优化建议：');
  console.log('1. 查找体积最大的 chunk');
  console.log('2. 检查是否有重复的依赖');
  console.log('3. 考虑动态导入大型库');
  console.log('4. 移除未使用的依赖\n');
} catch (error) {
  console.error('❌ 分析失败：', error.message);
  process.exit(1);
}
