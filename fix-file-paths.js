#!/usr/bin/env node

/**
 * 修复资源文件路径脚本
 * 将相对路径转换为绝对路径
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function fixFilePaths() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pathologic_ai_platform',
    port: parseInt(process.env.DB_PORT || '3306'),
    charset: 'utf8mb4',
    timezone: '+08:00'
  });

  try {
    console.log('🔧 开始修复文件路径...\n');

    const connection = await pool.getConnection();

    // 获取所有资源
    const [resources] = await connection.execute(
      'SELECT id, file_path FROM resources WHERE file_path IS NOT NULL'
    );

    console.log(`📋 找到 ${resources.length} 个资源\n`);

    let updated = 0;
    let skipped = 0;

    for (const resource of resources) {
      const filePath = resource.file_path;
      
      // 检查是否已经是绝对路径
      if (path.isAbsolute(filePath)) {
        console.log(`⏭️  跳过 (已是绝对路径): ${filePath}`);
        skipped++;
        continue;
      }

      // 转换为绝对路径
      const absolutePath = path.resolve(filePath);
      
      // 更新数据库
      await connection.execute(
        'UPDATE resources SET file_path = ? WHERE id = ?',
        [absolutePath, resource.id]
      );

      console.log(`✅ 已更新: ${filePath} → ${absolutePath}`);
      updated++;
    }

    connection.release();
    await pool.end();

    console.log(`\n📊 修复完成！`);
    console.log(`   ✅ 已更新: ${updated} 个`);
    console.log(`   ⏭️  已跳过: ${skipped} 个`);
    console.log(`   📈 总计: ${resources.length} 个\n`);

    console.log('✨ 文件路径修复成功！');
    console.log('💡 提示: 重启后端服务以应用更改');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

fixFilePaths();
