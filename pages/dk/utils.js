/**
 * 【等额本金】
 * 等额本金的计算公式为：
 * 每月还本付息金额=（本金/还款月数）+（本金－累计已还本金）×月利率
 * 每月应还本金=贷款本金÷还款月数
 * 每月应还利息=剩余本金×月利率=(贷款本金-已归还本金累计额)×月利率
 * 每月月供递减额=每月应还本金×月利率=贷款本金÷还款月数×月利率
 * 总利息=（还款月数+1）×贷款总额×月利率÷2
 */
function componteDEBJ(total, mouths, rate) {
  const result = []
  /**累计本金 */
  let ljBj = 0
  /**累计本息 */
  let ljBx = 0
  /**累计利息 */
  let ljLx = 0
  /**每月本金 */
  const bj = total / mouths
  for (let i = 0; i < mouths; i++) {
    /**每月本息 */
    const bx = total / mouths + (total - ljBj) * rate
    /**每月利息 */
    const lx = bx - bj
    ljBx += bx
    ljLx += lx
    ljBj += bj
    result.push({ lx, ljLx, bx, ljBx, bj, ljBj, syBj: total - ljBj })
  }
  return result
}
/**
 * 【等额本息】
 * 等额本金的计算公式为：
 * 每月还本付息金额=[贷款本金×月利率×(1+月利率)^还款月数]÷[(1+月利率)^还款月数-1]
 * 每月应还本金=贷款本金×月利率×(1+月利率)^(还款月序号-1)÷〔(1+月利率)^还款月数-1〕
 * 每月应还利息=贷款本金×月利率×〔(1+月利率)^还款月数-(1+月利率)^(还款月序号-1)〕÷〔(1+月利率)^还款月数-1〕
 * 每月月供递减额=每月应还本金×月利率=贷款本金÷还款月数×月利率
 * 总利息=还款月数×每月月供额-贷款本金
 */
function componteDEBX(total, mouths, rate) {
  const result = []
  /**累计本金 */
  let ljBj = 0
  /**累计本息 */
  let ljBx = 0
  /**累计利息 */
  let ljLx = 0
  /**每月还款 */
  const bx = (total * rate * Math.pow(1 + rate, mouths)) / (Math.pow(1 + rate, mouths) - 1)
  for (let i = 0; i < mouths; i++) {
    /**每月本金 */
    const bj = (total * rate * Math.pow(1 + rate, i)) / (Math.pow(1 + rate, mouths) - 1)
    /**每月利息 */
    const lx = bx - bj
    ljBx += bx
    ljLx += lx
    ljBj += bj
    result.push({ lx, ljLx, bx, ljBx, bj, ljBj, syBj: total - ljBj })
  }
  return result
}
/**统计年数据 */
function sumYearTableData(list) {
  let result = []
  for (let i = 0, len = list.length; i < len; i += 12) {
    const yearList = list.slice(i, i + 12)
    const sum = (key) => {
      return yearList.reduce((p, c) => {
        p = Number(p) + Number(c[key])
        return p.toFixed(2)
      }, 0)
    }
    const last = yearList[yearList.length - 1]
    result.push({
      lx: sum('lx'),
      ljLx: last.ljLx.toFixed(2),
      bx: sum('bx'),
      ljBx: last.ljBx.toFixed(2),
      bj: sum('bj'),
      ljBj: last.ljBj.toFixed(2),
      syBj: last.syBj.toFixed(2)
    })
  }
  return result
}
/**整理数据 */
function formatTableData(list) {
  return list.map((item, index) => {
    return Object.keys(item).reduce(
      (p, c) => {
        p[c] = item[c].toFixed(2)
        return p
      },
      { index: index + 1 }
    )
  })
}
