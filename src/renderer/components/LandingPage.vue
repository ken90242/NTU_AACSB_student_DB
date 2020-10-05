<template>
  <div
    id="wrapper"
    v-loading.fullscreen.lock="avgImageStatus === '處理中...' || backupRelatedWork"
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
            <li>2020-10-05 修正：壓縮照片</li>
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
            B. 尚未壓縮照片數量：
            <span>{{ this.uncompressedImageAmount }}</span>
          </div>
          <el-button
            :type="avgImageStatus === '' ? 'info' : 'primary'"
            size="medium"
            round
            :disabled="true"
            @click="openDialogFunc(compressImages)"
            style="margin-left:10px;">
            {{ avgImageStatus === '' ? "無可壓縮照片" : "立即壓縮照片" }}
          </el-button>
        </li>
        <el-dialog
          title="Excels 備份還原"
          :visible.sync="drawer"
          center>
          <el-divider>
            <h2 style="text-align: center;">
              <i class="el-icon-time"></i> + <i class="el-icon-document"></i>變動
            </h2>
          </el-divider>
          <div v-infinite-scroll="infiniteListLoad" style="overflow:auto;">
            <div class="infinite-list" v-for="i in infiniteList">
              <el-tooltip class="item" effect="light" :content="i['changed_files']" placement="right">
                <el-button
                  class="infinite-list-item"
                  type="danger"
                  plain
                  icon="el-icon-time"
                  @click="restoreBackupFile(i['filename'])">
                  {{ i['datetime'] }}</i>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </el-dialog>
        <li style="width:60%;display:flex;justify-content:space-between;margin:10px">
          <div>
            C. Excel檔案備份還原：
          </div>
          <div>
            <el-button type="primary" size="medium" round @click="backupRightNow" style="margin-left:10px;" disabled>
              立即備份
            </el-button>
            <el-button type="primary" size="medium" round @click="drawer=true" style="" disabled>
              檢視備份紀錄
            </el-button>
          </div>
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
  import backup from 'backup';
  import moment from 'moment';
  import crypto from 'crypto';

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
        backupRecords: [],
        infiniteList: [],
        infiniteNum: 0,
        drawer: false,
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
        uncompressedImages: {},
        uncompressedImageAmount: 0,
        progressBar: 0,
        avgImageStatus: '',
        progressException: true,
        dialogVisible: false,
        dialogFunc: () => {},
        backupRelatedWork: false,
      };
    },
    components: { kanban },
    methods: {
      backupRightNow() {
        // 檢查是否更新然後備份
        this.backupRelatedWork = true;
        fs.readdir('public/excels', (err, files) => {
          const lastest_date = files.reduce((pastV, newF) => {
            let newV = fs.statSync('public/excels/' + newF).mtime;
            if (newV > pastV) {
              return newV;
            } else {
              return pastV;
            }
          }, 0);
          if (fs.existsSync('public/backups') === false) {
            fs.mkdirSync('public/backups');
          }
          if (fs.existsSync('public/backups/lock') === false) {
            fs.writeFileSync('public/backups/lock', '');
            try {
              this.examine_history(moment(lastest_date).format('YYYYMMDD_HHmmss'));
            } catch (e) {
              console.error(e);
            } finally {
              fs.unlinkSync('public/backups/lock');
            }
          }
        });
      },
      getBackupRecords() {
        const txt = fs.readFileSync('public/backups/excels_history.json');
        const history = JSON.parse(txt)
        let change_history = [];
        const files = ['basic_info', 'course_record', 'graduate_credits_taken', 'graduate_standard', 'papers', 'student_council', 'yvonne_questionnaire'];
        Object.keys(history).sort().reduce((later, eariler) => {
          if (later !== 'initial') {
            const res = files.reduce((arr, ff) => {
              if (history[eariler][ff] !== history[later][ff]) {
                arr.push(ff);
              }
              return arr;
            }, []);
            change_history.push({'datetime': eariler, 'changed_files': res})
          } else {
            change_history.push({'datetime': eariler, 'changed_files': files})
          }
          return eariler;
        }, 'initial');
        change_history = change_history.reverse().map(obj => {
          let date = obj['datetime'].split('_')[0];
          let time = obj['datetime'].split('_')[1];
          date = date.slice(0,4) + '年' + date.slice(4,6) + '月' + date.slice(6,8) + '日';
          time = time.slice(0,2) + '時' + time.slice(2,4) + '分' + time.slice(4,6) + '秒';
          const datetime = date + '    ' + time;
          let changed_files = obj['changed_files'].reduce((acc, v) => {
            let vv = '';
            switch(v) {
              case 'basic_info':
                vv = '註冊組-學生資料';
                break;
              case 'course_record':
                vv = '課程紀錄';
                break;
              case 'graduate_credits_taken':
                vv = '學分採計';
                break;
              case 'graduate_standard':
                vv = '畢業標準'
                break;
              case 'papers':
                vv = '學生論文'
                break;
              case 'student_council':
                vv = '學生會'
                break;
              case 'yvonne_questionnaire':
                vv = '線上表單-學生';
                break;
            }
            return acc === '' ? vv : acc + ' / ' + vv;
          }, '');
          if (changed_files === '') {
            changed_files = '無更動';
          }
          changed_files = 'Difference: ' + changed_files;
          return { 'datetime': datetime, 'changed_files': changed_files, 'filename': obj['datetime']};
        });
        this.backupRecords = change_history;
        this.$forceUpdate();
      },
      examine_history(lastest_date) {
        const that = this;
        let history = {}
        if (fs.existsSync('public/backups/excels_history.json') === true) {
          const txt = fs.readFileSync('public/backups/excels_history.json')
          history = JSON.parse(txt);
        }
        if (Object.keys(history).indexOf(lastest_date) === -1) {
          const md5_list = {
            'basic_info': this.md5File('public/excels/basic_info.xlsx'),
            'course_record': this.md5File('public/excels/course_record.xlsx'),
            'graduate_credits_taken': this.md5File('public/excels/graduate_credits_taken.xlsx'),
            'graduate_standard': this.md5File('public/excels/graduate_standard.xlsx'),
            'papers': this.md5File('public/excels/papers.xlsx'),
            'student_council': this.md5File('public/excels/student_council.xlsx'),
            'yvonne_questionnaire': this.md5File('public/excels/yvonne_questionnaire.xlsx'),
          };
          history[lastest_date] = md5_list
          const jsonContent = JSON.stringify(history);
          fs.writeFileSync('public/backups/excels_history.json', jsonContent, { 'encoding': 'utf8' });

          const backup_path = 'public/backups/';
          const size_limit = 100;
          if (Object.keys(history).length > size_limit) {
            const over_size = Object.keys(history).length - size_limit;
            Object.keys(history).sort().splice(0, over_size).forEach(datetime => {
              delete history[datetime];
              fs.unlink(backup_path + datetime + '.backup', (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
              })

            });
            const jsonContent = JSON.stringify(history);
            fs.writeFileSync('public/backups/excels_history.json', jsonContent, { 'encoding': 'utf8' });
          }
          that.getBackupRecords();
          that.backupRelatedWork = false;
          that.$notify.success({
            title: '已成功備份資料檔案'
          });
          backup.backup('public/excels', 'public/backups/' + lastest_date + '.backup');
        } else {
          that.backupRelatedWork = false;
          that.getBackupRecords();
          that.$notify.warning({
            title: '備份檔案已存在'
          });
        }
      },
      md5File(path) {
        const txt = fs.readFileSync(path, 'utf8');
        var md5Value = crypto.createHash('md5').update(txt, 'utf8').digest('hex');
        return md5Value;
      },
      restoreBackupFile(filename) {
        this.$confirm('此操作將會移除現存所有Excel檔案，是否繼續?', '嚴重警告', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          const original_cwd = process.cwd();
          process.chdir('public/excels');
          backup.restore('../backups/' + filename + '.backup', process.cwd(), (err, path) => {
            process.chdir(original_cwd)
            // backup restored files
            fs.readdir('public/excels', (err, files) => {
              const lastest_date = files.reduce((pastV, newF) => {
                let newV = fs.statSync('public/excels/' + newF).mtime;
                if (newV > pastV) {
                  return newV;
                } else {
                  return pastV;
                }
              }, 0);
              if (fs.existsSync('public/backups/lock') === false) {
                fs.writeFileSync('public/backups/lock', '');
                try {
                  this.examine_history(moment(lastest_date).format('YYYYMMDD_HHmmss'));
                } catch (e) {
                  console.error(e);
                } finally {
                  fs.unlinkSync('public/backups/lock');
                }
              }
            });
            this.$notify.success({
              title: '成功還原'
            });
            // update backup&restore interface
            this.infiniteList = [];
          });
        }).catch(() => {
          this.$notify.info({
            title: '已取消還原'
          });
        });
        

      },
      infiniteListLoad() {
        this.infiniteNum += 20;
        this.infiniteList = this.backupRecords.slice(0, this.infiniteNum);
      },
      downloadUpdateDone(statusCode, filename) {
        // Open installation setup
        shell.openItem(filename);
        this.progressBar = 0;
        this.avgImageStatus = '';
      },
      syncDownloadUpdate(downloaded_size, expected_size) {
        this.avgImageStatus = '處理中...';
        this.progressBar = (downloaded_size/expected_size*100).toFixed(1);
      },
      executeDialogFunc() {
        try
        {
          this.dialogVisible = false;
          this.dialogFunc();
        } catch(e)
        {
          fs.appendFile('gmba.log', `[ERROR] ${e}: ${e.stack}`, function (err) {
            console.log('saved!');
          });
        }
      },
      openDialogFunc(func) {
        try
        {
          this.dialogVisible = true;
          this.dialogFunc = func;
        } catch(e)
        {
          fs.writeFile('gmba.log', `[ERROR] ${e}: ${e.stack}`, function (err) {
            console.log('saved!');
          });
        }
      },
      updateUncompressedImages() {
        this.avgImageStatus = '待壓縮';

        glob(`${this.profilePicFolder}/**/*.+(png|gif|svg|jpg|JPG)`, (er, raw_files) => {
          for (let rf of raw_files) {
            if (rf.match(/.*R\d{8}.*/))
            {
              this.uncompressedImages[path.basename(rf)] = rf;
            }
          }
          glob(`${this.profilePicFolder}/**/compressed/*.+(png|gif|svg|jpg|JPG)`, (er, compressed_files) => {
            for (let cf of compressed_files) {
              delete this.uncompressedImages[path.basename(cf)];
            }
            console.log(this.uncompressedImages);

            this.uncompressedImageAmount = Object.keys(this.uncompressedImages).length;

            this.avgImageStatus = this.uncompressedImageAmount > 0 ? '待壓縮' : '';
          });
        });
      },
      compressImages() {
        try {
          this.avgImageStatus = '處理中...';
          let progressIndex = 0;
          const that = this;
          that.progressBar = 0;

          let errorMessage = "";
          const oldConsoleLog = console.log;
          console.log = function (message) {
              errorMessage += message + "\n";
              oldConsoleLog.apply(console, arguments);
          };

          Object.values(this.uncompressedImages).forEach((f) => {
            compress_images(f, path.join(path.dirname(f), '/compressed/'),
              { compress_force: true, statistic: false, autoupdate: false },
              false,
              { jpg: { engine: 'mozjpeg', command: ['-quality', '25'] } },
              { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
              { svg: { engine: 'svgo', command: '--multipass' } },
              { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } },
              (error, completed, statistic) => {
                if (error !== null) {
                  
                  that.$notify({
                    title: '壓縮失敗',
                    duration: 0,
                    message: errorMessage,
                    type: 'error',
                  });

                  that.updateUncompressedImages();
                  that.avgImageStatus = '待壓縮';

                  console.log = oldConsoleLog;

                  return;
                }

                progressIndex += 1;

                if (progressIndex === this.uncompressedImageAmount) {
                  that.avgImageStatus = '';
                  that.updateUncompressedImages();
                  that.$notify({
                    title: '成功',
                    duration: 0,
                    message: '壓縮成功！',
                    type: 'success',
                  });
                } else if (progressIndex % 5 == 0 ) {
                  that.progressBar = ((progressIndex / this.uncompressedImageAmount) * 100).toFixed(1);
                  that.$forceUpdate();
                }
              }
            )
          });
        } catch (e)
        {
          fs.appendFile('gmba.log', `[ERROR] ${e}: ${e.stack}`, function (err) {
            console.log('saved!');
          });
        }
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
      this.updateUncompressedImages();
      this.getBackupRecords();
    },
    mounted() {
      if (!fs.existsSync(path.join(this.public_file_path, 'profile_pics'))) {
        fs.mkdirSync(path.join(this.public_file_path, 'profile_pics'));
        fs.writeFileSync(path.join(this.public_file_path, 'profile_pics', '請使用大寫學號命名'), '', 'utf8');
        fs.mkdirSync(path.join(this.public_file_path, 'profile_pics', 'R00000000'));
        fs.writeFileSync(path.join(this.public_file_path, 'profile_pics', 'R00000000', 'sample.jpg'), '', 'utf8');
      }
      if (!fs.existsSync(path.join(this.public_file_path, 'papers'))) {
        fs.mkdirSync(path.join(this.public_file_path, 'papers'));
        fs.writeFileSync(path.join(this.public_file_path, 'papers', '請使用大寫學號命名'), '', 'utf8');
        fs.writeFileSync(path.join(this.public_file_path, 'papers', '僅支援PDF及WORD'), '', 'utf8');

        fs.mkdirSync(path.join(this.public_file_path, 'papers', 'R00000000'));
        fs.writeFileSync(path.join(this.public_file_path, 'papers', 'R00000000', 'sample.docx'), '', 'utf8');
        fs.mkdirSync(path.join(this.public_file_path, 'papers', 'R11111111'));
        fs.writeFileSync(path.join(this.public_file_path, 'papers', 'R11111111', 'sample.pdf'), '', 'utf8');
        console.log('2222');
      }
      if (!fs.existsSync(path.join(this.public_file_path, 'apply_docs'))) {
        fs.mkdirSync(path.join(this.public_file_path, 'apply_docs'));
        fs.writeFileSync(path.join(this.public_file_path, 'apply_docs', '請使用大寫學號命名'), '', 'utf8');
        fs.writeFileSync(path.join(this.public_file_path, 'apply_docs', '僅支援PDF及WORD'), '', 'utf8');
        fs.mkdirSync(path.join(this.public_file_path, 'apply_docs', 'R00000000'));
        fs.writeFileSync(path.join(this.public_file_path, 'apply_docs', 'R00000000', 'sample.docx'), '', 'utf8');
        fs.mkdirSync(path.join(this.public_file_path, 'apply_docs', 'R11111111'));
        fs.writeFileSync(path.join(this.public_file_path, 'apply_docs', 'R11111111', 'sample.pdf'), '', 'utf8');
        console.log('2222');
      }
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
  
  .infinite-list {
    display: flex;
    width: 100%;
    justify-content: center;
  }
  .infinite-list-item {
    /*width: auto;*/
    font-size: 18px;
    margin-bottom: 2px;
  }

</style>
