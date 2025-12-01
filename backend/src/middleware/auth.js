import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = verifyToken(token);
        req.user = payload; // { id, role, name }
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Admins only' });
    }
}

export function requireRole(role) {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ error: `Access denied: ${role}s only` });
        }
    };
}
