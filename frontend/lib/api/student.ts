import { apiClient } from "./client";
import { StudentDashboardStats } from "./types";

export const getStudentDashboardStats = async (): Promise<StudentDashboardStats> => {
  const response = await apiClient.get<StudentDashboardStats>("/student/dashboard/stats");
  return response;
};
