import { Profile, Letter, Department, UserRole } from '@/types';

export function canCreateLetter(user: Profile): boolean {
  return user.role === 'secretary';
}

export function canDispatchLetter(user: Profile, letter: Letter): boolean {
  if (user.role === 'secretary' && letter.created_by === user.id) {
    return letter.status === 'created' || letter.status === 'rejected';
  }
  return false;
}

export function canReceiveLetter(user: Profile, letter: Letter): boolean {
  return (
    user.department === letter.current_department &&
    (letter.status === 'dispatched' || letter.status === 'forwarded')
  );
}

export function canRejectLetter(user: Profile, letter: Letter): boolean {
  return canReceiveLetter(user, letter);
}

export function canAddNote(user: Profile, letter: Letter): boolean {
  return (
    user.department === letter.current_department &&
    (letter.status === 'processing' || letter.status === 'received')
  );
}

export function canCompleteProcessing(user: Profile, letter: Letter): boolean {
  return (
    user.department === letter.current_department &&
    letter.status === 'processing'
  );
}

export function canAttachPV(user: Profile, letter: Letter): boolean {
  return (
    user.role === 'payables_user' &&
    user.department === 'Payables' &&
    letter.current_department === 'Payables' &&
    (letter.status === 'processing' || letter.status === 'received')
  );
}

export function canForwardLetter(user: Profile, letter: Letter): boolean {
  return (
    user.department === letter.current_department &&
    letter.status === 'processed'
  );
}

export function canArchiveLetter(user: Profile, letter: Letter): boolean {
  return (
    user.department === 'FinalAccounts' &&
    letter.status === 'processed'
  );
}

export function canViewLetter(user: Profile, letter: Letter): boolean {
  if (user.role === 'admin' || user.role === 'audit') {
    return true;
  }
  
  if (letter.created_by === user.id) {
    return true;
  }
  
  if (user.department === letter.current_department) {
    return true;
  }
  
  return false;
}

export function getDepartmentPermissions(role: UserRole): {
  canCreate: boolean;
  canDispatch: boolean;
  canReceive: boolean;
  canProcess: boolean;
  canAttachPV: boolean;
  canArchive: boolean;
} {
  switch (role) {
    case 'secretary':
      return {
        canCreate: true,
        canDispatch: true,
        canReceive: false,
        canProcess: false,
        canAttachPV: false,
        canArchive: false,
      };
    case 'department_user':
      return {
        canCreate: false,
        canDispatch: false,
        canReceive: true,
        canProcess: true,
        canAttachPV: false,
        canArchive: false,
      };
    case 'payables_user':
      return {
        canCreate: false,
        canDispatch: false,
        canReceive: true,
        canProcess: true,
        canAttachPV: true,
        canArchive: false,
      };
    case 'admin':
    case 'audit':
      return {
        canCreate: false,
        canDispatch: false,
        canReceive: false,
        canProcess: false,
        canAttachPV: false,
        canArchive: false,
      };
    default:
      return {
        canCreate: false,
        canDispatch: false,
        canReceive: false,
        canProcess: false,
        canAttachPV: false,
        canArchive: false,
      };
  }
}
