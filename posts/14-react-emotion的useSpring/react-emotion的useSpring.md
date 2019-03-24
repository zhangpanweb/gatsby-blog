---
title: "react-emotion的useSpring"
date: "2019-03-24"
description: "react-emotion是一个React动画库，并且已经发布了Hook版本。本文主要介绍库中基础功能useSpring的用法。"
---

先解释一个非常简单的示例，然后由这个示例引申到`useSpring`的使用及配置。

```javascript
import React from 'react';
import { useSpring, animated } from 'react-spring';

const App = () => {
  const { number } = useSpring({ number: 0, from: { number: 1 } });
  return <animated.div>{number.interpolate(n => n.toFixed(2))}</animated.div>;
};

export default App;
```

如上面的代码，会看到的动画是，数字由1变为0，且变化过程中，数字一直保持2为小数。

useSpring配合`animated`使用，可以使元素从一个状态变为另外一个状态，如上面所示，初始状态 number为1，最终状态为number为0，元素进行了从初始状态到最终状态的变化，而这种变化是通过动画的形式展现的。

------

#### useSpring

##### 参数

`useSpring`是一个React Hook。它定义了，动画的初始状态、最终状态以及一些变化参数。先看基本的，`useSpring`若接受一个对象为参数（实例中就是以对象为参数），则这个对象可以包含以下属性：

- `from`，表示初始状态

- `to`，表示最终状态。需要注意的是，所有未在`react-spring`API 中指定的参数，都会被视为 `to`终止状态的数据。比如上面示例中`useSpring({ number: 0, from: { number: 1 } })`，number并不是API指定的配置参数，所以`number:0`是`to`的数据之一，也就是说，它等价于`useSpring({ to: { number: 0 }, from: { number: 1 } });`

- `delay`，动画等待时间，如设置为1000，则动画会在等待1s后才执行

- `immediate`，值为一个布尔值或者一个返回布尔值的函数，若布尔值为true或函数执行结果为true，则会从开始状态直接变为最终状态，而不执行动画

- `reverse`，对调动画的最终状态和初始状态，只有当设置了`reset`为true时才有意义

- `config`，动画配置。

  - 可配置项包括`duration`、`precision`、`easing`等参数。如上示例中，变为如下形式，则数字从1变为0会在3s钟内进行，动画会维持3s。全部可配置项可以参见[react-spring官网common-api的config](<https://www.react-spring.io/docs/hooks/api>)

  ```javascript
  const { number } = useSpring({ to: { number: 0 }, from: { number: 1 }, config: { duration: 3000 } });
  ```

  - react-spring中预设了一部分配置项。这些配置项包括`default`、`gentle`等，可以使用以下方式进行引用

  ```javascript
  import { ..., config } from 'react-spring'
  
  useSpring({ ..., config: config.default })
  useSpring({ ..., config: config.gentle })
  ```

- `onStart`，当动画开始时，执行这个函数

- `onFrame`，动画的每帧播放时调用，会传入此时的动画值，动画值见下面`useSpring`的返回值解释

##### 返回值

`useSpring`的返回值是一个对象，这个对象的属性，是`useSpring`参数中的状态值。对象中的各状态值会随着动画的进行而变化。最开始的时候，此状态值是初始状态值；动画开始后，状态值变为动画状态对应的值；最终在动画结束时，此状态值变为最终状态。

比如在上述示例中，采用了结构赋值，返回的实际值是一个 `{number:AnimatedValue}`，表示返回的是一个对象，这个对象有一个number属性，而number的值是一个对象，这个对象是`AnimatedValue`类型，它有一个`value`属性，其值为0。之后动画进行时，这个value值会随着动画状态变更，最终变为最终状态中的1

```javascript
  const { number } = useSpring({ number: 0, from: { number: 1 } });
```

##### 函数参数

```javascript
import React from 'react';
import { useSpring, animated } from 'react-spring';

const App = () => {
  const [{ number }, set, stop] = useSpring(() => ({ number: 1, from: { number: 0 } }));

  function handleClick () {
    if (number.value === 1) {
      set({ number: 0 });
    } else if (number.value === 0) {
      set({ number: 1 });
    }
  }

  return (
    <div>
      <animated.div>
        {number.interpolate(n => n.toFixed(2))}
      </animated.div>
      <button onClick={handleClick}>reverse</button>
    </div>
  );
};

export default App;
```

上面代码实现的效果是：页面加载后，数字0会使用动画变为1，此时点击reverse按钮，数字又会由1以动画形式变为0，再次点击reverse，则又会变为1。

如上面代码所示：

- `useSpring`可以接受一个函数作为参数，这个函数的的返回值是一个对象，此对象是上面已经讲述过的那个，可以有from、to等参数
- 当`useSpring`接受函数为参数时，它的返回值是一个数组，上面采用了解构赋值的方式，数组中包含三个值，第一个返回值和上面`useSpring`接受对象时的返回值相同，第二个返回值是一个set函数，第三个返回值是一个stop函数
- set函数，可以接受一个对象，它和React原生的`setState`很相似，可以将动画状态至为某个指定状态(这个指定状态就是调用set函数时的入参)，调用set函数后，react-spring会按照`useSpring`中指定的动画配置，将元素以动画的形式变为指定状态。
- stop函数可以使动画停止

------

#### interpolate

interpolate的作用是，设定动画的呈现：

- interpolate可以接受一个函数，这个函数的返回值，会被用作效果呈现，比如上面例子中，接受了一个函数`n=>n.toFixed(2)`，则，每个number值在呈现的时候，都只会取两位小数
- interpolate可以接受两个数组，此时第一个数组表示的是时间线，第二数组是对应的输出，比如 `number.interpolate([0,0.5,1],[0,1.9.2])`，它表示的是，动画执行时，0时刻，应该输出0；中间时刻点应该输出1.9；到最终动画中点，应该是2。此时第二个数组的输出，也就是对应时刻，动画应该在的状态。
- interpolate也可以接受一个对象，这个对象包括`range`、`output`、`extrapolate`等属性

interpolate也可以串联使用，比如

```javascript
number
	.interpolate([0, 0.5, 1], [2, 1.9, 0])
	.interpolate(n => n.toFixed(2))
```

此时由`.interpolate([0, 0.5, 1], [2, 1.9, 0])`输出的值会作为`.interpolate(n => n.toFixed(2))`的输入，经过取两位小数再进行输出。

------

#### 异步动画/动画链

##### 异步动画

useSpring的to属性可以接受一个异步函数作为参数，在此异步函数中可以执行异步动画，比如下面的例子中，会等到接口请求返回才执行动画，每次next的时候回next出一个动画状态，然后会执行动画，将元素状态置为这个状态

```javascript
import React from 'react';
import { useSpring, animated } from 'react-spring';
import fetch from 'cross-fetch';

const App = () => {
  const { number } = useSpring({
    to: async (next, cancel) => {
      const res = await fetch('https://www.reddit.com/r/reactjs.json');
      await next({ number: 1 });
      await next({ number: 0 });
    },
    from: { number: 0 }
  });
  return <animated.div>{number.interpolate(n => n.toFixed(2))}</animated.div>;
};

export default App;
```

##### 链式动画

to 可以被指定为状态组成的数组，此时会从左往右，执行动画依次进行状态变更。如下面，会先变为1，然后再变为2

```javascript
const App = () => {
  const { number } = useSpring({
    to: [{ number: 1 }, { number: 2 }],
    from: { number: 0 }
  });
  return <animated.div>{number.interpolate(n => n.toFixed(2))}</animated.div>;
};
```

