export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000',
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        refresh: '/auth/refresh'
    },
    users: {
        base: '/users',
        getAll: '/users',
        getById: (id: number) => `/users/${id}`,
        update: (id: number) => `/users/${id}`,
        delete: (id: number) => `/users/${id}`
    },

    applications: {
        base: '/application',

        delegate: {
            create: '/application/delegate',
            getAll: '/application/delegate',
            getById: (id: number) => `/application/delegate/${id}`,
            update: (id: number) => `/application/delegate/${id}`,
            delete: (id: number) => `/application/delegate/${id}`
        },

        candidate: {
            create: '/application/candidate',
            getAll: '/application/candidate',
            getById: (id: number) => `/application/candidate/${id}`,
            update: (id: number) => `/application/candidate/${id}`,
            delete: (id: number) => `/application/candidate/${id}`
        }
    },

    elections: {
        create: '/elections',
        getAll: '/elections',
        getById: (id: number) => `/elections/${id}`,
        update: (id: number) => `/elections/${id}`,
        delete: (id: number) => `/elections/${id}`,
    }
};
