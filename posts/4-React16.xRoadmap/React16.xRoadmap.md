---
title: "React16.xRoadmap"
date: "2018-12-16"
description: "此文翻译自React官方博客:https://reactjs.org/blog/2018/11/27/react-16-roadmap.html。在博客中，作者讲述了React16之后的发展路线"

---


你可能已经在之前的博客和视频中听说过有关于“Hook”、“Suspense”、“Concurrent Rendering”这些功能。在这篇博客中，我们将关注这些功能如何整合在一起以及在 React 的未来版本中这些功能达到可使用程度的时间线。

--- 

#### tl;dr

我们计划把 React 的新功能拆分为以下几个里程碑：

- React16.6 推出 “代码拆分的 Suspense”
- 16.x 的某个小版本发布 React Hooks（到 2019 年第一季度）
- 16.x 的某个小版本发布并发模式
- 16.x 的某个小版本发布“数据获取的 Suspense”

（这篇博客的原来版本用的是精确的版本号，但是被改为现在的样子，来反应，在这些版本之间可能需要一些其他小版本的积累来达到这一一个版本）

上面只是预估，详细情况可能会随着时间的流逝而有所变化。在 2019 年我们计划至少有两个项目，他们需要更多探索，还没有具体的发布计划：

- Modernizing React DOM
- Suspense for Server Rendering

我们期待在接下来的几个月中对于这些项目的时间线有进一步的确定。

--- 

#### 发布时间线

我们会有一个单独的版本来把这些功能整合到一起，但是我们会在每个功能已经准备好的情况下进行发布，这样你就可以尽快使用它们。单独看某个功能，API 的设计可能看不出什么，这篇博客会展示我们计划的主要部分，来帮助你有一个整体的把握。

逐步发布的策略有助于我们重新定义 API，但是，在过渡时期，某个没有完全完善的功能可能会造成部分疑惑。让我们来看看这些不同的功能对你的 App 来说有什么意义，他们是如何互相关联的，以及你可以在什么时候学习并使用它们。

##### React16.6（已发布）：代码拆分的 Suspense

*Suspense*指的是 React 的新功能，当组件在等待某些内容时，它能够暂停渲染，并展示一个加载指示器。在 React16.6 中，Suspense 只支持一种用户场景：使用`React.lazy()`和`<React.Suspense>`进行组件的懒加载。

```jsx
// This component is loaded dynamically
const OtherComponent = React.lazy(() => import("./OtherComponent"));

function MyComponent() {
  return (
    <React.Suspense fallback={<Spinner />}>
      <div>
        <OtherComponent />
      </div>
    </React.Suspense>
  );
}
```

使用`React.lazy()`和`<React.Suspense>`进行代码拆分在  [代码拆分指南](https://reactjs.org/docs/code-splitting.html#reactlazy)中有所描述，你也可以在 [这篇文章](https://medium.com/@pomber/lazy-loading-and-preloading-components-in-react-16-6-804de091c82d) 中知道其他实际解释。

代码拆分是 Suspense 的第一步。对 Suspense 的长期计划也包括让它来处理数据获取的问题（与 Apollo 类似的库进行整合）。除了提供一个更加方面的编程模式外，Suspense 还在并发模式中提供更好的用户体验，在下面的有关话题中我们会提到更多内容。

**在 React DOM 中的状态**：React16.6.0 及更高版本可用

**在 React DOM Server 中的状态**：在服务器渲染中，Suspense 暂时不可用。我们已经开始在研究新的异步服务端渲染，它包含对 Suspense 的支持。但那是一个大计划，得到 2019 年才能完成。

**在 React Native 中的状态**：打包的拆分在 React Native 中并没有很大作用，但是在技术上，当给模块一个 promise 时，没有什么能够阻止`Reacct.lazy`和`<Suspense>`起作用。

**建议**：如果你进行客户端渲染，我们推荐你广泛使用`Reacct.lazy`和`<Suspense>`进行代码拆分。如果你进行服务端渲染，则你不得不等到新的服务端渲染完成后才可以采用。

##### React 16.x（到 2019 年第一季度）：Hooks

*Hooks*让你可以在函数组件中使用 state 和生命周期等功能。他们也让你在不增加额外套嵌的情况下在组件间复用状态逻辑。

```jsx
function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

自 11 月份开始已经在 Facebook 内部开始使用 Hooks。Hooks 在 React16.7 的 alpha 版本中可用。他们的 API 距离最终确定时可能会有些变化。

Hooks 代表了我们对未来 React 的预期。它既直接解决了 React 的用户体验问题（再渲染属性时的“层层包裹地狱”和高阶组件，生命周期方法的逻辑复用），也解决了我们在优化 Reac 时遇到的问题（比如说使用编译器内敛组件的困难）。Hooks 没有使类失效。但是，如果 Hooks 发展顺利，在未来的某个大版本中，我们可能会把对类的支持单独拆分到一个包中，以保持 React 默认包的精简。

**在 React DOM 中的状态**：支持 Hooks 的第一个`react`和`react-dom`版本是`16.7.0-alpha.0`。我们预计在接下来几个月中会发更多的 alpha 版本。你可以通过安装`react@next`和`react-dom@next`来试用他们。别忘记升级你的`react-dom`，不然 Hooks 不会生效。

**在 React DOM Server 中的状态**：同样的 16.7 alpha 版本的`react-dom`和`react-dom/server`有对 Hooks 的全面支持。

**在 React Native 中的状态**：暂时没有官方方法在 React Native 中使用 Hooks。如果你敢于冒险，可以采用[这篇](https://github.com/facebook/react-native/issues/21967)中提到的非官方方法。里面有一个已知待解决的问题是，`useEffect`触发过晚。

**建议**：如果你已经准备好了，我们推荐你在你写的组件中试用 Hooks。确认你团队中的每个人都赞同使用它们并且对熟悉文档。我们不推荐用 Hooks 重写现在已有的组件，除非你不管怎样都准备重写它们（例如为了修 bug 重写）。在[这里](https://reactjs.org/docs/hooks-faq.html#adoption-strategy)阅读更多使用策略。

##### React 16.x（到 2019 年第二季度）：并发模式

_并发模式_，通过在不阻塞主进程的情况下渲染组件树，使得 React 应用变得更加具有适应性。它允许 React 打断一个耗时常的渲染（比如渲染一个新的流）来处理一些高优先级的事务（比如文本输入或鼠标悬浮）。并发模式也通过在快速连接时略过不需要的状态加载来提供 Suspense 的用户体验。

> 注意：你可能在之前，听到过被称为“异步模式”的并发模式。我们已经把名字改为并发模式，来强调 React 根据不同优先级来执行任务的能力。这使它和其他异步渲染的方法能够区分开来。

```jsx
// Two ways to opt in:

// 1. Part of an app (not final API)
<React.unstable_ConcurrentMode>
  <Something />
</React.unstable_ConcurrentMode>;

// 2. Whole app (not final API)
ReactDOM.unstable_createRoot(domNode).render(<App />);
```

暂时没有与并发模式有关的文档。必须要注意的是概念模型在一开始的时候可能会让人觉得不习惯。阐述它的优点、如何使用它以及它的缺点，对于我们来说是高优先级的事情，这也是我们把它称之为稳定的前提条件。在那之前，[Andrew 的演讲](https://www.youtube.com/watch?v=ByBPyMBTzM0)是现有的最好的介绍材料。

并发模式相对于 Hooks 来说还没有经过那么多润色。有些 API 还没有确定，它们也没有按照我们的预期起作用。截止写这篇博客，我们不推荐你使用它，除非是在一些特别早期的实验中使用。在并发模式中，我们预计它没有特别多的 bug，但是需要注意的是，在`<React.StrictMode>`中产生警告的组件可能不会正常工作。另外一个需要注意的是，我们有时候会把一些在其他代码中产生的性能问题错误的归因到并发模式上。比如说，一个随便防止的`setInterval(fn,1)`调用在并发模式中会有糟糕的影响。在发布文档中，我们计划发布更多有关确认及修复这类问题的指引。

在我们对 React 的预期中，并发模式是非常大的一个组成部分。对于 CPU 充足的情况下，它能够进行无阻塞渲染，在渲染复杂组件树的同时保持应用的响应。这在我们的[JSConf Iceland talk](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)的第一部分有所演示。并发模式也使得 Suspense 表现得更好。它能够防止，在网速足够快的情况下，出现加载指示器一闪而过的情况。在没有亲眼见到的情况下，这很难解释，[Andrew 的演讲](https://www.youtube.com/watch?v=ByBPyMBTzM0)是很好的材料。并发模式依赖于主进程调度器，我们与 Chrome 团队合作，最终把这个功能移入到浏览器本身中。

**在 React DOM 中的状态**：在 React16.6 中，有一个带`unstable_`前缀的不稳定并发模式可以使用，但是我们不推荐你使用它，除非你愿意经常遇到问题或者错误一些功能。16.7 的 alpha 版本包含了不使用`unstable_`前缀的`React.ConcurrentMode`和`ReactDOM.createRoot`，但是在 16.7 中我们大概率会保留前缀，在未来的小版本中才把并发模式成为是稳定的。

**在 React DOM Server 中的状态**：并发模式不直接影响服务端渲染，它会在现有的服务端渲染模式下运行。

**在 React Native 中的状态**：现有计划是，先推迟并发模式在 React Native 中的实现，直到[React Fabric](https://github.com/react-native-community/discussions-and-proposals/issues/4)计划接近完成。

**建议**：如果你希望在未来使用并发模式，记得把一些组件子树包裹在`<React.StrictMode>`并处理这导致的警告，这是比较好的第一步。一般来说，不要期望老的代码鞥能够立马能够得到兼容。比如，在 Facebook，我们一般会计划在最近的代码库中使用并发模式，在近期的未来中，保持老的代码库依旧使用同步模式。

##### React16.x（到 2019 年中）：数据获取的 Suspense

上面提到过，*Suspense*指的是当组件在等待某些内容是，React 暂停渲染，并展示一个加载指示器的能力。在已经发布的 React16.6 中，Suspense 唯一支持的用户场景是在代码拆分中。在未来的某个小版本中，我们也会提供官方支持，来通过它进行数据获取。我们会提供一个与 Suspense 兼容的、基础“React 缓存”的指导实现，但是你也可以自行撰写。数据获取的库，比如 Apollo 和 Relay 将来可以与 Suspense 进行集成，我们会发布一个简单的集成指引。

```jsx
// React Cache for simple data fetching (not final API)
import { unstable_createResource } from "react-cache";

// Tell React Cache how to fetch your data
const TodoResource = unstable_createResource(fetchTodo);

function Todo(props) {
  // Suspends until the data is in the cache
  const todo = TodoResource.read(props.id);
  return <li>{todo.title}</li>;
}

function App() {
  return (
    // Same Suspense component you already use for code splitting
    // would be able to handle data fetching too.
    <React.Suspense fallback={<Spinner />}>
      <ul>
        {/* Siblings fetch in parallel */}
        <Todo id="1" />
        <Todo id="2" />
      </ul>
    </React.Suspense>
  );
}

// Other libraries like Apollo and Relay can also
// provide Suspense integrations with similar APIs.
```

针对如何使用 Suspense 获取数据，暂时没有官方文档，但是你能够在[这个 talk](https://youtu.be/ByBPyMBTzM0?t=1312)和[这个小 demo](https://github.com/facebook/react/tree/master/fixtures/unstable-async/suspense)。我们会在接近这次发布的时候写文档，阐述 React Cache 和如何使用你自己写的 Suspense 兼容库。如果你比较好奇，可以在[这里](https://github.com/facebook/react/blob/master/packages/react-cache/src/ReactCache.js)看早先的源码。

低阶 Suspense 机制（暂停渲染和这暂时反馈）预计在 React16.6 版本中稳定。我们已经把他们用在代码拆分中用了几个月。然而，数据获取的高阶 API 还不稳定。React Cache 还在快速变化中，并且还会变动很多次。也有一些低阶 API，他们缺少一些比较好的高阶 API，这使得它们无法被实现。我们不推荐在任何地方使用 React Cache，除了一些非常早起的实验中。注意，React Cache 自身并没有与 React 发布强绑定，但是现有的 alpha 版本缺少基础功能，比如缓存验证，你会遇到一些麻烦。我们计划在这个 React 版本中，达到一些可使用的点。

在最终，我们希望所有的数据获取都通过 Suspense 来实现，但这个还需要很长时间，直到所有的集成项都完成。在实践中，我们期望它能够被增量式采用，通过类似于 Apollo 或者 Relay 这类中间层来实现，而不是直接使用。缺少高阶 API 并不是我们遇到的唯一麻烦——这也有些重要的 UI 模式暂时也不支持，比如在加载视图层级外展示进度展示器。跟之前一样，我们也会在这篇博客中交流我们的进度。

**在 React DOM 中的状态**：技术上说，一个兼容的缓存在 React16.6 中已经可以配合`<React.Suspense>`进行工作了。然而，知道这个小版本发布，我们预计都不会有一个好的缓存实现。如果你敢于冒险，你可以通过查看 React Cache alphas 版本来实现自己的缓存。然而，需要注意的是，在有正式文档前，模型有极大概率被误解。

**在 React DOM Server 中的状态**：Suspense 在服务端渲染中暂时不可用。就像之前提到的一样，我们已经开始研究一个新的异步服务端渲染，它会支持 Suspense，但是那是一个非常大的项目，会占用 2019 非常大块的时间来完成。

**建议**：到这个小版本发布再来使用 Suspense 进行数据获取。不用使用 16.6 中的 Suspense 功能来实现它，现在还不支持。然而，当数据获取的 Suspense 被官方支持后，你已存的用于代码拆分的`<Suspense>`组件还是能够展示加载状态的。

--- 

#### 其他项目

##### 现代化 React DOM

我们已经开始调查[简化和现代化](https://github.com/facebook/react/issues/13525)ReactDOM，目标是缩减包的大小并与浏览器行为靠齐。现在说哪些点能够做到达到目的还为时尚早，项目现在还处于探索阶段。我们会在上面的 issue 中交流进度。

##### 服务端渲染的 Suspense

我们已经开始设计一种支持 Suspense（包括等待服务端异步数据时无重复渲染）、支持渐进式加载、支持在 chunks 中 hydrante 页面内容的新的服务端渲染，以达到更好的用户体验。你能够在[这个 talk](https://www.youtube.com/watch?v=z-6JC0_cOns) 中看到早期原型。新的服务端渲染会成为我们 2019 年的主要关注点，但是现在说它的发布计划还为时尚早。它的开发，依然会在往常一样[在 GitHub 上进行](https://github.com/facebook/react/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+fizz)。

--- 

就是这些了。正如你看到的，这还有很多事情要做，但是我们期待在接下来的几个月中看到更多进步。

我们希望这篇博客能够让你了解我们正在做什么，你现在可以使用什么以及你能够期待未来能够使用什么。在社交媒体上有很多关于新功能的讨论，如果你读了这篇博客，那你就不会错过重要的点了。

我们期待收到反馈，期待在 [RFC 仓库](https://github.com/reactjs/rfcs)、[issue 跟踪](https://github.com/facebook/react/issues)或者 [Twitter](https://mobile.twitter.com/reactjs)上获得你的来信。