---
title: "React的code-splitting"
date: "2019-03-29"
description: "代码拆分能够让App避免加载用户不会用到的代码，减少在首次加载时需要下载的代码量。在此记录一下React的代码拆分方法。"
---

在打包时，当第三方包过多时，如果把这些包全部都打包到一个文件中，则很有可能会导致这个文件过大，加载过慢。在这种情况下，就要考虑把代码进行拆分打包。代码拆分是指，类似于 Webpack 或 Browserify等打包器支持的，把代码打包至多个包中，在应用运行时进行动态加载的打包方式。

代码拆分能够让 App 只加载现在需要的内容，从而加快 App 的加载速度，并且可以避免加载用户不会用到的代码，减少在首次加载时需要下载的代码量。

------



#### 动态import

- 动态`import()`语法，基本写法如下。当 Webpack 遇到这类语法时，它会自动将 App 进行拆分。动态加载语法暂时只是 ECMAScript 的提案，并不是标准。

```jsx
import("./math").then(math => {
  console.log(math.add(16, 26));
});
```

##### Create React App

- 如果你使用 Create React App 或者 Next.js ，则这种功能已经被配置好了，你能够直接使用。

##### Webpack

使用 Webpack 自行配置，大致配置如下

```javascript
const path = require('path');

module.exports = {
    mode:'development',
    entry:{
      index:'./src/index.js',
    },
    output:{
      filename:'[name].bundle.js',
      chunkFilename:'[name].bundle.js',
      path:path.resolve(__dirname,'dist')
    },
}
```

```javascript
function getComponent() {
  // 指定 webpackChunkName，即webpack.config.js中的 name，若不指定，生成包默认会命名为 0.bundle.js
  return import(/* webpackChunkName: "lodash" */ 'lodash').then(({ default: _ }) => {
    var element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;

  }).catch(error => 'An error occurred while loading the component');
}

// getComponent()返回一个 promise
getComponent().then(component => {
  document.body.appendChild(component)
})
```

- 注意，`import()`内部采用 promise，所以它会返回一个promise，需采用 promise 进行后续处理

##### babel

- 如果项目中使用了 babel做转义，则需要用到[babel-plugin-syntax-dynamic-import][https://yarnpkg.com/en/package/babel-plugin-syntax-dynamic-import]插件来转义动态`import`。现代项目中一般都会使用babel，所以一般都先安装这个插件，才能做动态导入，否则会无法识别动态`import`语法而报错

------

#### React.lazy + Suspense

使用方法示例：

> 注意，React.lazy 和 Suspense 在服务端暂时不支持，如果相对服务端应用做代码拆分，推荐使用 [Loadable Components][https://github.com/smooth-code/loadable-components]

```jsx
import React from 'react';

const OtherComponent = React.lazy(()=>import('./OtherComponent'))

const App = () =>{
  return (
    <div>
      <React.Suspense fallback={<div>loading</div>}>
        <OtherComponent/>
      </React.Suspense>
    </div>
  )
}

export default App;
```

需要注意的点：

- lazy 和 Suspense都位于`react`包中
- 在打包的时候，会把`OtherComponent`打包如另外一个包中，当`OtherComponent`被渲染的时候，会自动加载`OtherComponent`并渲染它
- `React.lazy`必须调用一个动态`import()`，而这个动态import返回一个Promise，这个Promise被resolve为一个模块，这个模块中是一个有`default`导出的React组件
- 如果`React.lazy`加载的组件还没有加载成功或还没有被渲染到页面上，页面上会展示`Suspense` `fallback`中的组件，作为一个加载指示器。`fallback`中可以放任何组件。`Suspense`中也可以放置多个`lazy`加载的组件。

###### React.lazy + Supsense + Router

通过lazy动态导入组件，一个比较好的地方是路由，示例如下：

```jsx
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
      </Switch>
    </Suspense>
  </Router>
);
```

##### 命名导入

`React.lazy`现在只支持`default`导出。非`default`导出的组件，可以采用创建一个文件然后导入组件再导出的方式，例如：

```jsx
// ManyComponents.js
export const MyComponent = /* ... */;
export const MyUnusedComponent = /* ... */;
```

```jsx
// MyComponent.js
export { MyComponent as default } from "./ManyComponents.js";
```

```jsx
// MyApp.js
import React, { lazy } from 'react';
const MyComponent = lazy(() => import("./MyComponent.js"));
```

------

#### 扩展

- 通过 Webpack 多`entry`的方式进行代码拆分，如下：

```javascript
const path = require('path');

module.exports = {
    mode:'development',
    entry:{
      // 设置两个入口文件
      index:'./src/index.js',
      another:'./src/another-module.js'
    },
    output:{
      filename:'[name].bundle.js',
      path:path.resolve(__dirname,'dist')
    },
    optimization:{
      // 设置splitChunks，将两个包的共同代码提取到一个包中
      splitChunks:{
        chunks:'all'
      }
    }
}
```