---
title: "babel基础概述"
date: "2019-03-05"
description: "配置babel前必须了解的babel基础知识，包括plugins、preset以及常用的plugins、preset"

---

- babel 可以通过`.babelrc`、`babel.config.js`或`package.json`中的`babel`字段进行配置
- 以`.babelrc`为例，设置最常用的`presets`和`plugins`两个配置项：

```javascript
{
   "presets": [
      ["presetsA",{"presetsAOptions":"presetsAValue"}]
      ...
   ],
  "plugins":[
      ["pluginsA",{"pluginsAOptions":"pluginsAValue"}]
      ...
  ]
}
```

- 更多配置项可以见[babel文档](https://babeljs.io/docs/en/options)

------


#### plugins

- babel 是一个编译器，它接受代码，经过对应语法转义后输出代码。而babel 的语法转义是通过 plugin实现的，plugin 会指导babel 对相应 JavaScript 程序进行编译，比如`@babel/plugin-transform-arrow-functions`，可以将箭头函数转化为ES5的非箭头函数，如下面代码。babel 的语法转义功能，即将目标环境无法识别的语法，转化为对应可以识别的语法，从而使一些更高级的语法功能能够在目标环境中运行。

```javascript
const fn = () => 1;

// converted to

var fn = function fn() {
  return 1;
};
```

- plugin 分为`transform plugins`和`syntax plugins`，`transform plugins`会包含对应的`syntx plugins`，它会识别并解析高级语法，并转化为目标环境能够识别的语法，比如上面箭头函数的例子。`syntx plugins`只能够使 babel 能够解析对应语法，但并不能转化他们。
- babel 的`transform plugins`列表可见：https://babeljs.io/docs/en/plugins
- 我们也可以自定义plugin，来转化我们想转化的语法。可以参考：
  - [babel自定义插件简介](https://itnext.io/introduction-to-custom-babel-plugins-98a62dad16ee)
  - [babel插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)

------



#### preset

- 在我们的项目中，因为有很多需要转化的点，比如 ES6的一堆功能，一个一个的添加插件会显得非常困难，这个是时候就有了 preset。preset 是一个插件包，里面有预设好的一堆插件。我们自己也可以自定义 preset，将一些插件以我们想要的方式进行排列，并进行共享。
- 常见比较常用的preset 有：@babel/preset-env

------



#### plugins和 preset 执行顺序

babel 会按照配置文件中指定的 plugins 和 preset 来转化代码，plugins 和 preset 的执行顺序如下：

- 先执行 plugins，然后执行 preset
- plugins 列表，按照从前往后的顺序执行
- preset 列表，按照从后往前的顺序执行

------



#### polyfill

- [@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill)模块中包含了`core-js`和一个自定义的`regenerator runtime`来模拟 ES2015以上的 JavaScript 允许环境。它可以帮助你 polyfill 一些 ES2015及以上的功能，比如内建的`Promise`、`WeakMap`，静态方法`Array.from`、实例方法`Array.prototype.includes`，以及生成器函数。

- 注意，因为 polyfill 是需要在生成环境被使用的，所以需要按照`npm install --save @babel/polyfill`的方式进行安装

- 使用方式：

  - 单独手动引入。手动引入又分为 **在项目入口文件处整体引入** 和在 **使用时引入引入特定模块**

  ```javascript
  // 整体引入
  require("@babel/polyfill"); 
  
  // 通过 webpack 的方式整体引入
  module.exports = {
    entry: ["@babel/polyfill", "./app/js"],
  };
  
  // 引入特定模块
  require("core-js/modules/es.promise.finally"); 
  ```

  - 通过 `@babel/preset-env`引入，见下面对`@babel/preset-env`的介绍。
  - 通过`@babel/plugin-transform-runtime`引入，这种引入方式能够做到不影响全局变量，但是以这种方式引入后，无法引用实例方法，比如`Array.prototype.includes`

------



#### @babel/preset-env

- 在这个 preset 中包含了所有支持现代 JavaScript（包括ES2015、ES2016等）的插件。
- 设置`useBuiltIns："usage"`后，babel 会探测你代码中使用到的，但是目标环境中缺失的功能，并引入对应的这个 polyfill，而不是整个 polyfill 文件。从而减少包的体积。



##### 原理

- `@babel/preset-env`会将代码的指定目标运行环境，通过一些数据源对应为在目标环境中运行相应代码所需要的语法及功能，然后将这些语法和功能对应为对应所需的插件和 polyfill，从而通过这些插件和 polyfill，将代码转化为可以在目标环境中允许的代码
- 可以通过`.browserlistrc`指定代码的目标运行环境，`.browserlistrc`的配置方式可以参考[browserlist项目](https://github.com/browserslist/browserslist#queries)，如果没有找到`.browserlistrc`文件，则会使用[默认配置](https://github.com/browserslist/browserslist#queries)



##### @babel/preset-env和@babel/polyfill

通过`@babel/preset-env`可以引入`@babel/polyfill`：

- 指定`useBuiltIns: 'usage'`后，不需要再显性`require`或`import` `@babel/polyfill`。但是注意`@babel/polyfill`还是需要被安装。设置后，babel 会在需要时，独引用`@babel/polyfill`的特定 polyfill，而不是整个polyfill
- 多次引入`@babel/polyfill`会造成一些不可预知的问题。如果指定`useBuiltIns: 'entry'`，任需在使用到的地方手动通过通过`require`或`import` `@babel/polyfill`，但是它会将所有的 `import "@babel/polyfill"`或 `require("@babel/polyfill")` 根据环境，转化为一个单独的引入。
- 如果`useBuiltIns`未被指定或被显性指定为 false，则需要在手动显性引入`@babel/polyfill`



##### forceAllTransforms参数

- 默认为 false，此时会按照目标运行环境执行对应转化
- 如果设置为true，此时会强制执行所有可能的转化，如果目标代码需要执行UglifyJS 或执行在一个只支持ES5的环境中，则这个参数会很有用

------



#### @babel/plugin-transform-runtime

##### 作用

- babel 会使用一些工具函数，比如`_extend`，这些工具函数基本上会在每个文件中被使用到，导致在每个文件中，都需要去定义这些工具函数。而` @babel/plugin-transform-runtime`会使所有的工具函数都去引用`@babel/runtime`，这样就避免了不断去重复定义这些工具函数。
- 另一个作用是，为代码创建一个沙箱环境。如果使用`@babel/polyfill`，它会提供一些类似`Promise`、`Set`的功能，这些功能的实现会污染全局环境，当你需要发布某个库时，这就会成为一个问题。这个插件可以解决这个问题，具体可见：https://babeljs.io/docs/en/babel-plugin-transform-runtime#technical-details。

##### 使用

- 开发环境

```bash
npm install --save-dev @babel/plugin-transform-runtime
```

- 生成环境需要安装`@babel/runtime`作为

```bash
npm install --save @babel/runtime
```



##### 引入 polyfill

- 对于 babel 7.0及以上，移除了原有的`polyfill`参数，此时，通过`@babel/plugin-transform-runtime`引入 polyfill 的方式是，在配置文件中指定`corejs`为2，并采用`@babel/runtime-corejs2`。

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs":2
      }
    ]
  ],
}
```

```bash
npm install --save @babel/runtime-corejs2
```

- 需要注意的是，这种方式引入的 polyfill，无法使用实例方法，如`"foobar".includes("foo")`



##### 使用async和 await

- `@babel/plugin-transform-runtime`中，参数`regenerator`可以指定是否转化生成器函数，指定为 true（默认也是 true）时，可以转化`async`和`await`

------



#### @babel/preset-stage-x

- babel7 已经去除了所有的`@babel/preset-stage-x`，相关信息可以在[去除Babel 的Stage Presets](https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets)这篇文章中获取到
- 简单来说，`@babel/preset-stage-x` 使很多用户能干哟用上一些 proposal 的功能的同时，让大家误以为这些 proposal 的功能就是标准，最后造成了一些迁移以及处理上的麻烦，所以在babel7中将 stage 的 preset 去除了

