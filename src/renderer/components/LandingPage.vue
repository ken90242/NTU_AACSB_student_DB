<template>
  <div id="wrapper">
    <kanban activeIndex="1"></kanban>
    <div class="githubWrapper">
      <img class="githublogo" :src="github_imgs.mark" alt="github">
      <img class="githublogo" :src="github_imgs.logo" alt="github">
      <a href="https://github.com/ken90242/NTU_AACSB_student_DB">原始碼(unaccesible now)</a>
    </div>
    <div>
      <a href="https://trello.com/b/fY9TENhi">點此查看項目進度</a>
    </div>
    <div>
      專案簡介
      <p>
        2018.12 ~ 2018.1 (蒐集、分析需求) / 2018.1 ~ 2018.3 (開發) / 2018.3 ~ 2018.6.1 (整理資料)<br/>
        主要以Javascript(ES7)開發，主要使用組件為:<br/>
        <ul>
          <li>electron.js — 桌面應用程序</li>
          <li>vue.js — 介面frameWork</li>
          <li>element-ui.js — UI元件庫</li>
          <li>chart.js — 圖表框架</li>
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

  export default {
    name: 'landing-page',
    data() {
      return {
        github_imgs: {
          mark: path.join(__dirname, '../assets/GitHub-Mark.png'),
          logo: path.join(__dirname, '../assets/Github_Logo.png'),
        },
        bus: eventBus,
      };
    },
    components: { kanban },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link);
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
