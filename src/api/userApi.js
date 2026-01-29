import client from './client';

export const userApi = {
  // ==========================================
  // 1. USER CORE MANAGEMENT (Restored)
  // ==========================================
  getAll: () => client.get('/users/'),
  create: (data) => client.post('/users/', data),
  update: (id, data) => client.put(`/users/${id}`, data),
  delete: (id) => client.delete(`/users/${id}`),

  // ==========================================
  // 2. PERMISSIONS REGISTRY
  // ==========================================
  getPermissions: () => client.get('/permissions/'),
  createPermission: (data) => client.post('/permissions/', data),
  deletePermission: (pName) => 
    client.delete(`/permissions/${encodeURIComponent(pName)}`),

  // ==========================================
  // 3. ROLE MANAGEMENT & ACCESS CONTROL
  // ==========================================
  getRoles: () => client.get('/roles/'),

  // VITAL: Fetches fresh data for one specific role to ensure UI persistence
  getRoleByName: (roleName) => 
    client.get(`/roles/${encodeURIComponent(roleName)}`),

  // Target POST: roles/{role}/assign-permission/{perm}
  assignPermissionToRole: (roleName, permName) => {
    const url = `/roles/${encodeURIComponent(roleName)}/assign-permission/${encodeURIComponent(permName)}`;
    console.log(`%c[ACCESS CONTROL] POST -> ${url}`, "color: #00d4ff; font-weight: bold");
    return client.post(url, ''); // Sends empty string as body
  },
  
  // Target DELETE: roles/{role}/remove-permission/{perm}
  removePermissionFromRole: (roleName, permName) => {
    const url = `/roles/${encodeURIComponent(roleName)}/remove-permission/${encodeURIComponent(permName)}`;
    console.log(`%c[ACCESS CONTROL] DELETE -> ${url}`, "color: #ff4444; font-weight: bold");
    return client.delete(url);
  },

  // ==========================================
  // 4. USER - ROLE ASSIGNMENT (PATCH)
  // ==========================================
  assignRolesToUser: (username, rolesList) => 
    client.patch(`/users/assign-roles?username=${encodeURIComponent(username)}`, rolesList),

  removeRolesFromUser: (username, rolesList) => 
    client.patch(`/users/remove-roles?username=${encodeURIComponent(username)}`, rolesList),
};