import DataManager from './datamanager.js';

import { JSDOM } from 'jsdom';
import { sankey, sankeyLinkHorizontal, sankeyCenter } from 'd3-sankey';
import * as d3 from 'd3';
import sharp from 'sharp';
import fs from 'fs'; // 使用 import 替代 require
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 创建 JSDOM 实例
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
const document = dom.window.document;
const { XMLSerializer } = dom.window;

export function showCompany(companyName, symbol, reportDate) {
    const reportTypes = ['INCOME_STATEMENT', 'CASH_FLOW', 'BALANCE_SHEET'];

    reportTypes.forEach((reportType, index) => {
        DataManager.getInstance(companyName).getDataBySymbol(symbol, reportType, reportDate, incomeChartData => {
            if (incomeChartData) {
                const chartName = `${companyName}(${symbol})-${reportType}-${reportDate}`;
                drawChart(incomeChartData, chartName, companyName, reportDate);
            } else {
                console.log('No data for ', companyName, symbol, reportType, reportDate);
            }
        });
    });
}

// showCompany('google', 'Alphabet', '2023Q3');
// showCompany('apple', 'AAPL', '2023Q2');
// showCompany('xiaomi', 'XIAOMI', '2023Q3');
// showCompany('tencent', 'TENCENT', '2023Q3');
// showCompany('amazon', 'Amazon', '2023Q3');
// showCompany('NVDIA', 'NVIDIA', '2023Q3');
// showCompany('Facebook', 'META', '2023Q3');
// showCompany('Lilly', 'LLY', '2023Q3');
// showCompany('Visa','V','2023Q3');
// showCompany('Walmart', 'WMT', '2023Q3');
// showCompany('ExxonMobil', 'XOM', '2023Q3');
// showCompany('chinaMobile', 'CHLKF', "2023Q3");
// showCompany('meituan', 'MPNGY', "2023Q3");
// showCompany('jd', 'JD', "2023Q3");
showCompany('LiXiang', 'LXEH', "2023Q3");



function drawChart(data, chartName, company, reportDate) {

    var unit = data.unit;
    var currency = data.currency;
    var unit_t = data.unit_t;
    // Append a background rect to the SVG

    var picWidht = 4296;
    var picHeight = 2416;

    const titleHeight = 120; // Height of the title area
    const titleMargin = 240; // Margin around the title and icon
    const iconWidth = 40; // Assuming a square icon for simplicity


    var nodeWidth = 80;
    var nodePadding = 260;

    const svgId = `svg-${chartName}`;
    const svg = d3.select(document.body).append('svg')
        .attr('id', svgId)
        .attr('width', picWidht)
        .attr('height', picHeight);

    // Append a background rect to the SVG
    svg.append('rect')
        .attr('width', picWidht)
        .attr('height', picHeight)
        .attr('fill', '#F5F5F5');

    // Add an icon to the title group


    // 创建仅包含标题的组
    const titleGroup = svg.append('g')
        .attr('transform', `translate(${picWidht / 2}, ${titleMargin})`);

    // 添加标题文本
    titleGroup.append('text')
        .attr('x', 0) // 水平居中
        .attr('y', titleHeight / 2) // 垂直居中于标题区域
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle') // 文本中心对齐
        .attr('font-size', '120px') // 字体大小
        .attr('fill', '#444444') // 字体颜色
        .attr('font-weight', 'bold') // 字体加粗
        .text(data.title); // 动态标题
    console.log(data.subtitle);
    if (data.subtitle) {
        // 添加副标题
        titleGroup.append('text')
            .attr('x', 0) // 水平居中
            .attr('y', titleHeight + 32) // 在主标题下方
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle') // 文本中心对齐
            .attr('font-size', '64px') // 副标题字体大小，可以根据需要调整
            .attr('fill', '#999') // 副标题字体颜色，可以根据需要调整
            .text(data.subtitle); // 动态副标题
    }

    // 桑基图数据
    const graph = {
        nodes: data.nodes,
        links: data.links
    };

    try {
        // 创建桑基图布局
        const margin = { top: 180, right: 360, bottom: 180, left: 360 };
        const chart = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top + titleMargin + titleHeight * 1.5})`);;

        const chartWidth = picWidht - margin.left - margin.right;
        const chartHeight = picHeight - titleMargin - titleHeight * 1.5 - margin.top - margin.bottom;

        const sankeyGenerator = sankey()
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .nodeAlign(sankeyCenter)
            .size([chartWidth, chartHeight])
            .nodeId(d => d.id)
            .linkSort(function (a, b) {
                return b.sort - a.sort;
            })
            .nodeSort(function (a, b) {
                return b.sort - a.sort;
            });

        sankeyGenerator(graph);

        // 遍历所有节点来计算每个层级的节点数量
        const layerNodeCounts = {};

        graph.nodes.forEach(node => {
            layerNodeCounts[node.depth] = (layerNodeCounts[node.depth] || 0) + 1;
        });

        // 基于最大层级节点数量来调整nodePadding
        const maxNodesInALayer = Math.max(...Object.values(layerNodeCounts));

        // 如果节点数量较少，使用较大的padding
        nodePadding = Math.max(160, Math.min(240, 240 * 5 / maxNodesInALayer));
        console.log('maxNodesInALayer，nodePadding:', maxNodesInALayer, nodePadding);

        sankeyGenerator.nodePadding(nodePadding);
        sankeyGenerator(graph);

        chart
            .append('g')
            .selectAll()
            .data(graph.nodes)
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

        chart
            .append('g')
            .attr('fill', 'none')
            .selectAll()
            .data(graph.links)
            .join('path')
            .attr('class', 'link')
            .attr('d', sankeyLinkHorizontal())
            .attr('indexName', (d) => d.source.name + '-' + d.target.name)
            .attr('stroke', (d, i) => d.color)
            .attr('stroke-width', (d) => Math.max(1, d.width)) // 确保最小宽度是2px
            .attr('stroke-opacity', '1.0')
            .append('title')

        // 绘制标签
        const nodeGroups = chart
            .append('g')
            .selectAll('g.node')
            .data(graph.nodes)
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
            .attr('y', (d) => determineYPosition(d, nodePadding))
            .attr('fill', (d) => d.color)
            .attr('text-anchor', (d) => determineTextAnchor(d))
            .attr('alignment-baseline', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '48px')
            .attr('dy', '0.35em') // 垂直居中对齐文本
            .text((d) => d.desc)

        // 绘制金额
        nodeGroups
            .append('text')
            .attr('class', 'chart-node-desc')
            .attr('x', (d) => determineXPosition(d))
            .attr('y', (d) => determineYPosition(d, nodePadding) + 60) // 在标题下方一定距离
            .attr('text-anchor', (d) => determineTextAnchor(d))
            .attr('alignment-baseline', 'middle')
            .attr('dy', '0.35em') // 垂直居中对齐文本
            .text((d) => formatAmount(d.v, unit, currency, unit_t))
            .attr('font-size', '48px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'sans-serif')
            .attr('fill', (d) => d.color)

        // 绘制Margin
        nodeGroups
            .filter((d) => d.margin !== undefined)
            .append('text')
            .attr('class', 'chart-node-margin')
            .attr('x', (d) => determineXPosition(d))
            .attr('y', (d) => determineYPosition(d, nodePadding) + 124) // 在YY下方一定距离
            .attr('text-anchor', (d) => determineTextAnchor(d))
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '40px')
            .attr('fill', '#666')
            .text((d) => formatPercentage(d.margin))


        // 将 SVG 序列化为字符串
        const svgString = new XMLSerializer().serializeToString(document.getElementById(svgId));

        // Convert the SVG string to a Buffer for sharp
        const svgBuffer = Buffer.from(svgString);

        // Use sharp to convert the SVG buffer to a PNG buffer
        sharp(svgBuffer)
            .png({
                quality: 100,
                compressionLevel: 9,// Set quality and compression level
                density: 300 // Higher DPI (default is 72)
            })
            .toBuffer()
            .then(highResBuffer => {
                const companyDir = `./public-img/${company}`;
                if (!fs.existsSync(companyDir)) {
                    fs.mkdirSync(companyDir, { recursive: true });
                }
                // Write the high-resolution buffer to a file
                const filePath = path.join(companyDir, `${chartName}.png`);
                fs.writeFileSync(filePath, highResBuffer);
                console.log(`Chart saved:`, filePath);
            })
            .catch(err => console.error('Error converting image:', err));

    } catch (err) {
        console.log(err);
    }

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
function determineYPosition(d, nodePadding) {
    // 垂直居中位置
    // 如果leaf为'l'或'r'，标签放在节点垂直中心
    if (d.leaf === 'l' || d.leaf === 'r') {
        return (d.y0 + d.y1) / 2;
    }
    // 否则，标签放在节点上方
    else {
        var top = 60 + nodePadding / 4;
        if (d.yy)
            top = top + 32;
        if (d.margin)
            top = top + 32;
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
function formatAmount(amount, unit = 'D', currency = 'USD', unit_t = 'B') {
    // 检测金额是否为负数
    const isNegative = amount < 0;
    // 取绝对值以便于格式化
    const absoluteAmount = Math.abs(amount);

    let formattedAmount;
    let c = currency === 'RMB' ? '¥' : '$';
    if (unit_t === 'B') {
        if (unit === 'D') {
            formattedAmount = `${c}${(absoluteAmount / 1e9).toFixed(1)}B`;
        } else if (unit === 'M') {
            formattedAmount = `${c}${(absoluteAmount / 1e3).toFixed(1)}B`;
        } else if (unit === 'B') {
            formattedAmount = `${c}${absoluteAmount.toFixed(1)}B`;
        } else {
            formattedAmount = `${c}${absoluteAmount.toFixed(1)}`;
        }
    } else if (unit_t === 'M') {
        if (unit === 'D') {
            formattedAmount = `${c}${(absoluteAmount / 1e6).toFixed(1)}M`;
        } else if (unit === 'M') {
            formattedAmount = `${c}${(absoluteAmount / 1).toFixed(1)}M`;
        } else if (unit === 'B') {
            formattedAmount = `${c}${absoluteAmount.toFixed(1) * 1e3}M`;
        } else {
            formattedAmount = `${c}${absoluteAmount.toFixed(1)}`;
        }
    } else {
        formattedAmount = `${c}${absoluteAmount.toFixed(1)}`;
    }


    // 如果金额为负数，加上括号
    return isNegative ? `(${formattedAmount})` : formattedAmount;
}


function formatPercentage(value) {
    // 如果值已经是百分比形式，直接返回
    if (typeof value === 'string' && value.includes('%')) {
        var unit = '';
        if (value.endsWith('%')) {
            unit = ' margin';

        } if (value.startsWith('-')) {
            // 移除负号并在百分比后添加 'margin'
            return value.slice(1) + unit;
        } else {
            // 直接在百分比后添加 'margin'
            return value + unit;
        }

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


// Function to get the MIME type based on file extension
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.svg':
        case '.svgz':
            return 'image/svg+xml';
        default:
            throw new Error('Unsupported image type');
    }
}

// Read the image file and convert it to Base64
function getImageBase64(filePath) {
    try {
        const mimeType = getMimeType(filePath);
        const imageFile = fs.readFileSync(filePath);
        return `data:${mimeType};base64,${Buffer.from(imageFile).toString('base64')}`;
    } catch (err) {
        return null;
    }

}