import * as Pages from './pages';
import Router from './core/Router';
import './styles/global.scss';

export const router = new Router('#app');

router
  .use('/', Pages.PageChat)
  .use('/login', Pages.PageLogin)
  .use('/signup', Pages.PageSignup)
  .use('/chat', Pages.PageChat)
  .use('/profile', Pages.PageProfile)
  .use('/500', Pages.Page500)
  .use('*', Pages.Page404)
  .start();
