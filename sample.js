import * as d3 from 'd3';
import { sankey as sankeyLayout } from 'd3-sankey';  // 重命名导入的函数

// 数据
const nodes = [
    { id: 'A', name: 'Node A',value: 10 },
    { id: 'B', name: 'Node B',value: 20 },
    { id: 'C', name: 'Node C',value: 30 }
];

const links = [
    { source: 'A', target: 'B'},
    { source: 'B', target: 'C' }
];

// 将字符串 ID 转换为节点引用
links.forEach(link => {
    link.source = nodes.findIndex(node => node.id === link.source);
    link.target = nodes.findIndex(node => node.id === link.target);
});

// 设置桑基图的参数
const sankey = sankeyLayout()  // 使用重命名的函数
    .nodeWidth(15)
    .nodePadding(10)
    .size([500, 300]);

// 计算节点和链接的位置
const { nodes: graphNodes, links: graphLinks } = sankey({
    nodes: nodes.map(d => ({ ...d })), // 深拷贝 nodes
    links: links.map(d => ({ ...d }))  // 深拷贝 links
});

// 打印节点和链接信息
console.log('Nodes:', graphNodes);
console.log('Links:', graphLinks);
