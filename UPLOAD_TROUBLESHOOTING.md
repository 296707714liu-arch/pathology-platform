# 文件上传故障排除指南

## 问题：POST 400 Bad Request

### 原因分析

400 错误通常表示请求格式不正确。对于文件上传，常见原因包括：

1. **缺少必填字段**
   - `title` (资源标题) - 必填
   - `type` (资源类型) - 必填
   - `file` (文件) - 必填

2. **FormData 格式错误**
   - 没有正确添加文件到 FormData
   - 字段名称不匹配

3. **认证问题**
   - 没有有效的 JWT token
   - Token 已过期

4. **权限问题**
   - 用户角色不是 teacher 或 admin

### 快速诊断

#### 1. 检查浏览器控制台

打开浏览器开发者工具 (F12)，查看 **Console** 标签页：

```
📤 上传资源: {
  fileName: "test.pdf",
  fileSize: 1024,
  fileType: "application/pdf",
  title: "测试资源",
  type: "slide"
}
```

如果看到这个日志，说明前端正确发送了请求。

#### 2. 检查 Network 标签页

1. 打开 **Network** 标签页
2. 尝试上传文件
3. 找到 POST 请求到 `/api/resources/upload`
4. 查看 **Request Headers**：
   - 应该有 `Authorization: Bearer <token>`
   - 不应该有 `Content-Type: application/json`（应该是 multipart/form-data）

5. 查看 **Request Payload**：
   - 应该看到 `file` 字段
   - 应该看到 `title` 字段
   - 应该看到 `type` 字段

6. 查看 **Response**：
   - 如果是 400，会看到错误信息，例如：
     ```json
     {
       "success": false,
       "error": "标题和类型是必填项"
     }
     ```

### 解决方案

#### 方案 1: 验证用户角色

确保登录的用户是 teacher 或 admin：

```javascript
// 在浏览器控制台运行
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('当前用户:', user);
console.log('用户角色:', user.role);
```

如果角色不是 `teacher` 或 `admin`，需要用管理员账号登录：
- 邮箱: `admin@pathologic.ai`
- 密码: `admin123456`

#### 方案 2: 检查表单字段

确保所有必填字段都已填写：

```javascript
// 在浏览器控制台运行
// 检查是否选择了文件
const fileInput = document.querySelector('input[type="file"]');
console.log('选择的文件:', fileInput.files[0]);

// 检查标题是否填写
const titleInput = document.querySelector('input[placeholder*="清晰的名字"]');
console.log('标题:', titleInput.value);
```

#### 方案 3: 测试后端 API

使用 curl 命令直接测试后端：

```bash
# 1. 登录获取 token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pathologic.ai","password":"admin123456"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 2. 上传文件
curl -X POST http://localhost:3001/api/resources/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "title=测试资源" \
  -F "type=document" \
  -F "is_public=true"
```

#### 方案 4: 使用测试脚本

运行自动化测试脚本：

```bash
# 需要先安装依赖
npm install form-data node-fetch

# 运行测试
node test-upload.js
```

### 常见错误信息

| 错误信息 | 原因 | 解决方案 |
|---------|------|--------|
| `没有上传文件` | 没有选择文件 | 选择要上传的文件 |
| `标题和类型是必填项` | 缺少标题或类型 | 填写资源标题，选择资源类型 |
| `权限不足` | 用户不是 teacher/admin | 用管理员账号登录 |
| `无效的访问令牌` | Token 无效或过期 | 重新登录 |
| `服务器内部错误` | 后端错误 | 查看后端日志 |

### 查看后端日志

在运行后端的终端中查看日志：

```
❌ 上传资源错误: Error: ...
```

常见的后端错误：

1. **数据库错误**
   ```
   ❌ 上传资源错误: Error: ER_DUP_ENTRY
   ```
   解决：检查数据库连接

2. **文件系统错误**
   ```
   ❌ 上传资源错误: Error: ENOENT: no such file or directory
   ```
   解决：确保 `uploads` 目录存在

3. **权限错误**
   ```
   ❌ 上传资源错误: Error: EACCES: permission denied
   ```
   解决：检查 `uploads` 目录权限

### 完整的调试步骤

1. **打开浏览器开发者工具** (F12)
2. **切换到 Console 标签页**
3. **检查用户信息**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user') || '{}');
   console.log('用户:', user);
   ```
4. **切换到 Network 标签页**
5. **尝试上传文件**
6. **查看 POST 请求的详细信息**
7. **检查 Response 中的错误信息**
8. **根据错误信息采取相应的解决方案**

### 获取帮助

如果问题仍未解决，请提供以下信息：

1. 浏览器控制台的完整错误信息
2. Network 标签页中 POST 请求的 Response
3. 后端终端的完整日志输出
4. 用户的角色和权限信息

---

## 成功上传的标志

✅ 上传成功时，你应该看到：

1. **浏览器控制台**
   ```
   ✅ 上传成功: { resource: { id: "...", title: "...", ... } }
   ```

2. **页面提示**
   ```
   ✅ 资源上传成功！
   ```

3. **资源列表更新**
   - 新上传的资源出现在列表中

4. **后端日志**
   ```
   ✅ 数据库表初始化完成
   ```

---

## 性能优化

如果上传大文件时很慢，可以：

1. **增加超时时间**
   - 修改 `.env` 中的超时配置

2. **分块上传**
   - 对于大文件（>100MB），考虑实现分块上传

3. **压缩文件**
   - 在上传前压缩文件

4. **检查网络**
   - 确保网络连接稳定
