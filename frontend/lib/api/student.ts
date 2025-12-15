import { apiClient } from "./client";
import { StudentDashboardStats, RequestSummary } from "./types";

export const getStudentDashboardStats = async (): Promise<StudentDashboardStats> => {
  const response = await apiClient.get<StudentDashboardStats>("/student/dashboard/stats");
  return response;
};

export const getRecentRequests = async (limit: number = 5): Promise<RequestSummary[]> => {
  const response = await apiClient.get<RequestSummary[]>(`/student/requests/recent?limit=${limit}`);
  return response;
};
