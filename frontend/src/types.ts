export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
}
