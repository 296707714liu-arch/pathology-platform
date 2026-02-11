#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3006/api';

let authToken = null;
let userId = null;

function makeRequest(method, urlPath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + urlPath);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 完整 API 测试套件\n');
  console.log(`📍 API 地址: ${API_BASE}\n`);

  try {
    // 1. 健康检查
    console.log('⏳ 测试 1: 健康检查');
    let result = await makeRequest('GET', '/health', null);
    if (result.status === 200) {
      console.log('✅ 健康检查通过\n');
    } else {
      console.log('❌ 健康检查失败\n');
      return;
    }

    // 2. 用户登录
    console.log('⏳ 测试 2: 用户登录');
    result = await makeRequest('POST', '/auth/login', {
      email: 'admin@pathologic.ai',
      password: 'admin123456'
    });
    if (result.status === 200 && result.body.token) {
      authToken = result.body.token;
      userId = result.body.user.id;
      console.log(`✅ 登录成功，Token: ${authToken.substring(0, 20)}...\n`);
    } else {
      console.log('❌ 登录失败\n');
      console.log('响应:', result.body);
      return;
    }

    // 3. 获取当前用户信息
    console.log('⏳ 测试 3: 获取当前用户信息');
    result = await makeRequest('GET', '/auth/me', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (result.status === 200) {
      console.log(`✅ 获取用户信息成功: ${result.body.user.name}\n`);
    } else {
      console.log('❌ 获取用户信息失败\n');
    }

    // 4. 获取资源列表
    console.log('⏳ 测试 4: 获取资源列表');
    result = await makeRequest('GET', '/resources?type=document&limit=10', null);
    if (result.status === 200 && Array.isArray(result.body.resources)) {
      console.log(`✅ 获取资源列表成功，共 ${result.body.resources.length} 个资源\n`);
      if (result.body.resources.length > 0) {
        console.log('📋 资源列表:');
        result.body.resources.forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.title} (${r.file_size} bytes)`);
        });
        console.log();
      }
    } else {
      console.log('❌ 获取资源列表失败\n');
      console.log('响应:', result.body);
    }

    // 5. 获取所有用户（管理员功能）
    console.log('⏳ 测试 5: 获取所有用户（管理员功能）');
    result = await makeRequest('GET', '/auth/users', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (result.status === 200 && Array.isArray(result.body.users)) {
      console.log(`✅ 获取用户列表成功，共 ${result.body.users.length} 个用户\n`);
      console.log('👥 用户列表:');
      result.body.users.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.name} (${u.email}) - ${u.role}`);
      });
      console.log();
    } else {
      console.log('❌ 获取用户列表失败\n');
      console.log('响应:', result.body);
    }

    // 6. 获取用户统计
    console.log('⏳ 测试 6: 获取用户统计');
    result = await makeRequest('GET', '/auth/stats', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (result.status === 200) {
      console.log('✅ 获取用户统计成功\n');
      console.log('📊 统计数据:');
      console.log(JSON.stringify(result.body.stats, null, 2));
      console.log();
    } else {
      console.log('❌ 获取用户统计失败\n');
    }

    // 7. 获取用户活动记录
    console.log('⏳ 测试 7: 获取用户活动记录');
    result = await makeRequest('GET', '/auth/activities?limit=10', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (result.status === 200 && Array.isArray(result.body.activities)) {
      console.log(`✅ 获取活动记录成功，共 ${result.body.activities.length} 条记录\n`);
    } else {
      console.log('❌ 获取活动记录失败\n');
    }

    // 8. 获取考试记录
    console.log('⏳ 测试 8: 获取考试记录');
    result = await makeRequest('GET', '/exams/records?limit=10', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (result.status === 200 && Array.isArray(result.body.records)) {
      console.log(`✅ 获取考试记录成功，共 ${result.body.records.length} 条记录\n`);
    } else {
      console.log('❌ 获取考试记录失败\n');
    }

    console.log('✨ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试出错:', error.message);
    console.error(error);
  }
}

runTests();
