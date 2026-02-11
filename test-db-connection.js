#!/usr/bin/env node

/**
 * 数据库连接测试脚本
 * 用于验证 Zeabur MySQL 连接是否正常
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'sjc1.clusters.zeabur.com',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'HgwE5i1kq7vOPUtA82R6c904ZzeS3DVn',
  database: process.env.DB_NAME || 'zeabur',
  port: parseInt(process.env.DB_PORT || '23883'),
  charset: 'utf8mb4'
};

async function testConnection() {
  console.log('🔍 开始测试数据库连接...\n');
  console.log('📋 连接配置：');
  console.log(`   主机: ${dbConfig.host}`);
  console.log(`   端口: ${dbConfig.port}`);
  console.log(`   用户: ${dbConfig.user}`);
  console.log(`   数据库: ${dbConfig.database}`);
  console.log('');

  try {
    // 测试连接
    console.log('⏳ 正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！\n');

    // 获取数据库信息
    console.log('📊 数据库信息：');
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`   MySQL 版本: ${version[0].version}`);

    const [databases] = await connection.execute('SHOW DATABASES');
    console.log(`   数据库数量: ${databases.length}`);

    // 检查表
    console.log('\n📋 检查表结构：');
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );
    
    if (tables.length === 0) {
      console.log('   ⚠️  数据库中没有表，需要初始化');
    } else {
      console.log(`   ✅ 找到 ${tables.length} 个表：`);
      tables.forEach(table => {
        console.log(`      - ${table.TABLE_NAME}`);
      });
    }

    // 测试查询
    console.log('\n🧪 执行测试查询：');
    const [result] = await connection.execute('SELECT 1 as test');
    console.log(`   ✅ 查询成功: ${JSON.stringify(result[0])}`);

    // 获取连接信息
    console.log('\n🔗 连接信息：');
    const [connectionInfo] = await connection.execute('SELECT CONNECTION_ID() as id');
    console.log(`   连接 ID: ${connectionInfo[0].id}`);

    await connection.end();
    console.log('\n✅ 所有测试通过！数据库连接正常。\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 连接失败！\n');
    console.error('错误信息：');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('💡 建议：');
      console.error('   - 检查网络连接');
      console.error('   - 确认数据库主机地址正确');
      console.error('   - 检查防火墙设置\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 建议：');
      console.error('   - 检查用户名和密码');
      console.error('   - 确认用户有访问权限\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 建议：');
      console.error('   - 检查数据库名称');
      console.error('   - 确认数据库存在\n');
    }

    process.exit(1);
  }
}

// 运行测试
testConnection();
