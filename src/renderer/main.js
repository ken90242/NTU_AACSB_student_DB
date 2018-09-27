import Vue from 'vue';
import axios from 'axios';
import ElementUI from 'element-ui';
import prompt from 'electron-prompt';
import { sha3_512 } from 'js-sha3';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App';
import router from './router';
import store from './store';
import locale from 'element-ui/lib/locale/lang/zh-TW'
import StoreConfig from './storeConfig.js'

Vue.use(ElementUI, { locale });

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

// const storeConfig = new StoreConfig({
//   // We'll call our data file 'user-preferences'
//   configName: 'user-setting',
//   defaults: {
//     // gmba
//     GMBA_password: '4945dc0f0bd7b12bd7c5deca88eba58e05868938c25d562001a5de40a4dd5f18fb94db3d91f4468c3ef63e3ce9e29a6ee16a6f80ce8c4f7005c0cab5f3b2ba61',
//   }
// });

// const verifyFunc = function() {
// 	prompt({
// 	  title: 'Verification',
// 	  label: 'Please input GMBA password:',
// 	  value: '',
// 	  inputAttrs: {
// 	    type: 'password',
// 	    required: true,
// 	    placeholder: 'GMBA password'
// 	  },
// 	}).then((r) => {
// 	  if(sha3_512(r) === storeConfig.get('GMBA_password')) {
// 	  	alert(sha3_512(r))
// 			new Vue({
// 			  components: { App },
// 			  router,
// 			  store,
// 			  template: '<App/>',
// 			}).$mount('#app');
// 	  } else {
// 			alert('Password wrong!');
// 			verifyFunc();
// 	  }
// 	}).catch(console.error);
// }

// verifyFunc();

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

