import Handlebars from 'handlebars';
import * as Components from './components';
import * as Pages from './pages';

import { loginPageProps } from './pages/login/login.props.ts';
import { signupPageProps } from './pages/signup/signup.props.ts';
import { chatPageProps } from './pages/chat/chat.props.ts';
import { profilePageProps } from './pages/profile/profile.props.ts';

import './styles/global.scss';

const pages = {
    'login': [Pages.LoginPage, loginPageProps],
    'signup': [Pages.SignupPage, signupPageProps],
    'chat': [Pages.ChatPage, chatPageProps],
    'profile': [Pages.ProfilePage, profilePageProps],
    '404': [Pages.Page404],
    '500': [Pages.Page500],
}

Object.entries(Components).forEach(([name, component]) => {
    Handlebars.registerPartial(name, component);
});

function navigate(path: string) {
    const page = path.replace('/', '') || 'login';
    //@ts-ignore
    const [template, props] = pages[page] || pages['404'];
    const html = Handlebars.compile(template)(props);
    document.getElementById('app')!.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    navigate(location.pathname);
});
