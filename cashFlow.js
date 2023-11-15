var CashFlowManager = (function () {
    var instances = {};
    var compayName = null;
    var dataSource = null;
    var stream = null;

    function getDataBySearch(searchKey, callback) {

    }

    function getFiscalQuarter(type, fiscalDateEnding) {
        const date = new Date(fiscalDateEnding);
        const fiscalYear = date.getFullYear();
        let output = `FY${fiscalYear}`;
        if (type === "quarterly") {
            const month = date.getMonth() + 1; // 月份是从0开始的，所以需要加1
            let quarter;

            if (month >= 1 && month <= 3) {
                quarter = 'Q1';
            } else if (month >= 4 && month <= 6) {
                quarter = 'Q2';
            } else if (month >= 7 && month <= 9) {
                quarter = 'Q3';
            } else if (month >= 10 && month <= 12) {
                quarter = 'Q4';
            }

            output += ` ${quarter}`;
        }
        console.log('getFiscalQuarter', type, fiscalDateEnding, date, fiscalYear, output);

        return output;
    }



    function getNode(id) {
        return stream.nodes.find(node => node.id === id);
    }

    function getToNodes(id) {
        return stream.links.find(link => link.from === id);
    }

    function getFromNodes(id) {
        return stream.links.find(link => link.to === id);
    }


    function buildStreamData(data) {
        // Nodes initialization
        const nodes = Object.keys(CashFlowConfig.node_config).reduce((acc, key) => {
            // Check if the value is a number
            const value = parseFloat(data[key]);
            var desc = CashFlowConfig.node_config[key].desc?CashFlowConfig.node_config[key].desc:key;
            if (!isNaN(value)) {
                acc.push({
                    id: key,
                    name: key,
                    desc: desc,
                    level: 0,
                    leaf: CashFlowConfig.node_config[key].leaf,
                    sort: getSort(CashFlowConfig.node_config[key]),
                    color: Color.parseNodeColor(CashFlowConfig.node_config[key].nc),
                    nc: CashFlowConfig.node_config[key].nc,
                    weight: Math.abs(value)
                });
            }
            return acc;
        }, []);


        // Create a set of valid node IDs
        const validNodeIds = new Set(nodes.map(node => node.id));
        console.log(validNodeIds);

        // Links initialization with filtering
        // Links initialization with filtering
        const links = CashFlowConfig.link_config.reduce((acc, link) => {
            // Filter the 'to' array to include only valid node IDs
            const filteredTo = link.to.filter(toNode => validNodeIds.has(toNode));

            console.log(link.from, filteredTo);

            // Check if 'from' is valid and 'filteredTo' array is not empty
            if (validNodeIds.has(link.from) && filteredTo.length > 0) {
                acc.push({
                    from: link.from,
                    to: filteredTo
                });
            }
            return acc;
        }, []);



        console.log('buildStreamData', nodes, links);
        return { nodes, links };
    }



    function getSort(node) {
        if (node.sort)
            return node.sort;
        switch (node.nc) {
            case 'green':
                return 9;
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
        var from = getNode(fid);
        var to = getNode(tid);
        var fw = from.weight; // from node's weight
        var tw = to.weight; // to node's weight
        var targets = getToNodes(fid); // get all 'to' nodes connected to 'from'
    
        // If 'from' connects to multiple 'to' nodes, calculate the proportional weights
        if (targets && targets.to.length > 1) {
            // Calculate total requested weight by all 'to' nodes including current one
            var totalRequestedWeight = targets.to.reduce((sum, currentTid) => {
                var targetNode = getNode(currentTid);
                return sum + targetNode.weight;
            }, 0);
    
            // Calculate the proportion of the 'from' node's weight to allocate to the 'to' node
            var proportion = tw / totalRequestedWeight;
            
            // Allocate weight proportionally, ensuring it doesn't exceed 'from' node's weight
            var weight = Math.min(fw * proportion, tw);
    
            // If there is not enough 'from' weight to satisfy all 'to' nodes, distribute available 'from' weight
            if (fw < totalRequestedWeight) {
                weight = fw * proportion;
            }
    
            return weight;
        } else {
            // If there is only one 'to' node, or if 'to' node's weight is less than 'from' node's weight
            return Math.min(fw, tw);
        }
    }
    
    
    

    function createNodesAndLinks(data, symbol) {
        stream = buildStreamData(data);
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
                desc:item.desc,
                fixedValue: Math.abs(item.weight),
                weight: Math.abs(item.weight),
                nc: item.nc,
                color: item.color,
                borderRadius: 0,
                sort: item.sort,
                leaf: item.leaf,
            };
            node.leaf = item.leaf;
            if (node.id === 'netIncome')
                console.log(node);
            nodes.push(node);
        });

        // 构建链接
        stream.links.forEach(link => {
            link.to.forEach(to => {
                links.push({
                    source: link.from,
                    target: to,
                    value: getTargetWeight(link.from, to),
                    leaf: getNode(to).leaf,
                    color: Color.parseLinkColor((getNode(to).nc))
                });

            })
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

        const title = (compayName ? compayName : symbol) + ' ' + getFiscalQuarter(data.type, data.fiscalDateEnding) + ' CashFlow';

        return { title: title, nodes: filteredNodes, links: links };
    }


    async function getDataBySymble(symbol = 'AAPL', functionType = 'CASH_FLOW', timeline, callback) {
        const apiKey = 'DOYKTPSPSFMC7904'; // Replace with your actual API key

        // const url = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}&apikey=${apiKey}`;
        const url = 'http://localhost:3033/data/cashflow/' + symbol + '.json';

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            let report;
            if (timeline.length === 4) { // Yearly report
                report = data.annualReports.find(r => r.fiscalDateEnding.startsWith(timeline));
                report.type = 'annual';
            } else if (timeline.length === 6) { // Quarterly report for a specific quarter
                const year = timeline.substring(0, 4);
                const month = parseInt(timeline.substring(4, 6));
                let quarter;

                if (month >= 1 && month <= 3) {
                    quarter = 'Q1';
                } else if (month >= 4 && month <= 6) {
                    quarter = 'Q2';
                } else if (month >= 7 && month <= 9) {
                    quarter = 'Q3';
                } else if (month >= 10 && month <= 12) {
                    quarter = 'Q4';
                }

                // Find the latest report in the specified quarter
                report = data.quarterlyReports
                    .filter(r => r.fiscalDateEnding.startsWith(year))
                    .reverse()
                    .find(r => {
                        const reportMonth = parseInt(r.fiscalDateEnding.substring(5, 7));
                        return (quarter === 'Q1' && reportMonth <= 3) ||
                            (quarter === 'Q2' && reportMonth >= 4 && reportMonth <= 6) ||
                            (quarter === 'Q3' && reportMonth >= 7 && reportMonth <= 9) ||
                            (quarter === 'Q4' && reportMonth >= 10);
                    });

                if (report) {
                    report.type = 'quarterly';
                } else {
                    console.log('No quarterly report found for the specified timeline.');
                }
            }

            console.log('getDataBySymble t1 ', timeline, report ? report.type : 'none', report ? report.fiscalDateEnding : 'none');

            if (report) {
                console.log('Report:', report);
                if (callback) {
                    callback(createNodesAndLinks(report, symbol));
                }
            } else {
                console.log('No report found for the specified timeline.');
            }

        } catch (error) {
            console.error('There was an error fetching the financial report:', error);
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