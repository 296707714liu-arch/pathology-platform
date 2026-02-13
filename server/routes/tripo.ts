import express from 'express';
import { TRIPO3D_API_CONFIG } from '../../config/api.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

// 转发所有 Tripo3D 请求
router.all('*', authenticateToken, async (req, res) => {
  // 获取相对于 /api/tripo3d 的路径
  const forwardPath = req.path; 

  // 模型流式下载代理
  if (forwardPath === '/model' && req.query.url) {
    const modelUrl = req.query.url as string;
    console.log(`[Tripo Proxy] Proxying model download: ${modelUrl}`);
    try {
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error(`Failed to fetch model: ${response.status}`);
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      const body = response.body;
      if (!body) {
        res.status(500).send('Empty body from upstream');
        return;
      }

      // Node 18+ fetch 返回的是 Web ReadableStream，需要转换为 Node.js Stream 才能 pipe
      const { Readable } = await import('node:stream');
      // @ts-ignore
      const nodeStream = Readable.fromWeb(body);
      nodeStream.on('error', (e: any) => {
        console.error('[Tripo Proxy] Model stream error:', e);
        try {
          res.end();
        } catch {}
      });
      nodeStream.pipe(res);
      return;
    } catch (error: any) {
      console.error('[Tripo Proxy] Model proxy error:', error);
      return res.status(500).json({ error: 'Failed to proxy model', details: error.message });
    }
  }
  
  // 核心修复：根据官方文档截图，直接拼接路径
  const url = `${TRIPO3D_API_CONFIG.BASE_URL}${forwardPath}`;
  
  console.log(`[Tripo Proxy] Forwarding ${req.method} to: ${url}`);

  try {
    const fetchOptions: any = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRIPO3D_API_CONFIG.API_KEY}`,
        'Accept': 'application/json'
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();
    
    console.log(`[Tripo Proxy] Upstream Response Status: ${response.status}`);
    console.log(`[Tripo Proxy] Upstream Response Body: ${responseText}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: responseText };
    }

    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[Tripo Proxy] Error:', error);
    res.status(500).json({ code: -1, message: '后端代理转发失败', error: error.message });
  }
});

export default router;
