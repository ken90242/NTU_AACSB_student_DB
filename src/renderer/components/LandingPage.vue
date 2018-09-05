<template>
  <div id="wrapper">
    <kanban activeIndex="1"></kanban>
    <div class="githubWrapper">
      <a href="https://github.com/ken90242/NTU_AACSB_student_DB" target="_blank">程式源碼</a>
    </div>
    <div>
      <a href="https://trello.com/b/fY9TENhi" target="_blank">項目進度</a>
    </div>
    <br/>
    <div>版本: {{ app_version }}</div>
    <div>
      專案簡介
      <p>
        主要以Javascript(ES7)開發，使用組件為:<br/>
        <ul>
          <li>electron.js — 桌面應用程序</li>
          <li>vue.js — 介面frameWork</li>
          <li>element-ui.js — UI元件庫</li>
          <li>xlsx.js - 讀取excel資料表</li>
        </ul> 
      </p>

    </div>
  </div>
</template>

<script>
  import kanban from './kanban';
  import eventBus from './eventBus';
  import path from 'path';
  import { version as app_version } from '../../../package.json';

  const needUpdate = function(application_v, latest_release_v) {
    const app_v = application_v.split('.');
    const github_v = latest_release_v.split('.');

    let flag = false;

    app_v.forEach((value, idx) => {
      if (value < github_v[idx]) {
        flag = true;
      }
    })
    return flag;
  }

  export default {
    name: 'landing-page',
    data() {
      return {
        app_version: app_version,
        bus: eventBus,
        latest_release_info: null,
      };
    },
    components: { kanban },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link);
      },
      showUpdate() {
        this.$notify({
          title: '警告',
          dangerouslyUseHTMLString: true,
          message: this.notify_html,
          type: 'warning',
          duration: 15,
        });
      },
    },
    beforeMount() {
      fetch('https://api.github.com/repos/ken90242/NTU_AACSB_student_DB/releases/latest')
        .then(v => v.json())
        .then(v => {
          this.latest_release_info = v;
          const github_version = v.tag_name.match(/\d\.\d\.\d/g)[0]

          if (needUpdate(app_version, github_version) === true) {
            console.log('Need update!');
            this.showUpdate();
            
          } else {
            console.log('No need to update!');
          }
        })
        .catch(e => {
          console.error(e)
        }) 
    },
    computed: {
      notify_html() {
        const download_link = this.latest_release_info.assets
          .filter(v => v.name !== 'latest.yml')
          .map(v => v.browser_download_url)[0];
        const context = '新版本已推出，請<a href="' + download_link + '" download>點此</a>立即更新！';

        return context;
      },
    },
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    padding: 60px 80px;
    padding-top: 40px;
    width: 100%;
    /*width: 100vw;*/
  }

  .githubWrapper {
    display: flex;
    align-items: center;
  }

  .githublogo {
    height: auto;
    width: 40px;
  }

</style>
