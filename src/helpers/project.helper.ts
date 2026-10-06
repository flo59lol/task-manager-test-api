export const generateProjectReference = (id: number): string => {
  return `PRJ-${String(id).padStart(4, '0')}`;
};

export const isProjectOverdue = (dueDate: Date, status: string): boolean => {
  return dueDate.getTime() < Date.now() && status !== 'COMPLETED';
};