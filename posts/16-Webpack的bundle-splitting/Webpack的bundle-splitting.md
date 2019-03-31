---
title: "Webpack的bundle-splitting"
date: "2019-03-30"
description: "Webpack的包拆分，指的是拆分最终打包出来的包，从而优化资源加载。在此记录，如何通过Webpack的SplitChunks达到包拆分的目的。"
---

在打包React文件时，如果只有一个入口，在不利用代码拆分的方式下，最后的打包出来会只有一个文件。拆分包，则是把这一个最终的包拆分为多个。拆分包带来的好处是，如果将一个包拆分为"业务包"和"依赖包"后，浏览器会加载两个包，在业务包被更新后，可以利用浏览器缓存，无需再下载依赖包，只需下载业务包即可完成整个展示。

拆分包，对于浏览器的第一次加载不一定有好处，因为需要从加载一个包变成加载多个包。但是当用户频繁访问一个网站时，拆分包的好处便展示出来了，它可以利用浏览器缓存，无需加载已缓存且未变化的包，从而增加二次加载的速度。

------

#### 场景

先整体看一下webpack的包拆分情况：

- 在webpack中设置一个入口，在不做其他设置、代码中没有异步引用的情况下，打包出来的内容一般是一个chunk。如果设置多个入口文件，则会打包出多个chunk，比如下面配置，打包出来是`a.budnle.js`和`b.bundle.js`。

```javascript
entry:{
    a:'./src/a.js',
    b:'./src/b.js'
},
output:{
    filename:'[name].bundle.js',
    path:path.resolve(__dirname,'dist')
}
```

- 如果只有一个入口，代码或webpack配置进行变更，可能会产生多个chunk。产生多个chunk可以通过改变webpack的`optimization.splitChunks`配置项实现，也可以通过异步导入的方式实现（其实对应的是`optimization.splitChunks.chunks = 'async'`）。

- 如果有多个入口，但是多个入口的文件中，引入了相同的文件，则可以把这个相同文件提取出来，作为公共共享包，从而避免一个文件的多次加载。

可以通过设置`optimization.splitChunks`来设置webpack的包拆分方式

------

#### splitChunks默认配置

```javascript
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

------

#### chunks值

chunks的取值可以是`async`、`initial`、`all`三个值中的一个。下面参照 [Webpack4-神奇的SplitChunks插件](<https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0>) 这篇文章，对这三个值做一个解释。

- 第一种情况下，设置值为`async`：只有异步加载的包才会被放在一个新的chunk中

  - 此时，a和b中，lodash都是采用的异步加载，所以他们会被放在一个新的chunk中(`0.bundle.js`)
  - a中，jquery和react都是同步加载的，所以 `a.bundle.js`中把 jquery和react都放进了包里面
  - b中，jquery是同步加载的，所以`b.bundle.js`中包含了jquery，但是因为react是异步加载的，所以react被放入到了一个新的chunk(`1.bundle.js`)中
  - 注意到，此时jquery既存在于 `a.bundle.js`中，也存在于`a.bundle.js`中，也存在于`b.bundle.js`中

- 第二种情况下，设置值为`initial`：此时，对异步加载的包不做限制，但对于每个入口，首次加载时，所有的内容需要在一个包中

  - a和b中，lodash都是异步加载，所以被放在新的chunk中(`0.bundle.js`)
  - a和b中，jquery都是同步加载的，但是由于它同时在a和b中，超过了splitChunks中默认的`minChunks:2`，也就是说，它会被重新重新提取出来，到一个公共共享chunk中(`verdor~a~b.bundle.js`)。此时如果更改一下`minChunks`的值，如下，改为3。此时打包出来的情况，jquery会既在a的chunk中，也在b的chunk中

  ```javascript
  splitChunks:{
      cacheGroups:{
        vendor:{
          test:/[\\/]node_modules[\\/]/,
          chunks:'initial',
          minChunks: 3,
       },
    }
  }
  ```

  - a中，react是直接引用的，因为有`vendor`的test设置，所以遇到`node_modules`中的包，都会被分出来，于是a中的react被放在了`vendor~a.bundle.js`中。而b中的react是异步引入的，所以被放在一个另外的文件`1.bundle.js`中

- 第三种情况下，设置值为`all`：不在意异步加载或同步加载，对所有包进行自动优化
  - 此时，react、jquery和lodash都在单独的chunk中
  - react在a中同步，在b中异步，所以react到了一个单独的文件中(`0.bundle.js`)
  - lodash被两个文件异步加载，也到了另外一个单独文件中(`1.bundle.js`)
  - jquery被两个文件同时同步加载，所以它到了一个公共共享的chunk中(`vendor~a~b.bundle.js`)

另外，在文章中，所有的配置都是下面形式的，但是它是等价于下面代码形式的

```javascript
//配置1
splitChunks:{
  // chunks:'initial',
  cacheGroups:{
    vendor:{
      test:/[\\/]node_modules[\\/]/,
       chunks:'initial',
    }
  }
}
  
// 在没有其他配置的情况下，等价于

//配置2
  splitChunks:{
     chunks:'initial',
  }
```

等价的原因是，splitChunks 有默认的`vendors`设置，你会发现，如果是用配置1，则所有的共共享chunk名字都是以`vendor`开头，而使用配置2，所有的共享包，都会以`vendors`开头。配置1覆盖了默认的`vendors`配置，而配置2则没有覆盖，所以都是以默认的`vendors`配置走的。

------

#### 其他配置项

- minChunks：默认为2，表示，当文件的被引用次数 >= 2 时，被拆分为一个单独的chunk
- maxAsyncRequests：按需加载chunk时，最大平行请求数
- maxInitialRequests：对一个入口，最大平行请求数
- minSize：当产生的chunk大于这个值时，才会成为一个chunk
- name：chunk的名字

------

#### cacheGroups:

- test:  检测哪些包应该被放入chunk中，例如正则表达式`/node_modules/`，表示，在引入包的时候，引入路径里面包含`/node_modules/`，则这个包符合这个`cacheGroups`的考虑范畴。至于是否被放入到chunk中，需要视`chunks`的值而视。
- splitChunks层级设置的`chunks`、`minChunks`等值，同样适用于`cacheGroups`，`cacheGroups`值会覆盖`splitChunks`中的值。而`cacheGroups`中未设置的值会向上在`splitChunks`下寻找，若也找不到，则使用默认值。
- priority：如果一个文件同时满足多个`cacheGroups`，则根据此配置决定进入那个`cacheGroups`指定的chunk
- enforce：enforce为true，则可以强制chunk被拆分出来。如果需要这个包被强制拆分时会很有用，比如，默认情况下，`splitChunks.minSize=30000`，也就是说一个chunk的大小达到30k的时候，webpack才会把它真的形成一个chunk，否则会把它放在其他chunk中。这个时候设置enforce为true，则可以使包忽略这些设置，强制让它成为一个新的chunk。

------

#### 参考

- [Bunlde Splitting](<https://survivejs.com/webpack/building/bundle-splitting/>)
- [Webpack 4 — Mysterious SplitChunks Plugin](<https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0>)
- [The 100% correct way to split your chunks with Webpack](<https://hackernoon.com/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758>)
- [Webpack (v4) Code Splitting using SplitChunksPlugin](<https://itnext.io/react-router-and-webpack-v4-code-splitting-using-splitchunksplugin-f0a48f110312>)
- [SplitChunksPlugin](<https://webpack.js.org/plugins/split-chunks-plugin/>)