#!/usr/bin/env node

/**
 * 测试文件上传功能
 * 使用方法: node test-upload.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

// 测试数据
const TEST_USER = {
  email: 'admin@pathologic.ai',
  password: 'admin123456'
};

async function test() {
  try {
    console.log('🧪 开始测试文件上传功能\n');

    // 1. 登录获取 token
    console.log('1️⃣  登录...');
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginRes.ok) {
      throw new Error(`登录失败: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ 登录成功，获得 token\n');

    // 2. 创建测试文件
    console.log('2️⃣  创建测试文件...');
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, '这是一个测试文件\n测试内容\n');
    console.log(`✅ 测试文件已创建: ${testFilePath}\n`);

    // 3. 上传文件
    console.log('3️⃣  上传文件...');
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('title', '测试资源 - ' + new Date().toISOString());
    form.append('description', '这是一个自动化测试上传的资源');
    form.append('type', 'document');
    form.append('is_public', 'true');

    const uploadRes = await fetch(`${API_BASE_URL}/resources/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(`上传失败: ${uploadRes.status} - ${JSON.stringify(errorData)}`);
    }

    const uploadData = await uploadRes.json();
    console.log('✅ 文件上传成功！');
    console.log('📦 资源信息:', {
      id: uploadData.resource.id,
      title: uploadData.resource.title,
      fileName: uploadData.resource.file_name,
      fileSize: uploadData.resource.file_size,
      type: uploadData.resource.type
    });
    console.log();

    // 4. 获取资源列表
    console.log('4️⃣  获取资源列表...');
    const listRes = await fetch(`${API_BASE_URL}/resources?type=document&limit=5`);
    const listData = await listRes.json();
    console.log(`✅ 获取成功，共 ${listData.total} 个资源`);
    console.log('📋 最新资源:');
    listData.resources.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (${r.file_size} bytes)`);
    });
    console.log();

    // 5. 清理测试文件
    console.log('5️⃣  清理测试文件...');
    fs.unlinkSync(testFilePath);
    console.log('✅ 测试文件已删除\n');

    console.log('✨ 所有测试通过！文件上传功能正常工作。');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

test();
