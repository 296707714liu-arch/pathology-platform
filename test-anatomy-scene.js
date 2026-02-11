#!/usr/bin/env node

/**
 * 简单命令行脚本：直接通过中转站 GEMINI 3 生成 3D 解剖场景配置并打印出来
 *
 * 用法（在项目根目录）：
 *   node test-anatomy-scene.js "人体心脏"
 *
 * 依赖：
 * - Node 18+ 已内置 fetch（你当前是 v24，已支持）
 */

const ANATOMY_API_CONFIG = {
  BASE_URL: 'https://jeniya.top',
  API_KEY: 'sk-cOLeoqb0rIe6BIVHy0iVpIB3e0edfIqFXLKdH3C4Mia2j2vQ',
  MODEL_NAME: 'gemini-3-pro-preview',
  ENDPOINT: '/v1/chat/completions'
};

function cleanJsonString(text) {
  if (!text) return '{}';
  let clean = String(text).trim();
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    return clean.substring(firstOpen, lastClose + 1);
  }
  return clean;
}

async function callAnatomyApi(messages) {
  const url = `${ANATOMY_API_CONFIG.BASE_URL}${ANATOMY_API_CONFIG.ENDPOINT}`;

  const body = {
    model: ANATOMY_API_CONFIG.MODEL_NAME,
    messages,
    stream: false,
    temperature: 0.1
  };

  console.log(`📡 Requesting Anatomy Scene from: ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANATOMY_API_CONFIG.API_KEY}`
    },
    body: JSON.stringify(body)
  });

  const raw = await res.text();
  console.log('\n🔍 Raw response:');
  console.log(raw);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${raw}`);
  }

  const data = JSON.parse(raw);
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!content) {
    throw new Error('Empty content from AI');
  }

  const jsonText = cleanJsonString(content);
  console.log('\n🧩 Extracted JSON text:');
  console.log(jsonText);

  const cfg = JSON.parse(jsonText);
  return cfg;
}

async function main() {
  const userInput = process.argv.slice(2).join(' ') || '人体心脏';

  const systemPrompt = `
    角色：你是一名「医学 3D 解剖可视化设计师」。
    用户想要可视化的结构是：「${userInput}」。

    目标：生成一个由简单几何体（球体、长方体、圆柱体）组成的 3D 场景配置，用于教学示意解剖关系。

    几何体类型（type 字段）仅允许：
    - "sphere"   球体：用于表示器官主体 / 结节等
    - "box"      长方体：用于表示组织块 / 解剖区域
    - "cylinder" 圆柱体：用于表示血管 / 管腔结构

    坐标与尺寸规则：
    - position 为 [x, y, z]，范围控制在 -2.0 ~ 2.0 之间。
    - size 用作半径或整体尺寸，推荐范围 0.3 ~ 1.2。
    - cylinder 需要额外 height 字段（高度），推荐范围 0.8 ~ 2.5。

    颜色规则：
    - color 必须是合法 HEX 颜色，例如 "#ff4b4b"。

    输出内容：
    {
      "title": string,
      "description": string,
      "structures": Array<{
        "id": string,
        "name": string,
        "type": "sphere" | "box" | "cylinder",
        "position": [number, number, number],
        "size": number,
        "height"?: number,
        "color": string
      }>
    }

    所有文本使用简体中文。
    严格返回 JSON，不要包含 Markdown 代码块或额外说明。
  `;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请根据上述规则，为以下解剖需求生成一个 3D 场景配置：${userInput}` }
  ];

  try {
    const cfg = await callAnatomyApi(messages);

    console.log('\n✅ Parsed Anatomy Scene Config:');
    console.log(JSON.stringify(cfg, null, 2));

    if (!cfg.structures || !Array.isArray(cfg.structures) || cfg.structures.length === 0) {
      console.warn('\n⚠️  注意：structures 为空，前端会显示兜底立方体。');
    } else {
      console.log(`\n📦 结构数量: ${cfg.structures.length}`);
      console.log('📌 前 3 个结构预览:');
      console.log(JSON.stringify(cfg.structures.slice(0, 3), null, 2));
    }
  } catch (err) {
    console.error('\n❌ 测试失败:', err.message);
    process.exitCode = 1;
  }
}

main();


