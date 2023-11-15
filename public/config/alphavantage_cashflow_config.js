/*
    fiscalDateEnding: 财务年度结束日期，表示报告所涵盖的财务年度的结束日期。
    reportedCurrency: 报告货币，财务报告中使用的货币单位，如美元（USD）。
    operatingCashflow: 经营活动产生的现金流量，是公司主营业务活动产生的现金流入和流出的净额。
    paymentsForOperatingActivities: 经营活动支付的现金，指为了维持公司日常运营而支付的现金总额。
    proceedsFromOperatingActivities: 经营活动产生的现金流入，这里显示为“None”，可能表示没有相关数据或该项不适用。
    changeInOperatingLiabilities: 经营活动中负债的变动，这通常反映了公司经营活动中负债的增减情况。
    changeInOperatingAssets: 经营活动中资产的变动，这表明了公司在经营活动中资产的增减。
    depreciationDepletionAndAmortization: 折旧、耗竭和摊销，反映了公司固定资产和无形资产的价值随时间的减少。
    capitalExpenditures: 资本支出，通常指公司购买或改进固定资产（如厂房、设备）的支出。
    changeInReceivables: 应收账款的变动，表示报告期内应收账款的增减。
    changeInInventory: 存货的变动，指报告期内存货水平的增减。
    profitLoss: 利润或亏损，通常指公司在一定时期内的净收入或净亏损。
    cashflowFromInvestment: 投资活动产生的现金流量，反映了公司投资活动（如购买证券、资产出售等）产生的现金流入和流出的净额。
    cashflowFromFinancing: 筹资活动产生的现金流量，涉及公司为筹集资金（如发行股票、债务融资等）而产生的现金流入和流出的净额。
    paymentsForRepurchaseOfCommonStock: 购回普通股所支付的现金，表示公司回购自己的普通股份所支付的金额。
    paymentsForRepurchaseOfEquity: 购回股权所支付的现金，通常指公司回购股份的支出。
    proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: 发行长期债务和资本证券的净收入，表示公司通过发行长期债务和其他资本证券筹集资金的净额。
    proceedsFromRepurchaseOfEquity: 股权回购所产生的现金，可能指公司从股权回购中获得的现金流入。
    netIncome: 净收入，通常是指公司在一定时期内的收入减去成本和费用后的剩余金额。
    * */

/**
 * 在现金流量表中，经营活动产生的现金流量（Operating Cash Flow）是指公司在日常业务中产生的现金流的净额。要计算这个数值，通常会从净收入（Net Income）开始，并进行以下调整：
 * 
    加回所有非现金费用：
    折旧、耗竭和摊销（Depreciation, Depletion, and Amortization）
    调整营运资本的变化：
    应收账款的变动（Change in Receivables）：如果应收账款减少，意味着收到了更多现金，因此是正向现金流；如果增加，则相反。
    存货的变动（Change in Inventory）：存货的减少是正向现金流，反之则为负向。
    经营活动中负债的变动（Change in Operating Liabilities）：增加的负债通常意味着推迟了现金支出，是正向现金流；减少则相反。
    经营活动中资产的变动（Change in Operating Assets）：增加的运营资产可能意味着预付了费用或购买了库存，是负向现金流；减少则相反。
    减去经营活动支付的现金：

    经营活动支付的现金（Payments for Operating Activities）
    结合以上信息，您可以计算经营活动产生的现金流量。在实际的财务报告中，可能还会包括其他调整项来确保现金流量的准确反映。例如，税费支付、利息支付等也会影响经营活动的现金流量。

    所以，要计算Operating Cash Flow，通常是：

    Operating Cash Flow = Net Income + Non-Cash Expenses + Changes in Working Capital - Payments for Operating Activities

    在您提供的数据中，我们可以用如下信息来构成operatingCashflow：

    netIncome
    depreciationDepletionAndAmortization
    changeInReceivables（符号取决于应收账款是增加还是减少）
    changeInInventory（符号取决于存货是增加还是减少）
    changeInOperatingLiabilities（符号取决于经营性负债是增加还是减少）
    changeInOperatingAssets（符号取决于经营性资产是增加还是减少）
    paymentsForOperatingActivities（通常作为减项）
 */

/*direction 
0:link中节点 from-to
-1：那么从to-from，
1：那么按照值的标准，正值是from-to，负值是to-from，
2：那么按照值的标准，正值是to-from，负值是from-to
*/
CashFlowConfig = {
    node_config: {
        netIncome: { nc: 'green', leaf: 'l', desc: 'Net income',direction:'0' },
        depreciationDepletionAndAmortization: { nc: 'green', leaf: 'c', desc: 'Depreciation & Amortization' ,direction:'0'},
        stockBasedCompensation: { nc: 'green', leaf: 'c', desc: 'Stock-based compensation',direction:'0'},
        operatingCashflow: { nc: 'green', leaf: 'c', desc: 'Cash from operations',direction:'0' },
        capitalExpenditures: { nc: 'red', leaf: 'r', desc: 'Capital expenditure',direction:'0' },
        cashflowFromInvestment: { nc: 'red', leaf: 'c', desc: 'Cash from investing',direction:'0' },
        cashflowFromFinancing: { nc: 'red', leaf: 'c', desc: 'Cash from financing',direction:'0' },
        paymentsForRepurchaseOfCommonStock: { nc: 'red', leaf: 'r', desc: 'Stock buybacks' ,direction:'0'},
        changeInCashAndCashEquivalents: { nc: 'red', leaf: 'l', desc: 'Net cash flow',direction:'0' },
        // Additional nodes from your config that are not depicted in the image will not have a 'desc' set.
        paymentsForOperatingActivities: { nc: 'red', leaf: 'r',direction:'0' },
        proceedsFromOperatingActivities: { nc: 'green', leaf: 'c',direction:'0' },
        changeInOperatingLiabilities: { nc: 'green', leaf: 'c',direction:'1' },
        changeInOperatingAssets: { nc: 'red', leaf: 'r',direction:'1' },
        changeInReceivables: { nc: 'green', leaf: 'c',direction:'1' },
        changeInInventory: { nc: 'green', leaf: 'c' ,direction:'1'},
        profitLoss: { nc: 'green', leaf: 'l' ,direction:'0'},
        paymentsForRepurchaseOfEquity: { nc: 'red', leaf: 'r' ,direction:'0'},
        proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: { nc: 'red', leaf: 'c' ,direction:'0'},
        proceedsFromRepurchaseOfEquity: { nc: 'red', leaf: 'r' ,direction:'0'},
    },
    link_config: [
        { from: "netIncome", to: ["operatingCashflow"] },
        { from: "depreciationDepletionAndAmortization", to: ["operatingCashflow"] },
        // { from: "changeInReceivables", to: ["operatingCashflow"] },
        // { from: "changeInInventory", to: ["operatingCashflow"] },
        { from: "changeInOperatingLiabilities", to: ["operatingCashflow"] },
        { from: "changeInOperatingAssets", to: ["operatingCashflow"] },

        { from: "operatingCashflow", to: ["cashflowFromInvestment", "cashflowFromFinancing"] },
        { from: "cashflowFromInvestment", to: ["capitalExpenditures"] },
        { from: "cashflowFromFinancing", to: ["paymentsForRepurchaseOfCommonStock","proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet","dividendPayoutCommonStock"] },
        { from: "changeInCashAndCashEquivalents", to: ["cashflowFromFinancing"] },


        // { from: "changeInOperatingLiabilities", to: ["operatingCashflow"] },
        // { from: "changeInOperatingAssets", to: ["operatingCashflow"] },
        // { from: "capitalExpenditures", to: ["cashflowFromInvestment"] },
        // { from: "cashflowFromFinancing", to: ["changeInCashAndCashEquivalents"] },
        // { from: "paymentsForRepurchaseOfCommonStock", to: ["cashflowFromFinancing"] },
        // { from: "paymentsForRepurchaseOfEquity", to: ["cashflowFromFinancing"] },
        // { from: "proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet", to: ["cashflowFromFinancing"] },
        // { from: "changeInReceivables", to: ["operatingCashflow"] },
        // { from: "changeInInventory", to: ["operatingCashflow"] },
        // { from: "paymentsForOperatingActivities", to: ["operatingCashflow"] },
        // { from: "proceedsFromOperatingActivities", to: ["operatingCashflow"] },
        // { from: "proceedsFromRepurchaseOfEquity", to: ["cashflowFromFinancing"] },
    ]
};
