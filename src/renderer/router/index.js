import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default,
    },
    {
      path: '/totaldata',
      name: 'consolidate-page',
      component: require('@/components/ConsolidatePage').default,
    },
    {
      path: '/singlesearchdata',
      name: 'single-search-page',
      component: require('@/components/SingleSearchPage').default,
    },
    {
      path: '/statisticart',
      name: 'statistic-art',
      component: require('@/components/statisticArt').default,
    },
    {
      path: '/consolidateclassstudent',
      name: 'consolidate-class-student',
      component: require('@/components/consolidateClassStudent').default,
    },
    {
      path: '/studentimportexport',
      name: 'student-import-export',
      component: require('@/components/studentImportExport').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
