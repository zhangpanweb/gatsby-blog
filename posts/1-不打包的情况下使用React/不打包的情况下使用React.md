---
title: "不打包的情况下使用React"
date: "2018-12-01"
description: "总结自React官方文档：https://reactjs.org/docs/add-react-to-a-website.html，如何在不用webpack等打包工具的情况下使用React"
---

##### 不使用 JSX

直接在页面中以 script 的方式引用react和 react-dom 的 CND 代码

```html
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
```

此时，无法解析 JSX，故需要使用 React.createElement 的方式来创建组件，具体示例可见：https://gist.github.com/gaearon/6668a1f6986742109c00a581ce704605

---


##### 直接在页面中使用 JSX

在页面上引用 babel的包代码

```html
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
```

在 html页面的 JS 代码中将 script 的 type 置为 `type="text/babel"`，JS 代码写在这个特殊 script 中

在这种方式下：

1、此时无法通过这个 script 引用外部 JS 文件，因为设置 type 后这个 script 已经不是一个作用为引用 JS 的script 标签了

2、JSX 的编译发生在浏览器中，所以页面加载速度慢，所以它不适合用在生产环境中
--- 


##### 实时编译 JSX

安装 babel-cli@6 和 babel-preset-react-app@3，通过 babel --watch 的功能进行实时编译，将文件编译为浏览器可以直接执行的文件，html 中直接引用编译后的文件