<template>
  <div>
  <img id="logo" src="static/assets/gmba_logo.png" alt="gmba-red-logo">
  <i v-show="$store.state.excelData.isSyncingData" class="el-icon-loading loadinggif"></i>
  <span v-show="$store.state.excelData.isSyncingData">更新背景資料中...</span>
  <div class="bar">
    <el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" :router="true">
      <el-menu-item :route="{ name: 'landing-page' }" index="1">
          <el-tooltip content="系統設定功能的地方、顯示系統資訊" placement="top-end">
            <span>
              <i class="el-icon-menu"></i>
              首頁
            </span>
          </el-tooltip>
        </el-menu-item>
      <el-menu-item :route="{ name: 'single-search-page' }" index="2">
        <el-tooltip content="搜尋學生及課程資訊" placement="top-end">
          <span>
            <i class="el-icon-search"></i>
            快速搜尋
          </span>
        </el-tooltip>
      </el-menu-item>
      <el-menu-item :route="{ name: 'consolidate-page' }" index="3">
        <el-tooltip content="瀏覽全部的EXCEL資料" placement="top-end">
          <span>
            <i class="el-icon-document"></i>
            檢視歷年資料
          </span>
        </el-tooltip>
      </el-menu-item>
      <el-submenu index="4">
          <template slot="title">
            <el-tooltip content="圖表瀏覽、報表製作" placement="top-end">
              <span>功能區</span>
            </el-tooltip>
          </template>
        <el-menu-item
          index="4-1"
          :route="{ name: 'statistic-art', params: { activeIndex: '4-1' } }">
          圖表統計
        </el-menu-item>
        <el-menu-item
          index="4-2"
          :route="{ name: 'consolidate-class-student', params: { activeIndex: '4-2' } }">
          學生背景統整
        </el-menu-item>
        <el-menu-item
          index="4-3"
          :route="{ name: 'student-import-export', params: { activeIndex: '4-3' } }">
          學生去向統計
        </el-menu-item>
      </el-submenu>
      <el-tooltip content="EXCEL資料及照片資料夾的連結" placement="top-end">
        <el-cascader
          expand-trigger="hover"
          class="item"
          :options="options"
          v-model="selectedOptions"
          placeholder="點擊此處查看目標"
          @change="handleChange">
        </el-cascader>
      </el-tooltip>
    </el-menu>
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
  import path from 'path';
  import { mapState } from 'vuex';

  export default {
    name: 'kanban',
    data() {
      return {
        selectedOptions: null,
      };
    },
    props: ['activeIndex'],
    methods: {
      handleChange() {
        // console.log(this.selectedOptions)
        shell.openItem(this.selectedOptions[this.selectedOptions.length - 1])
      },
    },
    computed: mapState({
      shareDataExisted: state => state.excelData.shareDataExisted,
      public_file_path: state => state.excelData.public_file_path,
      profile: state => state.excelData.profile,
      course: state => state.excelData.course,
      papers: state => state.excelData.papers,
      council: state => state.excelData.council,
      questionnaire: state => state.excelData.questionnaire,
      graduateStandard: state => state.excelData.graduateStandard,
      profilePaperFolder: state => state.excelData.profilePaperFolder,
      profilePicFolder: state => state.excelData.profilePicFolder,
      enrollYears: state => state.excelData.enrollYears,
      graduate_credits: state => state.excelData.graduate_credits,
      options() {
        return [{
          value: path.join(this.profilePicFolder, '/../excels'),
          label: 'Excels表格(A-G)',
          children: [{
            value: this.profile['excel_path'],
            label: 'A. 研教組年度資料',
          }, {
            value: this.course['excel_path'],
            label: 'B. 歷年學生修課紀錄',
          }, {
            value: this.papers['excel_path'],
            label: 'C. 畢業生論文',
          }, {
            value: this.council['excel_path'],
            label: 'D. 學生會成員',
          }, {
            value: this.questionnaire['excel_path'],
            label: 'E. GMBA線上問卷',
          }, {
            value: this.graduateStandard['excel_path'],
            label: 'F. 畢業標準',
          }, {
            value: this.graduate_credits['excel_path'],
            label: 'G. 歷年學生採計學分數',
            }]
        }, {
          value: this.profilePicFolder,
          label: '學生個人檔案',
          children: [{
            value: this.profilePicFolder,
            label: 'A. 個人照片資料夾',
          }, {
            value: this.profilePaperFolder,
            label: 'B. 個人論文資料夾',
          },]
        }];
      },
    }),
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
    opacity: .95;
  }

  #logo {
    margin: 0px;
    width: 420px;
    height: auto;
  }

  .loadinggif {
    font-size: 80px;
    color: #8492a6;
    margin: 0;
    margin-left: 40px;
    font-size: 2em;
    vertical-align: middle;
  }

</style>
