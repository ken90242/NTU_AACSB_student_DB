<template>
  <div id="wrapper">
    <kanban activeIndex="2"></kanban>
    <main>
      <div class="left-side">
        <div class="searchCondWrapper">
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="查詢對象">
              <el-select
                class="searchCond"
                v-model="searchCondition"
                placeholder="請選擇篩選條件"
                @change="(x) => { searchCondition==='cid' ? rawSearchInput = '資訊管理' : rawSearchInput = 'R98723075' }">
                <el-option
                  v-for="item in searchConditionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="查詢關鍵字">
              <el-input
                v-if="searchCondition === 'sid'"
                class="searchCond"
                v-model="rawSearchInput"
                :placeholder="searchCondition === 'sid' ? '學號, 中英文姓名' : '課號, 識別碼, 課程名稱'">
              </el-input>
              <el-autocomplete
                v-else
                class="inline-input"
                v-model="rawSearchInput"
                :fetch-suggestions="courseQuerySearch"
                placeholder="課號, 識別碼, 課程名稱">
              </el-autocomplete>
            </el-form-item>
          </el-form>
        </div>
        <div>
        <el-table
          :data="poi"
          v-show="poi.length > 1"
          highlight-current-row
          style="width: 100%">
          <el-table-column
            prop="學號"
            label="學號">
          </el-table-column>
          <el-table-column
            prop="中文姓名"
            label="中文姓名">
          </el-table-column>
          <el-table-column
            prop="英文姓名"
            label="英文姓名">
          </el-table-column>
          <el-table-column
            prop="國籍"
            label="國籍">
          </el-table-column>
          <el-table-column
            prop="email"
            label="Email">
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-search"
                round
                @click="selectPOIbyID(scope.row['學號'])">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-table
          :data="searchedTableData['student']"
          v-if="searchCondition === 'sid' && poi.length <= 1"
          :default-expand-all="true"
          style="width: 100%;">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-steps
                style="padding-bottom: 20px;"
                finish-status="success"
                :process-status="'B,O'.indexOf(searchedTableData['student'][0]['異動碼']) == -1 ? 'success' : 'error'"
                align-center>
                <el-step
                  v-for="step in schoolSteps"
                  :title="step.state"
                  :status="step.status"
                  :description="`${ step.date } ${ step.desc }`">
                </el-step>
              </el-steps>
              <div style="display:flex; justify-content: space-around">
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>個人資訊</span>
                    <el-tooltip class="item" effect="dark" placement="right">
                      <div slot="content">
                        (G): 資訊來源為GMBA線上問卷<br/>(U): 資訊來源為註冊組資訊
                      </div>
                      <span style="margin-left:30px;font-size:12px;font-style:italic;text-decoration:underline">欄位註記說明</span>
                    </el-tooltip>
                    <!-- <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button> -->
                  </div>
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="國籍(U)">
                      <span>{{ props.row['國籍'] }}</span>
                    </el-form-item>
                    <el-form-item label="出生年月日(U)">
                      <span>{{ props.row['出生年月日'] }}</span>
                    </el-form-item>
                    <el-form-item label="年齡(U)">
                      <span>{{ props.row['年齡'] }}</span>
                    </el-form-item>
                    <el-form-item label="入學前學籍資訊(U)">
                      <div>
                        {{ props.row['入學前畢業年月'] }} / {{ props.row['入學前畢業學校'] }} - 
                        {{ props.row['入學前畢業系所'] }}
                      </div>
                    </el-form-item>
                    <el-form-item v-if="personalQuestionnaire" label="入學前學籍資訊(G)">
                      <ul v-if="personalQuestionnaire.Bachelor.toLowerCase() == 'yes'" style="list-style-type: none;">
                        <li v-if="personalQuestionnaire.Bachelor.toLowerCase() == 'yes'">
                          <span style="color:blue"><大學></span> {{ personalQuestionnaire.bachelor_School_name }}({{ personalQuestionnaire.bachelor_School.indexOf('Non') !== -1 ? '外國' : '本國' }}) - {{ personalQuestionnaire.bachelor_Fields }}
                        </li>
                        <li v-if="personalQuestionnaire.Master.toLowerCase() == 'yes'">
                          <span style="color:blue"><碩士></span>: {{ personalQuestionnaire.master_School_name }}({{ personalQuestionnaire.master_School.indexOf('Non') !== -1 ? '外國' : '本國' }}) - {{ personalQuestionnaire.master_Fields }}
                        </li>
                        <li v-if="personalQuestionnaire.PhD.toLowerCase() == 'yes'">
                          <span style="color:blue"><博士></span>: {{ personalQuestionnaire.phd_School_name }}({{ personalQuestionnaire.phd_School.indexOf('Non') !== -1 ? '外國' : '本國' }}) - {{ personalQuestionnaire.phd_Fields }}
                        </li>
                      </ul>
                      <div v-else style="color:red"> GMBA問卷無記載學籍資訊 </div>
                    </el-form-item>
                    <el-form-item v-else label="入學前學籍資訊(G)">
                      <div style="color:red"> GMBA問卷無記載學籍資訊 </div>
                    </el-form-item>
                    <el-form-item label="家裡電話(U)">
                      <span>{{ props.row['家裡電話'] }} / {{ props.row['電話3'] }}</span>
                    </el-form-item>
                    <el-form-item v-if="personalQuestionnaire" label="經常使用家裡電話(G)">
                      <span>{{ personalQuestionnaire.freq_telephone }}</span>
                    </el-form-item>
                    <el-form-item label="手機(U)">
                      <span>{{ props.row['手機'] }}</span>
                    </el-form-item>
                    <el-form-item v-if="personalQuestionnaire" label="經常使用手機(G)">
                      <span>{{ personalQuestionnaire.freq_mobile }}</span>
                    </el-form-item>
                    <el-form-item label="email(U)">
                      <span>{{ props.row['email'] }}</span>
                    </el-form-item>
                    <el-form-item v-if="personalQuestionnaire" label="經常使用email(G)">
                      <span>{{ personalQuestionnaire.freq_email }}</span>
                    </el-form-item>
                    <el-form-item v-if="personalQuestionnaire" label="備註(G)">
                      <span>{{ personalQuestionnaire['note1'] === '-' ? '' : personalQuestionnaire['note1'] }}</span>
                      <span>{{ personalQuestionnaire['note2'] === '-' ? '' : personalQuestionnaire['note2'] }}</span>
                      <span>{{ personalQuestionnaire['note3'] === '-' ? '' : personalQuestionnaire['note3'] }}</span>
                      <span>{{ personalQuestionnaire['note4'] === '-' ? '' : personalQuestionnaire['note4'] }}</span>
                      <span>{{ personalQuestionnaire['note5'] === '-' ? '' : personalQuestionnaire['note5'] }}</span>
                      
                    </el-form-item>
                    <el-form-item v-if="personalCouncil !== null" label="學生會資訊">
                      <span>
                        {{ personalCouncil['學年'] }}
                      </span>
                      ,
                      <span>
                        {{ personalCouncil['title'] }}
                      </span>
                      ,
                      <span>
                        {{ personalCouncil['note1'] }}
                      </span>
                      ,
                      <span>
                        {{ personalCouncil['note2'] }}
                      </span>
                      ,
                      <span>
                        {{ personalCouncil['note3'] }}
                      </span>
                    </el-form-item>
                    <el-form-item v-else label="學生會資訊">
                      無
                    </el-form-item>
                  </el-form>
                </el-card>
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>畢業資訊</span>
                  </div>
                  <span v-if="needCheckGradStandard" style="color:red">
                    不符預設畢業標準，需人工確認
                  </span>
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item v-if="!needCheckGradStandard" label="畢業規範學年度">
                      <span v-if="personalGradStandard['score']">
                        {{ personalGradStandard['score']['學年'] }}
                      </span>
                      <span v-else style="color:red">
                        畢業規範檔未記載{{searchedTableData.student[0].enrollYear}}年度
                      </span>
                    </el-form-item>
                    <el-form-item v-if="!needCheckGradStandard" label="系定必修學分">
                      <span v-if="personalGradStandard['score']">
                        {{ personalGradStandard['score']['系定必修'] }}
                      </span>
                      <span v-else style="color:red">
                        畢業規範檔未記載{{searchedTableData.student[0].enrollYear}}年度
                      </span>
                    </el-form-item>
                    <el-form-item v-if="!needCheckGradStandard" label="應修選修學分">
                      <span v-if="personalGradStandard['score']">
                        {{ personalGradStandard['score']['選修'] }}
                      </span>
                      <span v-else style="color:red">
                        畢業規範檔未記載{{searchedTableData.student[0].enrollYear}}年度
                      </span>
                    </el-form-item>
                    <el-form-item v-if="!needCheckGradStandard" label="應修最低畢業學分">
                      <span v-if="personalGradStandard['score']">
                        {{ personalGradStandard['score']['應修最低畢業學分'] }}
                      </span>
                      <span v-else style="color:red">
                        畢業規範檔未記載{{searchedTableData.student[0].enrollYear}}年度
                      </span>
                    </el-form-item>
                    <el-form-item label="已修[系定必修]學分數">
                      <span
                         v-if="personalGradStandard['score']"
                        :style="{
                          'color': personalGraduateScore['totalRequiredScore'] < personalGradStandard['score']['系定必修'] ? 'red' : 'black'
                        }">
                        {{ personalGraduateScore['totalRequiredScore'] }}
                      </span>
                      <span v-else style="color:red">
                        畢業規範檔未記載{{searchedTableData.student[0].enrollYear}}年度
                      </span>
                    </el-form-item>
                    <el-form-item label="已修[其他]學分數">
                      <span
                        v-if="personalGradStandard['score']"
                        :style="{
                          'color': personalGraduateScore['totalSelectableScore'] < personalGradStandard['score']['選修'] ? 'red' : 'black'
                        }">
                        {{ personalGraduateScore['totalSelectableScore'] }}
                      </span>
                      <span v-else style="color:red">
                        畢業規範檔未記載{{searchedTableData.student[0].enrollYear}}年度
                      </span>
                    </el-form-item>
                    <el-form-item label="已修[總學分數]">
                      <span
                        v-if="personalGradStandard['score']"
                        :style="{
                          'color': personalGraduateScore['totalSelectableScore'] + personalGraduateScore['totalRequiredScore'] < personalGradStandard['score']['應修最低畢業學分'] ? 'red' : 'black'
                        }">
                        {{ personalGraduateScore['totalSelectableScore'] + personalGraduateScore['totalRequiredScore'] }}
                      </span>
                      <span v-else style="color:red">
                        畢業規範檔未記載{{searchedTableData.student[0].enrollYear}}年度
                      </span>
                    </el-form-item>
                  </el-form>
                </el-card>
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>論文資訊</span>
                  </div>
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item v-if="personalPapers !== null" label="論文資訊">
                      <span>
                        {{ personalPapers['中文標題'] }}
                      </span>
                      ,
                      <span>
                        {{ personalPapers['英文標題'] }}
                      </span>
                      ,
                      <span>
                        {{ personalPapers['年份'] }}
                      </span>
                      ,
                      <span>
                        指導教授：{{ personalPapers['指導教授'] }}
                      </span>
                    </el-form-item>
                    <el-form-item v-else label="論文資訊">
                      無
                    </el-form-item>
                  </el-form>
                </el-card>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="學號"
            prop="學號">
          </el-table-column>
          <el-table-column
            label="中文姓名"
            prop="中文姓名">
          </el-table-column>
          <el-table-column
            label="英文姓名"
            prop="英文姓名">
          </el-table-column>
          <el-table-column
            label="畢業年月"
            prop="畢業年月">
          </el-table-column>
          <el-table-column header-align="center" label="個人照片" width="200px">
            <template slot-scope="scope">
              <el-carousel v-if="profile_pics.length > 0" indicator-position="none" height="150px" style="text-align:center">
                <el-carousel-item v-for="im in profile_base64">
                  <img class="profile_img" :src="'data:image/png;base64,' + im" />
                </el-carousel-item>
              </el-carousel>
              <span v-else>無</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
        <el-table
          :data="searchedTableData['course']"
          v-show="poi.length <= 1"
          highlight-current-row
          style="width: 100%">
          <el-table-column
            prop="學年學期"
            label="學年學期"
            sortable>
          </el-table-column>
          <el-table-column
            prop="課程名稱"
            label="課程名稱"
            sortable>
          </el-table-column>
          <el-table-column
            prop="學分"
            label="學分"
            sortable>
          </el-table-column>
          <el-table-column
            prop="課號"
            label="課號"
            sortable>
          </el-table-column>
          <!-- <el-table-column
            prop="課號"
            label="課號"
            sortable> -->
          </el-table-column>
          <el-table-column
            v-if="searchCondition === 'sid'"
            prop="等第成績"
            label="等第成績"
            :sort-method="compareGPACategory"
            sortable>
          </el-table-column>
          <el-table-column
            v-if="searchCondition === 'sid'"
            prop="等第績分"
            label="等第績分"
            sortable>
          </el-table-column>
          <el-table-column
            v-if="searchCondition === 'cid'"
            prop="meanScore"
            label="平均成績">
          </el-table-column>
          <el-table-column
            v-else-if="searchCondition === 'sid'"
            prop="中位數成績"
            label="中位數成績"
            sortable>
          </el-table-column>
          <el-table-column
            v-if="searchCondition === 'cid'"
            prop="elements.length"
            label="修課人數">
          </el-table-column>
          <el-table-column
            key="courseCategory"
            v-if="searchCondition === 'sid'"
            label="類別"
            :sort-method="compareCourseCategory"
            sortable>
            <template slot-scope="scope">
              <el-tag 
                v-if="isCourseDeptRequired(scope.row) === true"
                type="danger"
                size="medium">
                {{ '系定必修' }}
              </el-tag>
              <el-tag 
                v-else
                type="info"
                size="medium">
                {{ '其他' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="searchCondition === 'sid'"
            prop="備註"
            label="備註">
          </el-table-column>
        </el-table>
      </div>
    </main>
  </div>
</template>

<script>
  import fs from 'fs';
  import path from 'path';
  import { remote } from 'electron';
  import kanban from './kanban';

  export default {
    components: { kanban },
    mixins: [kanban],
    data() {
      return {
        searchConditionOptions: [{
          value: 'sid',
          label: '學生',
        },
        {
          value: 'cid',
          label: '學生曾修課程',
        },
        ],
        searchCondition: 'sid',
        rawSearchInput: 'R05749011', //R07749019 //R00749021 //R98723075
        currentPage: 1,
        pageSize: 10,
        poi: [], // person of interest，可能符合搜尋條件的學生,
        profile_base64: [],
      };
    },
    methods: {
      compareCourseCategory(a, b) {
        const aIsReq = this.isCourseDeptRequired(a) === true ? 1 : 0;
        const bIsReq = this.isCourseDeptRequired(b) === true ? 1 : 0;
        
        return aIsReq - bIsReq;
      },
      compareGPACategory(a, b) {
        const scoreSymbol = {
          'A': 4,
          'B': 3,
          'C': 2,
          'F': 0,
          '+': 0.2,
          '-': -0.2,
        };
        const symbols = Object.keys(scoreSymbol);
        const aScore = a['等第成績'].match(/./g).reduce((acc, v) => {
          return (symbols.indexOf(v) !== -1) ? acc + scoreSymbol[v] : acc
        }, 0);
        const bScore = b['等第成績'].match(/./g).reduce((acc, v) => {
          return (symbols.indexOf(v) !== -1) ? acc + scoreSymbol[v] : acc
        }, 0);
        
        return aScore - bScore;
      },
      courseQuerySearch(queryString, cb) {
        function createFilter(queryString) {
          return (item) => {
            return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
          };
        }

        let courses = this.course.data.map(obj => obj['課程名稱'])
        courses = [...new Set(courses)]
          .map((nm) => {
            return {
              'value': nm,
            };
          });
        const results = queryString ? 
          courses.filter(createFilter(queryString)) : courses;

        cb(results); // 调用 callback 返回建议列表的数据
      },
      base64_encode(file_path) {
        // read binary data
        const bitmap = fs.readFileSync(file_path);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
      },
      clearSearchPOIs() {
        this.poi = [];
      },
      selectPOIbyID(sid) {
        this.rawSearchInput = sid;
        // this.clearSearchPOIs();
      },
      isCourseDeptRequired(row) {
        let flag = false;
        const requireCourseClassId1 = this.personalGradStandard.specific.map(row => row['課號']);
        const requireCourseClassId2 = this.personalGradStandard.specific.map(row => row['課程識別碼']);
        const requireCourseClassName = this.personalGradStandard.specific.map(row => row['課程中文名稱']);

        if (requireCourseClassId1.indexOf(row['課號']) !== -1) {
          flag = true;
        } else if (requireCourseClassId2.indexOf(row['課程識別碼']) !== -1) {
          flag = true;
        } else if (requireCourseClassName.indexOf(row['課程名稱']) !== -1) {
          flag = true;
        }

        /**
         *
           只要課號 / 課程識別碼 / 課程名稱一致，即判定為系定必修。
           { true: '系定必修', false: '選修' }
         *
        * */
        return flag;
      },
      searchBaseOnKeywordACondition(searchInput, searchCondition) {
        const { profile, course } = this;
        // let tmp = new Date().getTime()

        const res = {
          student: null,
          course: [],
        };
  
        this.clearSearchPOIs();
        
        
        // console.log('a', new Date().getTime() - tmp)
        // tmp = new Date().getTime()

        switch (searchCondition) {
          // 查詢學生
          case 'sid':
            this.poi = this.profile.data.filter((v) => {
              return v['中文姓名'].trim().indexOf(searchInput) !== -1 ||
                v['英文姓名'].trim().toUpperCase().indexOf(searchInput) !== -1 ||
                v['學號'].trim().toUpperCase().indexOf(searchInput) !== -1;
            }).slice(0, 50)
            
            // console.log('b', new Date().getTime() - tmp)
            // tmp = new Date().getTime()
  
            if (this.poi.length === 1) {
              res.course = this.course.data.filter((v => v['學號'] === this.poi[0]['學號']))
              res.student = this.poi;
              
              // console.log('c', new Date().getTime() - tmp)
              // tmp = new Date().getTime()
              break;
            }

  
          // 查詢課程
          case 'cid': {
            const keysMap = [];

            const insertNewClassIntoKeyMaps = function insertNewClassIntoKeyMaps(targetObj) {
              const obj = {};

              obj['課號'] = targetObj['課號'];
              obj['課程識別碼'] = targetObj['課程識別碼'];
              obj['課程名稱'] = targetObj['課程名稱'];
              obj['學年學期'] = targetObj['學年學期'];
              obj['學分'] = targetObj['學分'];
              obj.elements = [targetObj];

              keysMap.push(obj);
            };

            const hasSameClassInKeyMaps = function hasSameClassInKeyMaps(targetObj) {
              let flag = false;
              let idx = -1;
              for (let j = 0; j < keysMap.length; j += 1) {
                if (keysMap[j]['學年學期'] === targetObj['學年學期'] &&
                    keysMap[j]['課號'] === targetObj['課號'] &&
                    keysMap[j]['課程識別碼'] === targetObj['課程識別碼'] &&
                    keysMap[j]['課程名稱'] === targetObj['課程名稱']) {
                  flag = true;
                  idx = j;
                  break;
                }
              }

              return { flag, idx };
            };

            this.course.data.forEach((targetObj) => {
              if (targetObj['課號'] === searchInput ||
                  targetObj['課程識別碼'] === searchInput ||
                  targetObj['課程名稱'] === searchInput) {
                if (keysMap.length === 0) {
                  insertNewClassIntoKeyMaps(targetObj);
                }

                const { flag, idx } = hasSameClassInKeyMaps(targetObj);

                if (flag === true) {
                  keysMap[idx].elements.push(targetObj);
                } else {
                  insertNewClassIntoKeyMaps(targetObj);
                }
              }
            })
            
            // console.log('d', new Date().getTime() - tmp)
            // tmp = new Date().getTime()

            keysMap.forEach((course) => {
              const scoresList = course.elements
                .map(element => element['中位數成績'])
                .filter(v => !isNaN(v));

              if (scoresList.length === 0) {
                course.meanScore = '無';
              } else {
                const rawSumScore = scoresList.reduce((a, b) => parseFloat(a) + parseFloat(b));
                course.meanScore = (rawSumScore / scoresList.length).toFixed(2);
              }
            });
            
            // console.log('e', new Date().getTime() - tmp)
            // tmp = new Date().getTime()

            res.course = keysMap;
            break;
          }
          default: {
            break;
          }
        }

        return res;
      },
    },
    computed: {
      profile_pics() {
        const sid = this.poi[0]['學號'];
        let file_dir = path.join(this.profilePicFolder, sid);
        if (fs.existsSync(path.join(this.profilePicFolder, sid, 'compressed'))) {
          file_dir = path.join(this.profilePicFolder, sid, 'compressed');
        }
        const that = this;
        let res = [];
        let default_img_path = '';
        this.profile_base64 = [];

        if (fs.existsSync(file_dir)) {
          const files = fs.readdirSync(file_dir)
            .filter(nm => {
              if (path.basename(nm, path.extname(nm)).toLowerCase() === sid.toLowerCase()) {
                default_img_path = nm;
                return false;

              } else if (['.png', '.gif', '.svg', '.jpg'].indexOf(path.extname(nm)) !== -1) {
                return true;
              }
            })
            .map(nm => path.join(this.profilePicFolder, sid, nm));

          if (default_img_path !== '') {
            default_img_path = path.join(this.profilePicFolder, sid, default_img_path);
            // push to the list head
            files.unshift(default_img_path);
          }
          if (files.length > 0) {
            res = files;
            res.forEach((im_path) => {
              fs.readFile(im_path, (err, bitmap) => {
                this.profile_base64.push(new Buffer(bitmap).toString('base64'))
              });
            });
          }
        }

        return res;
      },
      searchInput() {
        return this.rawSearchInput.trim().toUpperCase();
      },
      searchedTableData() {
        /*
          res = {
            'student': {} or null,
            'course': [],
          }
        */
        return this.searchBaseOnKeywordACondition(this.searchInput, this.searchCondition);
      },
      displayTable() {
        return this[this.displayType].data.slice(
          (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
        );
      },
      totalPages() {
        return this[this.displayType].data.length;
      },
      personalCouncil() {
        let res = this.council.data.filter(obj => obj['學號'] === this.poi[0]['學號']);
        if (res.length === 0) {
          res = null;
        } else {
          res = res[0];
        }
        return res;
      },
      personalQuestionnaire() {
        let res = this.questionnaire.data.filter(obj => obj['NTU_ID'] === this.poi[0]['學號']);
        if (res.length === 0) {
          res = null;
        } else {
          res = res[0];
        }
        return res;
      },
      personalPapers() {
        console.log(this.poi)
        let res = this.papers.data.filter(obj => obj['作者學號'] === this.poi[0]['學號']);
        if (res.length === 0) {
          res = null;
        } else {
          res = res[0];
        }
        return res;
      },
      personalGradStandard() {
        // assume rawSearchInput is student id
        const enrollYear = this.searchedTableData.student[0].enrollYear;
        const standard = {
          score: null,
          specific: [],
        };

        this.graduateStandard.score.data.forEach((row) => {
          if (row['學年'] === enrollYear) {
            standard.score = row;
          }
        });

        this.graduateStandard.specific.data.forEach((row) => {
          if (row['學年'] === enrollYear) {
            standard.specific.push(row);
          }
        });
        return standard;
      },
      personalGraduateScore() {
        let totalRequiredScore = 0;
        let totalSelectableScore = 0;
        this.searchedTableData.course.forEach((row) => {
          if (this.isCourseDeptRequired(row) === true) {
            totalRequiredScore += parseInt(row['學分'], 10);
          } else {
            totalSelectableScore += parseInt(row['學分'], 10);
          }
        });
        return { totalRequiredScore, totalSelectableScore };
      },
      needCheckGradStandard() {
        const enrollYear = this.searchedTableData.student[0].enrollYear;
        const firstLeaveSchoolYear = this.searchedTableData.student[0]['第一次休學'] === '-' ? 
                0 : parseInt(this.searchedTableData.student[0]['第一次休學'].substring(0, 3));

        return (enrollYear <= firstLeaveSchoolYear) ? true : false;
      },
      schoolSteps() { // 在學狀態
        const row = this.searchedTableData.student[0];
        const steps = [];
        const seq = ['一', '二', '三', '四', '五', '六', '七', '八'];

        steps.push({
          date: row.enrollYear,
          state: '入學',
          status: 'success',
          desc: '入學',
        });
  
        seq.forEach((w) => {
          const label1 = `第${w}次休學`;
          const label2 = `${label1}原因`;

          if (row[label1].trim() !== '-' && row[label1].trim() !== '') {
            steps.push({
              date: row[label1],
              state: '休學',
              status: 'error',
              desc: row[label2],
            });
          }
        });
  
        switch (row['異動碼']) {
          case 'G':
            steps.push({
              date: row['畢業年月'],
              state: '畢業',
              status: 'success',
              desc: '畢業',
            });
            break;
          case 'O':
            steps.push({
              date: row['異動學期'],
              state: '退學',
              status: 'error',
              desc: row['退學原因'],
            });
            break;
          case 'B':
            break;
          default:
            steps.push({
              date: new Date().getYear() - 11,
              state: '在學',
              status: 'success',
              desc: '在學中',
            });
        }

        return steps;
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
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  .left-side {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%;
  }

  .box-card {
    width: 33%;
  }

  .el-table__row .expanded:hover {
    background-color:red!important;
  }

  .el-table__expanded-cell {
    background-color:#f5f7fa!important;
  }

  .searchCondWrapper {
    padding-top: 2.5%;
    border: 3px solid rgba(0, 0, 0, .15);
    border-radius: 20px;
    display: flex;
    justify-content:center;
  }
  .profile_img {
    max-width: 200px;
    height: 100%;
  }
</style>
