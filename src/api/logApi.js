import client from './client';
export const logApi = {
  // GET all agent names for the dropdown
  getCodes: () => client.get('/agent/agents'),
  // GET logs for a specific agent
  getLogs: (agentCode, limit = 50) => 
    client.get(`/agent/${agentCode}/tools/logs?limit=${limit}`),
};