var DataManager = (function () {
    var instances = {};
    var compayName = null;
    var dataSource = null;
    var stream = null;


    function getNode(id) {
        return stream.nodes.find(node => node.id === id);
    }

    function getToNodes(id) {
        return stream.links.find(link => link.from === id);
    }

    function buildStreamDataV2(data) {
        // console.log('buildStreamDataV2:', data);
        var streamData = [];

        // 遍历 values 数据来初始化节点
        data.values.forEach(node => {
            // console.log('buildStreamDataV2 node:', node);
            node.nc = node.color;
            const newNode = {
                id: node.id,
                name: node.name,
                desc: node.name,
                from: [],
                nc: node.nc,
                to: [],
                v: node.v,
                weight: Math.abs(parseFloat(node.v)), // 确保weight是数值类型
                sort: getSort(node),
                leaf: "c", // 默认 leaf 为 "c"
                color: Color.parseNodeColor(node.nc),
                yy: node.yy,
                margin: node.margin
            };
            // 添加节点到 streamData 数组
            streamData.push(newNode);
        });

        // 根据sort属性对节点进行排序
        streamData.sort((a, b) => b.sort - a.sort);


        // 生成links
        var links = data.link.map(link => {
            // 创建链接对象
            var newLink = {
                from: link.from,
                to: link.to,
            };
            return newLink;
        });

        return { nodes: streamData, links };
    }

    function getSort(node) {
        if (node.sort)
            return node.sort;
        switch (node.nc) {
            case 'green':
                return 2;
            case 'red':
                return -1;
            case 'gray':
                return 0;
            case 'blue':
                return 1;
            default: return 0;
        }
    }

    function getTargetWeight(fid, tid) {
        var weight;

        var from = getNode(fid);
        var to = getNode(tid);
        // console.log('getTargetWeight', fid, from, tid, to);
        var fw = from.weight;
        var tw = to.weight;
        var target = getToNodes(fid);
        if (Array.isArray(target.to)) {
            if (target && target.to.length > 1 && tw > fw) {
                var usedWeights = 0;
                for (var i = 0; i < target.to.length; i++) {
                    var targetNode = getNode(target.to[i]);
                    if (targetNode.id !== tid) {
                        usedWeights += targetNode.weight;
                    }
                }
                weight = fw - usedWeights;
                // console.log('getTargetWeight', fid, fw, tid, tw, weight, fw, usedWeights);
            } else {
                weight = Math.min(fw, tw);
            }
        } else {
            weight = Math.min(fw, tw);
        }

        return weight;
    }

    function createNodesAndLinks(data, symbol, dataSource) {
        stream = buildStreamDataV2(data);
        const nodes = [];
        const links = [];

        console.log('createNodesAndLinks', stream);
        // 构建节点
        stream.nodes.forEach(item => {
            if (item.id === 'netIncome')
                console.log(item);
            var node = {
                id: item.id,
                name: item.name,
                desc: item.desc,
                fixedValue: Math.abs(item.weight),
                weight: Math.abs(item.weight),
                v: item.v,
                nc: item.nc,
                color: item.color,
                borderRadius: 0,
                sort: item.sort,
                leaf: item.leaf,
                margin: item.margin,
                yy: item.yy,
            };
            node.leaf = item.leaf;
            if (node.id === 'netIncome')
                console.log(node);
            nodes.push(node);
        });

        // 构建链接
        stream.links.forEach(link => {
            if (Array.isArray(link.to)) {
                link.to.forEach(to => {
                    links.push({
                        source: link.from,
                        target: to,
                        value: getTargetWeight(link.from, to),
                        leaf: getNode(to).leaf,
                        color: Color.parseLinkColor(getNode(to).nc)
                    });
                });
            } else {
                links.push({
                    source: link.from,
                    target: link.to,
                    value: getTargetWeight(link.from, link.to),
                    leaf: getNode(link.to).leaf,
                    color: Color.parseLinkColor(getNode(link.to).nc)
                });
            }
        });


        // 计算每个节点的链接数量
        var linkedNodes = new Set();
        links.forEach(function (link) {
            linkedNodes.add(link.source);
            linkedNodes.add(link.target);
        });
        // 过滤掉没有链接的节点
        var filteredNodes = nodes.filter(function (node) {
            return linkedNodes.has(node.id);
        });
        console.log(filteredNodes);

        let title;
        if (data.type === 'custom') {
            title = data.title;
        } else {
            title = (compayName ? compayName : symbol) + ' ' + getFiscalQuarter(data.type, data.fiscalDateEnding) + ' Income Statement';
        }

        return { title: title, nodes: filteredNodes, links: links, unit: data.unit, currency: data.currency, logo: data.logo };
    }

    async function getDataFromSymbol(symbol, type) {
        var floder
        switch (type) {
            case 'INCOME_STATEMENT':
                floder = 'income';
                break;
            case 'BALANCE_SHEET':
                floder = 'balance';
                break;
            case 'CASH_FLOW':
                floder = 'cashflow';
                break;
            default:
                floder = 'income';
                break;
        }
        const url = 'http://localhost:3034/data-private/' + floder + '/' + symbol + '.json';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return data;
        } catch {
            return null;
        }
    }


    async function getDataBySymble(symbol = 'AAPL', functionType = 'INCOME_STATEMENT', timeline, callback) {

        let dataSource = 'data-private';
        let report;

        let data = await getDataFromSymbol(symbol, functionType);
        if (data) {
            dataSource = 'data-private';
            report = data;
            report.type = 'custom';
            report.unit = data.unit;
            report.title = data.title;

        }

        else {
            throw new Error(`Data not found for ${symbol}`);
        }

        console.log('getDataBySymble t1 ', timeline, report ? report.type : 'none', report ? report.fiscalDateEnding : 'none');

        if (report) {
            console.log('Report:', report);
            if (callback) {
                callback(createNodesAndLinks(report, symbol, dataSource));
            }
        } else {
            console.log('No report found for the specified timeline.');
        }
    }


    function initInstance(compayName) {
        // 初始化对象的私有方法和属性
        return {
            compayName: compayName,
            getDataBySymble: getDataBySymble,
        };
    }
    return {
        // 获取唯一的实例，如果不存在则创建
        getInstance: function (compayName) {
            // 如果实例不存在，那么创建它
            if (!instances[compayName]) {
                instances[compayName] = initInstance(compayName);
            }
            // 返回实例
            return instances[compayName];
        }
    };
})();
