<template>
  <div id="wrapper">
    <kanban activeIndex="3"></kanban>
    <div>
      <div class="littlebar">
        <div class="switchWrapper" :style="{ 'border-color': displayType === 'profile' ? 'rgba(245, 108, 108, 1)' : '#409EFF' }">
          <span :style="{ 'color': displayType === 'profile' ? 'rgba(245, 108, 108, 1)' : 'rgba(0, 0, 0, .3)' }">學生資料</span>
          &nbsp;&nbsp;
          <el-switch
            v-model="displayType"
            active-value="course"
            active-color="#409EFF"
            inactive-value="profile"
            inactive-color="rgba(245, 108, 108, 1)">
          </el-switch>
          &nbsp;&nbsp;
          <span :style="{ 'color': displayType === 'course' ? '#409EFF' : 'rgba(0, 0, 0, .3)' }">修課紀錄</span>
        </div>
        <div class="paginateWrapper">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 50, 100, 300]"
            :page-size="pageSize"
            layout="sizes, total, prev, pager, next"
            :total="totalPages">
          </el-pagination>
        </div>
      </div>
      <div v-show="displayType === 'profile'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%">
          <el-table-column
            fixed
            prop="學號"
            label="學號"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in bus.profile['head']"
            v-if="label != '學號'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
      <div v-show="displayType === 'course'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%">
          <el-table-column
            fixed
            prop="學號"
            label="學號"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in bus.course['head']"
            v-if="label != '學號' && label != '異動碼'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  import kanban from './kanban';
  import eventBus from './eventBus';

  export default {
    name: 'consolidate-page',
    components: { kanban },
    data() {
      return {
        bus: eventBus,
        displayType: 'profile',
        currentPage: 1,
        pageSize: 10,
      };
    },
    methods: {
      handleCurrentChange(cp) {
        this.currentPage = cp;
      },
      handleSizeChange(size) {
        this.pageSize = size;
      },
    },
    computed: {
      displayTable() {
        return this.bus[this.displayType].data.slice(
          (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
        );
      },
      totalPages() {
        return this.bus[this.displayType].data.length;
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

  .littlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 5px;
  }

  .switchWrapper {
    padding: 12px;
    border: 3px solid;
    border-radius: 20px;
  }
</style>
