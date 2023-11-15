const express = require('express');

const app = express();
const port = 3034;

// 提供public目录下的静态文件
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`服务器正在 http://localhost:${port} 上监听`);
});
