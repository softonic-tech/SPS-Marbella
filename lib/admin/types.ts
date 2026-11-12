export type ContactRequestStatus = 'new' | 'reviewing' | 'done' | 'archived';

export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  status: ContactRequestStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
};

export function emptyContactRequest(): ContactRequest {
  return {
    id: '',
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
    status: 'new',
    createdAt: '',
    updatedAt: '',
    notes: '',
  };
}
