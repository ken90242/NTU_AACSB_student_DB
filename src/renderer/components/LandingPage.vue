<template>
  <div id="wrapper">
    <kanban activeIndex="1"></kanban>
    <div style="margin:5px">
      <h3 style="display:inline-block">系統資訊</h3>
      <ul style="margin-left:20px">
        <li>版本：v{{ app_version }}</li>
        <li>資料流程圖: <a href="static/assets/data.png" download="data.png">Data.png</a></li>
        <li>項目進度：<a href="https://trello.com/b/fY9TENhi" target="_blank">https://trello.com/b/fY9TENhi</a></li>
        <li>原始程式碼：<a href="https://github.com/ken90242/NTU_AACSB_student_DB" target="_blank">https://github.com/ken90242/NTU_AACSB_student_DB</a></li>
        <li>歷代版本下載：<a href="https://github.com/ken90242/NTU_AACSB_student_DB/releases/" target="_blank">https://github.com/ken90242/NTU_AACSB_student_DB/releases/</a></li>
        <li>
          <strong>本次更新</strong>
          <ol style="margin-left:10px">
            <li>搜尋頁面排版更動：畢業標準文字調整</li>
            <li>資料路徑設定功能</li>
            <li>正式發布1.0.0公開版本</li>
          </ol>
        </li>
      </ul> 
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="margin-bottom:5px">系統設定</h3>
      <span>目前資料目錄：{{ publicPath }}</span>
      <el-button type="danger" size="medium" round @click="ChangePublicDir" style="margin-left:10px;">更改資料目錄</el-button>
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="display:inline-block">內部測試工具</h3>
      <div style="margin:10px">{{ test }}</div>

      <el-input v-model="testPath" style="width:50%"></el-input>
      <el-button type="info" @click="openSomething">預設UserData路徑開啟</el-button>
    </div>
    <hr/>
  </div>
</template>

<script>
  import kanban from './kanban';
  import eventBus from './eventBus';
  import path from 'path';
  import fs from 'fs';
  import { shell } from 'electron';
  import { version as app_version } from '../../../package.json';
  import { ncp } from 'ncp';
  import { remote } from 'electron';
  import StoreConfig from '../storeConfig.js'

  const needUpdate = function(application_v, latest_release_v) {
    const app_v = application_v.split('.');
    const github_v = latest_release_v.split('.');

    const weights = [1000, 100, 1];

    const app_wgt = app_v.reduce((acc, v, idx) => {
      return acc + v * weights[idx];
    }, 0);
    const github_wgt = github_v.reduce((acc, v, idx) => {
      return acc + v * weights[idx];
    }, 0);

    return github_wgt > app_wgt;
  }

  export default {
    name: 'landing-page',
    data() {
      return {
        test: {
          static_path: __static,
          userdata_path: remote.app.getPath('userData'),
          'user-setting-file': fs.readdirSync(remote.app.getPath('userData'))
            .filter(v => path.extname(v).indexOf('json') !== -1)
            .map(v => path.join(remote.app.getPath('userData'), v)),
        },
        app_version: app_version,
        bus: eventBus,
        latest_release_info: null,
        testUserDataPath: remote.app.getPath('userData'),
      };
    },
    components: { kanban },
    methods: {
      ChangePublicDir() {
        remote.dialog.showOpenDialog({
          title: "請選取GMBA系統的public目錄",
          properties: ["openDirectory"],
        }, (folderPaths) => {
          if (!folderPaths) { return false }
          const storeConfig = new StoreConfig({ configName: 'user-setting', });
          const publicPath = (folderPaths.length && folderPaths.length > 0) ? folderPaths[0] : 'Z:/GMBA系統/public';
          storeConfig.set('production_path', publicPath);
          storeConfig.set('windowBounds', { width: 1000, height: 600 });
          location.reload();
        });
      },
      openSomething() {
        shell.openItem(this.testUserDataPath);
      },
      open(link) {
        this.$electron.shell.openExternal(link);
      },
      showUpdate() {
        this.$notify({
          title: '重要',
          dangerouslyUseHTMLString: true,
          message: this.notify_html,
          type: 'warning',
          duration: 15000,
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
            // Need update!
            this.showUpdate();
            
          }
        })
        .catch(e => {
          throw e;
        }) 
    },
    mounted() {
      if ((!fs.existsSync(path.join(remote.app.getPath('userData'), 'user-setting.json')))) {
        this.$alert('未偵測到資料及照片目錄路徑，請手動選取share folder', '重要', {
          confirmButtonText: '確定',
          type: 'info',
          center: true,
          showClose: false,
          closeOnPressEscape: false,
          closeOnClickModal: false,
          lockScroll: true,
          callback: action => {
            this.ChangePublicDir();
          }
        });
      }
    },
    computed: {
      notify_html() {
        const download_link = this.latest_release_info.assets
          .filter(v => v.name !== 'latest.yml')
          .map(v => v.browser_download_url)[0];
        const context = `新版本已推出，請<a href=${ download_link } download>點此</a>立即更新！`;

        return context;
      },
      publicPath(){
        const storeConfig = new StoreConfig({ configName: 'user-setting', });
        return storeConfig.get('production_path');
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
