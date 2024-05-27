/**
 * 前端生成并导出带样式的excel-文章参考：
 * https://zhuanlan.zhihu.com/p/345915999
 */

// 将字符串转ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}

// 表格转文件
function workbook2blob(workbook) {
  // 生成excel的配置项
  const wopts = {
    // 要生成的文件类型
    bookType: 'xlsx',
    // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    bookSST: false,
    type: 'binary'
  }
  const wbout = XLSX.write(workbook, wopts)

  return new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
}
// 添加表格样式
async function addStyle(workbookBlob) {
  /**XlsxPopulate 页面引入 xlsx-populate */
  const workbook = await XlsxPopulate.fromDataAsync(workbookBlob)
  // 循环所有的表
  workbook.sheets().forEach((sheet) => {
    // 设置所有单元格边框
    sheet.usedRange().style({
      border: true, // 设置边框为true
      borderColor: '000000' // 设置边框颜色为黑色
    })
    // 隐藏所有边框
    // sheet.gridLinesVisible(true)
  })
  const blob = await workbook.outputAsync()
  return URL.createObjectURL(blob)
}

/**
 * 导出带样式的表格
 * @param {HTMLElement|string} tableDom 表格dom
 * @param {string} fileName 导出的表格名
 */
async function excelExportStyle(tableDom, fileName) {
  const dom = typeof tableDom == 'string' ? document.getElementById(tableDom) : tableDom
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.table_to_sheet(dom)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  const workbookBlob = workbook2blob(workbook)
  const url = await addStyle(workbookBlob)
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('download', fileName)
  a.click()
  a.remove()
}
