import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/Login.vue'
import home from '../components/Home.vue'
import welcome from '../components/Welcome.vue'
import users from '../views/Users.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: login
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: welcome
    }, {
      path: '/users',
      component: users
    }]

  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转而来
  // next 放行 next('/login')跳转到login
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
