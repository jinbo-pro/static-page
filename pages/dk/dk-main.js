const { ref, reactive, onMounted, createApp, computed } = Vue
function setup() {
  const formData = reactive({
    total: 48,
    rate: 3.75,
    year: 20
  })
  const rTypeList = reactive({
    debj: {
      label: '等额本金',
      lxze: 0, // 利息总额
      hkze: 0, // 还款总额
      mydj: 0, // 每月递减
      activeName: 'm',
      monthTableData: [],
      yearTableData: []
    },
    debx: {
      label: '等额本息',
      lxze: 0, // 利息总额
      hkze: 0, // 还款总额
      mydj: 0, // 每月递减
      activeName: 'm',
      monthTableData: [],
      yearTableData: []
    }
  })

  const yearList = ref([
    { label: '10年（120期）', value: 10 },
    { label: '20年（240期）', value: 20 },
    { label: '30年（360期）', value: 30 }
  ])

  const onSubmit = () => {
    const total = formData.total * 10000
    const mouths = formData.year * 12
    const rate = formData.rate / 100 / 12
    const debj = componteDEBJ(total, mouths, rate)
    const debx = componteDEBX(total, mouths, rate)

    /**
     * 等额本金
     */
    /**利息总额 */
    rTypeList.debj.lxze = (((mouths + 1) * total * rate) / 2).toFixed(2)
    /**还款总额 */
    rTypeList.debj.hkze = (Number(rTypeList.debj.lxze) + Number(total)).toFixed()
    /**每月递减 */
    rTypeList.debj.mydj = ((total / mouths) * rate).toFixed(2)
    rTypeList.debj.monthTableData = formatTableData(debj)
    const debjYear = sumYearTableData(debj)
    rTypeList.debj.yearTableData = debjYear

    /**
     * 等额本息
     */
    /**每月还款 */
    const yg = (total * rate * Math.pow(1 + rate, mouths)) / (Math.pow(1 + rate, mouths) - 1)
    /**利息总额 */
    rTypeList.debx.lxze = (mouths * yg - total).toFixed(2)
    /**还款总额 */
    rTypeList.debx.hkze = (Number(rTypeList.debx.lxze) + Number(total)).toFixed()
    /**每月递减 */
    rTypeList.debx.mydj = 0
    rTypeList.debx.monthTableData = formatTableData(debx)
    const debxYear = sumYearTableData(debx)
    rTypeList.debx.yearTableData = debxYear

    showComparisonChart(debjYear, 'debj')
    showComparisonChart(debxYear, 'debx')
    showRepaymentContrastChart(debjYear, debxYear)
  }
  const exportHandle = () => {
    excelExportStyle(id, `${id}.xlsx`)
  }
  onMounted(onSubmit)
  return {
    formData,
    rTypeList,
    yearList,
    onSubmit,
    exportHandle
  }
}

const MonthTableList = {
  template: document.getElementById('MonthTableList').innerHTML,
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const currentPage = ref(1)
    const pageSize = ref(12)
    const currentList = computed(() => {
      return props.list.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
    })
    return {
      currentPage,
      pageSize,
      currentList
    }
  }
}

const app = createApp({ setup })
app.component('month-table-list', MonthTableList)
app.use(ElementPlus)
app.mount('#app')
