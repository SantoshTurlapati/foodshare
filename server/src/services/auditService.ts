import { db } from '../config/database.js';

export const auditService = {
  log(adminUserId: number, actionType: string, targetEntity: string, targetId?: number | null, details?: string | null): void {
    try {
      db.run(
        `INSERT INTO admin_audit_logs (admin_user_id, action_type, target_entity, target_id, details)
         VALUES (?, ?, ?, ?, ?)`,
        adminUserId,
        actionType,
        targetEntity,
        targetId || null,
        details || null
      );
    } catch (err) {
      console.error('Audit log error:', err);
    }
  },

  getRecentLogs(limit = 50) {
    return db.all(`
      SELECT l.*, u.full_name as admin_name, u.email as admin_email
      FROM admin_audit_logs l
      JOIN users u ON l.admin_user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ?
    `, limit);
  }
};
