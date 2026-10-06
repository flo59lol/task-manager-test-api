export const validateTaskTitle = (title: string) : boolean => {
  return title.trim().length >= 3;
};

export const generateTaskReference = (id: number): string => {
  return `TSK-${String(id).padStart(4, '0')}`;
};

export const isTaskOverdue = (dueDate: Date, status: string): boolean => {
  return dueDate.getTime() < Date.now() && status !== 'COMPLETED';
};

