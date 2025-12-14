#!/usr/bin/env node

/**
 * 批量更新组件图标导入的脚本
 * 将 lucide-react 导入替换为 @/lib/icons
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');

// 需要更新的文件列表
const filesToUpdate = [
  'header.tsx',
  'back-to-top.tsx',
  'theme-toggle.tsx',
  'login-button.tsx',
  'like-button.tsx',
  'favorite-button.tsx',
  'comment-section.tsx',
  'source-code-viewer.tsx',
  'upload-form.tsx',
  'tag-selector.tsx',
  'rating.tsx',
];

filesToUpdate.forEach(filename => {
  const filePath = path.join(componentsDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 替换导入语句
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g,
    (match, icons) => {
      return `import {${icons}} from '@/lib/icons'`;
    }
  );

  // 如果内容有变化，写回文件
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已更新: ${filename}`);
  } else {
    console.log(`⏭️  跳过: ${filename} (无需更新)`);
  }
});

console.log('\n🎉 批量更新完成！');
