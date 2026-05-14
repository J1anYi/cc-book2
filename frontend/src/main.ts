import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Import design system and global styles
import './styles/design-system.css';
import './styles/global.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
