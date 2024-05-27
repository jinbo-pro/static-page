new Vue({
  el: '#app',
  data() {
    return {
      formData: {
        total: 48,
        rate: 3.75,
        year: 20
      },
      rTypeList: {
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
      },
      yearList: [
        { label: '10年（120期）', value: 10 },
        { label: '20年（240期）', value: 20 },
        { label: '30年（360期）', value: 30 }
      ]
    }
  },
  mounted() {
    this.onSubmit()
  },
  methods: {
    onSubmit() {
      const total = this.formData.total * 10000
      const mouths = this.formData.year * 12
      const rate = this.formData.rate / 100 / 12
      const debj = componteDEBJ(total, mouths, rate)
      const debx = componteDEBX(total, mouths, rate)

      /**
       * 等额本金
       */
      /**利息总额 */
      this.rTypeList.debj.lxze = (((mouths + 1) * total * rate) / 2).toFixed(2)
      /**还款总额 */
      this.rTypeList.debj.hkze = (Number(this.rTypeList.debj.lxze) + Number(total)).toFixed()
      /**每月递减 */
      this.rTypeList.debj.mydj = ((total / mouths) * rate).toFixed(2)
      this.rTypeList.debj.monthTableData = formatTableData(debj)
      const debjYear = sumYearTableData(debj)
      this.rTypeList.debj.yearTableData = debjYear

      /**
       * 等额本息
       */
      /**每月还款 */
      const yg = (total * rate * Math.pow(1 + rate, mouths)) / (Math.pow(1 + rate, mouths) - 1)
      /**利息总额 */
      this.rTypeList.debx.lxze = (mouths * yg - total).toFixed(2)
      /**还款总额 */
      this.rTypeList.debx.hkze = (Number(this.rTypeList.debx.lxze) + Number(total)).toFixed()
      /**每月递减 */
      this.rTypeList.debx.mydj = 0
      this.rTypeList.debx.monthTableData = formatTableData(debx)
      const debxYear = sumYearTableData(debx)
      this.rTypeList.debx.yearTableData = debxYear

      showComparisonChart(debjYear, 'debj')
      showComparisonChart(debxYear, 'debx')
      showRepaymentContrastChart(debjYear, debxYear)
    },
    exportHandle(id) {
      excelExportStyle(id, `${id}.xlsx`)
    }
  }
})
