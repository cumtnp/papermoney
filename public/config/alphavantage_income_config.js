
AlphavantageIncomeConfig = {

    // fiscalDateEnding: 财务年度结束日期 - 表示报告所涉及财务年度的结束日期。
    // reportedCurrency: 报告货币 - 财务报告中使用的货币单位，如美元(USD)。
    // grossProfit: 毛利润 - 销售收入与销售成本的差额，属于剩余。
    // totalRevenue: 总收入 - 公司在一定期间内从销售商品和服务中获得的总收入，属于剩余。
    // costOfRevenue: 收入成本 - 产生总收入所必须的直接成本，属于花费。
    // costofGoodsAndServicesSold: 销售的商品和服务成本 - 销售商品和提供服务所直接产生的成本，属于花费。
    // operatingIncome: 营业收入 - 公司主要业务产生的收入，属于剩余。
    // sellingGeneralAndAdministrative: 一般和行政销售费用 - 公司日常运营过程中产生的销售、管理和行政费用，属于花费。
    // researchAndDevelopment: 研发费用 - 公司在新产品研发上的投入，属于花费。
    // operatingExpenses: 营业费用 - 公司经营活动中产生的费用，属于花费。
    // investmentIncomeNet: 净投资收入 - 投资收入减去相关费用后的净额，属于剩余。
    // netInterestIncome: 净利息收入 - 利息收入减去利息支出后的净额，属于剩余。
    // interestIncome: 利息收入 - 公司从存款、债券等获得的利息收入，属于剩余。
    // interestExpense: 利息支出 - 公司支付债务利息的费用，属于花费。
    // nonInterestIncome: 非利息收入 - 公司从非利息来源获得的收入，属于剩余。
    // otherNonOperatingIncome: 其他非营业收入 - 非常规业务活动产生的收入，属于剩余。
    // depreciation: 折旧 - 固定资产（如设备和建筑物）价值随时间减少的部分，属于花费。
    // depreciationAndAmortization: 折旧与摊销 - 固定资产折旧和无形资产摊销的总和，属于花费。
    // incomeBeforeTax: 税前收入 - 扣除所有费用之前的收入，属于剩余。
    // incomeTaxExpense: 所得税费用 - 公司需要支付的所得税，属于花费。
    // interestAndDebtExpense: 利息和债务费用 - 支付利息和处理债务相关的费用，属于花费。
    // netIncomeFromContinuingOperations: 持续经营净收入 - 不包括停业部分或非常规项目的净收入，属于剩余。
    // comprehensiveIncomeNetOfTax: 税后综合收入 - 所得税后的综合收入，包括未实现的收益和损失，属于剩余。
    // ebit: 息税前利润（EBIT）- 扣除利息和税项前的利润，属于剩余。
    // ebitda: 息税折旧及摊
    node_config: {
        totalRevenue: { nc: 'blue', leaf: 'l' },
        grossProfit: { nc: 'green', leaf: 'c' },
        costOfRevenue: { nc: 'red', leaf: 'c' },
        costofGoodsAndServicesSold: { nc: 'red', leaf: 'r',sort:-2 },
        operatingIncome: { nc: 'green', leaf: 'c',sort:1 },
        sellingGeneralAndAdministrative: { nc: 'red', leaf: 'r' },
        researchAndDevelopment: { nc: 'red', leaf: 'r' },
        operatingExpenses: { nc: 'red', leaf: 'c' },
        investmentIncomeNet: { nc: 'green', leaf: 'r' },
        netInterestIncome: { nc: 'green', leaf: 'r' },
        interestIncome: { nc: 'green', leaf: 'c' },
        interestExpense: { nc: 'red', leaf: 'r',sort:1 },
        nonInterestIncome: { nc: 'green', leaf: 'c' },
        otherNonOperatingIncome: { nc: 'green', leaf: 'c',sort:3 },
        depreciation: { nc: 'red', leaf: 'c' },
        depreciationAndAmortization: { nc: 'red', leaf: 'r',sort:-2 },
        incomeBeforeTax: { nc: 'green', leaf: 'c' },
        incomeTaxExpense: { nc: 'red', leaf: 'c' },
        interestAndDebtExpense: { nc: 'red', leaf: 'c' },
        netIncomeFromContinuingOperations: { nc: 'green' },
        comprehensiveIncomeNetOfTax: { nc: 'green' },
        ebit: { nc: 'green', leaf: 'r' },
        ebitda: { nc: 'green', leaf: 'r' },
        netIncome: { nc: 'green', leaf: 'r' },
    },
    link_config: [
        { from: "totalRevenue", to: ["grossProfit", "costOfRevenue"] },
        { from: "grossProfit", to: ["operatingIncome", "operatingExpenses"] },
        { from: "operatingIncome", to: ["netIncome", "interestExpense"] },
        { from: "operatingExpenses", to: ["sellingGeneralAndAdministrative", "researchAndDevelopment", "depreciationAndAmortization"] },
        { from: "costOfRevenue", to: ["costofGoodsAndServicesSold"] },
        { from: "otherNonOperatingIncome", to: ["netIncome"] },
    ]
};