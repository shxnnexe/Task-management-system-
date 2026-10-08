export interface Project {
  id: string | number;
  name: string;
  description?: string;
  tasks?: Task[];
}

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  status?: string;
}
