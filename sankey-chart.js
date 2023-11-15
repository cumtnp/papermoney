document.addEventListener("DOMContentLoaded", function() {
    // 设置 SVG 和 Sankey 图的尺寸
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // 创建 Sankey 实例
    const sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]]);

    // 定义颜色比例尺
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // 准备数据
    const graph = {
        nodes: [
            {name: "A"},
            {name: "B"},
            {name: "C"},
            {name: "D"},
            // 添加更多节点
        ],
        links: [
            {source: "A", target: "B", value: 2},
            {source: "B", target: "C", value: 2},
            {source: "A", target: "D", value: 2},
            // 添加更多链接
        ]
    };

    // 为 Sankey 图计算节点和链接的布局
    sankey(graph);

    // 绘制路径
    svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .enter().append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width))
        .style("stroke", (d,i) => color(i))
        .style("fill", "none");

    // 绘制节点
    const node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g");

    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .style("fill", (d, i) => color(i));

    node.append("text")
        .attr("x", d => d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name);
});
