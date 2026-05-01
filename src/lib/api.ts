export const API_ROOT = "/api";

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

  const res = await fetch(`${API_ROOT}${path}`, {
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

async function requestMultipart<T>(path: string, token: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
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

export interface LectureContentItem {
  materialId?: string | null;
  title: string;
  description: string;
  contentType: string;
  contentUrl: string;
  durationSeconds?: number | null;
  uploadedAt?: string | null;
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string | null;
  thumbnailImageUrl?: string | null;
  lectureContents?: LectureContentItem[];
  published: boolean;
  createdAt: string;
  modifiedAt?: string | null;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type CreateCoursePayload = {
  title: string;
  description: string;
  thumbnailImageUrl?: string | null;
  lectureContents?: LectureContentPayload[];
};

export type UpdateCoursePayload = CreateCoursePayload;

export type LectureContentPayload = {
  materialId?: string | null;
  title: string;
  description: string;
  contentType: string;
  contentUrl: string;
  durationSeconds?: number | null;
};

export function listCourses(token: string, page = 0, size = 12): Promise<PageResponse<CourseResponse>> {
  return request(`/courses?page=${page}&size=${size}`, { token });
}

export function getCourse(token: string, courseId: string): Promise<CourseResponse> {
  return request(`/courses/${courseId}`, { token });
}

export function createCourse(token: string, data: CreateCoursePayload): Promise<CourseResponse> {
  return request("/courses", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateCourse(token: string, courseId: string, data: UpdateCoursePayload): Promise<CourseResponse> {
  return request(`/courses/${courseId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function uploadCourseThumbnail(token: string, courseId: string, file: File): Promise<CourseResponse> {
  const form = new FormData();
  form.append("file", file);
  return requestMultipart(`/courses/${courseId}/thumbnail`, token, form);
}

export function uploadCourseMaterial(
  token: string,
  courseId: string,
  file: File,
  title: string,
  description: string
): Promise<CourseResponse> {
  const form = new FormData();
  form.append("file", file);
  const params = new URLSearchParams({ title, description });
  return requestMultipart(`/courses/${courseId}/materials?${params.toString()}`, token, form);
}

export async function downloadCourseMaterial(
  token: string,
  courseId: string,
  materialId: string,
  filenameFallback: string
): Promise<void> {
  const res = await fetch(
    `${API_ROOT}/courses/${encodeURIComponent(courseId)}/materials/${encodeURIComponent(materialId)}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.message) message = body.message as string;
    } catch {
      //
    }
    throw new ApiError(message, res.status);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let fname = filenameFallback;
  if (cd) {
    const m = cd.match(/filename="?([^";\n]+)"?/i);
    if (m?.[1]) fname = m[1];
  }
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = fname;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** GET protected thumbnail; caller must revoke the returned blob URL after use / on rerender cleanup. */
export async function fetchCourseThumbnailBlobUrl(token: string, thumbnailRelativePath: string): Promise<string | null> {
  const res = await fetch(`${API_ROOT}${thumbnailRelativePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function deleteCourse(token: string, courseId: string): Promise<{ message: string }> {
  return request(`/courses/${courseId}`, { method: "DELETE", token });
}

export function publishCourse(token: string, courseId: string): Promise<CourseResponse> {
  return request(`/courses/${courseId}/publish`, { method: "PUT", token });
}

export function listInstructorCourses(token: string, page = 0, size = 10): Promise<PageResponse<CourseResponse>> {
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
