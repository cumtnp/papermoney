

$(document).ready(function () {
    // showCompay('apple', 'AAPL', '2022');
    showCompay('google', 'Alphabet', '2022');
});

function showCompay(conpamyName, symbol, reportDate) {
    DataManager.getInstance(conpamyName).getDataBySymble(symbol, 'INCOME_STATEMENT', reportDate, function (incomChartDatas) {
        console.log(incomChartDatas);
        var containerId = createNewContainer(incomChartDatas.title, incomChartDatas.logo);
        drawIncomeChart(incomChartDatas, containerId);
    });

    DataManager.getInstance(conpamyName).getDataBySymble(symbol, 'CASH_FLOW', reportDate, function (incomChartDatas) {
        console.log(incomChartDatas);
        var containerId = createNewContainer(incomChartDatas.title, incomChartDatas.logo);
        drawIncomeChart(incomChartDatas, containerId);
    });

    DataManager.getInstance(conpamyName).getDataBySymble(symbol, 'BALANCE_SHEET', reportDate, function (incomChartDatas) {
        console.log(incomChartDatas);
        var containerId = createNewContainer(incomChartDatas.title, incomChartDatas.logo);
        drawIncomeChart(incomChartDatas, containerId);
    });
}

// This function creates a new container and returns the id of the new container
function createNewContainer(title, logoUrl) {
    var containerId = 'container-' + $('.container').length; // Create a new ID based on existing containers
    var $newContainer = $(`<div class='container'><div class="container-title"><img class="company-logo"></img><H1>${title}</H1></div><div id=${containerId} class="chart"></div></div>`); // Create a new div with the container class
    $('#chat-lists').append($newContainer);
    if (logoUrl) {
        $newContainer.find('.company-logo').attr('src', logoUrl);
    }
    return containerId;
}


function drawIncomeChart(data, containerId) {

    var nodeWidth = 30;
    var nodePadding = 90;
    // 画布
    const margin = { top: 80, right: 200, bottom: 80, left: 200 }; // 增加左右边距
    // 最小图表尺寸
    const minWidth = 1400;
    const minHeight = 800;

    // 计算最小宽高比
    const aspectRatio = minWidth / minHeight;

    // 父容器的尺寸

    const container = $('#' + containerId);
    const containerWidth = container.width();
    const containerHeight = container.height();
    let chartWidth = containerWidth - margin.left - margin.right;
    let chartHeight = containerHeight - margin.top - margin.bottom;
    // 根据最小宽高比调整图表尺寸
    if (chartWidth / chartHeight > aspectRatio) {
        // 如果容器比较宽，则根据容器高度调整图表宽度
        chartWidth = chartHeight * aspectRatio;
    } else {
        // 如果容器比较高，则根据容器宽度调整图表高度
        chartHeight = chartWidth / aspectRatio;
    }
    console.log(containerWidth, containerHeight, chartWidth, chartHeight);
    // 确保图表不小于最小尺寸
    chartWidth = Math.max(chartWidth, minWidth);
    chartHeight = Math.max(chartHeight, minHeight);

    const width = chartWidth; // 增加宽度以适应边距
    const height = chartHeight; // 如果需要，也可以增加高度
    const unit = data.unit;
    const currency = 'USD';
    const svg = d3
        .select('#' + containerId)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // 图
    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 更新Sankey布局的size属性来匹配新的内部尺寸
    const sankey = d3
        .sankey()
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .nodeAlign(d3.sankeyCenter)
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        .nodeId((d) => d.id);

    sankey.nodeSort(function (a, b) {
        return b.sort - a.sort;
    });

    const { nodes, links } = sankey({
        nodes: data.nodes,
        links: data.links
    });

    const layerNodeCounts = {};

    // 计算每个layer中的节点数量
    nodes.forEach(node => {
        layerNodeCounts[node.layer] = (layerNodeCounts[node.layer] || 0) + 1;
    });

    chart
        .append('g')
        .selectAll()
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .attr('indexName', (d) => d.name)
        .append('rect')
        .attr('fill', (d, i) => d.color)
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('width', (d) => d.x1 - d.x0)
        .append('title')
        .text((d) => `${d.name}`)

    // 假设links是按顺序排列的
    var yOffset = {}; // 存储每个节点的y偏移量

    // 初始化y偏移量
    links.forEach(function (link) {
        if (!yOffset[link.source.name]) yOffset[link.source.name] = link.source.y0;
        if (!yOffset[link.target.name]) yOffset[link.target.name] = link.target.y0;
    });
    chart
        .append('g')
        .attr('fill', 'none')
        .selectAll()
        .data(links)
        .join('path')
        .attr('class', 'link')
        .attr('d', d3.sankeyLinkHorizontal())
        .attr('indexName', (d) => d.source.name + '-' + d.target.name)
        .attr('stroke', (d, i) => d.color)
        .attr('stroke-width', (d) => Math.max(1, d.width)) // 确保最小宽度是2px
        .attr('stroke-opacity', '1.0')
        .append('title')
        .text((d) => `${d.value.toLocaleString()}`)

    // 绘制标签
    const nodeGroups = chart
        .append('g')
        .selectAll('g.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node');

    nodeGroups
        .append('rect')
        .attr('fill', (d, i) => d.color)
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('width', (d) => d.x1 - d.x0);

    // Append the title for each node
    // 绘制标题
    nodeGroups
        .append('text')
        .attr('class', 'chart-node-title')
        .attr('x', (d) => determineXPosition(d))
        .attr('y', (d) => determineYPosition(d))
        .attr('fill', (d) => d.color)
        .attr('text-anchor', (d) => determineTextAnchor(d))
        .attr('alignment-baseline', 'middle')
        .attr('dy', '0.35em') // 垂直居中对齐文本
        .text((d) => d.desc)

    // 绘制金额
    nodeGroups
        .append('text')
        .attr('class', 'chart-node-desc')
        .attr('x', (d) => determineXPosition(d))
        .attr('y', (d) => determineYPosition(d) + 20) // 在标题下方一定距离
        .attr('text-anchor', (d) => determineTextAnchor(d))
        .attr('alignment-baseline', 'middle')
        .attr('dy', '0.35em') // 垂直居中对齐文本
        .text((d) => formatAmount(d.v, unit))
        .attr('fill', (d) => d.color)

    // 绘制Margin
    nodeGroups
        .filter((d) => d.margin !== undefined)
        .append('text')
        .attr('class', 'chart-node-margin')
        .attr('x', (d) => determineXPosition(d))
        .attr('y', (d) => determineYPosition(d) + 42) // 在YY下方一定距离
        .attr('text-anchor', (d) => determineTextAnchor(d))
        .attr('alignment-baseline', 'middle')
        .text((d) => formatPercentage(d.margin))

    // 绘制YY
    nodeGroups
        .filter((d) => d.yy !== undefined)
        .append('text')
        .attr('class', 'chart-node-yy')
        .attr('x', (d) => determineXPosition(d))
        .attr('y', (d) => determineYPosition(d) + 58) // 在金额下方一定距离
        .attr('text-anchor', (d) => determineTextAnchor(d))
        .attr('alignment-baseline', 'middle')
        .text((d) => formatYY(d.yy))


}

// Helper function to determine x position based on leaf property
function determineXPosition(d) {
    if (d.leaf === 'l') {
        return d.x0 - 80;
    } else if (d.leaf === 'r') {
        return d.x1 + 20;
    } else {
        return (d.x0 + d.x1) / 2; // 默认居中
    }
}

// Helper function to determine y position based on leaf property
function determineYPosition(d) {
    // 垂直居中位置
    // 如果leaf为'l'或'r'，标签放在节点垂直中心
    if (d.leaf === 'l' || d.leaf === 'r') {
        return (d.y0 + d.y1) / 2;
    }
    // 否则，标签放在节点上方
    else {
        var top = 40;
        if (d.yy)
            top = top + 16;
        if (d.margin)
            top = top + 16;
        return d.y0 - top;
    }
}

// Helper function to determine text anchor based on leaf property
function determineTextAnchor(d) {
    if (d.leaf === 'l') {
        return 'end';
    } else if (d.leaf === 'r') {
        return 'start';
    } else {
        return 'middle'; // 默认居中
    }
}

// Helper function to format amount
function formatAmount(amount, unit = 'D') {
    // 检测金额是否为负数
    const isNegative = amount < 0;
    // 取绝对值以便于格式化
    const absoluteAmount = Math.abs(amount);

    let formattedAmount;
    if (unit === 'D') {
        formattedAmount = `$${(absoluteAmount / 1e9).toFixed(1)}B`;
    } else if (unit === 'M') {
        formattedAmount = `$${(absoluteAmount / 1e3).toFixed(1)}B`;
    } else if (unit === 'B') {
        formattedAmount = `$${absoluteAmount.toFixed(1)}B`;
    } else {
        formattedAmount = `$${absoluteAmount.toFixed(1)}`;
    }

    // 如果金额为负数，加上括号
    return isNegative ? `(${formattedAmount})` : formattedAmount;
}


function formatPercentage(value) {
    // 如果值已经是百分比形式，直接返回
    if (typeof value === 'string' && value.includes('%')) {
        return value;
    }
    // 如果值是数字，转换成百分比
    return (value * 100).toFixed(2) + '% margin';
}

function formatYY(value) {
    // 如果value是字符串且已包含'pp'或'%'，则直接返回value
    if (typeof value === 'string' && (value.includes('pp') || value.includes('%'))) {
        return value;
    }

    // 如果value是数字
    if (typeof value === 'number') {
        const absValue = Math.abs(value);

        if (absValue * 100 > 0.1) {
            // 如果value*100大于0.1，格式化为百分比形式
            const formattedValue = (absValue * 100).toFixed(2) + '%';
            return value > 0 ? '+' + formattedValue + ' Y/Y' : `(${formattedValue}) Y/Y`;
        } else if (absValue * 10000 > 0.1) {
            // 如果value*10000大于0.1，格式化为pp形式
            const formattedValue = (absValue * 10000).toFixed(0) + 'pp';
            return value > 0 ? '+' + formattedValue + ' Y/Y' : `(${formattedValue}) Y/Y`;
        }
        // 如果value*10000小于或等于0.1，不显示
    }

    // 如果不符合以上条件，则返回空字符串，表示不显示
    return '';
}
// // Define the custom link generator function
// function customSankeyLinkHorizontal(link, yOffset) {
//     console.log("drawLink: ",link);
//     // 计算起点
//     var startY = yOffset[link.source.name] + link.width / 2;
//     yOffset[link.source.name] += link.width; // 更新源节点的y偏移量

//     // 计算终点
//     var endY = yOffset[link.target.name] + link.width / 2;
//     yOffset[link.target.name] += link.width; // 更新目标节点的y偏移量

//     var start = { x: link.source.x1, y: startY };
//     var end = { x: link.target.x0, y: endY };

//     var midX = (start.x + end.x) / 2;

//     var pathData = `M${start.x},${start.y} C${midX},${start.y} ${midX},${end.y} ${end.x},${end.y}`;
//     return pathData;
// }