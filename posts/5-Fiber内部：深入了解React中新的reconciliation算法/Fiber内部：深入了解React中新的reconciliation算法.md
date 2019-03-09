---
title: "Fiber内部：深入了解React中新的reconciliation算法"
date: "2019-01-06"
description: "此文为译文，原文见：https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e"

---

从 React 元素到 Fiber 节点的一切，如何以及为什么。

React 是一个建立用户界面的 JavaScript 库。其核心是，跟踪组件内状态变化及更新状态至屏幕的机制。在 React 中，我们知道这个过程是**reconciliation**。如果 state 或 props 变化了，UI 上需要重新渲染组件，则调用`setState`方法，进行框架检查。

React 文档提供了一个对这种机制的高层概览，包括：React 元素的角色、生命周期方法、`render`方法以及用于组件子元素的 diff 算法。从`render`方法返回的不可变的 React 元素树也就是为我们所知的“虚拟 DOM”。这个术语在之前有利于解释 React，但是它也造成了一定的迷惑，也没有继续在 React 文档中继续使用。在这篇文章中，我会依旧把它称作 React 元素树。

在 React 元素树中，框架始终保有一个内部实例（组件、DOM 节点等）的组成的树来维持 state。从 React16 版本开始，React 发布了对这种内部实例树的新实现和管理它的新算法——Fiber。想要了解 Fiber 架构带来的好处，可以参考 [如何以及为什么 React 在 Fiber 中使用 linked list](https://medium.com/dailyjs/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)。

这是这个系列的第一篇，这个系列的目标是让你认识 React 的内部架构。在这篇文章中，我会提供对重要概念和算法数据结构的深度概览。在你拥有这些背景知识之后，我们将去探索那些用于处理 fiber 树的算法和重要函数。这个系列的下一篇文章将会展示 React 如何利用算法来进行第一次渲染、处理状态以及更新属性。这这里开始，我们将进入一些调度细节、子 reconciliation 进程以及建立影响列表的机制。

在这里，我会给你一些相对高阶的知识。阅读它并理解 React 背后的内部运行魔法。如果你想要参与 React，这个系列的文章也会成为一个指引。我深信 reverse-engineering，所以在这里会有很多链接，链接到 React16.6.0 版本的资源。

肯定是有很多需要掌握的，如果你感觉没办法立马理解某些内容，也不要感到有压力。获得有价值的东西确实需要一些时间。注意，你不需要理解以下任何内容，如果你只是使用 React，这篇文章是有关 React 内部运作的文章。

--- 

#### 建立背景知识

这里有一些我会在这个系列里面使用的简单应用。我们有一个按钮，这个按钮很简单，它会增加渲染到屏幕上的一个数字。

![](./1.png)

```jsx
class ClickCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => {
      return { count: state.count + 1 };
    });
  }

  render() {
    return [
      <button key="1" onClick={this.handleClick}>
        Update counter
      </button>,
      <span key="2">{this.state.count}</span>
    ];
  }
}
```

你可以在[这里](https://stackblitz.com/edit/react-t4rdmh)看到它。正如你所看到，这是一个简单的组件，从 render 方法返回两个组件，一个 button 一个 span。一旦你点击按钮，组件的状态会在 handler 里面更新，这反过来会导致 span 中的文字更新。

在 reconciliation 期间，React 会执行各种活动。比如，在第一次渲染和状态更新之后，React 会执行以下一些高阶操作：

- 更新`ClickCount` `state`中的`count`属性
- 检索并比较`ClickCount`的子元素以及他们的属性
- 更新`span`元素的属性

在 reconciliation 期间，React 还会执行一些其他操作，比如调用生命周期方法和更新 refs。所以这些活动都集中在 Fiber 架构中进行。活动的类型经常取决于 React 元素的类型。比如说，对于一个类组件，React 需要创建一个实例，而对函数组件则不需要做实例化。正如你所知道，React 中有很多类型的元素，比如，类和函数组件、host 组件（DOM 节点）、portals 等。React 元素的类型通过 createElement 的第一个参数来定义。createElement 函数常用在 render 方法中来创建一个元素。

在我们开始对这些活动以及主要的 fiber 算法之前，让我们先了解一下 React 内部使用的数据结构。

--- 

#### 从 React 元素到 Fiber 节点

React 的每个组件都有一个 UI 展示，我们称之为一个视图或者一个模板，它从 render 方法返回。`ClickCounter`组件的模板如下

```jsx
<button key="1" onClick={this.onClick}>Update counter</button>
<span key="2">{this.state.count}</span>
```

##### React 元素

一旦一个模板通过 JSX 编译器，你会得到一堆 React 元素。这些是真正从 React 组件 render 方法返回的内容，不是 HTML。如果你不使用 JSX，`ClickCounter`组件的 render 方法可以被改写成下面的样子：

```javascript
class ClickCounter {
    ...
    render() {
        return [
            React.createElement(
                'button',
                {
                    key: '1',
                    onClick: this.onClick
                },
                'Update counter'
            ),
            React.createElement(
                'span',
                {
                    key: '2'
                },
                this.state.count
            )
        ]
    }
}
```

在 render 方法中对`React.createElement`的调用会建立两个类似下面的数据结构：

```javascript
[
    {
        $$typeof: Symbol(react.element),
        type: 'button',
        key: "1",
        props: {
            children: 'Update counter',
            onClick: () => { ... }
        }
    },
    {
        $$typeof: Symbol(react.element),
        type: 'span',
        key: "2",
        props: {
            children: 0
        }
    }
]
```

你可以看到 React 增加了`$$typeof`属性来标识他们是 React 元素。现在，我们拥有了 type、key、props 属性来描述这个元素。这些值来自我们传入`React.createElement`的内容。注意 React 如何把文字内容作为 span 和 button 节点的 children 属性进行表示。并且点击处理器被作为了 button 属性的部分。这里还有一些其他 React 元素的属性，比如`ref`，它超出了这篇文章的讨论范围。

`ClickCounter`这个 React 元素没有 props 和 key：

```javascript
{
    $$typeof: Symbol(react.element),
    key: null,
    props: {},
    ref: null,
    type: ClickCounter
}
```

##### Fiber 节点

在 reconciliation 期间，每个 React 元素 render 方法返回的数据都会被 merge 到一颗 fiber 节点数上。每个 React 元素都会有一个对应的 fiber 节点。和 React 元素不同的是，fiber 并不会在每次渲染时重新创建。这里有可变的数据结构来承载组建的 state 和 DOM。

我们之前讨论过，React 元素的类型会决定框架进行的不同活动。在我们的简单应用中，对类组件`ClickCounter`，它调用了生命周期方法和 render 方法，对 span host 组件（DOM 节点），它进行了 DOM 转化。每个 React 元素都转化为对应类型的 Fiber 节点，这些类型描述了需要进行的活动。

你可以把一个 fiber 想象成一个数据结构，它代表了需要做的工作，或者换句话说，一个活动的单元。Fiber 架构提供了便捷的方法来跟踪、调度、暂停或停止这些活动。

当一个 React 元素第一次被转化为一个 fiber 节点时，React 会使用来自这个元素的数据来创建一个 fiber，这个动作在 createFiberFromTypeAndProps 函数中。在后续的更新中，React 会复用这个 fiber 节点，利用来自对应 React 元素的数据来更新必须的属性。React 也需要基于 key 属性在层级关系中移动节点，或者当对应 React 元素不再从 render 方法返回时删除它。

> 可以参考 ChildReconciler 方法，查看所有活动的列表以及 React 对已存 fiber 节点执行的对应方法。

因为 React 为每个 React 元素创建了一个 fiber，所以我们有了这些元素组成的树。在我们的简单应用中，它看起来是这样的：

![](./2.png)

所有的 fiber 节点通过一个链接列表互相连接，这个链接列表会使用到 fiber 节点上的以下属性：`child`、`sibling`和`return`。为了了解更多为何采取这种方式的细节，可以参考我的文章，[如何以及为什么 React 在 Fiber 中使用链接列表](https://medium.com/dailyjs/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)。

##### 进度树中的 current 和 work

在第一次渲染之后，React 会拥有一个 fiber 树，这个 fiber 树反映了用于渲染 UI 的应用状态。这棵树经常被称作 current。当 React 开始更新时，React 内部会进阿里一个所谓的 workInProgress 树，这棵树反映的是未来即将被更新到屏幕上的状态。

所有对 fiber 的操作都来自于 workInProgress 树。当 React 遍历 current 树时，对于每个已有 fiber 节点，都会创建一个可选的节点来构成 workInProgress 树。这个节点来自 React 元素的 render 方法返回的数据。一旦更新被处理，素有相关工作都完成了，React 会有一个可选的待渲染的树。一旦这颗 workInProgress 树被渲染到屏幕上，他就成了 current 树。

React 的核心原则之一就是一致性。React 总是一次性更新 DOM，它不会只展示部分结果。workInProgress 树所起的作用，是一个“草稿”，它对用户是不可见的，所以 React 可以先处理所有组件，然后把他们的变更渲染到屏幕上。

在源代码中，你会看到很多方法，他们会从 current 和 workInProgress 树上面获得 fiber 节点。这些方法，其中之一的签名如下：

```javascript
function updateHostComponent(current, workInProgress, renderExpirationTime) {...}
```

每个 fiber 节点都会存一个引用，指向其他树中对应可能存在的这个节点。在 current 树中的一个节点指向 workInProgress 树的节点，反之亦然。

##### 副作用

我们把 React 中的每个组件都看作一个函数，它使用 state 和 props 来计算需要展示的 UI。每个类似于更改 DOM 或者调用生命周期方法的活动，都应该被看做是一个副作用，或者，简单地说，是一个影响。影响在[文档](https://reactjs.org/docs/hooks-overview.html#%EF%B8%8F-effect-hook)中也有提及：

> 你之前可能已经在 React 组件中执行过数据获取、订阅或手动更改 DOM 等活动。我们把这些操作称之为“副作用”（或者简称为“影响”），因为他们能够影响其他组件，而且不能在渲染期间执行。

如你所见，state 和 props 更新会导致副作用。执行影响是一种操作，fiber 节点是一种非常方便的机制去跟踪除了更新之外的影响。每个 fiber 节点都有与之相关的影响，我们把他们写在`effectTag`属性中。

所以，在 Fiber 中，影响定义了对于每个实例来说，在更新被处理之后需要执行的工作。对于宿主组件来说（DOM 元素），这些工作包括增加、更新和移除元素。对于类组件来说，React 需要去更新 refs、调用`componentDidMount`和`componentDidUpdate`生命周期方法。这里也有一些其他影响，与 fiber 的其他类型相对应。

##### 影响列表

React 处理更新非常快，为了达到一定成都的效率，它采用了一些非常有趣的机制。其中之一就是，为了快速遍历，它建立了一个包含影响在其中的 fiber 列表。遍历线性列表比遍历树要快很多。这里没有必要在没有副作用的节点上浪费时间。

这个列表的目标是，把有 DOM 更新和其他影响的节点与这些影响关联起来。这个列表是 finishedWork 树的一个子集，而且使用 nextEffect 属性来做连接，而不是在 current 和 workInProgress 树中使用的 child 属性。

[Dan Abramov](https://medium.com/@dan_abramov) 提供了一个给影响列表的类比。他喜欢把它比做成一个圣诞树，在这个树上，使用圣诞灯把所有有影响的节点绑在一起。为了把这些可视化，我们可以想象一个拥有以下 fiber 节点的树，在树上，高亮的节点有一些操作需要被执行。比如说，我们的更新导致 c2 被插入到 DOM 总， d2 和 c1 更新属性，b2 出发了生命周期方法。影响列表会把他们连在一起，这样 React 就能够跳过其他节点。

你可以看到，有影响的节点如何被连接在一起。当遍历节点时，React 使用 firstEffect 节点来指向列表的开头。所以上面的图能够被表示成一个线性的列表，如下所示：

正如你所看到的，React 会以从孩子到父母的顺序来执行这些影响。

##### fiber 节点的根

每个 React 应用都有一个或多个 DOM 节点作为容器。在沃恩的例子中，是一个有 id 属性的 div 元素。React 给这些每个容器创建一个[fiber 根](https://github.com/facebook/react/blob/0dc0ddc1ef5f90fe48b58f1a1ba753757961fc74/packages/react-reconciler/src/ReactFiberRoot.js#L31)对象。你能够通过使用对这些 DOM 元素的引用来访问到它。

```javascript
const fiberRoot = query("#container")._reactRootContainer._internalRoot;
```

fiber 根是 React 存放 fiber 树引用的地方。fiber 树被存放在 fiber 根的 current 属性上。

```javascript
const hostRootFiberNode = fiberRoot.current;
```

fiber 树以一个特殊类型的 fiber 节点开始，它就是 HostRoot。它在内部创建，作为你最上层组件的父亲。在 HostRoot fiber 节点和 FiberRoot 可以通过 stateNode 属性相联系：

```javascript
fiberRoot.current.stateNode === fiberRoot; // true
```

你可以经由 fiber 根访问最上层的 HostRoot fiber 节点，从而进入 fiber 树。或者你也可以通过组件实例直接获得单个 fiber 节点：

```javascript
compInstance._reactInternalFiber;
```

##### fiber 节点结构

现在让我们来看看由`ClickCounter`组件创建起来的 fibeer 节点的结构，如下

```javascript
{
    stateNode: new ClickCounter,
    type: ClickCounter,
    alternate: null,
    key: null,
    updateQueue: null,
    memoizedState: {count: 0},
    pendingProps: {},
    memoizedProps: {},
    tag: 1,
    effectTag: 0,
    nextEffect: null
}
```

以及 span DOM 元素的 fiber 节点：

```javascript
{
    stateNode: new HTMLSpanElement,
    type: "span",
    alternate: null,
    key: "2",
    updateQueue: null,
    memoizedState: null,
    pendingProps: {children: 0},
    memoizedProps: {children: 0},
    tag: 5,
    effectTag: 0,
    nextEffect: null
}
```

在 fiber 节点上有很多属性。在之前有谈到过`alternate`、`affectTag`和`nextEffect`的作用。现在让我们来看看我们为什么需要其他属性。

###### stateNode

容纳指向与此 fiber 节点像关联的组件、DOM 节点或者其他 React 元素类型实例的引用。一般来说，我们说，这个属性被用来存放 fiber 节点的本地状态。

###### type

定义与这个 fiber 相关的组件或者类。对于类组件，它指向构造器方法，对于 DOM 元素来说，它指向 HTML 标签。我经常使用这个属性，来弄清一个 fiber 节点与什么元素相关联。

###### tag

定义 fiber 的[类型](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/shared/ReactWorkTags.js)。它被用在 reconciliation 算法中，用于决定需要做什么工作。正如之前提到的，根据 React 元素的类型，需要做的工作内容是不同的。函数[createFiberFromTypeAndProps](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L414)会把一个 React 元素映射为与对应类型的 fiber 节点。在我们的应用中，`ClickCounter`组件的 tag 属性是 1，代表它是一个类组件，对于 span 元素，tag 属性是 5，代表它是一个宿主组件（HostComponent）。

###### updateQueue

一个状态更新、回调和 DOM 更新的队列。

###### memoizedState

用于创建输出的 fiber 状态。在处理更新时，它反映现在被渲染在屏幕上的状态。

###### pendingProps

React 元素中，来自新数据的已经被更新的属性，它之后会被用于子组件或 DOM 元素。

###### key

一组子元素中，用于标识哪项已经被更新了、已经被加入或这已经被移除列表的唯一标识符。它和 React 在[这里](https://reactjs.org/docs/lists-and-keys.html#keys)描述的“列表和 key 值”功能相关。

你可以在[这里](https://github.com/facebook/react/blob/6e4f7c788603dac7fccd227a4852c110b072fe16/packages/react-reconciler/src/ReactFiber.js#L78)找到 fiber 节点的完整结构，在上面的描述中我忽略了一堆属性。特别的，我跳过了构成树形数据结构的 child、sibling 和 return，我在之前的文章中有提到过他们。还有一类属性，比如 expirationTime、childExpirationTime 和 mode，他们对调度（Scheduler）很重要。

--- 

#### 通用算法

React 主要在两个阶段执行操作：渲染（render）和提交（commit）。

在第一次渲染阶段，React 把通过`setState`和`React.render`把更新推给组件调度，指出在 UI 中需要更新的内容。如果时初次渲染，React 为每个从 render 方法返回的元素创建一个新的 fiber 节点。在之后的更新中，已存 React 元素的 fiber 可以重复使用并更新。这个阶段的结果，是一颗 fiber 节点组成的树，并且节点都被标记上了对应应该执行的副作用。副作用描述了在下面 commit 阶段应该做的事情。在 commit 阶段，React 会拿到标记了副作用的 fiber 树并把他们应用到实例上。它会遍历副作用树，执行 DOM 更新和其他对用户可见的变化。

有一点你需要知道的是，第一次 render 阶段的工作可以被异步执行。React 可以根据可用时间来处理一个或多个 fiber 节点，然后它会保存已完成的工作，转向其他内容。之后它会从它停下的位置继续开始。然而，有时候也会丢弃易完成的工作从头开始。这种暂停可以被实现，是基于一个事实，这个事实是，在 render 阶段所作的工作不会产生任何用户可见的变化（比如 DOM 更新）。相反，之后的 commit 阶段则总是同步的。这是因为在这个极端执行的工作会产生用户可见的变化（比如 DOM 更新）。这也是为什么需要一次性执行他们。

调用生命周期方法是 React 执行一类工作。有些方法在 render 阶段被调用，有些则在 commit 阶段。下面是第一次 render 阶段执行的生命周期列表：

- [UNSAFE_]componentWillMount (deprecated)
- [UNSAFE_]componentWillReceiveProps (deprecated)
- getDerivedStateFromProps
- shouldComponentUpdate
- [UNSAFE_]componentWillUpdate (deprecated)
- render

正如你所看到的，从 16.3 版本开始，一些老的不建议使用的生命周期方法都被标记上了`UNSAFE`。在文档中，他们被称作遗留生命周期。在未来的 16.x 版本中，他们会被 deprecated。他们对应`UNSAFE`后面的方法，会在 17 版本中被移除。你能够在[这里](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html)了解到更多相关变化以及建议的迁移方式。

你想知道原因吗？

我们刚才已经知道了，在 render 阶段不产生类似于 DOM 更新的副作用，React 会异步处理更新，异步应用给组件（他们甚至会在多个线程中进行）。然而，被标记了 UNSAFE 的生命周期方法经常会被错误理解，从而被误用。开发者会把一些有副作用的代码放在这些方法里面，这回给新的一步渲染方式造成麻烦。虽然只是 UNSAFE 后面部分的方法被移除，在未来的并发模式中，他们依然很可能会引发问题。

在 commit 阶段执行的生命周期方法列表如下：

- getSnapshotBeforeUpdate
- componentDidMount
- componentDidUpdate
- componentWillUnmount

因为这写方法在同步的 commit 阶段被执行，所以他们可能包含副作用，也可能会接触到 DOM。

现在，我们已经了解到了遍历树和执行工作的通用算法，让我们继续深入一点吧。

--- 

#### render 阶段

reconciliation 算法使用 [renderRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L1132)方法，从最顶端的 `HostRoot`节点开始。React 会跳过已经被处理过的 fiber 节点，直到它找到有未完成工作的节点。比如说，如果你在组件树比较深的层级中调用`setState`方法，React 会从顶端开始，快速跳过其祖先，知道达到调用 setState 的节点。

##### 工作循环中的主要步骤

所有的节点都会在[工作循环](https://github.com/facebook/react/blob/f765f022534958bcf49120bf23bc1aa665e8f651/packages/react-reconciler/src/ReactFiberScheduler.js#L1136)中被处理。下面是循环同步部分的实现：

```javascript
function workLoop(isYieldy) {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {...}
}
```

在上面的代码中，nextUnitOfWork 是一个引用，指向 workInProgress 树上有待执行工作的 fiber 节点。React 会遍历 Fiber 树，它会使用这个变量来知道这里是否还有用待完成工作的 fiber 节点。在 current fiber 被处理完之后，这个遍历会包含一个指向书中下一个 fiber 节点的引用，或者是 null。在这种情况下，React 就会退出工作循环，准备提交这些变化。

在遍历树、初始化和完成工作时，有四个主要的函数：

- performUnitOfWork
- beginWork
- completeUnitOfWork
- completeWork

为了演示他们时怎么被使用的，你可以看看这个[视频](https://vimeo.com/302222454)。在 demo 中我使用了这些方法的简化实现。每个函数会接受一个待处理的 fiber 节点，在 React 顺着树从上往下的过程中，你可以看到被激活的 fiber 节点在不断变化。你也可以看到算法如何从一个分支切换到另外一个分支。他会先完成子节点的工作然后移动到父节点。

> 注意，垂直而下的代表的时兄弟，弯曲而下代表的时父子。比如 b1 没有子节点，b2 有一个子节点 c1

在这个[视频](https://vimeo.com/302222454)中，你可以暂停播放，仔细看到每个现在处理的节点以及函数的状态。从概念上来说，你可以把“开始”看作成“进入”一个组件，把“完成”看作”走出“这个组件。你也可以在这个[示例实现](https://stackblitz.com/edit/js-ntqfil?file=index.js)中进行探索。

让我们以开始的两个方法`performUnitOfWork`和`beginWork`开始：

```javascript
function performUnitOfWork(workInProgress) {
  let next = beginWork(workInProgress);
  if (next === null) {
    next = completeUnitOfWork(workInProgress);
  }
  return next;
}

function beginWork(workInProgress) {
  console.log("work performed for " + workInProgress.name);
  return workInProgress.child;
}
```

`performUnitOfWork`接受一个`workInProgress`树上的 fiber 节点，以调用`beginWork`方法开始。它是一个 fiber 所需进行所有活动的开端。为了演示的目的，我们简单地把 logfiber 的名字代表需要完成的工作。`beginWork`方法总是返回一个指针，指向循环中下一个待处理的子节点，或者是 null。

如果这里有下一个子节点，则子节点会被复制给`workLoop`方法中的`nextUnitOfWork`这个变量。相反，如果它没有子节点，则 React 知道，它已经到达了分支的最末端，所以它能够结束现在进行的这个节点了。一旦一个节点被完成，它需要转向其兄弟，或者在其兄弟也完成后转向其父母。这些都是在`completeUnitOfWork`方法中进行的：

```javascript
function completeUnitOfWork(workInProgress) {
  while (true) {
    let returnFiber = workInProgress.return;
    let siblingFiber = workInProgress.sibling;

    nextUnitOfWork = completeWork(workInProgress);

    if (siblingFiber !== null) {
      // If there is a sibling, return it
      // to perform work for this sibling
      return siblingFiber;
    } else if (returnFiber !== null) {
      // If there's no more work in this returnFiber,
      // continue the loop to complete the parent.
      workInProgress = returnFiber;
      continue;
    } else {
      // We've reached the root.
      return null;
    }
  }
}

function completeWork(workInProgress) {
  console.log("work completed for " + workInProgress.name);
  return null;
}
```

你可以看到，这个方法的概要，就是个大的 while 循环。React 会在一个`workInProgress`节点没有子节点时进入到这个方法中。在完成现有 fiber 的工作后，它会检查，是否存在节点的兄弟，如果找到，React 会退出这个方法，返回一个指向这个兄弟的指针。这个指针会被复制给`nextUnitOfWork`变量，React 会开始指向以这个兄弟节点为开始的分支的工作。需要注意的是，在这个时候，React 只是完成了先前那个节点的工作，它并没有完成其父节点的工作。当且仅当所有以其子节点开始的分支都被完成了，才会完成父节点，并进行转向。

正如你所看到的，在`performUnitOfWork`和`completeUnitOfWork`是用来做遍历的，二主要的活动那个则发现在`beginWork`和`completeWork`中。在这个系列的下面的文章中，我们会学习，对于`clikcCounter`组件和`span`节点，进入`beginWork`和`completeWork`发生了什么。

--- 

#### commit 阶段

这个阶段以[completeRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L2306)函数开始。这里是 React 更新 DOM 和调用更新前、更新后生命周期方法的地方。

当 React 进入到这个阶段时，它会有两棵树以及一个影响列表。第一颗树代表的时渲染在屏幕上的现有状态。另外还有以可替换树，它时在 render 阶段构建起来的。在源码中，它被称为`finishedWorkd`或`workInProgress`，它代表这需要被反映在屏幕上的状态。这课替换树和 current 树类似，也是通过 child 和 sibling 指针连接起来的。

继续，这里有一个影响列表——它时 finishedWork 树的子集，之间通过 `nextEffect`指针相连接。记住，影响列表是 render 阶段的结果。render 阶段的意义就在于决定哪个节点应该被插入、被更新、被删除，哪个组件需要有生命周期方法被调用。这些都是影响列表告诉我们的。它也是一系列需要在 commit 阶段被遍历的节点。

> 为了 debug 的目的，current 树可以通过 fiber 根的 `current`属性访问到。finishedWork 树可以通过 current 树中`HostFiber`节点的`alternate`属性访问到。

在 commit 阶段被调用的主要方法是`commitRoot`。大致上说，它做了以下工作：

- 在标记了`Snapshot`影响的节点上调用`getSnapshotBeforeUpdate`生命周期方法
- 在标记了`Deletion`影响的节点上调用`componentWillUnmount`生命周期方法
- 执行所有的 DOM 插入、更新和删除
- 把 finishedWork 树置为 current 树
- 在标记了`Placement`影响的节点上调用`componentDidMount`生命周期方法
- 在标记了`Update`影响的节点上调用`componentDidUpdate`生命周期方法

在调用变更前方法`getSnapshotBeforeUpdate`之后，React 会在一棵树中提交所有的副作用。这会在两部进行。第一步是执行所有的 DOM（host）插入、更新、删除和 ref 卸载。React 会把 finishedWork 树赋值给`FiberRoot`，使得 finishedWork 树成为 current 树。这会在 commit 阶段第一步完成之后执行，所以在 componentWillUnmount 期间，之前的那棵树还是 current 树。但是在它的执行是在第二步之前，所以在执行 componentDidMount/Update 时，finishedWork 已经时 current 树了。在第二步中，React 会调用所有的其他生命周期方法和 ref 回调。这些方法是在一个单独的步骤中进行的，此时整棵树中所有的替换、更新和删除已经被调用了。

这里有一个执行上述步骤的函数梗概：

```javascript
function commitRoot(root, finishedWork) {
  commitBeforeMutationLifecycles();
  commitAllHostEffects();
  root.current = finishedWork;
  commitAllLifeCycles();
}
```

每个子方法会实现一个循环，这个循环会遍历影响列表并检查影响类型。当它发现子方法需要被用于的影响时，则会在这个影响上调用这个子函数。

##### 变更前生命周期方法

举例来说，下面的代码展示了一个例子，它会遍历影响树，检查节点是否有`Snapshot`影响：

```javascript
function commitBeforeMutationLifecycles() {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    if (effectTag & Snapshot) {
      const current = nextEffect.alternate;
      commitBeforeMutationLifeCycles(current, nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}

```

对一个类方法来说，这个影响意味着调用`getSnapshotBeforeUpdate`生命周期方法。

##### DOM 更新

[commitAllHostEffects](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L376)是 React 执行所有 DOM 更新的函数。这个函数定义了对一个节点来说需要进行的操作的类型并执行它：

```javascript
function commitAllHostEffects() {
    switch (primaryEffectTag) {
        case Placement: {
            commitPlacement(nextEffect);
            ...
        }
        case PlacementAndUpdate: {
            commitPlacement(nextEffect);
            commitWork(current, nextEffect);
            ...
        }
        case Update: {
            commitWork(current, nextEffect);
            ...
        }
        case Deletion: {
            commitDeletion(nextEffect);
            ...
        }
    }
}

```

有趣的是，React 把 componentWillMount 生命周期方法作为删除过程的一部分在`commitDeletion`函数中进行。

##### 变更后生命周期方法

[commitAllLifecycles](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L465)是 React 调用剩余生命周期方法`componentDidUpdate`和`componentDidMount`的地方。

--- 

We're finally done！