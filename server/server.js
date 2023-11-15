const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Alpha Vantage API的基础URL和API密钥
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_API_KEY = 'DOYKTPSPSFMC7904';

app.use(express.json());

app.get('/financialReport', async (req, res) => {
    const { companyName } = req.query;
    if (!companyName) {
        return res.status(400).send('Company name is required.');
    }

    try {
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'SYMBOL_SEARCH',
                keywords: companyName,
                apikey: ALPHA_VANTAGE_API_KEY
            }
        });

        const bestMatches = response.data.bestMatches;
        let message = "我们找到了以下公司，请回复数字选择您想要查看的公司:\n";
        const companies = bestMatches.map((match, index) => {
            const companyInfo = {
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                marketOpen: match['5. marketOpen'],
                marketClose: match['6. marketClose'],
                timezone: match['7. timezone'],
                currency: match['8. currency'],
                matchScore: match['9. matchScore']
            };
            // 为每家公司添加一个编号并生成消息
            message += `${index + 1}. ${companyInfo.name} (${companyInfo.region})\n`;
            return companyInfo;
        });

        // 存储公司信息以备后续使用
        // 这里需要一种方法来跟踪用户的会话和选择，可以使用数据库或内存存储
        // ...

        // 将生成的消息返回给用户
        res.send({ message, companies });
    } catch (error) {
        console.error('Error fetching data from Alpha Vantage:', error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
