export const ROLE_HOME_PATHS = {
    admin: '/admin',
    teacher: '/teacher',
    student: '/student',
    user: '/student'
};

export const normalizeRole = (role) => {
    if (role === 'user') return 'student';
    return role || 'student';
};

export const getRoleHomePath = (role) => {
    return ROLE_HOME_PATHS[role] || ROLE_HOME_PATHS[normalizeRole(role)] || '/student';
};
