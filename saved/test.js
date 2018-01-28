if(typeof require !== 'undefined') XLSX=require('xlsx');
console.log(__dirname)
const workbook = XLSX.readFile('../../Desktop/AACSB/student_db/copy.xlsx');
const sheet_name_list = workbook.SheetNames;
/*处理表格*/
sheet_name_list.forEach(sheetname => { /* iterate through sheets */
  const worksheet = workbook.Sheets[sheetname];
  const res = []
  const keys = {}
  let obj = {}
  let firstField = undefined
  const re = new RegExp('(\\D+)(\\d+)')
  for (z in worksheet) {
    /* 带!的属性（比如!ref）是表格的特殊属性，用来输出表格的信息，不是表格的内容，所以去掉 */
    if(z[0] === '!') continue;
   	const [source, symbol, seq, ...rest] = re.exec(z);
    let cellVal
    try {
      cellVal = worksheet[z].v.toString().trim()
    } catch(e) {
      console.log(worksheet[z].v)
    }
    if(seq === '1') {
    	firstField = firstField || cellVal
    	keys[symbol] = cellVal
    } else {
    	const field = keys[symbol]
    	// 預防第一欄為空
    	if(field === firstField && obj[field] !== undefined) {
    		res.push(filledUpWithFields(obj, keys));
    		obj = {}
    	}
    	obj[field] = cellVal
    }
  }
  res.push(filledUpWithFields(obj, keys));
  console.log(res)
});

function filledUpWithFields(obj, keys) {
	Object.entries(keys).forEach(([symbol, field]) => {
   	obj[field] = obj[field] || undefined
  })
  return obj
}