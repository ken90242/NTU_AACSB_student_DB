<template>
  <div>
  <img id="logo" src="static/assets/aacsb_logo.png" alt="gmba-red-logo">
  <div class="bar">
    <el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" :router="true">
      <el-menu-item :route="{ name: 'landing-page' }" index="1">
        <i class="el-icon-menu"></i>
        首頁
      </el-menu-item>
      <el-menu-item :route="{ name: 'single-search-page' }" index="2">
        <i class="el-icon-search"></i>
        快速搜尋
      </el-menu-item>
      <el-menu-item :route="{ name: 'consolidate-page' }" index="3">
        <i class="el-icon-document"></i>
        檢視歷年資料
      </el-menu-item>
      <el-submenu index="4">
        <template slot="title">圖表呈現</template>
        <el-menu-item
          index="4-1"
          :route="{ name: 'statistic-art', params: { activeIndex: '4-1' } }">
          學生基本資料統計
        </el-menu-item>
      </el-submenu>
    </el-menu>
    <el-cascader
      expand-trigger="hover"
      class="item"
      :options="options"
      v-model="selectedOptions"
      placeholder="請選擇編輯目標"
      @change="handleChange">
    </el-cascader>
    <el-badge :value="12" class="item" v-if="false">
      <el-dropdown size="medium" placement="bottom-start">
        <el-button type="primary">
          通知
          <i class="el-icon-bell el-icon--right"></i>
        </el-button>
        <el-dropdown-menu class="dropdown_menu" slot="dropdown">
          <el-dropdown-item class="dropdown_item">
            <i class="el-icon-warning"></i>&nbsp;
            已至新學期，仍未更新學生資料
          </el-dropdown-item>
          <el-dropdown-item class="dropdown_item">
            <i class="el-icon-warning"></i>&nbsp;
            資料格式錯誤 - 重複資料
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-badge>
  </div>
</div>
</template>

<script>
  import { shell } from 'electron';
  import eventBus from './eventBus';
  import path from 'path';

  export default {
    name: 'kanban',
    data() {
      return {
        // test: path.join(remote.app.getAppPath(), '../../../../'),
        gmba_logo: 'static/assets/aacsb_logo.png',
        bus: eventBus,
        selectedOptions: null,
        options: [{
          value: path.join(eventBus.profilePicFolder, '/../excels'),
          label: 'Excels資料夾',
          children: [{
            value: eventBus.profile['excel_path'],
            label: '歷年學生資料',
          }, {
            value: eventBus.course['excel_path'],
            label: '歷年學生修課紀錄',
          }, {
            value: eventBus.graduateStandard['excel_path'],
            label: '畢業標準',
          }, {
            value: eventBus.papers['excel_path'],
            label: '畢業生論文',
          }, {
            value: eventBus.council['excel_path'],
            label: '歷年學生會',
          }, {
            value: eventBus.questionnaire['excel_path'],
            label: 'GMBA問卷',
          },]
        }, {
          value: eventBus.profilePicFolder,
          label: '個人照片資料夾',
        }],
      };
    },
    props: ['activeIndex'],
    methods: {
      handleChange() {
        // console.log(this.selectedOptions)
        shell.openItem(this.selectedOptions[this.selectedOptions.length - 1])
      },
    }
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .bar {
    display: flex;
    justify-content:center;
    align-items: top;
    margin-bottom: 15px;
  }

  .el-icon-bell {
    /*font-size: 25px;*/
  }

  .el-icon-bell:hover {
    cursor: pointer;
  }

  .item {
    margin-top: 10px;
    margin-right: 10px;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  .dropdown_menu {
    /*background-color: gray;*/
    opacity: .95;
  }

  #logo {
    margin: 0px;
    width: 420px;
    height: auto;
  }

</style>
