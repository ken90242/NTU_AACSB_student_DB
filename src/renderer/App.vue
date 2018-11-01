<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import fs from 'fs';

  export default {
    name: 'gmba',
    data() {
      return {
        intervalFunc: null,
      }
    },
    created() {
      const { commit, dispatch } = this.$store;
    	commit('updateShareDataStatus');
      commit('updatePublicFilePath');
      dispatch('initialLoadData');
      this.intervalFunc = setInterval(function() {
          [ 'profile', 'course', 'council', 'papers', 'questionnaire', 'graduate_standard' ].forEach((dataName) => {
            const dataObj = (dataName === 'graduate_standard') ? 
              this.$store.state.excelData.graduateStandard : this.$store.state.excelData[dataName]
            const modifiedDate = fs.statSync(dataObj.excel_path).mtimeMs;
            if (modifiedDate > this.$store.state.excelData.loadExcelDate) {
              commit('chgSyncingData', { status: true });
              commit('loadData', { dataName: dataName, excel_where: dataObj.excel_path});
              setTimeout(function(){
                commit('chgSyncingData', { status: false });
              }, 5000);
            }
          })
        }.bind(this), 5000)
      // console.log(this.$store.state.excelData.shareDataExisted)
    },
    beforeDestroy(){
      //clearInterval(this.intervalFunc);
    },
  };
</script>

<style>
  /* CSS */
</style>
