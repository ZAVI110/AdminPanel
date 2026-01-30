import client from './client';

export const agentApi = {
  // ==========================================
  // 1. AGENT CORE MANAGEMENT
  // ==========================================
  
  // GET all agents with full configuration
  getList: () => client.get('/agent/list'),

  // GET just the list of agent codes (strings)
  getAgentCodes: () => client.get('/agent/agents'),

  // POST create a new agent node
  createConfig: (data) => client.post('/agent/config', data),

  // PUT update existing agent configuration
  updateConfig: (id, data) => client.put(`/agent/${encodeURIComponent(id)}/config`, data),

  // DELETE remove an agent node permanently
  deleteAgent: (id) => client.delete(`/agent/${encodeURIComponent(id)}`),


  // ==========================================
  // 2. GLOBAL TOOL REGISTRY (Tool Definitions)
  // ==========================================

  // GET all available tools in the system
  getDefinitions: (enabledOnly = true) => 
    client.get(`/tools/definitions?enabled_only=${enabledOnly}`),

  // POST register a brand new capability
  createDefinition: (data) => 
    client.post('/tools/definitions', data),


  // ==========================================
  // 3. AGENT TOOL PERMISSIONS (The Toggles)
  // ==========================================

  // GET which tools are currently enabled for an agent
  getTools: (agentId) => client.get(`/agent/${encodeURIComponent(agentId)}/tools`),

  /**
   * 🟢 TOGGLE ON (Enable Tool)
   * Matches CURL: POST /agent/{agent_code}/tools/enable
   * Body: { tool_id: string, credentials: { ... } }
   */
  enableTool: (agentId, toolId, credentials = {}) => {
    return client.post(`/agent/${encodeURIComponent(agentId)}/tools/enable`, {
      tool_id: String(toolId),
      credentials: credentials 
    });
  },

  /**
   * 🔴 TOGGLE OFF (Disable Tool)
   * Matches CURL: DELETE /agent/{agent_code}/tools/{tool_id}
   */
  disableTool: (agentId, toolId) => {
    return client.delete(`/agent/${encodeURIComponent(agentId)}/tools/${encodeURIComponent(toolId)}`);
  },


  // ==========================================
  // 4. UTILITIES & EXECUTION
  // ==========================================

  // Run a tool manually for testing
  executeTool: (agentId, toolData) => 
    client.post(`/agent/${encodeURIComponent(agentId)}/tools/execute`, toolData),

  // Auto-scan for available tool paths
  discoverTools: (agentId) => 
    client.post(`/agent/${encodeURIComponent(agentId)}/tools/discover`, {}),


  // ==========================================
  // 5. NEURAL TRAFFIC & LOGS
  // ==========================================

  // Standard chat interaction
  invoke: (agentCode, inputData) => 
    client.post(`/agent/${encodeURIComponent(agentCode)}/invoke`, { input: inputData }),

  // Fetch audit trail / logs
  getLogs: (agentCode, limit = 100) => 
    client.get(`/agent/${encodeURIComponent(agentCode)}/tools/logs?limit=${limit}`),
  // Add this inside the agentApi object
getUsage: () => client.get('/agent/usage'),
};