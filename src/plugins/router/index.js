import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from "../../components/pages/Home.vue";
import Login from "../../components/pages/Login.vue";
import Logout from "../../components/pages/Logout.vue";
import Register from "../../components/pages/Register.vue";
import Status from "../../components/pages/Status.vue";
import Dashboard from "../../components/pages/Dashboard.vue";

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            path: '/',
            name: 'landing',
            component: Home
        },
        {
            path: '/home',
            name: 'home',
            component: Home
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/logout',
            name: 'logout',
            component: Logout
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/status',
            name: 'status',
            component: Status
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard
        }
    ]
});