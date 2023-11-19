import express from 'express';
import { showCompany } from './showFinancialReport.js';

const app = express();
const port = 3034;

// 提供public目录下的静态文件
app.use(express.static('public'));
app.use('/data-private', express.static('data-private'));


app.get('/Company', (req, res) => {
    showCompany('google', 'Alphabet', '2022');
});


app.listen(port, () => {
  console.log(`服务器正在 http://localhost:${port} 上监听`);
});

