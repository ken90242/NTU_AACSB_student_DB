<template>
  <div id="wrapper">
    <kanban activeIndex="1"></kanban>
    <div style="margin:15px">
      <el-button
        type="info"
        icon="el-icon-message"
        round
        size="medium"
        @click="mailToKen">
      </el-button>
    </div>
    <h3 style="margin:5px">當前版本: v{{ app_version }}</h3>
    <hr/>
    <div style="margin:5px">
      <h3 style="display:inline-block">當前版本發布時間：</h3>
      {{ new Date().toString() }}
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="margin-bottom:5px">本次更新</h3>
        <ul style="margin-left:20px">
          <li>美化查看按鈕、首頁佈告爛</li>
          <li>新增快速寄信連結</li>
          <li>新增檢驗資料功能</li>
          <li>編輯資料介面改為cascader</li>
          <li>內部測試 - asar檔copy為獨立檔案</li>
        </ul> 
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="display:inline-block">歷代版本下載：</h3>
      <a href="https://github.com/ken90242/NTU_AACSB_student_DB/releases/" target="_blank">https://github.com/ken90242/NTU_AACSB_student_DB/releases/</a>
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="display:inline-block">項目進度：</h3>
      <a href="https://trello.com/b/fY9TENhi" target="_blank">https://trello.com/b/fY9TENhi</a>
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="display:inline-block">原始程式碼：</h3>
      <a href="https://github.com/ken90242/NTU_AACSB_student_DB" target="_blank">https://github.com/ken90242/NTU_AACSB_student_DB</a>
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
          title: '重要',
          dangerouslyUseHTMLString: true,
          message: this.notify_html,
          type: 'warning',
          duration: 15000,
        });
      },
      showDataIssue() {
        this.$confirm('尚未偵測到資料，請擇一操作？', '錯誤', {
          confirmButtonText: '初始化空白資料',
          cancelButtonText: '手動新增(新增完後請重啟)',
          type: 'error',
          center: true,
          showClose: false,
          closeOnPressEscape: false,
          closeOnClickModal: false,
          lockScroll: true,
        }).then(() => {
          const mkdirSync = function(dirPath) {
            try {
              fs.mkdirSync(dirPath)
            } catch (err) {
              if (err.code !== 'EEXIST') throw err
            }
          }
          const src = path.join(__static, '/initialize_public');
          const dest = path.join(remote.app.getPath('userData'), '/public/');
          
          mkdirSync(dest);

          ncp(src, dest, (err) => {
            if (err) {
              this.$notify({
                title: '錯誤',
                message: err,
                type: 'error',
              });
            }
            this.$notify({
              title: '成功',
              message: '資料初始化成功！',
              type: 'success',
            });
            this.$alert('即將重啟應用程式', '消息', {
              confirmButtonText: '確定',
              type: 'info',
              center: true,
              showClose: false,
              closeOnPressEscape: false,
              closeOnClickModal: false,
              lockScroll: true,
              callback: action => {
                location.reload();
              }
            });
          });
        }).catch(() => {
          shell.openItem(remote.app.getPath('userData'));
          this.$alert('新增完成後，點擊確認以重啟應用程式', '重要', {
            confirmButtonText: '確認已新增完成',
            type: 'warning',
            center: true,
            showClose: false,
            closeOnPressEscape: false,
            closeOnClickModal: false,
            lockScroll: true,
            callback: action => {
              location.reload();
            }
          });
        });
      },
      mailToKen() {
        window.location.href = `mailto:ken90242@ntu.edu.tw?body=<version: ${this.app_version}>`;
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
          console.error(e);
        }) 
    },
    mounted() {
      if (this.bus.publicDataExisted === false) {
        this.showDataIssue();
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
