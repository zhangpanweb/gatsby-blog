---
title: "配置一个基本的React项目"
date: "2019-03-07"
description: "从0开始，配置一个最基本的React项目，内容包括：建立最基本的express服务器、webpack配置、babel配置等"

---


配置一个最基本的 React 项目，大概分为一下几个部分：

- 后端，使用`express`快速构建一个服务器
- 采用 webpack 进行打包
- 采用 babel 作为语法转义
- 构建好的项目文件目录如下：

```
/dist
	- bundle.js   // 打包后的js文件
	- bundle.map.js  // source-map文件
/entry
	- index.jsx  // React项目住入口
/node_modules
/pages
	- App.jsx
	- app.less
/views
	- index.html
.babelrc
app.js
package-lock.json
package.json
webpack.config.js
```

---

#### webpack

最终配置如下：

```javascript
const path = require('path');

module.exports = () => ({
  mode: 'development',
  entry: {
    app: path.resolve(__dirname, './entry/index.jsx')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  module: {
    rules: [
      {
        test: [/.js$/, /.jsx$/],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.less$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'less-loader'
        }]
      }
    ]
  },
  watch: true,
  devtool: 'source-map'
})
```

各方面解释如下：

- 设置入口文件为`./entry/index.jsx`
- 打包后输出文件位置为`./dist`，文件名称为`bundle.js`
- 指定`resolve.extensions`为`['.jsx', '.js']`，从而在文件引入的时候可以不带上后缀，如`import App from '../pages/App'`，此时`../pages/App`会按照`../pages/App.jsx`的方式去查找，若找不到，再按照 js 的后缀去查找，再找不到就会报错
- module 中对对应文件进行编译



##### js 和 jsx 文件的编译

首先是对于`.js`和`.jsx`的文件，采用`babel-loader`进行 babel 编译。其主要目的是转义`jsx`语法和`es6`及其以上的语法，具体 babel 配置见下面 babel 配置方面



##### less 文件的编译

对于 less 文件，依次采用了`less-loader`、`css-loader`和`style-loader`进行处理，这三个 loader 的作用如下：

- `less-loader`：将 less 语法编译为 css
- `css-loader`：css-loader 的使用，允许你在 less 文件或 css 文件中采用`@import`和`url()`加载其他文件，与采用`import`和`require`类似，css-loader 回去解析它们
- `style-loader`：将 css 文件已`<style>`标签的形式插入到html 文件的 DOM 中，从而使样式生效

------



#### babel

babel 的配置，主要有两方面作用：

- 转义`jsx`语法
- 转义`es6`及以上的语法为 es5，使其能够在低版本浏览器中运行

最终的配置文件如下：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "forceAllTransforms": true
      }
    ],
    [
      "@babel/preset-react"
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
    ]
  ]
}
```

使用到的 preset 及 plugins 解释如下：

- `@babel/preset-env`：根据目标运行环境来转化es6及以上代码，使其能够在目标环境中运行。目标环境可以通过`.browserlistrc`或`package.json`中的`target`字段指定，若未指定，则采用默认配置
  - 设置`"useBuiltIns": "usage"`，若代码中采用了 es6及以上的高级功能，babel 会自动引入对应的`polyfill`
- `@babel/preset-react`，转义 React 的 `jsx`语法的相关内容
- `@babel/plugin-transform-runtime`：生成沙箱环境，是的各类 polyfill 不影响全局变量，并减少包的体积

------



#### 主文件

- 入口文件`./entry/index.jsx`：

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

import App from '../pages/App';

ReactDOM.render(<App />, document.getElementById('root'));
```

- `./pages/App.jsx`：

```jsx
import React from 'react';
import './app.less';

const App = ()=> (
  <div className="hello">Hello world!</div>
)

export default App;
```

配置后之后，使用 webpack 打包，即可看到`./dist`文件夹中生成了`bundle.js`文件。

------



#### 后端及 index.html

##### 所需文件

- 后端采用 express 架设简单服务器

```javascript
const express = require('express');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || '3100';

app.use(express.static('dist'));

app.get('/', async (req, res) => {
  const page = fs.readFileSync('./views/index.html');
  res.end(page);
})

app.listen(PORT, () => {
  console.log(`Server has been listening on ${PORT}`);
})
```

- `./views/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>common-react-config</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <div id="root"></div>
    
    <script type="text/javascript" src="/bundle.js"></script>
  </body>
</html>
```

- `package.json`中加入`start`脚本

```json
"start": "webpack & nodemon app.js",
```

执行`npm start`即可在`localhost:3100`中看到`Hello world!`

##### 流程

- 请求`localhost:30000`，请求进入`app.js`中后，后端会读取`./views/index.html`并返回给前端

```javascript
app.get('/', async (req, res) => {
  const page = fs.readFileSync('./views/index.html');
  res.end(page);
})
```

- 前端接收到请求后，会进行解析，并根据`<script>`请求`bundle.js`文件

```html
<script type="text/javascript" src="/bundle.js"></script>
```

- 对于`bundle.js`的请求，会在服务器端静态服务器处找到`bundle.js`文件，并返回此文件

```javascript
app.use(express.static('dist'));
```

- 前端收到 `bundle.js`文件后，执行对应 js，并渲染出`Hello world!`



