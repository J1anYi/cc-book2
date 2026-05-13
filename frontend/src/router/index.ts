import { createRouter, createWebHistory } from 'vue-router';
import Library from '../views/Library.vue';
import Upload from '../views/Upload.vue';
import Admin from '../views/Admin.vue';
import Reader from '../views/Reader.vue';
import BookDetail from '../views/BookDetail.vue';

const routes = [
  {
    path: '/',
    name: 'Library',
    component: Library
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/library',
    redirect: '/'
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: BookDetail
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true }
  },
  {
    path: '/read/:id',
    name: 'Reader',
    component: Reader
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route guard for authentication
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('adminToken');

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Upload' });
  } else {
    next();
  }
});

export default router;
