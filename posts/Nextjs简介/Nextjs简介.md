---
title: "Nextjs简介"
date: "2019-02-17"
description: "以一个项目为基础，简要介绍 Next 框架中的一些概念和简单使用方式"
---

本文基于的项目来自Next的官方教程，地址为：https://github.com/arunoda/learnnextjs-demo.git ，采用`clean-url-ssr`分支。

---

#### 几个主要的概念

##### 渲染方式

Next 结合了服务端渲染和客户端渲染。首屏加载时采用服务端渲染，之后若用户点击链接进入到新的页面，对新的页面则使用客户端渲染。

##### 服务端渲染

Next 中，首次请求采用的服务端渲染。服务端渲染指的是，在服务端生成 html 字符串，然后传递给客户端，客户端解析并展示从服务端获取的内容，并进行[hydrate](https://reactjs.org/docs/react-dom.html#hydrate)，增加事件处理等。服务端渲染，又可以分为两种方式：

- 一种是采用 Next 自身的路由框架，直接在`page`文件夹中增加页面，请求的页面路径直接渲染出`page`文件夹下的页面。例如，在`/pages/index.js`中定义以下组件并导出，则可以直接在`localhost:3000`中看到通过服务端渲染展示出的页面，页面中只有一个`Hello world!`。

```jsx
export default ()=> <p>Hello world!</p>
```

- 另一种是自定义路由。通过 express 自定义路由，自定义路由会通过express框架的`res.render`进行服务端渲染，然后将结果返回给客户端，客户端直接呈现服务端渲染结果。比如[模板项目中的一个例子](https://github.com/arunoda/learnnextjs-demo/blob/4482c6e0f16acea394a7f632ce2cd1e29a492779/server.js#L15)

##### 客户端渲染

在首页加载完成后，用户点击某个链接，导向新的页面，此时则加载对应页面的 JS 文件，将JS 下载客户端后，在客户端进行渲染，展示页面内容。此时不再通过服务端生成页面，而是客户端加载 JS 并生成页面。

> Next 中的客户端加载是通过`Link`组件来完成的，通过在页面中使用`Link`组件，则可以是页面拦截直接的服务端请求，转而采用加载 JS，并进行客户端渲染。若直接使用`a`标签，则相当于直接转向新的页面，则此时还是会重新请求服务端，进行服务端渲染。

##### 页面兼容两种渲染方式

如上所述，由于 Next 将首页采用服务端渲染，而用户可能在每个页面进行刷新，此时这个页面则成为加载的首页，此时页面必须能够被进行服务端渲染，从而完成首页加载；而另一方面，每个页面都可能由另外一个页面从客户端点击后链接导入而来，此时页面则必须能够进行客户端渲染。综上，每个页面都必须兼容服务端渲染和客户端渲染方式。而 Next 中的页面天然具有这种能力。

--- 

#### 数据获取

Next 定义了`getInitialProps`方法进行数据获取，它是一个静态方法，例子如下，

```jsx
//  /pages/post.js
const Post = (props) => (
  return <Layout>
    <h1>{props.show.name}</h1>
    <p>{props.show.summary.replace(/<[/]?p>/g, '')}</p>
    <img src={props.show.image.medium} />
  </Layout>
)

Post.getInitialProps = async function (context) {
  const { id } = context.query;
  const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
  const show = await res.json();
  return { show }
}

export default Post;
```

- 服务端渲染。若请求 post，并进行服务端渲染，则服务端会先查看Post 是否有定义`getInitialProps`方法，若有定义此方法，则使用定义的方法请求数据，并将数据放置在一个服务端渲染出的 html 页面中的一个script 标签中（如下所示）。客户端加载 html 后会将此数据渲染进视图。

```html
<script id="__NEXT_DATA__" type="application/json">
{"props":{"pageProps":{"show":1}},"page":"/post","query":{"id":"900"},"buildId":"development"}
</script>
```

- 客户端渲染。在进行客户端渲染时，渲染页面，会先通过`getInitialProps`请求数据，并将请求到的数据通过 props 传递给组件，组件进行对应渲染。

--- 

#### 数据传递

在页面跳转时，若需要传递数据，比如在列表页，点击某个链接，跳转至其详情页，则在详情页需要知道，需要展示哪个内容的详情，此时则需要传递给详情对应数据。在列表页，跳转如下

```jsx
<Link as={`/p/${show.id}`} href={`/post?id=${show.id}`}>
	<a>{show.name}</a>
</Link>
```

则在详情页，获取此 id 的方式为：

- 对于组件，通过 `withRouter`，在`router.query`中获取，如下

```jsx
const Content = withRouter((props) => (
  <div>
    <h1>{props.router.query.title}</h1>
    <p>This is the blog post content.</p>
    <p>Content props:{JSON.stringify(props)}</p>
  </div>
))
```

- 对于`getInitialProps`方法，通过`context`方式获取，如下

```jsx
Post.getInitialProps = async function (context) {
  const {id} = context.query;
  const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
  const show = await res.json();
  console.log(`Fetched show:${show.name}`)
  return {show}
}
```

当然，这两种方式获取的数据是相同的。

若采用自定义路由（如下代码），在对应页面，也可以通过上面的方式通过`router.query`和`context.query`获取`queryParams`中的数据。

```javascript
server.get('/p/:id', (req, res) => {
    const actualPage = '/post'
    const queryParams = { id: req.params.id }
    app.render(req, res, actualPage, queryParams)
})
```

