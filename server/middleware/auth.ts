import type { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../services/userService.ts';

export interface AuthRequest extends Request {
  user?: any;
}

// JWT认证中间件
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: '无效的访问令牌' });
  }

  // 获取用户信息
  const user = await getUserById(decoded.userId);
  if (!user) {
    return res.status(403).json({ error: '用户不存在' });
  }

  req.user = user;
  next();
};

// 角色权限中间件
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
};