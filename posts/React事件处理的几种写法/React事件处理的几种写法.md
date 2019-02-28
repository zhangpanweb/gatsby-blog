---
title: "React事件处理的几种写法"
date: "2018-12-16"
description: "类组件和函数组件，对于事件绑定的处理方式稍有不同。本文主要介绍React类组件和函数组件中事件绑定的几种写法"
---

#### 需注意的点

- React 的事件采用的是驼峰式的写法，而不是统一小写
- 事件处理必须传递函数引用或函数字面量

```jsx
<button onClick={activateLasers}>
  Activate Lasers
</button>
```

- 不能通过返回 false 来阻止事件的默认行为，只能通过显性调用preventDefault进行

--- 

#### es6类组件中的事件绑定

##### 写法

- 第一种：使用 es6 class 语法时，如果将类的方法作为事件处理函数，则需要进行 this绑定。原因：在`onClick={this.handleClick}`中 this.handle 引用正确，于是会变成`onClick={function(){this.setState({ isRed: !this.state.isRed })}}`，所以会出现在这个方法中 this 为 undefined，于是报错。

```jsx
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isRed: true }

    //进行 this 绑定
    this.handleClick = this.handleClick.bind(this);
  }

  //ES6 的写法，在类中申明方法，它是一种简写形式：
  // handleClick: function(){}
  handleClick() {
    this.setState({ isRed: !this.state.isRed })
  }

  render() {
    return (
      <div className='welcome' style={{ background: this.state.isRed ? 'red' : 'green' }}>
        Welcome to this websit.
        <button onClick={this.handleClick}>change color</button>
      </div>
    )
  }
}
```

- 第二种

```jsx
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isRed: true }
  }

  //另一种写法，利用箭头函数，解决 this 绑定的问题，将上面的 this，直接绑定到调用 this.handleClick 的 this，即组件，从而解决了调用绑定的问题。
  handleClick = () => {
    this.setState({ isRed: !this.state.isRed })
  }

  render() {
    return (
      <div className='welcome' style={{ background: this.state.isRed ? 'red' : 'green' }}>
        Welcome to this websit.
        <button onClick={this.handleClick}>change color</button>
      </div>
    )
  }
}
```

- 第三种，在回调中利用箭头函数。注意，在这种写法中，如果回调是作为 props 传递进来的，组件可能会进行额外的渲染。所以比较推荐的是在构造函数中进行绑定或者利用👆的方法来写。

##### 传参

```jsx
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isRed: true }
  }

  handleClick() {
    this.setState({ isRed: !this.state.isRed })
  }

  render() {
    return (
      <div className='welcome' style={{ background: this.state.isRed ? 'red' : 'green' }}>
        Welcome to this websit.
        {/* 利用箭头函数解决绑定问题，注意这里 handleClick 后面要加括号。() => this.handleClick()是一整个函数字面量 *，使用这种写法有个缺点，就是如果这是一个要传递给子组件的属性，则在每次渲染时会重新生成一个函数，子组件会认为属性变更了，从而导致子组件重新渲染，所以这种方式不太推荐 */}
        <button onClick={() => this.handleClick()}>change color</button>
      </div>
    )
  }
}
```

- 第一种写法，通过this 绑定后传参

```jsx
class App extends Component {
  constructor(props) {
    super(props);
    this.id=1;
    this.state = { isRed: true };

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(id) {
    this.setState({ isRed: !this.state.isRed })
    console.log(id)
    alert(id)
  }

  render() {
    return (
      <div className='welcome' style={{ background: this.state.isRed ? 'red' : 'green' }}>
        Welcome to this websit.
        <button onClick={this.handleClick.bind(this,this.id)}>change color</button>
      </div>
    )
  }
}
```

- 第三种写法，箭头函数的传参

```jsx
class App extends Component {
  constructor(props) {
    super(props);
    this.id=1;
    this.state = { isRed: true };

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(id) {
    this.setState({ isRed: !this.state.isRed })
    console.log(id)
    alert(id)
  }

  render() {
    return (
      <div className='welcome' style={{ background: this.state.isRed ? 'red' : 'green' }}>
        Welcome to this websit.
        <button onClick={(e)=>this.handleClick(this.id,e)}>change color</button>
      </div>
    )
  }
}
```

- 第二种写法，特殊写法的传参

```jsx
class App extends Component {
  constructor(props) {
    super(props);
    this.id=1;
    this.state = { isRed: true };

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick = (id) => {
    this.setState({ isRed: !this.state.isRed })
    console.log(id)
    alert(id)
  }

  render() {
    return (
      <div className='welcome' style={{ background: this.state.isRed ? 'red' : 'green' }}>
        Welcome to this websit.
        <button onClick={this.handleClick.bind(this,this.id)}>change color</button>
      </div>
    )
  }
}
```

--- 

#### 函数组件中的事件绑定

- 基本写法。

```jsx
const Add = ({ add }) => {
  let input;

  const handeClick = (input) => {
    if (!input.value.trim()) {
      return;
    }
    add(input.value);
    input.value = '';
  }

  return <div className='add-container'>
    <input ref={node => input = node} />
    <button onClick={() => handeClick(input)}>Add</button>
  </div>
}
```

- 可以将 handleClick 进行改写，改为比较原始的函数申明写法，不过不推荐。

```jsx
const Add = ({ add }) => {
  let input;
  
  //改为函数声明的写法
  function handeClick(input){
    if (!input.value.trim()) {
      return;
    }
    add(input.value);
    input.value = '';
  }

	return <div className='add-container'>
    <input ref={node => input = node} />
    {/* 由于需要传递 input，无法直接写成 onClick={handeClick(input)} */}
    <button onClick={() => handeClick(input)}>Add</button>
  </div>
}
```

- 如上例子中，由于需要传递 input，所以无法直接写成传递字面量的形式，如果不需要传递，则可以直接写引用，如下。

```jsx
const App = () => {
  const handleClick = () => {
     alert(1);
   }
  return <div onClick={handleClick}>1111</div>
}
```

