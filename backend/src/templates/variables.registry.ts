export interface VariableDef {
  key: string;
  label: string;
  required: boolean;
  fallback?: string;
}

export const VARIABLES: VariableDef[] = [
  { key: 'firstName', label: 'Имя', required: false, fallback: 'fullName' },
  { key: 'lastName', label: 'Фамилия', required: false },
  { key: 'fullName', label: 'Полное имя', required: false },
  { key: 'projectTitle', label: 'Проект', required: true },
  { key: 'companyName', label: 'Компания', required: true },
  { key: 'position', label: 'Позиция', required: false },
];