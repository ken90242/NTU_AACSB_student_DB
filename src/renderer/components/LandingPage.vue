<template>
  <div
    id="wrapper"
    v-loading.fullscreen.lock="avgImageStatus === '處理中...'"
    :element-loading-text="`${ avgImageStatus } ${ progressBar }% (耗時約數十分鐘，請耐心等候)`"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <kanban activeIndex="1"></kanban>
    <!-- {{this.$store.state}} -->
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
            <li>3/05-修正(Celia)：修正畢業標準預設顯示為5頁，其他為50頁</li>
            <li>3/25-功能(Lisa)：新增兩個欄位(1)採計學分數(2)採計學年學期</li>
            <li>3/25-功能(Lisa)：新增一個欄位”身分證字號”</li>
            <li>3/25-架構(Lisa)：對應excel檔案: GMBA歷年學生採計學分數</li>
          </ol>
        </li>
      </ul> 
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="margin-bottom:5px">系統設定</h3>
      <ul style="list-style-type: none;">
        <li style="width:60%;display:flex;justify-content:space-between;margin:10px">
          <div>
            A. 目前資料目錄：
            <span v-if="shareDataExisted">{{ public_file_path }}</span>
            <span v-else style="color:red">無，請立即更改資料目錄</span>
          </div>
          <el-button type="primary" size="medium" round @click="openDialogFunc(ChangePublicDir)" style="margin-left:10px;">更改資料目錄</el-button>
        </li>
        <li style="width:60%;display:flex;justify-content:space-between;margin:10px">
          <div>
            B. 平均壓縮照片大小：
            <span v-if="avgImageStatus !== ''" style="color:red">{{ avgImageStatus }}</span>
            <span v-else>{{ avgImageSize }} MB</span>
          </div>
          <el-button
            :type="avgImageStatus === '' ? 'info' : 'primary'"
            size="medium"
            round
            :disabled="avgImageStatus === ''"
            @click="openDialogFunc(compressImages)"
            style="margin-left:10px;">
              壓縮所有照片
          </el-button>
        </li>
      </ul>
    </div>
    <hr/>
    <div style="margin:5px">
      <h3 style="display:inline-block">內部測試工具</h3>
      <div style="margin:10px">{{ test }}</div>

      <el-input v-model="testUserDataPath" style="width:50%"></el-input>
      <el-button type="info" @click="openSomething">開啟(預設UserData路徑)</el-button>
    </div>
    <hr/>
    <el-dialog
      title="請再次確認 !"
      :visible.sync="dialogVisible"
      center>
      <span>確定執行 "{{ dialogFuncName }}" 功能嗎？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="danger" @click="executeDialogFunc">確定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import kanban from './kanban';
  import path from 'path';
  import fs from 'fs';
  import { shell } from 'electron';
  import { version as app_version } from '../../../package.json';
  import { ncp } from 'ncp';
  import { remote } from 'electron';
  import StoreConfig from '../storeConfig.js';
  import { exec } from 'child_process';
  import compress_images from 'compress-images';
  import glob from 'glob';
  import downloadFile from '../download.js';

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
    mixins: [kanban],
    data() {
      return {
        test: {
          public_file_path: this.$store.state.excelData.public_file_path,
          static_path: __static,
          userdata_path: remote.app.getPath('userData'),
          'user-setting-file': fs.readdirSync(remote.app.getPath('userData'))
            .filter(v => path.extname(v).indexOf('json') !== -1)
            .map(v => path.join(remote.app.getPath('userData'), v)),
        },
        app_version: app_version,
        latest_release_info: null,
        testUserDataPath: remote.app.getPath('userData'),
        avgImageSize: 0,
        progressBar: 0,
        avgImageStatus: '',
        progressException: true,
        dialogVisible: false,
        dialogFunc: () => {},
      };
    },
    components: { kanban },
    methods: {
      downloadUpdateDone(statusCode, filename) {
        shell.openItem(filename);
        this.progressBar = 0;
        this.avgImageStatus = '';
      },
      syncDownloadUpdate(downloaded_size, expected_size) {
        this.avgImageStatus = '處理中...';
        this.progressBar = (downloaded_size/expected_size*100).toFixed(1);
      },
      executeDialogFunc() {
        this.dialogVisible = false;
        this.dialogFunc();
      },
      openDialogFunc(func) {
        this.dialogVisible = true;
        this.dialogFunc = func;
      },
      updateAvgImageSize() {
        this.avgImageSize = 0;
        glob(`${this.profilePicFolder}/**/compressed/*.+(png|gif|svg|jpg)`, (er, files) => {
          for (let f of files) {
            this.avgImageSize += parseInt(fs.statSync(f).size, 10);
          }
          this.avgImageSize = ((this.avgImageSize / (1024 * 1024)) / files.length).toFixed(2);
          if (files.length === 0) {
            this.avgImageStatus = '尚未壓縮';
          } else {
            this.avgImageStatus = '';
          }
        });
      },
      compressImages() {
        this.avgImageStatus = '處理中...';
        let progressIndex = 0;
        const that = this;
        that.progressBar = 0;
        glob(`${this.profilePicFolder}/*/*.+(jpg|png|svg|gif)`, function (er, files) {
          files = files;
          for(const f of files) {
            compress_images(f, path.join(path.dirname(f), '/compressed/'),
              { compress_force: true, statistic: false, autoupdate: false },
              false,
              { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
              { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
              { svg: { engine: 'svgo', command: '--multipass' } },
              { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }, 
              (error, completed, statistic) => {
                if (error !== null) {
                  console.error(error);
                }
                progressIndex += 1;

                if (progressIndex === files.length) {
                  that.avgImageStatus = '';
                  that.updateAvgImageSize();
                  that.$notify({
                    title: '成功',
                    duration: 0,
                    message: '壓縮成功！',
                    type: 'success',
                  });
                } else if (progressIndex % 5 === 0) {
                  that.progressBar = ((progressIndex / files.length) * 100).toFixed(1);
                  that.$forceUpdate();
                }
              }
            )
          }
        });
      },
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
      showUpdate(github_version) {
        this.$msgbox({
          title: '重要',
          message: '新版本已推出，請立即更新!',
          type: 'warning',
          duration: 15000,
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              const download_link = this.latest_release_info.assets
                .filter(v => v.name !== 'latest.yml')
                .map(v => v.browser_download_url)[0];
              console.log(github_version)
              const newFilePath = remote.dialog.showSaveDialog({
                defaultPath: `gmba-v${github_version}`,
                filters: [{
                  name: 'exe 執行檔',
                  extensions: ['exe'],
                }],
              });
              console.log('newFilePath', newFilePath)
              if (newFilePath) {
                this.avgImageStatus = '處理中...';
                downloadFile(download_link, newFilePath, this.syncDownloadUpdate, this.downloadUpdateDone)
              }

              done();

            } else {
              done();
            }
          }
        });
      },
      showShareFolderReq() {
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
      },
    },
    beforeMount() {
      // update news
      fetch('https://api.github.com/repos/ken90242/NTU_AACSB_student_DB/releases/latest')
        .then(v => v.json())
        .then(v => {
          this.latest_release_info = v;
          const github_version = v.tag_name.match(/\d\.\d\.\d/g)[0]

          if (needUpdate(app_version, github_version) === true) {
            // Need update!
            this.showUpdate(github_version);
            
          }
        })
        .catch(e => {
          throw e;
        })

      //  calculate image folder size
      this.updateAvgImageSize();
    },
    mounted() {
      if (!fs.existsSync(path.join(remote.app.getPath('userData'), 'user-setting.json')) ||
          !this.shareDataExisted) {
        this.showShareFolderReq()
      }
    },
    computed: {
      dialogFuncName() {
        let nm = '無';
        if (this.dialogFunc === this.ChangePublicDir) {
          nm = '更改資料目錄';
        } else if(this.dialogFunc === this.compressImages) {
          nm = '壓縮所有照片';
        } else if(this.dialogFunc === this.InstallDownloadUpdate) {
          nm = '安裝更新檔案'
        }
        return nm;
      },
      // to access local state with `this`, a normal function must be used
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
