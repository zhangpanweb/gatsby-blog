---
title: "Hooks与定时器"
date: "2019-02-24"
description: "React Hooks用于定时器时引发的问题及解决方式"
---

简单的示例：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  setInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <h1>{count}</h1>;
}

export default Counter;
```

问题：允许后会出现跳字符的问题。

原因：随着 Counter 的渲染，设置了多个定时器，多个定时器导致count 被设置为不同的值，页面不停被渲染。

--- 

#### 1. 多个定时器的问题

##### 1.1 利用 useRef 取消多个定时器

利用 useRef 设置一个引用，判断之前是否有设置定时器，如果有则不再设置，代码：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const interval = useRef();

  if (!interval.current) {
    interval.current = setInterval(() => {
      console.log('count:', count);
      setCount(count + 1);
    }, 1000);
  }

  return <h1>{count}</h1>;
}

export default Counter;
```

问题：会发现，页面上的数字变为1后，不会再更新。但是在控制台，一直在输出`count: 0`

原因：在 setInterval 中获得的 count 参数的值一直是0，随着页面的渲染，每次传入定时器函数中的值都是初始值。



##### 1.2 利用 useEffect 取消之前的定时器

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log('count:', count);
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  });

  return <h1>{count}</h1>;
}
```

在 useEffect 中返回`() => clearInterval(id);`，则每次渲染，都会利用这个函数来取消之前的定时器，然后设置新的定时器。所以去除了设置多个定时器的问题。

需要注意的点：在上面的例子中，`useEffect`没有传入第二个参数，此时例子能够按照预期工作。但是如果给第二个参数传入`[]`，会发现它加到1后不会往上加了，但是控制台还在不断输出`count：0`。原因：当不传第二个参数时，每次都会取消上一个定时器然后添加新的定时器，然后新添加的定时器会引用最新的 count 值，所以能够正确工作。但是增加`[]`后，表示定时器只会在挂载时添加，在组件卸载时删除，但是在组件更新时定时器不会变化，此时定时器中的执行函数每次获取的都是最初值0。

--- 

#### 2 解决值不更新的问题

##### 2.1 利用 useRef 获取最新值

可以利用 useRef 来设置一个引用，保持最新值的引用，如下：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const currentCount = useRef();
  currentCount.current = count;
  const interval = useRef();

  if (!interval.current) {
    interval.current = setInterval(() => {
      console.log('currentCount', currentCount.current);
      setCount(currentCount.current + 1);
    }, 1000);
  }

  return <h1>{count}</h1>;
}
```

页面按照预期每秒钟变动一次。正如Dan Abramov 在[这个 twitter][https://twitter.com/dan_abramov/status/1098027329836797952)]中解释的:

> How do you opt into class-like behavior? With a thing similar to “this”. A ref.
> const something = useRef()
> In classes, it’s `this.something`. With Hooks, it’s `something.current`. But in both cases it’s a way to “break out” of captured values and get the latest one.

一个 ref 会表现的像类组件中的`this.something`一样，它总是会获取最新的值。



##### 2.2 利用 useRef 创造新函数

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const interval = useRef();
  const savedCallback = useRef();

  const callback = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    savedCallback.current = callback;
  });

  if (!interval.current) {
    interval.current = setInterval(() => {
      savedCallback.current();
    }, 1000);
  }

  return <h1>{count}</h1>;
}
```

使用`useRef`生成一个每次渲染都不变的`savedCallback`，每次渲染都会生成新的`callback`函数，此函数中 count 会引用最新的值，`useEffect`每次渲染都更新`savedCall.current`中存储callback，更新为最新的 callback，然后声明 tick 函数，将每次的调用都指向这个最新的`savedCall.current`。这样，每次就都能够获得最新的 count 值并进行更新。

需要注意的一点：

```javascript
interval.current = setInterval(() => {
    savedCallback.current();
}, 1000);
```

不能直接写成`setInterval(savedcallback.current,1000)`，原因：useEffect 中的内容会在组件挂载后执行，而 setInterval 则在组件 render 时，造成的结果就是 setInterval 时 savedCall.current的值是 undefined。这就导致 count 的值根本不会进行更新。

相同的道理，如下面代码：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const savedCallback = useRef();

  const callback = () => {
    console.log('count:', count);
    setCount(count + 1);
  };

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const id = setInterval(savedCallback.current, 1000);
    return () => clearInterval(id);
  }, []);


  return <h1>{count}</h1>;
}
```

此代码只会更新一次，但是会每秒打印一个`count: 0`。因为执行 setInterval 时，savedCall.current，其值是`()=>{setCount(count+1)}`，它是一个具体函数，而不在是一个引用，所以此定时器在设定时，引用的是第一次渲染是的 callback，后续每秒执行的也是这个第一次渲染的 callback，继而callback 中每次获得的 count 值都是0。



##### 2.3 给 setCount传入一个 updater

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const interval = useRef();

  if (!interval.current) {
    interval.current = setInterval(() => {
      setCount(prevCount => prevCount + 1);
    }, 1000);
  }

  return <h1>{count}</h1>;
}

export default Counter;
```

在`prevCount=>prevCount+1`中`prevCount`会引用最新的值，此时给它+1则没问题。页面会按照预期每秒加1。



##### 2.4 使用useReducer

```jsx
function Counter() {
  const [count, dispatch] = useReducer((state, action) => {
    if (action === 'inc') {
      return state + 1;
    }
  }, 0);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch('inc');
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}

export default Counter;

// 参考Dan Abramov 的博客：https://overreacted.io/making-setinterval-declarative-with-react-hooks/
```

