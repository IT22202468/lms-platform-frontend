const API_BASE = "/api";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    let body: { message?: string; errors?: string[] } = {};
    try {
      body = await res.json();
    } catch {
      // non-JSON error
    }
    throw new ApiError(
      body.message || `Request failed with status ${res.status}`,
      res.status,
      body.errors
    );
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

/* ── Auth ── */

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface MeResponse {
  name: string;
}

export function register(email: string, password: string, role: string): Promise<AuthResponse> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token: string): Promise<MeResponse> {
  return request("/auth/me", { token });
}

/* ── Courses ── */

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  published: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function listCourses(token: string, page = 0, size = 12): Promise<PageResponse<CourseResponse>> {
  return request(`/courses?page=${page}&size=${size}`, { token });
}

export function getCourse(token: string, courseId: string): Promise<CourseResponse> {
  return request(`/courses/${courseId}`, { token });
}

export function createCourse(
  token: string,
  data: { title: string; description: string }
): Promise<CourseResponse> {
  return request("/courses", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateCourse(
  token: string,
  courseId: string,
  data: { title: string; description: string }
): Promise<CourseResponse> {
  return request(`/courses/${courseId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteCourse(token: string, courseId: string): Promise<{ message: string }> {
  return request(`/courses/${courseId}`, { method: "DELETE", token });
}

export function publishCourse(token: string, courseId: string): Promise<CourseResponse> {
  return request(`/courses/${courseId}/publish`, { method: "PUT", token });
}

export function listInstructorCourses(
  token: string,
  page = 0,
  size = 10
): Promise<PageResponse<CourseResponse>> {
  return request(`/instructor/courses?page=${page}&size=${size}`, { token });
}

/* ── Enrollments ── */

export interface EnrollmentResponse {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
}

export interface CourseStudentResponse {
  studentId: string;
  enrolledAt: string;
}

export function enrollInCourse(token: string, courseId: string): Promise<{ message: string }> {
  return request(`/courses/${courseId}/enroll`, { method: "POST", token });
}

export function listStudentEnrollments(
  token: string,
  page = 0,
  size = 10
): Promise<PageResponse<EnrollmentResponse>> {
  return request(`/student/enrollments?page=${page}&size=${size}`, { token });
}

export function listCourseStudents(
  token: string,
  courseId: string,
  page = 0,
  size = 10
): Promise<PageResponse<CourseStudentResponse>> {
  return request(`/courses/${courseId}/students?page=${page}&size=${size}`, { token });
}

export { ApiError };
