---
title: "JSX、元素和组件"
date: "2018-12-02"
description: 总结自React 官方文档：https://reactjs.org/docs。摘录部分有关 JSX、元素和组件容易会被忽略的点
---

#### 有关 JSX

##### JSX用作表达式

- jsx 是JavaScript 表达式，所以它可以被用在 JavaScript 语句中，被赋值、接受参数传值以及作为函数返回值

```javascript
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```

##### 给 jsx 属性赋值

- 使用双引号给属性赋予常数值

```javascript
const element = <div tabIndex="0"></div>;
```

- 使用大括号给属性赋予JavaScript 表达式值

```javascript
const element = <img src={user.avatarUrl}></img>;
```

- jsx中的属性采用驼峰式的写法，如 className、tabIndex

##### jsx 防止注入攻击

```javascript
const title = response.potentiallyMaliciousInput;
// This is safe:
const element = <h1>{title}</h1>;
```

- 使用大括号时，React 会把所有插入的值都转为字符串后再进行渲染，从而避免XSS攻击

##### jsx 的编译

- Babel 会调用 React.createElement 方法来编译 JSX

```javascript
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);

//相当于
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);

//最终会被编译为类似于以下形式：
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```
---

#### 渲染元素

- React 组件由 React 元素构成，React 元素都是类似如下的对象。React DOM 会负责将这些对象渲染为实际的 DOM 元素

```jsx
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```

- 调用 `ReactDOM.render`进行渲染

```jsx
const element = <h1>Hello, world</h1>;
ReactDOM.render(element, document.getElementById('root'));
```

- React 元素都是不可变的。一个元素一旦创建，则其子元素及属性都不可变更。变动 UI 的方式之一就是新创建一个元素并将它渲染至页面中。

```jsx
function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  );
  ReactDOM.render(element, document.getElementById('root'));
}

setInterval(tick, 1000);
```

- 在元素变更后的重新渲染时，React 只会渲染变更后的内容，未变更的内容不会重复渲染。如上面例子中，虽然每秒钟都会创建一个新元素，但是 ReactDOM 在更新时只会渲染h2中变更过的内容。

---

#### 组件

##### 函数组件和类组件

- 函数组件接受唯一一个对象参数（props 对象），返回一个 React 元素

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

- 类组件

```javascript
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

##### 组件大写

- React 会把小写字母开头的元素当做DOM标签，把大写字母开头的才作为组件

##### props 是只读的

- 所有的 react 组件都必须表现得像纯函数。

