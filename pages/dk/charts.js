/**本息对比图 */
function showComparisonChart(showYearTableData, dom) {
  const xAxisData = []
  const bjData = []
  const lxData = []
  showYearTableData.forEach((item, index) => {
    xAxisData.push(index + 1 + '年')
    bjData.push(item.bj)
    lxData.push(item.lx)
  })

  const option = {
    title: {
      text: '每年本金利息对比图'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['本金', '利息']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: xAxisData
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '本金',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: bjData
      },
      {
        name: '利息',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: lxData
      }
    ]
  }
  const myChart = echarts.init(document.getElementById(dom))
  myChart.setOption(option)
}
/**两种方式年还款对比 */
function showRepaymentContrastChart(debj, debx) {
  const createChart = (key, dom, title) => {
    const xAxisData = []
    const debjData = []
    const debxData = []
    debj.forEach((item, index) => {
      xAxisData.push(index + 1 + '年')
      debjData.push(item[key])
      debxData.push(debx[index][key])
    })
    const option = {
      title: {
        text: title
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['等额本金', '等额本息']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      // 数据值
      series: [
        {
          name: '等额本金',
          type: 'line',
          data: debjData
        },
        {
          name: '等额本息',
          type: 'line',
          data: debxData
        }
      ]
    }
    const myChart = echarts.init(document.getElementById(dom))
    myChart.setOption(option)
  }
  createChart('bx', 'echartsRepaymentContainerMn', '每年还款对比')
  createChart('ljBx', 'echartsRepaymentContainerLj', '累计还款对比')
}
