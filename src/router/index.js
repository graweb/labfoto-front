import Vue from 'vue';
import VueRouter from 'vue-router';
import api from '../services/api';

//COMPONENTS
import Login from '../views/Login'
import Dashboard from '../views/Dashboard'
import Package from '../views/Package'
import Customer from '../views/Customer'
import Contract from '../views/Contract'
import Enterprise from '../views/Enterprise'
import Schedule from '../views/Schedule'
import SignContract from '../views/SignContract'
import CustomerRegister from '../views/CustomerRegister'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: Login,
    },
    {
        path: '/dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/enterprises',
        component: Enterprise,
        meta: { requiresAuth: true }
    },
    {
        path: '/packages',
        component: Package,
        meta: { requiresAuth: true }
    },
    {
        path: '/customers',
        component: Customer,
        meta: { requiresAuth: true }
    },
    {
        path: '/contracts',
        component: Contract,
        meta: { requiresAuth: true }
    },
    {
        path: '/schedules',
        component: Schedule,
        meta: { requiresAuth: true }
    },
    {
        path: '/sign_contract/:id',
        component: SignContract,
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        component: CustomerRegister,
        meta: { requiresAuth: false }
    },
];

const router = new VueRouter({
    mode: 'history',
    routes: routes
});

/***
 * Método para checar autenticação
 */
router.beforeEach((to, from, next) => {

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!api.isLogged({ 'token': localStorage.getItem('access_token') })) {
            next({ path: '/' })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router;