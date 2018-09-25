<template>
  <div id="wrapper">
    <kanban activeIndex="1"></kanban>
    <div style="margin:5px">
      <h3 style="display:inline-block">程式資訊</h3>
      <ul style="margin-left:20px">
        <li>版本：v{{ app_version }}</li>
        <li>資料流程圖: <a href="static/assets/data.png" download="data.png">Data.png</a></li>
        <li>項目進度：<a href="https://trello.com/b/fY9TENhi" target="_blank">https://trello.com/b/fY9TENhi</a></li>
        <li>原始程式碼：<a href="https://github.com/ken90242/NTU_AACSB_student_DB" target="_blank">https://github.com/ken90242/NTU_AACSB_student_DB</a></li>
        <li>歷代版本下載：<a href="https://github.com/ken90242/NTU_AACSB_student_DB/releases/" target="_blank">https://github.com/ken90242/NTU_AACSB_student_DB/releases/</a></li>
      </ul> 
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="margin-bottom:5px">本次更新</h3>
        <ul style="margin-left:20px">
          <li>sorting其他選課field(*類別、*課程識別碼)\每個都sorting</li>
          <li>標記是否為預設畢業標準</li>
          <li>預設照片為學號.jpg or .png...</li>
          <li>年齡統計要用入學年紀(GMBA問卷來源會是當下入學的年齡)</li>
          <li>GMBA表單，註1,2,3,4,5，要顯示在搜尋學生那邊(標註)</li>
          <li>個人查詢中的課程列表增加GPA跟等地分數</li>
          <li>修改選修label -> 其他label</li>
          <li>畢業標準上下對調</li>
          <li>畢業標準 -> 預設畢業標準</li>
          <li>修改必修課程 -> 學生曾修課程</li>
          <li>範例大頭貼圖片更換</li>
          <li>學生背景統整的按鈕(新增、覆蓋)小說明</li>
          <li>圖表統計流程改善、介面優化</li>
          <li>改善排列課程的GPA</li>
          <li>bug fix: 在全部瀏覽頁面，點選F列表後，其他列表的資料會消失</li>
          <li>bug fix: 標籤在沒資料依然會顯示</li>
        </ul> 
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="display:inline-block">內部測試變數：</h3>
      <p>{{ test }}</p>
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
        },
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

            this.$notify({
              title: '成功',
              message: '資料初始化成功！',
              type: 'success',
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
      // if (this.bus.publicDataExisted === false) {
      //   this.showDataIssue();
      // }
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
