#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:3006/api';

// 测试用例
const tests = [
  {
    name: '健康检查',
    method: 'GET',
    path: '/health',
    body: null
  },
  {
    name: '用户登录',
    method: 'POST',
    path: '/auth/login',
    body: {
      email: 'admin@pathologic.ai',
      password: 'admin123456'
    }
  }
];

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
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
  console.log('🧪 开始测试 API...\n');
  console.log(`📍 API 地址: ${API_BASE}\n`);

  for (const test of tests) {
    try {
      console.log(`⏳ 测试: ${test.name}`);
      console.log(`   ${test.method} ${test.path}`);
      
      const result = await makeRequest(test.method, test.path, test.body);
      
      console.log(`   ✅ 状态码: ${result.status}`);
      console.log(`   📦 响应: ${JSON.stringify(result.body, null, 2)}`);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`   ✅ 测试通过\n`);
      } else {
        console.log(`   ⚠️  状态码异常\n`);
      }
    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}\n`);
    }
  }

  console.log('✨ 测试完成');
}

runTests();
